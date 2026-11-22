// Usage (from /server):
//   node src/scripts/seedBulk.js --email=you@example.com --count=10000
//   node src/scripts/seedBulk.js --email=you@example.com --count=10000 --reset   (wipes that user's jobs first)
//
// Generates realistic, internally consistent applications + status_history for ONE user.
// Seeded PRNG: the same --seed gives the same data every run.

const knex = require('../db/knex');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);
const EMAIL = args.email;
const COUNT = Number(args.count || 10000);
const SEED = Number(args.seed || 42);
const RESET = Boolean(args.reset);
const APP_CHUNK = 500;
const HIST_CHUNK = 2000;

// ---------- random helpers ----------
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(SEED);
const int = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
function weighted(entries) {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [v, w] of entries) if ((r -= w) < 0) return v;
  return entries[entries.length - 1][0];
}

// ---------- data pools ----------
const ORDER = ['wishlist', 'applied', 'screening', 'interview', 'offer'];
const CLOSED = ['accepted', 'rejected', 'withdrawn', 'ghosted'];
const CITIES = ['Makati', 'Taguig', 'Quezon City', 'Cebu City', 'Pasig', 'Mandaluyong', 'Davao City'];

const LEVELS = ['Junior', 'Mid-level', 'Senior', ''];
const ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Software Engineer',
  'React Developer', 'Node.js Developer', 'Web Developer', 'Mobile Developer',
  'DevOps Engineer', 'QA Engineer', 'Data Engineer', 'JavaScript Developer',
];
const SOURCES = ['LinkedIn', 'Jobstreet', 'Indeed', 'Company site', 'Referral', 'Kalibrr'];
const REASONS_BY_STAGE = {
  applied: [['no_response', 5], ['position_closed', 3], ['not_enough_experience', 3], ['other', 1]],
  screening: [['not_enough_experience', 4], ['salary_mismatch', 3], ['position_closed', 2], ['took_another_offer', 1]],
  interview: [['not_enough_experience', 4], ['salary_mismatch', 2], ['position_closed', 2], ['took_another_offer', 2]],
  offer: [['salary_mismatch', 3], ['took_another_offer', 4], ['other', 1]],
};
const STAGE_WEIGHTS = [
  ['wishlist', 8], ['applied', 24], ['screening', 8], ['interview', 6], ['offer', 1.5],
  ['accepted', 0.5], ['rejected', 30], ['withdrawn', 5], ['ghosted', 17],
];

const PREFIX = ['Bright', 'North', 'Pixel', 'Cloud', 'Lumen', 'Harbor', 'Kite', 'Orbit', 'Stack', 'Mango', 'Blue', 'Ledger',
  'Tandem', 'Sparrow', 'Vantage', 'Quill', 'Nimbus', 'Atlas', 'Green', 'Pine', 'Meridian', 'Sky', 'Copper', 'Tidal',
  'Iron', 'Ever', 'Summit', 'Lake', 'Titan', 'Crimson', 'Red', 'Solstice', 'Granite', 'Palm', 'Drift', 'Helix', 'Opal', 'Fathom', 'Marigold'];
const SUFFIX = ['line Labs', 'wind Digital', 'forge', 'Systems', 'Studio', 'Tech', 'Analytics', 'Commerce', 'well', 'Apps',
  'peak Solutions', 'ly', 'Works', 'Software', 'Payments', 'field IT', 'Media', 'Interactive', 'Data', 'Health',
  'Logistics', 'Finance', 'Networks', 'Group', 'Robotics', 'Cloud'];

function buildCompanyNames(n) {
  const names = new Set();
  let guard = 0;
  while (names.size < n && guard++ < n * 50) {
    const p = pick(PREFIX);
    const s = pick(SUFFIX);
    const base = s[0] === s[0].toUpperCase() ? `${p} ${s}` : `${p}${s}`;
    names.add(names.size > PREFIX.length * SUFFIX.length * 0.6 ? `${base} ${int(2, 99)}` : base);
  }
  return [...names];
}

