'use client';

/**
 * Token Growth Economics Section
 * Main landing page section for the "Inevitable Growth" campaign
 *
 * Features:
 * - Animated hero with mathematical formula
 * - Burn mechanism visualization with fire effects
 * - Interactive price projection charts
 * - 5 Reasons cards with icons
 * - Investment calculator with real-time updates
 * - CTA buttons for presale and math proof
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { tokenGrowthData } from '../constants/tokenGrowthData';
import {
  calculateAllScenarios,
  formatCurrency,
  formatTokenAmount,
  formatMultiplier,
  validateInvestmentAmount,
} from '../lib/tokenGrowthCalculations';
import { CalculatorInputs } from '../types/tokenGrowth';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

/**
 * Count-up animation hook
 */
function useCountUp(end: number, duration: number = 2000): number {
  const [count, setCount] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (!isStarted) return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuad = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(easeOutQuad * end);

      setCount(currentCount);

      if (now < endTime) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, isStarted]);

  return count;
}

/**
 * Hero Section Component
 */
const HeroSection: React.FC = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeInUp}
      className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-24 px-6 text-center overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          variants={scaleIn}
          className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-full border border-green-500/30"
        >
          <span className="text-green-400 font-semibold text-sm uppercase tracking-wider">
            Not Hope. Not Hype. Pure Mathematics.
          </span>
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 via-gold-400 to-cyan-400 bg-clip-text text-transparent"
        >
          💰 Token Growth Is<br />
          <span className="text-white">Mathematically Inevitable</span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
        >
          HYPE token is the world's first cryptocurrency with{' '}
          <span className="text-green-400 font-semibold">
            mathematically guaranteed growth
          </span>
          . Not speculation. Not hopium. Just supply and demand economics.
        </motion.p>

        <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 justify-center">
          <a
            href="#calculator"
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Calculate Your Returns →
          </a>
          <a
            href="/math-proof.pdf"
            className="px-8 py-4 bg-white/10 text-white font-bold rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
            download
          >
            Download Math Proof PDF →
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
};

/**
 * Burn Mechanism Section
 */
