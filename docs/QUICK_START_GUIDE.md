# HypeAI Private Sale - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd src/frontend
npm install
```

The project already has `ethers@^6.9.0` installed, so you're ready to go!

### Step 2: Configure Environment

Create `.env.local` in your frontend directory:

```bash
cp .env.example .env.local
```

Update with your deployed contract addresses:

```env
NEXT_PUBLIC_PRESALE_CONTRACT=0xYourPresaleContract
NEXT_PUBLIC_HYPEAI_TOKEN=0xYourHypeAIToken
```

### Step 3: Import and Use Hooks

```typescript
import { useWallet, usePresale } from '@/hooks';

function MyComponent() {
  const wallet = useWallet();
  const presale = usePresale();

  return (
    <div>
      {!wallet.isConnected ? (
        <button onClick={wallet.connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {wallet.address}</p>
          <p>Sale Progress: {presale.saleStats?.progressPercentage}%</p>
        </div>
      )}
    </div>
  );
}
```

### Step 4: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📋 Common Use Cases

### Connect Wallet

```typescript
const { connectWallet, isConnected, address } = useWallet();

// Connect
await connectWallet();

// Check status
if (isConnected) {
  console.log('Connected to:', address);
}
```

### Switch to BSC

```typescript
const { isCorrectNetwork, switchToBSC } = useWallet();

if (!isCorrectNetwork) {
  await switchToBSC();
}
```

### Get Sale Stats

```typescript
const { saleStats, getSaleStats } = usePresale();

// Auto-loads on mount, or refresh manually:
await getSaleStats();

console.log('Raised:', saleStats.totalUSDRaised);
console.log('Progress:', saleStats.progressPercentage);
```

### Check User Eligibility

```typescript
const { userEligibility, checkEligibility } = usePresale();

// Auto-loads when wallet connects, or check manually:
await checkEligibility(address);

if (userEligibility.eligible) {
  console.log('Remaining allocation:', userEligibility.remainingAllocation);
} else {
  console.log('Not eligible');
}
```

### Purchase with BNB

```typescript
const { purchaseWithBNB, transactionState } = usePresale();

try {
  const result = await purchaseWithBNB(100); // $100 USD
  console.log('Success! TX:', result.hash);
} catch (error) {
  console.error('Purchase failed:', error.message);
}

// Monitor transaction status
if (transactionState.status === 'pending') {
  console.log('Transaction pending:', transactionState.hash);
}
```

### Purchase with USDT

```typescript
const { purchaseWithUSDT, transactionState } = usePresale();

try {
  // Automatically handles approval if needed
  const result = await purchaseWithUSDT(100); // $100 USD
  console.log('Success! TX:', result.hash);
} catch (error) {
  console.error('Purchase failed:', error.message);
}
```

## 🎨 Pre-built Components

Use the complete example:

```typescript
import PresaleIntegrationExample from '@/examples/PresaleIntegrationExample';

export default function Page() {
  return <PresaleIntegrationExample />;
}
```

This includes:
- ✅ Wallet connection UI
- ✅ Network switching
- ✅ Sale statistics dashboard
- ✅ User eligibility display
- ✅ Purchase form with validation
- ✅ Transaction status tracking
- ✅ Balance display
- ✅ Error handling

## 📊 Real-time Updates

The hooks automatically listen for blockchain events:

```typescript
// These update automatically when events occur:
// - TokensPurchased → refreshes sale stats
// - WhitelistUpdated → refreshes eligibility
// - Account changed → updates wallet state
// - Chain changed → reloads page
```

## 🔧 Customization

### Custom Network Config

```typescript
import { BSC_CONFIG } from '@/lib/contracts';

// Use testnet for development
const config = process.env.NODE_ENV === 'development'
  ? BSC_TESTNET_CONFIG
  : BSC_CONFIG;
```

### Custom Error Handling

```typescript
import { ERROR_MESSAGES } from '@/lib/contracts';

try {
  await purchaseWithBNB(amount);
} catch (error) {
  if (error.message === ERROR_MESSAGES.NOT_WHITELISTED) {
    // Handle not whitelisted
  } else if (error.message === ERROR_MESSAGES.INSUFFICIENT_BALANCE) {
    // Handle insufficient balance
  }
}
```

### Custom Formatters

```typescript
import { formatters } from '@/lib/contracts';

// Format BNB amount
const bnb = formatters.formatToken(bigIntAmount);

// Format USD
const usd = formatters.formatUSD(123.45); // "$123.45"

// Format address
const short = formatters.formatAddress("0x123...789");
```

## 🐛 Debugging

### Enable Console Logs

The hooks include detailed console logs for debugging:

```typescript
// Check browser console for:
// - Connection events
// - Transaction details
// - Error messages
// - Event listeners
```

### Common Issues

**MetaMask not detected:**
```typescript
if (!wallet.isMetaMaskInstalled) {
  // Show install prompt
}
```

**Wrong network:**
```typescript
if (!wallet.isCorrectNetwork) {
  await wallet.switchToBSC();
}
```

**Transaction failed:**
```typescript
// Check presale.transactionState.error for details
console.log(presale.transactionState.error);
```

## 📱 Mobile Support

Works with MetaMask mobile browser:

1. Open MetaMask app
2. Navigate to your dApp
3. Hooks work the same as desktop!

## 🔐 Security

The hooks include:
- ✅ Contract address validation
- ✅ Network enforcement (BSC only)
- ✅ Balance validation
- ✅ Input sanitization
- ✅ Error boundaries
- ✅ Gas optimization

## 🚀 Production Checklist

Before going live:

- [ ] Update `.env.local` with mainnet contract addresses
- [ ] Test all purchase flows
- [ ] Test error scenarios
- [ ] Test on multiple browsers
- [ ] Test MetaMask mobile
- [ ] Monitor gas costs
- [ ] Set up error tracking (Sentry)
- [ ] Set up analytics

## 📚 Next Steps

- Read full documentation: `/docs/WEB3_HOOKS_DOCUMENTATION.md`
- Review contract integration: `/src/frontend/lib/contracts.ts`
- Check example component: `/src/frontend/examples/PresaleIntegrationExample.tsx`
- Deploy contracts: Follow deployment guide

## 💡 Tips

1. **Auto-connect**: Hooks auto-connect if user was previously connected
2. **Event listeners**: Automatically track blockchain events
3. **Error messages**: All user-friendly and descriptive
4. **Gas optimization**: Automatic estimation with 20% buffer
5. **TypeScript**: Full type safety included

## 🆘 Need Help?

Common solutions:
- Refresh page if wallet state seems stuck
- Check BSCScan for transaction details
- Ensure sufficient BNB for gas
- USDT requires approval before first purchase
- Minimum purchase is $40 USD

---

**You're ready to build! 🎉**

See the complete example in `/src/frontend/examples/PresaleIntegrationExample.tsx` for a production-ready implementation.