// ---------- time helpers (stored in UTC) ----------
const NOW = Date.now();
const pad = (n) => String(n).padStart(2, '0');
function ts(daysAgo) {
  // random time of day so rows don't all share the same clock time
  const d = new Date(NOW - daysAgo * 86400000 - int(0, 86399) * 1000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}
function dateOnly(daysAgo) {
  return ts(daysAgo).slice(0, 10);
}

// [[status, daysAgo], ...] oldest first, ending at `last` (same logic as demoSeed)
function buildPath(stage, applied, last, from) {
  if (stage === 'wishlist') return [['wishlist', last]];
  const closed = CLOSED.includes(stage);
  const steps = ORDER.slice(0, ORDER.indexOf(closed ? from : stage) + 1);
  if (closed) steps.push(stage);
  const n = steps.length;
  return steps.map((status, i) => {
    if (i === 0) return [status, applied + 2];
    if (n === 2) return [status, applied];
    return [status, applied - Math.round(((applied - last) * (i - 1)) / (n - 2))];
  });
}

// ---------- main ----------
async function main() {
  if (!EMAIL) throw new Error('Pass --email=user@example.com');

  const user = await knex('users').where({ email: EMAIL.toLowerCase() }).first('id', 'is_demo');
  if (!user) throw new Error(`User not found: ${EMAIL}`);

  const companyCount = Math.max(50, Math.min(1500, Math.round(COUNT / 8)));
  const names = buildCompanyNames(companyCount);

  await knex.transaction(async (trx) => {
    if (RESET) {
      await trx('notifications').where({ user_id: user.id }).del();
      await trx('reminders').where({ user_id: user.id }).del();
      await trx('applications').where({ user_id: user.id }).del();
    }

    // Companies: insert missing ones, then map name -> id
    for (let i = 0; i < names.length; i += 1000) {
      await trx('companies')
        .insert(names.slice(i, i + 1000).map((name) => ({ user_id: user.id, name })))
        .onConflict(['user_id', 'name'])
        .ignore();
    }
    const rows = await trx('companies').where({ user_id: user.id }).whereIn('name', names).select('id', 'name');
    const companyIds = rows.map((r) => r.id);

    // Continue board_position after whatever is already there
    const maxRows = await trx('applications')
      .where({ user_id: user.id })
      .groupBy('status')
      .select('status')
      .max({ m: 'board_position' });
    const position = Object.fromEntries(maxRows.map((r) => [r.status, r.m]));

    let inserted = 0;
    for (let start = 0; start < COUNT; start += APP_CHUNK) {
      const size = Math.min(APP_CHUNK, COUNT - start);
      const appRows = [];
      const paths = [];

      for (let i = 0; i < size; i++) {
        const stage = weighted(STAGE_WEIGHTS);
        const title = `${pick(LEVELS)} ${pick(ROLES)}`.trim();
        const mode = pick(['remote', 'remote', 'hybrid', 'onsite']);
        const priority = weighted([['low', 3], ['medium', 5], ['high', 2]]);
        const closed = CLOSED.includes(stage);

        // when it was applied / last changed (days ago). last <= applied always.
        let applied = null;
        let last;
        if (stage === 'wishlist') {
          last = int(0, 45);
        } else {
          applied = int(1, 365);
          last = int(0, applied);
        }
        const from = closed
          ? stage === 'accepted' ? 'offer'
            : stage === 'ghosted' ? weighted([['applied', 7], ['screening', 3]])
            : weighted([['applied', 5], ['screening', 3], ['interview', 2], ['offer', 0.3]])
          : null;
        const reason = closed
          ? stage === 'accepted' ? null
            : stage === 'ghosted' ? 'no_response'
            : weighted(REASONS_BY_STAGE[from])
          : null;

        const path = buildPath(stage, applied, last, from);
        const hasOffer = stage === 'offer' || stage === 'accepted' || from === 'offer';
        const salaryMin = 20000 + int(0, 12) * 2500;
        position[stage] = (position[stage] ?? -1) + 1;

        appRows.push({
          user_id: user.id,
          company_id: pick(companyIds),
          title,
          source: pick(SOURCES),
          location: mode === 'remote' ? 'Remote' : `${pick(CITIES)}, PH`,
          work_mode: mode,
          employment_type: 'full_time',
          salary_min: salaryMin,
          salary_max: salaryMin + int(4, 12) * 1000,
          salary_currency: 'PHP',
          salary_period: 'month',
          date_posted: dateOnly((applied ?? last) + int(1, 10)),
          date_applied: applied == null ? null : dateOnly(applied),
          deadline: stage === 'wishlist' ? dateOnly(-int(1, 60)) : null,
          status: stage,
          board_position: position[stage],
          priority,
          closed_stage: closed ? from : null,
          closed_reason: reason,
          closed_at: closed ? ts(last) : null,
          offer_salary: hasOffer ? salaryMin + 12000 : null,
          offer_currency: hasOffer ? 'PHP' : null,
          offer_period: hasOffer ? 'month' : null,
          offer_respond_by: stage === 'offer' ? dateOnly(-int(2, 10)) : null,
          stage_changed_at: ts(last),
          last_activity_at: ts(last),
          created_at: ts(path[0][1]),
          updated_at: ts(last),
        });
        paths.push(path);
      }

      // One multi-row INSERT gets consecutive auto-increment ids starting at the returned one.
      const [firstId] = await trx('applications').insert(appRows);

      const history = [];
      paths.forEach((path, i) => {
        path.forEach(([status, days], k) => {
          history.push({
            application_id: firstId + i,
            from_status: k === 0 ? null : path[k - 1][0],
            to_status: status,
            changed_at: ts(days),
          });
        });
      });
      for (let h = 0; h < history.length; h += HIST_CHUNK) {
        await trx('status_history').insert(history.slice(h, h + HIST_CHUNK));
      }

      inserted += size;
      console.log(`Inserted ${inserted}/${COUNT}`);
    }
  });

  console.log(`Done. Seeded ${COUNT} jobs for ${EMAIL}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => knex.destroy());