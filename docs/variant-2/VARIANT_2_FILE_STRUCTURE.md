# HypeAI Variant 2 - Complete File Structure
## Binance Chain Website File Organization

**Version:** 2.0.0
**Created:** 2025-10-19
**Branch:** variant-2-website

---

## 1. Directory Structure Overview

```
/Users/ai.place/Crypto/public/variant-2/
├── index.html                      (Homepage)
├── about.html                      (About page)
├── agents.html                     (AI Agents showcase)
├── analytics.html                  (Analytics dashboard)
├── api.html                        (API documentation)
├── audit.html                      (Security audit)
├── blog.html                       (Blog/news)
├── cookies.html                    (Cookie policy)
├── docs.html                       (Documentation)
├── governance.html                 (Governance system)
├── privacy.html                    (Privacy policy)
├── proof.html                      (Proof of reserves)
├── roadmap.html                    (Project roadmap)
├── stake.html                      (Staking platform)
├── terms.html                      (Terms of service)
├── trade.html                      (Trading interface)
├── whitepaper.html                 (Whitepaper)
├── manifest.json                   (PWA manifest)
├── service-worker.js               (PWA service worker)
├── robots.txt                      (SEO robots)
├── sitemap.xml                     (SEO sitemap)
│
├── css/
│   ├── bnb-theme.css              (Design system & variables)
│   ├── components.css             (Reusable components)
│   ├── animations.css             (Keyframes & transitions)
│   ├── responsive.css             (Media queries)
│   ├── utilities.css              (Utility classes)
│   └── pages/
│       ├── home.css               (Homepage styles)
│       ├── about.css              (About page styles)
│       ├── agents.css             (Agents page styles)
│       ├── trade.css              (Trading interface)
│       ├── stake.css              (Staking interface)
│       └── docs.css               (Documentation styles)
│
├── js/
│   ├── core/
│   │   ├── app.js                 (Main application)
│   │   ├── router.js              (Client-side routing)
│   │   ├── state.js               (State management)
│   │   └── config.js              (Configuration)
│   │
│   ├── components/
│   │   ├── header.js              (Header component)
│   │   ├── footer.js              (Footer component)
│   │   ├── hero.js                (Hero section)
│   │   ├── stats-counter.js       (Animated counters)
│   │   ├── feature-card.js        (Feature cards)
│   │   ├── agent-card.js          (AI agent cards)
│   │   ├── wallet-connect.js      (Wallet connection)
│   │   ├── network-selector.js    (BSC network selector)
│   │   ├── mobile-menu.js         (Mobile navigation)
│   │   └── modal.js               (Modal dialogs)
│   │
│   ├── features/
│   │   ├── charts.js              (Chart.js integration)
│   │   ├── staking-calc.js        (Staking calculator)
│   │   ├── tokenomics.js          (Token charts)
│   │   ├── governance.js          (Governance voting)
│   │   └── trading.js             (Trading logic)
│   │
│   ├── utils/
│   │   ├── animations.js          (Animation helpers)
│   │   ├── formatters.js          (Number/date formatters)
│   │   ├── validators.js          (Form validation)
│   │   ├── api.js                 (API client)
│   │   └── web3.js                (Web3 utilities)
│   │
│   └── pages/
│       ├── home.js                (Homepage logic)
│       ├── agents.js              (Agents page logic)
│       ├── trade.js               (Trading page logic)
│       └── stake.js               (Staking page logic)
│
├── assets/
│   ├── images/
│   │   ├── logo/
│   │   │   ├── logo-bnb.svg       (Main BNB logo)
│   │   │   ├── logo-bnb-icon.svg  (Icon only)
│   │   │   ├── logo-bnb-white.svg (White variant)
│   │   │   └── logo-bnb-dark.svg  (Dark variant)
│   │   │
│   │   ├── branding/
│   │   │   ├── binance-badge.svg  (BSC badge)
│   │   │   ├── bsc-logo.svg       (BSC logo)
│   │   │   ├── powered-by-bsc.svg (Footer badge)
│   │   │   └── bnb-icon.svg       (BNB icon)
│   │   │
│   │   ├── hero/
│   │   │   ├── hero-bg.webp       (Hero background)
│   │   │   ├── hero-bg-mobile.webp
│   │   │   ├── particles.json     (Particle effect)
│   │   │   └── gradient-orb.svg   (Decorative)
│   │   │
│   │   ├── agents/
│   │   │   ├── agent-avatar-1.svg
│   │   │   ├── agent-avatar-2.svg
│   │   │   └── ... (27 total)
│   │   │
│   │   ├── features/
│   │   │   ├── ai-services.svg
│   │   │   ├── tokenomics.svg
│   │   │   ├── staking.svg
│   │   │   ├── governance.svg
│   │   │   ├── trading.svg
│   │   │   └── analytics.svg
│   │   │
│   │   ├── og/
│   │   │   ├── og-image-home.jpg  (1200x630)
│   │   │   ├── og-image-agents.jpg
│   │   │   └── twitter-card.jpg   (1200x600)
│   │   │
│   │   └── misc/
│   │       ├── placeholder.svg
│   │       └── error-404.svg
│   │
│   ├── icons/
│   │   ├── ai-agent.svg
│   │   ├── wallet.svg
│   │   ├── staking.svg
│   │   ├── governance.svg
│   │   ├── chart.svg
│   │   ├── lock.svg
│   │   ├── rocket.svg
│   │   ├── shield.svg
│   │   ├── lightning.svg
│   │   ├── twitter.svg
│   │   ├── telegram.svg
│   │   ├── discord.svg
│   │   ├── github.svg
│   │   └── menu.svg
│   │
│   ├── animations/
│   │   ├── particles-config.json
│   │   ├── lottie-logo.json
│   │   └── loading-spinner.json
│   │
│   └── fonts/ (if self-hosted)
│       ├── Inter/
│       │   ├── Inter-Regular.woff2
│       │   ├── Inter-Medium.woff2
│       │   ├── Inter-SemiBold.woff2
│       │   └── Inter-Bold.woff2
│       │
│       └── Poppins/
│           ├── Poppins-Regular.woff2
│           ├── Poppins-SemiBold.woff2
│           └── Poppins-Bold.woff2
│
├── data/
│   ├── agents.json                (AI agents data)
│   ├── tokenomics.json            (Token data)
│   ├── roadmap.json               (Roadmap milestones)
│   ├── team.json                  (Team members)
│   ├── partnerships.json          (Partners)
│   └── stats.json                 (Live stats)
│
└── docs/
    ├── README.md                  (Variant 2 overview)
    ├── SETUP.md                   (Setup instructions)
    ├── COMPONENTS.md              (Component docs)
    └── API.md                     (API documentation)
```

