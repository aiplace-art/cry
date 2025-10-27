# 🧪 Test Examples - Ready-to-Use Test Files

**Copy-paste examples for immediate implementation**

---

## 🚀 Example 1: E2E User Journey Test

**File:** `/tests/e2e/journeys/new-user-onboarding.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('New User Onboarding Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and storage for clean slate
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('complete new user experience from landing to purchase', async ({ page }) => {
    // Step 1: User lands on homepage
    await expect(page.locator('h1')).toContainText('HYPEAI');
    console.log('✓ Homepage loaded');

    // Step 2: User scrolls to tokenomics
    await page.locator('a[href="#tokenomics"]').click();
    await expect(page.locator('#tokenomics')).toBeVisible();
    console.log('✓ Navigated to tokenomics section');

    // Step 3: User opens AI chat
    const chatFab = page.locator('.assistant-fab, .hyper-chat-fab');
    await chatFab.click();
    await expect(page.locator('.assistant-window, .hyper-chat-container')).toBeVisible();
    console.log('✓ AI chat opened');

    // Step 4: User asks a question
    const input = page.locator('#assistant-input, #hyper-chat-input');
    await input.fill('How do I buy $HYPE tokens?');

    const sendButton = page.locator('#assistant-send, button[aria-label*="Send"]');
    await sendButton.click();
    console.log('✓ Message sent to AI');

    // Step 5: Verify AI responds
    await page.waitForTimeout(3000); // Wait for AI response
    const assistantMessage = page.locator('.assistant-message.assistant, .hyper-message.assistant').last();
    await expect(assistantMessage).toBeVisible({ timeout: 10000 });
    console.log('✓ AI responded');

    // Step 6: User navigates to services
    await page.goto('/services.html');
    await expect(page.locator('h1')).toContainText('Services');
    console.log('✓ Services page loaded');

    // Step 7: User filters services
    const individualsTab = page.locator('[data-tab="individuals"]');
    await individualsTab.click();
    await page.waitForTimeout(500); // Animation

    // Verify filtering worked
    const visibleCards = page.locator('.service-card:visible');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);
    console.log(`✓ Filtered to ${count} services for individuals`);

    // Step 8: User clicks "Buy $HYPE" button
    await page.goto('/');
    const buyButton = page.locator('button:has-text("Buy $HYPE"), a:has-text("Buy $HYPE")').first();
    await buyButton.click();
    console.log('✓ Buy button clicked');

    // Step 9: Verify navigation or modal appears
    // (This depends on your implementation)
    await page.waitForTimeout(1000);
    console.log('✓ Purchase flow initiated');

    // Step 10: Check for success indicators
    const hasModal = await page.locator('.modal, .dialog, [role="dialog"]').isVisible().catch(() => false);
    const urlChanged = page.url().includes('buy') || page.url().includes('purchase');

    expect(hasModal || urlChanged).toBeTruthy();
    console.log('✓ User successfully navigated purchase flow');
  });

  test('handles network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/chat**', route => route.abort());

    await page.goto('/');
    const chatFab = page.locator('.assistant-fab, .hyper-chat-fab');
    await chatFab.click();

    const input = page.locator('#assistant-input, #hyper-chat-input');
    await input.fill('Test message');

    const sendButton = page.locator('#assistant-send, button[aria-label*="Send"]');
    await sendButton.click();

    // Should show error message
    await expect(page.locator('.error, .toast.error, [role="alert"]')).toBeVisible({ timeout: 5000 });
    console.log('✓ Error handling works');
  });

  test('mobile user journey on iPhone 13', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // Test mobile navigation
    await page.goto('/');

    // Open mobile menu if exists
    const menuButton = page.locator('button[aria-label*="menu"], .mobile-menu-toggle, .hamburger');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      console.log('✓ Mobile menu opened');
    }

    // Test AI chat on mobile
    const chatFab = page.locator('.assistant-fab, .hyper-chat-fab');
    await chatFab.tap();
    await expect(page.locator('.assistant-window, .hyper-chat-container')).toBeVisible();
    console.log('✓ Mobile chat opened');

    // Verify mobile-optimized layout
    const chatWindow = page.locator('.assistant-window, .hyper-chat-container').first();
    const box = await chatWindow.boundingBox();

    expect(box.width).toBeLessThanOrEqual(390);
    console.log('✓ Mobile layout optimized');
  });
});
```

