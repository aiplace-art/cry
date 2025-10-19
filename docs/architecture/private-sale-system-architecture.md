# HypeAI Private Sale System - Complete Architecture

**Document Version:** 1.0.0
**Date:** October 18, 2025
**Architect:** OMEGA - System Architecture Designer
**Project:** HypeAI Private Sale Platform

---

## Executive Summary

This document defines the complete architecture for the HypeAI Private Sale system, addressing the user's requirement: "Person clicks Join Private Sale button - what happens next? We need a personal dashboard where referral links are all built in."

The system encompasses:
- Complete user onboarding flow from button click to token purchase
- Personal dashboard with integrated referral system
- Multi-payment method support (ETH, USDT, Credit Card)
- Smart contract integration for token allocation
- Vesting schedule management
- Real-time analytics and tracking

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [User Journey Map](#2-user-journey-map)
3. [Architecture Design](#3-architecture-design)
4. [Database Schema](#4-database-schema)
5. [Dashboard Features](#5-dashboard-features)
6. [Referral System](#6-referral-system)
7. [Smart Contract Integration](#7-smart-contract-integration)
8. [API Endpoints](#8-api-endpoints)
9. [Security Considerations](#9-security-considerations)
10. [Technology Stack](#10-technology-stack)
11. [Implementation Timeline](#11-implementation-timeline)

---

## 1. System Overview

### 1.1 Current State Analysis

**Existing Infrastructure:**
- Frontend: Static HTML/CSS/JS website
- Backend: Node.js/Express with MongoDB
- Smart Contracts: Basic ERC20 Token + Staking contracts
- User Model: Basic wallet authentication

**Gaps Identified:**
- No presale contract or purchase flow
- No user dashboard
- No referral system
- No KYC integration
- No payment processing beyond crypto wallets

### 1.2 System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    HypeAI Private Sale System                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Frontend    │  │   Backend    │  │  Blockchain  │     │
│  │   (Next.js)   │  │  (Express)   │  │   (Solidity) │     │
│  └───────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│          │                  │                  │              │
│  ┌───────▼──────────────────▼──────────────────▼───────┐    │
│  │            Integrated Services Layer                 │    │
│  │  • Authentication  • Payment Processing              │    │
│  │  • KYC/AML        • Referral Tracking                │    │
│  │  • Email/SMS      • Analytics                        │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. User Journey Map

### 2.1 Complete Flow: Button Click to Token Purchase

```
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 1: DISCOVERY & INITIATION                                │
└─────────────────────────────────────────────────────────────────┘

[Website Homepage]
       ↓
User clicks "Join Private Sale" button
       ↓
┌─────────────────────────────────────────┐
│ Decision Point: Is User Logged In?      │
└─────────────────────────────────────────┘
       ↓                ↓
      NO               YES
       ↓                ↓
   [Auth Flow]    [Redirect to Dashboard]

┌─────────────────────────────────────────────────────────────────┐
│ STAGE 2: AUTHENTICATION & REGISTRATION                         │
└─────────────────────────────────────────────────────────────────┘

IF NOT LOGGED IN:
  1. Modal/Page: "Connect Wallet"
     Options:
     - MetaMask
     - WalletConnect
     - Coinbase Wallet
     - Email (Web3Auth)

  2. Wallet Connection Flow:
     a) User selects wallet
     b) Wallet prompts signature request
     c) Backend generates nonce
     d) User signs message
     e) Backend verifies signature
     f) JWT token issued

  3. New User Registration:
     a) Check if wallet exists in database
     b) If new: Create user record
     c) Generate unique referral code
     d) Check for referral parameter in URL
     e) Link to referrer if present

┌─────────────────────────────────────────────────────────────────┐
│ STAGE 3: KYC VERIFICATION (Optional based on amount)           │
└─────────────────────────────────────────────────────────────────┘

Decision: Purchase Amount
       ↓
< $10,000: Skip KYC → Dashboard
≥ $10,000: Required KYC
       ↓
KYC Flow (Sumsub/Onfido Integration):
  1. Personal Information Form
     - Full Name
     - Date of Birth
     - Country of Residence
     - Email & Phone

  2. Document Upload
     - Government ID (Passport/Driver's License)
     - Proof of Address
     - Selfie Verification

  3. Verification Processing
     - Auto-verification (2-5 minutes)
     - Manual review if flagged (24-48 hours)

  4. Result:
     - Approved → Proceed to Dashboard
     - Rejected → Show reason, allow resubmission
     - Pending → Can browse but not purchase

┌─────────────────────────────────────────────────────────────────┐
│ STAGE 4: PERSONAL DASHBOARD                                    │
└─────────────────────────────────────────────────────────────────┘

User lands on Personal Dashboard:
/dashboard/overview

Dashboard Sections (Sidebar Navigation):
├─ Overview (Home)
├─ Buy Tokens
├─ My Purchases
├─ Vesting Schedule
├─ Referrals
├─ Account Settings
└─ Support

┌─────────────────────────────────────────────────────────────────┐
│ STAGE 5: PURCHASE FLOW                                         │
└─────────────────────────────────────────────────────────────────┘

User clicks "Buy Tokens" in dashboard:

1. Token Calculator Interface:
   ┌─────────────────────────────────┐
   │  Private Sale - Round 1         │
   │  Price: $0.015 per HYPE         │
   │  Bonus: +20%                    │
   │                                 │
   │  Enter Amount:                  │
   │  [$______] USD                  │
   │                                 │
   │  You will receive:              │
   │  [______] HYPE tokens           │
   │  + [____] Bonus tokens          │
   │                                 │
   │  Vesting: 6 months              │
   │  (15% TGE, then monthly)        │
   └─────────────────────────────────┘

2. Select Payment Method:
   ○ ETH (Ethereum)
   ○ USDT (ERC-20/BEP-20)
   ○ BNB (Binance Smart Chain)
   ○ Credit/Debit Card (via Stripe)

3. Payment Processing:

   IF CRYPTO PAYMENT:
   a) Smart contract generates deposit address
   b) Display QR code + address
   c) User sends crypto from wallet
   d) Backend monitors blockchain
   e) Confirmations: 12 blocks ETH, 15 blocks BSC
   f) Tokens allocated to vesting contract

   IF CARD PAYMENT:
   a) Redirect to Stripe Checkout
   b) Process payment (3-5 seconds)
   c) On success: Allocate tokens
   d) On failure: Show error, allow retry

4. Purchase Confirmation:
   ┌─────────────────────────────────┐
   │  ✓ Purchase Successful!         │
   │                                 │
   │  Transaction: 0x123...abc       │
   │  Amount: 100,000 HYPE           │
   │  Vesting Start: [Date]          │
   │                                 │
   │  [View Transaction] [Dashboard] │
   └─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STAGE 6: POST-PURCHASE ENGAGEMENT                              │
└─────────────────────────────────────────────────────────────────┘

User redirected to Dashboard:

- Transaction appears in "My Purchases"
- Vesting schedule visible in "Vesting Schedule"
- Referral link prominently displayed
- Email confirmation sent
- Telegram/Discord invite with VIP role
```

### 2.2 Decision Tree

```
                    [Join Private Sale Button]
                              ↓
                    ┌─────────────────┐
                    │ Wallet Connected?│
                    └─────────────────┘
                       ↓          ↓
                     YES          NO
                       ↓          ↓
                       ↓    [Connect Wallet]
                       ↓          ↓
                       ↓    [Sign Message]
                       ↓          ↓
                       ↓    [Create Account]
                       ↓          ↓
                       └──────────┘
                              ↓
                    ┌─────────────────┐
                    │ Purchase Amount? │
                    └─────────────────┘
                       ↓          ↓
                   < $10k      ≥ $10k
                       ↓          ↓
                       ↓    [KYC Verification]
                       ↓          ↓
                       ↓    [Wait Approval]
                       ↓          ↓
                       └──────────┘
                              ↓
                       [Dashboard]
                              ↓
                    [Select Token Amount]
                              ↓
                    [Choose Payment Method]
                              ↓
                    ┌─────────────────┐
                    │ Payment Method?  │
                    └─────────────────┘
                 ↓        ↓         ↓
              Crypto    Card     Bank
                 ↓        ↓         ↓
          [Send TX] [Stripe]  [Wire Info]
                 ↓        ↓         ↓
          [Confirm] [Process] [Wait 2-3d]
                 ↓        ↓         ↓
                 └────────┴─────────┘
                          ↓
                  [Allocate Tokens]
                          ↓
                  [Vesting Contract]
                          ↓
            [Dashboard - Purchase Complete]
```

---

## 3. Architecture Design

### 3.1 System Architecture Diagram (C4 Model - Context)

```
┌──────────────────────────────────────────────────────────────────┐
│                        HypeAI Ecosystem                          │
│                                                                  │
│  ┌────────────┐          ┌──────────────┐                       │
│  │   Users    │◄────────►│   Frontend   │                       │
│  │ (Investors)│          │   Next.js    │                       │
│  └────────────┘          └──────┬───────┘                       │
│        ↑                        │                                │
│        │                        ↓                                │
│        │               ┌─────────────────┐                      │
│        │               │  Backend API    │                      │
│        │               │  (Node/Express) │                      │
│        │               └────────┬────────┘                      │
│        │                        │                                │
│        │          ┌─────────────┼─────────────┐                 │
│        │          ↓             ↓             ↓                 │
│        │   ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│        │   │ MongoDB  │  │  Redis   │  │  PostgreSQL│           │
│        │   │(NoSQL DB)│  │ (Cache)  │  │ (Analytics)│           │
│        │   └──────────┘  └──────────┘  └──────────┘            │
│        │                                                         │
│        └────────────┐                                            │
│                     ↓                                            │
│            ┌──────────────────┐                                 │
│            │  Smart Contracts │                                 │
│            │  (Ethereum/BSC)  │                                 │
│            └──────────────────┘                                 │
│                     ↑                                            │
│                     │                                            │
│     ┌───────────────┴───────────────┐                           │
│     ↓               ↓               ↓                           │
│  ┌────────┐   ┌──────────┐   ┌──────────┐                      │
│  │Presale │   │ Vesting  │   │  Token   │                      │
│  │Contract│   │ Contract │   │ Contract │                      │
│  └────────┘   └──────────┘   └──────────┘                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

External Services:
┌─────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Stripe     │  │ Sumsub   │  │  Twilio  │  │ SendGrid │
│  (Payments) │  │  (KYC)   │  │  (SMS)   │  │  (Email) │
└─────────────┘  └──────────┘  └──────────┘  └──────────┘
```

### 3.2 Frontend Component Architecture

```
src/frontend/
├── pages/
│   ├── index.tsx                    # Landing page (existing)
│   ├── private-sale/
│   │   ├── index.tsx                # Private sale info page
│   │   └── join.tsx                 # Onboarding page
│   └── dashboard/
│       ├── _layout.tsx              # Dashboard wrapper
│       ├── index.tsx                # Overview
│       ├── buy.tsx                  # Purchase tokens
│       ├── purchases.tsx            # Transaction history
│       ├── vesting.tsx              # Vesting schedule
│       ├── referrals.tsx            # Referral dashboard
│       ├── settings.tsx             # Account settings
│       └── kyc.tsx                  # KYC verification
│
├── components/
│   ├── auth/
│   │   ├── WalletConnectModal.tsx   # Multi-wallet connection
│   │   ├── SignMessagePrompt.tsx    # Signature verification
│   │   └── EmailAuth.tsx            # Email/Web3Auth fallback
│   │
│   ├── dashboard/
│   │   ├── Sidebar.tsx              # Navigation sidebar
│   │   ├── Header.tsx               # User info + notifications
│   │   ├── Overview/
│   │   │   ├── StatsCards.tsx       # Key metrics
│   │   │   ├── PortfolioChart.tsx   # Token value chart
│   │   │   └── RecentActivity.tsx   # Latest transactions
│   │   │
│   │   ├── Purchase/
│   │   │   ├── TokenCalculator.tsx  # Amount calculator
│   │   │   ├── PaymentMethods.tsx   # Payment selection
│   │   │   ├── CryptoPayment.tsx    # Crypto payment UI
│   │   │   ├── CardPayment.tsx      # Stripe integration
│   │   │   └── PurchaseConfirm.tsx  # Success screen
│   │   │
│   │   ├── Vesting/
│   │   │   ├── VestingSchedule.tsx  # Timeline view
│   │   │   ├── ClaimButton.tsx      # Claim unlocked tokens
│   │   │   └── VestingChart.tsx     # Visual representation
│   │   │
│   │   └── Referrals/
│   │       ├── ReferralLink.tsx     # Copy/share link
│   │       ├── ReferralStats.tsx    # Performance metrics
│   │       ├── ReferralList.tsx     # List of referrals
│   │       └── RewardsTracker.tsx   # Earned bonuses
│   │
│   ├── kyc/
│   │   ├── PersonalInfo.tsx         # Form for personal data
│   │   ├── DocumentUpload.tsx       # ID upload
│   │   ├── SelfieCapture.tsx        # Live selfie
│   │   └── VerificationStatus.tsx   # Progress indicator
│   │
│   └── shared/
│       ├── Button.tsx               # (existing)
│       ├── Card.tsx                 # (existing)
│       ├── Modal.tsx                # New: modal component
│       ├── Toast.tsx                # New: notifications
│       ├── LoadingSpinner.tsx       # (existing as Loading.tsx)
│       └── CopyButton.tsx           # New: copy to clipboard
│
├── hooks/
│   ├── useContract.ts               # (existing)
│   ├── useAuth.ts                   # New: authentication
│   ├── useDashboard.ts              # New: dashboard data
│   ├── usePurchase.ts               # New: purchase flow
│   ├── useReferrals.ts              # New: referral data
│   └── useVesting.ts                # New: vesting data
│
├── lib/
│   ├── api.ts                       # (existing)
│   ├── websocket.ts                 # (existing)
│   ├── web3.ts                      # New: Web3 utilities
│   ├── stripe.ts                    # New: Stripe integration
│   └── constants.ts                 # (existing)
│
└── types/
    ├── index.ts                     # (existing)
    ├── auth.ts                      # New: auth types
    ├── dashboard.ts                 # New: dashboard types
    ├── purchase.ts                  # New: purchase types
    └── referral.ts                  # New: referral types
```

### 3.3 Backend Service Architecture

```
src/backend/
├── routes/
│   ├── auth.routes.js               # (existing - extend)
│   ├── presale.routes.js            # NEW: Presale endpoints
│   ├── referral.routes.js           # NEW: Referral system
│   ├── kyc.routes.js                # NEW: KYC integration
│   ├── payment.routes.js            # NEW: Payment processing
│   └── vesting.routes.js            # NEW: Vesting management
│
├── controllers/
│   ├── presale.controller.js        # NEW
│   ├── referral.controller.js       # NEW
│   ├── kyc.controller.js            # NEW
│   ├── payment.controller.js        # NEW
│   └── vesting.controller.js        # NEW
│
├── services/
│   ├── presale.service.js           # NEW: Business logic
│   ├── referral.service.js          # NEW: Referral tracking
│   ├── kyc.service.js               # NEW: Sumsub integration
│   ├── payment/
│   │   ├── stripe.service.js        # NEW: Card payments
│   │   ├── crypto.service.js        # NEW: Crypto monitoring
│   │   └── bank.service.js          # NEW: Wire transfers
│   ├── vesting.service.js           # NEW: Vesting calculations
│   ├── notification.service.js      # NEW: Email/SMS
│   └── blockchain/
│       ├── presale-contract.js      # NEW: Presale SC interface
│       ├── vesting-contract.js      # NEW: Vesting SC interface
│       └── token-contract.js        # EXTEND: Token SC
│
├── models/
│   ├── User.js                      # EXTEND: Add presale fields
│   ├── Purchase.js                  # NEW: Purchase records
│   ├── Referral.js                  # NEW: Referral tracking
│   ├── KYC.js                       # NEW: KYC verification
│   ├── VestingSchedule.js           # NEW: Vesting data
│   └── PaymentTransaction.js        # NEW: Payment tracking
│
├── middleware/
│   ├── auth.middleware.js           # EXTEND: Add JWT validation
│   ├── kyc.middleware.js            # NEW: Check KYC status
│   ├── rateLimit.middleware.js      # NEW: API rate limiting
│   └── validation.js                # (existing - extend)
│
└── utils/
    ├── jwt.js                       # NEW: Token generation
    ├── signature.js                 # NEW: Wallet signature verification
    ├── bonus-calculator.js          # NEW: Calculate purchase bonuses
    ├── vesting-calculator.js        # NEW: Calculate vesting
    └── referral-rewards.js          # NEW: Calculate referral rewards
```

---

## 4. Database Schema

### 4.1 MongoDB Collections

#### **Users Collection** (Extended)

```javascript
{
  _id: ObjectId,
  walletAddress: String (indexed, unique),
  email: String (optional, indexed),
  nonce: String, // For signature verification

  // Profile
  profile: {
    fullName: String,
    country: String,
    phone: String,
    dateOfBirth: Date
  },

  // Presale specific
  presale: {
    kycStatus: String, // 'none', 'pending', 'approved', 'rejected'
    kycProvider: String, // 'sumsub', 'onfido'
    kycSubmittedAt: Date,
    kycApprovedAt: Date,
    kycRejectionReason: String,

    totalInvested: Number, // USD
    totalTokensPurchased: Number, // HYPE tokens
    totalBonusTokens: Number,

    purchaseCount: Number,
    firstPurchaseDate: Date,
    lastPurchaseDate: Date,

    // Vesting
    totalVested: Number,
    totalClaimed: Number,
    nextClaimDate: Date,
    nextClaimAmount: Number
  },

  // Referral system
  referral: {
    code: String (indexed, unique), // e.g., "HYPE-ABC123"
    referredBy: ObjectId, // Reference to referrer User
    referredAt: Date,

    totalReferrals: Number,
    activeReferrals: Number, // Users who made purchases

    totalReferralRewards: Number, // In HYPE tokens
    totalReferralVolume: Number, // In USD

    tier: String, // 'bronze', 'silver', 'gold', 'platinum'
    commissionRate: Number // Percentage (e.g., 5, 10, 15)
  },

  // Authentication
  jwt: {
    accessToken: String,
    refreshToken: String,
    lastLogin: Date
  },

  // Existing fields
  role: String,
  preferences: Object,
  portfolioValue: Number,
  totalStaked: Number,
  totalEarned: Number,
  isActive: Boolean,

  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.users.createIndex({ walletAddress: 1 }, { unique: true })
db.users.createIndex({ "referral.code": 1 }, { unique: true, sparse: true })
db.users.createIndex({ "referral.referredBy": 1 })
db.users.createIndex({ "presale.kycStatus": 1 })
db.users.createIndex({ email: 1 }, { sparse: true })
```

#### **Purchases Collection** (NEW)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed), // Reference to User

  // Purchase details
  round: Number, // 1, 2, 3 (presale round)
  phase: String, // 'private-sale', 'public-sale'

  // Amounts
  amountUSD: Number,
  tokenPrice: Number, // Price per token at time of purchase
  baseTokens: Number, // Tokens without bonus
  bonusTokens: Number, // Bonus tokens
  totalTokens: Number, // baseTokens + bonusTokens

  bonusPercentage: Number, // e.g., 20 (for 20%)
  bonusReason: String, // 'early-bird', 'large-purchase', 'referral'

  // Payment
  paymentMethod: String, // 'eth', 'usdt', 'bnb', 'card', 'bank'
  paymentCurrency: String, // 'ETH', 'USDT', etc.
  paymentAmount: Number, // Amount in payment currency

  // Transaction tracking
  status: String, // 'pending', 'confirming', 'completed', 'failed', 'refunded'

  // Blockchain transactions
  blockchain: String, // 'ethereum', 'bsc'
  depositAddress: String, // Where user sent crypto
  transactionHash: String (indexed),
  blockNumber: Number,
  confirmations: Number,

  // Card payment (if applicable)
  stripePaymentIntentId: String,
  stripeCustomerId: String,

  // Vesting
  vestingScheduleId: ObjectId, // Reference to VestingSchedule
  vestingStartDate: Date,
  vestingEndDate: Date,
  vestingCliff: Number, // Months

  // Referral
  referredBy: ObjectId, // If purchase was via referral
  referralCode: String,
  referralRewardIssued: Boolean,

  // Metadata
  ipAddress: String,
  userAgent: String,

  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

**Indexes:**
```javascript
db.purchases.createIndex({ userId: 1, createdAt: -1 })
db.purchases.createIndex({ status: 1 })
db.purchases.createIndex({ transactionHash: 1 }, { sparse: true })
db.purchases.createIndex({ referredBy: 1 })
db.purchases.createIndex({ round: 1, phase: 1 })
```

#### **VestingSchedules Collection** (NEW)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  purchaseId: ObjectId,

  // Token allocation
  totalTokens: Number,
  claimedTokens: Number,
  remainingTokens: Number,

  // Schedule configuration
  tgePercentage: Number, // Token Generation Event (e.g., 15%)
  tgeTokens: Number,
  tgeClaimedAt: Date,

  vestingMonths: Number, // e.g., 6
  monthlyPercentage: Number, // e.g., 14.17%

  // Milestones
  milestones: [
    {
      number: Number, // 1, 2, 3...
      unlockDate: Date,
      tokensToUnlock: Number,
      claimed: Boolean,
      claimedAt: Date,
      transactionHash: String
    }
  ],

  // Status
  status: String, // 'active', 'paused', 'completed'
  startDate: Date,
  endDate: Date,
  nextUnlockDate: Date,

  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.vestingSchedules.createIndex({ userId: 1 })
db.vestingSchedules.createIndex({ status: 1, nextUnlockDate: 1 })
db.vestingSchedules.createIndex({ purchaseId: 1 }, { unique: true })
```

#### **Referrals Collection** (NEW)

```javascript
{
  _id: ObjectId,

  // Referrer (who shared the link)
  referrerId: ObjectId (indexed),
  referrerCode: String,

  // Referee (who was referred)
  refereeId: ObjectId (indexed),
  refereeWalletAddress: String,

  // Tracking
  referralSource: String, // 'direct', 'twitter', 'telegram', 'discord'
  clickedAt: Date,
  registeredAt: Date,

  // Conversion
  converted: Boolean, // Did referee make a purchase?
  firstPurchaseId: ObjectId,
  firstPurchaseDate: Date,
  firstPurchaseAmount: Number, // USD

  // Rewards
  rewardStatus: String, // 'pending', 'issued', 'claimed'
  rewardTokens: Number, // Tokens earned by referrer
  rewardIssuedAt: Date,
  rewardClaimedAt: Date,
  rewardTransactionHash: String,

  // Metadata
  ipAddress: String,
  userAgent: String,

  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.referrals.createIndex({ referrerId: 1, createdAt: -1 })
db.referrals.createIndex({ refereeId: 1 }, { unique: true })
db.referrals.createIndex({ referrerCode: 1 })
db.referrals.createIndex({ converted: 1, rewardStatus: 1 })
```

#### **KYC Collection** (NEW)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed, unique),

  // Provider
  provider: String, // 'sumsub', 'onfido'
  externalId: String, // Provider's verification ID

  // Personal information
  personalInfo: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    nationality: String,
    countryOfResidence: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    }
  },

  // Contact
  email: String,
  phone: String,

  // Documents
  documents: [
    {
      type: String, // 'passport', 'drivers_license', 'id_card', 'proof_of_address', 'selfie'
      fileName: String,
      fileUrl: String, // S3 or storage URL
      uploadedAt: Date,
      verified: Boolean,
      verifiedAt: Date
    }
  ],

  // Verification status
  status: String, // 'not_started', 'submitted', 'under_review', 'approved', 'rejected', 'expired'
  submittedAt: Date,
  reviewedAt: Date,
  approvedAt: Date,
  rejectedAt: Date,
  expiresAt: Date,

  // Rejection details
  rejectionReason: String,
  rejectionDetails: [String],
  resubmissionAllowed: Boolean,

  // Risk assessment
  riskLevel: String, // 'low', 'medium', 'high'
  amlCheck: {
    passed: Boolean,
    checkedAt: Date,
    details: String
  },
  sanctionsCheck: {
    passed: Boolean,
    checkedAt: Date,
    matches: [String]
  },

  // Metadata
  ipAddress: String,
  userAgent: String,

  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.kyc.createIndex({ userId: 1 }, { unique: true })
db.kyc.createIndex({ status: 1 })
db.kyc.createIndex({ externalId: 1 }, { sparse: true })
db.kyc.createIndex({ expiresAt: 1 })
```

#### **PaymentTransactions Collection** (NEW)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  purchaseId: ObjectId (indexed),

  // Payment details
  type: String, // 'deposit', 'refund'
  method: String, // 'crypto', 'card', 'bank'
  provider: String, // 'stripe', 'coinbase', 'manual'

  // Amounts
  amountUSD: Number,
  amountCrypto: Number, // If crypto payment
  currency: String, // 'ETH', 'USDT', 'USD'

  exchangeRate: Number, // Crypto/USD rate at time of payment

  // Transaction tracking
  status: String, // 'pending', 'processing', 'completed', 'failed', 'refunded'

  // Blockchain (if crypto)
  blockchain: String,
  fromAddress: String,
  toAddress: String,
  transactionHash: String (indexed),
  blockNumber: Number,
  confirmations: Number,
  gasUsed: Number,
  gasFee: Number,

  // Card payment (if Stripe)
  stripePaymentIntentId: String (indexed),
  stripeChargeId: String,
  cardLast4: String,
  cardBrand: String,

  // Bank transfer (if wire)
  bankReference: String,
  bankConfirmedAt: Date,

  // Status updates
  statusHistory: [
    {
      status: String,
      timestamp: Date,
      note: String
    }
  ],

  // Error handling
  failureReason: String,
  failureCode: String,
  retryCount: Number,

  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

**Indexes:**
```javascript
db.paymentTransactions.createIndex({ userId: 1, createdAt: -1 })
db.paymentTransactions.createIndex({ purchaseId: 1 })
db.paymentTransactions.createIndex({ status: 1 })
db.paymentTransactions.createIndex({ transactionHash: 1 }, { sparse: true })
db.paymentTransactions.createIndex({ stripePaymentIntentId: 1 }, { sparse: true })
```

### 4.2 PostgreSQL Schema (Analytics - Optional)

For advanced analytics, we can use PostgreSQL to track detailed metrics:

```sql
-- User analytics
CREATE TABLE user_analytics (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(24) NOT NULL, -- MongoDB ObjectId
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX idx_user_analytics_event_type ON user_analytics(event_type);
CREATE INDEX idx_user_analytics_timestamp ON user_analytics(timestamp);

-- Referral analytics
CREATE TABLE referral_analytics (
  id SERIAL PRIMARY KEY,
  referrer_id VARCHAR(24) NOT NULL,
  referee_id VARCHAR(24),
  referral_code VARCHAR(20) NOT NULL,
  event VARCHAR(50) NOT NULL, -- 'click', 'register', 'purchase'
  conversion_value DECIMAL(18, 2),
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_referral_analytics_referrer ON referral_analytics(referrer_id);
CREATE INDEX idx_referral_analytics_code ON referral_analytics(referral_code);
```

---

## 5. Dashboard Features

### 5.1 Overview Page

**Purpose:** Central hub showing key metrics and recent activity

**Components:**

1. **Stats Cards Row:**
   - Total Invested (USD)
   - Total HYPE Tokens
   - Vesting Progress (%)
   - Referral Earnings

2. **Portfolio Value Chart:**
   - Line chart showing token value over time
   - Based on current token price
   - Toggle: 7D / 30D / All Time

3. **Vesting Overview:**
   - Progress bar: Claimed vs. Remaining
   - Next unlock: Date + Amount
   - Quick "Claim Now" button if available

4. **Recent Activity Feed:**
   - Latest 5 transactions
   - Referral signups
   - Vesting unlocks

5. **Referral Quick Stats:**
   - Total referrals
   - Active referrals (who purchased)
   - Copy referral link button

6. **Announcements Banner:**
   - Important updates from team
   - Next presale round info
   - Upcoming events

### 5.2 Buy Tokens Page

**Purpose:** Purchase interface with calculator and payment methods

**Components:**

1. **Presale Info Card:**
   - Current round
   - Token price
   - Bonus percentage
   - Time remaining (countdown)
   - Tokens sold / Total supply

2. **Token Calculator:**
   - Input: USD amount OR Token amount
   - Real-time calculation
   - Display:
     - Base tokens
     - Bonus tokens
     - Total tokens
     - Vesting schedule preview

3. **Bonus Tiers Table:**
   | Purchase Amount | Bonus |
   |-----------------|-------|
   | $500 - $4,999   | +15%  |
   | $5,000 - $19,999| +20%  |
   | $20,000 - $49,999| +25% |
   | $50,000+        | +30%  |

4. **Payment Method Selection:**
   - Crypto (ETH, USDT, BNB)
   - Credit/Debit Card
   - Bank Transfer

5. **Payment Flow UI:**
   - Crypto: QR code + address + timer
   - Card: Stripe Checkout embed
   - Bank: Wire instructions + reference

6. **Transaction Confirmation:**
   - Success screen
   - Transaction details
   - Share on social media
   - "Refer a friend" CTA

### 5.3 My Purchases Page

**Purpose:** Transaction history and purchase details

**Components:**

1. **Filters & Search:**
   - Date range picker
   - Payment method filter
   - Status filter
   - Search by transaction hash

2. **Purchases Table:**
   | Date | Amount | Tokens | Bonus | Payment | Status | Actions |
   |------|--------|--------|-------|---------|--------|---------|
   | Oct 15 | $10,000 | 666,666 | +20% | USDT | Completed | View |

3. **Purchase Detail Modal:**
   - Full transaction details
   - Vesting schedule for this purchase
   - Blockchain explorer link
   - Receipt download (PDF)

4. **Summary Cards:**
   - Total purchases
   - Average purchase size
   - Total bonus earned

### 5.4 Vesting Schedule Page

**Purpose:** Track token unlock schedule and claim tokens

**Components:**

1. **Overall Vesting Progress:**
   - Large progress bar
   - Claimed: X / Total: Y tokens
   - Percentage completed

2. **Vesting Timeline:**
   - Visual timeline showing:
     - TGE unlock (completed)
     - Monthly unlocks (future)
   - Each milestone shows:
     - Date
     - Amount
     - Status (claimed/pending/future)

3. **Next Unlock Card:**
   - Countdown timer
   - Token amount
   - "Set Reminder" button

4. **Claim Interface:**
   - List of claimable tokens
   - "Claim All" button
   - Gas fee estimate
   - Claim history

5. **Vesting Schedule Table:**
   | Unlock Date | Tokens | Status | Action |
   |-------------|--------|--------|--------|
   | Dec 1, 2025 | 100,000 | Available | Claim |
   | Jan 1, 2026 | 100,000 | Pending | - |

### 5.5 Referrals Page

**Purpose:** Referral link sharing and performance tracking

**Components:**

1. **Referral Link Card:**
   - Large, prominent display
   - Copy button
   - QR code
   - Share buttons: Twitter, Telegram, WhatsApp, Email

2. **Referral Stats Dashboard:**
   - Total referrals
   - Active referrals (converted)
   - Total earnings (HYPE)
   - Total volume referred (USD)
   - Conversion rate (%)

3. **Referral Tier System:**
   - Current tier badge (Bronze/Silver/Gold/Platinum)
   - Progress to next tier
   - Benefits at each tier:
     - Bronze: 5% commission
     - Silver (10 refs): 7% commission
     - Gold (50 refs): 10% commission + exclusive merch
     - Platinum (100 refs): 15% commission + private group

4. **Referral List Table:**
   | User | Joined | Purchased | Your Reward | Status |
   |------|--------|-----------|-------------|--------|
   | 0x123...abc | Oct 10 | $5,000 | 333 HYPE | Claimed |

5. **Referral Rewards:**
   - Total unclaimed rewards
   - "Claim Rewards" button
   - Reward history

6. **Marketing Materials:**
   - Pre-made social media graphics
   - Email template
   - Pitch deck PDF

### 5.6 Account Settings Page

**Purpose:** Manage profile, security, and preferences

**Sections:**

1. **Profile Information:**
   - Wallet address (read-only)
   - Email (editable)
   - Phone (editable)
   - Country
   - Profile picture (optional)

2. **KYC Status:**
   - Current status badge
   - If not verified: "Start KYC" button
   - If pending: Progress indicator
   - If rejected: Reason + "Resubmit" button
   - If approved: Expiry date

3. **Security:**
   - Connected wallet
   - "Disconnect" button
   - Session history
   - Two-factor authentication (optional)

4. **Notifications:**
   - Email preferences:
     - [ ] Purchase confirmations
     - [ ] Vesting unlocks
     - [ ] Referral activity
     - [ ] Marketing updates
   - SMS preferences (if phone provided)
   - Push notifications (browser)

5. **Preferences:**
   - Currency display (USD, EUR, etc.)
   - Theme (Light/Dark)
   - Language

6. **Danger Zone:**
   - Delete account (with warnings)
   - Data export (GDPR)

---

## 6. Referral System

### 6.1 Architecture

```
┌──────────────────────────────────────────────────────────┐
│              Referral System Architecture                │
└──────────────────────────────────────────────────────────┘

Flow:
1. User A registers → System generates unique code "HYPE-ABC123"
2. User A shares link: https://hypeai.io/private-sale?ref=HYPE-ABC123
3. User B clicks link → Cookie/localStorage stores referral code
4. User B registers → System links User B to User A
5. User B makes purchase → System calculates reward for User A
6. Reward issued to User A's vesting schedule
```

### 6.2 Referral Code Generation

**Format:** `HYPE-[6 ALPHANUMERIC]`

**Algorithm:**
```javascript
function generateReferralCode(userId) {
  const prefix = 'HYPE-';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix;

  // Generate 6 random characters
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Check uniqueness in database
  // If exists, recursively generate new code

  return code;
}

// Example outputs:
// HYPE-A7B2C9
// HYPE-XYZ123
// HYPE-9K4L8M
```

### 6.3 Referral Tracking

**Cookie/Storage:**
```javascript
// When user clicks referral link
const urlParams = new URLSearchParams(window.location.search);
const refCode = urlParams.get('ref');

if (refCode) {
  // Store in localStorage (persistent)
  localStorage.setItem('hypeai_referral', refCode);

  // Store in cookie (30 days expiry)
  document.cookie = `hypeai_ref=${refCode}; max-age=2592000; path=/; secure; samesite=strict`;

  // Track click event
  api.post('/api/referral/track-click', {
    code: refCode,
    source: document.referrer,
    timestamp: Date.now()
  });
}
```

**Registration Linking:**
```javascript
// When user completes wallet connection
async function linkReferral(userId) {
  const refCode = localStorage.getItem('hypeai_referral') ||
                  getCookie('hypeai_ref');

  if (refCode) {
    await api.post('/api/referral/link', {
      userId,
      referralCode: refCode
    });

    // Clear after linking
    localStorage.removeItem('hypeai_referral');
  }
}
```

### 6.4 Reward Calculation

**Commission Structure:**

| Tier | Referrals | Commission | Bonus Perks |
|------|-----------|------------|-------------|
| Bronze | 0-9 | 5% | - |
| Silver | 10-49 | 7% | Exclusive merch |
| Gold | 50-99 | 10% | Private Telegram group |
| Platinum | 100+ | 15% | Early access to features |

**Calculation Example:**
```javascript
// User B purchases $10,000 worth of tokens at $0.015
// Tokens received: 666,666 HYPE + 133,333 bonus (20%)
// Total: 800,000 HYPE

// User A (referrer) is Silver tier (7% commission)
// Referral reward: 800,000 * 0.07 = 56,000 HYPE

// Reward is added to User A's vesting schedule
// Same vesting terms as User B's purchase
```

**Implementation:**
```javascript
async function calculateReferralReward(purchase) {
  const referrer = await User.findById(purchase.referredBy);

  // Get referrer's tier
  const tier = getReferralTier(referrer.referral.totalReferrals);
  const commissionRate = tier.commissionRate; // e.g., 0.07 for Silver

  // Calculate reward
  const rewardTokens = purchase.totalTokens * commissionRate;

  // Create vesting schedule for reward
  const rewardVesting = await VestingSchedule.create({
    userId: referrer._id,
    totalTokens: rewardTokens,
    type: 'referral_reward',
    referralPurchaseId: purchase._id,
    // Same vesting terms as original purchase
    tgePercentage: purchase.tgePercentage,
    vestingMonths: purchase.vestingMonths
  });

  // Update referrer's stats
  referrer.referral.totalReferralRewards += rewardTokens;
  referrer.referral.totalReferralVolume += purchase.amountUSD;
  referrer.referral.activeReferrals += 1;
  await referrer.save();

  // Send notification
  await sendEmail(referrer.email, 'referral-reward', {
    tokens: rewardTokens,
    refereeWallet: purchase.userId.walletAddress
  });

  return rewardVesting;
}
```

### 6.5 Tier Progression

**Auto-upgrade logic:**
```javascript
function getReferralTier(totalReferrals) {
  if (totalReferrals >= 100) return { name: 'platinum', commissionRate: 0.15 };
  if (totalReferrals >= 50) return { name: 'gold', commissionRate: 0.10 };
  if (totalReferrals >= 10) return { name: 'silver', commissionRate: 0.07 };
  return { name: 'bronze', commissionRate: 0.05 };
}

// Update tier when new referral converts
async function updateReferrerTier(referrerId) {
  const referrer = await User.findById(referrerId);
  const oldTier = referrer.referral.tier;
  const newTier = getReferralTier(referrer.referral.activeReferrals);

  if (oldTier !== newTier.name) {
    referrer.referral.tier = newTier.name;
    referrer.referral.commissionRate = newTier.commissionRate;
    await referrer.save();

    // Send congratulations email
    await sendEmail(referrer.email, 'tier-upgrade', {
      newTier: newTier.name,
      newRate: newTier.commissionRate * 100
    });
  }
}
```

### 6.6 Anti-Gaming Measures

**Fraud Prevention:**

1. **Unique Wallet Validation:**
   - Prevent same wallet from being referred multiple times
   - Block if wallet is flagged as suspicious

2. **IP & Device Fingerprinting:**
   - Track registration IPs
   - Flag if many referrals from same IP
   - Require manual review if suspicious

3. **Minimum Purchase:**
   - Referral reward only issued if purchase ≥ $500

4. **Time Limits:**
   - Referral link valid for 30 days from first click
   - Conversion must happen within 30 days

5. **Manual Review:**
   - Purchases > $50,000 with referral require manual approval
   - High-volume referrers (>20 in 7 days) flagged for review

**Implementation:**
```javascript
async function validateReferral(refereeId, referrerId, purchaseAmount) {
  // 1. Check if wallet already referred
  const existingReferral = await Referral.findOne({ refereeId });
  if (existingReferral && existingReferral.referrerId !== referrerId) {
    throw new Error('Wallet already referred by another user');
  }

  // 2. Check minimum purchase
  if (purchaseAmount < 500) {
    return { valid: false, reason: 'Purchase below minimum' };
  }

  // 3. Check referral age
  const referralRecord = await Referral.findOne({ refereeId, referrerId });
  const daysSinceClick = (Date.now() - referralRecord.clickedAt) / (1000 * 60 * 60 * 24);
  if (daysSinceClick > 30) {
    return { valid: false, reason: 'Referral link expired' };
  }

  // 4. Check for suspicious activity
  const referrerStats = await getReferrerStats(referrerId);
  if (referrerStats.recentReferrals7d > 20) {
    return { valid: true, requiresReview: true };
  }

  // 5. Large purchase review
  if (purchaseAmount > 50000) {
    return { valid: true, requiresReview: true };
  }

  return { valid: true, requiresReview: false };
}
```

---

## 7. Smart Contract Integration

### 7.1 Smart Contract Architecture

**Required Contracts:**

1. **HYPE Token (ERC-20)** - Already exists
2. **Presale Contract** - NEW
3. **Vesting Contract** - NEW

```
┌───────────────────────────────────────────────────────┐
│            Smart Contract Architecture                │
└───────────────────────────────────────────────────────┘

┌─────────────────┐
│   HYPE Token    │
│    (ERC-20)     │
└────────┬────────┘
         │
         │ Transfer tokens to
         ▼
┌─────────────────┐       ┌──────────────────┐
│ Presale Contract│◄──────┤ Backend Service  │
│                 │       │  (Node.js)       │
│ • Accept ETH/USDT│      └──────────────────┘
│ • Calculate bonus│               ▲
│ • Issue tokens   │               │
└────────┬────────┘               │
         │                         │
         │ Lock tokens in          │
         ▼                         │
┌─────────────────┐               │
│Vesting Contract │               │
│                 │               │
│ • Store schedule│       Monitor events
│ • Unlock monthly│               │
│ • Allow claims  │───────────────┘
└─────────────────┘
```

### 7.2 Presale Smart Contract

**File:** `/Users/ai.place/Crypto/contracts/PresaleSolidity.sol`

**Key Functions:**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract HypePresale is Ownable, ReentrancyGuard {
    IERC20 public hypeToken;
    IERC20 public usdt;

    address public vestingContract;
    address public treasury;

    // Presale rounds
    struct Round {
        uint256 tokenPrice;       // Price in USD (18 decimals)
        uint256 bonusPercentage;  // e.g., 20 for 20%
        uint256 minPurchase;      // Min in USD
        uint256 maxPurchase;      // Max in USD
        uint256 hardCap;          // Total USD to raise
        uint256 totalRaised;      // Current raised
        bool active;
        uint256 startTime;
        uint256 endTime;
    }

    mapping(uint256 => Round) public rounds;
    uint256 public currentRound;

    // User purchases
    mapping(address => uint256) public userTotalInvested;

    // Bonus tiers
    struct BonusTier {
        uint256 minAmount;
        uint256 bonusPercentage;
    }
    BonusTier[] public bonusTiers;

    // Events
    event TokensPurchased(
        address indexed buyer,
        uint256 usdAmount,
        uint256 tokens,
        uint256 bonusTokens,
        uint256 round
    );
    event RoundStarted(uint256 indexed round, uint256 price, uint256 bonus);
    event RoundEnded(uint256 indexed round, uint256 totalRaised);

    constructor(
        address _hypeToken,
        address _usdt,
        address _treasury
    ) {
        hypeToken = IERC20(_hypeToken);
        usdt = IERC20(_usdt);
        treasury = _treasury;

        // Initialize bonus tiers
        bonusTiers.push(BonusTier(500e18, 15));      // $500+: 15%
        bonusTiers.push(BonusTier(5000e18, 20));     // $5k+: 20%
        bonusTiers.push(BonusTier(20000e18, 25));    // $20k+: 25%
        bonusTiers.push(BonusTier(50000e18, 30));    // $50k+: 30%
    }

    /**
     * @dev Purchase tokens with ETH
     */
    function buyWithETH() external payable nonReentrant {
        require(rounds[currentRound].active, "Round not active");

        // Get ETH/USD price from oracle (Chainlink)
        uint256 usdAmount = msg.value * getETHPrice() / 1e18;

        _processPurchase(msg.sender, usdAmount, currentRound);

        // Transfer ETH to treasury
        (bool success, ) = treasury.call{value: msg.value}("");
        require(success, "ETH transfer failed");
    }

    /**
     * @dev Purchase tokens with USDT
     */
    function buyWithUSDT(uint256 usdtAmount) external nonReentrant {
        require(rounds[currentRound].active, "Round not active");

        // Transfer USDT from user
        require(
            usdt.transferFrom(msg.sender, treasury, usdtAmount),
            "USDT transfer failed"
        );

        _processPurchase(msg.sender, usdtAmount, currentRound);
    }

    /**
     * @dev Internal function to process purchase
     */
    function _processPurchase(
        address buyer,
        uint256 usdAmount,
        uint256 round
    ) internal {
        Round storage r = rounds[round];

        require(usdAmount >= r.minPurchase, "Below min purchase");
        require(usdAmount <= r.maxPurchase, "Above max purchase");
        require(r.totalRaised + usdAmount <= r.hardCap, "Exceeds hard cap");

        // Calculate tokens
        uint256 baseTokens = (usdAmount * 1e18) / r.tokenPrice;

        // Calculate bonus
        uint256 purchaseBonusPercentage = r.bonusPercentage;
        uint256 tierBonusPercentage = _getTierBonus(usdAmount);
        uint256 totalBonusPercentage = purchaseBonusPercentage + tierBonusPercentage;

        uint256 bonusTokens = (baseTokens * totalBonusPercentage) / 100;
        uint256 totalTokens = baseTokens + bonusTokens;

        // Update state
        r.totalRaised += usdAmount;
        userTotalInvested[buyer] += usdAmount;

        // Transfer tokens to vesting contract
        require(
            hypeToken.transfer(vestingContract, totalTokens),
            "Token transfer failed"
        );

        // Call vesting contract to create schedule
        IVesting(vestingContract).createVestingSchedule(
            buyer,
            totalTokens,
            block.timestamp + 30 days, // TGE in 30 days
            6 * 30 days,                // 6 months vesting
            15                          // 15% TGE
        );

        emit TokensPurchased(buyer, usdAmount, baseTokens, bonusTokens, round);
    }

    /**
     * @dev Get bonus percentage based on purchase amount
     */
    function _getTierBonus(uint256 amount) internal view returns (uint256) {
        for (uint256 i = bonusTiers.length; i > 0; i--) {
            if (amount >= bonusTiers[i - 1].minAmount) {
                return bonusTiers[i - 1].bonusPercentage;
            }
        }
        return 0;
    }

    /**
     * @dev Get ETH price from Chainlink oracle
     */
    function getETHPrice() public view returns (uint256) {
        // Implement Chainlink price feed
        // For now, return mock price
        return 2000e18; // $2000 per ETH
    }

    // Owner functions
    function startRound(
        uint256 roundId,
        uint256 tokenPrice,
        uint256 bonusPercentage,
        uint256 minPurchase,
        uint256 maxPurchase,
        uint256 hardCap,
        uint256 duration
    ) external onlyOwner {
        rounds[roundId] = Round({
            tokenPrice: tokenPrice,
            bonusPercentage: bonusPercentage,
            minPurchase: minPurchase,
            maxPurchase: maxPurchase,
            hardCap: hardCap,
            totalRaised: 0,
            active: true,
            startTime: block.timestamp,
            endTime: block.timestamp + duration
        });
        currentRound = roundId;

        emit RoundStarted(roundId, tokenPrice, bonusPercentage);
    }

    function endRound(uint256 roundId) external onlyOwner {
        rounds[roundId].active = false;
        emit RoundEnded(roundId, rounds[roundId].totalRaised);
    }

    function setVestingContract(address _vesting) external onlyOwner {
        vestingContract = _vesting;
    }

    function withdrawTokens() external onlyOwner {
        uint256 balance = hypeToken.balanceOf(address(this));
        require(hypeToken.transfer(owner(), balance), "Withdraw failed");
    }
}

interface IVesting {
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 duration,
        uint256 tgePercentage
    ) external;
}
```

### 7.3 Vesting Smart Contract

**File:** `/Users/ai.place/Crypto/contracts/Vesting.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract HypeVesting is Ownable, ReentrancyGuard {
    IERC20 public hypeToken;

    struct VestingSchedule {
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 startTime;
        uint256 duration;
        uint256 tgePercentage;      // TGE release (0-100)
        uint256 tgeClaimedAt;
        bool revoked;
    }

    mapping(address => VestingSchedule[]) public vestingSchedules;
    mapping(address => uint256) public totalVested;
    mapping(address => uint256) public totalClaimed;

    address public presaleContract;

    event VestingScheduleCreated(
        address indexed beneficiary,
        uint256 indexed scheduleId,
        uint256 amount,
        uint256 startTime,
        uint256 duration
    );

    event TokensClaimed(
        address indexed beneficiary,
        uint256 indexed scheduleId,
        uint256 amount
    );

    event VestingRevoked(
        address indexed beneficiary,
        uint256 indexed scheduleId
    );

    constructor(address _hypeToken) {
        hypeToken = IERC20(_hypeToken);
    }

    modifier onlyPresaleOrOwner() {
        require(
            msg.sender == presaleContract || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    /**
     * @dev Create vesting schedule (called by presale contract)
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 duration,
        uint256 tgePercentage
    ) external onlyPresaleOrOwner {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be > 0");
        require(tgePercentage <= 100, "Invalid TGE percentage");

        vestingSchedules[beneficiary].push(VestingSchedule({
            totalAmount: amount,
            claimedAmount: 0,
            startTime: startTime,
            duration: duration,
            tgePercentage: tgePercentage,
            tgeClaimedAt: 0,
            revoked: false
        }));

        totalVested[beneficiary] += amount;

        uint256 scheduleId = vestingSchedules[beneficiary].length - 1;

        emit VestingScheduleCreated(
            beneficiary,
            scheduleId,
            amount,
            startTime,
            duration
        );
    }

    /**
     * @dev Calculate claimable amount for a schedule
     */
    function claimableAmount(address beneficiary, uint256 scheduleId)
        public
        view
        returns (uint256)
    {
        VestingSchedule storage schedule = vestingSchedules[beneficiary][scheduleId];

        if (schedule.revoked) return 0;
        if (block.timestamp < schedule.startTime) return 0;

        uint256 totalClaimable = 0;

        // TGE amount
        if (schedule.tgeClaimedAt == 0) {
            uint256 tgeAmount = (schedule.totalAmount * schedule.tgePercentage) / 100;
            totalClaimable += tgeAmount;
        }

        // Vested amount
        if (block.timestamp > schedule.startTime) {
            uint256 vestedPercentage = 100 - schedule.tgePercentage;
            uint256 timeElapsed = block.timestamp - schedule.startTime;
            uint256 vestedAmount;

            if (timeElapsed >= schedule.duration) {
                // Full vesting
                vestedAmount = (schedule.totalAmount * vestedPercentage) / 100;
            } else {
                // Partial vesting
                vestedAmount = (schedule.totalAmount * vestedPercentage * timeElapsed)
                              / (100 * schedule.duration);
            }

            totalClaimable += vestedAmount;
        }

        // Subtract already claimed
        totalClaimable = totalClaimable > schedule.claimedAmount
            ? totalClaimable - schedule.claimedAmount
            : 0;

        return totalClaimable;
    }

    /**
     * @dev Claim vested tokens
     */
    function claim(uint256 scheduleId) external nonReentrant {
        require(
            scheduleId < vestingSchedules[msg.sender].length,
            "Invalid schedule"
        );

        uint256 amount = claimableAmount(msg.sender, scheduleId);
        require(amount > 0, "Nothing to claim");

        VestingSchedule storage schedule = vestingSchedules[msg.sender][scheduleId];

        // Mark TGE as claimed if this is first claim
        if (schedule.tgeClaimedAt == 0) {
            schedule.tgeClaimedAt = block.timestamp;
        }

        schedule.claimedAmount += amount;
        totalClaimed[msg.sender] += amount;

        require(
            hypeToken.transfer(msg.sender, amount),
            "Token transfer failed"
        );

        emit TokensClaimed(msg.sender, scheduleId, amount);
    }

    /**
     * @dev Claim all claimable tokens across all schedules
     */
    function claimAll() external nonReentrant {
        uint256 totalAmount = 0;

        for (uint256 i = 0; i < vestingSchedules[msg.sender].length; i++) {
            uint256 amount = claimableAmount(msg.sender, i);
            if (amount > 0) {
                VestingSchedule storage schedule = vestingSchedules[msg.sender][i];

                if (schedule.tgeClaimedAt == 0) {
                    schedule.tgeClaimedAt = block.timestamp;
                }

                schedule.claimedAmount += amount;
                totalAmount += amount;

                emit TokensClaimed(msg.sender, i, amount);
            }
        }

        require(totalAmount > 0, "Nothing to claim");

        totalClaimed[msg.sender] += totalAmount;

        require(
            hypeToken.transfer(msg.sender, totalAmount),
            "Token transfer failed"
        );
    }

    /**
     * @dev Get all vesting schedules for a beneficiary
     */
    function getVestingSchedules(address beneficiary)
        external
        view
        returns (VestingSchedule[] memory)
    {
        return vestingSchedules[beneficiary];
    }

    /**
     * @dev Get number of vesting schedules
     */
    function getScheduleCount(address beneficiary) external view returns (uint256) {
        return vestingSchedules[beneficiary].length;
    }

    // Owner functions
    function setPresaleContract(address _presale) external onlyOwner {
        presaleContract = _presale;
    }

    function revokeVesting(address beneficiary, uint256 scheduleId)
        external
        onlyOwner
    {
        require(
            scheduleId < vestingSchedules[beneficiary].length,
            "Invalid schedule"
        );

        vestingSchedules[beneficiary][scheduleId].revoked = true;

        emit VestingRevoked(beneficiary, scheduleId);
    }

    function withdrawTokens() external onlyOwner {
        uint256 balance = hypeToken.balanceOf(address(this));
        require(hypeToken.transfer(owner(), balance), "Withdraw failed");
    }
}
```

### 7.4 Backend Integration

**File:** `/Users/ai.place/Crypto/src/backend/services/blockchain/presale-contract.js`

```javascript
const { ethers } = require('ethers');
const presaleABI = require('../../../contracts/abi/HypePresale.json');

class PresaleContractService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    this.contract = new ethers.Contract(
      process.env.PRESALE_CONTRACT_ADDRESS,
      presaleABI,
      this.provider
    );
  }

  /**
   * Listen for TokensPurchased events
   */
  async listenForPurchases() {
    this.contract.on('TokensPurchased', async (
      buyer,
      usdAmount,
      tokens,
      bonusTokens,
      round,
      event
    ) => {
      console.log('Purchase detected:', {
        buyer,
        usdAmount: ethers.formatUnits(usdAmount, 18),
        tokens: ethers.formatUnits(tokens, 18),
        bonusTokens: ethers.formatUnits(bonusTokens, 18),
        round: round.toString(),
        txHash: event.transactionHash
      });

      // Update database
      await this.updatePurchaseInDB({
        walletAddress: buyer.toLowerCase(),
        usdAmount: parseFloat(ethers.formatUnits(usdAmount, 18)),
        tokens: parseFloat(ethers.formatUnits(tokens, 18)),
        bonusTokens: parseFloat(ethers.formatUnits(bonusTokens, 18)),
        round: parseInt(round.toString()),
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    });
  }

  /**
   * Get current round info
   */
  async getCurrentRound() {
    const roundId = await this.contract.currentRound();
    const round = await this.contract.rounds(roundId);

    return {
      id: parseInt(roundId.toString()),
      tokenPrice: ethers.formatUnits(round.tokenPrice, 18),
      bonusPercentage: parseInt(round.bonusPercentage.toString()),
      minPurchase: ethers.formatUnits(round.minPurchase, 18),
      maxPurchase: ethers.formatUnits(round.maxPurchase, 18),
      hardCap: ethers.formatUnits(round.hardCap, 18),
      totalRaised: ethers.formatUnits(round.totalRaised, 18),
      active: round.active,
      startTime: new Date(parseInt(round.startTime.toString()) * 1000),
      endTime: new Date(parseInt(round.endTime.toString()) * 1000)
    };
  }

  /**
   * Check if user can purchase
   */
  async canPurchase(walletAddress, usdAmount) {
    const round = await this.getCurrentRound();

    if (!round.active) {
      return { canPurchase: false, reason: 'Round not active' };
    }

    if (usdAmount < parseFloat(round.minPurchase)) {
      return { canPurchase: false, reason: 'Below minimum purchase' };
    }

    if (usdAmount > parseFloat(round.maxPurchase)) {
      return { canPurchase: false, reason: 'Above maximum purchase' };
    }

    const remainingCap = parseFloat(round.hardCap) - parseFloat(round.totalRaised);
    if (usdAmount > remainingCap) {
      return { canPurchase: false, reason: 'Exceeds remaining hard cap' };
    }

    return { canPurchase: true };
  }

  async updatePurchaseInDB(purchaseData) {
    // Implementation to update MongoDB
    // This will be implemented in the purchase service
  }
}

module.exports = new PresaleContractService();
```

---

## 8. API Endpoints

### 8.1 Authentication Endpoints

**Base URL:** `/api/v1/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/connect-wallet` | Initiate wallet connection | No |
| POST | `/verify-signature` | Verify signed message | No |
| POST | `/refresh-token` | Refresh JWT token | Yes |
| POST | `/logout` | Logout user | Yes |
| GET | `/me` | Get current user info | Yes |

**Example: POST /api/v1/auth/connect-wallet**

Request:
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "nonce": "Please sign this message to authenticate: 8a7f9c2e",
    "message": "Sign this message to prove you own this wallet.\n\nNonce: 8a7f9c2e\nTimestamp: 2025-10-18T12:00:00Z"
  }
}
```

**Example: POST /api/v1/auth/verify-signature**

Request:
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "signature": "0x8f3c7b9a...",
  "message": "Sign this message to prove..."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6723abc123def456",
      "walletAddress": "0x742d35cc...",
      "referralCode": "HYPE-A7B2C9",
      "isNewUser": true
    }
  }
}
```

### 8.2 Presale Endpoints

**Base URL:** `/api/v1/presale`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/current-round` | Get current presale round info | No |
| GET | `/stats` | Get overall presale statistics | No |
| GET | `/bonus-tiers` | Get bonus tier structure | No |
| POST | `/calculate` | Calculate purchase details | No |
| POST | `/purchase/initiate` | Initiate purchase | Yes |
| GET | `/purchase/:id` | Get purchase status | Yes |
| POST | `/purchase/:id/confirm` | Confirm crypto payment | Yes |

**Example: GET /api/v1/presale/current-round**

Response:
```json
{
  "success": true,
  "data": {
    "round": 1,
    "phase": "private-sale",
    "tokenPrice": 0.015,
    "bonusPercentage": 20,
    "minPurchase": 500,
    "maxPurchase": 100000,
    "hardCap": 5000000,
    "totalRaised": 2847562.30,
    "percentageRaised": 56.95,
    "active": true,
    "startTime": "2025-10-01T00:00:00Z",
    "endTime": "2025-11-30T23:59:59Z",
    "timeRemaining": {
      "days": 43,
      "hours": 11,
      "minutes": 45
    }
  }
}
```

**Example: POST /api/v1/presale/calculate**

Request:
```json
{
  "usdAmount": 10000
}
```

Response:
```json
{
  "success": true,
  "data": {
    "usdAmount": 10000,
    "tokenPrice": 0.015,
    "baseTokens": 666666.67,
    "roundBonus": {
      "percentage": 20,
      "tokens": 133333.33
    },
    "tierBonus": {
      "percentage": 20,
      "tokens": 133333.33,
      "tier": "$5,000 - $19,999"
    },
    "totalBonus": {
      "percentage": 40,
      "tokens": 266666.67
    },
    "totalTokens": 933333.33,
    "vesting": {
      "tgePercentage": 15,
      "tgeTokens": 140000,
      "tgeDate": "2025-12-01T00:00:00Z",
      "monthlyUnlock": 132222.22,
      "vestingMonths": 6,
      "unlockSchedule": [
        {"month": 0, "date": "2025-12-01", "tokens": 140000, "type": "TGE"},
        {"month": 1, "date": "2026-01-01", "tokens": 132222.22, "type": "Monthly"},
        {"month": 2, "date": "2026-02-01", "tokens": 132222.22, "type": "Monthly"},
        {"month": 3, "date": "2026-03-01", "tokens": 132222.22, "type": "Monthly"},
        {"month": 4, "date": "2026-04-01", "tokens": 132222.22, "type": "Monthly"},
        {"month": 5, "date": "2026-05-01", "tokens": 132222.22, "type": "Monthly"},
        {"month": 6, "date": "2026-06-01", "tokens": 132222.23, "type": "Monthly"}
      ]
    }
  }
}
```

**Example: POST /api/v1/presale/purchase/initiate**

Request:
```json
{
  "usdAmount": 10000,
  "paymentMethod": "usdt",
  "blockchain": "ethereum",
  "referralCode": "HYPE-XYZ123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "purchaseId": "67abc123def456789",
    "status": "pending",
    "paymentDetails": {
      "method": "usdt",
      "currency": "USDT",
      "amount": 10000,
      "depositAddress": "0x9f8A7B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A",
      "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
      "expiresAt": "2025-10-18T13:00:00Z"
    },
    "tokenDetails": {
      "baseTokens": 666666.67,
      "bonusTokens": 266666.67,
      "totalTokens": 933333.33
    },
    "instructions": [
      "Send exactly 10,000 USDT to the address above",
      "Do not send from an exchange",
      "Your tokens will be allocated within 30 minutes after 12 confirmations"
    ]
  }
}
```

### 8.3 Dashboard Endpoints

**Base URL:** `/api/v1/dashboard`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/overview` | Get dashboard overview | Yes |
| GET | `/purchases` | Get purchase history | Yes |
| GET | `/vesting` | Get vesting schedules | Yes |
| POST | `/vesting/claim` | Claim vested tokens | Yes |

**Example: GET /api/v1/dashboard/overview**

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "walletAddress": "0x742d35cc...",
      "kycStatus": "approved",
      "memberSince": "2025-10-01T12:30:00Z"
    },
    "investment": {
      "totalInvestedUSD": 10000,
      "totalTokensPurchased": 933333.33,
      "totalBonusTokens": 266666.67,
      "purchaseCount": 1,
      "averagePurchaseSize": 10000
    },
    "vesting": {
      "totalVested": 933333.33,
      "totalClaimed": 0,
      "totalRemaining": 933333.33,
      "nextUnlock": {
        "date": "2025-12-01T00:00:00Z",
        "amount": 140000,
        "daysUntil": 44
      },
      "progressPercentage": 0
    },
    "portfolio": {
      "currentValueUSD": 15000,
      "profit": 5000,
      "profitPercentage": 50,
      "tokenPrice": 0.0225
    },
    "referral": {
      "code": "HYPE-A7B2C9",
      "totalReferrals": 3,
      "activeReferrals": 2,
      "totalEarnedTokens": 56000,
      "totalReferralVolumeUSD": 15000,
      "tier": "bronze",
      "commissionRate": 5
    },
    "recentActivity": [
      {
        "type": "purchase",
        "description": "Purchased 933,333.33 HYPE",
        "amount": "$10,000",
        "timestamp": "2025-10-18T10:30:00Z",
        "status": "completed"
      }
    ]
  }
}
```

### 8.4 Referral Endpoints

**Base URL:** `/api/v1/referral`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/my-code` | Get user's referral code | Yes |
| GET | `/stats` | Get referral statistics | Yes |
| GET | `/list` | Get list of referrals | Yes |
| POST | `/track-click` | Track referral link click | No |
| POST | `/link` | Link user to referrer | Yes |

**Example: GET /api/v1/referral/stats**

Response:
```json
{
  "success": true,
  "data": {
    "code": "HYPE-A7B2C9",
    "link": "https://hypeai.io/private-sale?ref=HYPE-A7B2C9",
    "qrCode": "data:image/png;base64...",
    "stats": {
      "totalClicks": 47,
      "totalReferrals": 3,
      "activeReferrals": 2,
      "conversionRate": 4.26,
      "totalEarnedTokens": 56000,
      "unclaimedTokens": 28000,
      "totalReferralVolumeUSD": 15000
    },
    "tier": {
      "current": "bronze",
      "commissionRate": 5,
      "nextTier": "silver",
      "referralsToNextTier": 7,
      "progressPercentage": 30
    },
    "earnings": {
      "thisMonth": 28000,
      "lastMonth": 28000,
      "allTime": 56000
    }
  }
}
```

**Example: GET /api/v1/referral/list**

Response:
```json
{
  "success": true,
  "data": {
    "total": 3,
    "active": 2,
    "referrals": [
      {
        "id": "ref_001",
        "walletAddress": "0x1234...5678",
        "joinedAt": "2025-10-10T14:22:00Z",
        "converted": true,
        "firstPurchaseDate": "2025-10-11T09:15:00Z",
        "firstPurchaseAmount": 5000,
        "totalPurchases": 1,
        "yourReward": 16666.67,
        "rewardStatus": "claimed"
      },
      {
        "id": "ref_002",
        "walletAddress": "0xabcd...ef12",
        "joinedAt": "2025-10-15T11:45:00Z",
        "converted": true,
        "firstPurchaseDate": "2025-10-16T16:30:00Z",
        "firstPurchaseAmount": 10000,
        "totalPurchases": 1,
        "yourReward": 39333.33,
        "rewardStatus": "pending"
      },
      {
        "id": "ref_003",
        "walletAddress": "0x9876...4321",
        "joinedAt": "2025-10-17T08:12:00Z",
        "converted": false,
        "firstPurchaseDate": null,
        "firstPurchaseAmount": 0,
        "totalPurchases": 0,
        "yourReward": 0,
        "rewardStatus": "n/a"
      }
    ]
  }
}
```

### 8.5 KYC Endpoints

**Base URL:** `/api/v1/kyc`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/status` | Get KYC status | Yes |
| POST | `/submit` | Submit KYC application | Yes |
| POST | `/upload-document` | Upload KYC document | Yes |
| GET | `/requirements` | Get KYC requirements | No |

**Example: GET /api/v1/kyc/status**

Response:
```json
{
  "success": true,
  "data": {
    "status": "approved",
    "submittedAt": "2025-10-05T14:30:00Z",
    "reviewedAt": "2025-10-05T15:45:00Z",
    "approvedAt": "2025-10-05T15:45:00Z",
    "expiresAt": "2026-10-05T15:45:00Z",
    "documents": [
      {
        "type": "passport",
        "status": "verified",
        "uploadedAt": "2025-10-05T14:30:00Z"
      },
      {
        "type": "proof_of_address",
        "status": "verified",
        "uploadedAt": "2025-10-05T14:32:00Z"
      }
    ],
    "maxPurchaseLimit": null
  }
}
```

### 8.6 Payment Endpoints

**Base URL:** `/api/v1/payment`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/card/checkout` | Create Stripe checkout session | Yes |
| POST | `/card/webhook` | Stripe webhook handler | No |
| GET | `/crypto/status/:txHash` | Check crypto transaction status | Yes |
| POST | `/bank/initiate` | Initiate bank transfer | Yes |

---

## 9. Security Considerations

### 9.1 Authentication & Authorization

**Wallet Signature Authentication:**

1. **Nonce-based Challenge-Response:**
   - Generate unique nonce for each connection attempt
   - User signs message containing nonce
   - Backend verifies signature
   - Nonce is invalidated after use

2. **JWT Tokens:**
   - Access token: 15 minutes expiry
   - Refresh token: 7 days expiry
   - Store refresh tokens in httpOnly cookies
   - Implement token rotation

3. **Session Management:**
   - Track active sessions per user
   - Allow manual session termination
   - Auto-logout after 30 minutes inactivity

**Implementation:**
```javascript
// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is blacklisted (logout)
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token invalidated' });
    }

    // Attach user to request
    req.userId = decoded.userId;
    req.walletAddress = decoded.walletAddress;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
```

### 9.2 Smart Contract Security

**Key Security Measures:**

1. **Reentrancy Protection:**
   - Use OpenZeppelin's ReentrancyGuard
   - Checks-Effects-Interactions pattern

2. **Access Control:**
   - Owner-only functions for critical operations
   - Multi-sig wallet for contract ownership

3. **Input Validation:**
   - Validate all inputs (amounts, addresses)
   - Check for zero addresses
   - Ensure sufficient balances

4. **Rate Limiting:**
   - Prevent spam purchases
   - Minimum time between purchases per wallet

5. **Pausable:**
   - Emergency pause functionality
   - Only owner can pause/unpause

6. **Audits:**
   - CertiK audit before mainnet
   - Bug bounty program
   - Regular security reviews

### 9.3 Payment Security

**Card Payments (Stripe):**

1. **PCI Compliance:**
   - Use Stripe Checkout (PCI compliant)
   - Never handle card data directly
   - Stripe handles all sensitive data

2. **Webhook Verification:**
   - Verify webhook signatures
   - Idempotency for duplicate events
   - Log all webhook events

**Crypto Payments:**

1. **Unique Deposit Addresses:**
   - Generate unique address per purchase
   - Monitor for 12 confirmations (ETH)
   - Detect and handle overpayments

2. **Price Oracle:**
   - Use Chainlink price feeds
   - Fallback to multiple sources
   - Update prices every 5 minutes

3. **Transaction Monitoring:**
   - Real-time blockchain monitoring
   - Detect and flag suspicious transactions
   - Manual review for large amounts

### 9.4 KYC & AML

**KYC Provider Integration (Sumsub):**

1. **Data Protection:**
   - Encrypt all KYC data at rest
   - Store documents in secure S3 bucket
   - Access logs for compliance

2. **AML Screening:**
   - Check against sanctions lists
   - PEP (Politically Exposed Persons) screening
   - Ongoing monitoring

3. **Risk-Based Approach:**
   - Low risk: $0 - $10k (no KYC)
   - Medium risk: $10k - $50k (basic KYC)
   - High risk: $50k+ (enhanced KYC + AML)

4. **Data Retention:**
   - Keep KYC data for 5 years (regulatory requirement)
   - Right to be forgotten (GDPR)
   - Data deletion after retention period

### 9.5 API Security

**Rate Limiting:**

```javascript
// Rate limits per endpoint
const rateLimits = {
  '/api/v1/auth/connect-wallet': { max: 5, window: 60000 }, // 5 per minute
  '/api/v1/presale/purchase': { max: 3, window: 3600000 },  // 3 per hour
  '/api/v1/referral/track-click': { max: 100, window: 60000 } // 100 per minute
};
```

**Input Validation:**

```javascript
// Using Joi for validation
const purchaseSchema = Joi.object({
  usdAmount: Joi.number().min(500).max(100000).required(),
  paymentMethod: Joi.string().valid('eth', 'usdt', 'bnb', 'card').required(),
  blockchain: Joi.string().valid('ethereum', 'bsc').optional(),
  referralCode: Joi.string().pattern(/^HYPE-[A-Z0-9]{6}$/).optional()
});
```

**CORS Configuration:**

```javascript
const corsOptions = {
  origin: [
    'https://hypeai.io',
    'https://www.hypeai.io',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 9.6 Data Privacy (GDPR)

**User Data:**

1. **Consent:**
   - Clear consent for data collection
   - Opt-in for marketing communications
   - Cookie consent banner

2. **Data Access:**
   - Users can download their data
   - View all stored information
   - Data portability

3. **Right to Deletion:**
   - Account deletion option
   - 30-day grace period
   - Anonymize data (keep transaction records for compliance)

4. **Data Minimization:**
   - Only collect necessary data
   - Optional fields for non-essential info
   - Regular data cleanup

---

## 10. Technology Stack

### 10.1 Frontend

**Framework:** Next.js 14 (React 18)

**Reasons:**
- Server-side rendering for SEO
- API routes for backend integration
- File-based routing
- Built-in optimization
- TypeScript support

**UI Library:** Tailwind CSS + Headless UI

**Web3 Integration:**
- ethers.js v6 (smart contract interaction)
- RainbowKit (wallet connection)
- wagmi (React hooks for Ethereum)

**State Management:**
- React Query (server state)
- Zustand (client state)

**Charts:** Recharts

**Forms:** React Hook Form + Zod validation

**Dependencies:**
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.4.0",

    "@rainbow-me/rainbowkit": "^2.0.0",
    "wagmi": "^2.5.0",
    "viem": "^2.7.0",
    "ethers": "^6.11.0",

    "@tanstack/react-query": "^5.28.0",
    "zustand": "^4.5.0",

    "tailwindcss": "^3.4.0",
    "@headlessui/react": "^1.7.0",
    "lucide-react": "^0.356.0",

    "recharts": "^2.12.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.22.0",

    "axios": "^1.6.0",
    "date-fns": "^3.4.0",
    "react-hot-toast": "^2.4.0",
    "qrcode": "^1.5.0"
  }
}
```

### 10.2 Backend

**Framework:** Node.js + Express.js

**Reasons:**
- JavaScript full-stack
- Large ecosystem
- Good Web3 libraries
- Easy deployment

**Database:** MongoDB (primary) + Redis (cache)

**Blockchain Interaction:** ethers.js

**Payment Processing:**
- Stripe (card payments)
- Web3 (crypto monitoring)

**KYC Integration:** Sumsub SDK

**Authentication:** JWT (jsonwebtoken)

**Email/SMS:**
- SendGrid (email)
- Twilio (SMS)

**File Storage:** AWS S3

**Dependencies:**
```json
{
  "dependencies": {
    "express": "^4.21.0",
    "mongoose": "^8.19.0",
    "redis": "^4.7.0",
    "ethers": "^6.11.0",

    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",

    "stripe": "^14.17.0",
    "@sumsub/websdk": "^2.0.0",

    "@sendgrid/mail": "^8.1.0",
    "twilio": "^4.19.0",

    "aws-sdk": "^2.1554.0",

    "joi": "^17.13.0",
    "express-validator": "^7.0.0",
    "express-rate-limit": "^7.5.0",
    "helmet": "^7.2.0",
    "cors": "^2.8.5",
    "compression": "^1.7.4",

    "winston": "^3.18.0",
    "morgan": "^1.10.0",

    "dotenv": "^16.3.0",
    "node-cron": "^3.0.0"
  }
}
```

### 10.3 Smart Contracts

**Language:** Solidity ^0.8.20

**Framework:** Hardhat

**Libraries:** OpenZeppelin Contracts

**Testing:** Hardhat + Chai

**Deployment:** Hardhat Deploy

**Networks:**
- Mainnet: Ethereum
- Testnet: Sepolia
- Mainnet: BSC
- Testnet: BSC Testnet

**Dependencies:**
```json
{
  "devDependencies": {
    "hardhat": "^2.17.0",
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "@nomicfoundation/hardhat-ethers": "^3.0.0",
    "@nomicfoundation/hardhat-chai-matchers": "^2.0.0",
    "hardhat-gas-reporter": "^1.0.9",
    "solidity-coverage": "^0.8.4",
    "hardhat-deploy": "^0.11.45"
  },
  "dependencies": {
    "@openzeppelin/contracts": "^5.0.0",
    "@chainlink/contracts": "^0.8.0",
    "ethers": "^6.7.0"
  }
}
```

### 10.4 DevOps & Infrastructure

**Hosting:**
- Frontend: Vercel
- Backend: AWS EC2 / DigitalOcean
- Database: MongoDB Atlas
- Cache: Redis Cloud

**CI/CD:** GitHub Actions

**Monitoring:**
- Sentry (error tracking)
- DataDog (performance monitoring)
- Grafana + Prometheus (metrics)

**CDN:** Cloudflare

**SSL:** Let's Encrypt

**Backup:**
- MongoDB: Daily automated backups
- Code: Git + GitHub

---

## 11. Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)

**Smart Contracts:**
- [x] Design presale contract architecture
- [ ] Implement HypePresale contract
- [ ] Implement HypeVesting contract
- [ ] Write comprehensive tests
- [ ] Security audit (internal)
- [ ] Deploy to testnet

**Backend - Core:**
- [ ] Extend User model for presale
- [ ] Create Purchase model
- [ ] Create VestingSchedule model
- [ ] Implement authentication endpoints
- [ ] Implement presale endpoints (basic)
- [ ] Setup MongoDB indexes

**Frontend - Basic:**
- [ ] Create dashboard layout
- [ ] Wallet connection modal
- [ ] Basic overview page
- [ ] Token calculator component

**Timeline:** 10 business days

---

### Phase 2: Purchase Flow (Weeks 3-4)

**Smart Contracts:**
- [ ] Integrate Chainlink price feeds
- [ ] Add multi-currency support (ETH, USDT, BNB)
- [ ] Test on testnet extensively
- [ ] Gas optimization
- [ ] External audit (CertiK/OpenZeppelin)

**Backend:**
- [ ] Blockchain monitoring service
- [ ] Payment processing (crypto)
- [ ] Stripe integration (cards)
- [ ] Transaction confirmation logic
- [ ] Vesting schedule creation
- [ ] Email notifications

**Frontend:**
- [ ] Buy tokens page (full UI)
- [ ] Payment method selection
- [ ] Crypto payment interface (QR codes)
- [ ] Card payment (Stripe)
- [ ] Purchase confirmation screens
- [ ] Real-time status updates (WebSocket)

**Timeline:** 10 business days

---

### Phase 3: Dashboard & Vesting (Weeks 5-6)

**Backend:**
- [ ] Dashboard data aggregation
- [ ] Vesting calculations
- [ ] Claim token endpoint
- [ ] Smart contract claim integration
- [ ] Purchase history API
- [ ] Analytics tracking

**Frontend:**
- [ ] Complete overview page
- [ ] My purchases page
- [ ] Vesting schedule page
- [ ] Claim tokens interface
- [ ] Portfolio charts
- [ ] Activity feed

**Timeline:** 10 business days

---

### Phase 4: Referral System (Weeks 7-8)

**Backend:**
- [ ] Referral model + logic
- [ ] Referral code generation
- [ ] Referral tracking (clicks, conversions)
- [ ] Reward calculation
- [ ] Tier progression logic
- [ ] Referral analytics

**Frontend:**
- [ ] Referrals page
- [ ] Referral link sharing
- [ ] QR code generation
- [ ] Referral stats dashboard
- [ ] Referral list table
- [ ] Social sharing buttons

**Timeline:** 10 business days

---

### Phase 5: KYC Integration (Weeks 9-10)

**Backend:**
- [ ] KYC model
- [ ] Sumsub integration
- [ ] Document upload to S3
- [ ] KYC status checking
- [ ] Webhook handling
- [ ] AML screening

**Frontend:**
- [ ] KYC flow UI
- [ ] Personal info form
- [ ] Document upload
- [ ] Selfie capture
- [ ] Status tracking
- [ ] Resubmission flow

**Timeline:** 10 business days

---

### Phase 6: Testing & Security (Weeks 11-12)

**Testing:**
- [ ] Unit tests (backend)
- [ ] Integration tests
- [ ] E2E tests (frontend)
- [ ] Smart contract tests
- [ ] Load testing
- [ ] Security testing

**Security:**
- [ ] Smart contract audit (external)
- [ ] Penetration testing
- [ ] Bug bounty program setup
- [ ] Security documentation

**Timeline:** 10 business days

---

### Phase 7: Deployment & Launch (Weeks 13-14)

**Smart Contracts:**
- [ ] Deploy to Ethereum mainnet
- [ ] Deploy to BSC mainnet
- [ ] Verify on Etherscan/BscScan
- [ ] Transfer ownership to multi-sig
- [ ] Fund contracts with tokens

**Backend:**
- [ ] Production environment setup
- [ ] Database migration
- [ ] SSL configuration
- [ ] Monitoring setup
- [ ] Backup configuration

**Frontend:**
- [ ] Production build
- [ ] Deploy to Vercel
- [ ] CDN configuration
- [ ] Analytics setup

**Launch:**
- [ ] Soft launch (limited users)
- [ ] Monitor for issues
- [ ] Public announcement
- [ ] Marketing campaign

**Timeline:** 10 business days

---

### Total Timeline: 14 Weeks (3.5 Months)

**Critical Path:**
1. Smart contracts (security is paramount)
2. Backend infrastructure
3. Purchase flow
4. Dashboard
5. Referrals
6. KYC

**Parallel Work:**
- Frontend and backend can be developed in parallel
- Smart contracts can be developed alongside backend
- Testing should be continuous throughout

---

## 12. Success Metrics

### 12.1 Technical Metrics

- **Uptime:** 99.9%
- **API Response Time:** < 200ms (p95)
- **Smart Contract Gas Efficiency:** < 150k gas per purchase
- **Page Load Time:** < 2s (LCP)
- **Error Rate:** < 0.1%

### 12.2 Business Metrics

- **Presale Target:** $5M raised
- **User Acquisition:** 10,000 registered users
- **Conversion Rate:** 20% (registered → purchased)
- **Average Purchase:** $5,000
- **Referral Conversion:** 15%

### 12.3 User Experience Metrics

- **Wallet Connection Success Rate:** > 95%
- **Purchase Completion Rate:** > 90%
- **KYC Approval Rate:** > 85%
- **User Satisfaction:** > 4.5/5

---

## 13. Risk Mitigation

### 13.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Smart contract bug | Low | Critical | Extensive testing + audits |
| DDoS attack | Medium | High | Cloudflare protection |
| Database failure | Low | High | Automated backups + replication |
| Payment provider downtime | Medium | Medium | Multiple payment methods |
| Blockchain congestion | High | Medium | Multi-chain support |

### 13.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Regulatory changes | Medium | High | Legal compliance team |
| Low presale participation | Medium | High | Marketing campaign |
| Fraud/abuse | Medium | Medium | KYC + anti-fraud measures |
| Token price volatility | High | Medium | Fixed USD pricing |
| Competitor launch | Medium | Low | Unique value proposition |

---

## 14. Appendices

### Appendix A: File Structure

```
/Users/ai.place/Crypto/
├── contracts/
│   ├── Token.sol (existing)
│   ├── Staking.sol (existing)
│   ├── PresaleSolidity.sol (NEW)
│   ├── Vesting.sol (NEW)
│   └── interfaces/
│       ├── IPresale.sol
│       └── IVesting.sol
│
├── src/
│   ├── frontend/ (Next.js)
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── buy.tsx
│   │   │   │   ├── purchases.tsx
│   │   │   │   ├── vesting.tsx
│   │   │   │   ├── referrals.tsx
│   │   │   │   └── settings.tsx
│   │   │   └── private-sale/
│   │   │       ├── index.tsx
│   │   │       └── join.tsx
│   │   ├── components/ (detailed earlier)
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   │
│   └── backend/ (Node.js/Express)
│       ├── routes/
│       │   ├── presale.routes.js
│       │   ├── referral.routes.js
│       │   ├── kyc.routes.js
│       │   ├── payment.routes.js
│       │   └── vesting.routes.js
│       ├── controllers/
│       ├── services/
│       │   ├── presale.service.js
│       │   ├── referral.service.js
│       │   ├── kyc.service.js
│       │   ├── payment/
│       │   │   ├── stripe.service.js
│       │   │   └── crypto.service.js
│       │   └── blockchain/
│       │       ├── presale-contract.js
│       │       └── vesting-contract.js
│       ├── models/
│       │   ├── Purchase.js
│       │   ├── VestingSchedule.js
│       │   ├── Referral.js
│       │   ├── KYC.js
│       │   └── PaymentTransaction.js
│       └── middleware/
│           ├── auth.middleware.js
│           └── kyc.middleware.js
│
├── docs/
│   └── architecture/
│       ├── private-sale-system-architecture.md (this document)
│       ├── api-documentation.md (to be created)
│       └── smart-contract-documentation.md (to be created)
│
├── tests/
│   ├── contracts/
│   │   ├── Presale.test.js
│   │   └── Vesting.test.js
│   ├── backend/
│   │   ├── integration/
│   │   └── unit/
│   └── frontend/
│       └── e2e/
│
└── scripts/
    ├── deploy-presale.js
    └── deploy-vesting.js
```

### Appendix B: Environment Variables

```bash
# Backend (.env)
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...

# JWT
JWT_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Blockchain
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/...
BSC_RPC_URL=https://bsc-dataseed.binance.org/
PRIVATE_KEY=...

# Smart Contracts
PRESALE_CONTRACT_ADDRESS=0x...
VESTING_CONTRACT_ADDRESS=0x...
TOKEN_CONTRACT_ADDRESS=0x...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Sumsub (KYC)
SUMSUB_APP_TOKEN=...
SUMSUB_SECRET_KEY=...

# Email & SMS
SENDGRID_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=hypeai-kyc-documents

# Frontend URL
FRONTEND_URL=https://hypeai.io
```

### Appendix C: Glossary

- **TGE:** Token Generation Event - Initial token unlock at launch
- **KYC:** Know Your Customer - Identity verification
- **AML:** Anti-Money Laundering - Financial crime prevention
- **Vesting:** Gradual token unlock over time
- **Presale Round:** Phase of token sale with specific pricing
- **Referral Tier:** Level in referral program (Bronze/Silver/Gold/Platinum)
- **Gas Fee:** Blockchain transaction cost
- **Smart Contract:** Self-executing code on blockchain
- **Nonce:** Number used once for security
- **JWT:** JSON Web Token for authentication

---

## Document Changelog

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-10-18 | Initial architecture document | OMEGA |

---

**END OF DOCUMENT**

Total Pages: 50+
Total Words: ~15,000
Diagrams: 8
Code Examples: 15+
API Endpoints: 30+
