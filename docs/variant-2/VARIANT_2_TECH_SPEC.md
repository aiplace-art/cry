# HypeAI Variant 2 - Technical Specification
## Complete Implementation Guide for BNB-Themed Website

**Version:** 2.0.0
**Created:** 2025-10-19
**Status:** Technical Specification
**Branch:** variant-2-website

---

## 1. Technical Overview

### 1.1 Technology Stack

**Frontend Framework:**
- Pure HTML5, CSS3, JavaScript ES6+
- No build tools required
- No npm dependencies for core functionality
- Direct deployment to static hosting

**External Libraries (CDN):**
```javascript
// Chart.js - Data visualization
'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'

// AOS - Animate On Scroll
'https://unpkg.com/aos@2.3.1/dist/aos.css'
'https://unpkg.com/aos@2.3.1/dist/aos.js'

// Web3.js - Blockchain interaction
'https://cdn.jsdelivr.net/npm/web3@1.10.0/dist/web3.min.js'

// Optional: Particles.js for background effects
'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js'
```

**Browser Support:**
- Chrome 90+ (last 2 versions)
- Firefox 88+ (last 2 versions)
- Safari 14+ (last 2 versions)
- Edge 90+ (last 2 versions)
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

### 1.2 Architecture Patterns

**Component-Based Architecture:**
```javascript
// ES6 Class-based components
class Component {
  constructor(element, options) {
    this.element = element;
    this.options = options;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {}
  render() {}
  destroy() {}
}
```

**State Management:**
```javascript
// Simple reactive state
const AppState = new Proxy({
  wallet: null,
  user: null,
  theme: 'dark'
}, {
  set(target, property, value) {
    target[property] = value;
    AppState.emit('stateChange', { property, value });
    return true;
  }
});

AppState.listeners = new Map();
AppState.on = (event, callback) => {
  if (!AppState.listeners.has(event)) {
    AppState.listeners.set(event, []);
  }
  AppState.listeners.get(event).push(callback);
};

AppState.emit = (event, data) => {
  if (AppState.listeners.has(event)) {
    AppState.listeners.get(event).forEach(cb => cb(data));
  }
};
```

**Module Pattern:**
```javascript
// Self-contained modules
const BNBHeader = (() => {
  let instance = null;

  class Header {
    constructor() {
      if (instance) return instance;
      instance = this;
      this.init();
    }

    init() {
      // Initialize header
    }
  }

  return Header;
})();
```

---

## 2. HTML Templates

### 2.1 Base HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- SEO Meta Tags -->
  <title>HypeAI - AI Services on Binance Chain</title>
  <meta name="description" content="Professional AI services powered by Binance Smart Chain. 27 AI agents, fast transactions, low fees.">
  <meta name="keywords" content="HypeAI, Binance Chain, BSC, AI, DeFi, staking">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://hypeai.io/">
  <meta property="og:title" content="HypeAI - AI on Binance Chain">
  <meta property="og:description" content="27 AI agents on BSC">
  <meta property="og:image" content="https://hypeai.io/og-image-bnb.jpg">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/assets/images/logo/logo-bnb-icon.svg">

  <!-- Preconnect for Performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet">

  <!-- Critical CSS (Inlined) -->
  <style>
    /* Above-the-fold critical CSS */
    :root {
      --bnb-gold: #F3BA2F;
      --bnb-dark: #14151A;
    }
    body {
      margin: 0;
      font-family: 'Inter', sans-serif;
      background: #14151A;
      color: #fff;
    }
    /* More critical styles... */
  </style>

  <!-- Stylesheets -->
  <link rel="preload" href="/css/bnb-theme.css" as="style">
  <link rel="stylesheet" href="/css/bnb-theme.css">
  <link rel="stylesheet" href="/css/components.css">
  <link rel="stylesheet" href="/css/animations.css">
  <link rel="stylesheet" href="/css/responsive.css">
  <link rel="stylesheet" href="/css/pages/home.css">
</head>
<body>
  <!-- Skip to main content (Accessibility) -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Header -->
  <header id="site-header" class="bnb-header">
    <!-- Header content -->
  </header>

  <!-- Main Content -->
  <main id="main-content">
    <!-- Page content -->
  </main>

  <!-- Footer -->
  <footer id="site-footer" class="bnb-footer">
    <!-- Footer content -->
  </footer>

  <!-- Scripts -->
  <script src="/js/core/config.js" defer></script>
  <script src="/js/core/app.js" defer></script>
  <script src="/js/components/header.js" defer></script>
  <script src="/js/pages/home.js" defer></script>
