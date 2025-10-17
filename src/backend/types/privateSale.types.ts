export enum PaymentMethod {
  ETH = 'ETH',
  USDT = 'USDT',
  USDC = 'USDC',
  BTC = 'BTC',
  CARD = 'CARD'
}

export enum PurchaseStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PaymentGateway {
  COINBASE = 'coinbase',
  NOWPAYMENTS = 'nowpayments',
  COINGATE = 'coingate'
}

export interface PurchaseRequest {
  walletAddress: string;
  paymentMethod: PaymentMethod;
  amountUSD: number;
  referralCode?: string;
  email: string;
}

export interface Purchase {
  id: number;
  walletAddress: string;
  paymentMethod: PaymentMethod;
  amountUsd: number;
  tokensPurchased: bigint;
  bonusTokens: bigint;
  totalTokens: bigint;
  txHash?: string;
  paymentId?: string;
  status: PurchaseStatus;
  referralCode?: string;
  vestingStartDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Claim {
  id: number;
  purchaseId: number;
  tokensClaimed: bigint;
  txHash?: string;
  claimedAt: Date;
}

export interface Referral {
  id: number;
  referralCode: string;
  referrerWallet: string;
  referredWallet: string;
  bonusTokens: bigint;
  bonusPercentage: number;
  createdAt: Date;
}

export interface SaleConfig {
  id: number;
  totalTokens: bigint;
  tokensSold: bigint;
  tokenPriceUsd: number;
  minPurchaseUsd: number;
  maxPurchaseUsd: number;
  saleStartDate: Date;
  saleEndDate: Date;
  vestingMonths: number;
  initialUnlockPercentage: number;
  isActive: boolean;
  updatedAt: Date;
}

export interface SaleStatus {
  totalTokens: bigint;
  tokensSold: bigint;
  tokensRemaining: bigint;
  totalRaised: number;
  totalPurchases: number;
  uniqueBuyers: number;
  isActive: boolean;
  saleEndDate: Date;
}

export interface UserPurchaseHistory {
  purchases: Purchase[];
  totalInvested: number;
  totalTokens: bigint;
  claimedTokens: bigint;
  claimableTokens: bigint;
  vestingSchedule: VestingSchedule[];
}

export interface VestingSchedule {
  unlockDate: Date;
  tokensUnlocked: bigint;
  percentage: number;
  isClaimed: boolean;
}

export interface PaymentResponse {
  paymentId: string;
  paymentUrl: string;
  paymentAddress: string;
  amount: number;
  currency: string;
  expiresAt: Date;
}

export interface ClaimRequest {
  walletAddress: string;
  purchaseId: number;
  signature: string;
}

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  totalBonusTokens: bigint;
  referrals: Array<{
    wallet: string;
    tokens: bigint;
    date: Date;
  }>;
}
