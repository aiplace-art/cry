# Services Page Architecture Specification

## Executive Summary

Complete architectural blueprint for the services.html page matching the HypeAI main site design system. This specification ensures pixel-perfect consistency, professional quality, and zero bugs.

---

## 1. Design System Analysis

### 1.1 Core Design Tokens (from design-system.css)

```css
/* Color Palette */
--color-bg-darkest: #14151A;      /* Primary background */
--color-bg-dark: #1E2026;          /* Secondary background */
--color-bg-medium: #2A2D35;        /* Card backgrounds */
--color-primary: #F3BA2F;          /* BNB Gold - primary brand */
--color-primary-light: #FFD666;    /* Hover states */
--color-accent: #18DC7E;           /* Success/accent color */

/* Typography Scale */
--font-primary: 'Space Grotesk';   /* Headings & UI */
--fs-5xl: 3rem;                    /* Hero titles (48px) */
--fs-4xl: 2.25rem;                 /* Section headings (36px) */
--fs-3xl: 1.875rem;                /* Card titles (30px) */
--fs-base: 1rem;                   /* Body text (16px) */

/* Spacing (8px grid system) */
--space-4: 2rem;                   /* 32px - standard gap */
--space-6: 3rem;                   /* 48px - section padding */
--space-12: 6rem;                  /* 96px - large sections */

/* Transitions */
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
```

### 1.2 Visual Effects System

**Glassmorphism:**
- Background: `rgba(30, 32, 38, 0.7)`
- Backdrop blur: `blur(10px)`
- Border: `1px solid rgba(183, 189, 198, 0.1)`

**Cosmic Animations:**
- Gradient orbs with `blur(140px)` and floating animation
- Star field with parallax scrolling
- Text pulse glow effect
- Card hover with shine effect

**Interaction Patterns:**
- Hover: `translateY(-4px)` + glow shadow
- Active: `translateY(0)`
- Focus: `outline: 2px solid var(--color-primary)`

---

## 2. HTML Architecture

### 2.1 Document Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Critical Meta Tags -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- SEO Optimization -->
  <title>HypeAI Services - Professional AI-Powered Solutions</title>
  <meta name="description" content="[...]">

  <!-- CSS Loading Strategy -->
  <!-- 1. Critical inline styles (above fold) -->
  <!-- 2. Preload fonts -->
  <!-- 3. Load design system CSS -->
  <!-- 4. Load cosmic animations CSS -->
  <!-- 5. Load services-specific CSS -->
</head>

<body class="cosmic-bg">
  <!-- Accessibility: Skip to main -->
  <a href="#main-content" class="skip-to-main">Skip to main content</a>

  <!-- Navigation Component -->
  <nav class="nav-sticky">...</nav>

  <!-- Main Content -->
  <main id="main-content">
    <!-- Hero Section -->
    <section class="services-hero">...</section>

    <!-- Services Grid Section -->
    <section class="section">...</section>

    <!-- Advantages Section -->
    <section class="section bg-darker">...</section>

    <!-- CTA Section -->
    <section class="section">...</section>
  </main>

  <!-- Footer Component -->
  <footer class="footer">...</footer>

  <!-- JavaScript Loading Strategy -->
  <!-- 1. Core utilities (defer) -->
  <!-- 2. Cosmic animations (defer) -->
  <!-- 3. Services interactions (defer) -->
