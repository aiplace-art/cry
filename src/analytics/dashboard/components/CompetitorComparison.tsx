'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export interface CompetitorData {
  name: string;
  marketCap: number;
  price: number;
  volume24h: number;
  holders: number;
  twitterFollowers: number;
  telegramMembers: number;
}

export interface CompetitorComparisonProps {
  data: CompetitorData[];
  metric: 'marketCap' | 'volume24h' | 'holders' | 'twitterFollowers' | 'telegramMembers';
  loading?: boolean;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export const CompetitorComparison: React.FC<CompetitorComparisonProps> = ({
  data,
  metric,
  loading = false,
}) => {
  const metricLabels = {
    marketCap: 'Market Cap ($)',
    volume24h: '24h Volume ($)',
    holders: 'Token Holders',
    twitterFollowers: 'Twitter Followers',
    telegramMembers: 'Telegram Members',
  };

  const formatValue = (value: number) => {
    if (metric === 'marketCap' || metric === 'volume24h') {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
      return `$${value.toFixed(2)}`;
    }
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">
            {metricLabels[metric]}: <span className="font-bold">{formatValue(payload[0].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse h-64">
          <div className="h-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-64">
        <p className="text-gray-500">No competitor data available</p>
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item.name,
    value: item[metric],
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {metricLabels[metric]} Comparison
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickLine={false}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickLine={false}
            tickFormatter={formatValue}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {data.map((item, index) => (
          <div key={item.name} className="text-center">
            <div
              className="w-4 h-4 rounded-full mx-auto mb-1"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <p className="text-xs font-medium text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-600">{formatValue(item[metric])}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetitorComparison;
