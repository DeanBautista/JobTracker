const AppError = require('../utils/AppError');
const userModel = require('../models/userModel');
const { verifyAccessToken } = require('../utils/tokens');
const sessionModel = require('../models/sessionModel');

async function requireAuth(req, res, next) {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) throw AppError.unauthorized();

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw AppError.unauthorized('invalid_token', 'Invalid or expired token');
    }

    const userId = Number(payload.sub);
    if (!payload.sid || !(await sessionModel.isActive(payload.sid, userId))) {
      throw AppError.unauthorized('session_revoked', 'Session is no longer active');
    }

    req.userId = userId;
    req.sessionId = payload.sid;
    next();
  } catch (err) {
    next(err);
  }
}

  async function blockDemo(req, res, next) {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) return next(AppError.unauthorized('invalid_token'));
    if (user.is_demo) {
      return next(AppError.forbidden('demo_restricted', 'Not available on the demo account'));
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth, blockDemo };