</body>
</html>
```

### 2.2 Header Component Template

```html
<header class="bnb-header" role="banner">
  <div class="header-container">
    <!-- Logo -->
    <div class="header-logo">
      <a href="/" aria-label="HypeAI Home">
        <img src="/assets/images/logo/logo-bnb.svg" alt="HypeAI Logo" width="180" height="40">
      </a>
    </div>

    <!-- Desktop Navigation -->
    <nav class="header-nav" role="navigation" aria-label="Main navigation">
      <ul class="nav-menu" role="menubar">
        <li role="none">
          <a href="/" role="menuitem" class="nav-link active">Home</a>
        </li>
        <li role="none">
          <a href="/agents.html" role="menuitem" class="nav-link">AI Agents</a>
        </li>
        <li role="none">
          <a href="/about.html" role="menuitem" class="nav-link">About</a>
        </li>
        <li role="none" class="nav-dropdown">
          <button role="menuitem" aria-haspopup="true" aria-expanded="false" class="nav-link">
            Services
            <svg class="icon-chevron" width="16" height="16">
              <use href="#icon-chevron-down"></use>
            </svg>
          </button>
          <ul role="menu" class="dropdown-menu">
            <li role="none">
              <a href="/trade.html" role="menuitem">Trade</a>
            </li>
            <li role="none">
              <a href="/stake.html" role="menuitem">Stake</a>
            </li>
            <li role="none">
              <a href="/governance.html" role="menuitem">Governance</a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <!-- BSC Badge -->
    <div class="bsc-badge" role="img" aria-label="Powered by Binance Smart Chain">
      <img src="/assets/icons/bsc-logo.svg" alt="" width="24" height="24">
      <span>BSC</span>
    </div>

    <!-- Wallet Connect -->
    <button id="wallet-connect" class="btn-primary">
      <svg class="icon" width="20" height="20">
        <use href="#icon-wallet"></use>
      </svg>
      <span>Connect Wallet</span>
    </button>

    <!-- Mobile Menu Toggle -->
    <button class="mobile-menu-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
      <span class="hamburger"></span>
    </button>
  </div>

  <!-- Mobile Navigation -->
  <div class="mobile-nav" id="mobile-nav" hidden>
    <nav aria-label="Mobile navigation">
      <!-- Mobile menu items -->
    </nav>
  </div>
</header>
```

### 2.3 Hero Section Template

```html
<section class="hero-section" role="banner">
  <div class="hero-background">
    <!-- Animated gradient background -->
    <div class="gradient-orb gradient-orb-1"></div>
    <div class="gradient-orb gradient-orb-2"></div>
  </div>

  <div class="hero-container">
    <div class="hero-content">
      <!-- Badge -->
      <div class="hero-badge" data-aos="fade-down">
        <img src="/assets/icons/bsc-logo.svg" alt="BSC" width="20" height="20">
        <span>Powered by Binance Smart Chain</span>
      </div>

      <!-- Headline -->
      <h1 class="hero-title" data-aos="fade-up" data-aos-delay="100">
        AI-Powered Services on
        <span class="text-gradient-gold">Binance Chain</span>
      </h1>

      <!-- Subheadline -->
      <p class="hero-subtitle" data-aos="fade-up" data-aos-delay="200">
        Professional AI services for everyone. Fast transactions, low fees, 27 AI agents working 24/7.
      </p>

      <!-- CTAs -->
      <div class="hero-cta" data-aos="fade-up" data-aos-delay="300">
        <a href="#private-sale" class="btn-primary btn-lg">
          Join Private Sale
          <svg class="icon" width="20" height="20">
            <use href="#icon-arrow-right"></use>
          </svg>
        </a>
        <a href="/agents.html" class="btn-secondary btn-lg">
          Explore AI Agents
        </a>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="hero-stats" data-aos="fade-up" data-aos-delay="400">
      <div class="stat-item">
        <div class="stat-value" data-counter data-target="12500000" data-suffix="">$12.5M</div>
        <div class="stat-label">Total Value Locked</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" data-counter data-target="15420">15.4K</div>
        <div class="stat-label">Active Users</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" data-counter data-target="2847634">2.8M</div>
        <div class="stat-label">Transactions</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" data-counter data-target="27">27</div>
        <div class="stat-label">AI Agents</div>
      </div>
    </div>
  </div>

  <!-- Scroll Indicator -->
  <div class="scroll-indicator" aria-hidden="true">
    <div class="scroll-mouse">
      <div class="scroll-wheel"></div>
    </div>
  </div>
