# Backend Setup Guide

## Quick Start

```bash
# Navigate to backend directory
cd /Users/ai.place/Crypto/src/backend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit environment variables
nano .env

# Start MongoDB (required)
# Option 1: Local MongoDB
mongod

# Option 2: Docker
docker run -d -p 27017:27017 --name crypto-mongodb mongo:latest

# Start development server with auto-reload
npm run dev

# Or start production server
npm start
```

## Environment Configuration

Edit `/Users/ai.place/Crypto/src/backend/.env`:

```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crypto-platform
JWT_SECRET=your-super-secret-key-here
CORS_ORIGIN=http://localhost:3000
```

## Project Structure

```
/Users/ai.place/Crypto/src/backend/
├── server.js                 # Main application entry point
├── package.json              # Dependencies and scripts
├── .env.example              # Environment template
│
├── config/
│   ├── database.js           # MongoDB connection
│   └── logger.js             # Winston logger setup
│
├── middleware/
│   ├── auth.js               # JWT & Web3 authentication
│   ├── errorHandler.js       # Global error handling
│   ├── rateLimiter.js        # Rate limiting
│   └── validation.js         # Request validation schemas
│
├── models/
│   ├── User.js               # User schema
│   ├── Stake.js              # Staking schema
│   ├── Transaction.js        # Transaction schema
│   ├── TokenPrice.js         # Token price cache
│   └── AIPrediction.js       # AI predictions
│
├── controllers/
│   ├── auth.controller.js    # Authentication logic
│   ├── user.controller.js    # User management
│   ├── staking.controller.js # Staking operations
│   ├── token.controller.js   # Token price feeds
│   ├── transaction.controller.js
│   ├── analytics.controller.js
│   └── ai.controller.js      # AI features
│
├── services/
│   ├── staking.service.js    # Staking business logic
│   ├── token.service.js      # Price feed integration
│   ├── transaction.service.js
│   ├── analytics.service.js  # Analytics calculations
│   └── ai.service.js         # AI/ML integration
│
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── staking.routes.js
│   ├── token.routes.js
│   ├── transaction.routes.js
│   ├── analytics.routes.js
│   └── ai.routes.js
│
├── websocket/
│   └── wsServer.js           # WebSocket server
│
└── logs/
    ├── error.log
    └── combined.log
```

## Key Features

### 1. Web3 Wallet Authentication
- Nonce-based signature verification
- JWT token generation
- No password required
- Supports MetaMask, WalletConnect, etc.

### 2. Staking Pools
- Multiple token support (ETH, USDT, USDC, DAI)
- Flexible APY rates (5.5% - 8%)
- Auto-reward calculation
- Early/late unstaking support

### 3. Token Price Feeds
- Real-time price updates from CoinGecko
- 5-minute caching layer
- Historical price data
- Market analytics

### 4. AI Integration
- Price predictions using technical analysis
- Trading signals (buy/sell/hold)
- Sentiment analysis from social media
- Portfolio recommendations
- Risk-adjusted advice

### 5. Transaction Tracking
- Complete transaction history
- Status monitoring (pending, confirmed, failed)
- Volume analytics
- Gas fee tracking

### 6. Analytics Engine
- Portfolio performance metrics
- P&L analysis
- ROI calculations
- Staking statistics
- Market overview

### 7. WebSocket Real-time Updates
- Live price feeds
- Transaction notifications
- Stake updates
- AI predictions broadcast

## API Endpoints Summary

### Authentication
- `GET /api/v1/auth/nonce/:walletAddress` - Get nonce
- `POST /api/v1/auth/verify` - Authenticate
- `POST /api/v1/auth/logout` - Logout

### User
- `GET /api/v1/users/profile` - Get profile
- `PUT /api/v1/users/profile` - Update profile
- `GET /api/v1/users/dashboard` - Dashboard data

