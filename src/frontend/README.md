# Modern Web3 dApp Frontend

A production-ready, feature-rich decentralized application frontend built with Next.js, React, TypeScript, and Web3 integration.

## Features

- ✅ **Wallet Connection** - MetaMask integration with multi-chain support
- ✅ **Token Dashboard** - Real-time price, market cap, volume tracking
- ✅ **Staking Interface** - Flexible staking with APY calculator
- ✅ **Trading Charts** - Interactive price and volume charts
- ✅ **AI Insights** - Machine learning-powered market analysis
- ✅ **Governance** - Decentralized proposal voting system
- ✅ **Dark Mode** - Beautiful dark/light theme toggle
- ✅ **Responsive Design** - Mobile, tablet, and desktop optimized
- ✅ **Type Safety** - Full TypeScript coverage

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your contract addresses

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ethers.js** - Web3 library
- **Recharts** - Data visualization
- **Framer Motion** - Animations

## Documentation

See [docs/frontend-guide.md](/Users/ai.place/Crypto/docs/frontend-guide.md) for complete documentation.

## Project Structure

```
src/frontend/
├── components/      # React components
├── contexts/        # React contexts
├── hooks/          # Custom hooks
├── lib/            # Utilities
├── pages/          # Next.js pages
├── styles/         # Global styles
└── types/          # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript validation

## Environment Variables

```env
NEXT_PUBLIC_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_STAKING_ADDRESS=0x...
NEXT_PUBLIC_GOVERNANCE_ADDRESS=0x...
```

## Contributing

Contributions welcome! Please read the contribution guidelines first.

## License

MIT
