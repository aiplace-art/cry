# HypeAI Private Sale Dashboard - Architecture Design

**Version:** 1.0.0
**Last Updated:** 2025-10-18
**Design Style:** BNB Chain (Binance Smart Chain)

---

## 1. Executive Summary

This document outlines the complete architecture for a professional Private Sale Dashboard inspired by BNB Chain's design language. The dashboard provides users with a seamless experience to purchase HYPE tokens, track their investments, manage referrals, and monitor vesting schedules.

### Key Objectives

- **Professional Design:** BNB Chain-inspired UI with gold/yellow color scheme
- **User-Friendly:** Intuitive navigation and clear information hierarchy
- **Comprehensive:** All private sale features in one unified dashboard
- **Responsive:** Mobile-first approach with tablet and desktop optimization
- **Secure:** Industry-standard security practices and wallet integration

---

## 2. Design System

### 2.1 Color Palette (BNB Chain Style)

```css
/* Primary Colors */
--bnb-gold: #F3BA2F;           /* BNB Yellow/Gold - Primary brand */
--bnb-black: #0B0E11;          /* Deep Black - Backgrounds */
--bnb-white: #FFFFFF;          /* Pure White - Text/Highlights */

/* Gradient Colors */
--gradient-gold: linear-gradient(135deg, #F3BA2F 0%, #FFD54F 100%);
--gradient-dark: linear-gradient(135deg, #0B0E11 0%, #1E2329 100%);
--gradient-gold-dark: linear-gradient(135deg, #F3BA2F 0%, #C79100 100%);

/* Secondary Colors */
--bnb-gray-100: #FAFAFA;       /* Lightest gray */
--bnb-gray-200: #EAECEF;       /* Light gray */
--bnb-gray-300: #C99400;       /* Medium gold-gray */
--bnb-gray-700: #2B3139;       /* Dark gray */
--bnb-gray-800: #1E2329;       /* Darker gray */
--bnb-gray-900: #0B0E11;       /* Darkest gray */

/* Status Colors */
--success-green: #0ECB81;      /* Success states */
--error-red: #F6465D;          /* Error states */
--warning-orange: #F0B90B;     /* Warning states */
--info-blue: #3DCFCF;          /* Info states */

/* Chart Colors */
--chart-green: #0ECB81;
--chart-red: #F6465D;
--chart-blue: #3DCFCF;
--chart-purple: #B47AFF;
--chart-orange: #F0B90B;
```

### 2.2 Typography

```css
/* Font Family */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 2.3 Spacing & Layout

```css
/* Spacing Scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */

