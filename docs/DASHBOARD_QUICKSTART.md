# HypeAI Dashboard - Quick Start Guide

**Get up and running in 15 minutes**

---

## 🚀 Quick Setup

### Prerequisites
- Node.js 16+ and npm 8+
- MetaMask or similar Web3 wallet
- Basic knowledge of React and TypeScript

### 1. Initialize Project (5 minutes)

```bash
# Create new Vite project with React + TypeScript
npm create vite@latest hypeai-dashboard -- --template react-ts
cd hypeai-dashboard

# Install dependencies
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install Web3 dependencies
npm install wagmi viem @rainbow-me/rainbowkit ethers

# Install state management
npm install zustand @tanstack/react-query

# Install UI dependencies
npm install framer-motion recharts react-hot-toast clsx date-fns

# Install dev dependencies
npm install -D @types/node
```

### 2. Configure Tailwind (2 minutes)

Create `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#0066FF',
          purple: '#8B5CF6',
        },
        secondary: {
          green: '#10B981',
          orange: '#F59E0B',
          red: '#EF4444',
          gray: '#6B7280',
        },
        background: {
          dark: '#0F172A',
          card: '#1E293B',
          hover: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

Update `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-background-dark text-white font-sans;
  }
}
```

### 3. Setup Web3 (3 minutes)

Create `src/providers/Web3Provider.tsx`:

```typescript
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const config = getDefaultConfig({
  appName: 'HypeAI Dashboard',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect
  chains: [mainnet, polygon],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 4. Create First Component (5 minutes)

Create `src/components/Button.tsx`:

```typescript
import { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        px-6 py-3 rounded-full font-semibold transition-all
        ${variant === 'primary'
          ? 'bg-gradient-to-r from-primary-blue to-primary-purple text-white'
          : 'bg-background-card text-white border border-primary-purple'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </motion.button>
  );
}
```

Create `src/components/Card.tsx`:

```typescript
interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-background-card rounded-2xl border border-primary-purple/20 p-6 ${className}`}>
      {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
      {children}
    </div>
  );
}
```

### 5. Update Main App

Update `src/App.tsx`:

```typescript
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from './components/Button';
import { Card } from './components/Card';

function App() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background-dark/80 backdrop-blur-lg border-b border-primary-purple/20 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-blue to-primary-purple rounded-full" />
            <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary-blue to-primary-purple bg-clip-text text-transparent">
              HypeAI
            </h1>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-heading font-black mb-4 bg-gradient-to-r from-primary-blue via-primary-purple to-secondary-green bg-clip-text text-transparent">
            Where Hype Meets Intelligence
          </h2>
          <p className="text-xl text-secondary-gray mb-8">
            AI-powered crypto trading with up to 62% APY staking
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="primary">Start Trading</Button>
            <Button variant="secondary">Learn More</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card title="Trading Volume">
            <div className="text-3xl font-bold text-secondary-green">$1.2M</div>
            <div className="text-sm text-secondary-gray mt-2">24h Volume</div>
          </Card>
          <Card title="Staking APY">
            <div className="text-3xl font-bold text-primary-purple">62%</div>
            <div className="text-sm text-secondary-gray mt-2">Max APY</div>
          </Card>
          <Card title="AI Accuracy">
            <div className="text-3xl font-bold text-primary-blue">85%</div>
            <div className="text-sm text-secondary-gray mt-2">Prediction Accuracy</div>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="🤖 AI Predictions">
            <p className="text-secondary-gray">
              Advanced LSTM and Transformer models predict price movements with 85%+ accuracy
            </p>
          </Card>
          <Card title="💰 High Yield Staking">
            <p className="text-secondary-gray">
              Earn up to 62% APY with our multi-tier staking system and daily compounding
            </p>
          </Card>
          <Card title="🗳️ DAO Governance">
            <p className="text-secondary-gray">
              Participate in community-driven decisions with token-weighted voting power
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default App;
```

Update `src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Web3Provider } from './providers/Web3Provider';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Web3Provider>
      <App />
    </Web3Provider>
  </React.StrictMode>
);
```

### 6. Run Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser!

---

## 🎯 Next Steps

### Add Trading Interface

Create `src/components/PriceChart.tsx`:

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', price: 0.00095 },
  { time: '04:00', price: 0.00098 },
  { time: '08:00', price: 0.00102 },
  { time: '12:00', price: 0.00105 },
  { time: '16:00', price: 0.00108 },
  { time: '20:00', price: 0.00112 },
];

export function PriceChart() {
  return (
    <div className="bg-background-card rounded-2xl border border-primary-purple/20 p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-2xl font-bold">HYPEAI/USD</h3>
          <p className="text-3xl font-black mt-2 bg-gradient-to-r from-primary-blue to-primary-purple bg-clip-text text-transparent">
            $0.00112
          </p>
        </div>
        <div className="flex gap-2">
          {['1H', '4H', '1D', '1W'].map((interval) => (
            <button
              key={interval}
              className="px-3 py-1 rounded-lg bg-background-hover text-secondary-gray hover:text-white transition-colors"
            >
              {interval}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="time" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E293B',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#0066FF"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

Add to `App.tsx`:

```typescript
import { PriceChart } from './components/PriceChart';

