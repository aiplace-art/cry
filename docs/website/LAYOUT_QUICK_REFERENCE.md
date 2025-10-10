# HypeAI Layout - Quick Reference Guide

**Quick-start guide for developers implementing the layout system**

---

## Grid System (Copy-Paste Ready)

### Base Configuration

```css
/* Add to your global CSS or Tailwind config */
:root {
  /* Grid Columns */
  --grid-cols-mobile: 4;
  --grid-cols-tablet: 8;
  --grid-cols-desktop: 12;

  /* Grid Gaps */
  --gap-mobile: 8px;
  --gap-tablet: 12px;
  --gap-desktop: 16px;

  /* Spacing Scale (8pt/4pt) */
  --space-0: 0px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### Trading Layout Template

```css
.trading-layout {
  display: grid;
  min-height: 100vh;
  grid-template-rows: auto 1fr auto;
}

/* Mobile: Stack everything */
.trading-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap-mobile);
}

/* Tablet: Chart + Sidebar */
@media (min-width: 768px) {
  .trading-content {
    grid-template-columns: 2fr 1fr;
    gap: var(--gap-tablet);
  }
}

/* Desktop: Full 3-column */
@media (min-width: 1024px) {
  .trading-content {
    grid-template-columns: 280px 1fr 320px;
    gap: var(--gap-desktop);
  }
}
```

---

## Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: {
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
      },
      screens: {
        'xs': '0px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      gridTemplateColumns: {
        'trading-mobile': '1fr',
        'trading-tablet': '2fr 1fr',
        'trading-desktop': '280px 1fr 320px',
      },
    },
  },
}
```

---

## React Component Templates

### 1. Responsive Layout Hook

```typescript
// hooks/useBreakpoint.ts
import { useState, useEffect } from 'react';

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      if (window.innerWidth < 768) setBreakpoint('mobile');
      else if (window.innerWidth < 1024) setBreakpoint('tablet');
      else setBreakpoint('desktop');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}
```

### 2. Collapsible Sidebar

```tsx
// components/Sidebar.tsx
import { useState } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const breakpoint = useBreakpoint();

  return (
    <>
      {/* Mobile: Overlay */}
      {breakpoint === 'mobile' && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${breakpoint === 'mobile'
          ? 'fixed top-16 left-0 bottom-0 z-50 transition-transform'
          : 'relative'}
        ${breakpoint === 'mobile' && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        ${isCollapsed ? 'w-16' : 'w-70'}
        bg-gray-900 transition-all duration-300
      `}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-4 right-4"
        >
          {isCollapsed ? '→' : '←'}
        </button>

        <div className={`${isCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
          {children}
        </div>
      </aside>
    </>
  );
}
```

### 3. Bottom Sheet (Mobile)

```tsx
// components/BottomSheet.tsx
export function BottomSheet({
  isOpen,
  onClose,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sheet */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-gray-900 rounded-t-2xl
        max-h-[85vh] overflow-y-auto
        transition-transform duration-300
        md:relative md:translate-y-0 md:rounded-lg md:max-h-none
        ${isOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
      `}>
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2 md:hidden">
          <div className="w-10 h-1 bg-gray-700 rounded-full" />
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </>
  );
}
```

### 4. Responsive Chart

```tsx
// components/Chart.tsx
import { useRef, useEffect, useState } from 'react';

