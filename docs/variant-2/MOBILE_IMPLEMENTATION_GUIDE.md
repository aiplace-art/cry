# 🔧 MOBILE-FIRST IMPLEMENTATION GUIDE

**Ready-to-Deploy Code & Step-by-Step Instructions**
**Date:** 2025-10-21
**Version:** 1.0

---

## 🚀 QUICK START (30 Minutes)

### Step 1: Update HTML Head (5 minutes)

**File:** `public/variant-2/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <!-- CRITICAL: Viewport meta tag -->
  <meta name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=5.0">

  <!-- Prevent iOS phone number auto-detection -->
  <meta name="format-detection" content="telephone=no">

  <!-- Theme color for mobile browsers -->
  <meta name="theme-color" content="#0a0118">

  <title>HypeAI - Professional AI Services</title>

  <!-- Fonts (preload for performance) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet">

  <!-- Critical CSS (inline for instant render) -->
  <style>
    /* Critical mobile-first base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      font-size: 16px;
      -webkit-text-size-adjust: 100%;
      touch-action: manipulation;
    }

    body {
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0a0118;
      color: #FFFFFF;
      line-height: 1.6;
      overflow-x: hidden;
    }

    html, body {
      max-width: 100vw;
    }
  </style>

  <!-- Mobile-first CSS (load in order) -->
  <link rel="stylesheet" href="css/01-base-mobile.css">
  <link rel="stylesheet" href="css/02-navigation-mobile.css">
  <link rel="stylesheet" href="css/shared.css">

  <!-- Desktop enhancements (deferred) -->
  <link rel="stylesheet"
        href="css/design-system.css"
        media="(min-width: 768px)">
</head>
```

### Step 2: Update Header Navigation (10 minutes)

**File:** `public/variant-2/index.html` (header section)

```html
<!-- Skip to main content (accessibility) -->
<a href="#main-content" class="skip-to-main">Skip to main content</a>

<!-- Mobile-optimized header -->
<header class="header" role="banner">
  <div class="container">
    <div class="header-content">

      <!-- Logo (always visible) -->
      <a href="/" class="logo" aria-label="HypeAI Home">
        <img src="/website/logo-official-BRIGHT.svg"
             alt="HypeAI Logo"
             width="140"
             height="40">
      </a>

      <!-- Desktop navigation (hidden on mobile) -->
      <nav class="nav desktop-nav" aria-label="Main navigation">
        <ul class="nav-list">
          <li><a href="/" class="nav-link">Home</a></li>
          <li><a href="/services.html" class="nav-link">Services</a></li>
          <li><a href="/about.html" class="nav-link">About</a></li>
          <li><a href="/whitepaper.html" class="nav-link">Whitepaper</a></li>
        </ul>
      </nav>

      <!-- Right side: Language + Hamburger -->
      <div class="header-actions">

        <!-- Language switcher (always visible) -->
        <div class="language-switcher">
          <button class="lang-btn"
                  aria-label="Select language"
                  aria-expanded="false"
                  aria-controls="lang-dropdown">
            <span class="lang-flag">🇬🇧</span>
            <span class="lang-code">EN</span>
            <span class="lang-arrow">▼</span>
          </button>

          <div id="lang-dropdown"
               class="lang-dropdown"
               aria-hidden="true"
               role="menu">
            <button class="lang-option"
                    data-lang="en"
                    role="menuitem">
              <span class="lang-flag">🇬🇧</span> English
            </button>
            <button class="lang-option"
                    data-lang="ru"
                    role="menuitem">
              <span class="lang-flag">🇷🇺</span> Русский
            </button>
            <button class="lang-option"
                    data-lang="zh"
                    role="menuitem">
              <span class="lang-flag">🇨🇳</span> 中文
            </button>
          </div>
        </div>

        <!-- Hamburger menu button (mobile only) -->
        <button class="hamburger"
                aria-label="Open navigation menu"
                aria-expanded="false"
                aria-controls="mobile-nav">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>

      </div>
    </div>
  </div>
</header>

<!-- Mobile navigation overlay -->
<nav id="mobile-nav"
     class="mobile-nav-overlay"
     aria-hidden="true"
     aria-label="Mobile navigation">

  <ul class="mobile-nav-list">
    <li><a href="/" class="mobile-nav-link">Home</a></li>
    <li><a href="/services.html" class="mobile-nav-link">Services</a></li>
    <li><a href="/about.html" class="mobile-nav-link">About</a></li>
    <li><a href="/whitepaper.html" class="mobile-nav-link">Whitepaper</a></li>
    <li><a href="/roadmap.html" class="mobile-nav-link">Roadmap</a></li>
    <li><a href="/docs.html" class="mobile-nav-link">Documentation</a></li>
  </ul>

  <!-- CTA buttons in mobile menu -->
  <div class="mobile-nav-cta">
    <a href="/presale.html" class="btn btn-primary btn-lg">
      Join Presale
    </a>
    <a href="/whitepaper.html" class="btn btn-outline btn-lg">
      Read Whitepaper
    </a>
  </div>

  <!-- Social links in mobile menu -->
  <div class="mobile-nav-social">
    <a href="https://twitter.com/hypeai"
       aria-label="Twitter"
       class="social-link">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <!-- Twitter icon -->
      </svg>
    </a>
    <a href="https://t.me/hypeai"
       aria-label="Telegram"
       class="social-link">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <!-- Telegram icon -->
      </svg>
    </a>
  </div>

</nav>

<!-- Main content -->
<main id="main-content" role="main">
  <!-- Your page content -->
</main>
```

