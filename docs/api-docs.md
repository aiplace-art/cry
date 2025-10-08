# Cryptocurrency Platform API Documentation

## Overview

This is a comprehensive REST API for a cryptocurrency platform with AI-powered features, staking pools, and real-time price feeds.

**Base URL:** `http://localhost:5000/api/v1`

**WebSocket URL:** `ws://localhost:5000/ws`

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Flow

1. Request nonce for wallet address
2. Sign nonce with Web3 wallet
3. Verify signature to receive JWT token
4. Use JWT token for authenticated requests

---

## API Endpoints

### Authentication

#### Get Nonce

Generate authentication nonce for wallet address.

```http
GET /api/v1/auth/nonce/:walletAddress
```

**Response:**
```json
{
  "nonce": "Sign this message to authenticate...",
  "walletAddress": "0x..."
}
```

#### Verify & Authenticate

Verify wallet signature and receive JWT token.

```http
POST /api/v1/auth/verify
```

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "signature": "0x...",
  "message": "Sign this message..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "walletAddress": "0x...",
    "role": "user",
    "portfolioValue": 0,
    "totalStaked": 0,
    "totalEarned": 0
  }
}
```

---

### User Profile

#### Get Profile

```http
GET /api/v1/users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "walletAddress": "0x...",
    "role": "user",
    "preferences": {
      "currency": "USD",
      "notifications": true,
      "theme": "dark"
    },
    "portfolioValue": 5000,
    "totalStaked": 1000,
    "totalEarned": 50
  }
}
```

#### Update Profile

```http
PUT /api/v1/users/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "preferences": {
    "currency": "EUR",
    "notifications": false,
    "theme": "light"
  }
}
```

#### Get Dashboard

```http
GET /api/v1/users/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {...},
  "stakes": {
    "active": 3,
    "totalPendingRewards": 12.5
  },
  "transactions": {
    "recent": [...],
    "stats": [...]
  }
}
```

---

### Token Prices

#### Get Token Prices

```http
GET /api/v1/tokens/prices?symbols=BTC,ETH,USDT&currency=USD
```

**Query Parameters:**
- `symbols` (required): Comma-separated list of token symbols
- `currency` (optional): Currency for prices (default: USD)

**Response:**
```json
{
  "prices": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "price": 45000,
      "currency": "USD",
      "marketCap": 850000000000,
      "volume24h": 25000000000,
      "change24h": 2.5,
      "change7d": 5.8,
      "high24h": 46000,
      "low24h": 44000
    }
  ]
}
```

#### Get Token Details

```http
GET /api/v1/tokens/:symbol?currency=USD
```

#### Get Price History

```http
GET /api/v1/tokens/:symbol/history?timeframe=24h&interval=1h
```

**Query Parameters:**
- `timeframe`: 1h, 4h, 24h, 7d, 30d
- `interval`: 1h, 4h, 24h

**Response:**
```json
{
  "history": {
    "symbol": "ETH",
    "timeframe": "24h",
    "interval": "1h",
    "data": [
      {
        "timestamp": 1234567890,
        "price": 2500,
        "volume": 1000000
      }
    ]
  }
}
```

#### Get Trending Tokens

```http
GET /api/v1/tokens/trending/list?limit=10
```

#### Get User Portfolio

```http
GET /api/v1/tokens/user/portfolio
Authorization: Bearer <token>
```

**Response:**
```json
{
  "portfolio": {
    "tokens": [
      {
        "symbol": "ETH",
        "balance": 2.5,
        "price": 2500,
        "value": 6250,
        "change24h": 3.2
      }
    ],
    "totalValue": 10000,
    "tokenCount": 5
  }
}
```

---

### Staking

#### Get Staking Pools

```http
GET /api/v1/staking/pools
Authorization: Bearer <token>
```

**Response:**
```json
{
  "pools": [
    {
      "tokenSymbol": "ETH",
      "tokenAddress": "0x...",
      "apy": 5.5,
      "minStake": "0.1",
      "maxDuration": 365,
      "minDuration": 7,
      "currentPrice": 2500,
      "change24h": 2.5
    }
  ]
}
```

#### Create Stake

```http
POST /api/v1/staking/stake
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "tokenAddress": "0x...",
  "amount": "1.5",
  "duration": 90
}
```

**Response:**
```json
{
  "message": "Stake created successfully",
  "stake": {
    "_id": "...",
    "tokenSymbol": "ETH",
    "amount": "1.5",
    "amountDecimal": 1.5,
    "apy": 5.5,
    "duration": 90,
    "startDate": "2025-10-09T...",
    "endDate": "2026-01-07T...",
    "status": "active"
  }
}
```

#### Get User Stakes

```http
GET /api/v1/staking/user?status=active
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): active, completed, withdrawn, cancelled

