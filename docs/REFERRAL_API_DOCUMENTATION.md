# HypeAI Referral System API Documentation

Complete RESTful API for the HypeAI token referral and rewards system.

## Table of Contents

1. [Authentication](#authentication)
2. [Referral Endpoints](#referral-endpoints)
3. [Purchase Endpoints](#purchase-endpoints)
4. [Dashboard Endpoints](#dashboard-endpoints)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.hypeai.io/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Register with Email/Password

**POST** `/auth/register`

For users in regions without crypto access (e.g., Russia).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "referrerCode": "HYPE12345678" // Optional
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "referralCode": "HYPE87654321"
    }
  }
}
```

### Login with Email/Password

**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "walletAddress": "0x...",
      "referralCode": "HYPE87654321",
      "totalEarnings": "0",
      "totalReferrals": 0
    }
  }
}
```

### Web3 Authentication (Nonce)

**POST** `/auth/web3/nonce`

Request nonce for wallet signature.

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "nonce": "Sign this message to authenticate with HypeAI: a1b2c3d4...",
    "expiresAt": "2025-10-17T12:30:00.000Z"
  }
}
```

### Web3 Authentication (Verify)

**POST** `/auth/web3/verify`

Verify wallet signature and authenticate.

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x...",
  "referrerCode": "HYPE12345678" // Optional
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "referralCode": "HYPE87654321",
      "totalEarnings": "0",
      "totalReferrals": 0
    }
  }
}
```

### Logout

**POST** `/auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User

**GET** `/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "walletAddress": "0x...",
      "referralCode": "HYPE87654321",
      "totalEarnings": "150.50",
      "totalReferrals": 5,
      "createdAt": "2025-10-01T12:00:00.000Z"
    }
  }
}
```

---

## Referral Endpoints

### Get Referral Code

**GET** `/referral/code`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "referralCode": "HYPE87654321",
    "totalReferrals": 5,
    "totalEarnings": "150.50"
  }
}
```

### Register Referral

**POST** `/referral/register`

Connect a referrer to current user (if not set during registration).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "referrerCode": "HYPE12345678"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Referral registered successfully",
  "data": {
    "referrerCode": "HYPE12345678"
  }
}
```

### Get Referral Stats

**GET** `/referral/stats`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "referral_code": "HYPE87654321",
    "total_referrals": 5,
    "total_earnings": "150.50",
    "active_referrals": 4,
    "total_sales_volume": "5000.00",
    "pending_rewards": "25.00",
    "claimed_rewards": "125.50"
  }
}
```

### Get Referral List

**GET** `/referral/list?limit=50&offset=0`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional): Number of results (max 100, default 50)
- `offset` (optional): Pagination offset (default 0)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "referrals": [
      {
        "id": "uuid",
        "referred_id": "uuid",
        "wallet_address": "0x...",
        "email": "referred@example.com",
        "registered_at": "2025-10-10T12:00:00.000Z",
        "first_purchase_at": "2025-10-11T12:00:00.000Z",
        "total_purchases_count": 3,
        "total_purchases_amount": "1500.00",
        "total_rewards_earned": "150.00",
        "is_active": true
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 5
    }
  }
}
```

### Get Pending Rewards

**GET** `/referral/rewards/pending`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "rewards": [
      {
        "id": "uuid",
        "reward_type": "tokens",
        "amount": "10.00",
        "percentage": "10.00",
        "earned_at": "2025-10-15T12:00:00.000Z",
        "purchase_amount": "100.00",
        "referred_user": "0x..."
      }
    ],
    "totalPending": "25.00",
    "count": 3
  }
}
```

### Claim Rewards

**POST** `/referral/claim`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rewardType": "tokens",
  "rewardIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Rewards claimed successfully",
  "data": {
    "totalAmount": "25.00",
    "rewardCount": 3,
    "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "rewardType": "tokens"
  }
}
```

### Get Referral Chain

**GET** `/referral/chain?depth=3`

Get multi-level referral structure.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `depth` (optional): Chain depth (max 5, default 3)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "chain": [
      {
        "referred_id": "uuid",
        "referrer_id": "uuid",
        "wallet_address": "0x...",
        "referral_code": "HYPE11111111",
        "level": 1
      }
    ],
    "grouped": {
      "1": [...],
      "2": [...],
      "3": [...]
    },
    "totalReferrals": 15
  }
}
```

