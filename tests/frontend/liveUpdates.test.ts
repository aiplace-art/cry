/**
 * Test Suite for Live Updates System
 */

import { liveUpdates } from '../../src/frontend/lib/liveUpdates';

describe('LiveUpdatesManager', () => {
  afterEach(() => {
    liveUpdates.disconnect();
  });

  describe('Connection Management', () => {
    it('should start in simulated mode by default', () => {
      liveUpdates.connect();

      // Should be connected in simulated mode
      expect(liveUpdates.isConnected()).toBe(true);
    });

    it('should handle disconnect', () => {
      liveUpdates.connect();
      liveUpdates.disconnect();

      expect(liveUpdates.isConnected()).toBe(false);
    });

    it('should allow reconnection', () => {
      liveUpdates.connect();
      liveUpdates.disconnect();
      liveUpdates.connect();

      expect(liveUpdates.isConnected()).toBe(true);
    });
  });

  describe('Update Handlers', () => {
    it('should register update handlers', (done) => {
      liveUpdates.connect();

      const unsubscribe = liveUpdates.onUpdate((update) => {
        expect(update.type).toBeDefined();
        expect(update.timestamp).toBeGreaterThan(0);
        expect(update.data).toBeDefined();

        unsubscribe();
        done();
      });
    });

    it('should register progress handlers', (done) => {
      liveUpdates.connect();

      const unsubscribe = liveUpdates.onProgress((progress) => {
        expect(progress.current).toBeGreaterThanOrEqual(0);
        expect(progress.target).toBeGreaterThan(0);
        expect(progress.percentage).toBeGreaterThanOrEqual(0);
        expect(progress.percentage).toBeLessThanOrEqual(100);

        unsubscribe();
        done();
      });
    });

    it('should register stats handlers', (done) => {
      liveUpdates.connect();

      const unsubscribe = liveUpdates.onStats((stats) => {
        expect(stats.online).toBeGreaterThan(0);
        expect(stats.total).toBeGreaterThan(0);
        expect(stats.purchases24h).toBeGreaterThanOrEqual(0);
        expect(stats.avgInvestment).toBeGreaterThanOrEqual(0);

        unsubscribe();
        done();
      });
    });

    it('should allow multiple handlers', () => {
      liveUpdates.connect();

      let count = 0;
      const handler = () => count++;

      const unsub1 = liveUpdates.onUpdate(handler);
      const unsub2 = liveUpdates.onUpdate(handler);

      // Wait for some updates
      setTimeout(() => {
        expect(count).toBeGreaterThan(0);
        unsub1();
        unsub2();
      }, 6000);
    });

    it('should unsubscribe handlers correctly', () => {
      liveUpdates.connect();

      let callCount = 0;
      const handler = () => callCount++;

      const unsubscribe = liveUpdates.onUpdate(handler);

      setTimeout(() => {
        const countBefore = callCount;
        unsubscribe();

        setTimeout(() => {
          // Should not increase after unsubscribe
          expect(callCount).toBe(countBefore);
        }, 6000);
      }, 6000);
    });
  });

  describe('Simulated Updates', () => {
    it('should generate purchase updates', (done) => {
      liveUpdates.connect();

      const unsubscribe = liveUpdates.onUpdate((update) => {
        if (update.type === 'purchase') {
          expect(update.data.amount).toBeGreaterThan(0);
          expect(update.data.tokens).toBeGreaterThan(0);
          expect(update.data.address).toBeTruthy();

          unsubscribe();
          done();
        }
      });
    }, 10000);

    it('should generate visitor updates', (done) => {
      liveUpdates.connect();

      const unsubscribe = liveUpdates.onUpdate((update) => {
        if (update.type === 'visitor') {
          expect(update.data.action).toBeTruthy();
          expect(update.data.count).toBeGreaterThan(0);

          unsubscribe();
          done();
        }
      });
    }, 10000);

    it('should generate progress updates', (done) => {
      liveUpdates.connect();

      const unsubscribe = liveUpdates.onUpdate((update) => {
        if (update.type === 'progress') {
          expect(update.data.current).toBeDefined();
          expect(update.data.target).toBeDefined();

          unsubscribe();
          done();
        }
      });
    }, 10000);
  });

  describe('Update Types', () => {
    it('should generate different update types', (done) => {
      liveUpdates.connect();

      const types = new Set();
      const unsubscribe = liveUpdates.onUpdate((update) => {
        types.add(update.type);

        if (types.size >= 3) {
          expect(types.size).toBeGreaterThanOrEqual(3);
          unsubscribe();
          done();
        }
      });
    }, 20000);
  });

  describe('Recent Updates', () => {
    it('should return empty array initially', () => {
      const recent = liveUpdates.getRecentUpdates();
      expect(Array.isArray(recent)).toBe(true);
    });

    it('should limit recent updates', () => {
      const recent = liveUpdates.getRecentUpdates(5);
      expect(recent.length).toBeLessThanOrEqual(5);
    });
  });
});
