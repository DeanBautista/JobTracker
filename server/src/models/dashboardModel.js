const knex = require('../db/knex');

const FUNNEL_STAGES = ['applied', 'screening', 'interview', 'offer'];
const PIPELINE_STATUSES = ['applied', 'screening', 'interview', 'offer', 'accepted'];
const PIPELINE_SQL = "('applied','screening','interview','offer','accepted')";
const CLOSED_STATUSES = ['rejected', 'withdrawn', 'ghosted'];
const WEEKS = 8;

// Furthest funnel step a job ever reached. accepted counts as offer.
const FURTHEST = `MAX(CASE h.to_status
  WHEN 'applied' THEN 1 WHEN 'screening' THEN 2 WHEN 'interview' THEN 3
  WHEN 'offer' THEN 4 WHEN 'accepted' THEN 4 ELSE 0 END)`;

// Range = when the job first entered the pipeline (from status_history).
const inRange = (query, days) => {
  if (days) {
    query.havingRaw(
      `MIN(CASE WHEN h.to_status IN ${PIPELINE_SQL} THEN h.changed_at END) >= NOW() - INTERVAL ? DAY`,
      [days],
    );
  }
  return query;
};

// ---------------- Funnel ----------------
async function funnel(userId, days) {
  const query = knex('applications as a')
    .join('status_history as h', 'h.application_id', 'a.id')
    .where('a.user_id', userId)
    .whereNull('a.deleted_at')
    .whereNull('a.archived_at')
    .groupBy('a.id')
    .select(knex.raw(`${FURTHEST} AS furthest`));

  const rows = await inRange(query, days);

  return FUNNEL_STAGES.map((stage, i) => ({
    stage,
    count: rows.filter((row) => Number(row.furthest) > i).length,
  }));
}

// ---------------- Weekly ----------------
const weekStart = (col, sunday) =>
  sunday
    ? `DATE_SUB(DATE(${col}), INTERVAL (DAYOFWEEK(${col}) - 1) DAY)`
    : `DATE_SUB(DATE(${col}), INTERVAL WEEKDAY(${col}) DAY)`;

async function weekly(userId) {
  const settings =
    (await knex('user_settings').where('user_id', userId).first('weekly_goal', 'week_start')) ?? {};
  const goal = settings.weekly_goal ?? 5;
  const sunday = settings.week_start === 'sun';

  const weeksAgo = `DATEDIFF(${weekStart('NOW()', sunday)}, ${weekStart('f.first_at', sunday)}) / 7`;

  const firstApplied = knex('applications as a')
    .join('status_history as h', 'h.application_id', 'a.id')
    .where('a.user_id', userId)
    .whereNull('a.deleted_at')
    .whereIn('h.to_status', PIPELINE_STATUSES)
    .groupBy('a.id')
    .select(knex.raw('MIN(h.changed_at) AS first_at'))
    .as('f');

  const rows = await knex
    .from(firstApplied)
    .whereRaw(`${weeksAgo} < ?`, [WEEKS])
    .groupByRaw(weeksAgo)
    .select(knex.raw(`${weeksAgo} AS weeksAgo`), knex.raw('COUNT(*) AS total'));

  const counts = Array(WEEKS).fill(0);
  for (const row of rows) {
    const i = WEEKS - 1 - Number(row.weeksAgo);
    if (i >= 0 && i < WEEKS) counts[i] = Number(row.total);
  }

  return { goal, counts };
}

// ---------------- By source ----------------
async function sources(userId, days) {
  const query = knex('applications as a')
    .join('status_history as h', 'h.application_id', 'a.id')
    .where('a.user_id', userId)
    .whereNull('a.deleted_at')
    .whereNull('a.archived_at')
    .groupBy('a.id')
    .select(
      knex.raw("COALESCE(NULLIF(TRIM(a.source), ''), 'Other') AS source"),
      'a.status',
      knex.raw(`${FURTHEST} AS furthest`),
    );

  const rows = await inRange(query, days);

  const bySource = new Map();
  for (const row of rows) {
    const furthest = Number(row.furthest);
    if (furthest < 1) continue; // never applied

    const entry = bySource.get(row.source) ?? { name: row.source, total: 0, replies: 0 };
    entry.total += 1;
    if (furthest >= 2 || row.status === 'rejected') entry.replies += 1;
    bySource.set(row.source, entry);
  }

  return [...bySource.values()]
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
    .slice(0, 6);
}

