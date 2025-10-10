# Code Splitting and Lazy Loading Guide

## Overview

Strategic guide for implementing code splitting and lazy loading in the ElonBTC presale page to minimize initial bundle size and improve loading performance.

---

## Code Splitting Strategy

### Bundle Size Targets

- **First Load JS**: < 200KB (gzipped)
- **Main Bundle**: < 150KB
- **Vendor Bundle**: < 100KB
- **Route Bundle**: < 50KB each

---

## 1. Route-Based Code Splitting

Next.js automatically splits code by routes. Optimize further with dynamic imports.

### App Router Structure

```
app/
├── layout.tsx          # Root layout (always loaded)
├── presale/
│   ├── page.tsx        # Presale page (split automatically)
│   └── loading.tsx     # Loading state
├── dashboard/
│   └── page.tsx        # Dashboard (split automatically)
└── api/
    └── presale/
        └── route.ts    # API route (server-only)
```

### Loading States

```tsx
// app/presale/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  )
}
```

---

## 2. Component-Level Code Splitting

### Dynamic Imports

```tsx
import dynamic from 'next/dynamic'

// ✅ Lazy load heavy components
const TokenomicsChart = dynamic(
  () => import('@/components/presale/TokenomicsChart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false // Client-only component
  }
)

const RoadmapTimeline = dynamic(
  () => import('@/components/presale/RoadmapTimeline'),
  { loading: () => <div>Loading roadmap...</div> }
)

const TeamSection = dynamic(
  () => import('@/components/presale/TeamSection')
)
```

### Components to Lazy Load

#### Critical (Load Immediately)
- Wallet connection button
- Purchase form
- Progress bar
- Countdown timer
- Price display

#### Non-Critical (Lazy Load)
- Tokenomics chart (below fold)
- FAQ accordion
- Team section
- Roadmap timeline
- Partner logos
- Social proof feed
- Whitepaper viewer
- Advanced calculator

### Implementation Example

```tsx
// app/presale/page.tsx
'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Critical components - load immediately
import WalletConnect from '@/components/presale/WalletConnect'
import PurchaseForm from '@/components/presale/PurchaseForm'
import ProgressBar from '@/components/presale/ProgressBar'
import CountdownTimer from '@/components/presale/CountdownTimer'

// Non-critical - lazy load
const TokenomicsChart = dynamic(
  () => import('@/components/presale/TokenomicsChart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

const FAQSection = dynamic(
  () => import('@/components/presale/FAQSection')
)

const TeamSection = dynamic(
  () => import('@/components/presale/TeamSection')
)

export default function PresalePage() {
  return (
    <div>
      {/* Critical - above the fold */}
      <section className="hero">
        <WalletConnect />
        <CountdownTimer />
        <ProgressBar />
        <PurchaseForm />
      </section>

      {/* Non-critical - below the fold */}
      <Suspense fallback={<ChartSkeleton />}>
        <TokenomicsChart />
      </Suspense>

      <Suspense fallback={<div>Loading FAQ...</div>}>
        <FAQSection />
      </Suspense>

      <Suspense fallback={<div>Loading team...</div>}>
        <TeamSection />
      </Suspense>
    </div>
  )
}
```

---

## 3. Library-Level Code Splitting

### Optimize Heavy Dependencies

#### Chart Libraries

```tsx
// ❌ Imports entire library (100KB+)
import { Chart } from 'chart.js'

// ✅ Import only what you need
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend)

// ✅ Or lazy load the entire chart
const ChartComponent = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Pie),
  { ssr: false }
)
```

#### Icon Libraries

```tsx
// ❌ Imports all icons
import * as Icons from 'lucide-react'

// ✅ Import specific icons
import { Wallet, TrendingUp, Users } from 'lucide-react'

// ✅ Or lazy load icons
const DynamicIcon = dynamic(() =>
  import('lucide-react').then(mod => ({ default: mod[iconName] }))
)
```

#### Animation Libraries

```tsx
// ❌ Full framer-motion import
import { motion } from 'framer-motion'

// ✅ Lazy load animations
const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => mod.motion.div),
  { ssr: false }
)

// ✅ Or conditionally load
const [showAnimation, setShowAnimation] = useState(false)

{showAnimation && (
  <LazyMotionComponent />
)}
```

### Web3 Libraries

```tsx
// components/providers/WagmiProvider.tsx
'use client'

import dynamic from 'next/dynamic'

// Lazy load Web3 provider (heavy dependency)
const WagmiConfig = dynamic(
  () => import('wagmi').then(mod => mod.WagmiConfig),
  { ssr: false }
)

const RainbowKitProvider = dynamic(
  () => import('@rainbow-me/rainbowkit').then(mod => mod.RainbowKitProvider),
  { ssr: false }
)

export function Providers({ children }) {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
```

---

## 4. Modal and Dialog Splitting

### Lazy Load Modals

```tsx
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// Lazy load modal - only loads when opened
const TermsModal = dynamic(
  () => import('@/components/modals/TermsModal')
)

const WhitepaperModal = dynamic(
  () => import('@/components/modals/WhitepaperModal')
)

export function PresaleActions() {
  const [showTerms, setShowTerms] = useState(false)
  const [showWhitepaper, setShowWhitepaper] = useState(false)

  return (
    <>
      <button onClick={() => setShowTerms(true)}>
        View Terms
      </button>

      <button onClick={() => setShowWhitepaper(true)}>
        Read Whitepaper
      </button>

      {/* Only loaded when opened */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showWhitepaper && <WhitepaperModal onClose={() => setShowWhitepaper(false)} />}
    </>
  )
}
```

