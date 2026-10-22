// Operational error: something we expect can go wrong (bad input, duplicate, not found...).
// The central error handler turns these into JSON responses.
class AppError extends Error {
  constructor(status, code, message, details) {
    super(message || code);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(code, message, details) {
    return new AppError(400, code, message, details);
  }

  static notFound(code = 'not_found', message = 'Resource not found') {
    return new AppError(404, code, message);
  }

  static conflict(code, message) {
    return new AppError(409, code, message);
  }
}

module.exports = AppError;