### Step 3: Create Mobile Navigation CSS (10 minutes)

**File:** `public/variant-2/css/02-navigation-mobile.css`

```css
/* ================================================
   MOBILE NAVIGATION SYSTEM
   Hamburger menu + Full-screen overlay
   ================================================ */

/* ========================================
   HEADER LAYOUT
   ======================================== */

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(30, 32, 38, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 233, 0, 0.1);
  transition: all 0.3s ease;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  gap: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.logo img {
  height: 32px;
  width: auto;
}

/* ========================================
   DESKTOP NAVIGATION (hidden on mobile)
   ======================================== */

.desktop-nav {
  display: none;
}

@media (min-width: 768px) {
  .desktop-nav {
    display: block;
  }

  .nav-list {
    display: flex;
    align-items: center;
    gap: 32px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-link {
    color: #FFFFFF;
    text-decoration: none;
    font-weight: 500;
    font-size: 16px;
    padding: 8px 0;
    transition: color 0.3s ease;
    position: relative;
  }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--cosmic-yellow);
    transition: width 0.3s ease;
  }

  .nav-link:hover,
  .nav-link:focus {
    color: var(--cosmic-yellow);
  }

  .nav-link:hover::after,
  .nav-link:focus::after {
    width: 100%;
  }
}

/* ========================================
   HAMBURGER BUTTON (mobile only)
   ======================================== */

.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px;
  z-index: 1001;
  position: relative;

  /* Touch optimization */
  -webkit-tap-highlight-color: rgba(255, 233, 0, 0.2);
  touch-action: manipulation;
}

/* Hide on desktop */
@media (min-width: 768px) {
  .hamburger {
    display: none;
  }
}

/* Hamburger lines */
.hamburger-line {
  width: 24px;
  height: 2px;
  background: var(--cosmic-yellow);
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  display: block;
}

.hamburger-line:not(:last-child) {
  margin-bottom: 6px;
}

/* X animation when active */
.hamburger.active .hamburger-line:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.hamburger.active .hamburger-line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.hamburger.active .hamburger-line:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* ========================================
   MOBILE NAVIGATION OVERLAY
   ======================================== */

.mobile-nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 999;

  /* Background */
  background: linear-gradient(
    135deg,
    rgba(10, 1, 24, 0.98) 0%,
    rgba(30, 32, 38, 0.98) 100%
  );
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);

  /* Layout */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 40px;
  padding: 80px 24px 40px;

  /* Hidden by default */
  opacity: 0;
  visibility: hidden;
  transform: translateY(-100%);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  /* Scroll behavior */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Active state (shown) */
.mobile-nav-overlay.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

/* Hide on desktop */
@media (min-width: 768px) {
  .mobile-nav-overlay {
    display: none;
  }
}

/* ========================================
   MOBILE NAVIGATION LIST
   ======================================== */

.mobile-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  text-align: center;
}

.mobile-nav-link {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #FFFFFF;
  text-decoration: none;
  padding: 12px 24px;
  min-height: 48px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Touch optimization */
  -webkit-tap-highlight-color: rgba(255, 233, 0, 0.2);
  touch-action: manipulation;
}

.mobile-nav-link:hover,
.mobile-nav-link:focus {
  color: var(--cosmic-yellow);
  transform: translateX(8px);
}

.mobile-nav-link:active {
  transform: scale(0.98);
}

/* ========================================
   MOBILE CTA BUTTONS
   ======================================== */

.mobile-nav-cta {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 320px;
}

.mobile-nav-cta .btn {
  width: 100%;
  justify-content: center;
}

/* ========================================
   MOBILE SOCIAL LINKS
   ======================================== */

.mobile-nav-social {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: center;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(255, 233, 0, 0.1);
  border: 1px solid rgba(255, 233, 0, 0.2);
  border-radius: 50%;
  color: var(--cosmic-yellow);
  text-decoration: none;
  transition: all 0.3s ease;

  /* Touch optimization */
  -webkit-tap-highlight-color: rgba(255, 233, 0, 0.2);
  touch-action: manipulation;
}

.social-link:hover,
.social-link:focus {
  background: var(--cosmic-yellow);
  color: #000000;
  transform: translateY(-2px);
}

/* ========================================
   LANGUAGE SWITCHER (mobile optimized)
   ======================================== */

.language-switcher {
  position: relative;
  z-index: 1002;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: rgba(255, 233, 0, 0.1);
  border: 1px solid rgba(255, 233, 0, 0.2);
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 60px;
  min-height: 44px;

  /* Touch optimization */
  -webkit-tap-highlight-color: rgba(255, 233, 0, 0.2);
  touch-action: manipulation;
}

.lang-btn:hover,
.lang-btn:focus {
  background: rgba(255, 233, 0, 0.2);
  border-color: rgba(255, 233, 0, 0.4);
}

.lang-arrow {
  font-size: 10px;
  transition: transform 0.3s ease;
}

.lang-btn[aria-expanded="true"] .lang-arrow {
  transform: rotate(180deg);
}

/* Dropdown */
.lang-dropdown {
  position: fixed;
  top: 70px;
  right: 16px;
  background: rgba(30, 32, 38, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 233, 0, 0.2);
  border-radius: 12px;
  padding: 8px;
  min-width: 160px;
  max-width: calc(100vw - 32px);
  z-index: 9999;

  /* Hidden by default */
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Shadow */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.lang-dropdown[aria-hidden="false"] {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

/* Desktop positioning */
@media (min-width: 768px) {
  .lang-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
  }
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;

  /* Touch optimization */
  -webkit-tap-highlight-color: rgba(255, 233, 0, 0.2);
  touch-action: manipulation;
}

.lang-option:hover,
.lang-option:focus {
  background: rgba(255, 233, 0, 0.1);
  color: var(--cosmic-yellow);
}

.lang-option:active {
  transform: scale(0.98);
}

.lang-option.active {
  background: rgba(255, 233, 0, 0.15);
  color: var(--cosmic-yellow);
}

/* ========================================
   ACCESSIBILITY
   ======================================== */

.skip-to-main {
  position: absolute;
  top: -100px;
  left: 16px;
  background: var(--cosmic-purple);
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  z-index: 10000;
  transition: top 0.3s;
  font-weight: 600;
  border-radius: 8px;
}

.skip-to-main:focus {
  top: 16px;
  outline: 3px solid var(--cosmic-yellow);
  outline-offset: 2px;
}

/* Focus indicators */
*:focus-visible {
  outline: 3px solid var(--cosmic-yellow);
  outline-offset: 2px;
  border-radius: 4px;
}

/* ========================================
   SAFE AREA INSETS (iPhone notch)
   ======================================== */

@supports (padding: max(0px)) {
  .header {
    padding-left: max(0px, env(safe-area-inset-left));
    padding-right: max(0px, env(safe-area-inset-right));
  }

  .mobile-nav-overlay {
    padding-left: max(24px, env(safe-area-inset-left));
    padding-right: max(24px, env(safe-area-inset-right));
    padding-top: max(80px, env(safe-area-inset-top));
    padding-bottom: max(40px, env(safe-area-inset-bottom));
  }
}

/* ========================================
   BODY SCROLL LOCK (when menu open)
   ======================================== */

body.nav-open {
  overflow: hidden;
  position: fixed;
  width: 100%;
}
```

