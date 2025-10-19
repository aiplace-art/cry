# Dashboard Components - Implementation List

**Version:** 1.0.0
**Last Updated:** 2025-10-18
**Total Components:** 45

---

## Component Organization

```
Priority Levels:
🔴 P0 - Critical (Week 1-2)
🟡 P1 - High (Week 3-4)
🟢 P2 - Medium (Week 5-6)
🔵 P3 - Low (Week 7-8)
```

---

## 1. Layout Components (7 components)

### 1.1 DashboardLayout 🔴 P0

**File:** `layout/DashboardLayout.tsx`

**Props:**
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
  className?: string;
}
```

**Dependencies:**
- Header
- Sidebar
- MobileNav
- Footer

**Features:**
- Responsive layout switching
- Sidebar collapse/expand
- Mobile bottom navigation
- SEO meta tags

---

### 1.2 Header 🔴 P0

**File:** `layout/Header.tsx`

**Props:**
```typescript
interface HeaderProps {
  user?: User;
  onLogout?: () => void;
  showMobileMenu?: boolean;
  onToggleMobileMenu?: () => void;
}
```

**Dependencies:**
- Logo (from public/assets)
- UserProfile dropdown
- NotificationBell

**Features:**
- Logo with link to home
- Navigation menu (desktop)
- User profile dropdown
- Notification center
- Mobile menu toggle

---

### 1.3 Sidebar 🔴 P0

**File:** `layout/Sidebar.tsx`

**Props:**
```typescript
interface SidebarProps {
  activeRoute: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}
```

**Dependencies:**
- Navigation items config
- Icons (lucide-react)

**Features:**
- Collapsible sidebar
- Active route highlighting
- Icon + text labels
- Quick stats widget
- Responsive visibility

---

### 1.4 MobileNav 🟡 P1

**File:** `layout/MobileNav.tsx`

**Props:**
```typescript
interface MobileNavProps {
  activeRoute: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  route: string;
  icon: React.ReactNode;
  badge?: number;
}
```

**Features:**
- Fixed bottom navigation
- Icon buttons with labels
- Badge notifications
- Active state indicator
- Haptic feedback (mobile)

---

### 1.5 Footer 🟢 P2

**File:** `layout/Footer.tsx`

**Props:**
```typescript
interface FooterProps {
  variant?: 'full' | 'minimal';
}
```

**Features:**
- Social media links
- Legal links (Terms, Privacy)
- Copyright notice
- Newsletter signup (optional)

---

### 1.6 Breadcrumbs 🟢 P2

**File:** `layout/Breadcrumbs.tsx`

**Props:**
```typescript
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}
```

---

### 1.7 PageHeader 🟡 P1

**File:** `layout/PageHeader.tsx`

**Props:**
```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}
```

---

## 2. Overview/Dashboard Components (6 components)

### 2.1 StatsGrid 🔴 P0

**File:** `overview/StatsGrid.tsx`

**Props:**
```typescript
interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
}

interface StatItem {
  id: string;
  title: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  color?: 'gold' | 'green' | 'red' | 'blue';
}
```

**Dependencies:**
- StatsCard

---

### 2.2 StatsCard 🔴 P0

**File:** `overview/StatsCard.tsx`

**Props:**
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
  formatValue?: (value: number) => string;
}
```

**Features:**
- Animated value changes
- Trend indicator (up/down arrow)
- Color-coded backgrounds
- Skeleton loading state
- Hover effects

---

### 2.3 TokenPriceWidget 🔴 P0

**File:** `overview/TokenPriceWidget.tsx`

**Props:**
```typescript
interface TokenPriceWidgetProps {
  price: number;
  change24h: number;
  volume24h?: number;
  showChart?: boolean;
  chartData?: PricePoint[];
}

interface PricePoint {
  timestamp: number;
  price: number;
}
```

**Dependencies:**
- Recharts (LineChart)

**Features:**
- Real-time price updates
- 24h change percentage
- Mini price chart
- WebSocket connection

---

### 2.4 VestingProgressBar 🔴 P0

**File:** `overview/VestingProgressBar.tsx`

**Props:**
```typescript
interface VestingProgressBarProps {
  totalTokens: number;
  unlockedTokens: number;
  schedule: VestingPeriod[];
  showDetails?: boolean;
}

interface VestingPeriod {
  id: string;
  amount: number;
  unlockDate: Date;
  claimed: boolean;
}
```

**Features:**
- Progress bar with segments
- Tooltip on hover
- Next unlock date
- Claimed/unclaimed status

---

### 2.5 RecentActivityFeed 🟡 P1

