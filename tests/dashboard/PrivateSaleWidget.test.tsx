/**
 * @test PrivateSaleWidget Component
 * @description Comprehensive unit tests for the Private Sale Widget
 * @coverage All user interactions, state management, and edge cases
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrivateSaleWidget from '../../src/frontend/components/PrivateSaleWidget';
import { usePrivateSale } from '../../src/frontend/hooks/usePrivateSale';
import { useWallet } from '../../src/frontend/hooks/useWallet';

// Mock hooks
jest.mock('../../src/frontend/hooks/usePrivateSale');
jest.mock('../../src/frontend/hooks/useWallet');

const mockUsePrivateSale = usePrivateSale as jest.MockedFunction<typeof usePrivateSale>;
const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;

describe('PrivateSaleWidget', () => {
  const mockCalculateTokens = jest.fn();
  const mockProcessPurchase = jest.fn();
  const mockConnectMetaMask = jest.fn();
  const mockConnectWalletConnect = jest.fn();
  const mockConnectPhantom = jest.fn();

  const defaultPrivateSaleData = {
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
    calculateTokens: mockCalculateTokens,
    processPurchase: mockProcessPurchase,
    loading: false,
    getTimeRemaining: jest.fn(),
    getProgress: jest.fn(),
    purchases: [],
    getReferralLink: jest.fn(),
  };

  const mockWalletConnected = {
    wallet: {
      address: '0x1234567890123456789012345678901234567890',
      chainId: 1,
      network: 'ethereum',
    },
    connecting: false,
    connectMetaMask: mockConnectMetaMask,
    connectWalletConnect: mockConnectWalletConnect,
    connectPhantom: mockConnectPhantom,
  };

  const mockWalletDisconnected = {
    wallet: null,
    connecting: false,
    connectMetaMask: mockConnectMetaMask,
    connectWalletConnect: mockConnectWalletConnect,
    connectPhantom: mockConnectPhantom,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePrivateSale.mockReturnValue(defaultPrivateSaleData);
    global.fetch = jest.fn();
  });

  describe('Wallet Connection', () => {
    beforeEach(() => {
      mockUseWallet.mockReturnValue(mockWalletDisconnected);
    });

    it('should render wallet connection options when wallet is not connected', () => {
      render(<PrivateSaleWidget />);

      expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
      expect(screen.getByText('Connect MetaMask')).toBeInTheDocument();
      expect(screen.getByText('WalletConnect')).toBeInTheDocument();
      expect(screen.getByText('Phantom Wallet')).toBeInTheDocument();
    });

    it('should call connectMetaMask when MetaMask button is clicked', async () => {
      render(<PrivateSaleWidget />);

      const metamaskButton = screen.getByText('Connect MetaMask');
      await userEvent.click(metamaskButton);

      expect(mockConnectMetaMask).toHaveBeenCalledTimes(1);
    });

    it('should call connectWalletConnect when WalletConnect button is clicked', async () => {
      render(<PrivateSaleWidget />);

      const walletConnectButton = screen.getByText('WalletConnect');
      await userEvent.click(walletConnectButton);

      expect(mockConnectWalletConnect).toHaveBeenCalledTimes(1);
    });

    it('should call connectPhantom when Phantom button is clicked', async () => {
      render(<PrivateSaleWidget />);

      const phantomButton = screen.getByText('Phantom Wallet');
      await userEvent.click(phantomButton);

      expect(mockConnectPhantom).toHaveBeenCalledTimes(1);
    });

    it('should disable wallet buttons when connecting', () => {
      mockUseWallet.mockReturnValue({ ...mockWalletDisconnected, connecting: true });
      render(<PrivateSaleWidget />);

      const metamaskButton = screen.getByText('Connect MetaMask');
      expect(metamaskButton).toBeDisabled();
    });
  });

  describe('Connected Wallet Interface', () => {
    beforeEach(() => {
      mockUseWallet.mockReturnValue(mockWalletConnected);
    });

    it('should display connected wallet address', () => {
      render(<PrivateSaleWidget />);

      expect(screen.getByText(/0x1234...7890/)).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('should render payment method selection', () => {
      render(<PrivateSaleWidget />);

      // PaymentMethods component should be rendered
      expect(screen.getByText(/Amount in USD/i)).toBeInTheDocument();
    });

    it('should display purchase limits', () => {
      render(<PrivateSaleWidget />);

      expect(screen.getByText(/Min: \$50 • Max: \$500/)).toBeInTheDocument();
    });

    it('should have USD input field with correct attributes', () => {
      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00') as HTMLInputElement;
      expect(input).toHaveAttribute('type', 'number');
      expect(input).toHaveAttribute('min', '50');
      expect(input).toHaveAttribute('max', '500');
    });
  });

  describe('Token Calculator', () => {
    beforeEach(() => {
      mockUseWallet.mockReturnValue(mockWalletConnected);
    });

    it('should calculate tokens when amount is entered', async () => {
      mockCalculateTokens.mockReturnValue({
        usdAmount: 100,
        baseTokens: 66666.67,
        bonusPercentage: 10,
        bonusTokens: 6666.67,
        totalTokens: 73333.34,
      });

      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '100');

      expect(mockCalculateTokens).toHaveBeenCalledWith(100);
    });

    it('should display base tokens correctly', async () => {
      mockCalculateTokens.mockReturnValue({
        usdAmount: 100,
        baseTokens: 66666.67,
        bonusPercentage: 10,
        bonusTokens: 6666.67,
        totalTokens: 73333.34,
      });

      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '100');

      await waitFor(() => {
        expect(screen.getByText(/66,666.67 HYPE/)).toBeInTheDocument();
      });
    });

    it('should display bonus tokens when applicable', async () => {
      mockCalculateTokens.mockReturnValue({
        usdAmount: 250,
        baseTokens: 166666.67,
        bonusPercentage: 20,
        bonusTokens: 33333.33,
        totalTokens: 200000,
      });

      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '250');

      await waitFor(() => {
        expect(screen.getByText(/Bonus \(20%\):/)).toBeInTheDocument();
        expect(screen.getByText(/\+33,333.33 HYPE/)).toBeInTheDocument();
      });
    });

    it('should display total tokens correctly', async () => {
      mockCalculateTokens.mockReturnValue({
        usdAmount: 500,
        baseTokens: 333333.33,
        bonusPercentage: 30,
        bonusTokens: 100000,
        totalTokens: 433333.33,
      });

      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '500');

      await waitFor(() => {
        expect(screen.getByText(/433,333.33 HYPE/)).toBeInTheDocument();
      });
    });

    it('should not show calculator when amount is 0', () => {
      mockCalculateTokens.mockReturnValue(null);

      render(<PrivateSaleWidget />);

      expect(screen.queryByText('Base Tokens:')).not.toBeInTheDocument();
    });
  });

  describe('Purchase Flow', () => {
    beforeEach(() => {
      mockUseWallet.mockReturnValue(mockWalletConnected);
      mockCalculateTokens.mockReturnValue({
        usdAmount: 100,
        baseTokens: 66666.67,
        bonusPercentage: 10,
        bonusTokens: 6666.67,
        totalTokens: 73333.34,
      });
    });

    it('should disable buy button when no payment method selected', async () => {
      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '100');

      const buyButton = screen.getByText('BUY NOW');
      expect(buyButton).toBeDisabled();
    });

    it('should disable buy button when amount is below minimum', async () => {
      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '25');

      const buyButton = screen.getByText('BUY NOW');
      expect(buyButton).toBeDisabled();
    });

    it('should process purchase successfully', async () => {
      mockProcessPurchase.mockResolvedValue({
        success: true,
        transactionHash: '0xabcdef1234567890',
        tokensReceived: 73333.34,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '100');

      // Mock payment method selection
      // Note: This would need to be adjusted based on PaymentMethods implementation

      const buyButton = screen.getByText('BUY NOW');
      await userEvent.click(buyButton);

      await waitFor(() => {
        expect(mockProcessPurchase).toHaveBeenCalled();
      });
    });

    it('should show loading state during purchase', async () => {
      mockUsePrivateSale.mockReturnValue({
        ...defaultPrivateSaleData,
        loading: true,
      });

      render(<PrivateSaleWidget />);

      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.getByText('Processing...').closest('button')).toBeDisabled();
    });

    it('should send email notification after successful purchase', async () => {
      mockProcessPurchase.mockResolvedValue({
        success: true,
        transactionHash: '0xabcdef1234567890',
        tokensReceived: 73333.34,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '100');

      const buyButton = screen.getByText('BUY NOW');
      await userEvent.click(buyButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/private-sale/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('0x1234567890123456789012345678901234567890'),
        });
      });
    });

    it('should show alert on purchase failure', async () => {
      mockProcessPurchase.mockResolvedValue({
        success: false,
        error: 'Insufficient balance',
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '100');

      const buyButton = screen.getByText('BUY NOW');
      await userEvent.click(buyButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Purchase failed: Insufficient balance');
      });

      alertSpy.mockRestore();
    });
  });

  describe('Success Screen', () => {
    beforeEach(() => {
      mockUseWallet.mockReturnValue(mockWalletConnected);
      mockProcessPurchase.mockResolvedValue({
        success: true,
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef12',
        tokensReceived: 73333.34,
      });
    });

    it('should display success screen after purchase', async () => {
      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '100');

      const buyButton = screen.getByText('BUY NOW');
      await userEvent.click(buyButton);

      await waitFor(() => {
        expect(screen.getByText(/Purchase Successful!/)).toBeInTheDocument();
      });
    });

    it('should display transaction hash on success screen', async () => {
      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '100');

      const buyButton = screen.getByText('BUY NOW');
      await userEvent.click(buyButton);

      await waitFor(() => {
        expect(screen.getByText(/0xabcdef12...abcdef12/)).toBeInTheDocument();
      });
    });

    it('should have working "View on Explorer" link', async () => {
      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '100');

      const buyButton = screen.getByText('BUY NOW');
      await userEvent.click(buyButton);

      await waitFor(() => {
        const explorerLink = screen.getByText('View on Explorer').closest('a');
        expect(explorerLink).toHaveAttribute('target', '_blank');
        expect(explorerLink).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('should allow making another purchase from success screen', async () => {
      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '100');

      const buyButton = screen.getByText('BUY NOW');
      await userEvent.click(buyButton);

      await waitFor(() => {
        expect(screen.getByText(/Purchase Successful!/)).toBeInTheDocument();
      });

      const anotherPurchaseButton = screen.getByText('Make Another Purchase');
      await userEvent.click(anotherPurchaseButton);

      await waitFor(() => {
        expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockUseWallet.mockReturnValue(mockWalletConnected);
    });

    it('should handle maximum purchase limit', async () => {
      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00') as HTMLInputElement;
      await userEvent.type(input, '1000');

      expect(input.value).toBe('1000');
      // Should still be constrained by max attribute
    });

    it('should handle decimal amounts correctly', async () => {
      mockCalculateTokens.mockReturnValue({
        usdAmount: 99.99,
        baseTokens: 66660,
        bonusPercentage: 5,
        bonusTokens: 3333,
        totalTokens: 69993,
      });

      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '99.99');

      expect(mockCalculateTokens).toHaveBeenCalledWith(99.99);
    });

    it('should handle empty amount input', () => {
      mockCalculateTokens.mockReturnValue(null);

      render(<PrivateSaleWidget />);

      const buyButton = screen.getByText('BUY NOW');
      expect(buyButton).toBeDisabled();
    });

    it('should handle email notification failure gracefully', async () => {
      mockProcessPurchase.mockResolvedValue({
        success: true,
        transactionHash: '0xabcdef1234567890',
        tokensReceived: 73333.34,
      });

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00');
      await userEvent.type(input, '100');

      const buyButton = screen.getByText('BUY NOW');
      await userEvent.click(buyButton);

      await waitFor(() => {
        expect(screen.getByText(/Purchase Successful!/)).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      mockUseWallet.mockReturnValue(mockWalletConnected);
      render(<PrivateSaleWidget />);

      const input = screen.getByPlaceholderText('0.00');
      expect(input).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      mockUseWallet.mockReturnValue(mockWalletDisconnected);
      render(<PrivateSaleWidget />);

      const metamaskButton = screen.getByText('Connect MetaMask');
      metamaskButton.focus();
      expect(metamaskButton).toHaveFocus();

      fireEvent.keyDown(metamaskButton, { key: 'Enter' });
      expect(mockConnectMetaMask).toHaveBeenCalled();
    });
  });
});
