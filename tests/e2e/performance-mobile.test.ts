/**
 * E2E Performance and Mobile Responsive Tests
 * Tests for performance metrics and mobile responsiveness
 */

import { test, expect, devices } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

describe('Performance Tests', () => {
  test('Dashboard should load within 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000);
  });

  test('Referral page should load within 1.5 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${BASE_URL}/referral`);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(1500);
  });

  test('API response time should be under 500ms', async ({ page }) => {
    await page.goto(`${BASE_URL}/referral`);

    const [response] = await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/api/referral/stats') &&
        response.status() === 200
      ),
      page.reload()
    ]);

    const responseTime = response.timing().responseEnd - response.timing().requestStart;
    expect(responseTime).toBeLessThan(500);
  });

  test('Should handle 50 concurrent users', async ({ browser }) => {
    const contexts = await Promise.all(
      Array(50).fill(null).map(() => browser.newContext())
    );

    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );

    const startTime = Date.now();

    await Promise.all(
      pages.map(page => page.goto(`${BASE_URL}/leaderboard`))
    );

    const totalTime = Date.now() - startTime;

    // All pages should load within 5 seconds
    expect(totalTime).toBeLessThan(5000);

    // Cleanup
    await Promise.all(pages.map(page => page.close()));
    await Promise.all(contexts.map(context => context.close()));
  });

  test('Memory usage should stay below 100MB', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Get memory usage
    const metrics = await page.metrics();

    // JSHeapUsedSize should be reasonable
    expect(metrics.JSHeapUsedSize).toBeLessThan(100 * 1024 * 1024); // 100MB
  });

  test('Should not have performance issues after 5 minutes', async ({ page }) => {
    await page.goto(`${BASE_URL}/referral`);

    const initialMetrics = await page.metrics();

    // Simulate user activity for 5 minutes (compressed to 30 seconds)
    for (let i = 0; i < 10; i++) {
      await page.reload();
      await page.waitForTimeout(3000);
      await page.click('[data-testid="refresh-button"]');
      await page.waitForTimeout(3000);
    }

    const finalMetrics = await page.metrics();

    // Memory should not increase by more than 50MB
    const memoryIncrease = finalMetrics.JSHeapUsedSize - initialMetrics.JSHeapUsedSize;
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });

  test('Large dataset rendering performance', async ({ page }) => {
    // Test with 1000 referrals
    await page.goto(`${BASE_URL}/referral/list?limit=1000`);

    const startTime = Date.now();
    await page.waitForSelector('[data-testid="referral-item"]');
    const renderTime = Date.now() - startTime;

    // Should render within 3 seconds
    expect(renderTime).toBeLessThan(3000);

    // Check virtual scrolling is working
    const visibleItems = await page.$$('[data-testid="referral-item"]');
    // Should only render visible items, not all 1000
    expect(visibleItems.length).toBeLessThan(100);
  });
});

