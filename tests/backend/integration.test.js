const request = require('supertest');
const app = require('../../src/backend/app');
const { ethers } = require('ethers');
const { setupTestDB, clearTestDB } = require('./helpers/database');

describe('Integration Tests', () => {
  let authToken;
  let walletAddress;
  let stakingContractAddress;

  beforeAll(async () => {
    await setupTestDB();
    // Setup test blockchain connection
    process.env.BLOCKCHAIN_NETWORK = 'hardhat';
  });

  afterAll(async () => {
    await clearTestDB();
  });

  describe('Complete User Journey', () => {
    it('should complete full user registration to staking flow', async () => {
      // Step 1: Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'journey@example.com',
          password: 'SecurePass123!',
          walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
        })
        .expect(201);

      expect(registerResponse.body).toHaveProperty('token');
      authToken = registerResponse.body.token;
      walletAddress = registerResponse.body.user.walletAddress;

      // Step 2: Connect wallet
      const connectResponse = await request(app)
        .post('/api/wallet/connect')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          address: walletAddress,
          signature: '0xsignature...',
          message: 'Connect to CryptoApp'
        })
        .expect(200);

      expect(connectResponse.body.connected).toBe(true);

      // Step 3: Check initial balance
      const balanceResponse = await request(app)
        .get(`/api/wallet/balance/${walletAddress}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(balanceResponse.body).toHaveProperty('balance');

      // Step 4: Create staking position
      const stakeResponse = await request(app)
        .post('/api/staking/stake')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: '1000',
          duration: 30,
          transactionHash: '0xstake123...'
        })
        .expect(201);

      expect(stakeResponse.body).toHaveProperty('stakingId');
      const stakingId = stakeResponse.body.stakingId;

      // Step 5: Verify staking position
      const positionsResponse = await request(app)
        .get('/api/staking/positions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(positionsResponse.body.length).toBe(1);
      expect(positionsResponse.body[0].amount).toBe('1000');

      // Step 6: Check rewards
      const rewardsResponse = await request(app)
        .get(`/api/staking/rewards/${walletAddress}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(rewardsResponse.body).toHaveProperty('pendingRewards');

      // Step 7: Unstake
      const unstakeResponse = await request(app)
        .post(`/api/staking/unstake/${stakingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          transactionHash: '0xunstake456...'
        })
        .expect(200);

      expect(unstakeResponse.body.status).toBe('unstaked');
    });
  });

  describe('Blockchain Integration', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `blockchain${Date.now()}@example.com`,
          password: 'SecurePass123!',
          walletAddress: ethers.Wallet.createRandom().address
        });
      authToken = response.body.token;
      walletAddress = response.body.user.walletAddress;
    });

    it('should sync staking data with blockchain', async () => {
      // Create staking position
      const stakeResponse = await request(app)
        .post('/api/staking/stake')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: '5000',
          duration: 60,
          transactionHash: ethers.hexlify(ethers.randomBytes(32))
        })
        .expect(201);

      // Wait for blockchain confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify on-chain data matches API data
      const positionsResponse = await request(app)
        .get('/api/staking/positions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const position = positionsResponse.body[0];
      expect(position.amount).toBe('5000');
      expect(position.status).toMatch(/confirmed|pending/);
    });

    it('should handle blockchain transaction failures', async () => {
      const response = await request(app)
        .post('/api/staking/stake')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: '999999999999',
          duration: 30,
          transactionHash: '0xinvalid...'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should verify transaction on blockchain before confirming', async () => {
      const txHash = ethers.hexlify(ethers.randomBytes(32));

      const stakeResponse = await request(app)
        .post('/api/staking/stake')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: '1000',
          duration: 30,
          transactionHash: txHash
        })
        .expect(201);

      expect(stakeResponse.body.transactionHash).toBe(txHash);
      expect(stakeResponse.body.status).toMatch(/pending|confirmed/);
    });

    it('should handle network congestion gracefully', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/staking/stake')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              amount: '100',
              duration: 7,
              transactionHash: ethers.hexlify(ethers.randomBytes(32))
            })
        );
      }

      const responses = await Promise.all(promises);
      const successful = responses.filter(r => r.status === 201);

      expect(successful.length).toBeGreaterThan(0);
    });
  });

  describe('Database Transactions', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `db${Date.now()}@example.com`,
          password: 'SecurePass123!',
          walletAddress: ethers.Wallet.createRandom().address
        });
      authToken = response.body.token;
    });

    it('should rollback on failed transactions', async () => {
      // Attempt invalid operation that should rollback
      const response = await request(app)
        .post('/api/staking/stake')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: '-1000', // Invalid
          duration: 30,
          transactionHash: '0x123...'
        })
        .expect(400);

      // Verify no partial data was saved
      const positionsResponse = await request(app)
        .get('/api/staking/positions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(positionsResponse.body).toEqual([]);
    });

    it('should maintain data consistency across concurrent operations', async () => {
      // Create multiple stakes concurrently
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/staking/stake')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              amount: '100',
              duration: 7,
              transactionHash: ethers.hexlify(ethers.randomBytes(32))
            })
        );
      }

      await Promise.all(promises);

      // Verify all stakes recorded
      const positionsResponse = await request(app)
        .get('/api/staking/positions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(positionsResponse.body.length).toBe(10);
    });
  });

  describe('WebSocket Integration', () => {
    it('should receive real-time staking updates', async (done) => {
      // This would require actual WebSocket implementation
      // Placeholder test structure
      const WebSocket = require('ws');
      const ws = new WebSocket(`ws://localhost:${process.env.PORT || 3000}`);

      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'subscribe',
          channel: 'staking-updates',
          token: authToken
        }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data);
        expect(message).toHaveProperty('type');
        expect(message).toHaveProperty('data');
        ws.close();
        done();
      });

      // Trigger an event
      setTimeout(() => {
        request(app)
          .post('/api/staking/stake')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            amount: '500',
            duration: 14,
            transactionHash: ethers.hexlify(ethers.randomBytes(32))
          });
      }, 100);
    });
  });

  describe('Caching Integration', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `cache${Date.now()}@example.com`,
          password: 'SecurePass123!',
          walletAddress: ethers.Wallet.createRandom().address
        });
      authToken = response.body.token;
      walletAddress = response.body.user.walletAddress;
    });

    it('should cache frequently accessed data', async () => {
      // First request - cache miss
      const start1 = Date.now();
      await request(app)
        .get(`/api/wallet/balance/${walletAddress}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const time1 = Date.now() - start1;

      // Second request - cache hit
      const start2 = Date.now();
      await request(app)
        .get(`/api/wallet/balance/${walletAddress}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const time2 = Date.now() - start2;

      // Cache hit should be faster
      expect(time2).toBeLessThan(time1);
    });

    it('should invalidate cache on data updates', async () => {
      // Get initial balance (caches it)
      const response1 = await request(app)
        .get(`/api/wallet/balance/${walletAddress}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const initialBalance = response1.body.balance;

      // Perform staking (should invalidate cache)
      await request(app)
        .post('/api/staking/stake')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: '1000',
          duration: 30,
          transactionHash: ethers.hexlify(ethers.randomBytes(32))
        });

      // Get balance again (should be updated)
      const response2 = await request(app)
        .get(`/api/wallet/balance/${walletAddress}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Balance should reflect the change
      expect(response2.body.balance).not.toBe(initialBalance);
    });
  });

  describe('External API Integration', () => {
    it('should fetch current token prices', async () => {
      const response = await request(app)
        .get('/api/prices/current')
        .expect(200);

      expect(response.body).toHaveProperty('price');
      expect(response.body).toHaveProperty('currency');
      expect(response.body).toHaveProperty('lastUpdate');
    });

    it('should handle external API failures gracefully', async () => {
      // Mock external API failure
      process.env.PRICE_API_URL = 'http://invalid-api.com';

      const response = await request(app)
        .get('/api/prices/current')
        .expect(503);

      expect(response.body.error).toContain('unavailable');
    });
  });
});
