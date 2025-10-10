/**
 * Test Suite for Analytics System
 */

import { analytics } from '../../src/frontend/lib/analytics';

describe('AnalyticsTracker', () => {
  beforeEach(() => {
    // Clear storage before each test
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Session Management', () => {
    it('should create a new session on init', () => {
      expect(analytics).toBeDefined();
      const duration = analytics.getSessionDuration();
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should track session duration', async () => {
      const duration1 = analytics.getSessionDuration();

      // Wait 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      const duration2 = analytics.getSessionDuration();
      expect(duration2).toBeGreaterThan(duration1);
    });
  });

  describe('Event Tracking', () => {
    it('should track custom events', () => {
      const trackSpy = jest.spyOn(console, 'log');
      analytics.track('test_event', { foo: 'bar' });

      expect(trackSpy).toHaveBeenCalledWith(
        '[Analytics]',
        'test_event',
        { foo: 'bar' }
      );
    });

    it('should track page views', () => {
      analytics.trackPageView('/presale', 'https://google.com');

      const funnel = analytics.getFunnelData();
      const pageViews = funnel.find(s => s.name === 'Page Views');
      expect(pageViews?.count).toBeGreaterThan(0);
    });

    it('should track wallet connections', () => {
      analytics.trackWalletConnection('0x1234567890', 'MetaMask');

      const funnel = analytics.getFunnelData();
      const walletConnected = funnel.find(s => s.name === 'Wallet Connected');
      expect(walletConnected?.count).toBeGreaterThan(0);
    });

    it('should track purchase attempts', () => {
      analytics.trackPurchaseAttempt(1000, 'USDT');

      const funnel = analytics.getFunnelData();
      const initiated = funnel.find(s => s.name === 'Purchase Initiated');
      expect(initiated?.count).toBeGreaterThan(0);
    });

    it('should track successful purchases', () => {
      analytics.trackPurchaseSuccess('0xabcdef', 1000, 5000000);

      const funnel = analytics.getFunnelData();
      const completed = funnel.find(s => s.name === 'Purchase Completed');
      expect(completed?.count).toBeGreaterThan(0);
    });

    it('should track calculator usage', () => {
      analytics.trackCalculatorUsage(1000, 'USD', { totalTokens: 5000000 });

      const funnel = analytics.getFunnelData();
      const calculatorUsed = funnel.find(s => s.name === 'Calculator Used');
      expect(calculatorUsed?.count).toBeGreaterThan(0);
    });

    it('should track errors', () => {
      const error = new Error('Test error');
      analytics.trackError(error, 'test_context');

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Conversion Funnel', () => {
    it('should calculate funnel stages', () => {
      analytics.trackPageView('/presale');
      analytics.trackCalculatorUsage(1000, 'USD', {});
      analytics.trackWalletConnection('0x123', 'MetaMask');

      const funnel = analytics.getFunnelData();

      expect(funnel.length).toBe(5);
      expect(funnel[0].name).toBe('Page Views');
      expect(funnel[1].name).toBe('Calculator Used');
      expect(funnel[2].name).toBe('Wallet Connected');
    });

    it('should calculate conversion percentages', () => {
      analytics.trackPageView('/presale');
      analytics.trackCalculatorUsage(1000, 'USD', {});

      const funnel = analytics.getFunnelData();

      funnel.forEach(stage => {
        expect(stage.percentage).toBeGreaterThanOrEqual(0);
        expect(stage.percentage).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Visitor Statistics', () => {
    it('should return visitor stats', () => {
      const stats = analytics.getVisitorStats();

      expect(stats.online).toBeGreaterThan(0);
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.purchases24h).toBeGreaterThanOrEqual(0);
      expect(stats.avgInvestment).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data Persistence', () => {
    it('should persist events to localStorage', () => {
      analytics.track('test_persist');
      analytics.flush();

      const stored = localStorage.getItem('hypeai_analytics');
      expect(stored).not.toBeNull();

      const data = JSON.parse(stored!);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should limit stored events to 1000', () => {
      // Track many events
      for (let i = 0; i < 1100; i++) {
        analytics.track(`event_${i}`);
      }

      analytics.flush();

      const stored = localStorage.getItem('hypeai_analytics');
      const data = JSON.parse(stored!);

      expect(data.length).toBeLessThanOrEqual(1000);
    });
  });
});
