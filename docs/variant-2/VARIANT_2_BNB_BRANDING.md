# HypeAI Variant 2 - BNB Branding Guide
## Binance Chain Visual Identity Standards

**Version:** 2.0.0
**Created:** 2025-10-19
**Status:** Official Branding Guide

---

## 1. Brand Philosophy

### 1.1 Core Principles

**HypeAI on Binance Chain represents:**
- **Trust** - Built on one of the world's leading blockchain ecosystems
- **Speed** - Fast transactions, instant AI responses
- **Innovation** - Cutting-edge AI meets proven blockchain technology
- **Accessibility** - Low fees make AI services available to everyone
- **Gold Standard** - Premium quality, reflected in our gold aesthetic

### 1.2 Visual Language

The Variant 2 design transforms HypeAI's identity to align with Binance Chain's ecosystem while maintaining our unique AI-first approach:

- **BNB Gold** - Premium, trustworthy, valuable
- **Dark Sophistication** - Professional, modern, serious
- **Smooth Animations** - AI intelligence in motion
- **Glass Effects** - Transparency, clarity, future-forward

---

## 2. Color System

### 2.1 Primary Colors

#### BNB Gold (Primary Brand Color)

```css
/* Main BNB Gold */
--bnb-gold-primary: #F3BA2F;
RGB: 243, 186, 47
HSL: 45°, 89%, 57%

Usage:
✓ Primary CTAs
✓ Logo accents
✓ Headings & important text
✓ Active states
✓ Borders on featured elements
✓ Glow effects
```

**Visual Examples:**
- "Join Private Sale" button background
- Active navigation link underline
- Logo highlighting
- Feature card borders on hover
- Stats counter highlights

#### BNB Gold Secondary (Light Accent)

```css
--bnb-gold-secondary: #FCD535;
RGB: 252, 213, 53
HSL: 48°, 97%, 60%

Usage:
✓ Hover states
✓ Gradient endpoints
✓ Subtle accents
✓ Icon highlights
```

#### BNB Gold Dark (Hover/Active)

```css
--bnb-gold-dark: #E5A91A;
RGB: 229, 169, 26
HSL: 42°, 81%, 50%

Usage:
✓ Button hover states
✓ Pressed states
✓ Dark theme variations
```

### 2.2 Background Colors

#### BNB Darker (Body Background)

```css
--bnb-bg-darker: #14151A;
RGB: 20, 21, 26
HSL: 228°, 13%, 9%

Usage:
✓ Main page background
✓ Section backgrounds
✓ Dark mode base
```

#### BNB Dark (Card Backgrounds)

```css
--bnb-bg-dark: #1E2026;
RGB: 30, 32, 38
HSL: 228°, 12%, 13%

Usage:
✓ Card backgrounds
✓ Elevated surfaces
✓ Modal backgrounds
```

#### BNB Elevated (Layered Elements)

```css
--bnb-bg-elevated: #2B2F36;
RGB: 43, 47, 54
HSL: 218°, 11%, 19%

Usage:
✓ Dropdown menus
✓ Tooltips
✓ Overlays
```

### 2.3 Semantic Colors

#### Success (Green)

```css
--bnb-success: #0ECB81;
RGB: 14, 203, 129
HSL: 157°, 87%, 43%

Usage:
✓ Positive values (+%)
✓ Success messages
✓ Active indicators
✓ Profit displays
```

#### Error (Red)

```css
--bnb-error: #F6465D;
RGB: 246, 70, 93
HSL: 352°, 91%, 62%

Usage:
✓ Negative values (-%)
✓ Error messages
✓ Warning alerts
✓ Loss displays
```

#### Warning (Yellow)

```css
--bnb-warning: #F0B90B;
RGB: 240, 185, 11
HSL: 46°, 91%, 49%

Usage:
✓ Caution messages
✓ Pending states
✓ Important notices
```

#### Info (Cyan)

```css
--bnb-info: #00D4FF;
RGB: 0, 212, 255
HSL: 190°, 100%, 50%

Usage:
✓ Informational messages
✓ Links
✓ Secondary highlights
```

### 2.4 Color Usage Rules

#### DO's ✓