---

## 2. Detailed File Descriptions

### 2.1 HTML Pages (28 total)

#### Core Pages
| File | Purpose | Priority |
|------|---------|----------|
| `index.html` | Homepage - Main entry point | Critical |
| `about.html` | About HypeAI, team, mission | High |
| `agents.html` | 27 AI agents showcase | High |
| `whitepaper.html` | Technical whitepaper | High |

#### Trading & Finance
| File | Purpose | Priority |
|------|---------|----------|
| `trade.html` | Trading interface | Critical |
| `stake.html` | Staking platform | Critical |
| `governance.html` | DAO governance | High |
| `analytics.html` | Portfolio analytics | Medium |

#### Documentation
| File | Purpose | Priority |
|------|---------|----------|
| `docs.html` | Documentation hub | High |
| `api.html` | API documentation | Medium |
| `roadmap.html` | Project roadmap | Medium |
| `blog.html` | News & updates | Medium |

#### Legal & Compliance
| File | Purpose | Priority |
|------|---------|----------|
| `audit.html` | Security audit reports | High |
| `proof.html` | Proof of reserves | High |
| `privacy.html` | Privacy policy | Required |
| `terms.html` | Terms of service | Required |
| `cookies.html` | Cookie policy | Required |

### 2.2 CSS Architecture

