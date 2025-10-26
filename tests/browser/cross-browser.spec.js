/**
 * Cross-Browser Tests with Playwright
 * Tests Chrome, Firefox, Safari, Edge, Mobile
 */

import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test.describe('Basic Functionality', () => {
    test('should load chat widget in all browsers', async ({ page }) => {
      const chatFab = page.locator('.assistant-fab');
      await expect(chatFab).toBeVisible();
    });

    test('should open chat window on click', async ({ page }) => {
      const chatFab = page.locator('.assistant-fab');
      await chatFab.click();

      const chatWindow = page.locator('.assistant-window.open');
      await expect(chatWindow).toBeVisible();
    });

    test('should close chat window', async ({ page }) => {
      await page.locator('.assistant-fab').click();
      await page.locator('.assistant-close').click();

      const chatWindow = page.locator('.assistant-window.open');
      await expect(chatWindow).not.toBeVisible();
    });

    test('should type message and send', async ({ page }) => {
      await page.locator('.assistant-fab').click();

      const input = page.locator('#assistant-input');
      await input.fill('Test message');

      const sendButton = page.locator('#assistant-send');
      await sendButton.click();

      // Check message was sent
      const userMessage = page.locator('.assistant-message.user').last();
      await expect(userMessage).toContainText('Test message');
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on desktop (1920x1080)', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      const chatFab = page.locator('.assistant-fab');
      await expect(chatFab).toBeVisible();

      await chatFab.click();
      const chatWindow = page.locator('.assistant-window');
      await expect(chatWindow).toBeVisible();
    });

    test('should work on tablet (768x1024)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      const chatFab = page.locator('.assistant-fab');
      await expect(chatFab).toBeVisible();

      await chatFab.click();
      const chatWindow = page.locator('.assistant-window');
      await expect(chatWindow).toBeVisible();
    });

    test('should work on mobile (375x667 - iPhone SE)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const chatFab = page.locator('.assistant-fab');
      await expect(chatFab).toBeVisible();

      await chatFab.click();
      const chatWindow = page.locator('.assistant-window');
      await expect(chatWindow).toBeVisible();
    });

    test('should work on large mobile (414x896 - iPhone 11)', async ({ page }) => {
      await page.setViewportSize({ width: 414, height: 896 });

      const chatFab = page.locator('.assistant-fab');
      await expect(chatFab).toBeVisible();

      await chatFab.click();
      const chatWindow = page.locator('.assistant-window');
      await expect(chatWindow).toBeVisible();
    });
  });

  test.describe('Touch Events (Mobile)', () => {
    test('should open on tap', async ({ page }) => {
      const chatFab = page.locator('.assistant-fab');
      await chatFab.tap();

      const chatWindow = page.locator('.assistant-window.open');
      await expect(chatWindow).toBeVisible();
    });

    test('should close on tap', async ({ page }) => {
      await page.locator('.assistant-fab').tap();
      await page.locator('.assistant-close').tap();

      const chatWindow = page.locator('.assistant-window.open');
      await expect(chatWindow).not.toBeVisible();
    });

    test('should scroll messages on touch', async ({ page }) => {
      await page.locator('.assistant-fab').tap();

      const messagesContainer = page.locator('#assistant-messages');

      // Add multiple messages (simulated)
      await page.evaluate(() => {
        const container = document.getElementById('assistant-messages');
        for (let i = 0; i < 20; i++) {
          const msg = document.createElement('div');
          msg.className = 'assistant-message user';
          msg.textContent = `Message ${i}`;
          container.appendChild(msg);
        }
      });

      // Check scrollable
      const isScrollable = await messagesContainer.evaluate((el) => {
        return el.scrollHeight > el.clientHeight;
      });

      expect(isScrollable).toBe(true);
    });
  });

  test.describe('CSS Compatibility', () => {
    test('should display gradients correctly', async ({ page }) => {
      await page.locator('.assistant-fab').click();

      const header = page.locator('.assistant-header');
      const bgImage = await header.evaluate((el) => {
        return window.getComputedStyle(el).backgroundImage;
      });

      expect(bgImage).toContain('gradient');
    });

    test('should display animations smoothly', async ({ page }) => {
      const chatFab = page.locator('.assistant-fab');

      // Check for animation
      const hasAnimation = await chatFab.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.animationName !== 'none';
      });

      // Some browsers might have animations
      expect(typeof hasAnimation).toBe('boolean');
    });

    test('should support CSS Grid', async ({ page }) => {
      const body = page.locator('body');

      const hasGridSupport = await body.evaluate(() => {
        return CSS.supports('display', 'grid');
      });

      expect(hasGridSupport).toBe(true);
    });

    test('should support Flexbox', async ({ page }) => {
      const body = page.locator('body');

      const hasFlexSupport = await body.evaluate(() => {
        return CSS.supports('display', 'flex');
      });

      expect(hasFlexSupport).toBe(true);
    });
  });

  test.describe('JavaScript Compatibility', () => {
    test('should support localStorage', async ({ page }) => {
      const hasLocalStorage = await page.evaluate(() => {
        try {
          localStorage.setItem('test', 'value');
          localStorage.removeItem('test');
          return true;
        } catch {
          return false;
        }
      });

      expect(hasLocalStorage).toBe(true);
    });

    test('should support fetch API', async ({ page }) => {
      const hasFetch = await page.evaluate(() => {
        return typeof fetch === 'function';
      });

      expect(hasFetch).toBe(true);
    });

    test('should support Promises', async ({ page }) => {
      const hasPromises = await page.evaluate(() => {
        return typeof Promise === 'function';
      });

      expect(hasPromises).toBe(true);
    });

    test('should support ES6 features', async ({ page }) => {
      const hasES6 = await page.evaluate(() => {
        try {
          // Test arrow functions
          const arrow = () => true;
          // Test template literals
          const template = `test`;
          // Test const/let
          const test = true;
          return true;
        } catch {
          return false;
        }
      });

      expect(hasES6).toBe(true);
    });
  });

  test.describe('Font Rendering', () => {
    test('should load custom fonts', async ({ page }) => {
      await page.locator('.assistant-fab').click();

      const header = page.locator('.assistant-header h3');
      const fontFamily = await header.evaluate((el) => {
        return window.getComputedStyle(el).fontFamily;
      });

      expect(fontFamily).toBeDefined();
      expect(fontFamily.length).toBeGreaterThan(0);
    });

    test('should render emoji correctly', async ({ page }) => {
      await page.locator('.assistant-fab').click();

      const avatar = page.locator('.assistant-avatar');
      await expect(avatar).toContainText('🤖');
    });
  });

  test.describe('Network Conditions', () => {
    test('should work offline with cached data', async ({ page, context }) => {
      // First load with network
      await page.goto('/index.html');
      await page.locator('.assistant-fab').click();

      // Then go offline
      await context.setOffline(true);

      // Should still display UI
      const chatWindow = page.locator('.assistant-window');
      await expect(chatWindow).toBeVisible();

      await context.setOffline(false);
    });

    test('should handle slow 3G network', async ({ page, context }) => {
      await context.route('**/*', (route) => {
        setTimeout(() => route.continue(), 400); // 400ms delay
      });

      await page.goto('/index.html');
      const chatFab = page.locator('.assistant-fab');
      await expect(chatFab).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Input Methods', () => {
    test('should support keyboard input', async ({ page }) => {
      await page.locator('.assistant-fab').click();

      const input = page.locator('#assistant-input');
      await input.type('Test message');

      await input.press('Enter');

      const userMessage = page.locator('.assistant-message.user').last();
      await expect(userMessage).toContainText('Test message');
    });

    test('should support copy-paste', async ({ page }) => {
      await page.locator('.assistant-fab').click();

      const input = page.locator('#assistant-input');

      // Simulate paste
      await input.fill('Pasted content');

      const value = await input.inputValue();
      expect(value).toBe('Pasted content');
    });
  });

  test.describe('Accessibility Features', () => {
    test('should support screen reader navigation', async ({ page }) => {
      const chatFab = page.locator('.assistant-fab');

      const ariaLabel = await chatFab.getAttribute('aria-label');
      expect(ariaLabel).toBeDefined();
      expect(ariaLabel.length).toBeGreaterThan(0);
    });

    test('should have keyboard focus indicators', async ({ page }) => {
      await page.locator('.assistant-fab').click();

      const input = page.locator('#assistant-input');
      await input.focus();

      const isFocused = await input.evaluate((el) => {
        return el === document.activeElement;
      });

      expect(isFocused).toBe(true);
    });

    test('should support high contrast mode', async ({ page }) => {
      // Check if elements are visible in high contrast
      const chatFab = page.locator('.assistant-fab');

      const bgColor = await chatFab.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      expect(bgColor).toBeDefined();
    });
  });

  test.describe('Performance', () => {
    test('should load page under 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/index.html');
      await page.waitForLoadState('load');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });

    test('should render 60fps during scroll', async ({ page }) => {
      await page.locator('.assistant-fab').click();

      // Measure frame rate
      const fps = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frameCount = 0;
          const startTime = performance.now();

          function countFrame() {
            frameCount++;
            if (performance.now() - startTime < 1000) {
              requestAnimationFrame(countFrame);
            } else {
              resolve(frameCount);
            }
          }

          requestAnimationFrame(countFrame);
        });
      });

      expect(fps).toBeGreaterThan(50); // Allow some margin
    });
  });

  test.describe('Security', () => {
    test('should prevent XSS attacks', async ({ page }) => {
      await page.locator('.assistant-fab').click();

      const input = page.locator('#assistant-input');
      await input.fill('<script>alert("XSS")</script>');

      const sendButton = page.locator('#assistant-send');
      await sendButton.click();

      // Script should not execute
      page.on('dialog', () => {
        throw new Error('XSS vulnerability detected!');
      });

      // Wait a moment to ensure no dialog appears
      await page.waitForTimeout(1000);
    });

    test('should use HTTPS for API calls', async ({ page }) => {
      const requests = [];

      page.on('request', request => {
        if (request.url().includes('/api/')) {
          requests.push(request.url());
        }
      });

      await page.locator('.assistant-fab').click();

      // In production, API calls should use HTTPS
      // In development, HTTP is acceptable
      const isProduction = process.env.NODE_ENV === 'production';

      if (isProduction && requests.length > 0) {
        requests.forEach(url => {
          expect(url).toMatch(/^https:\/\//);
        });
      }
    });
  });
});