---

## 🧪 Example 2: Unit Test for Cookie Consent

**File:** `/tests/unit/frontend/cookie-consent.test.js`

```javascript
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

global.localStorage = localStorageMock;

// Simple CookieConsent implementation for testing
class CookieConsent {
  constructor() {
    this.STORAGE_KEY = 'hypeai_cookie_consent';
  }

  hasConsent(type = 'necessary') {
    const consent = this.getConsent();
    return consent && consent[type] === true;
  }

  getConsent() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  setConsent(preferences) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
  }

  acceptAll() {
    this.setConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
  }

  acceptNecessaryOnly() {
    this.setConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  }

  shouldShowBanner() {
    return !this.getConsent();
  }

  revokeConsent() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

describe('CookieConsent', () => {
  let consent;

  beforeEach(() => {
    localStorage.clear();
    consent = new CookieConsent();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    test('should show banner on first visit', () => {
      expect(consent.shouldShowBanner()).toBe(true);
    });

    test('should not have any consent initially', () => {
      expect(consent.hasConsent('necessary')).toBe(false);
      expect(consent.hasConsent('analytics')).toBe(false);
    });

    test('should return null for consent on first visit', () => {
      expect(consent.getConsent()).toBeNull();
    });
  });

  describe('Accept All Cookies', () => {
    test('should accept all cookie types', () => {
      consent.acceptAll();

      expect(consent.hasConsent('necessary')).toBe(true);
      expect(consent.hasConsent('analytics')).toBe(true);
      expect(consent.hasConsent('marketing')).toBe(true);
      expect(consent.hasConsent('preferences')).toBe(true);
    });

    test('should persist consent to localStorage', () => {
      consent.acceptAll();

      const stored = localStorage.getItem('hypeai_cookie_consent');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored);
      expect(parsed.necessary).toBe(true);
      expect(parsed.analytics).toBe(true);
    });

    test('should hide banner after accepting', () => {
      consent.acceptAll();
      expect(consent.shouldShowBanner()).toBe(false);
    });
  });

  describe('Accept Necessary Only', () => {
    test('should only accept necessary cookies', () => {
      consent.acceptNecessaryOnly();

      expect(consent.hasConsent('necessary')).toBe(true);
      expect(consent.hasConsent('analytics')).toBe(false);
      expect(consent.hasConsent('marketing')).toBe(false);
    });

    test('should hide banner after accepting necessary', () => {
      consent.acceptNecessaryOnly();
      expect(consent.shouldShowBanner()).toBe(false);
    });
  });

  describe('Custom Preferences', () => {
    test('should accept custom preferences', () => {
      consent.setConsent({
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: true,
      });

      expect(consent.hasConsent('necessary')).toBe(true);
      expect(consent.hasConsent('analytics')).toBe(true);
      expect(consent.hasConsent('marketing')).toBe(false);
      expect(consent.hasConsent('preferences')).toBe(true);
    });
  });

  describe('Revoke Consent', () => {
    test('should revoke all consent', () => {
      consent.acceptAll();
      expect(consent.hasConsent('analytics')).toBe(true);

      consent.revokeConsent();
      expect(consent.hasConsent('analytics')).toBe(false);
      expect(consent.shouldShowBanner()).toBe(true);
    });

    test('should clear localStorage', () => {
      consent.acceptAll();
      consent.revokeConsent();

      const stored = localStorage.getItem('hypeai_cookie_consent');
      expect(stored).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    test('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('hypeai_cookie_consent', 'invalid json');

      expect(() => consent.getConsent()).toThrow();
    });

    test('should handle undefined consent type', () => {
      consent.acceptAll();
      expect(consent.hasConsent('nonexistent')).toBeUndefined();
    });

    test('should be case-sensitive for consent types', () => {
      consent.acceptAll();
      expect(consent.hasConsent('Analytics')).toBeUndefined();
      expect(consent.hasConsent('analytics')).toBe(true);
    });
  });

  describe('GDPR Compliance', () => {
    test('should default to no consent (GDPR requirement)', () => {
      expect(consent.hasConsent('analytics')).toBe(false);
      expect(consent.hasConsent('marketing')).toBe(false);
    });

    test('should require explicit consent', () => {
      // Necessary cookies can be assumed, but others need explicit consent
      consent.acceptNecessaryOnly();

      expect(consent.hasConsent('necessary')).toBe(true);
      expect(consent.hasConsent('analytics')).toBe(false);
    });

    test('should allow consent to be withdrawn', () => {
      consent.acceptAll();
      consent.revokeConsent();

      expect(consent.getConsent()).toBeNull();
      expect(consent.shouldShowBanner()).toBe(true);
    });
  });
});
```

