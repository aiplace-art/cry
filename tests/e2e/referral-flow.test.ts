/**
 * E2E Tests for Complete Referral User Flow
 * Tests the entire referral journey from registration to reward claiming
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TIMEOUT = 30000;

// Helper to generate unique email
const generateEmail = () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

describe('Referral System - Complete User Flow', () => {
  let referrerPage: Page;
  let refereePage: Page;
  let referralCode: string;

  test.beforeAll(async ({ browser }) => {
    referrerPage = await browser.newPage();
    refereePage = await browser.newPage();
  });

  test.afterAll(async () => {
    await referrerPage?.close();
    await refereePage?.close();
  });

  test('Complete Referral Flow: Registration → Purchase → Reward Claim', async () => {
    // ========================================
    // STEP 1: Referrer Registration
    // ========================================
    await test.step('Referrer: Register new account', async () => {
      await referrerPage.goto(`${BASE_URL}/register`);

      const referrerEmail = generateEmail();
      await referrerPage.fill('[name="email"]', referrerEmail);
      await referrerPage.fill('[name="password"]', 'SecurePass123!');
      await referrerPage.fill('[name="confirmPassword"]', 'SecurePass123!');

      await referrerPage.click('button[type="submit"]');

      // Wait for redirect to dashboard
      await referrerPage.waitForURL(`${BASE_URL}/dashboard`, { timeout: TIMEOUT });
      expect(referrerPage.url()).toContain('/dashboard');
    });

    // ========================================
    // STEP 2: Get Referral Code
    // ========================================
    await test.step('Referrer: Get referral code from dashboard', async () => {
      await referrerPage.goto(`${BASE_URL}/referral`);

      // Wait for referral code to load
      const codeElement = await referrerPage.waitForSelector('[data-testid="referral-code"]', {
        timeout: TIMEOUT
      });

      referralCode = await codeElement.inputValue();
      expect(referralCode).toBeTruthy();
      expect(referralCode).toMatch(/^[A-Z0-9]{10}$/); // Format validation
    });

    // ========================================
    // STEP 3: Verify Initial Stats
    // ========================================
    await test.step('Referrer: Verify initial stats are zero', async () => {
      const totalReferrals = await referrerPage.textContent('[data-testid="total-referrals"]');
      const pendingRewards = await referrerPage.textContent('[data-testid="pending-rewards"]');

      expect(totalReferrals).toBe('0');
      expect(pendingRewards).toBe('$0');
    });

    // ========================================
    // STEP 4: Referee Registration with Code
    // ========================================
    await test.step('Referee: Register with referral code', async () => {
      await refereePage.goto(`${BASE_URL}/register?ref=${referralCode}`);

      // Verify referral code is pre-filled
      const preFilledCode = await refereePage.inputValue('[name="referralCode"]');
      expect(preFilledCode).toBe(referralCode);

      const refereeEmail = generateEmail();
      await refereePage.fill('[name="email"]', refereeEmail);
      await refereePage.fill('[name="password"]', 'SecurePass123!');
      await refereePage.fill('[name="confirmPassword"]', 'SecurePass123!');

      await refereePage.click('button[type="submit"]');

      await refereePage.waitForURL(`${BASE_URL}/dashboard`, { timeout: TIMEOUT });
      expect(refereePage.url()).toContain('/dashboard');
    });

    // ========================================
    // STEP 5: Verify Referral Relationship
    // ========================================
    await test.step('Referrer: Verify new referral appears in list', async () => {
      await referrerPage.reload();
      await referrerPage.waitForSelector('[data-testid="referral-list"]');

      const totalReferrals = await referrerPage.textContent('[data-testid="total-referrals"]');
      expect(totalReferrals).toBe('1');

      // Check referral list
      const referralItems = await referrerPage.$$('[data-testid="referral-item"]');
      expect(referralItems.length).toBe(1);
    });

    // ========================================
    // STEP 6: Referee Makes Purchase
    // ========================================
    await test.step('Referee: Make token purchase', async () => {
      await refereePage.goto(`${BASE_URL}/buy`);

      // Enter purchase amount
      await refereePage.fill('[name="amountUSD"]', '1000');

      // Connect wallet (mock)
      await refereePage.click('[data-testid="connect-wallet"]');
      await refereePage.click('[data-testid="metamask-option"]');

      // Wait for wallet connection
      await refereePage.waitForSelector('[data-testid="wallet-connected"]', {
        timeout: TIMEOUT
      });

      // Approve transaction (mock)
      await refereePage.click('[data-testid="approve-purchase"]');

      // Wait for confirmation
      await refereePage.waitForSelector('[data-testid="purchase-success"]', {
        timeout: TIMEOUT
      });

      expect(await refereePage.textContent('[data-testid="purchase-success"]'))
        .toContain('Purchase successful');
    });

    // ========================================
    // STEP 7: Verify Referrer Rewards
    // ========================================
    await test.step('Referrer: Verify pending rewards updated', async () => {
      // Wait for blockchain confirmation (simulated)
      await referrerPage.waitForTimeout(2000);

      await referrerPage.reload();
      await referrerPage.waitForSelector('[data-testid="pending-rewards"]');

      const pendingRewards = await referrerPage.textContent('[data-testid="pending-rewards"]');

      // 10% of $1000 = $100
      expect(pendingRewards).toContain('$100');
    });

    // ========================================
    // STEP 8: Check Reward Breakdown
    // ========================================
    await test.step('Referrer: View reward breakdown', async () => {
      await referrerPage.click('[data-testid="view-rewards-detail"]');

      // Check direct referral reward
      const directReward = await referrerPage.textContent('[data-testid="direct-reward"]');
      expect(directReward).toContain('$100'); // 10% of $1000

      // Verify reward calculation
      const rewardPercentage = await referrerPage.textContent('[data-testid="reward-percentage"]');
      expect(rewardPercentage).toContain('10%');
    });

    // ========================================
    // STEP 9: Claim Rewards
    // ========================================
    await test.step('Referrer: Claim rewards in HYPE tokens', async () => {
      await referrerPage.click('[data-testid="claim-rewards-button"]');

      // Select reward type
      await referrerPage.click('[data-testid="reward-type-hype"]');

      // Confirm claim
      await referrerPage.click('[data-testid="confirm-claim"]');

      // Wait for transaction
      await referrerPage.waitForSelector('[data-testid="claim-success"]', {
        timeout: TIMEOUT
      });

      expect(await referrerPage.textContent('[data-testid="claim-success"]'))
        .toContain('Rewards claimed successfully');
    });

    // ========================================
    // STEP 10: Verify Claimed Rewards
    // ========================================
    await test.step('Referrer: Verify claimed rewards in stats', async () => {
      await referrerPage.reload();

      const totalEarned = await referrerPage.textContent('[data-testid="total-earned"]');
      const pendingRewards = await referrerPage.textContent('[data-testid="pending-rewards"]');
      const totalClaimed = await referrerPage.textContent('[data-testid="total-claimed"]');

      expect(totalEarned).toContain('$100');
      expect(pendingRewards).toBe('$0'); // Should be zero after claim
      expect(totalClaimed).toContain('$100');
    });
  });

  test('Multi-Tier Referral Flow: 3 Levels', async ({ page }) => {
    const tier1Email = generateEmail();
    const tier2Email = generateEmail();
    const tier3Email = generateEmail();

    let tier1Code: string;
    let tier2Code: string;

    // Tier 1: First referrer
    await test.step('Tier 1: Register and get code', async () => {
      await page.goto(`${BASE_URL}/register`);
      await page.fill('[name="email"]', tier1Email);
      await page.fill('[name="password"]', 'Pass123!');
      await page.fill('[name="confirmPassword"]', 'Pass123!');
      await page.click('button[type="submit"]');

      await page.waitForURL(`${BASE_URL}/dashboard`);
      await page.goto(`${BASE_URL}/referral`);

      tier1Code = await page.inputValue('[data-testid="referral-code"]');
    });

    // Tier 2: Referred by Tier 1
    await test.step('Tier 2: Register with Tier 1 code', async () => {
      await page.goto(`${BASE_URL}/register?ref=${tier1Code}`);
      await page.fill('[name="email"]', tier2Email);
      await page.fill('[name="password"]', 'Pass123!');
      await page.fill('[name="confirmPassword"]', 'Pass123!');
      await page.click('button[type="submit"]');

      await page.waitForURL(`${BASE_URL}/dashboard`);
      await page.goto(`${BASE_URL}/referral`);

      tier2Code = await page.inputValue('[data-testid="referral-code"]');
    });

    // Tier 3: Referred by Tier 2
    await test.step('Tier 3: Register and make purchase', async () => {
      await page.goto(`${BASE_URL}/register?ref=${tier2Code}`);
      await page.fill('[name="email"]', tier3Email);
      await page.fill('[name="password"]', 'Pass123!');
      await page.fill('[name="confirmPassword"]', 'Pass123!');
      await page.click('button[type="submit"]');

      await page.waitForURL(`${BASE_URL}/dashboard`);

      // Make purchase
      await page.goto(`${BASE_URL}/buy`);
      await page.fill('[name="amountUSD"]', '1000');
      await page.click('[data-testid="connect-wallet"]');
      await page.click('[data-testid="metamask-option"]');
      await page.waitForSelector('[data-testid="wallet-connected"]');
      await page.click('[data-testid="approve-purchase"]');
      await page.waitForSelector('[data-testid="purchase-success"]');
    });

    // Verify Tier 1 and Tier 2 rewards
    await test.step('Verify multi-tier rewards distribution', async () => {
      // Login as Tier 1
      await page.goto(`${BASE_URL}/login`);
      await page.fill('[name="email"]', tier1Email);
      await page.fill('[name="password"]', 'Pass123!');
      await page.click('button[type="submit"]');

      await page.waitForURL(`${BASE_URL}/dashboard`);
      await page.goto(`${BASE_URL}/referral`);

      // Tier 1 should have 2% of $1000 = $20 (second-tier reward)
      const tier1Pending = await page.textContent('[data-testid="pending-rewards"]');
      expect(tier1Pending).toContain('$20');

      // Login as Tier 2
      await page.goto(`${BASE_URL}/login`);
      await page.fill('[name="email"]', tier2Email);
      await page.fill('[name="password"]', 'Pass123!');
      await page.click('button[type="submit"]');

      await page.waitForURL(`${BASE_URL}/dashboard`);
      await page.goto(`${BASE_URL}/referral`);

      // Tier 2 should have 10% of $1000 = $100 (direct reward)
      const tier2Pending = await page.textContent('[data-testid="pending-rewards"]');
      expect(tier2Pending).toContain('$100');
    });
  });

  test('Referral Link Sharing and Tracking', async ({ page, context }) => {
    const referrerEmail = generateEmail();
    let referralLink: string;

    await test.step('Get referral link with tracking', async () => {
      await page.goto(`${BASE_URL}/register`);
      await page.fill('[name="email"]', referrerEmail);
      await page.fill('[name="password"]', 'Pass123!');
      await page.fill('[name="confirmPassword"]', 'Pass123!');
      await page.click('button[type="submit"]');

      await page.waitForURL(`${BASE_URL}/dashboard`);
      await page.goto(`${BASE_URL}/referral`);

      referralLink = await page.inputValue('[data-testid="referral-link"]');
      expect(referralLink).toContain('?ref=');
    });

    await test.step('Track link clicks', async () => {
      // Open link in new page
      const newPage = await context.newPage();
      await newPage.goto(referralLink);

      // Wait for tracking to register
      await newPage.waitForTimeout(1000);
      await newPage.close();

      // Check click count
      await page.reload();
      const clicks = await page.textContent('[data-testid="link-clicks"]');
      expect(parseInt(clicks || '0')).toBeGreaterThan(0);
    });

    await test.step('Track conversions', async () => {
      // Register through link
      const newPage = await context.newPage();
      await newPage.goto(referralLink);

      const refereeEmail = generateEmail();
      await newPage.fill('[name="email"]', refereeEmail);
      await newPage.fill('[name="password"]', 'Pass123!');
      await newPage.fill('[name="confirmPassword"]', 'Pass123!');
      await newPage.click('button[type="submit"]');

      await newPage.waitForURL(`${BASE_URL}/dashboard`);
      await newPage.close();

      // Check conversion count
      await page.reload();
      const conversions = await page.textContent('[data-testid="link-conversions"]');
      expect(parseInt(conversions || '0')).toBeGreaterThan(0);

      // Verify conversion rate is displayed
      const conversionRate = await page.textContent('[data-testid="conversion-rate"]');
      expect(conversionRate).toBeTruthy();
    });
  });

  test('QR Code Generation and Download', async ({ page }) => {
    await test.step('Register and navigate to referral page', async () => {
      const email = generateEmail();
      await page.goto(`${BASE_URL}/register`);
      await page.fill('[name="email"]', email);
      await page.fill('[name="password"]', 'Pass123!');
      await page.fill('[name="confirmPassword"]', 'Pass123!');
      await page.click('button[type="submit"]');

      await page.waitForURL(`${BASE_URL}/dashboard`);
      await page.goto(`${BASE_URL}/referral`);
    });

    await test.step('Generate QR code', async () => {
      await page.click('[data-testid="generate-qr-button"]');

      // Wait for QR code to generate
      await page.waitForSelector('[data-testid="qr-code-image"]', { timeout: TIMEOUT });

      const qrImage = await page.$('[data-testid="qr-code-image"]');
      expect(qrImage).toBeTruthy();

      // Verify image has source
      const src = await qrImage?.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src).toContain('data:image');
    });

    await test.step('Download QR code', async () => {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('[data-testid="download-qr-button"]')
      ]);

      expect(download.suggestedFilename()).toMatch(/hypeai-referral-.*\.png/);
    });
  });

  test('Reward Claiming with Different Options', async ({ page }) => {
    const email = generateEmail();

    // Setup: Register and get rewards
    await test.step('Setup: Create referral and generate rewards', async () => {
      await page.goto(`${BASE_URL}/register`);
      await page.fill('[name="email"]', email);
      await page.fill('[name="password"]', 'Pass123!');
      await page.fill('[name="confirmPassword"]', 'Pass123!');
      await page.click('button[type="submit"]');

      // Simulate having pending rewards (would need backend support)
      // For now, we'll test the UI flow
    });

    await test.step('Claim rewards in HYPE tokens', async () => {
      await page.goto(`${BASE_URL}/referral`);
      await page.click('[data-testid="claim-rewards-button"]');

      // Select HYPE tokens
      await page.click('[data-testid="reward-type-hype"]');

      // Verify calculation
      const calculatedAmount = await page.textContent('[data-testid="calculated-hype-amount"]');
      expect(calculatedAmount).toBeTruthy();

      // Confirm (would trigger wallet interaction)
      await page.click('[data-testid="confirm-claim"]');
    });

    await test.step('Claim rewards in USDT', async () => {
      await page.goto(`${BASE_URL}/referral`);
      await page.click('[data-testid="claim-rewards-button"]');

      // Select USDT
      await page.click('[data-testid="reward-type-usdt"]');

      // Verify calculation
      const calculatedAmount = await page.textContent('[data-testid="calculated-usdt-amount"]');
      expect(calculatedAmount).toBeTruthy();

      await page.click('[data-testid="confirm-claim"]');
    });
  });
});
