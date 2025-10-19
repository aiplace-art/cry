# Private Sale Dashboard - Visual Design Guide

**Version:** 1.0.0
**Last Updated:** 2025-10-18
**Style:** BNB Chain (Binance Smart Chain)

---

## Design Philosophy

The HypeAI Private Sale Dashboard follows the **BNB Chain design language** - professional, trustworthy, and powerful. The design balances crypto-native aesthetics with mainstream usability.

### Core Principles

1. **Trust & Transparency** - Clear information hierarchy, honest communication
2. **Power & Performance** - Fast, responsive, professional
3. **Accessibility** - Usable by everyone, regardless of technical expertise
4. **Consistency** - Predictable patterns and interactions

---

## 1. Color System

### 1.1 Primary Palette

```css
/* BNB Gold - Primary Brand Color */
--bnb-gold: #F3BA2F;
--bnb-gold-light: #FFD54F;
--bnb-gold-dark: #C79100;

/* Usage */
.btn-primary {
  background: linear-gradient(135deg, #F3BA2F 0%, #FFD54F 100%);
}

.text-brand {
  color: #F3BA2F;
}
```

**When to use:**
- Primary action buttons
- Brand elements (logo, highlights)
- Important notifications
- Success states (with green undertone)

### 1.2 Neutral Palette

```css
/* Dark Mode (Primary) */
--dark-900: #0B0E11;  /* Deep backgrounds */
--dark-800: #1E2329;  /* Card backgrounds */
--dark-700: #2B3139;  /* Borders, dividers */
--dark-600: #474D57;  /* Disabled states */

/* Light Mode (Secondary) */
--light-100: #FAFAFA; /* Light backgrounds */
--light-200: #EAECEF; /* Card backgrounds */
--light-300: #C7CCD3; /* Borders */
--light-400: #848E9C; /* Secondary text */

/* Text */
--text-primary: #FFFFFF;   /* Main text (dark mode) */
--text-secondary: #848E9C; /* Secondary text */
--text-tertiary: #474D57;  /* Tertiary text */
```

### 1.3 Semantic Colors

```css
/* Status Colors */
--success: #0ECB81;  /* Success, positive change */
--error: #F6465D;    /* Errors, negative change */
--warning: #F0B90B;  /* Warnings, alerts */
--info: #3DCFCF;     /* Information, tips */

/* Chart Colors */
--chart-1: #0ECB81;  /* Primary data */
--chart-2: #F6465D;  /* Secondary data */
--chart-3: #3DCFCF;  /* Tertiary data */
--chart-4: #B47AFF;  /* Additional data */
--chart-5: #F0B90B;  /* Additional data */
```

### 1.4 Color Usage Examples

```tsx
// Success Card
<div className="bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-6">
  <div className="text-green-400 font-semibold">Transaction Successful</div>
</div>

// Gold Card (Brand)
<div className="bg-gradient-to-r from-[#F3BA2F]/10 to-[#FFD54F]/5 border border-[#F3BA2F]/30 rounded-xl p-6">
  <div className="text-[#F3BA2F] font-bold">Premium Feature</div>
</div>

// Dark Card
<div className="bg-[#1E2329] border border-[#2B3139] rounded-xl p-6">
  <div className="text-white">Regular Content</div>
</div>
```

---

## 2. Typography

### 2.1 Font Family

```css
/* Primary Font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Monospace (for numbers, addresses) */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.font-mono {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
}
```

### 2.2 Type Scale

```css
/* Headings */
.text-5xl { font-size: 3rem; line-height: 1.1; }     /* 48px - Page titles */
.text-4xl { font-size: 2.25rem; line-height: 1.2; }  /* 36px - Section titles */
.text-3xl { font-size: 1.875rem; line-height: 1.25; }/* 30px - Card titles */
.text-2xl { font-size: 1.5rem; line-height: 1.3; }   /* 24px - Subsections */
.text-xl { font-size: 1.25rem; line-height: 1.4; }   /* 20px - Large text */

/* Body Text */
.text-lg { font-size: 1.125rem; line-height: 1.5; }  /* 18px - Large body */
.text-base { font-size: 1rem; line-height: 1.5; }    /* 16px - Regular body */
.text-sm { font-size: 0.875rem; line-height: 1.5; }  /* 14px - Small text */
.text-xs { font-size: 0.75rem; line-height: 1.5; }   /* 12px - Captions */
```

