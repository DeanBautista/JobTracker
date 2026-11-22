const knex = require('../db/knex');
const { hashUrl } = require('../utils/urlHash');

const CLOSED_STATUSES = ['accepted', 'rejected', 'withdrawn', 'ghosted'];

// Must match applications.closed_reason.
const CLOSE_REASONS = [
  'not_enough_experience',
  'position_closed',
  'salary_mismatch',
  'took_another_offer',
  'no_response',
  'other',
];

const STAGES = ['wishlist', 'applied', 'screening', 'interview', 'offer', ...CLOSED_STATUSES];

// One shape for the list and for a newly created job. Dates are formatted in SQL so
// the driver never turns them into JS Dates (which shift with the timezone).
const JOB_COLUMNS = [
  'a.id',
  'a.title',
  'c.name as company',
  'a.status as stage',
  'a.priority',
  'a.work_mode as mode',
  'a.source',
  knex.raw("DATE_FORMAT(a.date_applied, '%Y-%m-%d') AS appliedAt"),
  knex.raw("DATE_FORMAT(a.deadline, '%Y-%m-%d') AS deadline"),
  knex.raw('TIMESTAMPDIFF(DAY, a.stage_changed_at, NOW()) AS daysInStage'),
];

// ENUM columns sort by their declared order, which already matches the UI:
// stage: wishlist -> ghosted, priority: low < medium < high.
const SORT_COLUMNS = {
  title: 'a.title',
  company: 'c.name',
  stage: 'a.status',
  priority: 'a.priority',
  applied: 'a.date_applied',
  days: 'a.stage_changed_at',
};

const EXPORT_COLUMNS = [
  'a.id', 'a.title', 'c.name as company', 'a.status', 'a.priority', 'a.work_mode', 'a.employment_type',
  'a.location', 'a.source', 'a.referred_by', 'a.job_url',
  'a.salary_min', 'a.salary_max', 'a.salary_currency', 'a.salary_period',
  knex.raw("DATE_FORMAT(a.date_posted, '%Y-%m-%d') AS date_posted"),
  knex.raw("DATE_FORMAT(a.date_applied, '%Y-%m-%d') AS date_applied"),
  knex.raw("DATE_FORMAT(a.deadline, '%Y-%m-%d') AS deadline"),
  'a.closed_reason', 'a.closing_note',
  knex.raw('TIMESTAMPDIFF(DAY, a.stage_changed_at, NOW()) AS days_in_stage'),
  knex.raw('a.archived_at IS NOT NULL AS archived'),
  knex.raw("DATE_FORMAT(a.created_at, '%Y-%m-%d') AS added"),
];

const MAX_EXPORT = 5000;

function filtered(userId, f) {
  const query = knex('applications as a')
    .join('companies as c', 'c.id', 'a.company_id')
    .where('a.user_id', userId)
    .whereNull('a.deleted_at');

  if (f.archived) query.whereNotNull('a.archived_at');
  else query.whereNull('a.archived_at');

  if (f.q) {
    const like = `%${f.q.replace(/[\\%_]/g, '\\$&')}%`; // escape LIKE wildcards
    query.where((qb) => qb.where('a.title', 'like', like).orWhere('c.name', 'like', like));
  }
  if (f.stage === 'closed') query.whereIn('a.status', CLOSED_STATUSES);
  else if (f.stage) query.where('a.status', f.stage);
  if (f.mode) query.where('a.work_mode', f.mode);
  if (f.priority) query.where('a.priority', f.priority);
  if (f.source) query.where('a.source', f.source);
  if (f.date) query.whereRaw('a.date_applied >= DATE_SUB(CURDATE(), INTERVAL ? DAY)', [f.date]);

  return query;
}

// Adds daysInStage as a number and the next pending reminder to each row.
async function withReminders(userId, rows) {
  if (rows.length === 0) return [];

  const reminders = await knex('reminders')
    .select('application_id', 'title', knex.raw('due_at <= NOW() AS late'))
    .where({ user_id: userId, status: 'pending' })
    .whereIn('application_id', rows.map((r) => r.id))
    .orderBy('due_at', 'asc');

  const next = new Map(); // earliest first, so keep the first per job
  for (const r of reminders) if (!next.has(r.application_id)) next.set(r.application_id, r);

  return rows.map((row) => {
    const r = next.get(row.id);
    return {
      ...row,
      daysInStage: Number(row.daysInStage),
      reminder: r ? { label: r.title, late: Boolean(r.late) } : null,
    };
  });
}