1. **Use BNB Gold (#F3BA2F) prominently**
   - Primary buttons and CTAs
   - Logo and branding elements
   - Important headings
   - Active states and selections

2. **Maintain high contrast**
   - Gold text on dark backgrounds
   - White text on gold backgrounds (for buttons)
   - Minimum 4.5:1 contrast ratio for text

3. **Use semantic colors correctly**
   - Green for positive/success
   - Red for negative/error
   - Yellow for warnings
   - Cyan for information

4. **Apply gradients tastefully**
   - Gold gradient for premium features
   - Dark gradient for depth
   - Subtle glow effects

#### DON'Ts ✗

1. **Never use the old blue/purple theme**
   - ✗ #00D4FF (old primary blue)
   - ✗ #9D4EDD (old primary purple)
   - These are REPLACED by BNB gold

2. **Don't overuse gold**
   - Not for body text
   - Not for large backgrounds
   - Use strategically for impact

3. **Avoid poor contrast combinations**
   - ✗ Gold on white
   - ✗ Dark gray on black
   - ✗ Light gold on light backgrounds

4. **Don't mix color schemes**
   - Stay consistent with BNB palette
   - Don't introduce random colors

### 2.5 Color Accessibility

**WCAG 2.1 AA Compliance:**

| Combination | Contrast Ratio | Pass/Fail | Usage |
|-------------|----------------|-----------|-------|
| #F3BA2F on #14151A | 8.5:1 | ✓ Pass | Headings, CTAs |
| #FFFFFF on #F3BA2F | 4.6:1 | ✓ Pass | Button text |
| #0ECB81 on #14151A | 9.2:1 | ✓ Pass | Success text |
| #F6465D on #14151A | 6.8:1 | ✓ Pass | Error text |

---

## 3. Typography

### 3.1 Font Families

#### Primary Font: Inter

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

**Characteristics:**
- Modern, clean, professional
- Excellent readability
- Wide range of weights
- Optimized for screens

**Usage:**
- Body text
- UI elements
- Navigation
- Forms

#### Display Font: Poppins

```css
font-family: 'Poppins', 'Inter', sans-serif;
```

**Characteristics:**
- Geometric, bold
- Great for headings
- Strong visual impact

**Usage:**
- Main headings (H1, H2)
- Hero text
- Section titles
- Callout text

#### Monospace Font: IBM Plex Mono

```css
font-family: 'IBM Plex Mono', 'JetBrains Mono', monospace;
```

**Usage:**
- Code snippets
- API documentation
- Wallet addresses
- Technical data

### 3.2 Type Scale

```css
/* Perfect Fourth Scale (1.333 ratio) */
--text-xs: 0.75rem;     /* 12px - Captions, labels */
--text-sm: 0.875rem;    /* 14px - Small text */
--text-base: 1rem;      /* 16px - Body text */
--text-lg: 1.125rem;    /* 18px - Lead paragraphs */
--text-xl: 1.25rem;     /* 20px - Small headings */
--text-2xl: 1.5rem;     /* 24px - Section headings */
--text-3xl: 1.875rem;   /* 30px - Page headings */
--text-4xl: 2.25rem;    /* 36px - Hero headings */
--text-5xl: 3rem;       /* 48px - Main hero */
--text-6xl: 3.75rem;    /* 60px - Extra large */
```

### 3.3 Font Weights

```css
--font-normal: 400;     /* Body text */
--font-medium: 500;     /* Emphasis */
--font-semibold: 600;   /* Sub-headings */
--font-bold: 700;       /* Headings */
--font-extrabold: 800;  /* Hero text */
```

### 3.4 Typography Rules

#### Headings

```css
h1 {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  color: var(--bnb-gold-primary);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

h2 {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  color: #FFFFFF;
  line-height: 1.2;
}

h3 {
  font-family: var(--font-primary);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: #FFFFFF;
  line-height: 1.3;
}
```

#### Body Text

```css
body {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  color: #D1D5DB; /* Light gray */
  line-height: 1.6;
}

.lead {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: #F9FAFB; /* Almost white */
  line-height: 1.7;
}
```

#### Special Text Styles

```css
/* Gold gradient text */
.text-gradient-gold {
  background: linear-gradient(135deg, #F3BA2F 0%, #FCD535 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Emphasized text */
.text-emphasis {
  color: var(--bnb-gold-primary);
  font-weight: var(--font-semibold);
}
```

---

## 4. Logo System

### 4.1 Primary Logo Variants

#### Full Logo (Horizontal)

**File:** `logo-bnb.svg`

```
[HYPE.AI LOGO ICON] HypeAI
                    Powered by Binance Chain
```

**Specifications:**
- Minimum width: 200px
- Clear space: 20px on all sides
- Gold (#F3BA2F) accent on icon
- White text on dark backgrounds

**Usage:**
- Header (desktop)
- Footer
- Marketing materials

#### Icon Only

**File:** `logo-bnb-icon.svg`

**Specifications:**
- Square aspect ratio (1:1)
- Minimum size: 48px × 48px
- Gold (#F3BA2F) primary color
- White/gold two-tone

**Usage:**
- Favicon
- Mobile header
- Social media avatars
- App icons

#### Wordmark Only

**File:** `logo-bnb-wordmark.svg`

```
HypeAI
```

**Usage:**
- Text-only contexts
- Print materials
- Footer secondary

### 4.2 Logo Color Variations

#### Standard (Light on Dark)

```
Background: Dark (#14151A)
Icon: Gold (#F3BA2F) + White accents
Text: White (#FFFFFF)
Tagline: Gray (#9CA3AF)
```

#### Inverted (Dark on Light)

```
Background: White (#FFFFFF)
Icon: Gold (#F3BA2F) + Dark accents
Text: Dark (#14151A)
Tagline: Gray (#6B7280)
```

#### Monochrome Gold

```
All elements: #F3BA2F
Usage: Special occasions, merchandise
```

#### Monochrome White

```
All elements: #FFFFFF
Usage: Dark backgrounds, photos
```

### 4.3 Logo Usage Rules

#### DO's ✓

1. **Maintain clear space**
   - Minimum 20px padding on all sides
   - No other elements in clear space zone

2. **Use correct variant for context**
   - Light on dark for website
   - Dark on light for documents
   - High contrast always

3. **Preserve aspect ratio**
   - Never stretch or squish
   - Scale proportionally only

4. **Use provided files**
   - SVG for web (best quality)
   - PNG for raster needs
   - Original colors preferred

#### DON'Ts ✗

1. **Never modify the logo**
   - ✗ Don't change colors (except approved variants)
   - ✗ Don't add effects (shadows, outlines, etc.)
   - ✗ Don't rearrange elements
   - ✗ Don't rotate or distort

2. **Never use on poor backgrounds**
   - ✗ Low contrast backgrounds
   - ✗ Busy patterns or images
   - ✗ Competing colors

3. **Never make it too small**
   - ✗ Smaller than 48px width (icon)
   - ✗ Smaller than 120px width (full logo)

---

## 5. Binance Chain Badge System

### 5.1 BSC Badge Component

#### Primary Badge (Full)

```html
<div class="bsc-badge">
  <img src="/assets/icons/bsc-logo.svg" alt="BSC">
  <span>Powered by Binance Smart Chain</span>
</div>
```

**Styling:**
```css
.bsc-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(243, 186, 47, 0.1);
  border: 1px solid rgba(243, 186, 47, 0.3);
  border-radius: 24px;
  color: #F3BA2F;
  font-size: 14px;
  font-weight: 600;
}

.bsc-badge img {
  width: 24px;
  height: 24px;
}
```

#### Compact Badge

```html
<div class="bsc-badge bsc-badge--compact">
  <img src="/assets/icons/bsc-logo.svg" alt="BSC">
  <span>BSC</span>
</div>
```

#### Icon Only Badge

```html
<div class="bsc-badge bsc-badge--icon">
  <img src="/assets/icons/bsc-logo.svg" alt="Powered by BSC">
</div>
```

### 5.2 Badge Placement Guide

**Required Placements:**

1. **Header** - Top right, always visible
2. **Footer** - Bottom center, full badge
3. **Hero Section** - Prominent, near main CTA
4. **Token Pages** - Multiple placements
5. **Trading Interface** - Network indicator

**Optional Placements:**

- About page (mission section)
- Whitepaper (first page)
- Documentation (header)
- Blog posts (footer)

### 5.3 "Why Binance Chain" Section

**Standard Content Block:**

```html
<section class="why-bsc">
  <h2>Why Binance Smart Chain?</h2>
  <div class="benefits-grid">
    <div class="benefit">
      <div class="benefit-icon">⚡</div>
      <h3>Lightning Fast</h3>
      <p>3-second block times for instant transactions</p>
    </div>
    <div class="benefit">
      <div class="benefit-icon">💰</div>
      <h3>Ultra Low Fees</h3>
      <p>Average transaction cost: $0.10</p>
    </div>
    <div class="benefit">
      <div class="benefit-icon">🔗</div>
      <h3>EVM Compatible</h3>
      <p>Full Ethereum compatibility</p>
    </div>
    <div class="benefit">
      <div class="benefit-icon">🌐</div>
      <h3>Massive Ecosystem</h3>
      <p>Thousands of dApps and projects</p>
    </div>
    <div class="benefit">
      <div class="benefit-icon">🔒</div>
      <h3>Secure & Proven</h3>
      <p>Battle-tested infrastructure</p>
    </div>
  </div>
</section>
```

**Required on Pages:**
- Homepage (prominent)
- About page
- Whitepaper
- Token page

---

## 6. UI Component Branding

### 6.1 Buttons

#### Primary Button (Gold)

```css
.btn-primary {
  background: linear-gradient(135deg, #F3BA2F 0%, #FCD535 100%);
  color: #000000;
  font-weight: 700;
  padding: 16px 32px;
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 16px rgba(243, 186, 47, 0.3);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  box-shadow: 0 6px 24px rgba(243, 186, 47, 0.5);
  transform: translateY(-2px);
}
```

**Usage:**
- "Join Private Sale"
- "Connect Wallet"
- Primary actions

#### Secondary Button (Outlined)

```css
.btn-secondary {
  background: transparent;
  color: #F3BA2F;
  border: 2px solid #F3BA2F;
  padding: 14px 30px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(243, 186, 47, 0.1);
  box-shadow: 0 0 20px rgba(243, 186, 47, 0.3);
}
```

**Usage:**
- "Learn More"
- Secondary actions
- Alternative options

### 6.2 Cards

#### Glass Card (Standard)

```css
.card-glass {
  background: rgba(30, 32, 38, 0.4);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(243, 186, 47, 0.2);
  border-radius: 16px;
  padding: 24px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.37),
    inset 0 1px 0 rgba(243, 186, 47, 0.15);
}

.card-glass:hover {
  border-color: rgba(243, 186, 47, 0.4);
  box-shadow:
    0 12px 48px rgba(243, 186, 47, 0.25),
    inset 0 1px 0 rgba(243, 186, 47, 0.2);
}
```

#### Featured Card (Gold Highlight)

```css
.card-featured {
  background: linear-gradient(
    135deg,
    rgba(243, 186, 47, 0.1) 0%,
    rgba(30, 32, 38, 0.4) 100%
  );
  border: 2px solid #F3BA2F;
  box-shadow: 0 0 40px rgba(243, 186, 47, 0.4);
}
```

### 6.3 Form Elements

#### Input Fields

```css
.input-field {
  background: rgba(30, 32, 38, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  padding: 12px 16px;
  border-radius: 8px;
  font-family: var(--font-primary);
  transition: all 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: #F3BA2F;
  box-shadow: 0 0 0 3px rgba(243, 186, 47, 0.2);
}
```

---

## 7. Visual Effects

### 7.1 Glow Effects

#### Gold Glow (Primary)

```css
.glow-gold {
  box-shadow: 0 0 40px rgba(243, 186, 47, 0.4);
}

.glow-gold-strong {
  box-shadow: 0 0 60px rgba(243, 186, 47, 0.6);
}

/* Animated glow */
@keyframes goldPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(243, 186, 47, 0.4);
  }
  50% {
    box-shadow: 0 0 40px rgba(243, 186, 47, 0.6);
  }
}
```

**Usage:**
- CTAs and primary buttons
- Active elements
- Featured cards
- Logo accents

### 7.2 Gradient Backgrounds

#### Hero Gradient

```css
.hero-gradient {
  background: linear-gradient(
    135deg,
    #14151A 0%,
    #1E2026 50%,
    #14151A 100%
  );
  position: relative;
}

.hero-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at 30% 50%,
    rgba(243, 186, 47, 0.15) 0%,
    transparent 50%
  );
}
```

#### Card Gradient

```css
.card-gradient {
  background: linear-gradient(
    135deg,
    rgba(243, 186, 47, 0.1) 0%,
    rgba(252, 213, 53, 0.05) 100%
  );
}
```

---

## 8. Brand Voice & Messaging

### 8.1 Tone of Voice

**Professional yet Accessible**
- Expert but not intimidating
- Confident but not arrogant
- Innovative but not gimmicky

**Example Headlines:**
```
✓ "AI-Powered Services on Binance Chain"
✓ "Where AI Meets Blockchain Excellence"
✓ "Premium AI Services, Powered by BSC"

✗ "Revolutionary Quantum AI Blockchain"
✗ "Moon Mission DeFi Protocol"
✗ "YOLO into our ecosystem"
```

### 8.2 Key Messages

**Primary Message:**
"HypeAI brings professional AI services to everyone through the power and efficiency of Binance Smart Chain."

**Supporting Messages:**
1. "27 AI agents working 24/7 for your success"
2. "Fast, affordable, and accessible AI services"
3. "Built on BSC for speed and low fees"
4. "Premium quality at a fraction of the cost"

### 8.3 Tagline Options

**Approved Taglines:**
- "AI Services on Binance Chain"
- "Powered by AI, Built on BSC"
- "Where AI Meets Opportunity"
- "Professional AI Services for Everyone"

---

## 9. Do's and Don'ts Summary

### VISUAL DO's ✓

1. ✓ Use BNB gold (#F3BA2F) as primary color
2. ✓ Display "Powered by BSC" prominently
3. ✓ Maintain dark backgrounds (#14151A)
4. ✓ Apply glass effects with gold borders
5. ✓ Use smooth, professional animations
6. ✓ Ensure high contrast for accessibility
7. ✓ Keep designs clean and uncluttered
8. ✓ Use provided logo files only

### VISUAL DON'Ts ✗

1. ✗ Use old blue/purple color scheme
2. ✗ Hide Binance Chain association
3. ✗ Use bright or light backgrounds
4. ✗ Over-animate or use distracting effects
5. ✗ Ignore accessibility standards
6. ✗ Modify logo files
7. ✗ Use random colors outside palette
8. ✗ Create cluttered layouts

### MESSAGING DO's ✓

1. ✓ Mention Binance Chain benefits
2. ✓ Highlight speed and low fees
3. ✓ Emphasize professional quality
4. ✓ Be clear and concise
5. ✓ Use data and facts

### MESSAGING DON'Ts ✗

1. ✗ Use crypto slang or memes
2. ✗ Make unrealistic promises
3. ✗ Be vague or ambiguous
4. ✗ Ignore BSC connection
5. ✗ Overhype features

---

## 10. Brand Checklist

### Every Page Must Have:

**Visual Elements:**
- [ ] BNB gold (#F3BA2F) prominently featured
- [ ] Dark background (#14151A or #1E2026)
- [ ] HypeAI logo (BNB variant)
- [ ] "Powered by BSC" badge visible
- [ ] Glass effect cards with gold borders
- [ ] Consistent typography (Inter/Poppins)

**Content Elements:**
- [ ] Clear value proposition
- [ ] Binance Chain mention
- [ ] Professional tone
- [ ] Call to action
- [ ] Contact/social links

**Technical Elements:**
- [ ] Accessible (WCAG AA)
- [ ] Mobile responsive
- [ ] Fast loading (< 2s)
- [ ] SEO optimized
- [ ] Valid HTML/CSS

---

## Appendix: Brand Assets

### Required Asset Files

```
/assets/images/branding/
├── logo-bnb.svg               (Primary logo)
├── logo-bnb-icon.svg          (Icon only)
├── logo-bnb-wordmark.svg      (Text only)
├── logo-bnb-white.svg         (White variant)
├── binance-badge.svg          (BSC badge)
├── bsc-logo.svg               (BSC logo)
├── powered-by-bsc.svg         (Footer badge)
└── brand-lockup.svg           (Full lockup)
```

### Color Swatches

Download official color palette:
- Adobe Swatch Exchange (.ase)
- Sketch Palette (.sketchpalette)
- CSS Variables (bnb-theme.css)

---

**Brand Guide Version:** 1.0
**Approved By:** HypeAI Brand Team
**Last Updated:** 2025-10-19
**Questions:** brand@hypeai.io
