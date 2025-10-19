# HypeAI Private Sale Backend - Quick Start Guide

## 🚀 Fast Implementation Guide

This is the **TL;DR** version of the complete backend architecture. For full details, see `PRIVATE_SALE_BACKEND_ARCHITECTURE.md`.

---

## What We're Building

A complete backend API for HypeAI's private sale supporting:
- 500 founding members
- $80K hard cap ($40-$800 per user)
- BNB + USDT payments
- Automatic referral rewards (5% + 2% tiers)
- Real-time dashboard

---

## Technology Stack (Final Decision)

```
✅ Node.js + Express.js    (Backend framework)
✅ PostgreSQL              (Database)
✅ Redis                   (Caching/Sessions)
✅ ethers.js v6            (Blockchain)
✅ JWT + Passport          (Authentication)
✅ Socket.io               (WebSocket)
✅ Sequelize               (ORM)
```

**Why not Next.js API routes?** Need dedicated backend for complex middleware and independent scaling.

---

## API Endpoints Summary

### Authentication (3 endpoints)
```
POST /api/auth/connect-wallet    → Get nonce for signing
POST /api/auth/verify-signature   → Verify + get JWT
POST /api/auth/refresh-token      → Refresh expired token
```

### User Management (2 endpoints)
```
GET  /api/user/profile            → Get profile + eligibility
PUT  /api/user/profile            → Update profile
```

### Private Sale (4 endpoints)
```
POST /api/sale/purchase           → Initiate purchase
POST /api/sale/confirm-purchase   → Confirm tx
GET  /api/sale/allocation         → Get tokens owned
GET  /api/sale/transactions       → Purchase history
GET  /api/sale/stats              → Global sale stats (public)
```

### Referral System (4 endpoints)
```
GET  /api/referral/link           → Get referral link + QR
GET  /api/referral/stats          → Referral performance
POST /api/referral/claim-rewards  → Claim pending rewards
GET  /api/referral/history        → Referral activity
GET  /api/referral/leaderboard    → Top referrers (public)
```

### Analytics (1 endpoint)
```
GET  /api/analytics/dashboard     → Comprehensive dashboard
```

**Total: 18 endpoints**

---

## Database Schema (5 tables)

```sql
users
├── id (UUID)
├── wallet_address (UNIQUE)
├── email, telegram, twitter
├── is_whitelisted, is_founding_member
├── referral_code (UNIQUE)
└── referred_by (FK → users)

purchases
├── id (UUID)
├── user_id (FK → users)
├── payment_method (BNB/USDT)
├── amount_paid, amount_usd
├── tokens_base, tokens_bonus, tokens_total
├── tx_hash
├── status (pending/confirmed/failed)
└── referrer_id (FK → users)

referrals
├── id (UUID)
├── referrer_id (FK → users)
├── referred_id (FK → users)
├── purchase_id (FK → purchases)
├── reward_tier (1=5%, 2=2%)
├── reward_usd, reward_tokens
└── status (pending/approved/paid)

reward_claims
├── id (UUID)
├── user_id (FK → users)
├── reward_type (HYPE/USDT)
├── usd_value, token_amount
├── tx_hash
└── status

transaction_monitoring
├── tx_hash (UNIQUE)
├── tx_type (purchase/reward_claim)
├── related_id (UUID)
├── status, confirmations
└── retry_count
```

---

## Smart Contract Integration

### Contracts on BSC

```javascript
// config/contracts.js
{
  privateSale: '0x...',      // PrivateSaleWithReferral.sol
  referralSystem: '0x...',   // ReferralSystem.sol
  hypeToken: '0x...',        // Token.sol
  usdt: '0x55d398326f99059fF775485246999027B3197955'
}
```

### Key Contract Methods

**Private Sale:**
- `purchaseWithBNB(referrer)` - Buy with BNB
- `purchaseWithUSDT(amount, referrer)` - Buy with USDT
- `checkEligibility(address)` - Check if can purchase
- `getSaleStats()` - Get sale statistics

