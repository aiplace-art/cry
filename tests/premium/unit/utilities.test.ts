import { describe, it, expect, vi } from 'vitest';

/**
 * Utility Functions Unit Tests
 * Tests for helper functions, validators, and utilities
 */

describe('Utilities - Rate Limiter', () => {
  class RateLimiter {
    private requests: number[] = [];

    constructor(
      private maxRequests: number,
      private timeWindow: number // milliseconds
    ) {}

    canMakeRequest(): boolean {
      const now = Date.now();
      this.requests = this.requests.filter(time => now - time < this.timeWindow);
      return this.requests.length < this.maxRequests;
    }

    recordRequest(): void {
      this.requests.push(Date.now());
    }

    reset(): void {
      this.requests = [];
    }
  }

  it('should allow requests under limit', () => {
    const limiter = new RateLimiter(5, 60000);

    for (let i = 0; i < 5; i++) {
      expect(limiter.canMakeRequest()).toBe(true);
      limiter.recordRequest();
    }
  });

  it('should block requests over limit', () => {
    const limiter = new RateLimiter(3, 60000);

    for (let i = 0; i < 3; i++) {
      limiter.recordRequest();
    }

    expect(limiter.canMakeRequest()).toBe(false);
  });

  it('should reset after time window', () => {
    vi.useFakeTimers();
    const limiter = new RateLimiter(2, 1000);

    limiter.recordRequest();
    limiter.recordRequest();
    expect(limiter.canMakeRequest()).toBe(false);

    vi.advanceTimersByTime(1100);
    expect(limiter.canMakeRequest()).toBe(true);

    vi.useRealTimers();
  });
});

describe('Utilities - Input Validation', () => {
  const validators = {
    email: (email: string): boolean => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    },

    url: (url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },

    sanitizeHtml: (html: string): string => {
      return html
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    },

    isAlphanumeric: (str: string): boolean => {
      return /^[a-zA-Z0-9]+$/.test(str);
    },

    hasMinLength: (str: string, min: number): boolean => {
      return str.length >= min;
    },

    hasMaxLength: (str: string, max: number): boolean => {
      return str.length <= max;
    },
  };

  it('should validate email addresses', () => {
    expect(validators.email('test@example.com')).toBe(true);
    expect(validators.email('invalid-email')).toBe(false);
    expect(validators.email('missing@domain')).toBe(false);
  });

  it('should validate URLs', () => {
    expect(validators.url('https://example.com')).toBe(true);
    expect(validators.url('http://localhost:3000')).toBe(true);
    expect(validators.url('not-a-url')).toBe(false);
  });

  it('should sanitize HTML', () => {
    const malicious = '<script>alert("XSS")</script>';
    const sanitized = validators.sanitizeHtml(malicious);

    expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    expect(sanitized).not.toContain('<script>');
  });

  it('should validate alphanumeric strings', () => {
    expect(validators.isAlphanumeric('abc123')).toBe(true);
    expect(validators.isAlphanumeric('abc-123')).toBe(false);
    expect(validators.isAlphanumeric('abc 123')).toBe(false);
  });

  it('should validate string length', () => {
    expect(validators.hasMinLength('hello', 3)).toBe(true);
    expect(validators.hasMinLength('hi', 3)).toBe(false);
    expect(validators.hasMaxLength('hello', 10)).toBe(true);
    expect(validators.hasMaxLength('hello world', 5)).toBe(false);
  });
});

describe('Utilities - Local Storage Wrapper', () => {
  class StorageWrapper {
    set(key: string, value: any, ttl?: number): void {
      const item = {
        value,
        expiresAt: ttl ? Date.now() + ttl : null,
      };
      localStorage.setItem(key, JSON.stringify(item));
    }

    get<T>(key: string): T | null {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);

      if (item.expiresAt && Date.now() > item.expiresAt) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value;
    }

    remove(key: string): void {
      localStorage.removeItem(key);
    }

    clear(): void {
      localStorage.clear();
    }
  }

  it('should store and retrieve values', () => {
    const storage = new StorageWrapper();

    storage.set('test-key', 'test-value');
    const value = storage.get<string>('test-key');

    expect(value).toBe('test-value');
  });

  it('should handle complex objects', () => {
    const storage = new StorageWrapper();
    const obj = { name: 'Test', count: 42 };

    storage.set('test-obj', obj);
    const retrieved = storage.get<typeof obj>('test-obj');

    expect(retrieved).toEqual(obj);
  });

  it('should expire items after TTL', () => {
    vi.useFakeTimers();
    const storage = new StorageWrapper();

    storage.set('temp-key', 'temp-value', 1000);

    expect(storage.get('temp-key')).toBe('temp-value');

    vi.advanceTimersByTime(1100);

    expect(storage.get('temp-key')).toBeNull();

    vi.useRealTimers();
  });

  it('should remove items', () => {
    const storage = new StorageWrapper();

    storage.set('key-to-remove', 'value');
    expect(storage.get('key-to-remove')).toBe('value');

    storage.remove('key-to-remove');
    expect(storage.get('key-to-remove')).toBeNull();
  });
});