</body>
</html>
```

### 2.2 Component Hierarchy

```
Page
├── Navigation (Shared Component)
│   ├── Logo Link
│   ├── Nav Links (Desktop)
│   └── Actions (Language + Buy Button)
│
├── Services Hero Section
│   ├── Background Layer (Cosmic Effects)
│   ├── Content Layer
│   │   ├── Section Label
│   │   ├── Hero Title (with gradient text)
│   │   ├── Hero Description
│   │   └── Stats Grid (4 items)
│   │       ├── Stat Item (value + label)
│   │       └── [...]
│
├── Services Grid Section
│   ├── Services Tabs (Filter Navigation)
│   │   ├── Tab: All Services
│   │   ├── Tab: For Individuals
│   │   ├── Tab: For Businesses
│   │   └── Tab: Crypto/Web3
│   │
│   └── Featured Services Grid
│       ├── Featured Service Card (2-column span)
│       │   ├── Featured Badge
│       │   ├── Service Icon
│       │   ├── Service Title
│       │   ├── Service Description
│       │   ├── Pricing Grid (2 tiers)
│       │   ├── Service Agents Info
│       │   ├── Action Buttons
│       │   └── Trust Line
│       │
│       └── Standard Service Cards (1-column)
│           ├── Service Icon
│           ├── Service Title
│           ├── Service Description
│           ├── Pricing Simple
│           ├── Highlights List
│           └── CTA Button
│
├── Advantages Section
│   ├── Section Header
│   └── Advantages Grid (6 items)
│       └── Advantage Card
│           ├── Icon
│           ├── Title
│           └── Description
│
├── CTA Section
│   └── Large CTA Card
│       ├── CTA Title
│       ├── CTA Description
│       ├── Button Group
│       └── Trust Line
│
└── Footer (Shared Component)
    ├── Footer Content Grid
    │   ├── Column: About
    │   ├── Column: Services
    │   ├── Column: Company
    │   └── Column: Connect
    └── Footer Bottom (Copyright)
```

### 2.3 Semantic HTML Patterns

**Headings Hierarchy:**
```html
<h1> - Page title (Services Hero)
<h2> - Section titles (Why Choose HypeAI, Ready to Get Started)
<h3> - Card titles (Service names, Advantage titles)
<h4> - Subsection titles (if needed)
```

**ARIA Landmarks:**
```html
<nav aria-label="Main navigation">
<main id="main-content" aria-label="Main content">
<section aria-labelledby="services-heading">
<footer aria-label="Site footer">
```

**Interactive Elements:**
```html
<!-- Tabs with proper ARIA -->
<div role="tablist" aria-label="Service categories">
  <button role="tab" aria-selected="true" aria-controls="all-services">
    All Services
  </button>
</div>

<!-- Cards with keyboard navigation -->
<article class="service-card" tabindex="0" role="article">
```

---

## 3. CSS Architecture

### 3.1 File Structure

```
css/
├── design-system.css       (Core tokens - 674 lines)
├── cosmic-animations.css   (Visual effects - 474 lines)
├── shared.css              (Common components - 443 lines)
└── services.css            (Page-specific - 495 lines)
```

**Loading Order:**
1. design-system.css - Foundation
2. cosmic-animations.css - Effects
3. shared.css - Shared components
4. services.css - Page-specific

### 3.2 Class Naming Conventions

**BEM-Inspired Pattern:**
```css
/* Block */
.service-card {}

/* Element */
.service-card__icon {}
.service-card__title {}
.service-card__description {}

/* Modifier */
.service-card--featured {}
.service-card--hidden {}
```

**Utility Classes (from design-system.css):**
```css
/* Typography */
.text-primary, .text-secondary, .text-tertiary
.text-gradient
.heading-1, .heading-2, .heading-3

/* Layout */
.flex, .grid, .grid-2, .grid-3, .grid-4
.gap-4, .gap-6, .gap-8
.container, .container-xl

/* Spacing */
.mt-4, .mb-4, .section, .section-lg

/* Display */
.hidden, .block, .flex, .inline-flex
```

### 3.3 Component CSS Structure

**Service Card Component:**
```css
.service-card {
  /* Layout */
  display: flex;
  flex-direction: column;
  padding: 2rem;

  /* Visual */
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);

  /* Interaction */
  transition: all var(--transition-base);
  cursor: pointer;
}

.service-card:hover {
  transform: translateY(-8px);
  border-color: rgba(243, 186, 47, 0.5);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4),
              0 0 30px rgba(255, 233, 0, 0.15);
}