</section>
```

### 2.4 Feature Card Template

```html
<div class="feature-card" data-aos="fade-up">
  <div class="feature-icon-wrapper">
    <div class="feature-icon gradient-gold">
      <svg class="icon" width="32" height="32">
        <use href="#icon-ai-agent"></use>
      </svg>
    </div>
  </div>

  <h3 class="feature-title">AI Services Platform</h3>

  <p class="feature-description">
    27 specialized AI agents working around the clock to analyze markets, execute trades, and optimize your portfolio.
  </p>

  <a href="/agents.html" class="feature-link">
    Learn more
    <svg class="icon" width="16" height="16">
      <use href="#icon-arrow-right"></use>
    </svg>
  </a>
</div>
```

---

## 3. CSS Implementation

### 3.1 Design System (bnb-theme.css)

```css
/* ================================================
   HypeAI Variant 2 - BNB Design System
   ================================================ */

:root {
  /* === BNB COLOR SYSTEM === */

  /* Primary Colors */
  --bnb-gold-primary: #F3BA2F;
  --bnb-gold-secondary: #FCD535;
  --bnb-gold-dark: #E5A91A;
  --bnb-gold-glow: rgba(243, 186, 47, 0.4);

  /* Background Colors */
  --bnb-bg-darker: #14151A;
  --bnb-bg-dark: #1E2026;
  --bnb-bg-elevated: #2B2F36;
  --bnb-bg-subtle: rgba(30, 32, 38, 0.6);

  /* Semantic Colors */
  --bnb-success: #0ECB81;
  --bnb-error: #F6465D;
  --bnb-warning: #F0B90B;
  --bnb-info: #00D4FF;

  /* Text Colors */
  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
  --text-tertiary: #9CA3AF;
  --text-muted: #6B7280;

  /* Glass Effect */
  --glass-bg: rgba(30, 32, 38, 0.4);
  --glass-border: rgba(243, 186, 47, 0.2);
  --glass-highlight: rgba(243, 186, 47, 0.1);

  /* === TYPOGRAPHY === */

  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'Poppins', 'Inter', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
  --text-6xl: 3.75rem;

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* === SPACING === */

  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  --spacing-20: 5rem;     /* 80px */

  /* === BORDER RADIUS === */

  --radius-sm: 0.5rem;    /* 8px */
  --radius-md: 0.75rem;   /* 12px */
  --radius-lg: 1rem;      /* 16px */
  --radius-xl: 1.5rem;    /* 24px */
  --radius-2xl: 2rem;     /* 32px */
  --radius-full: 9999px;

  /* === SHADOWS === */

  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.15);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.25);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.3);

  /* Glass Shadows */
  --shadow-glass:
    0 8px 32px rgba(0, 0, 0, 0.37),
    inset 0 1px 0 rgba(243, 186, 47, 0.15);

  --shadow-glass-hover:
    0 12px 48px rgba(243, 186, 47, 0.25),
    inset 0 1px 0 rgba(243, 186, 47, 0.2);

  /* BNB Glow Effects */
  --glow-gold-sm: 0 0 20px rgba(243, 186, 47, 0.3);
  --glow-gold-md: 0 0 40px rgba(243, 186, 47, 0.4);
  --glow-gold-lg: 0 0 60px rgba(243, 186, 47, 0.5);

  /* === ANIMATIONS === */

  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;

  /* === BLUR === */

  --blur-sm: 8px;
  --blur-md: 16px;
  --blur-lg: 24px;
  --blur-xl: 32px;

  /* === Z-INDEX === */

  --z-base: 1;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal: 500;
  --z-tooltip: 700;
}

/* === RESET === */

*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  background: var(--bnb-bg-darker);
  overflow-x: hidden;
}

/* === TYPOGRAPHY === */

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--text-primary);
}

