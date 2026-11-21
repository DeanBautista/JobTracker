const knex = require('../db/knex');

const z = (col, as) => knex.raw(`DATE_FORMAT(${col}, '%Y-%m-%dT%H:%i:%sZ') AS ${as}`); // UTC timestamp
const d = (col, as) => knex.raw(`DATE_FORMAT(${col}, '%Y-%m-%d') AS ${as}`);           // DATE column
const dash = (v) => (v ? v.replace(/_/g, '-') : v);
const num = (v) => (v == null ? null : Number(v));

// Ownership check for tab endpoints. Includes archived and trashed jobs.
const owns = async (userId, id) =>
  Boolean(await knex('applications').where({ id, user_id: userId }).first('id'));

async function getOverview(userId, id) {
  const a = await knex('applications as a')
    .join('companies as c', 'c.id', 'a.company_id')
    .where({ 'a.id': id, 'a.user_id': userId })
    .first(
      'a.id', 'a.title', 'c.name as company', 'c.website as companyUrl', 'a.job_url as link',
      'a.source', 'a.referred_by as referredBy', 'a.location', 'a.work_mode as workMode',
      'a.employment_type as employmentType', 'a.status as stage', 'a.priority',
      'a.salary_min as salaryMin', 'a.salary_max as salaryMax', 'a.salary_currency as currency',
      'a.salary_period as salaryPeriod', 'a.description', 'a.offer_salary', 'a.offer_currency',
      'a.offer_period', 'a.offer_notes', 'a.closed_reason', 'a.closed_stage', 'a.closing_note',
      d('a.created_at', 'createdAt'), z('a.stage_changed_at', 'stageChangedAt'),
      d('a.date_posted', 'datePosted'), d('a.date_applied', 'dateApplied'), d('a.deadline', 'deadline'),
      d('a.offer_respond_by', 'offerReplyBy'), d('a.closed_at', 'closedDate'),
      z('a.deleted_at', 'deletedAt'), knex.raw('a.archived_at IS NOT NULL AS archived'),
    );
    if (!a) return null;

    const count = async (q) => Number((await q.count({ c: '*' }).first()).c);
    const [notes, documents, interviews, reminders] = await Promise.all([
    count(knex('application_notes').where('application_id', id)),
    count(knex('application_documents').where('application_id', id)),
    count(knex('interviews').where('application_id', id)),
    count(knex('reminders').where({ user_id: userId, application_id: id }).whereNot('status', 'dismissed')),
    ]);

  const hasOffer = a.offer_salary != null || a.offerReplyBy || a.offer_notes;
  return {
    id: String(a.id),
    title: a.title, company: a.company, companyUrl: a.companyUrl, link: a.link,
    source: a.source, referredBy: a.referredBy, location: a.location,
    workMode: a.workMode, employmentType: dash(a.employmentType),
    stage: a.stage, priority: a.priority,
    createdAt: a.createdAt, stageChangedAt: a.stageChangedAt,
    salaryMin: num(a.salaryMin), salaryMax: num(a.salaryMax),
    currency: a.currency, salaryPeriod: a.salaryPeriod,
    datePosted: a.datePosted, dateApplied: a.dateApplied, deadline: a.deadline,
    description: a.description ?? '',
    counts: { notes, documents, interviews, reminders },
    offer: hasOffer
      ? { salary: num(a.offer_salary), currency: a.offer_currency, period: a.offer_period,
          replyBy: a.offerReplyBy, notes: a.offer_notes }
      : null,
    closure: a.closedDate
      ? { reason: a.closed_reason, previousStage: a.closed_stage, closedDate: a.closedDate, note: a.closing_note }
      : null,
    archived: Boolean(a.archived),
    deletedAt: a.deletedAt,
  };
}

async function getNotes(id) {
  const rows = await knex('application_notes')
    .where('application_id', id)
    .select('id', 'body as text', 'is_pinned as pinned', z('created_at', 'createdAt'),
      knex.raw('updated_at > created_at AS edited'))
    .orderBy([{ column: 'is_pinned', order: 'desc' }, { column: 'created_at', order: 'desc' }]);
  return rows.map((r) => ({ ...r, id: String(r.id), pinned: Boolean(r.pinned), edited: Boolean(r.edited) }));
}

