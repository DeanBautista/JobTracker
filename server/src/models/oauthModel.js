const knex = require('../db/knex');

// Returns the user id to sign in. Everything runs in one transaction.
async function findOrCreateUser(provider, profile) {
  const email = profile.email.trim().toLowerCase();

  return knex.transaction(async (trx) => {
    // 1. Known provider identity: sign that user in.
    const linked = await trx('oauth_accounts')
      .where({ provider, provider_user_id: profile.providerUserId })
      .first('user_id');
    if (linked) return linked.user_id;

    // 2. Same email: link to the existing account. Otherwise create one.
    const existing = await trx('users')
      .where({ email })
      .forUpdate()
      .first('id', 'email_verified_at');

    let userId;
    if (existing) {
      userId = existing.id;
      if (!existing.email_verified_at) {
        // Someone may have registered this email with a password they know.
        // The provider proved mailbox ownership, so drop that password.
        await trx('users').where({ id: userId }).update({
          password_hash: null,
          email_verified_at: trx.fn.now(),
          updated_at: trx.fn.now(),
        });
      }
    } else {
      [userId] = await trx('users').insert({
        name: (profile.name || email.split('@')[0]).trim().slice(0, 120),
        email,
        password_hash: null,
        email_verified_at: trx.fn.now(),
        avatar_url: profile.avatarUrl ? profile.avatarUrl.slice(0, 500) : null,
      });
      await trx('user_settings').insert({ user_id: userId });
    }

    await trx('oauth_accounts').insert({
      user_id: userId,
      provider,
      provider_user_id: profile.providerUserId,
      email,
    });
    return userId;
  });
}

module.exports = { findOrCreateUser };