h1 { font-size: var(--text-5xl); }
h2 { font-size: var(--text-3xl); }
h3 { font-size: var(--text-xl); }

p {
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}

a {
  color: var(--bnb-gold-primary);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-smooth);
}

a:hover {
  color: var(--bnb-gold-secondary);
}

/* === UTILITY CLASSES === */

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--blur-lg));
  -webkit-backdrop-filter: blur(var(--blur-lg));
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-glass);
}

.glass:hover {
  border-color: rgba(243, 186, 47, 0.4);
  box-shadow: var(--shadow-glass-hover);
}

.gradient-gold {
  background: linear-gradient(135deg, var(--bnb-gold-primary) 0%, var(--bnb-gold-secondary) 100%);
}

.text-gradient-gold {
  background: linear-gradient(135deg, var(--bnb-gold-primary) 0%, var(--bnb-gold-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.glow-gold {
  box-shadow: var(--glow-gold-md);
}

/* === ANIMATIONS === */

@keyframes goldPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(243, 186, 47, 0.4);
  }
  50% {
    box-shadow: 0 0 40px rgba(243, 186, 47, 0.6);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* === ACCESSIBILITY === */

.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  background: var(--bnb-gold-primary);
  color: #000;
  padding: var(--spacing-2) var(--spacing-4);
  z-index: 1000;
  border-radius: var(--radius-sm);
}

.skip-link:focus {
  top: var(--spacing-2);
}

:focus-visible {
  outline: 2px solid var(--bnb-gold-primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(243, 186, 47, 0.2);
}

/* === RESPONSIVE BASE === */

.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

@media (min-width: 768px) {
  .container {
    padding: 0 var(--spacing-8);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 var(--spacing-12);
  }
}
```

### 3.2 Component Styles (components.css)

```css
/* ================================================
   Component Styles
   ================================================ */

/* === HEADER === */

.bnb-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fixed);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--blur-lg));
  border-bottom: 1px solid var(--glass-border);
  padding: var(--spacing-4) 0;
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-6);
}

.header-logo img {
  height: 40px;
  width: auto;
}

.nav-menu {
  display: none;
  list-style: none;
  gap: var(--spacing-6);
}

@media (min-width: 1024px) {
  .nav-menu {
    display: flex;
  }
}

.nav-link {
  position: relative;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  padding: var(--spacing-2) 0;
  transition: color var(--duration-fast) var(--ease-smooth);
}

.nav-link:hover,
.nav-link.active {
  color: var(--bnb-gold-primary);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--bnb-gold-primary), var(--bnb-gold-secondary));
  border-radius: 2px;
}

/* === BSC BADGE === */

.bsc-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: rgba(243, 186, 47, 0.1);
  border: 1px solid rgba(243, 186, 47, 0.3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--bnb-gold-primary);
}

.bsc-badge img {
  width: 20px;
  height: 20px;
}

/* === BUTTONS === */

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  background: linear-gradient(135deg, var(--bnb-gold-primary) 0%, var(--bnb-gold-secondary) 100%);
  color: #000;
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-smooth);
  box-shadow: 0 4px 16px rgba(243, 186, 47, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(243, 186, 47, 0.5);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  background: transparent;
  color: var(--bnb-gold-primary);
  border: 2px solid var(--bnb-gold-primary);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-smooth);
}

.btn-secondary:hover {
  background: rgba(243, 186, 47, 0.1);
  box-shadow: 0 0 20px rgba(243, 186, 47, 0.3);
}

/* === FEATURE CARDS === */

.feature-card {
  padding: var(--spacing-8);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--blur-lg));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glass);
  transition: all var(--duration-normal) var(--ease-smooth);
}

.feature-card:hover {
  border-color: rgba(243, 186, 47, 0.4);
  box-shadow: var(--shadow-glass-hover);
  transform: translateY(-4px);
}

.feature-icon-wrapper {
  margin-bottom: var(--spacing-6);
}

.feature-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  box-shadow: var(--glow-gold-sm);
}

.feature-title {
  margin-bottom: var(--spacing-4);
  color: var(--text-primary);
}

.feature-description {
  margin-bottom: var(--spacing-6);
  color: var(--text-secondary);
}

.feature-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  font-weight: var(--font-semibold);
  transition: gap var(--duration-fast) var(--ease-smooth);
}

