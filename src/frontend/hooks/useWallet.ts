/**
 * useWallet Hook
 * Handles wallet connection, network switching, and balance management
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { BSC_CONFIG, CONTRACTS, ERC20_ABI, formatters, ERROR_MESSAGES, isCorrectNetwork } from '../lib/contracts';

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  bnbBalance: string;
  usdtBalance: string;
  hypeaiBalance: string;
  provider: ethers.BrowserProvider | null;
}

export interface WalletError {
  message: string;
  code?: string;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isCorrectNetwork: false,
    bnbBalance: '0',
    usdtBalance: '0',
    hypeaiBalance: '0',
    provider: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<WalletError | null>(null);

  /**
   * Check if MetaMask is installed
   */
  const isMetaMaskInstalled = useCallback((): boolean => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }, []);

  /**
   * Get provider instance
   */
  const getProvider = useCallback((): ethers.BrowserProvider | null => {
    if (!isMetaMaskInstalled()) {
      return null;
    }
    return new ethers.BrowserProvider(window.ethereum as any);
  }, [isMetaMaskInstalled]);

  /**
   * Fetch user balances
   */
  const fetchBalances = useCallback(async (address: string, provider: ethers.BrowserProvider) => {
    try {
      // Fetch BNB balance
      const bnbBalanceWei = await provider.getBalance(address);
      const bnbBalance = formatters.formatToken(bnbBalanceWei);

      // Fetch USDT balance
      const usdtContract = new ethers.Contract(CONTRACTS.USDT_TOKEN, ERC20_ABI, provider);
      const usdtBalanceWei = await usdtContract.balanceOf(address);
      const usdtBalance = formatters.formatToken(usdtBalanceWei);

      // Fetch HypeAI balance (if contract is deployed)
      let hypeaiBalance = '0';
      if (CONTRACTS.HYPEAI_TOKEN) {
        try {
          const hypeaiContract = new ethers.Contract(CONTRACTS.HYPEAI_TOKEN, ERC20_ABI, provider);
          const hypeaiBalanceWei = await hypeaiContract.balanceOf(address);
          hypeaiBalance = formatters.formatToken(hypeaiBalanceWei);
        } catch (err) {
          console.warn('HypeAI token balance fetch failed:', err);
        }
      }

      setWalletState(prev => ({
        ...prev,
        bnbBalance,
        usdtBalance,
        hypeaiBalance,
      }));
    } catch (err) {
      console.error('Error fetching balances:', err);
    }
  }, []);

  /**
   * Update wallet state
   */
  const updateWalletState = useCallback(async (provider: ethers.BrowserProvider) => {
    try {
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const newState = {
        address,
        chainId,
        isConnected: true,
        isCorrectNetwork: isCorrectNetwork(chainId),
        provider,
      };

      setWalletState(prev => ({
        ...prev,
        ...newState,
      }));

      // Fetch balances
      await fetchBalances(address, provider);

      return newState;
    } catch (err) {
      console.error('Error updating wallet state:', err);
      throw err;
    }
  }, [fetchBalances]);

  /**
   * Connect wallet
   */
  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      const provider = getProvider();
      if (!provider) {
        throw new Error('Failed to get provider');
      }

      // Request account access
      await provider.send('eth_requestAccounts', []);

      // Update wallet state
      await updateWalletState(provider);
    } catch (err: any) {
      console.error('Error connecting wallet:', err);

      let errorMessage = 'Failed to connect wallet';

      if (err.code === 4001) {
        errorMessage = ERROR_MESSAGES.TRANSACTION_REJECTED;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError({
        message: errorMessage,
        code: err.code,
      });
    } finally {
      setIsLoading(false);
    }
  }, [isMetaMaskInstalled, getProvider, updateWalletState]);

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    setWalletState({
      address: null,
      chainId: null,
      isConnected: false,
      isCorrectNetwork: false,
      bnbBalance: '0',
      usdtBalance: '0',
      hypeaiBalance: '0',
      provider: null,
    });
    setError(null);
  }, []);

  /**
   * Switch to BSC network
   */
  const switchToBSC = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed');
      }

      try {
        // Try to switch to BSC
        await window.ethereum?.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BSC_CONFIG.chainId }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_CONFIG],
          });
        } else {
          throw switchError;
        }
      }

      // Update wallet state after switching
      const provider = getProvider();
      if (provider) {
        await updateWalletState(provider);
      }
    } catch (err: any) {
      console.error('Error switching network:', err);

      let errorMessage = 'Failed to switch network';

      if (err.code === 4001) {
        errorMessage = 'Network switch rejected by user';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError({
        message: errorMessage,
        code: err.code,
      });
    } finally {
      setIsLoading(false);
    }
  }, [isMetaMaskInstalled, getProvider, updateWalletState]);

  /**
   * Refresh balances
   */
  const refreshBalances = useCallback(async () => {
    if (walletState.address && walletState.provider) {
      await fetchBalances(walletState.address, walletState.provider);
    }
  }, [walletState.address, walletState.provider, fetchBalances]);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    if (!isMetaMaskInstalled()) {
      return;
    }

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        disconnectWallet();
      } else {
        // User switched account
        const provider = getProvider();
        if (provider) {
          await updateWalletState(provider);
        }
      }
    };

    const handleChainChanged = async () => {
      // Reload the page on chain change (recommended by MetaMask)
      window.location.reload();
    };

    const handleConnect = async () => {
      const provider = getProvider();
      if (provider) {
        await updateWalletState(provider);
      }
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    // Add event listeners
    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);
    window.ethereum?.on('connect', handleConnect);
    window.ethereum?.on('disconnect', handleDisconnect);

    // Cleanup
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
      window.ethereum?.removeListener('connect', handleConnect);
      window.ethereum?.removeListener('disconnect', handleDisconnect);
    };
  }, [isMetaMaskInstalled, getProvider, updateWalletState, disconnectWallet]);

  /**
   * Auto-connect on mount if previously connected
   */
  useEffect(() => {
    const autoConnect = async () => {
      if (!isMetaMaskInstalled()) {
        return;
      }

      const provider = getProvider();
      if (!provider) {
        return;
      }

      try {
        const accounts = await provider.send('eth_accounts', []);
        if (accounts.length > 0) {
          await updateWalletState(provider);
        }
      } catch (err) {
        console.error('Auto-connect failed:', err);
      }
    };

    autoConnect();
  }, [isMetaMaskInstalled, getProvider, updateWalletState]);

  return {
    ...walletState,
    isLoading,
    error,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    connectWallet,
    disconnectWallet,
    switchToBSC,
    refreshBalances,
  };
};

export default useWallet;