**File:** `overview/RecentActivityFeed.tsx`

**Props:**
```typescript
interface RecentActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  onLoadMore?: () => void;
}

interface Activity {
  id: string;
  type: 'purchase' | 'claim' | 'referral' | 'unlock';
  title: string;
  description: string;
  timestamp: Date;
  icon?: React.ReactNode;
  link?: string;
}
```

**Features:**
- Chronological timeline
- Activity type icons
- Relative timestamps
- Load more functionality

---

### 2.6 QuickActionButtons 🟡 P1

**File:** `overview/QuickActionButtons.tsx`

**Props:**
```typescript
interface QuickActionButtonsProps {
  actions: QuickAction[];
  layout?: 'horizontal' | 'vertical' | 'grid';
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  badge?: number;
  color?: 'gold' | 'blue' | 'green';
}
```

---

## 3. Purchase Components (6 components)

### 3.1 BuyTokensPage 🔴 P0

**File:** `purchase/BuyTokensPage.tsx`

**Props:**
```typescript
interface BuyTokensPageProps {
  config: PrivateSaleConfig;
}
```

**Dependencies:**
- PaymentMethodSelector
- PurchaseCalculator
- BonusTierDisplay
- TransactionPreview
- TransactionStatusModal

---

### 3.2 PaymentMethodSelector 🔴 P0

**File:** `purchase/PaymentMethodSelector.tsx`

**Props:**
```typescript
interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedMethod?: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  disabled?: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  network: string;
  contractAddress: string;
  decimals: number;
}
```

**Features:**
- Grid or list layout
- Method logos
- Network badges
- Selection indicator

---

### 3.3 PurchaseCalculator 🔴 P0

**File:** `purchase/PurchaseCalculator.tsx`

**Props:**
```typescript
interface PurchaseCalculatorProps {
  tokenPrice: number;
  bonusTiers: BonusTier[];
  minPurchase: number;
  maxPurchase: number;
  onCalculate: (result: CalculationResult) => void;
  disabled?: boolean;
}
```

**Features:**
- Real-time calculation
- USD input field
- Token output display
- Bonus visualization
- Min/max validation

---

### 3.4 BonusTierDisplay 🟡 P1

**File:** `purchase/BonusTierDisplay.tsx`

**Props:**
```typescript
interface BonusTierDisplayProps {
  tiers: BonusTier[];
  currentAmount?: number;
  highlightActive?: boolean;
}

interface BonusTier {
  minAmount: number;
  maxAmount?: number;
  bonus: number;
}
```

**Features:**
- Visual tier progression
- Active tier highlighting
- Percentage badges
- Responsive layout

---

### 3.5 TransactionPreview 🔴 P0

**File:** `purchase/TransactionPreview.tsx`

**Props:**
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

**Features:**
- Line-by-line breakdown
- Gas fee estimation
- Total calculation
- Confirm/Cancel buttons
- Loading spinner

---

### 3.6 TransactionStatusModal 🔴 P0

**File:** `purchase/TransactionStatusModal.tsx`

**Props:**
```typescript
interface TransactionStatusModalProps {
  isOpen: boolean;
  status: 'pending' | 'success' | 'error';
  transactionHash?: string;
  amount?: number;
  tokens?: number;
  error?: string;
  onClose: () => void;
  onViewExplorer?: () => void;
}
```

**Features:**
- Success animation
- Error message display
- Transaction link
- Action buttons
- Auto-close option

---

## 4. History Components (4 components)

### 4.1 PurchaseHistoryPage 🟡 P1

**File:** `history/PurchaseHistoryPage.tsx`

**Props:**
```typescript
interface PurchaseHistoryPageProps {
  userId: string;
}
```

**Dependencies:**
- PurchaseHistoryTable
- FilterBar
- ExportButton

---

### 4.2 PurchaseHistoryTable 🟡 P1

**File:** `history/PurchaseHistoryTable.tsx`

**Props:**
```typescript
interface PurchaseHistoryTableProps {
  purchases: Purchase[];
  loading?: boolean;
  onSort?: (field: keyof Purchase, direction: 'asc' | 'desc') => void;
  onSelectPurchase?: (purchase: Purchase) => void;
}
```

**Features:**
- Sortable columns
- Status badges
- Pagination
- Row selection
- Responsive cards (mobile)

---

### 4.3 PurchaseDetailCard 🟢 P2

**File:** `history/PurchaseDetailCard.tsx`

**Props:**
```typescript
interface PurchaseDetailCardProps {
  purchase: Purchase;
  onClose?: () => void;
}
```