---

## 5. Third-Party Script Optimization

### Analytics and Tracking

```tsx
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}

        {/* Load after page is interactive */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
          strategy="afterInteractive"
        />

        {/* Load on idle */}
        <Script
          src="https://some-analytics.com/script.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
```

### Script Loading Strategies

- **beforeInteractive**: Critical scripts (rare)
- **afterInteractive**: Analytics, ads (default)
- **lazyOnload**: Non-critical scripts
- **worker**: Run in Web Worker (experimental)

---

## 6. Image Lazy Loading

### Next.js Image Component

```tsx
import Image from 'next/image'

export function Gallery() {
  return (
    <>
      {/* Above fold - priority load */}
      <Image
        src="/hero.jpg"
        alt="Hero"
        width={1200}
        height={600}
        priority
      />

      {/* Below fold - lazy load (default) */}
      <Image
        src="/team.jpg"
        alt="Team"
        width={800}
        height={400}
        loading="lazy"
      />
    </>
  )
}
```

---

## 7. CSS Code Splitting

### Tailwind CSS Optimization

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  // Remove unused styles
  safelist: [], // Only add if needed
}
```

### Critical CSS

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* Inline critical CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .critical-class { /* ... */ }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## 8. Prefetching Strategy

### Link Prefetching

```tsx
import Link from 'next/link'

// ✅ Prefetch on hover (default)
<Link href="/dashboard" prefetch>
  Dashboard
</Link>

// ❌ Don't prefetch (for less important routes)
<Link href="/terms" prefetch={false}>
  Terms
</Link>
```

### Manual Prefetching

```tsx
'use client'

import { useRouter } from 'next/navigation'

export function PreloadDashboard() {
  const router = useRouter()

  // Prefetch when user is likely to navigate
  const handleMouseEnter = () => {
    router.prefetch('/dashboard')
  }

  return (
    <button onMouseEnter={handleMouseEnter}>
      Go to Dashboard
    </button>
  )
}
```

---

## 9. Bundle Analysis

### Analyze Bundle Size

```bash
# Install bundle analyzer
npm install @next/bundle-analyzer

# Configure in next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ... your config
})

# Run analysis
ANALYZE=true npm run build
```

### Check Specific Routes

```bash
# Build and analyze
npm run build

# Output shows bundle sizes:
# ┌ ○ /presale                     123 kB         45 kB
# ├ ○ /dashboard                   89 kB          32 kB
# └ λ /api/presale                 12 kB          4 kB
```

---

## 10. Webpack Configuration

### Custom Webpack Config

```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    // Optimize client-side bundle
    if (!isServer) {
      // Split vendor chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor bundle
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          // Common components
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      }
    }

    return config
  }
}
```

---

## Implementation Checklist

### Phase 1: Critical Path
- [x] Identify above-the-fold components
- [x] Keep critical components in main bundle
- [x] Remove unused imports
- [x] Optimize font loading

### Phase 2: Lazy Loading
- [ ] Dynamic import non-critical components
- [ ] Add loading states/skeletons
- [ ] Lazy load modals and dialogs
- [ ] Defer third-party scripts

### Phase 3: Optimization
- [ ] Split large libraries
- [ ] Optimize images
- [ ] Enable prefetching for likely routes
- [ ] Configure bundle splitting

### Phase 4: Monitoring
- [ ] Run bundle analysis
- [ ] Monitor bundle sizes in CI/CD
- [ ] Track loading performance
- [ ] Set bundle size budgets

---

## Performance Budgets

### Bundle Size Budgets

```javascript
// next.config.js
module.exports = {
  experimental: {
    bundlePagesRouterDependencies: true
  },
  // Performance budgets
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  }
}
```

### GitHub Action for Budget Enforcement

```yaml
# .github/workflows/performance-budget.yml
name: Performance Budget

on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - name: Check bundle size
        run: |
          SIZE=$(stat -f%z .next/static/chunks/main-*.js)
          if [ $SIZE -gt 204800 ]; then
            echo "Bundle too large: $SIZE bytes (max 200KB)"
            exit 1
          fi
```

---

## Verification

### Test Code Splitting

1. Build production bundle:
```bash
npm run build
```

2. Check output for split chunks:
```
Route (app)                              Size     First Load JS
┌ ○ /                                   142 B          87.3 kB
├ ○ /presale                            5.8 kB         93.1 kB
├ λ /api/presale                        0 B             0 B
└ ○ /_not-found                         875 B          88.1 kB
```

3. Verify lazy loading in browser:
- Open DevTools → Network tab
- Load page
- Check which chunks load initially
- Scroll/interact and verify additional chunks load

---

## Resources

- Next.js Code Splitting: https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading
- Dynamic Imports: https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading
- Bundle Analyzer: https://www.npmjs.com/package/@next/bundle-analyzer
- Webpack Documentation: https://webpack.js.org/guides/code-splitting/

---

**Result:** Optimized bundle = Faster initial load = Better user experience! 📦⚡

**Last Updated:** 2025-10-10