### Staking
- `GET /api/v1/staking/pools` - Available pools
- `POST /api/v1/staking/stake` - Create stake
- `GET /api/v1/staking/user` - User stakes
- `POST /api/v1/staking/unstake` - Unstake
- `POST /api/v1/staking/:id/claim` - Claim rewards

### Tokens
- `GET /api/v1/tokens/prices` - Current prices
- `GET /api/v1/tokens/:symbol` - Token details
- `GET /api/v1/tokens/:symbol/history` - Price history
- `GET /api/v1/tokens/user/portfolio` - User portfolio

### Transactions
- `GET /api/v1/transactions` - Transaction history
- `GET /api/v1/transactions/:txHash` - Details
- `POST /api/v1/transactions/track` - Track new
- `GET /api/v1/transactions/stats/summary` - Statistics

### Analytics
- `GET /api/v1/analytics/portfolio` - Portfolio analytics
- `GET /api/v1/analytics/performance` - Performance metrics
- `GET /api/v1/analytics/pnl` - P&L analysis
- `GET /api/v1/analytics/staking` - Staking analytics
- `GET /api/v1/analytics/market` - Market analytics

### AI
- `POST /api/v1/ai/predict` - Price prediction
- `GET /api/v1/ai/signals/:symbol` - Trading signals
- `GET /api/v1/ai/sentiment/:symbol` - Sentiment analysis
- `GET /api/v1/ai/market-analysis` - Market analysis
- `POST /api/v1/ai/portfolio-advice` - Portfolio advice

## Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- auth.test.js

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Database Schema

### Collections:
1. **users** - User profiles and wallet addresses
2. **stakes** - Staking positions and rewards
3. **transactions** - All transaction records
4. **tokenprices** - Cached price data (TTL: 1 hour)
5. **aipredictions** - AI predictions (auto-expire)

## Security Features

- Helmet.js for HTTP headers
- CORS configuration
- Rate limiting (100 req/15min)
- Input validation with Joi
- JWT token expiration (7 days)
- MongoDB injection prevention
- Error sanitization

## Performance Optimizations

- MongoDB indexes on frequently queried fields
- Token price caching (5-minute TTL)
- Connection pooling
- Compression middleware
- Aggregation pipelines for analytics
- WebSocket for real-time updates

## Deployment Checklist

- [ ] Set production environment variables
- [ ] Configure MongoDB Atlas or production database
- [ ] Set strong JWT_SECRET
- [ ] Configure CORS_ORIGIN
- [ ] Set up SSL/HTTPS
- [ ] Configure reverse proxy (nginx)
- [ ] Set up process manager (PM2)
- [ ] Configure logging
- [ ] Set up monitoring (New Relic, DataDog)
- [ ] Configure backups
- [ ] Set up CI/CD pipeline

## Troubleshooting

### MongoDB Connection Failed
```bash
# Check MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod --dbpath /path/to/data

# Or use Docker
docker start crypto-mongodb
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

### JWT Token Invalid
- Ensure JWT_SECRET matches in .env
- Check token expiration
- Verify token format in Authorization header

### Rate Limit Exceeded
- Wait 15 minutes
- Increase RATE_LIMIT_MAX_REQUESTS in .env
- Whitelist specific IPs

## Monitoring & Logging

Logs are stored in `/Users/ai.place/Crypto/src/backend/logs/`:
- `error.log` - Error-level logs
- `combined.log` - All logs

View logs in real-time:
```bash
tail -f logs/combined.log
tail -f logs/error.log
```

## Production Deployment

```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name crypto-backend
pm2 startup
pm2 save

# Using Docker
docker build -t crypto-backend .
docker run -d -p 5000:5000 crypto-backend

# Using systemd
sudo systemctl start crypto-backend
sudo systemctl enable crypto-backend
```

## Support & Documentation

- Full API Documentation: `/Users/ai.place/Crypto/docs/api-docs.md`
- Swagger/OpenAPI: Coming soon
- Postman Collection: Coming soon

---

**Version:** 1.0.0
**Last Updated:** October 2025
