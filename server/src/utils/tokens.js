const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_TTL = '15m';
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const signAccessToken = (userId) =>
  jwt.sign({ sub: String(userId) }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TTL,
    algorithm: 'HS256',
  });

const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, { algorithms: ['HS256'] });

const generateRefreshToken = () => crypto.randomBytes(48).toString('hex');
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// token for email verification
const generateToken = () => crypto.randomBytes(32).toString('hex');

module.exports = {
  REFRESH_TTL_MS, signAccessToken, verifyAccessToken, generateRefreshToken, generateToken, hashToken,
};