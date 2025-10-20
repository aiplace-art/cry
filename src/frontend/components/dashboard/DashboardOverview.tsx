import React from 'react';
import { BNBCard, BNBBadge, BNBButton } from '../ui/bnb';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardOverviewProps {
  totalInvested: number;
  tokensOwned: number;
  vestingProgress: number;
  referralEarnings: number;
  onBuyTokens?: () => void;
  onClaimTokens?: () => void;
}

const mockPriceData = [
  { date: 'Jan', price: 0.012 },
  { date: 'Feb', price: 0.015 },
  { date: 'Mar', price: 0.018 },
  { date: 'Apr', price: 0.022 },
  { date: 'May', price: 0.020 },
  { date: 'Jun', price: 0.025 },
];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  totalInvested,
  tokensOwned,
  vestingProgress,
  referralEarnings,
  onBuyTokens,
  onClaimTokens,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const stats = [
    {
      title: 'Total Invested',
      value: formatCurrency(totalInvested),
      icon: '💰',
      color: 'from-[#F3BA2F] to-[#FCD535]',
      change: '+12.5%',
      changeType: 'positive' as const,
    },
    {
      title: 'Tokens Owned',
      value: formatNumber(tokensOwned),
      suffix: 'HYPE',
      icon: '🚀',
      color: 'from-bnb-secondary500 to-pink-500',
      change: '+24.3%',
      changeType: 'positive' as const,
    },
    {
      title: 'Vesting Progress',
      value: `${vestingProgress}%`,
      icon: '⏳',
      color: 'from-bnb-primary500 to-cyan-500',
      info: 'Month 14 of 21',
    },
    {
      title: 'Referral Earnings',
      value: formatCurrency(referralEarnings),
      icon: '🎁',
      color: 'from-green-500 to-emerald-500',
      change: '+$250',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <BNBCard variant="gradient" padding="lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#EAECEF] mb-2">
              Welcome to HypeAI Private Sale
            </h1>
            <p className="text-[#848E9C]">
              Track your investment, claim vested tokens, and manage your portfolio
            </p>
          </div>
          <div className="flex gap-3">
            <BNBButton onClick={onBuyTokens} size="md">
              Buy More Tokens
            </BNBButton>
            <BNBButton onClick={onClaimTokens} variant="secondary" size="md">
              Claim Vested
            </BNBButton>
          </div>
        </div>
      </BNBCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <BNBCard key={index} padding="md" hover className="border-l-4 border-[#F3BA2F]">
            <div className="flex items-start justify-between mb-4">
              <div className={`
                w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color}
                flex items-center justify-center text-2xl
              `}>
                {stat.icon}
              </div>
              {stat.change && (
                <BNBBadge variant={stat.changeType === 'positive' ? 'success' : 'danger'} size="sm">
                  {stat.change}
                </BNBBadge>
              )}
            </div>

            <div>
              <p className="text-sm text-[#848E9C] mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-[#EAECEF] mb-1">
                {stat.value}
                {stat.suffix && <span className="text-base text-[#848E9C] ml-2">{stat.suffix}</span>}
              </h3>
              {stat.info && (
                <p className="text-xs text-[#848E9C]">{stat.info}</p>
              )}
            </div>
          </BNBCard>
        ))}
      </div>

      {/* Price Chart */}
      <BNBCard title="HYPE Token Price" subtitle="Historical price performance" padding="lg">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={mockPriceData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F3BA2F" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#F3BA2F" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#848E9C20" />
            <XAxis dataKey="date" stroke="#848E9C" />
            <YAxis stroke="#848E9C" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E2026',
                border: '1px solid #848E9C40',
                borderRadius: '8px',
                color: '#EAECEF',
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#F3BA2F"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-[#848E9C]/20">
          <div>
            <p className="text-xs text-[#848E9C] mb-1">Current Price</p>
            <p className="text-lg font-bold text-[#F3BA2F]">$0.025</p>
          </div>
          <div>
            <p className="text-xs text-[#848E9C] mb-1">24h Change</p>
            <p className="text-lg font-bold text-[#0ECB81]">+8.7%</p>
          </div>
          <div>
            <p className="text-xs text-[#848E9C] mb-1">All-Time High</p>
            <p className="text-lg font-bold text-[#EAECEF]">$0.025</p>
          </div>
        </div>
      </BNBCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BNBCard padding="md" hover>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#F3BA2F] to-[#FCD535] flex items-center justify-center text-3xl">
              💳
            </div>
            <h3 className="text-lg font-bold text-[#EAECEF] mb-2">Buy Tokens</h3>
            <p className="text-sm text-[#848E9C] mb-4">
              Purchase HYPE tokens with BNB or USDT
            </p>
            <BNBButton onClick={onBuyTokens} fullWidth size="sm">
              Buy Now
            </BNBButton>
          </div>
        </BNBCard>

        <BNBCard padding="md" hover>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-bnb-secondary500 to-pink-500 flex items-center justify-center text-3xl">
              🎯
            </div>
            <h3 className="text-lg font-bold text-[#EAECEF] mb-2">Claim Tokens</h3>
            <p className="text-sm text-[#848E9C] mb-4">
              Claim your vested tokens automatically
            </p>
            <BNBButton onClick={onClaimTokens} variant="secondary" fullWidth size="sm">
              Claim Now
            </BNBButton>
          </div>
        </BNBCard>

        <BNBCard padding="md" hover>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-3xl">
              🎁
            </div>
            <h3 className="text-lg font-bold text-[#EAECEF] mb-2">Refer & Earn</h3>
            <p className="text-sm text-[#848E9C] mb-4">
              Earn rewards by referring friends
            </p>
            <BNBButton variant="secondary" fullWidth size="sm">
              Get Link
            </BNBButton>
          </div>
        </BNBCard>
      </div>

      {/* Important Notice */}
      <BNBCard variant="dark" padding="md">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-[#F0B90B]/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#F0B90B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#EAECEF] mb-1">Vesting Schedule</h4>
            <p className="text-sm text-[#848E9C]">
              20% tokens unlocked immediately. After 3-month cliff, remaining 80% vest linearly over 18 months (21 months total). Claim anytime after cliff ends.
            </p>
          </div>
        </div>
      </BNBCard>
    </div>
  );
};