/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-gold: 0 4px 16px rgba(243, 186, 47, 0.3);
```

---

## 3. Component Architecture

### 3.1 Component Hierarchy

```
DashboardLayout
├── Header
│   ├── Logo
│   ├── Navigation
│   └── UserProfile
├── Sidebar (Desktop)
│   ├── MenuItems
│   └── QuickStats
├── MainContent
│   ├── Dashboard (Overview)
│   ├── BuyTokens
│   ├── MyPurchases
│   ├── ReferralSystem
│   ├── Wallet
│   └── Settings
└── Footer
```

### 3.2 Page Sections

#### 3.2.1 Dashboard (Overview)

**Purpose:** High-level overview of user's private sale participation

**Components:**
- `StatsGrid` - KPI cards (Total Investment, Total Tokens, Available Balance, Vested Amount)
- `TokenPriceWidget` - Live token price with 24h change
- `VestingProgressBar` - Visual representation of vesting schedule
- `RecentActivityFeed` - Latest transactions and updates
- `QuickActionButtons` - Buy More, Claim Tokens, Share Referral

#### 3.2.2 Buy Tokens

**Purpose:** Token purchase interface

**Components:**
- `PaymentMethodSelector` - Choose payment method (BNB, USDT, ETH, etc.)
- `PurchaseCalculator` - Real-time calculation with bonus display
- `BonusTierDisplay` - Visual representation of bonus tiers
- `TransactionPreview` - Review before confirming
- `PurchaseButton` - Execute transaction
- `TransactionStatusModal` - Success/Error feedback

#### 3.2.3 My Purchases

**Purpose:** Transaction history and purchase details

**Components:**
- `PurchaseHistoryTable` - Sortable/filterable transaction list
- `PurchaseDetailCard` - Individual purchase details
- `ExportButton` - Download CSV/PDF reports
- `FilterBar` - Filter by date, status, payment method

#### 3.2.4 Referral System

**Purpose:** Manage referrals and track earnings

**Components:**
- `ReferralLinkGenerator` - Copy/share referral link
- `ReferralStatsCards` - Total Referrals, Earnings, Conversion Rate
- `ReferralTable` - List of referred users
- `SocialShareButtons` - Quick share to social platforms
- `CommissionCalculator` - Estimate potential earnings

#### 3.2.5 Wallet

**Purpose:** Wallet management and token operations

**Components:**
- `WalletBalanceCard` - Total balance with breakdown
- `TokenListTable` - Available, vested, locked tokens
- `VestingScheduleTimeline` - Interactive vesting calendar
- `ClaimTokensButton` - Claim unlocked tokens
- `AddToWalletButton` - Add token to MetaMask/wallet

#### 3.2.6 Settings

**Purpose:** User preferences and account management

**Components:**
- `ProfileSettings` - Name, email, avatar
- `NotificationPreferences` - Email/SMS/Push preferences
- `SecuritySettings` - 2FA, password, wallet management
- `LanguageCurrencySettings` - Localization preferences
- `APIKeysManagement` - For advanced users

---

## 4. Data Flow Architecture

### 4.1 State Management

**Technology:** React Context API + Custom Hooks

```typescript
// Global State Contexts
UserContext          // User authentication and profile
WalletContext        // Web3 wallet connection
PrivateSaleContext   // Private sale data (config, purchases)
ReferralContext      // Referral data and stats
NotificationContext  // Alerts and notifications
ThemeContext         // UI theme (light/dark mode)
```

### 4.2 Data Flow Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ├──> Connect Wallet (Web3Context)
       │         │
       │         ├──> Fetch User Data (API)
       │         └──> Load Private Sale Config
       │
       ├──> Purchase Tokens
       │         │
       │         ├──> Calculate Bonus (calculateTokens)
       │         ├──> Create Transaction (processPurchase)
       │         ├──> Smart Contract Call
       │         └──> Update UI (Success/Error)
       │
       ├──> View Purchases
       │         │
       │         └──> Fetch Purchase History (API)
       │
       ├──> Manage Referrals
       │         │
       │         ├──> Generate Link (getReferralLink)
       │         └──> Fetch Referral Stats (API)
       │
       └──> Claim Vested Tokens
                 │
                 ├──> Check Unlock Status
                 ├──> Smart Contract Call (claim)
                 └──> Update Balance
```

### 4.3 API Endpoints

```typescript
// Authentication
POST   /api/auth/login           // User login
POST   /api/auth/logout          // User logout
GET    /api/auth/me              // Get current user

// Private Sale
GET    /api/private-sale/config  // Get sale configuration
POST   /api/private-sale/purchase // Purchase tokens
GET    /api/private-sale/purchases // Get user purchases
GET    /api/private-sale/stats   // Get sale statistics

// Referrals
GET    /api/referrals            // Get user referrals
POST   /api/referrals/claim      // Claim referral rewards
GET    /api/referrals/stats      // Get referral statistics

// Wallet
GET    /api/wallet/balance       // Get token balance
POST   /api/wallet/claim         // Claim vested tokens
GET    /api/wallet/vesting       // Get vesting schedule

// User
GET    /api/user/profile         // Get user profile
PUT    /api/user/profile         // Update user profile
GET    /api/user/settings        // Get user settings
PUT    /api/user/settings        // Update user settings
```

---

## 5. Layout Wireframes

### 5.1 Desktop Layout (1920x1080)

```
┌────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
│ [Logo] [Dashboard] [Buy] [Purchases] [Referrals] [Profile] │
├──────────┬─────────────────────────────────────────────────┤
│          │                                                  │
│ SIDEBAR  │            MAIN CONTENT AREA                    │
│          │                                                  │
│ Menu     │  ┌─────────────────────────────────────────┐   │
│ - Home   │  │         Stats Cards (4 columns)         │   │
│ - Buy    │  └─────────────────────────────────────────┘   │
│ - Hist   │                                                  │
│ - Refer  │  ┌──────────────────┐ ┌──────────────────┐    │
│ - Wallet │  │  Token Price     │ │  Quick Actions   │    │
│ - Set    │  │  Chart           │ │  - Buy More      │    │
│          │  └──────────────────┘ └──────────────────┘    │
│ Quick    │                                                  │
│ Stats    │  ┌─────────────────────────────────────────┐   │
│ $234K    │  │     Vesting Progress Timeline            │   │
│ 567M     │  └─────────────────────────────────────────┘   │
│          │                                                  │
│          │  ┌─────────────────────────────────────────┐   │
│          │  │     Recent Activity Feed                 │   │
│          │  └─────────────────────────────────────────┘   │
└──────────┴─────────────────────────────────────────────────┘
```

