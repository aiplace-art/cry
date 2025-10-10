# Presale Page Development Guide

## Overview

This guide covers the setup, development, and deployment of the ElonBTC presale page built with Next.js 14, TypeScript, and Web3 integration.

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- MetaMask wallet extension
- BSC testnet BNB for testing

## Installation

### 1. Clone and Install Dependencies

```bash
cd /Users/ai.place/Crypto/src/frontend
npm install
```

### 2. Install Required Dependencies

```bash
# Core dependencies
npm install next@14 react@18 react-dom@18 typescript
npm install @types/node @types/react @types/react-dom

# Web3 dependencies
npm install wagmi@2 viem@2 @tanstack/react-query
npm install @rainbow-me/rainbowkit

# UI dependencies
npm install tailwindcss postcss autoprefixer
npm install lucide-react framer-motion

# Utility dependencies
npm install clsx tailwind-merge
```

### 3. Environment Configuration

Create `.env.local` file in the frontend directory:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Contract Addresses
NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955

# RPC Configuration
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed1.binance.org
NEXT_PUBLIC_BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545

# API Keys (Optional)
NEXT_PUBLIC_BSCSCAN_API_KEY=your_bscscan_api_key
NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

## Project Structure

```
src/frontend/
├── app/
│   ├── presale/
│   │   └── page.tsx          # Main presale page
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/
│   ├── presale/
│   │   ├── PresaleCard.tsx
│   │   ├── PurchaseForm.tsx
│   │   ├── TokenomicsChart.tsx
│   │   ├── CountdownTimer.tsx
│   │   ├── ProgressBar.tsx
│   │   └── SocialProof.tsx
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── wagmi.ts              # Wagmi configuration
│   ├── contracts.ts          # Contract ABIs and addresses
│   └── utils.ts              # Utility functions
├── hooks/
│   ├── usePresaleData.ts
│   ├── useTokenBalance.ts
│   └── useBNBPrice.ts
├── public/
│   ├── images/
│   └── fonts/
└── next.config.js
```

## Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000/presale`

### Build for Production

```bash
npm run build
```

### Production Preview

```bash
npm run start
```

### Code Quality

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

## Smart Contract Integration

### Contract ABIs

The presale contract ABI is located in `/lib/contracts.ts`. Update with your deployed contract address:

```typescript
export const PRESALE_CONTRACT = {
  address: process.env.NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS as `0x${string}`,
  abi: [
    // Your contract ABI
  ]
}
```

### Reading Contract Data

```typescript
import { useReadContract } from 'wagmi'
import { PRESALE_CONTRACT } from '@/lib/contracts'

const { data: tokensSold } = useReadContract({
  ...PRESALE_CONTRACT,
  functionName: 'tokensSold',
})
```

### Writing to Contract

```typescript
import { useWriteContract } from 'wagmi'
import { PRESALE_CONTRACT } from '@/lib/contracts'

const { writeContract } = useWriteContract()

const buyWithBNB = async (amount: bigint) => {
  writeContract({
    ...PRESALE_CONTRACT,
    functionName: 'buyWithBNB',
    value: amount,
  })
}
```

## Testing

### Manual Testing Checklist

See `/docs/PRESALE_TESTING.md` for comprehensive testing guide.

### Key Test Scenarios

1. **Wallet Connection**
   - MetaMask connection
   - Network switching to BSC
   - Account switching

2. **BNB Purchase Flow**
   - Input validation
   - Transaction submission
   - Confirmation handling
   - Error states

3. **USDT Purchase Flow**
   - USDT approval
   - Purchase transaction
   - Multi-step process

4. **Responsive Design**
   - Mobile (320px - 768px)
   - Tablet (768px - 1024px)
   - Desktop (1024px+)

### Browser Testing

Test on:
- Chrome/Brave (primary)
- Firefox
- Safari (iOS)
- Mobile browsers

## Performance Optimization

### Image Optimization

All images use Next.js Image component:

```tsx
import Image from 'next/image'

<Image
  src="/images/logo.png"
  alt="ElonBTC"
  width={200}
  height={200}
  priority // For above-the-fold images
/>
```

### Code Splitting

Components are lazy loaded:

```tsx
import dynamic from 'next/dynamic'

const TokenomicsChart = dynamic(
  () => import('./TokenomicsChart'),
  { loading: () => <div>Loading...</div> }
)
```

### Bundle Analysis

```bash
npm run analyze
```

## Deployment

### Vercel Deployment (Recommended)

See `/docs/DEPLOYMENT_GUIDE.md` for detailed steps.

Quick deploy:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables

Set in Vercel dashboard:
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add all variables from `.env.local`

### Domain Configuration

1. Add custom domain in Vercel
2. Update DNS records
3. Enable HTTPS

## Monitoring and Analytics

### Google Analytics

Add to `app/layout.tsx`:

```tsx
import Script from 'next/script'

<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
  strategy="afterInteractive"
/>
```

### Error Monitoring

Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Vercel Analytics for performance

## Security Checklist

- [ ] Environment variables properly configured
- [ ] No private keys in code
- [ ] Contract addresses verified
- [ ] RPC endpoints secured
- [ ] API keys restricted by domain
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] XSS protection enabled
- [ ] CSP headers configured

## Troubleshooting

### MetaMask Connection Issues

```typescript
// Add network programmatically
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x38',
    chainName: 'BSC Mainnet',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed1.binance.org'],
    blockExplorerUrls: ['https://bscscan.com']
  }]
})
```

### Transaction Failures

1. Check gas limit
2. Verify contract address
3. Ensure sufficient balance
4. Check network congestion

### Build Errors

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

## Support and Resources

- Next.js Documentation: https://nextjs.org/docs
- Wagmi Documentation: https://wagmi.sh
- RainbowKit Documentation: https://www.rainbowkit.com
- BSC Documentation: https://docs.bnbchain.org

## Changelog

### v1.0.0 (Initial Release)
- Basic presale functionality
- BNB and USDT purchase options
- Wallet integration
- Responsive design
- Analytics integration

---

**Need Help?** Check `/docs/PRESALE_TESTING.md` for testing procedures or `/docs/DEPLOYMENT_GUIDE.md` for deployment steps.
