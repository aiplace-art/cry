/**
 * HypeAI Unified Database Connection Pool
 * Single source of truth for database connections
 * Used by all backend services and AI agents
 */

const { Pool } = require('pg');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../../scripts/.env.database') });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'hypeai',
  user: process.env.DB_USER || 'hypeai_user',
  password: process.env.DB_PASSWORD || 'hypeai_password',

  // Pool configuration
  max: parseInt(process.env.DB_POOL_MAX || '20'), // Maximum pool size
  min: parseInt(process.env.DB_POOL_MIN || '5'),  // Minimum pool size
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'),

  // Keep alive
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Event handlers
pool.on('connect', (client) => {
  console.log('🔌 New database client connected');
});

pool.on('acquire', (client) => {
  // console.log('📦 Database client acquired from pool');
});

pool.on('remove', (client) => {
  console.log('🗑️  Database client removed from pool');
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected database pool error:', err);
  // Don't exit the process - let it be handled by the application
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Closing database pool...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏹️  Closing database pool...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

/**
 * Test database connection
 */
async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW() as current_time, current_database() as database');
    console.log('✅ Database connection OK');
    console.log(`   Database: ${result.rows[0].database}`);
    console.log(`   Time: ${result.rows[0].current_time}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Get pool statistics
 */
function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

/**
 * Execute query with error handling
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    if (duration > 1000) {
      console.warn(`⚠️  Slow query (${duration}ms):`, text.substring(0, 100));
    }

    return result;
  } catch (error) {
    console.error('❌ Query error:', error.message);
    console.error('   Query:', text.substring(0, 200));
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
async function getClient() {
  const client = await pool.connect();

  // Add transaction helpers
  client.beginTransaction = async () => {
    await client.query('BEGIN');
  };

  client.commitTransaction = async () => {
    await client.query('COMMIT');
  };

  client.rollbackTransaction = async () => {
    await client.query('ROLLBACK');
  };

  return client;
}

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  getPoolStats,
  dbConfig,
};