### 5.2 Mobile Layout (375x812)

```
┌──────────────────────┐
│ HEADER               │
│ [☰] Logo   [Profile] │
├──────────────────────┤
│                      │
│  Stats Grid (2x2)    │
│  ┌────┐┌────┐       │
│  │ $  ││Tkn │       │
│  └────┘└────┘       │
│  ┌────┐┌────┐       │
│  │Avl ││Vst │       │
│  └────┘└────┘       │
│                      │
│  ┌────────────────┐ │
│  │ Token Price    │ │
│  │ Chart          │ │
│  └────────────────┘ │
│                      │
│  ┌────────────────┐ │
│  │ Vesting        │ │
│  │ Progress       │ │
│  └────────────────┘ │
│                      │
│  ┌────────────────┐ │
│  │ Quick Actions  │ │
│  │ [Buy] [Claim]  │ │
│  └────────────────┘ │
│                      │
│  Recent Activity     │
│  - Transaction 1     │
│  - Transaction 2     │
│                      │
├──────────────────────┤
│ BOTTOM NAV           │
│ [Home][Buy][Ref][Me] │
└──────────────────────┘
```

---

## 6. Interaction Patterns

### 6.1 Navigation Flow

```
Entry Point (Private Sale Page)
    │
    ├──> Click "Join Private Sale"
    │        │
    │        ├──> Not Logged In? → Auth Modal
    │        └──> Logged In → Dashboard
    │
    └──> Dashboard
             │
             ├──> Buy Tokens → Purchase Flow
             │                     │
             │                     ├──> Select Payment
             │                     ├──> Enter Amount
             │                     ├──> Review Preview
             │                     ├──> Confirm Transaction
             │                     └──> Success/Error
             │
             ├──> My Purchases → History View
             │                     │
             │                     ├──> View Details
             │                     ├──> Export Report
             │                     └──> Filter/Sort
             │
             ├──> Referrals → Referral Dashboard
             │                     │
             │                     ├──> Copy Link
             │                     ├──> Share Social
             │                     └──> View Stats
             │
             ├──> Wallet → Wallet Management
             │                     │
             │                     ├──> View Balance
             │                     ├──> Claim Tokens
             │                     └──> View Vesting
             │
             └──> Settings → Preferences
                               │
                               ├──> Edit Profile
                               ├──> Notifications
                               └──> Security
```

### 6.2 User Interactions

**Hover States:**
- Buttons: Scale(1.02) + Shadow increase
- Cards: Lift effect with shadow
- Links: Underline + color change

**Click/Tap:**
- Buttons: Scale(0.98) + Ripple effect
- Cards: Immediate feedback with border highlight
- Inputs: Focus ring with BNB gold color

**Loading States:**
- Skeleton screens for data loading
- Spinner animations for actions
- Progress bars for transactions

**Animations:**
- Page transitions: Fade + Slide (300ms)
- Modal entrance: Scale + Fade (200ms)
- Number changes: Count-up animation
- Charts: Delayed entrance for bars/lines

---

## 7. Responsive Breakpoints

```css
/* Mobile First Approach */
--breakpoint-xs: 320px;   /* Small phones */
--breakpoint-sm: 640px;   /* Large phones */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small laptops */
--breakpoint-xl: 1280px;  /* Large laptops */
--breakpoint-2xl: 1536px; /* Desktops */

/* Layout Rules */
xs-sm:  Single column, bottom nav, full-width cards
md:     Two columns, side nav appears, grid layouts
lg-xl:  Sidebar + main content, multi-column grids
2xl:    Max-width containers, enhanced spacing
```

---

## 8. Performance Considerations

### 8.1 Optimization Strategies

**Code Splitting:**
- Route-based splitting for each dashboard section
- Lazy load heavy components (charts, tables)
- Dynamic imports for modals and overlays

**Caching:**
- API responses cached with React Query
- Static assets served with long cache headers
- Service worker for offline functionality

