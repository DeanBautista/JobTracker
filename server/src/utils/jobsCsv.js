const { toCsv } = require('./csv');

const STAGES = {
  wishlist: 'Wishlist', applied: 'Applied', screening: 'Screening', interview: 'Interview',
  offer: 'Offer', accepted: 'Accepted', rejected: 'Rejected', withdrawn: 'Withdrawn', ghosted: 'Ghosted',
};
const PRIORITIES = { low: 'Low', medium: 'Medium', high: 'High' };
const MODES = { onsite: 'Onsite', hybrid: 'Hybrid', remote: 'Remote' };
const TYPES = { full_time: 'Full time', part_time: 'Part time', contract: 'Contract', internship: 'Internship' };
const PERIODS = { hour: 'Per hour', month: 'Per month', year: 'Per year' };
const REASONS = {
  not_enough_experience: 'Not enough experience', position_closed: 'Position closed',
  salary_mismatch: 'Salary mismatch', took_another_offer: 'Took another offer',
  no_response: 'No response', other: 'Other',
};

const label = (map, key) => (key == null ? '' : map[key] ?? key);
const amount = (v) => (v == null ? '' : Number(v)); // DECIMAL arrives as "50000.00"

const COLUMNS = [
  { header: 'Title', value: (r) => r.title },
  { header: 'Company', value: (r) => r.company },
  { header: 'Stage', value: (r) => label(STAGES, r.status) },
  { header: 'Priority', value: (r) => label(PRIORITIES, r.priority) },
  { header: 'Work mode', value: (r) => label(MODES, r.work_mode) },
  { header: 'Employment type', value: (r) => label(TYPES, r.employment_type) },
  { header: 'Location', value: (r) => r.location },
  { header: 'Source', value: (r) => r.source },
  { header: 'Referred by', value: (r) => r.referred_by },
  { header: 'Job URL', value: (r) => r.job_url },
  { header: 'Salary min', value: (r) => amount(r.salary_min) },
  { header: 'Salary max', value: (r) => amount(r.salary_max) },
  { header: 'Currency', value: (r) => r.salary_currency },
  { header: 'Pay period', value: (r) => label(PERIODS, r.salary_period) },
  { header: 'Date posted', value: (r) => r.date_posted },
  { header: 'Date applied', value: (r) => r.date_applied },
  { header: 'Deadline', value: (r) => r.deadline },
  { header: 'Days in stage', value: (r) => Number(r.days_in_stage) },
  { header: 'Close reason', value: (r) => label(REASONS, r.closed_reason) },
  { header: 'Closing note', value: (r) => r.closing_note },
  { header: 'Archived', value: (r) => (r.archived ? 'Yes' : 'No') },
  { header: 'Added', value: (r) => r.added },
];

const jobsToCsv = (rows) => toCsv(COLUMNS, rows);

module.exports = { jobsToCsv };