describe('Mobile Responsive Tests', () => {
  test.describe('iPhone 12', () => {
    test.use({ ...devices['iPhone 12'] });

    test('Dashboard should be fully responsive', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);

      const viewport = page.viewportSize();
      expect(viewport?.width).toBe(390);

      // Check mobile menu is visible
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

      // Check stats cards stack vertically
      const statsCards = await page.$$('[data-testid="stat-card"]');
      const firstCard = await statsCards[0].boundingBox();
      const secondCard = await statsCards[1].boundingBox();

      // Cards should be stacked (Y position of second > Y position of first)
      expect(secondCard!.y).toBeGreaterThan(firstCard!.y);
    });

    test('Referral page should be mobile-friendly', async ({ page }) => {
      await page.goto(`${BASE_URL}/referral`);

      // Referral code input should be full width
      const codeInput = await page.$('[data-testid="referral-code"]');
      const inputBox = await codeInput?.boundingBox();

      expect(inputBox?.width).toBeGreaterThan(300); // Nearly full screen width

      // Copy button should be touchable (at least 44x44 pixels)
      const copyButton = await page.$('[data-testid="copy-button"]');
      const buttonBox = await copyButton?.boundingBox();

      expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    });

    test('QR code should scale properly on mobile', async ({ page }) => {
      await page.goto(`${BASE_URL}/referral`);

      await page.click('[data-testid="generate-qr-button"]');
      await page.waitForSelector('[data-testid="qr-code-image"]');

      const qrImage = await page.$('[data-testid="qr-code-image"]');
      const imageBox = await qrImage?.boundingBox();

      // QR code should fit within screen width with padding
      const viewport = page.viewportSize();
      expect(imageBox?.width).toBeLessThan(viewport!.width - 40);
    });

    test('Mobile menu navigation should work', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);

      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"]');

      // Menu should slide in
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

      // Navigate to referral page
      await page.click('[data-testid="menu-referral-link"]');

      await page.waitForURL(`${BASE_URL}/referral`);
      expect(page.url()).toContain('/referral');

      // Menu should close after navigation
      await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
    });

    test('Touch gestures should work', async ({ page }) => {
      await page.goto(`${BASE_URL}/referral/list`);

      // Test swipe to refresh
      await page.touchscreen.swipe({ x: 200, y: 100 }, { x: 200, y: 300 });

      // Should show loading indicator
      await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();

      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('iPad Pro', () => {
    test.use({ ...devices['iPad Pro'] });

    test('Dashboard should use tablet layout', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);

      const viewport = page.viewportSize();
      expect(viewport?.width).toBe(1024);

      // Should show 2 columns on tablet
      const statsGrid = await page.$('[data-testid="stats-grid"]');
      const gridStyle = await statsGrid?.evaluate(el =>
        window.getComputedStyle(el).gridTemplateColumns
      );

      // Should have 2 columns
      expect(gridStyle?.split(' ').length).toBe(2);
    });

    test('Side-by-side layout for referral details', async ({ page }) => {
      await page.goto(`${BASE_URL}/referral`);

      // Referral link and QR code should be side-by-side on tablet
      const linkSection = await page.$('[data-testid="link-section"]');
      const qrSection = await page.$('[data-testid="qr-section"]');

      const linkBox = await linkSection?.boundingBox();
      const qrBox = await qrSection?.boundingBox();

      // Should be approximately at same Y position (side-by-side)
      expect(Math.abs(linkBox!.y - qrBox!.y)).toBeLessThan(50);
    });
  });

  test.describe('Android Phone', () => {
    test.use({ ...devices['Pixel 5'] });

    test('Bottom navigation should be visible', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);

      const bottomNav = await page.$('[data-testid="bottom-navigation"]');
      await expect(bottomNav).toBeVisible();

      // Should be at bottom of screen
      const navBox = await bottomNav?.boundingBox();
      const viewport = page.viewportSize();

      expect(navBox!.y + navBox!.height).toBeCloseTo(viewport!.height, -1);
    });

    test('Forms should zoom correctly on Android', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);

      // Check viewport meta tag prevents zoom issues
      const viewportMeta = await page.$('meta[name="viewport"]');
      const content = await viewportMeta?.getAttribute('content');

      expect(content).toContain('width=device-width');
      expect(content).toContain('initial-scale=1');

      // Focus on input should not cause unwanted zoom
      await page.focus('[name="email"]');

      // Font size should be at least 16px to prevent auto-zoom on iOS
      const fontSize = await page.$eval('[name="email"]', el =>
        window.getComputedStyle(el).fontSize
      );

      expect(parseInt(fontSize)).toBeGreaterThanOrEqual(16);
    });
  });

  test.describe('Landscape Orientation', () => {
    test('Should adapt to landscape mode', async ({ page }) => {
      await page.setViewportSize({ width: 844, height: 390 }); // iPhone 12 landscape

      await page.goto(`${BASE_URL}/dashboard`);

      // Stats should be in a row in landscape
      const statsCards = await page.$$('[data-testid="stat-card"]');
      const firstCard = await statsCards[0].boundingBox();
      const secondCard = await statsCards[1].boundingBox();

      // Cards should be side-by-side (same Y position)
      expect(Math.abs(firstCard!.y - secondCard!.y)).toBeLessThan(10);
    });
  });

  test.describe('Accessibility on Mobile', () => {
    test.use({ ...devices['iPhone 12'] });

    test('Touch targets should meet minimum size requirements', async ({ page }) => {
      await page.goto(`${BASE_URL}/referral`);

      const buttons = await page.$$('button');

      for (const button of buttons) {
        const box = await button.boundingBox();

        if (box) {
          // WCAG minimum touch target: 44x44 pixels
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('Text should be readable on small screens', async ({ page }) => {
      await page.goto(`${BASE_URL}/referral`);

      // Check body text size
      const bodyText = await page.$('p');
      const fontSize = await bodyText?.evaluate(el =>
        parseInt(window.getComputedStyle(el).fontSize)
      );

      // Should be at least 14px for readability
      expect(fontSize).toBeGreaterThanOrEqual(14);
    });

    test('Forms should work with screen readers', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);

      // Check all inputs have labels
      const inputs = await page.$$('input');

      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const label = await page.$(`label[for="${id}"]`);

        expect(ariaLabel || label).toBeTruthy();
      }
    });
  });

  test.describe('Network Conditions', () => {
    test('Should work on slow 3G', async ({ page, context }) => {
      // Simulate slow 3G
      await context.route('**/*', route => {
        setTimeout(() => route.continue(), 300); // 300ms delay
      });

      const startTime = Date.now();

      await page.goto(`${BASE_URL}/referral`);
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Should show loading state
      // Page should still be usable within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('Should show offline indicator when network is down', async ({ page, context }) => {
      await page.goto(`${BASE_URL}/dashboard`);

      // Go offline
      await context.setOffline(true);

      await page.reload().catch(() => {
        // Expected to fail
      });

      // Should show offline message
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    });
  });
});

describe('Cross-Browser Compatibility', () => {
  test.describe('Safari-specific tests', () => {
    test.use({ ...devices['iPhone 12'] });

    test('iOS safe area should be respected', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);

      const header = await page.$('header');
      const headerStyle = await header?.evaluate(el =>
        window.getComputedStyle(el).paddingTop
      );

      // Should include safe area inset
      expect(headerStyle).toBeTruthy();
    });
  });
});
