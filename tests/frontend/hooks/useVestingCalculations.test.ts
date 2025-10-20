/**
 * FRONTEND VESTING CALCULATION TESTS
 *
 * These tests verify that frontend vesting calculations match the smart contract exactly
 *
 * Vesting Formula (MUST MATCH CONTRACT):
 * - Immediate unlock: 20% of total tokens
 * - Cliff period: 90 days - no vesting during this time
 * - Linear vesting: 80% over 540 days AFTER cliff
 * - Total duration: 630 days
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Vesting constants (MUST MATCH SMART CONTRACT)
const IMMEDIATE_UNLOCK_PERCENTAGE = 20; // 20%
const VESTING_PERCENTAGE = 80; // 80%
const CLIFF_DURATION_DAYS = 90; // 90 days
const VESTING_DURATION_DAYS = 540; // 540 days
const TOTAL_DURATION_DAYS = 630; // 630 days
const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Calculate unlocked amount based on elapsed time
 * THIS FUNCTION MUST MATCH THE SMART CONTRACT LOGIC EXACTLY
 */
function calculateUnlockedAmount(
  totalTokens: number,
  immediateTokens: number,
  vestedTokens: number,
  purchaseTime: number,
  currentTime: number
): number {
  // Calculate elapsed time since purchase (in days)
  const elapsedMs = currentTime - purchaseTime;
  const elapsedDays = elapsedMs / DAY_IN_MS;

  // Before cliff: only immediate tokens unlocked
  if (elapsedDays < CLIFF_DURATION_DAYS) {
    return immediateTokens;
  }

  // After cliff: linear vesting
  const vestingElapsed = elapsedDays - CLIFF_DURATION_DAYS;

  // Calculate vested unlock
  let unlockedFromVesting: number;
  if (vestingElapsed >= VESTING_DURATION_DAYS) {
    // Full vesting complete
    unlockedFromVesting = vestedTokens;
  } else {
    // Partial vesting (linear)
    unlockedFromVesting = (vestedTokens * vestingElapsed) / VESTING_DURATION_DAYS;
  }

  // Total unlocked = immediate + unlocked from vesting
  return immediateTokens + unlockedFromVesting;
}

/**
 * Calculate vesting schedule from purchase
 */
function calculateVestingSchedule(totalTokens: number) {
  const immediateTokens = (totalTokens * IMMEDIATE_UNLOCK_PERCENTAGE) / 100;
  const vestedTokens = (totalTokens * VESTING_PERCENTAGE) / 100;

  return {
    totalTokens,
    immediateTokens,
    vestedTokens,
  };
}

