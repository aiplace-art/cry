const { test, expect } = require('@playwright/test');

test.describe('Staking Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test.describe('User Registration and Login', () => {
    test('should register new user successfully', async ({ page }) => {
      await page.click('text=Sign Up');

      await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
      await page.fill('input[name="password"]', 'SecurePass123!');
      await page.fill('input[name="confirmPassword"]', 'SecurePass123!');
      await page.fill('input[name="walletAddress"]', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');

      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('text=Welcome')).toBeVisible();
    });

    test('should login existing user', async ({ page }) => {
      await page.click('text=Login');

      await page.fill('input[name="email"]', 'existing@example.com');
      await page.fill('input[name="password"]', 'SecurePass123!');

      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should show validation errors', async ({ page }) => {
      await page.click('text=Sign Up');

      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="password"]', '123');

      await page.click('button[type="submit"]');

      await expect(page.locator('text=Invalid email')).toBeVisible();
      await expect(page.locator('text=Password must be')).toBeVisible();
    });
  });

  test.describe('Wallet Connection', () => {
    test('should connect MetaMask wallet', async ({ page, context }) => {
      // Mock MetaMask
      await context.addInitScript(() => {
        window.ethereum = {
          isMetaMask: true,
          request: async ({ method }) => {
            if (method === 'eth_requestAccounts') {
              return ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'];
            }
            if (method === 'eth_chainId') {
              return '0x1';
            }
          },
          on: () => {}
        };
      });

      await page.click('text=Connect Wallet');
      await page.click('text=MetaMask');

      await expect(page.locator('text=0x742d')).toBeVisible({ timeout: 10000 });
    });

    test('should show error for unsupported network', async ({ page, context }) => {
      await context.addInitScript(() => {
        window.ethereum = {
          isMetaMask: true,
          request: async ({ method }) => {
            if (method === 'eth_chainId') {
              return '0x999'; // Unsupported network
            }
          }
        };
      });

      await page.click('text=Connect Wallet');
      await page.click('text=MetaMask');

      await expect(page.locator('text=Unsupported network')).toBeVisible();
    });

    test('should disconnect wallet', async ({ page, context }) => {
      // Setup connected wallet
      await context.addInitScript(() => {
        window.ethereum = {
          isMetaMask: true,
          request: async () => ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb']
        };
      });

      await page.click('text=Connect Wallet');
      await page.click('text=MetaMask');

      await page.click('text=Disconnect');

      await expect(page.locator('text=Connect Wallet')).toBeVisible();
    });
  });

  test.describe('Staking Operations', () => {
    test.beforeEach(async ({ page, context }) => {
      // Login and connect wallet
      await context.addInitScript(() => {
        window.ethereum = {
          isMetaMask: true,
          request: async ({ method }) => {
            if (method === 'eth_requestAccounts') {
              return ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'];
            }
            if (method === 'eth_sendTransaction') {
              return '0x' + 'a'.repeat(64);
            }
            return null;
          },
          on: () => {}
        };
      });

      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'SecurePass123!');
      await page.click('button[type="submit"]');

      await page.click('text=Connect Wallet');
      await page.click('text=MetaMask');

      await page.goto('http://localhost:3000/staking');
    });

    test('should create new staking position', async ({ page }) => {
      await page.click('text=Stake Tokens');

      await page.fill('input[name="amount"]', '1000');
      await page.selectOption('select[name="duration"]', '30');

      await page.click('button:has-text("Confirm Stake")');

      // Wait for transaction confirmation
      await expect(page.locator('text=Transaction pending')).toBeVisible();
      await expect(page.locator('text=Staking successful')).toBeVisible({ timeout: 30000 });

      // Verify staking position appears
      await expect(page.locator('text=1000 tokens staked')).toBeVisible();
    });

    test('should display staking positions', async ({ page }) => {
      await expect(page.locator('.staking-position')).toHaveCount(1);
      await expect(page.locator('text=Amount')).toBeVisible();
      await expect(page.locator('text=Duration')).toBeVisible();
      await expect(page.locator('text=Rewards')).toBeVisible();
    });

    test('should calculate and display rewards', async ({ page }) => {
      const rewardsElement = page.locator('[data-testid="pending-rewards"]');
      await expect(rewardsElement).toBeVisible();

      const initialRewards = await rewardsElement.textContent();

      // Wait for rewards to update
      await page.waitForTimeout(5000);

      const updatedRewards = await rewardsElement.textContent();
      expect(updatedRewards).not.toBe(initialRewards);
    });

    test('should claim rewards', async ({ page }) => {
      await page.click('button:has-text("Claim Rewards")');

      await expect(page.locator('text=Claiming rewards')).toBeVisible();
      await expect(page.locator('text=Rewards claimed successfully')).toBeVisible({ timeout: 30000 });

      // Verify rewards balance updated
      await expect(page.locator('[data-testid="pending-rewards"]')).toHaveText('0');
    });

    test('should unstake tokens', async ({ page }) => {
      const unstakeButton = page.locator('button:has-text("Unstake")').first();
      await unstakeButton.click();

      await page.click('button:has-text("Confirm Unstake")');

      await expect(page.locator('text=Unstaking in progress')).toBeVisible();
      await expect(page.locator('text=Unstake successful')).toBeVisible({ timeout: 30000 });
    });

    test('should validate staking amount', async ({ page }) => {
      await page.click('text=Stake Tokens');

      // Try to stake 0
      await page.fill('input[name="amount"]', '0');
      await page.click('button:has-text("Confirm Stake")');
      await expect(page.locator('text=Amount must be greater than 0')).toBeVisible();

      // Try to stake negative amount
      await page.fill('input[name="amount"]', '-100');
      await page.click('button:has-text("Confirm Stake")');
      await expect(page.locator('text=Invalid amount')).toBeVisible();

      // Try to stake more than balance
      await page.fill('input[name="amount"]', '9999999999');
      await page.click('button:has-text("Confirm Stake")');
      await expect(page.locator('text=Insufficient balance')).toBeVisible();
    });

    test('should handle transaction rejection', async ({ page, context }) => {
      await context.addInitScript(() => {
        window.ethereum.request = async ({ method }) => {
          if (method === 'eth_sendTransaction') {
            throw new Error('User rejected transaction');
          }
        };
      });

      await page.click('text=Stake Tokens');
      await page.fill('input[name="amount"]', '100');
      await page.click('button:has-text("Confirm Stake")');

      await expect(page.locator('text=Transaction rejected')).toBeVisible();
    });

    test('should refresh staking data', async ({ page }) => {
      const refreshButton = page.locator('button[aria-label="Refresh"]');
      await refreshButton.click();

      await expect(page.locator('text=Loading')).toBeVisible();
      await expect(page.locator('.staking-position')).toBeVisible();
    });
  });

  test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'SecurePass123!');
      await page.click('button[type="submit"]');
      await page.goto('http://localhost:3000/dashboard');
    });

    test('should display portfolio overview', async ({ page }) => {
      await expect(page.locator('text=Total Staked')).toBeVisible();
      await expect(page.locator('text=Total Rewards')).toBeVisible();
      await expect(page.locator('text=Active Positions')).toBeVisible();
    });

    test('should show transaction history', async ({ page }) => {
      await page.click('text=History');

      await expect(page.locator('.transaction-item')).toHaveCount(1);
      await expect(page.locator('text=Stake')).toBeVisible();
      await expect(page.locator('text=Completed')).toBeVisible();
    });

    test('should filter transactions', async ({ page }) => {
      await page.click('text=History');

      await page.selectOption('select[name="filter"]', 'stake');
      await expect(page.locator('.transaction-item[data-type="stake"]')).toHaveCount(1);

      await page.selectOption('select[name="filter"]', 'unstake');
      await expect(page.locator('.transaction-item[data-type="unstake"]')).toHaveCount(1);
    });

    test('should display charts', async ({ page }) => {
      await expect(page.locator('canvas[data-testid="rewards-chart"]')).toBeVisible();
      await expect(page.locator('canvas[data-testid="staking-chart"]')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      await page.click('[data-testid="mobile-menu"]');
      await expect(page.locator('nav')).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('.staking-grid')).toHaveCSS('grid-template-columns', /.*/);
    });

    test('should work on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('.staking-grid')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page, context }) => {
      await context.route('**/api/**', route => route.abort());

      await page.goto('http://localhost:3000/dashboard');

      await expect(page.locator('text=Network error')).toBeVisible();
      await expect(page.locator('button:has-text("Retry")')).toBeVisible();
    });

    test('should handle API errors', async ({ page, context }) => {
      await context.route('**/api/staking/positions', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });

      await page.goto('http://localhost:3000/staking');

      await expect(page.locator('text=Failed to load staking positions')).toBeVisible();
    });

    test('should show maintenance message', async ({ page, context }) => {
      await context.route('**/*', route => {
        route.fulfill({
          status: 503,
          body: 'Service Unavailable'
        });
      });

      await page.goto('http://localhost:3000');

      await expect(page.locator('text=Under maintenance')).toBeVisible();
    });
  });

  test.describe('Security', () => {
    test('should prevent XSS attacks', async ({ page }) => {
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', '<script>alert("XSS")</script>');
      await page.fill('input[name="password"]', 'password');
      await page.click('button[type="submit"]');

      // Script should not execute
      page.on('dialog', () => {
        throw new Error('XSS vulnerability detected');
      });
    });

    test('should enforce authentication', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');
      await expect(page).toHaveURL(/.*login/);
    });

    test('should clear sensitive data on logout', async ({ page, context }) => {
      // Login first
      await page.goto('http://localhost:3000/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'SecurePass123!');
      await page.click('button[type="submit"]');

      // Logout
      await page.click('text=Logout');

      // Verify localStorage and sessionStorage cleared
      const localStorageLength = await page.evaluate(() => localStorage.length);
      const sessionStorageLength = await page.evaluate(() => sessionStorage.length);

      expect(localStorageLength).toBe(0);
      expect(sessionStorageLength).toBe(0);
    });
  });

  test.describe('Performance', () => {
    test('should load page within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('http://localhost:3000');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000); // 3 seconds
    });

    test('should lazy load images', async ({ page }) => {
      await page.goto('http://localhost:3000');

      const images = page.locator('img[loading="lazy"]');
      const count = await images.count();

      expect(count).toBeGreaterThan(0);
    });
  });
});