#### Get Stake Details

```http
GET /api/v1/staking/:stakeId
Authorization: Bearer <token>
```

#### Unstake

```http
POST /api/v1/staking/unstake
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "stakeId": "..."
}
```

**Response:**
```json
{
  "message": "Unstaked successfully",
  "stake": {...},
  "rewards": {
    "earned": 25.5,
    "claimed": 0,
    "pending": 25.5
  },
  "totalReturned": 1525.5
}
```

#### Claim Rewards

```http
POST /api/v1/staking/:stakeId/claim
Authorization: Bearer <token>
```

#### Calculate Rewards

```http
GET /api/v1/staking/:stakeId/rewards
Authorization: Bearer <token>
```

---

### Transactions

#### Get Transaction History

```http
GET /api/v1/transactions?type=stake&status=confirmed&limit=50&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**
- `type`: transfer, swap, stake, unstake, claim
- `status`: pending, confirmed, failed, cancelled
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "transactions": [...],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Get Transaction Details

```http
GET /api/v1/transactions/:txHash
Authorization: Bearer <token>
```

#### Track Transaction

```http
POST /api/v1/transactions/track
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "txHash": "0x...",
  "type": "transfer",
  "from": "0x...",
  "to": "0x...",
  "amount": "1.5",
  "amountDecimal": 1.5,
  "tokenAddress": "0x...",
  "tokenSymbol": "ETH",
  "status": "pending"
}
```

#### Get Transaction Statistics

```http
GET /api/v1/transactions/stats/summary?timeframe=30d
Authorization: Bearer <token>
```

---

### Analytics

#### Get Portfolio Analytics

```http
GET /api/v1/analytics/portfolio?timeframe=30d
Authorization: Bearer <token>
```

**Response:**
```json
{
  "analytics": {
    "portfolioValue": 10000,
    "totalStaked": 5000,
    "totalEarned": 250,
    "pendingRewards": 50,
    "activeStakes": 5,
    "transactionVolume": 15000,
    "transactionCount": 50,
    "timeframe": "30d"
  }
}
```

#### Get Performance Metrics

```http
GET /api/v1/analytics/performance?timeframe=30d
Authorization: Bearer <token>
```

**Response:**
```json
{
  "metrics": {
    "timeframe": "30d",
    "staking": {
      "totalInvested": 5000,
      "totalEarned": 250,
      "roi": 5.0
    },
    "transactions": {
      "total": 50,
      "confirmed": 48,
      "successRate": 96
    }
  }
}
```

#### Get P&L Analysis

```http
GET /api/v1/analytics/pnl?timeframe=30d
Authorization: Bearer <token>
```

#### Get Staking Analytics

```http
GET /api/v1/analytics/staking
Authorization: Bearer <token>
```

#### Get Market Analytics

```http
GET /api/v1/analytics/market?timeframe=24h
Authorization: Bearer <token>
```

---

### AI Features

#### Get Price Prediction

```http
POST /api/v1/ai/predict
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "tokenSymbol": "ETH",
  "timeframe": "24h",
  "includeAnalysis": true
}
```

**Response:**
```json
{
  "prediction": {
    "tokenSymbol": "ETH",
    "timeframe": "24h",
    "currentPrice": 2500,
    "predictedPrice": 2575,
    "confidence": 75,
    "trend": "bullish",
    "signals": {
      "buy": 70,
      "sell": 20,
      "hold": 10
    },
    "technicalIndicators": {
      "rsi": 65,
      "macd": {...},
      "sma": {...}
    },
    "sentimentScore": 0.6,
    "analysis": "Based on current market conditions...",
    "validUntil": "2025-10-09T..."
  }
}
```

#### Get Trading Signals

```http
GET /api/v1/ai/signals/:symbol?timeframe=24h
Authorization: Bearer <token>
```

**Response:**
```json
{
  "signals": {
    "symbol": "ETH",
    "timeframe": "24h",
    "signals": {
      "buy": 70,
      "sell": 20,
      "hold": 10
    },
    "trend": "bullish",
    "confidence": 75,
    "recommendation": "BUY",
    "technicalIndicators": {...}
  }
}
```

#### Get Sentiment Analysis

```http
GET /api/v1/ai/sentiment/:symbol
```

**Response:**
```json
{
  "sentiment": {
    "symbol": "ETH",
    "overall": "positive",
    "score": 0.7,
    "sources": {
      "twitter": {
        "sentiment": "positive",
        "score": 0.65,
        "mentions": 5432
      },
      "reddit": {
        "sentiment": "positive",
        "score": 0.75,
        "posts": 234
      },
      "news": {
        "sentiment": "positive",
        "score": 0.7,
        "articles": 45
      }
    },
    "trending": true
  }
}
```

#### Get Market Analysis

```http
GET /api/v1/ai/market-analysis?timeframe=24h
Authorization: Bearer <token>
```

#### Get Portfolio Advice

```http
POST /api/v1/ai/portfolio-advice
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "riskTolerance": "medium"
}
```

**Response:**
```json
{
  "advice": {
    "riskTolerance": "medium",
    "portfolio": {
      "totalValue": 10000,
      "totalStaked": 5000,
      "diversification": 4,
      "distribution": {
        "ETH": 2000,
        "BTC": 1500,
        "USDT": 1000,
        "USDC": 500
      }
    },
    "recommendations": [
      {
        "type": "diversification",
        "priority": "high",
        "message": "Consider diversifying across at least 4 different assets..."
      }
    ]
  }
}
```

---

## WebSocket API

### Connection

```javascript
const ws = new WebSocket('ws://localhost:5000/ws');

