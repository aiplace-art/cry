# Frontend dApp - Complete Setup & Architecture Guide

## Overview

This is a modern, production-ready Web3 dApp frontend built with Next.js, React, TypeScript, and Tailwind CSS. It features wallet connection, token dashboard, staking interface, trading charts, AI insights, and governance voting.

## Technology Stack

### Core Framework
- **Next.js 14** - React framework with SSR and routing
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling

### Web3 Libraries
- **ethers.js v6** - Ethereum interaction library
- **wagmi** - React hooks for Ethereum
- **viem** - TypeScript utilities for Ethereum

### UI/UX Libraries
- **Recharts** - Data visualization and charts
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Zustand** - State management (optional)

## Project Structure

```
src/frontend/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   └── Loading.tsx
│   ├── WalletConnect.tsx
│   ├── TokenDashboard.tsx
│   ├── StakingInterface.tsx
│   ├── TradingChart.tsx
│   ├── AIInsights.tsx
│   └── GovernanceVoting.tsx
├── contexts/           # React contexts
│   └── Web3Context.tsx
├── hooks/             # Custom React hooks
│   ├── useContract.ts
│   ├── useTokenData.ts
│   └── useStakingData.ts
├── lib/               # Utilities and helpers
│   ├── utils.ts
│   └── constants.ts
├── pages/             # Next.js pages
│   ├── _app.tsx
│   ├── _document.tsx
│   └── index.tsx
├── styles/            # Global styles
│   └── globals.css
├── types/             # TypeScript types
│   └── index.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Installation & Setup

### 1. Install Dependencies

```bash
cd src/frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your contract addresses:

```env
NEXT_PUBLIC_TOKEN_ADDRESS=0xYourTokenAddress
NEXT_PUBLIC_STAKING_ADDRESS=0xYourStakingAddress
NEXT_PUBLIC_GOVERNANCE_ADDRESS=0xYourGovernanceAddress
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm start
```

## Features

### 1. Wallet Connection
- **MetaMask Integration** - Connect with MetaMask wallet
- **Multi-chain Support** - Ethereum, Polygon, BSC
- **Auto-reconnect** - Maintains session across refreshes
- **Network Switching** - Easy chain switching

**Implementation:**
```typescript
import { useWeb3 } from '@/contexts/Web3Context';

const { address, isConnected, connect, disconnect } = useWeb3();
```

### 2. Token Dashboard
- **Real-time Price** - Live token price updates
- **Market Stats** - Market cap, volume, holders
- **Price Charts** - Historical price data
- **24h Change** - Price change indicators

**Usage:**
```typescript
<TokenDashboard tokenAddress="0x..." />
```

### 3. Staking Interface
- **Stake Tokens** - Lock tokens for rewards
- **APY Calculator** - Calculate returns based on lock period
- **Rewards Tracking** - View pending rewards
- **Unstake** - Withdraw staked tokens
- **Lock Periods** - 30, 90, 180, 365 days with multipliers

**Features:**
- Flexible lock periods (30/90/180/365 days)
- Reward multipliers (1x to 3x)
- Real-time APY calculation
- Unlock countdown timer

### 4. Trading Interface
- **Live Charts** - Real-time price charts using Recharts
- **Multiple Timeframes** - 1H, 24H, 7D, 30D views
- **Volume Data** - Trading volume visualization
- **Technical Indicators** - Price trends and signals

### 5. AI Insights Panel
- **Market Analysis** - AI-powered market predictions
- **Sentiment Analysis** - Bullish/bearish/neutral signals
- **Confidence Scores** - Prediction confidence levels
- **Whale Activity** - Large wallet movement tracking
- **Technical Signals** - RSI, MACD indicators

### 6. Governance Voting
- **Proposal Viewing** - Active and historical proposals
- **Vote Casting** - Vote for/against proposals
- **Voting Power** - Track your voting influence
- **Results Tracking** - Real-time vote counts
- **Status Badges** - Active/Passed/Rejected indicators

## Design System

### Color Palette

```javascript
// Primary - Blue
primary: {
  500: '#0ea5e9',
  600: '#0284c7',
}

// Secondary - Purple
secondary: {
  500: '#a855f7',
  600: '#9333ea',
}

// Accent - Orange
accent: {
  500: '#f97316',
  600: '#ea580c',
}
```

### Gradients

```css
.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bg-gradient-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.bg-gradient-accent {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
```

### Components

#### Button Variants
- `primary` - Gradient primary color
- `secondary` - Gradient secondary color
- `outline` - Bordered style
- `ghost` - Transparent background
- `danger` - Red for destructive actions

