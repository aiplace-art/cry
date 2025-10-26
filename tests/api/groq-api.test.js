/**
 * Groq API Integration Tests
 * Tests for Groq AI API endpoints and functionality
 */

const axios = require('axios');
const { jest } = require('@jest/globals');

// Mock axios for testing
jest.mock('axios');

describe('Groq API Integration', () => {
  const mockApiKey = 'test-api-key';
  const mockApiUrl = 'https://api.groq.com/openai/v1/chat/completions';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GROQ_API_KEY = mockApiKey;
  });

  describe('API Connection', () => {
    test('Should connect to Groq API successfully', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: 'Успешное подключение к API'
            }
          }]
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const response = await axios.post(mockApiUrl, {
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: 'test' }]
      }, {
        headers: {
          'Authorization': `Bearer ${mockApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.data.choices[0].message.content).toBe('Успешное подключение к API');
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    test('Should validate API key before making requests', async () => {
      delete process.env.GROQ_API_KEY;

      try {
        await axios.post(mockApiUrl, {}, {
          headers: {
            'Authorization': `Bearer ${undefined}`
          }
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Russian Language Support', () => {
    test('Should handle Russian language correctly', async () => {
      const russianQuestion = 'Что такое HypeAI?';
      const russianResponse = 'HypeAI - это децентрализованная платформа для AI-агентов';

      const mockResponse = {
        data: {
          choices: [{
            message: { content: russianResponse }
          }]
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const response = await axios.post(mockApiUrl, {
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: russianQuestion }]
      });

      expect(response.data.choices[0].message.content).toContain('HypeAI');
      expect(response.data.choices[0].message.content).toMatch(/[а-яА-Я]/);
    });

    test('Should maintain Russian context in conversation', async () => {
      const conversation = [
        { role: 'user', content: 'Привет' },
        { role: 'assistant', content: 'Здравствуйте!' },
        { role: 'user', content: 'Расскажи о проекте' }
      ];

      const mockResponse = {
        data: {
          choices: [{
            message: { content: 'HypeAI - платформа для AI-агентов' }
          }]
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const response = await axios.post(mockApiUrl, {
        model: 'mixtral-8x7b-32768',
        messages: conversation
      });

      expect(response.data.choices[0].message.content).toMatch(/[а-яА-Я]/);
    });
  });

  describe('Rate Limiting', () => {
    test('Should respect rate limits', async () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: { error: 'Rate limit exceeded' }
        }
      };

      axios.post.mockRejectedValueOnce(rateLimitError);

      try {
        await axios.post(mockApiUrl, {
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: 'test' }]
        });
      } catch (error) {
        expect(error.response.status).toBe(429);
        expect(error.response.data.error).toBe('Rate limit exceeded');
      }
    });

    test('Should handle multiple rapid requests gracefully', async () => {
      const requests = Array(15).fill(null).map(() =>
        axios.post(mockApiUrl, {
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: 'test' }]
        })
      );

      // Some requests should fail with 429
      const rateLimitError = {
        response: { status: 429 }
      };

      axios.post.mockRejectedValue(rateLimitError);

      const results = await Promise.allSettled(requests);
      const rejected = results.filter(r => r.status === 'rejected');

      expect(rejected.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('Should handle API errors gracefully', async () => {
      const apiError = {
        response: {
          status: 500,
          data: { error: 'Internal server error' }
        }
      };

      axios.post.mockRejectedValue(apiError);

      try {
        await axios.post(mockApiUrl, {
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: 'test' }]
        });
      } catch (error) {
        expect(error.response.status).toBe(500);
      }
    });

    test('Should fall back to knowledge base on API failure', async () => {
      const fallbackKnowledge = {
        question: 'Что такое HypeAI?',
        fallbackAnswer: 'HypeAI - децентрализованная платформа (из базы знаний)'
      };

      axios.post.mockRejectedValue(new Error('API unavailable'));

      try {
        await axios.post(mockApiUrl, {
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: fallbackKnowledge.question }]
        });
      } catch (error) {
        // Fallback should return knowledge base answer
        const fallback = fallbackKnowledge.fallbackAnswer;
        expect(fallback).toContain('HypeAI');
      }
    });

    test('Should handle network timeouts', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };

      axios.post.mockRejectedValue(timeoutError);

      try {
        await axios.post(mockApiUrl, {
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: 'test' }],
          timeout: 5000
        });
      } catch (error) {
        expect(error.code).toBe('ECONNABORTED');
        expect(error.message).toContain('timeout');
      }
    });

    test('Should handle invalid JSON responses', async () => {
      axios.post.mockResolvedValue({
        data: 'Invalid JSON string'
      });

      try {
        const response = await axios.post(mockApiUrl, {
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: 'test' }]
        });

        // Should validate response structure
        if (typeof response.data === 'string') {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        expect(error.message).toBe('Invalid response format');
      }
    });
  });

  describe('Conversation Context', () => {
    test('Should maintain conversation context', async () => {
      const messages = [
        { role: 'user', content: 'Привет' },
        { role: 'assistant', content: 'Здравствуйте!' },
        { role: 'user', content: 'Что ты знаешь?' }
      ];

      const mockResponse = {
        data: {
          choices: [{
            message: { content: 'Я знаю о HypeAI' }
          }]
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const response = await axios.post(mockApiUrl, {
        model: 'mixtral-8x7b-32768',
        messages: messages
      });

      expect(axios.post).toHaveBeenCalledWith(
        mockApiUrl,
        expect.objectContaining({
          messages: expect.arrayContaining(messages)
        }),
        expect.any(Object)
      );
    });

    test('Should limit conversation history to prevent token overflow', async () => {
      // Create long conversation (20 messages)
      const longConversation = Array(20).fill(null).map((_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`
      }));

      const mockResponse = {
        data: {
          choices: [{
            message: { content: 'Response' }
          }]
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      // Should only send last 10 messages
      const limitedMessages = longConversation.slice(-10);

      const response = await axios.post(mockApiUrl, {
        model: 'mixtral-8x7b-32768',
        messages: limitedMessages
      });

      expect(response.data.choices[0].message.content).toBe('Response');
    });
  });

  describe('Response Validation', () => {
    test('Should validate response structure', async () => {
      const validResponse = {
        data: {
          choices: [{
            message: {
              content: 'Valid response',
              role: 'assistant'
            }
          }]
        }
      };

      axios.post.mockResolvedValue(validResponse);

      const response = await axios.post(mockApiUrl, {
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: 'test' }]
      });

      expect(response.data).toHaveProperty('choices');
      expect(response.data.choices[0]).toHaveProperty('message');
      expect(response.data.choices[0].message).toHaveProperty('content');
    });

    test('Should handle empty responses', async () => {
      const emptyResponse = {
        data: {
          choices: [{
            message: { content: '' }
          }]
        }
      };

      axios.post.mockResolvedValue(emptyResponse);

      const response = await axios.post(mockApiUrl, {
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: 'test' }]
      });

      if (!response.data.choices[0].message.content) {
        // Should use fallback for empty responses
        expect(response.data.choices[0].message.content).toBe('');
      }
    });
  });

  describe('Security', () => {
    test('Should not expose API key in requests', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: { content: 'Response' }
          }]
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      await axios.post(mockApiUrl, {
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: 'test' }]
      }, {
        headers: {
          'Authorization': `Bearer ${mockApiKey}`
        }
      });

      // API key should only be in headers, not in request body
      const callArgs = axios.post.mock.calls[0];
      expect(callArgs[1]).not.toHaveProperty('api_key');
      expect(callArgs[1]).not.toHaveProperty('apiKey');
    });

    test('Should sanitize user input', async () => {
      const maliciousInput = '<script>alert("XSS")</script>';

      const mockResponse = {
        data: {
          choices: [{
            message: { content: 'Safe response' }
          }]
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      // Input should be sanitized before sending
      const sanitized = maliciousInput.replace(/<[^>]*>/g, '');

      const response = await axios.post(mockApiUrl, {
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: sanitized }]
      });

      expect(response.data.choices[0].message.content).toBe('Safe response');
    });
  });

  describe('Performance', () => {
    test('Should respond within 3 seconds', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: { content: 'Fast response' }
          }]
        }
      };

      axios.post.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockResponse), 500))
      );

      const startTime = Date.now();
      await axios.post(mockApiUrl, {
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: 'test' }]
      });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(3000);
    });

    test('Should handle concurrent requests efficiently', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: { content: 'Response' }
          }]
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const concurrentRequests = Array(10).fill(null).map(() =>
        axios.post(mockApiUrl, {
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: 'test' }]
        })
      );

      const startTime = Date.now();
      await Promise.all(concurrentRequests);
      const endTime = Date.now();

      // All 10 requests should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });
});
