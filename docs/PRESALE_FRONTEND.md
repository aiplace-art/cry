# HYPE Token Presale Frontend Documentation

## 🎯 Overview

Professional presale landing page for HYPE Token with full Web3 integration, AI-powered features, and multi-chain support.

## 📁 File Structure

```
/Users/ai.place/Crypto/src/frontend/
├── pages/
│   └── presale.tsx                  # Main presale landing page
├── components/
│   ├── PresaleWidget.tsx           # Buy widget with wallet connection
│   ├── TokenCalculator.tsx         # ROI calculator
│   ├── PresaleProgress.tsx         # Progress tracking
│   ├── TransactionsFeed.tsx        # Live transactions
│   ├── VestingSchedule.tsx         # Token vesting UI
│   └── FAQ.tsx                     # FAQ section
├── hooks/
│   └── usePresale.ts               # Presale state management
├── utils/
│   └── presaleContract.ts          # Smart contract interaction
├── types/
│   └── presale.ts                  # TypeScript definitions
├── lib/
│   └── constants.ts                # Configuration constants
└── scripts/
    └── presale-coordination.sh     # Agent coordination
```

## 🚀 Features

### Core Functionality
- ✅ **Wallet Connection**: MetaMask, WalletConnect, Phantom
- ✅ **Multi-Chain Support**: ETH, BSC, Solana
- ✅ **Payment Methods**: ETH, USDT, USDC, BNB, SOL
- ✅ **Real-time Updates**: Live price, gas, transactions
- ✅ **Vesting Schedule**: 6-month token unlock
- ✅ **Referral System**: 5% bonus for referrers

### Security Features
- ✅ **Rate Limiting**: Max 5 transactions/minute
- ✅ **Input Validation**: Min/max purchase limits
- ✅ **Anti-Bot Protection**: Transaction monitoring
- ✅ **Error Handling**: Comprehensive error messages
- ✅ **Gas Estimation**: Real-time gas price display

### User Experience
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Dark Theme**: Crypto-style glassmorphism
- ✅ **Loading States**: Smooth animations
- ✅ **Success/Error Feedback**: Clear notifications
- ✅ **Progress Tracking**: Visual presale progress

## 🎨 Component Details

### 1. PresaleWidget
**Location**: `/components/PresaleWidget.tsx`

**Features**:
- Wallet connection flow
- Payment method selection
- Amount input with validation
- Token calculation with bonuses
- Gas price estimation
- Transaction execution
- Referral code generation

**Usage**:
```tsx
import { PresaleWidget } from '../components/PresaleWidget';

<PresaleWidget />
```

### 2. TokenCalculator
**Location**: `/components/TokenCalculator.tsx`

**Features**:
- Investment amount input
- ROI calculation
- Bonus token display
- Value at listing projection
- Quick amount buttons

**Props**:
```tsx
interface TokenCalculatorProps {
  currentPrice: number;
  bonus: number;
  listingPrice?: number;
}
```

### 3. PresaleProgress
**Location**: `/components/PresaleProgress.tsx`

**Features**:
- Current round progress
- Total presale progress
- Animated progress bars
- Raised/goal display

**Props**:
```tsx
interface PresaleProgressProps {
  currentRound: PresaleRound;
  totalRaised: number;
  hardCap: number;
}
```

### 4. TransactionsFeed
**Location**: `/components/TransactionsFeed.tsx`

**Features**:
- Live transaction updates
- Status indicators (pending/confirmed/failed)
- Transaction details
- Etherscan links
- Auto-scroll for new transactions

**Props**:
```tsx
interface TransactionsFeedProps {
  transactions: TokenPurchase[];
}
```

### 5. VestingSchedule
**Location**: `/components/VestingSchedule.tsx`

**Features**:
- Vesting timeline visualization
- Claimable token highlighting
- One-click claim functionality
- Progress tracking for locked tokens

**Props**:
```tsx
interface VestingScheduleProps {
  schedule: VestingSchedule[];
  onClaim?: (vestingId: string) => Promise<void>;
}
```

### 6. FAQ
**Location**: `/components/FAQ.tsx`

**Features**:
- Expandable Q&A sections
- Contact support links
- Telegram/Email integration

## 🔧 Configuration

### Environment Variables
Create `.env.local` file:

```env
# Contract Addresses
NEXT_PUBLIC_PRESALE_CONTRACT=0x...
NEXT_PUBLIC_ETH_RPC_URL=https://eth.llamarpc.com
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org

# Token Addresses
NEXT_PUBLIC_USDT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7
NEXT_PUBLIC_USDC_ADDRESS=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Presale Configuration
Edit `/lib/constants.ts`:

```typescript
export const PRESALE_CONFIG: PresaleConfig = {
  contractAddress: process.env.NEXT_PUBLIC_PRESALE_CONTRACT,
  rounds: [
    {
      id: 1,
      name: 'Round 1',
      price: 0.05,
      hardCap: 400000,
      bonus: 25,
      // ...
    },
    // Add more rounds
  ],
  minPurchase: 0.01,
  maxPurchase: 100,
  vestingPeriod: 6,
  referralBonus: 5,
};
```

## 🛠️ Smart Contract Integration

### Contract Methods

The `presaleContract.ts` utility provides:

```typescript
// Initialize contract
await presaleContract.initialize(provider);

// Validate input
const validation = presaleContract.validateAmount(amount);

