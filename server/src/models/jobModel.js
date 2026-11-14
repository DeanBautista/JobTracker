const knex = require('../db/knex');
const { hashUrl } = require('../utils/urlHash');

const baseQuery = () =>
  knex('applications as a')
    .join('companies as c', 'c.id', 'a.company_id')
    .select(
      'a.id',
      'a.title',
      'c.name as company',
      'a.job_url as link',
      'a.status as stage',
      'a.priority',
      'a.location',
      'a.work_mode as workMode',
      'a.date_applied as dateApplied',
      'a.created_at as createdAt'
    );

async function findById(userId, id) {
  return baseQuery().where({ 'a.id': id, 'a.user_id': userId }).first();
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
    // Company: reuse by (user_id, name), create if missing.
    // The unique key is case-insensitive, so "northwind" matches "Northwind".
    await trx('companies').insert({ user_id: userId, name: v.company }).onConflict().ignore();
    const company = await trx('companies').where({ user_id: userId, name: v.company }).first('id');

    // New card goes to the bottom of its column.
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

module.exports = { findById, findDuplicate, create };