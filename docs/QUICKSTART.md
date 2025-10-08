# Frontend dApp Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- MetaMask browser extension
- Basic knowledge of Web3/Ethereum

## Installation (5 minutes)

### 1. Navigate to Frontend Directory

```bash
cd /Users/ai.place/Crypto/src/frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- React 18
- TypeScript
- ethers.js v6
- Tailwind CSS
- Recharts
- Framer Motion
- All other dependencies

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required: Your deployed contract addresses
NEXT_PUBLIC_TOKEN_ADDRESS=0xYourTokenContractAddress
NEXT_PUBLIC_STAKING_ADDRESS=0xYourStakingContractAddress
NEXT_PUBLIC_GOVERNANCE_ADDRESS=0xYourGovernanceContractAddress

# Optional: Custom RPC URLs
NEXT_PUBLIC_ETHEREUM_RPC=https://eth.llamarpc.com
NEXT_PUBLIC_POLYGON_RPC=https://polygon-rpc.com
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Steps

### 1. Connect Wallet
- Click "Connect Wallet" button in top right
- Approve MetaMask connection
- Select account to connect

### 2. Explore Features

**Dashboard Tab:**
- View token price and market data
- See holder count and trading volume
- Monitor 24h price changes

**Staking Tab:**
- Stake tokens with flexible lock periods
- Calculate APY returns
- Claim rewards
- Unstake tokens

**Trading Tab:**
- View interactive price charts
- Switch between 1H, 24H, 7D, 30D timeframes
- Monitor trading volume

**AI Insights Tab:**
- View AI-powered market analysis
- See bullish/bearish signals
- Check confidence scores

**Governance Tab:**
- View active proposals
- Cast votes for/against
- Track voting results

### 3. Test Functionality

**Token Dashboard:**
```typescript
// Should display:
✓ Current token price
✓ Market cap
✓ 24h volume
✓ Holder count
✓ Contract address
```

**Staking:**
```typescript
// Should allow:
✓ Input staking amount
✓ Select lock period (30/90/180/365 days)
✓ Calculate estimated APY
✓ Stake transaction
✓ View staked balance
✓ Claim rewards
✓ Unstake tokens
```

## Development Workflow

### Running Tests

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

### Making Changes

1. **Edit Components:** Modify files in `components/`
2. **Update Styles:** Edit `styles/globals.css` or Tailwind classes
3. **Add Features:** Create new components and hooks
4. **Test:** Changes auto-reload with hot module replacement

### Project Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

## Common Tasks

### Adding a New Page

1. Create file in `pages/`
```typescript
// pages/analytics.tsx
export default function Analytics() {
  return <div>Analytics Page</div>
}
```

2. Add navigation link in `pages/index.tsx`

### Creating a New Component

1. Create component file:
```typescript
// components/MyComponent.tsx
export const MyComponent = () => {
  return <div>My Component</div>
}
```

2. Import and use:
```typescript
import { MyComponent } from '@/components/MyComponent';

<MyComponent />
```

### Adding Contract Interaction

1. Define ABI in `hooks/useContract.ts`
2. Create custom hook
3. Use in component

Example:
```typescript
// hooks/useMyContract.ts
export function useMyContract(address: string) {
  const contract = useContract(address, MY_CONTRACT_ABI);

  const myFunction = async () => {
    const result = await contract.myFunction();
    return result;
  };

  return { myFunction };
}
```

## Troubleshooting

### MetaMask Not Detected

**Issue:** "Please install MetaMask" error

**Solution:**
1. Install MetaMask extension
2. Create or import wallet
3. Refresh page

### Contract Not Found

**Issue:** Contract errors or missing data

**Solution:**
1. Verify contract addresses in `.env.local`
2. Ensure contracts are deployed
3. Check correct network selected in MetaMask

### Build Errors

**Issue:** TypeScript or build errors

**Solution:**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Wallet Connection Issues

**Issue:** Wallet won't connect

**Solution:**
1. Check MetaMask is unlocked
2. Ensure correct network selected
3. Try disconnecting and reconnecting
4. Clear browser cache

## Network Configuration

### Supported Networks

**Mainnet:**
- Ethereum (Chain ID: 1)
- Polygon (Chain ID: 137)
- BSC (Chain ID: 56)

**Testnet:**
- Goerli (Chain ID: 5)
- Mumbai (Chain ID: 80001)
- BSC Testnet (Chain ID: 97)

### Adding Custom Network

Edit `lib/constants.ts`:

```typescript
export const SUPPORTED_CHAINS = [
  {
    id: YOUR_CHAIN_ID,
    name: 'Your Network',
    rpcUrl: 'https://your-rpc-url.com',
    blockExplorer: 'https://your-explorer.com',
  },
];
```

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Configure environment variables in Vercel dashboard

### Deploy to Other Platforms

**Netlify:**
```bash
npm run build
# Deploy 'out' directory
```

**AWS/Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Performance Tips

1. **Optimize Images:** Use Next.js Image component
2. **Code Splitting:** Dynamic imports for heavy components
3. **Caching:** Configure cache headers
4. **Minimize API Calls:** Use polling intervals wisely
5. **Lazy Loading:** Load components on demand

## Security Checklist

- [ ] Never commit `.env.local`
- [ ] Validate all user inputs
- [ ] Use HTTPS in production
- [ ] Verify contract addresses
- [ ] Test on testnet first
- [ ] Enable transaction confirmations
- [ ] Implement rate limiting
- [ ] Add error boundaries

## Next Steps

1. **Customize Design:** Update colors in `tailwind.config.js`
2. **Add Analytics:** Integrate Google Analytics
3. **Enhance Features:** Add more contract interactions
4. **Optimize Performance:** Implement caching strategies
5. **Add Tests:** Write unit and integration tests
6. **Documentation:** Update docs for custom features

## Resources

- **Full Documentation:** `/docs/frontend-guide.md`
- **Component Library:** Explore `components/ui/`
- **Example Hooks:** Check `hooks/` directory
- **Type Definitions:** See `types/index.ts`

## Support

For help:
1. Check documentation
2. Review troubleshooting section
3. Inspect browser console
4. Check MetaMask errors
5. Review transaction logs

---

**Ready to build! 🚀**

Start exploring the codebase and building your Web3 dApp!