.feature-link:hover {
  gap: var(--spacing-3);
}

/* === STATS COUNTER === */

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: var(--text-4xl);
  font-weight: var(--font-extrabold);
  color: var(--bnb-gold-primary);
  font-family: var(--font-display);
  line-height: 1;
  margin-bottom: var(--spacing-2);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* === FOOTER === */

.bnb-footer {
  background: var(--bnb-bg-dark);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--spacing-16) 0 var(--spacing-8);
  margin-top: var(--spacing-20);
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

/* More component styles... */
```

---

## 4. JavaScript Implementation

### 4.1 Configuration (config.js)

```javascript
/**
 * Application Configuration
 */

const CONFIG = {
  // API Endpoints
  API: {
    BASE_URL: 'https://api.hypeai.io/v1',
    ENDPOINTS: {
      AGENTS: '/agents',
      STATS: '/stats',
      TOKENOMICS: '/tokenomics'
    }
  },

  // Binance Smart Chain Configuration
  BSC: {
    MAINNET: {
      chainId: '0x38',
      chainName: 'Binance Smart Chain',
      rpcUrl: 'https://bsc-dataseed.binance.org/',
      blockExplorer: 'https://bscscan.com',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18
      }
    },
    TESTNET: {
      chainId: '0x61',
      chainName: 'BSC Testnet',
      rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      blockExplorer: 'https://testnet.bscscan.com',
      nativeCurrency: {
        name: 'tBNB',
        symbol: 'tBNB',
        decimals: 18
      }
    }
  },

  // Smart Contract Addresses (BSC Testnet)
  CONTRACTS: {
    HYPE_TOKEN: '0x...', // TODO: Add after deployment
    STAKING: '0x...',
    GOVERNANCE: '0x...'
  },

  // Feature Flags
  FEATURES: {
    WALLET_CONNECT: true,
    LIVE_CHARTS: true,
    AOS_ANIMATIONS: true
  },

  // Performance
  PERFORMANCE: {
    IMAGE_LAZY_LOAD: true,
    PREFETCH_LINKS: true
  }
};

// Make config globally available
window.APP_CONFIG = CONFIG;
```

### 4.2 Main Application (app.js)

```javascript
/**
 * Main Application Entry Point
 */

class HypeAIApp {
  constructor() {
    this.state = this.initState();
    this.components = new Map();
    this.init();
  }

  initState() {
    return new Proxy({
      wallet: {
        connected: false,
        address: null,
        network: null
      },
      user: {
        authenticated: false
      }
    }, {
      set: (target, property, value) => {
        target[property] = value;
        this.emit('stateChange', { property, value });
        return true;
      }
    });
  }

  async init() {
    try {
      // Wait for DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
      } else {
        this.onDOMReady();
      }
    } catch (error) {
      console.error('App initialization failed:', error);
    }
  }

  onDOMReady() {
    // Initialize AOS (Animate On Scroll)
    if (window.AOS && APP_CONFIG.FEATURES.AOS_ANIMATIONS) {
      AOS.init({
        duration: 800,
        easing: 'ease-out',
        once: true,
        offset: 100
      });
    }

    // Initialize components
    this.initComponents();

    // Set up event listeners
    this.setupEventListeners();

    // Load initial data
    this.loadInitialData();
  }

  initComponents() {
    // Initialize header
    const header = document.getElementById('site-header');
    if (header) {
      this.components.set('header', new BNBHeader(header));
    }

    // Initialize stats counters
    const counters = document.querySelectorAll('[data-counter]');
    counters.forEach(counter => {
      this.components.set(`counter-${counter.id}`, new StatsCounter(counter));
    });

    // Initialize wallet connect
    const walletBtn = document.getElementById('wallet-connect');
    if (walletBtn) {
      this.components.set('wallet', new WalletConnect(walletBtn));
    }
  }

  setupEventListeners() {
    // Handle wallet state changes
    this.on('stateChange', ({ property, value }) => {
      if (property === 'wallet') {
        this.handleWalletStateChange(value);
      }
    });
  }

  async loadInitialData() {
    // Load stats, agents, etc.
    try {
      const stats = await this.fetchStats();
      this.updateStats(stats);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }

  async fetchStats() {
    const response = await fetch(`${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.STATS}`);
    return response.json();
  }

  updateStats(stats) {
    // Update UI with stats
  }

  // Event emitter methods
  listeners = new Map();

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
}