// ---------------- Rejections ----------------
async function rejections(userId, days) {
  const query = knex('applications as a')
    .where('a.user_id', userId)
    .whereNull('a.deleted_at')
    .whereNull('a.archived_at')
    .whereIn('a.status', CLOSED_STATUSES)
    .select(knex.raw("COALESCE(a.closed_reason, 'other') AS reason"), 'a.closed_stage');

  // Range = when the job was closed.
  if (days) query.whereRaw('a.closed_at >= NOW() - INTERVAL ? DAY', [days]);

  const rows = await query;

  const reasonCounts = new Map();
  const stageCounts = new Map();
  for (const row of rows) {
    reasonCounts.set(row.reason, (reasonCounts.get(row.reason) ?? 0) + 1);
    if (row.closed_stage) {
      stageCounts.set(row.closed_stage, (stageCounts.get(row.closed_stage) ?? 0) + 1);
    }
  }

  const reasons = [...reasonCounts]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
  const topStage = [...stageCounts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { reasons, topStage };
}

const breakdown = async (userId, days) => {
  const [s, r] = await Promise.all([sources(userId, days), rejections(userId, days)]);
  return { sources: s, rejections: r };
};

// ---------------- Stat tiles ----------------
const inWindow = (age, from, to) => age != null && Number(age) >= from && Number(age) < to;

// Counts for jobs whose event happened between `from` and `to` days ago.
const countWindow = (rows, from, to) => {
  const applied = rows.filter((r) => inWindow(r.appliedAge, from, to));
  return {
    applied: applied.length,
    // Reply = reached Screening or beyond, or was rejected (same rule as By source).
    replies: applied.filter((r) => Number(r.furthest) >= 2 || r.status === 'rejected').length,
    interviews: rows.filter((r) => inWindow(r.interviewAge, from, to)).length,
    offers: rows.filter((r) => inWindow(r.offerAge, from, to)).length,
  };
};

const ageOfFirst = (statuses) =>
  knex.raw(
    `TIMESTAMPDIFF(DAY, MIN(CASE WHEN h.to_status IN (${statuses}) THEN h.changed_at END), NOW())`,
  );

// days: 30 | 90 | null. `previous` is the same-length period before `current` (null for all time).
async function stats(userId, days) {
  const rows = await knex('applications as a')
    .join('status_history as h', 'h.application_id', 'a.id')
    .where('a.user_id', userId)
    .whereNull('a.deleted_at')
    .whereNull('a.archived_at')
    .groupBy('a.id')
    .select(
      'a.status',
      knex.raw(`${FURTHEST} AS furthest`),
      ageOfFirst("'applied','screening','interview','offer','accepted'").wrap('', ' AS appliedAge'),
      ageOfFirst("'interview','offer','accepted'").wrap('', ' AS interviewAge'),
      ageOfFirst("'offer','accepted'").wrap('', ' AS offerAge'),
    );

  if (!days) return { current: countWindow(rows, 0, Infinity), previous: null };

  return {
    current: countWindow(rows, 0, days),
    previous: countWindow(rows, days, days * 2),
  };
}

// Same scope as the Board and List: not archived, not in Trash.
async function hasJobs(userId) {
  const row = await knex('applications')
    .where('user_id', userId)
    .whereNull('deleted_at')
    .whereNull('archived_at')
    .first('id');
  return Boolean(row);
}

module.exports = { funnel, weekly, breakdown, stats, hasJobs };