export function Chart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[60vh] md:h-[70vh] lg:h-[calc(100vh-240px)]"
    >
      {/* Chart library here - receives width/height from size state */}
      <div>Chart: {size.width}x{size.height}</div>
    </div>
  );
}
```

### 5. Virtual Scrolling Order Book

```tsx
// components/OrderBook.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function OrderBook({ orders }: { orders: Order[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28, // Row height
    overscan: 10,
  });

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <OrderRow order={orders[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Common Patterns

### Density Modes

```tsx
type Density = 'compact' | 'normal' | 'comfortable';

const densityClasses = {
  compact: 'text-xs leading-7 px-2 py-1',
  normal: 'text-sm leading-9 px-3 py-2',
  comfortable: 'text-base leading-11 px-4 py-3',
};

function DensityProvider({ density = 'normal', children }) {
  return (
    <div className={densityClasses[density]}>
      {children}
    </div>
  );
}
```

### Touch Targets (Mobile)

```css
/* Ensure minimum 44px tap targets */
.btn-mobile {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

@media (min-width: 768px) {
  .btn-mobile {
    min-height: 36px;
    padding: 8px 12px;
  }
}
```

### Skeleton Loading

```tsx
function ChartSkeleton() {
  return (
    <div className="w-full h-[60vh] bg-gray-800 rounded-lg animate-pulse">
      <div className="h-full flex items-end justify-around p-4">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-700 w-4 rounded-t"
            style={{ height: `${Math.random() * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## Performance Checklist

### Initial Load
- [ ] Critical CSS inlined (< 14KB)
- [ ] Fonts preloaded (Inter variable)
- [ ] Code split by route
- [ ] Lazy load below-fold components
- [ ] Use Lighthouse CI for monitoring

### Runtime
- [ ] Virtual scrolling for 1000+ items
- [ ] Debounced resize handlers (150ms)
- [ ] GPU-accelerated animations (transform/opacity)
- [ ] CSS containment on cards
- [ ] RequestAnimationFrame for updates

### Bundle Size
- [ ] Initial JS < 150KB gzipped
- [ ] Use Lightweight Charts (not full TradingView)
- [ ] Tree-shake unused libraries
- [ ] Dynamic imports for heavy features

---

## Accessibility Checklist

- [ ] Keyboard navigation (Tab, Arrow keys, Enter, Esc)
- [ ] Focus indicators (2px outline, 2px offset)
- [ ] ARIA labels on complex widgets
- [ ] Skip links for main content
- [ ] Color contrast 4.5:1 minimum
- [ ] Touch targets 44px minimum
- [ ] Screen reader testing (NVDA/JAWS)

---

## Testing Devices

### Mobile
- iPhone SE (375px width)
- iPhone 14 Pro (393px width)
- Samsung Galaxy S21 (360px width)

### Tablet
- iPad Mini (768px width)
- iPad Pro (1024px width)

### Desktop
- MacBook Air (1280px width)
- iMac 27" (2560px width)
- 4K Monitor (3840px width)

---

## Common Issues & Solutions

### Issue: Chart not resizing
```typescript
// Solution: Use ResizeObserver
useEffect(() => {
  const observer = new ResizeObserver(() => {
    chart.resize();
  });
  observer.observe(containerRef.current);
  return () => observer.disconnect();
}, []);
```

### Issue: Layout shift on mobile
```css
/* Solution: Reserve space for content */
.chart-container {
  min-height: 300px; /* Prevents CLS */
  aspect-ratio: 16 / 9; /* OR use fixed height */
}
```

### Issue: Sidebar flicker on collapse
```css
/* Solution: Use transform instead of width */
.sidebar {
  width: 280px;
  transform: scale(1);
  transform-origin: left;
}
.sidebar.collapsed {
  transform: scaleX(0.23); /* 64/280 = 0.23 */
}
```

---

## Resources

### Documentation
- Full Research: `/docs/website/LAYOUT_RESEARCH.md`
- Memory: `swarm/website/layout-*` keys

### Libraries
- TailwindCSS: https://tailwindcss.com
- Radix UI: https://radix-ui.com
- Lightweight Charts: https://tradingview.github.io/lightweight-charts/
- TanStack Virtual: https://tanstack.com/virtual

### Tools
- Figma: Design mockups
- Lighthouse: Performance audits
- axe DevTools: Accessibility testing
- BrowserStack: Cross-device testing

---

**Quick Reference Version 1.0**
**Last Updated: 2025-10-10**
**LAYOUT - Web Architect Division**
