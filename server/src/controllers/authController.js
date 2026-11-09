const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const userModel = require('../models/userModel');
const sessionModel = require('../models/sessionModel');
const {
  validateLogin,
  validateForgotPassword,
  validateNewPassword,
} = require('../validators/userValidator');
const {
  REFRESH_TTL_MS,
  signAccessToken,
  generateRefreshToken,
  hashToken,
} = require('../utils/tokens');
const userTokenModel = require('../models/userTokenModel');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/mailer');

const RESEND_COOLDOWN_SECONDS = 60;

const COOKIE_NAME = 'refresh_token';
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax', // fine for localhost:5173 -> localhost:5000. Cross-site prod needs 'none' + secure
  path: '/auth', // cookie is only sent to /auth/*
};

// Compared against when the email doesn't exist, so response time doesn't reveal it
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

const setRefreshCookie = (res, token) =>
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: REFRESH_TTL_MS });

async function startSession(req, res, userId) {
  const refreshToken = generateRefreshToken();
  await sessionModel.create({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    deviceLabel: (req.get('user-agent') || '').slice(0, 120),
  });
  setRefreshCookie(res, refreshToken);
  return signAccessToken(userId);
}

// POST /auth/login
const login = async (req, res) => {
  const body = req.body || {};
  validateLogin(body);

  const user = await userModel.findAuthByEmail(body.email);
  if (user?.is_locked) throw AppError.tooManyRequests();
  if (user?.lock_expired) await userModel.clearFailedLogins(user.id);

  const ok = await bcrypt.compare(body.password, user?.password_hash || DUMMY_HASH);
  // password_hash is NULL for Google/GitHub-only accounts, so check it explicitly
  if (!user || !user.password_hash || !ok) {
    if (user) await userModel.recordFailedLogin(user.id);
    throw AppError.unauthorized('invalid_credentials', 'Invalid email or password');
  }

  await userModel.clearFailedLogins(user.id);

  if (!user.email_verified_at) {
    throw AppError.forbidden('email_not_verified', 'Please verify your email before signing in');
  }

  const accessToken = await startSession(req, res, user.id);
  res.json({ accessToken, user: await userModel.findById(user.id) });
};

// POST /auth/refresh
const refresh = async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw AppError.unauthorized('no_refresh_token');

  const hash = hashToken(token);
  const session = await sessionModel.findByHash(hash);

   if (!session) {
    throw AppError.unauthorized('invalid_refresh_token');
    }
  if (session.revoked_at || new Date(session.expires_at) < new Date()) {
    res.clearCookie(COOKIE_NAME, cookieOptions);
    throw AppError.unauthorized('session_expired');
  }

  const user = await userModel.findById(session.user_id);
  if (!user) throw AppError.unauthorized('invalid_refresh_token');

  const newToken = generateRefreshToken();
  const rotated = await sessionModel.rotate({
    id: session.id,
    oldHash: hash,
    newHash: hashToken(newToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });
  if (!rotated) throw AppError.unauthorized('invalid_refresh_token'); // lost a race

  setRefreshCookie(res, newToken);
  res.json({ accessToken: signAccessToken(user.id), user });
};

// POST /auth/logout
const logout = async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    const session = await sessionModel.findByHash(hashToken(token));
    if (session) await sessionModel.revoke(session.id);
  }
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.status(204).end();
};

// GET /auth/me (protected)
const me = async (req, res) => {
  const user = await userModel.findById(req.userId);
  if (!user) throw AppError.unauthorized('invalid_token');
  res.json(user);
};

// POST /auth/verify-email  { token }
const verifyEmail = async (req, res) => {
  const token = req.body?.token;
  if (typeof token !== 'string' || !token) {
    throw AppError.badRequest('invalid_token', 'This link no longer works');
  }

  const userId = await userTokenModel.verifyEmail(token);
  if (!userId) throw AppError.badRequest('invalid_token', 'This link no longer works');

  const accessToken = await startSession(req, res, userId);
  res.json({ accessToken, user: await userModel.findById(userId) });
};

// POST /auth/resend-verification  { email }
// Always answers 204 so it can't be used to find out which emails are registered.
const resendVerification = async (req, res) => {
  const email = req.body?.email;
  if (typeof email !== 'string' || !email.trim()) {
    throw AppError.badRequest('invalid_email', 'Email is required');
  }

  const user = await userModel.findByEmail(email);
  if (
    user &&
    !user.email_verified_at &&
    !(await userTokenModel.sentRecently(user.id, RESEND_COOLDOWN_SECONDS))
  ) {
    await userTokenModel.invalidateVerifyTokens(user.id);
    const token = await userTokenModel.createVerifyToken(user.id);
    await sendVerificationEmail({ to: user.email, name: user.name, token });
  }
  res.status(204).end();
};

// POST /auth/forgot-password  { email }
// Always answers 204, so it can't be used to find out which emails are registered.
const forgotPassword = async (req, res) => {
  const body = req.body || {};
  validateForgotPassword(body);

  const user = await userModel.findByEmail(body.email);
  if (user && !(await userTokenModel.sentRecently(user.id, RESEND_COOLDOWN_SECONDS, 'reset_password'))) {
    try {
      await userTokenModel.invalidateResetTokens(user.id);
      const token = await userTokenModel.createResetToken(user.id);
      await sendPasswordResetEmail({ to: user.email, name: user.name, token });
    } catch (err) {
      // Logged, not returned: an error here would reveal that the account exists.
      console.error('Failed to send password reset email:', err);
    }
  }
  res.status(204).end();
};

// POST /auth/reset-password  { token, password }
const resetPassword = async (req, res) => {
  const { token, password } = req.body || {};
  if (typeof token !== 'string' || !token) {
    throw AppError.badRequest('invalid_token', 'This link no longer works');
  }
  validateNewPassword({ password }); // a weak password doesn't use up the token

  const passwordHash = await userModel.hashPassword(password);
  const userId = await userTokenModel.resetPassword(token, passwordHash);
  if (!userId) throw AppError.badRequest('invalid_token', 'This link no longer works');

  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.status(204).end();
};

module.exports = {
  login, refresh, logout, me, verifyEmail, resendVerification, forgotPassword, resetPassword,
};
