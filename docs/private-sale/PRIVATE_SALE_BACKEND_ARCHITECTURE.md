# HypeAI Private Sale Backend Architecture

**Version:** 1.0
**Date:** 2025-10-18
**Author:** Backend API Developer Agent
**Project:** HypeAI Private Sale + User Dashboard + Referral System

---

## Executive Summary

This document outlines the complete backend API architecture for HypeAI's private sale platform, integrating wallet authentication, token sales, referral tracking, and user dashboard functionality. The system is designed to handle 500 founding members with $80,000 hard cap, supporting both BNB and USDT payments on BSC (BNB Smart Chain).

**Key Components:**
- RESTful API with JWT authentication
- Smart contract integration (PrivateSale + ReferralSystem)
- PostgreSQL database for off-chain data
- Redis caching for performance
- WebSocket support for real-time updates
- Comprehensive security measures

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [API Endpoints Specification](#3-api-endpoints-specification)
4. [Database Schema](#4-database-schema)
5. [Smart Contract Integration](#5-smart-contract-integration)
6. [Authentication & Security](#6-authentication--security)
7. [Payment Processing](#7-payment-processing)
8. [Implementation Plan](#8-implementation-plan)

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│              (React/Next.js Dashboard)                       │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/WSS
┌────────────────────▼────────────────────────────────────────┐
│                     API Gateway Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Rate Limiting│  │ CORS/Helmet  │  │ JWT Auth     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Service │  │ Sale Service │  │ User Service │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Referral Svc  │  │ Web3 Service │  │ Analytics    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ PostgreSQL   │  │ Redis Cache  │  │ BSC Node     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Service Architecture

**Controller → Service → Repository Pattern**

```javascript
// Controller: HTTP request/response handling
// Service: Business logic + smart contract interaction
// Repository: Database operations
```

---

## 2. Technology Stack

### 2.1 Recommended Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Runtime** | Node.js 18+ | Existing project standard, excellent async handling |
| **Framework** | Express.js | Lightweight, mature, extensive middleware ecosystem |
| **Database** | PostgreSQL 14+ | ACID compliance, complex queries, proven reliability |
| **Cache** | Redis 7+ | Sub-millisecond latency, session management |
| **Blockchain** | ethers.js v6 | Modern API, better TypeScript support vs web3.js |
| **Authentication** | JWT + Passport | Industry standard, stateless, scalable |
| **Validation** | Joi | Schema-based validation, clear error messages |
| **ORM** | Sequelize | Full-featured, migrations support, TypeScript compatible |
| **WebSocket** | Socket.io | Real-time updates, fallback support |

### 2.2 Alternative Considerations

**Next.js API Routes:**
- ✅ Pros: Unified codebase, SSR support, simplified deployment
- ❌ Cons: Less flexible for complex middleware, harder to scale independently
- **Verdict:** Use Express for dedicated backend, reserve Next.js for frontend

**MongoDB vs PostgreSQL:**
- ✅ MongoDB: Flexible schema, horizontal scaling
- ✅ PostgreSQL: **WINNER** - Financial data needs ACID, complex joins, proven reliability
- **Verdict:** PostgreSQL for transaction integrity

**web3.js vs ethers.js:**
- ✅ ethers.js: **WINNER** - Better error handling, smaller bundle, modern API
- ❌ web3.js: Larger, older API design
- **Verdict:** ethers.js v6 (already in dependencies)

---

## 3. API Endpoints Specification

### 3.1 Authentication Endpoints

#### POST /api/auth/connect-wallet
**Purpose:** Initiate wallet connection and generate nonce for signature

**Request:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nonce": "Sign this message to authenticate: 1729274645123",
    "expiresAt": "2025-10-18T12:34:05.123Z"
  }
}
```

**Logic:**
1. Validate Ethereum address format
2. Generate cryptographically secure nonce
3. Store nonce in Redis (5 min TTL)
4. Return nonce for signing

---

#### POST /api/auth/verify-signature
**Purpose:** Verify wallet signature and issue JWT

**Request:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x1234...abcd",
  "nonce": "Sign this message to authenticate: 1729274645123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-v4",
      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "isWhitelisted": true,
      "isFoundingMember": false,
      "createdAt": "2025-10-18T12:30:00.000Z"
    }
  }
}
```

**Logic:**
1. Retrieve nonce from Redis
2. Verify signature using ethers.js: `ethers.verifyMessage(nonce, signature)`
3. Create/update user in database
4. Generate JWT (access: 15min, refresh: 7 days)
5. Store session in Redis

---

#### POST /api/auth/refresh-token
**Purpose:** Refresh expired access token

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

---

### 3.2 User Management Endpoints

#### GET /api/user/profile
**Auth:** Required
**Purpose:** Get user profile and sale eligibility

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-v4",
      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "email": "user@example.com",
      "isWhitelisted": true,
      "isFoundingMember": false,
      "kycStatus": "pending",
      "createdAt": "2025-10-18T12:30:00.000Z"
    },
    "referral": {
      "code": "HYPE-ABC123",
      "referredBy": "0x...",
      "totalReferred": 5,
      "totalEarned": "250.00"
    },
    "saleEligibility": {
      "canPurchase": true,
      "remainingAllocation": 800,
      "totalContributed": 0,
      "maxPurchase": 800,
      "foundingMemberSlotsRemaining": 245
    }
  }
}
```

---

#### PUT /api/user/profile
**Auth:** Required
**Purpose:** Update user profile

**Request:**
```json
{
  "email": "user@example.com",
  "telegram": "@username",
  "twitter": "@username"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": true,
    "user": { /* updated user object */ }
  }
}
```

---

### 3.3 Private Sale Endpoints

#### POST /api/sale/purchase
**Auth:** Required
**Purpose:** Initiate token purchase

**Request:**
```json
{
  "paymentMethod": "BNB",
  "amount": 0.5,
  "referralCode": "HYPE-ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "purchaseId": "uuid-v4",
    "transactionData": {
      "to": "0xPrivateSaleContract",
      "value": "0x6f05b59d3b20000",
      "data": "0x...",
      "chainId": 56
    },
    "expectedTokens": "6875000.00",
    "breakdown": {
      "baseTokens": "6250000.00",
      "bonusTokens": "625000.00",
      "bonusPercentage": 10
    }
  }
}
```

**Logic:**
1. Verify user is whitelisted
2. Check eligibility (min/max limits, hard cap)
3. Validate referral code (if provided)
4. Calculate token amount + bonus
5. Create pending transaction in DB
6. Return transaction data for MetaMask signing

---

#### POST /api/sale/confirm-purchase
**Auth:** Required
**Purpose:** Confirm blockchain transaction

**Request:**
```json
{
  "purchaseId": "uuid-v4",
  "txHash": "0x1234...abcd"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "pending",
    "txHash": "0x1234...abcd",
    "confirmations": 0,
    "requiredConfirmations": 3
  }
}
```

**Logic:**
1. Validate transaction hash
2. Update purchase record
3. Start monitoring transaction confirmations
4. Trigger webhook for transaction events

---

#### GET /api/sale/allocation
**Auth:** Required
**Purpose:** Get user's token allocation and vesting schedule

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPurchased": "13750000.00",
    "totalSpent": 1100.00,
    "averagePrice": 0.00008,
    "vestingSchedule": {
      "immediate": "13750000.00",
      "vested": "0.00",
      "locked": "0.00",
      "vestingStart": null,
      "vestingEnd": null
    }
  }
}
```

