/**
 * Referral System API Integration Tests
 */

const request = require('supertest');
const { Pool } = require('pg');
const app = require('../../src/backend/app');

// Test database configuration
const testPool = new Pool({
  host: process.env.TEST_DB_HOST || 'localhost',
  port: process.env.TEST_DB_PORT || 5432,
  database: process.env.TEST_DB_NAME || 'hypeai_test',
  user: process.env.TEST_DB_USER || 'hypeai_user',
  password: process.env.TEST_DB_PASSWORD || 'hypeai_password'
});

describe('Referral System API Tests', () => {
  let authToken;
  let userId;
  let referralCode;

  // Setup: Create test tables and clean database
  beforeAll(async () => {
    // Initialize database schema (you would run migration here)
    // For now, assume tables exist
  });

  // Cleanup after tests
  afterAll(async () => {
    await testPool.end();
  });

  beforeEach(async () => {
    // Clean test data before each test
    await testPool.query('DELETE FROM reward_claims');
    await testPool.query('DELETE FROM referral_rewards');
    await testPool.query('DELETE FROM purchases');
    await testPool.query('DELETE FROM referrals');
    await testPool.query('DELETE FROM user_sessions');
    await testPool.query('DELETE FROM auth_nonces');
    await testPool.query('DELETE FROM users');
  });

  // ======================
  // AUTHENTICATION TESTS
  // ======================

  describe('POST /api/auth/register', () => {
    it('should register a new user with email/password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.referralCode).toBeDefined();

      authToken = response.body.data.token;
      userId = response.body.data.user.id;
      referralCode = response.body.data.user.referralCode;
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'short'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // ======================
  // REFERRAL TESTS
  // ======================

  describe('GET /api/referral/code', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      authToken = response.body.data.token;
      referralCode = response.body.data.user.referralCode;
    });

    it('should get user referral code', async () => {
      const response = await request(app)
        .get('/api/referral/code')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.referralCode).toBe(referralCode);
    });

    it('should fail without auth token', async () => {
      const response = await request(app)
        .get('/api/referral/code');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/referral/validate/:code', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      referralCode = response.body.data.user.referralCode;
    });

    it('should validate existing referral code', async () => {
      const response = await request(app)
        .get(`/api/referral/validate/${referralCode}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);
    });

    it('should invalidate non-existing code', async () => {
      const response = await request(app)
        .get('/api/referral/validate/INVALID123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(false);
    });
  });

  // ======================
  // PURCHASE TESTS
  // ======================

  describe('POST /api/purchase/record', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      authToken = response.body.data.token;
    });

    it('should record a purchase', async () => {
      const response = await request(app)
        .post('/api/purchase/record')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          amountUsd: 1000,
          amountTokens: 50000,
          tokenPrice: 0.02
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.purchaseId).toBeDefined();
    });

    it('should fail with invalid transaction hash', async () => {
      const response = await request(app)
        .post('/api/purchase/record')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          txHash: 'invalid-hash',
          amountUsd: 1000,
          amountTokens: 50000,
          tokenPrice: 0.02
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate transaction', async () => {
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      await request(app)
        .post('/api/purchase/record')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          txHash,
          amountUsd: 1000,
          amountTokens: 50000,
          tokenPrice: 0.02
        });

      const response = await request(app)
        .post('/api/purchase/record')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          txHash,
          amountUsd: 1000,
          amountTokens: 50000,
          tokenPrice: 0.02
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  // ======================
  // DASHBOARD TESTS
  // ======================

  describe('GET /api/dashboard/overview', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      authToken = response.body.data.token;
    });

    it('should get dashboard overview', async () => {
      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toBeDefined();
    });

    it('should fail without auth', async () => {
      const response = await request(app)
        .get('/api/dashboard/overview');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // ======================
  // REFERRAL FLOW TEST
  // ======================

  describe('Complete Referral Flow', () => {
    let referrerToken;
    let referredToken;
    let referrerCode;

    it('should complete full referral flow', async () => {
      // Step 1: Register referrer
      const referrerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'referrer@example.com',
          password: 'SecurePass123!'
        });

      expect(referrerResponse.status).toBe(201);
      referrerToken = referrerResponse.body.data.token;
      referrerCode = referrerResponse.body.data.user.referralCode;

      // Step 2: Register referred user with referral code
      const referredResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'referred@example.com',
          password: 'SecurePass123!',
          referrerCode
        });

      expect(referredResponse.status).toBe(201);
      referredToken = referredResponse.body.data.token;

      // Step 3: Referred user makes purchase
      const purchaseResponse = await request(app)
        .post('/api/purchase/record')
        .set('Authorization', `Bearer ${referredToken}`)
        .send({
          txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          amountUsd: 1000,
          amountTokens: 50000,
          tokenPrice: 0.02,
          referrerCode
        });

      expect(purchaseResponse.status).toBe(201);
      expect(purchaseResponse.body.data.hasReferrer).toBe(true);

      // Step 4: Check referrer's pending rewards
      const rewardsResponse = await request(app)
        .get('/api/referral/rewards/pending')
        .set('Authorization', `Bearer ${referrerToken}`);

      expect(rewardsResponse.status).toBe(200);
      // Rewards will be pending until purchase is confirmed

      // Step 5: Check referrer's stats
      const statsResponse = await request(app)
        .get('/api/referral/stats')
        .set('Authorization', `Bearer ${referrerToken}`);

      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body.data.total_referrals).toBe(1);
    });
  });
});

module.exports = {
  testPool
};
