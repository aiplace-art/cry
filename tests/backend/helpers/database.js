const { Pool } = require('pg');
const mongoose = require('mongoose');

let testDbPool;
let mongoConnection;

/**
 * Setup test database with clean slate
 */
async function setupTestDB() {
  // PostgreSQL setup
  testDbPool = new Pool({
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 5432,
    database: process.env.TEST_DB_NAME || 'crypto_test',
    user: process.env.TEST_DB_USER || 'test',
    password: process.env.TEST_DB_PASSWORD || 'test'
  });

  // Create tables
  await testDbPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      wallet_address VARCHAR(42),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS staking_positions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      amount DECIMAL(20, 8) NOT NULL,
      duration INTEGER NOT NULL,
      transaction_hash VARCHAR(66),
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      type VARCHAR(20) NOT NULL,
      amount DECIMAL(20, 8),
      transaction_hash VARCHAR(66),
      status VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // MongoDB setup
  const mongoUrl = process.env.TEST_MONGO_URL || 'mongodb://localhost:27017/crypto_test';
  mongoConnection = await mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  console.log('Test database initialized');
}

/**
 * Clear all test data
 */
async function clearTestDB() {
  if (testDbPool) {
    await testDbPool.query('TRUNCATE TABLE transactions CASCADE');
    await testDbPool.query('TRUNCATE TABLE staking_positions CASCADE');
    await testDbPool.query('TRUNCATE TABLE users CASCADE');
  }

  if (mongoConnection) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }

  console.log('Test database cleared');
}

/**
 * Close database connections
 */
async function closeTestDB() {
  if (testDbPool) {
    await testDbPool.end();
  }

  if (mongoConnection) {
    await mongoose.connection.close();
  }

  console.log('Test database connections closed');
}

/**
 * Create test user
 */
async function createTestUser(userData = {}) {
  const defaultData = {
    email: `test${Date.now()}@example.com`,
    password_hash: '$2b$10$hash', // bcrypt hash
    wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    ...userData
  };

  const result = await testDbPool.query(
    'INSERT INTO users (email, password_hash, wallet_address) VALUES ($1, $2, $3) RETURNING *',
    [defaultData.email, defaultData.password_hash, defaultData.wallet_address]
  );

  return result.rows[0];
}

/**
 * Create test staking position
 */
async function createTestStakingPosition(userId, positionData = {}) {
  const defaultData = {
    amount: '1000.0',
    duration: 30,
    transaction_hash: '0x' + 'a'.repeat(64),
    status: 'confirmed',
    ...positionData
  };

  const result = await testDbPool.query(
    'INSERT INTO staking_positions (user_id, amount, duration, transaction_hash, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, defaultData.amount, defaultData.duration, defaultData.transaction_hash, defaultData.status]
  );

  return result.rows[0];
}

/**
 * Get database connection
 */
function getDbPool() {
  return testDbPool;
}

/**
 * Get MongoDB connection
 */
function getMongoConnection() {
  return mongoConnection;
}

module.exports = {
  setupTestDB,
  clearTestDB,
  closeTestDB,
  createTestUser,
  createTestStakingPosition,
  getDbPool,
  getMongoConnection
};