### Step 4: Create Mobile Navigation JavaScript (5 minutes)

**File:** `public/variant-2/js/mobile-navigation.js`

```javascript
/**
 * Mobile Navigation Controller
 * Handles hamburger menu, overlay, and accessibility
 */

class MobileNavigation {
  constructor() {
    // DOM elements
    this.hamburger = document.querySelector('.hamburger');
    this.overlay = document.querySelector('.mobile-nav-overlay');
    this.body = document.body;
    this.langBtn = document.querySelector('.lang-btn');
    this.langDropdown = document.querySelector('.lang-dropdown');

    // State
    this.isNavOpen = false;
    this.isLangOpen = false;

    // Initialize
    this.init();
  }

  init() {
    if (!this.hamburger || !this.overlay) {
      console.warn('Mobile navigation elements not found');
      return;
    }

    // Event listeners
    this.hamburger.addEventListener('click', () => this.toggleNav());

    // Close on link click
    this.overlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.closeNav());
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isNavOpen) this.closeNav();
        if (this.isLangOpen) this.closeLang();
      }
    });

    // Trap focus when overlay is open
    this.overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && this.isNavOpen) {
        this.trapFocus(e);
      }
    });

    // Language switcher
    if (this.langBtn && this.langDropdown) {
      this.langBtn.addEventListener('click', () => this.toggleLang());

      // Close on option select
      this.langDropdown.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', (e) => {
          this.selectLanguage(e.target.dataset.lang);
          this.closeLang();
        });
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (this.isLangOpen &&
            !this.langBtn.contains(e.target) &&
            !this.langDropdown.contains(e.target)) {
          this.closeLang();
        }
      });
    }
  }

  // Navigation methods
  toggleNav() {
    this.isNavOpen ? this.closeNav() : this.openNav();
  }

  openNav() {
    this.isNavOpen = true;
    this.hamburger.classList.add('active');
    this.overlay.classList.add('active');
    this.body.classList.add('nav-open');

    // ARIA
    this.hamburger.setAttribute('aria-expanded', 'true');
    this.overlay.setAttribute('aria-hidden', 'false');

    // Focus first link
    const firstLink = this.overlay.querySelector('a');
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 100);
    }
  }

  closeNav() {
    this.isNavOpen = false;
    this.hamburger.classList.remove('active');
    this.overlay.classList.remove('active');
    this.body.classList.remove('nav-open');

    // ARIA
    this.hamburger.setAttribute('aria-expanded', 'false');
    this.overlay.setAttribute('aria-hidden', 'true');

    // Return focus
    this.hamburger.focus();
  }

  // Language switcher methods
  toggleLang() {
    this.isLangOpen ? this.closeLang() : this.openLang();
  }

  openLang() {
    this.isLangOpen = true;
    this.langBtn.setAttribute('aria-expanded', 'true');
    this.langDropdown.setAttribute('aria-hidden', 'false');
  }

  closeLang() {
    this.isLangOpen = false;
    this.langBtn.setAttribute('aria-expanded', 'false');
    this.langDropdown.setAttribute('aria-hidden', 'true');
  }

  selectLanguage(lang) {
    console.log('Language selected:', lang);

    // Update button
    const flags = { en: '🇬🇧', ru: '🇷🇺', zh: '🇨🇳' };
    const codes = { en: 'EN', ru: 'RU', zh: 'ZH' };

    this.langBtn.querySelector('.lang-flag').textContent = flags[lang];
    this.langBtn.querySelector('.lang-code').textContent = codes[lang];

    // Update active state
    this.langDropdown.querySelectorAll('.lang-option').forEach(option => {
      option.classList.toggle('active', option.dataset.lang === lang);
    });

    // TODO: Trigger actual language change
    // window.changeLanguage(lang);
  }

  // Focus trap
  trapFocus(event) {
    const focusableElements = this.overlay.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab (forward)
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mobileNav = new MobileNavigation();
  });
} else {
  window.mobileNav = new MobileNavigation();
}
```

