const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/backend/server');
const User = require('../../src/backend/models/User');
const Stake = require('../../src/backend/models/Stake');

describe('Staking API', () => {
  let token;
  let userId;
  const walletAddress = '0x1234567890123456789012345678901234567890';

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/crypto-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create test user
    const user = await User.create({
      walletAddress: walletAddress.toLowerCase(),
      nonce: 'test-nonce'
    });
    userId = user._id;

    // Generate token
    token = jwt.sign(
      { userId: user._id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Stake.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Stake.deleteMany({});
  });

  describe('GET /api/v1/staking/pools', () => {
    it('should get available staking pools', async () => {
      const res = await request(app)
        .get('/api/v1/staking/pools')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('pools');
      expect(Array.isArray(res.body.pools)).toBe(true);
      expect(res.body.pools.length).toBeGreaterThan(0);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/v1/staking/pools')
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/staking/stake', () => {
    it('should create a stake', async () => {
      const res = await request(app)
        .post('/api/v1/staking/stake')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tokenAddress: '0x0000000000000000000000000000000000000000',
          amount: '1.5',
          duration: 90
        })
        .expect(201);

      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('stake');
      expect(res.body.stake.amount).toBe('1.5');
      expect(res.body.stake.duration).toBe(90);
      expect(res.body.stake.status).toBe('active');
    });

    it('should validate minimum stake amount', async () => {
      const res = await request(app)
        .post('/api/v1/staking/stake')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tokenAddress: '0x0000000000000000000000000000000000000000',
          amount: '0.01', // Below minimum
          duration: 90
        })
        .expect(500);

      expect(res.body).toHaveProperty('error');
    });

    it('should validate duration', async () => {
      const res = await request(app)
        .post('/api/v1/staking/stake')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tokenAddress: '0x0000000000000000000000000000000000000000',
          amount: '1.5',
          duration: 400 // Above maximum
        })
        .expect(500);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/staking/user', () => {
    it('should get user stakes', async () => {
      // Create a stake first
      await Stake.create({
        userId,
        walletAddress,
        tokenAddress: '0x0000000000000000000000000000000000000000',
        tokenSymbol: 'ETH',
        amount: '1.5',
        amountDecimal: 1.5,
        apy: 5.5,
        duration: 90,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'active'
      });

      const res = await request(app)
        .get('/api/v1/staking/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('stakes');
      expect(Array.isArray(res.body.stakes)).toBe(true);
      expect(res.body.stakes.length).toBe(1);
    });

    it('should filter stakes by status', async () => {
      const res = await request(app)
        .get('/api/v1/staking/user?status=active')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('stakes');
    });
  });
});
