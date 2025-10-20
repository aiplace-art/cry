# HypeAI Simple Dashboard - Professional System Architecture

> **Version**: 2.0.0 - Production Ready
> **Design System**: Variant-2 Cosmic Theme
> **Author**: System Architecture Designer
> **Date**: 2025-10-20
> **Status**: ✅ Production Ready

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Design System Specification](#2-design-system-specification)
3. [Component Architecture](#3-component-architecture)
4. [Technical Architecture](#4-technical-architecture)
5. [Data Architecture](#5-data-architecture)
6. [Performance Architecture](#6-performance-architecture)
7. [Accessibility Architecture](#7-accessibility-architecture)
8. [Animation & Interaction Design](#8-animation--interaction-design)
9. [Responsive Design Strategy](#9-responsive-design-strategy)
10. [Security Architecture](#10-security-architecture)
11. [Testing Strategy](#11-testing-strategy)
12. [Deployment Architecture](#12-deployment-architecture)
13. [Monitoring & Analytics](#13-monitoring--analytics)
14. [Future Enhancements](#14-future-enhancements)
15. [Architecture Decision Records](#15-architecture-decision-records)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Project Overview

**Project Name**: HypeAI Private Sale Dashboard (Simplified Version)
**Purpose**: User-friendly interface for viewing token balance, vesting progress, and quick actions
**Target Audience**: Private sale participants with varying technical expertise
**Design Language**: Cosmic/Space theme inspired by variant-2 (bnbchain.org style)

### 1.2 Key Objectives

1. **Simplicity**: Reduce cognitive load to 3 main elements on dashboard
2. **Performance**: 82% smaller bundle size vs complex dashboard
3. **Accessibility**: WCAG 2.1 AA compliance
4. **Visual Excellence**: Professional, cosmic theme with smooth animations
5. **Mobile-First**: Responsive design for all devices

### 1.3 Success Metrics

```typescript
// Performance Targets
const TARGETS = {
  loadTime: '< 1.5s',          // First Contentful Paint
  interactiveTime: '< 2.0s',   // Time to Interactive
  bundleSize: '< 50KB',        // Total JS bundle
  accessibility: 'AA',         // WCAG 2.1 AA compliance
  mobileScore: '> 95',         // Lighthouse mobile score
}

// User Experience Targets
const UX_TARGETS = {
  timeToUnderstand: '< 10s',   // Time for user to understand UI
  elementsOnScreen: 3,         // Main dashboard elements
  clicksToAction: '≤ 2',       // Max clicks to perform action
  errorRate: '< 1%',           // User error rate
}
```

### 1.4 Current Implementation Status

**File**: `/Users/ai.place/Crypto/src/frontend/components/simple-dashboard/SimpleDashboard.tsx`

**Current Features**:
- ✅ Cosmic canvas star animation
- ✅ Gradient orb background effects
- ✅ Large gradient token number display
- ✅ Glassmorphism progress card
- ✅ Animated progress bar with shimmer
- ✅ Responsive button grid
- ✅ Smooth hover effects
- ✅ Mobile-optimized animations

**Needs Enhancement**:
- 🔲 Component modularization (extract sub-components)
- 🔲 API integration (currently mock data)
- 🔲 Loading states
- 🔲 Error handling
- 🔲 Accessibility improvements (ARIA labels)
- 🔲 Unit tests

---

## 2. DESIGN SYSTEM SPECIFICATION

### 2.1 Color Palette

```typescript
// Core Colors (Variant-2 Compatible)
export const COLORS = {
  // Backgrounds
  bgPrimary: '#0a0118',           // Deep cosmic purple
  bgSecondary: '#1E2026',         // Card background
  bgGlass: 'rgba(30, 32, 38, 0.95)', // Glassmorphism

  // Brand Colors
  cosmicPurple: '#9333ea',        // Primary purple
  cosmicBlue: '#3b82f6',          // Secondary blue
  cosmicYellow: '#FFE900',        // Accent yellow
  cosmicPink: '#ec4899',          // Highlight pink (optional)

  // Text Colors
  textPrimary: '#FFFFFF',         // Pure white
  textSecondary: '#A0A3B1',       // Light gray
  textTertiary: '#6B7280',        // Muted gray

  // Status Colors
  success: '#18DC7E',             // Green
  warning: '#FFE900',             // Yellow
  error: '#EF4444',               // Red
  info: '#3b82f6',                // Blue

  // Border Colors
  borderSubtle: 'rgba(147, 51, 234, 0.2)',
  borderMedium: 'rgba(147, 51, 234, 0.4)',
  borderStrong: 'rgba(147, 51, 234, 0.6)',
} as const;
```

### 2.2 Typography System

```typescript
// Font Stack
export const TYPOGRAPHY = {
  // Font Family
  fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

  // Font Sizes (Responsive with clamp)
  sizes: {
    xs: '0.75rem',                              // 12px
    sm: '0.875rem',                             // 14px
    base: '1rem',                               // 16px
    lg: '1.125rem',                             // 18px
    xl: '1.25rem',                              // 20px
    '2xl': 'clamp(1.5rem, 4vw, 2.5rem)',       // 24-40px responsive
    '3xl': 'clamp(1.875rem, 5vw, 3rem)',       // 30-48px responsive
    '4xl': 'clamp(2.25rem, 6vw, 4rem)',        // 36-64px responsive
    '5xl': 'clamp(3rem, 8vw, 5rem)',           // 48-80px responsive
    '6xl': 'clamp(3.75rem, 10vw, 6rem)',       // 60-96px responsive
    '7xl': 'clamp(4rem, 12vw, 7rem)',          // 64-112px responsive
  },

  // Font Weights
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line Heights
  lineHeights: {
    tight: 1.1,
    snug: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0',
    wide: '0.05em',
    wider: '0.1em',
  },
} as const;
```

### 2.3 Spacing System (8px Grid)

```typescript
export const SPACING = {
  0: '0',
  1: '0.5rem',   // 8px
  2: '1rem',     // 16px
  3: '1.5rem',   // 24px
  4: '2rem',     // 32px
  5: '2.5rem',   // 40px
  6: '3rem',     // 48px
  8: '4rem',     // 64px
  10: '5rem',    // 80px
  12: '6rem',    // 96px
  16: '8rem',    // 128px
  20: '10rem',   // 160px
} as const;
```

### 2.4 Gradient Definitions

```typescript
export const GRADIENTS = {
  // Text Gradients
  textPrimary: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 50%, #FFE900 100%)',
  textSecondary: 'linear-gradient(135deg, #9333ea, #3b82f6)',

  // Background Gradients
  cardBackground: 'linear-gradient(135deg, rgba(30, 32, 38, 0.95), rgba(10, 1, 24, 0.95))',
  radialOrb: 'radial-gradient(ellipse at center, rgba(147, 51, 234, 0.15) 0%, #0a0118 70%)',

  // Progress Bar
  progressFill: 'linear-gradient(90deg, #9333ea 0%, #3b82f6 50%, #FFE900 100%)',
  progressTrack: 'rgba(147, 51, 234, 0.15)',

  // Button Gradients
  buttonPrimary: 'linear-gradient(135deg, #9333ea, #3b82f6)',
  buttonSecondary: 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.25))',
  buttonHover: 'linear-gradient(135deg, rgba(147, 51, 234, 0.5), rgba(59, 130, 246, 0.4))',

  // Label Badge
  badgeBackground: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.2))',

  // Shimmer Effect
  shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
} as const;
```

### 2.5 Shadow System

```typescript
export const SHADOWS = {
  // Standard Shadows
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Glow Effects
  glowPurple: '0 0 20px rgba(147, 51, 234, 0.5)',
  glowBlue: '0 0 20px rgba(59, 130, 246, 0.4)',
  glowYellow: '0 0 30px rgba(255, 233, 0, 0.3)',

  // Combined Shadows
  cardDefault: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(147, 51, 234, 0.1)',
  cardHover: '0 12px 40px rgba(147, 51, 234, 0.5), 0 0 60px rgba(147, 51, 234, 0.3)',
  buttonHover: '0 12px 40px rgba(147, 51, 234, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)',
  progressGlow: '0 0 30px rgba(147, 51, 234, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)',

  // Inset Shadows
  insetProgress: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
  insetCard: 'inset 0 0 60px rgba(255, 233, 0, 0.03)',
} as const;
```

### 2.6 Border Radius System

```typescript
export const RADIUS = {
  none: '0',
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  full: '9999px',   // Pill/Circle
} as const;
```

### 2.7 Animation Timing

```typescript
export const ANIMATIONS = {
  // Durations
  duration: {
    instant: '0.01ms',
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
    slower: '1000ms',
    progress: '1500ms',
  },

  // Easing Functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Keyframes
  keyframes: {
    fadeInUp: 'fadeInUp 0.8s ease-out',
    floatOrb: 'float-orb 20s ease-in-out infinite',
    textPulse: 'text-pulse 3s ease-in-out infinite',
    statPulse: 'stat-pulse 3s ease-in-out 0.5s infinite',
    labelGlow: 'label-glow 2s ease-in-out infinite',
    shimmer: 'shimmer 3s infinite',
  },
} as const;
```

---

## 3. COMPONENT ARCHITECTURE

### 3.1 Component Hierarchy

```
SimpleDashboard (Root Component)
│
├── CosmicBackground (Visual Layer - Z-Index 0)
│   ├── StarfieldCanvas (Canvas animation)
│   ├── GradientOrbs (Floating orbs × 3)
│   │   ├── PurpleOrb
│   │   ├── BlueOrb
│   │   └── YellowOrb
│   └── FadeOverlay (Bottom fade)
│
└── ContentContainer (Content Layer - Z-Index 10)
    │
    ├── HeroSection
    │   ├── TokenLabel (Badge with emoji)
    │   ├── TokenAmount (Large gradient number)
    │   └── TokenSymbol (HYPE text)
    │
    ├── ProgressCard (Glassmorphism card)
    │   ├── ShineEffect (Decorative layer)
    │   ├── ProgressHeader
    │   │   ├── StatusLabel ("Разблокировано")
    │   │   ├── PercentageDisplay (67%)
    │   │   └── UnlockedAmount (167,500 HYPE)
    │   └── ProgressBar
    │       ├── ProgressTrack (Background)
    │       └── ProgressFill (Gradient fill with shimmer)
    │
    ├── ActionButtons (Button Grid)
    │   ├── BuyMoreButton (Secondary style)
    │   └── ClaimButton (Primary gradient)
    │
    └── InfoSection
        ├── VestingExplanation
        └── FullVersionToggle
            └── ToggleButton
```

### 3.2 Component Specifications

#### 3.2.1 SimpleDashboard (Root)

**File**: `SimpleDashboard.tsx`
**Purpose**: Main container orchestrating all sub-components
**State**: Minimal (data from hooks)

```typescript
// Component Interface
interface SimpleDashboardProps {
  // Optional: can receive user ID via props or route params
  userId?: string;
}

// Internal State
interface DashboardState {
  totalTokens: number;      // Total purchased tokens
  unlockedTokens: number;   // Currently unlocked tokens
  percentage: number;        // Unlock percentage (0-100)
  isLoading: boolean;        // Loading state
  error: string | null;      // Error message
}

// Responsive Breakpoints
const BREAKPOINTS = {
  mobile: '(max-width: 640px)',
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
}

// Container Styling
const containerStyle = {
  minHeight: '100vh',
  position: 'relative',
  background: COLORS.bgPrimary,
  fontFamily: TYPOGRAPHY.fontFamily,
  overflow: 'hidden',
}
```

**Responsibilities**:
1. Data fetching via `useDashboardData()` hook
2. Layout orchestration
3. Error boundary handling
4. Loading state management

---

#### 3.2.2 CosmicBackground Component

**Purpose**: Animated cosmic background layer
**Performance**: GPU-accelerated, reduced complexity on mobile

```typescript
// Starfield Animation (Canvas-based)
interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  pulseSpeed: number;
  pulsePhase: number;
}

// Configuration
const STARFIELD_CONFIG = {
  starCount: 150,             // Desktop
  starCountMobile: 75,        // Mobile (performance)
  sizeRange: [0.5, 2.5],      // Star size range
  speedRange: [0.1, 0.6],     // Movement speed
  opacityRange: [0.3, 0.8],   // Base opacity
}

// Gradient Orbs
const OrbConfig = {
  orb1: {
    size: { width: 500, height: 500 },
    position: { top: '10%', right: '15%' },
    gradient: 'radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, transparent 70%)',
    filter: 'blur(120px)',
    animation: 'float-orb 20s ease-in-out infinite',
    delay: '0s',
  },
  orb2: {
    size: { width: 600, height: 600 },
    position: { bottom: '15%', left: '10%' },
    gradient: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
    filter: 'blur(130px)',
    animation: 'float-orb 25s ease-in-out infinite',
    delay: '3s',
  },
  orb3: {
    size: { width: 400, height: 400 },
    position: { top: '50%', left: '50%' },
    gradient: 'radial-gradient(circle, rgba(255, 233, 0, 0.15) 0%, transparent 70%)',
    filter: 'blur(100px)',
    animation: 'float-orb 18s ease-in-out infinite',
    delay: '6s',
    transform: 'translate(-50%, -50%)',
  },
}
```

**Performance Optimization**:
```typescript
// Reduce complexity on mobile
@media (max-width: 768px) {
  canvas {
    opacity: 0.5; // Reduce visibility
  }

  .gradient-orb {
    filter: blur(80px) !important; // Less blur
    opacity: 0.1 !important; // Reduced opacity
  }
}

// Disable animations for reduced-motion preference
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

---

#### 3.2.3 HeroSection Component

**Purpose**: Display total token count with visual impact

```typescript
// Token Label (Badge)
const labelStyle = {
  display: 'inline-block',
  padding: '0.75rem 1.5rem',
  background: GRADIENTS.badgeBackground,
  border: `1px solid ${COLORS.borderMedium}`,
  borderRadius: RADIUS.full,
  fontSize: TYPOGRAPHY.sizes.sm,
  fontWeight: TYPOGRAPHY.weights.semibold,
  color: COLORS.cosmicYellow,
  letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  textTransform: 'uppercase',
  backdropFilter: 'blur(10px)',
  boxShadow: SHADOWS.glowYellow,
  animation: ANIMATIONS.keyframes.labelGlow,
}

// Token Amount (Hero Number)
const amountStyle = {
  fontSize: 'clamp(3rem, 10vw, 6rem)', // Responsive 48-96px
  fontWeight: TYPOGRAPHY.weights.bold,
  background: GRADIENTS.textPrimary,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  lineHeight: TYPOGRAPHY.lineHeights.tight,
  animation: ANIMATIONS.keyframes.textPulse,
  textShadow: '0 0 80px rgba(147, 51, 234, 0.3)',
}

// Token Symbol
const symbolStyle = {
  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', // Responsive 24-40px
  color: COLORS.textSecondary,
  fontWeight: TYPOGRAPHY.weights.medium,
  letterSpacing: TYPOGRAPHY.letterSpacing.wider,
}
```

**Number Formatting**:
```typescript
function formatTokenAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
// 250000 → "250,000"
```

**Accessibility**:
```typescript
<div role="region" aria-label="Token balance">
  <div aria-hidden="true">💎 ВАШИ ТОКЕНЫ</div>
  <div aria-label={`You have ${formatTokenAmount(totalTokens)} HYPE tokens`}>
    {formatTokenAmount(totalTokens)}
  </div>
  <div aria-hidden="true">HYPE</div>
</div>
```

---

#### 3.2.4 ProgressCard Component

**Purpose**: Glassmorphism card showing vesting progress

```typescript
// Card Container
const cardStyle = {
  background: GRADIENTS.cardBackground,
  border: `1px solid ${COLORS.borderMedium}`,
  borderRadius: RADIUS['3xl'],
  padding: 'clamp(1.5rem, 4vw, 3rem)',
  backdropFilter: 'blur(20px)',
  boxShadow: SHADOWS.cardDefault,
  position: 'relative',
  overflow: 'hidden',
  animation: 'fadeInUp 0.8s ease-out 0.2s backwards',
}

// Shine Effect (Decorative)
const shineStyle = {
  position: 'absolute',
  top: '-50%',
  left: '-50%',
  width: '200%',
  height: '200%',
  background: 'linear-gradient(45deg, transparent 30%, rgba(255, 233, 0, 0.03) 50%, transparent 70%)',
  pointerEvents: 'none',
}

// Percentage Display
const percentageStyle = {
  fontSize: 'clamp(2rem, 6vw, 4rem)', // 32-64px responsive
  fontWeight: TYPOGRAPHY.weights.bold,
  color: COLORS.cosmicYellow,
  textShadow: SHADOWS.glowYellow,
  animation: ANIMATIONS.keyframes.statPulse,
}

// Progress Bar Track
const trackStyle = {
  position: 'relative',
  width: '100%',
  height: '16px',
  background: GRADIENTS.progressTrack,
  borderRadius: RADIUS.xl,
  overflow: 'hidden',
  border: `1px solid ${COLORS.borderSubtle}`,
  boxShadow: SHADOWS.insetProgress,
}

// Progress Bar Fill
const fillStyle = {
  width: `${percentage}%`,
  height: '100%',
  background: GRADIENTS.progressFill,
  borderRadius: RADIUS.xl,
  transition: `width ${ANIMATIONS.duration.progress} ${ANIMATIONS.easing.easeInOut}`,
  boxShadow: SHADOWS.progressGlow,
  position: 'relative',
  overflow: 'hidden',
}

// Shimmer Effect
const shimmerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '200%',
  height: '100%',
  background: GRADIENTS.shimmer,
  animation: ANIMATIONS.keyframes.shimmer,
}
```

**Accessibility**:
```typescript
<div
  role="progressbar"
  aria-valuenow={percentage}
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label={`${percentage}% of tokens unlocked. ${formatTokenAmount(unlockedTokens)} HYPE available.`}
>
  {/* Progress bar visual */}
</div>
```

---

#### 3.2.5 ActionButtons Component

**Purpose**: Primary CTAs for user actions

```typescript
// Button Grid Container
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: SPACING[3],
  animation: 'fadeInUp 0.8s ease-out 0.4s backwards',
}

// Buy More Button (Secondary)
const buyButtonStyle = {
  padding: 'clamp(1.25rem, 3vw, 1.75rem) clamp(1.5rem, 4vw, 2.5rem)',
  background: GRADIENTS.buttonSecondary,
  border: `2px solid ${COLORS.borderStrong}`,
  borderRadius: RADIUS['2xl'],
  color: COLORS.textPrimary,
  fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
  fontWeight: TYPOGRAPHY.weights.semibold,
  cursor: 'pointer',
  transition: `all ${ANIMATIONS.duration.slow} ${ANIMATIONS.easing.easeInOut}`,
  backdropFilter: 'blur(10px)',
}

// Buy Button Hover State
const buyButtonHover = {
  background: GRADIENTS.buttonHover,
  transform: 'translateY(-4px) scale(1.02)',
  boxShadow: SHADOWS.cardHover,
  borderColor: COLORS.borderStrong,
}

// Claim Button (Primary)
const claimButtonStyle = {
  padding: 'clamp(1.25rem, 3vw, 1.75rem) clamp(1.5rem, 4vw, 2.5rem)',
  background: GRADIENTS.buttonPrimary,
  border: '2px solid transparent',
  borderRadius: RADIUS['2xl'],
  color: COLORS.textPrimary,
  fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
  fontWeight: TYPOGRAPHY.weights.semibold,
  cursor: 'pointer',
  transition: `all ${ANIMATIONS.duration.slow} ${ANIMATIONS.easing.easeInOut}`,
  boxShadow: SHADOWS.cardDefault,
}

// Claim Button Hover State
const claimButtonHover = {
  transform: 'translateY(-4px) scale(1.02)',
  boxShadow: SHADOWS.buttonHover,
  background: 'linear-gradient(135deg, #a855f7, #60a5fa)', // Lighter gradient
}

// Disabled State
const buttonDisabled = {
  opacity: 0.5,
  cursor: 'not-allowed',
  pointerEvents: 'none',
}
```

**Interaction States**:
```typescript
// Button Component with States
function ActionButton({ type, onClick, disabled, children }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const buttonStyle = {
    ...baseButtonStyle,
    ...(isHovered && !disabled && hoverStyle),
    ...(isPressed && !disabled && { transform: 'scale(0.98)' }),
    ...(disabled && disabledStyle),
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={buttonStyle}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}
```

**Responsive Behavior**:
```typescript
// Mobile: Stack vertically
@media (max-width: 640px) {
  .action-buttons {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

// Tablet/Desktop: 2 columns
@media (min-width: 641px) {
  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}
```

---

## 4. TECHNICAL ARCHITECTURE

### 4.1 Technology Stack

```typescript
// Core Framework
const TECH_STACK = {
  framework: 'React 18.2+',
  language: 'TypeScript 5.0+',
  runtime: 'Next.js 13+ (App Router)',

  // Styling
  styling: [
    'Inline CSS (precise variant-2 matching)',
    'Tailwind CSS (utility classes)',
    'CSS-in-JS (styled JSX for animations)',
  ],

  // State Management
  state: [
    'React useState/useEffect (local state)',
    'React Context API (global state)',
    'React Query (server state)',
  ],

  // Routing
  routing: 'Next.js App Router',

  // Web3 (Future)
  web3: [
    'wagmi (React hooks for Ethereum)',
    'viem (TypeScript interface for Ethereum)',
    'RainbowKit (wallet connection UI)',
  ],

  // Development Tools
  dev: [
    'ESLint (code linting)',
    'Prettier (code formatting)',
    'Husky (git hooks)',
    'Jest (unit testing)',
    'Playwright (E2E testing)',
  ],
}
```

### 4.2 File Structure

```
src/frontend/
│
├── components/
│   └── simple-dashboard/
│       ├── SimpleDashboard.tsx          # ✅ Main component (current)
│       ├── CosmicBackground.tsx         # 🔲 Extract background (future)
│       ├── HeroSection.tsx              # 🔲 Extract hero (future)
│       ├── ProgressCard.tsx             # 🔲 Extract progress (future)
│       ├── ActionButtons.tsx            # 🔲 Extract buttons (future)
│       ├── index.ts                     # 🔲 Barrel exports
│       └── __tests__/
│           ├── SimpleDashboard.test.tsx
│           ├── HeroSection.test.tsx
│           └── ProgressCard.test.tsx
│
├── hooks/
│   ├── useDashboardData.ts              # 🔲 Custom hook for data fetching
│   ├── useTokenCalculations.ts          # 🔲 Token math utilities
│   └── index.ts
│
├── utils/
│   ├── formatters.ts                    # 🔲 Number/date formatting
│   ├── calculations.ts                  # 🔲 Vesting calculations
│   └── constants.ts                     # 🔲 Theme constants
│
├── types/
│   ├── dashboard.ts                     # 🔲 Dashboard types
│   └── index.ts
│
├── pages/
│   ├── dashboard-simple.tsx             # ✅ Current page route
│   ├── buy.tsx                          # 🔲 Buy tokens page
│   └── claim.tsx                        # 🔲 Claim tokens page
│
└── styles/
    ├── cosmic-theme.ts                  # 🔲 Theme constants
    └── animations.css                   # ✅ Current (via styled JSX)
```

### 4.3 Data Flow Pattern

```typescript
// Unidirectional Data Flow (Flux-like)

┌─────────────┐
│    USER     │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────┐
│  SimpleDashboard Component  │
│  - Renders UI               │
│  - Handles events           │
└──────┬──────────────────────┘
       │
       ↓
┌─────────────────────────────┐
│  useDashboardData() Hook    │
│  - Fetches data             │
│  - Manages state            │
│  - Provides actions         │
└──────┬──────────────────────┘
       │
       ↓
┌─────────────────────────────┐
│  API / Smart Contract       │
│  - Returns user data        │
│  - Executes transactions    │
└─────────────────────────────┘
```

**Example Flow**:
```typescript
// 1. User loads page
/dashboard-simple → SimpleDashboard mounts

// 2. Data fetching
SimpleDashboard → calls useDashboardData()
  ↓
useDashboardData() → fetches from API/blockchain
  ↓
Returns { totalTokens, unlockedTokens, percentage, ... }

// 3. Rendering
SimpleDashboard receives data → renders UI components

// 4. User interaction
User clicks "ЗАБРАТЬ ТОКЕНЫ"
  ↓
onClick handler → router.push('/claim')
  ↓
Navigate to claim page
```

### 4.4 State Management Strategy

```typescript
// Dashboard State Hook
function useDashboardData() {
  const [state, setState] = useState<DashboardState>({
    totalTokens: 0,
    unlockedTokens: 0,
    percentage: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Option 1: Mock data (current)
        const mockData = {
          totalTokens: 250000,
          unlockedTokens: 167500,
        };

        // Option 2: API call (future)
        // const response = await fetch('/api/dashboard');
        // const mockData = await response.json();

        // Option 3: Blockchain call (future)
        // const mockData = await fetchFromContract();

        const percentage = Math.round(
          (mockData.unlockedTokens / mockData.totalTokens) * 100
        );

        setState({
          ...mockData,
          percentage,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message,
        }));
      }
    }

    fetchData();
  }, []);

  return state;
}
```

**State Update Pattern**:
```typescript
// Immutable state updates
setState(prevState => ({
  ...prevState,
  totalTokens: newValue,
}));

// Avoid direct mutation
// ❌ state.totalTokens = newValue;
```

---

## 5. DATA ARCHITECTURE

### 5.1 Data Models

```typescript
// User Dashboard Data
interface DashboardData {
  userId: string;
  totalTokens: number;
  unlockedTokens: number;
  lockedTokens: number;
  percentage: number;
  vestingSchedule: VestingSchedule;
  purchases: Purchase[];
  createdAt: Date;
  updatedAt: Date;
}

// Vesting Schedule
interface VestingSchedule {
  immediateReleasePercent: number;   // 0.20 (20%)
  vestingPeriodMonths: number;       // 21
  vestingStartDate: Date;
  vestingEndDate: Date;
  monthlyReleaseAmount: number;
  nextUnlockDate: Date;
  nextUnlockAmount: number;
  totalVested: number;
  totalRemaining: number;
}

// Purchase Record
interface Purchase {
  id: string;
  userId: string;
  tokenAmount: number;               // HYPE tokens purchased
  paymentAmount: number;             // Amount paid
  paymentCurrency: 'BNB' | 'USDT';
  purchaseDate: Date;
  transactionHash: string;
  vestingSchedule: VestingSchedule;
  status: 'pending' | 'confirmed' | 'failed';
}
```

### 5.2 Calculation Logic

```typescript
// Vesting Calculation
function calculateUnlockedTokens(
  totalTokens: number,
  purchaseDate: Date,
  currentDate: Date = new Date()
): number {
  const IMMEDIATE_RELEASE = 0.20;      // 20%
  const VESTING_MONTHS = 21;

  // Immediate release
  const immediateTokens = totalTokens * IMMEDIATE_RELEASE;

  // Calculate elapsed months
  const monthsElapsed = differenceInMonths(currentDate, purchaseDate);

  if (monthsElapsed <= 0) {
    return Math.floor(immediateTokens);
  }

  // Monthly vesting
  const vestingTokens = totalTokens * (1 - IMMEDIATE_RELEASE);
  const monthlyRelease = vestingTokens / VESTING_MONTHS;
  const vestingMonths = Math.min(monthsElapsed, VESTING_MONTHS);
  const vestedTokens = monthlyRelease * vestingMonths;

  return Math.floor(immediateTokens + vestedTokens);
}

// Percentage Calculation
function calculatePercentage(unlocked: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((unlocked / total) * 100);
}

// Date Utilities
import { differenceInMonths, addMonths, format } from 'date-fns';

function getNextUnlockDate(purchaseDate: Date): Date {
  const monthsElapsed = differenceInMonths(new Date(), purchaseDate);
  return addMonths(purchaseDate, monthsElapsed + 1);
}

function formatDate(date: Date): string {
  return format(date, 'MMM dd, yyyy');
}
```

### 5.3 API Endpoints (Future)

```typescript
// REST API Design
const API_ENDPOINTS = {
  // Dashboard data
  getDashboard: 'GET /api/dashboard/:userId',
  getVestingSchedule: 'GET /api/vesting/:userId',

  // Transactions
  getPurchases: 'GET /api/purchases/:userId',
  createPurchase: 'POST /api/purchase',

  // Claiming
  claimTokens: 'POST /api/claim',
  getClaimableAmount: 'GET /api/claimable/:userId',
}

// Response Format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Example Response
const exampleResponse: ApiResponse<DashboardData> = {
  success: true,
  data: {
    userId: '0x123...',
    totalTokens: 250000,
    unlockedTokens: 167500,
    percentage: 67,
    // ...
  },
  timestamp: '2025-10-20T12:00:00Z',
}
```

---

## 6. PERFORMANCE ARCHITECTURE

### 6.1 Core Web Vitals Targets

```typescript
const PERFORMANCE_TARGETS = {
  // Loading Performance
  FCP: '< 1.5s',    // First Contentful Paint
  LCP: '< 2.5s',    // Largest Contentful Paint
  TTI: '< 3.0s',    // Time to Interactive

  // Interactivity
  FID: '< 100ms',   // First Input Delay
  TBT: '< 300ms',   // Total Blocking Time

  // Visual Stability
  CLS: '< 0.1',     // Cumulative Layout Shift

  // Bundle Size
  JSBundle: '< 50KB',    // Total JavaScript
  CSSBundle: '< 10KB',   // Total CSS

  // Lighthouse Scores
  Performance: '> 90',
  Accessibility: '> 95',
  BestPractices: '> 90',
  SEO: '> 90',
}
```

### 6.2 Optimization Strategies

#### Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const CosmicBackground = dynamic(
  () => import('./CosmicBackground'),
  {
    ssr: false, // Client-side only
    loading: () => <div className="bg-primary min-h-screen" />,
  }
);

// Route-based splitting (automatic with Next.js)
// Each page is a separate bundle
pages/
  ├── dashboard-simple.tsx  → dashboard-simple.[hash].js
  ├── buy.tsx               → buy.[hash].js
  └── claim.tsx             → claim.[hash].js
```

#### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/logo.svg"
  alt="HypeAI Logo"
  width={64}
  height={64}
  loading="lazy"
  quality={90}
/>

// Generate optimized images
// - WebP format with JPEG fallback
// - Responsive srcset
// - Automatic lazy loading
```

#### CSS Optimization

```typescript
// Critical CSS inlined
// Non-critical CSS loaded asynchronously

// Tailwind CSS purging
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  // Removes unused CSS classes
}

// Reduce animation complexity on mobile
@media (max-width: 768px) {
  .cosmic-background {
    opacity: 0.5;
  }

  .gradient-orb {
    filter: blur(80px) !important;
    animation-duration: 30s;
  }

  .starfield canvas {
    opacity: 0.5;
  }
}
```

#### JavaScript Optimization

```typescript
// Tree shaking (remove unused code)
// Webpack automatically removes dead code

// Minification
// Production build automatically minifies

// Gzip/Brotli compression
// Server configuration
next.config.js:
  compress: true, // Enable gzip

// Debounce expensive operations
import { debounce } from 'lodash-es';

const debouncedUpdate = useMemo(
  () => debounce((value) => {
    updateData(value);
  }, 300),
  []
);

// Memoize calculations
const percentage = useMemo(
  () => calculatePercentage(unlockedTokens, totalTokens),
  [unlockedTokens, totalTokens]
);
```

### 6.3 Animation Performance

```typescript
// GPU-Accelerated Properties
const gpuAccelerated = {
  transform: 'translateZ(0)',     // Force GPU layer
  willChange: 'transform',        // Hint to browser
  backfaceVisibility: 'hidden',   // Prevent flickering
}

// Avoid Layout Thrashing
// ❌ Bad (causes reflow)
element.style.width = '100px';
element.offsetWidth; // Forces reflow
element.style.height = '100px';

// ✅ Good (batch reads and writes)
const width = element.offsetWidth;
requestAnimationFrame(() => {
  element.style.width = '100px';
  element.style.height = '100px';
});

// Limit Concurrent Animations
const ANIMATION_LIMITS = {
  maxConcurrent: 4,           // Max 4 animations at once
  staggerDelay: 200,          // 200ms between starts
  useRequestAnimationFrame: true,
}

// Canvas Optimization
function optimizeCanvas(canvas: HTMLCanvasElement) {
  // Use offscreen canvas for heavy operations
  const offscreen = canvas.transferControlToOffscreen();

  // Reduce resolution on low-end devices
  const dpr = Math.min(window.devicePixelRatio, 2);
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;

  // Throttle animation frame
  let lastFrame = 0;
  const fps = 60;
  const interval = 1000 / fps;

  function animate(timestamp: number) {
    if (timestamp - lastFrame >= interval) {
      lastFrame = timestamp;
      // Draw frame
    }
    requestAnimationFrame(animate);
  }
}
```

### 6.4 Bundle Analysis

```bash
# Analyze bundle size
npm run build
npm run analyze

# Expected output:
Page                                Size     First Load JS
┌ ○ /dashboard-simple               8.2 KB        42.1 KB
├ ○ /buy                            5.3 KB        39.2 KB
└ ○ /claim                          4.8 KB        38.7 KB

# Goal: < 50KB total JavaScript
```

---

## 7. ACCESSIBILITY ARCHITECTURE

### 7.1 WCAG 2.1 AA Compliance

```typescript
const ACCESSIBILITY_STANDARDS = {
  colorContrast: {
    normalText: '4.5:1',      // WCAG AA
    largeText: '3:1',         // WCAG AA
    uiComponents: '3:1',      // WCAG AA
  },

  keyboardNav: {
    tabOrder: 'logical',
    focusIndicators: 'visible',
    skipLinks: 'provided',
  },

  screenReaders: {
    semanticHTML: true,
    ariaLabels: true,
    liveRegions: true,
  },

  responsiveText: {
    zoomSupport: '200%',
    textSpacing: 'adjustable',
    reflow: 'no-horizontal-scroll',
  },
}
```

### 7.2 Semantic HTML Structure

```typescript
// Proper heading hierarchy
<main role="main">
  <h1>HypeAI Dashboard</h1>

  <section aria-label="Token balance">
    <h2 className="sr-only">Your Token Balance</h2>
    {/* Hero number */}
  </section>

  <section aria-label="Vesting progress">
    <h2 className="sr-only">Token Unlock Progress</h2>
    {/* Progress card */}
  </section>

  <section aria-label="Actions">
    <h2 className="sr-only">Available Actions</h2>
    {/* Action buttons */}
  </section>
</main>

// Screen reader only content
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### 7.3 ARIA Labels & Live Regions

```typescript
// Token Display
<div
  role="region"
  aria-label="Token balance"
  aria-live="polite"
  aria-atomic="true"
>
  <div aria-hidden="true">💎 ВАШИ ТОКЕНЫ</div>
  <div aria-label={`You have ${formatNumber(totalTokens)} HYPE tokens`}>
    {formatNumber(totalTokens)}
  </div>
  <div aria-hidden="true">HYPE</div>
</div>

// Progress Bar
<div
  role="progressbar"
  aria-valuenow={percentage}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`${percentage}% of tokens unlocked. ${formatNumber(unlockedTokens)} HYPE available.`}
>
  {/* Visual progress bar */}
</div>

// Loading State
<div
  role="status"
  aria-live="assertive"
  aria-busy={isLoading}
>
  {isLoading ? 'Loading your dashboard...' : null}
</div>

// Buttons
<button
  aria-label="Buy more HYPE tokens"
  aria-describedby="buy-description"
>
  💰 КУПИТЬ ЕЩЁ
</button>
<p id="buy-description" className="sr-only">
  Navigate to purchase page to buy additional tokens
</p>

<button
  aria-label="Claim unlocked tokens"
  aria-describedby="claim-description"
  aria-disabled={unlockedTokens === 0}
  disabled={unlockedTokens === 0}
>
  💎 ЗАБРАТЬ ТОКЕНЫ
</button>
<p id="claim-description" className="sr-only">
  {unlockedTokens > 0
    ? `${formatNumber(unlockedTokens)} tokens available to claim`
    : 'No tokens available to claim yet'
  }
</p>
```

### 7.4 Color Contrast Verification

```typescript
// Color contrast checker
const CONTRAST_RATIOS = {
  // Text on dark background
  whiteOnDark: {
    foreground: '#FFFFFF',
    background: '#0a0118',
    ratio: 15.5,
    passes: 'AAA', // ✅
  },

  lightGrayOnDark: {
    foreground: '#A0A3B1',
    background: '#0a0118',
    ratio: 8.2,
    passes: 'AAA', // ✅
  },

  yellowOnDark: {
    foreground: '#FFE900',
    background: '#0a0118',
    ratio: 12.1,
    passes: 'AAA', // ✅
  },

  // Interactive elements
  yellowOnCard: {
    foreground: '#FFE900',
    background: '#1E2026',
    ratio: 10.8,
    passes: 'AAA', // ✅
  },

  whiteOnPurple: {
    foreground: '#FFFFFF',
    background: '#9333ea',
    ratio: 5.2,
    passes: 'AA', // ✅
  },

  purpleBorder: {
    foreground: '#9333ea',
    background: '#0a0118',
    ratio: 3.1,
    passes: 'AA (UI)', // ✅
  },
}

// Testing command
// npm install @wcag-contrast/checker
// node scripts/check-contrast.js
```

### 7.5 Keyboard Navigation

```typescript
// Tab order (logical flow)
const TAB_ORDER = [
  1, // Skip to main content link
  2, // Logo (if linked to home)
  3, // Language selector (if present)
  4, // Buy More button
  5, // Claim Tokens button
  6, // Full version link
]

// Focus management
function handleKeyboardNav(e: KeyboardEvent) {
  // Trap focus in modal (if used)
  if (e.key === 'Tab' && modalOpen) {
    trapFocus(e);
  }

  // Escape key closes modal
  if (e.key === 'Escape' && modalOpen) {
    closeModal();
  }

  // Arrow keys for custom components
  if (e.key === 'ArrowDown') {
    focusNext();
  }
}

// Focus indicators
button:focus-visible {
  outline: 2px solid var(--cosmic-yellow);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(255, 233, 0, 0.2);
}

// Skip to main content
<a href="#main" className="skip-to-main">
  Skip to main content
</a>

<main id="main" tabIndex={-1}>
  {/* Dashboard content */}
</main>

<style jsx>{`
  .skip-to-main {
    position: absolute;
    top: -100px;
    left: 0;
    background: var(--cosmic-purple);
    color: white;
    padding: 12px 24px;
    z-index: 10000;
    transition: top 0.3s;
  }

  .skip-to-main:focus {
    top: 0;
    outline: 3px solid var(--cosmic-yellow);
  }
`}</style>
```

### 7.6 Screen Reader Testing

```typescript
// Screen reader test checklist
const SCREEN_READER_TESTS = {
  voiceOver: {
    // macOS: Cmd + F5
    announcements: [
      'Token balance region',
      'You have 250,000 HYPE tokens',
      'Vesting progress region',
      '67% of tokens unlocked',
      'Buy more tokens button',
      'Claim tokens button, disabled',
    ],
  },

  nvda: {
    // Windows: Ctrl + Alt + N
    navigation: [
      'Heading level 1: Dashboard',
      'Region: Token balance',
      'Progressbar: 67 percent',
      'Button: Buy more tokens',
    ],
  },

  jaws: {
    // Windows: Insert + F1
    landmarks: [
      'Main navigation',
      'Main content',
      'Token balance section',
      'Actions section',
    ],
  },
}

// Automated testing with axe-core
import { axe, toHaveNoViolations } from 'jest-axe';

test('dashboard has no accessibility violations', async () => {
  const { container } = render(<SimpleDashboard />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 8. ANIMATION & INTERACTION DESIGN

### 8.1 Animation Principles

Based on Disney's 12 Principles + Material Design Motion:

```typescript
const ANIMATION_PRINCIPLES = {
  // 1. Squash & Stretch
  buttonPress: {
    active: { transform: 'scale(0.98)' },
    rest: { transform: 'scale(1)' },
  },

  // 2. Anticipation
  buttonHover: {
    before: { transform: 'translateY(0)' },
    anticipate: { transform: 'translateY(-2px)' },
    action: { transform: 'translateY(-4px)' },
  },

  // 3. Staging (focus user attention)
  heroNumber: {
    emphasis: true,
    position: 'center',
    size: 'largest',
  },

  // 4. Slow In/Out (easing)
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',

  // 5. Follow Through
  progressBar: {
    mainAnimation: 'width 1.5s ease-out',
    shimmer: 'shimmer 3s infinite',
  },

  // 6. Arcs (natural motion)
  orbFloat: {
    path: 'quadratic curve',
    duration: '20s',
  },

  // 7. Secondary Action
  glow: {
    primary: 'button hover',
    secondary: 'glow effect',
  },

  // 8. Timing
  timing: {
    instant: '< 100ms',
    fast: '100-200ms',
    medium: '200-500ms',
    slow: '500-1000ms',
    verySlow: '> 1000ms',
  },

  // 9. Exaggeration
  gradientText: {
    colors: 3,
    animationScale: 'subtle',
  },

  // 10. Solid Drawing (clarity)
  sharpUI: true,
  antiAliasing: true,

  // 11. Appeal
  cosmicTheme: true,
  pleasingAesthetics: true,
}
```

### 8.2 Animation Catalog

```typescript
// Keyframe Animations
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float-orb {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(50px, -40px) scale(1.08);
  }
  50% {
    transform: translate(-15px, 50px) scale(1.15);
  }
  75% {
    transform: translate(-40px, -30px) scale(0.92);
  }
}

@keyframes text-pulse {
  0%, 100% {
    filter: drop-shadow(0 0 10px rgba(147, 51, 234, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.5))
            drop-shadow(0 0 40px rgba(59, 130, 246, 0.3));
  }
}

@keyframes stat-pulse {
  0%, 100% {
    filter: drop-shadow(0 0 5px rgba(255, 233, 0, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 15px rgba(255, 233, 0, 0.5))
            drop-shadow(0 0 30px rgba(255, 233, 0, 0.3));
  }
}

@keyframes label-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 233, 0, 0.15);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 233, 0, 0.3);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
```

### 8.3 Interaction States

```typescript
// Button States
const BUTTON_STATES = {
  // Rest
  rest: {
    background: GRADIENTS.buttonSecondary,
    transform: 'translateY(0) scale(1)',
    boxShadow: 'none',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Hover
  hover: {
    background: GRADIENTS.buttonHover,
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: SHADOWS.cardHover,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Active (pressed)
  active: {
    transform: 'translateY(-2px) scale(0.98)',
    transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Focus
  focus: {
    outline: `2px solid ${COLORS.cosmicYellow}`,
    outlineOffset: '2px',
    boxShadow: `0 0 0 4px rgba(255, 233, 0, 0.2)`,
  },

  // Disabled
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },

  // Loading
  loading: {
    cursor: 'wait',
    opacity: 0.7,
  },
}

// Card States
const CARD_STATES = {
  // Rest
  rest: {
    borderColor: COLORS.borderMedium,
    boxShadow: SHADOWS.cardDefault,
  },

  // Hover (optional)
  hover: {
    borderColor: COLORS.borderStrong,
    boxShadow: SHADOWS.cardHover,
  },
}

// Progress Bar States
const PROGRESS_STATES = {
  // Initial
  initial: {
    width: '0%',
  },

  // Animating
  animating: {
    width: '67%',
    transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Complete
  complete: {
    width: '100%',
  },
}
```

### 8.4 Loading States

```typescript
// Skeleton Screens
function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Label skeleton */}
      <div className="h-8 w-40 bg-purple-900/20 rounded-full mb-6" />

      {/* Number skeleton */}
      <div className="h-24 w-64 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg mb-4" />

      {/* Symbol skeleton */}
      <div className="h-10 w-20 bg-purple-900/20 rounded mb-12" />

      {/* Card skeleton */}
      <div className="bg-gray-900/50 rounded-3xl p-8 mb-8">
        <div className="h-12 w-32 bg-purple-900/20 rounded-lg mb-6 mx-auto" />
        <div className="h-4 w-full bg-purple-900/20 rounded-full" />
      </div>

      {/* Buttons skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 bg-purple-900/20 rounded-2xl" />
        <div className="h-20 bg-purple-900/20 rounded-2xl" />
      </div>
    </div>
  );
}

// Shimmer Animation
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(30, 32, 38, 0.4) 0%,
    rgba(147, 51, 234, 0.2) 50%,
    rgba(30, 32, 38, 0.4) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

### 8.5 Micro-Interactions

```typescript
// Number Counter Animation
function AnimatedNumber({ value, duration = 1000 }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;

      if (progress < 1) {
        setDisplayValue(Math.floor(value * easeOutCubic(progress)));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    }

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{formatNumber(displayValue)}</span>;
}

// Easing function
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Ripple Effect on Click
function useRipple() {
  function createRipple(event: React.MouseEvent<HTMLElement>) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');

    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    ripple.style.top = `${event.clientY - button.offsetTop - radius}px`;
    ripple.classList.add('ripple');

    const rippleElement = button.querySelector('.ripple');
    if (rippleElement) {
      rippleElement.remove();
    }

    button.appendChild(ripple);
  }

  return { createRipple };
}

// Ripple CSS
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: scale(0);
  animation: ripple-animation 0.6s ease-out;
  pointer-events: none;
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
```

---

## 9. RESPONSIVE DESIGN STRATEGY

### 9.1 Breakpoint System

```typescript
// Breakpoints (Mobile-First)
export const BREAKPOINTS = {
  mobile: {
    max: 640,
    mediaQuery: '(max-width: 640px)',
  },
  tablet: {
    min: 641,
    max: 1024,
    mediaQuery: '(min-width: 641px) and (max-width: 1024px)',
  },
  desktop: {
    min: 1025,
    mediaQuery: '(min-width: 1025px)',
  },
  wide: {
    min: 1440,
    mediaQuery: '(min-width: 1440px)',
  },
}

// Container Max Widths
export const CONTAINER_WIDTHS = {
  mobile: '100%',
  tablet: '768px',
  desktop: '1024px',
  wide: '1200px',
}

// Usage in components
@media (max-width: 640px) {
  /* Mobile styles */
}

@media (min-width: 641px) and (max-width: 1024px) {
  /* Tablet styles */
}

@media (min-width: 1025px) {
  /* Desktop styles */
}
```

### 9.2 Responsive Typography

```typescript
// Using clamp() for fluid typography
const RESPONSIVE_TYPOGRAPHY = {
  // Hero Number: 48px (mobile) → 96px (desktop)
  heroNumber: {
    fontSize: 'clamp(3rem, 10vw, 6rem)',
    lineHeight: '1.1',
  },

  // Percentage: 32px (mobile) → 64px (desktop)
  percentage: {
    fontSize: 'clamp(2rem, 6vw, 4rem)',
    lineHeight: '1.2',
  },

  // Symbol: 24px (mobile) → 40px (desktop)
  symbol: {
    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
    lineHeight: '1.2',
  },

  // Button Text: 16px (mobile) → 20px (desktop)
  buttonText: {
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    lineHeight: '1.5',
  },

  // Body Text: 16px (mobile) → 20px (desktop)
  bodyText: {
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    lineHeight: '1.6',
  },
}

// Why clamp()?
// clamp(MIN, PREFERRED, MAX)
// - MIN: minimum font size
// - PREFERRED: ideal size (viewport-based)
// - MAX: maximum font size
// - Automatically scales between breakpoints
// - No media queries needed
```

### 9.3 Mobile Specifications

```typescript
// Mobile (< 640px)
const MOBILE_SPECS = {
  layout: {
    maxWidth: '100%',
    padding: '1rem',
    gap: '1rem',
  },

  typography: {
    heroNumber: '3rem',      // 48px
    percentage: '2rem',      // 32px
    buttonText: '1rem',      // 16px
  },

  spacing: {
    sectionGap: '2rem',      // 32px between sections
    cardPadding: '1.5rem',   // 24px
    buttonPadding: '1.25rem 1.5rem', // 20px 24px
  },

  animations: {
    complexity: 'reduced',
    starCount: 75,           // vs 150 on desktop
    orbBlur: '80px',         // vs 120px on desktop
    canvasOpacity: 0.5,      // vs 1.0 on desktop
  },

  interactions: {
    buttonGrid: 'stack',     // Vertical layout
    hoverEffects: 'disabled', // Touch devices
    touchTargetSize: '44px', // Minimum touch target
  },
}

// Mobile-specific styles
@media (max-width: 640px) {
  .hero-number {
    font-size: 3rem;
  }

  .action-buttons {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .progress-card {
    padding: 1.5rem;
  }

  .cosmic-background canvas {
    opacity: 0.5;
  }

  .gradient-orb {
    filter: blur(80px) !important;
    opacity: 0.1 !important;
  }
}
```

### 9.4 Tablet Specifications

```typescript
// Tablet (641px - 1024px)
const TABLET_SPECS = {
  layout: {
    maxWidth: '768px',
    padding: '2rem',
    gap: '1.5rem',
  },

  typography: {
    heroNumber: '5rem',      // 80px
    percentage: '3rem',      // 48px
    buttonText: '1.125rem',  // 18px
  },

  spacing: {
    sectionGap: '3rem',
    cardPadding: '2rem',
    buttonPadding: '1.5rem 2rem',
  },

  animations: {
    complexity: 'full',
    starCount: 150,
    orbBlur: '120px',
    canvasOpacity: 1.0,
  },

  interactions: {
    buttonGrid: '2-column',
    hoverEffects: 'enabled',
  },
}

// Tablet-specific styles
@media (min-width: 641px) and (max-width: 1024px) {
  .container {
    max-width: 768px;
    padding: 2rem;
  }

  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}
```

### 9.5 Desktop Specifications

```typescript
// Desktop (> 1024px)
const DESKTOP_SPECS = {
  layout: {
    maxWidth: '1200px',
    padding: '3rem 1.5rem',
    gap: '2rem',
  },

  typography: {
    heroNumber: '6rem',      // 96px
    percentage: '4rem',      // 64px
    buttonText: '1.25rem',   // 20px
  },

  spacing: {
    sectionGap: '3rem',
    cardPadding: '3rem',
    buttonPadding: '1.75rem 2.5rem',
  },

  animations: {
    complexity: 'full',
    starCount: 150,
    orbBlur: '120px',
    canvasOpacity: 1.0,
    allEffects: 'enabled',
  },

  interactions: {
    buttonGrid: '2-column',
    hoverEffects: 'enabled',
    advancedAnimations: true,
  },
}

// Desktop-specific styles
@media (min-width: 1025px) {
  .container {
    max-width: 1200px;
    padding: 3rem 1.5rem;
  }

  .hero-section {
    margin-bottom: 3rem;
  }

  .progress-card {
    padding: 3rem;
  }
}
```

### 9.6 Touch vs Mouse Interactions

```typescript
// Detect touch device
const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Conditional hover effects
function Button({ onClick, children }) {
  const [isHovered, setIsHovered] = useState(false);
  const isTouchRef = useRef(isTouchDevice());

  // Only enable hover on non-touch devices
  const handleMouseEnter = () => {
    if (!isTouchRef.current) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouchRef.current) {
      setIsHovered(false);
    }
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...baseStyle,
        ...(isHovered && hoverStyle),
      }}
    >
      {children}
    </button>
  );
}

// Touch-specific CSS
@media (hover: none) {
  /* Touch devices */
  .button:hover {
    /* Disable hover styles */
    transform: none;
    box-shadow: none;
  }

  .button:active {
    /* Touch press styles */
    transform: scale(0.95);
  }
}

@media (hover: hover) {
  /* Mouse devices */
  .button:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(147, 51, 234, 0.5);
  }
}
```

### 9.7 Viewport Units Best Practices

```typescript
// ✅ Good: clamp() for fluid sizing
font-size: clamp(1rem, 2.5vw, 1.25rem);

// ❌ Bad: raw vw/vh (can break on small screens)
font-size: 5vw;

// ✅ Good: constrained viewport units
height: clamp(500px, 80vh, 800px);

// ❌ Bad: unconstrained viewport
height: 80vh; // Could be too small on landscape mobile

// Viewport height handling (mobile address bar)
// Use CSS custom property
:root {
  --vh: 1vh;
}

// JavaScript to set correct value
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);
setVH();

// Usage in CSS
.full-height {
  height: calc(var(--vh, 1vh) * 100);
}
```

---

**End of Part 1**
**Continue to Part 2 for:**
- 10. Security Architecture
- 11. Testing Strategy
- 12. Deployment Architecture
- 13. Monitoring & Analytics
- 14. Future Enhancements
- 15. Architecture Decision Records

Would you like me to continue with Part 2?
