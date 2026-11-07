const AppError = require('../utils/AppError');
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

module.exports = { requireAuth };