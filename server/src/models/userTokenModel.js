const knex = require('../db/knex');
const { generateToken, hashToken } = require('../utils/tokens');

const VERIFY_TTL_HOURS = 24;
const RESET_TTL_MINUTES = 30;

// Returns the raw token for the email link. Only its hash is stored.
async function createToken(userId, type, expiresAtSql, bindings) {
  const token = generateToken();
  await knex('user_tokens').insert({
    user_id: userId,
    type,
    token_hash: hashToken(token),
    expires_at: knex.raw(expiresAtSql, bindings),
  });
  return token;
}

const createVerifyToken = (userId) =>
  createToken(userId, 'verify_email', 'DATE_ADD(NOW(), INTERVAL ? HOUR)', [VERIFY_TTL_HOURS]);

const createResetToken = (userId) =>
  createToken(userId, 'reset_password', 'DATE_ADD(NOW(), INTERVAL ? MINUTE)', [RESET_TTL_MINUTES]);

// True if a token of this type was created in the last `seconds` (resend cooldown).
async function sentRecently(userId, seconds, type = 'verify_email') {
  const row = await knex('user_tokens')
    .where({ user_id: userId, type })
    .andWhere('created_at', '>', knex.raw('DATE_SUB(NOW(), INTERVAL ? SECOND)', [seconds]))
    .first('id');
  return Boolean(row);
}

// Old links stop working once a new one is sent.
const invalidateTokens = (userId, type) =>
  knex('user_tokens')
    .where({ user_id: userId, type })
    .whereNull('used_at')
    .update({ used_at: knex.fn.now() });

const invalidateVerifyTokens = (userId) => invalidateTokens(userId, 'verify_email');
const invalidateResetTokens = (userId) => invalidateTokens(userId, 'reset_password');

// Finds a token that is unused and not expired, locking its row.
const findValidToken = (trx, token, type) =>
  trx('user_tokens')
    .where({ token_hash: hashToken(token), type })
    .whereNull('used_at')
    .andWhere('expires_at', '>', trx.raw('NOW()'))
    .forUpdate()
    .first('id', 'user_id');

// Consumes the token and verifies the user in one transaction.
// Returns the user id, or null if the token is unknown, used or expired.
async function verifyEmail(token) {
  return knex.transaction(async (trx) => {
    const row = await findValidToken(trx, token, 'verify_email');
    if (!row) return null;

    await trx('user_tokens').where({ id: row.id }).update({ used_at: trx.fn.now() });
    await trx('users')
      .where({ id: row.user_id })
      .whereNull('email_verified_at')
      .update({ email_verified_at: trx.fn.now() });
    return row.user_id;
  });
}

// Consumes a reset token and, in one transaction:
//  - saves the new password hash and clears login lockout
//  - marks the email verified if it wasn't (the link proves mailbox ownership)
//  - revokes every session, so a stolen refresh token stops working
// Returns the user id, or null if the token is unknown, used or expired.
async function resetPassword(token, passwordHash) {
  return knex.transaction(async (trx) => {
    const row = await findValidToken(trx, token, 'reset_password');
    if (!row) return null;

    await trx('user_tokens')
      .where({ user_id: row.user_id, type: 'reset_password' })
      .whereNull('used_at')
      .update({ used_at: trx.fn.now() }); // this token and any other outstanding ones

    await trx('users')
      .where({ id: row.user_id })
      .update({
        password_hash: passwordHash,
        failed_logins: 0,
        locked_until: null,
        email_verified_at: trx.raw('COALESCE(email_verified_at, NOW())'),
        updated_at: trx.fn.now(),
      });

    await trx('sessions')
      .where({ user_id: row.user_id })
      .whereNull('revoked_at')
      .update({ revoked_at: trx.fn.now() });

    return row.user_id;
  });
}

module.exports = {
  createVerifyToken,
  createResetToken,
  sentRecently,
  invalidateVerifyTokens,
  invalidateResetTokens,
  verifyEmail,
  resetPassword,
};