const bcrypt = require('bcryptjs');
const knex = require('../db/knex');
const AppError = require('../utils/AppError');

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

// Columns that are safe to send to clients. password_hash, failed_logins and
// locked_until are intentionally left out.
// Qualified with the table name because user_settings is joined in.
const SAFE_COLUMNS = [
  'users.id',
  'users.name',
  'users.email',
  'users.email_verified_at',
  'users.avatar_url',
  'users.target_role',
  'users.home_location',
  'users.is_demo',
  'users.created_at',
  'users.updated_at',
  'user_settings.onboarded_at',
];

const hashPassword = (password) => bcrypt.hash(password, BCRYPT_ROUNDS);

const optionalText = (v) =>
  typeof v === 'string' && v.trim() !== '' ? v.trim() : null;

// users LEFT JOIN user_settings, so a user without a settings row still loads
// (onboarded_at comes back null).
const usersWithSettings = () =>
  knex('users').leftJoin('user_settings', 'user_settings.user_id', 'users.id');

async function findById(id) {
  return usersWithSettings().select(SAFE_COLUMNS).where({ 'users.id': id }).first();
}

async function findByEmail(email) {
  return usersWithSettings()
    .select(SAFE_COLUMNS)
    .where({ 'users.email': email.trim().toLowerCase() })
    .first();
}

// Login only. Includes password_hash and lock flags. Never send the result to clients.
async function findAuthByEmail(email) {
  return usersWithSettings()
    .select([
      ...SAFE_COLUMNS,
      'users.password_hash',
      knex.raw('(users.locked_until IS NOT NULL AND users.locked_until > NOW()) AS is_locked'),
      knex.raw('(users.locked_until IS NOT NULL AND users.locked_until <= NOW()) AS lock_expired'),
    ])
    .where({ 'users.email': email.trim().toLowerCase() })
    .first();
}

// Expects input that has already been validated.
// Returns the new user (safe columns only).
async function create({
  name,
  email,
  password,
  avatar_url,
  target_role,
  home_location,
}) {
  const password_hash = await hashPassword(password);
  const now = knex.fn.now();

  let id;
  try {
    id = await knex.transaction(async (trx) => {
      const [userId] = await trx('users').insert({
        name: name.trim(),
        email: email.trim().toLowerCase(), // emails are stored lowercase
        password_hash,
        email_verified_at: null,
        avatar_url: optionalText(avatar_url),
        target_role: optionalText(target_role),
        home_location: optionalText(home_location),
        is_demo: false,
        failed_logins: 0,
        locked_until: null,
        created_at: now,
        updated_at: now,
      });

      // Only user_id is required since the other columns have default values.
      await trx('user_settings').insert({ user_id: userId });

      return userId;
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw AppError.conflict('email_taken', 'That email is already registered');
    }
    throw err; // anything else goes to the central handler as a 500
  }

  return findById(id);
}

// Idempotent: calling it twice keeps the original onboarded_at.
// The insert-ignore covers accounts that have no settings row (e.g. OAuth
// sign-ups), which would otherwise update 0 rows and loop back to /onboarding.
async function completeOnboarding(id) {
  await knex('user_settings').insert({ user_id: id }).onConflict('user_id').ignore();
  await knex('user_settings')
    .where({ user_id: id })
    .whereNull('onboarded_at')
    .update({ onboarded_at: knex.fn.now() });
  return findById(id);
}

async function recordFailedLogin(id) {
  // Key order matters: MySQL evaluates SET left to right, so locked_until
  // must come first to see the OLD failed_logins value.
  await knex('users')
    .where({ id })
    .update({
      locked_until: knex.raw(
        'CASE WHEN failed_logins + 1 >= ? THEN DATE_ADD(NOW(), INTERVAL ? MINUTE) ELSE locked_until END',
        [MAX_FAILED_LOGINS, LOCK_MINUTES]
      ),
      failed_logins: knex.raw('failed_logins + 1'),
    });
}

async function clearFailedLogins(id) {
  await knex('users').where({ id }).update({ failed_logins: 0, locked_until: null });
}

module.exports = {
  SAFE_COLUMNS,
  findById,
  findByEmail,
  findAuthByEmail,
  create,
  completeOnboarding,
  recordFailedLogin,
  clearFailedLogins,
  hashPassword,
};