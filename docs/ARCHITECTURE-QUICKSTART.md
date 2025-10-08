# NeuralChain Architecture - Quick Reference

## Overview
NeuralChain is an AI-powered blockchain platform combining predictive analytics with decentralized finance.

## Tech Stack at a Glance

### Blockchain Layer
- **Primary**: Ethereum Mainnet (security & finality)
- **L2**: Polygon PoS (scalability & low fees)
- **Language**: Solidity 0.8.20
- **Framework**: Hardhat
- **Libraries**: OpenZeppelin 5.0+
- **Oracles**: Chainlink

### Smart Contracts (4 Core)
1. **NeuralToken.sol** - ERC-20 with tokenomics
2. **StakingRewards.sol** - Dynamic APY staking
3. **AIOracle.sol** - Off-chain AI integration
4. **GovernanceDAO.sol** - Token-weighted voting

### Backend Services
- **API Gateway**: Node.js 20 + Express + TypeScript
- **GraphQL**: Apollo Server 4.9+
- **AI Service**: Python 3.11 + FastAPI
- **Database**: PostgreSQL 16 (primary) + Redis 7.2 (cache)
- **Time-Series**: TimescaleDB 2.13+
- **Queue**: RabbitMQ 3.12+
- **Indexer**: The Graph Protocol

### Frontend dApp
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.4 + shadcn/ui
- **Web3**: wagmi 2.0 + viem 2.0
- **Wallet**: WalletConnect v2 + RainbowKit
- **State**: Zustand 4.4 + TanStack Query 5.0
- **Charts**: Recharts 2.10

### AI/ML Stack
- **Framework**: PyTorch 2.1+
- **API**: FastAPI 0.104+
- **NLP**: Hugging Face Transformers
- **Serving**: TorchServe
- **Time-Series**: Prophet + ARIMA
- **Tracking**: MLflow

### DevOps
- **Containers**: Docker 24+
- **Orchestration**: Kubernetes 1.28+
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack 8.11+
- **CDN**: Cloudflare

## Key Architecture Decisions

### Tokenomics
- **Total Supply**: 1,000,000,000 NEURAL
- **Burn Rate**: 1% per transfer
- **Max Wallet**: 2% of supply
- **Distribution**:
  - 40% Public Sale & Liquidity
  - 20% Team (24-month vesting)
  - 15% AI Rewards Pool
  - 10% Ecosystem Development
  - 10% Strategic Partners
  - 5% Marketing & Community

### Staking APY
| Lock Period | Base APY | AI Bonus |
|-------------|----------|----------|
| 30 days     | 12%      | +10-50%  |
| 90 days     | 24%      | +10-50%  |
| 180 days    | 48%      | +10-50%  |
| 365 days    | 96%      | +10-50%  |

### Performance Targets
- API Response: < 100ms (p95)
- Transaction Confirm: < 5 seconds
- AI Prediction: < 2 seconds
- WebSocket Latency: < 50ms
- Concurrent Users: 100,000+
- Uptime: 99.95%

## Project Structure

```
neuralchain/
├── contracts/                    # Smart contracts
│   ├── NeuralToken.sol
│   ├── StakingRewards.sol
│   ├── AIOracle.sol
│   └── GovernanceDAO.sol
├── backend/
│   ├── api-gateway/             # Node.js API
│   ├── ai-service/              # Python AI
│   ├── indexer/                 # The Graph
│   └── workers/                 # Background jobs
├── frontend/
│   ├── app/                     # Next.js pages
│   ├── components/              # React components
│   ├── hooks/                   # Custom hooks
│   ├── lib/                     # Utilities
│   └── types/                   # TypeScript types
├── ml-models/                   # AI/ML models
│   ├── price-prediction/
│   ├── sentiment-analysis/
│   └── portfolio-optimization/
├── infrastructure/              # DevOps
│   ├── kubernetes/
│   ├── docker/
│   └── terraform/
├── tests/                       # Test suites
└── docs/                        # Documentation
    ├── architecture.md          # Full architecture
    └── diagrams/                # Mermaid diagrams
```

## AI Models

### 1. Price Prediction Model
- **Architecture**: Hybrid LSTM + Transformer
- **Input**: OHLCV + Technical Indicators + On-chain + Sentiment
- **Output**: 24h, 7d, 30d predictions with confidence
- **Accuracy Target**: 70%+ (24h), 60%+ (7d)

### 2. Sentiment Analysis
- **Base Model**: FinBERT (fine-tuned)
- **Sources**: Twitter, Reddit, Discord, News, On-chain
- **Output**: -100 to +100 sentiment score
- **Update Frequency**: Every 5 minutes

### 3. Portfolio Optimizer
- **Method**: Modern Portfolio Theory + Reinforcement Learning
- **Algorithm**: PPO (Proximal Policy Optimization)
- **Output**: Optimal allocation weights
- **Constraints**: Risk tolerance, max position size

## Security Measures

### Smart Contract Security
- ✅ Multi-audit (CertiK, OpenZeppelin, Trail of Bits)
- ✅ Formal verification
- ✅ Bug bounty ($500k+)
- ✅ 48-hour timelock
- ✅ Emergency pause mechanism
- ✅ Multi-sig for admin functions

### Application Security
- ✅ JWT authentication (1-hour expiry)
- ✅ Rate limiting (100 req/min per IP)
- ✅ DDoS protection (Cloudflare)
- ✅ Input validation & sanitization
- ✅ CORS whitelist
- ✅ AES-256 encryption at rest
- ✅ TLS 1.3 in transit
- ✅ HSM for private keys

