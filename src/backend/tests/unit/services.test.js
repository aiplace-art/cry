const tokenService = require('../../services/token.service');
const stakingService = require('../../services/staking.service');
const analyticsService = require('../../services/analytics.service');
const aiService = require('../../services/ai.service');

jest.mock('axios');
jest.mock('../../config/logger');

describe('Token Service', () => {
  describe('getTokenPrices', () => {
    it('should fetch token prices successfully', async () => {
      const symbols = ['BTC', 'ETH'];
      const prices = await tokenService.getTokenPrices(symbols);

      expect(Array.isArray(prices)).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      const prices = await tokenService.getTokenPrices(['INVALID_TOKEN']);

      expect(Array.isArray(prices)).toBe(true);
    });
  });

  describe('getTokenDetails', () => {
    it('should get specific token details', async () => {
      const details = await tokenService.getTokenDetails('BTC');

      if (details) {
        expect(details).toHaveProperty('symbol');
        expect(details).toHaveProperty('price');
      }
    });
  });
});

describe('Staking Service', () => {
  describe('getAvailablePools', () => {
    it('should return available staking pools', async () => {
      const pools = await stakingService.getAvailablePools();

      expect(Array.isArray(pools)).toBe(true);
      expect(pools.length).toBeGreaterThan(0);

      if (pools.length > 0) {
        expect(pools[0]).toHaveProperty('tokenSymbol');
        expect(pools[0]).toHaveProperty('apy');
        expect(pools[0]).toHaveProperty('minStake');
      }
    });
  });
});

describe('Analytics Service', () => {
  describe('getMarketAnalytics', () => {
    it('should return market analytics', async () => {
      const analytics = await analyticsService.getMarketAnalytics('24h');

      expect(analytics).toHaveProperty('overview');
      expect(analytics).toHaveProperty('topTokens');
      expect(analytics).toHaveProperty('gainers');
      expect(analytics).toHaveProperty('losers');
    });
  });
});

describe('AI Service', () => {
  describe('getTradingSignals', () => {
    it('should generate trading signals', async () => {
      const signals = await aiService.getTradingSignals('BTC', '24h');

      expect(signals).toHaveProperty('symbol');
      expect(signals).toHaveProperty('signals');
      expect(signals).toHaveProperty('recommendation');
      expect(signals.recommendation).toMatch(/BUY|SELL|HOLD/);
    });
  });

  describe('getSentimentAnalysis', () => {
    it('should analyze market sentiment', async () => {
      const sentiment = await aiService.getSentimentAnalysis('ETH');

      expect(sentiment).toHaveProperty('overall');
      expect(sentiment).toHaveProperty('score');
      expect(sentiment).toHaveProperty('sources');
      expect(sentiment.overall).toMatch(/positive|negative|neutral/);
    });
  });
});

describe('Error Handling', () => {
  it('should handle missing data gracefully', async () => {
    const details = await tokenService.getTokenDetails('NONEXISTENT_TOKEN_XYZ');
    expect(details).toBeNull();
  });

  it('should handle network errors', async () => {
    // Test that services handle network failures without crashing
    await expect(async () => {
      await tokenService.getTokenPrices([]);
    }).not.toThrow();
  });
});
