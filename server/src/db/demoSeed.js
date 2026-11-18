const knex = require('./knex');

const ORDER = ['wishlist', 'applied', 'screening', 'interview', 'offer'];
const CLOSED = ['accepted', 'rejected', 'withdrawn', 'ghosted'];
const CITIES = ['Makati', 'Taguig', 'Quezon City', 'Cebu City'];

// [title, company, stage, priority, mode, source, appliedDaysAgo, lastChangeDaysAgo, reachedBeforeClosing, closedReason]
const JOBS = [
  // wishlist (5)
  ['Junior Frontend Developer', 'Brightline Labs', 'wishlist', 'high', 'remote', 'LinkedIn', null, 3],
  ['Junior Full Stack Developer', 'Northwind Digital', 'wishlist', 'medium', 'hybrid', 'Jobstreet', null, 6],
  ['React Developer', 'Pixelforge', 'wishlist', 'low', 'remote', 'Company site', null, 9],
  ['Junior Backend Developer', 'Cloudnine Systems', 'wishlist', 'medium', 'onsite', 'Referral', null, 12],
  ['Web Developer', 'Lumen Studio', 'wishlist', 'low', 'hybrid', 'Indeed', null, 15],
  // applied (10)
  ['Junior Software Engineer', 'Harbor Tech', 'applied', 'high', 'remote', 'LinkedIn', 2, 2],
  ['Frontend Developer', 'Kite Analytics', 'applied', 'medium', 'hybrid', 'LinkedIn', 3, 3],
  ['Junior Full Stack Developer', 'Orbit Commerce', 'applied', 'high', 'remote', 'Jobstreet', 5, 5],
  ['Node.js Developer', 'Stackwell', 'applied', 'medium', 'onsite', 'Indeed', 6, 6],
  ['React Native Developer', 'Mango Apps', 'applied', 'low', 'remote', 'Company site', 8, 8],
  ['Junior Web Developer', 'Bluepeak Solutions', 'applied', 'medium', 'hybrid', 'Jobstreet', 10, 10],
  ['Backend Developer', 'Ledgerly', 'applied', 'high', 'remote', 'Referral', 12, 12],
  ['Software Developer Trainee', 'Tandem Works', 'applied', 'low', 'onsite', 'Company site', 14, 14],
  ['Junior JavaScript Developer', 'Sparrow Labs', 'applied', 'medium', 'remote', 'LinkedIn', 17, 17],
  ['Frontend Engineer', 'Vantage Cloud', 'applied', 'low', 'hybrid', 'Indeed', 20, 20],
  // screening (5)
  ['Junior Full Stack Developer', 'Quill Software', 'screening', 'high', 'remote', 'LinkedIn', 18, 6],
  ['React Developer', 'Nimbus Retail', 'screening', 'medium', 'hybrid', 'Jobstreet', 22, 8],
  ['Junior Backend Developer', 'Atlas Payments', 'screening', 'high', 'remote', 'Referral', 25, 4],
  ['Web Application Developer', 'Greenfield IT', 'screening', 'low', 'onsite', 'Indeed', 28, 10],
  ['Frontend Developer', 'Pinecone Media', 'screening', 'medium', 'remote', 'Company site', 30, 9],
  // interview (6)
  ['Junior Full Stack Developer', 'Meridian Tech', 'interview', 'high', 'remote', 'LinkedIn', 24, 2],
  ['Frontend Developer', 'Skyline Interactive', 'interview', 'high', 'hybrid', 'Referral', 30, 4],
  ['Node.js Developer', 'Copperfield Systems', 'interview', 'medium', 'remote', 'Jobstreet', 34, 6],
  ['Junior Software Engineer', 'Brightpath Health', 'interview', 'medium', 'onsite', 'Company site', 38, 8],
  ['React Developer', 'Tidal Commerce', 'interview', 'high', 'remote', 'LinkedIn', 42, 3],
  ['Backend Developer', 'Ironwood Data', 'interview', 'low', 'hybrid', 'Indeed', 45, 10],
  // offer (2)
  ['Junior Full Stack Developer', 'Evergreen Software', 'offer', 'high', 'remote', 'Referral', 48, 5],
  ['Frontend Developer', 'Summit Digital', 'offer', 'high', 'hybrid', 'LinkedIn', 55, 2],
  // accepted (1)
  ['Junior Web Developer', 'Lakeside Tech', 'accepted', 'medium', 'hybrid', 'Jobstreet', 66, 14, 'offer'],
  // rejected (6)
  ['Software Engineer I', 'Titan Logistics', 'rejected', 'medium', 'onsite', 'Indeed', 50, 35, 'applied', 'not_enough_experience'],
  ['Frontend Developer', 'Crimson Labs', 'rejected', 'low', 'remote', 'LinkedIn', 52, 30, 'applied', 'position_closed'],
  ['Full Stack Developer', 'Redwood Finance', 'rejected', 'high', 'hybrid', 'LinkedIn', 58, 40, 'screening', 'not_enough_experience'],
  ['React Developer', 'Solstice Apps', 'rejected', 'medium', 'remote', 'Company site', 60, 28, 'screening', 'salary_mismatch'],
  ['Backend Developer', 'Granite Networks', 'rejected', 'high', 'onsite', 'Referral', 62, 20, 'interview', 'not_enough_experience'],
  ['Junior Developer', 'Palmetto Group', 'rejected', 'medium', 'hybrid', 'Jobstreet', 68, 24, 'interview', 'position_closed'],
  // withdrawn (2)
  ['Web Developer', 'Driftwood Media', 'withdrawn', 'low', 'onsite', 'Indeed', 44, 32, 'applied', 'other'],
  ['Junior Full Stack Developer', 'Helix Robotics', 'withdrawn', 'medium', 'remote', 'LinkedIn', 56, 26, 'screening', 'took_another_offer'],
  // ghosted (3)
  ['Frontend Developer', 'Opal Software', 'ghosted', 'medium', 'remote', 'LinkedIn', 54, 22, 'applied', 'no_response'],
  ['Junior Backend Developer', 'Fathom Systems', 'ghosted', 'low', 'hybrid', 'Jobstreet', 61, 18, 'applied', 'no_response'],
  ['Software Developer', 'Marigold Tech', 'ghosted', 'low', 'onsite', 'Indeed', 66, 16, 'screening', 'no_response'],
];

