# Token Growth Section - Component Tree

## Component Architecture

```
TokenGrowthSection (Main Container)
│
├── HeroSection
│   ├── Animated Background (2 gradient circles)
│   ├── Badge ("Not Hope. Not Hype. Pure Mathematics")
│   ├── H1 Title ("Token Growth Is Mathematically Inevitable")
│   ├── Description Paragraph
│   └── CTA Buttons
│       ├── Primary: "Calculate Your Returns" (→ #calculator)
│       └── Secondary: "Download Math Proof PDF"
│
├── BurnMechanismSection
│   ├── Section Header
│   ├── Burn Mechanisms Grid (3 cards)
│   │   ├── Card 1: "Every AI Analysis" (🤖)
│   │   ├── Card 2: "Every B2B Service" (🏢)
│   │   └── Card 3: "Every Transaction" (💱)
│   ├── Supply Reduction Chart (Recharts BarChart)
│   │   ├── Bar: Remaining Supply (green)
│   │   └── Bar: Burned (red)
│   └── Timeline Grid (5 milestones)
│       ├── Day 1: 0% burned
│       ├── Month 1: -15% burned
│       ├── Month 3: -45% burned
│       ├── Month 6: -90% burned
│       └── Month 12: -99% burned
│
├── PriceProjectionsSection
│   ├── Section Header
│   ├── Scenario Selector (3 buttons)
│   │   ├── Conservative (99.9% Guaranteed)
│   │   ├── Moderate (85% Likely) [default]
│   │   └── Optimistic (50% Possible)
│   ├── Price Chart (Recharts LineChart)
│   │   └── Line: HYPE Price (color-coded by scenario)
│   └── Price Milestones Grid (5 cards per scenario)
│       ├── Today: $0.001 (1x)
│       ├── Month 1: $0.005-0.025 (5x-25x)
│       ├── Month 3: $0.020-0.150 (20x-150x)
│       ├── Month 6: $0.100-1.000 (100x-1000x)
│       └── Month 12: $1.000-10.000 (1000x-10000x)
│
├── FormulaSection
│   ├── Section Header ("The Formula")
│   ├── Formula Display (large animated box)
│   │   ├── Numerator: "↗️ Demand"
│   │   ├── Divider Line
│   │   ├── Denominator: "↘️ Supply"
│   │   ├── Equals Sign
│   │   └── Result: "🚀 Price"
│   └── Explanation Text
│       ├── "Supply & Demand Economics 101"
│       ├── "Not speculation. Not hopium. Pure mathematics."
│       └── "When demand rises and supply falls, price MUST increase."
│
├── ReasonsSection
│   ├── Section Header ("5 Reasons Growth Is Inevitable")
│   └── Reasons Grid (5 cards)
│       ├── Reason 1: Burn Rate > Emission Rate (🔥)
│       ├── Reason 2: Real Utility Demand (⚡)
│       ├── Reason 3: B2B Corporate Demand (🏢)
│       ├── Reason 4: Staking Lockup (🔒)
│       └── Reason 5: Network Effects (♾️)
│
├── CalculatorSection (id="calculator")
│   ├── Section Header ("Your Investment Breakdown")
│   ├── Calculator Container
│   │   ├── Investment Input
│   │   │   ├── Label: "Investment Amount"
│   │   │   ├── Input: Number (min: $100, max: $100,000)
│   │   │   ├── Error Message (if invalid)
│   │   │   └── Helper Text: "Minimum: $100 • Maximum: $100,000"
│   │   ├── Tokens Received Display
│   │   │   ├── Label: "You will receive"
│   │   │   ├── Amount: "X,XXX,XXX HYPE" (cyan)
│   │   │   └── Price: "at $0.001 per token"
│   │   ├── Scenario Results (3 cards)
│   │   │   ├── Conservative Scenario
│   │   │   │   ├── Label + Timeframe + Probability
│   │   │   │   ├── Multiplier Badge (3.5x)
│   │   │   │   ├── Future Value: "$X,XXX"
│   │   │   │   └── Profit: "+$XXX (+XXX%)"
│   │   │   ├── Moderate Scenario
│   │   │   │   ├── Label + Timeframe + Probability
│   │   │   │   ├── Multiplier Badge (100x)
│   │   │   │   ├── Future Value: "$XX,XXX"
│   │   │   │   └── Profit: "+$XX,XXX (+X,XXX%)"
│   │   │   └── Optimistic Scenario
│   │   │       ├── Label + Timeframe + Probability
│   │   │       ├── Multiplier Badge (1000x)
│   │   │       ├── Future Value: "$X,XXX,XXX"
│   │   │       └── Profit: "+$X,XXX,XXX (+XX,XXX%)"
│   │   └── Disclaimer Box
│   │       └── "⚠️ Disclaimer: Cryptocurrency investments carry risk..."
│
└── CTASection
    ├── Section Header ("Join The Inevitable Growth")
    ├── Description: "Buy HYPE at $0.001..."
    ├── CTA Buttons
    │   ├── Primary: "🚀 Buy HYPE Now" (→ /presale)
    │   └── Secondary: "📄 Download Math Proof" (PDF)
    └── Footer Text: "Not hype. Not hope. Just math. 🧮"
```

