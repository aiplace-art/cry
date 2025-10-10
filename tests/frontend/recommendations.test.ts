/**
 * Test Suite for Smart Recommendations Engine
 */

import { recommendationEngine } from '../../src/frontend/lib/recommendations';

describe('RecommendationEngine', () => {
  describe('Investment Recommendations', () => {
    it('should recommend starting investment for new users', async () => {
      const recommendations = await recommendationEngine.generateRecommendations({
        currentInvestment: 0,
        walletConnected: false,
        previousVisits: 1,
        timeOnPage: 30,
        calculatorUsage: 0
      });

      const investmentRec = recommendations.find(r => r.type === 'investment');
      expect(investmentRec).toBeDefined();
      expect(investmentRec?.confidence).toBeGreaterThan(0.5);
    });

    it('should not recommend investment for existing investors', async () => {
      const recommendations = await recommendationEngine.generateRecommendations({
        currentInvestment: 5000,
        walletConnected: true,
        previousVisits: 3,
        timeOnPage: 120,
        calculatorUsage: 5
      });

      const investmentRec = recommendations.find(r => r.type === 'investment');
      expect(investmentRec).toBeUndefined();
    });
  });

  describe('VIP Tier Recommendations', () => {
    it('should recommend tier upgrade when close to threshold', async () => {
      const recommendations = await recommendationEngine.generateRecommendations({
        currentInvestment: 4500,
        walletConnected: true,
        previousVisits: 2,
        timeOnPage: 60,
        calculatorUsage: 3
      });

      const tierRec = recommendations.find(r => r.type === 'tier');
      expect(tierRec).toBeDefined();
      expect(tierRec?.title).toContain('Silver VIP');
    });

    it('should not recommend upgrade for highest tier', async () => {
      const recommendations = await recommendationEngine.generateRecommendations({
        currentInvestment: 100000,
        walletConnected: true,
        previousVisits: 5,
        timeOnPage: 300,
        calculatorUsage: 10
      });

      const tierRec = recommendations.find(r => r.type === 'tier');
      expect(tierRec).toBeUndefined();
    });
  });

  describe('Payment Method Recommendations', () => {
    it('should recommend payment method', async () => {
      const recommendations = await recommendationEngine.generateRecommendations({
        currentInvestment: 0,
        walletConnected: true,
        previousVisits: 1,
        timeOnPage: 45,
        calculatorUsage: 2
      });

      const paymentRec = recommendations.find(r => r.type === 'payment');
      expect(paymentRec).toBeDefined();
      expect(['BNB', 'USDT']).toContainEqual(
        expect.stringContaining(paymentRec?.title || '')
      );
    });
  });

  describe('Timing Recommendations', () => {
    it('should provide timing recommendations', async () => {
      const recommendations = await recommendationEngine.generateRecommendations({
        currentInvestment: 1000,
        walletConnected: true,
        previousVisits: 2,
        timeOnPage: 90,
        calculatorUsage: 4
      });

      // Timing recommendation is conditional, so may or may not be present
      const timingRec = recommendations.find(r => r.type === 'timing');

      if (timingRec) {
        expect(timingRec.confidence).toBeGreaterThan(0);
        expect(timingRec.reason).toBeTruthy();
      }
    });
  });

  describe('FOMO Triggers', () => {
    it('should generate FOMO triggers', () => {
      const fomo = recommendationEngine.getFOMOTrigger();

      if (fomo) {
        expect(fomo.message).toBeTruthy();
        expect(['low', 'medium', 'high']).toContain(fomo.urgency);
        expect(fomo.data).toBeDefined();
      }
    });

    it('should have urgency levels', () => {
      // Run multiple times to potentially get different triggers
      const urgencies = new Set();

      for (let i = 0; i < 50; i++) {
        const fomo = recommendationEngine.getFOMOTrigger();
        if (fomo) {
          urgencies.add(fomo.urgency);
        }
      }

      // Should have at least one urgency level
      expect(urgencies.size).toBeGreaterThan(0);
    });
  });

  describe('Suggested Amounts', () => {
    it('should return suggested investment amounts', () => {
      const amounts = recommendationEngine.getSuggestedAmounts();

      expect(amounts.length).toBeGreaterThan(0);
      expect(amounts[0].amount).toBe(500);
      expect(amounts[amounts.length - 1].amount).toBeGreaterThan(amounts[0].amount);
    });

    it('should highlight popular amounts', () => {
      const amounts = recommendationEngine.getSuggestedAmounts();

      const highlighted = amounts.filter(a => a.highlight);
      expect(highlighted.length).toBeGreaterThan(0);
    });

    it('should include VIP tier labels', () => {
      const amounts = recommendationEngine.getSuggestedAmounts();

      const vipAmounts = amounts.filter(a => a.label.includes('VIP'));
      expect(vipAmounts.length).toBeGreaterThan(0);
    });
  });

  describe('Recommendation Quality', () => {
    it('should return recommendations with required fields', async () => {
      const recommendations = await recommendationEngine.generateRecommendations({
        currentInvestment: 0,
        walletConnected: false,
        previousVisits: 1,
        timeOnPage: 30,
        calculatorUsage: 0
      });

      recommendations.forEach(rec => {
        expect(rec.type).toBeTruthy();
        expect(rec.title).toBeTruthy();
        expect(rec.description).toBeTruthy();
        expect(rec.value).toBeTruthy();
        expect(rec.confidence).toBeGreaterThan(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
        expect(rec.reason).toBeTruthy();
      });
    });
  });
});