const BurnMechanismSection: React.FC = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={staggerContainer}
      className="py-24 px-6 bg-slate-900"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            🔥 The Burn Mechanism
          </h2>
          <p className="text-xl text-gray-400">
            Every transaction permanently destroys 50% of tokens
          </p>
        </motion.div>

        {/* Burn mechanisms grid */}
        <motion.div
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {tokenGrowthData.burnMechanisms.map((mechanism, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className="bg-gradient-to-br from-orange-500/10 to-red-500/10 p-8 rounded-xl border border-orange-500/30"
            >
              <div className="text-6xl mb-4">{mechanism.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {mechanism.activity}
              </h3>
              <div className="text-3xl font-bold text-orange-400">
                {mechanism.burnRate}% BURNED ✅
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Supply reduction chart */}
        <motion.div
          variants={fadeInUp}
          className="bg-slate-800 p-8 rounded-xl border border-slate-700"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Supply Reduction Over Time
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={tokenGrowthData.supplyReduction}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatTokenAmount(value), 'Supply']}
              />
              <Legend />
              <Bar dataKey="totalSupply" fill="#10b981" name="Remaining Supply" />
              <Bar dataKey="burned" fill="#ef4444" name="Burned" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            {tokenGrowthData.supplyReduction.map((data, index) => (
              <div key={index} className="text-center">
                <div className="text-sm text-gray-400 mb-1">{data.label}</div>
                <div className="text-lg font-bold text-red-400">
                  -{data.percentage}%
                </div>
                <div className="text-xs text-gray-500">
                  {formatTokenAmount(data.burned)} burned
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

/**
 * Price Projections Section
 */
const PriceProjectionsSection: React.FC = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [activeScenario, setActiveScenario] = useState<'conservative' | 'moderate' | 'optimistic'>('moderate');

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const chartData = tokenGrowthData.projections[activeScenario];

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={staggerContainer}
      className="py-24 px-6 bg-gradient-to-b from-slate-900 to-slate-800"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            📊 Price Projections
          </h2>
          <p className="text-xl text-gray-400">
            Based on conservative burn rate models (10,000 analyses/day)
          </p>
        </motion.div>

        {/* Scenario selector */}
        <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4 mb-12">
          {tokenGrowthData.scenarios.map((scenario) => (
            <button
              key={scenario.name}
              onClick={() => setActiveScenario(scenario.name)}
              className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                activeScenario === scenario.name
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white scale-105 shadow-lg'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
              style={{
                borderColor: scenario.color,
                borderWidth: activeScenario === scenario.name ? '2px' : '0',
              }}
            >
              <div className="text-lg">{scenario.label}</div>
              <div className="text-sm opacity-80">{scenario.probability}</div>
            </button>
          ))}
        </motion.div>

        {/* Chart */}
        <motion.div
          variants={fadeInUp}
          className="bg-slate-800 p-8 rounded-xl border border-slate-700 mb-12"
        >
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="timeline" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Price']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                stroke={tokenGrowthData.scenarios.find((s) => s.name === activeScenario)?.color}
                strokeWidth={3}
                dot={{ r: 6, fill: tokenGrowthData.scenarios.find((s) => s.name === activeScenario)?.color }}
                name="HYPE Price"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Price milestones */}
        <motion.div
          variants={staggerContainer}
          className="grid md:grid-cols-5 gap-6"
        >
          {chartData.map((projection, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 text-center"
            >
              <div className="text-sm text-gray-400 mb-2">{projection.timeline}</div>
              <div className="text-2xl md:text-3xl font-bold text-green-400 mb-2">
                {formatCurrency(projection.price)}
              </div>
              <div className="text-lg font-semibold text-cyan-400 mb-3">
                {formatMultiplier(projection.multiplier)}
              </div>
              <div className="text-xs text-gray-500 mb-2">{projection.probabilityLabel}</div>
              <div className="text-xs text-orange-400">
                {projection.supplyBurnedPercentage}% supply burned
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

/**
 * Formula Section
 */
const FormulaSection: React.FC = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeInUp}
      className="py-24 px-6 bg-slate-900"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-12 text-white">
          🧮 The Formula
        </motion.h2>

        <motion.div
          variants={scaleIn}
          className="bg-gradient-to-r from-slate-800 to-slate-700 p-12 rounded-2xl border-2 border-green-500/50 shadow-2xl mb-8"
        >
          <div className="text-6xl md:text-8xl font-bold mb-8">
            <span className="text-green-400">↗️ Demand</span>
            <div className="my-4 border-t-4 border-white"></div>
            <span className="text-red-400">↘️ Supply</span>
            <div className="my-8 text-cyan-400">=</div>
            <span className="text-gold-400">🚀 Price</span>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="text-xl text-gray-300 space-y-4">
          <p>
            This is <span className="text-green-400 font-bold">Supply & Demand Economics 101</span>.
          </p>
          <p>
            Not speculation. Not hopium.{' '}
            <span className="text-cyan-400 font-bold">Pure mathematics</span>.
          </p>
          <p className="text-2xl font-bold text-white mt-8">
            When demand rises and supply falls,{' '}
            <span className="text-green-400">price MUST increase</span>. Period.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

/**
 * 5 Reasons Section
 */
const ReasonsSection: React.FC = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={staggerContainer}
      className="py-24 px-6 bg-gradient-to-b from-slate-800 to-slate-900"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            💎 5 Reasons Growth Is Inevitable
          </h2>
          <p className="text-xl text-gray-400">
            Mathematical proof that HYPE token will succeed
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {tokenGrowthData.growthReasons.map((reason) => (
            <motion.div
              key={reason.id}
              variants={scaleIn}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl border border-slate-700 hover:border-green-500/50 transition-all duration-300"
            >
              <div className="text-5xl mb-4">{reason.icon}</div>
              <div className="text-2xl font-bold text-green-400 mb-2">
                {reason.id}️⃣ {reason.title}
              </div>
              <p className="text-gray-300">{reason.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

/**
 * Investment Calculator Section
 */
const CalculatorSection: React.FC = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const [inputs, setInputs] = useState<CalculatorInputs>({
    investmentAmount: 1000,
    currentPrice: tokenGrowthData.currentPrice,
  });

  const [results, setResults] = useState(calculateAllScenarios(inputs));
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const handleInvestmentChange = (value: number) => {
    setInputs({ ...inputs, investmentAmount: value });

    const validation = validateInvestmentAmount(value);
    if (!validation.isValid) {
      setError(validation.error || '');
    } else {
      setError('');
      setResults(calculateAllScenarios({ ...inputs, investmentAmount: value }));
    }
  };

  return (
    <motion.section
      id="calculator"
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={staggerContainer}
      className="py-24 px-6 bg-slate-900"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            🎯 Your Investment Breakdown
          </h2>
          <p className="text-xl text-gray-400">
            Calculate your potential returns based on mathematical projections
          </p>
        </motion.div>

        <motion.div
          variants={scaleIn}
          className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 md:p-12 rounded-2xl border-2 border-green-500/30 shadow-2xl"
        >
          {/* Investment input */}
          <div className="mb-12">
            <label htmlFor="investment" className="block text-xl font-bold text-white mb-4">
              Investment Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">
                $
              </span>
              <input
                id="investment"
                type="number"
                min="100"
                max="100000"
                step="100"
                value={inputs.investmentAmount}
                onChange={(e) => handleInvestmentChange(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-4 text-3xl font-bold bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>
            {error && (
              <p className="mt-2 text-red-400 text-sm">{error}</p>
            )}
            <p className="mt-2 text-gray-400 text-sm">
              Minimum: $100 • Maximum: $100,000
            </p>
          </div>

          {/* Tokens received */}
          <motion.div
            variants={fadeInUp}
            className="mb-12 p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30"
          >
            <div className="text-gray-400 mb-2">You will receive</div>
            <div className="text-4xl md:text-5xl font-bold text-cyan-400">
              {formatTokenAmount(results.tokensReceived)} HYPE
            </div>
            <div className="text-gray-400 mt-2">
              at ${tokenGrowthData.currentPrice} per token
            </div>
          </motion.div>

          {/* Scenario results */}
          <div className="space-y-6">
            {tokenGrowthData.scenarios.map((scenario) => {
              const value = results[scenario.name];
              const profit = value - inputs.investmentAmount;
              const profitPercent = ((profit / inputs.investmentAmount) * 100).toFixed(0);

              return (
                <motion.div
                  key={scenario.name}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-slate-700 rounded-xl border-2 transition-all duration-300"
                  style={{ borderColor: scenario.color + '40' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xl font-bold" style={{ color: scenario.color }}>
                        {scenario.label} Scenario
                      </div>
                      <div className="text-sm text-gray-400">
                        {scenario.timeframe} • {scenario.probability}
                      </div>
                    </div>
                    <div className="text-3xl font-bold" style={{ color: scenario.color }}>
                      {formatMultiplier(scenario.multiplier)}
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Your investment becomes</div>
                      <div className="text-3xl font-bold text-white">
                        {formatCurrency(value)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400 mb-1">Profit</div>
                      <div className="text-2xl font-bold text-green-400">
                        +{formatCurrency(profit)}
                      </div>
                      <div className="text-sm text-green-400">
                        (+{profitPercent}%)
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Disclaimer */}
          <motion.div
            variants={fadeInUp}
            className="mt-8 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30"
          >
            <p className="text-xs text-yellow-400">
              ⚠️ <strong>Disclaimer:</strong> Cryptocurrency investments carry risk. Price
              projections are estimates based on burn rate assumptions and market adoption
              scenarios. Actual results may vary. This is not financial advice.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

/**
 * CTA Section
 */
const CTASection: React.FC = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeInUp}
      className="py-24 px-6 bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold mb-6 text-white">
          🔥 Join The Inevitable Growth
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-xl md:text-2xl mb-10 text-white/90">
          Buy HYPE at $0.001 before the mathematical rise begins
        </motion.p>

        <motion.div variants={fadeInUp} className="flex flex-wrap gap-6 justify-center">
          <a
            href="/presale"
            className="px-10 py-5 bg-white text-green-600 font-bold text-xl rounded-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            🚀 Buy HYPE Now
          </a>
          <a
            href="/math-proof.pdf"
            className="px-10 py-5 bg-transparent border-2 border-white text-white font-bold text-xl rounded-lg hover:bg-white hover:text-green-600 transition-all duration-300"
            download
          >
            📄 Download Math Proof
          </a>
        </motion.div>

        <motion.p variants={fadeInUp} className="mt-8 text-white/80 text-lg">
          Not hype. Not hope. Just math. 🧮
        </motion.p>
      </div>
    </motion.section>
  );
};

/**
 * Main Token Growth Section Component
 */
const TokenGrowthSection: React.FC = () => {
  return (
    <div id="token-growth" className="bg-slate-900">
      <HeroSection />
      <BurnMechanismSection />
      <PriceProjectionsSection />
      <FormulaSection />
      <ReasonsSection />
      <CalculatorSection />
      <CTASection />
    </div>
  );
};

export default TokenGrowthSection;
