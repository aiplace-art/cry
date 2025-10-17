# Private Sale Page - Setup & Deployment Guide

## Overview

Complete private sale implementation with wallet connection, payment processing, and token allocation.

## Features Implemented

### 1. Frontend Components

#### Page: `/private-sale`
- **Location:** `/Users/ai.place/Crypto/src/frontend/pages/private-sale.tsx`
- **Features:**
  - Animated hero section with live stats
  - Countdown timer to sale end
  - Progress bar (funds raised)
  - Live investor count
  - Bonus tier display
  - Referral system
  - Purchase history dashboard

#### Widget: `PrivateSaleWidget`
- **Location:** `/Users/ai.place/Crypto/src/frontend/components/PrivateSaleWidget.tsx`
- **Features:**
  - Multi-wallet support (MetaMask, WalletConnect, Phantom)
  - Payment method selection
  - USD amount input with validation
  - Real-time token calculation
  - Bonus display
  - Success modal with transaction details
  - Calendar reminder integration

#### Component: `PaymentMethods`
- **Location:** `/Users/ai.place/Crypto/src/frontend/components/PaymentMethods.tsx`
- **Supported Currencies:**
  - ETH (Ethereum)
  - USDT (Tether)
  - USDC (USD Coin)
  - BNB (Binance Coin)
  - SOL (Solana)

### 2. Hooks

#### `usePrivateSale`
- **Location:** `/Users/ai.place/Crypto/src/frontend/hooks/usePrivateSale.ts`
- **Functions:**
  - `calculateTokens()` - Calculate base + bonus tokens
  - `getTimeRemaining()` - Countdown logic
  - `getProgress()` - Progress percentage
  - `processPurchase()` - Handle payment
  - `getReferralLink()` - Generate referral URLs
  - `loadPurchases()` - Fetch user history

#### `useWallet`
- **Location:** `/Users/ai.place/Crypto/src/frontend/hooks/useWallet.ts`
- **Features:**
  - MetaMask connection
  - WalletConnect integration
  - Phantom (Solana) support
  - Auto-reconnect
  - Chain switching
  - Balance tracking

### 3. API Endpoints

#### POST `/api/private-sale/purchase`
- Process token purchases
- Integrate with payment gateway
- Allocate tokens
- Send confirmation email

#### GET `/api/private-sale/stats`
- Return current sale statistics
- Total raised
- Investor count
- Average purchase

#### GET `/api/private-sale/purchases`
- Fetch user purchase history
- Filter by wallet address

#### POST `/api/private-sale/email`
- Send confirmation emails
- Transaction details
- Vesting information

### 4. Configuration

#### Payment Configuration
- **Location:** `/Users/ai.place/Crypto/src/frontend/lib/payment-config.ts`
- **Settings:**
  - Token price: $0.05
  - Bonus tiers: 5% - 30%
  - Min purchase: $50
  - Max purchase: $100,000
  - Target: $5M
  - Sale period: Oct 1 - Dec 31, 2025

#### Payment Gateways
- **Location:** `/Users/ai.place/Crypto/src/frontend/lib/payment-gateway.ts`
- **Supported Gateways:**
  - Coinbase Commerce
  - NOWPayments
  - CoinGate

## Setup Instructions

### 1. Environment Variables

Create `.env.local` in your Next.js project root:

```bash
cp /Users/ai.place/Crypto/src/frontend/.env.example .env.local
```

Fill in the required values:

```env
# Payment Gateway Keys
NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY=your_key
NEXT_PUBLIC_NOWPAYMENTS_API_KEY=your_key
NEXT_PUBLIC_COINGATE_API_KEY=your_key

# Web3 Configuration
NEXT_PUBLIC_INFURA_ID=your_infura_id
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Smart Contracts
NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_SALE_CONTRACT_ADDRESS=0x...

# Email Service
SENDGRID_API_KEY=SG.your_key

# Database
DATABASE_URL=postgresql://...

# Blockchain
RPC_URL=https://bsc-dataseed1.binance.org/
PRIVATE_KEY=your_private_key
```