---

## 📋 INTEGRATION CHECKLIST

Use this checklist to ensure proper implementation:

### HTML Updates
- [ ] Added viewport meta tag with `maximum-scale=5.0`
- [ ] Added format-detection meta tag
- [ ] Added theme-color meta tag
- [ ] Added skip-to-main link
- [ ] Updated header with hamburger button
- [ ] Added mobile nav overlay
- [ ] Added `id="main-content"` to main element
- [ ] Loaded CSS in correct order

### CSS Updates
- [ ] Created `02-navigation-mobile.css`
- [ ] Hamburger button: 44px × 44px
- [ ] Smooth X animation works
- [ ] Overlay fills full viewport
- [ ] Links are 48px minimum height
- [ ] Language dropdown positioned correctly
- [ ] Safe area insets for iPhone notch
- [ ] Focus indicators visible (3px yellow)

### JavaScript Updates
- [ ] Created `mobile-navigation.js`
- [ ] Hamburger toggles overlay
- [ ] Body scroll locked when menu open
- [ ] Focus trapped in overlay
- [ ] Escape key closes menu
- [ ] Links close menu on click
- [ ] Language switcher works
- [ ] ARIA attributes updated

### Testing
- [ ] Test on iPhone SE (320px)
- [ ] Test on iPhone 12/13 (375px)
- [ ] Test on iPad (768px)
- [ ] Test hamburger animation
- [ ] Test focus trap (Tab key)
- [ ] Test Escape key
- [ ] Test language switcher
- [ ] Test with screen reader

