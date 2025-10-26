# 📱 MOBILE-FIRST QUICK REFERENCE CARD

**One-Page Cheat Sheet for Developers**
**Print this and keep it handy!**

---

## ⚡ GOLDEN RULES

```
1. Mobile-first: Start 320px → enhance up
2. Touch targets: ≥ 44px (always!)
3. Font size: ≥ 16px (prevents iOS zoom)
4. No !important: Clean cascade
5. Test on real devices: Not just DevTools
```

---

## 📐 BREAKPOINTS

```css
/* Mobile (default - no media query) */
320px: Base styles
375px: Standard mobile
414px: Large mobile

/* Tablet & Desktop (min-width) */
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Wide */ }
```

---

## 🎯 TOUCH TARGETS

```css
/* Minimum: 44px × 44px */
button, a, input {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 24px;
}

/* Prevent iOS tap delay */
* {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
```

---

## ✍️ TYPOGRAPHY

```css
/* Base (prevents iOS zoom) */
html { font-size: 16px; }
input { font-size: 16px; } /* Critical! */

/* Fluid scaling */
h1 { font-size: clamp(32px, 10vw, 48px); }
h2 { font-size: clamp(24px, 7vw, 36px); }
h3 { font-size: clamp(20px, 5vw, 28px); }
p  { font-size: 16px; line-height: 1.6; }
```

---

## 📱 MOBILE NAVIGATION

```html
<!-- Hamburger (44×44px) -->
<button class="hamburger" aria-label="Menu">
  <span class="hamburger-line"></span>
  <span class="hamburger-line"></span>
  <span class="hamburger-line"></span>
</button>

<!-- Overlay (full-screen) -->
<nav class="mobile-nav-overlay" aria-hidden="true">
  <ul class="mobile-nav-list">
    <li><a href="/">Home</a></li>
  </ul>
</nav>
```

```css
/* Hamburger X animation */
.hamburger.active .hamburger-line:nth-child(1) {
  transform: translate(-50%, -50%) rotate(45deg);
}
.hamburger.active .hamburger-line:nth-child(2) {
  opacity: 0;
}
.hamburger.active .hamburger-line:nth-child(3) {
  transform: translate(-50%, -50%) rotate(-45deg);
}
```

---

## 🚫 PREVENT HORIZONTAL SCROLL

```css
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

*, *::before, *::after {
  max-width: 100%;
}

img, video {
  max-width: 100%;
  height: auto;
}
```

---

## 🎨 RESPONSIVE GRIDS

```css
/* Mobile: 1 column (default) */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* Tablet: 2 columns */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

/* Desktop: 3 columns */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
}
```

---

## 📦 CONTAINER SYSTEM

```css
.container {
  width: 100%;
  padding: 0 16px; /* Mobile */
  margin: 0 auto;
}

@media (min-width: 768px) {
  .container {
    padding: 0 32px;
    max-width: 720px;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 48px;
    max-width: 960px;
  }
}
```

---

## 🎭 SAFE AREA INSETS (iPhone Notch)

```css
@supports (padding: max(0px)) {
  .header {
    padding-top: max(12px, env(safe-area-inset-top));
    padding-left: max(16px, env(safe-area-inset-left));
    padding-right: max(16px, env(safe-area-inset-right));
  }

  .footer {
    padding-bottom: max(32px, env(safe-area-inset-bottom));
  }
}
```

---

## ⚡ PERFORMANCE OPTIMIZATIONS

```css
@media (max-width: 768px) {
  /* Reduce animations */
  *, *::before, *::after {
    animation-duration: 0.3s !important;
    transition-duration: 0.25s !important;
  }

  /* Hide heavy effects */
  .gradient-orb,
  .particles {
    display: none !important;
  }

  /* Lighter blur */
  .glass-card {
    backdrop-filter: blur(10px);
  }
}
```

---

## ♿ ACCESSIBILITY

```css
/* Focus indicators */
*:focus-visible {
  outline: 3px solid #FFE900;
  outline-offset: 2px;
}

/* Skip to main */
.skip-to-main {
  position: absolute;
  top: -100px;
}
.skip-to-main:focus {
  top: 16px;
}
```

```html
<!-- ARIA labels -->
<button aria-label="Open menu" aria-expanded="false">
<nav aria-hidden="true" role="navigation">
```

---

## 🎨 COLOR CONTRAST (WCAG AA)

```css
/* Minimum 4.5:1 for text */
--text-primary: #FFFFFF;    /* 21:1 */
--text-secondary: #B7BDC6;  /* 7.8:1 */
--cosmic-yellow: #FFE900;   /* 10.5:1 */

/* Check: webaim.org/resources/contrastchecker */
```

---

## 📝 FORMS (iOS-Optimized)

```css
input, textarea, select {
  font-size: 16px !important; /* Prevents zoom */
  min-height: 44px;
  padding: 12px 16px;
  -webkit-appearance: none;
  appearance: none;
}
```

---

## 🎯 BUTTONS

```css
.btn {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  touch-action: manipulation;
}

/* Full width on mobile */
@media (max-width: 768px) {
  .btn {
    width: 100%;
  }
}
```

---

## 🧪 TESTING CHECKLIST

```
□ iPhone SE (320px)
□ iPhone 12/13 (375px)
□ iPhone Pro Max (414px)
□ iPad (768px)
□ iPad Landscape (1024px)
□ Desktop (1280px)

□ iOS Safari
□ Chrome Mobile
□ Firefox Mobile
□ Samsung Internet

□ Lighthouse ≥ 90
□ No horizontal scroll
□ All touch targets ≥ 44px
□ WCAG 2.1 AA
□ Keyboard navigation works
```

---

## 🚀 DEPLOYMENT

```bash
# Test performance
lighthouse https://hypeai.io --view

# Test accessibility
pa11y https://hypeai.io

# Git workflow
git checkout -b feature/mobile-first
git add .
git commit -m "✨ Mobile-first architecture"
git push origin feature/mobile-first
```

---

## 🐛 COMMON FIXES

**Horizontal scroll:**
```css
html, body { overflow-x: hidden; max-width: 100vw; }
```

**iOS zoom on input:**
```css
input { font-size: 16px; } /* Must be ≥16px */
```

**Hamburger not working:**
```javascript
// Check: .hamburger and .mobile-nav-overlay exist
document.querySelector('.hamburger')
document.querySelector('.mobile-nav-overlay')
```

**Dropdown off-screen:**
```css
.lang-dropdown {
  position: fixed;
  right: 16px;
  max-width: calc(100vw - 32px);
}
```

---

## 📚 DOCUMENTATION

**Full Architecture:**
`/docs/variant-2/MOBILE_FIRST_ARCHITECTURE.md`

**Implementation Guide:**
`/docs/variant-2/MOBILE_IMPLEMENTATION_GUIDE.md`

**Component Hierarchy:**
`/docs/variant-2/MOBILE_COMPONENT_HIERARCHY.md`

**Index:**
`/docs/variant-2/MOBILE_ARCHITECTURE_INDEX.md`

---

## 💡 REMEMBER

```
✅ Mobile-first = Start small, enhance up
✅ 44px touch targets = Happy users
✅ 16px font = No iOS zoom
✅ Real devices = Truth
✅ Accessibility = Built-in, not bolt-on
```

---

**Print this card and keep it visible while coding!**

**Author:** System Architecture Designer
**Version:** 1.0
**Date:** 2025-10-21
