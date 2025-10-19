# Private Sale Dashboard - Technical Specifications

**Version:** 1.0.0
**Last Updated:** 2025-10-18
**Status:** Design Phase

---

## 1. System Overview

The Private Sale Dashboard is a Next.js application that provides a comprehensive interface for users to participate in the HypeAI token private sale on Binance Smart Chain (BSC).

### 1.1 Architecture Pattern

**Pattern:** JAMstack + Web3

```
┌─────────────────────────────────────────────────┐
│              Frontend (Next.js)                  │
│  ┌─────────────────────────────────────────┐   │
│  │         React Components                 │   │
│  │  ┌──────────┐  ┌──────────┐            │   │
│  │  │ UI Layer │  │ Business │            │   │
│  │  │          │  │  Logic   │            │   │
│  │  └────┬─────┘  └────┬─────┘            │   │
│  └───────┼─────────────┼──────────────────┘   │
│          │             │                        │
│  ┌───────▼─────────────▼──────────────────┐   │
│  │      State Management (Context)        │   │
│  └───────┬──────────────┬─────────────────┘   │
│          │              │                       │
├──────────┼──────────────┼───────────────────── │
│          │              │                       │
│  ┌───────▼────┐  ┌──────▼──────┐              │
│  │  API Layer │  │ Web3 Layer  │              │
│  └───────┬────┘  └──────┬──────┘              │
└──────────┼───────────────┼─────────────────────┘
           │               │
           │               │
┌──────────▼────┐  ┌───────▼──────────┐
│   Backend     │  │  Smart Contracts │
│   (API)       │  │   (BSC Network)  │
└───────────────┘  └──────────────────┘
```

---

## 2. Technical Requirements

### 2.1 Browser Support

```
Chrome/Edge: >= 90
Firefox: >= 88
Safari: >= 14
Mobile Safari: >= 14
Chrome Android: >= 90
```

### 2.2 Wallet Support

```
- MetaMask (Primary)
- WalletConnect (Mobile)
- Trust Wallet
- Binance Chain Wallet
- Coinbase Wallet
```

### 2.3 Network Requirements

```
Primary Network: BSC Mainnet (Chain ID: 56)
Testnet Support: BSC Testnet (Chain ID: 97)

RPC Endpoints:
- Primary: https://bsc-dataseed1.binance.org
- Backup: https://bsc-dataseed2.binance.org
```

---

## 3. Component Specifications

### 3.1 Component Directory Structure

```
src/frontend/components/
├── dashboard/
│   ├── layout/
│   │   ├── DashboardLayout.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   └── Footer.tsx
│   ├── overview/
│   │   ├── StatsGrid.tsx
│   │   ├── StatsCard.tsx
│   │   ├── TokenPriceWidget.tsx
│   │   ├── VestingProgressBar.tsx
│   │   ├── RecentActivityFeed.tsx
│   │   └── QuickActionButtons.tsx
│   ├── purchase/
│   │   ├── BuyTokensPage.tsx
│   │   ├── PaymentMethodSelector.tsx
│   │   ├── PurchaseCalculator.tsx
│   │   ├── BonusTierDisplay.tsx
│   │   ├── TransactionPreview.tsx
│   │   └── TransactionStatusModal.tsx
│   ├── history/
│   │   ├── PurchaseHistoryPage.tsx
│   │   ├── PurchaseHistoryTable.tsx
│   │   ├── PurchaseDetailCard.tsx
│   │   ├── FilterBar.tsx
│   │   └── ExportButton.tsx
│   ├── referral/
│   │   ├── ReferralPage.tsx
│   │   ├── ReferralLinkGenerator.tsx
│   │   ├── ReferralStatsCards.tsx
│   │   ├── ReferralTable.tsx
│   │   ├── SocialShareButtons.tsx
│   │   └── CommissionCalculator.tsx
│   ├── wallet/
│   │   ├── WalletPage.tsx
│   │   ├── WalletBalanceCard.tsx
│   │   ├── TokenListTable.tsx
│   │   ├── VestingScheduleTimeline.tsx
│   │   ├── ClaimTokensButton.tsx
│   │   └── AddToWalletButton.tsx
│   └── settings/
│       ├── SettingsPage.tsx
│       ├── ProfileSettings.tsx
│       ├── NotificationPreferences.tsx
│       ├── SecuritySettings.tsx
│       └── LanguageCurrencySettings.tsx
└── ui/
    ├── Button.tsx
    ├── Card.tsx
    ├── Input.tsx
    ├── Badge.tsx
    ├── Loading.tsx
    ├── Modal.tsx
    ├── Tooltip.tsx
    └── Chart.tsx
```

