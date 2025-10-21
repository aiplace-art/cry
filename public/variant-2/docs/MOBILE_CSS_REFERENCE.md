# Mobile CSS Quick Reference

## 🎯 Quick Start

All mobile optimizations are in `/css/mobile-optimizations.css` - automatically loaded and applied at `max-width: 768px`.

## 📱 CSS Variables

### Mobile-Specific Variables
```css
--mobile-padding: clamp(16px, 5vw, 24px)
--mobile-margin: 12px
--tap-target: 44px
--header-height: 64px
--mobile-font-base: 16px
--mobile-h1: clamp(32px, 10vw, 48px)
--mobile-h2: clamp(24px, 7vw, 36px)
--mobile-h3: clamp(20px, 5vw, 28px)
```

### iOS Safe Area
```css
--safe-top: env(safe-area-inset-top)
--safe-bottom: env(safe-area-inset-bottom)
--safe-left: env(safe-area-inset-left)
--safe-right: env(safe-area-inset-right)
```

### Usage
```css
/* Example: Padding with safe area */
padding: max(16px, var(--safe-top));

/* Example: Responsive padding */
padding: var(--mobile-padding);
```

## 🎨 Utility Classes

### Visibility
```css
.mobile-hide       /* display: none on mobile */
.mobile-show       /* display: block on mobile */
```

### Layout
```css
.mobile-center      /* text-align: center on mobile */
.mobile-full-width  /* width: 100% on mobile */
.mobile-stack       /* flex-direction: column on mobile */
```

### Usage Example
```html
<div class="desktop-grid mobile-stack">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<button class="mobile-full-width">Button</button>

<img src="logo.svg" class="mobile-hide" alt="Desktop logo">
```

## 📐 Breakpoints

### Primary Breakpoints
```css
/* Extra Small - iPhone SE */
@media (max-width: 375px) { }

/* Mobile - All Phones */
@media (max-width: 768px) { }

/* Landscape - Mobile */
@media (max-width: 768px) and (orientation: landscape) { }
```

### Nested Breakpoints
```css
@media (max-width: 768px) {
  /* All mobile */

  @media (max-width: 375px) {
    /* Extra small only */
  }
}
```

## 🎯 Component Classes

### Hamburger Menu
```css
.hamburger              /* Button container */
.hamburger-line         /* Individual line */
.hamburger.active       /* Open state */
```

### Mobile Navigation
```css
.mobile-nav-overlay     /* Full-screen overlay */
.mobile-nav-content     /* Content container */
.mobile-nav-overlay.active  /* Open state */
```

### Header
```css
.header                 /* Auto-fixed on mobile */
.header-content         /* Compact layout */
.header-actions         /* Button group */
```

## 🔘 Touch Optimization

### Automatic Touch Targets
All these elements automatically get `min-height: 44px` on mobile:

```css
.btn
.btn-primary
.btn-secondary
.btn-outline
.services-tab
.lang-option
button
a[role="button"]
```

### Manual Touch Target
```html
<a href="#" style="min-height: 44px; display: inline-flex; align-items: center;">
  Link
</a>
```

## 📝 Typography Scale

### Headings (Responsive)
```css
h1, .hero-title        /* 32px - 48px */
h2, .section-title     /* 24px - 36px */
h3                     /* 20px - 28px */
h4                     /* 18px - 22px */
```

### Body Text
```css
body, p, li, span      /* 16px (prevents zoom) */
```

### Usage
```html
<h1 class="hero-title">Auto-responsive title</h1>
<p>Always 16px on mobile (no zoom)</p>
```

## 🎛️ Grid Layouts

### Auto-Responsive Grids
These grids automatically become single column on mobile:

```css
.featured-services-grid  /* 1 column */
.advantages-grid         /* 1 column */
.service-pricing-grid    /* 1 column */
.footer-content          /* 1 column */
```

### Stats Grid
```css
.hero-stats              /* 2 columns on mobile */
                         /* 1 column on iPhone SE */
```

### Custom Grid
```html
<div class="grid" style="
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
">
  <!-- Auto-responsive grid -->
</div>
```

## 🎨 Spacing

### Container Padding
```css
.container {
  padding-left: max(var(--mobile-padding), var(--safe-left));
  padding-right: max(var(--mobile-padding), var(--safe-right));
}
```

### Section Spacing
```css
.section               /* 48px vertical on mobile */
                       /* 40px on iPhone SE */
```

### Manual Spacing
```html
<div style="padding: var(--mobile-padding);">
  Content with safe area
</div>
```

## 🎭 Animations

### Mobile Animations (Auto-Applied)
```css
/* All animations on mobile */
animation-duration: 0.3s !important;
transition-duration: 0.25s !important;
```