---

#### GET /api/sale/transactions
**Auth:** Required
**Purpose:** Get purchase transaction history

**Query Params:** `?page=1&limit=10&status=all`

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid-v4",
        "paymentMethod": "BNB",
        "amountPaid": 0.5,
        "tokensReceived": "6875000.00",
        "txHash": "0x...",
        "status": "confirmed",
        "confirmations": 12,
        "createdAt": "2025-10-18T12:45:00.000Z",
        "confirmedAt": "2025-10-18T12:46:30.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "pages": 1
    }
  }
}
```

---

#### GET /api/sale/stats
**Auth:** Optional (public data)
**Purpose:** Get global sale statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRaised": 45000.00,
    "totalTokensSold": "578125000.00",
    "foundingMembers": 256,
    "remainingTokens": "521875000.00",
    "remainingCap": 35000.00,
    "progress": 56.25,
    "saleActive": true,
    "timeRemaining": 432000,
    "bnbPrice": 600.00
  }
}
```

---

### 3.4 Referral System Endpoints

#### GET /api/referral/link
**Auth:** Required
**Purpose:** Get user's referral link and code

**Response:**
```json
{
  "success": true,
  "data": {
    "code": "HYPE-ABC123",
    "link": "https://hypeai.sale?ref=HYPE-ABC123",
    "qrCode": "data:image/png;base64,..."
  }
}
```

---

