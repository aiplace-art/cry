/**
 * Private Sale Integration Tests
 * Tests complete flow: purchase, vesting, claiming, limits
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import privateSaleService from '../src/backend/services/privateSaleService';

describe('Private Sale Integration Tests', () => {

  describe('Purchase Validation', () => {
    it('should reject purchases below minimum ($10)', async () => {
      const result = await privateSaleService.validatePurchase({
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        usdAmount: 5,
        currency: 'ETH',
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minimum purchase is $10');
    });

    it('should reject purchases above maximum ($500)', async () => {
      const result = await privateSaleService.validatePurchase({
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        usdAmount: 600,
        currency: 'ETH',
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum purchase');
    });

    it('should accept valid purchases within limits', async () => {
      const result = await privateSaleService.validatePurchase({
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        usdAmount: 250,
        currency: 'ETH',
      });

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Bonus Calculation', () => {
    it('should give 30% bonus for $500 purchase', () => {
      const bonus = privateSaleService.calculateBonus(500);
      expect(bonus).toBe(30);
    });

    it('should give 20% bonus for $100-$499 purchase', () => {
      const bonus100 = privateSaleService.calculateBonus(100);
      const bonus499 = privateSaleService.calculateBonus(499);

      expect(bonus100).toBe(20);
      expect(bonus499).toBe(20);
    });

    it('should give 0% bonus for purchases under $100', () => {
      const bonus = privateSaleService.calculateBonus(99);
      expect(bonus).toBe(0);
    });
  });

  describe('Token Calculation', () => {
    it('should calculate correct tokens for $500 purchase with 30% bonus', () => {
      const calc = privateSaleService.calculateTokens(500);

      // $500 / $0.0015 = 333,333 base tokens
      expect(calc.baseTokens).toBe(333333);

      // 30% bonus = 100,000 tokens
      expect(calc.bonusPercent).toBe(30);
      expect(calc.bonusTokens).toBe(99999); // Floor of 333333 * 0.3

      // Total = 433,332 tokens
      expect(calc.totalTokens).toBe(433332);

      // 40% immediate = 173,332 tokens
      expect(calc.immediateTokens).toBe(173332);

      // 60% vested = 260,000 tokens
      expect(calc.vestedTokens).toBe(260000);
    });

    it('should calculate correct tokens for $100 purchase with 20% bonus', () => {
      const calc = privateSaleService.calculateTokens(100);

      // $100 / $0.0015 = 66,666 base tokens
      expect(calc.baseTokens).toBe(66666);

      // 20% bonus = 13,333 tokens
      expect(calc.bonusPercent).toBe(20);
      expect(calc.bonusTokens).toBe(13333);

      // Total = 79,999 tokens
      expect(calc.totalTokens).toBe(79999);
    });
  });

  describe('Wallet Limit Enforcement', () => {
    const wallet = '0x' + 'a'.repeat(40);

    beforeEach(() => {
      // Reset wallet limits before each test
      privateSaleService.resetWalletLimit(wallet, 'admin-secret-key');
    });

    it('should allow purchases up to $500 limit', async () => {
      // First purchase: $300
      const purchase1 = await privateSaleService.processPurchase({
        walletAddress: wallet,
        usdAmount: 300,
        currency: 'ETH',
      });

      expect(purchase1.success).toBe(true);

      // Second purchase: $200 (total = $500)
      const purchase2 = await privateSaleService.processPurchase({
        walletAddress: wallet,
        usdAmount: 200,
        currency: 'ETH',
      });

      expect(purchase2.success).toBe(true);

      // Check limit info
      const limitInfo = privateSaleService.getWalletLimitInfo(wallet);
      expect(limitInfo.totalSpentUSD).toBe(500);
      expect(limitInfo.isAtLimit).toBe(true);
      expect(limitInfo.remainingLimit).toBe(0);
    });

    it('should reject purchases exceeding $500 limit', async () => {
      // First purchase: $400
      await privateSaleService.processPurchase({
        walletAddress: wallet,
        usdAmount: 400,
        currency: 'ETH',
      });

      // Second purchase: $200 (would exceed limit)
      const purchase2 = await privateSaleService.processPurchase({
        walletAddress: wallet,
        usdAmount: 200,
        currency: 'ETH',
      });

      expect(purchase2.success).toBe(false);
      expect(purchase2.error).toContain('Exceeds wallet limit');
      expect(purchase2.error).toContain('$100 remaining');
    });

    it('should track multiple small purchases correctly', async () => {
      // Make 5 purchases of $100 each
      for (let i = 0; i < 5; i++) {
        const result = await privateSaleService.processPurchase({
          walletAddress: wallet,
          usdAmount: 100,
          currency: 'ETH',
        });
        expect(result.success).toBe(true);
      }

      const limitInfo = privateSaleService.getWalletLimitInfo(wallet);
      expect(limitInfo.totalSpentUSD).toBe(500);
      expect(limitInfo.purchaseCount).toBe(5);
      expect(limitInfo.isAtLimit).toBe(true);

      // 6th purchase should fail
      const result = await privateSaleService.processPurchase({
        walletAddress: wallet,
        usdAmount: 10,
        currency: 'ETH',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Vesting Schedule Generation', () => {
    it('should generate 6-month vesting schedule', () => {
      const purchaseDate = new Date('2025-10-17');
      const vestedTokens = 260000;

      const schedule = privateSaleService.generateVestingSchedule(vestedTokens, purchaseDate);

      expect(schedule).toHaveLength(6);

      // Check first unlock
      expect(schedule[0].month).toBe(1);
      expect(schedule[0].amount).toBe(43333); // 260000 / 6
      expect(schedule[0].unlockDate.getMonth()).toBe(10); // November (month 10)
      expect(schedule[0].claimed).toBe(false);

      // Check last unlock
      expect(schedule[5].month).toBe(6);
      expect(schedule[5].unlockDate.getMonth()).toBe(3); // April (month 3)
    });

    it('should correctly distribute tokens across months', () => {
      const purchaseDate = new Date('2025-10-17');
      const vestedTokens = 260000;

      const schedule = privateSaleService.generateVestingSchedule(vestedTokens, purchaseDate);

      const totalVested = schedule.reduce((sum, item) => sum + item.amount, 0);

      // Should be close to total (minor rounding differences acceptable)
      expect(totalVested).toBeGreaterThanOrEqual(259998);
      expect(totalVested).toBeLessThanOrEqual(260000);
    });
  });

  describe('Claimable Vested Tokens', () => {
    it('should identify claimable tokens based on unlock date', () => {
      const now = new Date('2025-12-17'); // 2 months after purchase

      const schedule = [
        {
          id: 'vest-1',
          month: 1,
          unlockDate: new Date('2025-11-17'), // Past
          amount: 43333,
          claimed: false,
        },
        {
          id: 'vest-2',
          month: 2,
          unlockDate: new Date('2025-12-17'), // Today
          amount: 43333,
          claimed: false,
        },
        {
          id: 'vest-3',
          month: 3,
          unlockDate: new Date('2026-01-17'), // Future
          amount: 43333,
          claimed: false,
        },
      ];

      const { claimable, total } = privateSaleService.getClaimableVestedTokens(schedule);

      expect(claimable).toHaveLength(2); // Month 1 and 2
      expect(total).toBe(86666);
    });

    it('should exclude already claimed tokens', () => {
      const schedule = [
        {
          id: 'vest-1',
          month: 1,
          unlockDate: new Date('2025-11-17'),
          amount: 43333,
          claimed: true, // Already claimed
        },
        {
          id: 'vest-2',
          month: 2,
          unlockDate: new Date('2025-12-17'),
          amount: 43333,
          claimed: false,
        },
      ];

      const { claimable, total } = privateSaleService.getClaimableVestedTokens(schedule);

      expect(claimable).toHaveLength(1); // Only month 2
      expect(total).toBe(43333);
    });
  });

  describe('Anti-Whale Detection', () => {
    it('should flag wallets at exact maximum limit as potentially suspicious', () => {
      const wallet = '0x' + 'b'.repeat(40);

      privateSaleService.resetWalletLimit(wallet, 'admin-secret-key');

      privateSaleService.processPurchase({
        walletAddress: wallet,
        usdAmount: 500,
        currency: 'ETH',
      });

      const detection = privateSaleService.detectSuspiciousActivity(wallet);

      // Should note the exact limit pattern
      expect(detection.reasons).toContain('Wallet at exact maximum limit');
    });
  });

  describe('Purchase Statistics', () => {
    beforeEach(() => {
      // Clear all purchases
      const wallets = ['0x' + 'c'.repeat(40), '0x' + 'd'.repeat(40), '0x' + 'e'.repeat(40)];
      wallets.forEach(w => privateSaleService.resetWalletLimit(w, 'admin-secret-key'));
    });

    it('should track overall sale statistics', async () => {
      const wallets = [
        '0x' + 'c'.repeat(40),
        '0x' + 'd'.repeat(40),
        '0x' + 'e'.repeat(40),
      ];

      // 3 wallets purchase $500 each
      for (const wallet of wallets) {
        await privateSaleService.processPurchase({
          walletAddress: wallet,
          usdAmount: 500,
          currency: 'ETH',
        });
      }

      const stats = privateSaleService.getPurchaseStats();

      expect(stats.totalParticipants).toBe(3);
      expect(stats.totalRaised).toBe(1500);
      expect(stats.averagePurchase).toBe(500);
      expect(stats.walletsAtLimit).toBe(3);
    });
  });

  describe('Complete Purchase Flow', () => {
    it('should handle complete purchase-to-claim flow', async () => {
      const wallet = '0x' + 'f'.repeat(40);
      privateSaleService.resetWalletLimit(wallet, 'admin-secret-key');

      // Step 1: Purchase $500
      const purchase = await privateSaleService.processPurchase({
        walletAddress: wallet,
        usdAmount: 500,
        currency: 'ETH',
      });

      expect(purchase.success).toBe(true);
      expect(purchase.totalTokens).toBe(433332);
      expect(purchase.immediateTokens).toBe(173332);
      expect(purchase.vestedTokens).toBe(260000);

      // Step 2: Generate vesting schedule
      const purchaseDate = new Date();
      const schedule = privateSaleService.generateVestingSchedule(
        purchase.vestedTokens!,
        purchaseDate
      );

      expect(schedule).toHaveLength(6);

      // Step 3: Check wallet limit
      const limitInfo = privateSaleService.getWalletLimitInfo(wallet);
      expect(limitInfo.isAtLimit).toBe(true);
      expect(limitInfo.remainingLimit).toBe(0);

      // Step 4: Verify no more purchases allowed
      const secondPurchase = await privateSaleService.processPurchase({
        walletAddress: wallet,
        usdAmount: 10,
        currency: 'ETH',
      });

      expect(secondPurchase.success).toBe(false);
      expect(secondPurchase.error).toContain('Exceeds wallet limit');
    });
  });
});
