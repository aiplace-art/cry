'use client';

import React from 'react';
import { useTokenData } from '@/hooks/useTokenData';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Loading } from './ui/Loading';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3 } from 'lucide-react';

interface TokenDashboardProps {
  tokenAddress: string;
}

export const TokenDashboard: React.FC<TokenDashboardProps> = ({ tokenAddress }) => {
  const { tokenData, loading, error } = useTokenData(tokenAddress);

  if (loading) return <Loading text="Loading token data..." />;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!tokenData) return null;

  const isPositive = tokenData.priceChange24h >= 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {tokenData.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{tokenData.symbol}</p>
        </div>
        <Badge variant={isPositive ? 'success' : 'danger'}>
          {isPositive ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
          {isPositive ? '+' : ''}{tokenData.priceChange24h.toFixed(2)}%
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card gradient hover>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(tokenData.price)}
                </p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card gradient hover>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ${formatNumber(tokenData.marketCap)}
                </p>
              </div>
              <div className="p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
                <BarChart3 className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card gradient hover>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">24h Volume</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ${formatNumber(tokenData.volume24h)}
                </p>
              </div>
              <div className="p-3 bg-accent-100 dark:bg-accent-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-accent-600 dark:text-accent-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card gradient hover>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Holders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatNumber(tokenData.holders, 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Token Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Contract Address</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white mt-1 break-all">
                {tokenData.address}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Supply</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {formatNumber(Number(tokenData.totalSupply) / Math.pow(10, tokenData.decimals), 0)} {tokenData.symbol}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