### Custom Animation
```html
<div style="
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
">
  Smooth mobile animation
</div>
```

## 📋 Forms

### Auto-Optimized Inputs
All form inputs automatically get on mobile:
- `font-size: 16px` (prevents zoom)
- `min-height: 44px` (touch target)
- `touch-action: manipulation`
- `-webkit-appearance: none`

```html
<input type="text" placeholder="No zoom on focus!">
<textarea>Auto-optimized</textarea>
<select>
  <option>Touch-friendly</option>
</select>
```

## 🎯 Buttons

### Button Sizes
```css
.btn         /* 44px minimum */
.btn-sm      /* 40px minimum */
.btn-lg      /* 52px minimum */
```

### Full Width Buttons
```html
<button class="btn mobile-full-width">
  Full width on mobile only
</button>
```

## 🔍 Language Switcher

### Mobile-Optimized
```css
.lang-btn           /* 60px width, 44px height */
.lang-dropdown      /* Fixed position, safe area */
.lang-option        /* 44px touch target */
```

## 🎨 Cards

### Service Cards
```css
.service-card            /* 20px padding on mobile */
.service-featured-card   /* 20px padding, stacks vertically */
.glass-card              /* 20px padding (16px on SE) */
```

## ⚡ Performance

### Hidden on Mobile
These are automatically hidden for performance:
```css
.gradient-orb
.particles
.geometric-shapes
.hero-background::before
```

### Hardware Acceleration
```css
.hamburger
.mobile-nav-overlay
.header
```

## ♿ Accessibility

### Focus Styles
```css
*:focus-visible {
  outline: 3px solid var(--cosmic-yellow);
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Screen Reader Only
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  /* ... (auto-added by mobile-nav.js) */
}
```

## 🎯 Best Practices

### ✅ DO:
```css
/* Use CSS variables */
padding: var(--mobile-padding);

/* Use clamp() for responsive text */
font-size: clamp(16px, 4vw, 24px);

/* Use max() for safe area */
padding-left: max(16px, var(--safe-left));

/* Touch targets 44px+ */
min-height: var(--tap-target);
```

### ❌ DON'T:
```css
/* Avoid fixed pixel values */
padding: 10px; /* ❌ Too small on mobile */

/* Avoid font < 16px on inputs */
input { font-size: 14px; } /* ❌ Causes zoom */

/* Avoid small touch targets */
button { height: 30px; } /* ❌ Too small */

/* Avoid position: fixed without safe area */
position: fixed;
bottom: 0; /* ❌ Overlaps home indicator */
```

## 🔧 Debugging

### Layout Boundaries (Development Only)
Uncomment in `mobile-optimizations.css`:
```css
@media (max-width: 768px) {
  .container { outline: 2px solid red; }
  .section { outline: 2px solid blue; }
  .grid { outline: 2px solid green; }
}
```

### Console Logging
Check browser console for:
```
✅ Mobile navigation initialized
✅ Mobile enhancements loaded
```

### Device Detection
```javascript
// Check device classes
document.documentElement.classList.contains('mobile-device')
document.documentElement.classList.contains('ios-device')
document.documentElement.classList.contains('android-device')
```

## 📱 Testing Quick Commands

### iOS Safari (Real Device)
```
http://localhost:PORT/variant-2/
```

### Chrome DevTools
```
1. F12
2. Cmd+Shift+M
3. Select iPhone 12 Pro
4. Refresh
```

### Firefox Responsive Mode
```
1. F12
2. Click responsive icon
3. Set 375x667 (iPhone SE)
```

## 🎨 Color & Theme

### Mobile Touch Highlight
```css
-webkit-tap-highlight-color: transparent;  /* No flash */
-webkit-tap-highlight-color: rgba(255, 233, 0, 0.2);  /* Yellow */
```

## 📏 Common Sizes Reference

```css
/* Touch Targets */
44px   - Minimum iOS tap target
48px   - Comfortable tap target
52px   - Large tap target

/* Typography */
16px   - Body text (prevents zoom)
20px   - Small heading
24px   - Medium heading
32px   - Large heading

/* Spacing */
8px    - Tight spacing
12px   - Compact spacing
16px   - Standard padding
24px   - Comfortable padding
32px   - Large spacing

/* Breakpoints */
320px  - iPhone SE (smallest)
375px  - iPhone 12 Mini
390px  - iPhone 13/14
430px  - iPhone 14 Plus
768px  - Tablet (mobile breakpoint)
```

## 🚀 Performance Targets

```
First Contentful Paint: < 1.5s
Time to Interactive: < 3s
Cumulative Layout Shift: < 0.1
Largest Contentful Paint: < 2.5s
```

---

**Quick Reference Version:** 2.0
**Last Updated:** 2025-10-21
**Status:** Production Ready
