'use client';

import React, { useState, useEffect } from 'react';
import { PaymentMethod } from '../types/private-sale';
import { usePrivateSale } from '../hooks/usePrivateSale';
import { useWallet } from '../hooks/useWallet';
import PaymentMethods from './PaymentMethods';
import { EXPLORER_URLS } from '../lib/payment-config';

export const PrivateSaleWidget: React.FC = () => {
  const [usdAmount, setUsdAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string>('');

  const { calculateTokens, processPurchase, loading, config } = usePrivateSale();
  const { wallet, connecting, connectMetaMask, connectWalletConnect, connectPhantom } = useWallet();

  // Calculate tokens when amount changes
  const calculation = usdAmount ? calculateTokens(parseFloat(usdAmount) || 0) : null;

  const handlePurchase = async () => {
    if (!wallet || !selectedMethod || !usdAmount) return;

    const amount = parseFloat(usdAmount);
    const result = await processPurchase(amount, selectedMethod, wallet.address);

    if (result.success && result.transactionHash) {
      setTxHash(result.transactionHash);
      setShowSuccess(true);
      setUsdAmount('');

      // Send email notification
      sendEmailNotification(amount, result.tokensReceived || 0, result.transactionHash);
    } else {
      alert(`Purchase failed: ${result.error}`);
    }
  };

  const sendEmailNotification = async (amount: number, tokens: number, txHash: string) => {
    try {
      await fetch('/api/private-sale/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: wallet?.address,
          amount,
          tokens,
          transactionHash: txHash,
        }),
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const getExplorerUrl = () => {
    if (!selectedMethod || !txHash) return '';
    return `${EXPLORER_URLS[selectedMethod.network]}${txHash}`;
  };

  if (showSuccess) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Purchase Successful! 🎉
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Your HYPE tokens have been allocated and will be available after the vesting period.
          </p>

          {/* Transaction Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                <span className="text-sm font-mono text-gray-900 dark:text-white">
                  {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </span>
              </div>

              <a
                href={getExplorerUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>View on Explorer</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                // Add to calendar functionality
                const event = {
                  title: 'HYPE Token Unlock',
                  description: 'Your HYPE tokens will be unlocked',
                  start: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
                };
                // This would integrate with calendar API
                alert('Calendar reminder would be added here');
              }}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
            >
              📅 Add Unlock Date to Calendar
            </button>

            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-3 px-4 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition"
            >
              Make Another Purchase
            </button>
          </div>

          {/* Email Confirmation Notice */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            📧 A confirmation email has been sent to your registered email address
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
      {/* Wallet Connection */}
      {!wallet ? (
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Connect Your Wallet
          </h3>

          <button
            onClick={connectMetaMask}
            disabled={connecting}
            className="w-full py-4 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🦊</span>
            <span>Connect MetaMask</span>
          </button>

          <button
            onClick={connectWalletConnect}
            disabled={connecting}
            className="w-full py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🔗</span>
            <span>WalletConnect</span>
          </button>

          <button
            onClick={connectPhantom}
            disabled={connecting}
            className="w-full py-4 px-6 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transition flex items-center justify-center gap-3"
          >
            <span className="text-2xl">👻</span>
            <span>Phantom Wallet</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Connected Wallet Info */}
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </span>
            </div>
            <span className="text-xs text-green-600 dark:text-green-400">Connected</span>
          </div>

          {/* Payment Method Selection */}
          <PaymentMethods
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
            disabled={loading}
          />

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount in USD
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
              <input
                type="number"
                value={usdAmount}
                onChange={(e) => setUsdAmount(e.target.value)}
                placeholder="0.00"
                min={config.minPurchase}
                max={config.maxPurchase}
                className="w-full pl-10 pr-4 py-4 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-lg font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Min: ${config.minPurchase} • Max: ${config.maxPurchase.toLocaleString()}
            </p>
          </div>

          {/* Token Calculator */}
          {calculation && calculation.usdAmount > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 space-y-3 border border-blue-200 dark:border-blue-800">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Base Tokens:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {calculation.baseTokens.toLocaleString(undefined, { maximumFractionDigits: 2 })} HYPE
                </span>
              </div>

              {calculation.bonusPercentage > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600 dark:text-green-400">
                    Bonus ({calculation.bonusPercentage}%):
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    +{calculation.bonusTokens.toLocaleString(undefined, { maximumFractionDigits: 2 })} HYPE
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-blue-200 dark:border-blue-800 flex justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {calculation.totalTokens.toLocaleString(undefined, { maximumFractionDigits: 2 })} HYPE
                </span>
              </div>
            </div>
          )}

          {/* Buy Button */}
          <button
            onClick={handlePurchase}
            disabled={!selectedMethod || !usdAmount || loading || parseFloat(usdAmount) < config.minPurchase}
            className="w-full py-5 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>BUY NOW</span>
                <span className="text-xl">🚀</span>
              </>
            )}
          </button>

          {/* Trust Signals */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl mb-1">🔒</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Secure</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Instant</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">✓</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Verified</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivateSaleWidget;