#### GET /api/referral/stats
**Auth:** Required
**Purpose:** Get referral performance statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReferred": 12,
    "totalVolume": 4800.00,
    "pendingRewards": 240.00,
    "totalEarned": 240.00,
    "totalClaimed": 0.00,
    "rewardBreakdown": {
      "directReferrals": 10,
      "directRewards": 200.00,
      "secondTierReferrals": 5,
      "secondTierRewards": 40.00
    },
    "leaderboardRank": 8
  }
}
```

---

#### POST /api/referral/claim-rewards
**Auth:** Required
**Purpose:** Claim pending referral rewards

**Request:**
```json
{
  "rewardType": "HYPE"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "claimId": "uuid-v4",
    "rewardType": "HYPE",
    "usdValue": 240.00,
    "tokenAmount": "3000000.00",
    "txHash": "0x...",
    "status": "pending"
  }
}
```

**Logic:**
1. Verify user has pending rewards
2. Call smart contract `claimRewards(inTokens)`
3. Create claim record in DB
4. Monitor transaction confirmation
5. Update user's claimed rewards

---

#### GET /api/referral/history
**Auth:** Required
**Purpose:** Get referral activity history

**Query Params:** `?page=1&limit=20&type=all`

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "uuid-v4",
        "type": "referral_signup",
        "referredUser": "0x...",
        "timestamp": "2025-10-18T12:00:00.000Z"
      },
      {
        "id": "uuid-v4",
        "type": "referral_purchase",
        "referredUser": "0x...",
        "amount": 400.00,
        "reward": 20.00,
        "timestamp": "2025-10-18T13:00:00.000Z"
      },
      {
        "id": "uuid-v4",
        "type": "reward_claimed",
        "amount": 100.00,
        "txHash": "0x...",
        "timestamp": "2025-10-18T14:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

---

#### GET /api/referral/leaderboard
**Auth:** Optional
**Purpose:** Get top referrers leaderboard

**Query Params:** `?limit=100&metric=volume`

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "walletAddress": "0x...xxx",
        "totalReferred": 45,
        "totalVolume": 12000.00,
        "totalEarned": 600.00
      }
    ]
  }
}
```

---

### 3.5 Analytics Endpoints