**Features:**
- Full transaction details
- Explorer link
- Vesting breakdown
- Download receipt

---

### 4.4 FilterBar 🟢 P2

**File:** `history/FilterBar.tsx`

**Props:**
```typescript
interface FilterBarProps {
  filters: Filter[];
  activeFilters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onReset: () => void;
}

interface Filter {
  id: string;
  label: string;
  type: 'select' | 'date' | 'range';
  options?: { label: string; value: any }[];
}
```

---

## 5. Referral Components (5 components)

### 5.1 ReferralPage 🟡 P1

**File:** `referral/ReferralPage.tsx`

**Props:**
```typescript
interface ReferralPageProps {
  userId: string;
  userWallet?: string;
}
```

**Dependencies:**
- ReferralLinkGenerator
- ReferralStatsCards
- ReferralTable
- SocialShareButtons
- CommissionCalculator

---

### 5.2 ReferralLinkGenerator 🟡 P1

**File:** `referral/ReferralLinkGenerator.tsx`

**Props:**
```typescript
interface ReferralLinkGeneratorProps {
  referralCode: string;
  baseUrl: string;
  onCopy?: () => void;
}
```

**Features:**
- Copy to clipboard
- QR code generation
- Custom message
- Share buttons

---

### 5.3 ReferralStatsCards 🟡 P1

**File:** `referral/ReferralStatsCards.tsx`

**Props:**
```typescript
interface ReferralStatsCardsProps {
  stats: ReferralStats;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  conversionRate: number;
}
```

---

### 5.4 ReferralTable 🟡 P1

**File:** `referral/ReferralTable.tsx`

**Props:**
```typescript
interface ReferralTableProps {
  referrals: Referral[];
  loading?: boolean;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
}

interface Referral {
  id: string;
  walletAddress: string;
  joinDate: Date;
  totalPurchased: number;
  yourEarnings: number;
  status: 'active' | 'inactive';
}
```

---

### 5.5 SocialShareButtons 🟢 P2

**File:** `referral/SocialShareButtons.tsx`

**Props:**
```typescript
interface SocialShareButtonsProps {
  url: string;
  title: string;
  platforms?: ('twitter' | 'telegram' | 'discord' | 'facebook')[];
}
```

---

## 6. Wallet Components (5 components)

### 6.1 WalletPage 🟡 P1

**File:** `wallet/WalletPage.tsx`

**Props:**
```typescript
interface WalletPageProps {
  userId: string;
  walletAddress: string;
}
```

**Dependencies:**
- WalletBalanceCard
- TokenListTable
- VestingScheduleTimeline
- ClaimTokensButton
- AddToWalletButton

---

### 6.2 WalletBalanceCard 🟡 P1

**File:** `wallet/WalletBalanceCard.tsx`

**Props:**
```typescript
interface WalletBalanceCardProps {
  balance: {
    total: number;
    available: number;
    vested: number;
    locked: number;
  };
  loading?: boolean;
}
```

**Features:**
- Total balance prominently displayed
- Breakdown by status
- USD value conversion
- Refresh button

---

### 6.3 TokenListTable 🟡 P1

**File:** `wallet/TokenListTable.tsx`

**Props:**
```typescript
interface TokenListTableProps {
  tokens: TokenBalance[];
}

interface TokenBalance {
  symbol: string;
  name: string;
  amount: number;
  status: 'available' | 'vested' | 'locked';
  unlockDate?: Date;
}
```

---

### 6.4 VestingScheduleTimeline 🟡 P1

**File:** `wallet/VestingScheduleTimeline.tsx`

**Props:**
```typescript
interface VestingScheduleTimelineProps {
  schedule: VestingPeriod[];
  showPastEvents?: boolean;
}
```

**Features:**
- Visual timeline
- Milestone markers
- Amount labels
- Past/future indication
- Next unlock highlight

---

### 6.5 ClaimTokensButton 🟡 P1

**File:** `wallet/ClaimTokensButton.tsx`

**Props:**
```typescript
interface ClaimTokensButtonProps {
  claimableAmount: number;
  onClaim: () => Promise<void>;
  disabled?: boolean;
}
```

**Features:**
- Claim amount display
- Disabled state (nothing to claim)
- Loading animation
- Success feedback

---

## 7. Settings Components (4 components)

### 7.1 SettingsPage 🟢 P2

**File:** `settings/SettingsPage.tsx`

**Props:**
```typescript
interface SettingsPageProps {
  userId: string;
}
```

**Dependencies:**
- ProfileSettings
- NotificationPreferences
- SecuritySettings
- LanguageCurrencySettings

