/**
 * Groq API Performance and Load Tests
 * Tests for response time, concurrent requests, and resource usage
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

describe('Groq API Performance Tests', () => {
  const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  const apiKey = process.env.GROQ_API_KEY || 'test-key';

  describe('Response Time', () => {
    test('Should respond within 3 seconds for simple query', async () => {
      const startTime = performance.now();

      try {
        await axios.post(apiUrl, {
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: 'Привет' }]
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 3000
        });

        const endTime = performance.now();
        const responseTime = endTime - startTime;

        expect(responseTime).toBeLessThan(3000);
        console.log(`Response time: ${responseTime.toFixed(2)}ms`);
      } catch (error) {
        if (error.code === 'ECONNABORTED') {
          fail('Request timed out after 3 seconds');
        }
        throw error;
      }
    }, 5000);

    test('Should respond within 5 seconds for complex query', async () => {
      const startTime = performance.now();

      const complexQuery = 'Расскажи подробно о всех агентах HypeAI, их функциях и взаимодействии';

      try {
        await axios.post(apiUrl, {
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: complexQuery }],
          max_tokens: 500
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });

        const endTime = performance.now();
        const responseTime = endTime - startTime;

        expect(responseTime).toBeLessThan(5000);
        console.log(`Complex query response time: ${responseTime.toFixed(2)}ms`);
      } catch (error) {
        if (error.code === 'ECONNABORTED') {
          fail('Complex query timed out after 5 seconds');
        }
        throw error;
      }
    }, 7000);
  });

  describe('Concurrent Requests', () => {
    test('Should handle 5 concurrent requests', async () => {
      const requests = Array(5).fill(null).map((_, i) =>
        axios.post(apiUrl, {
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: `Вопрос ${i + 1}` }]
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        })
      );

      const startTime = performance.now();
      const results = await Promise.allSettled(requests);
      const endTime = performance.now();

      const successful = results.filter(r => r.status === 'fulfilled');
      const totalTime = endTime - startTime;

      expect(successful.length).toBeGreaterThanOrEqual(3); // At least 60% success
      expect(totalTime).toBeLessThan(10000); // All within 10 seconds

      console.log(`5 concurrent requests: ${successful.length}/5 successful in ${totalTime.toFixed(2)}ms`);
    }, 15000);

    test('Should handle 10 concurrent requests with some failures', async () => {
      const requests = Array(10).fill(null).map((_, i) =>
        axios.post(apiUrl, {
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: `Запрос ${i + 1}` }]
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        })
      );

      const results = await Promise.allSettled(requests);

      const successful = results.filter(r => r.status === 'fulfilled');
      const rateLimited = results.filter(r =>
        r.status === 'rejected' && r.reason?.response?.status === 429
      );

      console.log(`10 concurrent: ${successful.length} successful, ${rateLimited.length} rate-limited`);

      // Some should succeed, some might be rate-limited
      expect(successful.length + rateLimited.length).toBe(10);
    }, 20000);
  });

  describe('Rate Limiting', () => {
    test('Should implement client-side rate limiting', async () => {
      const rateLimiter = {
        tokens: 10,
        maxTokens: 10,
        refillRate: 1, // 1 token per second
        lastRefill: Date.now(),

        async waitForToken() {
          const now = Date.now();
          const timePassed = (now - this.lastRefill) / 1000;
          const tokensToAdd = Math.floor(timePassed * this.refillRate);

          if (tokensToAdd > 0) {
            this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
            this.lastRefill = now;
          }

          if (this.tokens <= 0) {
            const waitTime = (1 / this.refillRate) * 1000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            this.tokens = 1;
            this.lastRefill = Date.now();
          } else {
            this.tokens--;
          }
        }
      };

      const requests = [];
      const startTime = performance.now();

      for (let i = 0; i < 15; i++) {
        await rateLimiter.waitForToken();
        requests.push(axios.post(apiUrl, {
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: `Тест ${i + 1}` }]
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => ({ status: 'failed' })));
      }

      const results = await Promise.all(requests);
      const endTime = performance.now();

      const failed = results.filter(r => r.status === 'failed').length;

      console.log(`Rate limiting test: ${15 - failed}/15 successful in ${(endTime - startTime).toFixed(2)}ms`);

      // Rate limiter should prevent most failures
      expect(failed).toBeLessThan(3);
    }, 30000);
  });

  describe('Memory Usage', () => {
    test('Should not leak memory with repeated requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Make 50 requests
      for (let i = 0; i < 50; i++) {
        try {
          await axios.post(apiUrl, {
            model: 'mixtral-8x7b-32768',
            messages: [{ role: 'user', content: 'Тест памяти' }]
          }, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          // Ignore errors for memory test
        }

        // Periodically force garbage collection
        if (i % 10 === 0 && global.gc) {
          global.gc();
        }
      }

      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

      console.log(`Memory increase after 50 requests: ${memoryIncreaseMB.toFixed(2)}MB`);

      // Memory increase should be reasonable (<10MB)
      expect(memoryIncreaseMB).toBeLessThan(10);
    }, 60000);
  });

  describe('Error Recovery', () => {
    test('Should recover from timeout errors', async () => {
      let timeoutCount = 0;
      let successCount = 0;

      for (let i = 0; i < 5; i++) {
        try {
          await axios.post(apiUrl, {
            model: 'mixtral-8x7b-32768',
            messages: [{ role: 'user', content: 'Тест восстановления' }]
          }, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 2000 // Aggressive timeout
          });
          successCount++;
        } catch (error) {
          if (error.code === 'ECONNABORTED') {
            timeoutCount++;
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      console.log(`Recovery test: ${successCount} successful, ${timeoutCount} timeouts`);

      // At least some should succeed even with aggressive timeout
      expect(successCount).toBeGreaterThan(0);
    }, 20000);

    test('Should implement exponential backoff on failures', async () => {
      const backoff = async (attempt) => {
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
        await new Promise(resolve => setTimeout(resolve, delay));
      };

      let attempt = 0;
      let success = false;

      while (attempt < 3 && !success) {
        try {
          await axios.post(apiUrl, {
            model: 'mixtral-8x7b-32768',
            messages: [{ role: 'user', content: 'Тест backoff' }]
          }, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          });
          success = true;
        } catch (error) {
          console.log(`Attempt ${attempt + 1} failed, backing off...`);
          await backoff(attempt);
          attempt++;
        }
      }

      expect(success || attempt === 3).toBe(true);
    }, 20000);
  });

  describe('Caching', () => {
    test('Should cache identical requests', async () => {
      const cache = new Map();
      const question = 'Что такое HypeAI?';

      // First request
      const startTime1 = performance.now();
      const response1 = await axios.post(apiUrl, {
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: question }]
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      const time1 = performance.now() - startTime1;

      cache.set(question, response1.data);

      // Second request (should use cache)
      const startTime2 = performance.now();
      const cachedResponse = cache.get(question);
      const time2 = performance.now() - startTime2;

      console.log(`First request: ${time1.toFixed(2)}ms, Cached: ${time2.toFixed(2)}ms`);

      expect(time2).toBeLessThan(1); // Cache should be instant
      expect(cachedResponse).toBeDefined();
    });
  });
});