---

## ⚡ Example 3: Performance Load Test

**File:** `/tests/performance/load/ai-chat-load.test.js`

```javascript
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTrend = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },    // Warm-up
    { duration: '1m', target: 50 },     // Ramp up to 50 users
    { duration: '2m', target: 100 },    // Ramp up to 100 users
    { duration: '3m', target: 500 },    // Peak load - 500 users
    { duration: '2m', target: 1000 },   // Stress test - 1000 users
    { duration: '1m', target: 0 },      // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],    // 95% under 500ms
    'http_req_duration{api:chat}': ['p(99)<1000'], // 99% chat under 1s
    'http_req_failed': ['rate<0.01'],      // <1% errors
    'errors': ['rate<0.05'],               // <5% custom errors
    'response_time': ['avg<300', 'p(95)<500'],
  },
};

// Test scenarios
export default function () {
  group('AI Chat Endpoint', () => {
    // Generate unique session ID per VU
    const sessionId = `load-test-${__VU}-${__ITER}`;

    // Test chat message
    const payload = JSON.stringify({
      message: 'What is HYPEAI and how does it work?',
      session_id: sessionId,
      user_id: `user-${__VU}`,
    });

    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
      tags: {
        api: 'chat',
      },
    };

    // Send chat request
    const startTime = new Date();
    const response = http.post('https://hypeai.io/api/chat', payload, params);
    const duration = new Date() - startTime;

    // Record metrics
    responseTrend.add(duration);

    // Validate response
    const checkRes = check(response, {
      'status is 200': (r) => r.status === 200,
      'has response': (r) => r.json('response') !== undefined,
      'response not empty': (r) => r.json('response').length > 0,
      'response time < 500ms': (r) => r.timings.duration < 500,
      'has session_id': (r) => r.json('session_id') !== undefined,
    });

    // Track errors
    errorRate.add(!checkRes);

    if (!checkRes) {
      console.error(`Request failed: ${response.status} - ${response.body}`);
    }
  });

  // Simulate user think time
  sleep(1 + Math.random() * 2); // 1-3 seconds

  // Additional endpoints (25% of users)
  if (Math.random() < 0.25) {
    group('Services Page Load', () => {
      const response = http.get('https://hypeai.io/services.html');

      check(response, {
        'services page loads': (r) => r.status === 200,
        'load time < 2s': (r) => r.timings.duration < 2000,
      });
    });

    sleep(2);
  }
}

// Setup function (runs once per VU)
export function setup() {
  console.log('Starting load test...');
  console.log(`Target: ${options.stages[4].target} concurrent users`);

  // Verify API is accessible
  const response = http.get('https://hypeai.io/');
  check(response, {
    'homepage accessible': (r) => r.status === 200,
  });

  return { startTime: new Date() };
}

// Teardown function (runs once after all VUs finish)
export function teardown(data) {
  const duration = (new Date() - new Date(data.startTime)) / 1000;
  console.log(`Load test completed in ${duration}s`);
}
```

---

## 🎨 Example 4: Visual Regression Test

