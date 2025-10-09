const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../models/User');
const { ethers } = require('ethers');

describe('API Integration Tests', () => {
  let authToken;
  let testWallet;
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/crypto-platform-test');
    }

    // Create test wallet
    testWallet = ethers.Wallet.createRandom();
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ walletAddress: testWallet.address.toLowerCase() });
    await mongoose.connection.close();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Authentication', () => {
    it('should get nonce for wallet address', async () => {
      const response = await request(app)
        .get(`/api/v1/auth/nonce/${testWallet.address}`)
        .expect(200);

      expect(response.body).toHaveProperty('nonce');
      expect(response.body).toHaveProperty('walletAddress');
      expect(response.body.walletAddress).toBe(testWallet.address.toLowerCase());
    });

    it('should authenticate with valid signature', async () => {
      // Get nonce
      const nonceResponse = await request(app)
        .get(`/api/v1/auth/nonce/${testWallet.address}`)
        .expect(200);

      const { nonce } = nonceResponse.body;

      // Sign message
      const signature = await testWallet.signMessage(nonce);

      // Authenticate
      const authResponse = await request(app)
        .post('/api/v1/auth/verify')
        .send({
          walletAddress: testWallet.address,
          message: nonce,
          signature
        })
        .expect(200);

      expect(authResponse.body).toHaveProperty('token');
      expect(authResponse.body).toHaveProperty('user');
      expect(authResponse.body.user).toHaveProperty('walletAddress', testWallet.address.toLowerCase());

      authToken = authResponse.body.token;
      testUser = authResponse.body.user;
    });

    it('should reject invalid signature', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify')
        .send({
          walletAddress: testWallet.address,
          message: 'invalid-nonce',
          signature: '0x' + '0'.repeat(130)
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Token Prices', () => {
    it('should get token prices', async () => {
      const response = await request(app)
        .get('/api/v1/tokens/prices?symbols=BTC,ETH,USDT')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('symbol');
      expect(response.body[0]).toHaveProperty('price');
    });

    it('should get specific token details', async () => {
      const response = await request(app)
        .get('/api/v1/tokens/BTC')
        .expect(200);

      expect(response.body).toHaveProperty('symbol', 'BTC');
      expect(response.body).toHaveProperty('price');
      expect(response.body).toHaveProperty('marketCap');
    });

    it('should get trending tokens', async () => {
      const response = await request(app)
        .get('/api/v1/tokens/trending')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Staking (Protected Routes)', () => {
    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/staking/pools')
        .expect(401);
    });

    it('should get available staking pools', async () => {
      const response = await request(app)
        .get('/api/v1/staking/pools')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('tokenSymbol');
      expect(response.body[0]).toHaveProperty('apy');
    });

    it('should get user stakes', async () => {
      const response = await request(app)
        .get('/api/v1/staking/my-stakes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Analytics', () => {
    it('should require authentication for portfolio analytics', async () => {
      await request(app)
        .get('/api/v1/analytics/portfolio')
        .expect(401);
    });

    it('should get portfolio analytics', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/portfolio')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('portfolioValue');
      expect(response.body).toHaveProperty('totalStaked');
      expect(response.body).toHaveProperty('totalEarned');
    });

    it('should get market analytics (public)', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/market')
        .expect(200);

      expect(response.body).toHaveProperty('overview');
      expect(response.body).toHaveProperty('topTokens');
    });
  });

  describe('AI Predictions', () => {
    it('should get price prediction', async () => {
      const response = await request(app)
        .get('/api/v1/ai/prediction/BTC?timeframe=24h')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('tokenSymbol', 'BTC');
      expect(response.body).toHaveProperty('predictedPrice');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('trend');
    });

    it('should get trading signals', async () => {
      const response = await request(app)
        .get('/api/v1/ai/signals/ETH')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('signals');
      expect(response.body).toHaveProperty('recommendation');
    });
  });

  describe('User Profile', () => {
    it('should get user profile', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('walletAddress', testWallet.address.toLowerCase());
      expect(response.body).toHaveProperty('portfolioValue');
    });

    it('should update user preferences', async () => {
      const response = await request(app)
        .patch('/api/v1/users/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currency: 'EUR',
          theme: 'light'
        })
        .expect(200);

      expect(response.body.preferences).toHaveProperty('currency', 'EUR');
      expect(response.body.preferences).toHaveProperty('theme', 'light');
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit excessive requests', async () => {
      const requests = [];

      // Make 150 requests (exceeding the 100 request limit)
      for (let i = 0; i < 150; i++) {
        requests.push(
          request(app)
            .get('/api/v1/tokens/trending')
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    }, 30000);
  });
});