/* After pseudo-element for shine effect */
.service-card::after {
  content: '';
  position: absolute;
  /* Shine gradient animation */
  background: linear-gradient(45deg, transparent 30%, rgba(255, 233, 0, 0.05) 50%, transparent 70%);
  opacity: 0;
  transition: all 0.6s;
}

.service-card:hover::after {
  opacity: 1;
  transform: translateX(0) translateY(0) rotate(45deg);
}
```

### 3.4 Responsive Breakpoints

```css
/* Mobile-first approach */
/* Base: 320px - 767px (mobile) */

@media (min-width: 640px) {
  /* Tablet small */
  .grid-2 { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 768px) {
  /* Tablet */
  .hero-title { font-size: 2.5rem; }
}

@media (min-width: 1024px) {
  /* Desktop */
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
  .grid-4 { grid-template-columns: repeat(4, 1fr); }
}

@media (min-width: 1280px) {
  /* Desktop XL */
  .container-xl { max-width: 1280px; }
}
```

### 3.5 Animation Performance

**GPU Acceleration:**
```css
.service-card,
.btn-primary,
.gradient-orb {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 4. JavaScript Architecture

### 4.1 Module Structure

```javascript
// Module Pattern
const ServicesPage = {
  // State
  state: {
    activeTab: 'all',
    visibleCards: [],
    filters: {
      audience: 'all',
      priceRange: null,
      category: null
    }
  },

  // Initialization
  init() {
    this.setupTabs();
    this.setupFilters();
    this.setupAnimations();
    this.setupInteractions();
  },

  // Tab Management
  setupTabs() { /* ... */ },
  filterCards(audience) { /* ... */ },

  // Animation Management
  setupAnimations() { /* ... */ },
  observeCards() { /* ... */ },

  // Interaction Management
  setupInteractions() { /* ... */ },
  handleButtonClick(button) { /* ... */ }
};
```

### 4.2 Core Modules

**1. Tab Filter System (services.js):**
```javascript
class ServiceTabFilter {
  constructor(tabsSelector, cardsSelector) {
    this.tabs = document.querySelectorAll(tabsSelector);
    this.cards = document.querySelectorAll(cardsSelector);
    this.activeTab = 'all';
  }

  init() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', (e) => this.handleTabClick(e));
    });
  }

  handleTabClick(event) {
    const targetAudience = event.target.dataset.tab;
    this.updateActiveTab(event.target);
    this.filterCards(targetAudience);
  }

  filterCards(audience) {
    this.cards.forEach(card => {
      const cardAudiences = (card.dataset.audience || 'all').split(' ');
      const shouldShow = audience === 'all' || cardAudiences.includes(audience);

      if (shouldShow) {
        this.showCard(card);
      } else {
        this.hideCard(card);
      }
    });
  }

  showCard(card) {
    card.classList.remove('hidden');
    card.classList.add('visible');
    card.style.display = 'flex';
  }

  hideCard(card) {
    card.classList.add('hidden');
    card.classList.remove('visible');
    setTimeout(() => {
      if (card.classList.contains('hidden')) {
        card.style.display = 'none';
      }
    }, 300);
  }
}
```

**2. Scroll Animation System:**
```javascript
class ScrollAnimations {
  constructor(observerOptions = {}) {
    this.options = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
      ...observerOptions
    };

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      this.options
    );
  }

  observe(elements) {
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      this.observer.observe(el);
    });
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }
}
```

**3. Cosmic Effects Integration:**
```javascript
class ServicesCosmicEffects {
  constructor() {
    this.cosmicAnim = null;
    this.textGlow = null;
    this.hoverEffects = null;
  }

  init() {
    // Initialize cosmic animations if hero section exists
    const hero = document.querySelector('.services-hero');
    if (!hero) return;

    // Create cosmic background
    this.setupCosmicBackground(hero);

    // Initialize text glow effects
    this.textGlow = new TextGlowEffect();
    this.textGlow.init();

    // Initialize card hover effects
    this.hoverEffects = new CosmicHoverEffects();
    this.hoverEffects.init();
  }

  setupCosmicBackground(hero) {
    // Add gradient orbs
    const orbs = this.createOrbs();
    orbs.forEach(orb => hero.appendChild(orb));

    // Add shapes (optional)
    const shapes = this.createShapes();
    shapes.forEach(shape => hero.appendChild(shape));
  }

  createOrbs() {
    const orbConfigs = [
      { className: 'orb-1', size: '700px', top: '-300px', left: '-200px', color: 'purple' },
      { className: 'orb-2', size: '600px', top: '150px', right: '-200px', color: 'blue' },
      { className: 'orb-3', size: '500px', bottom: '-100px', left: '25%', color: 'yellow' }
    ];

    return orbConfigs.map(config => this.createOrb(config));
  }

  createOrb({ className, size, top, bottom, left, right, color }) {
    const orb = document.createElement('div');
    orb.className = `gradient-orb ${className}`;
    orb.style.width = size;
    orb.style.height = size;
    if (top) orb.style.top = top;
    if (bottom) orb.style.bottom = bottom;
    if (left) orb.style.left = left;
    if (right) orb.style.right = right;
    return orb;
  }
}
```

### 4.3 Event Handling

**Debounced Resize:**
```javascript
class ResizeHandler {
  constructor(callback, delay = 150) {
    this.callback = callback;
    this.delay = delay;
    this.timeout = null;
  }

  init() {
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.callback();
    }, this.delay);
  }
}
```

**Smooth Scroll:**
```javascript
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);

      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
```

### 4.4 Performance Optimization

**Lazy Loading:**
```javascript
// Lazy load service card images
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      imageObserver.unobserve(img);
    }
  });
});

document.querySelectorAll('img.lazy').forEach(img => {
  imageObserver.observe(img);
});
```

**RequestAnimationFrame for Animations:**
```javascript
class SmoothAnimator {
  constructor() {
    this.animations = [];
    this.isRunning = false;
  }

  add(callback) {
    this.animations.push(callback);
    if (!this.isRunning) {
      this.start();
    }
  }

  start() {
    this.isRunning = true;
    this.animate();
  }

  animate() {
    if (this.animations.length === 0) {
      this.isRunning = false;
      return;
    }

    this.animations = this.animations.filter(callback => callback() !== false);
    requestAnimationFrame(() => this.animate());
  }
}
```

---

## 5. Component Specifications

### 5.1 Navigation Component

**Structure:**
```html
<nav class="nav-sticky" role="navigation" aria-label="Main navigation">
  <div class="container">
    <div class="nav-content">
      <a href="index.html" class="logo">
        <span class="logo-text">HYPE</span>
        <span class="logo-accent">AI</span>
      </a>

      <div class="nav-links">
        <a href="index.html#hero" class="nav-link">Home</a>
        <a href="services.html" class="nav-link active" aria-current="page">Services</a>
        <a href="index.html#tokenomics" class="nav-link">Tokenomics</a>
        <a href="index.html#roadmap" class="nav-link">Roadmap</a>
        <a href="index.html#contact" class="nav-link">Contact</a>
      </div>

      <div class="nav-actions">
        <button class="btn btn-outline btn-sm" id="lang-toggle" aria-label="Toggle language">
          <span class="lang-current">EN</span>
        </button>
        <a href="index.html#buy" class="btn btn-primary btn-sm">Buy $HYPE</a>
      </div>
    </div>
  </div>
</nav>
```

**CSS:**
```css
.nav-sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--color-border-subtle);
  padding: var(--space-2) 0;
  transition: background var(--transition-base);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.logo {
  font-size: var(--fs-2xl);
  font-weight: var(--fw-bold);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.logo-text {
  color: var(--color-text-primary);
}

.logo-accent {
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: none; /* Mobile: hidden */
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .nav-links {
    display: flex;
  }
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: var(--fw-medium);
  transition: color var(--transition-base);
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width var(--transition-base);
}

.nav-link:hover,
.nav-link.active {
  color: var(--color-primary);
}

.nav-link.active::after {
  width: 100%;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
```

### 5.2 Service Card Component

**Featured Card (2-column span):**
```html
<article class="glass-card service-featured-card" data-audience="all" role="article">
  <div class="featured-badge">🔥 Most Profitable</div>

  <div class="service-icon" aria-hidden="true">📱</div>

  <h3 class="service-title">Social Media Automation</h3>

  <p class="service-description">
    Complete social media management: Twitter, Instagram, LinkedIn, TikTok.
    Auto-posting, content generation, community management.
  </p>

  <div class="service-pricing-grid">
    <div class="price-tier">
      <div class="tier-name">Basic</div>
      <div class="tier-price">$299<span>/mo</span></div>
      <ul class="tier-features" role="list">
        <li>✅ 30-60 posts/month</li>
        <li>✅ 2-3 platforms</li>
        <li>✅ AI content generation</li>
      </ul>
    </div>

    <div class="price-tier featured">
      <div class="tier-name">Pro</div>
      <div class="tier-price">$999<span>/mo</span></div>
      <ul class="tier-features" role="list">
        <li>✅ 60-120 posts/month</li>
        <li>✅ 4-5 platforms</li>
        <li>✅ Stories & Reels</li>
        <li>✅ Analytics & optimization</li>
      </ul>
    </div>
  </div>

  <div class="service-agents">
    <strong>Agents:</strong> VIBE, MOMENTUM, PULSE, COPY, PIXEL
  </div>

  <div class="service-actions">
    <button class="btn btn-primary" type="button">Get Started →</button>
    <button class="btn btn-outline" type="button">Learn More</button>
  </div>

  <div class="service-trust-line">
    ⏱️ Start in 24-48 hours | 💰 Recurring revenue model | 🚀 Launch special pricing
  </div>
</article>
```

**Standard Card (1-column):**
```html
<article class="glass-card service-card" data-audience="individuals" role="article">
  <div class="service-icon" aria-hidden="true">📄</div>

  <h3 class="service-title">Professional Resume & CV</h3>

  <p class="service-description">
    ATS-optimized resumes, cover letters, LinkedIn profiles.
    Get hired faster with professional presentation.
  </p>

  <div class="service-pricing-simple">
    <div class="price-range">$49 - $199</div>
    <div class="price-subtext">One-time</div>
  </div>

  <ul class="service-highlights" role="list">
    <li>✅ ATS-optimized formatting</li>
    <li>✅ 3 revisions included</li>
    <li>✅ 24-48 hour delivery</li>
    <li>✅ Cover letter included</li>
  </ul>

  <button class="btn btn-outline btn-sm" type="button">Get Started →</button>
</article>
```

### 5.3 Hero Section Component

```html
<section class="services-hero" aria-labelledby="services-heading">
  <!-- Cosmic Background -->
  <div class="hero-background" aria-hidden="true">
    <div class="gradient-orb orb-1"></div>
    <div class="gradient-orb orb-2"></div>
    <div class="gradient-orb orb-3"></div>
  </div>

  <div class="container">
    <div class="hero-content text-center">
      <div class="section-label" role="presentation">Professional Services</div>

      <h1 class="hero-title" id="services-heading">
        AI-Powered Services<br>for <span class="text-gradient">Everyone</span>
      </h1>

      <p class="hero-description">
        From personal projects to enterprise solutions.
        Professional quality, AI speed, unbeatable prices.
      </p>

      <div class="hero-stats" role="group" aria-label="Service statistics">
        <div class="stat-item">
          <div class="stat-value" aria-label="42 AI Agents">42</div>
          <div class="stat-label">AI Agents</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" aria-label="Over 60 Services">60+</div>
          <div class="stat-label">Services</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" aria-label="New Launch">NEW</div>
          <div class="stat-label">Just Launched</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" aria-label="24/7 Support">24/7</div>
          <div class="stat-label">Support</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### 5.4 Footer Component

```html
<footer class="footer" role="contentinfo" aria-label="Site footer">
  <div class="container">
    <div class="footer-content">
      <div class="footer-section">
        <h4>HypeAI</h4>
        <p>Professional AI services for everyone.</p>
      </div>

      <div class="footer-section">
        <h4>Services</h4>
        <nav aria-label="Services links">
          <a href="#" class="footer-link">Social Media</a>
          <a href="#" class="footer-link">Web Development</a>
          <a href="#" class="footer-link">Content Creation</a>
          <a href="#" class="footer-link">Business Consulting</a>
        </nav>
      </div>

      <div class="footer-section">
        <h4>Company</h4>
        <nav aria-label="Company links">
          <a href="index.html#about" class="footer-link">About</a>
          <a href="index.html#roadmap" class="footer-link">Roadmap</a>
          <a href="index.html#contact" class="footer-link">Contact</a>
        </nav>
      </div>

      <div class="footer-section">
        <h4>Connect</h4>
        <nav aria-label="Social media links">
          <a href="#" class="footer-link" aria-label="Twitter">Twitter</a>
          <a href="#" class="footer-link" aria-label="Telegram">Telegram</a>
          <a href="#" class="footer-link" aria-label="Discord">Discord</a>
        </nav>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2025 HypeAI. All rights reserved.</p>
    </div>
  </div>
</footer>
```

---

## 6. Data Flow & State Management

### 6.1 Application State

```javascript
const AppState = {
  // UI State
  ui: {
    activeTab: 'all',
    scrollPosition: 0,
    isMobileMenuOpen: false,
    currentLanguage: 'en'
  },

  // Filter State
  filters: {
    audience: 'all',        // 'all' | 'individuals' | 'business' | 'crypto'
    priceRange: null,       // { min: number, max: number } | null
    sortBy: 'featured'      // 'featured' | 'price' | 'popularity'
  },

  // Services Data
  services: [],             // Loaded from JSON or inline
  visibleServices: [],      // Filtered results

  // Animation State
  animations: {
    isCosmicActive: true,
    isScrollAnimActive: true,
    preferReducedMotion: false
  }
};
```

### 6.2 Data Flow Diagram

```
User Action (Click Tab)
    ↓
Event Handler (handleTabClick)
    ↓
State Update (updateActiveTab)
    ↓
Filter Logic (filterCards)
    ↓
DOM Update (show/hide cards with animation)
    ↓
UI Feedback (active tab styling)
```

### 6.3 Service Data Structure

```javascript
const serviceData = {
  id: 'social-media-automation',
  title: 'Social Media Automation',
  description: 'Complete social media management...',
  icon: '📱',
  category: 'marketing',
  audience: ['all', 'business', 'crypto'],
  featured: true,
  pricing: {
    type: 'tiered',
    tiers: [
      {
        name: 'Basic',
        price: 299,
        period: 'month',
        features: [
          '30-60 posts/month',
          '2-3 platforms',
          'AI content generation'
        ]
      },
      {
        name: 'Pro',
        price: 999,
        period: 'month',
        features: [
          '60-120 posts/month',
          '4-5 platforms',
          'Stories & Reels',
          'Analytics & optimization'
        ],
        featured: true
      }
    ]
  },
  agents: ['VIBE', 'MOMENTUM', 'PULSE', 'COPY', 'PIXEL'],
  deliveryTime: '24-48 hours',
  cta: {
    primary: 'Get Started',
    secondary: 'Learn More'
  }
};
```

---

## 7. Accessibility Requirements

### 7.1 WCAG 2.1 Level AA Compliance

**Keyboard Navigation:**
- All interactive elements accessible via Tab key
- Focus indicators visible (2px outline in brand color)
- Skip to main content link
- Logical tab order

**Screen Reader Support:**
- Semantic HTML (nav, main, section, article, footer)
- ARIA labels for complex widgets
- Alt text for all images (or aria-hidden for decorative)
- Descriptive link text

**Color Contrast:**
- Text on dark background: minimum 4.5:1 ratio
- Large text (18pt+): minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio

**Focus Management:**
```css
.btn:focus-visible,
.nav-link:focus-visible,
.service-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 7.2 Motion Preferences

```javascript
// Detect reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Disable cosmic animations
  document.body.classList.add('reduce-motion');

  // Disable complex animations
  AppState.animations.isCosmicActive = false;
}
```

---

## 8. Performance Budget

### 8.1 Loading Performance

**Target Metrics:**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Total Blocking Time (TBT): < 300ms
- Cumulative Layout Shift (CLS): < 0.1

**Resource Budget:**
- HTML: < 20 KB (gzipped)
- CSS: < 50 KB (gzipped)
- JavaScript: < 100 KB (gzipped)
- Fonts: < 60 KB (woff2)
- Images: WebP format, lazy loaded

### 8.2 Runtime Performance

**Frame Rate:**
- Target: 60 FPS (16.67ms per frame)
- Animations: Use transform and opacity only
- GPU acceleration: will-change, transform: translateZ(0)

**Memory:**
- Maximum heap size: < 50 MB
- No memory leaks (proper cleanup of event listeners)
- Efficient DOM manipulation (batch updates)

### 8.3 Loading Strategy

```html
<!-- Critical CSS inline in <head> -->
<style>
  /* Critical above-fold styles */
  body { background: #14151A; color: #FFFFFF; }
  .nav-sticky { /* ... */ }
  .services-hero { /* ... */ }
</style>

<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/space-grotesk.woff2" as="font" type="font/woff2" crossorigin>

<!-- Async load non-critical CSS -->
<link rel="stylesheet" href="css/design-system.css" media="print" onload="this.media='all'">
<link rel="stylesheet" href="css/cosmic-animations.css" media="print" onload="this.media='all'">

<!-- Defer JavaScript -->
<script src="js/cosmic-animations.js" defer></script>
<script src="js/services.js" defer></script>
```

---

## 9. Testing Strategy

### 9.1 Browser Compatibility

**Supported Browsers:**
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari (iOS): Last 2 versions
- Chrome Mobile (Android): Last 2 versions

**Fallbacks:**
- Backdrop-filter fallback for older browsers
- CSS Grid fallback to Flexbox
- IntersectionObserver polyfill for IE11 (if needed)

### 9.2 Responsive Testing

**Breakpoints to Test:**
- Mobile Small: 320px
- Mobile: 375px
- Mobile Large: 414px
- Tablet: 768px
- Desktop: 1024px
- Desktop Large: 1440px
- Desktop XL: 1920px

**Devices to Test:**
- iPhone SE (375x667)
- iPhone 12 Pro (390x844)
- iPad (768x1024)
- Desktop (1920x1080)

### 9.3 Automated Tests

**Unit Tests (Jest):**
```javascript
describe('ServiceTabFilter', () => {
  test('filters cards by audience', () => {
    const filter = new ServiceTabFilter('.services-tab', '.service-card');
    filter.filterCards('business');
    expect(filter.getVisibleCards().length).toBeGreaterThan(0);
  });
});
```

**Visual Regression Tests (Percy/Chromatic):**
- Capture screenshots at different breakpoints
- Compare against baseline
- Flag visual changes

**Performance Tests (Lighthouse CI):**
```javascript
{
  "ci": {
    "collect": {
      "url": ["http://localhost:8080/services.html"],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "first-contentful-paint": ["warn", {"maxNumericValue": 1800}],
        "interactive": ["warn", {"maxNumericValue": 3800}]
      }
    }
  }
}
```

---

## 10. Implementation Checklist

### Phase 1: Foundation (Day 1)
- [ ] Create HTML structure with semantic markup
- [ ] Setup CSS architecture (link all stylesheets)
- [ ] Implement navigation component
- [ ] Implement footer component
- [ ] Test responsive layout (mobile → desktop)

### Phase 2: Hero Section (Day 1-2)
- [ ] Build hero section HTML
- [ ] Implement cosmic background effects
- [ ] Add gradient text animations
- [ ] Implement stats grid
- [ ] Test on all breakpoints

### Phase 3: Services Grid (Day 2-3)
- [ ] Build service card components (featured + standard)
- [ ] Implement tab filter system
- [ ] Add filter animations
- [ ] Setup scroll-triggered animations
- [ ] Test filtering functionality

### Phase 4: Additional Sections (Day 3)
- [ ] Build advantages section
- [ ] Build CTA section
- [ ] Add hover effects to cards
- [ ] Test all interactions

### Phase 5: JavaScript Integration (Day 4)
- [ ] Implement tab filter logic
- [ ] Add scroll animations
- [ ] Integrate cosmic effects
- [ ] Add smooth scroll navigation
- [ ] Test all interactions

### Phase 6: Polish & Optimization (Day 5)
- [ ] Optimize images (WebP, lazy loading)
- [ ] Minify CSS/JS
- [ ] Add loading states
- [ ] Test accessibility (keyboard, screen reader)
- [ ] Run Lighthouse audit
- [ ] Fix any performance issues

### Phase 7: Testing & QA (Day 6)
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Performance testing
- [ ] Accessibility audit
- [ ] Visual regression testing
- [ ] Fix all bugs

---

## 11. File Dependencies

### CSS Loading Order
```html
<!-- 1. Design System (Foundation) -->
<link rel="stylesheet" href="css/design-system.css">

<!-- 2. Cosmic Animations (Visual Effects) -->
<link rel="stylesheet" href="css/cosmic-animations.css">

<!-- 3. Shared Components (Navigation, Footer) -->
<link rel="stylesheet" href="css/shared.css">

<!-- 4. Page-Specific Styles -->
<link rel="stylesheet" href="css/services.css">
```

### JavaScript Loading Order
```html
<!-- 1. Core Utilities (if needed) -->
<script src="js/utils.js" defer></script>

<!-- 2. Cosmic Animation System -->
<script src="js/cosmic-animations.js" defer></script>

<!-- 3. Page-Specific Logic -->
<script src="js/services.js" defer></script>
```

---

## 12. Success Metrics

### Technical Metrics
- ✅ Lighthouse Performance Score: ≥ 90
- ✅ Lighthouse Accessibility Score: 100
- ✅ Lighthouse Best Practices Score: ≥ 95
- ✅ Lighthouse SEO Score: 100
- ✅ Zero console errors
- ✅ Zero console warnings

### Visual Metrics
- ✅ Pixel-perfect match with design system
- ✅ Smooth 60fps animations
- ✅ Consistent spacing (8px grid)
- ✅ Proper typography hierarchy
- ✅ Consistent color usage

### Functional Metrics
- ✅ All tabs filter correctly
- ✅ All buttons are clickable
- ✅ Smooth scroll works
- ✅ Animations trigger on scroll
- ✅ Hover effects work smoothly
- ✅ Mobile navigation works
- ✅ Keyboard navigation works
- ✅ Screen reader compatible

---

## Conclusion

This architecture specification provides a complete blueprint for building a professional, bug-free services.html page that perfectly matches the HypeAI main site design system. Every component, interaction, and visual effect has been documented with implementation details, ensuring consistency and quality.

**Next Steps:**
1. Review and approve architecture
2. Begin implementation following the checklist
3. Test incrementally at each phase
4. Conduct final QA before deployment

---

**Document Version:** 1.0
**Last Updated:** 2025-10-21
**Author:** System Architecture Designer
**Status:** Ready for Implementation
