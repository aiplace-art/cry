const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/backend/server');
const User = require('../../src/backend/models/User');
const TokenPrice = require('../../src/backend/models/TokenPrice');

describe('AI API', () => {
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

    // Create test token price
    await TokenPrice.create({
      symbol: 'ETH',
      name: 'Ethereum',
      price: 2500,
      currency: 'USD',
      marketCap: 300000000000,
      volume24h: 15000000000,
      change24h: 2.5,
      change7d: 5.0,
      lastUpdated: new Date()
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await TokenPrice.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/v1/ai/predict', () => {
    it('should generate price prediction', async () => {
      const res = await request(app)
        .post('/api/v1/ai/predict')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tokenSymbol: 'ETH',
          timeframe: '24h',
          includeAnalysis: true
        })
        .expect(200);

      expect(res.body).toHaveProperty('prediction');
      expect(res.body.prediction).toHaveProperty('currentPrice');
      expect(res.body.prediction).toHaveProperty('predictedPrice');
      expect(res.body.prediction).toHaveProperty('confidence');
      expect(res.body.prediction).toHaveProperty('trend');
      expect(res.body.prediction).toHaveProperty('signals');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/ai/predict')
        .send({
          tokenSymbol: 'ETH',
          timeframe: '24h'
        })
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    it('should validate timeframe', async () => {
      const res = await request(app)
        .post('/api/v1/ai/predict')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tokenSymbol: 'ETH',
          timeframe: 'invalid'
        })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/ai/signals/:symbol', () => {
    it('should get trading signals', async () => {
      const res = await request(app)
        .get('/api/v1/ai/signals/ETH')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('signals');
      expect(res.body.signals).toHaveProperty('buy');
      expect(res.body.signals).toHaveProperty('sell');
      expect(res.body.signals).toHaveProperty('hold');
      expect(res.body.signals).toHaveProperty('recommendation');
    });
  });

  describe('GET /api/v1/ai/sentiment/:symbol', () => {
    it('should get sentiment analysis', async () => {
      const res = await request(app)
        .get('/api/v1/ai/sentiment/ETH')
        .expect(200);

      expect(res.body).toHaveProperty('sentiment');
      expect(res.body.sentiment).toHaveProperty('overall');
      expect(res.body.sentiment).toHaveProperty('score');
      expect(res.body.sentiment).toHaveProperty('sources');
    });

    it('should not require authentication', async () => {
      const res = await request(app)
        .get('/api/v1/ai/sentiment/ETH')
        .expect(200);

      expect(res.body).toHaveProperty('sentiment');
    });
  });

  describe('GET /api/v1/ai/market-analysis', () => {
    it('should get market analysis', async () => {
      const res = await request(app)
        .get('/api/v1/ai/market-analysis')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('analysis');
      expect(res.body.analysis).toHaveProperty('sentiment');
      expect(res.body.analysis).toHaveProperty('volatility');
    });
  });

  describe('POST /api/v1/ai/portfolio-advice', () => {
    it('should get portfolio recommendations', async () => {
      const res = await request(app)
        .post('/api/v1/ai/portfolio-advice')
        .set('Authorization', `Bearer ${token}`)
        .send({
          riskTolerance: 'medium'
        })
        .expect(200);

      expect(res.body).toHaveProperty('advice');
      expect(res.body.advice).toHaveProperty('recommendations');
      expect(Array.isArray(res.body.advice.recommendations)).toBe(true);
    });
  });
});
