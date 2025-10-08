'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import type { ChartDataPoint } from '@/types';

interface TradingChartProps {
  tokenSymbol: string;
}

export const TradingChart: React.FC<TradingChartProps> = ({ tokenSymbol }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '30D'>('24H');

  useEffect(() => {
    // Generate mock chart data
    const generateData = () => {
      const points = timeframe === '1H' ? 60 : timeframe === '24H' ? 24 : timeframe === '7D' ? 7 : 30;
      const basePrice = 1.23;
      const data: ChartDataPoint[] = [];

      for (let i = 0; i < points; i++) {
        const volatility = 0.05;
        const trend = Math.sin(i / 10) * 0.1;
        const random = (Math.random() - 0.5) * volatility;
        const price = basePrice * (1 + trend + random);
        const volume = 10000 + Math.random() * 5000;

        data.push({
          time: Date.now() - (points - i) * (timeframe === '1H' ? 60000 : 3600000),
          price,
          volume,
        });
      }

      return data;
    };

    setChartData(generateData());
  }, [timeframe]);

  const currentPrice = chartData[chartData.length - 1]?.price || 0;
  const previousPrice = chartData[0]?.price || 0;
  const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {tokenSymbol} / USD
              </CardTitle>
              <Badge variant={isPositive ? 'success' : 'danger'}>
                {isPositive ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
              </Badge>
            </div>
            <div className="flex gap-2">
              {(['1H', '24H', '7D', '30D'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    timeframe === tf
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(currentPrice)}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="time"
                tickFormatter={(time) => {
                  const date = new Date(time);
                  if (timeframe === '1H') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  if (timeframe === '24H') return date.toLocaleTimeString([], { hour: '2-digit' });
                  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }}
                stroke="#6b7280"
              />
              <YAxis
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                stroke="#6b7280"
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload[0]) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(data.time).toLocaleString()}
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(data.price)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Vol: ${data.volume.toFixed(0)}
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="time"
                tickFormatter={(time) => new Date(time).toLocaleTimeString([], { hour: '2-digit' })}
                stroke="#6b7280"
              />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} stroke="#6b7280" />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload[0]) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ${data.volume.toFixed(0)}
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#volumeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