#### GET /api/analytics/dashboard
**Auth:** Required
**Purpose:** Get comprehensive dashboard analytics

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalInvested": 1100.00,
      "tokensOwned": "13750000.00",
      "currentValue": 1375.00,
      "roi": 25.00
    },
    "referralStats": {
      "totalReferred": 12,
      "pendingRewards": 240.00,
      "claimableNow": 240.00
    },
    "recentActivity": [],
    "priceHistory": []
  }
}
```

---

## 4. Database Schema

### 4.1 PostgreSQL Schema Design

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    email VARCHAR(255),
    telegram VARCHAR(100),
    twitter VARCHAR(100),
    nonce VARCHAR(255),
    is_whitelisted BOOLEAN DEFAULT false,
    is_founding_member BOOLEAN DEFAULT false,
    kyc_status VARCHAR(20) DEFAULT 'pending',
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);

-- Purchases table
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    payment_method VARCHAR(10) NOT NULL, -- 'BNB' or 'USDT'
    amount_paid DECIMAL(18, 8) NOT NULL,
    amount_usd DECIMAL(18, 2) NOT NULL,
    tokens_base DECIMAL(18, 2) NOT NULL,
    tokens_bonus DECIMAL(18, 2) NOT NULL,
    tokens_total DECIMAL(18, 2) NOT NULL,
    tx_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, failed
    confirmations INTEGER DEFAULT 0,
    referrer_id UUID REFERENCES users(id),
    referral_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    failed_at TIMESTAMP,
    error_message TEXT
);

CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_tx_hash ON purchases(tx_hash);
CREATE INDEX idx_purchases_created_at ON purchases(created_at DESC);

-- Referrals table
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id),
    referred_id UUID NOT NULL REFERENCES users(id),
    purchase_id UUID REFERENCES purchases(id),
    reward_tier INTEGER NOT NULL, -- 1 = direct (5%), 2 = second-tier (2%)
    reward_usd DECIMAL(18, 2) NOT NULL,
    reward_tokens DECIMAL(18, 2),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, paid
    created_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,
    paid_at TIMESTAMP,
    UNIQUE(referred_id, referrer_id)
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);
CREATE INDEX idx_referrals_status ON referrals(status);

-- Reward claims table
CREATE TABLE reward_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    reward_type VARCHAR(10) NOT NULL, -- 'HYPE' or 'USDT'
    usd_value DECIMAL(18, 2) NOT NULL,
    token_amount DECIMAL(18, 2) NOT NULL,
    tx_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, failed
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    failed_at TIMESTAMP
);

CREATE INDEX idx_reward_claims_user ON reward_claims(user_id);
CREATE INDEX idx_reward_claims_status ON reward_claims(status);

-- Transaction monitoring table
CREATE TABLE transaction_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    tx_type VARCHAR(20) NOT NULL, -- 'purchase', 'reward_claim'
    related_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    confirmations INTEGER DEFAULT 0,
    required_confirmations INTEGER DEFAULT 3,
    retry_count INTEGER DEFAULT 0,
    last_checked TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_tx_monitoring_hash ON transaction_monitoring(tx_hash);
CREATE INDEX idx_tx_monitoring_status ON transaction_monitoring(status);

-- Whitelist table
CREATE TABLE whitelist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    approved_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_whitelist_wallet ON whitelist(wallet_address);

-- Sale statistics (cached aggregate data)
CREATE TABLE sale_statistics (
    id SERIAL PRIMARY KEY,
    total_raised_usd DECIMAL(18, 2) NOT NULL,
    total_tokens_sold DECIMAL(18, 2) NOT NULL,
    founding_members_count INTEGER NOT NULL,
    total_purchases INTEGER NOT NULL,
    unique_buyers INTEGER NOT NULL,
    avg_purchase_size DECIMAL(18, 2),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 Database Relationships

```
users (1) ─── (many) purchases
users (1) ─── (many) referrals (as referrer)
users (1) ─── (many) referrals (as referred)
purchases (1) ─── (1) transaction_monitoring
reward_claims (1) ─── (1) transaction_monitoring
```

### 4.3 Sequelize Models Example

```javascript
// models/User.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    walletAddress: {
      type: DataTypes.STRING(42),
      unique: true,
      allowNull: false,
      field: 'wallet_address'
    },
    email: {
      type: DataTypes.STRING(255),
      validate: { isEmail: true }
    },
    isWhitelisted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_whitelisted'
    },
    isFoundingMember: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_founding_member'
    },
    referralCode: {
      type: DataTypes.STRING(20),
      unique: true,
      field: 'referral_code'
    }
  }, {
    tableName: 'users',
    underscored: true,
    timestamps: true
  });

  User.associate = (models) => {
    User.hasMany(models.Purchase, { foreignKey: 'userId' });
    User.hasMany(models.Referral, {
      foreignKey: 'referrerId',
      as: 'ReferralsMade'
    });
    User.belongsTo(models.User, {
      foreignKey: 'referredBy',
      as: 'Referrer'
    });
  };

  return User;
};
```

---

## 5. Smart Contract Integration

### 5.1 Contract Addresses (BSC Testnet/Mainnet)

```javascript
// config/contracts.js
module.exports = {
  testnet: {
    privateSale: '0x...', // PrivateSaleWithReferral.sol
    referralSystem: '0x...', // ReferralSystem.sol
    hypeToken: '0x...', // Token.sol
    usdt: '0x55d398326f99059fF775485246999027B3197955',
    bnbPriceFeed: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526'
  },
  mainnet: {
    privateSale: '0x...',
    referralSystem: '0x...',
    hypeToken: '0x...',
    usdt: '0x55d398326f99059fF775485246999027B3197955',
    bnbPriceFeed: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE'
  }
};
```

### 5.2 Web3 Service Architecture

```javascript
// services/web3.service.js
const { ethers } = require('ethers');
const config = require('../config/contracts');

