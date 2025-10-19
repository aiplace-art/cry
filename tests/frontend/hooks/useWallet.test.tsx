/**
 * useWallet Hook Test Suite
 * Comprehensive tests for wallet connection, network switching, and balance management
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useWallet } from '../../../src/frontend/hooks/useWallet';
import { ethers } from 'ethers';

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    BrowserProvider: jest.fn().mockImplementation(() => ({
      getBalance: jest.fn().mockResolvedValue(BigInt('1000000000000000000')), // 1 BNB
      getNetwork: jest.fn().mockResolvedValue({ chainId: BigInt(56) }),
      getSigner: jest.fn().mockResolvedValue({
        getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
      }),
      send: jest.fn().mockImplementation((method) => {
        if (method === 'eth_requestAccounts') {
          return Promise.resolve(['0x1234567890123456789012345678901234567890']);
        }
        if (method === 'eth_accounts') {
          return Promise.resolve(['0x1234567890123456789012345678901234567890']);
        }
        return Promise.resolve([]);
      }),
    })),
    Contract: jest.fn().mockImplementation(() => ({
      balanceOf: jest.fn().mockResolvedValue(BigInt('1000000000000000000')),
    })),
  },
}));

// Mock contracts library
jest.mock('../../../src/frontend/lib/contracts', () => ({
  getCurrentNetworkConfig: jest.fn().mockReturnValue({
    chainId: '0x38',
    chainName: 'BSC Mainnet',
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
  }),
  CONTRACTS: {
    USDT_TOKEN: '0xusdt',
    HYPEAI_TOKEN: '0xhypeai',
  },
  ERC20_ABI: [],
  formatters: {
    formatToken: jest.fn((value) => ethers.formatEther(value)),
  },
  ERROR_MESSAGES: {
    TRANSACTION_REJECTED: 'Transaction rejected by user',
  },
  isCorrectNetwork: jest.fn((chainId) => chainId === 56),
}));

describe('useWallet Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    test('should initialize with disconnected state', () => {
      const { result } = renderHook(() => useWallet());

      expect(result.current.address).toBeNull();
      expect(result.current.chainId).toBeNull();
      expect(result.current.isConnected).toBe(false);
      expect(result.current.isCorrectNetwork).toBe(false);
      expect(result.current.bnbBalance).toBe('0');
      expect(result.current.usdtBalance).toBe('0');
      expect(result.current.hypeaiBalance).toBe('0');
    });

    test('should detect MetaMask installation', () => {
      const { result } = renderHook(() => useWallet());
      expect(result.current.isMetaMaskInstalled).toBe(true);
    });

    test('should not be in loading state initially', () => {
      const { result } = renderHook(() => useWallet());
      expect(result.current.isLoading).toBe(false);
      expect(result.current.connecting).toBe(false);
    });

    test('should have no error initially', () => {
      const { result } = renderHook(() => useWallet());
      expect(result.current.error).toBeNull();
    });
  });

  describe('Connect Wallet', () => {
    test('should connect wallet successfully', async () => {
      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connectWallet();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      expect(result.current.address).toBe('0x1234567890123456789012345678901234567890');
      expect(result.current.chainId).toBe(56);
    });

    test('should set loading state during connection', async () => {
      const { result } = renderHook(() => useWallet());

      act(() => {
        result.current.connectWallet();
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    test('should handle connection rejection', async () => {
      const mockError = { code: 4001, message: 'User rejected' };
      window.ethereum.request = jest.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connectWallet();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error?.message).toContain('rejected');
      expect(result.current.isConnected).toBe(false);
    });

    test('should fetch balances after connection', async () => {
      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connectWallet();
      });

      await waitFor(() => {
        expect(result.current.bnbBalance).not.toBe('0');
      });
    });
  });

  describe('Disconnect Wallet', () => {
    test('should disconnect wallet and reset state', async () => {
      const { result } = renderHook(() => useWallet());

      // First connect
      await act(async () => {
        await result.current.connectWallet();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Then disconnect
      act(() => {
        result.current.disconnectWallet();
      });

      expect(result.current.address).toBeNull();
      expect(result.current.isConnected).toBe(false);
      expect(result.current.bnbBalance).toBe('0');
      expect(result.current.error).toBeNull();
    });
  });

  describe('Network Switching', () => {
    test('should switch to BSC network', async () => {
      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.switchToBSC();
      });

      expect(window.ethereum.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'wallet_switchEthereumChain',
        })
      );
    });

    test('should add BSC network if not exists (4902 error)', async () => {
      window.ethereum.request = jest.fn().mockImplementation(({ method }) => {
        if (method === 'wallet_switchEthereumChain') {
          const error: any = new Error('Network not found');
          error.code = 4902;
          return Promise.reject(error);
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.switchToBSC();
      });

      expect(window.ethereum.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'wallet_addEthereumChain',
        })
      );
    });

    test('should handle network switch rejection', async () => {
      const mockError = { code: 4001, message: 'User rejected' };
      window.ethereum.request = jest.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.switchToBSC();
      });

      await waitFor(() => {
        expect(result.current.error?.message).toContain('rejected');
      });
    });
  });

  describe('Balance Management', () => {
    test('should refresh balances', async () => {
      const { result } = renderHook(() => useWallet());

      // Connect first
      await act(async () => {
        await result.current.connectWallet();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      const initialBalance = result.current.bnbBalance;

      // Refresh balances
      await act(async () => {
        await result.current.refreshBalances();
      });

      // Balance should be updated (mocked to same value, but function called)
      expect(result.current.bnbBalance).toBe(initialBalance);
    });

    test('should handle balance fetch errors gracefully', async () => {
      // Mock balance fetch failure
      const mockProvider = {
        getBalance: jest.fn().mockRejectedValue(new Error('Network error')),
        getNetwork: jest.fn().mockResolvedValue({ chainId: BigInt(56) }),
        getSigner: jest.fn().mockResolvedValue({
          getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
        }),
        send: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      };

      (ethers.BrowserProvider as jest.Mock).mockImplementation(() => mockProvider);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connectWallet();
      });

      // Should still connect even if balance fetch fails
      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });
    });
  });

  describe('Backward Compatibility', () => {
    test('should provide legacy wallet alias', async () => {
      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connectWallet();
      });

      await waitFor(() => {
        expect(result.current.wallet).toBe(result.current.address);
      });
    });

    test('should provide legacy connecting alias', () => {
      const { result } = renderHook(() => useWallet());
      expect(result.current.connecting).toBe(result.current.isLoading);
    });

    test('should provide connectMetaMask alias', () => {
      const { result } = renderHook(() => useWallet());
      expect(result.current.connectMetaMask).toBe(result.current.connectWallet);
    });
  });
});