**Image Optimization:**
- WebP format with PNG fallback
- Responsive images with srcset
- Lazy loading for below-fold images

**Bundle Size:**
- Tree-shaking unused dependencies
- Minification and compression
- CDN for external libraries

### 8.2 Performance Targets

```
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms
```

---

## 9. Accessibility Standards

**WCAG 2.1 Level AA Compliance:**

- Color contrast ratio: 4.5:1 for text
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators on all interactive elements
- ARIA labels and descriptions
- Alternative text for images
- Semantic HTML structure
- Skip navigation links

---

## 10. Security Architecture

### 10.1 Authentication

- JWT tokens with refresh mechanism
- HTTP-only cookies for token storage
- CSRF protection
- Rate limiting on API endpoints

### 10.2 Wallet Security

- Never store private keys
- Sign transactions client-side
- Verify contract addresses
- Display clear transaction previews
- Implement spending limits

### 10.3 Data Protection

- HTTPS enforced
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Content Security Policy headers

---

## 11. Technology Stack

### 11.1 Frontend

```typescript
// Core Framework
Next.js 14.0.0        // React framework
React 18.2.0          // UI library
TypeScript 5.0.0      // Type safety

// Styling
Tailwind CSS 3.4.0    // Utility-first CSS
Framer Motion 10.0.0  // Animations

// State Management
React Context API     // Global state
React Query 5.0.0     // Server state

// Web3 Integration
ethers.js 6.9.0       // Ethereum library
wagmi 1.4.0           // React hooks for Ethereum
RainbowKit 1.3.0      // Wallet connection UI

// Charts & Visualization
Recharts 2.10.0       // Chart library
D3.js 7.8.0           // Advanced visualizations

// Forms & Validation
React Hook Form 7.48.0 // Form management
Zod 3.22.0            // Schema validation

// Utilities
date-fns 3.0.0        // Date manipulation
numeral 2.0.6         // Number formatting
clsx 2.0.0            // Conditional classes
```

### 11.2 Backend (API Routes)

```typescript
// API Framework
Next.js API Routes    // Serverless functions
Prisma 5.7.0          // Database ORM

// Database
PostgreSQL 16.0       // Main database
Redis 7.2             // Caching layer

// Blockchain
ethers.js 6.9.0       // Smart contract interaction
BSC RPC               // Binance Smart Chain node
```

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Setup project structure
- [ ] Implement design system
- [ ] Create base components (Button, Input, Card)
- [ ] Setup routing and navigation

### Phase 2: Core Features (Week 3-4)
- [ ] Dashboard overview page
- [ ] Buy tokens functionality
- [ ] Purchase history
- [ ] Wallet integration

### Phase 3: Advanced Features (Week 5-6)
- [ ] Referral system
- [ ] Settings page
- [ ] Notifications
- [ ] Mobile optimization

### Phase 4: Polish & Testing (Week 7-8)
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Security review
- [ ] User testing
- [ ] Bug fixes

---

## 13. Success Metrics

**Key Performance Indicators:**

- User Engagement: Daily Active Users (DAU)
- Conversion Rate: Visit → Purchase
- Average Purchase Value
- Referral Conversion Rate
- Page Load Time < 2s
- Zero critical security incidents
- 95%+ uptime
- User Satisfaction Score > 4.5/5

---

## 14. Future Enhancements

**Planned Features:**

1. **Advanced Analytics Dashboard**
   - Portfolio performance tracking
   - ROI calculator
   - Market comparison charts

2. **Social Features**
   - Leaderboard for top referrers
   - Achievement badges
   - Community chat

3. **Mobile App**
   - Native iOS/Android apps
   - Push notifications
   - Biometric authentication

4. **DeFi Integration**
   - Staking directly from dashboard
   - Liquidity pool participation
   - Yield farming integration

5. **Multi-Language Support**
   - i18n implementation
   - RTL support
   - Currency localization

---

## 15. Conclusion

This architecture provides a solid foundation for building a professional, secure, and user-friendly Private Sale Dashboard. The BNB Chain-inspired design ensures brand consistency while maintaining excellent usability across all devices.

**Next Steps:**
1. Review and approve architecture
2. Create detailed technical specifications
3. Begin component development
4. Implement API endpoints
5. Conduct testing and iteration

---

**Document Control:**
- **Author:** System Architect
- **Reviewers:** Product Team, Development Team, Security Team
- **Approval Date:** TBD
- **Next Review:** Monthly

