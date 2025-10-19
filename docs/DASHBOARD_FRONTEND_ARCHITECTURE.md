# HypeAI Private Sale Dashboard - Frontend Architecture

**Version:** 1.0
**Date:** 2025-10-18
**Status:** Design Complete

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Application Structure](#application-structure)
4. [Routing Architecture](#routing-architecture)
5. [Component Architecture](#component-architecture)
6. [State Management](#state-management)
7. [User Flow Design](#user-flow-design)
8. [Page Layouts & Wireframes](#page-layouts--wireframes)
9. [Web3 Integration](#web3-integration)
10. [API Integration](#api-integration)
11. [Design System](#design-system)
12. [Implementation Plan](#implementation-plan)

---

## 1. Project Overview

### Mission
Design and implement a comprehensive user dashboard for the HypeAI Private Sale with integrated referral system, wallet connection, and token purchase capabilities.

### Key Features
- Wallet-based authentication (MetaMask, WalletConnect)
- Token purchase interface with multiple payment methods
- Comprehensive referral system with tracking and rewards
- Real-time transaction monitoring
- Vesting schedule visualization
- User profile management
- KYC integration

### Current Implementation Status
**Existing Components:**
- ✅ Referral Dashboard (`/src/frontend/components/referral/`)
- ✅ Web3 Context Provider (`/src/frontend/contexts/Web3Context.tsx`)
- ✅ Dashboard Page (`/src/frontend/pages/dashboard/index.tsx`)
- ✅ Private Sale Widget (`/src/frontend/components/PrivateSaleWidget.tsx`)
- ✅ Presale Components (`/src/frontend/components/presale/`)

**Gaps to Fill:**
- ⚠️ Purchase flow integration
- ⚠️ Transaction history page
- ⚠️ Profile settings page
- ⚠️ Vesting schedule component
- ⚠️ Enhanced wallet connection UI

---

## 2. Technology Stack

### Core Framework
```json
{
  "framework": "Next.js 14.2.33",
  "language": "TypeScript 5.1",
  "react": "18.2.0"
}
```

### Web3 Stack
```json
{
  "ethereum": "ethers 6.15.0",
  "walletConnect": "Recommended: @web3modal/wagmi",
  "chains": ["ethereum", "bsc", "polygon"]
}
```

### UI/UX Libraries
```json
{
  "styling": "Tailwind CSS 3.4.18",
  "animations": "Framer Motion 12.23.24",
  "icons": "Lucide React 0.545.0",
  "charts": "Recharts 3.2.1"
}
```

### State & Data
```json
{
  "dataFetching": "@tanstack/react-query 5.90.2",
  "httpClient": "axios 1.12.2",
  "formHandling": "React Hook Form (recommended)"
}
```

### Additional Tools
```json
{
  "qrCode": "qrcode 1.5.4",
  "utils": "clsx 2.1.1, tailwind-merge 3.3.1",
  "validation": "zod (recommended)"
}
```

---

## 3. Application Structure

### Directory Organization

```
src/frontend/
├── components/                 # Reusable UI components
│   ├── presale/               # Presale-specific components
│   │   ├── ProgressBar.tsx
│   │   ├── StatsCard.tsx
│   │   ├── BenefitsGrid.tsx
│   │   ├── CountdownTimer.tsx
│   │   └── PurchaseWidget.tsx
│   │
│   ├── referral/              # Referral system components
│   │   ├── ReferralDashboard.tsx
│   │   ├── ReferralList.tsx
│   │   ├── ClaimRewards.tsx
│   │   ├── ReferralSettings.tsx
│   │   └── AuthModal.tsx
│   │
│   ├── dashboard/             # NEW: Dashboard components
│   │   ├── Sidebar.tsx
│   │   ├── WalletInfo.tsx
│   │   ├── StatsOverview.tsx
│   │   └── QuickActions.tsx
│   │
│   ├── purchase/              # NEW: Purchase flow components
│   │   ├── TokenPurchaseForm.tsx
│   │   ├── PaymentMethodSelector.tsx
│   │   ├── PurchaseConfirmation.tsx
│   │   └── TransactionStatus.tsx
│   │
│   ├── wallet/                # NEW: Wallet components
│   │   ├── ConnectWalletButton.tsx
│   │   ├── WalletModal.tsx
│   │   ├── NetworkSelector.tsx
│   │   └── WalletBalance.tsx
│   │
│   ├── vesting/               # NEW: Vesting components
│   │   ├── VestingSchedule.tsx
│   │   ├── VestingTimeline.tsx
│   │   ├── ClaimableTokens.tsx
│   │   └── VestingStats.tsx
│   │
│   ├── transactions/          # NEW: Transaction components
│   │   ├── TransactionHistory.tsx
│   │   ├── TransactionRow.tsx
│   │   ├── TransactionDetails.tsx
│   │   └── TransactionFilters.tsx
│   │
│   └── ui/                    # Base UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       └── Tooltip.tsx
│
├── pages/                     # Next.js pages
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx              # Landing page
│   ├── private-sale.tsx       # Private sale landing
│   │
│   └── dashboard/             # Dashboard routes
│       ├── index.tsx          # Main dashboard
│       ├── purchase.tsx       # NEW: Purchase page
│       ├── referrals.tsx      # NEW: Referrals page
│       ├── transactions.tsx   # NEW: Transaction history
│       ├── vesting.tsx        # NEW: Vesting schedule
│       └── profile.tsx        # NEW: User profile
│
├── contexts/                  # React contexts
│   ├── Web3Context.tsx        # ✅ Wallet state
│   ├── AuthContext.tsx        # NEW: User authentication
│   ├── PurchaseContext.tsx    # NEW: Purchase state
│   └── ThemeContext.tsx       # NEW: Theme management
│
├── hooks/                     # Custom React hooks
│   ├── useWeb3Auth.ts
│   ├── useReferralAPI.ts
│   ├── usePurchase.ts         # NEW: Purchase operations
│   ├── useVesting.ts          # NEW: Vesting data
│   ├── useTransactions.ts     # NEW: Transaction history
│   └── useUserProfile.ts      # NEW: User profile
│
├── lib/                       # Library configurations
│   ├── web3/
│   │   ├── contracts.ts       # Smart contract ABIs
│   │   ├── networks.ts        # Network configurations
│   │   └── providers.ts       # Provider setup
│   │
│   └── api/
│       ├── client.ts          # Axios instance
│       ├── endpoints.ts       # API endpoints
│       └── types.ts           # API types
│
├── types/                     # TypeScript definitions
│   ├── index.ts
│   ├── presale.ts
│   ├── referral.ts
│   ├── private-sale.ts
│   ├── purchase.ts            # NEW
│   ├── vesting.ts             # NEW
│   └── window.d.ts
│
├── utils/                     # Utility functions
│   ├── helpers.ts             # General helpers
│   ├── formatters.ts          # Number/date formatters
│   ├── validators.ts          # Input validation
│   └── constants.ts           # App constants
│
└── styles/
    └── globals.css            # Global styles
```

---

## 4. Routing Architecture

### Route Structure

```typescript
// Route mapping
const routes = {
  // Public routes
  home: '/',
  privateSale: '/private-sale',
  presale: '/presale',
  whitepaper: '/whitepaper',

  // Protected dashboard routes (require wallet connection)
  dashboard: {
    root: '/dashboard',           // Overview + referral stats
    purchase: '/dashboard/purchase',      // Token purchase flow
    referrals: '/dashboard/referrals',    // Referral management
    transactions: '/dashboard/transactions', // Transaction history
    vesting: '/dashboard/vesting',        // Vesting schedule
    profile: '/dashboard/profile'         // User settings
  },

  // API routes
  api: {
    auth: '/api/auth',
    referral: '/api/referral',
    purchase: '/api/purchase',
    user: '/api/user'
  }
};
```

### Route Protection

```typescript
// middleware.ts (New file)
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const walletConnected = request.cookies.get('walletConnected');
    const authToken = request.cookies.get('authToken');

    if (!walletConnected && !authToken) {
      return NextResponse.redirect(new URL('/private-sale', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*'
};
```

---

## 5. Component Architecture

### Component Hierarchy

```
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── ConnectWalletButton
│   │       └── WalletModal
│   │
│   ├── Main Content
│   │   └── Page-specific components
│   │
│   └── Footer
│
└── Providers
    ├── Web3Provider
    ├── AuthProvider
    ├── QueryClientProvider
    └── ThemeProvider
```

### Core Components

#### 1. ConnectWalletButton Component

**Location:** `/src/frontend/components/wallet/ConnectWalletButton.tsx`

```typescript
interface ConnectWalletButtonProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  className?: string;
  showBalance?: boolean;
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  onConnect,
  onDisconnect,
  className,
  showBalance = true
}) => {
  const { address, isConnected, connect, disconnect, balance } = useWeb3();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Connected state: Show address + dropdown
  // Disconnected state: Show connect button
  // Loading state: Show spinner

  return (
    <>
      {isConnected ? (
        <WalletInfo
          address={address}
          balance={showBalance ? balance : undefined}
          onDisconnect={handleDisconnect}
        />
      ) : (
        <button onClick={() => setIsModalOpen(true)}>
          Connect Wallet
        </button>
      )}

      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
      />
    </>
  );
};
```

**Features:**
- Multiple wallet support (MetaMask, WalletConnect, Coinbase Wallet)
- Auto-reconnect on page load
- Network switching
- Balance display
- Responsive design

---

#### 2. PrivateSaleDashboard Component

**Location:** `/src/frontend/pages/dashboard/index.tsx` (Current implementation)

**Enhancements Needed:**
```typescript
// Add purchase flow integration
// Add token allocation display
// Add vesting preview
// Add recent transactions widget
```

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Header: Welcome + Wallet Info                  │
├─────────────────────────────────────────────────┤
│ Stats Grid (4 cards):                          │
│  • Total Purchased  • Vested Amount            │
│  • Pending Vesting  • Referral Earnings        │
├─────────────────────────────────────────────────┤
│ Quick Actions:                                 │
│  [Purchase Tokens] [Claim Vested] [Referrals] │
├─────────────────────────────────────────────────┤
│ Two-Column Layout:                             │
│  LEFT: Referral Stats & Link                   │
│  RIGHT: Recent Transactions                    │
└─────────────────────────────────────────────────┘
```

---

#### 3. TokenPurchaseForm Component

**Location:** `/src/frontend/components/purchase/TokenPurchaseForm.tsx` (NEW)

```typescript
interface TokenPurchaseFormProps {
  onSuccess?: (purchase: Purchase) => void;
  onError?: (error: Error) => void;
}

export const TokenPurchaseForm: React.FC<TokenPurchaseFormProps> = ({
  onSuccess,
  onError
}) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<PaymentMethod>('USDT');
  const [calculatedTokens, setCalculatedTokens] = useState<CalculatorResult>();

  // Real-time calculation as user types
  // Payment method selection
  // Bonus display
  // Transaction preview
  // Approval + purchase flow

  return (
    <div className="purchase-form">
      {/* Amount Input */}
      {/* Currency Selector */}
      {/* Token Calculation Display */}
      {/* Bonus Breakdown */}
      {/* Purchase Button */}
      {/* Transaction Status */}
    </div>
  );
};
```

**Purchase Flow:**
1. User enters amount in USD/ETH/USDT
2. Real-time calculation shows tokens received
3. Display bonus percentage
4. Show total including referral bonus
5. Connect wallet if not connected
6. Approve token spending (for ERC-20)
7. Execute purchase transaction
8. Show transaction status
9. Redirect to dashboard on success

---

#### 4. ReferralDashboard Component

**Location:** `/src/frontend/components/referral/ReferralDashboard.tsx` (✅ Exists)

**Current Features:**
- ✅ Referral link generation
- ✅ QR code generation
- ✅ Stats display (clicks, conversions, earnings)
- ✅ Copy to clipboard
- ✅ Social sharing buttons

**Enhancements:**
- Add referral tier system visualization
- Add performance charts (earnings over time)
- Add leaderboard widget

---

#### 5. VestingSchedule Component

**Location:** `/src/frontend/components/vesting/VestingSchedule.tsx` (NEW)

```typescript
interface VestingScheduleProps {
  userId: string;
  walletAddress: string;
}

export const VestingSchedule: React.FC<VestingScheduleProps> = ({
  userId,
  walletAddress
}) => {
  const { schedule, claimable, nextUnlock } = useVesting(walletAddress);

  return (
    <div className="vesting-schedule">
      {/* Timeline visualization */}
      {/* Claimable amount */}
      {/* Next unlock date */}
      {/* Claim button */}
      {/* Full schedule table */}
    </div>
  );
};
```

**Features:**
- Visual timeline of vesting periods
- Highlighted current period
- Claimable token amount
- One-click claim function
- Transaction history for claims

---

#### 6. TransactionHistory Component

**Location:** `/src/frontend/components/transactions/TransactionHistory.tsx` (NEW)

```typescript
interface TransactionHistoryProps {
  userId: string;
  walletAddress?: string;
  limit?: number;
  filters?: TransactionFilters;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  userId,
  walletAddress,
  limit = 20,
  filters
}) => {
  const { transactions, loading, pagination } = useTransactions({
    userId,
    walletAddress,
    limit,
    filters
  });

  return (
    <div className="transaction-history">
      {/* Filters: Date range, type, status */}
      {/* Transaction table */}
      {/* Pagination */}
      {/* Export CSV button */}
    </div>
  );
};
```

**Transaction Types:**
- Token Purchase
- Referral Reward
- Vesting Claim
- Bonus Distribution

---

## 6. State Management

### Context Architecture

```typescript
// 1. Web3Context (✅ Exists)
interface Web3ContextType {
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
}

// 2. AuthContext (NEW)
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (wallet: string) => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// 3. PurchaseContext (NEW)
interface PurchaseContextType {
  activePurchase: Purchase | null;
  startPurchase: (amount: number, currency: PaymentMethod) => void;
  confirmPurchase: () => Promise<TransactionResult>;
  cancelPurchase: () => void;
  purchaseHistory: Purchase[];
}

// 4. NotificationContext (NEW)
interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  notifications: Notification[];
  dismissNotification: (id: string) => void;
}
```

### React Query Configuration

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 1
    }
  }
});

// Query keys
export const queryKeys = {
  referralStats: (userId: string) => ['referral', 'stats', userId],
  referralLink: (userId: string) => ['referral', 'link', userId],
  referrals: (userId: string, filters?: FilterOptions) =>
    ['referral', 'list', userId, filters],
  transactions: (userId: string, filters?: TransactionFilters) =>
    ['transactions', userId, filters],
  vesting: (walletAddress: string) => ['vesting', walletAddress],
  userProfile: (userId: string) => ['user', 'profile', userId],
  privateSaleConfig: () => ['config', 'private-sale']
};
```

---

## 7. User Flow Design

### Primary User Journeys

#### Journey 1: First-Time User - Token Purchase

```
1. Landing Page (/private-sale)
   │
   ├─ User clicks "Join Private Sale"
   │
   ├─ Not Connected?
   │   └─ Show Wallet Connection Modal
   │       ├─ MetaMask
   │       ├─ WalletConnect
   │       └─ Coinbase Wallet
   │
   ├─ Connected!
   │   └─ Redirect to /dashboard
   │
2. Dashboard (/dashboard)
   │
   ├─ First-time welcome modal
   │   ├─ Quick tutorial
   │   ├─ Referral code highlight
   │   └─ Purchase CTA
   │
   ├─ User clicks "Purchase Tokens"
   │   └─ Navigate to /dashboard/purchase
   │
3. Purchase Page (/dashboard/purchase)
   │
   ├─ Enter purchase amount
   ├─ Select payment method (ETH/USDT/USDC)
   ├─ View token calculation + bonus
   ├─ Review transaction
   ├─ Approve spending (if ERC-20)
   ├─ Confirm purchase
   │
   ├─ Transaction in progress...
   │   └─ Show loading + tx hash
   │
   ├─ Success!
   │   ├─ Show success message
   │   ├─ Display tokens purchased
   │   ├─ Show vesting schedule
   │   └─ Encourage referrals
   │
   └─ Redirect to /dashboard
```

#### Journey 2: Referral System Usage

```
1. Dashboard (/dashboard)
   │
   ├─ User sees referral section
   │   ├─ Unique referral link displayed
   │   ├─ Copy button
   │   └─ QR code option
   │
   ├─ User clicks "Copy Link"
   │   └─ Link copied to clipboard
   │
   ├─ User shares link
   │   ├─ Twitter
   │   ├─ Telegram
   │   ├─ Discord
   │   └─ Direct message
   │
2. Referred User Journey
   │
   ├─ Clicks referral link
   │   └─ Lands on /private-sale?ref=ABC123
   │
   ├─ Referral code stored in localStorage
   │
   ├─ User purchases tokens
   │   └─ Referral attributed automatically
   │
   ├─ Referrer receives notification
   │   ├─ Email/Telegram alert
   │   └─ Dashboard update
   │
   └─ Commission calculated
       ├─ 5% of purchase
       └─ Added to pending rewards
```

#### Journey 3: Vesting & Claims

```
1. Dashboard (/dashboard)
   │
   ├─ User clicks "Vesting Schedule"
   │   └─ Navigate to /dashboard/vesting
   │
2. Vesting Page (/dashboard/vesting)
   │
   ├─ View vesting timeline
   │   ├─ Total allocated
   │   ├─ Already vested
   │   ├─ Claimable now
   │   └─ Future unlocks
   │
   ├─ Claimable amount > 0?
   │   ├─ "Claim Tokens" button enabled
   │   └─ Click to claim
   │       ├─ Confirm transaction
   │       ├─ Sign with wallet
   │       └─ Tokens sent to wallet
   │
   └─ View claim history
       └─ Table of all claims
```

---

## 8. Page Layouts & Wireframes

### 8.1 Private Sale Landing (/private-sale)

**Layout Description:**

```
┌─────────────────────────────────────────────────────────┐
│  Header: [Logo]  [About] [Docs]    [Connect Wallet →]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║        Hero Section                               ║ │
│  ║                                                   ║ │
│  ║   HypeAI Private Sale                             ║ │
│  ║   Join the Future of AI-Powered Trading          ║ │
│  ║                                                   ║ │
│  ║   • 30% Bonus on All Purchases                   ║ │
│  ║   • 5% Referral Commission                       ║ │
│  ║   • Vesting Schedule: 6 months                   ║ │
│  ║                                                   ║ │
│  ║   [ Join Private Sale → ]                         ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │ $2.5M       │ │ 50% Sold    │ │ 15 Days     │      │
│  │ Raised      │ │ Out         │ │ Remaining   │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                         │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║   How It Works                                    ║ │
│  ║                                                   ║ │
│  ║   1️⃣ Connect Wallet  2️⃣ Purchase Tokens          ║ │
│  ║   3️⃣ Get Referral Link  4️⃣ Earn Commissions     ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                         │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║   Token Benefits                                  ║ │
│  ║                                                   ║ │
│  ║   [Grid of 6 benefit cards]                      ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                         │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║   FAQ Section                                     ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Prominent "Join Private Sale" CTA
- Real-time stats (raised, sold %, countdown)
- Trust indicators (audited, team, roadmap)
- Mobile-responsive design
- Gradient backgrounds (purple/pink theme)

---

### 8.2 Dashboard Overview (/dashboard)

**Layout Description:**

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────┐  HypeAI Dashboard        [Wallet: 0x1234...] │
│ │  MENU   │                          [Disconnect ▼]       │
├─┴─────────┴─────────────────────────────────────────────────┤
│ Overview  Referrals  Rewards  Settings                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐│
│  │ 50,000     │ │ 10,000     │ │ 40,000     │ │ $2,500   ││
│  │ HYPE       │ │ Vested     │ │ Locked     │ │ Earned   ││
│  │ Purchased  │ │ Available  │ │ Vesting    │ │ Referral ││
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘│
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │ Quick Actions                                     │     │
│  │ [Purchase Tokens] [Claim Vested] [View Referrals]│     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌─────────────────────────┐ ┌───────────────────────────┐│
│  │ Referral Overview       │ │ Recent Transactions       ││
│  │                         │ │                           ││
│  │ Your Link:              │ │ 10/15 Purchase  +25,000   ││
│  │ hypeai.com/ref/ABC123   │ │ 10/14 Claim     -10,000   ││
│  │ [Copy] [QR]             │ │ 10/13 Referral  +$125     ││
│  │                         │ │ 10/12 Purchase  +15,000   ││
│  │ Stats:                  │ │                           ││
│  │ • 12 Referrals          │ │ [View All →]              ││
│  │ • $2,500 Earned         │ │                           ││
│  │ • 8.3% Conv. Rate       │ │                           ││
│  └─────────────────────────┘ └───────────────────────────┘│
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Vesting Timeline                                      │ │
│  │ ━━━●━━━○━━━○━━━○━━━○━━━○                            │ │
│  │ TGE   M1  M2  M3  M4  M5                             │ │
│  │                                                       │ │
│  │ Next Unlock: 5,000 HYPE on Nov 15, 2025              │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- 4-stat overview grid
- Quick action buttons
- Two-column layout for referrals + transactions
- Vesting timeline preview
- Tab navigation (Overview, Referrals, Rewards, Settings)

---

### 8.3 Purchase Page (/dashboard/purchase)

**Layout Description:**

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Dashboard              Purchase HYPE Tokens  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────┐ ┌───────────────────────┐   │
│  │                       │ │                       │   │
│  │  PURCHASE FORM        │ │  CALCULATION          │   │
│  │                       │ │                       │   │
│  │  Amount to Spend:     │ │  Base Tokens:         │   │
│  │  ┌─────────────────┐  │ │  25,000 HYPE          │   │
│  │  │ 1000           $│  │ │                       │   │
│  │  └─────────────────┘  │ │  Bonus (30%):         │   │
│  │                       │ │  7,500 HYPE           │   │
│  │  Payment Method:      │ │                       │   │
│  │  ○ ETH   ◉ USDT       │ │  Referral (5%):       │   │
│  │  ○ USDC  ○ BNB        │ │  1,250 HYPE           │   │
│  │                       │ │  ─────────────        │   │
│  │  Token Price:         │ │  Total:               │   │
│  │  $0.04 per HYPE       │ │  33,750 HYPE          │   │
│  │                       │ │                       │   │
│  │  Your Wallet Balance: │ │  Vesting Schedule:    │   │
│  │  2,500 USDT           │ │  • 20% at TGE         │   │
│  │                       │ │  • 80% over 5 months  │   │
│  │                       │ │                       │   │
│  │  [ Purchase Tokens ]  │ │  Immediate: 6,750     │   │
│  │                       │ │  Vested: 27,000       │   │
│  │                       │ │                       │   │
│  └───────────────────────┘ └───────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ⚠️ Important Information:                       │   │
│  │ • Minimum purchase: $100                        │   │
│  │ • Maximum purchase: $50,000 per transaction     │   │
│  │ • Tokens will be distributed according to       │   │
│  │   vesting schedule                              │   │
│  │ • Transaction is final and non-refundable       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Two-column layout (input/calculation)
- Real-time token calculation
- Multiple payment methods
- Wallet balance check
- Clear vesting preview
- Min/max purchase limits
- Transaction preview before confirmation

---

### 8.4 Referral Page (/dashboard/referrals)

**Layout Description:**

```
┌─────────────────────────────────────────────────────────┐
│  Referral System                     Total Earned: $2,500│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Your Referral Link                                │ │
│  │                                                   │ │
│  │ https://hypeai.com/ref/ABC123  [Copy] [QR Code]  │ │
│  │                                                   │ │
│  │ Share on: [Twitter] [Telegram] [Discord] [Email] │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ 12       │ │ 144      │ │ 8.3%     │ │ $2,500   │  │
│  │ Referrals│ │ Clicks   │ │ Conv.    │ │ Earned   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Referral Performance Chart                        │ │
│  │ (Line graph showing earnings over time)           │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Your Referrals                                    │ │
│  │                                                   │ │
│  │ [Filter: All ▼] [Date Range ▼] [Export CSV]      │ │
│  │                                                   │ │
│  │ ┌──────┬─────────┬──────────┬──────────┬────────┐│ │
│  │ │ User │ Purchase│ Your     │ Status   │ Date   ││ │
│  │ ├──────┼─────────┼──────────┼──────────┼────────┤│ │
│  │ │0x123 │ $1,000  │ $50      │ ✓ Paid   │10/15   ││ │
│  │ │0x456 │ $2,500  │ $125     │ ✓ Paid   │10/14   ││ │
│  │ │0xabc │ $500    │ $25      │ ⏳Pending│10/13   ││ │
│  │ └──────┴─────────┴──────────┴──────────┴────────┘│ │
│  │                                                   │ │
│  │ Page 1 of 3    [← Previous] [Next →]             │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Easy link sharing
- Social media integration
- Performance metrics
- Visual analytics
- Detailed referral table
- Filtering and export options

---

### 8.5 Transaction History (/dashboard/transactions)

**Layout Description:**

```
┌─────────────────────────────────────────────────────────┐
│  Transaction History                          Export CSV │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Filters:                                               │
│  [Type: All ▼] [Status: All ▼] [Date: Last 30 days ▼]  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Type        Amount      Status    Date      Hash  │ │
│  ├───────────────────────────────────────────────────┤ │
│  │ 💰 Purchase +25,000 HYPE ✓ Confirmed 10/15 0x1a.. │ │
│  │ 🎁 Referral +$125        ✓ Confirmed 10/14 0x2b.. │ │
│  │ 🔓 Claim    -10,000 HYPE ✓ Confirmed 10/13 0x3c.. │ │
│  │ 💰 Purchase +15,000 HYPE ✓ Confirmed 10/12 0x4d.. │ │
│  │ 🎁 Referral +$75         ⏳ Pending   10/11 -      │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  [Load More]                                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Multi-filter support
- Transaction type icons
- Direct links to blockchain explorer
- CSV export
- Real-time status updates

---

### 8.6 Vesting Schedule (/dashboard/vesting)

**Layout Description:**

```
┌─────────────────────────────────────────────────────────┐
│  Vesting Schedule                 Claimable: 10,000 HYPE │
│                                   [Claim Now →]         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │ 50,000     │ │ 15,000     │ │ 35,000     │          │
│  │ Total      │ │ Released   │ │ Locked     │          │
│  │ Allocated  │ │ (30%)      │ │ (70%)      │          │
│  └────────────┘ └────────────┘ └────────────┘          │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Vesting Timeline                                  │ │
│  │                                                   │ │
│  │ Oct 2025  Nov     Dec     Jan 2026  Feb     Mar  │ │
│  │    ●━━━━━━●━━━━━━●━━━━━━●━━━━━━●━━━━━━●        │ │
│  │   TGE     20%     20%     20%     20%     20%    │ │
│  │  10,000  8,000   8,000   8,000   8,000   8,000  │ │
│  │  ✓ Claimed ← You are here                        │ │
│  │                                                   │ │
│  │ Next Unlock: 8,000 HYPE on November 15, 2025     │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Vesting Schedule Details                          │ │
│  │                                                   │ │
│  │ Date         Amount      Status      Action       │ │
│  │ ──────────────────────────────────────────────    │ │
│  │ Oct 15, 2025 10,000 HYPE ✓ Claimed   -           │ │
│  │ Nov 15, 2025  8,000 HYPE ⏳ Locked   [Notify Me] │ │
│  │ Dec 15, 2025  8,000 HYPE ⏳ Locked   [Notify Me] │ │
│  │ Jan 15, 2026  8,000 HYPE ⏳ Locked   [Notify Me] │ │
│  │ Feb 15, 2026  8,000 HYPE ⏳ Locked   [Notify Me] │ │
│  │ Mar 15, 2026  8,000 HYPE ⏳ Locked   [Notify Me] │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Claim History                                     │ │
│  │                                                   │ │
│  │ Oct 15, 2025 - Claimed 10,000 HYPE - Tx: 0x1a2b  │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Visual timeline
- Claimable amount highlight
- One-click claim
- Email/Telegram notifications
- Full schedule table
- Claim history

---

### 8.7 Profile Settings (/dashboard/profile)

**Layout Description:**

```
┌─────────────────────────────────────────────────────────┐
│  Profile Settings                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Account Information                               │ │
│  │                                                   │ │
│  │ Wallet Address:  0x1234...5678 [Verified ✓]      │ │
│  │ Email:           user@example.com [Verify]        │ │
│  │ Telegram:        @username [Connected ✓]         │ │
│  │                                                   │ │
│  │ [Update Email] [Connect Telegram]                │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Notification Preferences                          │ │
│  │                                                   │ │
│  │ ☑ Email notifications                             │ │
│  │ ☑ Telegram notifications                          │ │
│  │ ☑ Notify on referral purchase                     │ │
│  │ ☑ Notify on vesting unlock                        │ │
│  │ ☐ Marketing updates                               │ │
│  │                                                   │ │
│  │ [Save Preferences]                                │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Reward Settings                                   │ │
│  │                                                   │ │
│  │ Preferred Reward Type:                            │ │
│  │ ◉ USDT    ○ HYPE Tokens                           │ │
│  │                                                   │ │
│  │ Payout Wallet: 0x1234...5678 [Edit]              │ │
│  │                                                   │ │
│  │ [Update Settings]                                 │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ KYC Verification                                  │ │
│  │                                                   │ │
│  │ Status: ⏳ Pending Review                         │ │
│  │                                                   │ │
│  │ Documents Submitted: ID Card, Selfie              │ │
│  │                                                   │ │
│  │ [View Status] [Upload Documents]                  │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Account management
- Notification preferences
- Reward type selection
- KYC status and upload
- Email/Telegram integration

---

## 9. Web3 Integration

### Wallet Support

```typescript
// lib/web3/wallets.ts
export const supportedWallets = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '/icons/metamask.svg',
    connector: 'injected',
    downloadUrl: 'https://metamask.io/download'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '/icons/walletconnect.svg',
    connector: 'walletconnect'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '/icons/coinbase.svg',
    connector: 'coinbaseWallet'
  },
  {
    id: 'trustwallet',
    name: 'Trust Wallet',
    icon: '/icons/trustwallet.svg',
    connector: 'injected'
  }
];
```

### Network Configurations

```typescript
// lib/web3/networks.ts
export const supportedNetworks = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  bsc: {
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  }
};
```

### Smart Contract Integration

```typescript
// lib/web3/contracts.ts
export const contracts = {
  privateSale: {
    address: '0x...', // To be deployed
    abi: [...] // Private sale contract ABI
  },
  hypeToken: {
    address: '0x...', // HYPE token address
    abi: [...] // ERC-20 ABI
  },
  vesting: {
    address: '0x...', // Vesting contract
    abi: [...] // Vesting ABI
  },
  referral: {
    address: '0x...', // Referral contract
    abi: [...] // Referral ABI
  }
};

// Usage example
export const usePurchaseContract = () => {
  const { signer } = useWeb3();

  const purchaseTokens = async (amount: string, paymentToken: string) => {
    const contract = new ethers.Contract(
      contracts.privateSale.address,
      contracts.privateSale.abi,
      signer
    );

    // If paying with ERC-20, approve first
    if (paymentToken !== 'ETH') {
      const tokenContract = new ethers.Contract(
        paymentToken,
        ERC20_ABI,
        signer
      );
      const approveTx = await tokenContract.approve(
        contracts.privateSale.address,
        amount
      );
      await approveTx.wait();
    }

    // Execute purchase
    const tx = await contract.buyTokens(amount, paymentToken);
    return await tx.wait();
  };

  return { purchaseTokens };
};
```

---

## 10. API Integration

### API Client Setup

```typescript
// lib/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor (add auth token)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
```

### API Endpoints

```typescript
// lib/api/endpoints.ts
export const endpoints = {
  // Auth
  login: '/auth/login',
  logout: '/auth/logout',
  me: '/auth/me',

  // User
  profile: '/user/profile',
  updateProfile: '/user/profile',

  // Referral
  referralStats: (userId: string) => `/referral/${userId}/stats`,
  referralLink: (userId: string) => `/referral/${userId}/link`,
  referralList: (userId: string) => `/referral/${userId}/list`,
  claimReward: '/referral/claim',

  // Purchase
  privateSaleConfig: '/private-sale/config',
  calculateTokens: '/private-sale/calculate',
  recordPurchase: '/private-sale/purchase',

  // Transactions
  transactions: (userId: string) => `/transactions/${userId}`,
  transactionDetails: (txHash: string) => `/transactions/details/${txHash}`,

  // Vesting
  vestingSchedule: (walletAddress: string) => `/vesting/${walletAddress}`,
  claimVested: '/vesting/claim',

  // Settings
  updateSettings: '/settings',
  uploadKYC: '/settings/kyc',
  updateNotifications: '/settings/notifications'
};
```

### Custom Hooks

```typescript
// hooks/usePurchase.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '@/lib/api';

export const usePurchase = () => {
  const calculateTokens = useQuery({
    queryKey: ['calculate-tokens'],
    queryFn: async ({ amount, currency }) => {
      const { data } = await apiClient.post(endpoints.calculateTokens, {
        amount,
        currency
      });
      return data;
    },
    enabled: false
  });

  const recordPurchase = useMutation({
    mutationFn: async (purchaseData) => {
      const { data } = await apiClient.post(
        endpoints.recordPurchase,
        purchaseData
      );
      return data;
    }
  });

  return { calculateTokens, recordPurchase };
};

// hooks/useVesting.ts
export const useVesting = (walletAddress: string) => {
  return useQuery({
    queryKey: queryKeys.vesting(walletAddress),
    queryFn: async () => {
      const { data } = await apiClient.get(
        endpoints.vestingSchedule(walletAddress)
      );
      return data;
    },
    enabled: !!walletAddress
  });
};

// hooks/useTransactions.ts
export const useTransactions = (userId: string, filters?: TransactionFilters) => {
  return useQuery({
    queryKey: queryKeys.transactions(userId, filters),
    queryFn: async () => {
      const { data } = await apiClient.get(endpoints.transactions(userId), {
        params: filters
      });
      return data;
    },
    enabled: !!userId
  });
};
```

---

## 11. Design System

### Color Palette

```css
/* tailwind.config.js - Already configured */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',  /* Purple */
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87'
        },
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',  /* Pink */
          600: '#db2777',
          700: '#be185d',
          800: '#9f1239',
          900: '#831843'
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      }
    }
  }
};
```

### Typography

```css
/* Font stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Scale */
.text-xs     /* 0.75rem - 12px */
.text-sm     /* 0.875rem - 14px */
.text-base   /* 1rem - 16px */
.text-lg     /* 1.125rem - 18px */
.text-xl     /* 1.25rem - 20px */
.text-2xl    /* 1.5rem - 24px */
.text-3xl    /* 1.875rem - 30px */
.text-4xl    /* 2.25rem - 36px */
```

### Component Styles

```typescript
// Shared button styles
export const buttonStyles = {
  base: 'px-6 py-3 rounded-lg font-semibold transition-all duration-200',
  variants: {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50',
    ghost: 'text-gray-600 hover:bg-gray-100'
  },
  sizes: {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }
};

