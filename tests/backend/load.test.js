const autocannon = require('autocannon');
const { expect } = require('chai');

describe('Load Testing', () => {
  const baseURL = process.env.API_URL || 'http://localhost:3000';
  let authToken;

  before(async () => {
    // Get auth token for authenticated endpoints
    const response = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'loadtest@example.com',
        password: 'LoadTest123!'
      })
    });
    const data = await response.json();
    authToken = data.token;
  });

  describe('API Endpoints Performance', () => {
    it('should handle 1000 requests/second to health endpoint', async () => {
      const result = await autocannon({
        url: `${baseURL}/api/health`,
        connections: 100,
        duration: 30,
        pipelining: 1
      });

      console.log('Health endpoint results:', result);
      expect(result.errors).to.equal(0);
      expect(result.timeouts).to.equal(0);
      expect(result.requests.average).to.be.greaterThan(1000);
    });

    it('should handle concurrent login requests', async () => {
      const result = await autocannon({
        url: `${baseURL}/api/auth/login`,
        connections: 50,
        duration: 20,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'loadtest@example.com',
          password: 'LoadTest123!'
        })
      });

      console.log('Login endpoint results:', result);
      expect(result.errors).to.equal(0);
      expect(result['2xx']).to.be.greaterThan(0);
      expect(result.latency.p99).to.be.lessThan(1000); // 99th percentile < 1s
    });

    it('should handle authenticated requests efficiently', async () => {
      const result = await autocannon({
        url: `${baseURL}/api/staking/positions`,
        connections: 75,
        duration: 30,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      console.log('Authenticated endpoint results:', result);
      expect(result.errors).to.equal(0);
      expect(result['2xx']).to.be.greaterThan(0);
      expect(result.latency.mean).to.be.lessThan(500);
    });

    it('should handle mixed workload', async () => {
      const result = await autocannon({
        url: baseURL,
        connections: 100,
        duration: 30,
        requests: [
          {
            method: 'GET',
            path: '/api/health'
          },
          {
            method: 'GET',
            path: '/api/prices/current'
          },
          {
            method: 'GET',
            path: '/api/staking/positions',
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        ]
      });

      console.log('Mixed workload results:', result);
      expect(result.errors).to.be.lessThan(result.requests.total * 0.01); // <1% error rate
    });
  });

  describe('Database Performance', () => {
    it('should handle concurrent database reads', async () => {
      const result = await autocannon({
        url: `${baseURL}/api/staking/positions`,
        connections: 200,
        duration: 30,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      console.log('Database read results:', result);
      expect(result.errors).to.equal(0);
      expect(result.latency.p95).to.be.lessThan(800);
    });

    it('should handle concurrent writes', async () => {
      const result = await autocannon({
        url: `${baseURL}/api/staking/stake`,
        connections: 50,
        duration: 20,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: '100',
          duration: 7,
          transactionHash: '0x' + 'a'.repeat(64)
        })
      });

      console.log('Database write results:', result);
      expect(result.errors / result.requests.total).to.be.lessThan(0.05); // <5% error rate
    });
  });

  describe('Response Times', () => {
    it('should maintain low latency under load', async () => {
      const result = await autocannon({
        url: `${baseURL}/api/wallet/balance/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`,
        connections: 100,
        duration: 30,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(result.latency.mean).to.be.lessThan(300);
      expect(result.latency.p50).to.be.lessThan(200);
      expect(result.latency.p95).to.be.lessThan(600);
      expect(result.latency.p99).to.be.lessThan(1000);
    });
  });

  describe('Stress Testing', () => {
    it('should handle burst traffic', async () => {
      const result = await autocannon({
        url: `${baseURL}/api/health`,
        connections: 500,
        duration: 10,
        pipelining: 10
      });

      console.log('Burst traffic results:', result);
      expect(result.errors).to.be.lessThan(result.requests.total * 0.02);
    });

    it('should recover from overload', async () => {
      // Create overload
      const overload = autocannon({
        url: `${baseURL}/api/health`,
        connections: 1000,
        duration: 10
      });

      await overload;

      // Wait for recovery
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Test normal operation
      const recovery = await autocannon({
        url: `${baseURL}/api/health`,
        connections: 10,
        duration: 5
      });

      expect(recovery.errors).to.equal(0);
      expect(recovery['2xx']).to.be.greaterThan(0);
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should not leak memory during sustained load', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      await autocannon({
        url: `${baseURL}/api/health`,
        connections: 100,
        duration: 60
      });

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      console.log(`Memory increase: ${memoryIncrease / 1024 / 1024} MB`);
      expect(memoryIncrease).to.be.lessThan(100 * 1024 * 1024); // <100MB increase
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits correctly', async () => {
      const result = await autocannon({
        url: `${baseURL}/api/auth/login`,
        connections: 1,
        duration: 10,
        amount: 100,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrong'
        })
      });

      const rateLimited = result['429'] || 0;
      expect(rateLimited).to.be.greaterThan(0);
    });
  });
});