// Initialize app
const app = new HypeAIApp();

// Make app globally available for debugging
window.HypeAI = app;
```

### 4.3 Stats Counter Component (stats-counter.js)

```javascript
/**
 * Animated Stats Counter Component
 */

class StatsCounter {
  constructor(element) {
    this.element = element;
    this.target = parseFloat(element.dataset.target) || 0;
    this.suffix = element.dataset.suffix || '';
    this.duration = parseInt(element.dataset.duration) || 2000;
    this.hasAnimated = false;

    this.init();
  }

  init() {
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    const options = {
      threshold: 0.5,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.animate();
          this.hasAnimated = true;
        }
      });
    }, options);

    observer.observe(this.element);
  }

  animate() {
    const start = 0;
    const end = this.target;
    const duration = this.duration;
    const startTime = performance.now();

    const easeOutQuart = (t) => 1 - (--t) * t * t * t;

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = start + (end - start) * eased;

      this.element.textContent = this.formatNumber(current) + this.suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        this.element.textContent = this.formatNumber(end) + this.suffix;
      }
    };

    requestAnimationFrame(update);
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num).toLocaleString();
  }
}

// Auto-initialize all counters
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-counter]').forEach(el => {
    new StatsCounter(el);
  });
});
```

### 4.4 Wallet Connect Component (wallet-connect.js)

```javascript
/**
 * Wallet Connection Component
 * Handles MetaMask and WalletConnect integration
 */

class WalletConnect {
  constructor(button) {
    this.button = button;
    this.web3 = null;
    this.account = null;
    this.chainId = null;

    this.init();
  }

  init() {
    this.button.addEventListener('click', () => this.connect());
    this.checkExistingConnection();
  }

  async checkExistingConnection() {
    if (window.ethereum && window.ethereum.selectedAddress) {
      await this.connect();
    }
  }

