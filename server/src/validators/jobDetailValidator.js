const { STAGES, CLOSE_REASONS } = require('../models/jobModel');
const { hashUrl } = require('../utils/urlHash');

const WORK_MODES = ['onsite', 'hybrid', 'remote'];
const EMPLOYMENT = ['full_time', 'part_time', 'contract', 'internship'];
const PERIODS = ['hour', 'month', 'year'];
const PRIORITIES = ['low', 'medium', 'high'];
const OPEN_STAGES = ['wishlist', 'applied', 'screening', 'interview', 'offer'];

const isDate = (x) => {
  if (typeof x !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return false;
  const d = new Date(`${x}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === x;
};

// Each checker returns { value } or { error }.
const text = (max, required = false) => (x) => {
  if (typeof x !== 'string') return { error: 'Invalid value' };
  const s = x.trim();
  if (required && !s) return { error: 'Required' };
  if (s.length > max) return { error: `Max ${max} characters` };
  return { value: s || null };
};
const choice = (list, norm = (s) => s) => (x) => {
  const s = typeof x === 'string' ? norm(x) : x;
  return list.includes(s) ? { value: s } : { error: 'Invalid choice' };
};
const amount = (x) => {
  if (x === null || x === '') return { value: null };
  const n = Number(x);
  return Number.isFinite(n) && n >= 0 && n <= 9999999999 ? { value: n } : { error: 'Invalid amount' };
};
const day = (x) => (x === null || x === '' ? { value: null } : isDate(x) ? { value: x } : { error: 'Use YYYY-MM-DD' });
const currency = (x) =>
  typeof x === 'string' && /^[A-Za-z]{3}$/.test(x) ? { value: x.toUpperCase() } : { error: 'Use a 3-letter code' };
const link = (x) => {
  const r = text(2048)(x);
  if (r.error || !r.value) return r;
  try {
    return ['http:', 'https:'].includes(new URL(r.value).protocol) ? r : { error: 'Enter a valid URL' };
  } catch {
    return { error: 'Enter a valid URL' };
  }
};

// Partial update: only keys present in the body are validated and returned.
// values uses DB column names, plus company / offer / closure sub-objects.
function validateUpdateJob(body) {
  const errors = {};
  const values = {};
  const field = (src, key, out, col, check, errKey = key) => {
    if (src[key] === undefined) return;
    const r = check(src[key]);
    if (r.error) errors[errKey] = r.error;
    else out[col] = r.value;
  };

  field(body, 'title', values, 'title', text(200, true));
  field(body, 'company', values, 'company', text(160, true));
  field(body, 'link', values, 'job_url', link);
  field(body, 'source', values, 'source', text(80));
  field(body, 'referredBy', values, 'referred_by', text(120));
  field(body, 'location', values, 'location', text(160));
  field(body, 'workMode', values, 'work_mode', choice(WORK_MODES));
  field(body, 'employmentType', values, 'employment_type', choice(EMPLOYMENT, (s) => s.replace(/-/g, '_')));
  field(body, 'stage', values, 'status', choice(STAGES));
  field(body, 'priority', values, 'priority', choice(PRIORITIES));
  field(body, 'salaryMin', values, 'salary_min', amount);
  field(body, 'salaryMax', values, 'salary_max', amount);
  field(body, 'currency', values, 'salary_currency', currency);
  field(body, 'salaryPeriod', values, 'salary_period', choice(PERIODS));
  field(body, 'datePosted', values, 'date_posted', day);
  field(body, 'dateApplied', values, 'date_applied', day);
  field(body, 'deadline', values, 'deadline', day);
  field(body, 'description', values, 'description', text(50000));

  if ('job_url' in values) values.url_hash = values.job_url ? hashUrl(values.job_url) : null;
  if (values.salary_min != null && values.salary_max != null && values.salary_max < values.salary_min) {
    errors.salaryMax = 'Maximum salary must be at least the minimum.';
  }

  if (body.offer !== undefined) {
    if (body.offer === null || typeof body.offer !== 'object') errors.offer = 'Invalid offer';
    else {
      const o = {};
      field(body.offer, 'salary', o, 'offer_salary', amount, 'offerSalary');
      field(body.offer, 'currency', o, 'offer_currency', currency, 'offerCurrency');
      field(body.offer, 'period', o, 'offer_period', choice(PERIODS), 'offerPeriod');
      field(body.offer, 'replyBy', o, 'offer_respond_by', day, 'offerReplyBy');
      field(body.offer, 'notes', o, 'offer_notes', text(5000), 'offerNotes');
      values.offer = o;
    }
  }

  if (body.closure !== undefined) {
    if (body.closure === null || typeof body.closure !== 'object') errors.closure = 'Invalid closure';
    else {
      const c = {};
      field(body.closure, 'reason', c, 'closed_reason', choice(CLOSE_REASONS), 'closeReason');
      field(body.closure, 'previousStage', c, 'closed_stage', choice(OPEN_STAGES), 'previousStage');
      field(body.closure, 'closedDate', c, 'closedDate', day, 'closedDate');
      field(body.closure, 'note', c, 'closing_note', text(1000), 'closureNote');
      values.closure = c;
    }
  }

  return { errors, values };
}

module.exports = { validateUpdateJob };