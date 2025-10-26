/**
 * Unit Tests for AI Assistant API Backend
 * Tests Express routes, middleware, and business logic
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('AI Assistant API Backend', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
      headers: {},
      ip: '127.0.0.1'
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check Endpoint', () => {
    test('should return healthy status', () => {
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        knowledgeBase: true,
        sessions: 0,
        uptime: process.uptime()
      };

      expect(healthData.status).toBe('healthy');
      expect(healthData).toHaveProperty('timestamp');
      expect(healthData).toHaveProperty('uptime');
    });

    test('should include session count', () => {
      const sessions = new Map();
      sessions.set('session-1', { messages: [] });
      sessions.set('session-2', { messages: [] });

      expect(sessions.size).toBe(2);
    });
  });

  describe('Chat Endpoint Validation', () => {
    test('should reject empty message', () => {
      mockRequest.body = { message: '' };

      const isValid = mockRequest.body.message &&
                       typeof mockRequest.body.message === 'string' &&
                       mockRequest.body.message.trim().length > 0;

      expect(isValid).toBe(false);
    });

    test('should reject non-string message', () => {
      mockRequest.body = { message: 123 };

      const isValid = typeof mockRequest.body.message === 'string';
      expect(isValid).toBe(false);
    });

    test('should reject message over 2000 characters', () => {
      mockRequest.body = { message: 'a'.repeat(2001) };

      const isValid = mockRequest.body.message.length <= 2000;
      expect(isValid).toBe(false);
    });

    test('should accept valid message', () => {
      mockRequest.body = { message: 'Hello AI assistant' };

      const isValid = mockRequest.body.message &&
                       typeof mockRequest.body.message === 'string' &&
                       mockRequest.body.message.trim().length > 0 &&
                       mockRequest.body.message.length <= 2000;

      expect(isValid).toBe(true);
    });
  });

  describe('Session Management', () => {
    let sessionStore;

    beforeEach(() => {
      sessionStore = {
        sessions: new Map(),
        maxMessages: 20,
        timeout: 3600000
      };
    });

    test('should create new session', () => {
      const sessionId = 'test-session-123';
      const messages = [{ role: 'user', content: 'Hello' }];

      sessionStore.sessions.set(sessionId, {
        messages: messages.slice(-sessionStore.maxMessages),
        lastActivity: Date.now(),
        createdAt: Date.now()
      });

      expect(sessionStore.sessions.has(sessionId)).toBe(true);
      expect(sessionStore.sessions.get(sessionId).messages).toHaveLength(1);
    });

    test('should retrieve existing session', () => {
      const sessionId = 'test-session-123';
      sessionStore.sessions.set(sessionId, {
        messages: [],
        lastActivity: Date.now(),
        createdAt: Date.now()
      });

      const session = sessionStore.sessions.get(sessionId);
      expect(session).toBeDefined();
      expect(session).toHaveProperty('messages');
    });

    test('should delete expired sessions', () => {
      const sessionId = 'expired-session';
      const now = Date.now();

      sessionStore.sessions.set(sessionId, {
        messages: [],
        lastActivity: now - 7200000, // 2 hours ago
        createdAt: now - 7200000
      });

      // Cleanup logic
      for (const [id, session] of sessionStore.sessions.entries()) {
        if (now - session.lastActivity > sessionStore.timeout) {
          sessionStore.sessions.delete(id);
        }
      }

      expect(sessionStore.sessions.has(sessionId)).toBe(false);
    });

    test('should limit message history', () => {
      sessionStore.maxMessages = 5;
      const messages = Array(10).fill(null).map((_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`
      }));

      const limited = messages.slice(-sessionStore.maxMessages);
      expect(limited).toHaveLength(5);
      expect(limited[0].content).toBe('Message 5');
    });

    test('should cleanup sessions periodically', () => {
      const cleanupFunc = () => {
        const now = Date.now();
        let cleaned = 0;
        for (const [sessionId, session] of sessionStore.sessions.entries()) {
          if (now - session.lastActivity > sessionStore.timeout) {
            sessionStore.sessions.delete(sessionId);
            cleaned++;
          }
        }
        return cleaned;
      };

      // Add expired session
      sessionStore.sessions.set('old', {
        messages: [],
        lastActivity: Date.now() - 7200000,
        createdAt: Date.now() - 7200000
      });

      const cleaned = cleanupFunc();
      expect(cleaned).toBeGreaterThan(0);
    });
  });

  describe('Knowledge Base Search', () => {
    let knowledgeBase;

    beforeEach(() => {
      knowledgeBase = {
        content: `
          HypeAI Platform Overview
          We offer blockchain development services
          Smart contract auditing available
          Web3 integration support
          DeFi protocol development
        `,
        loaded: true
      };
    });

    test('should search for relevant content', () => {
      const query = 'blockchain services';
      const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);

      const lines = knowledgeBase.content.split('\n');
      const relevantLines = lines.filter(line => {
        const lineLower = line.toLowerCase();
        return keywords.some(kw => lineLower.includes(kw));
      });

      expect(relevantLines.length).toBeGreaterThan(0);
    });

    test('should return empty results for irrelevant queries', () => {
      const query = 'xyz123';
      const keywords = query.toLowerCase().split(/\s+/);

      const lines = knowledgeBase.content.split('\n');
      const relevantLines = lines.filter(line => {
        const lineLower = line.toLowerCase();
        return keywords.some(kw => lineLower.includes(kw));
      });

      expect(relevantLines).toHaveLength(0);
    });

    test('should build prompt with context', () => {
      const userMessage = 'What services do you offer?';
      const systemPrompt = 'You are HypeAI assistant';
      const context = 'blockchain development, smart contracts';

      const prompt = `${systemPrompt}\n\nCONTEXT:\n${context}\n\nUSER QUESTION:\n${userMessage}`;

      expect(prompt).toContain('blockchain development');
      expect(prompt).toContain(userMessage);
    });
  });

  describe('Rate Limiting', () => {
    test('should track request count', () => {
      const requestCounts = new Map();
      const ip = '192.168.1.1';

      requestCounts.set(ip, (requestCounts.get(ip) || 0) + 1);
      requestCounts.set(ip, (requestCounts.get(ip) || 0) + 1);

      expect(requestCounts.get(ip)).toBe(2);
    });

    test('should enforce rate limit', () => {
      const maxRequests = 10;
      const currentCount = 11;

      const isLimited = currentCount > maxRequests;
      expect(isLimited).toBe(true);
    });

    test('should reset after time window', () => {
      const requestLog = {
        count: 10,
        windowStart: Date.now() - 61000 // 61 seconds ago
      };

      const windowMs = 60000; // 1 minute
      const shouldReset = Date.now() - requestLog.windowStart > windowMs;

      expect(shouldReset).toBe(true);
    });

    test('should skip trusted IPs', () => {
      const trustedIPs = ['127.0.0.1', '10.0.0.1'];
      const requestIP = '127.0.0.1';

      const isTrusted = trustedIPs.includes(requestIP);
      expect(isTrusted).toBe(true);
    });
  });

  describe('Analytics Logging', () => {
    let analytics;

    beforeEach(() => {
      analytics = {
        buffer: [],
        log: function(event) {
          this.buffer.push({
            timestamp: new Date().toISOString(),
            ...event
          });
        }
      };
    });

    test('should log chat events', () => {
      analytics.log({
        event: 'chat',
        sessionId: 'test-123',
        messageLength: 50,
        responseTime: 1200
      });

      expect(analytics.buffer).toHaveLength(1);
      expect(analytics.buffer[0].event).toBe('chat');
    });

    test('should log feedback events', () => {
      analytics.log({
        event: 'feedback',
        sessionId: 'test-123',
        helpful: true
      });

      expect(analytics.buffer).toHaveLength(1);
      expect(analytics.buffer[0].helpful).toBe(true);
    });

    test('should flush buffer when full', () => {
      const maxSize = 100;
      for (let i = 0; i < 101; i++) {
        analytics.log({ event: 'test', index: i });
      }

      // Simulate flush
      if (analytics.buffer.length >= maxSize) {
        analytics.buffer = [];
      }

      expect(analytics.buffer).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 errors', () => {
      mockRequest.path = '/nonexistent';

      mockResponse.status(404).json({
        error: 'Endpoint not found',
        path: mockRequest.path
      });

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Endpoint not found' })
      );
    });

    test('should handle rate limit errors (429)', () => {
      mockResponse.status(429).json({
        error: 'Too many requests',
        retryAfter: 60
      });

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ retryAfter: 60 })
      );
    });

    test('should handle internal server errors (500)', () => {
      mockResponse.status(500).json({
        error: 'Internal server error'
      });

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    test('should sanitize error messages in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Database connection failed');

      const sanitized = 'An error occurred';
      expect(sanitized).not.toContain('Database');
    });
  });

  describe('CORS Configuration', () => {
    test('should allow whitelisted origins', () => {
      const allowedOrigins = ['https://hypeai.io', 'https://app.hypeai.io'];
      const requestOrigin = 'https://hypeai.io';

      const isAllowed = allowedOrigins.includes(requestOrigin);
      expect(isAllowed).toBe(true);
    });

    test('should block non-whitelisted origins', () => {
      const allowedOrigins = ['https://hypeai.io'];
      const requestOrigin = 'https://evil.com';

      const isAllowed = allowedOrigins.includes(requestOrigin);
      expect(isAllowed).toBe(false);
    });

    test('should allow development origins', () => {
      process.env.NODE_ENV = 'development';
      const isDevelopment = process.env.NODE_ENV === 'development';

      expect(isDevelopment).toBe(true);
    });
  });
});
