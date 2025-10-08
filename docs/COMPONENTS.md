# Component Library Reference

Complete reference for all UI components in the dApp.

## UI Components

### Button

Versatile button component with multiple variants and sizes.

**Props:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}
```

**Usage:**
```tsx
import { Button } from '@/components/ui/Button';

// Primary button
<Button variant="primary">Connect Wallet</Button>

// Loading state
<Button variant="primary" loading={true}>Processing...</Button>

// Outline variant
<Button variant="outline" size="sm">Cancel</Button>

// Danger variant
<Button variant="danger">Delete</Button>
```

**Variants:**
- `primary` - Gradient blue/purple background
- `secondary` - Gradient pink/orange background
- `outline` - Transparent with border
- `ghost` - Transparent, minimal styling
- `danger` - Red for destructive actions

**Sizes:**
- `sm` - Small (px-3 py-1.5)
- `md` - Medium (px-4 py-2) - Default
- `lg` - Large (px-6 py-3)

---

### Card

Container component for grouping related content.

**Components:**
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardContent` - Content area

**Props:**
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;  // Add gradient background
  hover?: boolean;     // Enable hover effects
}
```

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card gradient hover>
  <CardHeader>
    <CardTitle>Token Dashboard</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Your content here</p>
  </CardContent>
</Card>
```

**Features:**
- Responsive design
- Dark mode support
- Optional gradient background
- Hover animations
- Glassmorphism effects

---

### Input

Styled input field with label and error handling.

**Props:**
```typescript
interface InputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
```

**Usage:**
```tsx
import { Input } from '@/components/ui/Input';
import { DollarSign } from 'lucide-react';

<Input
  label="Amount"
  type="number"
  placeholder="0.00"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  icon={<DollarSign className="h-5 w-5 text-gray-400" />}
  error={error}
/>
```

**Features:**
- Label support
- Error messaging
- Icon support
- Dark mode styling
- Focus states
- Validation styling

---

### Badge

Small status indicator component.

**Props:**
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  className?: string;
}
```

**Usage:**
```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="success">Active</Badge>
<Badge variant="danger">Failed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info">Processing</Badge>
<Badge variant="neutral">Draft</Badge>
```

**Variants:**
- `success` - Green (positive states)
- `danger` - Red (errors, failures)
- `warning` - Yellow (warnings, alerts)
- `info` - Blue (information)
- `neutral` - Gray (default state)

---

### Loading

Loading spinner and skeleton components.

**Components:**
```tsx
import { Loading, Skeleton } from '@/components/ui/Loading';

// Spinner with text
<Loading text="Loading data..." />

// Skeleton placeholder
<Skeleton className="w-full h-20" />
```

**Usage:**
```tsx
{loading ? (
  <Loading text="Fetching token data..." />
) : (
  <TokenData data={tokenData} />
)}
```

---

## Feature Components

### WalletConnect

Wallet connection button with dropdown menu.

**Features:**
- Connect/disconnect wallet
- Display address and balance
- Network information
- Connected status indicator

**Usage:**
```tsx
import { WalletConnect } from '@/components/WalletConnect';

<WalletConnect />
```

**States:**
- Disconnected: Shows "Connect Wallet" button
- Connected: Shows address, balance, and dropdown
- Dropdown: Network info, full address, balance, disconnect

---

### TokenDashboard

Complete token information dashboard.

**Props:**
```typescript
interface TokenDashboardProps {
  tokenAddress: string;
}
```

**Features:**
- Real-time price updates
- Market statistics
- 24h price change
- Holder count
- Trading volume
- Contract information

**Usage:**
```tsx
import { TokenDashboard } from '@/components/TokenDashboard';

<TokenDashboard tokenAddress="0x..." />
```

**Displays:**
- Token name and symbol
- Current price
- Market cap
- 24h volume
- Total holders
- Price change percentage
- Total supply
- Contract address

---

### StakingInterface

Complete staking functionality interface.

**Props:**
```typescript
interface StakingInterfaceProps {
  stakingAddress: string;
  tokenSymbol: string;
}
```

**Features:**
- Stake tokens
- Unstake tokens
- Claim rewards
- APY calculator
- Lock period selection
- Reward multipliers

**Usage:**
```tsx
import { StakingInterface } from '@/components/StakingInterface';

<StakingInterface
  stakingAddress="0x..."
  tokenSymbol="TOKEN"
/>
```

**Lock Periods:**
- 30 days (1x rewards)
- 90 days (1.5x rewards)
- 180 days (2x rewards)
- 365 days (3x rewards)

---

### TradingChart

Interactive price and volume charts.

**Props:**
```typescript
interface TradingChartProps {
  tokenSymbol: string;
}
```

**Features:**
- Price chart (Area chart)
- Volume chart
- Multiple timeframes (1H, 24H, 7D, 30D)
- Interactive tooltips
- Responsive design

**Usage:**
```tsx
import { TradingChart } from '@/components/TradingChart';

<TradingChart tokenSymbol="TOKEN" />
```

**Timeframes:**
- 1H - Hourly price updates
- 24H - Daily view
- 7D - Weekly trends
- 30D - Monthly overview

---

### AIInsights

AI-powered market insights panel.

**Features:**
- Market analysis
- Sentiment indicators
- Confidence scores
- Signal types (bullish/bearish/neutral)
- Time stamps

**Usage:**
```tsx
import { AIInsights } from '@/components/AIInsights';

