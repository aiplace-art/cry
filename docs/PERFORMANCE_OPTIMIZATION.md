# Performance Optimization Guide

## Overview

This guide covers performance optimization strategies for the ElonBTC presale page to ensure fast load times, smooth interactions, and excellent user experience.

---

## Core Web Vitals Targets

### Target Metrics

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FCP (First Contentful Paint)**: < 1.8s
- **TTI (Time to Interactive)**: < 3.5s
- **TBT (Total Blocking Time)**: < 200ms

---

## 1. Image Optimization

### Next.js Image Component

Always use Next.js Image component for automatic optimization:

```tsx
import Image from 'next/image'

// ✅ Optimized
<Image
  src="/images/logo.png"
  alt="ElonBTC Logo"
  width={200}
  height={200}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// ❌ Not optimized
<img src="/images/logo.png" alt="Logo" />
```

### Image Formats

1. **AVIF**: Best compression, modern browsers
2. **WebP**: Good compression, wide support
3. **JPEG/PNG**: Fallback for older browsers

Next.js automatically serves optimal format.

### Image Optimization Checklist

- [ ] All images use Next.js Image component
- [ ] Above-the-fold images have `priority` prop
- [ ] Images have proper width/height to prevent CLS
- [ ] Placeholder blurs implemented
- [ ] Image sizes optimized (< 200KB)
- [ ] Responsive images for different screens
- [ ] SVGs for icons and logos
- [ ] Lazy loading for below-the-fold images

### Optimization Script

```bash
# Install sharp for better image processing
npm install sharp

# Optimize images
npx @next/codemod@latest new-link .
```

---

## 2. Code Splitting and Lazy Loading

### Dynamic Imports

Load components only when needed:

```tsx
import dynamic from 'next/dynamic'

// ✅ Lazy load heavy components
const TokenomicsChart = dynamic(
  () => import('./TokenomicsChart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false // Disable SSR for client-only components
  }
)

const HeavyModal = dynamic(() => import('./HeavyModal'), {
  loading: () => <LoadingSpinner />
})
```

### Route-Based Code Splitting

Next.js automatically splits code by routes. Optimize further:

```tsx
// app/presale/page.tsx
export default function PresalePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PresaleContent />
    </Suspense>
  )
}
```

### Component Lazy Loading Strategy

**Load immediately (critical path):**
- Wallet connection button
- Purchase form
- Progress bar
- Countdown timer

**Lazy load (below fold or on interaction):**
- Tokenomics chart
- FAQ accordion
- Social proof feed
- Roadmap timeline
- Team section

---

## 3. Bundle Size Optimization

### Analyze Bundle

```bash
# Install bundle analyzer
npm install @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Run analysis
ANALYZE=true npm run build
```

### Target Bundle Sizes

- **First Load JS**: < 200KB
- **Total Bundle Size**: < 500KB (gzipped)
- **Individual Route**: < 100KB

### Optimization Strategies

#### 1. Tree Shaking

```typescript
// ✅ Import only what you need
import { formatEther } from 'viem'

// ❌ Imports entire library
import * as viem from 'viem'
```

#### 2. Remove Unused Dependencies

```bash
# Analyze unused dependencies
npx depcheck

# Remove unused packages
npm uninstall [package-name]
```

#### 3. Optimize Heavy Libraries

**Before:**
```typescript
import { motion } from 'framer-motion'
import { Chart } from 'chart.js'
```

**After:**
```typescript
// Lazy load animations
const motion = dynamic(() => import('framer-motion').then(mod => mod.motion))

// Use lighter alternative or lazy load
const Chart = dynamic(() => import('react-chartjs-2'))
```

#### 4. Configure Package Imports

In `next.config.js`:

```javascript
experimental: {
  optimizePackageImports: [
    'lucide-react',
    'framer-motion',
    '@tanstack/react-query'
  ],
}
```

---

## 4. Caching Strategy

### Static Assets

```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/images/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ]
}
```

### API Responses

```typescript
// Use React Query for automatic caching
import { useQuery } from '@tanstack/react-query'

const { data: presaleData } = useQuery({
  queryKey: ['presaleData'],
  queryFn: fetchPresaleData,
  staleTime: 30000, // 30 seconds
  cacheTime: 300000, // 5 minutes
})
```

### Smart Contract Reads

```typescript
import { useReadContract } from 'wagmi'

// Wagmi automatically caches contract reads
const { data: tokensSold } = useReadContract({
  address: PRESALE_ADDRESS,
  abi: PRESALE_ABI,
  functionName: 'tokensSold',
  // Cache for 30 seconds
  cacheTime: 30_000,
})
```

---

## 5. Font Optimization

### Next.js Font Optimization

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
  preload: true,
  variable: '--font-inter',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

### Font Loading Strategy

1. **Preload**: Critical fonts
2. **Display: swap**: Show fallback immediately
3. **Subset**: Only load required characters
4. **Self-host**: Better performance than Google Fonts CDN

---

## 6. JavaScript Optimization

### Reduce JavaScript Execution

#### 1. Minimize Third-Party Scripts

```tsx
// Load analytics asynchronously
import Script from 'next/script'

<Script
  src="https://www.googletagmanager.com/gtag/js"
  strategy="afterInteractive" // Load after page is interactive
/>
```

