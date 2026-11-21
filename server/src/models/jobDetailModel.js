const knex = require('../db/knex');

const z = (col, as) => knex.raw(`DATE_FORMAT(${col}, '%Y-%m-%dT%H:%i:%sZ') AS ${as}`); // UTC timestamp
const d = (col, as) => knex.raw(`DATE_FORMAT(${col}, '%Y-%m-%d') AS ${as}`);           // DATE column
const dash = (v) => (v ? v.replace(/_/g, '-') : v);
const num = (v) => (v == null ? null : Number(v));

const CLOSED = ['accepted', 'rejected', 'withdrawn', 'ghosted'];
const OFFER = ['offer', 'accepted'];

const NOTE_COLS = [
  'id', 'body as text', 'is_pinned as pinned', z('created_at', 'createdAt'),
  knex.raw('updated_at > created_at AS edited'),
];
const toNote = (r) => ({ ...r, id: String(r.id), pinned: Boolean(r.pinned), edited: Boolean(r.edited) });

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
    .select(NOTE_COLS)
    .orderBy([{ column: 'is_pinned', order: 'desc' }, { column: 'created_at', order: 'desc' }]);
  return rows.map(toNote);
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

// Archived and trashed jobs are read-only, so they come back as not found.
async function update(userId, id, v) {
  const { company, offer, closure, status, ...cols } = v;

  const result = await knex.transaction(async (trx) => {
    const job = await trx('applications')
      .where({ id, user_id: userId }).whereNull('deleted_at').whereNull('archived_at')
      .forUpdate()
      .first('status', 'salary_min', 'salary_max');
    if (!job) return { notFound: true };

    const min = 'salary_min' in cols ? cols.salary_min : job.salary_min;
    const max = 'salary_max' in cols ? cols.salary_max : job.salary_max;
    if (min != null && max != null && Number(max) < Number(min)) {
      return { errors: { salaryMax: 'Maximum salary must be at least the minimum.' } };
    }

    const patch = { ...cols, last_activity_at: knex.fn.now() };

    if (company) {
      await trx('companies').insert({ user_id: userId, name: company }).onConflict().ignore();
      patch.company_id = (await trx('companies').where({ user_id: userId, name: company }).first('id')).id;
    }

    const next = status ?? job.status;
    const changed = status !== undefined && status !== job.status;
    const wasClosed = CLOSED.includes(job.status);
    const nowClosed = CLOSED.includes(next);

    if (changed) {
      const { minPos } = await trx('applications')
        .where({ user_id: userId, status }).whereNull('deleted_at').whereNull('archived_at')
        .min({ minPos: 'board_position' }).first();
      Object.assign(patch, { status, board_position: (minPos ?? 1) - 1, stage_changed_at: knex.fn.now() });

      if (nowClosed && !wasClosed) Object.assign(patch, { closed_stage: job.status, closed_at: knex.fn.now() });
      if (!nowClosed) Object.assign(patch, { closed_stage: null, closed_at: null, closed_reason: null, closing_note: null });
    }

    if (closure && nowClosed) {
      const { closedDate, closed_stage: prev, ...rest } = closure;
      Object.assign(patch, rest); // reason, note
      if (wasClosed) { // already closed: stage and date are editable
        if (prev) patch.closed_stage = prev;
        if (closedDate) patch.closed_at = `${closedDate} 00:00:00`;
      }
    }

    if (offer && OFFER.includes(next)) Object.assign(patch, offer);

    await trx('applications').where({ id, user_id: userId }).update(patch);
    if (changed) await trx('status_history').insert({ application_id: id, from_status: job.status, to_status: status });
    return { ok: true };
  });

  if (!result.ok) return result;
  return { job: await getOverview(userId, id) };
}

async function createNote(userId, id, text) {
  return knex.transaction(async (trx) => {
    const job = await trx('applications')
      .where({ id, user_id: userId }).whereNull('deleted_at').whereNull('archived_at')
      .forUpdate().first('id');
    if (!job) return null;

    const [noteId] = await trx('application_notes').insert({ application_id: id, body: text });
    await trx('applications').where({ id }).update({ last_activity_at: knex.fn.now() });
    return toNote(await trx('application_notes').where('id', noteId).select(NOTE_COLS).first());
  });
}

// Edit text and/or pin. Archived and trashed jobs are read-only, so they return null.
async function updateNote(userId, id, noteId, { text, pinned }) {
  return knex.transaction(async (trx) => {
    const job = await trx('applications')
      .where({ id, user_id: userId }).whereNull('deleted_at').whereNull('archived_at')
      .forUpdate().first('id');
    if (!job) return null;

    const note = await trx('application_notes').where({ id: noteId, application_id: id }).forUpdate().first('id');
    if (!note) return null;

    const patch = {};
    if (text !== undefined) patch.body = text;
    if (pinned !== undefined) patch.is_pinned = pinned;
    // Pinning alone must not count as "edited", so keep updated_at as it is.
    if (text === undefined) patch.updated_at = knex.raw('updated_at');

    await trx('application_notes').where('id', noteId).update(patch);
    if (text !== undefined) await trx('applications').where({ id }).update({ last_activity_at: knex.fn.now() });
    return toNote(await trx('application_notes').where('id', noteId).select(NOTE_COLS).first());
  });
}

async function deleteNote(userId, id, noteId) {
  return knex.transaction(async (trx) => {
    const job = await trx('applications')
      .where({ id, user_id: userId }).whereNull('deleted_at').whereNull('archived_at')
      .forUpdate().first('id');
    if (!job) return false;
    return (await trx('application_notes').where({ id: noteId, application_id: id }).del()) > 0;
  });
}

module.exports = { 
    owns, 
    getOverview, 
    update, 
    createNote, 
    getNotes, 
    getDocuments, 
    getInterviews, 
    getReminders, 
    getTimeline, 
    updateNote, 
    deleteNote 
};