# HypeAI Referral Dashboard - Component Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     HypeAI Referral Dashboard                       │
│                      (dashboard/index.tsx)                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                ┌─────────────────┴─────────────────┐
                │        Tab Navigation             │
                │  [Overview] [Referrals]           │
                │  [Rewards]  [Settings]            │
                └─────────────────┬─────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐        ┌───────────────┐        ┌───────────────┐
│  Overview Tab │        │ Referrals Tab │        │ Rewards Tab   │
└───────────────┘        └───────────────┘        └───────────────┘
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐        ┌───────────────┐        ┌───────────────┐
│  Referral     │        │  Referral     │        │  Claim        │
│  Dashboard    │        │  List         │        │  Rewards      │
│  Component    │        │  Component    │        │  Component    │
└───────────────┘        └───────────────┘        └───────────────┘
                                  │
                                  │
                         ┌────────┴────────┐
                         │  Settings Tab   │
                         └─────────────────┘
                                  │
                                  ▼
                         ┌────────────────┐
                         │  Referral      │
                         │  Settings      │
                         │  Component     │
                         └────────────────┘
```

## Component Hierarchy

```
dashboard/index.tsx
├── AuthModal (if not authenticated)
│   ├── Web3 Login
│   │   ├── MetaMask Button
│   │   └── Trust Wallet Button
│   └── Email Login
│       ├── Login Form
│       └── Register Form
│
└── Dashboard Container (if authenticated)
    ├── Header
    │   ├── Logo
    │   ├── User Info
    │   └── Logout Button
    │
    ├── Tab Navigation
    │   ├── Overview Tab
    │   ├── Referrals Tab
    │   ├── Rewards Tab
    │   └── Settings Tab
    │
    ├── Tab Content
    │   │
    │   ├── [Tab: Overview]
    │   │   └── ReferralDashboard
    │   │       ├── Header Section
    │   │       │   └── User Profile
    │   │       │
    │   │       ├── Stats Grid (4 cards)
    │   │       │   ├── Total Referrals
    │   │       │   ├── Total Earned (USDT)
    │   │       │   ├── Total Earned (HYPE)
    │   │       │   └── Pending Rewards
    │   │       │
    │   │       ├── Referral Link Section
    │   │       │   ├── Code Input
    │   │       │   ├── Full URL Input
    │   │       │   ├── Copy Button
    │   │       │   ├── QR Code Generator
    │   │       │   └── Statistics (Clicks/Conversions)
    │   │       │
    │   │       └── Tips Section
    │   │           ├── Target Audience
    │   │           ├── Social Media
    │   │           └── Create Content
    │   │
    │   ├── [Tab: Referrals]
    │   │   └── ReferralList
    │   │       ├── Header with Refresh
    │   │       │
    │   │       ├── Filters Section
    │   │       │   ├── Search Input
    │   │       │   ├── Status Filter
    │   │       │   └── Clear Filters
    │   │       │
    │   │       ├── Data Table
    │   │       │   ├── Table Header
    │   │       │   ├── Table Rows
    │   │       │   │   ├── User Info
    │   │       │   │   ├── Purchase Amount
    │   │       │   │   ├── Commission
    │   │       │   │   ├── Status Badge
    │   │       │   │   └── Date
    │   │       │   └── Loading/Error/Empty States
    │   │       │
    │   │       └── Pagination
    │   │           ├── Page Info
    │   │           ├── Previous Button
    │   │           ├── Page Numbers
    │   │           └── Next Button
    │   │
    │   ├── [Tab: Rewards]
    │   │   └── ClaimRewards
    │   │       ├── Pending Rewards Card
    │   │       │   ├── Amount Display
    │   │       │   ├── Token Equivalent
    │   │       │   ├── Claim Button
    │   │       │   └── Success/Error Messages
    │   │       │
    │   │       ├── Payout Info Card
    │   │       │   ├── Reward Type
    │   │       │   └── Payout Wallet
    │   │       │
    │   │       ├── Claim History Table
    │   │       │   ├── Amount
    │   │       │   ├── Reward Type
    │   │       │   ├── Status
    │   │       │   ├── Transaction Hash
    │   │       │   └── Dates
    │   │       │
    │   │       └── Important Notes
    │   │
    │   └── [Tab: Settings]
    │       └── ReferralSettings
    │           ├── Success/Error Messages
    │           │
    │           ├── Reward Preferences
    │           │   ├── HYPE Token Option
    │           │   └── USDT Option
    │           │
    │           ├── Payout Wallet
    │           │   ├── Wallet Input
    │           │   └── Validation
    │           │
    │           ├── Notifications
    │           │   ├── Email Toggle
    │           │   └── Telegram Toggle
    │           │
    │           ├── KYC Verification
    │           │   ├── Status Display
    │           │   └── File Upload
    │           │
    │           └── Save Button
    │
    └── Footer
        ├── About Section
        ├── Quick Links
        └── Contact Info
```

## Data Flow Diagram

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │
       ├─ Web3 Events ────────────┐
       │                          │
       ▼                          ▼
┌──────────────┐          ┌──────────────┐
│  useWeb3Auth │          │   MetaMask   │
│     Hook     │◄─────────┤ Trust Wallet │
└──────┬───────┘          └──────────────┘
       │
       ├─ Wallet State
       │
       ▼
┌──────────────┐
│   AuthModal  │
│  Component   │
└──────┬───────┘
       │
       ├─ User Login ─────────┐
       │                      │
       ▼                      ▼
┌──────────────┐      ┌──────────────┐
│ Dashboard    │      │  Backend API │
│   Page       │◄─────┤   Endpoints  │
└──────┬───────┘      └──────────────┘
       │                      ▲
       │                      │
       ├─ API Calls ──────────┤
       │                      │
       ▼                      │
┌──────────────────┐          │
│ useReferralAPI   │──────────┘
│     Hooks        │
│  ├─ useStats     │
│  ├─ useReferrals │
│  ├─ useLink      │
│  ├─ useClaims    │
│  └─ useSettings  │
└──────┬───────────┘
       │
       ├─ Data State
       │
       ▼
┌──────────────────┐
│   Components     │
│  ├─ Dashboard    │
│  ├─ List         │
│  ├─ Rewards      │
│  └─ Settings     │
└──────────────────┘
```

