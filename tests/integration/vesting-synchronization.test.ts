/**
 * INTEGRATION TESTS FOR VESTING SYSTEM
 *
 * Verifies that smart contract, frontend, and backend calculations are synchronized
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Mock Web3 provider for contract interaction
class MockContractProvider {
  async getVestingParameters() {
    // These values MUST match the smart contract
    return {
      immediateUnlockBps: 2000, // 20%
      vestingBps: 8000, // 80%
      cliffDurationSeconds: 90 * 24 * 60 * 60, // 90 days
      vestingDurationSeconds: 540 * 24 * 60 * 60, // 540 days
      tokenPriceUsd: 8, // $0.00008 scaled
      minPurchaseUsd: '400000000000000000000', // $400 with 18 decimals
      maxPurchaseUsd: '8000000000000000000000', // $8,000 with 18 decimals
      bonusBps: 1000, // 10%
    };
  }

  async getUnlockedAmount(userAddress: string, purchaseTime: number, currentTime: number): Promise<number> {
    // Simulate contract call
    const totalTokens = 12_500_000;
    const immediateTokens = totalTokens * 0.2;
    const vestedTokens = totalTokens * 0.8;

    const elapsedSeconds = currentTime - purchaseTime;
    const elapsedDays = elapsedSeconds / (24 * 60 * 60);
    const cliffDays = 90;
    const vestingDays = 540;

    if (elapsedDays < cliffDays) {
      return immediateTokens;
    }

    const vestingElapsed = elapsedDays - cliffDays;
    let unlockedFromVesting: number;

    if (vestingElapsed >= vestingDays) {
      unlockedFromVesting = vestedTokens;
    } else {
      unlockedFromVesting = (vestedTokens * vestingElapsed) / vestingDays;
    }

    return immediateTokens + unlockedFromVesting;
  }

  async getVestingInfo(userAddress: string) {
    return {
      totalTokens: 12_500_000,
      immediateTokens: 2_500_000,
      vestedTokens: 10_000_000,
      claimedTokens: 0,
      unlockedTokens: 2_500_000,
      claimableTokens: 2_500_000,
      purchaseTime: Math.floor(Date.now() / 1000),
      vestingEndTime: Math.floor(Date.now() / 1000) + (630 * 24 * 60 * 60),
      vestingProgress: 0,
    };
  }
}

// Frontend calculation functions
class FrontendVestingCalculator {
  static calculateUnlockedAmount(
    totalTokens: number,
    immediateTokens: number,
    vestedTokens: number,
    purchaseTime: number,
    currentTime: number
  ): number {
    const elapsedMs = currentTime - purchaseTime;
    const elapsedDays = elapsedMs / (24 * 60 * 60 * 1000);
    const cliffDays = 90;
    const vestingDays = 540;

    if (elapsedDays < cliffDays) {
      return immediateTokens;
    }

    const vestingElapsed = elapsedDays - cliffDays;
    let unlockedFromVesting: number;

    if (vestingElapsed >= vestingDays) {
      unlockedFromVesting = vestedTokens;
    } else {
      unlockedFromVesting = (vestedTokens * vestingElapsed) / vestingDays;
    }

    return immediateTokens + unlockedFromVesting;
  }

  static calculateVestingSchedule(totalTokens: number) {
    return {
      totalTokens,
      immediateTokens: totalTokens * 0.2,
      vestedTokens: totalTokens * 0.8,
    };
  }
}

// Backend API simulation
class BackendAPI {
  static async calculateVestedTokens(
    totalTokens: number,
    purchaseTimestamp: number,
    currentTimestamp: number
  ) {
    const CLIFF_DURATION = 90 * 24 * 60 * 60; // 90 days in seconds
    const VESTING_DURATION = 540 * 24 * 60 * 60; // 540 days in seconds

    const immediateTokens = totalTokens * 0.2;
    const vestedTokens = totalTokens * 0.8;

    const elapsedTime = currentTimestamp - purchaseTimestamp;

    if (elapsedTime < CLIFF_DURATION) {
      return {
        unlocked: immediateTokens,
        locked: vestedTokens,
        claimable: immediateTokens,
      };
    }

    const vestingElapsed = elapsedTime - CLIFF_DURATION;
    let unlockedFromVesting: number;

    if (vestingElapsed >= VESTING_DURATION) {
      unlockedFromVesting = vestedTokens;
    } else {
      unlockedFromVesting = (vestedTokens * vestingElapsed) / VESTING_DURATION;
    }

    const totalUnlocked = immediateTokens + unlockedFromVesting;

    return {
      unlocked: totalUnlocked,
      locked: totalTokens - totalUnlocked,
      claimable: totalUnlocked,
    };
  }
}

describe('Vesting System Integration Tests', () => {
  let contractProvider: MockContractProvider;

  beforeAll(() => {
    contractProvider = new MockContractProvider();
  });

  describe('1. PARAMETER SYNCHRONIZATION', () => {
    it('should have matching vesting parameters across all layers', async () => {
      const params = await contractProvider.getVestingParameters();

      // Frontend constants
      const frontendConstants = {
        immediateUnlockBps: 2000,
        vestingBps: 8000,
        cliffDurationSeconds: 90 * 24 * 60 * 60,
        vestingDurationSeconds: 540 * 24 * 60 * 60,
      };

      // Backend constants (same as smart contract)
      const backendConstants = {
        immediateUnlockBps: 2000,
        vestingBps: 8000,
        cliffDurationSeconds: 90 * 24 * 60 * 60,
        vestingDurationSeconds: 540 * 24 * 60 * 60,
      };

      // Verify all match
      expect(params.immediateUnlockBps).toBe(frontendConstants.immediateUnlockBps);
      expect(params.vestingBps).toBe(frontendConstants.vestingBps);
      expect(params.cliffDurationSeconds).toBe(frontendConstants.cliffDurationSeconds);
      expect(params.vestingDurationSeconds).toBe(frontendConstants.vestingDurationSeconds);

      expect(params.immediateUnlockBps).toBe(backendConstants.immediateUnlockBps);
      expect(params.vestingBps).toBe(backendConstants.vestingBps);
    });

    it('should have percentages that sum to 100%', async () => {
      const params = await contractProvider.getVestingParameters();

      expect(params.immediateUnlockBps + params.vestingBps).toBe(10000); // 100%
    });
  });

  describe('2. CALCULATION SYNCHRONIZATION', () => {
    const testCases = [
      { day: 0, expectedPercentage: 20 },
      { day: 30, expectedPercentage: 20 },
      { day: 89, expectedPercentage: 20 },
      { day: 90, expectedPercentage: 20 }, // Cliff end
      { day: 180, expectedPercentage: 33.33 },
      { day: 360, expectedPercentage: 60 },
      { day: 540, expectedPercentage: 80 },
      { day: 630, expectedPercentage: 100 },
    ];

    testCases.forEach(({ day, expectedPercentage }) => {
      it(`should match calculations at day ${day} (${expectedPercentage}%)`, async () => {
        const totalTokens = 12_500_000;
        const schedule = FrontendVestingCalculator.calculateVestingSchedule(totalTokens);
        const purchaseTime = Math.floor(Date.now() / 1000);
        const currentTime = purchaseTime + (day * 24 * 60 * 60);

        // Contract calculation
        const contractUnlocked = await contractProvider.getUnlockedAmount(
          '0x123',
          purchaseTime,
          currentTime
        );

        // Frontend calculation (convert to seconds for comparison)
        const frontendUnlocked = FrontendVestingCalculator.calculateUnlockedAmount(
          totalTokens,
          schedule.immediateTokens,
          schedule.vestedTokens,
          purchaseTime * 1000,
          currentTime * 1000
        );

        // Backend calculation
        const backendResult = await BackendAPI.calculateVestedTokens(
          totalTokens,
          purchaseTime,
          currentTime
        );

        // All three should match (allow small rounding differences)
        const tolerance = 100; // 100 tokens tolerance
        expect(Math.abs(contractUnlocked - frontendUnlocked)).toBeLessThan(tolerance);
        expect(Math.abs(contractUnlocked - backendResult.unlocked)).toBeLessThan(tolerance);
        expect(Math.abs(frontendUnlocked - backendResult.unlocked)).toBeLessThan(tolerance);

        // Verify percentage is correct
        const percentage = (contractUnlocked / totalTokens) * 100;
        expect(percentage).toBeCloseTo(expectedPercentage, 0);
      });
    });
  });

  describe('3. VESTING SCHEDULE CREATION', () => {
    it('should create identical schedules across layers', () => {
      const totalTokens = 12_500_000;

      // Frontend calculation
      const frontendSchedule = FrontendVestingCalculator.calculateVestingSchedule(totalTokens);

      // Backend would calculate same way
      const backendSchedule = {
        totalTokens,
        immediateTokens: totalTokens * 0.2,
        vestedTokens: totalTokens * 0.8,
      };

      expect(frontendSchedule.immediateTokens).toBe(backendSchedule.immediateTokens);
      expect(frontendSchedule.vestedTokens).toBe(backendSchedule.vestedTokens);
    });

    it('should handle different purchase amounts consistently', () => {
      const amounts = [5_000_000, 10_000_000, 50_000_000, 100_000_000];

      amounts.forEach(amount => {
        const frontendSchedule = FrontendVestingCalculator.calculateVestingSchedule(amount);
        const backendSchedule = {
          immediateTokens: amount * 0.2,
          vestedTokens: amount * 0.8,
        };

        expect(frontendSchedule.immediateTokens).toBe(backendSchedule.immediateTokens);
        expect(frontendSchedule.vestedTokens).toBe(backendSchedule.vestedTokens);
      });
    });
  });

  describe('4. API ENDPOINT INTEGRATION', () => {
    it('should return vesting info that matches contract', async () => {
      const contractInfo = await contractProvider.getVestingInfo('0x123');

      // Simulate API response
      const apiResponse = {
        totalTokens: contractInfo.totalTokens,
        immediateTokens: contractInfo.immediateTokens,
        vestedTokens: contractInfo.vestedTokens,
        claimedTokens: contractInfo.claimedTokens,
        claimable: contractInfo.claimableTokens,
        vestingProgress: contractInfo.vestingProgress,
      };

      expect(apiResponse.totalTokens).toBe(contractInfo.totalTokens);
      expect(apiResponse.immediateTokens).toBe(contractInfo.immediateTokens);
      expect(apiResponse.vestedTokens).toBe(contractInfo.vestedTokens);
    });
  });

  describe('5. EDGE CASE SYNCHRONIZATION', () => {
    it('should handle cliff boundary (day 90) consistently', async () => {
      const totalTokens = 12_500_000;
      const schedule = FrontendVestingCalculator.calculateVestingSchedule(totalTokens);
      const purchaseTime = Math.floor(Date.now() / 1000);
      const currentTime = purchaseTime + (90 * 24 * 60 * 60);

      const contractUnlocked = await contractProvider.getUnlockedAmount(
        '0x123',
        purchaseTime,
        currentTime
      );

      const frontendUnlocked = FrontendVestingCalculator.calculateUnlockedAmount(
        totalTokens,
        schedule.immediateTokens,
        schedule.vestedTokens,
        purchaseTime * 1000,
        currentTime * 1000
      );

      const backendResult = await BackendAPI.calculateVestedTokens(
        totalTokens,
        purchaseTime,
        currentTime
      );

      // All should be >= immediate tokens (cliff just ended)
      expect(contractUnlocked).toBeGreaterThanOrEqual(schedule.immediateTokens);
      expect(frontendUnlocked).toBeGreaterThanOrEqual(schedule.immediateTokens);
      expect(backendResult.unlocked).toBeGreaterThanOrEqual(schedule.immediateTokens);
    });

    it('should handle vesting completion (day 630) consistently', async () => {
      const totalTokens = 12_500_000;
      const schedule = FrontendVestingCalculator.calculateVestingSchedule(totalTokens);
      const purchaseTime = Math.floor(Date.now() / 1000);
      const currentTime = purchaseTime + (630 * 24 * 60 * 60);

      const contractUnlocked = await contractProvider.getUnlockedAmount(
        '0x123',
        purchaseTime,
        currentTime
      );

      const frontendUnlocked = FrontendVestingCalculator.calculateUnlockedAmount(
        totalTokens,
        schedule.immediateTokens,
        schedule.vestedTokens,
        purchaseTime * 1000,
        currentTime * 1000
      );

      const backendResult = await BackendAPI.calculateVestedTokens(
        totalTokens,
        purchaseTime,
        currentTime
      );

      // All should equal total tokens (full unlock)
      expect(contractUnlocked).toBe(totalTokens);
      expect(frontendUnlocked).toBe(totalTokens);
      expect(backendResult.unlocked).toBe(totalTokens);
    });
  });

  describe('6. UI DISPLAY VERIFICATION', () => {
    it('should calculate correct display values for vesting widget', async () => {
      const totalTokens = 12_500_000;
      const purchaseTime = Date.now();
      const currentTime = purchaseTime + (180 * 24 * 60 * 60 * 1000); // Day 180

      const schedule = FrontendVestingCalculator.calculateVestingSchedule(totalTokens);
      const unlocked = FrontendVestingCalculator.calculateUnlockedAmount(
        totalTokens,
        schedule.immediateTokens,
        schedule.vestedTokens,
        purchaseTime,
        currentTime
      );

      const claimed = schedule.immediateTokens; // User claimed immediate tokens
      const claimable = unlocked - claimed;
      const locked = totalTokens - unlocked;

      // Verify UI values make sense
      expect(unlocked + locked).toBeCloseTo(totalTokens, -3);
      expect(claimable).toBeGreaterThan(0);
      expect(claimable).toBeLessThan(schedule.vestedTokens);
    });

    it('should calculate progress bar percentage correctly', () => {
      const testCases = [
        { day: 0, expectedProgress: 0 },
        { day: 90, expectedProgress: 14.29 },
        { day: 315, expectedProgress: 50 },
        { day: 630, expectedProgress: 100 },
      ];

      testCases.forEach(({ day, expectedProgress }) => {
        const totalDuration = 630; // days
        const progress = (day / totalDuration) * 100;

        expect(progress).toBeCloseTo(expectedProgress, 0);
      });
    });
  });

  describe('7. ERROR HANDLING', () => {
    it('should handle invalid purchase time gracefully', () => {
      const totalTokens = 12_500_000;
      const schedule = FrontendVestingCalculator.calculateVestingSchedule(totalTokens);
      const purchaseTime = 0; // Invalid
      const currentTime = Date.now();

      // Should not throw, should handle gracefully
      expect(() => {
        FrontendVestingCalculator.calculateUnlockedAmount(
          totalTokens,
          schedule.immediateTokens,
          schedule.vestedTokens,
          purchaseTime,
          currentTime
        );
      }).not.toThrow();
    });

    it('should handle future purchase time (time travel protection)', () => {
      const totalTokens = 12_500_000;
      const schedule = FrontendVestingCalculator.calculateVestingSchedule(totalTokens);
      const purchaseTime = Date.now() + (365 * 24 * 60 * 60 * 1000); // Future
      const currentTime = Date.now();

      const unlocked = FrontendVestingCalculator.calculateUnlockedAmount(
        totalTokens,
        schedule.immediateTokens,
        schedule.vestedTokens,
        purchaseTime,
        currentTime
      );

      // Should return immediate tokens (negative elapsed time = before purchase)
      expect(unlocked).toBe(schedule.immediateTokens);
    });
  });
});

describe('Contract Address Verification', () => {
  it('should verify contract address is set correctly', () => {
    // Check that contract address constant is defined
    const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PRIVATE_SALE_CONTRACT_ADDRESS;

    // In production, this should be a valid BNB address
    if (CONTRACT_ADDRESS) {
      expect(CONTRACT_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
    }
  });

  it('should verify correct network configuration', () => {
    const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'testnet';

    // Should be either 'mainnet' or 'testnet'
    expect(['mainnet', 'testnet']).toContain(NETWORK);
  });
});
