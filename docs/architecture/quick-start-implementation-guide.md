# HypeAI Private Sale System - Quick Start Implementation Guide

## Overview

This guide provides a condensed roadmap for implementing the Private Sale system based on the comprehensive architecture document.

---

## What We're Building

**User clicks "Join Private Sale" → Complete purchase flow → Personal dashboard with referrals**

Key features:
- Wallet authentication
- Multi-payment support (ETH, USDT, Credit Card)
- Personal dashboard
- Integrated referral system
- Vesting schedule management
- KYC integration (optional based on amount)

---

## Implementation Priority Order

### Phase 1: Foundation (Weeks 1-2)
**CRITICAL PATH**

1. **Smart Contracts** (Priority: CRITICAL)
   ```bash
   # Create new contracts
   /contracts/PresaleSolidity.sol
   /contracts/Vesting.sol

   # Key functions needed:
   - buyWithETH()
   - buyWithUSDT()
   - createVestingSchedule()
   - claim()
   ```

2. **Backend Models** (Priority: HIGH)
   ```bash
   # Extend existing User model
   /src/backend/models/User.js

   # Create new models
   /src/backend/models/Purchase.js
   /src/backend/models/VestingSchedule.js
   /src/backend/models/Referral.js
   ```

3. **Basic Authentication** (Priority: HIGH)
   ```bash
   # Endpoints needed:
   POST /api/v1/auth/connect-wallet
   POST /api/v1/auth/verify-signature
   GET  /api/v1/auth/me
   ```

4. **Frontend Layout** (Priority: MEDIUM)
   ```bash
   # Create dashboard structure
   /src/frontend/pages/dashboard/_layout.tsx
   /src/frontend/pages/dashboard/index.tsx

   # Wallet connection
   /src/frontend/components/auth/WalletConnectModal.tsx
   ```

---

## Phase 2: Purchase Flow (Weeks 3-4)
**HIGH PRIORITY**

1. **Smart Contract Integration**
   - Deploy to testnet
   - Integrate Chainlink price feeds
   - Test purchase functions

2. **Backend Services**
   ```bash
   /src/backend/services/presale.service.js
   /src/backend/services/blockchain/presale-contract.js
   /src/backend/services/payment/crypto.service.js
   ```

3. **Frontend Purchase UI**
   ```bash
   /src/frontend/pages/dashboard/buy.tsx
   /src/frontend/components/dashboard/Purchase/TokenCalculator.tsx
   /src/frontend/components/dashboard/Purchase/CryptoPayment.tsx
   ```

4. **API Endpoints**
   ```bash
   GET  /api/v1/presale/current-round
   POST /api/v1/presale/calculate
   POST /api/v1/presale/purchase/initiate
   ```

---

## Phase 3: Dashboard & Vesting (Weeks 5-6)

1. **Backend Vesting Logic**
   ```bash
   /src/backend/services/vesting.service.js
   /src/backend/controllers/vesting.controller.js
   ```

2. **Dashboard Pages**
   ```bash
   /src/frontend/pages/dashboard/overview.tsx
   /src/frontend/pages/dashboard/purchases.tsx
   /src/frontend/pages/dashboard/vesting.tsx
   ```

3. **API Endpoints**
   ```bash
   GET  /api/v1/dashboard/overview
   GET  /api/v1/dashboard/purchases
   GET  /api/v1/dashboard/vesting
   POST /api/v1/dashboard/vesting/claim
   ```

---

## Phase 4: Referral System (Weeks 7-8)

1. **Backend Referral Logic**
   ```bash
   /src/backend/services/referral.service.js
   /src/backend/models/Referral.js
   ```

2. **Frontend Referral UI**
   ```bash
   /src/frontend/pages/dashboard/referrals.tsx
   /src/frontend/components/dashboard/Referrals/ReferralLink.tsx
   /src/frontend/components/dashboard/Referrals/ReferralStats.tsx
   ```

3. **API Endpoints**
   ```bash
   GET  /api/v1/referral/my-code
   GET  /api/v1/referral/stats
   POST /api/v1/referral/track-click
   ```

---

