'use client';

import React from 'react';
import { TrendingUp, DollarSign, Users, Target } from 'lucide-react';

export interface InfluencerCampaignData {
  id: string;
  influencer: string;
  platform: string;
  reach: number;
  engagement: number;
  conversions: number;
  cost: number;
  roi: number;
  status: 'active' | 'completed' | 'planned';
}

export interface InfluencerROIProps {
  campaigns: InfluencerCampaignData[];
  loading?: boolean;
}

export const InfluencerROI: React.FC<InfluencerROIProps> = ({
  campaigns,
  loading = false,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return 'bg-sky-500';
      case 'youtube':
        return 'bg-red-500';
      case 'telegram':
        return 'bg-blue-500';
      case 'instagram':
        return 'bg-pink-500';
      default:
        return 'bg-purple-500';
    }
  };

  const totalStats = campaigns.reduce(
    (acc, campaign) => ({
      reach: acc.reach + campaign.reach,
      conversions: acc.conversions + campaign.conversions,
      cost: acc.cost + campaign.cost,
    }),
    { reach: 0, conversions: 0, cost: 0 }
  );

  const avgROI = campaigns.length > 0
    ? campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length
    : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Influencer Campaign Performance
      </h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-hypeai-primary to-hypeai-secondary p-4 rounded-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 opacity-80" />
            <span className="text-xs font-medium">Total Reach</span>
          </div>
          <p className="text-2xl font-bold">{(totalStats.reach / 1000).toFixed(0)}K</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 opacity-80" />
            <span className="text-xs font-medium">Conversions</span>
          </div>
          <p className="text-2xl font-bold">{totalStats.conversions}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 opacity-80" />
            <span className="text-xs font-medium">Total Spend</span>
          </div>
          <p className="text-2xl font-bold">${(totalStats.cost / 1000).toFixed(1)}K</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 opacity-80" />
            <span className="text-xs font-medium">Avg ROI</span>
          </div>
          <p className="text-2xl font-bold">{avgROI.toFixed(1)}x</p>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-3">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">
                    {campaign.influencer}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                      campaign.status
                    )}`}
                  >
                    {campaign.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded text-white ${getPlatformColor(
                      campaign.platform
                    )}`}
                  >
                    {campaign.platform}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-hypeai-primary">
                  {campaign.roi.toFixed(1)}x
                </p>
                <p className="text-xs text-gray-500">ROI</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600 text-xs mb-1">Reach</p>
                <p className="font-semibold text-gray-900">
                  {(campaign.reach / 1000).toFixed(0)}K
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Engagement</p>
                <p className="font-semibold text-gray-900">
                  {(campaign.engagement / 1000).toFixed(1)}K
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Conversions</p>
                <p className="font-semibold text-green-600">{campaign.conversions}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Cost</p>
                <p className="font-semibold text-gray-900">${campaign.cost.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No campaigns to display</p>
        </div>
      )}
    </div>
  );
};

export default InfluencerROI;
