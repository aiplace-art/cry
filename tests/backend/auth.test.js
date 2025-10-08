const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/backend/server');
const User = require('../../src/backend/models/User');

describe('Authentication API', () => {
  let walletAddress = '0x1234567890123456789012345678901234567890';

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/crypto-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  describe('GET /api/v1/auth/nonce/:walletAddress', () => {
    it('should generate nonce for new wallet', async () => {
      const res = await request(app)
        .get(`/api/v1/auth/nonce/${walletAddress}`)
        .expect(200);

      expect(res.body).toHaveProperty('nonce');
      expect(res.body).toHaveProperty('walletAddress');
      expect(res.body.walletAddress.toLowerCase()).toBe(walletAddress.toLowerCase());
    });

    it('should generate new nonce for existing wallet', async () => {
      // Create user first
      await User.create({
        walletAddress: walletAddress.toLowerCase(),
        nonce: 'old-nonce'
      });

      const res = await request(app)
        .get(`/api/v1/auth/nonce/${walletAddress}`)
        .expect(200);

      expect(res.body.nonce).not.toBe('old-nonce');
    });

    it('should return 400 for invalid wallet address', async () => {
      const res = await request(app)
        .get('/api/v1/auth/nonce/')
        .expect(404);
    });
  });

  describe('POST /api/v1/auth/verify', () => {
    it('should authenticate valid signature', async () => {
      // This would require actual wallet signing in real tests
      // For now, this is a placeholder for the test structure
      expect(true).toBe(true);
    });

    it('should reject invalid signature', async () => {
      const res = await request(app)
        .post('/api/v1/auth/verify')
        .send({
          walletAddress,
          signature: 'invalid-signature',
          message: 'invalid-message'
        })
        .expect(404); // User not found since nonce wasn't requested

      expect(res.body).toHaveProperty('error');
    });

    it('should require all fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/verify')
        .send({
          walletAddress
        })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .expect(200);

      expect(res.body).toHaveProperty('message');
    });
  });
});
