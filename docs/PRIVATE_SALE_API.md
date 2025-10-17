# Private Sale API Documentation

## Overview

Complete backend API for cryptocurrency private token sale with payment gateway integration, vesting schedules, and comprehensive security features.

## Features

- Multiple payment methods (ETH, USDT, USDC, BTC, Credit Card)
- Integration with Coinbase Commerce, NOWPayments, and CoinGate
- Automated vesting schedules with customizable unlock periods
- Referral system with bonus tracking
- Rate limiting and anti-fraud protection
- Email notifications for all purchase events
- PostgreSQL database with optimized indexes
- Redis caching for performance

## Architecture

```
/Users/ai.place/Crypto/src/backend/
├── routes/
│   └── privateSale.ts          # API endpoints
├── services/
│   └── privateSaleService.ts   # Business logic
├── integrations/
│   └── paymentGateway.ts       # Payment provider integration
├── middleware/
│   └── security.middleware.ts  # Security & rate limiting
├── utils/
│   └── emailService.ts         # Email notifications
├── types/
│   └── privateSale.types.ts    # TypeScript definitions
├── config/
│   └── env.config.ts           # Environment configuration
├── db/
│   └── privateSaleSchema.sql   # Database schema
└── server.ts                    # Express server
```

## API Endpoints

### 1. Create Purchase

**POST** `/api/private-sale/purchase`

Create a new token purchase with payment gateway integration.

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "paymentMethod": "USDT",
  "amountUSD": 1000,
  "referralCode": "ABC123",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "purchase": {
    "id": 1,
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amountUSD": 1000,
    "tokensPurchased": "10000000",
    "bonusTokens": "1000000",
    "totalTokens": "11000000",
    "status": "processing",
    "createdAt": "2025-10-16T20:30:00.000Z"
  },
  "paymentUrl": "https://commerce.coinbase.com/charges/ABC123"
}
```

**Rate Limit:** 10 purchases per hour per wallet

---

### 2. Get Sale Status

**GET** `/api/private-sale/status`

Get current sale statistics and availability.

**Response:**
```json
{
  "success": true,
  "status": {
    "totalTokens": "1000000000000",
    "tokensSold": "50000000000",
    "tokensRemaining": "950000000000",
    "totalRaised": 5000000,
    "totalPurchases": 250,
    "uniqueBuyers": 150,
    "isActive": true,
    "saleEndDate": "2025-11-15T00:00:00.000Z"
  }
}
```

---

### 3. Get User Purchases

**GET** `/api/private-sale/purchases/:wallet`

Get purchase history and vesting schedule for a wallet.

**Response:**
```json
{
  "success": true,
  "data": {
    "purchases": [
      {
        "id": 1,
        "paymentMethod": "USDT",
        "amountUSD": 1000,
        "tokensPurchased": "10000000",
        "bonusTokens": "1000000",
        "totalTokens": "11000000",
        "status": "completed",
        "txHash": "0x123...",
        "createdAt": "2025-10-16T20:30:00.000Z"
      }
    ],
    "totalInvested": 1000,
    "totalTokens": "11000000",
    "claimedTokens": "1100000",
    "claimableTokens": "1100000",
    "vestingSchedule": [
      {
        "unlockDate": "2025-10-16T20:30:00.000Z",
        "tokensUnlocked": "1100000",
        "percentage": 10,
        "isClaimed": true
      },
      {
        "unlockDate": "2025-11-16T20:30:00.000Z",
        "tokensUnlocked": "825000",
        "percentage": 7.5,
        "isClaimed": false
      }
    ]
  }
}
```

---

### 4. Claim Tokens

**POST** `/api/private-sale/claim`

Claim vested tokens that are available.

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "purchaseId": 1,
  "signature": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "0x456...",
  "tokensClaimed": "1100000"
}
```

**Note:** Signature must be created by signing the message:
```
Claim tokens for purchase {purchaseId}
```

---

### 5. Get Referral Stats

**GET** `/api/private-sale/referral/:code`

Get referral statistics for a referral code.

**Response:**
```json
{
  "success": true,
  "stats": {
    "referralCode": "ABC123",
    "totalReferrals": 5,
    "totalBonusTokens": "5000000",
    "referrals": [
      {
        "wallet": "0x123...",
        "tokens": "1000000",
        "date": "2025-10-16T20:30:00.000Z"
      }
    ]
  }
}
```

---

### 6. Webhook Endpoints

**POST** `/api/private-sale/webhook/coinbase`
**POST** `/api/private-sale/webhook/nowpayments`
**POST** `/api/private-sale/webhook/coingate`

Webhook handlers for payment gateway callbacks. These are called automatically by payment providers when payment status changes.

---

## Database Schema

### Tables

1. **private_sale_purchases** - Main purchase records
2. **private_sale_claims** - Token claim history
3. **private_sale_referrals** - Referral tracking
4. **private_sale_config** - Sale configuration
5. **private_sale_payments** - Payment transaction log

### Key Features