### 3.2 Core Component Props

#### DashboardLayout

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showSidebar?: boolean;
  className?: string;
}
```

#### StatsCard

```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  color?: 'gold' | 'green' | 'red' | 'blue';
  loading?: boolean;
  onClick?: () => void;
}
```

#### PurchaseCalculator

```typescript
interface PurchaseCalculatorProps {
  tokenPrice: number;
  bonusTiers: BonusTier[];
  minPurchase: number;
  maxPurchase: number;
  onCalculate: (result: CalculationResult) => void;
  disabled?: boolean;
}

interface BonusTier {
  minAmount: number;
  maxAmount?: number;
  bonus: number;
}

interface CalculationResult {
  usdAmount: number;
  baseTokens: number;
  bonusTokens: number;
  bonusPercentage: number;
  totalTokens: number;
}
```

#### TransactionPreview

```typescript
interface TransactionPreviewProps {
  amount: number;
  tokens: number;
  bonus: number;
  paymentMethod: PaymentMethod;
  gasFee: string;
  total: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

---

## 4. State Management

### 4.1 Context Providers

#### UserContext

```typescript
interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

interface User {
  id: string;
  walletAddress?: string;
  email?: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  preferences: UserPreferences;
}
```

#### WalletContext

```typescript
interface WalletContextType {
  account: string | null;
  chainId: number | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  connect: (wallet: WalletType) => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

type WalletType = 'metamask' | 'walletconnect' | 'trust' | 'binance';
```

#### PrivateSaleContext

```typescript
interface PrivateSaleContextType {
  config: PrivateSaleConfig;
  purchases: Purchase[];
  statistics: SaleStatistics;
  isLoading: boolean;
  refresh: () => Promise<void>;
  buyTokens: (params: PurchaseParams) => Promise<PurchaseResult>;
}

interface PrivateSaleConfig {
  tokenPrice: number;
  minPurchase: number;
  maxPurchase: number;
  bonusTiers: BonusTier[];
  startDate: Date;
  endDate: Date;
  targetAmount: number;
  currentAmount: number;
  vestingSchedule: VestingSchedule;
}

interface Purchase {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  baseTokens: number;
  bonusTokens: number;
  totalTokens: number;
  transactionHash: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}
```

### 4.2 Custom Hooks

#### usePrivateSale

```typescript
function usePrivateSale() {
  const {
    config,
    purchases,
    statistics,
    isLoading,
    refresh,
    buyTokens,
  } = useContext(PrivateSaleContext);

  const calculateTokens = useCallback(
    (usdAmount: number): CalculationResult => {
      // Calculate base tokens
      const baseTokens = usdAmount / config.tokenPrice;

      // Calculate bonus
      const tier = config.bonusTiers.find(
        (t) => usdAmount >= t.minAmount && (!t.maxAmount || usdAmount <= t.maxAmount)
      );
      const bonusPercentage = tier?.bonus || 0;
      const bonusTokens = (baseTokens * bonusPercentage) / 100;

      return {
        usdAmount,
        baseTokens,
        bonusTokens,
        bonusPercentage,
        totalTokens: baseTokens + bonusTokens,
      };
    },
    [config]
  );

  return {
    config,
    purchases,
    statistics,
    isLoading,
    refresh,
    buyTokens,
    calculateTokens,
  };
}
```

#### useWallet

```typescript
function useWallet() {
  const context = useContext(WalletContext);

  const switchToBSC = useCallback(async () => {
    try {
      await context.switchNetwork(56);
    } catch (error) {
      if (error.code === 4902) {
        // Chain not added, add it
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x38',
            chainName: 'Binance Smart Chain',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'BNB',
              decimals: 18,
            },
            rpcUrls: ['https://bsc-dataseed1.binance.org'],
            blockExplorerUrls: ['https://bscscan.com'],
          }],
        });
      }
    }
  }, [context]);

  return {
    ...context,
    switchToBSC,
  };
}
```

#### useVesting

```typescript
function useVesting(userId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['vesting', userId],
    queryFn: () => fetchVestingSchedule(userId),
    refetchInterval: 60000, // Refresh every minute
  });

  const calculateUnlocked = useCallback(() => {
    if (!data) return 0;

    const now = Date.now();
    return data.schedule.reduce((total, period) => {
      if (period.unlockDate <= now) {
        return total + period.amount;
      }
      return total;
    }, 0);
  }, [data]);

  const calculateLocked = useCallback(() => {
    if (!data) return 0;
    return data.totalTokens - calculateUnlocked();
  }, [data, calculateUnlocked]);

  return {
    schedule: data?.schedule || [],
    totalTokens: data?.totalTokens || 0,
    unlockedTokens: calculateUnlocked(),
    lockedTokens: calculateLocked(),
    isLoading,
    error,
  };
}
```

---

## 5. API Specifications

### 5.1 REST API Endpoints

#### Authentication

```typescript
// POST /api/auth/login
Request: {
  walletAddress?: string;
  email?: string;
  password?: string;
  signature?: string; // For wallet login
}
Response: {
  success: boolean;
  user: User;
  token: string;
}

// POST /api/auth/logout
Response: {
  success: boolean;
}

// GET /api/auth/me
Response: {
  success: boolean;
  user: User;
}
```

#### Private Sale

```typescript
// GET /api/private-sale/config
Response: {
  success: boolean;
  config: PrivateSaleConfig;
}

// POST /api/private-sale/purchase
Request: {
  amount: number;
  paymentMethod: PaymentMethod;
  transactionHash: string;
}
Response: {
  success: boolean;
  purchase: Purchase;
}

// GET /api/private-sale/purchases?userId={userId}
Response: {
  success: boolean;
  purchases: Purchase[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// GET /api/private-sale/stats
Response: {
  success: boolean;
  stats: {
    totalRaised: number;
    totalInvestors: number;
    averageInvestment: number;
    timeRemaining: number;
    progress: number;
  };
}
```

#### Wallet & Vesting

```typescript
// GET /api/wallet/balance?address={address}
Response: {
  success: boolean;
  balance: {
    total: number;
    available: number;
    vested: number;
    locked: number;
  };
}

// POST /api/wallet/claim
Request: {
  walletAddress: string;
}
Response: {
  success: boolean;
  amount: number;
  transactionHash: string;
}

// GET /api/wallet/vesting?userId={userId}
Response: {
  success: boolean;
  vesting: {
    totalTokens: number;
    schedule: VestingPeriod[];
  };
}

interface VestingPeriod {
  id: string;
  amount: number;
  unlockDate: Date;
  claimed: boolean;
}
```

#### Referrals

```typescript
// GET /api/referrals?userId={userId}
Response: {
  success: boolean;
  referrals: Referral[];
  stats: {
    totalReferrals: number;
    totalEarnings: number;
    conversionRate: number;
  };
}

// POST /api/referrals/claim
Request: {
  userId: string;
}
Response: {
  success: boolean;
  amount: number;
  transactionHash: string;
}
```

### 5.2 Real-time Updates

**WebSocket Events:**

```typescript
// Token price updates
ws.on('price:update', (data: { price: number; change24h: number }) => {
  // Update UI
});

// Sale statistics updates
ws.on('stats:update', (data: SaleStatistics) => {
  // Update dashboard
});

// User transaction updates
ws.on('transaction:confirmed', (data: { txHash: string; status: string }) => {
  // Update purchase history
});

// Vesting unlock notifications
ws.on('vesting:unlocked', (data: { amount: number; period: number }) => {
  // Show notification
});
```

---

## 6. Smart Contract Integration

### 6.1 Contract Addresses

```typescript
const CONTRACTS = {
  PRIVATE_SALE: {
    mainnet: '0x...', // BSC Mainnet
    testnet: '0x...', // BSC Testnet
  },
  HYPE_TOKEN: {
    mainnet: '0x...',
    testnet: '0x...',
  },
  VESTING: {
    mainnet: '0x...',
    testnet: '0x...',
  },
};
```

### 6.2 Contract Methods

#### Private Sale Contract

```typescript
// Purchase tokens
async function purchaseTokens(
  amount: BigNumber,
  paymentToken: string
): Promise<TransactionResponse> {
  const contract = getPrivateSaleContract();
  return await contract.purchase(amount, paymentToken);
}

// Get user allocation
async function getUserAllocation(
  userAddress: string
): Promise<{ total: BigNumber; claimed: BigNumber; vested: BigNumber }> {
  const contract = getPrivateSaleContract();
  return await contract.allocations(userAddress);
}
```

#### Vesting Contract

```typescript
// Claim vested tokens
async function claimVestedTokens(): Promise<TransactionResponse> {
  const contract = getVestingContract();
  return await contract.claim();
}

// Get vesting schedule
async function getVestingSchedule(
  beneficiary: string
): Promise<VestingSchedule> {
  const contract = getVestingContract();
  const schedule = await contract.getSchedule(beneficiary);
  return parseVestingSchedule(schedule);
}

// Calculate claimable amount
async function getClaimableAmount(
  beneficiary: string
): Promise<BigNumber> {
  const contract = getVestingContract();
  return await contract.claimable(beneficiary);
}
```

### 6.3 Error Handling

```typescript
const WEB3_ERRORS = {
  USER_REJECTED: 4001,
  UNAUTHORIZED: 4100,
  UNSUPPORTED_METHOD: 4200,
  DISCONNECTED: 4900,
  CHAIN_DISCONNECTED: 4901,
};

function handleWeb3Error(error: any): string {
  switch (error.code) {
    case WEB3_ERRORS.USER_REJECTED:
      return 'Transaction rejected by user';
    case WEB3_ERRORS.UNAUTHORIZED:
      return 'Please connect your wallet';
    case WEB3_ERRORS.CHAIN_DISCONNECTED:
      return 'Please switch to BSC network';
    default:
      return error.message || 'Transaction failed';
  }
}
```

---

## 7. Security Specifications

### 7.1 Input Validation

```typescript
// Amount validation
const validatePurchaseAmount = (amount: number, config: PrivateSaleConfig) => {
  if (amount < config.minPurchase) {
    throw new Error(`Minimum purchase is $${config.minPurchase}`);
  }
  if (amount > config.maxPurchase) {
    throw new Error(`Maximum purchase is $${config.maxPurchase}`);
  }
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Invalid amount');
  }
  return true;
};

// Address validation
const validateAddress = (address: string) => {
  if (!ethers.utils.isAddress(address)) {
    throw new Error('Invalid wallet address');
  }
  return true;
};

// Transaction hash validation
const validateTxHash = (hash: string) => {
  const txHashRegex = /^0x([A-Fa-f0-9]{64})$/;
  if (!txHashRegex.test(hash)) {
    throw new Error('Invalid transaction hash');
  }
  return true;
};
```

### 7.2 Rate Limiting

```typescript
// API rate limits
const RATE_LIMITS = {
  purchase: {
    windowMs: 60000, // 1 minute
    max: 3, // 3 purchases per minute
  },
  claim: {
    windowMs: 300000, // 5 minutes
    max: 1, // 1 claim per 5 minutes
  },
  apiCall: {
    windowMs: 60000,
    max: 100, // 100 requests per minute
  },
};
```

### 7.3 CSRF Protection

```typescript
// Generate CSRF token
function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Validate CSRF token
function validateCSRFToken(token: string, expectedToken: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expectedToken)
  );
}
```

---

## 8. Testing Specifications

### 8.1 Unit Tests

```typescript
describe('PurchaseCalculator', () => {
  it('calculates base tokens correctly', () => {
    const result = calculateTokens(1000, 0.0015);
    expect(result.baseTokens).toBe(666666.67);
  });

  it('applies bonus tiers correctly', () => {
    const result = calculateTokens(500, 0.0015, BONUS_TIERS);
    expect(result.bonusPercentage).toBe(30);
    expect(result.bonusTokens).toBe(100000);
  });

  it('handles edge cases', () => {
    expect(() => calculateTokens(0, 0.0015)).toThrow();
    expect(() => calculateTokens(-100, 0.0015)).toThrow();
  });
});
```

### 8.2 Integration Tests

```typescript
describe('Purchase Flow', () => {
  it('completes purchase successfully', async () => {
    const wallet = await connectWallet();
    const result = await purchaseTokens(500, 'BNB');
    expect(result.success).toBe(true);
    expect(result.transactionHash).toBeDefined();
  });

  it('handles insufficient balance', async () => {
    // Test insufficient balance scenario
  });

  it('handles network errors', async () => {
    // Test network failure scenarios
  });
});
```

### 8.3 E2E Tests

```typescript
describe('Dashboard User Flow', () => {
  it('user can complete full purchase journey', async () => {
    // 1. Connect wallet
    await page.click('[data-testid="connect-wallet"]');
    await page.click('[data-testid="metamask-option"]');

    // 2. Navigate to buy page
    await page.click('[data-testid="buy-tokens-nav"]');

    // 3. Enter amount
    await page.fill('[data-testid="amount-input"]', '500');

    // 4. Select payment method
    await page.click('[data-testid="payment-bnb"]');

    // 5. Review and confirm
    await page.click('[data-testid="buy-button"]');
    await page.click('[data-testid="confirm-transaction"]');

    // 6. Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

---

## 9. Deployment Specifications

### 9.1 Environment Variables

```bash
# Application
NEXT_PUBLIC_APP_URL=https://dashboard.hypeai.agency
NEXT_PUBLIC_API_URL=https://api.hypeai.agency

# Blockchain
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed1.binance.org
NEXT_PUBLIC_BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
NEXT_PUBLIC_CHAIN_ID=56

# Contract Addresses
NEXT_PUBLIC_PRIVATE_SALE_CONTRACT=0x...
NEXT_PUBLIC_TOKEN_CONTRACT=0x...
NEXT_PUBLIC_VESTING_CONTRACT=0x...

# API Keys
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=xxx
NEXT_PUBLIC_INFURA_API_KEY=xxx

# Database
DATABASE_URL=postgresql://user:password@host:5432/db
REDIS_URL=redis://host:6379

# Authentication
JWT_SECRET=xxx
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASSWORD=xxx

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 9.2 Build Configuration

```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['cdn.hypeai.agency'],
    formats: ['image/webp'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
  },
};
```

### 9.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Dashboard

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          NODE_ENV: production

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 10. Monitoring & Observability

### 10.1 Error Tracking

```typescript
// Sentry configuration
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
    }
    return event;
  },
});
```

### 10.2 Analytics Events

```typescript
// Track user actions
const trackEvent = (event: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, properties);
  }
};

// Example events
trackEvent('purchase_initiated', { amount: 500 });
trackEvent('purchase_completed', { amount: 500, tokens: 433333 });
trackEvent('referral_shared', { platform: 'twitter' });
```

### 10.3 Performance Monitoring

```typescript
// Web Vitals tracking
export function reportWebVitals(metric: NextWebVitalsMetric) {
  const { id, name, label, value } = metric;

  if (label === 'web-vital') {
    trackEvent('web_vital', {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      metric_name: name,
    });
  }
}
```

---

## 11. Conclusion

This technical specification provides a comprehensive blueprint for implementing the Private Sale Dashboard. All specifications are designed to ensure:

- **Scalability:** Handle thousands of concurrent users
- **Security:** Protect user funds and data
- **Performance:** Fast load times and smooth interactions
- **Reliability:** 99.9% uptime with proper error handling
- **Maintainability:** Clean code structure and documentation

**Next Steps:**
1. Review and approve technical specifications
2. Create component implementation plan
3. Setup development environment
4. Begin sprint planning
5. Start implementation

---

**Document Control:**
- **Author:** Technical Lead
- **Reviewers:** Development Team, Security Team
- **Status:** Draft
- **Next Review:** Weekly during implementation
