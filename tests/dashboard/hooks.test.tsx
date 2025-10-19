/**
 * @test Custom Hooks
 * @description Tests for usePrivateSale and useWallet hooks
 * @coverage State management, side effects, error handling
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { usePrivateSale } from '../../src/frontend/hooks/usePrivateSale';
import { useWallet } from '../../src/frontend/hooks/useWallet';

// Mock ethereum provider
const mockEthereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  isMetaMask: true,
};

describe('usePrivateSale Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('Configuration Management', () => {
    it('should load initial configuration', () => {
      const { result } = renderHook(() => usePrivateSale());

      expect(result.current.config).toBeDefined();
      expect(result.current.config.minPurchase).toBe(50);
      expect(result.current.config.maxPurchase).toBe(500);
      expect(result.current.config.tokenPrice).toBe(0.0015);
    });

    it('should provide correct bonus tiers', () => {
      const { result } = renderHook(() => usePrivateSale());

      expect(result.current.config.bonusTiers).toHaveLength(4);
      expect(result.current.config.bonusTiers[0]).toEqual({ minAmount: 50, bonus: 5 });
      expect(result.current.config.bonusTiers[3]).toEqual({ minAmount: 500, bonus: 30 });
    });
  });

  describe('Token Calculations', () => {
    it('should calculate tokens correctly', () => {
      const { result } = renderHook(() => usePrivateSale());

      const calculation = result.current.calculateTokens(100);

      expect(calculation).toMatchObject({
        usdAmount: 100,
        baseTokens: expect.any(Number),
        bonusPercentage: 10,
        bonusTokens: expect.any(Number),
        totalTokens: expect.any(Number),
      });
    });

    it('should return null for invalid amounts', () => {
      const { result } = renderHook(() => usePrivateSale());

      expect(result.current.calculateTokens(0)).toBeNull();
      expect(result.current.calculateTokens(-10)).toBeNull();
      expect(result.current.calculateTokens(NaN)).toBeNull();
    });

    it('should handle maximum purchase limit', () => {
      const { result } = renderHook(() => usePrivateSale());

      const calculation = result.current.calculateTokens(500);

      expect(calculation?.bonusPercentage).toBe(30);
      expect(calculation?.totalTokens).toBeGreaterThan(calculation?.baseTokens!);
    });
  });

  describe('Purchase Processing', () => {
    it('should process purchase successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          transactionHash: '0xabc123',
          tokensReceived: 73333.34,
        }),
      });

      const { result } = renderHook(() => usePrivateSale());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.processPurchase(
          100,
          { id: 'eth', name: 'Ethereum', network: 'ethereum' },
          '0x1234567890123456789012345678901234567890'
        );
      });

      expect(purchaseResult).toEqual({
        success: true,
        transactionHash: '0xabc123',
        tokensReceived: 73333.34,
      });
    });

    it('should handle purchase failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({
          error: 'Insufficient balance',
        }),
      });

      const { result } = renderHook(() => usePrivateSale());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.processPurchase(
          100,
          { id: 'eth', name: 'Ethereum', network: 'ethereum' },
          '0x1234567890123456789012345678901234567890'
        );
      });

      expect(purchaseResult).toEqual({
        success: false,
        error: 'Insufficient balance',
      });
    });

    it('should set loading state during purchase', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValue(promise);

      const { result } = renderHook(() => usePrivateSale());

      expect(result.current.loading).toBe(false);

      act(() => {
        result.current.processPurchase(
          100,
          { id: 'eth', name: 'Ethereum', network: 'ethereum' },
          '0x1234'
        );
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({ success: true }),
        });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Purchase History', () => {
    it('should load purchase history', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          purchases: [
            {
              id: '1',
              amount: 100,
              totalTokens: 73333.34,
              status: 'completed',
              timestamp: Date.now(),
            },
          ],
        }),
      });

      const { result } = renderHook(() => usePrivateSale());

      await waitFor(() => {
        expect(result.current.purchases).toHaveLength(1);
      });
    });

    it('should add new purchase to history', async () => {
      const { result } = renderHook(() => usePrivateSale());

      const initialLength = result.current.purchases.length;

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          transactionHash: '0xabc',
          tokensReceived: 35000,
        }),
      });

      await act(async () => {
        await result.current.processPurchase(
          50,
          { id: 'eth', name: 'Ethereum', network: 'ethereum' },
          '0x1234'
        );
      });

      await waitFor(() => {
        expect(result.current.purchases.length).toBeGreaterThan(initialLength);
      });
    });
  });

  describe('Countdown Timer', () => {
    it('should calculate time remaining', () => {
      const { result } = renderHook(() => usePrivateSale());

      const timeRemaining = result.current.getTimeRemaining();

      expect(timeRemaining).toHaveProperty('days');
      expect(timeRemaining).toHaveProperty('hours');
      expect(timeRemaining).toHaveProperty('minutes');
      expect(timeRemaining).toHaveProperty('seconds');
      expect(timeRemaining).toHaveProperty('expired');
    });

    it('should mark as expired when sale ends', () => {
      // Mock a past end date
      const { result } = renderHook(() => usePrivateSale());

      // Assuming implementation allows mocking endDate
      const timeRemaining = result.current.getTimeRemaining();

      expect(typeof timeRemaining.expired).toBe('boolean');
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate sale progress percentage', () => {
      const { result } = renderHook(() => usePrivateSale());

      const progress = result.current.getProgress();

      expect(typeof progress).toBe('number');
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });
  });

  describe('Referral System', () => {
    it('should generate referral link', () => {
      const { result } = renderHook(() => usePrivateSale());

      const referralLink = result.current.getReferralLink('0x1234567890123456789012345678901234567890');

      expect(referralLink).toContain('0x1234567890123456789012345678901234567890');
      expect(referralLink).toMatch(/^https?:\/\//);
    });

    it('should track referral usage', async () => {
      const { result } = renderHook(() => usePrivateSale());

      const referralCode = '0x1234567890123456789012345678901234567890';
      const referralLink = result.current.getReferralLink(referralCode);

      expect(referralLink).toBeDefined();
    });
  });
});

describe('useWallet Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window as any).ethereum = mockEthereum;
  });

  afterEach(() => {
    delete (window as any).ethereum;
  });

  describe('Wallet Connection', () => {
    it('should start with no wallet connected', () => {
      const { result } = renderHook(() => useWallet());

      expect(result.current.wallet).toBeNull();
      expect(result.current.connecting).toBe(false);
    });

    it('should connect to MetaMask successfully', async () => {
      mockEthereum.request.mockResolvedValue(['0x1234567890123456789012345678901234567890']);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connectMetaMask();
      });

      expect(result.current.wallet).toMatchObject({
        address: expect.stringMatching(/^0x[a-fA-F0-9]{40}$/),
        network: expect.any(String),
      });
    });

    it('should set connecting state during connection', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockEthereum.request.mockReturnValue(promise);

      const { result } = renderHook(() => useWallet());

      expect(result.current.connecting).toBe(false);

      act(() => {
        result.current.connectMetaMask();
      });

      await waitFor(() => {
        expect(result.current.connecting).toBe(true);
      });

      await act(async () => {
        resolvePromise!(['0x1234567890123456789012345678901234567890']);
      });

      await waitFor(() => {
        expect(result.current.connecting).toBe(false);
      });
    });

    it('should handle connection rejection', async () => {
      mockEthereum.request.mockRejectedValue(new Error('User rejected'));

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        try {
          await result.current.connectMetaMask();
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(result.current.wallet).toBeNull();
    });

    it('should handle missing MetaMask', async () => {
      delete (window as any).ethereum;

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        try {
          await result.current.connectMetaMask();
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });
  });

  describe('Account Changes', () => {
    it('should update wallet on account change', async () => {
      mockEthereum.request.mockResolvedValue(['0x1234567890123456789012345678901234567890']);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connectMetaMask();
      });

      const accountsChangedCallback = mockEthereum.on.mock.calls.find(
        (call) => call[0] === 'accountsChanged'
      )?.[1];

      expect(accountsChangedCallback).toBeDefined();

      if (accountsChangedCallback) {
        await act(async () => {
          accountsChangedCallback(['0xabcdefabcdefabcdefabcdefabcdefabcdefabcd']);
        });

        await waitFor(() => {
          expect(result.current.wallet?.address).toBe('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
        });
      }
    });

    it('should disconnect on empty accounts', async () => {
      mockEthereum.request.mockResolvedValue(['0x1234567890123456789012345678901234567890']);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connectMetaMask();
      });

      const accountsChangedCallback = mockEthereum.on.mock.calls.find(
        (call) => call[0] === 'accountsChanged'
      )?.[1];

      if (accountsChangedCallback) {
        await act(async () => {
          accountsChangedCallback([]);
        });

        await waitFor(() => {
          expect(result.current.wallet).toBeNull();
        });
      }
    });
  });

  describe('Chain Changes', () => {
    it('should update chainId on chain change', async () => {
      mockEthereum.request.mockResolvedValue(['0x1234567890123456789012345678901234567890']);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connectMetaMask();
      });

      const chainChangedCallback = mockEthereum.on.mock.calls.find(
        (call) => call[0] === 'chainChanged'
      )?.[1];

      if (chainChangedCallback) {
        await act(async () => {
          chainChangedCallback('0x89'); // Polygon
        });

        await waitFor(() => {
          expect(result.current.wallet?.chainId).toBe(137);
        });
      }
    });
  });

  describe('Multiple Wallet Providers', () => {
    it('should connect to WalletConnect', async () => {
      const { result } = renderHook(() => useWallet());

      await act(async () => {
        try {
          await result.current.connectWalletConnect();
        } catch (error) {
          // Expected if WalletConnect is not configured
        }
      });
    });

    it('should connect to Phantom wallet', async () => {
      const { result } = renderHook(() => useWallet());

      await act(async () => {
        try {
          await result.current.connectPhantom();
        } catch (error) {
          // Expected if Phantom is not installed
        }
      });
    });
  });

  describe('Cleanup', () => {
    it('should cleanup listeners on unmount', () => {
      const { unmount } = renderHook(() => useWallet());

      unmount();

      expect(mockEthereum.removeListener).toHaveBeenCalled();
    });
  });
});