describe('Utilities - Debounce & Throttle', () => {
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function(...args: Parameters<T>) {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  }

  function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return function(...args: Parameters<T>) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;

        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  it('should debounce function calls', () => {
    vi.useFakeTimers();
    const mockFn = vi.fn();
    const debounced = debounce(mockFn, 1000);

    debounced();
    debounced();
    debounced();

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('should throttle function calls', () => {
    vi.useFakeTimers();
    const mockFn = vi.fn();
    const throttled = throttle(mockFn, 1000);

    throttled();
    throttled();
    throttled();

    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1100);

    throttled();

    expect(mockFn).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});

describe('Utilities - Event Emitter', () => {
  class EventEmitter {
    private events: Map<string, Set<Function>> = new Map();

    on(event: string, callback: Function): void {
      if (!this.events.has(event)) {
        this.events.set(event, new Set());
      }
      this.events.get(event)!.add(callback);
    }

    off(event: string, callback: Function): void {
      this.events.get(event)?.delete(callback);
    }

    emit(event: string, ...args: any[]): void {
      this.events.get(event)?.forEach(callback => callback(...args));
    }

    once(event: string, callback: Function): void {
      const wrapper = (...args: any[]) => {
        callback(...args);
        this.off(event, wrapper);
      };
      this.on(event, wrapper);
    }
  }

  it('should emit events to listeners', () => {
    const emitter = new EventEmitter();
    const mockFn = vi.fn();

    emitter.on('test-event', mockFn);
    emitter.emit('test-event', 'arg1', 'arg2');

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should remove listeners', () => {
    const emitter = new EventEmitter();
    const mockFn = vi.fn();

    emitter.on('test-event', mockFn);
    emitter.off('test-event', mockFn);
    emitter.emit('test-event');

    expect(mockFn).not.toHaveBeenCalled();
  });

  it('should handle once listeners', () => {
    const emitter = new EventEmitter();
    const mockFn = vi.fn();

    emitter.once('test-event', mockFn);
    emitter.emit('test-event');
    emitter.emit('test-event');

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple listeners', () => {
    const emitter = new EventEmitter();
    const mockFn1 = vi.fn();
    const mockFn2 = vi.fn();

    emitter.on('test-event', mockFn1);
    emitter.on('test-event', mockFn2);
    emitter.emit('test-event');

    expect(mockFn1).toHaveBeenCalled();
    expect(mockFn2).toHaveBeenCalled();
  });
});

describe('Utilities - URL Helpers', () => {
  const urlHelpers = {
    getQueryParam(url: string, param: string): string | null {
      const urlObj = new URL(url);
      return urlObj.searchParams.get(param);
    },

    setQueryParam(url: string, param: string, value: string): string {
      const urlObj = new URL(url);
      urlObj.searchParams.set(param, value);
      return urlObj.toString();
    },

    removeQueryParam(url: string, param: string): string {
      const urlObj = new URL(url);
      urlObj.searchParams.delete(param);
      return urlObj.toString();
    },

    buildUrl(base: string, params: Record<string, string>): string {
      const url = new URL(base);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
      return url.toString();
    },
  };

  it('should get query parameters', () => {
    const url = 'https://example.com?foo=bar&baz=qux';

    expect(urlHelpers.getQueryParam(url, 'foo')).toBe('bar');
    expect(urlHelpers.getQueryParam(url, 'baz')).toBe('qux');
    expect(urlHelpers.getQueryParam(url, 'missing')).toBeNull();
  });

  it('should set query parameters', () => {
    const url = 'https://example.com';
    const newUrl = urlHelpers.setQueryParam(url, 'test', 'value');

    expect(newUrl).toContain('test=value');
  });

  it('should remove query parameters', () => {
    const url = 'https://example.com?foo=bar&baz=qux';
    const newUrl = urlHelpers.removeQueryParam(url, 'foo');

    expect(newUrl).not.toContain('foo=bar');
    expect(newUrl).toContain('baz=qux');
  });

  it('should build URLs with parameters', () => {
    const url = urlHelpers.buildUrl('https://example.com', {
      page: '1',
      sort: 'name',
    });

    expect(url).toContain('page=1');
    expect(url).toContain('sort=name');
  });
});

describe('Utilities - Date Formatting', () => {
  const dateHelpers = {
    formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes);
    },

    getRelativeTime(date: Date): string {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      if (minutes > 0) return `${minutes}m ago`;
      return 'Just now';
    },

    isToday(date: Date): boolean {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    },
  };

  it('should format dates', () => {
    const date = new Date('2025-10-26T12:30:00');

    expect(dateHelpers.formatDate(date, 'YYYY-MM-DD')).toBe('2025-10-26');
    expect(dateHelpers.formatDate(date, 'DD/MM/YYYY')).toBe('26/10/2025');
    expect(dateHelpers.formatDate(date, 'HH:mm')).toBe('12:30');
  });

  it('should calculate relative time', () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    expect(dateHelpers.getRelativeTime(fiveMinutesAgo)).toBe('5m ago');
    expect(dateHelpers.getRelativeTime(twoHoursAgo)).toBe('2h ago');
  });

  it('should check if date is today', () => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    expect(dateHelpers.isToday(today)).toBe(true);
    expect(dateHelpers.isToday(yesterday)).toBe(false);
  });
});
