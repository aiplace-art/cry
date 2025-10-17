const rateLimit = require('express-rate-limit');
const { logger } = require('../config/logger');

// Base handler for all rate limiters
const rateLimitHandler = (req, res) => {
  logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
  res.status(429).json({
    success: false,
    error: 'Too many requests, please try again later.',
    retryAfter: req.rateLimit.resetTime
  });
};

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true // Don't count successful requests
});

// Rate limiter for reward claims
const claimLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Maximum 5 claims per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler
});

// Rate limiter for purchase recording
const purchaseLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Maximum 10 purchases per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler
});

// Lenient rate limiter for public endpoints
const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler
});

module.exports = {
  apiLimiter,
  authLimiter,
  claimLimiter,
  purchaseLimiter,
  publicLimiter,
  // Default export for backward compatibility
  default: apiLimiter
};
