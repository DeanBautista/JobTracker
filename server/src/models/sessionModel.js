const knex = require('../db/knex');

const create = ({ userId, tokenHash, expiresAt, deviceLabel }) =>
  knex('sessions').insert({
    user_id: userId,
    refresh_token_hash: tokenHash,
    device_label: deviceLabel || null,
    last_used_at: knex.fn.now(),
    expires_at: expiresAt,
  });

const findByHash = (hash) =>
  knex('sessions').where({ refresh_token_hash: hash }).first();

// Swaps the hash in place. Returns affected rows: 0 means another request
// already rotated this session, or it was revoked.
const rotate = ({ id, oldHash, newHash, expiresAt }) =>
  knex('sessions')
    .where({ id, refresh_token_hash: oldHash })
    .whereNull('revoked_at')
    .update({
      refresh_token_hash: newHash,
      last_used_at: knex.fn.now(),
      expires_at: expiresAt,
    });

const revoke = (id) =>
  knex('sessions')
    .where({ id })
    .whereNull('revoked_at')
    .update({ revoked_at: knex.fn.now() });

module.exports = { create, findByHash, rotate, revoke };