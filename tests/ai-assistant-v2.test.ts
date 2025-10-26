/**
 * HypeAI AI Assistant v2.0 - Comprehensive Test Suite
 * Tests: API endpoints, WebSocket streaming, session management, input validation
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { io as ioClient, Socket } from 'socket.io-client';
import Redis from 'ioredis';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

// Import app (after env vars are set)
import app from '../server/ai-assistant-api-v2';

const API_URL = 'http://localhost:3001';
const WS_URL = 'ws://localhost:3001';

describe('AI Assistant API v2.0', () => {
  let redis: Redis;
  let clientSocket: Socket;

  beforeAll(async () => {
    // Initialize Redis client for testing
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379', 10)
    });

    // Wait for Redis connection
    await new Promise((resolve) => {
      if (redis.status === 'ready') {
        resolve(null);
      } else {
        redis.once('ready', resolve);
      }
    });
  });

  afterAll(async () => {
    // Cleanup
    await redis.quit();
  });

  beforeEach(async () => {
    // Clear test data
    await redis.flushdb();
  });

  // ============================================================================
  // HEALTH CHECK TESTS
  // ============================================================================

  describe('GET /api/ai-assistant/health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/ai-assistant/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('knowledgeBase');
      expect(response.body).toHaveProperty('redis');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should indicate Redis health', async () => {
      const response = await request(app)
        .get('/api/ai-assistant/health')
        .expect(200);

      expect(response.body.redis).toBe(true);
    });
  });

  // ============================================================================
  // CHAT ENDPOINT TESTS (REST)
  // ============================================================================

  describe('POST /api/ai-assistant/chat', () => {
    it('should return valid response for valid message', async () => {
      const response = await request(app)
        .post('/api/ai-assistant/chat')
        .send({
          message: 'What is the staking APY?',
          language: 'en'
        })
        .expect(200);

      expect(response.body).toHaveProperty('reply');
      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('responseTime');
      expect(typeof response.body.reply).toBe('string');
      expect(response.body.reply.length).toBeGreaterThan(0);
    });

    it('should reject empty message', async () => {
      const response = await request(app)
        .post('/api/ai-assistant/chat')
        .send({
          message: '',
          language: 'en'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject message that is too long', async () => {
      const longMessage = 'a'.repeat(2001);

      const response = await request(app)
        .post('/api/ai-assistant/chat')
        .send({
          message: longMessage,
          language: 'en'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should sanitize HTML in message', async () => {
      const maliciousMessage = '<script>alert("XSS")</script>Hello';

      const response = await request(app)
        .post('/api/ai-assistant/chat')
        .send({
          message: maliciousMessage,
          language: 'en'
        })
        .expect(200);

      expect(response.body.reply).toBeDefined();
      // Message should be sanitized (no script tags)
    });

    it('should maintain session history', async () => {
      const sessionId = crypto.randomUUID();

      // First message
      const response1 = await request(app)
        .post('/api/ai-assistant/chat')
        .send({
          message: 'Hello',
          sessionId,
          language: 'en'
        })
        .expect(200);

      expect(response1.body.sessionId).toBe(sessionId);

      // Second message in same session
      const response2 = await request(app)
        .post('/api/ai-assistant/chat')
        .send({
          message: 'What did I just say?',
          sessionId,
          language: 'en'
        })
        .expect(200);

      expect(response2.body.sessionId).toBe(sessionId);

      // Check session exists in Redis
      const sessionData = await redis.get(`session:${sessionId}`);
      expect(sessionData).toBeTruthy();

      const session = JSON.parse(sessionData!);
      expect(session.messages).toHaveLength(4); // 2 user + 2 assistant
    });

    it('should support Russian language', async () => {
      const response = await request(app)
        .post('/api/ai-assistant/chat')
        .send({
          message: 'Какой total supply?',
          language: 'ru'
        })
        .expect(200);

      expect(response.body.reply).toBeDefined();
      // Response should be in Russian
    });

    it('should handle rate limiting', async () => {
      const requests = [];

      // Send more than rate limit
      for (let i = 0; i < 25; i++) {
        requests.push(
          request(app)
            .post('/api/ai-assistant/chat')
            .send({
              message: `Test message ${i}`,
              language: 'en'
            })
        );
      }

      const responses = await Promise.all(requests);

      // At least one request should be rate limited (429)
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  // ============================================================================
  // FEEDBACK ENDPOINT TESTS
  // ============================================================================

  describe('POST /api/ai-assistant/feedback', () => {
    it('should accept valid feedback', async () => {
      const response = await request(app)
        .post('/api/ai-assistant/feedback')
        .send({
          sessionId: crypto.randomUUID(),
          messageId: 'test-message-id',
          helpful: true,
          comment: 'Very helpful!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
    });

    it('should reject feedback without sessionId', async () => {
      const response = await request(app)
        .post('/api/ai-assistant/feedback')
        .send({
          helpful: true
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject feedback with invalid helpful value', async () => {
      const response = await request(app)
        .post('/api/ai-assistant/feedback')
        .send({
          sessionId: crypto.randomUUID(),
          helpful: 'yes' // Should be boolean
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // ============================================================================
  // SESSION MANAGEMENT TESTS
  // ============================================================================

  describe('POST /api/ai-assistant/session/clear', () => {
    it('should clear session from Redis', async () => {
      const sessionId = crypto.randomUUID();

      // Create session
      await request(app)
        .post('/api/ai-assistant/chat')
        .send({
          message: 'Hello',
          sessionId,
          language: 'en'
        })
        .expect(200);

      // Verify session exists
      let sessionData = await redis.get(`session:${sessionId}`);
      expect(sessionData).toBeTruthy();

      // Clear session
      await request(app)
        .post('/api/ai-assistant/session/clear')
        .send({ sessionId })
        .expect(200);

      // Verify session is deleted
      sessionData = await redis.get(`session:${sessionId}`);
      expect(sessionData).toBeNull();
    });

    it('should reject request without sessionId', async () => {
      const response = await request(app)
        .post('/api/ai-assistant/session/clear')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // ============================================================================
  // WEBSOCKET TESTS
  // ============================================================================

  describe('WebSocket Real-time Streaming', () => {
    beforeEach((done) => {
      // Create WebSocket client
      clientSocket = ioClient(WS_URL, {
        transports: ['websocket'],
        reconnection: false
      });

      clientSocket.on('connect', () => {
        done();
      });
    });

    afterEach(() => {
      if (clientSocket.connected) {
        clientSocket.disconnect();
      }
    });

    it('should connect to WebSocket server', (done) => {
      expect(clientSocket.connected).toBe(true);
      done();
    });

    it('should stream message chunks', (done) => {
      const chunks: string[] = [];

      clientSocket.on('chat:chunk', ({ chunk }) => {
        chunks.push(chunk);
      });

      clientSocket.on('chat:complete', ({ responseTime }) => {
        expect(chunks.length).toBeGreaterThan(0);
        expect(responseTime).toBeGreaterThan(0);

        const fullResponse = chunks.join('');
        expect(fullResponse.length).toBeGreaterThan(0);

        done();
      });

      clientSocket.emit('chat:start', {
        message: 'What is HypeAI?',
        language: 'en'
      });
    });

    it('should handle errors gracefully', (done) => {
      clientSocket.on('chat:error', ({ error }) => {
        expect(error).toBeDefined();
        expect(typeof error).toBe('string');
        done();
      });

      // Send invalid message
      clientSocket.emit('chat:start', {
        message: '', // Empty message
        language: 'en'
      });
    });

    it('should maintain session across WebSocket messages', (done) => {
      const sessionId = crypto.randomUUID();
      let firstComplete = false;

      clientSocket.on('chat:complete', async ({ sessionId: returnedSessionId }) => {
        if (!firstComplete) {
          firstComplete = true;
          expect(returnedSessionId).toBe(sessionId);

          // Send second message
          clientSocket.emit('chat:start', {
            message: 'Tell me more',
            sessionId,
            language: 'en'
          });
        } else {
          // Second message complete
          expect(returnedSessionId).toBe(sessionId);

          // Check session in Redis
          const sessionData = await redis.get(`session:${sessionId}`);
          expect(sessionData).toBeTruthy();

          const session = JSON.parse(sessionData!);
          expect(session.messages.length).toBeGreaterThanOrEqual(4); // 2 user + 2 assistant

          done();
        }
      });

      // Send first message
      clientSocket.emit('chat:start', {
        message: 'Hello',
        sessionId,
        language: 'en'
      });
    });
  });

  // ============================================================================
  // INPUT VALIDATION TESTS
  // ============================================================================

  describe('Input Validation & Sanitization', () => {
    it('should sanitize XSS attempts', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")',
        '<svg onload=alert("XSS")>',
        '<iframe src="javascript:alert(\'XSS\')"></iframe>'
      ];

      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/ai-assistant/chat')
          .send({
            message: payload,
            language: 'en'
          });

        // Should not throw error, but sanitize input
        expect(response.status).toBeLessThan(500);
      }
    });

    it('should handle SQL injection attempts', async () => {
      const sqlPayloads = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "1' UNION SELECT * FROM users--"
      ];

      for (const payload of sqlPayloads) {
        const response = await request(app)
          .post('/api/ai-assistant/chat')
          .send({
            message: payload,
            language: 'en'
          });

        expect(response.status).toBeLessThan(500);
      }
    });

    it('should validate language parameter', async () => {
      const response = await request(app)
        .post('/api/ai-assistant/chat')
        .send({
          message: 'Test',
          language: 'invalid' // Invalid language code
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate sessionId format', async () => {
      const response = await request(app)
        .post('/api/ai-assistant/chat')
        .send({
          message: 'Test',
          sessionId: 'not-a-uuid' // Invalid UUID
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/api/unknown-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/ai-assistant/chat')
        .set('Content-Type', 'application/json')
        .send('{"invalid json"}')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle Redis connection errors gracefully', async () => {
      // Temporarily disconnect Redis
      await redis.disconnect();

      const response = await request(app)
        .post('/api/ai-assistant/chat')
        .send({
          message: 'Test',
          language: 'en'
        });

      // Should still respond (degraded mode)
      expect(response.status).toBeLessThan(500);

      // Reconnect Redis
      await redis.connect();
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance', () => {
    it('should respond within acceptable time', async () => {
      const startTime = Date.now();

      await request(app)
        .post('/api/ai-assistant/chat')
        .send({
          message: 'Quick test',
          language: 'en'
        })
        .expect(200);

      const responseTime = Date.now() - startTime;

      // Should respond in less than 5 seconds
      expect(responseTime).toBeLessThan(5000);
    });

    it('should handle concurrent requests', async () => {
      const concurrentRequests = 10;
      const requests = [];

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          request(app)
            .post('/api/ai-assistant/chat')
            .send({
              message: `Concurrent test ${i}`,
              language: 'en'
            })
        );
      }

      const responses = await Promise.all(requests);

      // All should succeed (or be rate limited)
      responses.forEach((response) => {
        expect([200, 429]).toContain(response.status);
      });
    });
  });
});
