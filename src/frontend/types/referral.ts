// Referral System Types

export type BadgeLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface User {
  id: string;
  wallet?: string;
  email?: string;
  name?: string;
  referralCode: string;
  createdAt: string;
  level?: BadgeLevel;
}

export interface ReferralStats {
  totalReferrals: number;
  totalEarned: number;
  totalEarnedUSDT: number;
  totalEarnedHYPE: number;
  pendingRewards: number;
  paidRewards: number;
  totalVolume: number;
  level: BadgeLevel;
  levelProgress: number;
  nextLevelThreshold: number;
  bonusMultiplier: number;
  milestoneRewards: number;
  unclaimedMilestones: number[];
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
  conversionRate?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: BadgeLevel;
  requirement: string;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
  total?: number;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  name?: string;
  totalVolume: number;
  totalReferrals: number;
  totalEarned: number;
  level: BadgeLevel;
  badges: string[];
}

export interface MilestoneData {
  index: number;
  threshold: number;
  reward: number;
  reached: boolean;
  claimed: boolean;
  progress: number;
}

export type NotificationType = 'new_referral' | 'milestone' | 'level_up' | 'reward' | 'achievement' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
  icon?: string;
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
