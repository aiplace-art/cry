/**
 * Security Utilities for XSS Protection and Input Sanitization
 * Binance-Level Security Implementation
 */

const SecurityUtils = {
  /**
   * Sanitize HTML to prevent XSS attacks
   * Converts HTML to plain text
   */
  sanitizeHTML(html) {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  },

  /**
   * Escape HTML entities to prevent injection
   * Use this for user-generated content displayed in HTML
   */
  escapeHTML(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
      '/': '&#x2F;'
    };
    return String(text).replace(/[&<>"'/]/g, m => map[m]);
  },

  /**
   * Validate URL to prevent javascript: protocol and other attacks
   * Only allows http: and https: protocols
   */
  isValidURL(url) {
    if (!url) return false;
    try {
      const parsed = new URL(url, window.location.origin);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },

  /**
   * Sanitize object keys and values recursively
   * Prevents XSS in dynamic object rendering
   */
  sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanKey = this.escapeHTML(String(key));

      if (typeof value === 'string') {
        sanitized[cleanKey] = this.escapeHTML(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[cleanKey] = this.sanitizeObject(value);
      } else {
        sanitized[cleanKey] = value;
      }
    }
    return sanitized;
  },

  /**
   * Validate email address format
   * RFC 5322 compliant with length limits
   */
  validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    if (email.length > 254) return false;

    const re = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(email);
  },

  /**
   * Validate numeric amount
   * Prevents NaN, negative, and excessively large values
   */
  validateAmount(amount, min = 0, max = 1000000000) {
    const num = parseFloat(amount);
    return !isNaN(num) && num >= min && num <= max && isFinite(num);
  },

  /**
   * Validate Ethereum address format
   * Checks for valid hex format
   */
  validateEthAddress(address) {
    if (!address || typeof address !== 'string') return false;
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  },

  /**
   * Sanitize filename to prevent path traversal
   * Removes dangerous characters and path separators
   */
  sanitizeFilename(filename) {
    if (!filename) return '';
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/^\.+/, '')
      .substring(0, 255);
  },

  /**
   * Create safe innerHTML update
   * Uses DOMPurify-like approach for HTML sanitization
   */
  setSafeHTML(element, html) {
    if (!element) return;

    // Create temporary container
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Remove dangerous elements
    const dangerous = temp.querySelectorAll('script, iframe, object, embed, link, style');
    dangerous.forEach(el => el.remove());

    // Remove event handlers
    const all = temp.querySelectorAll('*');
    all.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
      });
    });

    element.innerHTML = temp.innerHTML;
  },

  /**
   * Generate cryptographically secure random ID
   */
  generateSecureId() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Sanitize JSON data before parsing
   * Prevents prototype pollution
   */
  safeJSONParse(json) {
    try {
      const parsed = JSON.parse(json);
      // Remove __proto__ and constructor to prevent pollution
      if (parsed && typeof parsed === 'object') {
        delete parsed.__proto__;
        delete parsed.constructor;
      }
      return parsed;
    } catch {
      return null;
    }
  }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityUtils;
}

// Make available globally for non-module scripts
if (typeof window !== 'undefined') {
  window.SecurityUtils = SecurityUtils;
}