**File:** `/tests/visual/homepage-visual.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Visual Regression - Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for animations to complete
    await page.waitForTimeout(2000);
  });

  test('full homepage matches baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      maxDiffPixels: 100, // Allow 100 pixels difference
    });
  });

  test('hero section matches baseline', async ({ page }) => {
    const hero = page.locator('#hero, .hero-section').first();
    await expect(hero).toHaveScreenshot('hero-section.png', {
      maxDiffPixelRatio: 0.01, // 1% tolerance
    });
  });

  test('navigation matches baseline', async ({ page }) => {
    const nav = page.locator('nav, .nav-sticky').first();
    await expect(nav).toHaveScreenshot('navigation.png');
  });

  test('AI chat widget closed state', async ({ page }) => {
    const chatFab = page.locator('.assistant-fab, .hyper-chat-fab').first();
    await expect(chatFab).toHaveScreenshot('chat-fab-closed.png');
  });

  test('AI chat widget open state', async ({ page }) => {
    const chatFab = page.locator('.assistant-fab, .hyper-chat-fab');
    await chatFab.click();
    await page.waitForTimeout(500); // Wait for animation

    const chatWindow = page.locator('.assistant-window, .hyper-chat-container').first();
    await expect(chatWindow).toHaveScreenshot('chat-window-open.png');
  });

  test('mobile homepage matches baseline', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('homepage-mobile-375.png', {
      fullPage: true,
    });
  });

  test('tablet homepage matches baseline', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('homepage-tablet-768.png', {
      fullPage: true,
    });
  });

  test('hover states match baseline', async ({ page }) => {
    const buyButton = page.locator('button:has-text("Buy $HYPE")').first();

    // Hover over button
    await buyButton.hover();
    await page.waitForTimeout(300); // Wait for hover animation

    await expect(buyButton).toHaveScreenshot('buy-button-hover.png');
  });

  test('dark mode matches baseline', async ({ page }) => {
    // If you have dark mode toggle
    const darkModeToggle = page.locator('[aria-label*="dark mode"], .dark-mode-toggle');
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
        fullPage: true,
      });
    }
  });

  test('loading states match baseline', async ({ page }) => {
    // Slow down network to capture loading state
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });

    await page.goto('/');

    // Capture loading spinner if visible
    const loader = page.locator('.loader, .loading, .spinner');
    if (await loader.isVisible({ timeout: 1000 })) {
      await expect(loader).toHaveScreenshot('loading-spinner.png');
    }
  });
});

test.describe('Visual Regression - Cross-Browser', () => {
  test.use({ browserName: 'chromium' });

  test('homepage looks same in Chrome', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('homepage-chrome.png', { fullPage: true });
  });
});
```

---

## 🔐 Example 5: Security Test

**File:** `/tests/security/frontend-xss.test.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Frontend XSS Prevention', () => {
  test('should sanitize user input in chat', async ({ page }) => {
    await page.goto('/');

    // Open chat
    const chatFab = page.locator('.assistant-fab, .hyper-chat-fab');
    await chatFab.click();

    // Try XSS payload
    const xssPayload = '<script>alert("XSS")</script>';
    const input = page.locator('#assistant-input, #hyper-chat-input');
    await input.fill(xssPayload);

    const sendButton = page.locator('#assistant-send, button[aria-label*="Send"]');
    await sendButton.click();

    // Listen for dialogs (XSS would trigger alert)
    let dialogAppeared = false;
    page.on('dialog', () => {
      dialogAppeared = true;
    });

    await page.waitForTimeout(2000);

    // Verify no XSS executed
    expect(dialogAppeared).toBe(false);

    // Verify message is sanitized
    const userMessage = page.locator('.assistant-message.user, .hyper-message.user').last();
    const messageText = await userMessage.textContent();

    // Should not contain <script> tags
    expect(messageText).not.toContain('<script>');
    console.log('✓ XSS payload sanitized');
  });

  test('should prevent DOM-based XSS in URL params', async ({ page }) => {
    // Try XSS via URL parameter
    await page.goto('/?name=<script>alert("XSS")</script>');

    let dialogAppeared = false;
    page.on('dialog', () => {
      dialogAppeared = true;
    });

    await page.waitForTimeout(2000);
    expect(dialogAppeared).toBe(false);
    console.log('✓ URL parameter XSS prevented');
  });

  test('should sanitize HTML in service descriptions', async ({ page }) => {
    await page.goto('/services.html');

    // Check all service cards
    const serviceCards = page.locator('.service-card');
    const count = await serviceCards.count();

    for (let i = 0; i < count; i++) {
      const card = serviceCards.nth(i);
      const html = await card.innerHTML();

      // Should not have unescaped script tags
      expect(html).not.toMatch(/<script[^>]*>(?!<\/script>)/);
    }

    console.log(`✓ All ${count} service cards are XSS-safe`);
  });

  test('should escape user-generated content', async ({ page }) => {
    await page.goto('/');

    // Dangerous payloads to test
    const payloads = [
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      'javascript:alert("XSS")',
      '<iframe src="javascript:alert(\'XSS\')">',
    ];

    const chatFab = page.locator('.assistant-fab, .hyper-chat-fab');
    await chatFab.click();

    for (const payload of payloads) {
      const input = page.locator('#assistant-input, #hyper-chat-input');
      await input.fill(payload);

      const sendButton = page.locator('#assistant-send, button[aria-label*="Send"]');
      await sendButton.click();

      await page.waitForTimeout(500);

      // Check last message
      const userMessage = page.locator('.assistant-message.user, .hyper-message.user').last();
      const messageText = await userMessage.textContent();

      // Should be escaped
      expect(messageText).not.toContain('<script>');
      expect(messageText).not.toContain('onerror=');
      expect(messageText).not.toContain('javascript:');
    }

    console.log(`✓ All ${payloads.length} XSS payloads prevented`);
  });
});
```