### 2.3 Font Weights

```css
.font-normal { font-weight: 400; }    /* Regular text */
.font-medium { font-weight: 500; }    /* Labels, menu items */
.font-semibold { font-weight: 600; }  /* Emphasis, buttons */
.font-bold { font-weight: 700; }      /* Headings, numbers */
```

### 2.4 Typography Examples

```tsx
// Page Title
<h1 className="text-5xl font-bold text-white mb-6">
  Private Sale Dashboard
</h1>

// Section Title
<h2 className="text-3xl font-bold text-white mb-4">
  Your Portfolio
</h2>

// Card Title
<h3 className="text-xl font-semibold text-white mb-2">
  Total Investment
</h3>

// Body Text
<p className="text-base text-gray-400 mb-4">
  Your tokens will unlock according to the vesting schedule.
</p>

// Numbers/Amounts
<div className="text-4xl font-bold font-mono text-[#F3BA2F]">
  $234,567.89
</div>

// Wallet Address
<span className="text-sm font-mono text-gray-400">
  0x1234...5678
</span>
```

---

## 3. Spacing & Layout

### 3.1 Spacing Scale

```css
/* Spacing Units (4px base) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### 3.2 Container Widths

```css
/* Max Width Containers */
.container-sm { max-width: 640px; }   /* Small content */
.container-md { max-width: 768px; }   /* Medium content */
.container-lg { max-width: 1024px; }  /* Large content */
.container-xl { max-width: 1280px; }  /* Extra large */
.container-2xl { max-width: 1536px; } /* Full width */
```

### 3.3 Grid System

```tsx
// 4-Column Stats Grid (Desktop)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatsCard />
  <StatsCard />
  <StatsCard />
  <StatsCard />
</div>

// 2-Column Layout
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <div>Left Column</div>
  <div>Right Column</div>
</div>

// Sidebar Layout
<div className="flex gap-6">
  <aside className="w-64 flex-shrink-0">Sidebar</aside>
  <main className="flex-1">Main Content</main>