### Validate Referral Code

**GET** `/referral/validate/:code`

Public endpoint (no auth required).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "code": "HYPE87654321",
    "valid": true
  }
}
```

### Get Leaderboard

**GET** `/referral/leaderboard?limit=100`

Public endpoint (no auth required).

**Query Parameters:**
- `limit` (optional): Number of results (max 500, default 100)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "id": "uuid",
        "wallet_address": "0x...",
        "referral_code": "HYPE87654321",
        "total_referrals": 25,
        "total_earnings": "1500.50",
        "ranking": 1
      }
    ],
    "count": 100
  }
}
```

---

## Purchase Endpoints

### Record Purchase

**POST** `/purchase/record`

Record token purchase with referral tracking.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "amountUsd": 1000,
  "amountTokens": 50000,
  "tokenPrice": 0.02,
  "referrerCode": "HYPE12345678"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Purchase recorded successfully",
  "data": {
    "purchaseId": "uuid",
    "txHash": "0x...",
    "amountUsd": 1000,
    "amountTokens": 50000,
    "hasReferrer": true
  }
}
```

### Confirm Purchase

**POST** `/purchase/confirm/:purchaseId`

Confirm purchase after blockchain verification.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "blockNumber": 12345678
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Purchase confirmed successfully",
  "data": {
    "purchaseId": "uuid",
    "blockNumber": 12345678
  }
}
```

### Get Purchase History

**GET** `/purchase/history?limit=50&offset=0`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional): Number of results (max 100, default 50)
- `offset` (optional): Pagination offset (default 0)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "purchases": [
      {
        "id": "uuid",
        "tx_hash": "0x...",
        "amount_usd": "1000.00",
        "amount_tokens": "50000.00",
        "token_price": "0.02",
        "status": "confirmed",
        "created_at": "2025-10-15T12:00:00.000Z",
        "confirmed_at": "2025-10-15T12:05:00.000Z",
        "block_number": 12345678
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 10
    }
  }
}
```

### Verify Transaction

**GET** `/purchase/verify/:txHash`

Public endpoint to verify blockchain transaction.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "txHash": "0x...",
    "from": "0x...",
    "to": "0x...",
    "value": "1.0",
    "blockNumber": 12345678,
    "confirmations": 12,
    "status": "success"
  }
}
```

### Get Purchase by TX Hash

**GET** `/purchase/by-tx/:txHash`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "purchase": {
      "id": "uuid",
      "user_id": "uuid",
      "tx_hash": "0x...",
      "amount_usd": "1000.00",
      "amount_tokens": "50000.00",
      "token_price": "0.02",
      "referrer_id": "uuid",
      "status": "confirmed",
      "created_at": "2025-10-15T12:00:00.000Z",
      "confirmed_at": "2025-10-15T12:05:00.000Z",
      "block_number": 12345678
    }
  }
}
```

---

## Dashboard Endpoints

### Get Overview

**GET** `/dashboard/overview`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "referral_code": "HYPE87654321",
      "total_referrals": 5,
      "total_earnings": "150.50",
      "active_referrals": 4,
      "total_sales_volume": "5000.00",
      "pending_rewards": "25.00",
      "claimed_rewards": "125.50"
    },
    "pendingRewards": {
      "total": "25.00",
      "count": 3,
      "items": [...]
    },
    "recentPurchases": [...]
  }
}
```

### Get Earnings

**GET** `/dashboard/earnings`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "byType": [
      {
        "reward_type": "tokens",
        "total_amount": "100.50",
        "count": 10,
        "pending": "25.00",
        "claimed": "75.50"
      }
    ],
    "timeline": [
      {
        "date": "2025-10-15T00:00:00.000Z",
        "amount": "15.00",
        "count": 2
      }
    ],
    "topPurchases": [...]
  }
}
```

### Get Referral Analytics

**GET** `/dashboard/referrals`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "funnel": {
      "total_referrals": 10,
      "converted_referrals": 8,
      "repeat_buyers": 5,
      "total_volume": "5000.00",
      "conversionRate": 80.00
    },
    "activity": [...],
    "topReferrals": [...]
  }
}
```

