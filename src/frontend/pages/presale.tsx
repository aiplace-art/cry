'use client';

import React, { useState, useEffect } from 'react';
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
  Wallet
} from 'lucide-react';

// Types
interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface PurchaseMode {
  currency: 'BNB' | 'USDT';
  amount: string;
}

// Constants
const PRESALE_END = new Date('2025-11-10T00:00:00').getTime();
const TOTAL_SUPPLY = 100_000_000;
const PRESALE_PRICE = 0.05;
const TARGET_RAISE = 5_000_000;
const FOUNDING_MEMBERS_LIMIT = 1000;

export default function PresalePage() {
  // State Management
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [raised, setRaised] = useState(1_234_567);
  const [foundingMembers, setFoundingMembers] = useState(342);
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode>({
    currency: 'BNB',
    amount: ''
  });
  const [isConnected, setIsConnected] = useState(false);
  const [showParticles, setShowParticles] = useState(true);

  // Countdown Timer Effect
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

  // Live Stats Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRaised(prev => prev + Math.random() * 100);
      if (foundingMembers < FOUNDING_MEMBERS_LIMIT) {
        if (Math.random() > 0.95) {
          setFoundingMembers(prev => prev + 1);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [foundingMembers]);

  // Calculate Token Amount
  const calculateTokens = (): number => {
    const amount = parseFloat(purchaseMode.amount) || 0;
    const usdValue = purchaseMode.currency === 'BNB' ? amount * 320 : amount;
    return usdValue / PRESALE_PRICE;
  };

  // Connect Wallet Handler
  const handleConnectWallet = async () => {
    // MetaMask connection logic would go here
    setIsConnected(true);
  };

  // Buy Tokens Handler
  const handleBuyTokens = async () => {
    if (!isConnected) {
      await handleConnectWallet();
      return;
    }
    // Purchase logic would go here
    console.log('Purchasing tokens:', calculateTokens());
  };

  // Progress Percentage
  const progressPercentage = (raised / TARGET_RAISE) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-hidden relative">
      {/* Animated Background Particles */}
      {showParticles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
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

      {/* Main Content Container */}
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
            ].map((item, idx) => (
              <div
                key={item.label}
                className="relative group"
              >
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
                  Launch price: $0.10 (+100%)
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

              {/* Currency Toggle */}
              <div className="flex gap-4 mb-6">
                {(['BNB', 'USDT'] as const).map((currency) => (
                  <button
                    key={currency}
                    onClick={() => setPurchaseMode({ ...purchaseMode, currency })}
                    className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                      purchaseMode.currency === currency
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50'
                        : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                    }`}
                  >
                    {currency}
                  </button>
                ))}
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Amount ({purchaseMode.currency})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={purchaseMode.amount}
                    onChange={(e) => setPurchaseMode({ ...purchaseMode, amount: e.target.value })}
                    placeholder="0.0"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-6 py-4 text-2xl font-bold text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    {purchaseMode.currency}
                  </div>
                </div>
                {purchaseMode.amount && (
                  <div className="mt-2 text-sm text-gray-400">
                    ≈ ${((parseFloat(purchaseMode.amount) || 0) * (purchaseMode.currency === 'BNB' ? 320 : 1)).toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
                  </div>
                )}
              </div>

              {/* Token Calculation Preview */}
              {purchaseMode.amount && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">You will receive:</span>
                    <span className="text-2xl font-black text-cyan-400">
                      {calculateTokens().toLocaleString('en-US', { maximumFractionDigits: 0 })} TOKENS
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-gray-500">Value at launch ($0.10):</span>
                    <span className="text-green-400 font-bold">
                      ${(calculateTokens() * 0.10).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-sm">
                    <span className="text-gray-500">Instant profit:</span>
                    <span className="text-green-400 font-bold">
                      +{((calculateTokens() * 0.10) - (parseFloat(purchaseMode.amount) * (purchaseMode.currency === 'BNB' ? 320 : 1))).toLocaleString('en-US', { maximumFractionDigits: 2 })} USD (+100%)
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              {!isConnected ? (
                <button
                  onClick={handleConnectWallet}
                  className="w-full py-5 rounded-xl font-black text-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 transition-all shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/75 hover:scale-105 transform"
                >
                  <Wallet className="inline-block w-6 h-6 mr-2" />
                  Connect MetaMask
                </button>
              ) : (
                <button
                  onClick={handleBuyTokens}
                  disabled={!purchaseMode.amount || parseFloat(purchaseMode.amount) <= 0}
                  className="w-full py-5 rounded-xl font-black text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 transition-all shadow-lg shadow-green-500/50 hover:shadow-green-500/75 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Rocket className="inline-block w-6 h-6 mr-2" />
                  Buy Tokens Now
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

        {/* Benefits Grid */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
              Founding Member Benefits
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Award className="w-8 h-8" />,
                title: 'Lifetime VIP Status',
                description: 'Exclusive access to premium features, priority support, and special events forever.',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: '100% Instant Profit',
                description: 'Buy at $0.05, launch at $0.10. Guaranteed 2x return on day one.',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Early Access',
                description: 'Be first to try new AI agents, features, and exclusive beta programs.',
                color: 'from-cyan-500 to-blue-500'
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Governance Rights',
                description: 'Vote on key decisions and shape the future of the ecosystem.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: <Lock className="w-8 h-8" />,
                title: 'Bonus Rewards',
                description: 'Earn 20% more staking rewards and exclusive airdrops.',
                color: 'from-red-500 to-rose-500'
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: 'NFT Collection',
                description: 'Receive exclusive founding member NFT with special utilities.',
                color: 'from-indigo-500 to-violet-500'
              }
            ].map((benefit, idx) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7 + idx * 0.1 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${benefit.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity`} />
                <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 group-hover:border-cyan-500/50 transition-all h-full">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${benefit.color} mb-4`}>
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-black mb-2 text-white">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Trust Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                Built by 15 AI Agents
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              The most advanced AI-powered crypto project in existence
            </p>
          </div>

          {/* Security Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: <Shield />, title: 'Smart Contract Audited', desc: 'Verified by leading security firms' },
              { icon: <Lock />, title: 'Liquidity Locked', desc: '100% locked for 2 years' },
              { icon: <CheckCircle />, title: 'KYC Verified', desc: 'Full team verification complete' }
            ].map((item, idx) => (
              <div
                key={item.title}
                className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30 text-center"
              >
                <div className="inline-flex p-4 rounded-full bg-green-500/20 text-green-400 mb-4">
                  {item.icon}
                </div>
                <h3 className="font-black text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* AI Agents Showcase */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30" />
            <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/30">
              <h3 className="text-2xl font-black text-center mb-8">Meet Our AI Team</h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {[
                  'Strategist', 'Analyst', 'Developer', 'Marketer', 'Trader',
                  'Risk Manager', 'Community', 'Content', 'Security', 'Research',
                  'Growth', 'Operations', 'Finance', 'Legal', 'Innovation'
                ].map((agent, idx) => (
                  <motion.div
                    key={agent}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2 + idx * 0.05 }}
                    className="text-center group cursor-pointer"
                  >
                    <div className="relative mb-2">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity" />
                      <div className="relative w-16 h-16 mx-auto bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-black">
                        {agent[0]}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 group-hover:text-cyan-400 transition-colors">
                      {agent}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2 }}
          className="text-center py-16"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-50 animate-pulse" />
            <div className="relative bg-slate-900 rounded-3xl p-12 border border-cyan-500/50">
              <h2 className="text-4xl md:text-6xl font-black mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                  Don't Miss Out!
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                Only {FOUNDING_MEMBERS_LIMIT - foundingMembers} founding member spots remaining.
                <br />
                <span className="text-cyan-400 font-bold">Join now or regret forever.</span>
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-12 py-6 rounded-xl font-black text-xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 transition-all shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/75"
              >
                <Rocket className="inline-block w-6 h-6 mr-2" />
                Secure My Position Now
                <ArrowRight className="inline-block w-6 h-6 ml-2" />
              </motion.button>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
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