async function list(userId, f) {
  const base = filtered(userId, f);

  // "Days in stage" ascending means the most recent stage change first.
  const flip = f.sort === 'days';
  const direction = flip ? (f.dir === 'asc' ? 'desc' : 'asc') : f.dir;

  const [{ total }, rows] = await Promise.all([
    base.clone().count({ total: 'a.id' }).first(),
    base
      .clone()
      .select(JOB_COLUMNS)
      .orderBy(SORT_COLUMNS[f.sort], direction)
      .orderBy('a.id', 'desc') // stable paging when values tie
      .limit(f.size)
      .offset((f.page - 1) * f.size),
  ]);

  return { jobs: await withReminders(userId, rows), total: Number(total) };
}

async function findById(userId, id) {
  const rows = await knex('applications as a')
    .join('companies as c', 'c.id', 'a.company_id')
    .select(JOB_COLUMNS)
    .where({ 'a.id': id, 'a.user_id': userId })
    .whereNull('a.deleted_at')
    .limit(1);
  return (await withReminders(userId, rows))[0];
}

// Same link, not in Trash.
async function findDuplicate(userId, link) {
  return knex('applications as a')
    .join('companies as c', 'c.id', 'a.company_id')
    .select('a.id', 'a.title', 'c.name as company')
    .where({ 'a.user_id': userId, 'a.url_hash': hashUrl(link) })
    .whereNull('a.deleted_at')
    .first();
}

// Expects validated values. Returns the created job.
async function create(userId, v) {
  const id = await knex.transaction(async (trx) => {
    await trx('companies').insert({ user_id: userId, name: v.company }).onConflict().ignore();
    const company = await trx('companies').where({ user_id: userId, name: v.company }).first('id');

    const { maxPos } = await trx('applications')
      .where({ user_id: userId, status: v.status })
      .max({ maxPos: 'board_position' })
      .first();

    const isClosed = CLOSED_STATUSES.includes(v.status);   // <-- 1) ADD THIS LINE

    const [applicationId] = await trx('applications').insert({
      user_id: userId,
      company_id: company.id,
      title: v.title,
      job_url: v.link,
      url_hash: v.link ? hashUrl(v.link) : null,
      source: v.source,
      referred_by: v.referredBy,
      location: v.location,
      work_mode: v.workMode,
      employment_type: v.employmentType,
      salary_min: v.salaryMin,
      salary_max: v.salaryMax,
      salary_currency: v.currency,
      salary_period: v.salaryPeriod,
      date_posted: v.datePosted,
      date_applied: v.dateApplied,
      deadline: v.deadline,
      status: v.status,
      priority: v.priority,
      board_position: (maxPos ?? -1) + 1,
      description: v.description,

      // 2) ADD THESE LINES (after `description`)
      closed_reason: v.closedReason ?? null,
      closing_note: v.closingNote ?? null,
      closed_at: isClosed ? knex.fn.now() : null,
      offer_salary: v.offerSalary ?? null,
      offer_currency: v.offerCurrency ?? null,
      offer_period: v.offerPeriod ?? null,
      offer_respond_by: v.offerRespondBy ?? null,
      offer_notes: v.offerNotes ?? null,
    });

    await trx('status_history').insert({
      application_id: applicationId,
      from_status: null,
      to_status: v.status,
    });

    return applicationId;
  });

  return findById(userId, id);
}

// Drag-and-drop / "Move to" menu. A same-column reorder only changes board_position.
// A stage change also resets the stage clock, logs history, and sets/clears the closed_* fields.
async function move(userId, id, { stage, position, closedReason = null, closingNote = null }) {
  return knex.transaction(async (trx) => {
    const job = await trx('applications')
      .where({ id, user_id: userId })
      .whereNull('deleted_at')
      .forUpdate()
      .first('status');
    if (!job) return null;

    const patch = { board_position: position };
    const changed = job.status !== stage;

    if (changed) {
      const wasClosed = CLOSED_STATUSES.includes(job.status);
      const nowClosed = CLOSED_STATUSES.includes(stage);

      Object.assign(patch, {
        status: stage,
        stage_changed_at: knex.fn.now(),
        last_activity_at: knex.fn.now(),
      });

      if (nowClosed) {
        patch.closed_reason = closedReason;
        patch.closing_note = closingNote;
        if (!wasClosed) {
          patch.closed_stage = job.status; // the stage it was in when it closed
          patch.closed_at = knex.fn.now();
        }
      } else {
        Object.assign(patch, { closed_stage: null, closed_at: null, closed_reason: null, closing_note: null });
      }

      await trx('status_history').insert({ application_id: id, from_status: job.status, to_status: stage });
    }

    await trx('applications').where({ id, user_id: userId }).update(patch);
    return { id, stage, position, changed };
  });
}