class Web3Service {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/'
    );

    this.wallet = new ethers.Wallet(
      process.env.PRIVATE_KEY,
      this.provider
    );

    this.contracts = this.initContracts();
  }

  initContracts() {
    const network = process.env.NETWORK || 'testnet';
    const addresses = config[network];

    return {
      privateSale: new ethers.Contract(
        addresses.privateSale,
        require('../abis/PrivateSaleWithReferral.json'),
        this.wallet
      ),
      referralSystem: new ethers.Contract(
        addresses.referralSystem,
        require('../abis/ReferralSystem.json'),
        this.wallet
      ),
      hypeToken: new ethers.Contract(
        addresses.hypeToken,
        require('../abis/Token.json'),
        this.wallet
      )
    };
  }

  // Get sale statistics from smart contract
  async getSaleStats() {
    const stats = await this.contracts.privateSale.getSaleStats();
    return {
      totalUSDRaised: ethers.formatUnits(stats._totalUSDRaised, 0),
      totalTokensSold: ethers.formatUnits(stats._totalTokensSold, 18),
      foundingMembersCount: stats._foundingMembersCount.toString(),
      remainingTokens: ethers.formatUnits(stats._remainingTokens, 18),
      remainingUSDCap: ethers.formatUnits(stats._remainingUSDCap, 0),
      timeRemaining: stats._timeRemaining.toString(),
      isActive: stats._isActive
    };
  }

  // Check user eligibility
  async checkEligibility(walletAddress) {
    const result = await this.contracts.privateSale.checkEligibility(
      walletAddress
    );

    return {
      eligible: result.eligible,
      remainingAllocation: ethers.formatUnits(result.remainingAllocation, 0),
      tokensWouldReceive: ethers.formatUnits(result.tokensWouldReceive, 18)
    };
  }

  // Get BNB price from Chainlink
  async getBNBPrice() {
    const price = await this.contracts.privateSale.getBNBPrice();
    return parseFloat(price.toString());
  }

  // Get referral stats from smart contract
  async getReferralStats(walletAddress) {
    const stats = await this.contracts.referralSystem.getReferralStats(
      walletAddress
    );

    return {
      referrer: stats.referrer,
      secondTierReferrer: stats.secondTierReferrer,
      totalReferred: stats.totalReferred.toString(),
      totalVolume: stats.totalVolume.toString(),
      pendingRewardsUSD: stats.pendingRewardsUSD.toString(),
      totalEarnedUSD: stats.totalEarnedUSD.toString(),
      totalClaimedUSD: stats.totalClaimedUSD.toString(),
      rewardInTokens: stats.rewardInTokens,
      isActive: stats.isActive
    };
  }

  // Monitor transaction confirmations
  async monitorTransaction(txHash, requiredConfirmations = 3) {
    return new Promise((resolve, reject) => {
      this.provider.waitForTransaction(txHash, requiredConfirmations)
        .then(receipt => {
          resolve({
            status: receipt.status === 1 ? 'confirmed' : 'failed',
            confirmations: receipt.confirmations,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
          });
        })
        .catch(reject);
    });
  }

  // Listen to contract events
  setupEventListeners() {
    // Purchase events
    this.contracts.privateSale.on('TokensPurchased', (
      buyer, usdAmount, tokensAmount, bonusTokens, paymentMethod, referrer
    ) => {
      console.log('TokensPurchased event:', {
        buyer,
        usdAmount: usdAmount.toString(),
        tokensAmount: tokensAmount.toString(),
        referrer
      });
      // Emit to WebSocket clients
      this.emitEvent('purchase', { buyer, usdAmount, tokensAmount });
    });

    // Referral events
    this.contracts.referralSystem.on('PurchaseRecorded', (
      buyer, usdAmount, tokensAmount, directReferrer, directReward,
      secondTierReferrer, secondTierReward
    ) => {
      console.log('PurchaseRecorded event:', {
        buyer,
        directReferrer,
        directReward: directReward.toString()
      });
    });
  }
}

module.exports = new Web3Service();
```

### 5.3 Smart Contract Interaction Patterns

**Purchase Flow:**
```javascript
// services/sale.service.js
async function initiatePurchase(userId, paymentMethod, amount, referralCode) {
  // 1. Validate user eligibility
  const user = await User.findByPk(userId);
  const eligibility = await web3Service.checkEligibility(user.walletAddress);

  if (!eligibility.eligible) {
    throw new Error('User not eligible for purchase');
  }

  // 2. Resolve referrer from code
  let referrer = null;
  if (referralCode) {
    const referrerUser = await User.findOne({
      where: { referralCode }
    });
    referrer = referrerUser?.walletAddress;
  }

  // 3. Build transaction data
  const contract = web3Service.contracts.privateSale;
  let txData;

  if (paymentMethod === 'BNB') {
    txData = await contract.purchaseWithBNB.populateTransaction(
      referrer || ethers.ZeroAddress
    );
    txData.value = ethers.parseEther(amount.toString());
  } else {
    const usdtAmount = ethers.parseUnits(amount.toString(), 18);
    txData = await contract.purchaseWithUSDT.populateTransaction(
      usdtAmount,
      referrer || ethers.ZeroAddress
    );
  }

  // 4. Create purchase record
  const purchase = await Purchase.create({
    userId,
    paymentMethod,
    amountPaid: amount,
    amountUsd: paymentMethod === 'BNB'
      ? amount * await web3Service.getBNBPrice()
      : amount,
    status: 'pending',
    referralCode,
    referrerId: referrerUser?.id
  });

  return {
    purchaseId: purchase.id,
    transactionData: txData
  };
}
```

---

## 6. Authentication & Security

### 6.1 JWT Structure

```javascript
// Payload
{
  "userId": "uuid-v4",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "isWhitelisted": true,
  "iat": 1729274645,
  "exp": 1729275545
}
```

### 6.2 Signature Verification

```javascript
// utils/auth.js
const { ethers } = require('ethers');

async function verifyWalletSignature(walletAddress, message, signature) {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    return false;
  }
}
```

### 6.3 Security Measures

1. **Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts'
});

app.use('/api/auth', authLimiter);
```

2. **Input Validation:**
```javascript
const Joi = require('joi');

const purchaseSchema = Joi.object({
  paymentMethod: Joi.string().valid('BNB', 'USDT').required(),
  amount: Joi.number().positive().required(),
  referralCode: Joi.string().pattern(/^HYPE-[A-Z0-9]{6}$/).optional()
});
```

