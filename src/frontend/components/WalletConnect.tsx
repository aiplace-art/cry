'use client';

import React from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from './ui/Button';
import { formatAddress, getChainName } from '@/lib/utils';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';

export const WalletConnect: React.FC = () => {
  const { address, balance, chainId, isConnected, connect, disconnect } = useWeb3();
  const [showMenu, setShowMenu] = React.useState(false);

  if (!isConnected) {
    return (
      <Button onClick={connect} variant="primary">
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {formatAddress(address || '')}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {parseFloat(balance).toFixed(4)} ETH
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Connected to</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {chainId ? getChainName(chainId) : 'Unknown Network'}
            </p>
          </div>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Address</p>
            <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
              {address}
            </p>
          </div>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {parseFloat(balance).toFixed(6)} ETH
            </p>
          </div>
          <div className="p-2">
            <button
              onClick={() => {
                disconnect();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
