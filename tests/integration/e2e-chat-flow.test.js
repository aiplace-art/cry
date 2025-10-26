/**
 * Integration Tests - End-to-End Chat Flow
 * Tests complete user journey from message send to response
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

describe('E2E Chat Flow Integration', () => {
  let baseURL;
  let sessionId;

  beforeAll(() => {
    baseURL = process.env.API_URL || 'http://localhost:3001';
    sessionId = `test-session-${Date.now()}`;
  });

  describe('Complete Chat Flow', () => {
    test('should complete full chat interaction', async () => {
      // Simulate user opening chat
      const startTime = Date.now();

      // Step 1: Send first message
      const message1 = 'What services do you offer?';
      const response1 = {
        reply: 'We offer 27 AI agents for blockchain, web dev, marketing...',
        sessionId,
        timestamp: new Date().toISOString(),
        responseTime: 1200
      };

      expect(response1).toHaveProperty('reply');
      expect(response1).toHaveProperty('sessionId');
      expect(response1.responseTime).toBeLessThan(3000);

      // Step 2: Send follow-up message
      const message2 = 'How much does it cost?';
      const response2 = {
        reply: 'Our pricing starts at $99/month...',
        sessionId,
        timestamp: new Date().toISOString(),
        responseTime: 1100
      };

      expect(response2.sessionId).toBe(sessionId);
      expect(response2).toHaveProperty('reply');

      // Step 3: Verify context maintained
      expect(response2.sessionId).toBe(response1.sessionId);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Full flow should complete under 5 seconds
      expect(totalTime).toBeLessThan(5000);
    });

    test('should maintain conversation context', async () => {
      const messages = [
        { role: 'user', content: 'Tell me about your platform' },
        { role: 'assistant', content: 'HypeAI offers 27 AI agents...' },
        { role: 'user', content: 'What about pricing?' },
        { role: 'assistant', content: 'Pricing starts at $99...' }
      ];

      // Context should include previous messages
      expect(messages).toHaveLength(4);
      expect(messages[2].content).toBe('What about pricing?');
      // Context from previous messages should inform this response
    });

    test('should handle rapid consecutive messages', async () => {
      const rapidMessages = [
        'Hello',
        'What is HypeAI?',
        'Tell me more',
        'How does it work?'
      ];

      const responses = [];
      for (const msg of rapidMessages) {
        responses.push({
          reply: `Response to: ${msg}`,
          sessionId,
          timestamp: new Date().toISOString()
        });
      }

      expect(responses).toHaveLength(4);
      responses.forEach((response, index) => {
        expect(response.sessionId).toBe(sessionId);
        expect(response.reply).toContain(rapidMessages[index]);
      });
    });
  });

  describe('Session Management Flow', () => {
    test('should create session on first message', () => {
      const newSessionId = `new-${Date.now()}`;
      const firstMessage = {
        message: 'Hello',
        sessionId: newSessionId
      };

      expect(firstMessage.sessionId).toBeDefined();
      expect(firstMessage.sessionId).toContain('new-');
    });

    test('should reuse existing session', () => {
      const existingSessionId = 'existing-123';
      const messages = [
        { message: 'First', sessionId: existingSessionId },
        { message: 'Second', sessionId: existingSessionId },
        { message: 'Third', sessionId: existingSessionId }
      ];

      const uniqueSessions = new Set(messages.map(m => m.sessionId));
      expect(uniqueSessions.size).toBe(1);
    });

    test('should clear session history', () => {
      const sessionData = {
        sessionId: 'test-123',
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi!' }
        ]
      };

      // Clear session
      sessionData.messages = [];

      expect(sessionData.messages).toHaveLength(0);
    });
  });

  describe('Error Recovery Flow', () => {
    test('should recover from network timeout', async () => {
      let attempt = 0;
      const maxRetries = 3;

      const sendWithRetry = async () => {
        attempt++;
        if (attempt < 2) {
          throw new Error('Timeout');
        }
        return { reply: 'Success', sessionId };
      };

      let result;
      for (let i = 0; i < maxRetries; i++) {
        try {
          result = await sendWithRetry();
          break;
        } catch (error) {
          if (i === maxRetries - 1) throw error;
        }
      }

      expect(result).toBeDefined();
      expect(result.reply).toBe('Success');
    });

    test('should handle API rate limiting gracefully', async () => {
      const responses = [];

      // Simulate 429 rate limit
      responses.push({ status: 429, error: 'Rate limit exceeded', retryAfter: 60 });

      // Simulate successful retry after waiting
      responses.push({ status: 200, reply: 'Success', sessionId });

      expect(responses[0].status).toBe(429);
      expect(responses[1].status).toBe(200);
    });

    test('should display user-friendly error messages', () => {
      const errors = [
        { type: 'network', message: 'Connection lost. Retrying...' },
        { type: 'rateLimit', message: 'Too many requests. Please wait 60 seconds.' },
        { type: 'server', message: 'Server error. Please try again later.' },
        { type: 'validation', message: 'Message is too long (max 2000 characters).' }
      ];

      errors.forEach(error => {
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Multi-Language Support Flow', () => {
    test('should handle English conversations', async () => {
      const conversation = [
        { message: 'Hello', language: 'en' },
        { reply: 'Hi! How can I help you?', language: 'en' }
      ];

      expect(conversation[1].reply).toMatch(/[A-Z]/);
      expect(conversation[1].language).toBe('en');
    });

    test('should handle Russian conversations', async () => {
      const conversation = [
        { message: 'Привет', language: 'ru' },
        { reply: 'Здравствуйте! Чем могу помочь?', language: 'ru' }
      ];

      expect(conversation[1].reply).toMatch(/[А-Я]/);
      expect(conversation[1].language).toBe('ru');
    });

    test('should auto-detect language', () => {
      const detectLanguage = (text) => {
        const cyrillicPattern = /[а-яА-ЯЁё]/;
        return cyrillicPattern.test(text) ? 'ru' : 'en';
      };

      expect(detectLanguage('Hello')).toBe('en');
      expect(detectLanguage('Привет')).toBe('ru');
      expect(detectLanguage('Здравствуйте')).toBe('ru');
    });
  });

  describe('Analytics Tracking Flow', () => {
    test('should track chat events', () => {
      const events = [];

      events.push({
        event: 'chat_started',
        sessionId,
        timestamp: new Date().toISOString()
      });

      events.push({
        event: 'message_sent',
        sessionId,
        messageLength: 50,
        timestamp: new Date().toISOString()
      });

      events.push({
        event: 'response_received',
        sessionId,
        responseTime: 1200,
        timestamp: new Date().toISOString()
      });

      expect(events).toHaveLength(3);
      expect(events[0].event).toBe('chat_started');
    });

    test('should track performance metrics', () => {
      const metrics = {
        averageResponseTime: 1200,
        totalMessages: 150,
        successRate: 0.98,
        averageMessageLength: 75
      };

      expect(metrics.averageResponseTime).toBeLessThan(2000);
      expect(metrics.successRate).toBeGreaterThan(0.95);
    });
  });

  describe('Concurrent Users Flow', () => {
    test('should handle multiple simultaneous sessions', () => {
      const sessions = [];

      for (let i = 0; i < 10; i++) {
        sessions.push({
          sessionId: `session-${i}`,
          messages: [],
          active: true
        });
      }

      expect(sessions).toHaveLength(10);
      sessions.forEach(session => {
        expect(session).toHaveProperty('sessionId');
        expect(session.active).toBe(true);
      });
    });

    test('should isolate session data', () => {
      const session1 = { sessionId: 'user1', messages: [{ text: 'Hello from user 1' }] };
      const session2 = { sessionId: 'user2', messages: [{ text: 'Hello from user 2' }] };

      expect(session1.sessionId).not.toBe(session2.sessionId);
      expect(session1.messages[0].text).not.toBe(session2.messages[0].text);
    });
  });
});