3. **CORS Configuration:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

4. **Helmet Security Headers:**
```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

## 7. Payment Processing

### 7.1 Payment Flow Diagram

```
User initiates purchase
        │
        ▼
Backend validates + creates pending record
        │
        ▼
Frontend signs transaction with MetaMask
        │
        ▼
Transaction sent to BSC network
        │
        ▼
Backend monitors confirmations
        │
        ▼
Smart contract emits TokensPurchased event
        │
        ▼
Backend updates purchase status
        │
        ▼
WebSocket notifies frontend
        │
        ▼
User sees confirmed purchase
```

### 7.2 Payment Methods

**BNB Payment:**
- Real-time price via Chainlink oracle
- Direct blockchain transaction
- No intermediary fees

**USDT Payment:**
- 1:1 USD peg
- Requires token approval first
- Lower volatility risk

### 7.3 Transaction Monitoring

```javascript
// services/transaction-monitor.service.js
class TransactionMonitor {
  async monitorPurchase(txHash, purchaseId) {
    const monitoring = await TransactionMonitoring.create({
      txHash,
      txType: 'purchase',
      relatedId: purchaseId,
      requiredConfirmations: 3
    });

    // Start monitoring
    const receipt = await web3Service.monitorTransaction(txHash, 3);

    if (receipt.status === 'confirmed') {
      await this.handleConfirmed(purchaseId, receipt);
    } else {
      await this.handleFailed(purchaseId, receipt);
    }
  }

