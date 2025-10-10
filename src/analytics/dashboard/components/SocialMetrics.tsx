'use client';

import React from 'react';
import { Twitter, Send, MessageCircle, Users, TrendingUp } from 'lucide-react';
import { MetricCard } from './MetricCard';

export interface SocialMetricsProps {
  twitter?: {
    followers: number;
    engagement: number;
    growth: number;
  };
  telegram?: {
    members: number;
    online: number;
    growth: number;
  };
  discord?: {
    members: number;
    online: number;
    growth: number;
  };
  loading?: boolean;
}

export const SocialMetrics: React.FC<SocialMetricsProps> = ({
  twitter,
  telegram,
  discord,
  loading = false,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Twitter Metrics */}
      {twitter && (
        <>
          <MetricCard
            title="Twitter Followers"
            value={twitter.followers.toLocaleString()}
            change={twitter.growth}
            icon={<Twitter className="w-6 h-6" />}
            loading={loading}
            footer={
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Engagement Rate</span>
                <span className="font-semibold text-hypeai-primary">
                  {twitter.engagement.toFixed(1)}%
                </span>
              </div>
            }
          />
        </>
      )}

      {/* Telegram Metrics */}
      {telegram && (
        <>
          <MetricCard
            title="Telegram Members"
            value={telegram.members.toLocaleString()}
            change={telegram.growth}
            icon={<Send className="w-6 h-6" />}
            loading={loading}
            footer={
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Online Now</span>
                <span className="font-semibold text-green-600">
                  {telegram.online.toLocaleString()}
                </span>
              </div>
            }
          />
        </>
      )}

      {/* Discord Metrics */}
      {discord && (
        <>
          <MetricCard
            title="Discord Members"
            value={discord.members.toLocaleString()}
            change={discord.growth}
            icon={<MessageCircle className="w-6 h-6" />}
            loading={loading}
            footer={
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Online Now</span>
                <span className="font-semibold text-green-600">
                  {discord.online.toLocaleString()}
                </span>
              </div>
            }
          />
        </>
      )}

      {/* Total Reach */}
      <MetricCard
        title="Total Social Reach"
        value={(
          (twitter?.followers || 0) +
          (telegram?.members || 0) +
          (discord?.members || 0)
        ).toLocaleString()}
        icon={<Users className="w-6 h-6" />}
        trend="up"
        loading={loading}
      />

      {/* Combined Growth */}
      <MetricCard
        title="Combined Growth (24h)"
        value={`+${(
          (twitter?.growth || 0) +
          (telegram?.growth || 0) +
          (discord?.growth || 0)
        ).toLocaleString()}`}
        icon={<TrendingUp className="w-6 h-6" />}
        trend="up"
        loading={loading}
      />
    </div>
  );
};

export default SocialMetrics;
