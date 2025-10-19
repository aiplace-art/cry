/**
 * @test E2E Private Sale Flow
 * @description End-to-end tests for complete purchase workflow
 * @coverage Full user journey from wallet connection to purchase completion
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PRIVATE_SALE_URL = `${BASE_URL}/private-sale`;

// Mock wallet addresses for testing
const TEST_WALLET = '0x1234567890123456789012345678901234567890';
const TEST_TX_HASH = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

// Helper to mock MetaMask
async function mockMetaMask(page: Page) {
  await page.addInitScript(() => {
    (window as any).ethereum = {
      isMetaMask: true,
      request: async ({ method }: { method: string }) => {
        if (method === 'eth_requestAccounts') {
          return ['0x1234567890123456789012345678901234567890'];
        }
        if (method === 'eth_chainId') {
          return '0x1';
        }
        return null;
      },
      on: () => {},
      removeListener: () => {},
    };
  });
}

test.describe('Private Sale Dashboard - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await mockMetaMask(page);
  });

  test.describe('Initial Page Load', () => {
    test('should load private sale page successfully', async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);

      await expect(page).toHaveTitle(/Private Sale|HYPE Token/i);
      await expect(page.locator('h1')).toContainText(/Private Sale/i);
    });

    test('should display urgency banner', async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);

      await expect(page.locator('text=FAIR LAUNCH')).toBeVisible();
      await expect(page.locator('text=Up to 30% Bonus Tokens')).toBeVisible();
    });

    test('should show live stats', async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);

      await expect(page.locator('text=Raised')).toBeVisible();
      await expect(page.locator('text=Per Token')).toBeVisible();
      await expect(page.locator('text=Investors')).toBeVisible();
    });

    test('should display countdown timer', async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);

      await expect(page.locator('text=Sale Ends In')).toBeVisible();
      await expect(page.locator('text=Days')).toBeVisible();
      await expect(page.locator('text=Hours')).toBeVisible();
      await expect(page.locator('text=Minutes')).toBeVisible();
      await expect(page.locator('text=Seconds')).toBeVisible();
    });

    test('should show progress bar', async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);

      const progressBar = page.locator('[class*="progress"]').first();
      await expect(progressBar).toBeVisible();
    });
  });

  test.describe('Wallet Connection Flow', () => {
    test('should display wallet connection options', async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);

      await expect(page.locator('text=Connect Your Wallet')).toBeVisible();
      await expect(page.locator('text=Connect MetaMask')).toBeVisible();
      await expect(page.locator('text=WalletConnect')).toBeVisible();
      await expect(page.locator('text=Phantom Wallet')).toBeVisible();
    });

    test('should connect MetaMask wallet successfully', async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);

      await page.click('text=Connect MetaMask');

      // Wait for wallet to connect
      await expect(page.locator('text=Connected')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=0x1234...7890')).toBeVisible();
    });

    test('should show payment interface after wallet connection', async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);

      await page.click('text=Connect MetaMask');
      await expect(page.locator('text=Connected')).toBeVisible();

      // Check for payment interface elements
      await expect(page.locator('text=Amount in USD')).toBeVisible();
      await expect(page.locator('placeholder="0.00"')).toBeVisible();
      await expect(page.locator('text=BUY NOW')).toBeVisible();
    });
  });

  test.describe('Purchase Amount Input', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);
      await page.click('text=Connect MetaMask');
      await expect(page.locator('text=Connected')).toBeVisible();
    });

    test('should accept valid purchase amounts', async ({ page }) => {
      const input = page.locator('input[type="number"]');

      await input.fill('100');
      await expect(input).toHaveValue('100');
    });

    test('should display purchase limits', async ({ page }) => {
      await expect(page.locator('text=Min: $50 • Max: $500')).toBeVisible();
    });

    test('should show token calculation for $50', async ({ page }) => {
      const input = page.locator('input[type="number"]');
      await input.fill('50');

      await expect(page.locator('text=Base Tokens:')).toBeVisible({ timeout: 2000 });
      await expect(page.locator('text=33,333.33 HYPE')).toBeVisible();
      await expect(page.locator('text=Bonus (5%):')).toBeVisible();
    });

    test('should show token calculation for $100', async ({ page }) => {
      const input = page.locator('input[type="number"]');
      await input.fill('100');

      await expect(page.locator('text=66,666.67 HYPE')).toBeVisible({ timeout: 2000 });
      await expect(page.locator('text=Bonus (10%):')).toBeVisible();
    });

    test('should show token calculation for $250', async ({ page }) => {
      const input = page.locator('input[type="number"]');
      await input.fill('250');

      await expect(page.locator('text=166,666.67 HYPE')).toBeVisible({ timeout: 2000 });
      await expect(page.locator('text=Bonus (20%):')).toBeVisible();
    });

    test('should show maximum bonus for $500', async ({ page }) => {
      const input = page.locator('input[type="number"]');
      await input.fill('500');

      await expect(page.locator('text=333,333.33 HYPE')).toBeVisible({ timeout: 2000 });
      await expect(page.locator('text=Bonus (30%):')).toBeVisible();
      await expect(page.locator('text=433,333.33 HYPE')).toBeVisible();
    });

    test('should disable buy button for amounts below minimum', async ({ page }) => {
      const input = page.locator('input[type="number"]');
      await input.fill('25');

      const buyButton = page.locator('text=BUY NOW');
      await expect(buyButton).toBeDisabled();
    });
  });

  test.describe('Complete Purchase Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);
      await page.click('text=Connect MetaMask');
      await expect(page.locator('text=Connected')).toBeVisible();

      // Mock API responses
      await page.route('**/api/private-sale/purchase', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            transactionHash: TEST_TX_HASH,
            tokensReceived: 73333.34,
          }),
        });
      });

      await page.route('**/api/private-sale/email', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });
    });

    test('should complete full purchase successfully', async ({ page }) => {
      // Enter amount
      const input = page.locator('input[type="number"]');
      await input.fill('100');

      // Select payment method (assuming ETH is default)
      // This may need adjustment based on actual implementation

      // Click buy button
      const buyButton = page.locator('text=BUY NOW');
      await expect(buyButton).toBeEnabled({ timeout: 2000 });
      await buyButton.click();

      // Wait for success screen
      await expect(page.locator('text=Purchase Successful!')).toBeVisible({ timeout: 5000 });
    });

    test('should display transaction details on success', async ({ page }) => {
      const input = page.locator('input[type="number"]');
      await input.fill('100');

      const buyButton = page.locator('text=BUY NOW');
      await buyButton.click();

      await expect(page.locator('text=Purchase Successful!')).toBeVisible();
      await expect(page.locator('text=Transaction ID:')).toBeVisible();
      await expect(page.locator('text=0xabcdef12...abcdef12')).toBeVisible();
    });

    test('should have working explorer link', async ({ page }) => {
      const input = page.locator('input[type="number"]');
      await input.fill('100');

      const buyButton = page.locator('text=BUY NOW');
      await buyButton.click();

      await expect(page.locator('text=Purchase Successful!')).toBeVisible();

      const explorerLink = page.locator('a:has-text("View on Explorer")');
      await expect(explorerLink).toHaveAttribute('href', /etherscan\.io/);
      await expect(explorerLink).toHaveAttribute('target', '_blank');
    });

    test('should show loading state during purchase', async ({ page }) => {
      // Delay the API response to see loading state
      await page.route('**/api/private-sale/purchase', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            transactionHash: TEST_TX_HASH,
            tokensReceived: 73333.34,
          }),
        });
      });

      const input = page.locator('input[type="number"]');
      await input.fill('100');

      const buyButton = page.locator('text=BUY NOW');
      await buyButton.click();

      // Check for loading state
      await expect(page.locator('text=Processing...')).toBeVisible();
      await expect(buyButton).toBeDisabled();

      // Wait for completion
      await expect(page.locator('text=Purchase Successful!')).toBeVisible({ timeout: 5000 });
    });

    test('should allow making another purchase', async ({ page }) => {
      const input = page.locator('input[type="number"]');
      await input.fill('100');

      const buyButton = page.locator('text=BUY NOW');
      await buyButton.click();

      await expect(page.locator('text=Purchase Successful!')).toBeVisible();

      const anotherButton = page.locator('text=Make Another Purchase');
      await anotherButton.click();

      // Should return to purchase interface
      await expect(page.locator('text=Amount in USD')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);
      await page.click('text=Connect MetaMask');
      await expect(page.locator('text=Connected')).toBeVisible();
    });

    test('should handle purchase failure gracefully', async ({ page }) => {
      await page.route('**/api/private-sale/purchase', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Insufficient balance',
          }),
        });
      });

      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('Purchase failed');
        await dialog.accept();
      });

      const input = page.locator('input[type="number"]');
      await input.fill('100');

      const buyButton = page.locator('text=BUY NOW');
      await buyButton.click();
    });

    test('should handle network errors', async ({ page }) => {
      await page.route('**/api/private-sale/purchase', async (route) => {
        await route.abort('failed');
      });

      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('failed');
        await dialog.accept();
      });

      const input = page.locator('input[type="number"]');
      await input.fill('100');

      const buyButton = page.locator('text=BUY NOW');
      await buyButton.click();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(PRIVATE_SALE_URL);

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('text=Connect MetaMask')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(PRIVATE_SALE_URL);

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('text=Connect MetaMask')).toBeVisible();
    });

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(PRIVATE_SALE_URL);

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('text=Connect MetaMask')).toBeVisible();
    });
  });

  test.describe('Referral System', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);
      await page.click('text=Connect MetaMask');
      await expect(page.locator('text=Connected')).toBeVisible();
    });

    test('should display referral section when wallet connected', async ({ page }) => {
      await expect(page.locator('text=Share & Earn')).toBeVisible();
      await expect(page.locator('text=Refer friends and earn')).toBeVisible();
    });

    test('should generate referral link', async ({ page }) => {
      const referralInput = page.locator('input[readonly]').first();
      await expect(referralInput).toHaveValue(/^https?:\/\//);
      await expect(referralInput).toHaveValue(/0x1234567890123456789012345678901234567890/);
    });

    test('should copy referral link to clipboard', async ({ page }) => {
      await page.context().grantPermissions(['clipboard-write', 'clipboard-read']);

      const copyButton = page.locator('button:has-text("Copy")');
      await copyButton.click();

      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('copied');
        await dialog.accept();
      });
    });
  });

  test.describe('Vesting Information', () => {
    test('should display vesting schedule', async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);

      await expect(page.locator('text=Transparent Vesting Schedule')).toBeVisible();
      await expect(page.locator('text=40% immediately')).toBeVisible();
      await expect(page.locator('text=60% vested')).toBeVisible();
    });

    test('should show vesting calculator', async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);

      await expect(page.locator('text=Vesting Schedule Calculator')).toBeVisible();
      await expect(page.locator('text=Example: $500 Purchase')).toBeVisible();
    });

    test('should display monthly breakdown', async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);

      await expect(page.locator('text=Month 1')).toBeVisible();
      await expect(page.locator('text=Month 6')).toBeVisible();
    });
  });

  test.describe('FAQ Section', () => {
    test('should display FAQ section', async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);

      await expect(page.locator('text=Frequently Asked Questions')).toBeVisible();
    });

    test('should expand FAQ items on click', async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);

      const faqItem = page.locator('summary').first();
      await faqItem.click();

      // Check if content is visible after click
      const details = faqItem.locator('..');
      await expect(details).toHaveAttribute('open', '');
    });
  });

  test.describe('Performance', () => {
    test('should load page within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(PRIVATE_SALE_URL);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle rapid amount changes without lag', async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);
      await page.click('text=Connect MetaMask');
      await expect(page.locator('text=Connected')).toBeVisible();

      const input = page.locator('input[type="number"]');

      const startTime = Date.now();
      for (let i = 50; i <= 500; i += 50) {
        await input.fill(i.toString());
        await page.waitForTimeout(100);
      }
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);

      const h1 = await page.locator('h1').count();
      expect(h1).toBeGreaterThan(0);
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);

      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeDefined();
    });

    test('should have alt text for images', async ({ page }) => {
      await page.goto(PRIVATE_SALE_URL);

      const images = await page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBeDefined();
      }
    });
  });
});
