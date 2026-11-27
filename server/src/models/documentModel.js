const knex = require('../db/knex');
const AppError = require('../utils/AppError');

const z = (col, as) => knex.raw(`DATE_FORMAT(${col}, '%Y-%m-%dT%H:%i:%sZ') AS ${as}`);

const KIND_LABEL = {
  resume: 'Resume', cover_letter: 'Cover letter', portfolio: 'Portfolio',
  certificate: 'Certificate', other: 'Other',
};

const formatSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const toFile = (r) => ({
  id: String(r.id),
  name: r.name,
  label: r.label ?? '',
  type: r.type.replace(/_/g, '-'), // fills the Type input
  kind: KIND_LABEL[r.type] ?? 'Other',
  ext: r.name.split('.').pop().toUpperCase(),
  size: formatSize(r.sizeBytes),
  removed: Boolean(r.removed), // removed from the library, but still on a job
});

const FILE_COLS = [
  'doc.id', 'doc.original_name as name', 'doc.label', 'doc.type', 'doc.size_bytes as sizeBytes',
  knex.raw('doc.deleted_at IS NOT NULL AS removed'),
];

// { documents: linked to this job, library: the user's other files }
async function list(userId, jobId) {
  const [linked, library] = await Promise.all([
    knex('application_documents as ad')
      .join('documents as doc', 'doc.id', 'ad.document_id')
      .where({ 'ad.application_id': jobId, 'doc.user_id': userId })
      .select(...FILE_COLS, 'ad.doc_usage as usedAs', z('ad.attached_at', 'addedAt'))
      .orderBy([{ column: 'ad.attached_at', order: 'desc' }, { column: 'doc.id', order: 'desc' }]),
    knex('documents as doc')
      .where('doc.user_id', userId)
      .whereNull('doc.deleted_at')
      .whereNotIn('doc.id', knex('application_documents').where('application_id', jobId).select('document_id'))
      .select(...FILE_COLS)
      .orderBy([{ column: 'doc.created_at', order: 'desc' }, { column: 'doc.id', order: 'desc' }]),
  ]);

  // How many OTHER jobs use each file.
  const ids = [...linked, ...library].map((r) => r.id);
  const uses = ids.length
    ? await knex('application_documents')
        .whereIn('document_id', ids)
        .whereNot('application_id', jobId)
        .groupBy('document_id')
        .select('document_id as id')
        .count({ c: '*' })
    : [];
  const usedBy = new Map(uses.map((u) => [u.id, Number(u.c)]));

  const withUses = (r) => ({ ...toFile(r), usedBy: usedBy.get(r.id) ?? 0 });

  return {
    documents: linked.map((r) => ({ ...withUses(r), usedAs: r.usedAs.replace(/_/g, '-'), addedAt: r.addedAt })),
    library: library.map(withUses),
  };
}

// Archived and trashed jobs are read-only, so they are not "editable".
const editableJob = (db, userId, jobId) =>
  db('applications').where({ id: jobId, user_id: userId }).whereNull('deleted_at').whereNull('archived_at');

const isEditable = async (userId, jobId) => Boolean(await editableJob(knex, userId, jobId).first('id'));

const touch = (trx, jobId) => trx('applications').where('id', jobId).update({ last_activity_at: knex.fn.now() });

// Empties a sent slot held by another file, if the user confirmed it.
async function freeSlot(trx, jobId, documentId, usedAs, replace) {
  if (usedAs === 'attachment') return;
  const others = () =>
    trx('application_documents')
      .where({ application_id: jobId, doc_usage: usedAs })
      .whereNot('document_id', documentId);
  if (await others().first('document_id')) {
    if (!replace) throw AppError.conflict('slot_taken', 'That slot already has a file. Confirm the replacement.');
    await others().del();
  }
}