**Referral System:**
- `getReferralStats(address)` - Get user referral data
- `claimRewards(inTokens)` - Claim rewards (HYPE or USDT)
- `getPendingRewards(address)` - Check pending rewards

---

## Authentication Flow

```
1. User clicks "Connect Wallet"
   ↓
2. POST /auth/connect-wallet
   → Returns nonce: "Sign this message: 1729274645123"
   ↓
3. MetaMask signs nonce
   ↓
4. POST /auth/verify-signature
   → Backend verifies: ethers.verifyMessage(nonce, signature)
   → Returns JWT (access + refresh tokens)
   ↓
5. User authenticated
   → All requests include: Authorization: Bearer <token>
```

**JWT Payload:**
```json
{
  "userId": "uuid",
  "walletAddress": "0x...",
  "isWhitelisted": true,
  "exp": 1729275545
}
```

---

## Purchase Flow

```
1. User selects amount + payment method
   ↓
2. POST /sale/purchase
   → Validates eligibility
   → Creates pending purchase in DB
   → Returns transaction data
   ↓
3. Frontend signs transaction with MetaMask
   ↓
4. POST /sale/confirm-purchase
   → Stores tx_hash
   → Starts monitoring confirmations
   ↓
5. Backend monitors blockchain
   → Waits for 3 confirmations
   ↓
6. Smart contract emits TokensPurchased event
   ↓
7. Backend updates purchase status to "confirmed"
   ↓
8. Referral rewards calculated automatically
   ↓
9. WebSocket notifies user → "Purchase confirmed!"
```

---

## Referral Flow

```
User A signs up with referral code "HYPE-XYZ123"
   ↓
Smart contract: registerReferral(userA, referrerB)
   ↓
User A purchases $400 worth of tokens
   ↓
Smart contract: recordPurchase(userA, $400, tokens)
   ↓
Referrer B gets: $400 × 5% = $20 USD pending
   ↓
If Referrer B was referred by C:
   → Referrer C gets: $400 × 2% = $8 USD pending
   ↓
Referrers can claim anytime:
   → POST /referral/claim-rewards
   → Choose HYPE tokens or USDT
```

---

## File Structure

```
/src/backend/
├── app.js                   # Express app setup
├── server.js                # Server entry point
├── config/
│   ├── database.js          # PostgreSQL config
│   ├── redis.js             # Redis config
│   └── contracts.js         # Smart contract addresses
├── models/
│   ├── User.js
│   ├── Purchase.js
│   ├── Referral.js
│   └── RewardClaim.js
├── controllers/
│   ├── auth.controller.js
│   ├── sale.controller.js
│   ├── user.controller.js
│   └── referral.controller.js
├── services/
│   ├── web3.service.js      # Blockchain interaction
│   ├── auth.service.js      # Authentication logic
│   ├── sale.service.js      # Purchase logic
│   └── referral.service.js  # Referral logic
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── validation.js        # Joi schemas
│   └── rateLimiter.js       # Rate limiting
├── routes/
│   ├── auth.routes.js
│   ├── sale.routes.js
│   ├── user.routes.js
│   └── referral.routes.js
└── abis/
    ├── PrivateSaleWithReferral.json
    ├── ReferralSystem.json
    └── Token.json
```

---

## Environment Variables

```bash
# .env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://hypeai.io

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/hypeai

# Redis
REDIS_URL=redis://localhost:6379

# Blockchain
NETWORK=mainnet
BSC_RPC_URL=https://bsc-dataseed.binance.org/
PRIVATE_KEY=0x...
CONTRACT_PRIVATE_SALE=0x...
CONTRACT_REFERRAL_SYSTEM=0x...

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=another-secret
REFRESH_TOKEN_EXPIRES_IN=7d
```

---

## Installation Steps

