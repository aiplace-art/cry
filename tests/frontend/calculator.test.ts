/**
 * Test Suite for Smart Price Calculator
 */

import { priceCalculator, VIP_TIERS, formatCurrency, formatTokens, formatPercentage } from '../../src/frontend/lib/calculator';

describe('PriceCalculator', () => {
  describe('BNB Price Fetching', () => {
    it('should fetch BNB price from CoinGecko', async () => {
      const price = await priceCalculator.fetchBNBPrice();
      expect(price).toBeGreaterThan(0);
      expect(typeof price).toBe('number');
    });

    it('should cache BNB price', async () => {
      const price1 = await priceCalculator.fetchBNBPrice();
      const price2 = await priceCalculator.fetchBNBPrice();
      expect(price1).toBe(price2);
    });

    it('should handle API errors gracefully', async () => {
      // Mock fetch to throw error
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

      const price = await priceCalculator.fetchBNBPrice();
      expect(price).toBeGreaterThan(0); // Should return fallback
    });
  });

  describe('USD Calculations', () => {
    it('should calculate tokens from USD amount', async () => {
      const result = await priceCalculator.calculateFromUSD(1000);

      expect(result.usdtAmount).toBe(1000);
      expect(result.hypeaiTokens).toBeGreaterThan(0);
      expect(result.bonusTokens).toBeGreaterThan(0);
      expect(result.totalTokens).toBe(result.hypeaiTokens + result.bonusTokens);
    });

    it('should apply base 10% bonus for small investments', async () => {
      const result = await priceCalculator.calculateFromUSD(100);

      const expectedBonus = result.hypeaiTokens * 0.1;
      expect(result.bonusTokens).toBeCloseTo(expectedBonus, 2);
    });

    it('should apply VIP tier bonuses correctly', async () => {
      const result = await priceCalculator.calculateFromUSD(10000);

      expect(result.vipTier).not.toBeNull();
      expect(result.vipTier?.name).toBe('Gold VIP');
      expect(result.bonusTokens).toBe(result.hypeaiTokens * 0.15);
    });
  });

  describe('BNB Calculations', () => {
    it('should calculate tokens from BNB amount', async () => {
      const result = await priceCalculator.calculateFromBNB(1);

      expect(result.bnbAmount).toBe(1);
      expect(result.usdtAmount).toBeGreaterThan(0);
      expect(result.totalTokens).toBeGreaterThan(0);
    });

    it('should convert BNB to USD correctly', async () => {
      const bnbPrice = await priceCalculator.fetchBNBPrice();
      const result = await priceCalculator.calculateFromBNB(5);

      expect(result.usdtAmount).toBeCloseTo(5 * bnbPrice, 2);
    });
  });

  describe('VIP Tier System', () => {
    it('should return null for investments below VIP threshold', () => {
      const tier = priceCalculator.getVIPTier(1000);
      expect(tier).toBeNull();
    });

    it('should identify Silver VIP tier', () => {
      const tier = priceCalculator.getVIPTier(5000);
      expect(tier?.name).toBe('Silver VIP');
      expect(tier?.bonusPercentage).toBe(12);
    });

    it('should identify Gold VIP tier', () => {
      const tier = priceCalculator.getVIPTier(15000);
      expect(tier?.name).toBe('Gold VIP');
      expect(tier?.bonusPercentage).toBe(15);
    });

    it('should identify Platinum VIP tier', () => {
      const tier = priceCalculator.getVIPTier(30000);
      expect(tier?.name).toBe('Platinum VIP');
      expect(tier?.bonusPercentage).toBe(20);
    });

    it('should identify Diamond VIP tier', () => {
      const tier = priceCalculator.getVIPTier(75000);
      expect(tier?.name).toBe('Diamond VIP');
      expect(tier?.bonusPercentage).toBe(25);
    });

    it('should have tiers sorted by priority', () => {
      for (let i = 0; i < VIP_TIERS.length - 1; i++) {
        expect(VIP_TIERS[i].priority).toBeLessThan(VIP_TIERS[i + 1].priority);
      }
    });
  });

  describe('ROI Projections', () => {
    it('should calculate positive ROI projections', async () => {
      const result = await priceCalculator.calculateFromUSD(1000);

      expect(result.roi.week1).toBeGreaterThan(0);
      expect(result.roi.month1).toBeGreaterThan(0);
      expect(result.roi.month6).toBeGreaterThan(0);
    });

    it('should show increasing ROI over time', async () => {
      const result = await priceCalculator.calculateFromUSD(1000);

      expect(result.roi.month1).toBeGreaterThan(result.roi.week1);
      expect(result.roi.month6).toBeGreaterThan(result.roi.month1);
    });
  });

  describe('Next Tier Recommendations', () => {
    it('should recommend next tier for eligible investments', () => {
      const rec = priceCalculator.getNextTierRecommendation(3000);

      expect(rec.nextTier).not.toBeNull();
      expect(rec.nextTier?.name).toBe('Silver VIP');
      expect(rec.additionalNeeded).toBeGreaterThan(0);
    });

    it('should return zero additional for tier threshold', () => {
      const rec = priceCalculator.getNextTierRecommendation(5000);

      expect(rec.additionalNeeded).toBe(0);
    });

    it('should return null for highest tier', () => {
      const rec = priceCalculator.getNextTierRecommendation(100000);

      expect(rec.nextTier).toBeNull();
    });
  });

  describe('Suggested Amounts', () => {
    it('should return suggested amounts with tiers', () => {
      const amounts = priceCalculator.getSuggestedAmounts();

      expect(amounts.length).toBeGreaterThan(0);
      amounts.forEach(item => {
        expect(item.amount).toBeGreaterThan(0);
        expect(item.tier).toBeDefined();
      });
    });
  });

  describe('Formatting Functions', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format tokens correctly', () => {
      expect(formatTokens(1000000)).toBe('1,000,000');
      expect(formatTokens(1234.567)).toBe('1,234.57');
    });

    it('should format percentages correctly', () => {
      expect(formatPercentage(50)).toBe('+50.00%');
      expect(formatPercentage(-25)).toBe('-25.00%');
    });
  });
});
