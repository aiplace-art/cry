import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PurchaseWidgetProps {
  tokenPrice: number;
  minPurchase?: number;
  maxPurchase?: number;
  onPurchase?: (amount: number, paymentMethod: PaymentMethod) => Promise<void>;
  className?: string;
}

type PaymentMethod = 'BNB' | 'USDT';
type TransactionStatus = 'idle' | 'connecting' | 'confirming' | 'processing' | 'success' | 'error';

interface PaymentOption {
  method: PaymentMethod;
  icon: string;
  label: string;
  balance?: number;
}

/**
 * PurchaseWidget Component
 *
 * Complete purchase interface with amount input, payment method selection,
 * token calculator, wallet connection, and transaction status modal.
 *
 * @param tokenPrice - Price per token in USD
 * @param minPurchase - Minimum purchase amount (default: 10)
 * @param maxPurchase - Maximum purchase amount (default: 100000)
 * @param onPurchase - Callback function when purchase is initiated
 * @param className - Optional additional CSS classes
 */
export const PurchaseWidget: React.FC<PurchaseWidgetProps> = ({
  tokenPrice,
  minPurchase = 10,
  maxPurchase = 100000,
  onPurchase,
  className = '',
}) => {
  const [amount, setAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('BNB');
  const [isConnected, setIsConnected] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const paymentOptions: PaymentOption[] = [
    { method: 'BNB', icon: '💎', label: 'BNB', balance: 2.5 },
    { method: 'USDT', icon: '💵', label: 'USDT', balance: 1000 },
  ];

  // Calculate token amount
  const calculateTokens = (usdAmount: number): number => {
    return usdAmount / tokenPrice;
  };

  const numericAmount = parseFloat(amount) || 0;
  const tokenAmount = calculateTokens(numericAmount);
  const isValidAmount = numericAmount >= minPurchase && numericAmount <= maxPurchase;

  // Handle wallet connection
  const handleConnect = async () => {
    setTransactionStatus('connecting');
    // Simulate wallet connection
    setTimeout(() => {
      setIsConnected(true);
      setTransactionStatus('idle');
    }, 1500);
  };

  // Handle purchase
  const handlePurchase = async () => {
    if (!isValidAmount) {
      setErrorMessage(`Amount must be between $${minPurchase} and $${maxPurchase}`);
      return;
    }

    setTransactionStatus('confirming');
    setErrorMessage('');

    try {
      // Simulate transaction flow
      setTimeout(() => setTransactionStatus('processing'), 1000);

      if (onPurchase) {
        await onPurchase(numericAmount, selectedMethod);
      }

      setTimeout(() => {
        setTransactionStatus('success');
        setTimeout(() => {
          setTransactionStatus('idle');
          setAmount('');
        }, 3000);
      }, 2500);
    } catch (error) {
      setTransactionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Transaction failed');
    }
  };

  // Quick amount buttons
  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <div className={`relative ${className}`}>
      {/* Main Widget Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 md:p-8 border border-white/20 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Purchase Tokens
          </h3>
          <p className="text-sm text-gray-400">
            1 Token = ${tokenPrice.toFixed(4)}
          </p>
        </div>

        {/* Payment Method Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            {paymentOptions.map((option) => (
              <motion.button
                key={option.method}
                onClick={() => setSelectedMethod(option.method)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-300
                  ${
                    selectedMethod === option.method
                      ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/50'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-semibold text-white">{option.label}</span>
                  </div>
                  {selectedMethod === option.method && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
                    >
                      <span className="text-white text-sm">✓</span>
                    </motion.div>
                  )}
                </div>
                {option.balance && (
                  <div className="text-xs text-gray-400 mt-1">
                    Balance: {option.balance} {option.label}
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Amount (USD)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min={minPurchase}
              max={maxPurchase}
              className={`
                w-full pl-12 pr-4 py-4 text-2xl font-bold
                bg-black/30 border-2 rounded-xl
                text-white placeholder-gray-600
                focus:outline-none focus:border-purple-500
                transition-colors duration-300
                ${!isValidAmount && amount ? 'border-red-500' : 'border-white/10'}
              `}
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {quickAmounts.map((quickAmount) => (
              <motion.button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="py-2 px-3 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                ${quickAmount}
              </motion.button>
            ))}
          </div>

          {/* Min/Max Info */}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Min: ${minPurchase}</span>
            <span>Max: ${maxPurchase.toLocaleString()}</span>
          </div>
        </div>

        {/* Token Calculator Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: amount ? 1 : 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30"
        >
          <div className="flex justify-between items-center">
            <span className="text-gray-300">You will receive:</span>
            <div className="text-right">
              <motion.div
                key={tokenAmount}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"
              >
                {tokenAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </motion.div>
              <div className="text-sm text-gray-400">Tokens</div>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
            >
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        {!isConnected ? (
          <motion.button
            onClick={handleConnect}
            disabled={transactionStatus === 'connecting'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {transactionStatus === 'connecting' ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  ⚡
                </motion.span>
                Connecting...
              </span>
            ) : (
              'Connect Wallet'
            )}
          </motion.button>
        ) : (
          <motion.button
            onClick={handlePurchase}
            disabled={!isValidAmount || transactionStatus !== 'idle'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            Buy Tokens
          </motion.button>
        )}

        {/* Wallet Info */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300">Wallet Connected</span>
            </div>
            <button
              onClick={() => setIsConnected(false)}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Disconnect
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Transaction Status Modal */}
      <AnimatePresence>
        {transactionStatus !== 'idle' && transactionStatus !== 'connecting' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => transactionStatus === 'success' && setTransactionStatus('idle')}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-8 max-w-md w-full text-center"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {transactionStatus === 'confirming' && (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="text-6xl mb-4"
                  >
                    🔄
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Confirm Transaction</h3>
                  <p className="text-gray-400">Please confirm in your wallet...</p>
                </>
              )}

              {transactionStatus === 'processing' && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    ⚡
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Processing</h3>
                  <p className="text-gray-400">Transaction is being processed...</p>
                </>
              )}

              {transactionStatus === 'success' && (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="text-6xl mb-4"
                  >
                    ✅
                  </motion.div>
                  <h3 className="text-2xl font-bold text-green-400 mb-2">Success!</h3>
                  <p className="text-gray-400 mb-4">
                    You received {tokenAmount.toLocaleString()} tokens
                  </p>
                  <button
                    onClick={() => setTransactionStatus('idle')}
                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </>
              )}

              {transactionStatus === 'error' && (
                <>
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl mb-4"
                  >
                    ❌
                  </motion.div>
                  <h3 className="text-2xl font-bold text-red-400 mb-2">Transaction Failed</h3>
                  <p className="text-gray-400 mb-4">{errorMessage || 'Please try again'}</p>
                  <button
                    onClick={() => setTransactionStatus('idle')}
                    className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
