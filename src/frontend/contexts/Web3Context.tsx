'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import type { WalletState } from '@/types';

interface Web3ContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    balance: '0',
    chainId: null,
    isConnected: false,
    provider: null,
    signer: null,
  });

  const updateBalance = async (provider: ethers.BrowserProvider, address: string) => {
    try {
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  };

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this dApp');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const address = accounts[0];
      const balance = await updateBalance(provider, address);

      setWalletState({
        address,
        balance,
        chainId: Number(network.chainId),
        isConnected: true,
        provider,
        signer,
      });

      // Store connection in localStorage
      localStorage.setItem('walletConnected', 'true');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      alert(`Connection failed: ${errorMessage}`);
    }
  };

  const disconnect = () => {
    setWalletState({
      address: null,
      balance: '0',
      chainId: null,
      isConnected: false,
      provider: null,
      signer: null,
    });
    localStorage.removeItem('walletConnected');
  };

  const switchChain = async (chainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        console.error('Chain not added to wallet');
      } else {
        console.error('Error switching chain:', error);
      }
    }
  };

  useEffect(() => {
    // Auto-connect if previously connected
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected === 'true' && typeof window.ethereum !== 'undefined') {
      connect();
    }

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (walletState.provider) {
          connect();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      // Cleanup is handled by MetaMask automatically
      // removeAllListeners is not part of the EIP-1193 standard
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        ...walletState,
        connect,
        disconnect,
        switchChain,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

// Window.ethereum type is declared in types/window.d.ts