## Hook Dependencies

```
useWeb3Auth
├─ window.ethereum (MetaMask/Trust Wallet)
├─ useState (React)
├─ useEffect (React)
└─ useCallback (React)

useReferralAPI
├─ useState (React)
├─ useEffect (React)
├─ useCallback (React)
└─ fetch (Browser API)
    └─ Backend Endpoints
        ├─ /api/referrals/stats
        ├─ /api/referrals
        ├─ /api/referrals/link
        ├─ /api/referrals/claims
        └─ /api/referrals/settings
```

## Component Props Flow

```
dashboard/index.tsx
├─ user: User
│  └─ userId: string ───────────┐
│                               │
ReferralDashboard               │
├─ userId ◄─────────────────────┤
├─ userWallet                   │
└─ userEmail                    │
                                │
ReferralList                    │
└─ userId ◄─────────────────────┤
                                │
ClaimRewards                    │
├─ userId ◄─────────────────────┤
└─ settings                     │
                                │
ReferralSettings                │
└─ userId ◄─────────────────────┘
```

## State Management

```
Component State (useState)
├─ AuthModal
│  ├─ mode: 'login' | 'register' | 'web3'
│  ├─ email: string
│  ├─ password: string
│  ├─ error: string
│  └─ loading: boolean
│
├─ ReferralDashboard
│  ├─ qrCodeUrl: string
│  ├─ showQR: boolean
│  └─ copied: boolean
│
├─ ReferralList
│  ├─ page: number
│  ├─ pageSize: number
│  └─ filters: FilterOptions
│
├─ ClaimRewards
│  ├─ claiming: boolean
│  ├─ claimError: string
│  └─ claimSuccess: boolean
│
└─ ReferralSettings
   ├─ rewardType: 'USDT' | 'HYPE'
   ├─ payoutWallet: string
   ├─ emailNotifications: boolean
   ├─ telegramNotifications: boolean
   ├─ walletError: string
   ├─ saving: boolean
   ├─ saveSuccess: boolean
   └─ saveError: string

Hook State (Custom Hooks)
├─ useWeb3Auth
│  ├─ account: string | null
│  ├─ chainId: number | null
│  ├─ isConnected: boolean
│  ├─ isConnecting: boolean
│  └─ error: string | null
│
└─ useReferralAPI (multiple hooks)
   ├─ data: T | null
   ├─ loading: boolean
   └─ error: string | null
```

## Utility Functions Flow

```
helpers.ts
├─ Formatting
│  ├─ shortenAddress(address) → "0x1234...5678"
│  ├─ formatCurrency(amount) → "$1,234.56"
│  ├─ formatNumber(num) → "1,234"
│  └─ formatDate(date) → "Jan 15, 2025 10:30 AM"
│
├─ Clipboard
│  └─ copyToClipboard(text) → Promise<boolean>
│
├─ QR Code
│  ├─ generateQRCode(text) → Promise<string>
│  └─ downloadQRCode(dataUrl, filename) → void
│
├─ Styling
│  ├─ getStatusColor(status) → "text-green-600 bg-green-100"
│  └─ getStatusIcon(status) → "✅"
│
├─ Performance
│  └─ debounce(func, wait) → Function
│
└─ Validation
   ├─ validateEmail(email) → boolean
   └─ validateWalletAddress(address) → boolean
```

## File Size Distribution

```
Component Files (2,000 lines)
├─ AuthModal.tsx           ████████░░ 350 lines (17.5%)
├─ ReferralDashboard.tsx   ████████░░ 380 lines (19.0%)
├─ ReferralList.tsx        █████████░ 420 lines (21.0%)
├─ ClaimRewards.tsx        ████████░░ 400 lines (20.0%)
└─ ReferralSettings.tsx    █████████░ 450 lines (22.5%)

Hook Files (350 lines)
├─ useWeb3Auth.ts          ███░░░░░░░ 130 lines (37.1%)
└─ useReferralAPI.ts       ███████░░░ 220 lines (62.9%)

Other Files (550 lines)
├─ dashboard/index.tsx     █████░░░░░ 280 lines (50.9%)
├─ helpers.ts              ███░░░░░░░ 150 lines (27.3%)
└─ referral.ts             ██░░░░░░░░  80 lines (14.5%)
└─ index.ts                ░░░░░░░░░░   5 lines ( 0.9%)
```

## Technology Stack Visualization

```
┌─────────────────────────────────────────┐
│           User Interface                │
│  (React Components + Tailwind CSS)      │
├─────────────────────────────────────────┤
│         State Management                │
│    (React Hooks + Custom Hooks)         │
├─────────────────────────────────────────┤
│        Web3 Integration                 │
│    (MetaMask + Trust Wallet API)        │
├─────────────────────────────────────────┤
│         Data Fetching                   │
│       (Fetch API + Hooks)               │
├─────────────────────────────────────────┤
│       Backend API Layer                 │
│    (Next.js API Routes)                 │
└─────────────────────────────────────────┘
```

---

**Last Updated**: January 2025
**Version**: 1.0.0
