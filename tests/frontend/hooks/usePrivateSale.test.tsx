/**
 * usePrivateSale Hook Test Suite
 * Tests for private sale calculations, purchases, and state management
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { usePrivateSale } from '../../../src/frontend/hooks/usePrivateSale';

// Mock payment config
jest.mock('../../../src/frontend/lib/payment-config', () => ({
  PRIVATE_SALE_CONFIG: {
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    targetAmount: 1000000,
    tokenPrice: 0.05,
    minPurchase: 100,
    maxPurchase: 100000,
    bonusTiers: [
      { minAmount: 10000, bonus: 30 },
      { minAmount: 5000, bonus: 25 },
      { minAmount: 1000, bonus: 20 },
      { minAmount: 100, bonus: 0 },
    ],
  },
}));

describe('usePrivateSale Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    test('should initialize with correct config', () => {
      const { result } = renderHook(() => usePrivateSale());

      expect(result.current.config.tokenPrice).toBe(0.05);
      expect(result.current.config.minPurchase).toBe(100);
      expect(result.current.config.maxPurchase).toBe(100000);
      expect(result.current.config.currentAmount).toBe(0);
    });

    test('should start with empty purchases array', () => {
      const { result } = renderHook(() => usePrivateSale());
      expect(result.current.purchases).toEqual([]);
    });

    test('should not be loading initially', () => {
      const { result } = renderHook(() => usePrivateSale());
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Token Calculations', () => {
    test('should calculate tokens correctly without bonus', () => {
      const { result } = renderHook(() => usePrivateSale());

      const calculation = result.current.calculateTokens(100);

      expect(calculation.usdAmount).toBe(100);
      expect(calculation.baseTokens).toBe(2000); // 100 / 0.05
      expect(calculation.bonusPercentage).toBe(0);
      expect(calculation.bonusTokens).toBe(0);
      expect(calculation.totalTokens).toBe(2000);
    });

    test('should calculate tokens with 20% bonus', () => {
      const { result } = renderHook(() => usePrivateSale());

      const calculation = result.current.calculateTokens(1000);

      expect(calculation.baseTokens).toBe(20000); // 1000 / 0.05
      expect(calculation.bonusPercentage).toBe(20);
      expect(calculation.bonusTokens).toBe(4000); // 20000 * 0.2
      expect(calculation.totalTokens).toBe(24000);
    });

    test('should calculate tokens with 25% bonus', () => {
      const { result } = renderHook(() => usePrivateSale());

      const calculation = result.current.calculateTokens(5000);

      expect(calculation.bonusPercentage).toBe(25);
      expect(calculation.bonusTokens).toBe(25000); // 100000 * 0.25
      expect(calculation.totalTokens).toBe(125000);
    });

    test('should calculate tokens with 30% bonus', () => {
      const { result } = renderHook(() => usePrivateSale());

      const calculation = result.current.calculateTokens(10000);

      expect(calculation.bonusPercentage).toBe(30);
      expect(calculation.bonusTokens).toBe(60000); // 200000 * 0.3
      expect(calculation.totalTokens).toBe(260000);
    });

    test('should handle decimal amounts', () => {
      const { result } = renderHook(() => usePrivateSale());

      const calculation = result.current.calculateTokens(250.50);

      expect(calculation.baseTokens).toBe(5010); // 250.50 / 0.05
      expect(calculation.totalTokens).toBeGreaterThan(0);
    });
  });

  describe('Time Remaining', () => {
    test('should calculate time remaining correctly', () => {
      const { result } = renderHook(() => usePrivateSale());

      // Set current time to middle of sale period
      jest.setSystemTime(new Date('2025-06-01'));

      const timeRemaining = result.current.getTimeRemaining();

      expect(timeRemaining.expired).toBe(false);
      expect(timeRemaining.days).toBeGreaterThan(0);
    });

    test('should return expired when sale ended', () => {
      const { result } = renderHook(() => usePrivateSale());

      // Set current time after sale end
      jest.setSystemTime(new Date('2026-01-01'));

      const timeRemaining = result.current.getTimeRemaining();

      expect(timeRemaining.expired).toBe(true);
      expect(timeRemaining.days).toBe(0);
      expect(timeRemaining.hours).toBe(0);
    });
  });

  describe('Progress Calculation', () => {
    test('should calculate progress percentage', () => {
      const { result } = renderHook(() => usePrivateSale());

      // Initially 0%
      expect(result.current.getProgress()).toBe(0);
    });

    test('should update progress after purchase', async () => {
      const { result } = renderHook(() => usePrivateSale());

      await act(async () => {
        await result.current.processPurchase(
          1000,
          { id: 'bnb', symbol: 'BNB' } as any,
          '0x1234567890123456789012345678901234567890'
        );
      });

      await waitFor(() => {
        const progress = result.current.getProgress();
        expect(progress).toBeGreaterThan(0);
      });
    });
  });

  describe('Purchase Processing', () => {
    test('should process purchase successfully', async () => {
      const { result } = renderHook(() => usePrivateSale());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.processPurchase(
          1000,
          { id: 'bnb', symbol: 'BNB' } as any,
          '0x1234567890123456789012345678901234567890'
        );
      });

      expect(purchaseResult).toMatchObject({
        success: true,
        transactionHash: expect.any(String),
        tokensReceived: expect.any(Number),
      });
    });

    test('should reject purchase below minimum', async () => {
      const { result } = renderHook(() => usePrivateSale());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.processPurchase(
          50, // Below minimum
          { id: 'bnb', symbol: 'BNB' } as any,
          '0x1234567890123456789012345678901234567890'
        );
      });

      expect(purchaseResult).toMatchObject({
        success: false,
        error: expect.stringContaining('Minimum purchase'),
      });
    });

    test('should reject purchase above maximum', async () => {
      const { result } = renderHook(() => usePrivateSale());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.processPurchase(
          150000, // Above maximum
          { id: 'bnb', symbol: 'BNB' } as any,
          '0x1234567890123456789012345678901234567890'
        );
      });

      expect(purchaseResult).toMatchObject({
        success: false,
        error: expect.stringContaining('Maximum purchase'),
      });
    });

    test('should set loading state during purchase', async () => {
      const { result } = renderHook(() => usePrivateSale());

      act(() => {
        result.current.processPurchase(
          1000,
          { id: 'bnb', symbol: 'BNB' } as any,
          '0x1234567890123456789012345678901234567890'
        );
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    test('should add purchase to history', async () => {
      const { result } = renderHook(() => usePrivateSale());

      await act(async () => {
        await result.current.processPurchase(
          1000,
          { id: 'bnb', symbol: 'BNB' } as any,
          '0x1234567890123456789012345678901234567890'
        );
      });

      await waitFor(() => {
        expect(result.current.purchases.length).toBe(1);
      });

      expect(result.current.purchases[0]).toMatchObject({
        amount: 1000,
        currency: 'BNB',
        status: 'completed',
      });
    });

    test('should enforce rate limiting', async () => {
      const { result } = renderHook(() => usePrivateSale());

      // First purchase
      await act(async () => {
        await result.current.processPurchase(
          1000,
          { id: 'bnb', symbol: 'BNB' } as any,
          '0x1234567890123456789012345678901234567890'
        );
      });

      // Immediate second purchase (should be rate limited)
      let secondPurchase;
      await act(async () => {
        secondPurchase = await result.current.processPurchase(
          1000,
          { id: 'bnb', symbol: 'BNB' } as any,
          '0x1234567890123456789012345678901234567890'
        );
      });

      expect(secondPurchase).toMatchObject({
        success: false,
        error: expect.stringContaining('wait'),
      });
    });
  });

  describe('Referral Links', () => {
    test('should generate referral link', () => {
      const { result } = renderHook(() => usePrivateSale());

      const referralLink = result.current.getReferralLink(
        '0x1234567890123456789012345678901234567890'
      );

      expect(referralLink).toContain('ref=0x1234567890123456789012345678901234567890');
      expect(referralLink).toContain('/private-sale');
    });
  });

  describe('Load Purchases', () => {
    test('should load user purchases', async () => {
      const { result } = renderHook(() => usePrivateSale());

      await act(async () => {
        await result.current.loadPurchases('0x1234567890123456789012345678901234567890');
      });

      // Should not throw error
      expect(result.current.purchases).toBeDefined();
    });

    test('should handle load purchases error gracefully', async () => {
      // Mock fetch failure
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => usePrivateSale());

      await act(async () => {
        await result.current.loadPurchases('0x1234567890123456789012345678901234567890');
      });

      // Should not crash
      expect(result.current.purchases).toEqual([]);
    });
  });
});
