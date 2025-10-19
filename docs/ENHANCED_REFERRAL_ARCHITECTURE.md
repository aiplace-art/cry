# Enhanced HypeAI Referral System Architecture

## Executive Summary

This document presents a comprehensive architectural redesign of the HypeAI referral system, transforming it from a basic 2-tier reward system into a **gamified, multi-tier ecosystem** designed to maximize user engagement and viral growth.

### Key Improvements
- **Doubled Base Rewards**: 10% L1, 5% L2 (from 5% and 2%)
- **New 3rd Tier**: 2% rewards for deep referral chains
- **4-Tier Status System**: Bronze → Silver → Gold → Platinum
- **Comprehensive Gamification**: Leaderboards, badges, challenges, lottery
- **Enhanced Incentives**: Milestone bonuses, early bird rewards, monthly prizes

### Expected Impact
- **3-5x increase** in referral participation
- **40-60% longer** referral chain depth
- **2-3x higher** average referral count per user
- **Viral coefficient** increase from ~1.2 to ~2.5-3.5

---

## Table of Contents

1. [Current System Analysis](#1-current-system-analysis)
2. [Enhanced Reward Structure](#2-enhanced-reward-structure)
3. [Status Tier System](#3-status-tier-system)
4. [Gamification Layer](#4-gamification-layer)
5. [System Architecture](#5-system-architecture)
6. [Database Schema](#6-database-schema)
7. [Smart Contract Modifications](#7-smart-contract-modifications)
8. [API Specification](#8-api-specification)
9. [Security & Anti-Fraud](#9-security--anti-fraud)
10. [Implementation Roadmap](#10-implementation-roadmap)
11. [Success Metrics](#11-success-metrics)

---

## 1. Current System Analysis

### 1.1 Existing Features
```solidity
// Current reward structure
DIRECT_REFERRAL_REWARD = 500 (5%)
SECOND_TIER_REWARD = 200 (2%)
MAX_REWARD_CAP_USD = $10,000
MIN_REFERRAL_PURCHASE = $400
```

### 1.2 Limitations Identified
1. **Low reward percentages** compared to industry standards (7-15%)
2. **Only 2 tiers** - limits viral potential
3. **No status progression** - all users treated equally
4. **No gamification** - purely transactional
5. **Single cap** - doesn't reward top performers differently
6. **No milestone incentives** - linear reward curve

### 1.3 Competitive Analysis

| Platform | L1 Reward | L2 Reward | L3+ Reward | Gamification | Max Cap |
|----------|-----------|-----------|------------|--------------|---------|
| **Current HypeAI** | 5% | 2% | - | None | $10K |
| **Binance** | 40% | 20% | - | Leaderboard | Unlimited |
| **Bybit** | 30% | 10% | - | Tournaments | $50K |
| **OKX** | 25% | 15% | 5% | Challenges | $100K |
| **Enhanced HypeAI** | 10% | 5% | 2% | Full Suite | Tiered |

---

## 2. Enhanced Reward Structure

### 2.1 Base Reward Tiers

```solidity
// Enhanced multi-tier rewards
TIER_1_REWARD = 1000;  // 10% (direct referrals)
TIER_2_REWARD = 500;   // 5% (referrals of referrals)
TIER_3_REWARD = 200;   // 2% (3rd level referrals)

// Minimum purchase threshold
MIN_REFERRAL_PURCHASE = 400; // $400 (unchanged)
```

### 2.2 Dynamic Reward Calculation

```javascript
function calculateReward(
  purchaseAmount: number,
  tierLevel: 1 | 2 | 3,
  userStatus: UserStatus
): number {
  const baseRate = {
    1: 0.10,  // 10%
    2: 0.05,  // 5%
    3: 0.02   // 2%
  }[tierLevel];

  const statusBonus = {
    BRONZE: 0.00,   // 0% bonus
    SILVER: 0.02,   // +2% bonus
    GOLD: 0.05,     // +5% bonus
    PLATINUM: 0.10  // +10% bonus
  }[userStatus];

  const totalRate = baseRate + statusBonus;
  return purchaseAmount * totalRate;
}
```

### 2.3 Example Reward Scenarios

#### Scenario 1: Bronze User (Standard)
```
Purchase: $1,000
L1 Reward: $100 (10%)
L2 Reward: $50 (5%)
L3 Reward: $20 (2%)
Total Chain: $170
```

#### Scenario 2: Platinum User (100+ referrals)
```
Purchase: $1,000
L1 Base: $100 (10%) + $100 bonus (10%) = $200
L2 Base: $50 (5%) + $50 bonus (10%) = $100
L3 Base: $20 (2%) + $20 bonus (10%) = $40
Total Chain: $340 (2x Bronze!)
```

### 2.4 Tiered Cap System

```typescript
interface RewardCaps {
  BRONZE: {
    maxReward: 10000,      // $10K
    maxPerTier: [7000, 2000, 1000]  // L1, L2, L3
  },
  SILVER: {
    maxReward: 25000,      // $25K
    maxPerTier: [15000, 7000, 3000]
  },
  GOLD: {
    maxReward: 75000,      // $75K
    maxPerTier: [45000, 20000, 10000]
  },
  PLATINUM: {
    maxReward: 250000,     // $250K
    maxPerTier: [150000, 70000, 30000]
  }
}
```

---

## 3. Status Tier System

### 3.1 Tier Requirements

```typescript
enum UserStatus {
  BRONZE = 'BRONZE',      // 0-9 direct referrals
  SILVER = 'SILVER',      // 10-49 direct referrals
  GOLD = 'GOLD',          // 50-99 direct referrals
  PLATINUM = 'PLATINUM'   // 100+ direct referrals
}

interface StatusRequirements {
  status: UserStatus;
  minReferrals: number;
  maxReferrals: number;
  bonusPercentage: number;
  maxCap: number;
  perks: string[];
}

const STATUS_TIERS: StatusRequirements[] = [
  {
    status: 'BRONZE',
    minReferrals: 0,
    maxReferrals: 9,
    bonusPercentage: 0,
    maxCap: 10000,
    perks: [
      'Base referral rewards',
      'Access to referral dashboard',
      'Monthly reports'
    ]
  },
  {
    status: 'SILVER',
    minReferrals: 10,
    maxReferrals: 49,
    bonusPercentage: 2,
    maxCap: 25000,
    perks: [
      '+2% bonus on all tiers',
      'Priority support',
      'Silver badge',
      'Early access to new features',
      'Monthly performance analytics'
    ]
  },
  {
    status: 'GOLD',
    minReferrals: 50,
    maxReferrals: 99,
    bonusPercentage: 5,
    maxCap: 75000,
    perks: [
      '+5% bonus on all tiers',
      'VIP support line',
      'Gold badge',
      'Custom referral landing page',
      'Weekly strategy calls',
      'Marketing materials kit'
    ]
  },
  {
    status: 'PLATINUM',
    minReferrals: 100,
    maxReferrals: Infinity,
    bonusPercentage: 10,
    maxCap: 250000,
    perks: [
      '+10% bonus on all tiers',
      'Dedicated account manager',
      'Platinum badge',
      'Custom subdomain (refer.hypeai.io/username)',
      'API access for automation',
      'Quarterly business review',
      'Invitation to annual summit',
      'Co-marketing opportunities'
    ]
  }
];
```

### 3.2 Status Progression Logic

```typescript
function calculateUserStatus(referralCount: number): UserStatus {
  if (referralCount >= 100) return UserStatus.PLATINUM;
  if (referralCount >= 50) return UserStatus.GOLD;
  if (referralCount >= 10) return UserStatus.SILVER;
  return UserStatus.BRONZE;
}

function checkStatusUpgrade(
  userId: string,
  currentStatus: UserStatus,
  referralCount: number
): StatusUpgrade | null {
  const newStatus = calculateUserStatus(referralCount);

  if (newStatus !== currentStatus) {
    return {
      userId,
      oldStatus: currentStatus,
      newStatus,
      timestamp: Date.now(),
      rewards: getUpgradeBonus(newStatus)
    };
  }

  return null;
}

function getUpgradeBonus(status: UserStatus): number {
  const bonuses = {
    SILVER: 100,    // $100 bonus
    GOLD: 500,      // $500 bonus
    PLATINUM: 2000  // $2,000 bonus
  };
  return bonuses[status] || 0;
}
```

---

## 4. Gamification Layer

### 4.1 Badge System

```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  requirement: BadgeRequirement;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  reward?: number; // Optional HYPE token bonus
}

const BADGES: Badge[] = [
  // Achievement Badges
  {
    id: 'first_referral',
    name: 'First Steps',
    description: 'Made your first referral',
    rarity: 'COMMON',
    requirement: { type: 'REFERRAL_COUNT', value: 1 },
    reward: 1000 // 1K HYPE tokens
  },
  {
    id: 'referral_milestone_5',
    name: 'Network Builder',
    description: 'Referred 5 users',
    rarity: 'COMMON',
    requirement: { type: 'REFERRAL_COUNT', value: 5 },
    reward: 50 // $50 USDT
  },
  {
    id: 'referral_milestone_25',
    name: 'Community Leader',
    description: 'Referred 25 users',
    rarity: 'RARE',
    requirement: { type: 'REFERRAL_COUNT', value: 25 },
    reward: 100 // $100 USDT
  },
  {
    id: 'referral_milestone_100',
    name: 'Growth Champion',
    description: 'Referred 100 users',
    rarity: 'EPIC',
    requirement: { type: 'REFERRAL_COUNT', value: 100 },
    reward: 500 // $500 USDT
  },
  {
    id: 'volume_1k',
    name: 'Volume Driver',
    description: 'Generated $1K in referral volume',
    rarity: 'RARE',
    requirement: { type: 'TOTAL_VOLUME', value: 1000 }
  },
  {
    id: 'volume_10k',
    name: 'Mega Influencer',
    description: 'Generated $10K in referral volume',
    rarity: 'EPIC',
    requirement: { type: 'TOTAL_VOLUME', value: 10000 }
  },
  {
    id: 'volume_100k',
    name: 'Whale Master',
    description: 'Generated $100K in referral volume',
    rarity: 'LEGENDARY',
    requirement: { type: 'TOTAL_VOLUME', value: 100000 },
    reward: 5000 // $5K USDT
  },

  // Speed Badges
  {
    id: 'quick_start',
    name: 'Quick Starter',
    description: 'Got 5 referrals in first week',
    rarity: 'RARE',
    requirement: { type: 'SPEED', referrals: 5, days: 7 }
  },
  {
    id: 'viral_velocity',
    name: 'Viral Velocity',
    description: 'Got 25 referrals in first month',
    rarity: 'EPIC',
    requirement: { type: 'SPEED', referrals: 25, days: 30 }
  },

  // Chain Depth Badges
  {
    id: 'chain_builder',
    name: 'Chain Builder',
    description: 'Built a 3-level referral chain',
    rarity: 'COMMON',
    requirement: { type: 'CHAIN_DEPTH', value: 3 }
  },
  {
    id: 'network_architect',
    name: 'Network Architect',
    description: 'Built a 5-level referral chain',
    rarity: 'EPIC',
    requirement: { type: 'CHAIN_DEPTH', value: 5 }
  },

  // Leaderboard Badges
  {
    id: 'top_10',
    name: 'Elite 10',
    description: 'Ranked in top 10 referrers',
    rarity: 'EPIC',
    requirement: { type: 'LEADERBOARD_RANK', max: 10 }
  },
  {
    id: 'number_one',
    name: 'Referral King',
    description: 'Ranked #1 on leaderboard',
    rarity: 'LEGENDARY',
    requirement: { type: 'LEADERBOARD_RANK', max: 1 },
    reward: 10000 // $10K USDT
  }
];
```

### 4.2 Leaderboard System

```typescript
interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  totalReferrals: number;
  totalVolume: number;
  totalEarnings: number;
  status: UserStatus;
  badges: Badge[];
  trend: 'UP' | 'DOWN' | 'STABLE'; // Week-over-week
}

interface Leaderboard {
  period: 'ALL_TIME' | 'MONTHLY' | 'WEEKLY';
  lastUpdated: number;
  entries: LeaderboardEntry[];
  userRank?: number; // Current user's rank
}

// Leaderboard categories
enum LeaderboardCategory {
  TOTAL_REFERRALS = 'total_referrals',
  TOTAL_VOLUME = 'total_volume',
  TOTAL_EARNINGS = 'total_earnings',
  MONTHLY_GROWTH = 'monthly_growth',
  CHAIN_DEPTH = 'chain_depth'
}
```

### 4.3 Challenge System

```typescript
interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'PERSONAL' | 'COMMUNITY';
  startDate: number;
  endDate: number;
  goal: ChallengeGoal;
  reward: ChallengeReward;
  participants?: number;
  progress?: number; // 0-100%
}

interface ChallengeGoal {
  type: 'REFERRAL_COUNT' | 'VOLUME' | 'ACTIVE_USERS' | 'CHAIN_DEPTH';
  target: number;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

interface ChallengeReward {
  type: 'TOKENS' | 'USD' | 'STATUS_BOOST' | 'NFT';
  amount?: number;
  description: string;
}

const ACTIVE_CHALLENGES: Challenge[] = [
  {
    id: 'weekly_warrior',
    name: 'Weekly Warrior',
    description: 'Refer 5 new users this week',
    type: 'PERSONAL',
    startDate: Date.now(),
    endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    goal: {
      type: 'REFERRAL_COUNT',
      target: 5,
      period: 'WEEKLY'
    },
    reward: {
      type: 'USD',
      amount: 50,
      description: '$50 bonus + Bronze → Silver boost'
    }
  },
  {
    id: 'community_1000',
    name: 'Road to 1000',
    description: 'Community goal: Reach 1000 total users',
    type: 'COMMUNITY',
    startDate: Date.now(),
    endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    goal: {
      type: 'ACTIVE_USERS',
      target: 1000,
      period: 'MONTHLY'
    },
    reward: {
      type: 'TOKENS',
      amount: 1000000,
      description: '1M HYPE tokens distributed among all participants'
    },
    participants: 247,
    progress: 34.7
  }
];
```

### 4.4 Lottery System

```typescript
interface Lottery {
  id: string;
  name: string;
  prizePool: number; // USD
  currency: 'USDT' | 'HYPE';
  drawDate: number;
  minTickets: number; // Minimum entries to trigger draw
  maxWinners: number;
  eligibility: LotteryEligibility;
  entries?: LotteryEntry[];
}

interface LotteryEligibility {
  minReferrals: number;
  minVolumeThisMonth: number;
  minStatus?: UserStatus;
}

interface LotteryEntry {
  userId: string;
  tickets: number; // Based on activity
  timestamp: number;
}

const WEEKLY_LOTTERY: Lottery = {
  id: 'weekly_hype_draw',
  name: 'Weekly HYPE Draw',
  prizePool: 1000, // $1,000 USDT
  currency: 'USDT',
  drawDate: getNextSunday(),
  minTickets: 50,
  maxWinners: 10,
  eligibility: {
    minReferrals: 1,
    minVolumeThisMonth: 400 // At least 1 referral purchase
  }
};

// Ticket calculation
function calculateLotteryTickets(user: User): number {
  let tickets = 0;

  // Base: 1 ticket per active referral this month
  tickets += user.monthlyReferrals;

  // Bonus: 5 tickets per $1K volume this month
  tickets += Math.floor(user.monthlyVolume / 1000) * 5;

  // Status multiplier
  const multiplier = {
    BRONZE: 1,
    SILVER: 1.5,
    GOLD: 2,
    PLATINUM: 3
  }[user.status];

  return Math.floor(tickets * multiplier);
}
```

---

## 5. System Architecture

### 5.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                     │
├─────────────────────────────────────────────────────────────┤
│  Web App  │  Mobile App  │  Telegram Bot  │  API Dashboard  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  REST API  │  GraphQL  │  WebSocket  │  Webhook Handler     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
├────────────────┬────────────────┬───────────────────────────┤
│  Referral      │  Gamification  │  Reward                   │
│  Service       │  Engine        │  Calculator               │
├────────────────┼────────────────┼───────────────────────────┤
│  Status        │  Leaderboard   │  Analytics                │
│  Manager       │  Service       │  Service                  │
├────────────────┼────────────────┼───────────────────────────┤
│  Badge         │  Challenge     │  Lottery                  │
│  Tracker       │  Manager       │  System                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                       │
├────────────────┬────────────────┬───────────────────────────┤
│  PostgreSQL    │  Redis Cache   │  Event Queue              │
│  (Primary DB)  │  (Session)     │  (RabbitMQ)               │
└────────────────┴────────────────┴───────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Smart Contract (Enhanced ReferralSystem.sol)                │
│  BNB Chain (BSC) - On-chain reward distribution              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Component Interaction Flow

```typescript
// Purchase Flow with Enhanced Rewards
async function processPurchase(
  buyerId: string,
  amount: number
): Promise<PurchaseResult> {

  // 1. Validate purchase
  const purchase = await validatePurchase(buyerId, amount);

  // 2. Get referral chain (3 levels)
  const chain = await getReferralChain(buyerId, 3);

  // 3. Calculate rewards for each tier
  const rewards = await Promise.all(
    chain.map(async (referrer, index) => {
      const tier = index + 1;
      const status = await getUserStatus(referrer.userId);
      const reward = calculateReward(amount, tier, status);

      // Check cap
      const canReceive = await checkRewardCap(
        referrer.userId,
        status,
        tier,
        reward
      );

      return canReceive ? reward : 0;
    })
  );

  // 4. Distribute rewards
  await distributeRewards(chain, rewards);

  // 5. Update statistics
  await updateUserStats(chain);

  // 6. Check for status upgrades
  await checkAllStatusUpgrades(chain);

  // 7. Process gamification
  await processGamification(buyerId, chain, amount);

  // 8. Emit events
  await emitPurchaseEvents(purchase, rewards);

  return {
    success: true,
    purchaseId: purchase.id,
    totalRewardsDistributed: rewards.reduce((a, b) => a + b, 0)
  };
}

// Gamification Processing
async function processGamification(
  buyerId: string,
  chain: ReferralChain,
  amount: number
): Promise<void> {

  // Update leaderboard positions
  await updateLeaderboards(chain);

  // Check and award badges
  for (const referrer of chain) {
    const newBadges = await checkBadgeEligibility(referrer.userId);
    if (newBadges.length > 0) {
      await awardBadges(referrer.userId, newBadges);
    }
  }

  // Add lottery tickets
  for (const referrer of chain) {
    const tickets = calculateLotteryTickets(referrer);
    await addLotteryTickets(referrer.userId, tickets);
  }

  // Update challenge progress
  await updateChallengeProgress(chain, amount);
}
```

### 5.3 Microservices Architecture

```typescript
// Service definitions
interface Services {
  referralService: {
    registerReferral(referee: string, referrer: string): Promise<void>;
    getReferralChain(userId: string, depth: number): Promise<ReferralChain>;
    getStats(userId: string): Promise<ReferralStats>;
  };

  rewardService: {
    calculateReward(params: RewardParams): Promise<number>;
    distributeReward(userId: string, amount: number): Promise<void>;
    claimRewards(userId: string, currency: 'HYPE' | 'USDT'): Promise<void>;
  };

  statusService: {
    getUserStatus(userId: string): Promise<UserStatus>;
    checkUpgrade(userId: string): Promise<StatusUpgrade | null>;
    applyUpgrade(upgrade: StatusUpgrade): Promise<void>;
  };

  gamificationService: {
    awardBadge(userId: string, badge: Badge): Promise<void>;
    updateLeaderboard(category: LeaderboardCategory): Promise<void>;
    getLeaderboard(category: LeaderboardCategory): Promise<Leaderboard>;
    createChallenge(challenge: Challenge): Promise<void>;
    checkChallengeCompletion(userId: string): Promise<Badge[]>;
  };

  lotteryService: {
    addTickets(userId: string, count: number): Promise<void>;
    drawWinners(lotteryId: string): Promise<LotteryResult>;
    distributePrizes(winners: LotteryWinner[]): Promise<void>;
  };

  analyticsService: {
    trackEvent(event: AnalyticsEvent): Promise<void>;
    generateReport(userId: string, period: string): Promise<Report>;
    getMetrics(filter: MetricsFilter): Promise<Metrics>;
  };
}
```

---

## 6. Database Schema

### 6.1 Core Tables

```sql
-- ============================================
-- USERS & REFERRAL RELATIONSHIPS
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(255),
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  referrer_id UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'BRONZE',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_blacklisted BOOLEAN NOT NULL DEFAULT FALSE,

  CONSTRAINT valid_status CHECK (status IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM'))
);

CREATE INDEX idx_users_referrer ON users(referrer_id);
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_code ON users(referral_code);
CREATE INDEX idx_users_status ON users(status);

-- ============================================
-- REFERRAL STATISTICS
-- ============================================

CREATE TABLE referral_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  total_direct_referrals INTEGER NOT NULL DEFAULT 0,
  total_l2_referrals INTEGER NOT NULL DEFAULT 0,
  total_l3_referrals INTEGER NOT NULL DEFAULT 0,
  total_volume_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  total_earned_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  total_claimed_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  pending_rewards_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,

  -- Tier-specific earnings
  l1_earned_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  l2_earned_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  l3_earned_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,

  -- Monthly tracking
  monthly_referrals INTEGER NOT NULL DEFAULT 0,
  monthly_volume_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  monthly_reset_at TIMESTAMP,

  -- Preferences
  reward_in_tokens BOOLEAN NOT NULL DEFAULT TRUE,

  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stats_volume ON referral_stats(total_volume_usd DESC);
CREATE INDEX idx_stats_earned ON referral_stats(total_earned_usd DESC);
CREATE INDEX idx_stats_referrals ON referral_stats(total_direct_referrals DESC);

-- ============================================
-- PURCHASES & REWARDS
-- ============================================

CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id),
  amount_usd DECIMAL(20, 2) NOT NULL,
  tokens_amount DECIMAL(30, 18) NOT NULL,
  transaction_hash VARCHAR(66),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Referral chain at time of purchase
  l1_referrer_id UUID REFERENCES users(id),
  l2_referrer_id UUID REFERENCES users(id),
  l3_referrer_id UUID REFERENCES users(id)
);

CREATE INDEX idx_purchases_buyer ON purchases(buyer_id);
CREATE INDEX idx_purchases_date ON purchases(created_at DESC);
CREATE INDEX idx_purchases_l1 ON purchases(l1_referrer_id);

CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES purchases(id),
  user_id UUID NOT NULL REFERENCES users(id),
  tier_level INTEGER NOT NULL CHECK (tier_level IN (1, 2, 3)),
  base_rate DECIMAL(5, 4) NOT NULL, -- e.g., 0.1000 for 10%
  status_bonus DECIMAL(5, 4) NOT NULL DEFAULT 0, -- e.g., 0.0200 for 2%
  final_rate DECIMAL(5, 4) NOT NULL,
  reward_usd DECIMAL(20, 2) NOT NULL,
  status_at_time VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  claimed_at TIMESTAMP,
  claim_currency VARCHAR(10), -- 'HYPE' or 'USDT'
  claim_amount DECIMAL(30, 18),
  claim_tx_hash VARCHAR(66),

  CONSTRAINT valid_status CHECK (status_at_time IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM'))
);

CREATE INDEX idx_rewards_user ON rewards(user_id);
CREATE INDEX idx_rewards_purchase ON rewards(purchase_id);
CREATE INDEX idx_rewards_unclaimed ON rewards(user_id) WHERE claimed_at IS NULL;

-- ============================================
-- STATUS HISTORY
-- ============================================

CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  old_status VARCHAR(20) NOT NULL,
  new_status VARCHAR(20) NOT NULL,
  trigger_referral_count INTEGER NOT NULL,
  bonus_awarded_usd DECIMAL(20, 2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_statuses CHECK (
    old_status IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM') AND
    new_status IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM')
  )
);

CREATE INDEX idx_status_user ON status_history(user_id, created_at DESC);

-- ============================================
-- GAMIFICATION
-- ============================================

CREATE TABLE badges (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon_url VARCHAR(255),
  rarity VARCHAR(20) NOT NULL,
  requirement_type VARCHAR(50) NOT NULL,
  requirement_value INTEGER,
  reward_amount DECIMAL(20, 2),
  reward_type VARCHAR(20),

  CONSTRAINT valid_rarity CHECK (rarity IN ('COMMON', 'RARE', 'EPIC', 'LEGENDARY'))
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  badge_id VARCHAR(50) NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,

  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges ON user_badges(user_id, earned_at DESC);

CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  category VARCHAR(50) NOT NULL,
  period VARCHAR(20) NOT NULL,
  rank INTEGER NOT NULL,
  value DECIMAL(20, 2) NOT NULL,
  snapshot_date DATE NOT NULL,

  UNIQUE(category, period, snapshot_date, rank),
  CONSTRAINT valid_category CHECK (category IN (
    'total_referrals', 'total_volume', 'total_earnings',
    'monthly_growth', 'chain_depth'
  )),
  CONSTRAINT valid_period CHECK (period IN ('weekly', 'monthly', 'all_time'))
);

CREATE INDEX idx_leaderboard_category ON leaderboards(category, period, snapshot_date, rank);
CREATE INDEX idx_leaderboard_user ON leaderboards(user_id, snapshot_date DESC);

CREATE TABLE challenges (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  goal_type VARCHAR(50) NOT NULL,
  goal_target INTEGER NOT NULL,
  goal_period VARCHAR(20) NOT NULL,
  reward_type VARCHAR(20) NOT NULL,
  reward_amount DECIMAL(20, 2),
  reward_description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  CONSTRAINT valid_type CHECK (type IN ('PERSONAL', 'COMMUNITY')),
  CONSTRAINT valid_goal_period CHECK (goal_period IN ('DAILY', 'WEEKLY', 'MONTHLY'))
);

CREATE TABLE user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  challenge_id VARCHAR(50) NOT NULL REFERENCES challenges(id),
  progress INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP,
  reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,

  UNIQUE(user_id, challenge_id)
);

CREATE INDEX idx_user_challenges ON user_challenges(user_id, challenge_id);
CREATE INDEX idx_active_challenges ON user_challenges(user_id) WHERE completed_at IS NULL;

CREATE TABLE lotteries (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  prize_pool DECIMAL(20, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  draw_date TIMESTAMP NOT NULL,
  min_tickets INTEGER NOT NULL,
  max_winners INTEGER NOT NULL,
  min_referrals INTEGER NOT NULL,
  min_volume DECIMAL(20, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  drawn_at TIMESTAMP,

  CONSTRAINT valid_currency CHECK (currency IN ('USDT', 'HYPE')),
  CONSTRAINT valid_status CHECK (status IN ('ACTIVE', 'DRAWN', 'COMPLETED', 'CANCELLED'))
);

CREATE TABLE lottery_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_id VARCHAR(50) NOT NULL REFERENCES lotteries(id),
  user_id UUID NOT NULL REFERENCES users(id),
  tickets INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE(lottery_id, user_id)
);

CREATE INDEX idx_lottery_entries ON lottery_entries(lottery_id, user_id);

CREATE TABLE lottery_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_id VARCHAR(50) NOT NULL REFERENCES lotteries(id),
  user_id UUID NOT NULL REFERENCES users(id),
  prize_amount DECIMAL(20, 2) NOT NULL,
  prize_currency VARCHAR(10) NOT NULL,
  announced_at TIMESTAMP NOT NULL DEFAULT NOW(),
  claimed_at TIMESTAMP,
  claim_tx_hash VARCHAR(66),

  UNIQUE(lottery_id, user_id)
);

CREATE INDEX idx_lottery_winners ON lottery_winners(lottery_id);
CREATE INDEX idx_unclaimed_prizes ON lottery_winners(user_id) WHERE claimed_at IS NULL;

-- ============================================
-- ANALYTICS & EVENTS
-- ============================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_user ON events(user_id, created_at DESC);
CREATE INDEX idx_events_type ON events(event_type, created_at DESC);
CREATE INDEX idx_events_data ON events USING GIN(event_data);

-- ============================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- ============================================

CREATE MATERIALIZED VIEW mv_top_referrers AS
SELECT
  u.id,
  u.username,
  u.wallet_address,
  u.status,
  rs.total_direct_referrals,
  rs.total_volume_usd,
  rs.total_earned_usd,
  RANK() OVER (ORDER BY rs.total_volume_usd DESC) as volume_rank,
  RANK() OVER (ORDER BY rs.total_direct_referrals DESC) as referral_rank
FROM users u
JOIN referral_stats rs ON u.id = rs.user_id
WHERE u.is_active = TRUE
ORDER BY rs.total_volume_usd DESC
LIMIT 100;

CREATE UNIQUE INDEX idx_mv_top_referrers ON mv_top_referrers(id);

-- Refresh schedule (run hourly)
-- SELECT cron.schedule('refresh-top-referrers', '0 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_referrers');
```

### 6.2 Database Triggers

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_stats_updated_at
  BEFORE UPDATE ON referral_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-check status upgrade on referral count change
CREATE OR REPLACE FUNCTION check_status_upgrade()
RETURNS TRIGGER AS $$
DECLARE
  current_status VARCHAR(20);
  new_status VARCHAR(20);
  bonus_amount DECIMAL(20, 2);
BEGIN
  -- Get current status
  SELECT status INTO current_status FROM users WHERE id = NEW.user_id;

  -- Determine new status based on referral count
  IF NEW.total_direct_referrals >= 100 THEN
    new_status := 'PLATINUM';
    bonus_amount := 2000;
  ELSIF NEW.total_direct_referrals >= 50 THEN
    new_status := 'GOLD';
    bonus_amount := 500;
  ELSIF NEW.total_direct_referrals >= 10 THEN
    new_status := 'SILVER';
    bonus_amount := 100;
  ELSE
    new_status := 'BRONZE';
    bonus_amount := 0;
  END IF;

  -- If status changed, update user and record history
  IF new_status != current_status THEN
    UPDATE users SET status = new_status WHERE id = NEW.user_id;

    INSERT INTO status_history (
      user_id, old_status, new_status,
      trigger_referral_count, bonus_awarded_usd
    ) VALUES (
      NEW.user_id, current_status, new_status,
      NEW.total_direct_referrals, bonus_amount
    );

    -- Award upgrade bonus
    IF bonus_amount > 0 THEN
      UPDATE referral_stats
      SET pending_rewards_usd = pending_rewards_usd + bonus_amount
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_status_upgrade
  AFTER UPDATE OF total_direct_referrals ON referral_stats
  FOR EACH ROW
  WHEN (OLD.total_direct_referrals IS DISTINCT FROM NEW.total_direct_referrals)
  EXECUTE FUNCTION check_status_upgrade();

-- Monthly stats reset
CREATE OR REPLACE FUNCTION reset_monthly_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.monthly_reset_at IS NULL OR
     NEW.monthly_reset_at < date_trunc('month', CURRENT_DATE) THEN
    NEW.monthly_referrals := 0;
    NEW.monthly_volume_usd := 0;
    NEW.monthly_reset_at := date_trunc('month', CURRENT_DATE);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_monthly_reset
  BEFORE UPDATE ON referral_stats
  FOR EACH ROW
  EXECUTE FUNCTION reset_monthly_stats();
```

---

## 7. Smart Contract Modifications

### 7.1 Enhanced Contract Structure

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Enhanced HypeAI Referral System
 * @notice Advanced multi-tier referral system with status-based bonuses
 */
contract EnhancedHypeAIReferral is Ownable, ReentrancyGuard, Pausable {

    // ============ ENUMS ============

    enum UserStatus {
        BRONZE,   // 0-9 referrals
        SILVER,   // 10-49 referrals
        GOLD,     // 50-99 referrals
        PLATINUM  // 100+ referrals
    }

    // ============ STATE VARIABLES ============

    IERC20 public immutable hypeToken;
    IERC20 public immutable usdtToken;
    address public privateSaleContract;

    // Enhanced reward structure
    uint256 public constant TIER_1_REWARD = 1000;  // 10%
    uint256 public constant TIER_2_REWARD = 500;   // 5%
    uint256 public constant TIER_3_REWARD = 200;   // 2%

    uint256 public constant MIN_REFERRAL_PURCHASE = 400; // $400
    uint256 private constant BASIS_POINTS = 10000;

    // Status bonus percentages (in basis points)
    mapping(UserStatus => uint256) public statusBonus;

    // Tiered caps by status
    mapping(UserStatus => uint256) public maxRewardCap;
    mapping(UserStatus => mapping(uint256 => uint256)) public maxTierCap; // status => tier => cap

    // ============ STRUCTS ============

    struct EnhancedReferralData {
        address referrer;
        address secondTierReferrer;
        address thirdTierReferrer;  // NEW: 3rd tier

        uint256 totalReferred;
        uint256 totalVolume;

        // Per-tier tracking
        uint256 tier1Earnings;
        uint256 tier2Earnings;
        uint256 tier3Earnings;

        uint256 pendingRewardsUSD;
        uint256 totalEarnedUSD;
        uint256 totalClaimedUSD;

        UserStatus status;  // NEW: Status tier
        bool rewardInTokens;
        bool isActive;
    }

    // ============ MAPPINGS ============

    mapping(address => EnhancedReferralData) public referrals;
    mapping(address => address[]) public referredUsers;
    mapping(address => bool) public blacklisted;
    mapping(address => bool) public hasReferrer;

    // ============ EVENTS ============

    event ReferralRegistered(
        address indexed referee,
        address indexed referrer,
        address indexed secondTierReferrer,
        address thirdTierReferrer
    );

    event PurchaseRecorded(
        address indexed buyer,
        uint256 usdAmount,
        address[3] referrers,  // L1, L2, L3
        uint256[3] rewards,    // Rewards for each tier
        UserStatus[3] statuses // Status of each referrer
    );

    event StatusUpgraded(
        address indexed user,
        UserStatus oldStatus,
        UserStatus newStatus,
        uint256 referralCount
    );

    event BonusAwarded(
        address indexed user,
        string bonusType,
        uint256 amount
    );

    // ============ CONSTRUCTOR ============

    constructor(
        address _hypeToken,
        address _usdtToken,
        address _privateSaleContract
    ) Ownable(msg.sender) {
        require(_hypeToken != address(0), "Invalid HYPE token");
        require(_usdtToken != address(0), "Invalid USDT token");
        require(_privateSaleContract != address(0), "Invalid sale contract");

        hypeToken = IERC20(_hypeToken);
        usdtToken = IERC20(_usdtToken);
        privateSaleContract = _privateSaleContract;

        // Initialize status bonuses (in basis points)
        statusBonus[UserStatus.BRONZE] = 0;      // 0%
        statusBonus[UserStatus.SILVER] = 200;    // +2%
        statusBonus[UserStatus.GOLD] = 500;      // +5%
        statusBonus[UserStatus.PLATINUM] = 1000; // +10%

        // Initialize max caps by status
        maxRewardCap[UserStatus.BRONZE] = 10000;      // $10K
        maxRewardCap[UserStatus.SILVER] = 25000;      // $25K
        maxRewardCap[UserStatus.GOLD] = 75000;        // $75K
        maxRewardCap[UserStatus.PLATINUM] = 250000;   // $250K

        // Initialize per-tier caps
        // Bronze
        maxTierCap[UserStatus.BRONZE][1] = 7000;
        maxTierCap[UserStatus.BRONZE][2] = 2000;
        maxTierCap[UserStatus.BRONZE][3] = 1000;

        // Silver
        maxTierCap[UserStatus.SILVER][1] = 15000;
        maxTierCap[UserStatus.SILVER][2] = 7000;
        maxTierCap[UserStatus.SILVER][3] = 3000;

        // Gold
        maxTierCap[UserStatus.GOLD][1] = 45000;
        maxTierCap[UserStatus.GOLD][2] = 20000;
        maxTierCap[UserStatus.GOLD][3] = 10000;

        // Platinum
        maxTierCap[UserStatus.PLATINUM][1] = 150000;
        maxTierCap[UserStatus.PLATINUM][2] = 70000;
        maxTierCap[UserStatus.PLATINUM][3] = 30000;
    }

    // ============ CORE FUNCTIONS ============

    /**
     * @notice Register referral with 3-tier tracking
     */
    function registerReferral(
        address _referee,
        address _referrer
    ) external whenNotPaused notBlacklisted(_referee) notBlacklisted(_referrer) {
        require(_referee != address(0), "Invalid referee");
        require(_referrer != address(0), "Invalid referrer");
        require(_referee != _referrer, "Cannot refer yourself");
        require(!hasReferrer[_referee], "Already has referrer");
        require(_referee != owner(), "Owner cannot be referred");
        require(referrals[_referrer].referrer != _referee, "Circular referral");

        // Get 3-tier chain
        address secondTier = referrals[_referrer].referrer;
        address thirdTier = secondTier != address(0) ? referrals[secondTier].referrer : address(0);

        // Initialize referral data
        referrals[_referee] = EnhancedReferralData({
            referrer: _referrer,
            secondTierReferrer: secondTier,
            thirdTierReferrer: thirdTier,
            totalReferred: 0,
            totalVolume: 0,
            tier1Earnings: 0,
            tier2Earnings: 0,
            tier3Earnings: 0,
            pendingRewardsUSD: 0,
            totalEarnedUSD: 0,
            totalClaimedUSD: 0,
            status: UserStatus.BRONZE,
            rewardInTokens: true,
            isActive: true
        });

        hasReferrer[_referee] = true;
        referredUsers[_referrer].push(_referee);

        emit ReferralRegistered(_referee, _referrer, secondTier, thirdTier);
    }

    /**
     * @notice Record purchase and distribute 3-tier rewards with status bonuses
     */
    function recordPurchase(
        address _buyer,
        uint256 _usdAmount,
        uint256 _tokensAmount
    ) external onlyPrivateSale whenNotPaused notBlacklisted(_buyer) {
        require(_usdAmount >= MIN_REFERRAL_PURCHASE, "Purchase too small");

        address[3] memory referrers;
        uint256[3] memory rewards;
        UserStatus[3] memory statuses;

        // Get referral chain
        referrers[0] = referrals[_buyer].referrer;
        referrers[1] = referrals[_buyer].secondTierReferrer;
        referrers[2] = referrals[_buyer].thirdTierReferrer;

        // Base reward rates
        uint256[3] memory baseRates = [
            TIER_1_REWARD,  // 10%
            TIER_2_REWARD,  // 5%
            TIER_3_REWARD   // 2%
        ];

        // Calculate and distribute rewards for each tier
        for (uint256 i = 0; i < 3; i++) {
            if (referrers[i] == address(0) ||
                blacklisted[referrers[i]] ||
                !referrals[referrers[i]].isActive) {
                continue;
            }

            EnhancedReferralData storage refData = referrals[referrers[i]];
            statuses[i] = refData.status;

            // Calculate reward with status bonus
            uint256 baseReward = (_usdAmount * baseRates[i]) / BASIS_POINTS;
            uint256 bonus = (baseReward * statusBonus[refData.status]) / BASIS_POINTS;
            uint256 totalReward = baseReward + bonus;

            // Check caps
            uint256 tierEarnings = i == 0 ? refData.tier1Earnings :
                                   i == 1 ? refData.tier2Earnings :
                                            refData.tier3Earnings;

            bool withinTierCap = tierEarnings + totalReward <= maxTierCap[refData.status][i + 1];
            bool withinTotalCap = refData.totalEarnedUSD + totalReward <= maxRewardCap[refData.status];

            if (withinTierCap && withinTotalCap) {
                rewards[i] = totalReward;

                // Update earnings
                if (i == 0) {
                    refData.tier1Earnings += totalReward;
                    refData.totalReferred += 1;
                } else if (i == 1) {
                    refData.tier2Earnings += totalReward;
                } else {
                    refData.tier3Earnings += totalReward;
                }

                refData.pendingRewardsUSD += totalReward;
                refData.totalEarnedUSD += totalReward;
                refData.totalVolume += _usdAmount;

                // Check for status upgrade (only for direct referrals)
                if (i == 0) {
                    _checkAndUpgradeStatus(referrers[i]);
                }
            }
        }

        emit PurchaseRecorded(_buyer, _usdAmount, referrers, rewards, statuses);
    }

    /**
     * @notice Check and upgrade user status based on referral count
     */
    function _checkAndUpgradeStatus(address _user) private {
        EnhancedReferralData storage userData = referrals[_user];
        UserStatus oldStatus = userData.status;
        UserStatus newStatus = _calculateStatus(userData.totalReferred);

        if (newStatus != oldStatus) {
            userData.status = newStatus;

            // Award upgrade bonus
            uint256 bonus = _getUpgradeBonus(newStatus);
            if (bonus > 0) {
                userData.pendingRewardsUSD += bonus;
                userData.totalEarnedUSD += bonus;
                emit BonusAwarded(_user, "STATUS_UPGRADE", bonus);
            }

            emit StatusUpgraded(_user, oldStatus, newStatus, userData.totalReferred);
        }
    }

    /**
     * @notice Calculate user status based on referral count
     */
    function _calculateStatus(uint256 _referralCount) private pure returns (UserStatus) {
        if (_referralCount >= 100) return UserStatus.PLATINUM;
        if (_referralCount >= 50) return UserStatus.GOLD;
        if (_referralCount >= 10) return UserStatus.SILVER;
        return UserStatus.BRONZE;
    }

    /**
     * @notice Get upgrade bonus amount
     */
    function _getUpgradeBonus(UserStatus _status) private pure returns (uint256) {
        if (_status == UserStatus.SILVER) return 100;    // $100
        if (_status == UserStatus.GOLD) return 500;      // $500
        if (_status == UserStatus.PLATINUM) return 2000; // $2,000
        return 0;
    }

    /**
     * @notice Claim rewards (unchanged from original)
     */
    function claimRewards(bool _inTokens)
        external
        nonReentrant
        whenNotPaused
        notBlacklisted(msg.sender)
    {
        EnhancedReferralData storage userData = referrals[msg.sender];
        require(userData.pendingRewardsUSD > 0, "No pending rewards");
        require(userData.isActive, "Account not active");

        uint256 rewardUSD = userData.pendingRewardsUSD;
        userData.pendingRewardsUSD = 0;
        userData.totalClaimedUSD += rewardUSD;

        if (_inTokens) {
            uint256 tokenAmount = rewardUSD * 12500 * 10**18;
            require(
                hypeToken.balanceOf(address(this)) >= tokenAmount,
                "Insufficient HYPE tokens"
            );
            require(
                hypeToken.transfer(msg.sender, tokenAmount),
                "HYPE transfer failed"
            );
        } else {
            uint256 usdtAmount = rewardUSD * 10**18;
            require(
                usdtToken.balanceOf(address(this)) >= usdtAmount,
                "Insufficient USDT"
            );
            require(
                usdtToken.transfer(msg.sender, usdtAmount),
                "USDT transfer failed"
            );
        }

        emit RewardsClaimed(msg.sender, rewardUSD, _inTokens);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Get enhanced referral statistics
     */
    function getEnhancedStats(address _user)
        external
        view
        returns (
            address[3] memory referrers,
            uint256 totalReferred,
            uint256 totalVolume,
            uint256[3] memory tierEarnings,
            uint256 pendingRewards,
            uint256 totalEarned,
            UserStatus status,
            uint256 statusBonus,
            uint256 maxCap,
            bool isActive
        )
    {
        EnhancedReferralData memory data = referrals[_user];

        referrers[0] = data.referrer;
        referrers[1] = data.secondTierReferrer;
        referrers[2] = data.thirdTierReferrer;

        totalReferred = data.totalReferred;
        totalVolume = data.totalVolume;

        tierEarnings[0] = data.tier1Earnings;
        tierEarnings[1] = data.tier2Earnings;
        tierEarnings[2] = data.tier3Earnings;

        pendingRewards = data.pendingRewardsUSD;
        totalEarned = data.totalEarnedUSD;
        status = data.status;
        statusBonus = statusBonus[data.status];
        maxCap = maxRewardCap[data.status];
        isActive = data.isActive;
    }

    /**
     * @notice Calculate potential reward for a purchase
     */
    function calculatePotentialReward(
        address _user,
        uint256 _purchaseAmount,
        uint256 _tier
    ) external view returns (uint256 baseReward, uint256 bonusReward, uint256 totalReward) {
        require(_tier >= 1 && _tier <= 3, "Invalid tier");

        uint256[3] memory rates = [TIER_1_REWARD, TIER_2_REWARD, TIER_3_REWARD];
        baseReward = (_purchaseAmount * rates[_tier - 1]) / BASIS_POINTS;

        UserStatus status = referrals[_user].status;
        bonusReward = (baseReward * statusBonus[status]) / BASIS_POINTS;
        totalReward = baseReward + bonusReward;
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @notice Award milestone bonus
     */
    function awardMilestoneBonus(
        address _user,
        uint256 _amount,
        string calldata _milestone
    ) external onlyOwner {
        require(_amount > 0, "Invalid amount");

        EnhancedReferralData storage userData = referrals[_user];
        userData.pendingRewardsUSD += _amount;
        userData.totalEarnedUSD += _amount;

        emit BonusAwarded(_user, _milestone, _amount);
    }

    /**
     * @notice Update status bonus (emergency only)
     */
    function updateStatusBonus(UserStatus _status, uint256 _bonus) external onlyOwner {
        require(_bonus <= 2000, "Bonus too high"); // Max 20%
        statusBonus[_status] = _bonus;
    }

    // ... (rest of admin functions same as original)

    // ============ MODIFIERS ============

    modifier onlyPrivateSale() {
        require(msg.sender == privateSaleContract, "Only private sale");
        _;
    }

    modifier notBlacklisted(address _user) {
        require(!blacklisted[_user], "User blacklisted");
        _;
    }

    event RewardsClaimed(address indexed user, uint256 usdValue, bool inTokens);
}
```

### 7.2 Contract Deployment Plan

```typescript
// Deployment script
async function deployEnhancedReferralSystem() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying Enhanced Referral System with:", deployer.address);

  // Deploy contract
  const EnhancedReferral = await ethers.getContractFactory("EnhancedHypeAIReferral");
  const referralSystem = await EnhancedReferral.deploy(
    HYPE_TOKEN_ADDRESS,
    USDT_TOKEN_ADDRESS,
    PRIVATE_SALE_ADDRESS
  );

  await referralSystem.waitForDeployment();

  console.log("Enhanced Referral System deployed to:", await referralSystem.getAddress());

  // Fund contract
  const hypeToken = await ethers.getContractAt("IERC20", HYPE_TOKEN_ADDRESS);
  await hypeToken.transfer(
    await referralSystem.getAddress(),
    ethers.parseEther("1000000000") // 1B HYPE tokens
  );

  // Verify on BSCScan
  await run("verify:verify", {
    address: await referralSystem.getAddress(),
    constructorArguments: [
      HYPE_TOKEN_ADDRESS,
      USDT_TOKEN_ADDRESS,
      PRIVATE_SALE_ADDRESS
    ]
  });
}
```

---

## 8. API Specification

### 8.1 REST API Endpoints

```typescript
/**
 * Enhanced Referral System API v2.0
 * Base URL: https://api.hypeai.io/v2
 */

// ============================================
// REFERRAL MANAGEMENT
// ============================================

/**
 * @api {POST} /referrals/register Register Referral
 * @apiDescription Register a new referral relationship
 */
POST /referrals/register
Request:
{
  "referee": "0x123...",
  "referrer": "0xabc..." | "referral_code_xyz",
  "signature": "0x..."
}
Response:
{
  "success": true,
  "data": {
    "referralId": "uuid",
    "referee": "0x123...",
    "referrer": "0xabc...",
    "chain": ["0xabc...", "0xdef...", "0x789..."],
    "referralCode": "HYPE_XYZ123"
  }
}

/**
 * @api {GET} /referrals/:userId/stats Get Referral Statistics
 */
GET /referrals/:userId/stats
Response:
{
  "success": true,
  "data": {
    "userId": "uuid",
    "walletAddress": "0x123...",
    "referralCode": "HYPE_XYZ123",
    "status": "SILVER",
    "statusProgress": {
      "current": "SILVER",
      "next": "GOLD",
      "referralsNeeded": 28,
      "progressPercentage": 44
    },
    "referrals": {
      "total": 22,
      "l1": 22,
      "l2": 47,
      "l3": 89
    },
    "volume": {
      "total": 12400,
      "monthly": 3200,
      "l1": 8800,
      "l2": 2400,
      "l3": 1200
    },
    "earnings": {
      "total": 1847,
      "claimed": 500,
      "pending": 1347,
      "byTier": {
        "l1": 1100,
        "l2": 480,
        "l3": 267
      },
      "caps": {
        "current": 25000,
        "used": 1847,
        "remaining": 23153,
        "percentage": 7.4
      }
    },
    "bonuses": {
      "statusBonus": 2,
      "milestones": [
        { "type": "REFERRAL_5", "amount": 50, "earned": true },
        { "type": "REFERRAL_25", "amount": 100, "earned": false }
      ]
    }
  }
}

/**
 * @api {GET} /referrals/:userId/chain Get Referral Chain
 */
GET /referrals/:userId/chain?depth=5
Response:
{
  "success": true,
  "data": {
    "user": "0x123...",
    "upline": [
      {
        "level": 1,
        "address": "0xabc...",
        "username": "CryptoKing",
        "status": "GOLD",
        "totalReferrals": 67
      },
      // ... up to depth requested
    ],
    "downline": {
      "total": 158,
      "tree": [
        {
          "level": 1,
          "users": 22,
          "volume": 8800
        },
        {
          "level": 2,
          "users": 47,
          "volume": 2400
        },
        {
          "level": 3,
          "users": 89,
          "volume": 1200
        }
      ]
    }
  }
}

// ============================================
// REWARDS
// ============================================

/**
 * @api {POST} /rewards/claim Claim Rewards
 */
POST /rewards/claim
Request:
{
  "userId": "uuid",
  "currency": "HYPE" | "USDT",
  "amount": 1347, // Optional, claims all if not specified
  "signature": "0x..."
}
Response:
{
  "success": true,
  "data": {
    "claimId": "uuid",
    "amountUSD": 1347,
    "amountCrypto": "16837500000000000000000", // For HYPE
    "currency": "HYPE",
    "txHash": "0x...",
    "status": "PENDING" | "CONFIRMED" | "FAILED",
    "estimatedConfirmation": 1729347890
  }
}

/**
 * @api {GET} /rewards/:userId/history Get Reward History
 */
GET /rewards/:userId/history?page=1&limit=50
Response:
{
  "success": true,
  "data": {
    "total": 127,
    "page": 1,
    "limit": 50,
    "rewards": [
      {
        "id": "uuid",
        "type": "REFERRAL",
        "tier": 1,
        "purchaseId": "uuid",
        "buyer": "0xdef...",
        "purchaseAmount": 1000,
        "baseReward": 100,
        "statusBonus": 2,
        "totalReward": 102,
        "timestamp": 1729347890,
        "status": "PENDING" | "CLAIMED"
      },
      // ...
    ]
  }
}

// ============================================
// GAMIFICATION
// ============================================

/**
 * @api {GET} /gamification/badges Get User Badges
 */
GET /gamification/badges/:userId
Response:
{
  "success": true,
  "data": {
    "total": 7,
    "badges": [
      {
        "id": "first_referral",
        "name": "First Steps",
        "description": "Made your first referral",
        "rarity": "COMMON",
        "earnedAt": 1729347890,
        "reward": { "type": "TOKENS", "amount": 1000 },
        "claimed": true
      },
      // ...
    ],
    "next": [
      {
        "id": "referral_milestone_25",
        "name": "Community Leader",
        "progress": 88, // 22/25
        "remaining": 3
      }
    ]
  }
}

/**
 * @api {GET} /gamification/leaderboard Get Leaderboard
 */
GET /gamification/leaderboard?category=total_volume&period=monthly&limit=100
Response:
{
  "success": true,
  "data": {
    "category": "total_volume",
    "period": "monthly",
    "lastUpdated": 1729347890,
    "userRank": 23,
    "entries": [
      {
        "rank": 1,
        "userId": "uuid",
        "username": "WhaleKing",
        "avatar": "https://...",
        "value": 47500,
        "status": "PLATINUM",
        "badges": 15,
        "trend": "UP" // +3 positions this week
      },
      // ... top 100
    ]
  }
}

/**
 * @api {GET} /gamification/challenges Get Active Challenges
 */
GET /gamification/challenges?filter=available
Response:
{
  "success": true,
  "data": {
    "active": [
      {
        "id": "weekly_warrior",
        "name": "Weekly Warrior",
        "description": "Refer 5 new users this week",
        "type": "PERSONAL",
        "startDate": 1729347890,
        "endDate": 1729952690,
        "goal": { "type": "REFERRAL_COUNT", "target": 5 },
        "progress": { "current": 2, "percentage": 40 },
        "reward": { "type": "USD", "amount": 50 },
        "timeRemaining": 432000 // seconds
      },
      // ...
    ],
    "completed": [...],
    "upcoming": [...]
  }
}

/**
 * @api {GET} /gamification/lottery Get Lottery Info
 */
GET /gamification/lottery/current
Response:
{
  "success": true,
  "data": {
    "id": "weekly_hype_draw",
    "name": "Weekly HYPE Draw",
    "prizePool": 1000,
    "currency": "USDT",
    "drawDate": 1729952690,
    "timeRemaining": 518400,
    "totalEntries": 247,
    "totalTickets": 3842,
    "userTickets": 15,
    "userChance": 0.39, // percentage
    "eligibility": {
      "eligible": true,
      "requirements": {
        "minReferrals": { "required": 1, "current": 22, "met": true },
        "minVolume": { "required": 400, "current": 3200, "met": true }
      }
    },
    "previousWinners": [
      { "username": "LuckyStar", "prize": 100, "date": 1729347890 },
      // ...
    ]
  }
}

// ============================================
// ANALYTICS
// ============================================

/**
 * @api {GET} /analytics/dashboard Get Dashboard Analytics
 */
GET /analytics/dashboard/:userId
Response:
{
  "success": true,
  "data": {
    "overview": {
      "totalEarnings": 1847,
      "pendingRewards": 1347,
      "totalReferrals": 22,
      "monthlyGrowth": 27.4, // percentage
      "status": "SILVER",
      "rank": 23
    },
    "charts": {
      "earningsTimeline": [
        { "date": "2024-10-01", "amount": 120 },
        // ... last 30 days
      ],
      "referralGrowth": [
        { "week": "W1", "count": 3 },
        // ... last 12 weeks
      ],
      "tierBreakdown": {
        "l1": 59.6, // percentage
        "l2": 26.0,
        "l3": 14.4
      }
    },
    "recentActivity": [
      {
        "type": "PURCHASE",
        "description": "User 0xdef... purchased $1000",
        "reward": 102,
        "timestamp": 1729347890
      },
      // ... last 10 activities
    ],
    "goals": {
      "nextStatus": {
        "current": "SILVER",
        "next": "GOLD",
        "progress": 44,
        "referralsNeeded": 28
      },
      "nextMilestone": {
        "type": "REFERRAL_25",
        "progress": 88,
        "reward": 100
      }
    }
  }
}

/**
 * @api {GET} /analytics/reports Generate Report
 */
GET /analytics/reports/:userId?period=monthly&format=pdf
Response:
{
  "success": true,
  "data": {
    "reportId": "uuid",
    "period": "2024-10",
    "format": "pdf",
    "downloadUrl": "https://cdn.hypeai.io/reports/...",
    "expiresAt": 1729952690,
    "summary": {
      "earnings": 542,
      "referrals": 8,
      "volume": 3200,
      "rank": 23
    }
  }
}
```

### 8.2 WebSocket Events

```typescript
/**
 * WebSocket Connection: wss://ws.hypeai.io/v2
 */

// Client → Server
{
  "type": "SUBSCRIBE",
  "channels": [
    "referrals:updates",
    "rewards:earned",
    "leaderboard:changes",
    "challenges:progress"
  ],
  "userId": "uuid",
  "auth": "jwt_token"
}

// Server → Client: New Referral
{
  "type": "REFERRAL_REGISTERED",
  "data": {
    "referee": "0x123...",
    "purchaseAmount": 1000,
    "estimatedReward": 102,
    "tier": 1,
    "timestamp": 1729347890
  }
}

// Server → Client: Reward Earned
{
  "type": "REWARD_EARNED",
  "data": {
    "amount": 102,
    "tier": 1,
    "buyer": "0xdef...",
    "status": "PENDING"
  }
}

// Server → Client: Status Upgrade
{
  "type": "STATUS_UPGRADED",
  "data": {
    "oldStatus": "BRONZE",
    "newStatus": "SILVER",
    "bonus": 100,
    "newCap": 25000
  }
}

// Server → Client: Badge Earned
{
  "type": "BADGE_EARNED",
  "data": {
    "badgeId": "referral_milestone_25",
    "name": "Community Leader",
    "reward": 100
  }
}

// Server → Client: Leaderboard Change
{
  "type": "LEADERBOARD_UPDATE",
  "data": {
    "category": "total_volume",
    "oldRank": 25,
    "newRank": 23,
    "change": 2
  }
}
```

---

## 9. Security & Anti-Fraud

### 9.1 Fraud Detection System

```typescript
interface FraudDetectionRules {
  // Suspicious patterns
  maxReferralsPerDay: 20;
  maxReferralsPerHour: 5;
  minTimeBetweenReferrals: 60; // seconds

  // Wallet analysis
  minWalletAge: 7; // days
  minTransactionHistory: 5;

  // Purchase patterns
  suspiciousAmountPattern: RegExp; // e.g., always $400.00
  maxIdenticalAmounts: 5;

  // Network analysis
  maxSameIPReferrals: 3;
  maxSameDeviceReferrals: 2;
  circularReferralDetection: true;
}

class FraudDetector {
  async analyzePurchase(purchase: Purchase): Promise<FraudScore> {
    const score = {
      overall: 0,
      factors: []
    };

    // Check wallet age
    const walletAge = await this.getWalletAge(purchase.buyerAddress);
    if (walletAge < 7) {
      score.factors.push({ type: 'NEW_WALLET', risk: 20 });
    }

    // Check referral velocity
    const recentReferrals = await this.getRecentReferrals(
      purchase.referrerId,
      24 * 60 * 60 * 1000 // 24 hours
    );
    if (recentReferrals.length > 20) {
      score.factors.push({ type: 'HIGH_VELOCITY', risk: 40 });
    }

    // Check IP clustering
    const ipCount = await this.countSameIPReferrals(
      purchase.referrerId,
      purchase.buyerIP
    );
    if (ipCount > 3) {
      score.factors.push({ type: 'IP_CLUSTERING', risk: 60 });
    }

    // Check amount patterns
    const amountPattern = await this.analyzeAmountPattern(purchase.referrerId);
    if (amountPattern.suspiciousCount > 5) {
      score.factors.push({ type: 'AMOUNT_PATTERN', risk: 30 });
    }

    // Calculate overall score
    score.overall = score.factors.reduce((sum, f) => sum + f.risk, 0);

    return score;
  }

  async handleSuspiciousActivity(
    userId: string,
    score: FraudScore
  ): Promise<void> {
    if (score.overall > 100) {
      // Auto-freeze account
      await this.freezeAccount(userId);
      await this.notifyAdmin('HIGH_RISK_ACTIVITY', { userId, score });
    } else if (score.overall > 50) {
      // Flag for manual review
      await this.flagForReview(userId, score);
    }
  }
}
```

### 9.2 Rate Limiting

```typescript
const RATE_LIMITS = {
  referralRegistration: {
    perHour: 5,
    perDay: 20,
    perWeek: 50
  },
  rewardClaim: {
    perDay: 10,
    perWeek: 50
  },
  apiCalls: {
    perMinute: 60,
    perHour: 1000
  }
};

// Redis-based rate limiter
async function checkRateLimit(
  userId: string,
  action: string,
  period: string
): Promise<boolean> {
  const key = `ratelimit:${action}:${period}:${userId}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, getPeriodSeconds(period));
  }

  const limit = RATE_LIMITS[action][period];
  return count <= limit;
}
```

### 9.3 Audit Logging

```typescript
interface AuditLog {
  id: string;
  timestamp: number;
  userId: string;
  action: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  fraudScore?: number;
}

// Log all critical actions
async function logAuditEvent(event: AuditLog): Promise<void> {
  await db.auditLogs.insert(event);

  // Also send to monitoring system
  if (event.result === 'BLOCKED' || event.fraudScore > 50) {
    await monitoring.alert('SUSPICIOUS_ACTIVITY', event);
  }
}
```

---

## 10. Implementation Roadmap

### Phase 1: Backend Infrastructure (Week 1-2)
- [ ] Database schema implementation
- [ ] Core API endpoints
- [ ] Smart contract modifications
- [ ] Testing framework setup

### Phase 2: Enhanced Reward System (Week 3-4)
- [ ] 3-tier reward calculation
- [ ] Status tier logic
- [ ] Dynamic bonus system
- [ ] Cap management

### Phase 3: Gamification (Week 5-6)
- [ ] Badge system
- [ ] Leaderboard implementation
- [ ] Challenge engine
- [ ] Lottery system

### Phase 4: Security & Anti-Fraud (Week 7)
- [ ] Fraud detection algorithms
- [ ] Rate limiting
- [ ] Audit logging
- [ ] Security testing

### Phase 5: Frontend Integration (Week 8-9)
- [ ] Dashboard UI
- [ ] Real-time updates (WebSocket)
- [ ] Analytics visualizations
- [ ] Mobile responsiveness

### Phase 6: Testing & Launch (Week 10-12)
- [ ] Integration testing
- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Gradual rollout
- [ ] Monitoring & alerts

---

## 11. Success Metrics

### Key Performance Indicators (KPIs)

```typescript
interface SuccessMetrics {
  // Participation Metrics
  activeReferrers: number;
  averageReferralsPerUser: number;
  referralConversionRate: number;

  // Engagement Metrics
  dailyActiveUsers: number;
  averageSessionDuration: number;
  featureAdoptionRate: {
    badges: number;
    challenges: number;
    leaderboard: number;
  };

  // Financial Metrics
  totalRewardsDistributed: number;
  averageRewardPerUser: number;
  rewardClaimRate: number;

  // Growth Metrics
  viralCoefficient: number;
  referralChainDepth: number;
  monthOverMonthGrowth: number;

  // Quality Metrics
  fraudAttempts: number;
  fraudDetectionRate: number;
  accountFreezeRate: number;
}
```

### Target Goals (3 Months Post-Launch)

| Metric | Current | Target | Stretch Goal |
|--------|---------|--------|--------------|
| Active Referrers | 150 | 1,500 | 3,000 |
| Avg Referrals/User | 2.3 | 5.0 | 7.5 |
| Viral Coefficient | 1.2 | 2.5 | 3.5 |
| Chain Depth | 2.1 | 3.5 | 5.0 |
| Silver+ Users | 5% | 25% | 40% |
| Gold+ Users | 1% | 8% | 15% |
| Platinum Users | 0 | 10 | 25 |
| Monthly Volume | $50K | $500K | $1M |
| Rewards Paid | $2.5K | $50K | $100K |

---

## Conclusion

This enhanced referral system transforms HypeAI from a basic reward program into a **comprehensive growth engine** with:

1. **Doubled base rewards** + status bonuses (up to 20% total for Platinum users)
2. **3-tier deep** referral chains for viral growth
3. **Full gamification** suite: badges, leaderboards, challenges, lottery
4. **Progressive rewards** that incentivize long-term engagement
5. **Enterprise-grade** security and fraud prevention

### Expected Business Impact

- **3-5x increase** in referral participation
- **2.5-3.5x viral coefficient** (from 1.2)
- **40-60% deeper** referral chains
- **25-40% of users** reaching Silver+ status
- **Sustainable growth** through gamification retention

This system positions HypeAI as having **industry-leading referral incentives** while maintaining profitability through tiered caps and fraud prevention.

---

**Next Steps:**
1. Review and approve architecture
2. Allocate development resources
3. Set up staging environment
4. Begin Phase 1 implementation
5. Create detailed user documentation

**Contact:** architecture@hypeai.io
**Last Updated:** 2025-10-18
**Version:** 2.0.0
