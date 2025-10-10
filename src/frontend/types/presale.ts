/**
 * Type definitions for presale intelligent features
 */

export interface PriceData {
  bnbPriceUSD: number;
  hypeaiPriceUSD: number;
  lastUpdated: number;
}

export interface CalculationResult {
  bnbAmount: number;
  usdtAmount: number;
  hypeaiTokens: number;
  bonusTokens: number;
  totalTokens: number;
  roi: {
    week1: number;
    month1: number;
    month6: number;
  };
  vipTier: VIPTier | null;
}

export interface VIPTier {
  name: string;
  minInvestment: number;
  maxInvestment: number;
  bonusPercentage: number;
  benefits: string[];
  priority: number;
}

export interface AnalyticsEvent {
  event: string;
  timestamp: number;
  data?: Record<string, any>;
  userId?: string;
}

export interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
}

export interface LiveUpdate {
  type: 'purchase' | 'milestone' | 'visitor' | 'progress';
  timestamp: number;
  data: any;
}

export interface Recommendation {
  type: 'investment' | 'payment' | 'timing' | 'tier';
  title: string;
  description: string;
  value: string;
  confidence: number;
  reason: string;
}

export interface VisitorStats {
  online: number;
  total: number;
  purchases24h: number;
  avgInvestment: number;
}

export interface PresaleProgress {
  current: number;
  target: number;
  percentage: number;
  remaining: number;
  timeLeft: number;
}