// Calculate tokens with bonus
const tokens = presaleContract.calculateTokens(amount, price, bonus);

// Estimate gas
const gasEstimate = await presaleContract.estimateGas(paymentMethod, amount);

// Buy tokens
const txHash = await presaleContract.buyTokens(paymentMethod, amount);

// Claim vested tokens
const txHash = await presaleContract.claimTokens();

// Get round info
const roundInfo = await presaleContract.getRoundInfo();

// Get user info
const userInfo = await presaleContract.getUserInfo(address);

// Get vesting schedule
const schedule = await presaleContract.getVestingSchedule(address);
```

### Error Handling

The contract utility parses common errors:

- `INSUFFICIENT_FUNDS`: Not enough balance
- `USER_REJECTED`: Transaction cancelled
- `NETWORK_ERROR`: RPC connection issue
- `CONTRACT_REVERT`: Smart contract rejection

## 🔄 State Management

### usePresale Hook

**Location**: `/hooks/usePresale.ts`

**Provides**:
```typescript
const {
  walletState,           // Wallet connection status
  presaleState,          // Presale data
  isLoading,             // Loading state
  error,                 // Error messages
  connectWallet,         // Connect wallet function
  disconnectWallet,      // Disconnect wallet function
  buyTokens,             // Purchase tokens function
  claimTokens,           // Claim vested tokens function
  generateReferralCode,  // Generate referral link
  refreshData,           // Refresh all data
} = usePresale();
```

## 🎨 Styling

### Tailwind CSS Classes

The components use a consistent design system:

- **Glassmorphism**: `backdrop-blur-xl bg-gray-900/90`
- **Gradients**: `bg-gradient-to-r from-purple-600 to-pink-600`
- **Borders**: `border border-gray-700/50`
- **Shadows**: `shadow-2xl shadow-purple-500/50`
- **Animations**: Custom CSS keyframes

### Custom Animations

```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}
```

## 🧪 Testing

### Manual Testing Checklist

**Wallet Connection**:
- [ ] MetaMask connects successfully
- [ ] Network switching works (ETH/BSC)
- [ ] Balance displays correctly
- [ ] Disconnect works properly

**Purchase Flow**:
- [ ] Amount validation works
- [ ] Gas estimation displays
- [ ] Transaction submits
- [ ] Confirmation shows
- [ ] Balance updates

**Vesting**:
- [ ] Schedule displays correctly
- [ ] Claim button enables when ready
- [ ] Claim transaction works
- [ ] Balance updates after claim

**Edge Cases**:
- [ ] Insufficient balance handled
- [ ] Network errors handled
- [ ] Rate limiting works
- [ ] Invalid input rejected

### Integration Testing

Run coordination script:
```bash
./scripts/presale-coordination.sh
```

This will:
1. Register development session
2. Track component files
3. Notify coordinated agents
4. Export metrics

## 🚀 Deployment

### Build for Production

```bash
# Install dependencies
npm install

# Build project
npm run build

# Test production build
npm run start
```

### Vercel Deployment

```bash
# Deploy to Vercel
vercel deploy --prod

# Set environment variables
vercel env add NEXT_PUBLIC_PRESALE_CONTRACT
vercel env add NEXT_PUBLIC_ETH_RPC_URL
# ... add all env vars
```

### Environment-Specific Config

**Development**:
- Use testnet contracts
- Enable debug logging
- Show detailed errors

**Production**:
- Use mainnet contracts
- Minimize logging
- User-friendly errors

## 🔐 Security Considerations

### Input Validation
- Minimum purchase: $0.50
- Maximum purchase: Configurable per round
- Balance checking before transaction
- Sanitize all user inputs

### Rate Limiting
- Max 5 transactions per minute per address
- Tracked client-side and server-side
- Prevents spam and bot attacks

### Smart Contract Security
- Audited contracts only
- Verified on Etherscan
- Emergency pause functionality
- Multi-sig admin controls

## 📊 Analytics Integration

Track key metrics:
- Wallet connections
- Purchase attempts/success/failures
- Average investment amount
- Referral conversions
- User journey through presale

## 🤝 Agent Coordination

### Claude-Flow Integration

The presale frontend coordinates with other agents via hooks:

**Pre-Task Hook**:
```bash
npx claude-flow@alpha hooks pre-task \
  --description "Presale frontend development"
```

**Post-Edit Hook**:
```bash
npx claude-flow@alpha hooks post-edit \
  --file "components/PresaleWidget.tsx" \
  --memory-key "presale/frontend/widget"
```

**Notification Hook**:
```bash
npx claude-flow@alpha hooks notify \
  --message "Frontend components completed"
```

**Session Management**:
```bash
npx claude-flow@alpha hooks session-end \
  --export-metrics true \
  --session-id "presale-frontend-dev"
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Ethers.js Guide](https://docs.ethers.io/v5/)
- [Web3Modal Docs](https://docs.walletconnect.com/2.0/web3modal/about)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🐛 Troubleshooting

### Common Issues

**Wallet Won't Connect**:
- Check MetaMask is installed
- Verify correct network selected
- Clear browser cache

**Transaction Fails**:
- Check gas price/limit
- Verify sufficient balance
- Check contract is not paused

**UI Not Updating**:
- Check RPC endpoint
- Verify WebSocket connection
- Refresh page data

## 📝 License

MIT License - See LICENSE file for details

---

**Built with ❤️ by the HYPE Token team**
