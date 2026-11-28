const ROUND_TYPES = ['phone_screen', 'technical', 'behavioral', 'panel', 'take_home', 'onsite', 'final'];
const MODES = ['video', 'phone', 'onsite'];
// Client value -> DB value
const OUTCOME_IN = { passed: 'passed', pending: 'waiting', failed: 'not_passed', cancelled: 'cancelled' };

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?Z$/;

const isZone = (tz) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

const optionalText = (x, max) => {
  if (x === undefined || x === null) return { value: null };
  if (typeof x !== 'string') return { error: 'Invalid value' };
  const s = x.trim();
  if (s.length > max) return { error: `Max ${max} characters` };
  return { value: s || null };
};

function validateInterview(body) {
  const errors = {};
  const values = {};
  const set = (key, col, r) => {
    if (r.error) errors[key] = r.error;
    else values[col] = r.value;
  };

  set('type', 'round_type', ROUND_TYPES.includes(body.type) ? { value: body.type } : { error: 'Choose a round type' });

  let at = null;
  if (typeof body.startsAt === 'string' && ISO_UTC.test(body.startsAt)) {
    const d = new Date(body.startsAt);
    const year = d.getUTCFullYear();
    if (!Number.isNaN(d.getTime()) && year >= 2000 && year <= 2100) at = d.toISOString().slice(0, 19).replace('T', ' ');
  }
  set('startsAt', 'scheduled_at', at ? { value: at } : { error: 'Enter a valid date and time' });

  const dur = Number(body.durationMin);
  set('durationMin', 'duration_min', Number.isInteger(dur) && dur >= 5 && dur <= 720 ? { value: dur } : { error: 'Invalid duration' });

  set('timezone', 'timezone', typeof body.timezone === 'string' && isZone(body.timezone) ? { value: body.timezone } : { error: 'Invalid timezone' });
  set('mode', 'mode', MODES.includes(body.mode) ? { value: body.mode } : { error: 'Choose a mode' });
  set('location', 'link_or_address', optionalText(body.location, 500));
  set('prepNotes', 'prep_notes', optionalText(body.prepNotes, 3000));

  return { errors, values };
}

function validateResult(body) {
  const errors = {};
  const values = {};

  if (typeof body.outcome === 'string' && Object.hasOwn(OUTCOME_IN, body.outcome)) values.outcome = OUTCOME_IN[body.outcome];
  else errors.outcome = 'Choose an outcome';

  const feedback = typeof body.feedback === 'string' ? body.feedback.trim() : '';
  if (!feedback || feedback.length > 4000) errors.feedback = 'Enter feedback up to 4000 characters';
  else values.feedback = feedback;

  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = 'Rate the round from 1 to 5';
  else values.rating = rating;

  return { errors, values };
}

module.exports = { validateInterview, validateResult };