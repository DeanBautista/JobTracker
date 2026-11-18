const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const oauthModel = require('../models/oauthModel');
const { startSession } = require('./authController');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const DEMO_EMAIL = (process.env.DEMO_EMAIL || 'demo.account@gmail.com').toLowerCase();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const b64url = (buf) => buf.toString('base64url');
const fail = (res, code) => res.redirect(`${CLIENT_URL}/login?error=${code}`);

// Same path as the refresh cookie, so /auth/*/callback receives it.
const tmpCookieName = (provider) => `oauth_${provider}`;
const tmpCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/auth',
};

const postForm = (url, body) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams(body),
  });

const PROVIDERS = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    redirectUri: () => process.env.GOOGLE_REDIRECT_URI,
    scope: 'openid email profile',
    extraParams: { response_type: 'code' },

    async fetchProfile(code, verifier) {
      const r = await postForm('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
        code_verifier: verifier,
      });
      const tokens = await r.json();
      if (!r.ok) throw new Error(`Google token exchange failed: ${JSON.stringify(tokens)}`);

      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const p = ticket.getPayload();
      return {
        providerUserId: p.sub,
        email: p.email,
        emailVerified: p.email_verified === true,
        name: p.name,
        avatarUrl: p.picture,
      };
    },
  },

  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    clientId: () => process.env.GITHUB_CLIENT_ID,
    redirectUri: () => process.env.GITHUB_REDIRECT_URI,
    scope: 'read:user user:email',
    extraParams: {},

    async fetchProfile(code, verifier) {
      const r = await postForm('https://github.com/login/oauth/access_token', {
        code,
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
        code_verifier: verifier,
      });
      const tokens = await r.json();
      if (!r.ok || tokens.error) {
        throw new Error(`GitHub token exchange failed: ${JSON.stringify(tokens)}`);
      }

      const headers = {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'job-tracker',
      };
      const userRes = await fetch('https://api.github.com/user', { headers });
      if (!userRes.ok) throw new Error('GitHub /user failed');
      const user = await userRes.json();

      // /user.email is null when the user hides it, so read the email list.
      const emailsRes = await fetch('https://api.github.com/user/emails', { headers });
      const emails = emailsRes.ok ? await emailsRes.json() : [];
      const primary = Array.isArray(emails) && emails.find((e) => e.primary && e.verified);

      return {
        providerUserId: String(user.id),
        email: primary?.email,
        emailVerified: Boolean(primary),
        name: user.name || user.login,
        avatarUrl: user.avatar_url,
      };
    },
  },
};

// GET /auth/:provider
const start = (provider) => (req, res) => {
  const cfg = PROVIDERS[provider];
  const verifier = b64url(crypto.randomBytes(32));
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());
  const state = b64url(crypto.randomBytes(16));

  res.cookie(tmpCookieName(provider), JSON.stringify({ verifier, state }), {
    ...tmpCookieOptions,
    maxAge: 10 * 60 * 1000,
  });

  const params = new URLSearchParams({
    client_id: cfg.clientId(),
    redirect_uri: cfg.redirectUri(),
    scope: cfg.scope,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    ...cfg.extraParams,
  });
  res.redirect(`${cfg.authUrl}?${params}`);
};

// GET /auth/:provider/callback
const callback = (provider) => async (req, res) => {
  const { code, state, error } = req.query;
  const raw = req.cookies?.[tmpCookieName(provider)];
  res.clearCookie(tmpCookieName(provider), tmpCookieOptions);

  if (error) return fail(res, 'oauth_denied'); // user clicked Cancel

  let tmp = null;
  try {
    tmp = JSON.parse(raw);
  } catch {
    /* missing or malformed cookie */
  }
  if (!tmp || typeof code !== 'string' || typeof state !== 'string' || state !== tmp.state) {
    return fail(res, 'oauth_failed');
  }

  try {
    const profile = await PROVIDERS[provider].fetchProfile(code, tmp.verifier);
    if (!profile.email || !profile.emailVerified) return fail(res, 'oauth_email_unverified');
    if (profile.email.toLowerCase() === DEMO_EMAIL) return fail(res, 'demo_restricted');

    const userId = await oauthModel.findOrCreateUser(provider, profile);
    await startSession(req, res, userId);
    res.redirect(`${CLIENT_URL}/dashboard`);
  } catch (err) {
    console.error(`OAuth ${provider} callback failed:`, err);
    fail(res, 'oauth_failed');
  }
};

module.exports = {
  googleStart: start('google'),
  googleCallback: callback('google'),
  githubStart: start('github'),
  githubCallback: callback('github'),
};