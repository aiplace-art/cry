/**
 * @test Token Calculations Utility
 * @description Tests for token calculation functions
 * @focus Edge cases, boundary values, precision
 */

describe('Token Calculation Utilities', () => {
  const TOKEN_PRICE = 0.0015;
  const BONUS_TIERS = [
    { minAmount: 50, bonus: 5 },
    { minAmount: 100, bonus: 10 },
    { minAmount: 250, bonus: 20 },
    { minAmount: 500, bonus: 30 },
  ];

  /**
   * Calculate base tokens from USD amount
   */
  const calculateBaseTokens = (usdAmount: number): number => {
    return usdAmount / TOKEN_PRICE;
  };

  /**
   * Get bonus percentage for USD amount
   */
  const getBonusPercentage = (usdAmount: number): number => {
    for (let i = BONUS_TIERS.length - 1; i >= 0; i--) {
      if (usdAmount >= BONUS_TIERS[i].minAmount) {
        return BONUS_TIERS[i].bonus;
      }
    }
    return 0;
  };

  /**
   * Calculate bonus tokens
   */
  const calculateBonusTokens = (baseTokens: number, bonusPercentage: number): number => {
    return (baseTokens * bonusPercentage) / 100;
  };

  /**
   * Calculate total tokens including bonus
   */
  const calculateTotalTokens = (usdAmount: number) => {
    const baseTokens = calculateBaseTokens(usdAmount);
    const bonusPercentage = getBonusPercentage(usdAmount);
    const bonusTokens = calculateBonusTokens(baseTokens, bonusPercentage);
    const totalTokens = baseTokens + bonusTokens;

    return {
      usdAmount,
      baseTokens,
      bonusPercentage,
      bonusTokens,
      totalTokens,
    };
  };

  describe('calculateBaseTokens', () => {
    it('should calculate correct tokens for minimum purchase', () => {
      const result = calculateBaseTokens(50);
      expect(result).toBeCloseTo(33333.33, 2);
    });

    it('should calculate correct tokens for $100', () => {
      const result = calculateBaseTokens(100);
      expect(result).toBeCloseTo(66666.67, 2);
    });

    it('should calculate correct tokens for $250', () => {
      const result = calculateBaseTokens(250);
      expect(result).toBeCloseTo(166666.67, 2);
    });

    it('should calculate correct tokens for maximum purchase ($500)', () => {
      const result = calculateBaseTokens(500);
      expect(result).toBeCloseTo(333333.33, 2);
    });

    it('should handle decimal USD amounts', () => {
      const result = calculateBaseTokens(99.99);
      expect(result).toBeCloseTo(66660, 2);
    });

    it('should handle very small amounts', () => {
      const result = calculateBaseTokens(0.01);
      expect(result).toBeCloseTo(6.67, 2);
    });

    it('should return 0 for 0 USD', () => {
      const result = calculateBaseTokens(0);
      expect(result).toBe(0);
    });

    it('should handle large amounts correctly', () => {
      const result = calculateBaseTokens(10000);
      expect(result).toBeCloseTo(6666666.67, 2);
    });
  });

  describe('getBonusPercentage', () => {
    it('should return 0% for amounts below $50', () => {
      expect(getBonusPercentage(49.99)).toBe(0);
      expect(getBonusPercentage(25)).toBe(0);
      expect(getBonusPercentage(0)).toBe(0);
    });

    it('should return 5% for $50-$99.99', () => {
      expect(getBonusPercentage(50)).toBe(5);
      expect(getBonusPercentage(75)).toBe(5);
      expect(getBonusPercentage(99.99)).toBe(5);
    });

    it('should return 10% for $100-$249.99', () => {
      expect(getBonusPercentage(100)).toBe(10);
      expect(getBonusPercentage(150)).toBe(10);
      expect(getBonusPercentage(249.99)).toBe(10);
    });

    it('should return 20% for $250-$499.99', () => {
      expect(getBonusPercentage(250)).toBe(20);
      expect(getBonusPercentage(350)).toBe(20);
      expect(getBonusPercentage(499.99)).toBe(20);
    });

    it('should return 30% for $500+', () => {
      expect(getBonusPercentage(500)).toBe(30);
      expect(getBonusPercentage(1000)).toBe(30);
      expect(getBonusPercentage(10000)).toBe(30);
    });

    it('should handle boundary values correctly', () => {
      expect(getBonusPercentage(49.99)).toBe(0);
      expect(getBonusPercentage(50.00)).toBe(5);
      expect(getBonusPercentage(99.99)).toBe(5);
      expect(getBonusPercentage(100.00)).toBe(10);
      expect(getBonusPercentage(249.99)).toBe(20);
      expect(getBonusPercentage(250.00)).toBe(20);
      expect(getBonusPercentage(499.99)).toBe(20);
      expect(getBonusPercentage(500.00)).toBe(30);
    });
  });

  describe('calculateBonusTokens', () => {
    it('should calculate 5% bonus correctly', () => {
      const baseTokens = 33333.33;
      const result = calculateBonusTokens(baseTokens, 5);
      expect(result).toBeCloseTo(1666.67, 2);
    });

    it('should calculate 10% bonus correctly', () => {
      const baseTokens = 66666.67;
      const result = calculateBonusTokens(baseTokens, 10);
      expect(result).toBeCloseTo(6666.67, 2);
    });

    it('should calculate 20% bonus correctly', () => {
      const baseTokens = 166666.67;
      const result = calculateBonusTokens(baseTokens, 20);
      expect(result).toBeCloseTo(33333.33, 2);
    });

    it('should calculate 30% bonus correctly', () => {
      const baseTokens = 333333.33;
      const result = calculateBonusTokens(baseTokens, 30);
      expect(result).toBeCloseTo(100000, 2);
    });

    it('should return 0 for 0% bonus', () => {
      const result = calculateBonusTokens(100000, 0);
      expect(result).toBe(0);
    });

    it('should handle edge case with 0 base tokens', () => {
      const result = calculateBonusTokens(0, 30);
      expect(result).toBe(0);
    });
  });

  describe('calculateTotalTokens', () => {
    it('should calculate correct total for $50 purchase', () => {
      const result = calculateTotalTokens(50);

      expect(result.usdAmount).toBe(50);
      expect(result.baseTokens).toBeCloseTo(33333.33, 2);
      expect(result.bonusPercentage).toBe(5);
      expect(result.bonusTokens).toBeCloseTo(1666.67, 2);
      expect(result.totalTokens).toBeCloseTo(35000, 2);
    });

    it('should calculate correct total for $100 purchase', () => {
      const result = calculateTotalTokens(100);

      expect(result.usdAmount).toBe(100);
      expect(result.baseTokens).toBeCloseTo(66666.67, 2);
      expect(result.bonusPercentage).toBe(10);
      expect(result.bonusTokens).toBeCloseTo(6666.67, 2);
      expect(result.totalTokens).toBeCloseTo(73333.34, 2);
    });

    it('should calculate correct total for $250 purchase', () => {
      const result = calculateTotalTokens(250);

      expect(result.usdAmount).toBe(250);
      expect(result.baseTokens).toBeCloseTo(166666.67, 2);
      expect(result.bonusPercentage).toBe(20);
      expect(result.bonusTokens).toBeCloseTo(33333.33, 2);
      expect(result.totalTokens).toBeCloseTo(200000, 2);
    });

    it('should calculate correct total for $500 purchase (maximum)', () => {
      const result = calculateTotalTokens(500);

      expect(result.usdAmount).toBe(500);
      expect(result.baseTokens).toBeCloseTo(333333.33, 2);
      expect(result.bonusPercentage).toBe(30);
      expect(result.bonusTokens).toBeCloseTo(100000, 2);
      expect(result.totalTokens).toBeCloseTo(433333.33, 2);
    });

    it('should handle amounts with no bonus', () => {
      const result = calculateTotalTokens(25);

      expect(result.bonusPercentage).toBe(0);
      expect(result.bonusTokens).toBe(0);
      expect(result.totalTokens).toBe(result.baseTokens);
    });

    it('should maintain precision for decimal amounts', () => {
      const result = calculateTotalTokens(99.99);

      expect(result.baseTokens).toBeCloseTo(66660, 2);
      expect(result.bonusPercentage).toBe(5);
      expect(result.totalTokens).toBeCloseTo(69993, 2);
    });
  });

  describe('Vesting Calculations', () => {
    /**
     * Calculate vesting schedule
     */
    const calculateVestingSchedule = (totalTokens: number) => {
      const immediateUnlock = totalTokens * 0.4; // 40%
      const vestedAmount = totalTokens * 0.6; // 60%
      const monthlyUnlock = vestedAmount / 6; // 10% per month

      return {
        totalTokens,
        immediateUnlock,
        vestedAmount,
        monthlyUnlock,
        schedule: Array.from({ length: 6 }, (_, i) => ({
          month: i + 1,
          amount: monthlyUnlock,
          cumulativeUnlocked: immediateUnlock + monthlyUnlock * (i + 1),
        })),
      };
    };

    it('should calculate correct immediate unlock (40%)', () => {
      const schedule = calculateVestingSchedule(433333.33);

      expect(schedule.immediateUnlock).toBeCloseTo(173333.33, 2);
    });

    it('should calculate correct vested amount (60%)', () => {
      const schedule = calculateVestingSchedule(433333.33);

      expect(schedule.vestedAmount).toBeCloseTo(260000, 2);
    });

    it('should calculate correct monthly unlock (10%)', () => {
      const schedule = calculateVestingSchedule(433333.33);

      expect(schedule.monthlyUnlock).toBeCloseTo(43333.33, 2);
    });

    it('should generate 6-month schedule correctly', () => {
      const schedule = calculateVestingSchedule(433333.33);

      expect(schedule.schedule).toHaveLength(6);

      schedule.schedule.forEach((month, i) => {
        expect(month.month).toBe(i + 1);
        expect(month.amount).toBeCloseTo(43333.33, 2);
      });
    });

    it('should calculate cumulative unlocked correctly', () => {
      const schedule = calculateVestingSchedule(433333.33);

      expect(schedule.schedule[0].cumulativeUnlocked).toBeCloseTo(216666.67, 2); // Month 1
      expect(schedule.schedule[5].cumulativeUnlocked).toBeCloseTo(433333.33, 2); // Month 6
    });

    it('should handle edge case with 0 tokens', () => {
      const schedule = calculateVestingSchedule(0);

      expect(schedule.immediateUnlock).toBe(0);
      expect(schedule.vestedAmount).toBe(0);
      expect(schedule.monthlyUnlock).toBe(0);
    });
  });

  describe('Price Formatting', () => {
    const formatUSD = (amount: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    };

    const formatTokens = (amount: number): string => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    };

    it('should format USD amounts correctly', () => {
      expect(formatUSD(50)).toBe('$50.00');
      expect(formatUSD(100)).toBe('$100.00');
      expect(formatUSD(500)).toBe('$500.00');
      expect(formatUSD(99.99)).toBe('$99.99');
    });

    it('should format token amounts with commas', () => {
      expect(formatTokens(33333.33)).toBe('33,333.33');
      expect(formatTokens(433333.33)).toBe('433,333.33');
      expect(formatTokens(1000000)).toBe('1,000,000');
    });

    it('should handle large numbers', () => {
      expect(formatTokens(10000000)).toBe('10,000,000');
      expect(formatUSD(1000000)).toBe('$1,000,000.00');
    });

    it('should handle very small numbers', () => {
      expect(formatTokens(0.01)).toBe('0.01');
      expect(formatUSD(0.01)).toBe('$0.01');
    });
  });

  describe('Performance Tests', () => {
    it('should calculate 1000 transactions in under 100ms', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        calculateTotalTokens(Math.random() * 500 + 50);
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent calculations', async () => {
      const promises = Array.from({ length: 100 }, (_, i) =>
        Promise.resolve(calculateTotalTokens(50 + i * 4.5))
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(100);
      results.forEach((result) => {
        expect(result).toHaveProperty('totalTokens');
        expect(result.totalTokens).toBeGreaterThan(0);
      });
    });
  });

  describe('Boundary and Edge Cases', () => {
    it('should handle floating point precision issues', () => {
      const result = calculateTotalTokens(0.3);
      expect(result.baseTokens).toBeCloseTo(200, 2);
    });

    it('should handle very large purchases', () => {
      const result = calculateTotalTokens(1000000);
      expect(result.totalTokens).toBeGreaterThan(0);
      expect(isFinite(result.totalTokens)).toBe(true);
    });

    it('should handle negative amounts gracefully', () => {
      const result = calculateTotalTokens(-100);
      expect(result.baseTokens).toBeLessThan(0);
    });

    it('should handle NaN inputs', () => {
      const result = calculateTotalTokens(NaN);
      expect(isNaN(result.baseTokens)).toBe(true);
    });

    it('should handle Infinity', () => {
      const result = calculateTotalTokens(Infinity);
      expect(result.baseTokens).toBe(Infinity);
    });

    it('should maintain accuracy across multiple operations', () => {
      // Test compound rounding errors
      let total = 0;
      for (let i = 0; i < 100; i++) {
        const result = calculateTotalTokens(50);
        total += result.totalTokens;
      }

      // Should be close to 35000 * 100 = 3,500,000
      expect(total).toBeCloseTo(3500000, 0);
    });
  });
});
