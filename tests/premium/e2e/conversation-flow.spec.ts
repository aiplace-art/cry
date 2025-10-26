import { test, expect } from '@playwright/test';

/**
 * E2E Tests - Full Conversation Flow
 * Tests complete user journeys in real browser environment
 */

test.describe('E2E - AI Assistant Conversation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/variant-2/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('should open AI assistant widget', async ({ page }) => {
    // Find and click AI assistant toggle
    const toggleBtn = page.locator('[data-testid="ai-assistant-toggle"]').or(
      page.locator('button:has-text("AI Assistant")')
    );

    await toggleBtn.click();

    // Widget should be visible
    const widget = page.locator('#ai-assistant-widget').or(
      page.locator('[data-testid="ai-assistant-widget"]')
    );

    await expect(widget).toBeVisible();
  });

  test('should send message and receive response', async ({ page }) => {
    // Open widget
    await page.click('[data-testid="ai-assistant-toggle"]');

    // Type message
    const input = page.locator('#ai-user-input').or(
      page.locator('[data-testid="ai-message-input"]')
    );

    await input.fill('Hello, AI assistant!');

    // Send message
    const sendBtn = page.locator('#ai-send-btn').or(
      page.locator('[data-testid="ai-send-button"]')
    );

    await sendBtn.click();

    // Wait for response
    const messagesContainer = page.locator('#ai-chat-messages').or(
      page.locator('[data-testid="ai-messages"]')
    );

    await expect(messagesContainer).toContainText('Hello', { timeout: 10000 });

    // Should have at least 2 messages (user + assistant)
    const messages = messagesContainer.locator('.message');
    await expect(messages).toHaveCount(2, { timeout: 5000 });
  });

  test('should handle multiple messages', async ({ page }) => {
    await page.click('[data-testid="ai-assistant-toggle"]');

    const messages = ['First message', 'Second message', 'Third message'];

    for (const msg of messages) {
      await page.fill('[data-testid="ai-message-input"]', msg);
      await page.click('[data-testid="ai-send-button"]');
      await page.waitForTimeout(1000);
    }

    const messagesList = page.locator('[data-testid="ai-messages"] .message');
    await expect(messagesList).toHaveCount(6, { timeout: 10000 }); // 3 user + 3 assistant
  });

  test('should persist conversation on page reload', async ({ page }) => {
    // Send a message
    await page.click('[data-testid="ai-assistant-toggle"]');
    await page.fill('[data-testid="ai-message-input"]', 'Test persistence');
    await page.click('[data-testid="ai-send-button"]');

    await page.waitForTimeout(2000);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Open widget again
    await page.click('[data-testid="ai-assistant-toggle"]');

    // Previous messages should be visible
    const messages = page.locator('[data-testid="ai-messages"]');
    await expect(messages).toContainText('Test persistence');
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    await page.click('[data-testid="ai-assistant-toggle"]');

    const input = page.locator('[data-testid="ai-message-input"]');
    await input.fill('Test message');

    // Press Enter to send
    await input.press('Enter');

    // Message should be sent
    const messages = page.locator('[data-testid="ai-messages"] .message');
    await expect(messages).toHaveCount(2, { timeout: 5000 });
  });

  test('should close widget', async ({ page }) => {
    await page.click('[data-testid="ai-assistant-toggle"]');

    const widget = page.locator('[data-testid="ai-assistant-widget"]');
    await expect(widget).toBeVisible();

    // Close widget
    const closeBtn = page.locator('[data-testid="ai-close-button"]').or(
      page.locator('button:has-text("Close")')
    );

    await closeBtn.click();

    await expect(widget).not.toBeVisible();
  });
});

test.describe('E2E - Cookie Consent', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies before each test
    await context.clearCookies();
    await page.goto('http://localhost:3000/variant-2/index.html');
  });

  test('should show cookie banner on first visit', async ({ page }) => {
    const banner = page.locator('#cookie-consent-banner').or(
      page.locator('[data-testid="cookie-banner"]')
    );

    await expect(banner).toBeVisible();
  });

  test('should accept all cookies', async ({ page }) => {
    const acceptBtn = page.locator('#accept-all-cookies').or(
      page.locator('[data-testid="accept-all-cookies"]')
    );

    await acceptBtn.click();

    // Banner should disappear
    const banner = page.locator('[data-testid="cookie-banner"]');
    await expect(banner).not.toBeVisible();

    // Reload and banner should not appear
    await page.reload();
    await expect(banner).not.toBeVisible();
  });

  test('should reject optional cookies', async ({ page }) => {
    const rejectBtn = page.locator('#reject-all-cookies').or(
      page.locator('[data-testid="reject-all-cookies"]')
    );

    await rejectBtn.click();

    const banner = page.locator('[data-testid="cookie-banner"]');
    await expect(banner).not.toBeVisible();
  });

  test('should customize cookie preferences', async ({ page }) => {
    const customizeBtn = page.locator('#customize-cookies').or(
      page.locator('[data-testid="customize-cookies"]')
    );

    await customizeBtn.click();

    // Settings modal should open
    const modal = page.locator('[data-testid="cookie-settings-modal"]');
    await expect(modal).toBeVisible();

    // Toggle analytics
    await page.click('[data-testid="analytics-toggle"]');

    // Save preferences
    await page.click('[data-testid="save-preferences"]');

    await expect(modal).not.toBeVisible();
  });
});

test.describe('E2E - Mobile Responsiveness', () => {
  test.use({
    viewport: { width: 375, height: 667 } // iPhone SE
  });

  test('should display mobile navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/variant-2/index.html');

    // Mobile menu button should be visible
    const menuBtn = page.locator('[data-testid="mobile-menu-toggle"]').or(
      page.locator('.mobile-menu-btn')
    );

    await expect(menuBtn).toBeVisible();
  });

  test('should open mobile menu', async ({ page }) => {
    await page.goto('http://localhost:3000/variant-2/index.html');

    await page.click('[data-testid="mobile-menu-toggle"]');

    const menu = page.locator('[data-testid="mobile-menu"]');
    await expect(menu).toBeVisible();
  });

  test('should work with AI assistant on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/variant-2/index.html');

    await page.click('[data-testid="ai-assistant-toggle"]');

    const widget = page.locator('[data-testid="ai-assistant-widget"]');
    await expect(widget).toBeVisible();

    // Widget should be fullscreen on mobile
    const boundingBox = await widget.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(350);
  });
});

test.describe('E2E - Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('http://localhost:3000/variant-2/index.html');

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Active element should have focus
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focused);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('http://localhost:3000/variant-2/index.html');

    const widget = page.locator('[data-testid="ai-assistant-widget"]');
    await expect(widget).toHaveAttribute('role', 'dialog');
    await expect(widget).toHaveAttribute('aria-label', /.+/);
  });

  test('should announce dynamic content to screen readers', async ({ page }) => {
    await page.goto('http://localhost:3000/variant-2/index.html');

    // Check for aria-live regions
    const liveRegions = page.locator('[aria-live="polite"]');
    await expect(liveRegions).toHaveCount(1, { timeout: 5000 });
  });
});

test.describe('E2E - Performance', () => {
  test('should load page in under 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:3000/variant-2/index.html');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000/variant-2/index.html');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('should handle rapid interactions', async ({ page }) => {
    await page.goto('http://localhost:3000/variant-2/index.html');

    // Rapidly click AI assistant toggle
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="ai-assistant-toggle"]');
      await page.waitForTimeout(100);
    }

    // Should still be functional
    const widget = page.locator('[data-testid="ai-assistant-widget"]');
    await expect(widget).toBeVisible();
  });
});
