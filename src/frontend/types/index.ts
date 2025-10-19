import { BrowserProvider, JsonRpcSigner } from 'ethers';

export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  price: number;
  marketCap: number;
  holders: number;
  priceChange24h: number;
  volume24h: number;
}

export interface StakingData {
  userStaked: string;
  totalStaked: string;
  apy: number;
  rewards: string;
  lockPeriod: number;
  unlockTime: number;
}

export interface TradeData {
  timestamp: number;
  price: number;
  volume: number;
  type: 'buy' | 'sell';
}

export interface ChartDataPoint {
  time: number;
  price: number;
  volume: number;
}

export interface AIInsight {
  id: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  title: string;
  description: string;
  timestamp: number;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  votesFor: string;
  votesAgainst: string;
  startTime: number;
  endTime: number;
  executed: boolean;
}

export interface WalletState {
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
}

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

// Presale types
export interface Purchase {
  id: string;
  amount: number;
  tokenAmount: number;
  bonusPercentage: number;
  timestamp: number;
  txHash: string;
  email?: string;
}

export interface ReferralStats {
  code: string;
  totalReferrals: number;
  totalEarnings: number;
  directReferrals: number;
  secondTierReferrals: number;
  thirdTierReferrals: number;
}

export interface WalletConnection {
  address: string;
  chainId: number;
  isConnected: boolean;
}

// Export all presale types
export type { PaymentMethod, PrivateSaleConfig, CalculatorResult, TransactionResult } from './private-sale';
export type { PresaleRound, PresaleProgress } from './presale';
