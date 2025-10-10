'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Brain, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import type { AIInsight } from '@/types';

export const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        // In production, fetch from API: const data = await aiApi.getInsights('TOKEN');
        // For now, using mock data
        const mockInsights: AIInsight[] = [
          {
            id: '1',
            type: 'bullish',
            confidence: 0.82,
            title: 'Strong Buy Signal Detected',
            description: 'Technical indicators show strong upward momentum with RSI at 45 and MACD crossing above signal line. Trading volume increased by 35% in the last 24 hours.',
            timestamp: Date.now() - 300000,
          },
          {
            id: '2',
            type: 'neutral',
            confidence: 0.65,
            title: 'Market Consolidation Phase',
            description: 'Price action suggests consolidation between support at $1.18 and resistance at $1.28. Watch for breakout in either direction.',
            timestamp: Date.now() - 1800000,
          },
          {
            id: '3',
            type: 'bullish',
            confidence: 0.75,
            title: 'Whale Activity Detected',
            description: 'Large wallet addresses have increased their holdings by 12% in the past week, indicating institutional confidence.',
            timestamp: Date.now() - 3600000,
          },
          {
            id: '4',
            type: 'bearish',
            confidence: 0.58,
            title: 'Overbought Conditions',
            description: 'RSI approaching overbought territory at 68. Consider taking profits or wait for pullback to enter positions.',
            timestamp: Date.now() - 7200000,
          },
        ];

        setInsights(mockInsights);
      } catch (error) {
        console.error('Error fetching AI insights:', error);
      }
    };

    fetchInsights();
    // Refresh insights every 5 minutes
    const interval = setInterval(fetchInsights, 300000);

    return () => clearInterval(interval);
  }, []);

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'bullish':
        return <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'bearish':
        return <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getInsightBadge = (type: AIInsight['type']) => {
    switch (type) {
      case 'bullish':
        return <Badge variant="success">Bullish</Badge>;
      case 'bearish':
        return <Badge variant="danger">Bearish</Badge>;
      default:
        return <Badge variant="neutral">Neutral</Badge>;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-6">
      <Card gradient>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            AI-Powered Market Insights
            <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Real-time analysis powered by machine learning algorithms analyzing on-chain data, technical indicators, and market sentiment.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {insights.map((insight) => (
          <Card
            key={insight.id}
            hover
            className={`border-l-4 ${
              insight.type === 'bullish'
                ? 'border-l-green-500'
                : insight.type === 'bearish'
                ? 'border-l-red-500'
                : 'border-l-gray-500'
            }`}
          >
            <CardContent>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getInsightIcon(insight.type)}
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {insight.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  {getInsightBadge(insight.type)}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(insight.timestamp)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {insight.description}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-primary"
                    style={{ width: `${insight.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {(insight.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Premium AI Features
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upgrade to access advanced predictive models, sentiment analysis, and personalized trading signals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
