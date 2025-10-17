# HypeAI Referral System - Setup Guide

Complete backend API for referral system with Web3 and Web2 authentication.

## Features

- Web3 Authentication (MetaMask, WalletConnect)
- Web2 Authentication (Email/Password for Russia)
- Multi-tier referral rewards (10% direct, 5% level 2, 2.5% level 3)
- Blockchain transaction verification
- Real-time analytics dashboard
- Leaderboard system
- Comprehensive error handling
- Rate limiting and security
- PostgreSQL database with optimized queries
- JWT session management

---

## Project Structure

```
src/backend/
├── controllers/
│   ├── auth.controller.js          # Authentication logic
│   ├── referral.controller.js      # Referral endpoints
│   ├── purchase.controller.js      # Purchase tracking
│   └── dashboard.controller.js     # Analytics
├── services/
│   └── referral.service.js         # Business logic
├── routes/
│   └── referral.routes.js          # API routes
├── middleware/
│   ├── auth.js                     # JWT verification
│   ├── referral-validation.js      # Request validation
│   ├── rateLimiter.js             # Rate limiting
│   └── errorHandler.js            # Error handling
├── database/
│   └── referral-schema.sql        # PostgreSQL schema
├── utils/
│   └── database-pool.js           # DB connection pool
└── referral-app.js                # Main Express app

tests/backend/
└── referral-api.test.js           # Integration tests

docs/
├── REFERRAL_API_DOCUMENTATION.md  # API docs
└── REFERRAL_SYSTEM_SETUP.md       # This file
```

---

## Prerequisites

1. Node.js >= 16.0.0
2. PostgreSQL >= 13.0
3. npm or yarn

---

## Installation

### 1. Install Dependencies

```bash
cd src/backend
npm install express cors helmet morgan bcrypt jsonwebtoken ethers pg express-rate-limit dotenv
```

### 2. Environment Variables

Create `scripts/.env.database`:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hypeai
DB_USER=hypeai_user
DB_PASSWORD=hypeai_password
DB_POOL_MAX=20
DB_POOL_MIN=5

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Node Environment
NODE_ENV=development

# Blockchain RPC
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-api-key
```

### 3. Database Setup

Create PostgreSQL database:

```bash
# Create database
psql -U postgres -c "CREATE DATABASE hypeai;"

# Create user
psql -U postgres -c "CREATE USER hypeai_user WITH PASSWORD 'hypeai_password';"

# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE hypeai TO hypeai_user;"
```

Run database schema:

```bash
psql -U hypeai_user -d hypeai -f src/backend/database/referral-schema.sql
```

### 4. Verify Database Connection

```bash
node src/backend/utils/database-pool.js
```

Expected output:
```
✅ Database connection OK
   Database: hypeai
   Time: 2025-10-17T12:00:00.000Z
```

---

## Running the Server

### Development Mode

```bash
cd src/backend
node referral-app.js
```

Or with nodemon:

```bash
npm install -g nodemon
nodemon referral-app.js
```

### Production Mode

```bash
NODE_ENV=production node referral-app.js
```

### Using PM2 (Recommended for Production)

```bash
npm install -g pm2

# Start server
pm2 start referral-app.js --name hypeai-referral

# Monitor
pm2 logs hypeai-referral

# Status
pm2 status

# Restart
pm2 restart hypeai-referral

# Stop
pm2 stop hypeai-referral
```

---

## Testing

### Run Integration Tests

```bash
cd tests/backend
npm install --save-dev jest supertest
npm test referral-api.test.js
```

### Manual Testing with cURL

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

#### Get Referral Code
```bash
curl -X GET http://localhost:3000/api/referral/code \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Record Purchase
```bash
curl -X POST http://localhost:3000/api/purchase/record \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "amountUsd": 1000,
    "amountTokens": 50000,
    "tokenPrice": 0.02
  }'
```

---

## Integration with Existing Backend

### Option 1: Standalone Server

Run referral system as separate microservice on different port:

```javascript
// referral-server.js
const app = require('./referral-app');
const PORT = process.env.REFERRAL_PORT || 4000;

app.listen(PORT, () => {
  console.log(`Referral API running on port ${PORT}`);
});
```

### Option 2: Integrate Routes

Add to existing Express app:

```javascript
// In your main app.js
const referralRoutes = require('./routes/referral.routes');

// Mount referral routes
app.use('/api', referralRoutes);
```

### Option 3: API Gateway

Use nginx or API gateway to route `/api/referral/*` to referral service.

---

## Database Maintenance

### Refresh Leaderboard

The leaderboard is a materialized view that should be refreshed periodically:

```bash
# Manual refresh
psql -U hypeai_user -d hypeai -c "REFRESH MATERIALIZED VIEW referral_leaderboard;"
```

Or create a cron job:

```bash
# Add to crontab (refresh every hour)
0 * * * * psql -U hypeai_user -d hypeai -c "REFRESH MATERIALIZED VIEW referral_leaderboard;"
```