</div>
```

---

## 4. Components

### 4.1 Buttons

#### Primary Button (Gold)

```tsx
<button className="
  px-6 py-3
  bg-gradient-to-r from-[#F3BA2F] to-[#FFD54F]
  hover:from-[#C79100] hover:to-[#F3BA2F]
  text-black font-semibold
  rounded-xl
  shadow-lg hover:shadow-xl
  transition-all duration-200
  active:scale-95
">
  Buy Tokens
</button>
```

**Preview:**
```
┌─────────────────┐
│   Buy Tokens    │ ← Gold gradient background
└─────────────────┘   Black text, rounded corners
```

#### Secondary Button (Outlined)

```tsx
<button className="
  px-6 py-3
  border-2 border-[#F3BA2F]
  text-[#F3BA2F]
  rounded-xl
  hover:bg-[#F3BA2F]/10
  transition-all duration-200
  active:scale-95
">
  View Details
</button>
```

#### Ghost Button

```tsx
<button className="
  px-6 py-3
  text-gray-400
  hover:text-white hover:bg-white/5
  rounded-xl
  transition-all duration-200
">
  Cancel
</button>
```

### 4.2 Cards

#### Basic Card

```tsx
<div className="
  bg-[#1E2329]
  border border-[#2B3139]
  rounded-2xl
  p-6
  hover:border-[#F3BA2F]/50
  transition-all duration-200
">
  <h3 className="text-xl font-semibold text-white mb-2">
    Card Title
  </h3>
  <p className="text-gray-400">
    Card content goes here
  </p>
</div>
```

**Preview:**
```
╔═══════════════════════════╗
║  Card Title               ║
║                           ║
║  Card content goes here   ║
╚═══════════════════════════╝
Dark background, light border
```

#### Stats Card (Gold Accent)

```tsx
<div className="
  bg-gradient-to-br from-[#1E2329] to-[#2B3139]
  border border-[#F3BA2F]/30
  rounded-2xl
  p-6
  relative
  overflow-hidden
">
  {/* Gold accent line */}
  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F3BA2F] to-[#FFD54F]" />

  <div className="text-sm text-gray-400 mb-2">Total Investment</div>
  <div className="text-4xl font-bold text-white mb-1">$234,567</div>
  <div className="flex items-center gap-2 text-sm">
    <span className="text-green-400">↑ 12.5%</span>
    <span className="text-gray-500">vs last month</span>
  </div>
</div>
```

**Preview:**
```
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔ ← Gold accent
Total Investment
$234,567
↑ 12.5% vs last month
```

### 4.3 Inputs

#### Text Input

```tsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-400">
    Amount in USD
  </label>
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
      $
    </span>
    <input
      type="number"
      placeholder="0.00"
      className="
        w-full
        pl-10 pr-4 py-4
        bg-[#1E2329]
        border-2 border-[#2B3139]
        focus:border-[#F3BA2F]
        rounded-xl
        text-white text-lg font-semibold
        placeholder:text-gray-600
        outline-none
        transition-colors
      "
    />
  </div>
  <p className="text-xs text-gray-500">
    Min: $50 • Max: $500
  </p>
</div>
```

### 4.4 Badges

```tsx
// Status Badges
<span className="
  inline-flex items-center gap-1
  px-3 py-1
  bg-green-500/20
  border border-green-500/50
  text-green-400 text-xs font-semibold
  rounded-full
">
  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
  Active
</span>

// Bonus Badge
<span className="
  px-3 py-1
  bg-gradient-to-r from-[#F3BA2F]/20 to-[#FFD54F]/10
  border border-[#F3BA2F]/50
  text-[#F3BA2F] text-sm font-bold
  rounded-lg
">
  +30% Bonus
</span>
```

### 4.5 Progress Bars

```tsx
// Vesting Progress
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span className="text-gray-400">Vesting Progress</span>
    <span className="text-white font-semibold">40%</span>
  </div>
  <div className="h-3 bg-[#2B3139] rounded-full overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-[#F3BA2F] to-[#FFD54F] rounded-full transition-all duration-500"
      style={{ width: '40%' }}
    >
      <div className="h-full bg-white/20 animate-pulse" />
    </div>
  </div>
  <div className="flex justify-between text-xs text-gray-500">
    <span>0 HYPE</span>
    <span>1,000,000 HYPE</span>
  </div>
</div>
```

**Preview:**
```
Vesting Progress          40%
▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░
0 HYPE           1,000,000 HYPE
```

---

## 5. Icons & Illustrations

### 5.1 Icon Library

**Recommended:** Lucide React (lucide-react)

```tsx
import {
  Wallet,
  TrendingUp,
  Clock,
  Shield,
  Users,
  Settings,
  ChevronRight
} from 'lucide-react';

// Usage
<TrendingUp className="w-5 h-5 text-green-400" />
```

### 5.2 Icon Sizes

```css
.icon-xs { width: 12px; height: 12px; }  /* Inline icons */
.icon-sm { width: 16px; height: 16px; }  /* Small icons */
.icon-md { width: 20px; height: 20px; }  /* Default size */
.icon-lg { width: 24px; height: 24px; }  /* Large icons */
.icon-xl { width: 32px; height: 32px; }  /* Extra large */
```

### 5.3 Crypto Icons

```tsx
// BNB Icon
<div className="w-8 h-8 rounded-full bg-[#F3BA2F] flex items-center justify-center">
  <span className="text-black font-bold text-sm">B</span>
</div>

// HYPE Token Icon
<div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F3BA2F] to-[#FFD54F] flex items-center justify-center">
  <span className="text-black font-bold text-sm">H</span>
</div>
```

---

## 6. Animations & Transitions

### 6.1 Standard Transitions

```css
/* All transitions */
.transition-all { transition: all 200ms ease; }

/* Specific properties */
.transition-colors { transition: color, background-color, border-color 200ms ease; }
.transition-transform { transition: transform 200ms ease; }
.transition-opacity { transition: opacity 200ms ease; }
```

### 6.2 Hover Effects

```tsx
// Card Hover
<div className="
  transition-all duration-200
  hover:transform hover:scale-[1.02]
  hover:shadow-2xl
  hover:border-[#F3BA2F]/50
">
  Card Content
</div>

// Button Hover
<button className="
  transition-all duration-200
  hover:shadow-xl
  active:scale-95
">
  Click Me
</button>
```

### 6.3 Loading Animations

```tsx
// Skeleton Loader
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-700 rounded w-3/4" />
  <div className="h-4 bg-gray-700 rounded w-1/2" />
</div>

// Spinner
<div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-700 border-t-[#F3BA2F]" />

// Pulse (Live Indicator)
<div className="relative">
  <div className="w-3 h-3 bg-green-500 rounded-full" />
  <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
</div>
```

### 6.4 Number Counter Animation

```tsx
import { useSpring, animated } from '@react-spring/web';

function AnimatedNumber({ value }: { value: number }) {
  const { number } = useSpring({
    from: { number: 0 },
    to: { number: value },
    config: { duration: 1000 }
  });

  return (
    <animated.div className="text-4xl font-bold text-white">
      {number.to(n => n.toFixed(2))}
    </animated.div>
  );
}
```

---

## 7. Responsive Design

### 7.1 Breakpoints

```tsx
// Tailwind Breakpoints
sm: '640px'   // Small devices (landscape phones)
md: '768px'   // Medium devices (tablets)
lg: '1024px'  // Large devices (laptops)
xl: '1280px'  // Extra large devices (desktops)
2xl: '1536px' // 2X large devices (large desktops)
```

### 7.2 Responsive Patterns

#### Mobile-First Approach

```tsx
// Stack on mobile, side-by-side on desktop
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

// Hide sidebar on mobile
<aside className="hidden lg:block w-64">
  Sidebar
</aside>

// Adjust text size
<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
  Responsive Title
</h1>

// Padding adjustments
<div className="px-4 md:px-6 lg:px-8">
  Content
</div>
```

---

## 8. Dark Mode (Default)

The dashboard uses **dark mode as default** with an optional light mode toggle.

```tsx
// Dark Mode (Default)
<div className="bg-[#0B0E11] text-white">
  <div className="bg-[#1E2329] border border-[#2B3139]">
    Dark mode content
  </div>
</div>

// Light Mode (Optional)
<div className="dark:bg-[#0B0E11] bg-white dark:text-white text-gray-900">
  <div className="dark:bg-[#1E2329] bg-gray-50 dark:border-[#2B3139] border-gray-200">
    Adaptive content
  </div>
</div>
```

---

## 9. Accessibility

### 9.1 ARIA Labels

```tsx
// Button with icon
<button aria-label="Close modal">
  <X className="w-5 h-5" />
</button>

// Interactive card
<div
  role="button"
  tabIndex={0}
  aria-label="View purchase details"
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Card Content
</div>
```

### 9.2 Focus States

```css
/* Custom focus ring (gold) */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-[#F3BA2F] focus:ring-offset-2 focus:ring-offset-[#0B0E11];
}
```

### 9.3 Color Contrast

All text meets **WCAG AA** standards:
- White text on dark backgrounds: 15.6:1
- Gray text (#848E9C) on dark: 4.8:1
- Gold (#F3BA2F) on dark: 7.2:1

---

## 10. Code Examples

### 10.1 Complete Stats Card Component

```tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon: React.ReactNode;
}

export function StatsCard({ title, value, change, icon }: StatsCardProps) {
  return (
    <div className="
      bg-gradient-to-br from-[#1E2329] to-[#2B3139]
      border border-[#2B3139]
      hover:border-[#F3BA2F]/50
      rounded-2xl
      p-6
      transition-all duration-200
      hover:transform hover:scale-[1.02]
      relative
      overflow-hidden
    ">
      {/* Gold accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F3BA2F] to-[#FFD54F]" />

      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-[#F3BA2F]/10 flex items-center justify-center mb-4">
        <div className="text-[#F3BA2F]">
          {icon}
        </div>
      </div>

      {/* Title */}
      <div className="text-sm text-gray-400 mb-2">
        {title}
      </div>

      {/* Value */}
      <div className="text-3xl font-bold text-white mb-2">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>

      {/* Change indicator */}
      {change && (
        <div className="flex items-center gap-2">
          <span className={
            change.direction === 'up'
              ? 'text-green-400'
              : 'text-red-400'
          }>
            {change.direction === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
          </span>
          <span className="text-gray-500 text-sm">vs last period</span>
        </div>
      )}
    </div>
  );
}
```

### 10.2 Complete Purchase Button

```tsx
interface PurchaseButtonProps {
  amount: number;
  tokens: number;
  onPurchase: () => Promise<void>;
  disabled?: boolean;
}

export function PurchaseButton({ amount, tokens, onPurchase, disabled }: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onPurchase();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className="
        w-full
        px-6 py-5
        bg-gradient-to-r from-[#F3BA2F] to-[#FFD54F]
        hover:from-[#C79100] hover:to-[#F3BA2F]
        disabled:from-gray-600 disabled:to-gray-700
        text-black font-bold text-lg
        rounded-xl
        shadow-lg hover:shadow-xl
        transition-all duration-200
        active:scale-95
        disabled:cursor-not-allowed
        flex items-center justify-center gap-3
      "
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-3 border-black border-t-transparent" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <span>Buy {tokens.toLocaleString()} HYPE for ${amount}</span>
          <ChevronRight className="w-5 h-5" />
        </>
      )}
    </button>
  );
}
```

---

## 11. Design Resources

### 11.1 Figma Files

```
HypeAI Dashboard Design System
├── Colors.fig
├── Typography.fig
├── Components.fig
├── Layouts.fig
└── Icons.fig
```

### 11.2 Asset Export Specs

**Icons:**
- Format: SVG
- Size: 24x24px (default)
- Stroke: 2px
- Color: Inherit from CSS

**Images:**
- Format: WebP (with PNG fallback)
- Max width: 1920px
- Compression: 85%
- Lazy loading: enabled

### 11.3 Brand Assets

```
/public/assets/
├── logo-full.svg          # Full logo with text
├── logo-icon.svg          # Icon only
├── logo-gold.svg          # Gold variant
└── favicon/
    ├── favicon-16x16.png
    ├── favicon-32x32.png
    └── apple-touch-icon.png
```

---

## 12. Performance Guidelines

### 12.1 CSS Best Practices

```css
/* Use Tailwind utilities */
✅ <div className="bg-[#1E2329] p-6 rounded-xl">

/* Avoid inline styles when possible */
❌ <div style={{ backgroundColor: '#1E2329', padding: '24px' }}>

/* Use CSS variables for theme values */
✅ <div style={{ color: 'var(--bnb-gold)' }}>
```

### 12.2 Image Optimization

```tsx
import Image from 'next/image';

// Optimized image loading
<Image
  src="/assets/banner.webp"
  alt="Dashboard banner"
  width={1200}
  height={400}
  priority={false}
  loading="lazy"
  placeholder="blur"
/>
```

---

## Conclusion

This design guide ensures consistency across the entire Private Sale Dashboard. All components should follow these patterns to maintain the professional BNB Chain aesthetic.

**Key Takeaways:**
- Always use the BNB gold (#F3BA2F) for brand elements
- Dark mode is default, light mode is optional
- Maintain consistent spacing and typography
- Prioritize accessibility and performance
- Test on all breakpoints (mobile, tablet, desktop)

**Next Steps:**
1. Review design guide with team
2. Create Figma component library
3. Build Storybook for component preview
4. Implement design system in code

---

**Document Control:**
- **Author:** UI/UX Designer
- **Status:** Approved
- **Last Review:** 2025-10-18
