/**
 * Backend API Endpoints Test Suite
 * Comprehensive tests for all 4 production-ready endpoints
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { ethers } from 'ethers';

// ============================================================================
// Test Configuration
// ============================================================================

const API_BASE = 'http://localhost:3000/api';
const TEST_PRIVATE_KEY = '0x' + '1'.repeat(64); // Test private key
const TEST_WALLET = new ethers.Wallet(TEST_PRIVATE_KEY);
const TEST_ADDRESS = TEST_WALLET.address;

let authToken: string;

// ============================================================================
// Helper Functions
// ============================================================================

async function generateAuthSignature(): Promise<{
  message: string;
  signature: string;
  timestamp: number;
}> {
  const timestamp = Date.now();
  const message = `Sign this message to authenticate with HypeAI Dashboard\n\nAddress: ${TEST_ADDRESS}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
  const signature = await TEST_WALLET.signMessage(message);

  return { message, signature, timestamp };
}

async function authenticateUser(): Promise<string> {
  const { message, signature, timestamp } = await generateAuthSignature();

  const response = await fetch(`${API_BASE}/auth/web3`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: TEST_ADDRESS,
      signature,
      message,
      timestamp,
    }),
  });

  const data = await response.json();
  return data.token;
}

// ============================================================================
// Test Suite: Authentication Endpoint
// ============================================================================

describe('POST /api/auth/web3', () => {
  test('should authenticate with valid signature', async () => {
    const { message, signature, timestamp } = await generateAuthSignature();

    const response = await fetch(`${API_BASE}/auth/web3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: TEST_ADDRESS,
        signature,
        message,
        timestamp,
      }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect(data.address).toBe(TEST_ADDRESS.toLowerCase());
    expect(data.expiresIn).toBe(86400);
  });

  test('should reject invalid signature', async () => {
    const timestamp = Date.now();
    const message = `Sign this message to authenticate with HypeAI Dashboard\n\nAddress: ${TEST_ADDRESS}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
    const invalidSignature = '0x' + '0'.repeat(130);

    const response = await fetch(`${API_BASE}/auth/web3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: TEST_ADDRESS,
        signature: invalidSignature,
        message,
        timestamp,
      }),
    });

    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid signature');
  });

  test('should reject malformed address', async () => {
    const { message, signature, timestamp } = await generateAuthSignature();

    const response = await fetch(`${API_BASE}/auth/web3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: 'invalid-address',
        signature,
        message,
        timestamp,
      }),
    });

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
  });

  test('should reject signature replay attack', async () => {
    const { message, signature, timestamp } = await generateAuthSignature();

    // First request succeeds
    const response1 = await fetch(`${API_BASE}/auth/web3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: TEST_ADDRESS,
        signature,
        message,
        timestamp,
      }),
    });

    expect(response1.status).toBe(200);

    // Second request with same signature fails
    const response2 = await fetch(`${API_BASE}/auth/web3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: TEST_ADDRESS,
        signature,
        message,
        timestamp,
      }),
    });

    expect(response2.status).toBe(400);

    const data = await response2.json();
    expect(data.error).toContain('already used');
  });

  test('should enforce rate limiting', async () => {
    const requests = [];

    // Make 10 requests rapidly (limit is 5 per minute)
    for (let i = 0; i < 10; i++) {
      const { message, signature, timestamp } = await generateAuthSignature();
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to generate different sigs

      requests.push(
        fetch(`${API_BASE}/auth/web3`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: TEST_ADDRESS,
            signature,
            message,
            timestamp,
          }),
        })
      );
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);

    expect(rateLimited.length).toBeGreaterThan(0);
  }, 30000);
});

// ============================================================================
// Test Suite: Purchase Endpoint
// ============================================================================

describe('POST /api/private-sale/purchase', () => {
  beforeAll(async () => {
    authToken = await authenticateUser();
  });

  test('should process USDT purchase successfully', async () => {
    const response = await fetch(`${API_BASE}/private-sale/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        amount: 1000,
        paymentMethod: 'USDT',
      }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.txHash).toBeDefined();
    expect(data.tokensReceived).toBeGreaterThan(0);
    expect(data.bonusTokens).toBeGreaterThan(0);
    expect(data.totalTokens).toBe(data.tokensReceived + data.bonusTokens);
    expect(data.bonusPercentage).toBe(20); // $1k = 20% bonus
  });

  test('should process BNB purchase successfully', async () => {
    const response = await fetch(`${API_BASE}/private-sale/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        amount: 5000,
        paymentMethod: 'BNB',
      }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.bonusPercentage).toBe(23); // $5k = 23% bonus
  });

  test('should apply correct bonus tiers', async () => {
    const testCases = [
      { amount: 1000, expectedBonus: 20 },
      { amount: 5000, expectedBonus: 23 },
      { amount: 10000, expectedBonus: 25 },
      { amount: 25000, expectedBonus: 27 },
      { amount: 50000, expectedBonus: 30 },
    ];

    for (const testCase of testCases) {
      const token = await authenticateUser(); // New token for each request

      const response = await fetch(`${API_BASE}/private-sale/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: testCase.amount,
          paymentMethod: 'USDT',
        }),
      });

      const data = await response.json();
      expect(data.bonusPercentage).toBe(testCase.expectedBonus);
    }
  }, 60000);

  test('should reject purchase below minimum', async () => {
    const response = await fetch(`${API_BASE}/private-sale/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        amount: 50, // Below $100 minimum
        paymentMethod: 'USDT',
      }),
    });

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('Minimum investment');
  });

  test('should reject unauthenticated requests', async () => {
    const response = await fetch(`${API_BASE}/private-sale/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No authorization header
      },
      body: JSON.stringify({
        amount: 1000,
        paymentMethod: 'USDT',
      }),
    });

    expect(response.status).toBe(401);
  });

  test('should enforce rate limiting', async () => {
    const requests = [];

    // Make 5 purchase requests rapidly (limit is 3 per minute)
    for (let i = 0; i < 5; i++) {
      requests.push(
        fetch(`${API_BASE}/private-sale/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            amount: 1000,
            paymentMethod: 'USDT',
          }),
        })
      );
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);

    expect(rateLimited.length).toBeGreaterThan(0);
  }, 30000);
});

// ============================================================================
// Test Suite: Purchase History Endpoint
// ============================================================================

describe('GET /api/private-sale/purchases', () => {
  beforeAll(async () => {
    authToken = await authenticateUser();

    // Make a test purchase first
    await fetch(`${API_BASE}/private-sale/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        amount: 2500,
        paymentMethod: 'USDT',
        email: 'test@hypeai.com',
      }),
    });
  });

  test('should fetch purchase history', async () => {
    const response = await fetch(`${API_BASE}/private-sale/purchases`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.purchases)).toBe(true);
    expect(data.totalInvested).toBeGreaterThan(0);
    expect(data.totalTokens).toBeGreaterThan(0);
  });

  test('should include vesting information', async () => {
    const response = await fetch(`${API_BASE}/private-sale/purchases`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (data.purchases.length > 0) {
      const purchase = data.purchases[0];
      expect(purchase).toHaveProperty('vestedTokens');
      expect(purchase).toHaveProperty('claimedTokens');
      expect(purchase.vestedTokens).toBeLessThanOrEqual(purchase.totalTokens);
    }
  });

  test('should reject unauthenticated requests', async () => {
    const response = await fetch(`${API_BASE}/private-sale/purchases`);

    expect(response.status).toBe(401);
  });
});

// ============================================================================
// Test Suite: Stats Endpoint
// ============================================================================

describe('GET /api/private-sale/stats', () => {
  test('should fetch presale statistics', async () => {
    const response = await fetch(`${API_BASE}/private-sale/stats`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.stats).toBeDefined();
    expect(data.stats.totalRaised).toBeGreaterThanOrEqual(0);
    expect(data.stats.goal).toBe(5_000_000);
    expect(data.stats.progress).toBeGreaterThanOrEqual(0);
    expect(data.stats.progress).toBeLessThanOrEqual(100);
    expect(data.stats.participantsCount).toBeGreaterThanOrEqual(0);
    expect(data.stats.tokenPrice).toBeGreaterThan(0);
  });

  test('should include bonus tiers', async () => {
    const response = await fetch(`${API_BASE}/private-sale/stats`);
    const data = await response.json();

    expect(Array.isArray(data.stats.bonusTiers)).toBe(true);
    expect(data.stats.bonusTiers.length).toBe(5);

    const bonusTiers = data.stats.bonusTiers;
    expect(bonusTiers[0].min).toBe(50000);
    expect(bonusTiers[0].bonus).toBe(30);
  });

  test('should include BNB price', async () => {
    const response = await fetch(`${API_BASE}/private-sale/stats`);
    const data = await response.json();

    expect(data.stats.bnbPriceUSD).toBeGreaterThan(0);
    expect(data.stats.totalBNBRaised).toBeGreaterThanOrEqual(0);
    expect(data.stats.totalUSDTRaised).toBeGreaterThanOrEqual(0);
  });

  test('should include cache headers', async () => {
    const response = await fetch(`${API_BASE}/private-sale/stats`);

    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toContain('s-maxage=30');
  });

  test('should work without authentication', async () => {
    const response = await fetch(`${API_BASE}/private-sale/stats`);

    expect(response.status).toBe(200);
    // Stats are public, no auth required
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Full Purchase Flow Integration', () => {
  test('should complete full purchase flow', async () => {
    // 1. Authenticate
    const token = await authenticateUser();
    expect(token).toBeDefined();

    // 2. Get initial stats
    const statsResponse1 = await fetch(`${API_BASE}/private-sale/stats`);
    const stats1 = await statsResponse1.json();
    const initialRaised = stats1.stats.totalRaised;
    const initialParticipants = stats1.stats.participantsCount;

    // 3. Make purchase
    const purchaseResponse = await fetch(`${API_BASE}/private-sale/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: 10000,
        paymentMethod: 'USDT',
        email: 'integration-test@hypeai.com',
      }),
    });

    expect(purchaseResponse.status).toBe(200);
    const purchaseData = await purchaseResponse.json();
    expect(purchaseData.success).toBe(true);

    // 4. Verify purchase history
    const historyResponse = await fetch(`${API_BASE}/private-sale/purchases`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const history = await historyResponse.json();
    expect(history.totalInvested).toBeGreaterThan(0);

    // 5. Verify stats updated
    const statsResponse2 = await fetch(`${API_BASE}/private-sale/stats`);
    const stats2 = await statsResponse2.json();
    expect(stats2.stats.totalRaised).toBeGreaterThanOrEqual(initialRaised);

    console.log('Full flow completed successfully!');
  }, 60000);
});

// ============================================================================
// Performance Tests
// ============================================================================

describe('Performance Tests', () => {
  test('stats endpoint should respond in < 200ms', async () => {
    const start = Date.now();
    const response = await fetch(`${API_BASE}/private-sale/stats`);
    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(200);
  });

  test('purchase history should respond in < 200ms', async () => {
    const token = await authenticateUser();

    const start = Date.now();
    const response = await fetch(`${API_BASE}/private-sale/purchases`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(200);
  });
});
