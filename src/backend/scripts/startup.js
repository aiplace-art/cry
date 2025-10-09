#!/usr/bin/env node

/**
 * Startup script for backend server
 * Performs health checks and initializations
 */

const { logger } = require('../config/logger');
const fs = require('fs');
const path = require('path');

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'ETH_RPC_URL'
];

const optionalEnvVars = [
  'REDIS_URL',
  'COINGECKO_API_KEY',
  'OPENAI_API_KEY',
  'STAKING_CONTRACT_ADDRESS'
];

/**
 * Check environment variables
 */
const checkEnvironment = () => {
  logger.info('Checking environment configuration...');

  const missing = [];
  const warnings = [];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  optionalEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      warnings.push(envVar);
    }
  });

  if (missing.length > 0) {
    logger.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    logger.error('Please check your .env file');
    process.exit(1);
  }

  if (warnings.length > 0) {
    logger.warn(`⚠️  Optional environment variables not set: ${warnings.join(', ')}`);
    logger.warn('Some features may not work correctly');
  }

  logger.info('✅ Environment configuration validated');
};

/**
 * Ensure required directories exist
 */
const ensureDirectories = () => {
  logger.info('Checking required directories...');

  const dirs = [
    path.join(__dirname, '../../logs'),
    path.join(__dirname, '../../uploads'),
    path.join(__dirname, '../../temp')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Created directory: ${dir}`);
    }
  });

  logger.info('✅ All required directories exist');
};

/**
 * Display startup banner
 */
const displayBanner = () => {
  const banner = `
╔═══════════════════════════════════════════════╗
║                                               ║
║     Crypto Platform Backend API Server       ║
║              Version 1.0.0                    ║
║                                               ║
╚═══════════════════════════════════════════════╝

Environment: ${process.env.NODE_ENV || 'development'}
Port: ${process.env.PORT || 5000}
MongoDB: ${process.env.MONGODB_URI ? '✅ Configured' : '❌ Not configured'}
Redis: ${process.env.REDIS_URL ? '✅ Configured' : '⚠️  Not configured (optional)'}
Blockchain RPC: ${process.env.ETH_RPC_URL ? '✅ Configured' : '❌ Not configured'}

`;

  console.log(banner);
};

/**
 * Main startup function
 */
const startup = async () => {
  try {
    displayBanner();
    checkEnvironment();
    ensureDirectories();

    logger.info('Starting server...');

    // Start the server
    require('../server');
  } catch (error) {
    logger.error(`Startup failed: ${error.message}`);
    process.exit(1);
  }
};

// Run startup
if (require.main === module) {
  startup();
}

module.exports = { startup, checkEnvironment, ensureDirectories };