#### Core Stylesheets

**bnb-theme.css** (Main design system)
```css
/* File size target: ~15-20KB */
/* Contains: */
- CSS custom properties (colors, spacing, etc.)
- Reset & base styles
- Typography system
- Color system
- Spacing scale
- Shadow & glow effects
- Z-index scale
```

**components.css** (Reusable components)
```css
/* File size target: ~30-40KB */
/* Contains: */
- Header component
- Footer component
- Hero sections
- Feature cards
- Stats counters
- Agent cards
- Buttons & forms
- Modals & overlays
- Navigation menus
```

**animations.css** (All animations)
```css
/* File size target: ~10-15KB */
/* Contains: */
- Keyframe animations
- Transition utilities
- Hover effects
- Loading animations
- Scroll animations
- Particle effects
```

**responsive.css** (Media queries)
```css
/* File size target: ~20-25KB */
/* Contains: */
- Mobile styles (< 640px)
- Tablet styles (640px - 1024px)
- Desktop styles (> 1024px)
- Component breakpoints
- Grid adjustments
```

**utilities.css** (Utility classes)
```css
/* File size target: ~8-10KB */
/* Contains: */
- Flexbox utilities
- Grid utilities
- Spacing utilities
- Text utilities
- Display utilities
- Visibility helpers
```

#### Page-Specific Stylesheets

**home.css**
```css
/* Homepage-specific styles */
- Hero section variations
- Feature grid layout
- Why BSC section
- CTA sections
```

**agents.css**
```css
/* Agents page styles */
- Agent card grid
- Activity feed
- Performance charts
- Filter controls
```

**trade.css**
```css
/* Trading interface */
- Order book layout
- Chart containers
- Trading form
- Price ticker
```

**stake.css**
```css
/* Staking interface */
- Staking calculator
- Pool cards
- Rewards display
- Vesting timeline
```

### 2.3 JavaScript Modules

#### Core Modules

**app.js** (Main entry point)
```javascript
// Responsibilities:
// - Initialize application
// - Load configuration
// - Set up event listeners
// - Handle page load
// - Coordinate modules
// Target size: ~5-8KB
```

**router.js** (Client-side routing)
```javascript
// Responsibilities:
// - URL routing
// - Page transitions
// - History management
// - Deep linking
// Target size: ~3-5KB
```

**state.js** (State management)
```javascript
// Responsibilities:
// - Global state
// - Reactive updates
// - Local storage sync
// - State persistence
// Target size: ~4-6KB
```

**config.js** (Configuration)
```javascript
// Contains:
// - API endpoints
// - Contract addresses
// - Network configs
// - Feature flags
// Target size: ~2-3KB
```

#### Component Modules

**header.js**
```javascript
// Features:
// - Sticky header behavior
// - Mobile menu toggle
// - Wallet connection
// - Network selector
// Target size: ~6-8KB
```

**stats-counter.js**
```javascript
// Features:
// - Counting animation
// - Intersection observer
// - Number formatting
// - Trend indicators
// Target size: ~4-5KB
```

**wallet-connect.js**
```javascript
// Features:
// - MetaMask integration
// - WalletConnect protocol
// - BSC network detection
// - Account management
// Target size: ~10-12KB
```

#### Feature Modules

**charts.js**
```javascript
// Features:
// - Chart.js wrapper
// - Tokenomics charts
// - Performance graphs
// - Real-time updates
// Target size: ~8-10KB
```

**staking-calc.js**
```javascript
// Features:
// - APY calculations
// - Reward estimation
// - Vesting schedule
// - Compound interest
// Target size: ~5-7KB
```

### 2.4 Asset Organization

#### Image Optimization Standards