// Everything the board needs, in one shot: all non-archived, non-trashed jobs, no pagination.
// Timestamps are stored in UTC, so they go out as ISO strings with a Z.
// DATE columns go out as local midnight (no Z) so "Deadline in 2 days" never shifts a day
// for users west of UTC.
async function listBoard(userId) {
  const rows = await knex('applications as a')
    .join('companies as c', 'c.id', 'a.company_id')
    .select(
      'a.id',
      'a.title',
      'c.name as company',
      'a.status as stage',
      'a.priority',
      'a.work_mode as mode',
      'a.location',
      'a.board_position as position',
      knex.raw("DATE_FORMAT(a.stage_changed_at, '%Y-%m-%dT%H:%i:%sZ') AS stageEnteredAt"),
      knex.raw("DATE_FORMAT(a.deadline, '%Y-%m-%dT00:00:00') AS deadline"),
      knex.raw("DATE_FORMAT(a.offer_respond_by, '%Y-%m-%dT00:00:00') AS replyBy"),
    )
    .where('a.user_id', userId)
    .whereNull('a.deleted_at')
    .whereNull('a.archived_at')
    .orderBy('a.status')
    .orderBy('a.board_position');

  if (rows.length === 0) return [];

  // Next scheduled interview per job (a round from the last day still counts, so
  // "Today" keeps showing after the time passes).
  const interviews = await knex('interviews')
    .select(
      'application_id',
      knex.raw("DATE_FORMAT(MIN(scheduled_at), '%Y-%m-%dT%H:%i:%sZ') AS interviewAt"),
    )
    .whereIn('application_id', rows.map((r) => r.id))
    .where('outcome', 'scheduled')
    .whereRaw('scheduled_at >= NOW() - INTERVAL 1 DAY')
    .groupBy('application_id');

  const at = new Map(interviews.map((i) => [i.application_id, i.interviewAt]));
  return rows.map((row) => ({ ...row, interviewAt: at.get(row.id) ?? null }));
}

// Locks the caller's matching rows, applies the change, returns the ids that changed.
// Ids that aren't theirs, or are already in the target state, are skipped.
async function changeMany(userId, ids, scope, change) {
  return knex.transaction(async (trx) => {
    const rows = await scope(trx('applications').where('user_id', userId).whereIn('id', ids))
      .forUpdate()
      .select('id');
    const found = rows.map((r) => r.id);
    if (found.length > 0) await change(trx('applications').whereIn('id', found));
    return found;
  });
}

const archive = (userId, ids) =>
  changeMany(
    userId,
    ids,
    (q) => q.whereNull('deleted_at').whereNull('archived_at'),
    (q) => q.update({ archived_at: knex.fn.now() }),
  );

const unarchive = (userId, ids) =>
  changeMany(
    userId,
    ids,
    (q) => q.whereNull('deleted_at').whereNotNull('archived_at'),
    (q) => q.update({ archived_at: null }),
  );

// Move to Trash.
const trash = (userId, ids) =>
  changeMany(
    userId,
    ids,
    (q) => q.whereNull('deleted_at'),
    (q) => q.update({ deleted_at: knex.fn.now() }),
  );

const restore = (userId, ids) =>
  changeMany(
    userId,
    ids,
    (q) => q.whereNotNull('deleted_at'),
    (q) => q.update({ deleted_at: null }),
  );

// Only jobs already in Trash can be deleted forever. Notes, history, interviews, reminders cascade.
const deleteForever = (userId, ids) =>
  changeMany(
    userId,
    ids,
    (q) => q.whereNotNull('deleted_at'),
    (q) => q.del(),
  );

// Returns the number of jobs removed.
const emptyTrash = (userId) =>
  knex('applications').where('user_id', userId).whereNotNull('deleted_at').del();

// Run by scripts/purgeTrash.js. All users, older than 30 days.
const purgeExpiredTrash = () =>
  knex('applications').whereNotNull('deleted_at').whereRaw('deleted_at < NOW() - INTERVAL 30 DAY').del();

