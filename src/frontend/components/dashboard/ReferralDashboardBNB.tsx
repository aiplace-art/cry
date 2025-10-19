import React, { useState, useEffect } from 'react';
import { BNBCard, BNBBadge, BNBButton, BNBInput } from '../ui/bnb';

interface ReferralStats {
  totalReferrals: number;
  totalEarnedUSDT: number;
  totalEarnedHYPE: number;
  pendingRewards: number;
  level: string;
  bonusMultiplier: number;
  levelProgress: number;
  nextLevelThreshold: number;
  milestoneRewards: number;
}

interface ReferralLink {
  code: string;
  url: string;
  clicks: number;
  conversions: number;
}

interface ReferralDashboardBNBProps {
  userId: string;
  stats?: ReferralStats;
  link?: ReferralLink;
  onRefresh?: () => void;
}

export const ReferralDashboardBNB: React.FC<ReferralDashboardBNBProps> = ({
  userId,
  stats,
  link,
  onRefresh,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleCopy = async () => {
    if (link?.url) {
      try {
        await navigator.clipboard.writeText(link.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Platinum': return 'from-bnb-secondary400 via-bnb-primary500 to-bnb-primary600';
      case 'Gold': return 'from-[#F3BA2F] via-[#FCD535] to-[#F3BA2F]';
      case 'Silver': return 'from-gray-300 via-gray-400 to-gray-500';
      default: return 'from-orange-400 via-orange-500 to-orange-600';
    }
  };

  const getNextLevel = (currentLevel: string) => {
    switch (currentLevel) {
      case 'Bronze': return 'Silver';
      case 'Silver': return 'Gold';
      case 'Gold': return 'Platinum';
      case 'Platinum': return 'Max Level';
      default: return 'Silver';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <BNBCard variant="gradient" padding="lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#EAECEF] mb-2">
              Referral Program
            </h1>
            <p className="text-[#848E9C]">
              Earn rewards by inviting friends to join HypeAI
            </p>
          </div>
          <BNBButton onClick={onRefresh} variant="secondary" size="md">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </BNBButton>
        </div>
      </BNBCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BNBCard padding="md" hover className="border-l-4 border-bnb-border0">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bnb-primary500 to-cyan-500 flex items-center justify-center text-2xl">
              👥
            </div>
          </div>
          <p className="text-sm text-[#848E9C] mb-1">Total Referrals</p>
          <h3 className="text-3xl font-bold text-[#EAECEF]">
            {formatNumber(stats?.totalReferrals || 0)}
          </h3>
        </BNBCard>

        <BNBCard padding="md" hover className="border-l-4 border-[#0ECB81]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-2xl">
              💵
            </div>
          </div>
          <p className="text-sm text-[#848E9C] mb-1">Earned (USDT)</p>
          <h3 className="text-3xl font-bold text-[#EAECEF]">
            {formatCurrency(stats?.totalEarnedUSDT || 0)}
          </h3>
        </BNBCard>

        <BNBCard padding="md" hover className="border-l-4 border-[#F3BA2F]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F3BA2F] to-[#FCD535] flex items-center justify-center text-2xl">
              🚀
            </div>
          </div>
          <p className="text-sm text-[#848E9C] mb-1">Earned (HYPE)</p>
          <h3 className="text-3xl font-bold text-[#EAECEF]">
            {formatNumber(stats?.totalEarnedHYPE || 0)}
          </h3>
        </BNBCard>

        <BNBCard padding="md" hover className="border-l-4 border-[#F0B90B]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl">
              ⏳
            </div>
          </div>
          <p className="text-sm text-[#848E9C] mb-1">Pending Rewards</p>
          <h3 className="text-3xl font-bold text-[#EAECEF]">
            {formatCurrency(stats?.pendingRewards || 0)}
          </h3>
        </BNBCard>
      </div>

      {/* Level Progress */}
      {stats && stats.level && (
        <BNBCard title="Your Level" subtitle="Keep referring to unlock higher rewards!" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <div className={`
              px-6 py-3 rounded-full bg-gradient-to-r ${getLevelColor(stats.level)}
              text-white text-xl font-bold shadow-lg
            `}>
              {stats.level}
            </div>
            <BNBBadge variant="gold" size="lg">
              {stats.bonusMultiplier}x Multiplier
            </BNBBadge>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-[#848E9C] mb-2">
              <span>Progress to {getNextLevel(stats.level)}</span>
              <span>{stats.totalReferrals} / {stats.nextLevelThreshold} referrals</span>
            </div>
            <div className="w-full bg-[#14151A] rounded-full h-4">
              <div
                className={`h-4 rounded-full bg-gradient-to-r ${getLevelColor(stats.level)} transition-all duration-500`}
                style={{ width: `${(stats.levelProgress / stats.nextLevelThreshold) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#14151A] to-[#1E2026] rounded-xl p-6 border border-[#F3BA2F]/20">
              <h4 className="font-bold text-[#EAECEF] mb-3">Current Benefits</h4>
              <ul className="space-y-2 text-sm text-[#848E9C]">
                <li className="flex items-center gap-2">
                  <span className="text-[#0ECB81]">✓</span>
                  {stats.bonusMultiplier}x reward multiplier
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#0ECB81]">✓</span>
                  10% base commission rate
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#0ECB81]">✓</span>
                  5% second-tier rewards
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#0ECB81]">✓</span>
                  2% third-tier rewards
                </li>
              </ul>
            </div>

            {stats.milestoneRewards > 0 && (
              <div className="bg-gradient-to-br from-[#F0B90B]/20 to-[#F3BA2F]/20 rounded-xl p-6 border-2 border-[#F3BA2F]">
                <h4 className="font-bold text-[#EAECEF] mb-3">Milestone Rewards!</h4>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#848E9C]">Pending Bonus:</span>
                  <span className="text-2xl font-bold text-[#F3BA2F]">
                    {formatCurrency(stats.milestoneRewards)}
                  </span>
                </div>
                <BNBButton fullWidth>
                  Claim Milestone Rewards
                </BNBButton>
              </div>
            )}
          </div>
        </BNBCard>
      )}

      {/* Referral Link */}
      <BNBCard title="Your Referral Link" subtitle="Share with friends to earn rewards" padding="lg">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <BNBInput
              label="Referral Code"
              value={link?.code || ''}
              onChange={() => {}}
              className="font-mono"
            />

            <div>
              <label className="block text-sm font-medium text-[#EAECEF] mb-2">
                Full Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={link?.url || ''}
                  readOnly
                  className="flex-1 px-4 py-3 border border-[#848E9C]/20 rounded-lg bg-[#14151A] text-[#EAECEF] text-sm"
                />
                <BNBButton onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </BNBButton>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 bg-[#14151A] rounded-lg border border-[#848E9C]/20">
                <p className="text-sm text-[#848E9C]">Clicks</p>
                <p className="text-2xl font-bold text-bnb-text0">{formatNumber(link?.clicks || 0)}</p>
              </div>
              <div className="text-center p-4 bg-[#14151A] rounded-lg border border-[#848E9C]/20">
                <p className="text-sm text-[#848E9C]">Conversions</p>
                <p className="text-2xl font-bold text-[#0ECB81]">{formatNumber(link?.conversions || 0)}</p>
              </div>
            </div>

            {link && link.conversions > 0 && (
              <div className="p-4 bg-[#14151A] rounded-lg border border-[#F3BA2F]/20">
                <p className="text-sm text-[#848E9C]">Conversion Rate</p>
                <p className="text-2xl font-bold text-[#F3BA2F]">
                  {((link.conversions / link.clicks) * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-64 h-64 bg-[#14151A] rounded-xl border-2 border-[#848E9C]/20 flex items-center justify-center">
              <p className="text-[#848E9C]">QR Code</p>
            </div>
            <div className="flex gap-2">
              <BNBButton size="sm">Download QR</BNBButton>
              <BNBButton size="sm" variant="secondary">Share</BNBButton>
            </div>
          </div>
        </div>
      </BNBCard>

      {/* Tips */}
      <BNBCard title="Maximize Your Earnings" padding="lg">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <h4 className="font-semibold text-[#EAECEF] mb-1">Target Your Audience</h4>
              <p className="text-sm text-[#848E9C]">Share your link with communities interested in crypto and AI</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">📱</div>
            <div>
              <h4 className="font-semibold text-[#EAECEF] mb-1">Use Social Media</h4>
              <p className="text-sm text-[#848E9C]">Post on Twitter, Telegram, and Discord for maximum reach</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-semibold text-[#EAECEF] mb-1">Create Content</h4>
              <p className="text-sm text-[#848E9C]">Write reviews, tutorials, or videos about HypeAI</p>
            </div>
          </div>
        </div>
      </BNBCard>
    </div>
  );
};
