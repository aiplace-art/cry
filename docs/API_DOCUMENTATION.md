# HypeAI Dashboard Backend API Documentation

**Version:** 1.0.0
**Last Updated:** October 19, 2025
**Status:** Production Ready

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Authentication](#authentication)
4. [Endpoints](#endpoints)
   - [POST /api/auth/web3](#post-apiauthweb3)
   - [POST /api/private-sale/purchase](#post-apiprivate-salepurchase)
   - [GET /api/private-sale/purchases](#get-apiprivate-salepurchases)
   - [GET /api/private-sale/stats](#get-apiprivate-salestats)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Testing](#testing)
8. [Security](#security)

---

## Overview

The HypeAI Dashboard Backend provides 4 production-ready API endpoints for:

- Web3 wallet authentication
- Token purchase processing
- Purchase history retrieval
- Presale statistics

### Tech Stack

- **Framework:** Next.js 15 API Routes
- **Blockchain:** ethers.js v6 (BSC Testnet)
- **Database:** SQLite (testnet) / PostgreSQL (production)
- **Authentication:** JWT + Web3 Signatures
- **Validation:** Zod schemas
- **Rate Limiting:** rate-limiter-flexible

### Smart Contracts (BSC Testnet)

- **HypeAI Token:** `0x02B23B891b3A3717673291aD34EB67893A19D978`
- **Private Sale:** `0xFb7dd436646658e3E14C70c9F4E60aC38CB74696`
- **Mock USDT:** `0x284D311f0E4562a3a870720D97aa12c445922137`
- **Chainlink BNB/USD:** `0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526`

---

## Quick Start

### Installation

```bash
cd src/frontend
npm install
```

### Environment Variables

Create `.env.local`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-me
NEXT_PUBLIC_API_URL=http://localhost:3000/api
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
```

### Start Development Server

```bash
npm run dev
```

API will be available at `http://localhost:3000/api`

---

## Authentication

All authenticated endpoints require a JWT token obtained from `/api/auth/web3`.

### How It Works

1. User signs a message with their Web3 wallet
2. Backend verifies signature
3. JWT token issued (24-hour expiry)
4. Token used in `Authorization` header

### Example Flow

```javascript
// 1. Generate message
const address = "0x...";
const timestamp = Date.now();
const message = `Sign this message to authenticate with HypeAI Dashboard

Address: ${address}
Timestamp: ${timestamp}

This request will not trigger a blockchain transaction or cost any gas fees.`;

// 2. Sign message
const signature = await signer.signMessage(message);

// 3. Authenticate
const response = await fetch('/api/auth/web3', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address, signature, message, timestamp })
});

const { token } = await response.json();

// 4. Use token in subsequent requests
fetch('/api/private-sale/purchase', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Endpoints

### POST /api/auth/web3

Authenticate user with Web3 wallet signature.

**Rate Limit:** 5 requests per minute

#### Request

```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x...",
  "message": "Sign this message to authenticate...",
  "timestamp": 1729324800000
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "expiresIn": 86400
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": "Invalid signature"
}
```

**400 Bad Request**
```json
{
  "success": false,
  "error": "Signature already used"
}
```

#### Security Features

- Signature replay protection (5-minute window)
- Timestamp validation (±5 minutes)
- Persistent signature storage (24-hour history)
- Rate limiting (5 req/min per IP)

---

### POST /api/private-sale/purchase

Process a token purchase.

**Authentication:** Required
**Rate Limit:** 3 requests per minute

#### Request

```json
{
  "amount": 1000,
  "paymentMethod": "USDT",
  "referralCode": "FRIEND123",
  "email": "user@example.com"
}
```

**Fields:**
- `amount` (number, required): Amount in USD (USDT) or quantity (BNB)
- `paymentMethod` (string, required): "USDT" or "BNB"
- `referralCode` (string, optional): Referral code
- `email` (string, optional): User email

**Validation:**
- Minimum: $100
- Payment method: USDT or BNB only
- Authenticated user required

#### Response (200 OK)

```json
{
  "success": true,
  "txHash": "0x1234567890abcdef...",
  "tokensReceived": 40000,
  "bonusTokens": 8000,
  "totalTokens": 48000,
  "bonusPercentage": 20,
  "estimatedGas": "0.002"
}
```

#### Bonus Tiers

| Investment | Bonus |
|-----------|-------|
| $1,000 - $4,999 | 20% |
| $5,000 - $9,999 | 23% |
| $10,000 - $24,999 | 25% |
| $25,000 - $49,999 | 27% |
| $50,000+ | 30% |

#### Example

```javascript
const response = await fetch('/api/private-sale/purchase', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    amount: 5000,
    paymentMethod: 'USDT',
    email: 'investor@example.com'
  })
});

const data = await response.json();
// {
//   success: true,
//   tokensReceived: 200000,
//   bonusTokens: 46000,  // 23% bonus
//   totalTokens: 246000,
//   bonusPercentage: 23
// }
```

---

### GET /api/private-sale/purchases

Get user's purchase history with vesting information.

**Authentication:** Required
**Rate Limit:** 30 requests per minute

#### Request

```
GET /api/private-sale/purchases
Authorization: Bearer <token>
```

#### Response (200 OK)

```json
{
  "success": true,
  "purchases": [
    {
      "id": "0xabc...",
      "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
      "date": "2025-10-15",
      "timestamp": 1729324800000,
      "amount": 2500,
      "paymentMethod": "USDT",
      "tokenAmount": 100000,
      "bonusTokens": 20000,
      "totalTokens": 120000,
      "bonusPercentage": 20,
      "vestedTokens": 80000,
      "claimedTokens": 40000,
      "txHash": "0x1234...",
      "email": "user@example.com"
    }
  ],
  "totalInvested": 7500,
  "totalTokens": 315600
}
```

**Purchase Fields:**
- `vestedTokens`: Tokens unlocked based on 6-month linear vesting
- `claimedTokens`: Tokens already claimed by user
- `totalTokens`: Total tokens including bonus

#### Vesting

- **Duration:** 6 months linear
- **Calculation:** `vestedTokens = totalTokens * (elapsed / 6 months)`
- **Start:** Purchase timestamp
- **Claimable:** `vestedTokens - claimedTokens`

---

### GET /api/private-sale/stats

Get current presale statistics.

**Authentication:** Not required (public)
**Rate Limit:** 60 requests per minute
**Cache:** 30 seconds

#### Request

```
GET /api/private-sale/stats
```

#### Response (200 OK)

```json
{
  "success": true,
  "stats": {
    "totalRaised": 2400000,
    "totalUSDTRaised": 1800000,
    "totalBNBRaised": 1000,
    "bnbPriceUSD": 600,
    "goal": 5000000,
    "progress": 48,
    "participantsCount": 156,
    "tokenPrice": 0.025,
    "bonusTiers": [
      { "min": 50000, "bonus": 30 },
      { "min": 25000, "bonus": 27 },
      { "min": 10000, "bonus": 25 },
      { "min": 5000, "bonus": 23 },
      { "min": 1000, "bonus": 20 }
    ],
    "vestingMonths": 6,
    "startTime": 1729324800000,
    "isActive": true
  }
}
```

#### Example

```javascript
const response = await fetch('/api/private-sale/stats');
const { stats } = await response.json();

console.log(`Raised: $${stats.totalRaised.toLocaleString()}`);
console.log(`Progress: ${stats.progress}%`);
console.log(`Participants: ${stats.participantsCount}`);
```

---

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request completed |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Access denied |
| 405 | Method Not Allowed | Wrong HTTP method |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Common Error Codes

- `INVALID_TOKEN`: JWT token invalid or expired
- `TOKEN_EXPIRED`: JWT token expired
- `NO_TOKEN`: No authentication token provided
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INVALID_SIGNATURE`: Web3 signature verification failed
- `SIGNATURE_REPLAY`: Signature already used

---

## Rate Limiting

Rate limits protect the API from abuse.

### Limits by Endpoint

| Endpoint | Limit | Window | Block Duration |
|----------|-------|--------|----------------|
| `/api/auth/web3` | 5 req | 1 min | 5 min |
| `/api/private-sale/purchase` | 3 req | 1 min | 10 min |
| `/api/private-sale/purchases` | 30 req | 1 min | - |
| `/api/private-sale/stats` | 60 req | 1 min | - |

### Rate Limit Headers

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 2025-10-19T16:30:00.000Z
```

### Rate Limit Exceeded (429)

```json
{
  "success": false,
  "error": "Too many requests. Please try again in 45 seconds.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

---

## Testing

### Run Test Suite

```bash
cd src/frontend
npm test tests/backend/api-endpoints.test.ts
```

### Manual Testing with curl

#### 1. Authenticate

```bash
# Generate signature first (use MetaMask or ethers.js)
curl -X POST http://localhost:3000/api/auth/web3 \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "signature": "0x...",
    "message": "Sign this message...",
    "timestamp": 1729324800000
  }'
```

#### 2. Make Purchase

```bash
curl -X POST http://localhost:3000/api/private-sale/purchase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "amount": 1000,
    "paymentMethod": "USDT",
    "email": "test@example.com"
  }'
```

#### 3. Get Purchase History

```bash
curl http://localhost:3000/api/private-sale/purchases \
  -H "Authorization: Bearer <token>"
```

#### 4. Get Stats

```bash
curl http://localhost:3000/api/private-sale/stats
```

### Test Data

Database location (testnet): `src/frontend/data/testnet/hypeai-testnet.db`

To reset test data:
```bash
rm src/frontend/data/testnet/hypeai-testnet.db
```

---

## Security

### Best Practices

1. **JWT Secret**: Change `JWT_SECRET` in production
2. **HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: Enforced on all endpoints
4. **Signature Replay Protection**: 5-minute window + persistent storage
5. **Input Validation**: All inputs validated with Zod
6. **SQL Injection**: Parameterized queries only
7. **CORS**: Configure allowed origins

### Production Checklist

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Enable HTTPS
- [ ] Configure CORS whitelist
- [ ] Switch to PostgreSQL database
- [ ] Enable error monitoring (Sentry)
- [ ] Set up logging (Winston)
- [ ] Configure firewall rules
- [ ] Enable DDoS protection
- [ ] Set up database backups
- [ ] Configure environment variables

### Security Headers

```javascript
// Add to API responses
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-XSS-Protection', '1; mode=block');
res.setHeader('Strict-Transport-Security', 'max-age=31536000');
```

---

## Support

- **Documentation**: `/docs/API_DOCUMENTATION.md`
- **Issues**: GitHub Issues
- **Email**: support@hypeai.com

---

## Changelog

### v1.0.0 (2025-10-19)

- Initial release
- 4 production-ready endpoints
- JWT authentication
- Web3 signature verification
- Rate limiting
- SQLite database
- Comprehensive test suite
- Full documentation