// Card styles
export const cardStyles = {
  base: 'bg-white rounded-xl shadow-lg p-6',
  hover: 'hover:shadow-xl transition-shadow duration-200',
  bordered: 'border border-gray-200'
};

// Input styles
export const inputStyles = {
  base: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
  error: 'border-red-500 focus:ring-red-500'
};
```

### Responsive Breakpoints

```css
/* Tailwind default breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

---

## 12. Implementation Plan

### Phase 1: Core Infrastructure (Week 1)

**Tasks:**
1. ✅ Review existing components
2. ⚠️ Create missing contexts (AuthContext, PurchaseContext)
3. ⚠️ Set up API client with interceptors
4. ⚠️ Configure React Query
5. ⚠️ Create base UI components (Button, Card, Input, Modal)
6. ⚠️ Set up route protection middleware

**Deliverables:**
- All contexts implemented
- API client configured
- Base component library
- Route protection working

---

### Phase 2: Wallet & Authentication (Week 1-2)

**Tasks:**
1. ⚠️ Enhance WalletConnect component
2. ⚠️ Build WalletModal with multiple wallet support
3. ⚠️ Implement network switching
4. ⚠️ Create AuthContext integration
5. ⚠️ Add wallet persistence (localStorage)
6. ⚠️ Test across different wallets

**Deliverables:**
- ConnectWalletButton component
- WalletModal with 4+ wallets
- Network selector
- Auto-reconnect functionality

---

### Phase 3: Purchase Flow (Week 2)

**Tasks:**
1. ⚠️ Create TokenPurchaseForm component
2. ⚠️ Build PaymentMethodSelector
3. ⚠️ Implement real-time calculation
4. ⚠️ Add ERC-20 approval flow
5. ⚠️ Build transaction status UI
6. ⚠️ Create /dashboard/purchase page
7. ⚠️ Integrate with smart contracts

**Deliverables:**
- Complete purchase flow
- Multi-currency support
- Transaction tracking
- Success/error handling

---

### Phase 4: Dashboard Enhancement (Week 3)

**Tasks:**
1. ✅ Review existing dashboard page
2. ⚠️ Add stats overview cards
3. ⚠️ Integrate purchase CTA
4. ⚠️ Add recent transactions widget
5. ⚠️ Create vesting preview
6. ⚠️ Enhance referral section
7. ⚠️ Add quick actions bar

**Deliverables:**
- Enhanced dashboard overview
- All stats cards populated
- Quick action buttons
- Mobile-responsive layout

---

### Phase 5: Transaction History (Week 3)

**Tasks:**
1. ⚠️ Create TransactionHistory component
2. ⚠️ Build TransactionRow component
3. ⚠️ Implement filtering system
4. ⚠️ Add pagination
5. ⚠️ Create export to CSV feature
6. ⚠️ Build /dashboard/transactions page
7. ⚠️ Add blockchain explorer links

**Deliverables:**
- Complete transaction history page
- Multi-filter support
- CSV export
- Pagination

---

### Phase 6: Vesting System (Week 4)

**Tasks:**
1. ⚠️ Create VestingSchedule component
2. ⚠️ Build VestingTimeline visualization
3. ⚠️ Implement claim functionality
4. ⚠️ Add notification system
5. ⚠️ Create /dashboard/vesting page
6. ⚠️ Integrate with vesting contract
7. ⚠️ Add claim history

**Deliverables:**
- Vesting schedule page
- Visual timeline
- Claim functionality
- Email/Telegram notifications

---

### Phase 7: Profile & Settings (Week 4)

**Tasks:**
1. ⚠️ Create profile settings page
2. ⚠️ Build notification preferences
3. ⚠️ Implement KYC upload
4. ⚠️ Add email/Telegram integration
5. ⚠️ Create reward type selector
6. ⚠️ Build /dashboard/profile page

**Deliverables:**
- Complete profile page
- KYC integration
- Notification management
- Account settings

---

### Phase 8: Referral Enhancement (Week 5)

**Tasks:**
1. ✅ Review existing referral components
2. ⚠️ Create /dashboard/referrals page
3. ⚠️ Add performance charts
4. ⚠️ Enhance social sharing
5. ⚠️ Add leaderboard widget
6. ⚠️ Implement tier system

**Deliverables:**
- Dedicated referral page
- Analytics charts
- Social sharing tools
- Leaderboard

---

### Phase 9: Testing & Optimization (Week 5-6)

**Tasks:**
1. ⚠️ Unit tests for all components
2. ⚠️ Integration tests for flows
3. ⚠️ E2E tests (Playwright/Cypress)
4. ⚠️ Performance optimization
5. ⚠️ Mobile responsiveness testing
6. ⚠️ Cross-browser testing
7. ⚠️ Accessibility audit

**Deliverables:**
- 80%+ test coverage
- All flows tested
- Performance optimized
- Accessibility compliant

---

### Phase 10: Deployment & Documentation (Week 6)

**Tasks:**
1. ⚠️ Prepare production build
2. ⚠️ Configure environment variables
3. ⚠️ Set up CI/CD pipeline
4. ⚠️ Deploy to production
5. ⚠️ Create user documentation
6. ⚠️ Write developer guide
7. ⚠️ Conduct user training

**Deliverables:**
- Production deployment
- User documentation
- Developer guide
- Training materials

---

## Appendix A: File Checklist

### Files to Create

```
New Files:
├── components/
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── WalletInfo.tsx
│   │   ├── StatsOverview.tsx
│   │   └── QuickActions.tsx
│   ├── purchase/
│   │   ├── TokenPurchaseForm.tsx
│   │   ├── PaymentMethodSelector.tsx
│   │   ├── PurchaseConfirmation.tsx
│   │   └── TransactionStatus.tsx
│   ├── wallet/
│   │   ├── ConnectWalletButton.tsx
│   │   ├── WalletModal.tsx
│   │   ├── NetworkSelector.tsx
│   │   └── WalletBalance.tsx
│   ├── vesting/
│   │   ├── VestingSchedule.tsx
│   │   ├── VestingTimeline.tsx
│   │   ├── ClaimableTokens.tsx
│   │   └── VestingStats.tsx
│   └── transactions/
│       ├── TransactionHistory.tsx
│       ├── TransactionRow.tsx
│       ├── TransactionDetails.tsx
│       └── TransactionFilters.tsx
│
├── pages/dashboard/
│   ├── purchase.tsx
│   ├── referrals.tsx
│   ├── transactions.tsx
│   ├── vesting.tsx
│   └── profile.tsx
│
├── contexts/
│   ├── AuthContext.tsx
│   ├── PurchaseContext.tsx
│   └── ThemeContext.tsx
│
├── hooks/
│   ├── usePurchase.ts
│   ├── useVesting.ts
│   ├── useTransactions.ts
│   └── useUserProfile.ts
│
├── lib/
│   ├── web3/
│   │   ├── contracts.ts
│   │   ├── networks.ts
│   │   └── wallets.ts
│   └── api/
│       ├── client.ts
│       └── endpoints.ts
│
└── types/
    ├── purchase.ts
    └── vesting.ts
```

---

## Appendix B: Environment Variables

```bash
# .env.example for frontend
NEXT_PUBLIC_API_URL=https://api.hypeai.agency
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_PRIVATE_SALE_CONTRACT=0x...
NEXT_PUBLIC_HYPE_TOKEN_CONTRACT=0x...
NEXT_PUBLIC_VESTING_CONTRACT=0x...
NEXT_PUBLIC_REFERRAL_CONTRACT=0x...
NEXT_PUBLIC_INFURA_KEY=your_infura_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_TELEGRAM_BOT_URL=https://t.me/hypeai_bot
```

---

## Appendix C: Component Tree Diagram

```
App Root
│
├── Providers
│   ├── Web3Provider (✅ exists)
│   ├── AuthProvider (NEW)
│   ├── QueryClientProvider (exists)
│   └── ThemeProvider (NEW)
│
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── ConnectWalletButton (NEW)
│   │       ├── WalletModal (NEW)
│   │       └── WalletInfo (NEW)
│   │
│   ├── Main Content
│   │   └── Page Router
│   │       ├── /private-sale (✅ exists)
│   │       └── /dashboard/*
│   │           ├── /dashboard (✅ exists)
│   │           ├── /dashboard/purchase (NEW)
│   │           ├── /dashboard/referrals (NEW)
│   │           ├── /dashboard/transactions (NEW)
│   │           ├── /dashboard/vesting (NEW)
│   │           └── /dashboard/profile (NEW)
│   │
│   └── Footer
│
└── Shared Components
    ├── UI Components (buttons, cards, inputs)
    ├── Presale Components (✅ exists)
    ├── Referral Components (✅ exists)
    ├── Purchase Components (NEW)
    ├── Vesting Components (NEW)
    └── Transaction Components (NEW)
```

---

## Summary

This architecture document provides a complete blueprint for the HypeAI Private Sale Dashboard frontend. The design leverages existing components while filling gaps with new implementations.

**Key Strengths:**
- ✅ Builds on existing codebase
- ✅ Modular component architecture
- ✅ Comprehensive user flows
- ✅ Web3-first design
- ✅ Mobile-responsive
- ✅ Production-ready patterns

**Next Steps:**
1. Review this architecture with stakeholders
2. Prioritize implementation phases
3. Begin Phase 1: Core Infrastructure
4. Set up development environment
5. Start building components

**Estimated Timeline:** 6 weeks for full implementation

**Team Required:**
- 2 Frontend Developers
- 1 Web3 Developer
- 1 UI/UX Designer (part-time)
- 1 QA Engineer

---

**Document Version:** 1.0
**Last Updated:** 2025-10-18
**Author:** Frontend Developer Agent
**Status:** Ready for Implementation