## Phase 5: KYC (Weeks 9-10)

1. **Sumsub Integration**
   ```bash
   /src/backend/services/kyc.service.js
   /src/backend/models/KYC.js
   ```

2. **Frontend KYC Flow**
   ```bash
   /src/frontend/pages/dashboard/kyc.tsx
   /src/frontend/components/kyc/PersonalInfo.tsx
   ```

---

## Quick Implementation Checklist

### Week 1-2: Foundation
- [ ] Create Presale smart contract
- [ ] Create Vesting smart contract
- [ ] Write comprehensive tests
- [ ] Deploy to testnet
- [ ] Extend User model
- [ ] Create Purchase model
- [ ] Create VestingSchedule model
- [ ] Implement wallet auth endpoints
- [ ] Create dashboard layout
- [ ] Create wallet connection modal

### Week 3-4: Purchase Flow
- [ ] Integrate Chainlink price feeds
- [ ] Add ETH/USDT payment support
- [ ] Blockchain monitoring service
- [ ] Purchase initiation endpoint
- [ ] Token calculator UI
- [ ] Crypto payment interface
- [ ] Purchase confirmation screen
- [ ] Email notifications

### Week 5-6: Dashboard
- [ ] Dashboard data aggregation
- [ ] Vesting calculations
- [ ] Claim token endpoint
- [ ] Overview page
- [ ] Purchases page
- [ ] Vesting schedule page
- [ ] Portfolio charts

### Week 7-8: Referrals
- [ ] Referral code generation
- [ ] Referral tracking logic
- [ ] Reward calculation
- [ ] Tier progression
- [ ] Referrals page
- [ ] Social sharing
- [ ] Referral stats

### Week 9-10: KYC
- [ ] Sumsub integration
- [ ] Document upload to S3
- [ ] KYC status checking
- [ ] KYC flow UI
- [ ] Document upload component
- [ ] Status tracking

---

## Critical Files to Create

### Smart Contracts (Priority: CRITICAL)
```
/contracts/PresaleSolidity.sol
/contracts/Vesting.sol
/contracts/interfaces/IPresale.sol
/contracts/interfaces/IVesting.sol
```

### Backend Models (Priority: HIGH)
```
/src/backend/models/Purchase.js
/src/backend/models/VestingSchedule.js
/src/backend/models/Referral.js
/src/backend/models/KYC.js
/src/backend/models/PaymentTransaction.js
```

### Backend Services (Priority: HIGH)
```
/src/backend/services/presale.service.js
/src/backend/services/referral.service.js
/src/backend/services/vesting.service.js
/src/backend/services/kyc.service.js
/src/backend/services/blockchain/presale-contract.js
/src/backend/services/blockchain/vesting-contract.js
/src/backend/services/payment/crypto.service.js
/src/backend/services/payment/stripe.service.js
```

### Backend Routes (Priority: HIGH)
```
/src/backend/routes/presale.routes.js
/src/backend/routes/referral.routes.js
/src/backend/routes/kyc.routes.js
/src/backend/routes/payment.routes.js
/src/backend/routes/vesting.routes.js
```

### Frontend Pages (Priority: HIGH)
```
/src/frontend/pages/dashboard/_layout.tsx
/src/frontend/pages/dashboard/index.tsx (Overview)
/src/frontend/pages/dashboard/buy.tsx
/src/frontend/pages/dashboard/purchases.tsx
/src/frontend/pages/dashboard/vesting.tsx
/src/frontend/pages/dashboard/referrals.tsx
/src/frontend/pages/dashboard/settings.tsx
/src/frontend/pages/dashboard/kyc.tsx
```

### Frontend Components (Priority: MEDIUM)
```
/src/frontend/components/auth/WalletConnectModal.tsx
/src/frontend/components/dashboard/Sidebar.tsx
/src/frontend/components/dashboard/Purchase/TokenCalculator.tsx
/src/frontend/components/dashboard/Purchase/CryptoPayment.tsx
/src/frontend/components/dashboard/Vesting/VestingSchedule.tsx
/src/frontend/components/dashboard/Referrals/ReferralLink.tsx
```

