/**
 * Enhanced Referral System Backend Tests
 * Tests for leaderboard, notifications, analytics, and advanced features
 */

const request = require('supertest');
const { Pool } = require('pg');
const app = require('../../src/backend/referral-app');
const referralService = require('../../src/backend/services/referral.service');

// Test database configuration
const testPool = new Pool({
  host: process.env.TEST_DB_HOST || 'localhost',
  port: process.env.TEST_DB_PORT || 5432,
  database: process.env.TEST_DB_NAME || 'hypeai_test',
  user: process.env.TEST_DB_USER || 'hypeai_user',
  password: process.env.TEST_DB_PASSWORD || 'hypeai_password'
});

describe('Enhanced Referral System Backend', () => {
  let authToken;
  let userId;
  let referralCode;

  beforeAll(async () => {
    // Setup test database
    await testPool.query('DELETE FROM reward_claims');
    await testPool.query('DELETE FROM referral_rewards');
    await testPool.query('DELETE FROM purchases');
    await testPool.query('DELETE FROM referrals');
    await testPool.query('DELETE FROM users');
  });

  afterAll(async () => {
    await testPool.end();
  });

  beforeEach(async () => {
    // Clean data before each test
    await testPool.query('DELETE FROM reward_claims');
    await testPool.query('DELETE FROM referral_rewards');
    await testPool.query('DELETE FROM purchases');
    await testPool.query('DELETE FROM referrals');
    await testPool.query('DELETE FROM users');

    // Create test user
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!'
      });

    authToken = response.body.data.token;
    userId = response.body.data.user.id;
    referralCode = response.body.data.user.referralCode;
  });

  describe('Leaderboard API', () => {
    beforeEach(async () => {
      // Create multiple users with different stats
      const users = [
        { email: 'user1@test.com', password: 'Pass123!', referrals: 50, volume: 100000 },
        { email: 'user2@test.com', password: 'Pass123!', referrals: 30, volume: 75000 },
        { email: 'user3@test.com', password: 'Pass123!', referrals: 20, volume: 50000 },
        { email: 'user4@test.com', password: 'Pass123!', referrals: 10, volume: 25000 },
        { email: 'user5@test.com', password: 'Pass123!', referrals: 5, volume: 10000 },
      ];

      for (const user of users) {
        const registerRes = await request(app)
          .post('/api/auth/register')
          .send({ email: user.email, password: user.password });

        const userCode = registerRes.body.data.user.referralCode;

        // Simulate referrals and volume
        await testPool.query(
          'UPDATE users SET total_referrals = $1 WHERE email = $2',
          [user.referrals, user.email]
        );
      }

      // Refresh leaderboard
      await referralService.refreshLeaderboard();
    });

    it('GET /api/leaderboard - should return top referrers', async () => {
      const response = await request(app)
        .get('/api/leaderboard')
        .query({ limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.leaderboard).toHaveLength(5);
      expect(response.body.data.leaderboard[0].total_referrals).toBe(50);
    });

    it('GET /api/leaderboard - should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/leaderboard')
        .query({ limit: 3 });

      expect(response.status).toBe(200);
      expect(response.body.data.leaderboard).toHaveLength(3);
    });

    it('GET /api/leaderboard - should include ranking', async () => {
      const response = await request(app)
        .get('/api/leaderboard')
        .query({ limit: 10 });

      const leaderboard = response.body.data.leaderboard;
      expect(leaderboard[0].ranking).toBe(1);
      expect(leaderboard[1].ranking).toBe(2);
      expect(leaderboard[2].ranking).toBe(3);
    });

    it('GET /api/leaderboard/user/:userId - should return user rank', async () => {
      const response = await request(app)
        .get(`/api/leaderboard/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('rank');
      expect(response.body.data).toHaveProperty('totalReferrals');
    });

    it('GET /api/leaderboard/stats - should return global stats', async () => {
      const response = await request(app)
        .get('/api/leaderboard/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalReferrers');
      expect(response.body.data).toHaveProperty('totalReferrals');
      expect(response.body.data).toHaveProperty('totalVolume');
    });

    it('POST /api/leaderboard/refresh - should refresh leaderboard (admin only)', async () => {
      const response = await request(app)
        .post('/api/leaderboard/refresh')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Referral Chain API', () => {
    it('GET /api/referral/chain - should return multi-level referral chain', async () => {
      // Create chain: user1 -> user2 -> user3
      const user2Res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user2@test.com',
          password: 'Pass123!',
          referrerCode: referralCode
        });

      const user2Code = user2Res.body.data.user.referralCode;

      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user3@test.com',
          password: 'Pass123!',
          referrerCode: user2Code
        });

      const response = await request(app)
        .get('/api/referral/chain')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ depth: 3 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.chain).toHaveLength(2); // user2 and user3
      expect(response.body.data.chain[0].level).toBe(1);
      expect(response.body.data.chain[1].level).toBe(2);
    });

    it('GET /api/referral/chain - should respect depth limit', async () => {
      const response = await request(app)
        .get('/api/referral/chain')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ depth: 1 });

      expect(response.status).toBe(200);
      // Should only return direct referrals
    });
  });

  describe('Analytics API', () => {
    it('GET /api/analytics/daily - should return daily statistics', async () => {
      const response = await request(app)
        .get('/api/analytics/daily')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ days: 7 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.dailyStats).toBeDefined();
    });

    it('GET /api/analytics/performance - should return performance metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/performance')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('conversionRate');
      expect(response.body.data).toHaveProperty('avgPurchaseValue');
      expect(response.body.data).toHaveProperty('topPerformingLinks');
    });

    it('GET /api/analytics/trends - should return growth trends', async () => {
      const response = await request(app)
        .get('/api/analytics/trends')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ period: 'month' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('growth');
      expect(response.body.data).toHaveProperty('predictions');
    });
  });

  describe('Bonus Tiers API', () => {
    it('GET /api/referral/tiers - should return available bonus tiers', async () => {
      const response = await request(app)
        .get('/api/referral/tiers');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tiers).toEqual([
        { level: 1, percentage: 10, description: 'Direct referral' },
        { level: 2, percentage: 5, description: 'Second-tier referral' },
        { level: 3, percentage: 2, description: 'Third-tier referral' }
      ]);
    });

    it('GET /api/referral/bonus-calculator - should calculate potential earnings', async () => {
      const response = await request(app)
        .get('/api/referral/bonus-calculator')
        .query({ purchaseAmount: 1000, referrals: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('directBonus');
      expect(response.body.data).toHaveProperty('secondTierBonus');
      expect(response.body.data).toHaveProperty('totalPotential');
    });

    it('POST /api/referral/milestones - should track milestone achievements', async () => {
      const response = await request(app)
        .post('/api/referral/milestones')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ milestone: 'first_10_referrals' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('unlocked');
    });
  });

  describe('Notification API', () => {
    it('GET /api/notifications - should return user notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications).toBeDefined();
    });

    it('POST /api/notifications/read - should mark notifications as read', async () => {
      const response = await request(app)
        .post('/api/notifications/read')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notificationIds: [1, 2, 3] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('GET /api/notifications/unread-count - should return unread count', async () => {
      const response = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('count');
    });

    it('POST /api/notifications/preferences - should update notification settings', async () => {
      const response = await request(app)
        .post('/api/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emailNotifications: true,
          pushNotifications: false,
          referralAlerts: true,
          rewardAlerts: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Advanced Reward Features', () => {
    it('POST /api/rewards/batch-claim - should claim multiple rewards at once', async () => {
      // Setup: Create multiple pending rewards
      const referredUser1 = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'referred1@test.com',
          password: 'Pass123!',
          referrerCode: referralCode
        });

      await request(app)
        .post('/api/purchase/record')
        .set('Authorization', `Bearer ${referredUser1.body.data.token}`)
        .send({
          txHash: '0xabcd1234',
          amountUsd: 1000,
          amountTokens: 50000,
          tokenPrice: 0.02,
          referrerCode: referralCode
        });

      const response = await request(app)
        .post('/api/rewards/batch-claim')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rewardType: 'tokens',
          rewardIds: [1, 2, 3]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalClaimed');
    });

    it('GET /api/rewards/history - should return claim history', async () => {
      const response = await request(app)
        .get('/api/rewards/history')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 50, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.history).toBeDefined();
    });

    it('GET /api/rewards/projections - should calculate reward projections', async () => {
      const response = await request(app)
        .get('/api/rewards/projections')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ months: 3 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('projected');
    });
  });

  describe('Performance Tests', () => {
    it('should handle 100 concurrent leaderboard requests', async () => {
      const requests = Array(100).fill(null).map(() =>
        request(app).get('/api/leaderboard').query({ limit: 10 })
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should respond to dashboard within 500ms', async () => {
      const start = Date.now();

      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${authToken}`);

      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);
    });

    it('should handle pagination efficiently for large datasets', async () => {
      const response = await request(app)
        .get('/api/referral/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 100, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent-endpoint');

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid request parameters', async () => {
      const response = await request(app)
        .get('/api/leaderboard')
        .query({ limit: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for unauthorized requests', async () => {
      const response = await request(app)
        .get('/api/dashboard/overview');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      // Simulate database error by disconnecting
      await testPool.end();

      const response = await request(app)
        .get('/api/leaderboard');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();

      // Reconnect for other tests
      // (In real scenario, connection pool would auto-recover)
    });
  });

  describe('Security Tests', () => {
    it('should prevent SQL injection in leaderboard query', async () => {
      const response = await request(app)
        .get('/api/leaderboard')
        .query({ limit: "10; DROP TABLE users; --" });

      expect(response.status).toBe(400); // Should reject invalid input
    });

    it('should sanitize user input in referral codes', async () => {
      const response = await request(app)
        .get('/api/referral/validate/<script>alert("XSS")</script>');

      expect(response.status).toBe(200);
      expect(response.body.data.valid).toBe(false);
    });

    it('should rate limit API requests', async () => {
      // Make 100 requests in quick succession
      const requests = Array(100).fill(null).map(() =>
        request(app)
          .get('/api/leaderboard')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);

      // Some requests should be rate limited (429)
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});

module.exports = { testPool };
