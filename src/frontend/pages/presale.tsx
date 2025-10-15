'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Lock,
  Award,
  Clock,
  Target,
  Rocket,
  CheckCircle,
  ArrowRight,
  Wallet,
  AlertCircle,
  X,
  ExternalLink
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { usePresaleContract } from '../hooks/usePresaleContract';
import { formatters, TransactionStatus } from '../lib/contracts';

// Constants
const PRESALE_END = new Date('2025-11-10T00:00:00').getTime();
const PRESALE_PRICE = 0.0008;
const TARGET_RAISE = 80000;
const FOUNDING_MEMBERS_LIMIT = 500;

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface PurchaseForm {
  currency: 'BNB' | 'USDT';
  amount: string;
}

export default function PresalePage() {
  // Wallet state
  const {
    address,
    isConnected,
    isCorrectNetwork,
    bnbBalance,
    usdtBalance,
    isLoading: walletLoading,
    error: walletError,
    connectWallet,
    switchToBSC,
  } = useWallet();

  // Presale contract state
  const {
    presaleStats,
    userInfo,
    isLoading: presaleLoading,
    error: presaleError,
    txStatus,
    txHash,
    purchaseTokens,
    resetTransaction,
  } = usePresaleContract(
    isConnected && isCorrectNetwork ? (window as any).ethereum : null,
    address
  );

  // Local state
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [purchaseForm, setPurchaseForm] = useState<PurchaseForm>({
    currency: 'BNB',
    amount: ''
  });
  const [showParticles, setShowParticles] = useState(true);
  const [showTxModal, setShowTxModal] = useState(false);
  const [inputError, setInputError] = useState<string>('');

  // Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = PRESALE_END - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-open transaction modal when status changes
  useEffect(() => {
    if (txStatus !== TransactionStatus.IDLE) {
      setShowTxModal(true);
    }
  }, [txStatus]);

  // Calculate values
  const calculateTokens = useMemo((): number => {
    const amount = parseFloat(purchaseForm.amount) || 0;
    if (amount <= 0) return 0;

    const usdValue = purchaseForm.currency === 'BNB' ? amount * 600 : amount;
    const baseTokens = usdValue / PRESALE_PRICE;
    const bonusTokens = baseTokens * 0.1; // 10% bonus
    return baseTokens + bonusTokens;
  }, [purchaseForm]);

  const calculateUSDValue = useMemo((): number => {
    const amount = parseFloat(purchaseForm.amount) || 0;
    return purchaseForm.currency === 'BNB' ? amount * 600 : amount;
  }, [purchaseForm]);

  // Input validation
  const validateInput = (value: string): string | null => {
    const amount = parseFloat(value);

    if (isNaN(amount) || amount <= 0) {
      return 'Please enter a valid amount';
    }

    if (amount < 0.001) {
      return 'Amount too small';
    }

    const usdValue = purchaseForm.currency === 'BNB' ? amount * 600 : amount;

    if (usdValue < 40) {
      return 'Minimum purchase is $40';
    }

    if (usdValue > 800) {
      return 'Maximum purchase is $800';
    }

    // Check balance
    const balance = purchaseForm.currency === 'BNB' ? parseFloat(bnbBalance) : parseFloat(usdtBalance);
    if (amount > balance) {
      return `Insufficient ${purchaseForm.currency} balance`;
    }

    return null;
  };

  // Handle amount change
  const handleAmountChange = (value: string) => {
    setPurchaseForm(prev => ({ ...prev, amount: value }));

    if (value) {
      const error = validateInput(value);
      setInputError(error || '');
    } else {
      setInputError('');
    }
  };

  // Handle wallet connect
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  // Handle purchase
  const handlePurchase = async () => {
    if (!isConnected) {
      await handleConnectWallet();
      return;
    }

    if (!isCorrectNetwork) {
      await switchToBSC();
      return;
    }

    const validationError = validateInput(purchaseForm.amount);
    if (validationError) {
      setInputError(validationError);
      return;
    }

    // Execute purchase
    await purchaseTokens({
      currency: purchaseForm.currency,
      amount: purchaseForm.amount,
      onApproving: () => console.log('Approving USDT...'),
      onPending: () => console.log('Transaction pending...'),
      onSuccess: (hash) => {
        console.log('Purchase successful:', hash);
        setPurchaseForm(prev => ({ ...prev, amount: '' }));
      },
      onError: (err) => console.error('Purchase failed:', err)
    });
  };

  // Progress percentage
  const progressPercentage = presaleStats
    ? (parseFloat(presaleStats.totalUSDRaised) / TARGET_RAISE) * 100
    : 0;

  const raised = presaleStats ? parseFloat(presaleStats.totalUSDRaised) : 0;
  const foundingMembers = presaleStats ? presaleStats.foundingMembersCount : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-hidden relative">
      {/* Animated Background Particles */}
      {showParticles && typeof window !== 'undefined' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: Math.random()
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                opacity: [null, Math.random(), 0]
              }}
              transition={{
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          ))}
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent animate-pulse-slow" />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-16 relative"
        >
          {/* Founding Members Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 backdrop-blur-sm mb-8"
          >
            <Award className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-yellow-400 font-bold text-sm tracking-wider">
              FOUNDING MEMBERS ONLY • LIMITED TO {FOUNDING_MEMBERS_LIMIT}
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-6xl md:text-8xl font-black mb-6 leading-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-gradient-x">
              Join 15 AI Agents
            </span>
            <br />
            <span className="text-white">Building The Future</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            Be part of the revolutionary AI-powered crypto ecosystem.
            <br />
            <span className="text-cyan-400 font-semibold">
              First-mover advantage. Lifetime VIP benefits. Unprecedented ROI.
            </span>
          </motion.p>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mb-12"
          >
            {[
              { label: 'DAYS', value: countdown.days },
              { label: 'HOURS', value: countdown.hours },
              { label: 'MINUTES', value: countdown.minutes },
              { label: 'SECONDS', value: countdown.seconds }
            ].map((item) => (
              <div key={item.label} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30">
                  <div className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400 font-semibold mt-2 tracking-widest">
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* Live Stats Dashboard */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Raised Amount */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <span className="text-sm text-gray-400 font-semibold">RAISED</span>
                </div>
                <div className="text-4xl font-black text-green-400">
                  ${raised.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  of ${TARGET_RAISE.toLocaleString()} goal
                </div>
              </div>
            </div>

            {/* Founding Members */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-6 h-6 text-purple-400" />
                  <span className="text-sm text-gray-400 font-semibold">FOUNDING MEMBERS</span>
                </div>
                <div className="text-4xl font-black text-purple-400">
                  {foundingMembers}/{FOUNDING_MEMBERS_LIMIT}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {((foundingMembers / FOUNDING_MEMBERS_LIMIT) * 100).toFixed(1)}% filled
                </div>
              </div>
            </div>

            {/* Token Price */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-6 h-6 text-cyan-400" />
                  <span className="text-sm text-gray-400 font-semibold">PRESALE PRICE</span>
                </div>
                <div className="text-4xl font-black text-cyan-400">
                  ${PRESALE_PRICE}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Launch price: $0.0016 (+100%)
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-30" />
            <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-full p-2 border border-cyan-500/30">
              <div className="relative h-8 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-green-500 via-cyan-500 to-purple-500 rounded-full relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-white drop-shadow-lg">
                    {progressPercentage.toFixed(1)}% Complete
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Purchase Widget */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-8 border border-cyan-500/30">
              <h2 className="text-3xl font-black mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                Secure Your Position Now
              </h2>

              {/* Wallet Status Alert */}
              {!isConnected && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 font-semibold">Wallet Not Connected</p>
                    <p className="text-sm text-gray-400 mt-1">Please connect your wallet to participate in the presale</p>
                  </div>
                </div>
              )}

              {isConnected && !isCorrectNetwork && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-semibold">Wrong Network</p>
                    <p className="text-sm text-gray-400 mt-1">Please switch to BNB Smart Chain</p>
                    <button
                      onClick={switchToBSC}
                      className="mt-2 text-sm text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      Switch Network →
                    </button>
                  </div>
                </div>
              )}

              {/* User Info */}
              {isConnected && isCorrectNetwork && userInfo && (
                <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Your Contribution:</span>
                      <p className="text-white font-bold">${userInfo.contribution}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Tokens Purchased:</span>
                      <p className="text-cyan-400 font-bold">
                        {formatters.formatTokenAmount(userInfo.tokensPurchased)}
                      </p>
                    </div>
                  </div>
                  {userInfo.isFoundingMember && (
                    <div className="mt-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-semibold text-sm">Founding Member</span>
                    </div>
                  )}
                </div>
              )}

              {/* Currency Toggle */}
              <div className="flex gap-4 mb-6">
                {(['BNB', 'USDT'] as const).map((currency) => (
                  <button
                    key={currency}
                    onClick={() => setPurchaseForm(prev => ({ ...prev, currency }))}
                    disabled={!isConnected || !isCorrectNetwork}
                    className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                      purchaseForm.currency === currency
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50'
                        : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {currency}
                    {isConnected && isCorrectNetwork && (
                      <span className="block text-xs mt-1">
                        Balance: {currency === 'BNB' ? bnbBalance : usdtBalance}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Amount ({purchaseForm.currency})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={purchaseForm.amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.0"
                    disabled={!isConnected || !isCorrectNetwork}
                    className={`w-full bg-slate-800 border ${
                      inputError ? 'border-red-500' : 'border-slate-700'
                    } rounded-xl px-6 py-4 text-2xl font-bold text-white focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    {purchaseForm.currency}
                  </div>
                </div>
                {inputError && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {inputError}
                  </p>
                )}
                {purchaseForm.amount && !inputError && (
                  <div className="mt-2 text-sm text-gray-400">
                    ≈ ${calculateUSDValue.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
                  </div>
                )}
              </div>

              {/* Token Calculation Preview */}
              {purchaseForm.amount && !inputError && calculateTokens > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">You will receive:</span>
                    <span className="text-2xl font-black text-cyan-400">
                      {calculateTokens.toLocaleString('en-US', { maximumFractionDigits: 0 })} HYPEAI
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-gray-500">Includes 10% bonus</span>
                    <span className="text-green-400 font-bold">
                      +{(calculateTokens * 0.1 / 1.1).toLocaleString('en-US', { maximumFractionDigits: 0 })} bonus tokens
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Action Button */}
              {!isConnected ? (
                <button
                  onClick={handleConnectWallet}
                  disabled={walletLoading}
                  className="w-full py-5 rounded-xl font-black text-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 transition-all shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/75 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Wallet className="inline-block w-6 h-6 mr-2" />
                  {walletLoading ? 'Connecting...' : 'Connect MetaMask'}
                </button>
              ) : !isCorrectNetwork ? (
                <button
                  onClick={switchToBSC}
                  disabled={walletLoading}
                  className="w-full py-5 rounded-xl font-black text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 transition-all shadow-lg shadow-orange-500/50 hover:shadow-orange-500/75 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <AlertCircle className="inline-block w-6 h-6 mr-2" />
                  {walletLoading ? 'Switching...' : 'Switch to BSC Network'}
                </button>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={
                    !purchaseForm.amount ||
                    !!inputError ||
                    presaleLoading ||
                    txStatus === TransactionStatus.PENDING ||
                    txStatus === TransactionStatus.APPROVING
                  }
                  className="w-full py-5 rounded-xl font-black text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 transition-all shadow-lg shadow-green-500/50 hover:shadow-green-500/75 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Rocket className="inline-block w-6 h-6 mr-2" />
                  {txStatus === TransactionStatus.APPROVING && 'Approving USDT...'}
                  {txStatus === TransactionStatus.PENDING && 'Processing...'}
                  {(txStatus === TransactionStatus.IDLE || txStatus === TransactionStatus.ERROR || txStatus === TransactionStatus.SUCCESS) && 'Buy Tokens Now'}
                  <ArrowRight className="inline-block w-6 h-6 ml-2" />
                </button>
              )}

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Secured by Smart Contract • Audited by AI Agents</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Transaction Status Modal */}
        <AnimatePresence>
          {showTxModal && txStatus !== TransactionStatus.IDLE && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => {
                if (txStatus === TransactionStatus.SUCCESS || txStatus === TransactionStatus.ERROR) {
                  setShowTxModal(false);
                  resetTransaction();
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-cyan-500/30"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-black">Transaction Status</h3>
                  {(txStatus === TransactionStatus.SUCCESS || txStatus === TransactionStatus.ERROR) && (
                    <button
                      onClick={() => {
                        setShowTxModal(false);
                        resetTransaction();
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </div>

                {txStatus === TransactionStatus.APPROVING && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xl font-bold mb-2">Approving USDT</p>
                    <p className="text-gray-400">Please confirm the approval transaction in your wallet...</p>
                  </div>
                )}

                {txStatus === TransactionStatus.PENDING && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xl font-bold mb-2">Processing Purchase</p>
                    <p className="text-gray-400">Please wait while your transaction is being processed...</p>
                    {txHash && (
                      <a
                        href={`https://bscscan.com/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                      >
                        View on BscScan <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}

                {txStatus === TransactionStatus.SUCCESS && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-xl font-bold mb-2 text-green-400">Purchase Successful!</p>
                    <p className="text-gray-400 mb-4">Your tokens have been sent to your wallet</p>
                    {txHash && (
                      <a
                        href={`https://bscscan.com/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                      >
                        View on BscScan <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}

                {txStatus === TransactionStatus.ERROR && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-xl font-bold mb-2 text-red-400">Transaction Failed</p>
                    <p className="text-gray-400">{presaleError || 'Please try again'}</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
