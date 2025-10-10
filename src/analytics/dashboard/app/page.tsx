'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import {
  Coins,
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { PriceChart } from '../components/PriceChart';
import { SocialMetrics } from '../components/SocialMetrics';
import { CompetitorComparison } from '../components/CompetitorComparison';
import { InfluencerROI } from '../components/InfluencerROI';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Fetch token data
  const { data: tokenData, error: tokenError, mutate: mutateToken } = useSWR(
    '/api/token',
    fetcher,
    { refreshInterval }
  );

  // Fetch price data
  const { data: priceData, error: priceError, mutate: mutatePrice } = useSWR(
    '/api/price',
    fetcher,
    { refreshInterval }
  );

  // Fetch historical prices
  const { data: historicalPrices } = useSWR(
    '/api/price/historical?days=7',
    fetcher,
    { refreshInterval: 60000 } // 1 minute
  );

  // Fetch social metrics
  const { data: socialData, mutate: mutateSocial } = useSWR(
    '/api/social',
    fetcher,
    { refreshInterval: 60000 }
  );

  // Fetch competitor data
  const { data: competitorData } = useSWR(
    '/api/competitors',
    fetcher,
    { refreshInterval: 120000 } // 2 minutes
  );

  // Fetch influencer campaigns
  const { data: campaignData } = useSWR(
    '/api/campaigns',
    fetcher,
    { refreshInterval: 300000 } // 5 minutes
  );

  const handleRefresh = async () => {
    setLastUpdate(Date.now());
    await Promise.all([
      mutateToken(),
      mutatePrice(),
      mutateSocial(),
    ]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loading = !tokenData || !priceData || !socialData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-hypeai-light via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                HypeAI Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Real-time metrics and performance tracking
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-hypeai-primary text-white rounded-lg hover:bg-hypeai-secondary transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {new Date(lastUpdate).toLocaleTimeString()}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Metrics */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-hypeai-primary" />
            Key Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Token Price"
              value={`$${priceData?.price?.toFixed(6) || '0.00'}`}
              change={priceData?.priceChange24h}
              icon={<Coins className="w-6 h-6" />}
              loading={loading}
            />
            <MetricCard
              title="Market Cap"
              value={`$${(priceData?.marketCap / 1000000).toFixed(2)}M` || '$0.00'}
              change={priceData?.priceChange24h}
              icon={<TrendingUp className="w-6 h-6" />}
              loading={loading}
            />
            <MetricCard
              title="Holders"
              value={tokenData?.holders?.toLocaleString() || '0'}
              trend="up"
              icon={<Users className="w-6 h-6" />}
              loading={loading}
            />
            <MetricCard
              title="24h Volume"
              value={`$${(priceData?.volume24h / 1000000).toFixed(2)}M` || '$0.00'}
              icon={<BarChart3 className="w-6 h-6" />}
              loading={loading}
            />
          </div>
        </section>

        {/* Price Chart */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Price History (7 Days)
          </h2>
          <PriceChart
            data={historicalPrices || []}
            type="area"
            height={350}
            loading={!historicalPrices}
          />
        </section>

        {/* Social Metrics */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Social Media Metrics
          </h2>
          <SocialMetrics
            twitter={socialData?.twitter}
            telegram={socialData?.telegram}
            discord={socialData?.discord}
            loading={!socialData}
          />
        </section>

        {/* Competitor Comparison */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Competitor Analysis
          </h2>
          <div className="space-y-6">
            <CompetitorComparison
              data={competitorData || []}
              metric="marketCap"
              loading={!competitorData}
            />
          </div>
        </section>

        {/* Influencer ROI */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Marketing Campaigns
          </h2>
          <InfluencerROI
            campaigns={campaignData || []}
            loading={!campaignData}
          />
        </section>
      </main>
    </div>
  );
}
