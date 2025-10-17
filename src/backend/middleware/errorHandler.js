/**
 * Global Error Handler Middleware
 * Centralized error handling for the referral system
 */

const { logger } = require('../config/logger');

/**
 * Custom error class for API errors
 */
class APIError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error types
 */
const ErrorTypes = {
  VALIDATION_ERROR: 'ValidationError',
  AUTHENTICATION_ERROR: 'AuthenticationError',
  AUTHORIZATION_ERROR: 'AuthorizationError',
  NOT_FOUND_ERROR: 'NotFoundError',
  CONFLICT_ERROR: 'ConflictError',
  RATE_LIMIT_ERROR: 'RateLimitError',
  DATABASE_ERROR: 'DatabaseError',
  BLOCKCHAIN_ERROR: 'BlockchainError',
  INTERNAL_ERROR: 'InternalError'
};

/**
 * Map database errors to user-friendly messages
 */
const mapDatabaseError = (error) => {
  // PostgreSQL error codes
  const errorCodeMap = {
    '23505': { status: 409, message: 'Duplicate entry. This record already exists.' },
    '23503': { status: 400, message: 'Referenced record not found.' },
    '23502': { status: 400, message: 'Required field is missing.' },
    '22P02': { status: 400, message: 'Invalid data format.' },
    '42P01': { status: 500, message: 'Database table not found.' },
    '42703': { status: 500, message: 'Database column not found.' }
  };

  const errorCode = error.code;
  const mapping = errorCodeMap[errorCode];

  if (mapping) {
    return new APIError(mapping.message, mapping.status);
  }

  return new APIError('Database operation failed', 500);
};

/**
 * Development error response (includes stack trace)
 */
const sendErrorDev = (err, req, res) => {
  const statusCode = err.statusCode || 500;

  logger.error('Error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  res.status(statusCode).json({
    success: false,
    error: err.message,
    type: err.name,
    stack: err.stack,
    path: req.path,
    timestamp: new Date().toISOString()
  });
};

/**
 * Production error response (no stack trace)
 */
const sendErrorProd = (err, req, res) => {
  const statusCode = err.statusCode || 500;

  // Operational errors: send to client
  if (err.isOperational) {
    logger.error('Operational Error:', {
      error: err.message,
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    return res.status(statusCode).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Programming or unknown errors: don't leak details
  logger.error('Non-Operational Error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred. Please try again later.',
    timestamp: new Date().toISOString()
  });
};

/**
 * Main error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Set default status code
  err.statusCode = err.statusCode || 500;
  err.isOperational = err.isOperational || false;

  // Handle specific error types
  let error = err;

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new APIError('Invalid authentication token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new APIError('Authentication token expired. Please login again.', 401);
  }

  // Validation errors (Mongoose)
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(', ');
    error = new APIError(message, 400);
  }

  // Database errors
  if (err.code && (err.code.startsWith('23') || err.code.startsWith('22') || err.code.startsWith('42'))) {
    error = mapDatabaseError(err);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    error = new APIError(`${field} already exists`, 409);
  }

  // Blockchain errors (ethers.js)
  if (err.code && err.code.startsWith('CALL_EXCEPTION')) {
    error = new APIError('Blockchain transaction failed', 400);
  }

  // Send appropriate response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

/**
 * Handle 404 errors (route not found)
 */
const notFoundHandler = (req, res, next) => {
  const error = new APIError(
    `Route ${req.originalUrl} not found`,
    404
  );
  next(error);
};

/**
 * Async error wrapper for controllers
 * Catches async errors and passes them to error handler
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', {
    reason,
    promise
  });
  // In production, you might want to restart the process
  // process.exit(1);
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack
  });
  // In production, you should restart the process
  // process.exit(1);
});

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  APIError,
  ErrorTypes
};
