# HypeAI Dashboard - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Start Development Server
```bash
cd /Users/ai.place/Crypto/src/frontend
npm run dev
```

### 2. Open Dashboard
Visit: http://localhost:3000/dashboard

### 3. Connect Wallet
- Click "Connect Wallet" button in header
- Approve MetaMask connection
- Auto-switch to BSC Testnet (Chain ID: 97)

## 📁 Key Files

### Components
```
components/ui/bnb/           # Reusable BNB-styled components
components/dashboard/        # Dashboard-specific components
```

### Pages
```
pages/dashboard.tsx          # Main entry point
```

### Hooks
```
hooks/web3/usePrivateSale.ts # Web3 integration
```

## 🎨 Using BNB Components

### Button Example
```tsx
import { BNBButton } from '@/components/ui/bnb';

<BNBButton
  variant="primary"
  onClick={handleClick}
>
  Buy Tokens
</BNBButton>
```

### Card Example
```tsx
import { BNBCard } from '@/components/ui/bnb';

<BNBCard
  title="My Card"
  variant="gradient"
  padding="lg"
>
  Card content here
</BNBCard>
```

### Input Example
```tsx
import { BNBInput } from '@/components/ui/bnb';

<BNBInput
  label="Amount"
  value={amount}
  onChange={setAmount}
  suffix="USDT"
/>
```

## 🔗 Web3 Integration

```tsx
import { usePrivateSale } from '@/hooks/web3';

function MyComponent() {
  const {
    account,
    isConnected,
    connectWallet,
    buyWithBNB,
    claimTokens,
  } = usePrivateSale();

  const handleBuy = async () => {
    await buyWithBNB('1.0'); // 1 BNB
  };

  return (
    <div>
      {isConnected ? (
        <BNBButton onClick={handleBuy}>
          Buy Tokens
        </BNBButton>
      ) : (
        <BNBButton onClick={connectWallet}>
          Connect Wallet
        </BNBButton>
      )}
    </div>
  );
}
```

## 📊 Dashboard Features

### Navigation Tabs
- **Overview** - Stats, charts, quick actions
- **Buy** - Token purchase with calculator
- **Purchases** - History and vesting schedule
- **Wallet** - Portfolio management
- **Referral** - Referral program

### Stats Displayed
- Total Invested (USD)
- Tokens Owned (HYPE)
- Vesting Progress (%)
- Referral Earnings (USD)

### Token Purchase
1. Select payment method (BNB/USDT)
2. Enter amount
3. See bonus tier (20-30%)
4. Click "Purchase Tokens"
5. Confirm in MetaMask

### Vesting Schedule
- 6-month linear vesting
- Claim unlocked tokens anytime
- Visual timeline display
- Real-time progress tracking

## 🎨 Color Palette

```tsx
// Use these colors in your components
const colors = {
  gold: '#F3BA2F',
  lightGold: '#FCD535',
  dark: '#1E2026',
  darker: '#14151A',
  text: '#EAECEF',
  textSecondary: '#848E9C',
  success: '#0ECB81',
  danger: '#F6465D',
  warning: '#F0B90B',
};
```

## 📱 Responsive Breakpoints

```tsx
// Tailwind breakpoints used
sm: '640px'   // Small tablets
md: '768px'   // Tablets
lg: '1024px'  // Desktops
xl: '1280px'  // Large desktops
```

## 🔧 Common Tasks

### Add New Dashboard Tab
1. Add to `navItems` in `DashboardLayout.tsx`
2. Create component in `components/dashboard/`
3. Add case in `renderContent()` in `pages/dashboard.tsx`

### Customize Colors
Edit Tailwind config or use inline styles with BNB colors

### Add Animation
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

## 🐛 Troubleshooting

### Wallet Won't Connect
- Install MetaMask browser extension
- Check browser console for errors
- Try refreshing page

### Wrong Network
- Dashboard auto-switches to BSC Testnet
- Manually add BSC Testnet in MetaMask if needed

### Styles Not Applied
- Restart dev server
- Clear browser cache
- Check Tailwind config

## 📚 Learn More

- [Full Documentation](./DASHBOARD_IMPLEMENTATION.md)
- [BNB Chain Docs](https://docs.bnbchain.org/)
- [Ethers.js Docs](https://docs.ethers.org/)
- [Recharts Docs](https://recharts.org/)

## ✅ Checklist

- [ ] Dev server running
- [ ] MetaMask installed
- [ ] Wallet connected
- [ ] BSC Testnet selected
- [ ] Dashboard accessible
- [ ] All tabs working

---

**Ready to build! 🚀**
