const AppError = require('../utils/AppError');
const userModel = require('../models/userModel');
const { verifyAccessToken } = require('../utils/tokens');

function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw AppError.unauthorized();

  try {
    req.userId = Number(verifyAccessToken(token).sub);
  } catch {
    throw AppError.unauthorized('invalid_token', 'Invalid or expired token');
  }
  next();
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