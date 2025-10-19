import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  CreditCard,
  TrendingUp,
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface BuyPanelProps {
  minInvestment?: number;
  maxInvestment?: number;
  bonusPercentage?: number;
  tokenPrice?: number;
}

type PaymentMethod = 'wallet' | 'card';

export function MobileBuyPanel({
  minInvestment = 100,
  maxInvestment = 50000,
  bonusPercentage = 25,
  tokenPrice = 0.0012,
}: BuyPanelProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const bonusAmount = (numAmount * bonusPercentage) / 100;
  const totalAmount = numAmount + bonusAmount;
  const tokensReceived = totalAmount / tokenPrice;

  const isValid = numAmount >= minInvestment && numAmount <= maxInvestment;
  const errorMessage =
    numAmount < minInvestment && numAmount > 0
      ? `Minimum investment: $${minInvestment}`
      : numAmount > maxInvestment
      ? `Maximum investment: $${maxInvestment}`
      : null;

  const handleBuy = async () => {
    if (!isValid) return;

    setIsProcessing(true);

    // Simulate purchase
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setAmount('');
    }, 3000);
  };

  return (
    <div className="w-full">
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Buy HYPE Tokens</h2>
          <p className="text-white/80 text-sm">
            Get {bonusPercentage}% bonus during private sale
          </p>
        </div>

        {/* Payment Method Selection */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('wallet')}
              className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 transition-all touch-manipulation no-tap-highlight ${
                paymentMethod === 'wallet'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              style={{ minHeight: '60px' }}
            >
              <Wallet className={`w-5 h-5 ${
                paymentMethod === 'wallet' ? 'text-primary-600' : 'text-gray-400'
              }`} />
              <span className={`font-medium ${
                paymentMethod === 'wallet'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                Wallet
              </span>
            </button>

            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 transition-all touch-manipulation no-tap-highlight ${
                paymentMethod === 'card'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              style={{ minHeight: '60px' }}
            >
              <CreditCard className={`w-5 h-5 ${
                paymentMethod === 'card' ? 'text-primary-600' : 'text-gray-400'
              }`} />
              <span className={`font-medium ${
                paymentMethod === 'card'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                Card
              </span>
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Investment Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-12 pr-4 py-5 text-2xl font-bold bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 outline-none transition-all no-tap-highlight"
                style={{ fontSize: '24px', minHeight: '68px' }}
              />
            </div>

            {errorMessage && (
              <motion.div
                className="flex items-center gap-2 mt-2 text-red-600 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </motion.div>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 5000].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className="px-3 py-3 text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation no-tap-highlight"
                style={{ minHeight: '48px' }}
              >
                ${preset}
              </button>
            ))}
          </div>

          {/* Calculation Summary */}
          {numAmount > 0 && (
            <motion.div
              className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl space-y-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Base Amount</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${numAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600 dark:text-green-400">
                  Bonus ({bonusPercentage}%)
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  +${bonusAmount.toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Total Value
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t-2 border-primary-600">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary-600 dark:text-primary-400">
                    HYPE Tokens
                  </span>
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {tokensReceived.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Buy Button */}
          <motion.button
            onClick={handleBuy}
            disabled={!isValid || isProcessing}
            className={`w-full py-5 rounded-xl font-bold text-lg transition-all touch-manipulation no-tap-highlight ${
              isValid && !isProcessing
                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
            }`}
            style={{ minHeight: '64px' }}
            whileTap={isValid && !isProcessing ? { scale: 0.98 } : {}}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing...
              </span>
            ) : showSuccess ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                Success!
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Buy HYPE Tokens
              </span>
            )}
          </motion.button>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-bnb-primary/5 dark:bg-bnb-darker/20 rounded-xl">
            <Info className="w-5 h-5 text-bnb-primary dark:text-bnb-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-bnb-textSecondary dark:text-bnb-text">
              Tokens will be locked for 6 months and vested linearly over 12 months after the lock period.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed bottom-24 left-4 right-4 z-50"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="p-4 bg-green-500 rounded-xl shadow-xl">
              <div className="flex items-center gap-3 text-white">
                <CheckCircle2 className="w-6 h-6" />
                <div>
                  <p className="font-bold">Purchase Successful!</p>
                  <p className="text-sm opacity-90">
                    You will receive {tokensReceived.toLocaleString(undefined, { maximumFractionDigits: 0 })} HYPE tokens
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
