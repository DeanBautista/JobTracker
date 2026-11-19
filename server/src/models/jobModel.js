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

function filtered(userId, f) {
  const query = knex('applications as a')
    .join('companies as c', 'c.id', 'a.company_id')
    .where('a.user_id', userId)
    .whereNull('a.deleted_at');

  if (!f.archived) query.whereNull('a.archived_at');

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

module.exports = { list, listBoard, findById, findDuplicate, create, move, STAGES, CLOSE_REASONS };