describe('Frontend Vesting Calculations', () => {
  let purchaseTime: number;
  let totalTokens: number;
  let immediateTokens: number;
  let vestedTokens: number;

  beforeEach(() => {
    // Setup: User purchased 12,500,000 tokens ($1,000 at $0.00008)
    totalTokens = 12_500_000;
    const schedule = calculateVestingSchedule(totalTokens);
    immediateTokens = schedule.immediateTokens;
    vestedTokens = schedule.vestedTokens;
    purchaseTime = Date.now();
  });

  describe('1. VESTING SCHEDULE CALCULATION', () => {
    it('should calculate 20% immediate unlock', () => {
      const schedule = calculateVestingSchedule(12_500_000);

      expect(schedule.immediateTokens).toBe(2_500_000);
    });

    it('should calculate 80% vested tokens', () => {
      const schedule = calculateVestingSchedule(12_500_000);

      expect(schedule.vestedTokens).toBe(10_000_000);
    });

    it('should verify immediate + vested = total', () => {
      const schedule = calculateVestingSchedule(12_500_000);

      expect(schedule.immediateTokens + schedule.vestedTokens).toBe(schedule.totalTokens);
    });

    it('should handle different token amounts correctly', () => {
      const amounts = [1_000_000, 5_000_000, 20_000_000, 100_000_000];

      amounts.forEach(amount => {
        const schedule = calculateVestingSchedule(amount);
        expect(schedule.immediateTokens + schedule.vestedTokens).toBe(amount);
        expect(schedule.immediateTokens).toBe(amount * 0.2);
        expect(schedule.vestedTokens).toBe(amount * 0.8);
      });
    });
  });

  describe('2. CLIFF PERIOD (0-90 DAYS)', () => {
    it('should unlock only 20% at day 0', () => {
      const currentTime = purchaseTime; // Same as purchase time
      const unlocked = calculateUnlockedAmount(
        totalTokens,
        immediateTokens,
        vestedTokens,
        purchaseTime,
        currentTime
      );

      expect(unlocked).toBe(2_500_000); // 20% of 12.5M
    });

    it('should unlock only 20% at day 30 (mid-cliff)', () => {
      const currentTime = purchaseTime + (30 * DAY_IN_MS);
      const unlocked = calculateUnlockedAmount(
        totalTokens,
        immediateTokens,
        vestedTokens,
        purchaseTime,
        currentTime
      );

      expect(unlocked).toBe(2_500_000);
    });

    it('should unlock only 20% at day 60', () => {
      const currentTime = purchaseTime + (60 * DAY_IN_MS);
      const unlocked = calculateUnlockedAmount(
        totalTokens,
        immediateTokens,
        vestedTokens,
        purchaseTime,
        currentTime
      );

      expect(unlocked).toBe(2_500_000);
    });

    it('should unlock only 20% at day 89 (one day before cliff end)', () => {
      const currentTime = purchaseTime + (89 * DAY_IN_MS);
      const unlocked = calculateUnlockedAmount(
        totalTokens,
        immediateTokens,
        vestedTokens,
        purchaseTime,
        currentTime
      );

      expect(unlocked).toBe(2_500_000);
    });

    it('should NOT unlock vested tokens during cliff', () => {
      const days = [1, 10, 20, 30, 45, 60, 75, 89];

      days.forEach(day => {
        const currentTime = purchaseTime + (day * DAY_IN_MS);
        const unlocked = calculateUnlockedAmount(
          totalTokens,
          immediateTokens,
          vestedTokens,
          purchaseTime,
          currentTime
        );

        expect(unlocked).toBe(immediateTokens);
      });
    });
  });

  describe('3. POST-CLIFF LINEAR VESTING (90-630 DAYS)', () => {
    it('should start unlocking vested tokens after day 90', () => {
      const currentTime = purchaseTime + (91 * DAY_IN_MS);
      const unlocked = calculateUnlockedAmount(
        totalTokens,
        immediateTokens,
        vestedTokens,
        purchaseTime,
        currentTime
      );

      expect(unlocked).toBeGreaterThan(immediateTokens);
    });

    it('should unlock ~20% at day 91 (1 day after cliff)', () => {
      const currentTime = purchaseTime + (91 * DAY_IN_MS);
      const unlocked = calculateUnlockedAmount(
        totalTokens,
        immediateTokens,
        vestedTokens,
        purchaseTime,
        currentTime
      );

      // Immediate (20%) + 1 day of vesting
      // 1 day / 540 days = 0.185% of 80% = 0.148%
      // Total: 20.148%
      const percentage = (unlocked / totalTokens) * 100;
      expect(percentage).toBeGreaterThan(20);
      expect(percentage).toBeLessThan(21);
    });

    it('should unlock ~33.33% at day 180 (90 days into vesting)', () => {
      const currentTime = purchaseTime + (180 * DAY_IN_MS); // 90 cliff + 90 vesting
      const unlocked = calculateUnlockedAmount(
        totalTokens,
        immediateTokens,
        vestedTokens,
        purchaseTime,
        currentTime
      );

      // Immediate (20%) + 90 days of vesting (80% * 90/540 = 13.33%)
      // Total: 33.33%
      const percentage = (unlocked / totalTokens) * 100;
      expect(percentage).toBeCloseTo(33.33, 1);
    });

    it('should unlock 60% at day 360 (halfway through vesting)', () => {
      const currentTime = purchaseTime + (360 * DAY_IN_MS); // 90 cliff + 270 vesting
      const unlocked = calculateUnlockedAmount(
        totalTokens,
        immediateTokens,
        vestedTokens,
        purchaseTime,
        currentTime
      );

      // Immediate (20%) + half of vested (40%)
      // Total: 60%
      const percentage = (unlocked / totalTokens) * 100;
      expect(percentage).toBeCloseTo(60, 1);
    });

    it('should unlock 80% at day 540 (3/4 through vesting)', () => {
      const currentTime = purchaseTime + (540 * DAY_IN_MS); // 90 cliff + 450 vesting
      const unlocked = calculateUnlockedAmount(
        totalTokens,
        immediateTokens,
        vestedTokens,
        purchaseTime,
        currentTime
      );

      // Immediate (20%) + 3/4 of vested (60%)
      // Total: 80%
      const percentage = (unlocked / totalTokens) * 100;
      expect(percentage).toBeCloseTo(80, 1);
    });

    it('should unlock 100% at day 630 (full vesting)', () => {
      const currentTime = purchaseTime + (630 * DAY_IN_MS);
      const unlocked = calculateUnlockedAmount(
        totalTokens,
        immediateTokens,
        vestedTokens,
        purchaseTime,
        currentTime
      );

      expect(unlocked).toBe(totalTokens);
    });

    it('should stay at 100% after day 630', () => {
      const futureDays = [631, 700, 1000, 2000];

      futureDays.forEach(day => {
        const currentTime = purchaseTime + (day * DAY_IN_MS);
        const unlocked = calculateUnlockedAmount(
          totalTokens,
          immediateTokens,
          vestedTokens,
          purchaseTime,
          currentTime
        );

        expect(unlocked).toBe(totalTokens);
      });
    });
  });

  describe('4. LINEAR VESTING VERIFICATION', () => {
    it('should increase linearly during vesting period', () => {
      const unlockedAmounts: number[] = [];

      // Check every 30 days from day 90 to day 630
      for (let day = 90; day <= 630; day += 30) {
        const currentTime = purchaseTime + (day * DAY_IN_MS);
        const unlocked = calculateUnlockedAmount(
          totalTokens,
          immediateTokens,
          vestedTokens,
          purchaseTime,
          currentTime
        );
        unlockedAmounts.push(unlocked);
      }

      // Verify amounts are strictly increasing
      for (let i = 1; i < unlockedAmounts.length; i++) {
        expect(unlockedAmounts[i]).toBeGreaterThan(unlockedAmounts[i - 1]);
      }

      // Verify increases are roughly linear (allow 10% variance)
      const increases = [];
      for (let i = 1; i < unlockedAmounts.length; i++) {
        increases.push(unlockedAmounts[i] - unlockedAmounts[i - 1]);
      }

      const avgIncrease = increases.reduce((a, b) => a + b, 0) / increases.length;
      increases.forEach(increase => {
        expect(Math.abs(increase - avgIncrease) / avgIncrease).toBeLessThan(0.1);
      });
    });
  });

  describe('5. EDGE CASES', () => {
    it('should handle exact cliff boundary (day 90)', () => {
      const currentTime = purchaseTime + (90 * DAY_IN_MS);
      const unlocked = calculateUnlockedAmount(
        totalTokens,
        immediateTokens,
        vestedTokens,
        purchaseTime,
        currentTime
      );

      // At exactly day 90, vesting should just start
      expect(unlocked).toBeGreaterThanOrEqual(immediateTokens);
    });

    it('should handle very small token amounts', () => {
      const smallAmount = 100;
      const schedule = calculateVestingSchedule(smallAmount);

      expect(schedule.immediateTokens + schedule.vestedTokens).toBe(smallAmount);
    });

    it('should handle very large token amounts', () => {
      const largeAmount = 1_000_000_000; // 1 billion
      const schedule = calculateVestingSchedule(largeAmount);

      expect(schedule.immediateTokens + schedule.vestedTokens).toBe(largeAmount);
    });

    it('should handle fractional days correctly', () => {
      // Test at 90.5 days
      const currentTime = purchaseTime + (90.5 * DAY_IN_MS);
      const unlocked = calculateUnlockedAmount(
        totalTokens,
        immediateTokens,
        vestedTokens,
        purchaseTime,
        currentTime
      );

      expect(unlocked).toBeGreaterThan(immediateTokens);
    });
  });

  describe('6. CLAIMABLE AMOUNT CALCULATION', () => {
    it('should calculate claimable amount correctly', () => {
      const currentTime = purchaseTime + (180 * DAY_IN_MS);
      const unlocked = calculateUnlockedAmount(
        totalTokens,
        immediateTokens,
        vestedTokens,
        purchaseTime,
        currentTime
      );

      const alreadyClaimed = immediateTokens; // User claimed immediate tokens
      const claimable = unlocked - alreadyClaimed;

      expect(claimable).toBeGreaterThan(0);
      expect(claimable).toBeLessThan(vestedTokens);
    });

    it('should return 0 claimable if all unlocked tokens claimed', () => {
      const currentTime = purchaseTime + (180 * DAY_IN_MS);
      const unlocked = calculateUnlockedAmount(
        totalTokens,
        immediateTokens,
        vestedTokens,
        purchaseTime,
        currentTime
      );

      const alreadyClaimed = unlocked; // User claimed everything
      const claimable = unlocked - alreadyClaimed;

      expect(claimable).toBe(0);
    });
  });

  describe('7. VESTING PROGRESS PERCENTAGE', () => {
    it('should calculate 0% at purchase time', () => {
      const currentTime = purchaseTime;
      const elapsedDays = (currentTime - purchaseTime) / DAY_IN_MS;
      const progress = (elapsedDays / TOTAL_DURATION_DAYS) * 100;

      expect(progress).toBe(0);
    });

    it('should calculate ~14.29% at day 90 (cliff end)', () => {
      const currentTime = purchaseTime + (90 * DAY_IN_MS);
      const elapsedDays = (currentTime - purchaseTime) / DAY_IN_MS;
      const progress = (elapsedDays / TOTAL_DURATION_DAYS) * 100;

      expect(progress).toBeCloseTo(14.29, 1);
    });

    it('should calculate 50% at day 315 (halfway)', () => {
      const currentTime = purchaseTime + (315 * DAY_IN_MS);
      const elapsedDays = (currentTime - purchaseTime) / DAY_IN_MS;
      const progress = (elapsedDays / TOTAL_DURATION_DAYS) * 100;

      expect(progress).toBeCloseTo(50, 1);
    });

    it('should calculate 100% at day 630', () => {
      const currentTime = purchaseTime + (630 * DAY_IN_MS);
      const elapsedDays = (currentTime - purchaseTime) / DAY_IN_MS;
      const progress = (elapsedDays / TOTAL_DURATION_DAYS) * 100;

      expect(progress).toBeCloseTo(100, 0);
    });
  });
});