---

## Testing Strategy

### Smart Contract Tests
```bash
# Test presale functions
npx hardhat test test/Presale.test.js

# Test vesting functions
npx hardhat test test/Vesting.test.js

# Gas report
REPORT_GAS=true npx hardhat test
```

### Backend Tests
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

### Frontend Tests
```bash
# Component tests
npm run test

# E2E tests
npm run test:e2e
```

---

## Deployment Checklist

### Smart Contracts
- [ ] Deploy Token contract (if new)
- [ ] Deploy Presale contract
- [ ] Deploy Vesting contract
- [ ] Set vesting contract address in presale
- [ ] Set presale contract address in vesting
- [ ] Transfer tokens to presale contract
- [ ] Transfer tokens to vesting contract
- [ ] Start first presale round
- [ ] Verify contracts on Etherscan/BscScan
- [ ] Transfer ownership to multi-sig wallet

### Backend
- [ ] Setup production MongoDB
- [ ] Setup Redis cache
- [ ] Configure environment variables
- [ ] Setup SSL certificate
- [ ] Configure CORS
- [ ] Setup monitoring (Sentry)
- [ ] Setup logging (Winston)
- [ ] Configure rate limiting
- [ ] Setup backup schedule
- [ ] Test all API endpoints

### Frontend
- [ ] Build production bundle
- [ ] Deploy to Vercel
- [ ] Configure custom domain
- [ ] Setup CDN (Cloudflare)
- [ ] Configure analytics
- [ ] Test wallet connections
- [ ] Test all user flows
- [ ] Mobile responsiveness check

---

## Environment Setup

### Required Accounts/Services
1. **Alchemy/Infura** - Ethereum RPC
2. **MongoDB Atlas** - Database
3. **Redis Cloud** - Cache
4. **Stripe** - Card payments
5. **Sumsub** - KYC verification
6. **SendGrid** - Email
7. **Twilio** - SMS (optional)
8. **AWS S3** - Document storage
9. **Vercel** - Frontend hosting

### API Keys Needed
```bash
ETHEREUM_RPC_URL=
MONGODB_URI=
REDIS_URL=
STRIPE_SECRET_KEY=
SUMSUB_APP_TOKEN=
SENDGRID_API_KEY=
AWS_ACCESS_KEY_ID=
```

---

## Key Decisions to Make

1. **Presale Parameters:**
   - Token price per round?
   - Bonus percentages?
   - Min/max purchase amounts?
   - Hard cap per round?
   - Round duration?

2. **Vesting Schedule:**
   - TGE percentage? (recommended: 15%)
   - Vesting duration? (recommended: 6 months)
   - Unlock frequency? (recommended: monthly)
   - Cliff period? (recommended: none)

3. **Referral Rewards:**
   - Commission rates per tier?
   - Tier thresholds?
   - Reward vesting (same as purchase or instant)?

4. **KYC Requirements:**
   - KYC threshold? (recommended: $10,000)
   - Enhanced KYC threshold? (recommended: $50,000)
   - Required documents?

---

## Next Steps

1. **Review** the complete architecture document: `/Users/ai.place/Crypto/docs/architecture/private-sale-system-architecture.md`

2. **Start with Phase 1** (Weeks 1-2):
   - Focus on smart contracts first (critical path)
   - Parallel: Backend models and auth
   - Parallel: Frontend dashboard layout

3. **Daily standup questions:**
   - What did we complete yesterday?
   - What are we working on today?
   - Any blockers?

4. **Weekly review:**
   - Demo completed features
   - Review against timeline
   - Adjust priorities if needed

---

## Support & Resources

- **Architecture Doc:** `/docs/architecture/private-sale-system-architecture.md`
- **OpenZeppelin Docs:** https://docs.openzeppelin.com/
- **Hardhat Docs:** https://hardhat.org/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Stripe Docs:** https://stripe.com/docs
- **Sumsub Docs:** https://developers.sumsub.com/

---

**Remember:** Security first! Test thoroughly before mainnet deployment.

**Questions?** Refer to the main architecture document for detailed specifications.