---

## Data Flow

```
Constants Layer:
  tokenGrowthData.ts
    ├── STARTING_SUPPLY
    ├── CURRENT_PRICE
    ├── projections { conservative, moderate, optimistic }
    ├── burnMechanisms
    ├── growthReasons
    ├── supplyReduction
    └── scenarios

        ↓ (imported by)

Calculation Layer:
  tokenGrowthCalculations.ts
    ├── calculateAllScenarios()
    ├── calculateTokensReceived()
    ├── formatCurrency()
    ├── formatTokenAmount()
    └── validateInvestmentAmount()

        ↓ (used by)

Component Layer:
  TokenGrowthSection.tsx
    ├── useState (calculator inputs)
    ├── useEffect (animation triggers)
    ├── useInView (scroll animations)
    └── renders → 7 sub-components
```

---

## State Management

```
CalculatorSection Component State:
  ┌─────────────────────────────────┐
  │ inputs: CalculatorInputs        │
  │  ├── investmentAmount: number   │
  │  └── currentPrice: number       │
  ├─────────────────────────────────┤
  │ results: CalculatorResults      │
  │  ├── tokensReceived: number     │
  │  ├── conservative: number       │
  │  ├── moderate: number           │
  │  └── optimistic: number         │
  ├─────────────────────────────────┤
  │ error: string                   │
  └─────────────────────────────────┘

PriceProjectionsSection Component State:
  ┌─────────────────────────────────┐
  │ activeScenario: string          │
  │  ├── 'conservative'             │
  │  ├── 'moderate' [default]       │
  │  └── 'optimistic'               │
  └─────────────────────────────────┘

All Other Sections:
  No local state (pure presentational)
```

---

## Animation Flow

```
Scroll Position
      ↓
  useInView Hook (ref on each section)
      ↓
  isInView = true
      ↓
  controls.start('visible')
      ↓
  Framer Motion Variants
      ├── fadeInUp (opacity: 0→1, y: 50→0)
      ├── scaleIn (scale: 0.8→1, opacity: 0→1)
      └── staggerContainer (stagger children by 0.2s)
      ↓
  Animated Components Appear
```

---

## Interaction Flow

### Calculator Interaction:
```
User Types Amount
      ↓
handleInvestmentChange(value)
      ↓
validateInvestmentAmount(value)
      ├── Valid → setError('')
      │           calculateAllScenarios()
      │           setResults()
      │           Re-render with new values
      └── Invalid → setError('...')
                    Display error message
```

### Scenario Switch Interaction:
```
User Clicks Scenario Button
      ↓
setActiveScenario('moderate')
      ↓
chartData = projections[activeScenario]
      ↓
Recharts Re-render with New Data
      ↓
Price Milestones Update
```

---

## Responsive Behavior

```
Mobile (< 640px):
  ├── 1-column grids
  ├── Stacked cards
  ├── Smaller font sizes
  ├── Full-width buttons
  └── Touch-friendly targets (44px min)

Tablet (640px - 1024px):
  ├── 2-column grids
  ├── Medium font sizes
  ├── Flex-wrap layouts
  └── Responsive charts

Desktop (> 1024px):
  ├── 3-5 column grids
  ├── Large font sizes
  ├── Side-by-side layouts
  └── Full-width charts
```

---

## Dependencies Graph

```
External Dependencies:
  ├── React 18
  ├── Next.js 14
  ├── Framer Motion 12
  ├── Recharts 3
  └── Tailwind CSS 3

Internal Dependencies:
  TokenGrowthSection.tsx
    ├── imports → types/tokenGrowth.ts
    ├── imports → constants/tokenGrowthData.ts
    ├── imports → lib/tokenGrowthCalculations.ts
    └── imports → React, Framer Motion, Recharts

  tokenGrowthCalculations.ts
    ├── imports → types/tokenGrowth.ts
    └── imports → constants/tokenGrowthData.ts

  tokenGrowthData.ts
    └── imports → types/tokenGrowth.ts

  types/tokenGrowth.ts
    └── (no dependencies)
```