async function getDocuments(userId, id) {
  const [docs, library] = await Promise.all([
    knex('application_documents as ad')
      .join('documents as doc', 'doc.id', 'ad.document_id')
      .where({ 'ad.application_id': id, 'doc.user_id': userId })
      .select('doc.id', 'doc.original_name as name', 'doc.label', 'doc.type as kind',
        'doc.mime_type as mimeType', 'doc.size_bytes as sizeBytes', 'ad.doc_usage as usedAs',
        z('ad.attached_at', 'addedAt'))
      .orderBy('ad.attached_at', 'desc'),
    knex('documents as doc')
      .where('doc.user_id', userId)
      .whereNotIn('doc.id', knex('application_documents').where('application_id', id).select('document_id'))
      .select('doc.id', 'doc.original_name as name', 'doc.type as kind', 'doc.size_bytes as sizeBytes')
      .orderBy('doc.created_at', 'desc'),
  ]);
  const fix = (r) => ({ ...r, id: String(r.id) });
  return { documents: docs.map(fix), library: library.map(fix) };
}

async function getInterviews(id) {
  const rows = await knex('interviews')
    .where('application_id', id)
    .select('id', 'round_type as type', 'duration_min as durationMin', 'mode',
      'link_or_address as location', 'prep_notes as prepNotes', 'outcome as status',
      'feedback', 'rating', z('scheduled_at', 'startsAt'))
    .orderBy('scheduled_at', 'desc');
  return rows.map(({ feedback, rating, ...r }) => ({
    ...r,
    id: String(r.id),
    location: r.location ?? '',
    prepNotes: r.prepNotes ?? '',
    result: feedback != null || rating != null
      ? { outcome: r.status, feedback: feedback ?? '', rating }
      : null,
  }));
}

async function getReminders(userId, id) {
  const rows = await knex('reminders')
    .where({ user_id: userId, application_id: id })
    .whereNot('status', 'dismissed')
    .select('id', 'title', 'note', 'origin', 'status', z('due_at', 'dueAt'),
      z('created_at', 'createdAt'), z('completed_at', 'doneAt'))
    .orderByRaw("status = 'pending' DESC, due_at ASC");
  return rows.map((r) => ({ ...r, id: String(r.id), note: r.note ?? '', hasTime: true }));
}

// No timeline table: built from history, notes, interviews, done reminders and files.
async function getTimeline(userId, id) {
  const [hist, notes, ints, rems, files] = await Promise.all([
    knex('status_history').where('application_id', id)
      .select('id', 'from_status', 'to_status', z('changed_at', 'at')),
    knex('application_notes').where('application_id', id)
      .select('id', 'body', z('created_at', 'at')),
    knex('interviews').where('application_id', id)
      .select('id', 'round_type', 'outcome', z('created_at', 'at')),
    knex('reminders').where({ user_id: userId, application_id: id, status: 'done' })
      .select('id', 'title', z('completed_at', 'at')),
    knex('application_documents as ad').join('documents as doc', 'doc.id', 'ad.document_id')
      .where('ad.application_id', id)
      .select('doc.id', 'doc.original_name as name', z('ad.attached_at', 'at')),
  ]);

  const items = [
    ...hist.map((h) => ({ id: `s${h.id}`, type: 'stage', at: h.at,
      title: h.from_status ? `Moved from ${h.from_status} to ${h.to_status}` : `Added as ${h.to_status}` })),
    ...notes.map((n) => ({ id: `n${n.id}`, type: 'note', at: n.at, title: 'Note added', detail: n.body.slice(0, 140) })),
    ...ints.map((i) => ({ id: `i${i.id}`, type: 'interview', at: i.at,
      title: i.outcome === 'scheduled' ? 'Interview scheduled' : `Interview result: ${i.outcome}`, detail: i.round_type })),
    ...rems.map((r) => ({ id: `r${r.id}`, type: 'reminder', at: r.at, title: 'Reminder done', detail: r.title })),
    ...files.map((f) => ({ id: `f${f.id}`, type: 'file', at: f.at, title: `Attached ${f.name}` })),
  ].filter((i) => i.at);

  return items.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 100);
}

module.exports = { owns, getOverview, getNotes, getDocuments, getInterviews, getReminders, getTimeline };