# HypeAI Dashboard - Component Specifications

**Developer Implementation Guide**

---

## 📋 Table of Contents

1. [Trading Components](#trading-components)
2. [Staking Components](#staking-components)
3. [AI Components](#ai-components)
4. [Common Components](#common-components)
5. [Layout Components](#layout-components)
6. [Hooks Reference](#hooks-reference)
7. [Utilities Reference](#utilities-reference)

---

## 🎯 Trading Components

### 1. PriceChart Component

**Purpose:** Display real-time price chart with technical indicators

```typescript
// components/trading/PriceChart/PriceChart.tsx

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useRealtimePrice } from '@/hooks/useRealtime';

interface PriceChartProps {
  symbol: string;
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  height?: number;
  showVolume?: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  symbol,
  interval,
  height = 400,
  showVolume = true,
}) => {
  const [data, setData] = useState([]);
  const currentPrice = useRealtimePrice(symbol);

  useEffect(() => {
    // Fetch historical data
    fetchChartData(symbol, interval).then(setData);
  }, [symbol, interval]);

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-purple-500/20">
      {/* Chart Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white">{symbol}/USD</h3>
          <p className="text-3xl font-black mt-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            ${currentPrice?.toFixed(6)}
          </p>
        </div>
        <div className="flex gap-2">
          {['1m', '5m', '15m', '1h', '4h', '1d'].map((int) => (
            <button
              key={int}
              className={`px-3 py-1 rounded-lg transition-colors ${
                interval === int
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700 text-gray-400 hover:text-white'
              }`}
              onClick={() => {/* Change interval */}}
            >
              {int}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            stroke="#6B7280"
          />
          <YAxis
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => `$${value.toFixed(6)}`}
            stroke="#6B7280"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E293B',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '8px',
            }}
            labelFormatter={(value) => new Date(value).toLocaleString()}
            formatter={(value: number) => [`$${value.toFixed(6)}`, 'Price']}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#0066FF"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
```

**Usage:**
```tsx
<PriceChart
  symbol="HYPEAI"
  interval="1h"
  height={500}
  showVolume={true}
/>
```

---

### 2. OrderForm Component

**Purpose:** Buy/Sell order form with slippage protection

```typescript
// components/trading/OrderForm/OrderForm.tsx

import { useState } from 'react';
import { parseUnits, formatUnits } from 'ethers';
import { useTrade } from '@/hooks/useTrade';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/common/Button';

interface OrderFormProps {
  type: 'buy' | 'sell';
  tokenAddress: string;
}

export const OrderForm: React.FC<OrderFormProps> = ({ type, tokenAddress }) => {
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const { address, balance } = useWallet();
  const { executeTrade, isLoading } = useTrade();

  const handleSubmit = async () => {
    try {
      const amountWei = parseUnits(amount, 18);
      await executeTrade({
        type,
        tokenAddress,
        amount: amountWei,
        slippage: parseFloat(slippage),
      });
    } catch (error) {
      console.error('Trade failed:', error);
    }
  };

  const isBuy = type === 'buy';

  return (
    <div className={`
      bg-slate-800 rounded-2xl p-6 border
      ${isBuy ? 'border-green-500/20' : 'border-red-500/20'}
    `}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center
          ${isBuy ? 'bg-green-500/20' : 'bg-red-500/20'}
        `}>
          {isBuy ? '📈' : '📉'}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">
            {isBuy ? 'Buy' : 'Sell'} HYPEAI
          </h3>
          <p className="text-sm text-gray-400">
            Balance: {formatUnits(balance || 0, 18)} HYPEAI
          </p>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Amount</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              placeholder="0.0"
            />
            <button
              onClick={() => setAmount(formatUnits(balance || 0, 18))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 text-sm font-semibold hover:text-purple-400"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex gap-2">
          {[25, 50, 75].map((percent) => (
            <button
              key={percent}
              onClick={() => {
                const amt = balance ? (balance * BigInt(percent)) / BigInt(100) : 0n;
                setAmount(formatUnits(amt, 18));
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-gray-400 hover:text-white py-2 rounded-lg transition-colors text-sm"
            >
              {percent}%
            </button>
          ))}
        </div>

        {/* Slippage Tolerance */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Slippage Tolerance
          </label>
          <div className="flex gap-2">
            {['0.1', '0.5', '1.0'].map((val) => (
              <button
                key={val}
                onClick={() => setSlippage(val)}
                className={`
                  flex-1 py-2 rounded-lg transition-colors text-sm
                  ${slippage === val
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-700 text-gray-400 hover:text-white'
                  }
                `}
              >
                {val}%
              </button>
            ))}
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Trade Summary */}
        <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">You pay</span>
            <span className="text-white font-semibold">{amount || '0'} HYPEAI</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Est. gas fee</span>
            <span className="text-white">~$2.50</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Min. received</span>
            <span className="text-white">
              {(parseFloat(amount || '0') * (1 - parseFloat(slippage) / 100)).toFixed(4)} HYPEAI
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          variant={isBuy ? 'primary' : 'secondary'}
          size="lg"
          loading={isLoading}
          disabled={!amount || !address}
          onClick={handleSubmit}
          className="w-full"
        >
          {!address
            ? 'Connect Wallet'
            : isLoading
            ? 'Processing...'
            : isBuy
            ? 'Buy HYPEAI'
            : 'Sell HYPEAI'}
        </Button>
      </div>
    </div>
  );
};
```

**Usage:**
```tsx
<OrderForm type="buy" tokenAddress="0x..." />
<OrderForm type="sell" tokenAddress="0x..." />
```

---

## 💰 Staking Components

### 1. StakingCard Component

**Purpose:** Display staking tier with APY calculator

```typescript
// components/staking/StakingCard/StakingCard.tsx

import { useState } from 'react';
import { parseUnits, formatUnits } from 'ethers';
import { useStaking } from '@/hooks/useStaking';
import { Button } from '@/components/common/Button';

interface StakingTier {
  name: string;
  duration: number; // days
  apy: number;
  minAmount: bigint;
  icon: string;
}

const tiers: StakingTier[] = [
  { name: 'Bronze', duration: 30, apy: 17, minAmount: parseUnits('1000', 18), icon: '🥉' },
  { name: 'Silver', duration: 90, apy: 27, minAmount: parseUnits('5000', 18), icon: '🥈' },
  { name: 'Gold', duration: 180, apy: 42, minAmount: parseUnits('10000', 18), icon: '🥇' },
  { name: 'Platinum', duration: 365, apy: 62, minAmount: parseUnits('25000', 18), icon: '💎' },
];

export const StakingCard: React.FC<{ tier: StakingTier }> = ({ tier }) => {
  const [amount, setAmount] = useState('');
  const { stake, isLoading } = useStaking();

  const calculateRewards = () => {
    const amt = parseFloat(amount || '0');
    const yearlyReward = amt * (tier.apy / 100);
    const periodReward = yearlyReward * (tier.duration / 365);
    return periodReward;
  };

  const handleStake = async () => {
    await stake({
      amount: parseUnits(amount, 18),
      tier: tier.name,
      duration: tier.duration,
    });
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
      {/* Tier Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{tier.icon}</span>
          <div>
            <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
            <p className="text-sm text-gray-400">{tier.duration} days lock</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
            {tier.apy}%
          </div>
          <p className="text-sm text-gray-400">APY</p>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Stake Amount (min: {formatUnits(tier.minAmount, 18)} HYPEAI)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            placeholder="0.0"
          />
        </div>

        {/* Rewards Calculation */}
        {amount && parseFloat(amount) > 0 && (
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Estimated Rewards</p>
                <p className="text-2xl font-bold text-green-500">
                  +{calculateRewards().toFixed(2)} HYPEAI
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Value</p>
                <p className="text-xl font-semibold text-white">
                  {(parseFloat(amount) + calculateRewards()).toFixed(2)} HYPEAI
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✓</span>
            <span className="text-gray-300">Daily compounding rewards</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✓</span>
            <span className="text-gray-300">Auto-claim available</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✓</span>
            <span className="text-gray-300">Early unstake with 10% penalty</span>
          </div>
        </div>

        {/* Stake Button */}
        <Button
          variant="primary"
          size="lg"
          loading={isLoading}
          onClick={handleStake}
          className="w-full"
        >
          Stake {tier.name}
        </Button>
      </div>
    </div>
  );
};
```

**Usage:**
```tsx
{tiers.map((tier) => (
  <StakingCard key={tier.name} tier={tier} />
))}
```

---

## 🤖 AI Components

### 1. PredictionCard Component

**Purpose:** Display AI price predictions with confidence scores

```typescript
// components/ai/PredictionCard/PredictionCard.tsx

import { useAIPredictions } from '@/hooks/useAI';
import { motion } from 'framer-motion';

interface Prediction {
  timeframe: string;
  price: number;
  confidence: number;
  trend: 'up' | 'down' | 'neutral';
}

export const PredictionCard: React.FC = () => {
  const { data: predictions, isLoading } = useAIPredictions();

  if (isLoading) {
    return <div className="animate-pulse">Loading predictions...</div>;
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-purple-500/20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
          🤖
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">AI Predictions</h3>
          <p className="text-sm text-gray-400">Powered by LSTM & Transformer</p>
        </div>
      </div>

      {/* Predictions */}
      <div className="space-y-4">
        {predictions?.map((prediction: Prediction, index: number) => (
          <motion.div
            key={prediction.timeframe}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-900/50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getTrendIcon(prediction.trend)}</span>
                <div>
                  <p className="text-sm text-gray-400">{prediction.timeframe}</p>
                  <p className="text-2xl font-bold text-white">
                    ${prediction.price.toFixed(6)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Confidence</p>
                <p className={`text-xl font-semibold ${getConfidenceColor(prediction.confidence)}`}>
                  {prediction.confidence}%
                </p>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-3 bg-slate-800 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${prediction.confidence}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                className={`h-full ${
                  prediction.confidence >= 80
                    ? 'bg-green-500'
                    : prediction.confidence >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Model Info */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Model Accuracy</p>
            <p className="text-white font-semibold">85.2%</p>
          </div>
          <div>
            <p className="text-gray-400">Last Updated</p>
            <p className="text-white font-semibold">2 min ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

**Usage:**
```tsx
<PredictionCard />
```

---

## 🧩 Common Components

### 1. Button Component

```typescript
// components/common/Button/Button.tsx

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'rounded-full font-semibold transition-all inline-flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/50',
    secondary: 'bg-slate-700 text-white hover:bg-slate-600',
    outline: 'border-2 border-purple-500 text-purple-500 hover:bg-purple-500/10',
    ghost: 'text-gray-400 hover:text-white hover:bg-slate-800',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {icon && <span>{icon}</span>}
      {children}
    </motion.button>
  );
};
```

---

### 2. Modal Component

```typescript
// components/common/Modal/Modal.tsx

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`
              fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              ${sizes[size]} w-full mx-4
              bg-slate-800 rounded-2xl border border-purple-500/20
              p-6 z-50 max-h-[90vh] overflow-y-auto
            `}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

---

## 🔗 Hooks Reference

### useWallet Hook

```typescript
// hooks/useWallet.ts

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  return {
    address,
    isConnected,
    connect,
    disconnect,
    connectors,
    balance: balance?.value || 0n,
    formattedBalance: balance?.formatted || '0',
  };
}
```

### useTrade Hook

```typescript
// hooks/useTrade.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { parseUnits } from 'ethers';
import { getRouterContract } from '@/services/web3/contracts';

interface TradeParams {
  type: 'buy' | 'sell';
  tokenAddress: string;
  amount: bigint;
  slippage: number;
}

export function useTrade() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: TradeParams) => {
      const router = getRouterContract();

      if (params.type === 'buy') {
        const tx = await router.swapExactETHForTokens(
          params.amount,
          [/* path */],
          address,
          Date.now() + 1000 * 60 * 20 // 20 minutes
        );
        await tx.wait();
      } else {
        const tx = await router.swapExactTokensForETH(
          params.amount,
          0,
          [/* path */],
          address,
          Date.now() + 1000 * 60 * 20
        );
        await tx.wait();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    },
  });

  return {
    executeTrade: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
```

### useStaking Hook

```typescript
// hooks/useStaking.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getStakingContract } from '@/services/web3/contracts';

export function useStaking() {
  const queryClient = useQueryClient();

  const stakeMutation = useMutation({
    mutationFn: async ({ amount, tier, duration }: any) => {
      const contract = getStakingContract();
      const tx = await contract.stake(amount, duration);
      await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staking'] });
    },
  });

  return {
    stake: stakeMutation.mutate,
    isLoading: stakeMutation.isPending,
  };
}

export function useStakingInfo(address: string) {
  return useQuery({
    queryKey: ['staking', address],
    queryFn: async () => {
      const contract = getStakingContract();
      const [balance, rewards, tier] = await Promise.all([
        contract.balanceOf(address),
        contract.getRewards(address),
        contract.getUserTier(address),
      ]);
      return { balance, rewards, tier };
    },
    enabled: !!address,
    refetchInterval: 30000, // 30 seconds
  });
}
```

---

## 🛠️ Utilities Reference

### Format Utilities

```typescript
// utils/formatters.ts

export const formatters = {
  // Format number with K/M/B suffix
  formatNumber: (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  },

  // Format USD price
  formatUSD: (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
  },

  // Format percentage
  formatPercent: (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  },

  // Format address
  formatAddress: (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  // Format timestamp
  formatTime: (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
};
```

### Calculation Utilities

```typescript
// utils/calculations.ts

export const calculations = {
  // Calculate APY with compounding
  calculateAPY: (
    principal: number,
    rate: number,
    days: number,
    compoundFrequency: number = 365
  ): number => {
    const periods = (days / 365) * compoundFrequency;
    const ratePerPeriod = rate / compoundFrequency;
    return principal * Math.pow(1 + ratePerPeriod, periods) - principal;
  },

  // Calculate slippage amount
  calculateSlippage: (amount: number, slippagePercent: number): number => {
    return amount * (1 - slippagePercent / 100);
  },

  // Calculate price impact
  calculatePriceImpact: (
    inputAmount: number,
    outputAmount: number,
    marketPrice: number
  ): number => {
    const executionPrice = inputAmount / outputAmount;
    return ((executionPrice - marketPrice) / marketPrice) * 100;
  },

  // Calculate portfolio value
  calculatePortfolioValue: (assets: Array<{ amount: number; price: number }>): number => {
    return assets.reduce((total, asset) => total + asset.amount * asset.price, 0);
  },
};
```

---

## 📦 Implementation Checklist

### Phase 1: Setup (Week 1)
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS with HypeAI theme
- [ ] Setup Wagmi/Viem for Web3 integration
- [ ] Configure React Query for data fetching
- [ ] Setup Zustand for UI state
- [ ] Create base folder structure

### Phase 2: Common Components (Week 2)
- [ ] Build Button component
- [ ] Build Card component
- [ ] Build Modal component
- [ ] Build Input component
- [ ] Build Loader component
- [ ] Build Toast notifications

### Phase 3: Trading (Week 3-4)
- [ ] Build PriceChart component
- [ ] Build OrderForm component
- [ ] Build OrderBook component
- [ ] Build TradeHistory component
- [ ] Implement useTrade hook
- [ ] Integrate WebSocket for real-time prices

### Phase 4: Staking (Week 5)
- [ ] Build StakingCard component
- [ ] Build APYCalculator component
- [ ] Build RewardsTracker component
- [ ] Implement useStaking hook
- [ ] Add claim rewards functionality

### Phase 5: AI & Analytics (Week 6)
- [ ] Build PredictionCard component
- [ ] Build SentimentGauge component
- [ ] Build PortfolioChart component
- [ ] Implement useAI hook
- [ ] Integrate AI Oracle data

### Phase 6: Polish & Testing (Week 7-8)
- [ ] Mobile responsiveness
- [ ] Animations and transitions
- [ ] Error handling
- [ ] Unit tests
- [ ] E2E tests
- [ ] Performance optimization

---

**Last Updated:** October 16, 2025
**Maintained By:** Development Team
**Next Review:** Weekly Sprint Planning

🤖 **HypeAI - Where Hype Meets Intelligence**