---

## File Size Breakdown

```
Total: 37.6 KB (1,356 lines)

TokenGrowthSection.tsx:       25.0 KB (764 lines)  - 66.5%
├── Hero Section:              ~3 KB
├── Burn Mechanism:            ~4 KB
├── Price Projections:         ~5 KB
├── Formula:                   ~2 KB
├── Reasons:                   ~3 KB
├── Calculator:                ~6 KB
└── CTA:                       ~2 KB

tokenGrowthData.ts:            6.2 KB (300 lines)  - 16.5%
├── Projections:               ~4 KB
├── Static data:               ~1 KB
└── Exports:                   ~1.2 KB

tokenGrowthCalculations.ts:    5.0 KB (222 lines)  - 13.3%
├── Calculator functions:      ~2 KB
├── Format functions:          ~1.5 KB
└── Validation functions:      ~1.5 KB

tokenGrowth.ts:                1.4 KB (70 lines)   - 3.7%
├── Interfaces:                ~1 KB
└── Type exports:              ~0.4 KB
```

---

## Performance Characteristics

### Initial Load:
```
1. Component mounts → 0ms
2. Static data loads → ~5ms (imports)
3. Initial render → ~20ms
4. Framer Motion setup → ~10ms
5. Recharts initialization → ~30ms
Total: ~65ms (excluding network)
```

### Scroll Performance:
```
1. Scroll event → useInView checks
2. Ref enters viewport → trigger animation
3. Framer Motion animates → 60fps
4. Chart appears → Recharts renders
Per-section: ~16ms (60fps maintained)
```

### Calculator Performance:
```
1. User types → onChange fires
2. Validation → <1ms
3. Calculations → <1ms (pure math)
4. Re-render → <10ms
5. Display updates → smooth
Total: ~12ms per keystroke
```

---

## Accessibility Tree

```
<section> "Token Growth Economics"
  ├── <section> "Hero Section"
  │   ├── role="banner"
  │   ├── [animated backgrounds] (aria-hidden)
  │   ├── <h1> "Token Growth Is Mathematically Inevitable"
  │   ├── <p> description
  │   └── <nav> CTAs
  │       ├── <a> "Calculate Your Returns" (aria-label)
  │       └── <a> "Download Math Proof" (aria-label)
  ├── <section> "Burn Mechanism"
  │   ├── <h2> "The Burn Mechanism"
  │   ├── <div role="list"> Burn cards
  │   ├── [BarChart] (role="img", aria-label)
  │   └── <div role="list"> Timeline
  ├── <section> "Price Projections"
  │   ├── <h2> "Price Projections"
  │   ├── <nav> Scenario buttons (role="tablist")
  │   ├── [LineChart] (role="img", aria-label)
  │   └── <div role="list"> Milestones
  ├── <section> "Formula"
  │   ├── <h2> "The Formula"
  │   └── <div role="math"> Formula display
  ├── <section> "Reasons"
  │   ├── <h2> "5 Reasons"
  │   └── <div role="list"> Reason cards
  ├── <section id="calculator"> "Calculator"
  │   ├── <h2> "Your Investment Breakdown"
  │   ├── <form>
  │   │   ├── <label for="investment"> "Investment Amount"
  │   │   ├── <input id="investment"> (aria-invalid, aria-describedby)
  │   │   └── <span role="alert"> Error message
  │   ├── <div role="status"> Tokens received
  │   └── <div role="list"> Scenario results
  └── <section> "CTA"
      ├── role="complementary"
      ├── <h2> "Join The Inevitable Growth"
      └── <nav> Final CTAs
```

---

## Color Palette Usage

```
Green (#10b981):
  ├── Primary CTAs
  ├── Profit displays
  ├── Success states
  ├── Chart lines (growth)
  └── Gradient accents

Gold (#fbbf24):
  ├── Multiplier badges
  ├── Wealth indicators
  ├── Hero gradient
  └── Special highlights

Cyan (#06b6d4):
  ├── Technology indicators
  ├── Tokens received display
  ├── Secondary accents
  └── Chart lines (moderate)

Red (#ef4444):
  ├── Burned tokens
  ├── Fire effects
  ├── Error states
  └── Chart bars (burned)

Gray Scale:
  ├── Slate-900 (#0f172a): Main background
  ├── Slate-800 (#1e293b): Card backgrounds
  ├── Slate-700 (#334155): Borders
  ├── Gray-400 (#9ca3af): Helper text
  └── White (#ffffff): Primary text
```

---

**This component tree represents the complete architecture of the Token Growth Economics section.**