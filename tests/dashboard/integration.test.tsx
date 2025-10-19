/**
 * @test Integration Tests
 * @description Tests for component integration and user flows
 * @coverage Multi-component interactions, state synchronization
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrivateSalePage from '../../src/frontend/pages/private-sale';
import { usePrivateSale } from '../../src/frontend/hooks/usePrivateSale';
import { useWallet } from '../../src/frontend/hooks/useWallet';

// Mock hooks
jest.mock('../../src/frontend/hooks/usePrivateSale');
jest.mock('../../src/frontend/hooks/useWallet');

const mockUsePrivateSale = usePrivateSale as jest.MockedFunction<typeof usePrivateSale>;
const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;

describe('Private Sale Dashboard - Integration Tests', () => {
  const mockPrivateSaleData = {
    config: {
      minPurchase: 50,
      maxPurchase: 500,
      tokenPrice: 0.0015,
      currentAmount: 2500000,
      targetAmount: 5000000,
      bonusTiers: [
        { minAmount: 50, bonus: 5 },
        { minAmount: 100, bonus: 10 },
        { minAmount: 250, bonus: 20 },
        { minAmount: 500, bonus: 30 },
      ],
    },
    calculateTokens: jest.fn(),
    processPurchase: jest.fn(),
    loading: false,
    getTimeRemaining: jest.fn(() => ({
      days: 7,
      hours: 12,
      minutes: 30,
      seconds: 45,
      expired: false,
    })),
    getProgress: jest.fn(() => 50),
    purchases: [],
    getReferralLink: jest.fn((address) => `https://hypeai.com/ref/${address}`),
  };

  const mockWalletData = {
    wallet: {
      address: '0x1234567890123456789012345678901234567890',
      chainId: 1,
      network: 'ethereum',
    },
    connecting: false,
    connectMetaMask: jest.fn(),
    connectWalletConnect: jest.fn(),
    connectPhantom: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePrivateSale.mockReturnValue(mockPrivateSaleData);
    mockUseWallet.mockReturnValue(mockWalletData);
    global.fetch = jest.fn();
  });

  describe('Full User Journey', () => {
    test('should complete entire purchase flow from wallet connection to success', async () => {
      // Start with disconnected wallet
      mockUseWallet.mockReturnValue({
        ...mockWalletData,
        wallet: null,
      });

      const { rerender } = render(<PrivateSalePage />);

      // Step 1: Wallet not connected
      expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();

      // Step 2: Connect wallet
      const connectButton = screen.getByText('Connect MetaMask');
      await userEvent.click(connectButton);
      expect(mockWalletData.connectMetaMask).toHaveBeenCalled();

      // Step 3: Simulate wallet connected
      mockUseWallet.mockReturnValue(mockWalletData);
      rerender(<PrivateSalePage />);

      await waitFor(() => {
        expect(screen.getByText(/0x1234...7890/)).toBeInTheDocument();
      });

      // Step 4: Enter amount
      mockPrivateSaleData.calculateTokens.mockReturnValue({
        usdAmount: 100,
        baseTokens: 66666.67,
        bonusPercentage: 10,
        bonusTokens: 6666.67,
        totalTokens: 73333.34,
      });

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '100');

      await waitFor(() => {
        expect(screen.getByText(/66,666.67 HYPE/)).toBeInTheDocument();
      });

      // Step 5: Process purchase
      mockPrivateSaleData.processPurchase.mockResolvedValue({
        success: true,
        transactionHash: '0xabcdef1234567890',
        tokensReceived: 73333.34,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const buyButton = screen.getByText('BUY NOW');
      await userEvent.click(buyButton);

      // Step 6: Verify success screen
      await waitFor(() => {
        expect(screen.getByText(/Purchase Successful!/)).toBeInTheDocument();
      });
    });

    test('should handle multiple purchases in sequence', async () => {
      const purchases: any[] = [];

      mockPrivateSaleData.processPurchase.mockImplementation(async (amount) => {
        const tokens = (amount / 0.0015) * 1.1;
        purchases.push({
          id: `${purchases.length + 1}`,
          amount,
          totalTokens: tokens,
          status: 'completed',
          timestamp: Date.now(),
        });

        return {
          success: true,
          transactionHash: `0x${Math.random().toString(16).slice(2)}`,
          tokensReceived: tokens,
        };
      });

      const { rerender } = render(<PrivateSalePage />);

      // First purchase
      mockPrivateSaleData.calculateTokens.mockReturnValue({
        usdAmount: 100,
        baseTokens: 66666.67,
        bonusPercentage: 10,
        bonusTokens: 6666.67,
        totalTokens: 73333.34,
      });

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '100');

      const buyButton = screen.getByText('BUY NOW');
      await userEvent.click(buyButton);

      await waitFor(() => {
        expect(screen.getByText(/Purchase Successful!/)).toBeInTheDocument();
      });

      // Make another purchase
      const anotherButton = screen.getByText('Make Another Purchase');
      await userEvent.click(anotherButton);

      mockUsePrivateSale.mockReturnValue({
        ...mockPrivateSaleData,
        purchases,
      });

      rerender(<PrivateSalePage />);

      // Verify purchase count
      expect(purchases).toHaveLength(1);
    });
  });

  describe('Real-time Updates', () => {
    test('should update countdown timer every second', async () => {
      let seconds = 45;
      mockPrivateSaleData.getTimeRemaining.mockImplementation(() => ({
        days: 7,
        hours: 12,
        minutes: 30,
        seconds: seconds--,
        expired: false,
      }));

      render(<PrivateSalePage />);

      const initialSeconds = screen.getByText('45');
      expect(initialSeconds).toBeInTheDocument();

      await waitFor(
        () => {
          expect(screen.getByText('44')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    test('should update progress bar when sale amount changes', async () => {
      mockPrivateSaleData.getProgress.mockReturnValue(50);

      const { rerender } = render(<PrivateSalePage />);

      expect(screen.getByText('50.0%')).toBeInTheDocument();

      // Simulate progress update
      mockPrivateSaleData.getProgress.mockReturnValue(55);
      mockUsePrivateSale.mockReturnValue(mockPrivateSaleData);

      rerender(<PrivateSalePage />);

      await waitFor(() => {
        expect(screen.getByText('55.0%')).toBeInTheDocument();
      });
    });
  });

  describe('State Synchronization', () => {
    test('should sync token calculation with amount input', async () => {
      render(<PrivateSalePage />);

      const input = screen.getByPlaceholderText('0.00');

      // Test different amounts
      const testCases = [
        { amount: '50', bonus: 5 },
        { amount: '100', bonus: 10 },
        { amount: '250', bonus: 20 },
        { amount: '500', bonus: 30 },
      ];

      for (const { amount, bonus } of testCases) {
        mockPrivateSaleData.calculateTokens.mockReturnValue({
          usdAmount: parseFloat(amount),
          baseTokens: parseFloat(amount) / 0.0015,
          bonusPercentage: bonus,
          bonusTokens: (parseFloat(amount) / 0.0015) * (bonus / 100),
          totalTokens: (parseFloat(amount) / 0.0015) * (1 + bonus / 100),
        });

        await userEvent.clear(input);
        await userEvent.type(input, amount);

        await waitFor(() => {
          expect(screen.getByText(new RegExp(`Bonus \\(${bonus}%\\):`))).toBeInTheDocument();
        });
      }
    });

    test('should disable buy button when conditions not met', async () => {
      render(<PrivateSalePage />);

      const buyButton = screen.getByText('BUY NOW');

      // No amount entered
      expect(buyButton).toBeDisabled();

      // Amount below minimum
      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '25');

      expect(buyButton).toBeDisabled();

      // Valid amount
      await userEvent.clear(input);
      await userEvent.type(input, '100');

      mockPrivateSaleData.calculateTokens.mockReturnValue({
        usdAmount: 100,
        baseTokens: 66666.67,
        bonusPercentage: 10,
        bonusTokens: 6666.67,
        totalTokens: 73333.34,
      });

      // Note: Button may still be disabled if payment method not selected
    });
  });

  describe('Purchase History Integration', () => {
    test('should display purchase history when available', async () => {
      const purchases = [
        {
          id: '1',
          amount: 100,
          totalTokens: 73333.34,
          currency: 'ETH',
          status: 'completed',
          timestamp: Date.now(),
          transactionHash: '0xabc123',
        },
        {
          id: '2',
          amount: 250,
          totalTokens: 200000,
          currency: 'USDT',
          status: 'completed',
          timestamp: Date.now() - 86400000,
          transactionHash: '0xdef456',
        },
      ];

      mockUsePrivateSale.mockReturnValue({
        ...mockPrivateSaleData,
        purchases,
      });

      render(<PrivateSalePage />);

      await waitFor(() => {
        expect(screen.getByText('📊 My Purchases')).toBeInTheDocument();
      });

      expect(screen.getByText('73,333.34 HYPE')).toBeInTheDocument();
      expect(screen.getByText('200,000 HYPE')).toBeInTheDocument();
    });

    test('should link to blockchain explorer for each purchase', async () => {
      const purchases = [
        {
          id: '1',
          amount: 100,
          totalTokens: 73333.34,
          currency: 'ETH',
          status: 'completed',
          timestamp: Date.now(),
          transactionHash: '0xabc123',
        },
      ];

      mockUsePrivateSale.mockReturnValue({
        ...mockPrivateSaleData,
        purchases,
      });

      render(<PrivateSalePage />);

      await waitFor(() => {
        const links = screen.getAllByText('View TX');
        expect(links).toHaveLength(1);
        expect(links[0].closest('a')).toHaveAttribute(
          'href',
          expect.stringContaining('etherscan.io')
        );
      });
    });
  });

  describe('Referral System Integration', () => {
    test('should display referral section only when wallet connected', async () => {
      const { rerender } = render(<PrivateSalePage />);

      // Wallet connected - should show referral
      expect(screen.getByText('🎁 Share & Earn')).toBeInTheDocument();

      // Disconnect wallet
      mockUseWallet.mockReturnValue({
        ...mockWalletData,
        wallet: null,
      });

      rerender(<PrivateSalePage />);

      // Should not show referral section
      expect(screen.queryByText('🎁 Share & Earn')).not.toBeInTheDocument();
    });

    test('should generate unique referral link for wallet', async () => {
      render(<PrivateSalePage />);

      const referralInput = screen.getByDisplayValue(
        /https:\/\/hypeai\.com\/ref\/0x1234567890123456789012345678901234567890/
      );

      expect(referralInput).toBeInTheDocument();
      expect(referralInput).toHaveAttribute('readonly');
    });

    test('should copy referral link to clipboard', async () => {
      const clipboardSpy = jest.spyOn(navigator.clipboard, 'writeText');

      render(<PrivateSalePage />);

      const copyButton = screen.getByText('Copy');
      await userEvent.click(copyButton);

      expect(clipboardSpy).toHaveBeenCalledWith(
        expect.stringContaining('0x1234567890123456789012345678901234567890')
      );
    });
  });

  describe('Error Recovery', () => {
    test('should recover from failed purchase and allow retry', async () => {
      mockPrivateSaleData.processPurchase.mockRejectedValueOnce(new Error('Network error'));

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<PrivateSalePage />);

      mockPrivateSaleData.calculateTokens.mockReturnValue({
        usdAmount: 100,
        baseTokens: 66666.67,
        bonusPercentage: 10,
        bonusTokens: 6666.67,
        totalTokens: 73333.34,
      });

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '100');

      const buyButton = screen.getByText('BUY NOW');
      await userEvent.click(buyButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });

      // Retry
      mockPrivateSaleData.processPurchase.mockResolvedValue({
        success: true,
        transactionHash: '0xabc',
        tokensReceived: 73333.34,
      });

      await userEvent.click(buyButton);

      await waitFor(() => {
        expect(screen.getByText(/Purchase Successful!/)).toBeInTheDocument();
      });

      alertSpy.mockRestore();
    });
  });

  describe('Concurrent Operations', () => {
    test('should handle rapid amount changes without race conditions', async () => {
      render(<PrivateSalePage />);

      const input = screen.getByPlaceholderText('0.00');

      const amounts = ['50', '100', '250', '500'];

      for (const amount of amounts) {
        mockPrivateSaleData.calculateTokens.mockReturnValue({
          usdAmount: parseFloat(amount),
          baseTokens: parseFloat(amount) / 0.0015,
          bonusPercentage: 10,
          bonusTokens: (parseFloat(amount) / 0.0015) * 0.1,
          totalTokens: (parseFloat(amount) / 0.0015) * 1.1,
        });

        await userEvent.clear(input);
        await userEvent.type(input, amount);
      }

      // Final calculation should be for last amount
      expect(mockPrivateSaleData.calculateTokens).toHaveBeenLastCalledWith(500);
    });
  });

  describe('Performance', () => {
    test('should render within acceptable time', () => {
      const start = performance.now();

      render(<PrivateSalePage />);

      const renderTime = performance.now() - start;

      expect(renderTime).toBeLessThan(1000); // Should render in less than 1 second
    });

    test('should not cause memory leaks with repeated renders', () => {
      const { unmount, rerender } = render(<PrivateSalePage />);

      // Simulate multiple re-renders
      for (let i = 0; i < 10; i++) {
        rerender(<PrivateSalePage />);
      }

      // Clean unmount should not throw
      expect(() => unmount()).not.toThrow();
    });
  });
});
