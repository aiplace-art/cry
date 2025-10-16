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
const LAUNCH_DATE = new Date('2025-11-15T00:00:00').getTime();
const INITIAL_PRICE = 0.0001; // Solana launch price
const COMMUNITY_TARGET = 1000;
const TARGET_RAISE = 80000; // $80k target for progress bar
const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/HypeAI_SOL',
  telegram: 'https://t.me/HypeAI_Community',
  pumpfun: 'https://pump.fun/hypeai',
};

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
  const [showParticles, setShowParticles] = useState(false);

  // Enable particles only on client side to avoid hydration errors
  useEffect(() => {
    setShowParticles(true);
  }, []);
  const [showTxModal, setShowTxModal] = useState(false);
  const [inputError, setInputError] = useState<string>('');

  // Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = LAUNCH_DATE - now;

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
    const baseTokens = usdValue / 0.0001; // $0.0001 per token
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
          {[...Array(20)].map((_, i) => {
            const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
            const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                initial={{
                  x: Math.random() * viewportWidth,
                  y: Math.random() * viewportHeight,
                  opacity: Math.random()
                }}
                animate={{
                  y: [null, Math.random() * viewportHeight],
                  opacity: [null, Math.random(), 0]
                }}
                transition={{
                  duration: Math.random() * 10 + 5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            );
          })}
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent animate-pulse-slow" />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.section
          
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-16 relative"
        >
          {/* Community Launch Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/50 backdrop-blur-sm mb-8"
          >
            <Rocket className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-purple-400 font-bold text-sm tracking-wider">
              COMMUNITY LAUNCH ON SOLANA • POWERED BY PUMP.FUN
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-6xl md:text-8xl font-black mb-6 leading-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-gradient-x">
              15 AI Agents
            </span>
            <br />
            <span className="text-white">Building On Solana</span>
          </motion.h1>

          <motion.p
            
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            The first truly community-driven AI crypto project.
            <br />
            <span className="text-cyan-400 font-semibold">
              Fair launch. No presale. 100% transparency.
            </span>
          </motion.p>

          {/* Countdown Timer */}
          <motion.div
            
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

        {/* Why Solana First? Section */}
        <motion.section
          
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mb-16 max-w-4xl mx-auto"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-8 border border-cyan-500/30">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                  Why Solana First?
                </h2>
                <p className="text-lg text-gray-300 mb-6">
                  We're taking a different path. Here's why we chose a community launch over a traditional presale:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-800/50 rounded-xl border border-cyan-500/20">
                  <div className="flex items-start gap-3 mb-3">
                    <Zap className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-cyan-400 mb-2">Lightning Fast</h3>
                      <p className="text-gray-400 text-sm">
                        Solana's sub-second finality and low fees make it perfect for our AI-powered trading agents.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-800/50 rounded-xl border border-purple-500/20">
                  <div className="flex items-start gap-3 mb-3">
                    <Users className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-purple-400 mb-2">Community First</h3>
                      <p className="text-gray-400 text-sm">
                        Fair launch on pump.fun means everyone gets the same opportunity. No VCs, no insiders.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-800/50 rounded-xl border border-green-500/20">
                  <div className="flex items-start gap-3 mb-3">
                    <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-green-400 mb-2">100% Transparent</h3>
                      <p className="text-gray-400 text-sm">
                        All code is open source. All decisions are community-driven. All 15 AI agents work in public.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-800/50 rounded-xl border border-yellow-500/20">
                  <div className="flex items-start gap-3 mb-3">
                    <Sparkles className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-yellow-400 mb-2">AI-Native Chain</h3>
                      <p className="text-gray-400 text-sm">
                        Solana's ecosystem is embracing AI agents. We're building where the innovation happens.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30">
                <h3 className="text-xl font-bold mb-3 text-center">Our Commitment</h3>
                <p className="text-gray-300 text-center leading-relaxed">
                  We initially explored BSC, but we realized that true innovation requires a community-first approach.
                  Solana and pump.fun enable us to launch fairly, transparently, and with full community participation from day one.
                  No hidden allocations, no team tokens unlock later. Just pure community ownership.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Community Stats */}
        <motion.section
          
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Community Members */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-6 h-6 text-purple-400" />
                  <span className="text-sm text-gray-400 font-semibold">COMMUNITY GOAL</span>
                </div>
                <div className="text-4xl font-black text-purple-400">
                  {COMMUNITY_TARGET}+
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Members before launch
                </div>
              </div>
            </div>

            {/* Initial Price */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-6 h-6 text-cyan-400" />
                  <span className="text-sm text-gray-400 font-semibold">FAIR LAUNCH PRICE</span>
                </div>
                <div className="text-4xl font-black text-cyan-400">
                  ${INITIAL_PRICE}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Set by pump.fun bonding curve
                </div>
              </div>
            </div>

            {/* Launch Platform */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <Rocket className="w-6 h-6 text-green-400" />
                  <span className="text-sm text-gray-400 font-semibold">LAUNCH PLATFORM</span>
                </div>
                <div className="text-4xl font-black text-green-400">
                  pump.fun
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Fair launch on Solana
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Join the Movement CTA */}
        <motion.section
          
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-8 border border-cyan-500/30">
              <h2 className="text-3xl font-black mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                Join the Movement
              </h2>

              <p className="text-center text-gray-300 mb-8 text-lg">
                Be part of the first AI-powered crypto project launching on Solana.
                Join our community and help shape the future of decentralized AI.
              </p>

              {/* Social Links Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Twitter */}
                <a
                  href={SOCIAL_LINKS.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 border border-cyan-500/30 hover:border-cyan-500/60 transition-all transform hover:scale-105">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Follow us on</p>
                        <p className="text-lg font-bold text-white">Twitter</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">Get real-time updates from our AI agents</p>
                  </div>
                </a>

                {/* Telegram */}
                <a
                  href={SOCIAL_LINKS.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30 hover:border-purple-500/60 transition-all transform hover:scale-105">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Join our</p>
                        <p className="text-lg font-bold text-white">Telegram</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">Chat with the community 24/7</p>
                  </div>
                </a>

                {/* pump.fun */}
                <a
                  href={SOCIAL_LINKS.pumpfun}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 border border-green-500/30 hover:border-green-500/60 transition-all transform hover:scale-105">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Rocket className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Launch on</p>
                        <p className="text-lg font-bold text-white">pump.fun</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">Fair launch platform on Solana</p>
                  </div>
                </a>
              </div>

              {/* Launch Details */}
              <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Launch Date</p>
                    <p className="text-white font-bold text-lg">
                      {new Date(LAUNCH_DATE).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Blockchain</p>
                    <p className="text-cyan-400 font-bold text-lg">Solana</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Platform</p>
                    <p className="text-purple-400 font-bold text-lg">pump.fun</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Initial Price</p>
                    <p className="text-green-400 font-bold text-lg">${INITIAL_PRICE}</p>
                  </div>
                </div>
              </div>

              {/* Main CTA */}
              <a
                href={SOCIAL_LINKS.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <button className="w-full py-5 rounded-xl font-black text-lg bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/75 hover:scale-105 transform">
                  <Users className="inline-block w-6 h-6 mr-2" />
                  Join Our Community Now
                  <ArrowRight className="inline-block w-6 h-6 ml-2" />
                </button>
              </a>

              {/* Info Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Open Source • Community Owned • AI Powered</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* AI Agents Section */}
        <motion.section
          
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          className="mb-16 max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
              Meet the 15 AI Agents
            </h2>
            <p className="text-lg text-gray-300">
              Autonomous agents working 24/7 to build, trade, and grow the ecosystem
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Trader', icon: TrendingUp, color: 'green' },
              { name: 'Developer', icon: Zap, color: 'cyan' },
              { name: 'Analyst', icon: Target, color: 'purple' },
              { name: 'Community', icon: Users, color: 'pink' },
              { name: 'Security', icon: Shield, color: 'yellow' },
              { name: 'Marketing', icon: Sparkles, color: 'orange' },
              { name: 'Research', icon: Clock, color: 'blue' },
              { name: 'Strategy', icon: Award, color: 'red' },
              { name: 'Integration', icon: Lock, color: 'indigo' },
              { name: 'Growth', icon: Rocket, color: 'teal' },
            ].map((agent, i) => {
              const Icon = agent.icon;
              return (
                <div key={i} className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r from-${agent.color}-500 to-${agent.color}-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity`} />
                  <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-xl p-4 border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                    <Icon className={`w-8 h-8 text-${agent.color}-400 mb-2 mx-auto`} />
                    <p className="text-xs font-bold text-center text-gray-300">{agent.name}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              + 5 more specialized agents in development
            </p>
          </div>
        </motion.section>
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