## Scalability Strategy

### Horizontal Scaling
- Load balancer (Nginx)
- 3+ API server instances
- Auto-scaling (K8s HPA)
- Database read replicas
- Redis cluster (3+ nodes)

### Caching Layers
1. Browser cache (5 min)
2. CDN cache (1 hour)
3. Redis cache (5 min)
4. Database query cache (30 sec)

### AI Optimization
- Model quantization (INT8)
- TensorRT inference
- Batch predictions
- GPU acceleration (A100)
- 1-hour result cache

## Development Workflow

### Local Setup
```bash
# Clone repository
git clone https://github.com/neuralchain/platform.git
cd platform

# Install dependencies
npm install              # Root + frontend
cd backend && npm install
cd ai-service && pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your keys

# Start local blockchain
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.ts --network localhost

# Start services
docker-compose up -d     # PostgreSQL, Redis, RabbitMQ
npm run dev:api          # API Gateway
npm run dev:ai           # AI Service
npm run dev:frontend     # Next.js app
```

### Testing
```bash
# Smart contracts
npx hardhat test
npx hardhat coverage

# Backend
npm run test:api
npm run test:ai

# Frontend
npm run test:frontend
npm run test:e2e

# Integration
npm run test:integration
```

### Deployment
```bash
# Build containers
docker build -t neuralchain/api:latest ./backend/api-gateway
docker build -t neuralchain/ai:latest ./backend/ai-service
docker build -t neuralchain/frontend:latest ./frontend

# Deploy to K8s
kubectl apply -f infrastructure/kubernetes/
kubectl rollout status deployment/api-gateway
kubectl rollout status deployment/ai-service
kubectl rollout status deployment/frontend

# Deploy contracts (mainnet)
npx hardhat run scripts/deploy.ts --network mainnet
npx hardhat verify --network mainnet DEPLOYED_ADDRESS
```

## Monitoring & Observability

### Metrics to Track
- API latency (p50, p95, p99)
- Error rates (4xx, 5xx)
- Transaction success rate
- AI model accuracy
- Gas costs
- Active users
- TVL (Total Value Locked)

### Dashboards
- **Grafana**: System metrics, API performance
- **The Graph**: Blockchain data explorer
- **MLflow**: Model performance tracking
- **Sentry**: Error tracking
- **Jaeger**: Distributed tracing

## API Endpoints Reference

### REST API
```
GET    /api/v1/tokens/:address              # Token information
GET    /api/v1/staking/pools                # Available pools
POST   /api/v1/staking/stake                # Stake tokens
POST   /api/v1/staking/unstake              # Unstake tokens
GET    /api/v1/governance/proposals         # List proposals
POST   /api/v1/governance/vote              # Cast vote
GET    /api/v1/ai/predictions/:token        # AI predictions
GET    /api/v1/analytics/portfolio/:address # Portfolio analytics
```

### GraphQL
```graphql
query {
  token(address: "0x...") {
    name
    symbol
    price
    marketCap
  }

  stakingPools {
    apy
    lockDays
    totalStaked
  }

  aiPredictions(type: PRICE) {
    timeframe
    value
    confidence
  }
}
```

### WebSocket Events
```javascript
// Subscribe to price updates
socket.emit('subscribe:price', { token: '0x...' });
socket.on('price:update', (data) => console.log(data));

// Subscribe to AI predictions
socket.emit('subscribe:predictions', { token: '0x...' });
socket.on('prediction:new', (data) => console.log(data));
```

## Smart Contract Addresses (Testnet)

### Sepolia (Ethereum Testnet)
- NeuralToken: `0x...` (TBD)
- StakingRewards: `0x...` (TBD)
- AIOracle: `0x...` (TBD)
- GovernanceDAO: `0x...` (TBD)

### Mumbai (Polygon Testnet)
- NeuralToken: `0x...` (TBD)
- StakingRewards: `0x...` (TBD)
- AIOracle: `0x...` (TBD)
- GovernanceDAO: `0x...` (TBD)

## Next Steps for Implementation

### Phase 1: Foundation (Weeks 1-4)
1. ✅ Architecture design (complete)
2. ⏳ Smart contract development
3. ⏳ Contract testing & audit prep
4. ⏳ Backend API scaffold
5. ⏳ Frontend prototype

### Phase 2: AI Integration (Weeks 5-8)
1. ⏳ Train price prediction model
2. ⏳ Implement sentiment analyzer
3. ⏳ Build portfolio optimizer
4. ⏳ AI Oracle integration
5. ⏳ Model serving infrastructure

### Phase 3: Testing & Security (Weeks 9-12)
1. ⏳ Smart contract audits
2. ⏳ Penetration testing
3. ⏳ Load testing
4. ⏳ Bug bounty program
5. ⏳ Security documentation

### Phase 4: Launch (Weeks 13-16)
1. ⏳ Testnet deployment
2. ⏳ Public beta
3. ⏳ Mainnet deployment
4. ⏳ Token generation event
5. ⏳ Marketing campaign

## Support & Resources

- **Documentation**: https://docs.neuralchain.io
- **GitHub**: https://github.com/neuralchain/platform
- **Discord**: https://discord.gg/neuralchain
- **Twitter**: @neuralchain
- **Email**: dev@neuralchain.io

---

**Last Updated**: 2025-10-09
**Version**: 1.0.0
**Status**: Ready for Implementation