- Automatic timestamp updates with triggers
- Optimized indexes for wallet lookups
- Foreign key constraints for data integrity
- JSONB for flexible webhook data storage
- Support for concurrent transactions

---

## Security Features

### 1. Rate Limiting
- **Purchase endpoint:** 10 requests/hour per wallet
- **General API:** 100 requests/15min per IP
- Whitelist support for trusted addresses

### 2. Wallet Verification
- Format validation (EIP-55 checksum)
- Signature verification for claims
- Blacklist checking via Redis

### 3. Anti-Fraud Detection
- Multi-wallet detection from same IP
- Purchase pattern analysis
- Suspicious activity tracking
- Automatic fraud scoring (0-100)

### 4. Transaction Validation
- Duplicate transaction prevention
- Payment ID uniqueness checks
- Webhook signature verification

### 5. Input Sanitization
- XSS prevention
- SQL injection protection
- Type validation

---

## Payment Gateway Integration

### Supported Gateways

1. **Coinbase Commerce**
   - Credit card payments
   - Crypto payments
   - Hosted checkout pages

2. **NOWPayments**
   - 150+ cryptocurrencies
   - Instant payment notifications
   - Fixed and variable amounts

3. **CoinGate**
   - 70+ cryptocurrencies
   - Multiple settlement options
   - Lightning Network support

### Payment Flow

1. User creates purchase request
2. API creates payment with selected gateway
3. User redirected to payment URL
4. User completes payment
5. Gateway sends webhook to API
6. API updates purchase status
7. Email notification sent to user
8. Tokens become available for vesting

---

## Email Notifications

### Email Types

1. **Purchase Initiated** - Payment link sent
2. **Payment Received** - Confirmation with vesting info
3. **Tokens Available** - Claim notification
4. **Vesting Unlock** - Reminder for upcoming unlocks
5. **Purchase Failed** - Error notification

### Providers

- **SMTP** - Any standard email provider
- **AWS SES** - Scalable cloud email

---

## Environment Setup

### Required Variables

```bash
# Database
DB_HOST=localhost
DB_PASSWORD=your_password

# Payment Gateways
COINBASE_API_KEY=your_key
NOWPAYMENTS_API_KEY=your_key
COINGATE_API_KEY=your_key

# Blockchain
TOKEN_CONTRACT_ADDRESS=0x...
PRIVATE_KEY=your_key

# Email (choose one)
SMTP_USER=your_email
SMTP_PASS=your_password
# OR
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

See `.env.example` for complete configuration.

---

## Installation

### 1. Install Dependencies

```bash
cd /Users/ai.place/Crypto
npm install
```

### 2. Setup Database

```bash
# Create database
npm run db:create

# Run migrations
npm run db:migrate
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

---

## Testing

### Health Check

```bash
curl http://localhost:3001/health
```

### Create Test Purchase

```bash
curl -X POST http://localhost:3001/api/private-sale/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "paymentMethod": "USDT",
    "amountUSD": 100,
    "email": "test@example.com"
  }'
```

### Get Sale Status

```bash
curl http://localhost:3001/api/private-sale/status
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common Error Codes

- **400** - Bad request (validation error)
- **401** - Unauthorized (invalid signature)
- **403** - Forbidden (blacklisted, fraud detected)
- **429** - Too many requests (rate limit)
- **500** - Internal server error

---

## Monitoring & Logging

### Request Logging

All requests are logged with:
- Method, path, status code
- Response time
- IP address and user agent
- Timestamp

### Error Tracking

Errors are logged to Redis with:
- Error message and stack trace
- Request details
- Timestamp

### Analytics

API logs stored in Redis (last 10,000 entries) for:
- Performance monitoring
- Usage analytics
- Debugging

---

## Security Best Practices

1. **Never expose private keys in logs**
2. **Use environment variables for secrets**
3. **Enable HTTPS in production**
4. **Implement CORS properly**
5. **Keep dependencies updated**
6. **Monitor suspicious activity**
7. **Backup database regularly**
8. **Use prepared statements (pg does this)**
9. **Validate all input data**
10. **Rate limit aggressively**

---

## Support & Maintenance

### Database Backup

```bash
pg_dump -U postgres private_sale > backup.sql
```

### View Logs

```bash
# API logs
tail -f logs/api.log

# Error logs
tail -f logs/errors.log
```

### Monitor Redis

```bash
redis-cli
> LRANGE api_logs 0 99
> LRANGE api_errors 0 99
```

---

## Future Enhancements

- [ ] Multi-chain support (BSC, Polygon, etc.)
- [ ] KYC/AML integration
- [ ] Advanced analytics dashboard
- [ ] Mobile SDK
- [ ] GraphQL API
- [ ] WebSocket for real-time updates
- [ ] Automated refund processing
- [ ] Multi-signature wallet support
- [ ] Governance token voting
- [ ] Liquidity pool integration

---

## License

MIT

---

## Contact

For support or questions, please open an issue or contact the development team.