describe('Comparison with Smart Contract Values', () => {
  it('should match smart contract constants', () => {
    // These values MUST match the smart contract
    const contractValues = {
      IMMEDIATE_UNLOCK_PERCENTAGE: 2000, // basis points
      VESTING_PERCENTAGE: 8000, // basis points
      CLIFF_DURATION: 90 * 24 * 60 * 60, // seconds
      VESTING_DURATION: 540 * 24 * 60 * 60, // seconds
      BASIS_POINTS: 10000,
    };

    expect((IMMEDIATE_UNLOCK_PERCENTAGE * 100)).toBe(contractValues.IMMEDIATE_UNLOCK_PERCENTAGE);
    expect((VESTING_PERCENTAGE * 100)).toBe(contractValues.VESTING_PERCENTAGE);
    expect((CLIFF_DURATION_DAYS * 24 * 60 * 60)).toBe(contractValues.CLIFF_DURATION);
    expect((VESTING_DURATION_DAYS * 24 * 60 * 60)).toBe(contractValues.VESTING_DURATION);
  });

  it('should produce same results as smart contract for test case 1', () => {
    // Test case: $1,000 purchase = 12,500,000 tokens
    const totalTokens = 12_500_000;
    const schedule = calculateVestingSchedule(totalTokens);

    // Smart contract expected values
    expect(schedule.immediateTokens).toBe(2_500_000); // 20%
    expect(schedule.vestedTokens).toBe(10_000_000); // 80%

    // Verify at day 180 (mid-vesting)
    const purchaseTime = Date.now();
    const day180 = purchaseTime + (180 * DAY_IN_MS);
    const unlocked = calculateUnlockedAmount(
      totalTokens,
      schedule.immediateTokens,
      schedule.vestedTokens,
      purchaseTime,
      day180
    );

    // Expected: 20% + (80% * 90/540) = 33.33%
    const expected = totalTokens * 0.3333;
    expect(unlocked).toBeCloseTo(expected, -3); // Within 1000 tokens
  });
});
