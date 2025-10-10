'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  footer?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel = '24h',
  icon,
  trend,
  loading = false,
  footer,
}) => {
  const getTrendIcon = () => {
    if (!change && !trend) return null;

    const determinedTrend = trend || (change && change > 0 ? 'up' : change && change < 0 ? 'down' : 'neutral');

    const iconClass = 'w-4 h-4';
    switch (determinedTrend) {
      case 'up':
        return <TrendingUp className={`${iconClass} text-green-500`} />;
      case 'down':
        return <TrendingDown className={`${iconClass} text-red-500`} />;
      default:
        return <Minus className={`${iconClass} text-gray-500`} />;
    }
  };

  const getChangeColor = () => {
    if (!change) return 'text-gray-600';
    return change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && <div className="text-hypeai-primary">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>

      {(change !== undefined || trend) && (
        <div className="flex items-center gap-1 text-sm">
          {getTrendIcon()}
          <span className={`font-medium ${getChangeColor()}`}>
            {change !== undefined && (
              <>
                {change > 0 && '+'}
                {typeof change === 'number' ? change.toFixed(2) : change}%
              </>
            )}
          </span>
          {changeLabel && (
            <span className="text-gray-500 ml-1">{changeLabel}</span>
          )}
        </div>
      )}

      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