// [company, title, hoursFromNow (negative = overdue), origin]
const REMINDERS = [
  ['Kite Analytics', 'Follow up on application', -24, 'auto_followup'],
  ['Meridian Tech', 'Prepare for technical interview', 20, 'manual'],
  ['Summit Digital', 'Negotiate salary', 48, 'manual'],
  ['Evergreen Software', 'Reply to offer', 72, 'manual'],
  ['Harbor Tech', 'Follow up on application', 120, 'auto_followup'],
];

const ago = (days) => knex.raw('DATE_SUB(NOW(), INTERVAL ? DAY)', [days]);
const agoDate = (days) => knex.raw('DATE_SUB(CURDATE(), INTERVAL ? DAY)', [days]);
const inDays = (days) => knex.raw('DATE_ADD(CURDATE(), INTERVAL ? DAY)', [days]);

// [[status, daysAgo], ...] oldest first, ending at `last`.
function buildPath([, , stage, , , , applied, last, from]) {
  if (stage === 'wishlist') return [['wishlist', last]];

  const closed = CLOSED.includes(stage);
  const steps = ORDER.slice(0, ORDER.indexOf(closed ? from : stage) + 1);
  if (closed) steps.push(stage);

  const n = steps.length;
  return steps.map((status, i) => {
    if (i === 0) return [status, applied + 2]; // saved to wishlist first
    if (n === 2) return [status, applied];
    return [status, applied - Math.round(((applied - last) * (i - 1)) / (n - 2))];
  });
}

// Replaces ALL of the demo user's job data with the original set. Refuses non-demo users.
async function resetDemoData(userId) {
  await knex.transaction(async (trx) => {
    const demo = await trx('users').where({ id: userId, is_demo: 1 }).first('id');
    if (!demo) throw new Error('resetDemoData: not a demo user');

    // Notes, history, interviews and job-linked reminders cascade from applications.
    await trx('notifications').where({ user_id: userId }).del();
    await trx('reminders').where({ user_id: userId }).del();
    await trx('applications').where({ user_id: userId }).del();
    await trx('companies').where({ user_id: userId }).del();

    const names = [...new Set(JOBS.map((j) => j[1]))];
    await trx('companies').insert(names.map((name) => ({ user_id: userId, name })));
    const companies = await trx('companies').where({ user_id: userId }).select('id', 'name');
    const companyId = new Map(companies.map((c) => [c.name, c.id]));

    const position = {};
    const appId = new Map();
    const history = [];

    for (const [i, job] of JOBS.entries()) {
      const [title, company, stage, priority, mode, source, applied, last, from, reason] = job;
      const path = buildPath(job);
      const closed = CLOSED.includes(stage);
      const hasOffer = stage === 'offer' || stage === 'accepted';
      const salaryMin = 22000 + (i % 6) * 3000;
      position[stage] = (position[stage] ?? -1) + 1;

      const [id] = await trx('applications').insert({
        user_id: userId,
        company_id: companyId.get(company),
        title,
        source,
        location: mode === 'remote' ? 'Remote' : `${CITIES[i % CITIES.length]}, PH`,
        work_mode: mode,
        employment_type: 'full_time',
        salary_min: salaryMin,
        salary_max: salaryMin + 8000,
        salary_currency: 'PHP',
        salary_period: 'month',
        date_posted: agoDate((applied ?? last) + 3),
        date_applied: applied == null ? null : agoDate(applied),
        deadline: stage === 'wishlist' ? inDays(5 + i * 3) : null,
        status: stage,
        board_position: position[stage],
        priority,
        closed_stage: closed ? from : null,
        closed_reason: closed ? reason ?? null : null,
        closed_at: closed ? ago(last) : null,
        offer_salary: hasOffer ? 38000 : null,
        offer_currency: hasOffer ? 'PHP' : null,
        offer_period: hasOffer ? 'month' : null,
        offer_respond_by: stage === 'offer' ? inDays(5) : null,
        stage_changed_at: ago(last),
        last_activity_at: ago(last),
        created_at: ago(path[0][1]),
        updated_at: ago(last),
      });
      appId.set(company, id);

      path.forEach(([status, days], k) => {
        history.push({
          application_id: id,
          from_status: k === 0 ? null : path[k - 1][0],
          to_status: status,
          changed_at: ago(days),
        });
      });
    }

    await trx('status_history').insert(history);

    await trx('reminders').insert(
      REMINDERS.map(([company, title, hours, origin]) => ({
        user_id: userId,
        application_id: appId.get(company),
        title,
        due_at: knex.raw('DATE_ADD(NOW(), INTERVAL ? HOUR)', [hours]),
        origin,
        status: 'pending',
      }))
    );
  });
}

module.exports = { resetDemoData };