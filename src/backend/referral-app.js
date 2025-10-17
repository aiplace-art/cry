/**
 * Referral System Express App
 * Complete backend for HypeAI referral system
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const referralRoutes = require('./routes/referral.routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { testConnection } = require('./utils/database-pool');
const { logger } = require('./config/logger');

const app = express();

// ======================
// SECURITY MIDDLEWARE
// ======================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ======================
// BODY PARSING
// ======================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================
// LOGGING
// ======================

// HTTP request logging (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// ======================
// RATE LIMITING
// ======================

// Apply rate limiting to all routes
app.use(apiLimiter);

// ======================
// HEALTH CHECK
// ======================

app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();

    res.status(dbConnected ? 200 : 503).json({
      success: dbConnected,
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'HypeAI Referral System',
      version: '1.0.0',
      database: dbConnected ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// ======================
// API ROUTES
// ======================

// Mount all referral routes under /api
app.use('/api', referralRoutes);

// ======================
// ERROR HANDLING
// ======================

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ======================
// GRACEFUL SHUTDOWN
// ======================

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} signal received. Starting graceful shutdown...`);

  // Close database connections
  try {
    const { pool } = require('./utils/database-pool');
    await pool.end();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database:', error);
  }

  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ======================
// EXPORT
// ======================

module.exports = app;
