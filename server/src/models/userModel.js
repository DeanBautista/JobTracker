const bcrypt = require('bcryptjs');
const knex = require('../db/knex');
const AppError = require('../utils/AppError');

const BCRYPT_ROUNDS = 12;

// Columns that are safe to send to clients. password_hash, failed_logins and
// locked_until are intentionally left out.
const SAFE_COLUMNS = [
  'id',
  'name',
  'email',
  'email_verified_at',
  'avatar_url',
  'target_role',
  'home_location',
  'is_demo',
  'created_at',
  'updated_at',
];

const optionalText = (v) =>
  typeof v === 'string' && v.trim() !== '' ? v.trim() : null;

async function findById(id) {
  return knex('users').select(SAFE_COLUMNS).where({ id }).first();
}

async function findByEmail(email) {
  return knex('users')
    .select(SAFE_COLUMNS)
    .where({ email: email.trim().toLowerCase() })
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
  const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const now = knex.fn.now();

  let id;
  try {
    [id] = await knex('users').insert({
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
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw AppError.conflict('email_taken', 'That email is already registered');
    }
    throw err; // anything else goes to the central handler as a 500
  }

  return findById(id);
}

module.exports = { SAFE_COLUMNS, findById, findByEmail, create };