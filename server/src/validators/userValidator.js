const AppError = require('../utils/AppError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Reusable rules (login, password reset, profile update can share these)
const isValidEmail = (email) =>
  typeof email === 'string' && EMAIL_RE.test(email.trim());

function passwordError(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return 'password must be at least 8 characters';
  }
  // bcrypt silently ignores anything past 72 bytes
  if (Buffer.byteLength(password) > 72) {
    return 'password must be at most 72 bytes';
  }
  return null;
}

// Throws AppError(400) with per-field details if the input is invalid.
function validateCreateUser({ name, email, password } = {}) {
  const errors = {};

  if (typeof name !== 'string' || !name.trim()) {
    errors.name = 'name is required';
  }
  if (!isValidEmail(email)) {
    errors.email = 'a valid email is required';
  }
  const pwError = passwordError(password);
  if (pwError) {
    errors.password = pwError;
  }

  if (Object.keys(errors).length) {
    throw AppError.badRequest('validation_failed', 'Invalid input', errors);
  }
}

module.exports = { validateCreateUser, isValidEmail, passwordError };