// Links a file to a job inside a transaction that already holds the job lock.
//   replaceFileId: the file being swapped out ("Change")
//   replace:       the user confirmed replacing a full sent slot
async function link(trx, jobId, documentId, { usedAs, replace, replaceFileId }) {
  if (await trx('application_documents').where({ application_id: jobId, document_id: documentId }).first('document_id')) {
    throw AppError.conflict('already_attached', 'That file is already on this job.');
  }

  if (replaceFileId) {
    const removed = await trx('application_documents')
      .where({ application_id: jobId, document_id: replaceFileId })
      .del();
    if (!removed) throw AppError.conflict('file_changed', 'The file you are changing is no longer on this job.');
  }

  await freeSlot(trx, jobId, documentId, usedAs, replace);
  await trx('application_documents').insert({ application_id: jobId, document_id: documentId, doc_usage: usedAs });
  await touch(trx, jobId);
}

// Runs work while holding a lock on the job. Returns false if the job can't be edited.
const withJobLock = (userId, jobId, work) =>
  knex.transaction(async (trx) => {
    if (!(await editableJob(trx, userId, jobId).forUpdate().first('id'))) return false;
    await work(trx);
    return true;
  });

// Saves the new file row and its link together: both or neither.
const createAndLink = (userId, jobId, file, options) =>
  withJobLock(userId, jobId, async (trx) => {
    const [documentId] = await trx('documents').insert({ user_id: userId, ...file });
    await link(trx, jobId, documentId, options);
  });

// Links a file from the library and saves its type and label. Returns "no_job", "no_file" or "ok".
async function attachExisting(userId, jobId, documentId, details, options) {
  let found = true;
  const editable = await withJobLock(userId, jobId, async (trx) => {
    // The user_id filter stops anyone linking another person's file.
    // The lock stops the file being deleted while it is being linked.
    // A file removed from the library can't be attached to more jobs.
    found = Boolean(
      await trx('documents').where({ id: documentId, user_id: userId }).whereNull('deleted_at').forUpdate().first('id'),
    );
    if (!found) return;
    await link(trx, jobId, documentId, options);
    await trx('documents').where({ id: documentId, user_id: userId }).update(details);
  });
  if (!editable) return 'no_job';
  return found ? 'ok' : 'no_file';
}

// Edits a file already on this job, without uploading it again.
// type and label belong to the file, so they change on every job that uses it.
// usedAs belongs to this job only. Returns "no_job", "no_file" or "ok".
async function updateLinked(userId, jobId, documentId, details, { usedAs, replace }) {
  let found = true;
  const editable = await withJobLock(userId, jobId, async (trx) => {
    const where = { application_id: jobId, document_id: documentId };
    found = Boolean(
      (await trx('documents').where({ id: documentId, user_id: userId }).forUpdate().first('id')) &&
      (await trx('application_documents').where(where).first('document_id')),
    );
    if (!found) return;
    await freeSlot(trx, jobId, documentId, usedAs, replace);
    await trx('application_documents').where(where).update({ doc_usage: usedAs });
    await trx('documents').where({ id: documentId, user_id: userId }).update(details);
    await touch(trx, jobId);
  });
  if (!editable) return 'no_job';
  return found ? 'ok' : 'no_file';
}

// Removes the link only. The file stays in the library. Returns "no_job", "no_file" or "ok".
async function unlink(userId, jobId, documentId) {
  let removed = 0;
  const editable = await withJobLock(userId, jobId, async (trx) => {
    removed = await trx('application_documents').where({ application_id: jobId, document_id: documentId }).del();
    if (removed) await touch(trx, jobId);
  });
  if (!editable) return 'no_job';
  return removed ? 'ok' : 'no_file';
}

// Hides a file from the library. Jobs already using it keep it.
// Returns false if the file isn't the user's or was already removed.
const removeFromLibrary = async (userId, documentId) =>
  (await knex('documents')
    .where({ id: documentId, user_id: userId })
    .whereNull('deleted_at')
    .update({ deleted_at: knex.fn.now() })) > 0;

// Reading is allowed on archived and trashed jobs.
const findLinked = (userId, jobId, documentId) =>
  knex('application_documents as ad')
    .join('applications as a', 'a.id', 'ad.application_id')
    .join('documents as doc', 'doc.id', 'ad.document_id')
    .where({ 'a.id': jobId, 'a.user_id': userId, 'doc.id': documentId, 'doc.user_id': userId })
    .first('doc.original_name as name', 'doc.storage_key as storageKey', 'doc.mime_type as mimeType');

module.exports = { list, isEditable, createAndLink, attachExisting, updateLinked, unlink, removeFromLibrary, findLinked };