const AppError = require('../utils/AppError');

// Runs when no route matched.
function notFound(req, res, next) {
  next(AppError.notFound('route_not_found', `${req.method} ${req.path} not found`));
}

// Single place where every error becomes a response.
// Must keep all four params so Express treats it as an error handler.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Malformed JSON body (thrown by express.json())
  if (err.type === 'entity.parse.failed') {
    err = AppError.badRequest('invalid_json', 'Request body is not valid JSON');
  }

  // Fallback for duplicate keys that a controller didn't translate itself
  if (err.code === 'ER_DUP_ENTRY') {
    err = AppError.conflict('duplicate_entry', 'A record with that value already exists');
  }

  if (err instanceof AppError) {
    const body = { error: err.code, message: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.status).json(body);
  }

  // Unexpected error
  console.error(err);
  return res.status(500).json({
    error: 'internal_error',
    message: 'Something went wrong',
  });
}

module.exports = { notFound, errorHandler };