| Type | Format | Max Size | Compression |
|------|--------|----------|-------------|
| Logos | SVG | 10KB | Minified |
| Icons | SVG | 5KB | Minified |
| Photos | WebP | 200KB | 80% quality |
| Backgrounds | WebP | 300KB | 75% quality |
| OG Images | JPG | 150KB | 85% quality |

#### Icon Library

All icons in SVG format with consistent viewBox (24x24):

```
icons/
├── ai-agent.svg          (Robot/AI symbol)
├── wallet.svg            (Wallet icon)
├── staking.svg           (Staking symbol)
├── governance.svg        (Vote/governance)
├── chart.svg             (Chart/analytics)
├── lock.svg              (Security/locked)
├── rocket.svg            (Launch/growth)
├── shield.svg            (Protection/audit)
├── lightning.svg         (Fast/instant)
├── twitter.svg           (Social)
├── telegram.svg          (Social)
├── discord.svg           (Social)
├── github.svg            (Social)
└── menu.svg              (Mobile menu)
```

### 2.5 Data Files

**agents.json**
```json
{
  "agents": [
    {
      "id": 1,
      "name": "Alpha Trader",
      "category": "Trading",
      "status": "active",
      "avatar": "/assets/images/agents/agent-avatar-1.svg",
      "metrics": {
        "successRate": 87.5,
        "tasksCompleted": 1243,
        "uptime": 99.8
      }
    }
  ]
}
```

**tokenomics.json**
```json
{
  "totalSupply": 1000000000,
  "distribution": {
    "privateSale": 20,
    "publicSale": 30,
    "liquidity": 25,
    "team": 15,
    "treasury": 10
  },
  "vesting": {
    "team": "6 months cliff, 24 months linear",
    "privateSale": "3 months cliff, 12 months linear"
  }
}
```

---

## 3. File Size Budgets

### Performance Targets

| Category | Budget | Actual | Status |
|----------|--------|--------|--------|
| HTML (per page) | 30KB | TBD | - |
| CSS (total) | 100KB | TBD | - |
| JS (total) | 150KB | TBD | - |
| Images (per page) | 500KB | TBD | - |
| Fonts | 100KB | TBD | - |
| **Total (per page)** | **880KB** | **TBD** | **-** |

### Critical Path Budget

| Resource | Budget | Priority |
|----------|--------|----------|
| Critical CSS | 14KB | Critical |
| Core JS | 20KB | Critical |
| Logo | 5KB | Critical |
| Hero image | 150KB | High |

---

## 4. Migration Plan

### Phase 1: Create Structure
```bash
# Create all directories
mkdir -p public/variant-2/{css/pages,js/{core,components,features,utils,pages},assets/{images/{logo,branding,hero,agents,features,og,misc},icons,animations,fonts/{Inter,Poppins}},data,docs}

# Create placeholder files
touch public/variant-2/{index,about,agents,analytics,api,audit,blog,cookies,docs,governance,privacy,proof,roadmap,stake,terms,trade,whitepaper}.html
```

### Phase 2: Copy & Adapt Existing Assets
```bash
# Copy current logos (will be redesigned)
cp public/logo-icon-only.svg public/variant-2/assets/images/logo/logo-bnb-icon.svg

# Copy existing data if applicable
cp -r data/* public/variant-2/data/
```

### Phase 3: Build Design System
1. Create `bnb-theme.css` with BNB colors
2. Create `components.css` with shared components
3. Create `animations.css` with keyframes
4. Test in isolation

### Phase 4: Build Components
1. Header → Footer → Hero
2. Feature cards → Stats counters
3. Agent cards → Charts
4. Forms → Modals

### Phase 5: Build Pages
1. Homepage first (foundation)
2. About & Agents (content)
3. Trade & Stake (functionality)
4. Docs & Legal (final)

---

## 5. Naming Conventions

