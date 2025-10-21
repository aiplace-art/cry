# iOS Safari Mobile Web Best Practices (2025)

**Last Updated:** January 2025
**Target Audience:** Web developers building mobile-first experiences for iOS Safari

---

## Table of Contents
1. [iOS Safari Quirks & Known Issues](#ios-safari-quirks--known-issues)
2. [Safe Area Insets for Notch Devices](#safe-area-insets-for-notch-devices)
3. [Backdrop Filter Performance](#backdrop-filter-performance)
4. [Fixed Positioning on iOS](#fixed-positioning-on-ios)
5. [Touch Events Best Practices](#touch-events-best-practices)
6. [Preventing Zoom on Input Focus](#preventing-zoom-on-input-focus)
7. [Smooth Scrolling on iOS](#smooth-scrolling-on-ios)
8. [PWA Meta Tags for iOS](#pwa-meta-tags-for-ios)
9. [Required -webkit- Prefixes](#required--webkit--prefixes)
10. [Accessibility Requirements](#accessibility-requirements)

---

## iOS Safari Quirks & Known Issues

### Browser Detection
⚠️ **All browsers on iOS use WebKit**, even if they're branded as Chrome or Firefox. User-Agent strings may include "Chrome" or "Firefox" but they all share Safari's limitations.

**Best Practice:** Use feature detection instead of User-Agent sniffing:
```javascript
// ✅ Good: Feature detection
if ('serviceWorker' in navigator) {
  // PWA features available
}

// ❌ Bad: User-Agent detection
if (navigator.userAgent.includes('Safari')) {
  // Unreliable on iOS
}
```

### PWA Storage Limitations
- **Cache Storage:** 50MB hard limit
- **Script-writable Storage:** 7-day cap (iOS 13.4+)
- **HTTPS Required:** Even for localhost development (use ngrok or self-signed certificates)

### API Differences
iOS and macOS Safari differ subtly:
- Background media capture restrictions on iOS
- Different permission prompts
- Always test on actual devices, not just simulators

### Recent Safari 18 Updates (2025)
Safari 18.0-18.5 introduced:
- Deprecated many non-standard `-webkit` prefixed properties
- Improved Interop 2025 standards compliance
- Removed `backdrop-filter` prefix requirement
- Fixed numerous rendering and layout issues

---

## Safe Area Insets for Notch Devices

### The Problem
iPhone X and newer devices have notches and rounded corners that can obscure content if not properly handled.

### The Solution: viewport-fit and env()

#### 1. Add viewport-fit to your meta tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

**Options:**
- `contain` (default) - Insets page automatically to safe area
- `cover` - Content extends to full screen, requires manual safe area handling

#### 2. Use env() for safe area insets
```css
/* Basic implementation */
.header {
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.footer {
  padding-bottom: env(safe-area-inset-bottom);
}
```

#### 3. Combine with max() for minimum padding
```css
@supports(padding: max(0px)) {
  .element {
    /* Ensures at least 12px padding, more if needed for notch */
    padding-left: max(12px, env(safe-area-inset-left));
    padding-right: max(12px, env(safe-area-inset-right));
    padding-top: max(12px, env(safe-area-inset-top));
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
}
```

#### 4. Full-height layouts
```css
.full-height-container {
  /* Use custom property for iOS Safari */
  min-height: 100vh;
  min-height: -webkit-fill-available;

  /* Account for safe area */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

**Important Notes:**
- Safe area insets are `0px` on devices without notches (iPhone 8, etc.)
- `viewport-fit=cover` is safe to add to any site—it only activates when needed
- Test in both portrait and landscape orientations

---

## Backdrop Filter Performance

### The Issue
`backdrop-filter` can cause severe performance drops on iOS Safari, making interactions extremely slow.

### Safari 18 Changes (2025)
✅ **Good news:** Safari 18.0+ no longer requires the `-webkit-` prefix for `backdrop-filter`

### Performance Optimization Techniques

#### 1. GPU Acceleration (Critical!)
```css
.frosted-glass {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* Still needed for iOS < 18 */

  /* Force GPU acceleration - CRITICAL for performance */
  transform: translate3d(0, 0, 0);
  will-change: transform;
}
```

#### 2. Limit blur radius
```css
/* ❌ Avoid large blur values */
backdrop-filter: blur(30px); /* Very expensive */

/* ✅ Use smaller, optimized values */
backdrop-filter: blur(8px); /* Much better performance */
```

#### 3. Reduce affected area
```css
/* Apply backdrop-filter to smallest possible element */
.card::before {
  content: '';
  position: absolute;
  inset: 0;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: -1;
}
```

#### 4. Fallback for unsupported browsers
```css
.frosted-glass {
  /* Fallback: semi-transparent background */
  background-color: rgba(255, 255, 255, 0.8);
}

@supports (backdrop-filter: blur(10px)) or (-webkit-backdrop-filter: blur(10px)) {
  .frosted-glass {
    background-color: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transform: translate3d(0, 0, 0);
  }
}
```

#### 5. Dynamic elements workaround
```css
/* If element starts hidden, set minimum height */
.initially-hidden {
  min-height: 1px; /* Helps Safari initialize backdrop-filter */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
```

**Performance Recommendations:**
- Test thoroughly on actual iOS devices before deploying
- Consider using an image fallback instead of polyfills
- Monitor performance with Safari's Web Inspector
- Use sparingly—backdrop-filter is expensive on mobile

---

## Fixed Positioning on iOS

### iOS 26 Critical Bug (Late 2024/Early 2025)
⚠️ **Major issue:** Full-height fixed/sticky elements shifted vertically when address bar resized.

**Status:** Fixed in iOS 26.1 beta (September 2025)

### Common Fixed Position Issues & Solutions

#### 1. iOS 26 Nested Container Workaround
```html
<div class="fixed-outer">
  <div class="fixed-inner">
    <!-- Your content here -->
  </div>
</div>
```

```css
.fixed-outer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: block;
  width: 85vw; /* At least 85vw */
  height: 45vh; /* Less than 50vh */
}

.fixed-inner {
  height: 100vh; /* Full viewport height */
  overflow-y: auto;
}
```

#### 2. Custom Viewport Height Variable
```javascript
// Set CSS custom property for true viewport height
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set on load and resize
window.addEventListener('load', setViewportHeight);
window.addEventListener('resize', setViewportHeight);
```

```css
.fixed-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  /* Use custom property instead of 100vh */
  height: calc(var(--vh, 1vh) * 100);
}
```

#### 3. GPU Acceleration for Fixed Elements
```css
.fixed-header {
  position: fixed;
  top: 0;
  width: 100%;

  /* Prevent flickering and disappearing */
  transform: translate3d(0, 0, 0);
  -webkit-transform: translate3d(0, 0, 0);
}
```

#### 4. Z-index Issues During Scrolling
```css
.fixed-nav {
  position: fixed;
  z-index: 1000;

  /* Fix z-index ordering bugs during scroll */
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}
```

#### 5. Background Attachment Fixed (Not Supported)
```css
/* ❌ Does NOT work on iOS Safari */
.hero {
  background-attachment: fixed;
}

/* ✅ Alternative: Use transform on scroll with JavaScript */
.hero {
  background-image: url('hero.jpg');
  background-size: cover;
  background-position: center;
}
```

### Body Scroll Locking for Modals
```javascript
// Prevent background scroll when modal is open
function lockBodyScroll() {
  const scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
}

function unlockBodyScroll() {
  const scrollY = document.body.style.top;
  document.body.style.position = '';
  document.body.style.top = '';
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
}
```

---

## Touch Events Best Practices

### 1. CSS touch-action Property (Recommended)
```css
/* Disable double-tap zoom on specific elements */
button, a, .interactive {
  touch-action: manipulation;
}

/* Allow only vertical scrolling */
.scrollable-content {
  touch-action: pan-y;
}

/* Disable all gestures except taps */
.map-container {
  touch-action: none;
}
```

**Values:**
- `auto` - Default browser behavior
- `manipulation` - Pan and zoom only (disables double-tap zoom)
- `pan-x` - Only horizontal panning
- `pan-y` - Only vertical panning
- `pinch-zoom` - Multi-finger panning and zooming
- `none` - Disable all gestures

#### 2. Prevent Pinch Zoom (JavaScript)
```javascript
// Modern approach with passive:false
window.addEventListener('touchmove', function(event) {
  if (event.scale !== 1) {
    event.preventDefault();
  }
}, { passive: false });

// Prevent double-tap zoom
window.addEventListener('touchend', function(event) {
  const now = Date.now();
  const delta = now - (window.lastTouchEnd || now);

  if (delta < 300) {
    event.preventDefault();
  }

  window.lastTouchEnd = now;
}, { passive: false });
```

**Important:** Set `{ passive: false }` to allow `preventDefault()`

#### 3. Detect Touch vs Mouse
```javascript
// Feature detection for touch support
const isTouchDevice = 'ontouchstart' in window ||
                      navigator.maxTouchPoints > 0;

// Handle both touch and mouse events
element.addEventListener('touchstart', handleStart, { passive: true });
element.addEventListener('mousedown', handleStart);

element.addEventListener('touchend', handleEnd, { passive: true });
element.addEventListener('mouseup', handleEnd);
```

#### 4. Fast Click (300ms Tap Delay)
```css
/* Modern browsers (including iOS Safari 11+) no longer have 300ms delay
   if viewport is set properly */
html {
  touch-action: manipulation;
}
```

**Note:** iOS Safari eliminated the 300ms delay when using proper viewport meta tags and `touch-action: manipulation`

---

## Preventing Zoom on Input Focus

### The Problem
iOS Safari auto-zooms when focusing inputs with font-size < 16px, disrupting UX.

### Solutions

#### 1. 16px Font Size (Recommended)
```css
/* ✅ Best practice: Use 16px minimum */
input, select, textarea {
  font-size: 16px;
}

/* For smaller visual appearance, use transform */
.small-input {
  font-size: 16px; /* Prevents zoom */
  transform: scale(0.875); /* Visually 14px */
  transform-origin: left center;
}
```

#### 2. Viewport Meta Tag (Legacy)
```html
<!-- ⚠️ Not recommended: Accessibility violation -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

**Important:** `user-scalable=no` and `maximum-scale=1.0` violate WCAG accessibility guidelines and are ignored in iOS 10+

#### 3. Dynamic Font Size Adjustment
```javascript
// Increase font size on focus, decrease on blur
const inputs = document.querySelectorAll('input, select, textarea');

inputs.forEach(input => {
  input.addEventListener('focus', () => {
    input.style.fontSize = '16px';
  });

  input.addEventListener('blur', () => {
    input.style.fontSize = '14px';
  });
});
```

#### 4. Disable Zoom on Specific Elements
```css
/* Use touch-action on form elements */
input[type="text"],
input[type="email"],
input[type="tel"],
select,
textarea {
  font-size: 16px;
  touch-action: manipulation;
}
```

### Recommended Approach
```css
/* Global form element styles */
input,
select,
textarea,
button {
  /* Prevent auto-zoom */
  font-size: 16px;

  /* Disable double-tap zoom */
  touch-action: manipulation;
}

/* Desktop: Allow smaller fonts */
@media (min-width: 768px) {
  input,
  select,
  textarea {
    font-size: 14px;
  }
}
```

---

## Smooth Scrolling on iOS

### Momentum Scrolling

#### 1. Enable Momentum Scrolling (Required for iOS < 13)
```css
.scrollable-container {
  overflow-y: scroll; /* Must be 'scroll', not 'auto' */
  -webkit-overflow-scrolling: touch;

  /* Optional: Hide scrollbar */
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollable-container::-webkit-scrollbar {
  display: none;
}
```

**iOS 13+ Changes:**
- `overflow: scroll` and `iframe` elements get accelerated scrolling automatically
- `-webkit-overflow-scrolling: touch` is now a no-op on iPad
- Still creates CSS stacking context on iPhone

#### 2. Prevent Overscroll Bounce
```css
/* Prevent rubber-band effect on body */
body {
  position: fixed;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

/* Create internal scrollable container */
.app-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
```

#### 3. Overscroll Behavior (Modern)
```css
/* Prevent pull-to-refresh and overscroll glow */
body {
  overscroll-behavior-y: contain;
}

/* Completely disable overscroll */
.no-bounce {
  overscroll-behavior: none;
}
```

#### 4. Smooth Scroll Behavior
```css
/* Enable smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Disable for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

```javascript
// Programmatic smooth scroll
element.scrollTo({
  top: 500,
  behavior: 'smooth'
});
```

### Known Side Effects of -webkit-overflow-scrolling
- Flickering on absolute elements during scroll
- `position: fixed` children cannot render outside parent
- `jQuery(document).scrollTop()` may not work correctly
- Can cause z-index stacking issues

### Horizontal Scrolling
```css
.horizontal-scroll {
  display: flex;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;

  /* Hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.horizontal-scroll::-webkit-scrollbar {
  display: none;
}

.scroll-item {
  scroll-snap-align: start;
  flex: 0 0 auto;
}
```

---

## PWA Meta Tags for iOS

### Essential Meta Tags

#### 1. Enable Standalone Mode
```html
<!-- Makes PWA fullscreen when launched from home screen -->
<meta name="apple-mobile-web-app-capable" content="yes">
```

**Effect:** Removes Safari browser chrome (URL bar, navigation buttons)

#### 2. Status Bar Styling
```html
<!-- Status bar appearance -->
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

**Options:**
- `default` - White status bar with black text
- `black` - Black status bar with white text
- `black-translucent` - Content extends behind translucent status bar

**Note:** Only works when `apple-mobile-web-app-capable` is set to "yes"

#### 3. App Title
```html
<!-- Custom name on home screen -->
<meta name="apple-mobile-web-app-title" content="HypeAI">
```

#### 4. Theme Color
```html
<!-- Browser chrome color -->
<meta name="theme-color" content="#00E5FF">
```

### Complete PWA Setup

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">

  <!-- PWA Meta Tags -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="HypeAI">
  <meta name="theme-color" content="#00E5FF">

  <!-- Icons -->
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png">
  <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167.png">
  <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png">
  <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120.png">

  <!-- Startup Images -->
  <link rel="apple-touch-startup-image" href="/splash/iphone-x.png"
        media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)">

  <!-- Manifest -->
  <link rel="manifest" href="/manifest.json">

  <title>HypeAI</title>
</head>
<body>
  <!-- Your app -->

  <script>
    // Detect standalone mode
    if (window.navigator.standalone === true) {
      console.log('Running as PWA');
    }
  </script>
</body>
</html>
```

### Manifest.json
```json
{
  "name": "HypeAI - Infinite Intelligence",
  "short_name": "HypeAI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#00E5FF",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### JavaScript Detection
```javascript
// Check if running in standalone mode
const isStandalone = window.navigator.standalone ||
                     window.matchMedia('(display-mode: standalone)').matches;

if (isStandalone) {
  // Hide "Add to Home Screen" prompt
  document.querySelector('.install-prompt').style.display = 'none';
}

// iOS-specific detection
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

if (isIOS && !isStandalone) {
  // Show iOS installation instructions
  showIOSInstallGuide();
}
```

---

## Required -webkit- Prefixes

### Safari 18 Changes (2025)
Safari 18.0+ has been **removing** many non-standard `-webkit-` prefixes to improve standards compliance.

### Properties That NO LONGER Need -webkit- (Safari 18+)
```css
/* ✅ No prefix needed in Safari 18+ */
.element {
  backdrop-filter: blur(10px);
  user-select: none;
}
```

### Properties That STILL Need -webkit- Prefix
```css
/* Still need prefix for older iOS versions */
.element {
  /* Scrolling */
  -webkit-overflow-scrolling: touch;

  /* Appearance */
  -webkit-appearance: none;
  appearance: none;

  /* Text */
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;

  /* Masks */
  -webkit-mask-image: url(mask.png);
  mask-image: url(mask.png);

  /* Tap highlight */
  -webkit-tap-highlight-color: transparent;
}
```

### Flexbox (No Prefix Needed Since iOS 9+)
```css
/* ✅ Modern (no prefix) */
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
```

### Grid (Fully Supported Since iOS 10.3+)
```css
/* ✅ No prefix needed */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
```

### Transforms & Transitions (No Prefix Needed)
```css
/* ✅ No prefix needed in modern iOS */
.animated {
  transform: translate3d(0, 0, 0);
  transition: all 0.3s ease;
}
```

### Best Practice: Defensive Prefixing
```css
/* Include both prefixed and unprefixed for maximum compatibility */
.element {
  -webkit-backdrop-filter: blur(10px); /* iOS < 18 */
  backdrop-filter: blur(10px); /* iOS 18+, other browsers */

  -webkit-transform: translate3d(0, 0, 0); /* Safety */
  transform: translate3d(0, 0, 0);
}
```

### Using Autoprefixer
```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer')({
      overrideBrowserslist: [
        'iOS >= 12',
        'Safari >= 12'
      ]
    })
  ]
}
```

---

## Accessibility Requirements

### 1. Zoom Must Be Allowed
```html
<!-- ❌ WCAG Violation -->
<meta name="viewport" content="user-scalable=no, maximum-scale=1.0">

<!-- ✅ WCAG Compliant -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**Note:** iOS 10+ ignores `user-scalable=no` for accessibility reasons

### 2. Minimum Touch Target Size
```css
/* WCAG 2.1 Level AAA: 44x44px minimum */
button, a, input[type="checkbox"], input[type="radio"] {
  min-width: 44px;
  min-height: 44px;

  /* Visual size can be smaller with padding */
  padding: 12px;
}
```

### 3. Focus Indicators
```css
/* Never remove focus outlines without replacement */
button:focus,
a:focus,
input:focus {
  outline: 2px solid #00E5FF;
  outline-offset: 2px;
}

/* Remove outline only if providing alternative */
button:focus:not(:focus-visible) {
  outline: none;
}

button:focus-visible {
  outline: 2px solid #00E5FF;
  outline-offset: 2px;
}
```

### 4. Reduced Motion
```css
/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 5. Color Contrast
```css
/* WCAG AA: 4.5:1 for normal text, 3:1 for large text */
.text {
  color: #ffffff;
  background-color: #0077ff;
}

/* Test with Safari's Accessibility Inspector */
```

### 6. VoiceOver Support
```html
<!-- Proper ARIA labels -->
<button aria-label="Close menu">
  <svg><!-- Icon --></svg>
</button>

<!-- Skip navigation links -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Landmark regions -->
<header role="banner">
<nav role="navigation" aria-label="Main navigation">
<main role="main" id="main-content">
<footer role="contentinfo">
```

### 7. Dark Mode Support
```css
/* Respect system preference */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #000000;
    --text-color: #ffffff;
    --accent-color: #00E5FF;
  }
}

/* Theme color meta */
<meta name="theme-color" content="#00E5FF" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0077FF" media="(prefers-color-scheme: dark)">
```

---

## Quick Reference Checklist

### Every iOS Safari Project Should Include:

- [ ] Proper viewport meta tag with `viewport-fit=cover`
- [ ] Safe area insets using `env(safe-area-inset-*)`
- [ ] 16px minimum font size on form inputs
- [ ] `touch-action: manipulation` on interactive elements
- [ ] `-webkit-overflow-scrolling: touch` for scrollable containers
- [ ] GPU acceleration with `transform: translate3d(0,0,0)` on fixed elements
- [ ] Reduced motion media query
- [ ] Proper ARIA labels and semantic HTML
- [ ] Focus indicators that meet WCAG standards
- [ ] 44x44px minimum touch targets
- [ ] PWA meta tags if building standalone app
- [ ] Test on actual iOS devices (not just simulators)

### Performance Optimizations:

- [ ] Minimize `backdrop-filter` usage
- [ ] Use custom `--vh` variable for viewport height
- [ ] Lazy load images and heavy resources
- [ ] Optimize animations for 60fps
- [ ] Reduce JavaScript bundle size
- [ ] Enable gzip/brotli compression
- [ ] Use modern image formats (WebP, AVIF)
- [ ] Implement service worker for offline support

### Testing Tools:

- **Safari Web Inspector** (macOS Safari → Develop → [Your iPhone])
- **Xcode Simulator** (for initial testing only)
- **Real devices** (iPhone 12+, various iOS versions)
- **Lighthouse** (PWA and performance audits)
- **Safari Technology Preview** (test upcoming features)

---

## Additional Resources

### Official Documentation
- [Apple: Creating Compatible Web Content](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/)
- [WebKit Blog](https://webkit.org/blog/)
- [Safari 18 Features](https://webkit.org/blog/15865/webkit-features-in-safari-18-0/)
- [Interop 2025](https://wpt.fyi/interop-2025)

### Community Resources
- [GitHub: iOS WebKit Quirks](https://github.com/s-hens/ios-webkit-quirks)
- [Can I Use](https://caniuse.com/) (check feature support)
- [Should I Prefix](https://shouldiprefix.com/) (prefix requirements)
- [MDN Web Docs](https://developer.mozilla.org/) (comprehensive references)

### Debugging
- [How to Debug on iPhone Safari](https://www.browserstack.com/guide/how-to-debug-on-iphone)
- [Safari Developer Tools](https://developer.apple.com/safari/tools/)

---

**Document Version:** 1.0
**Last Verified:** January 2025
**Target iOS Version:** iOS 15.0 - iOS 18.5+
**Target Safari Version:** Safari 15.0 - Safari 18.5+

---

*This document is maintained as part of the HypeAI project. Report issues or suggest updates via the project repository.*
