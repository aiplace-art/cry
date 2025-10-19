import React from 'react';
import { BNBCard, BNBBadge, BNBButton } from '../ui/bnb';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface WalletPanelProps {
  balances: {
    hype: number;
    bnb: number;
    usdt: number;
  };
  prices: {
    hype: number;
    bnb: number;
    usdt: number;
  };
  onWithdraw?: (token: string) => void;
  onDeposit?: (token: string) => void;
}

export const WalletPanel: React.FC<WalletPanelProps> = ({
  balances,
  prices,
  onWithdraw,
  onDeposit,
}) => {
  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Calculate USD values
  const usdValues = {
    hype: balances.hype * prices.hype,
    bnb: balances.bnb * prices.bnb,
    usdt: balances.usdt * prices.usdt,
  };

  const totalValue = usdValues.hype + usdValues.bnb + usdValues.usdt;

  // Pie chart data
  const chartData = [
    { name: 'HYPE', value: usdValues.hype, color: '#F3BA2F' },
    { name: 'BNB', value: usdValues.bnb, color: '#FCD535' },
    { name: 'USDT', value: usdValues.usdt, color: '#0ECB81' },
  ].filter(item => item.value > 0);

  const tokens = [
    {
      symbol: 'HYPE',
      name: 'HypeAI Token',
      balance: balances.hype,
      price: prices.hype,
      usdValue: usdValues.hype,
      icon: '🚀',
      color: 'from-[#F3BA2F] to-[#FCD535]',
    },
    {
      symbol: 'BNB',
      name: 'BNB Chain',
      balance: balances.bnb,
      price: prices.bnb,
      usdValue: usdValues.bnb,
      icon: '🔶',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      balance: balances.usdt,
      price: prices.usdt,
      usdValue: usdValues.usdt,
      icon: '💵',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <BNBCard variant="gradient" padding="lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#EAECEF] mb-2">
              Wallet
            </h1>
            <p className="text-[#848E9C]">
              Manage your crypto assets and portfolio
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-[#848E9C] mb-1">Total Portfolio Value</p>
            <p className="text-3xl font-bold text-[#F3BA2F]">{formatCurrency(totalValue)}</p>
          </div>
        </div>
      </BNBCard>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Portfolio Allocation */}
        <div className="lg:col-span-1">
          <BNBCard title="Asset Allocation" subtitle="Your portfolio distribution" padding="lg">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E2026',
                      border: '1px solid #848E9C40',
                      borderRadius: '8px',
                      color: '#EAECEF',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center">
                <p className="text-[#848E9C]">No assets to display</p>
              </div>
            )}

            <div className="mt-6 space-y-3">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-[#EAECEF]">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-[#EAECEF]">
                    {((item.value / totalValue) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </BNBCard>
        </div>

        {/* Token List */}
        <div className="lg:col-span-2 space-y-4">
          {tokens.map((token, index) => (
            <BNBCard key={index} padding="md" hover>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Token Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className={`
                    w-16 h-16 rounded-xl bg-gradient-to-br ${token.color}
                    flex items-center justify-center text-3xl flex-shrink-0
                  `}>
                    {token.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-[#EAECEF]">{token.symbol}</h3>
                      <BNBBadge variant="info" size="sm">{token.name}</BNBBadge>
                    </div>
                    <p className="text-sm text-[#848E9C]">
                      Price: {formatCurrency(token.price)}
                    </p>
                  </div>
                </div>

                {/* Balance Info */}
                <div className="flex-1 text-left md:text-right">
                  <p className="text-2xl font-bold text-[#EAECEF] mb-1">
                    {formatNumber(token.balance, token.symbol === 'HYPE' ? 0 : 4)}
                  </p>
                  <p className="text-sm text-[#848E9C]">
                    ≈ {formatCurrency(token.usdValue)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full md:w-auto">
                  <BNBButton
                    onClick={() => onDeposit?.(token.symbol)}
                    variant="secondary"
                    size="sm"
                    className="flex-1 md:flex-none"
                    aria-label={`Deposit ${token.symbol} tokens`}
                  >
                    Deposit
                  </BNBButton>
                  <BNBButton
                    onClick={() => onWithdraw?.(token.symbol)}
                    variant="outline"
                    size="sm"
                    disabled={token.balance <= 0}
                    className="flex-1 md:flex-none"
                    aria-label={`Withdraw ${token.symbol} tokens`}
                    aria-disabled={token.balance <= 0}
                  >
                    Withdraw
                  </BNBButton>
                </div>
              </div>
            </BNBCard>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <BNBCard padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F3BA2F]/20 flex items-center justify-center text-2xl flex-shrink-0">
              💳
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#EAECEF] mb-1">Buy Crypto</h4>
              <p className="text-sm text-[#848E9C]">
                Purchase BNB or USDT with credit card
              </p>
            </div>
            <BNBButton size="sm" aria-label="Buy crypto with credit card">Buy</BNBButton>
          </div>
        </BNBCard>

        <BNBCard padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-bnb-secondary/50/20 flex items-center justify-center text-2xl flex-shrink-0">
              🔄
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#EAECEF] mb-1">Swap Tokens</h4>
              <p className="text-sm text-[#848E9C]">
                Exchange between BNB, USDT, and HYPE
              </p>
            </div>
            <BNBButton size="sm" variant="secondary" aria-label="Swap tokens">Swap</BNBButton>
          </div>
        </BNBCard>
      </div>

      {/* Transaction History */}
      <BNBCard title="Recent Transactions" subtitle="Your latest activity" padding="lg">
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#14151A] flex items-center justify-center text-4xl">
            📊
          </div>
          <h3 className="text-xl font-bold text-[#EAECEF] mb-2">No Recent Transactions</h3>
          <p className="text-[#848E9C]">
            Your transaction history will appear here
          </p>
        </div>
      </BNBCard>
    </div>
  );
};
