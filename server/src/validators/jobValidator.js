const STATUSES = ['wishlist', 'applied', 'screening', 'interview', 'offer', 'accepted', 'rejected', 'withdrawn', 'ghosted'];
const WORK_MODES = ['onsite', 'hybrid', 'remote'];
const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'internship'];
const PERIODS = ['hour', 'month', 'year'];
const PRIORITIES = ['low', 'medium', 'high'];

const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const isBlank = (v) => v === undefined || v === null || v === '';

const isHttpUrl = (value) => {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

// Returns { errors, values }. values is cleaned and ready for the model.
function validateCreateJob(body) {
  const errors = {};

  const title = text(body.title);
  const company = text(body.company);
  const link = text(body.link);

  if (!title) errors.title = 'Enter a job title.';
  else if (title.length > 200) errors.title = 'Keep the title under 200 characters.';

  if (!company) errors.company = 'Enter a company.';
  else if (company.length > 160) errors.company = 'Keep the company under 160 characters.';

  if (link && (link.length > 2048 || !isHttpUrl(link))) {
    errors.link = 'Enter a valid URL including https://.';
  }

  const status = body.stage || 'wishlist';
  if (!STATUSES.includes(status)) errors.stage = 'Choose a valid stage.';

  const pick = (key, allowed, fallback = null) => {
    const v = body[key];
    if (isBlank(v)) return fallback;
    if (!allowed.includes(v)) {
      errors[key] = 'Choose a valid option.';
      return null;
    }
    return v;
  };

  const workMode = pick('workMode', WORK_MODES);
  const employmentType = pick('employmentType', EMPLOYMENT_TYPES);
  const salaryPeriod = pick('salaryPeriod', PERIODS);
  const priority = pick('priority', PRIORITIES, 'medium');

  let currency = text(body.currency);
  if (currency && !/^[A-Za-z]{3}$/.test(currency)) {
    errors.currency = 'Use a 3-letter code, like PHP.';
  }
  currency = currency ? currency.toUpperCase() : null;

  const money = (key) => {
    if (isBlank(body[key])) return null;
    const n = Number(body[key]);
    if (!Number.isFinite(n) || n < 0) {
      errors[key] = 'Enter a non-negative amount.';
      return null;
    }
    return n;
  };
  const salaryMin = money('salaryMin');
  const salaryMax = money('salaryMax');
  if (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin) {
    errors.salaryMax = 'Max salary must be at least min salary.';
  }

  const date = (key) => {
    if (isBlank(body[key])) return null;
    if (!isDate(body[key])) {
      errors[key] = 'Enter a valid date.';
      return null;
    }
    return body[key];
  };

  const description = text(body.description);
  if (description && description.length > 20000) {
    errors.description = 'Keep the description under 20,000 characters.';
  }

  const limited = (key, max) => {
    const v = text(body[key]);
    if (v && v.length > max) errors[key] = `Keep this under ${max} characters.`;
    return v;
  };

  const values = {
    title,
    company,
    link,
    status,
    priority,
    source: limited('source', 80),
    referredBy: limited('referredBy', 120),
    location: limited('location', 160),
    workMode,
    employmentType,
    salaryMin,
    salaryMax,
    currency,
    salaryPeriod,
    datePosted: date('datePosted'),
    dateApplied: date('dateApplied'),
    deadline: date('deadline'),
    description,
  };

  return { errors, values };
}

module.exports = { validateCreateJob };