  async handleConfirmed(purchaseId, receipt) {
    await Purchase.update({
      status: 'confirmed',
      confirmations: receipt.confirmations,
      confirmedAt: new Date()
    }, {
      where: { id: purchaseId }
    });

    // Trigger referral reward calculation
    await referralService.processPurchaseRewards(purchaseId);

    // Notify user via WebSocket
    socketService.emitToUser(userId, 'purchase-confirmed', {
      purchaseId,
      receipt
    });
  }
}
```

---

## 8. Implementation Plan

### 8.1 Phase 1: Core Infrastructure (Week 1)

**Tasks:**
- ✅ Set up Express.js server with middleware
- ✅ Configure PostgreSQL database + Sequelize ORM
- ✅ Set up Redis for caching/sessions
- ✅ Implement Web3 service with ethers.js
- ✅ Create base models (User, Purchase, Referral)
- ✅ Deploy contracts to BSC testnet

**Deliverables:**
- `/src/backend/server.js` - Express app
- `/src/backend/config/database.js` - DB config
- `/src/backend/models/*` - Sequelize models
- `/src/backend/services/web3.service.js` - Blockchain integration

### 8.2 Phase 2: Authentication (Week 1-2)

**Tasks:**
- ✅ Wallet signature authentication
- ✅ JWT generation/verification
- ✅ Session management with Redis
- ✅ Rate limiting
- ✅ Whitelist verification

**Deliverables:**
- `/api/auth/*` endpoints
- `/src/backend/middleware/auth.js` - JWT middleware
- `/src/backend/utils/signature.js` - Signature verification

### 8.3 Phase 3: Private Sale API (Week 2)

**Tasks:**
- ✅ Purchase initiation endpoint
- ✅ Transaction confirmation handling
- ✅ Eligibility checking
- ✅ Sale statistics aggregation
- ✅ Transaction monitoring service

**Deliverables:**
- `/api/sale/*` endpoints
- `/src/backend/services/sale.service.js`
- `/src/backend/services/transaction-monitor.service.js`

### 8.4 Phase 4: Referral System (Week 2-3)

**Tasks:**
- ✅ Referral code generation
- ✅ Referral tracking
- ✅ Reward calculation
- ✅ Reward claiming
- ✅ Leaderboard system

**Deliverables:**
- `/api/referral/*` endpoints
- `/src/backend/services/referral.service.js`
- Referral analytics dashboard

### 8.5 Phase 5: User Dashboard (Week 3)

**Tasks:**
- ✅ User profile management
- ✅ Portfolio/allocation tracking
- ✅ Transaction history
- ✅ Analytics aggregation
- ✅ WebSocket real-time updates

**Deliverables:**
- `/api/user/*` endpoints
- `/api/analytics/*` endpoints
- WebSocket server implementation

### 8.6 Phase 6: Testing & Security (Week 3-4)

**Tasks:**
- ✅ Unit tests (Jest)
- ✅ Integration tests (Supertest)
- ✅ Smart contract interaction tests
- ✅ Security audit (OWASP Top 10)
- ✅ Load testing
- ✅ Penetration testing

**Deliverables:**
- `/tests/backend/*` - Test suites
- Security audit report
- Performance benchmarks

### 8.7 Phase 7: Deployment (Week 4)

**Tasks:**
- ✅ Set up production server (AWS/DigitalOcean)
- ✅ Configure CI/CD pipeline
- ✅ Deploy to staging environment
- ✅ Deploy to production (BSC mainnet)
- ✅ Monitoring setup (PM2, DataDog)

**Deliverables:**
- Production backend deployment
- Monitoring dashboards
- Deployment documentation

---

## 9. API Documentation (OpenAPI 3.0)

```yaml
openapi: 3.0.0
info:
  title: HypeAI Private Sale API
  version: 1.0.0
  description: Backend API for HypeAI Private Sale platform
  contact:
    name: HypeAI Team
    email: dev@hypeai.io

servers:
  - url: https://api.hypeai.io/v1
    description: Production server
  - url: https://api-staging.hypeai.io/v1
    description: Staging server

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        walletAddress:
          type: string
          pattern: ^0x[a-fA-F0-9]{40}$
        email:
          type: string
          format: email
        isWhitelisted:
          type: boolean
        isFoundingMember:
          type: boolean
        createdAt:
          type: string
          format: date-time

    Purchase:
      type: object
      properties:
        id:
          type: string
          format: uuid
        userId:
          type: string
          format: uuid
        paymentMethod:
          type: string
          enum: [BNB, USDT]
        amountPaid:
          type: number
          format: float
        tokensTotal:
          type: number
          format: float
        txHash:
          type: string
        status:
          type: string
          enum: [pending, confirmed, failed]

paths:
  /auth/connect-wallet:
    post:
      summary: Initiate wallet connection
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                walletAddress:
                  type: string
                  pattern: ^0x[a-fA-F0-9]{40}$
      responses:
        '200':
          description: Nonce generated successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      nonce:
                        type: string
                      expiresAt:
                        type: string
                        format: date-time

  /sale/purchase:
    post:
      summary: Initiate token purchase
      tags: [Private Sale]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                paymentMethod:
                  type: string
                  enum: [BNB, USDT]
                amount:
                  type: number
                  format: float
                referralCode:
                  type: string
                  pattern: ^HYPE-[A-Z0-9]{6}$
      responses:
        '200':
          description: Purchase initiated successfully
        '400':
          description: Invalid request
        '401':
          description: Unauthorized
        '403':
          description: Not whitelisted or ineligible
```

---

## 10. Performance & Scalability

### 10.1 Caching Strategy

```javascript
// Redis caching for expensive operations
const redis = require('redis');
const client = redis.createClient();

// Cache sale statistics (TTL: 30 seconds)
async function getSaleStats() {
  const cached = await client.get('sale:stats');
  if (cached) return JSON.parse(cached);

  const stats = await web3Service.getSaleStats();
  await client.setEx('sale:stats', 30, JSON.stringify(stats));

  return stats;
}

// Cache user eligibility (TTL: 60 seconds)
async function getUserEligibility(walletAddress) {
  const key = `eligibility:${walletAddress}`;
  const cached = await client.get(key);
  if (cached) return JSON.parse(cached);

  const eligibility = await web3Service.checkEligibility(walletAddress);
  await client.setEx(key, 60, JSON.stringify(eligibility));

  return eligibility;
}
```

### 10.2 Database Optimization

- **Indexes:** Created on frequently queried columns
- **Connection Pooling:** Sequelize pool (min: 5, max: 30)
- **Query Optimization:** Use raw queries for complex analytics
- **Partitioning:** Consider partitioning `purchases` table by month

### 10.3 Load Balancing

```
              ┌─────────────┐
              │ Load Balancer│
              │  (Nginx)     │
              └──────┬───────┘
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼────┐ ┌───▼────┐ ┌───▼────┐
    │ Server 1│ │Server 2│ │Server 3│
    └─────────┘ └────────┘ └────────┘
```

### 10.4 Expected Load

- **500 founding members**
- **$80,000 hard cap**
- **Average purchase: $800**
- **100 transactions total**
- **Peak: 20 concurrent purchases**

**Server Specs (Recommended):**
- CPU: 4 cores
- RAM: 8 GB
- Storage: 100 GB SSD
- Network: 1 Gbps

---

## 11. Monitoring & Logging

### 11.1 Logging Strategy

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});

// Log purchase events
logger.info('Purchase initiated', {
  userId,
  paymentMethod,
  amount,
  timestamp: new Date()
});
```

### 11.2 Health Checks

```javascript
// /api/health
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      blockchain: await checkBlockchain()
    }
  };

  const allHealthy = Object.values(health.services).every(s => s.status === 'up');
  res.status(allHealthy ? 200 : 503).json(health);
});
```

---

## 12. Environment Variables

```bash
# .env.example

# Server
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://hypeai.io

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/hypeai
DB_POOL_MIN=5
DB_POOL_MAX=30

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Blockchain
NETWORK=mainnet
BSC_RPC_URL=https://bsc-dataseed.binance.org/
PRIVATE_KEY=0x...
CONTRACT_PRIVATE_SALE=0x...
CONTRACT_REFERRAL_SYSTEM=0x...
CONTRACT_HYPE_TOKEN=0x...

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=another-secret-key
REFRESH_TOKEN_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN=
DATADOG_API_KEY=
```

---

## 13. Implementation Complexity Estimate

### Time Estimates

| Phase | Tasks | Complexity | Time (Days) |
|-------|-------|------------|-------------|
| Phase 1 | Core Infrastructure | Medium | 3-5 |
| Phase 2 | Authentication | Medium | 2-3 |
| Phase 3 | Private Sale API | High | 4-6 |
| Phase 4 | Referral System | High | 4-5 |
| Phase 5 | User Dashboard | Medium | 3-4 |
| Phase 6 | Testing & Security | High | 5-7 |
| Phase 7 | Deployment | Medium | 2-3 |

**Total Estimate: 23-33 days (1-1.5 months)**

### Risk Factors

1. **Smart Contract Bugs:** High severity - requires thorough testing
2. **Blockchain Network Issues:** Medium severity - implement retry logic
3. **Database Performance:** Low severity - proper indexing mitigates
4. **Security Vulnerabilities:** High severity - security audit required

---

## 14. Next Steps

### Immediate Actions

1. **Review & Approve Architecture** - Omega Coordinator approval
2. **Set Up Development Environment** - Install dependencies
3. **Deploy Smart Contracts to Testnet** - Get contract addresses
4. **Create Database Schema** - Run migration scripts
5. **Begin Phase 1 Implementation** - Core infrastructure

### Questions for Omega

1. **Payment Gateway:** Do we need fiat payment integration (credit card)?
2. **KYC/AML:** Is KYC verification required for private sale?
3. **Vesting:** Do tokens vest immediately or on a schedule?
4. **Admin Panel:** Do we need an admin dashboard for managing whitelist/sales?
5. **Email Notifications:** Should we implement email notifications for purchases?

---

## 15. Conclusion

This architecture provides a robust, scalable, and secure backend for HypeAI's private sale platform. The system leverages industry best practices with:

- **Clean Architecture:** Controller → Service → Repository pattern
- **Security First:** JWT auth, signature verification, rate limiting
- **Smart Contract Integration:** Direct blockchain interaction with ethers.js
- **High Performance:** Redis caching, database optimization
- **Real-time Updates:** WebSocket support for live data
- **Comprehensive Testing:** Unit + integration tests
- **Production Ready:** Monitoring, logging, health checks

**Technology Stack Summary:**
- Node.js + Express.js (Backend framework)
- PostgreSQL (Primary database)
- Redis (Caching + sessions)
- ethers.js (Blockchain interaction)
- JWT (Authentication)
- Socket.io (Real-time)

**Estimated Timeline:** 4-6 weeks to production-ready deployment

---

## Appendix A: File Structure

```
/src/backend/
├── config/
│   ├── database.js
│   ├── redis.js
│   ├── blockchain.js
│   └── contracts.js
├── controllers/
│   ├── auth.controller.js
│   ├── sale.controller.js
│   ├── user.controller.js
│   └── referral.controller.js
├── services/
│   ├── web3.service.js
│   ├── auth.service.js
│   ├── sale.service.js
│   ├── referral.service.js
│   ├── transaction-monitor.service.js
│   └── analytics.service.js
├── models/
│   ├── User.js
│   ├── Purchase.js
│   ├── Referral.js
│   ├── RewardClaim.js
│   └── index.js
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   ├── errorHandler.js
│   └── rateLimiter.js
├── routes/
│   ├── auth.routes.js
│   ├── sale.routes.js
│   ├── user.routes.js
│   └── referral.routes.js
├── utils/
│   ├── signature.js
│   ├── logger.js
│   └── helpers.js
├── abis/
│   ├── PrivateSaleWithReferral.json
│   ├── ReferralSystem.json
│   └── Token.json
├── migrations/
│   └── 001-create-tables.js
├── app.js
└── server.js
```

---

**Document Status:** ✅ Complete
**Ready for Implementation:** Yes
**Requires Review:** Omega Coordinator

**Generated by:** Backend API Developer Agent
**Date:** 2025-10-18
