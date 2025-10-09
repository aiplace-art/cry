const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { setupWebSocket } = require('./websocket/wsServer');
const { logger } = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const tokenRoutes = require('./routes/token.routes');
const stakingRoutes = require('./routes/staking.routes');
const transactionRoutes = require('./routes/transaction.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize connections
const initializeServices = async () => {
  try {
    // Database connections
    await connectDB();
    await connectRedis();

    logger.info('✅ All services initialized successfully');
  } catch (error) {
    logger.error(`❌ Service initialization failed: ${error.message}`);
    // Continue running with degraded functionality
  }
};

// Start initialization
initializeServices();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) }}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tokens', tokenRoutes);
app.use('/api/v1/staking', stakingRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/ai', aiRoutes);

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Setup WebSocket
setupWebSocket(server);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