### CSS Classes
```css
/* BEM Methodology */
.block {}
.block__element {}
.block__element--modifier {}

/* Examples */
.bnb-header {}
.bnb-header__logo {}
.bnb-header__logo--mobile {}

.feature-card {}
.feature-card__icon {}
.feature-card__icon--highlighted {}
```

### JavaScript
```javascript
// camelCase for variables/functions
const userWallet = '0x...';
function connectWallet() {}

// PascalCase for classes
class StatsCounter {}

// UPPER_SNAKE_CASE for constants
const BSC_MAINNET_ID = '0x38';
```

### Files
```
kebab-case for all files:
✓ bnb-theme.css
✓ stats-counter.js
✓ hero-background.webp

✗ bnbTheme.css
✗ StatsCounter.js
✗ hero_background.webp
```

### Data Attributes
```html
<!-- Use data-* for JavaScript hooks -->
<button data-action="connect-wallet">Connect</button>
<div data-counter-target="1000000">1M</div>
<section data-component="hero">...</section>
```

---

## 6. Version Control

### Branch Strategy
```
main (production)
├── variant-2-website (development)
│   ├── feature/header-component
│   ├── feature/hero-section
│   ├── feature/wallet-integration
│   └── feature/charts
```

### Commit Message Format
```
type(scope): description

Types: feat, fix, docs, style, refactor, test
Scopes: header, hero, cards, charts, wallet, etc.

Examples:
feat(header): add BNB-themed header with wallet connect
fix(charts): resolve chart rendering on mobile
docs(readme): update setup instructions
style(cards): adjust gold glow effect intensity
```

---

## 7. Dependencies

### CDN Libraries

```html
<!-- Chart.js for data visualization -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<!-- AOS (Animate On Scroll) -->
<link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>

<!-- Web3.js for blockchain interaction -->
<script src="https://cdn.jsdelivr.net/npm/web3@1.10.0/dist/web3.min.js"></script>

<!-- Particles.js (optional) -->
<script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
```

### Font Loading

```html
<!-- Google Fonts (preconnect for performance) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
```

---

## 8. Build & Deployment

### No Build Step Required
- Pure HTML/CSS/JS
- No transpilation needed
- No bundler required
- Direct deployment to static hosting

### Deployment Checklist
```
Pre-deployment:
[ ] Minify CSS
[ ] Minify JS
[ ] Optimize images
[ ] Generate sitemap
[ ] Test all links
[ ] Validate HTML
[ ] Check accessibility
[ ] Run Lighthouse

Deployment:
[ ] Upload to hosting
[ ] Configure CDN
[ ] Set up SSL
[ ] Test production URLs
[ ] Monitor performance
```

---

## 9. File Creation Order

### Priority 1 (Week 1)
```
1. css/bnb-theme.css
2. css/components.css
3. js/core/config.js
4. js/core/app.js
5. js/components/header.js
6. assets/images/logo/logo-bnb.svg
7. index.html
```

### Priority 2 (Week 2)
```
8. css/animations.css
9. css/pages/home.css
10. js/components/hero.js
11. js/components/stats-counter.js
12. js/components/feature-card.js
13. assets/images/hero/hero-bg.webp
```

### Priority 3 (Week 3)
```
14. agents.html
15. about.html
16. css/pages/agents.css
17. js/components/agent-card.js
18. js/features/charts.js
19. data/agents.json
```

### Priority 4 (Week 4)
```
20. trade.html
21. stake.html
22. governance.html
23. js/components/wallet-connect.js
24. js/features/staking-calc.js
25. js/features/trading.js
```

---

## 10. Maintenance Plan

### Regular Updates
- Weekly: Update stats data
- Monthly: Review analytics, optimize
- Quarterly: Major feature additions

### File Management
- Keep file sizes monitored
- Archive old images
- Clean up unused CSS/JS
- Update dependencies

---

**Document Version:** 1.0
**Last Updated:** 2025-10-19
**Maintained By:** HypeAI Development Team
