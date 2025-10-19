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

export interface PresaleRound {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  targetAmount: number;
  hardCap: number; // Maximum amount that can be raised
  currentAmount: number;
  collected: number; // Amount collected so far
  tokenPrice: number;
  price: number; // Alias for tokenPrice
  bonusPercentage: number;
  bonus: number; // Alias for bonusPercentage
  minPurchase: number;
  maxPurchase: number;
  isActive: boolean;
}

export type PaymentMethod = 'ETH' | 'BNB' | 'USDT' | 'USDC' | 'SOL';

export interface TokenPurchase {
  id: string;
  buyer: string;
  amount: number;
  tokenAmount: number;
  timestamp: number;
  txHash: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface VestingSchedule {
  totalAmount: number;
  released: number;
  startTime: number;
  duration: number;
  cliffDuration: number;
  intervals: VestingInterval[];
}

export interface VestingInterval {
  releaseTime: number;
  amount: number;
  released: boolean;
}