### 2. Install Dependencies

```bash
npm install ethers @walletconnect/web3-provider @sendgrid/mail
```

### 3. Payment Gateway Setup

#### Option A: Coinbase Commerce

1. Sign up at https://commerce.coinbase.com/
2. Get API key from Settings
3. Set webhook URL: `https://yourdomain.com/api/webhooks/coinbase`

#### Option B: NOWPayments

1. Sign up at https://nowpayments.io/
2. Get API key from dashboard
3. Configure IPN callback URL

#### Option C: CoinGate

1. Sign up at https://coingate.com/
2. Get API credentials
3. Use sandbox for testing

### 4. Smart Contract Deployment

Deploy the token sale contract:

```solidity
// PrivateSale.sol
contract PrivateSale {
    IERC20 public token;
    uint256 public tokenPrice = 0.05 * 10**18; // $0.05
    uint256 public totalRaised;

    mapping(address => uint256) public purchases;
    mapping(address => uint256) public vestingUnlock;

    function purchaseTokens(uint256 usdAmount) external payable {
        // Calculate tokens
        uint256 baseTokens = (usdAmount * 10**18) / tokenPrice;
        uint256 bonusTokens = calculateBonus(usdAmount, baseTokens);
        uint256 totalTokens = baseTokens + bonusTokens;

        // Store purchase
        purchases[msg.sender] += totalTokens;
        vestingUnlock[msg.sender] = block.timestamp + 90 days;
        totalRaised += usdAmount;

        // Emit event
        emit TokensPurchased(msg.sender, totalTokens, usdAmount);
    }

    function claimTokens() external {
        require(block.timestamp >= vestingUnlock[msg.sender], "Vesting period not over");
        uint256 amount = purchases[msg.sender];
        purchases[msg.sender] = 0;
        token.transfer(msg.sender, amount);
    }
}
```

### 5. Database Schema

```sql
CREATE TABLE purchases (
    id VARCHAR(255) PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    tokens_base DECIMAL(18, 8) NOT NULL,
    tokens_bonus DECIMAL(18, 8) NOT NULL,
    tokens_total DECIMAL(18, 8) NOT NULL,
    transaction_hash VARCHAR(66),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_wallet (wallet_address),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    referrer_address VARCHAR(42) NOT NULL,
    referee_address VARCHAR(42) NOT NULL,
    purchase_id VARCHAR(255) NOT NULL,
    reward_tokens DECIMAL(18, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (purchase_id) REFERENCES purchases(id),
    INDEX idx_referrer (referrer_address)
);
```

### 6. Email Templates

Configure SendGrid templates:

**Template ID:** `d-xxxxx` (Purchase Confirmation)

```html
<h1>Purchase Confirmed! 🎉</h1>
<p>Amount: ${{amount}}</p>
<p>Tokens: {{tokens}} HYPE</p>
<p>TX Hash: {{transactionHash}}</p>
<a href="{{dashboardUrl}}">View Dashboard</a>
```

## Integration Steps

### 1. Add to Next.js App

```typescript
// pages/private-sale.tsx or app/private-sale/page.tsx
import PrivateSalePage from '../frontend/pages/private-sale';

export default PrivateSalePage;
```

### 2. Add to Navigation

```typescript
<nav>
  <Link href="/private-sale">Private Sale 🔥</Link>
</nav>
```

### 3. Configure Payment Webhooks

```typescript
// pages/api/webhooks/payment.ts
export default async function handler(req, res) {
  const signature = req.headers['x-nowpayments-sig'];

  // Verify webhook signature
  const isValid = verifyWebhookSignature(req.body, signature);

  if (isValid) {
    const { payment_id, payment_status, order_id } = req.body;

    if (payment_status === 'finished') {
      // Update purchase status
      await updatePurchaseStatus(order_id, 'completed');

      // Allocate tokens
      await allocateTokens(order_id);

      // Send email
      await sendConfirmationEmail(order_id);
    }
  }

  res.status(200).json({ received: true });
}
```