<AIInsights />
```

**Insight Types:**
- Bullish signals (green)
- Bearish signals (red)
- Neutral analysis (gray)
- Confidence percentage
- Detailed descriptions

---

### GovernanceVoting

Decentralized governance voting interface.

**Features:**
- View proposals
- Cast votes
- Track results
- Vote percentages
- Proposal status
- Voting power display

**Usage:**
```tsx
import { GovernanceVoting } from '@/components/GovernanceVoting';

<GovernanceVoting />
```

**Proposal States:**
- Active - Currently accepting votes
- Passed - Approved and executed
- Rejected - Did not pass
- Pending - Not yet active

---

## Custom Hooks

### useWeb3

Web3 connection and wallet management.

```typescript
const {
  address,           // Connected wallet address
  balance,          // ETH balance
  chainId,          // Current chain ID
  isConnected,      // Connection status
  provider,         // ethers provider
  signer,           // ethers signer
  connect,          // Connect wallet function
  disconnect,       // Disconnect function
  switchChain       // Switch network function
} = useWeb3();
```

---

### useContract

Generic contract interaction hook.

```typescript
const contract = useContract(address, abi);

// Use contract methods
const result = await contract.functionName(params);
```

---

### useTokenData

Fetch token information.

```typescript
const {
  tokenData,    // Token information object
  loading,      // Loading state
  error        // Error message
} = useTokenData(tokenAddress);
```

**Returns:**
```typescript
interface TokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  price: number;
  marketCap: number;
  holders: number;
  priceChange24h: number;
  volume24h: number;
}
```

---

### useStakingData

Staking contract interaction.

```typescript
const {
  stakingData,    // Staking information
  loading,        // Loading state
  error,          // Error message
  stake,          // Stake function
  unstake,        // Unstake function
  claimRewards    // Claim rewards function
} = useStakingData(stakingAddress);
```

**Methods:**
```typescript
// Stake tokens
await stake(amount, lockPeriod);

// Unstake tokens
await unstake(amount);

// Claim rewards
await claimRewards();
```

---

## Utility Functions

### formatAddress

Shorten Ethereum addresses.

```typescript
formatAddress("0x1234567890123456789012345678901234567890")
// Returns: "0x1234...7890"
```

---

### formatNumber

Format large numbers with K/M/B suffixes.

```typescript
formatNumber(1234567, 2)     // "1.23M"
formatNumber(1234, 0)        // "1K"
formatNumber(1234567890, 1)  // "1.2B"
```

---

### formatCurrency

Format as USD currency.

```typescript
formatCurrency(123.45)  // "$123.45"
formatCurrency(1234.5)  // "$1,234.50"
```

---

### calculateAPY

Calculate APY based on staking parameters.

```typescript
calculateAPY(stakingAmount, rewardRate, duration)
// Returns: APY percentage
```

---

### formatTimeRemaining

Format remaining time for proposals/locks.

```typescript
formatTimeRemaining(endTimestamp)
// Returns: "5d 12h" or "3h 45m" or "Ended"
```

---

## Icons (Lucide React)

Common icons used throughout:

```tsx
import {
  Wallet,         // Wallet connection
  TrendingUp,     // Positive trends
  TrendingDown,   // Negative trends
  Lock,           // Staking, locked
  Unlock,         // Unstaking
  BarChart3,      // Trading, charts
  Brain,          // AI features
  Vote,           // Governance
  Sun,            // Light mode
  Moon,           // Dark mode
  Menu,           // Mobile menu
  X,              // Close
  DollarSign,     // Currency
  Users,          // Community
  Clock,          // Time
  CheckCircle,    // Success
  XCircle,        // Error
  Sparkles        // Special features
} from 'lucide-react';
```

---

## Styling Guidelines

### Tailwind Classes

**Colors:**
```css
text-primary-600    /* Primary color text */
bg-primary-500      /* Primary background */
border-primary-300  /* Primary border */
```

**Gradients:**
```css
bg-gradient-primary    /* Blue-purple gradient */
bg-gradient-secondary  /* Pink-red gradient */
bg-gradient-accent     /* Blue-cyan gradient */
```

**Dark Mode:**
```css
dark:bg-gray-800      /* Dark background */
dark:text-white       /* Dark mode text */
dark:border-gray-700  /* Dark border */
```

**Animations:**
```css
animate-pulse        /* Pulsing effect */
animate-spin         /* Spinning loader */
animate-shimmer      /* Shimmer effect */
animate-glow         /* Glowing effect */
```

---

## Best Practices

1. **Always use TypeScript types** for props
2. **Import from @/ aliases** for cleaner imports
3. **Use dark mode classes** for all components
4. **Add loading states** for async operations
5. **Handle errors gracefully** with error messages
6. **Make components responsive** with Tailwind breakpoints
7. **Use semantic HTML** for accessibility
8. **Add ARIA labels** where needed
9. **Optimize images** with Next.js Image
10. **Keep components small** and focused

---

## Component Checklist

When creating new components:

- [ ] Define TypeScript interfaces
- [ ] Add dark mode support
- [ ] Make responsive (mobile/tablet/desktop)
- [ ] Add loading states
- [ ] Handle errors
- [ ] Use consistent styling
- [ ] Add accessibility features
- [ ] Document props and usage
- [ ] Export from index file
- [ ] Add to this documentation

---

**For more information, see the full documentation at `/docs/frontend-guide.md`**
