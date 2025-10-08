const request = require('supertest');
const app = require('../../src/backend/app');
const { setupTestDB, clearTestDB } = require('./helpers/database');
const jwt = require('jsonwebtoken');

describe('API Endpoints', () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await clearTestDB();
  });

  beforeEach(() => {
    // Reset for each test
    authToken = null;
    testUserId = null;
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'test@example.com',
            password: 'SecurePass123!',
            walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
          })
          .expect(201);

        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe('test@example.com');

        testUserId = response.body.user.id;
        authToken = response.body.token;
      });

      it('should fail with invalid email', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'invalid-email',
            password: 'SecurePass123!',
            walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('email');
      });

      it('should fail with weak password', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'test2@example.com',
            password: '123',
            walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('password');
      });

      it('should fail with duplicate email', async () => {
        await request(app)
          .post('/api/auth/register')
          .send({
            email: 'duplicate@example.com',
            password: 'SecurePass123!',
            walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
          });

        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'duplicate@example.com',
            password: 'SecurePass123!',
            walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEa'
          })
          .expect(409);

        expect(response.body.error).toContain('already exists');
      });

      it('should fail with invalid wallet address', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'test3@example.com',
            password: 'SecurePass123!',
            walletAddress: 'invalid-address'
          })
          .expect(400);

        expect(response.body.error).toContain('wallet');
      });
    });

    describe('POST /api/auth/login', () => {
      beforeEach(async () => {
        await request(app)
          .post('/api/auth/register')
          .send({
            email: 'login@example.com',
            password: 'SecurePass123!',
            walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
          });
      });

      it('should login with valid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'login@example.com',
            password: 'SecurePass123!'
          })
          .expect(200);

        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        authToken = response.body.token;
      });

      it('should fail with wrong password', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'login@example.com',
            password: 'WrongPassword123!'
          })
          .expect(401);

        expect(response.body.error).toContain('Invalid credentials');
      });

      it('should fail with non-existent user', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'SecurePass123!'
          })
          .expect(401);

        expect(response.body.error).toContain('Invalid credentials');
      });

      it('should return valid JWT token', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'login@example.com',
            password: 'SecurePass123!'
          });

        const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
        expect(decoded).toHaveProperty('userId');
        expect(decoded).toHaveProperty('email');
      });
    });
  });

  describe('Wallet Endpoints', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'wallet@example.com',
          password: 'SecurePass123!',
          walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
        });
      authToken = response.body.token;
      testUserId = response.body.user.id;
    });

    describe('GET /api/wallet/balance/:address', () => {
      it('should get wallet balance', async () => {
        const response = await request(app)
          .get('/api/wallet/balance/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('balance');
        expect(response.body).toHaveProperty('address');
      });

      it('should fail without authentication', async () => {
        await request(app)
          .get('/api/wallet/balance/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
          .expect(401);
      });

      it('should fail with invalid address format', async () => {
        const response = await request(app)
          .get('/api/wallet/balance/invalid-address')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);

        expect(response.body.error).toContain('address');
      });
    });

    describe('POST /api/wallet/connect', () => {
      it('should connect wallet with signature', async () => {
        const response = await request(app)
          .post('/api/wallet/connect')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            signature: '0xabcd1234...',
            message: 'Connect wallet to CryptoApp'
          })
          .expect(200);

        expect(response.body).toHaveProperty('connected', true);
      });

      it('should fail with invalid signature', async () => {
        const response = await request(app)
          .post('/api/wallet/connect')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            signature: 'invalid',
            message: 'Connect wallet to CryptoApp'
          })
          .expect(400);

        expect(response.body.error).toContain('signature');
      });
    });
  });

  describe('Staking Endpoints', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'staker@example.com',
          password: 'SecurePass123!',
          walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
        });
      authToken = response.body.token;
    });

    describe('POST /api/staking/stake', () => {
      it('should create staking position', async () => {
        const response = await request(app)
          .post('/api/staking/stake')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: '1000',
            duration: 30,
            transactionHash: '0x123abc...'
          })
          .expect(201);

        expect(response.body).toHaveProperty('stakingId');
        expect(response.body).toHaveProperty('amount', '1000');
        expect(response.body).toHaveProperty('status', 'pending');
      });

      it('should fail with invalid amount', async () => {
        const response = await request(app)
          .post('/api/staking/stake')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: '-100',
            duration: 30,
            transactionHash: '0x123abc...'
          })
          .expect(400);

        expect(response.body.error).toContain('amount');
      });

      it('should fail with invalid duration', async () => {
        const response = await request(app)
          .post('/api/staking/stake')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: '1000',
            duration: 0,
            transactionHash: '0x123abc...'
          })
          .expect(400);

        expect(response.body.error).toContain('duration');
      });
    });

    describe('GET /api/staking/positions', () => {
      it('should get user staking positions', async () => {
        await request(app)
          .post('/api/staking/stake')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: '1000',
            duration: 30,
            transactionHash: '0x123abc...'
          });

        const response = await request(app)
          .get('/api/staking/positions')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('amount');
        expect(response.body[0]).toHaveProperty('duration');
      });

      it('should return empty array for new user', async () => {
        const newUserResponse = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'newstaker@example.com',
            password: 'SecurePass123!',
            walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEa'
          });

        const response = await request(app)
          .get('/api/staking/positions')
          .set('Authorization', `Bearer ${newUserResponse.body.token}`)
          .expect(200);

        expect(response.body).toEqual([]);
      });
    });

    describe('POST /api/staking/unstake/:id', () => {
      let stakingId;

      beforeEach(async () => {
        const stakeResponse = await request(app)
          .post('/api/staking/stake')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: '1000',
            duration: 30,
            transactionHash: '0x123abc...'
          });
        stakingId = stakeResponse.body.stakingId;
      });

      it('should unstake position', async () => {
        const response = await request(app)
          .post(`/api/staking/unstake/${stakingId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            transactionHash: '0x456def...'
          })
          .expect(200);

        expect(response.body).toHaveProperty('status', 'unstaked');
      });

      it('should fail to unstake non-existent position', async () => {
        const response = await request(app)
          .post('/api/staking/unstake/999999')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            transactionHash: '0x456def...'
          })
          .expect(404);

        expect(response.body.error).toContain('not found');
      });
    });

    describe('GET /api/staking/rewards/:address', () => {
      it('should calculate pending rewards', async () => {
        const response = await request(app)
          .get('/api/staking/rewards/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('pendingRewards');
        expect(response.body).toHaveProperty('claimedRewards');
        expect(response.body).toHaveProperty('totalRewards');
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on login', async () => {
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrong'
            })
        );
      }

      const responses = await Promise.all(promises);
      const tooManyRequests = responses.filter(r => r.status === 429);
      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown/route')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body.error).toContain('JSON');
    });

    it('should sanitize error messages', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong'
        })
        .expect(401);

      // Should not reveal if email exists
      expect(response.body.error).not.toContain('email not found');
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('CORS', () => {
    it('should allow requests from allowed origins', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