## Testing

### 1. Local Testing

```bash
npm run dev
```

Visit: http://localhost:3000/private-sale

### 2. Test Wallets

Use MetaMask with testnet:
- BSC Testnet: https://testnet.bscscan.com/
- Get test BNB: https://testnet.binance.org/faucet-smart

### 3. Test Payment Gateway

Use sandbox mode:
- CoinGate: Sandbox enabled
- Coinbase Commerce: Test mode
- NOWPayments: Test API

## Deployment

### 1. Vercel Deployment

```bash
vercel --prod
```

### 2. Configure Environment Variables

In Vercel dashboard:
- Settings → Environment Variables
- Add all variables from `.env.example`

### 3. Set Up Domain

```bash
vercel domains add private-sale.yourdomain.com
```

### 4. Enable Analytics

```typescript
// next.config.js
module.exports = {
  analytics: {
    provider: 'vercel',
  },
};
```

## Monitoring

### 1. Track Conversions

```typescript
// Track purchase events
analytics.track('Purchase Completed', {
  amount: usdAmount,
  tokens: totalTokens,
  method: paymentMethod.symbol,
});
```

### 2. Error Tracking

```typescript
// Sentry integration
import * as Sentry from '@sentry/nextjs';

Sentry.captureException(error, {
  tags: { component: 'PrivateSale' },
});
```

### 3. Performance Monitoring

```typescript
// Web Vitals
export function reportWebVitals(metric) {
  console.log(metric);
  // Send to analytics
}
```

## Security Considerations

1. **Never expose private keys** in frontend code
2. **Validate all inputs** on backend
3. **Verify webhook signatures** from payment gateways
4. **Use HTTPS only** for production
5. **Rate limit API endpoints** to prevent abuse
6. **Sanitize user inputs** to prevent XSS
7. **Use prepared statements** for database queries

## Support & Maintenance

### Common Issues

1. **Wallet won't connect**
   - Check MetaMask is installed
   - Verify correct network
   - Clear browser cache

2. **Payment not processing**
   - Check payment gateway status
   - Verify API keys
   - Check webhook configuration

3. **Tokens not showing**
   - Check vesting period
   - Verify contract address
   - Check transaction status

### Logs

Monitor logs in:
- Vercel dashboard
- Payment gateway dashboard
- Blockchain explorer

## Files Created

1. `/Users/ai.place/Crypto/src/frontend/pages/private-sale.tsx`
2. `/Users/ai.place/Crypto/src/frontend/components/PrivateSaleWidget.tsx`
3. `/Users/ai.place/Crypto/src/frontend/components/PaymentMethods.tsx`
4. `/Users/ai.place/Crypto/src/frontend/hooks/usePrivateSale.ts`
5. `/Users/ai.place/Crypto/src/frontend/types/private-sale.ts`
6. `/Users/ai.place/Crypto/src/frontend/lib/payment-config.ts`
7. `/Users/ai.place/Crypto/src/frontend/lib/payment-gateway.ts`
8. `/Users/ai.place/Crypto/src/frontend/lib/env.d.ts`
9. `/Users/ai.place/Crypto/src/frontend/pages/api/private-sale/purchase.ts`
10. `/Users/ai.place/Crypto/src/frontend/pages/api/private-sale/stats.ts`
11. `/Users/ai.place/Crypto/src/frontend/pages/api/private-sale/purchases.ts`
12. `/Users/ai.place/Crypto/src/frontend/pages/api/private-sale/email.ts`
13. `/Users/ai.place/Crypto/src/frontend/.env.example`

## Next Steps

1. Configure payment gateway accounts
2. Deploy smart contracts
3. Set up database
4. Configure email service
5. Test on testnet
6. Deploy to production
7. Launch marketing campaign

---

**Ready for immediate deployment!** 🚀