### Get Stats Summary

**GET** `/dashboard/stats`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_referrals": 5,
      "total_earnings": "150.50",
      "active_referrals": 4,
      "total_sales": "5000.00",
      "pending_rewards": "25.00",
      "claimed_rewards": "125.50",
      "total_purchases": 20,
      "leaderboard_rank": 42
    },
    "growth": {
      "new_referrals_30d": 2,
      "earnings_30d": "50.00",
      "purchases_30d": 8
    }
  }
}
```

### Get Recent Activity

**GET** `/dashboard/activity?limit=20`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional): Number of results (max 100, default 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "activity": [
      {
        "type": "referral",
        "timestamp": "2025-10-15T12:00:00.000Z",
        "user": "0x...",
        "amount": null
      },
      {
        "type": "purchase",
        "timestamp": "2025-10-15T13:00:00.000Z",
        "user": "0x...",
        "amount": "1000.00"
      },
      {
        "type": "reward",
        "timestamp": "2025-10-15T13:05:00.000Z",
        "user": "0x...",
        "amount": "100.00"
      }
    ]
  }
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message here",
  "timestamp": "2025-10-17T12:00:00.000Z"
}
```

### HTTP Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (invalid/missing token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate entry)
- **429** - Too Many Requests (rate limit exceeded)
- **500** - Internal Server Error

### Development Mode

In development, error responses include additional debug info:

```json
{
  "success": false,
  "error": "Error message",
  "type": "ValidationError",
  "stack": "Error stack trace...",
  "path": "/api/referral/code",
  "timestamp": "2025-10-17T12:00:00.000Z"
}
```

---

## Rate Limiting

Different endpoints have different rate limits:

### API Endpoints (General)
- **15 minutes window**
- **100 requests** per IP

### Authentication Endpoints
- **15 minutes window**
- **10 attempts** per IP
- Failed attempts only count

### Reward Claims
- **1 hour window**
- **5 claims** per user

### Purchase Recording
- **1 minute window**
- **10 purchases** per user

### Public Endpoints
- **1 minute window**
- **30 requests** per IP

When rate limit is exceeded:

```json
{
  "success": false,
  "error": "Too many requests, please try again later.",
  "retryAfter": "2025-10-17T12:15:00.000Z"
}
```

---

## Database Schema

The system uses PostgreSQL with the following main tables:

- **users** - User accounts and referral codes
- **referrals** - Referral relationships
- **purchases** - Token purchases
- **referral_rewards** - Reward tracking
- **reward_claims** - Claim history
- **user_sessions** - JWT session management
- **auth_nonces** - Web3 authentication

See `/src/backend/database/referral-schema.sql` for complete schema.

---

## Integration Example

### Frontend Integration (React)

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

// Login
const login = async (email, password) => {
  const { data } = await axios.post(`${API_BASE}/auth/login`, {
    email,
    password
  });

  localStorage.setItem('token', data.data.token);
  return data.data.user;
};

// Get referral stats
const getReferralStats = async () => {
  const token = localStorage.getItem('token');
  const { data } = await axios.get(`${API_BASE}/referral/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return data.data;
};

// Record purchase
const recordPurchase = async (txHash, amountUsd, amountTokens, tokenPrice) => {
  const token = localStorage.getItem('token');
  const { data } = await axios.post(`${API_BASE}/purchase/record`, {
    txHash,
    amountUsd,
    amountTokens,
    tokenPrice
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return data.data;
};
```

---

## Security Considerations

1. **JWT Tokens** - Expire after 7 days
2. **Password Hashing** - bcrypt with 12 rounds
3. **SQL Injection** - Parameterized queries
4. **Rate Limiting** - Multiple levels
5. **CORS** - Configured for specific origins
6. **Helmet** - Security headers
7. **Input Validation** - All requests validated
8. **Session Management** - Token tracking in database

---

## Support

For API issues or questions:
- GitHub: https://github.com/hypeai/referral-system
- Email: support@hypeai.io
- Docs: https://docs.hypeai.io/referral-api