#### Card Types
- **Standard Card** - Basic container
- **Gradient Card** - With gradient background
- **Hover Card** - Interactive hover effects

### Animations

- **Pulse** - Slow pulsing effect (3s)
- **Shimmer** - Loading shimmer effect
- **Glow** - Glowing border animation
- **Bounce** - Slow bounce (2s)

## Smart Contract Integration

### Contract ABIs

All contract ABIs are defined in `hooks/useContract.ts`:

- **ERC20_ABI** - Token contract
- **STAKING_ABI** - Staking contract
- **GOVERNANCE_ABI** - Governance contract

### Custom Hooks

#### useContract
```typescript
const contract = useContract(address, abi);
```

#### useTokenData
```typescript
const { tokenData, loading, error } = useTokenData(tokenAddress);
```

#### useStakingData
```typescript
const {
  stakingData,
  loading,
  error,
  stake,
  unstake,
  claimRewards
} = useStakingData(stakingAddress);
```

## Utility Functions

### Address Formatting
```typescript
formatAddress("0x1234...5678") // "0x1234...5678"
```

### Number Formatting
```typescript
formatNumber(1234567) // "1.23M"
formatCurrency(123.45) // "$123.45"
```

### Token Amounts
```typescript
formatTokenAmount("1000000000000000000", 18) // "1.0"
parseTokenAmount("1.5", 18) // 1500000000000000000n
```

### APY Calculation
```typescript
calculateAPY(stakingAmount, rewardRate, duration)
```

## Responsive Design

The dApp is fully responsive:

- **Mobile** - Optimized for mobile devices
- **Tablet** - Adapted layout for tablets
- **Desktop** - Full-featured desktop experience

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## Dark Mode

Dark mode is built-in with Tailwind's `dark:` prefix:

```typescript
const [darkMode, setDarkMode] = useState(true);

// Toggle
<button onClick={() => setDarkMode(!darkMode)}>
  {darkMode ? <Sun /> : <Moon />}
</button>
```

## Performance Optimization

### Best Practices
1. **Code Splitting** - Automatic with Next.js
2. **Image Optimization** - Use Next.js Image component
3. **Lazy Loading** - Dynamic imports for heavy components
4. **Memoization** - useMemo and useCallback hooks
5. **Debouncing** - For search and input handlers

### Data Fetching
- **Auto-refresh** - 10-second intervals (configurable)
- **Error Handling** - Graceful error states
- **Loading States** - Skeleton loaders

## Security Considerations

### Web3 Security
1. **Input Validation** - Validate all user inputs
2. **Amount Limits** - Check min/max amounts
3. **Transaction Confirmation** - Show confirmation modals
4. **Error Handling** - Catch and display errors

### Environment Variables
- **Never commit** `.env.local` to version control
- **Use** `NEXT_PUBLIC_` prefix for client-side variables
- **Validate** contract addresses before use

## Testing

### Unit Tests
```bash
npm run test
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Build
```bash
npm run build
npm start
```

### Environment Variables
Set environment variables in your hosting platform:
- `NEXT_PUBLIC_TOKEN_ADDRESS`
- `NEXT_PUBLIC_STAKING_ADDRESS`
- `NEXT_PUBLIC_GOVERNANCE_ADDRESS`

## Customization Guide

### Adding New Features

1. **Create Component** in `components/`
2. **Add Types** in `types/index.ts`
3. **Create Hook** if needed in `hooks/`
4. **Import** in main page

### Modifying Styles

1. **Update** `tailwind.config.js` for theme
2. **Add** utility classes in `globals.css`
3. **Use** Tailwind classes in components

### Adding Contract Functions

1. **Add ABI** to `hooks/useContract.ts`
2. **Create Hook** for contract interaction
3. **Use Hook** in component

## Troubleshooting

### Common Issues

**Wallet Not Connecting:**
- Check MetaMask is installed
- Verify network is supported
- Clear browser cache

**Contract Errors:**
- Verify contract addresses in `.env.local`
- Check network matches contract deployment
- Ensure wallet has sufficient balance

**Build Errors:**
- Delete `.next` folder
- Clear `node_modules` and reinstall
- Check TypeScript errors

## Browser Support

- Chrome (recommended)
- Firefox
- Brave
- Edge
- Safari (limited Web3 support)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [ethers.js Documentation](https://docs.ethers.org/v6/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/)

## Support & Contributing

For issues or questions:
1. Check documentation
2. Review common issues
3. Open GitHub issue
4. Join Discord community

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ for the Web3 community**