// Archive and Trash tabs. Both are paginated, and `counts` feeds the tab badges.
const TAB_SCOPES = {
  archive: (q) => q.whereNull('a.deleted_at').whereNotNull('a.archived_at'),
  trash: (q) => q.whereNotNull('a.deleted_at'),
};

const TAB_COLUMNS = {
  archive: [knex.raw("DATE_FORMAT(a.archived_at, '%Y-%m-%dT%H:%i:%sZ') AS archivedAt")],
  trash: [
    knex.raw("DATE_FORMAT(a.deleted_at, '%Y-%m-%dT%H:%i:%sZ') AS deletedAt"),
    knex.raw('GREATEST(0, 30 - TIMESTAMPDIFF(DAY, a.deleted_at, NOW())) AS daysLeft'),
  ],
};

const TAB_SORT = { archive: 'a.archived_at', trash: 'a.deleted_at' };

async function listTab(userId, view, { page, size }) {
  const owned = () => knex('applications as a').where('a.user_id', userId);

  const countOf = async (tab) => {
    const { total } = await TAB_SCOPES[tab](owned()).count({ total: 'a.id' }).first();
    return Number(total);
  };

  const [archive, trash, rows] = await Promise.all([
    countOf('archive'),
    countOf('trash'),
    TAB_SCOPES[view](owned())
      .join('companies as c', 'c.id', 'a.company_id')
      .select('a.id', 'a.title', 'c.name as company', 'a.status as stage', ...TAB_COLUMNS[view])
      .orderBy(TAB_SORT[view], 'desc')
      .orderBy('a.id', 'desc') // stable paging when dates tie
      .limit(size)
      .offset((page - 1) * size),
  ]);

  const jobs = rows.map((r) => ('daysLeft' in r ? { ...r, daysLeft: Number(r.daysLeft) } : r));
  return { jobs, total: view === 'archive' ? archive : trash, counts: { archive, trash } };
}

// Bulk "Move to": every selected job goes to the TOP of the target column, in selection order.
// Jobs already in the target stage are skipped. Returns the ids that moved.
async function moveMany(userId, ids, { stage, closedReason = null, closingNote = null }) {
  return knex.transaction(async (trx) => {
    const rows = await trx('applications')
      .where('user_id', userId)
      .whereIn('id', ids)
      .whereNull('deleted_at')
      .whereNot('status', stage)
      .forUpdate()
      .select('id', 'status');
    if (rows.length === 0) return [];

    const order = new Map(ids.map((id, i) => [id, i]));
    rows.sort((a, b) => order.get(a.id) - order.get(b.id));

    const { minPos } = await trx('applications')
      .where({ user_id: userId, status: stage })
      .whereNull('deleted_at')
      .whereNull('archived_at')
      .min({ minPos: 'board_position' })
      .first();
    const start = minPos == null ? 0 : minPos - rows.length;
    const nowClosed = CLOSED_STATUSES.includes(stage);

    for (const [i, job] of rows.entries()) {
      const wasClosed = CLOSED_STATUSES.includes(job.status);
      const patch = {
        status: stage,
        board_position: start + i,
        stage_changed_at: knex.fn.now(),
        last_activity_at: knex.fn.now(),
      };

      if (nowClosed) {
        patch.closed_reason = closedReason;
        patch.closing_note = closingNote;
        if (!wasClosed) {
          patch.closed_stage = job.status;
          patch.closed_at = knex.fn.now();
        }
      } else {
        Object.assign(patch, { closed_stage: null, closed_at: null, closed_reason: null, closing_note: null });
      }

      await trx('applications').where('id', job.id).update(patch);
    }

    await trx('status_history').insert(
      rows.map((j) => ({ application_id: j.id, from_status: j.status, to_status: stage })),
    );
    return rows.map((j) => j.id);
  });
}

// Everything matching the list's filters and sort, with no paging.
function listFilteredForExport(userId, f) {
  const direction = f.sort === 'days' ? (f.dir === 'asc' ? 'desc' : 'asc') : f.dir;
  return filtered(userId, f)
    .select(EXPORT_COLUMNS)
    .orderBy(SORT_COLUMNS[f.sort], direction)
    .orderBy('a.id', 'desc')
    .limit(MAX_EXPORT);
}

module.exports = {
  list, listBoard, listTab, findById, findDuplicate, create, move, moveMany,
  archive, unarchive, trash, restore, deleteForever, emptyTrash, purgeExpiredTrash, listFilteredForExport,
  STAGES, CLOSE_REASONS,
};