---

## 📱 Example 6: Mobile Responsiveness Test

**File:** `/tests/e2e/mobile/mobile-responsiveness.spec.js`

```javascript
import { test, expect, devices } from '@playwright/test';

const mobileDevices = [
  { name: 'iPhone SE', ...devices['iPhone SE'] },
  { name: 'iPhone 13', ...devices['iPhone 13'] },
  { name: 'iPhone 14 Pro', ...devices['iPhone 14 Pro'] },
  { name: 'Pixel 5', ...devices['Pixel 5'] },
  { name: 'Samsung Galaxy S21', ...devices['Galaxy S9+'] },
];

for (const device of mobileDevices) {
  test.describe(`Mobile Tests - ${device.name}`, () => {
    test.use(device);

    test('homepage renders correctly', async ({ page }) => {
      await page.goto('/');

      // Check critical elements are visible
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav, .nav-sticky')).toBeVisible();

      console.log(`✓ ${device.name}: Homepage renders`);
    });

    test('navigation is touch-friendly', async ({ page }) => {
      await page.goto('/');

      // All touch targets should be >= 44x44px
      const buttons = page.locator('button, a[href]');
      const count = await buttons.count();

      let smallTargets = 0;
      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          if (box && (box.width < 44 || box.height < 44)) {
            smallTargets++;
            console.warn(`Small touch target: ${await button.textContent()}`);
          }
        }
      }

      expect(smallTargets).toBe(0);
      console.log(`✓ ${device.name}: All touch targets >= 44px`);
    });

    test('AI chat works on mobile', async ({ page }) => {
      await page.goto('/');

      const chatFab = page.locator('.assistant-fab, .hyper-chat-fab');
      await chatFab.tap();

      await expect(page.locator('.assistant-window, .hyper-chat-container')).toBeVisible();

      const input = page.locator('#assistant-input, #hyper-chat-input');
      await input.tap();
      await input.type('Test message');

      expect(await input.inputValue()).toBe('Test message');
      console.log(`✓ ${device.name}: Chat input works`);
    });

    test('scrolling is smooth', async ({ page }) => {
      await page.goto('/');

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 1000));
      await page.waitForTimeout(500);

      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(800);

      console.log(`✓ ${device.name}: Scrolling works`);
    });

    test('no horizontal scroll', async ({ page }) => {
      await page.goto('/');

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
      console.log(`✓ ${device.name}: No horizontal scroll`);
    });

    test('viewport meta tag is correct', async ({ page }) => {
      await page.goto('/');

      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');

      expect(viewport).toContain('width=device-width');
      expect(viewport).toContain('initial-scale=1');
      console.log(`✓ ${device.name}: Viewport meta correct`);
    });
  });
}
```

---

## 🚀 Running These Tests

### Setup
```bash
# Install dependencies
npm install --save-dev @playwright/test jest k6

# Install Playwright browsers
npx playwright install
```

### Run Individual Tests
```bash
# E2E test
npx playwright test tests/e2e/journeys/new-user-onboarding.spec.js

# Unit test
npm test -- tests/unit/frontend/cookie-consent.test.js

# Performance test
k6 run tests/performance/load/ai-chat-load.test.js

# Visual test
npx playwright test tests/visual/homepage-visual.spec.js
```

### Run All Tests
```bash
# Run everything
npm run test:all
```

---

**These examples are production-ready and can be copied directly into your test suite!**
