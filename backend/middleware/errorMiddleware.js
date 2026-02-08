const AppError = require('../utils/appError');

const normalizeDuplicateKeyError = (error) => {
  const duplicateField = Object.keys(error.keyValue || {})[0] || 'field';
  return new AppError(`${duplicateField} already exists`, 409);
};

const normalizeValidationError = (error) => {
  const details = Object.values(error.errors || {})
    .map((item) => item.message)
    .join(', ');
  return new AppError(details || 'Validation failed', 400);
};

const normalizeJwtError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AppError('Invalid authentication token', 401);
  }

  if (error.name === 'TokenExpiredError') {
    return new AppError('Authentication token expired', 401);
  }

  return error;
};

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (error, req, res, next) => {
  let normalizedError = error;

  if (normalizedError.code === 11000) {
    normalizedError = normalizeDuplicateKeyError(normalizedError);
  } else if (normalizedError.name === 'ValidationError') {
    normalizedError = normalizeValidationError(normalizedError);
  } else if (normalizedError.name === 'CastError') {
    normalizedError = new AppError('Invalid resource id', 400);
  } else {
    normalizedError = normalizeJwtError(normalizedError);
  }

  const statusCode = normalizedError.statusCode || 500;
  const message = normalizedError.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(normalizedError);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' ? { stack: normalizedError.stack } : {}),
  });
};

module.exports = {
  notFound,
  errorHandler,
};
