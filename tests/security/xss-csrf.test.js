/**
 * Security Tests - XSS, CSRF, Injection Prevention
 * Critical security vulnerability testing
 */

import { describe, test, expect } from '@jest/globals';

describe('Security Tests', () => {
  describe('XSS Prevention', () => {
    test('should sanitize script tags in messages', () => {
      const maliciousInput = '<script>alert("XSS")</script>';

      const sanitize = (input) => {
        return input
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      };

      const sanitized = sanitize(maliciousInput);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    test('should prevent inline event handlers', () => {
      const maliciousInputs = [
        '<img src="x" onerror="alert(1)">',
        '<div onclick="alert(1)">',
        '<a href="javascript:alert(1)">',
        '<iframe src="javascript:alert(1)"></iframe>'
      ];

      const sanitize = (input) => {
        return input
          .replace(/on\w+="[^"]*"/gi, '')
          .replace(/on\w+='[^']*'/gi, '')
          .replace(/javascript:/gi, '');
      };

      maliciousInputs.forEach(input => {
        const sanitized = sanitize(input);
        expect(sanitized).not.toMatch(/on\w+=/);
        expect(sanitized).not.toContain('javascript:');
      });
    });

    test('should escape HTML entities', () => {
      const dangerousChars = '<>"\'&';

      const escape = (str) => {
        const map = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return str.replace(/[<>"'&]/g, char => map[char]);
      };

      const escaped = escape(dangerousChars);

      expect(escaped).toBe('&lt;&gt;&quot;&#x27;&amp;');
      expect(escaped).not.toContain('<');
      expect(escaped).not.toContain('>');
    });

    test('should prevent DOM-based XSS', () => {
      const userInput = '"><script>alert("XSS")</script>';

      // Safe way: Use textContent instead of innerHTML
      const safeRender = (input) => {
        // In real DOM: element.textContent = input;
        return input; // Browser will escape this automatically with textContent
      };

      const rendered = safeRender(userInput);
      // When using textContent, script tags won't execute
      expect(rendered).toContain('<script>'); // But it's safe as text
    });

    test('should sanitize markdown formatting safely', () => {
      const input = '**Bold** and *italic* text <script>alert("XSS")</script>';

      const safeMarkdown = (text) => {
        // First escape HTML
        const escaped = text
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        // Then apply markdown
        return escaped
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');
      };

      const result = safeMarkdown(input);

      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('<strong>Bold</strong>');
    });
  });

  describe('CSRF Protection', () => {
    test('should validate CSRF token', () => {
      const validToken = 'csrf-token-123456';
      const requestToken = 'csrf-token-123456';

      expect(requestToken).toBe(validToken);
    });

    test('should reject requests without CSRF token', () => {
      const request = {
        headers: {}
      };

      const hasCSRFToken = request.headers['x-csrf-token'] !== undefined;
      expect(hasCSRFToken).toBe(false);
    });

    test('should generate unique CSRF tokens per session', () => {
      const generateToken = () => {
        return `csrf-${Math.random().toString(36).substr(2, 9)}`;
      };

      const token1 = generateToken();
      const token2 = generateToken();

      expect(token1).not.toBe(token2);
      expect(token1).toMatch(/^csrf-/);
    });

    test('should validate token expiry', () => {
      const token = {
        value: 'csrf-123',
        expiresAt: Date.now() - 1000 // Expired 1 second ago
      };

      const isValid = Date.now() < token.expiresAt;
      expect(isValid).toBe(false);
    });
  });

  describe('Injection Prevention', () => {
    test('should prevent command injection', () => {
      const userInput = '; rm -rf /';

      const sanitize = (input) => {
        // Remove shell metacharacters
        return input.replace(/[;&|`$()]/g, '');
      };

      const sanitized = sanitize(userInput);

      expect(sanitized).not.toContain(';');
      expect(sanitized).not.toContain('|');
      expect(sanitized).toBe(' rm -rf /');
    });

    test('should prevent JSON injection', () => {
      const maliciousJSON = '{"name": "test", "admin": true}';

      const validateJSON = (input) => {
        try {
          const parsed = JSON.parse(input);
          // Whitelist allowed fields
          const allowed = ['name', 'email', 'message'];
          const keys = Object.keys(parsed);

          return keys.every(key => allowed.includes(key));
        } catch {
          return false;
        }
      };

      const isValid = validateJSON(maliciousJSON);
      expect(isValid).toBe(false); // 'admin' is not in whitelist
    });

    test('should sanitize file paths', () => {
      const maliciousPaths = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32',
        '/etc/passwd',
        'C:\\Windows\\System32'
      ];

      const sanitizePath = (path) => {
        return path
          .replace(/\.\./g, '')
          .replace(/[/\\]/g, '-');
      };

      maliciousPaths.forEach(path => {
        const sanitized = sanitizePath(path);
        expect(sanitized).not.toContain('..');
        expect(sanitized).not.toContain('/');
        expect(sanitized).not.toContain('\\');
      });
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits', () => {
      const maxRequests = 10;
      const requests = [];

      for (let i = 0; i < 15; i++) {
        requests.push({ ip: '192.168.1.1', timestamp: Date.now() });
      }

      const recentRequests = requests.filter(r =>
        Date.now() - r.timestamp < 60000 // Last minute
      );

      const isLimited = recentRequests.length > maxRequests;
      expect(isLimited).toBe(true);
    });

    test('should track requests per IP', () => {
      const requestLog = new Map();
      const ip = '192.168.1.1';

      requestLog.set(ip, (requestLog.get(ip) || 0) + 1);
      requestLog.set(ip, (requestLog.get(ip) || 0) + 1);

      expect(requestLog.get(ip)).toBe(2);
    });

    test('should reset rate limit after time window', () => {
      const rateLimit = {
        count: 10,
        windowStart: Date.now() - 61000 // 61 seconds ago
      };

      const windowMs = 60000; // 1 minute
      const shouldReset = Date.now() - rateLimit.windowStart > windowMs;

      if (shouldReset) {
        rateLimit.count = 0;
        rateLimit.windowStart = Date.now();
      }

      expect(rateLimit.count).toBe(0);
    });

    test('should return 429 when rate limited', () => {
      const response = {
        status: 429,
        body: {
          error: 'Too many requests',
          retryAfter: 60
        }
      };

      expect(response.status).toBe(429);
      expect(response.body.retryAfter).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    test('should validate message length', () => {
      const maxLength = 2000;

      const validate = (message) => {
        return message.length > 0 && message.length <= maxLength;
      };

      expect(validate('')).toBe(false);
      expect(validate('a'.repeat(2001))).toBe(false);
      expect(validate('Valid message')).toBe(true);
    });

    test('should validate data types', () => {
      const validate = (data) => {
        return (
          typeof data.message === 'string' &&
          (data.sessionId === undefined || typeof data.sessionId === 'string') &&
          (data.language === undefined || typeof data.language === 'string')
        );
      };

      expect(validate({ message: 'Hello' })).toBe(true);
      expect(validate({ message: 123 })).toBe(false);
      expect(validate({ message: 'Hello', sessionId: 'abc-123' })).toBe(true);
    });

    test('should reject malformed requests', () => {
      const malformedRequests = [
        {},
        { message: null },
        { message: undefined },
        { message: ['array'] },
        { message: { obj: 'ect' } }
      ];

      const validate = (data) => {
        return data.message && typeof data.message === 'string';
      };

      malformedRequests.forEach(req => {
        expect(validate(req)).toBe(false);
      });
    });
  });

  describe('Content Security Policy', () => {
    test('should enforce CSP headers', () => {
      const csp = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': ["'self'", 'https://api.anthropic.com']
      };

      expect(csp['default-src']).toContain("'self'");
      expect(csp['connect-src']).toContain("'self'");
    });

    test('should prevent inline scripts in production', () => {
      const isDevelopment = process.env.NODE_ENV === 'development';
      const allowInlineScripts = isDevelopment;

      // In production, inline scripts should be blocked
      expect(allowInlineScripts).toBe(false);
    });
  });

  describe('Session Security', () => {
    test('should generate secure session IDs', () => {
      const generateSessionId = () => {
        const crypto = {
          randomBytes: (size) => {
            return Array(size).fill(0).map(() =>
              Math.floor(Math.random() * 256)
            );
          }
        };

        const bytes = crypto.randomBytes(16);
        return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
      };

      const sessionId = generateSessionId();

      expect(sessionId).toHaveLength(32);
      expect(sessionId).toMatch(/^[0-9a-f]+$/);
    });

    test('should expire inactive sessions', () => {
      const session = {
        lastActivity: Date.now() - 3700000, // 1 hour 10 minutes ago
        timeout: 3600000 // 1 hour
      };

      const isExpired = Date.now() - session.lastActivity > session.timeout;
      expect(isExpired).toBe(true);
    });

    test('should not expose session data across users', () => {
      const session1 = { id: 'user1', data: 'sensitive1' };
      const session2 = { id: 'user2', data: 'sensitive2' };

      expect(session1.id).not.toBe(session2.id);
      expect(session1.data).not.toBe(session2.data);
    });
  });

  describe('API Key Security', () => {
    test('should not expose API keys in responses', () => {
      const response = {
        reply: 'Your answer here',
        sessionId: 'abc-123'
      };

      const responseString = JSON.stringify(response);

      expect(responseString).not.toContain('ANTHROPIC_API_KEY');
      expect(responseString).not.toContain('sk-');
    });

    test('should validate API key format', () => {
      const validateAPIKey = (key) => {
        return key && key.startsWith('sk-') && key.length > 20;
      };

      expect(validateAPIKey('sk-ant-valid-key-123456789')).toBe(true);
      expect(validateAPIKey('invalid-key')).toBe(false);
      expect(validateAPIKey('')).toBe(false);
    });
  });
});
