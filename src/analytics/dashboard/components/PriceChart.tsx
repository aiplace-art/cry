'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';

export interface PriceChartProps {
  data: Array<{ timestamp: number; price: number; volume?: number }>;
  type?: 'line' | 'area';
  height?: number;
  showVolume?: boolean;
  loading?: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  type = 'area',
  height = 300,
  showVolume = false,
  loading = false,
}) => {
  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      date: format(new Date(item.timestamp), 'MMM dd, HH:mm'),
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">{payload[0].payload.date}</p>
          <p className="text-lg font-bold text-hypeai-primary">
            ${payload[0].value.toFixed(6)}
          </p>
          {showVolume && payload[1] && (
            <p className="text-sm text-gray-600 mt-1">
              Volume: ${payload[1].value.toLocaleString()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse" style={{ height }}>
          <div className="h-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={formattedData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickLine={false}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickLine={false}
            tickFormatter={(value) => `$${value.toFixed(4)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          {showVolume && <Legend />}
          {type === 'area' ? (
            <Area
              type="monotone"
              dataKey="price"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#colorPrice)"
            />
          ) : (
            <Line
              type="monotone"
              dataKey="price"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