ws.onopen = () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your-jwt-token'
  }));
};
```

### Subscribe to Channels

```javascript
// Subscribe to price updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channels: ['prices', 'ai:ETH', 'ai:BTC']
}));

// Unsubscribe
ws.send(JSON.stringify({
  type: 'unsubscribe',
  channels: ['ai:BTC']
}));
```

### Message Types

**Price Updates:**
```json
{
  "type": "update",
  "channel": "prices",
  "data": {
    "prices": [
      {
        "symbol": "ETH",
        "price": 2500,
        "change24h": 2.5
      }
    ]
  },
  "timestamp": "2025-10-09T..."
}
```

**User Notifications:**
```json
{
  "type": "notification",
  "data": {
    "type": "transaction",
    "transaction": {...}
  },
  "timestamp": "2025-10-09T..."
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "details": ["Validation error 1", "Validation error 2"]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per IP
- Rate limit headers included in all responses

---

## Database Schema

### User
- walletAddress (unique)
- nonce
- role (user, admin, trader)
- preferences
- portfolioValue
- totalStaked
- totalEarned

### Stake
- userId
- walletAddress
- tokenAddress
- tokenSymbol
- amount
- apy
- duration
- startDate
- endDate
- status (active, completed, withdrawn)
- rewards (earned, claimed, pending)

### Transaction
- userId
- txHash (unique)
- type (transfer, swap, stake, unstake, claim)
- from
- to
- amount
- tokenAddress
- status (pending, confirmed, failed)
- metadata

### TokenPrice
- symbol
- name
- price
- marketCap
- volume24h
- change24h
- TTL: 1 hour

### AIPrediction
- tokenSymbol
- timeframe
- currentPrice
- predictedPrice
- confidence
- trend
- signals
- technicalIndicators
- sentimentScore
- validUntil

---

## Setup & Installation

```bash
cd src/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start MongoDB
mongod

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

---

## Environment Variables

See `.env.example` for all required environment variables.

---

## Security Best Practices

1. Always use HTTPS in production
2. Never commit `.env` file
3. Rotate JWT secrets regularly
4. Implement proper CORS configuration
5. Use rate limiting
6. Validate all inputs
7. Sanitize database queries
8. Keep dependencies updated

---

## Support

For issues or questions, please contact the development team.

**Version:** 1.0.0
**Last Updated:** October 2025