### Backup Database

```bash
pg_dump -U hypeai_user hypeai > hypeai_backup_$(date +%Y%m%d).sql
```

### Clean Old Sessions

```sql
DELETE FROM user_sessions WHERE expires_at < NOW();
DELETE FROM auth_nonces WHERE expires_at < NOW();
```

---

## Security Checklist

- [x] JWT secret is strong and unique
- [x] Passwords hashed with bcrypt (12 rounds)
- [x] SQL injection prevented (parameterized queries)
- [x] Rate limiting enabled
- [x] CORS configured properly
- [x] Helmet security headers
- [x] Input validation on all endpoints
- [x] Session management with token tracking
- [x] HTTPS in production (use nginx/reverse proxy)
- [x] Environment variables not committed to git

---

## API Endpoints Summary

### Authentication (6 endpoints)
- POST `/auth/register` - Register with email/password
- POST `/auth/login` - Login
- POST `/auth/logout` - Logout
- GET `/auth/me` - Get current user
- POST `/auth/web3/nonce` - Get Web3 nonce
- POST `/auth/web3/verify` - Verify Web3 signature

### Referral (8 endpoints)
- GET `/referral/code` - Get referral code
- POST `/referral/register` - Register referral
- GET `/referral/stats` - Get stats
- GET `/referral/list` - Get referral list
- GET `/referral/rewards/pending` - Get pending rewards
- POST `/referral/claim` - Claim rewards
- GET `/referral/chain` - Get referral chain
- GET `/referral/validate/:code` - Validate code
- GET `/referral/leaderboard` - Get leaderboard

### Purchase (5 endpoints)
- POST `/purchase/record` - Record purchase
- POST `/purchase/confirm/:id` - Confirm purchase
- GET `/purchase/history` - Get history
- GET `/purchase/verify/:txHash` - Verify transaction
- GET `/purchase/by-tx/:txHash` - Get by TX hash

### Dashboard (5 endpoints)
- GET `/dashboard/overview` - Overview
- GET `/dashboard/earnings` - Earnings breakdown
- GET `/dashboard/referrals` - Referral analytics
- GET `/dashboard/stats` - Stats summary
- GET `/dashboard/activity` - Recent activity

**Total: 24 endpoints**

---

## Performance Optimization

### Database Indexes

All critical indexes are created automatically by schema:

```sql
-- Users
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_email ON users(email);

-- Referrals
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);

-- Purchases
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_tx_hash ON purchases(tx_hash);

-- Rewards
CREATE INDEX idx_rewards_referrer ON referral_rewards(referrer_id);
CREATE INDEX idx_rewards_status ON referral_rewards(status);
```

### Connection Pooling

Database pool is configured for optimal performance:

```javascript
max: 20,  // Maximum pool size
min: 5,   // Minimum pool size
idleTimeoutMillis: 30000,
connectionTimeoutMillis: 10000
```

### Caching Recommendations

Consider adding Redis for:
- Session storage
- Rate limiting counters
- Leaderboard cache
- Frequently accessed referral stats

---

## Monitoring

### Health Check Endpoint

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-10-17T12:00:00.000Z",
  "service": "HypeAI Referral System",
  "version": "1.0.0",
  "database": "connected"
}
```

### Database Statistics

```javascript
const { getPoolStats } = require('./utils/database-pool');
console.log(getPoolStats());
```

### Error Logging

All errors are logged with context:

```javascript
logger.error('Error message', {
  error: err.message,
  stack: err.stack,
  path: req.path,
  method: req.method,
  ip: req.ip
});
```

---

## Troubleshooting

### Database Connection Failed

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check connection parameters
psql -U hypeai_user -d hypeai -h localhost
```

### JWT Token Invalid

- Check if JWT_SECRET matches between registration and verification
- Verify token hasn't expired (7 day expiry)
- Ensure Bearer token format: `Authorization: Bearer <token>`

### Rate Limit Issues

- Check if IP is being properly detected
- Adjust limits in `middleware/rateLimiter.js`
- Consider using Redis for distributed rate limiting

### Database Slow Queries

- Check indexes are created: `\di` in psql
- Analyze slow queries: `EXPLAIN ANALYZE <query>`
- Monitor pool stats with `getPoolStats()`

---

## Deployment

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY src/backend ./src/backend
COPY scripts/.env.database ./scripts/.env.database

EXPOSE 3000

CMD ["node", "src/backend/referral-app.js"]
```

Build and run:

```bash
docker build -t hypeai-referral .
docker run -p 3000:3000 --env-file scripts/.env.database hypeai-referral
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.hypeai.io;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Support & Documentation

- **API Documentation**: `docs/REFERRAL_API_DOCUMENTATION.md`
- **Database Schema**: `src/backend/database/referral-schema.sql`
- **Integration Tests**: `tests/backend/referral-api.test.js`

---

## License

MIT License - HypeAI Team 2025