#### 2. Optimize Event Handlers

```typescript
// ✅ Debounce input handlers
import { useDebouncedCallback } from 'use-debounce'

const handleInput = useDebouncedCallback((value) => {
  calculateTokenAmount(value)
}, 300)

// ✅ Throttle scroll handlers
import { useThrottledCallback } from 'use-debounce'

const handleScroll = useThrottledCallback(() => {
  updateScrollPosition()
}, 100)
```

#### 3. Memoization

```typescript
import { useMemo, useCallback } from 'react'

// Memoize expensive calculations
const tokenAmount = useMemo(() => {
  return calculateTokens(bnbAmount, bnbPrice)
}, [bnbAmount, bnbPrice])

// Memoize callbacks
const handlePurchase = useCallback(() => {
  executePurchase(amount)
}, [amount])
```

---

## 7. Network Optimization

### Reduce HTTP Requests

1. **Combine CSS**: Next.js does this automatically
2. **Inline Critical CSS**: Use `next/head` for critical styles
3. **Sprite Images**: Use SVG sprites for icons
4. **API Batching**: Combine multiple API calls

### Optimize API Calls

```typescript
// ✅ Batch contract reads
import { useReadContracts } from 'wagmi'

const { data } = useReadContracts({
  contracts: [
    { address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: 'tokensSold' },
    { address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: 'totalRaised' },
    { address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: 'endTime' },
  ],
})
```

### Prefetch Critical Resources

```tsx
<Head>
  <link rel="preconnect" href="https://bsc-dataseed1.binance.org" />
  <link rel="dns-prefetch" href="https://bscscan.com" />
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
</Head>
```

---

## 8. Rendering Optimization

### Server-Side Rendering (SSR)

Use SSR for SEO-critical content:

```typescript
// app/presale/page.tsx
export default async function PresalePage() {
  // Fetch data on server
  const presaleData = await fetchPresaleData()

  return <PresaleContent data={presaleData} />
}
```

### Incremental Static Regeneration (ISR)

For semi-static content:

```typescript
export const revalidate = 60 // Revalidate every 60 seconds

export default async function Page() {
  const data = await fetchData()
  return <Component data={data} />
}
```

### Client-Side Rendering (CSR)

For highly dynamic content:

```typescript
'use client'

export default function DynamicComponent() {
  const { data } = usePresaleData()
  return <div>{data}</div>
}
```

---

## 9. Mobile Optimization

### Responsive Images

```tsx
<Image
  src="/hero.jpg"
  alt="Hero"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  fill
/>
```

### Touch Optimization

```css
/* Increase touch target size */
.button {
  min-height: 44px; /* iOS minimum */
  min-width: 44px;
  padding: 12px 24px;
}

/* Optimize touch interactions */
.interactive {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
```

### Reduce Mobile JavaScript

```typescript
// Conditionally load heavy features
const isMobile = useMediaQuery('(max-width: 768px)')

{!isMobile && <HeavyDesktopFeature />}
```

---

## 10. Monitoring and Measurement

### Real User Monitoring

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
```

### Performance Tracking

```typescript
// Report Web Vitals
export function reportWebVitals(metric) {
  console.log(metric)

  // Send to analytics
  if (metric.label === 'web-vital') {
    gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_label: metric.id,
      non_interaction: true,
    })
  }
}
```

### Lighthouse CI

```yaml
# .lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["https://presale.elonbtc.com"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "categories:best-practices": ["error", {"minScore": 0.95}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

---

## Performance Checklist

### Before Deployment

- [ ] Bundle size analyzed and optimized
- [ ] All images optimized (WebP/AVIF)
- [ ] Critical CSS inlined
- [ ] Above-the-fold content prioritized
- [ ] Lazy loading implemented
- [ ] Code splitting configured
- [ ] Fonts optimized
- [ ] Third-party scripts async/deferred
- [ ] Caching headers configured
- [ ] Compression enabled
- [ ] Lighthouse score > 90
- [ ] Mobile performance tested
- [ ] Web Vitals meet targets

### Ongoing Monitoring

- [ ] Monitor Core Web Vitals
- [ ] Track bundle size growth
- [ ] Review Lighthouse reports
- [ ] Analyze user metrics
- [ ] Test on real devices
- [ ] Monitor error rates
- [ ] Check load times globally

---

## Quick Wins

### Immediate Improvements

1. **Enable compression** (Gzip/Brotli)
2. **Add caching headers**
3. **Optimize images** with Next.js Image
4. **Lazy load below-the-fold content**
5. **Preconnect to external domains**
6. **Defer non-critical JavaScript**
7. **Minimize third-party scripts**
8. **Use font-display: swap**

---

## Tools and Resources

- **Lighthouse**: https://developers.google.com/web/tools/lighthouse
- **PageSpeed Insights**: https://pagespeed.web.dev
- **WebPageTest**: https://www.webpagetest.org
- **Bundle Analyzer**: https://www.npmjs.com/package/@next/bundle-analyzer
- **Chrome DevTools**: Performance tab
- **Next.js Analytics**: Built into Vercel

---

**Target Achieved:** Fast, smooth, production-ready presale page! 🚀

**Last Updated:** 2025-10-10
