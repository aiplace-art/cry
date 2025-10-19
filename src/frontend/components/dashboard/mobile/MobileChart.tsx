import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

// Simplified chart for mobile - keeping it lightweight
const chartData = [
  { time: '00:00', value: 60 },
  { time: '04:00', value: 75 },
  { time: '08:00', value: 65 },
  { time: '12:00', value: 85 },
  { time: '16:00', value: 80 },
  { time: '20:00', value: 95 },
  { time: '24:00', value: 90 },
];

export function MobileChart() {
  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Price Chart
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last 24 hours
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-bold text-green-600 dark:text-green-400">
            +24.5%
          </span>
        </div>
      </div>

      {/* Simple SVG Chart */}
      <div className="relative h-48 w-full">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 50"
          preserveAspectRatio="none"
        >
          {/* Grid Lines */}
          <g className="opacity-20">
            {[0, 25, 50, 75, 100].map((x) => (
              <line
                key={`v-${x}`}
                x1={x}
                y1="0"
                x2={x}
                y2="50"
                stroke="currentColor"
                strokeWidth="0.2"
                className="text-gray-400 dark:text-gray-600"
              />
            ))}
            {[0, 12.5, 25, 37.5, 50].map((y) => (
              <line
                key={`h-${y}`}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="currentColor"
                strokeWidth="0.2"
                className="text-gray-400 dark:text-gray-600"
              />
            ))}
          </g>

          {/* Gradient */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area */}
          <motion.path
            d={generateAreaPath(chartData, maxValue, minValue, range)}
            fill="url(#chartGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Line */}
          <motion.path
            d={generateLinePath(chartData, maxValue, minValue, range)}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />

          {/* Data Points */}
          {chartData.map((point, index) => {
            const x = (index / (chartData.length - 1)) * 100;
            const y = 50 - ((point.value - minValue) / range) * 50;
            return (
              <motion.circle
                key={index}
                cx={x}
                cy={y}
                r="1"
                fill="#3b82f6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              />
            );
          })}
        </svg>

        {/* Time Labels */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>0h</span>
          <span>12h</span>
          <span>24h</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">High</p>
          <p className="font-bold text-gray-900 dark:text-white">${(maxValue / 100).toFixed(4)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Low</p>
          <p className="font-bold text-gray-900 dark:text-white">${(minValue / 100).toFixed(4)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Volume</p>
          <p className="font-bold text-gray-900 dark:text-white">$45.2K</p>
        </div>
      </div>
    </div>
  );
}

function generateLinePath(
  data: { time: string; value: number }[],
  max: number,
  min: number,
  range: number
): string {
  return data
    .map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 50 - ((point.value - min) / range) * 50;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

function generateAreaPath(
  data: { time: string; value: number }[],
  max: number,
  min: number,
  range: number
): string {
  const linePath = generateLinePath(data, max, min, range);
  return `${linePath} L 100 50 L 0 50 Z`;
}