```bash
# 1. Install dependencies
cd src/backend
npm install

# 2. Set up PostgreSQL
createdb hypeai
npm run migrate

# 3. Set up Redis
redis-server

# 4. Configure environment
cp .env.example .env
# Edit .env with your values

# 5. Start development server
npm run dev

# 6. Run tests
npm test

# 7. Production deployment
npm start
```

---

## Implementation Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Phase 1: Core** | 3-5 days | Express setup, DB, Web3 service |
| **Phase 2: Auth** | 2-3 days | Wallet auth, JWT, sessions |
| **Phase 3: Sale** | 4-6 days | Purchase endpoints, tx monitoring |
| **Phase 4: Referral** | 4-5 days | Referral tracking, rewards |
| **Phase 5: Dashboard** | 3-4 days | User profile, analytics |
| **Phase 6: Testing** | 5-7 days | Unit/integration tests, security |
| **Phase 7: Deploy** | 2-3 days | Production deployment |

**Total: 23-33 days (4-6 weeks)**

---

## Security Checklist

- ✅ JWT authentication with short expiry (15 min)
- ✅ Rate limiting (5 auth attempts per 15 min)
- ✅ Input validation with Joi schemas
- ✅ Signature verification for wallet auth
- ✅ CORS whitelist for frontend
- ✅ Helmet.js security headers
- ✅ SQL injection prevention (Sequelize ORM)
- ✅ XSS protection (sanitize inputs)
- ✅ HTTPS only in production
- ✅ Environment variables for secrets

---

## Performance Optimization

**Caching Strategy:**
```javascript
// Redis cache for expensive calls
Sale stats: 30s TTL
User eligibility: 60s TTL
BNB price: 60s TTL
Referral leaderboard: 5min TTL
```

**Database Optimization:**
- Indexes on frequently queried columns
- Connection pooling (min: 5, max: 30)
- Pagination for large result sets
- Aggregate queries cached in Redis

**Expected Load:**
- 500 users max
- ~100 total transactions
- Peak: 20 concurrent purchases
- Server: 4 cores, 8GB RAM sufficient

---

## Monitoring

**Health Check Endpoint:**
```
GET /api/health
→ Returns database, Redis, blockchain status
```

**Logging:**
- Winston for structured logging
- Separate files: error.log, combined.log
- Log all purchases, auth attempts, errors

**Metrics:**
- Response times (avg, p95, p99)
- Error rates
- Active users
- Transaction success rate

---

## Next Steps

1. **Get Omega's approval** on architecture
2. **Deploy contracts to BSC testnet** (get addresses)
3. **Set up development environment**
4. **Create database schema**
5. **Begin Phase 1 implementation**

---

## Questions for Omega

1. Do we need **fiat payment** (credit card) support?
2. Is **KYC/AML verification** required?
3. Do tokens **vest immediately** or on a schedule?
4. Do we need an **admin dashboard**?
5. Should we implement **email notifications**?

---

## API Testing Examples

**Connect Wallet:**
```bash
curl -X POST https://api.hypeai.io/v1/auth/connect-wallet \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"}'
```

**Purchase Tokens:**
```bash
curl -X POST https://api.hypeai.io/v1/sale/purchase \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "BNB",
    "amount": 0.5,
    "referralCode": "HYPE-ABC123"
  }'
```

**Get Referral Stats:**
```bash
curl https://api.hypeai.io/v1/referral/stats \
  -H "Authorization: Bearer <token>"
```

---

## Success Metrics

**Backend Performance:**
- API response time: <200ms (p95)
- Database queries: <50ms (p95)
- Blockchain calls: <2s (p95)
- Uptime: 99.9%

**Business Metrics:**
- 500 founding members signed up
- $80K raised successfully
- 0 failed transactions due to backend
- All referral rewards distributed correctly

---

**Status:** ✅ Architecture Complete
**Ready for:** Implementation
**Next Agent:** Frontend Developer (for dashboard integration)

**Generated by:** Backend API Developer Agent
**Date:** 2025-10-18
