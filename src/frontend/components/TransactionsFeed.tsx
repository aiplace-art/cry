// Live Transactions Feed Component

import React from 'react';
import type { TokenPurchase } from '../types/presale';

interface TransactionsFeedProps {
  transactions: TokenPurchase[];
}

export const TransactionsFeed: React.FC<TransactionsFeedProps> = ({ transactions }) => {
  const getStatusColor = (status: TokenPurchase['status']) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400 bg-green-900/30 border-green-500/50';
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
      case 'failed':
        return 'text-red-400 bg-red-900/30 border-red-500/50';
      default:
        return 'text-gray-400 bg-gray-900/30 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: TokenPurchase['status']) => {
    switch (status) {
      case 'confirmed':
        return '✓';
      case 'pending':
        return '⏳';
      case 'failed':
        return '✗';
      default:
        return '•';
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-3xl">📊</span>
          Live Transactions
        </h3>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-400">No transactions yet</p>
          <p className="text-sm text-gray-500 mt-2">Be the first to buy HYPE tokens!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-3xl">📊</span>
        Live Transactions
        <span className="ml-auto text-sm font-normal text-gray-400">
          {transactions.length} total
        </span>
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {transactions.map((tx, index) => (
          <div
            key={tx.txHash}
            className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                      tx.status
                    )}`}
                  >
                    {getStatusIcon(tx.status)} {tx.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{formatTimestamp(tx.timestamp)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Buyer</div>
                    <div className="text-white font-mono">{truncateAddress(tx.buyer)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Amount</div>
                    <div className="text-white font-semibold">
                      {tx.amount} {tx.paymentMethod}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Tokens</div>
                    <div className="text-bnb-secondary font-semibold">
                      {tx.tokens.toLocaleString()} HYPE
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">TX Hash</div>
                    <a
                      href={`https://etherscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-bnb-primary hover:text-bnb-primary font-mono flex items-center gap-1"
                    >
                      {truncateAddress(tx.txHash)}
                      <span className="text-xs">↗</span>
                    </a>
                  </div>
                </div>
              </div>

              {tx.status === 'pending' && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
};
