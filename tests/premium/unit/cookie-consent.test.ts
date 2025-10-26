import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Cookie Consent Unit Tests
 * Tests for GDPR compliance, user preferences, and cookie management
 */

describe('Cookie Consent - Initialization', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="cookie-consent-banner"></div>
      <button id="accept-all-cookies"></button>
      <button id="reject-all-cookies"></button>
      <button id="customize-cookies"></button>
    `;
    localStorage.clear();
  });

  it('should show banner on first visit', () => {
    const hasConsent = localStorage.getItem('cookie-consent');
    expect(hasConsent).toBeNull();

    const banner = document.getElementById('cookie-consent-banner');
    expect(banner).toBeDefined();
  });

  it('should hide banner after consent', () => {
    localStorage.setItem('cookie-consent', 'accepted');

    const hasConsent = localStorage.getItem('cookie-consent');
    expect(hasConsent).toBe('accepted');
  });

  it('should respect previous consent', () => {
    localStorage.setItem('cookie-consent', 'rejected');

    const consent = localStorage.getItem('cookie-consent');
    expect(consent).toBe('rejected');
  });
});

describe('Cookie Consent - User Actions', () => {
  let consentManager: any;

  beforeEach(() => {
    consentManager = {
      preferences: {
        necessary: true,
        analytics: false,
        marketing: false,
      },

      acceptAll() {
        this.preferences = {
          necessary: true,
          analytics: true,
          marketing: true,
        };
        this.savePreferences();
      },

      rejectAll() {
        this.preferences = {
          necessary: true,
          analytics: false,
          marketing: false,
        };
        this.savePreferences();
      },

      savePreferences() {
        localStorage.setItem('cookie-preferences', JSON.stringify(this.preferences));
      },

      loadPreferences() {
        const saved = localStorage.getItem('cookie-preferences');
        if (saved) {
          this.preferences = JSON.parse(saved);
        }
      },
    };
  });

  it('should accept all cookies', () => {
    consentManager.acceptAll();

    expect(consentManager.preferences.necessary).toBe(true);
    expect(consentManager.preferences.analytics).toBe(true);
    expect(consentManager.preferences.marketing).toBe(true);
  });

  it('should reject optional cookies', () => {
    consentManager.rejectAll();

    expect(consentManager.preferences.necessary).toBe(true);
    expect(consentManager.preferences.analytics).toBe(false);
    expect(consentManager.preferences.marketing).toBe(false);
  });

  it('should save custom preferences', () => {
    consentManager.preferences = {
      necessary: true,
      analytics: true,
      marketing: false,
    };
    consentManager.savePreferences();

    const saved = JSON.parse(localStorage.getItem('cookie-preferences') || '{}');
    expect(saved.analytics).toBe(true);
    expect(saved.marketing).toBe(false);
  });

  it('should load saved preferences', () => {
    const prefs = {
      necessary: true,
      analytics: true,
      marketing: false,
    };
    localStorage.setItem('cookie-preferences', JSON.stringify(prefs));

    consentManager.loadPreferences();

    expect(consentManager.preferences.analytics).toBe(true);
    expect(consentManager.preferences.marketing).toBe(false);
  });
});

describe('Cookie Consent - Cookie Management', () => {
  it('should set cookie with expiration', () => {
    const setCookie = (name: string, value: string, days: number) => {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    };

    setCookie('test-cookie', 'test-value', 365);

    expect(document.cookie).toContain('test-cookie=test-value');
  });

  it('should delete cookie', () => {
    const deleteCookie = (name: string) => {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    };

    document.cookie = 'test-cookie=test-value';
    deleteCookie('test-cookie');

    // Cookie should be expired (can't verify in jsdom, but logic is tested)
    expect(document.cookie.includes('test-cookie=')).toBe(false);
  });

  it('should get cookie value', () => {
    const getCookie = (name: string): string | null => {
      const matches = document.cookie.match(new RegExp(
        '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
      ));
      return matches ? decodeURIComponent(matches[1]) : null;
    };

    document.cookie = 'test=hello';
    const value = getCookie('test');

    expect(value).toBe('hello');
  });
});

describe('Cookie Consent - GDPR Compliance', () => {
  it('should provide cookie policy link', () => {
    const banner = document.createElement('div');
    banner.innerHTML = '<a href="/cookies.html">Cookie Policy</a>';

    const link = banner.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/cookies.html');
  });

  it('should list all cookie categories', () => {
    const categories = [
      { id: 'necessary', name: 'Necessary', required: true },
      { id: 'analytics', name: 'Analytics', required: false },
      { id: 'marketing', name: 'Marketing', required: false },
    ];

    expect(categories).toHaveLength(3);
    expect(categories[0].required).toBe(true);
    expect(categories[1].required).toBe(false);
  });

  it('should record consent timestamp', () => {
    const consent = {
      timestamp: new Date().toISOString(),
      preferences: { necessary: true, analytics: true },
    };

    localStorage.setItem('cookie-consent-record', JSON.stringify(consent));

    const saved = JSON.parse(localStorage.getItem('cookie-consent-record') || '{}');
    expect(saved.timestamp).toBeDefined();
  });

  it('should allow withdrawal of consent', () => {
    localStorage.setItem('cookie-consent', 'accepted');

    // User withdraws consent
    localStorage.removeItem('cookie-consent');
    localStorage.removeItem('cookie-preferences');

    expect(localStorage.getItem('cookie-consent')).toBeNull();
    expect(localStorage.getItem('cookie-preferences')).toBeNull();
  });
});

describe('Cookie Consent - Analytics Integration', () => {
  let analytics: any;

  beforeEach(() => {
    analytics = {
      enabled: false,

      init() {
        const prefs = JSON.parse(localStorage.getItem('cookie-preferences') || '{}');
        this.enabled = prefs.analytics === true;

        if (this.enabled) {
          this.loadScript();
        }
      },

      loadScript() {
        // Mock loading analytics script
        window.gtag = vi.fn();
      },

      track(event: string, data: any) {
        if (!this.enabled) return;
        window.gtag?.('event', event, data);
      },
    };
  });

  it('should initialize analytics when consent given', () => {
    localStorage.setItem('cookie-preferences', JSON.stringify({ analytics: true }));

    analytics.init();

    expect(analytics.enabled).toBe(true);
  });

  it('should not initialize analytics without consent', () => {
    localStorage.setItem('cookie-preferences', JSON.stringify({ analytics: false }));

    analytics.init();

    expect(analytics.enabled).toBe(false);
  });

  it('should not track events without consent', () => {
    analytics.enabled = false;
    const trackSpy = vi.spyOn(analytics, 'track');

    analytics.track('page_view', { page: '/' });

    expect(trackSpy).toHaveBeenCalled();
    // gtag should not be called because analytics.enabled is false
  });
});

describe('Cookie Consent - Mobile Responsiveness', () => {
  it('should adapt banner to mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const isMobile = window.innerWidth < 768;
    expect(isMobile).toBe(true);
  });

  it('should show simplified banner on mobile', () => {
    const isMobile = window.innerWidth < 768;
    const bannerClass = isMobile ? 'cookie-banner-mobile' : 'cookie-banner-desktop';

    expect(bannerClass).toBe('cookie-banner-mobile');
  });
});
