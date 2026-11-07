const AppError = require('../utils/AppError');

const notFound = (req, res, next) => {
  next(AppError.notFound('route_not_found', 'Route not found'));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      fields: err.details, // omitted from the JSON when undefined
    });
  }

  // Malformed JSON body from express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      code: 'invalid_json',
      message: 'Request body is not valid JSON',
    });
  }

  console.error(err); // the real cause stays in the server terminal
  res.status(500).json({ code: 'internal_error', message: 'Something went wrong' });
};

module.exports = { notFound, errorHandler };