// In your App component, before the feature cards:
<div className="mb-12">
  <PriceChart />
</div>
```

### Add Staking Card

Create `src/components/StakingCard.tsx`:

```typescript
import { useState } from 'react';
import { Button } from './Button';

interface StakingCardProps {
  tier: string;
  duration: number;
  apy: number;
  icon: string;
}

export function StakingCard({ tier, duration, apy, icon }: StakingCardProps) {
  const [amount, setAmount] = useState('');

  return (
    <div className="bg-background-card rounded-2xl border border-primary-purple/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{icon}</span>
          <div>
            <h3 className="text-2xl font-bold">{tier}</h3>
            <p className="text-sm text-secondary-gray">{duration} days</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black bg-gradient-to-r from-secondary-green to-secondary-green bg-clip-text text-transparent">
            {apy}%
          </div>
          <p className="text-sm text-secondary-gray">APY</p>
        </div>
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount to stake"
        className="w-full bg-background-hover border border-primary-purple/20 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-primary-purple"
      />

      {amount && (
        <div className="bg-secondary-green/10 rounded-lg p-4 mb-4">
          <p className="text-sm text-secondary-gray">Estimated Rewards</p>
          <p className="text-2xl font-bold text-secondary-green">
            +{(parseFloat(amount) * (apy / 100) * (duration / 365)).toFixed(2)} HYPEAI
          </p>
        </div>
      )}

      <Button variant="primary" className="w-full">
        Stake {tier}
      </Button>
    </div>
  );
}
```

Add to `App.tsx`:

```typescript
import { StakingCard } from './components/StakingCard';

// Add a staking section:
<div className="mb-12">
  <h3 className="text-3xl font-heading font-bold mb-6">Staking Tiers</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <StakingCard tier="Bronze" duration={30} apy={17} icon="🥉" />
    <StakingCard tier="Silver" duration={90} apy={27} icon="🥈" />
    <StakingCard tier="Gold" duration={180} apy={42} icon="🥇" />
    <StakingCard tier="Platinum" duration={365} apy={62} icon="💎" />
  </div>
</div>
```

---

## 🔧 Environment Setup

Create `.env`:

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
VITE_ALCHEMY_KEY=your_alchemy_key_here
VITE_TOKEN_ADDRESS=0x...
VITE_STAKING_ADDRESS=0x...
```

Get your WalletConnect Project ID:
1. Go to https://cloud.walletconnect.com
2. Create a new project
3. Copy the Project ID

---

## 📦 Recommended Folder Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── trading/
│   │   ├── PriceChart.tsx
│   │   └── OrderForm.tsx
│   └── staking/
│       └── StakingCard.tsx
├── hooks/
│   ├── useWallet.ts
│   └── useContract.ts
├── providers/
│   └── Web3Provider.tsx
├── utils/
│   └── formatters.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## 🎨 Adding Custom Fonts

Update `index.html`:

```html
<head>
  <!-- ... -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;600;700;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
</head>
```

---

## 🚀 Deploy to Production

### Option 1: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Netlify

```bash
# Build
npm run build

# Drag & drop the 'dist' folder to netlify.com
```

---

## ✅ Quick Checklist

- [ ] Project initialized with Vite
- [ ] Tailwind CSS configured
- [ ] Web3 provider setup
- [ ] Button component created
- [ ] Card component created
- [ ] Hero section implemented
- [ ] Price chart added
- [ ] Staking cards added
- [ ] Wallet connection working
- [ ] Responsive design tested

---

## 🆘 Troubleshooting

### Issue: "Module not found"
**Solution:** Make sure all dependencies are installed:
```bash
npm install
```

### Issue: "TypeScript errors"
**Solution:** Add this to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

### Issue: "Tailwind styles not working"
**Solution:** Ensure `index.css` is imported in `main.tsx`:
```typescript
import './index.css';
```

### Issue: "Web3 connection fails"
**Solution:** Check that:
1. MetaMask is installed
2. `.env` has correct PROJECT_ID
3. Browser allows popups

---

## 📚 Additional Resources

- **Full Architecture:** [DASHBOARD_ARCHITECTURE.md](./DASHBOARD_ARCHITECTURE.md)
- **Component Specs:** [DASHBOARD_COMPONENT_SPECS.md](./DASHBOARD_COMPONENT_SPECS.md)
- **Visual Guide:** [DASHBOARD_ARCHITECTURE_VISUAL.md](./DASHBOARD_ARCHITECTURE_VISUAL.md)
- **HypeAI Branding:** [HYPEAI_BRANDING.md](./HYPEAI_BRANDING.md)

---

## 🎯 What's Next?

1. **Add More Features:**
   - Order form for trading
   - Transaction history
   - Portfolio analytics
   - AI predictions display

2. **Optimize Performance:**
   - Code splitting
   - Image optimization
   - Lazy loading

3. **Add Testing:**
   - Unit tests with Vitest
   - E2E tests with Playwright

4. **Deploy:**
   - Setup CI/CD
   - Configure monitoring
   - Add analytics

---

**You're now ready to build! 🚀**

🤖 **HypeAI - Where Hype Meets Intelligence**
