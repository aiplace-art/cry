// Main Presale Buy Widget Component

import React, { useState, useEffect } from 'react';
import { usePresale } from '../hooks/usePresale';
import { PAYMENT_METHODS, PRESALE_CONFIG } from '../lib/constants';
import type { PaymentMethod } from '../types/presale';
import { presaleContract } from '../utils/presaleContract';

export const PresaleWidget: React.FC = () => {
  const {
    walletState,
    presaleState,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    buyTokens,
    generateReferralCode,
  } = usePresale();

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('ETH');
  const [amount, setAmount] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(0.5);
  const [gasEstimate, setGasEstimate] = useState<string>('--');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentRound = presaleState.currentRound;

  // Calculate tokens received
  const tokensReceived = amount
    ? presaleContract.calculateTokens(
        parseFloat(amount),
        currentRound.price,
        currentRound.bonus
      )
    : 0;

  // Estimate gas
  useEffect(() => {
    if (!amount || !walletState.isConnected) {
      setGasEstimate('--');
      return;
    }

    const estimateGas = async () => {
      try {
        const estimate = await presaleContract.estimateGas(
          selectedPayment,
          parseFloat(amount)
        );
        setGasEstimate(estimate.gasPriceGwei);
      } catch {
        setGasEstimate('--');
      }
    };

    const debounce = setTimeout(estimateGas, 500);
    return () => clearTimeout(debounce);
  }, [amount, selectedPayment, walletState.isConnected]);

  // Handle buy
  const handleBuy = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const validation = presaleContract.validateAmount(parseFloat(amount));
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const txHash = await buyTokens(selectedPayment, parseFloat(amount));
    if (txHash) {
      setAmount('');
      alert(`Transaction submitted! Hash: ${txHash.slice(0, 10)}...`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Buy HYPE Tokens</h2>
        <p className="text-gray-400">
          {currentRound.name} • {currentRound.bonus}% Bonus • ${currentRound.price} per token
        </p>
      </div>

      {/* Wallet Connection */}
      {!walletState.isConnected ? (
        <button
          onClick={connectWallet}
          disabled={walletState.isConnecting}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {walletState.isConnecting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Connecting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>🔌</span>
              Connect Wallet
            </span>
          )}
        </button>
      ) : (
        <>
          {/* Wallet Info */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Connected Wallet</span>
              <button
                onClick={disconnectWallet}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Disconnect
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white font-mono text-sm">
                {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
              </span>
              <span className="text-gray-400 text-sm">
                {parseFloat(walletState.balance).toFixed(4)} ETH
              </span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-5 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id as PaymentMethod)}
                  className={`py-3 px-2 rounded-lg font-medium transition-all ${
                    selectedPayment === method.id
                      ? 'bg-purple-600 text-white border-2 border-purple-400 shadow-lg transform scale-105'
                      : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{method.icon}</div>
                  <div className="text-xs">{method.id}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount to Invest
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={PRESALE_CONFIG.minPurchase}
                max={PRESALE_CONFIG.maxPurchase}
                step="0.01"
                placeholder={`Min: ${PRESALE_CONFIG.minPurchase} ${selectedPayment}`}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                {selectedPayment}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>
                Min: {PRESALE_CONFIG.minPurchase} • Max: {PRESALE_CONFIG.maxPurchase}
              </span>
              <span>Gas: {gasEstimate} Gwei</span>
            </div>
          </div>

          {/* Tokens Received Display */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-4 mb-6 border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-300">You will receive</span>
                <span className="text-xs text-purple-400">{currentRound.bonus}% bonus</span>
              </div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {tokensReceived.toLocaleString()} HYPE
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Base: {(tokensReceived / (1 + currentRound.bonus / 100)).toFixed(2)} + Bonus:{' '}
                {(tokensReceived - tokensReceived / (1 + currentRound.bonus / 100)).toFixed(2)}
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <div className="mb-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-gray-400 hover:text-gray-300 flex items-center gap-1"
            >
              <span className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>
                ▶
              </span>
              Advanced Settings
            </button>
            {showAdvanced && (
              <div className="mt-3 bg-gray-800/30 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Slippage Tolerance: {slippage}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={slippage}
                  onChange={(e) => setSlippage(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Buy Button */}
          <button
            onClick={handleBuy}
            disabled={
              isLoading ||
              !amount ||
              parseFloat(amount) <= 0 ||
              parseFloat(amount) < PRESALE_CONFIG.minPurchase
            }
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🚀</span>
                Buy HYPE Tokens
              </span>
            )}
          </button>

          {/* Referral Section */}
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <button
              onClick={generateReferralCode}
              className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 py-3 px-4 rounded-lg text-sm transition-all"
            >
              {presaleState.referralCode ? (
                <span>
                  🎁 Your Referral Code: <span className="font-mono">{presaleState.referralCode}</span>
                </span>
              ) : (
                <span>🎁 Generate Referral Link (5% Bonus)</span>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
