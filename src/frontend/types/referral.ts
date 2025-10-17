// Referral System Types

export interface User {
  id: string;
  wallet?: string;
  email?: string;
  name?: string;
  referralCode: string;
  createdAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  totalEarned: number;
  totalEarnedUSDT: number;
  totalEarnedHYPE: number;
  pendingRewards: number;
  paidRewards: number;
}

export interface Referral {
  id: string;
  referredUser: {
    wallet?: string;
    email?: string;
    name?: string;
  };
  purchaseAmount: number;
  commissionAmount: number;
  commissionPercentage: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
}

export interface RewardClaim {
  id: string;
  amount: number;
  tokenAmount?: number;
  rewardType: 'USDT' | 'HYPE';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  createdAt: string;
  completedAt?: string;
}

export interface UserSettings {
  rewardType: 'USDT' | 'HYPE';
  payoutWallet: string;
  emailNotifications: boolean;
  telegramNotifications: boolean;
  kycStatus: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  kycDocumentUrl?: string;
}

export interface ReferralLink {
  code: string;
  url: string;
  qrCode: string;
  clicks: number;
  conversions: number;
}

export interface FilterOptions {
  status?: 'pending' | 'paid' | 'cancelled';
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

export interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