---

## 🧪 TESTING INSTRUCTIONS

### Manual Testing

**1. Mobile Menu (iPhone/Android)**
```
✓ Tap hamburger → Menu opens smoothly
✓ Tap link → Menu closes, navigates
✓ Scroll menu → Works on long content
✓ Tap outside → Menu stays open
✓ Tap hamburger again → Menu closes
```

**2. Keyboard Navigation (Desktop)**
```
✓ Tab to hamburger → Focus visible
✓ Enter → Menu opens
✓ Tab through links → Focus trapped
✓ Escape → Menu closes
✓ Focus returns to hamburger
```

**3. Language Switcher**
```
✓ Tap language button → Dropdown opens
✓ Tap option → Language changes
✓ Dropdown closes automatically
✓ Active language highlighted
```

### Automated Testing

**Lighthouse (Mobile)**
```bash
lighthouse https://hypeai.io --view --preset=mobile
```

**Accessibility**
```bash
npm install -g pa11y
pa11y https://hypeai.io
```

---

## 🚀 DEPLOYMENT

### Before Deploying

1. **Test on real devices** (not just browser DevTools)
2. **Check all pages** (not just homepage)
3. **Verify performance** (Lighthouse score ≥ 90)
4. **Test accessibility** (screen reader, keyboard)
5. **Cross-browser test** (Safari, Chrome, Firefox)

### Deploy Steps

```bash
# 1. Commit changes
git add .
git commit -m "✨ Mobile-first navigation + hamburger menu"

# 2. Test on staging
git push origin staging
# Test: https://staging.hypeai.io

# 3. Deploy to production
git push origin main
# Live: https://hypeai.io
```

---

## 📊 SUCCESS METRICS

After deployment, verify:

| Metric | Target | How to Check |
|--------|--------|--------------|
| Mobile Lighthouse Score | ≥ 90 | Chrome DevTools |
| First Contentful Paint | < 1.5s | Lighthouse |
| No horizontal scroll | 0px | Test on 320px device |
| Touch target size | ≥ 44px | Tap with finger |
| Keyboard accessible | 100% | Tab through page |
| Screen reader friendly | 100% | Test with VoiceOver |

---

## 🆘 TROUBLESHOOTING

### Menu doesn't open
- Check `mobile-navigation.js` is loaded
- Check for JavaScript errors in console
- Verify `.hamburger` and `.mobile-nav-overlay` exist in DOM

### Hamburger X animation broken
- Check all 3 `.hamburger-line` elements exist
- Verify CSS `transform` values
- Check `.active` class is added to hamburger

### Body still scrolls when menu open
- Check `.nav-open` class added to `<body>`
- Verify CSS: `body.nav-open { overflow: hidden; }`

### Language dropdown off-screen
- Check `position: fixed` in mobile
- Verify `right: 16px` positioning
- Check `max-width: calc(100vw - 32px)`

---

## ✅ FINAL VERIFICATION

Before marking as complete:

```bash
# 1. Run Lighthouse
npm run lighthouse

# 2. Test on real iPhone
# Open on device, test all interactions

# 3. Test on real Android
# Open on device, test all interactions

# 4. Accessibility audit
npm run a11y

# 5. Cross-browser test
# Safari, Chrome, Firefox, Edge
```

**All green? Ship it! 🚀**

---

**Next:** [Mobile-First Architecture](./MOBILE_FIRST_ARCHITECTURE.md)
**Questions?** Contact System Architecture Designer
