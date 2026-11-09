const knex = require('../db/knex');
const { generateToken, hashToken } = require('../utils/tokens');

const VERIFY_TTL_HOURS = 24;

// Returns the raw token for the email link. Only its hash is stored.
async function createVerifyToken(userId) {
  const token = generateToken();
  await knex('user_tokens').insert({
    user_id: userId,
    type: 'verify_email',
    token_hash: hashToken(token),
    expires_at: knex.raw('DATE_ADD(NOW(), INTERVAL ? HOUR)', [VERIFY_TTL_HOURS]),
  });
  return token;
}

// True if a verify token was created in the last `seconds` (resend cooldown).
async function sentRecently(userId, seconds) {
  const row = await knex('user_tokens')
    .where({ user_id: userId, type: 'verify_email' })
    .andWhere('created_at', '>', knex.raw('DATE_SUB(NOW(), INTERVAL ? SECOND)', [seconds]))
    .first('id');
  return Boolean(row);
}

// Old links stop working once a new one is sent.
async function invalidateVerifyTokens(userId) {
  await knex('user_tokens')
    .where({ user_id: userId, type: 'verify_email' })
    .whereNull('used_at')
    .update({ used_at: knex.fn.now() });
}

// Consumes the token and verifies the user in one transaction.
// Returns the user id, or null if the token is unknown, used or expired.
async function verifyEmail(token) {
  return knex.transaction(async (trx) => {
    const row = await trx('user_tokens')
      .where({ token_hash: hashToken(token), type: 'verify_email' })
      .whereNull('used_at')
      .andWhere('expires_at', '>', trx.raw('NOW()'))
      .forUpdate()
      .first('id', 'user_id');
    if (!row) return null;

    await trx('user_tokens').where({ id: row.id }).update({ used_at: trx.fn.now() });
    await trx('users')
      .where({ id: row.user_id })
      .whereNull('email_verified_at')
      .update({ email_verified_at: trx.fn.now() });
    return row.user_id;
  });
}

module.exports = { createVerifyToken, sentRecently, invalidateVerifyTokens, verifyEmail };