---

### 7.2 ProfileSettings 🟢 P2

**File:** `settings/ProfileSettings.tsx`

**Props:**
```typescript
interface ProfileSettingsProps {
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<void>;
}
```

**Features:**
- Avatar upload
- Name/email fields
- Bio/description
- Save button

---

### 7.3 NotificationPreferences 🟢 P2

**File:** `settings/NotificationPreferences.tsx`

**Props:**
```typescript
interface NotificationPreferencesProps {
  preferences: NotificationPreferences;
  onUpdate: (preferences: NotificationPreferences) => Promise<void>;
}

interface NotificationPreferences {
  email: {
    purchases: boolean;
    vestingUnlocks: boolean;
    referrals: boolean;
    promotions: boolean;
  };
  push: {
    enabled: boolean;
    purchases: boolean;
    vestingUnlocks: boolean;
  };
}
```

---

### 7.4 SecuritySettings 🟢 P2

**File:** `settings/SecuritySettings.tsx`

**Props:**
```typescript
interface SecuritySettingsProps {
  userId: string;
}
```

**Features:**
- 2FA setup
- Password change
- Connected wallets list
- Session management

---

## 8. UI Components (8 components)

### 8.1 Button 🔴 P0

**File:** `ui/Button.tsx`

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}
```

---

### 8.2 Card 🔴 P0

**File:** `ui/Card.tsx`

**Props:**
```typescript
interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}
```

---

### 8.3 Input 🔴 P0

**File:** `ui/Input.tsx`

**Props:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  fullWidth?: boolean;
}
```

---

### 8.4 Badge 🟡 P1

**File:** `ui/Badge.tsx`

**Props:**
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  icon?: React.ReactNode;
}
```

---

### 8.5 Loading 🔴 P0

**File:** `ui/Loading.tsx`

**Props:**
```typescript
interface LoadingProps {
  variant?: 'spinner' | 'skeleton' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}
```

---

### 8.6 Modal 🟡 P1

**File:** `ui/Modal.tsx`

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}
```

---

### 8.7 Tooltip 🟢 P2

**File:** `ui/Tooltip.tsx`

**Props:**
```typescript
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  trigger?: 'hover' | 'click';
}
```

---

### 8.8 Chart 🟡 P1

**File:** `ui/Chart.tsx`

**Props:**
```typescript
interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  config: ChartConfig;
  height?: number;
  loading?: boolean;
}
```

---

## Implementation Order

### Week 1-2 (Foundation) 🔴 P0
1. DashboardLayout
2. Header
3. Sidebar
4. Button
5. Card
6. Input
7. Loading
8. StatsGrid
9. StatsCard
10. TokenPriceWidget
11. VestingProgressBar
12. PaymentMethodSelector
13. PurchaseCalculator
14. TransactionPreview
15. TransactionStatusModal

### Week 3-4 (Core Features) 🟡 P1
16. PageHeader
17. MobileNav
18. RecentActivityFeed
19. QuickActionButtons
20. BonusTierDisplay
21. PurchaseHistoryPage
22. PurchaseHistoryTable
23. ReferralPage
24. ReferralLinkGenerator
25. ReferralStatsCards
26. ReferralTable
27. WalletPage
28. WalletBalanceCard
29. TokenListTable
30. VestingScheduleTimeline
31. ClaimTokensButton
32. Badge
33. Modal
34. Chart

### Week 5-6 (Polish) 🟢 P2
35. Footer
36. Breadcrumbs
37. PurchaseDetailCard
38. FilterBar
39. SocialShareButtons
40. SettingsPage
41. ProfileSettings
42. NotificationPreferences
43. SecuritySettings
44. Tooltip

### Week 7-8 (Optional) 🔵 P3
45. Additional features based on testing feedback

---

## Component Dependencies

```
External Dependencies:
- react: ^18.2.0
- next: ^14.0.0
- tailwindcss: ^3.4.0
- framer-motion: ^10.0.0
- lucide-react: ^0.300.0
- recharts: ^2.10.0
- ethers: ^6.9.0
- date-fns: ^3.0.0
- clsx: ^2.0.0
- react-hook-form: ^7.48.0
- zod: ^3.22.0
```

---

## Testing Requirements

Each component must have:
- ✅ Unit tests (Jest + React Testing Library)
- ✅ Storybook story
- ✅ TypeScript types
- ✅ JSDoc comments
- ✅ Accessibility tests
- ✅ Responsive tests

---

**Document Status:** Ready for Implementation
**Next Step:** Begin with P0 components