  async connect() {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        this.showError('Please install MetaMask');
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      this.account = accounts[0];

      // Initialize Web3
      this.web3 = new Web3(window.ethereum);

      // Get chain ID
      this.chainId = await this.web3.eth.getChainId();

      // Check if on BSC
      const bscChainId = parseInt(APP_CONFIG.BSC.MAINNET.chainId, 16);

      if (this.chainId !== bscChainId) {
        await this.switchToBSC();
      }

      // Update UI
      this.updateButton(true);

      // Set up event listeners
      this.setupEthereumListeners();

      // Emit connected event
      if (window.HypeAI) {
        window.HypeAI.state.wallet = {
          connected: true,
          address: this.account,
          network: this.chainId
        };
      }

    } catch (error) {
      console.error('Wallet connection error:', error);
      this.showError('Connection failed: ' + error.message);
    }
  }

  async switchToBSC() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: APP_CONFIG.BSC.MAINNET.chainId }]
      });
    } catch (switchError) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: APP_CONFIG.BSC.MAINNET.chainId,
              chainName: APP_CONFIG.BSC.MAINNET.chainName,
              nativeCurrency: APP_CONFIG.BSC.MAINNET.nativeCurrency,
              rpcUrls: [APP_CONFIG.BSC.MAINNET.rpcUrl],
              blockExplorerUrls: [APP_CONFIG.BSC.MAINNET.blockExplorer]
            }]
          });
        } catch (addError) {
          throw new Error('Failed to add BSC network');
        }
      } else {
        throw switchError;
      }
    }
  }

  setupEthereumListeners() {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.account = accounts[0];
        this.updateButton(true);
      }
    });

    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  }

  disconnect() {
    this.account = null;
    this.updateButton(false);

    if (window.HypeAI) {
      window.HypeAI.state.wallet = {
        connected: false,
        address: null,
        network: null
      };
    }
  }

  updateButton(connected) {
    if (connected) {
      const short = this.account.slice(0, 6) + '...' + this.account.slice(-4);
      this.button.innerHTML = `
        <svg class="icon" width="20" height="20">
          <use href="#icon-wallet"></use>
        </svg>
        <span>${short}</span>
      `;
      this.button.classList.add('connected');
    } else {
      this.button.innerHTML = `
        <svg class="icon" width="20" height="20">
          <use href="#icon-wallet"></use>
        </svg>
        <span>Connect Wallet</span>
      `;
      this.button.classList.remove('connected');
    }
  }

  showError(message) {
    // Show toast or modal with error
    console.error(message);
    alert(message); // Replace with better UI
  }
}
```

---

## 5. Performance Optimization

### 5.1 Critical CSS Strategy

```html
<!-- Inline critical CSS for above-the-fold content -->
<style>
/* Only styles needed for first paint */
:root { --bnb-gold: #F3BA2F; --bnb-dark: #14151A; }
body { margin: 0; font-family: Inter, sans-serif; background: #14151A; }
.bnb-header { position: fixed; top: 0; background: rgba(30,32,38,0.6); }
.hero-section { min-height: 100vh; display: flex; align-items: center; }
/* ... more critical styles */
</style>

<!-- Preload and async load full CSS -->
<link rel="preload" href="/css/bnb-theme.css" as="style">
<link rel="stylesheet" href="/css/bnb-theme.css" media="print" onload="this.media='all'">
```

### 5.2 Image Optimization

```html
<!-- Use WebP with fallback -->
<picture>
  <source srcset="hero-bg.avif" type="image/avif">
  <source srcset="hero-bg.webp" type="image/webp">
  <img src="hero-bg.jpg" alt="Hero" loading="lazy" width="1920" height="1080">
</picture>

<!-- Lazy load images -->
<img src="placeholder.svg" data-src="agent-1.webp" loading="lazy" class="lazy">
```

### 5.3 JavaScript Optimization

```html
<!-- Defer non-critical JS -->
<script src="/js/core/app.js" defer></script>

<!-- Async load third-party scripts -->
<script src="https://cdn.jsdelivr.net/npm/chart.js" async></script>

<!-- Preload critical resources -->
<link rel="preload" href="/js/core/app.js" as="script">
```

---

## 6. Testing Requirements

### 6.1 Browser Testing Matrix

| Browser | Version | Desktop | Mobile | Priority |
|---------|---------|---------|--------|----------|
| Chrome | Latest | ✓ | ✓ | Critical |
| Firefox | Latest | ✓ | ✓ | High |
| Safari | Latest | ✓ | ✓ | High |
| Edge | Latest | ✓ | - | Medium |

### 6.2 Lighthouse Targets

```
Performance:    > 90
Accessibility:  > 95
Best Practices: > 95
SEO:           > 95
PWA:           > 90
```

### 6.3 Testing Checklist

**Functional Tests:**
- [ ] All links work
- [ ] Forms validate
- [ ] Wallet connects
- [ ] Charts render
- [ ] Animations play smoothly
- [ ] Mobile menu works

**Performance Tests:**
- [ ] Page load < 2s
- [ ] Time to Interactive < 2.5s
- [ ] No layout shifts
- [ ] Smooth 60fps animations

**Accessibility Tests:**
- [ ] Keyboard navigation
- [ ] Screen reader compatible
- [ ] Sufficient color contrast
- [ ] Focus indicators visible
- [ ] ARIA labels present

---

## 7. Deployment

### 7.1 Build Process

```bash
# No build required - pure HTML/CSS/JS
# Optional: Minify for production

# Minify CSS
npx csso public/variant-2/css/bnb-theme.css -o public/variant-2/css/bnb-theme.min.css

# Minify JS
npx terser public/variant-2/js/core/app.js -o public/variant-2/js/core/app.min.js -c -m

# Optimize images
npx @squoosh/cli --webp '{"quality":80}' public/variant-2/assets/images/**/*.{jpg,png}
```

### 7.2 Deployment Checklist

```
Pre-deployment:
[ ] All HTML validated
[ ] CSS/JS minified
[ ] Images optimized
[ ] Sitemap generated
[ ] robots.txt configured
[ ] Meta tags verified
[ ] Analytics added
[ ] Error pages created (404, 500)

Deployment:
[ ] Upload files to hosting
[ ] Configure CDN
[ ] Set up SSL certificate
[ ] Test all URLs
[ ] Check mobile responsiveness
[ ] Run Lighthouse audit

Post-deployment:
[ ] Monitor error logs
[ ] Track performance metrics
[ ] Verify analytics
[ ] Test from multiple locations
```

---

**Document Version:** 1.0
**Last Updated:** 2025-10-19
**Maintained By:** HypeAI Development Team
