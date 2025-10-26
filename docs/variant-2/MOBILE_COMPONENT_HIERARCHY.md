# 🧩 MOBILE COMPONENT HIERARCHY & VISUAL GUIDE

**Mobile-First Component Structure**
**Date:** 2025-10-21
**Version:** 1.0

---

## 📊 VISUAL COMPONENT TREE

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE WEBSITE                           │
│                 (320px - 768px width)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌────────┐          ┌──────────┐          ┌──────────┐
   │ HEADER │          │   MAIN   │          │  FOOTER  │
   │ (Fixed)│          │ (Scroll) │          │ (Static) │
   └────────┘          └──────────┘          └──────────┘
        │                     │                     │
        │                     │                     │
┌───────┴──────────┐  ┌───────┴────────┐   ┌────┴────────┐
│                  │  │                │   │             │
▼                  ▼  ▼                ▼   ▼             ▼
┌──────────┐  ┌────────┐  ┌─────────┐  ┌──────┐  ┌────────┐
│  Logo    │  │Language│  │  Hero   │  │Sections│  │ Links │
│ (Brand)  │  │Switcher│  │ Section │  │(Content)│  │(Nav)  │
└──────────┘  └────────┘  └─────────┘  └───────┘  └────────┘
│             │           │            │           │
▼             ▼           ▼            ▼           ▼
┌──────────┐  ┌────────┐  ┌─────────┐  ┌──────┐  ┌────────┐
│Hamburger │  │Dropdown│  │  Stats  │  │ Cards│  │Social  │
│  Menu    │  │ (EN/RU)│  │  Grid   │  │ Grid │  │ Icons  │
└──────────┘  └────────┘  └─────────┘  └──────┘  └────────┘
│
▼
┌──────────────────┐
│  Mobile Nav      │
│  Overlay         │
│  (Full-screen)   │
│                  │
│  ┌────────────┐  │
│  │ Nav Links  │  │
│  │ (Vertical) │  │
│  └────────────┘  │
│  ┌────────────┐  │
│  │ CTA Button │  │
│  └────────────┘  │
│  ┌────────────┐  │
│  │   Social   │  │
│  └────────────┘  │
└──────────────────┘
```

---

## 🎨 COMPONENT SPECIFICATIONS

### 1. HEADER (Mobile Fixed)

**Dimensions:**
- Height: `64px`
- Width: `100vw`
- Position: `fixed top-0`
- Z-index: `1000`

**Layout:**
```
┌────────────────────────────────────────┐
│ [Logo]        [Lang] [☰ Hamburger]    │
│ 140px          60px    44px            │
└────────────────────────────────────────┘
```

**Structure:**
```html
<header class="header">
  <div class="container">
    <div class="header-content">
      <!-- Left: Logo (flex-shrink: 0) -->
      <a class="logo">
        <img height="32px">
      </a>

      <!-- Right: Actions (flex-shrink: 0) -->
      <div class="header-actions">
        <!-- Language Switcher (44px min) -->
        <div class="language-switcher">
          <button class="lang-btn" min-height="44px">
            EN ▼
          </button>
          <div class="lang-dropdown">
            <!-- Options -->
          </div>
        </div>

        <!-- Hamburger (44px × 44px) -->
        <button class="hamburger">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>
    </div>
  </div>
</header>
```

**CSS Key Points:**
```css
.header {
  position: fixed;
  top: 0;
  width: 100%;
  height: 64px;
  backdrop-filter: blur(20px);
  z-index: 1000;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  gap: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
```

---

### 2. HAMBURGER MENU (Touch-Optimized)

**Dimensions:**
- Button: `44px × 44px` (Apple HIG minimum)
- Lines: `24px × 2px`
- Line spacing: `6px`

**States:**
```
┌──────────────────────────────────────┐
│ CLOSED STATE:    OPEN STATE (X):    │
│                                      │
│  ─────────       ╲       ╱           │
│  ─────────         ╲   ╱             │
│  ─────────           ╳               │
│                    ╱   ╲             │
│                  ╱       ╲           │
└──────────────────────────────────────┘
```

**Animation Timing:**
```css
/* Smooth cubic-bezier easing */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Line transformations */
Line 1: translateY(8px) rotate(45deg)
Line 2: opacity: 0, scaleX(0)
Line 3: translateY(-8px) rotate(-45deg)
```

**Touch Target Expansion:**
```css
.hamburger {
  position: relative;
  width: 44px;
  height: 44px;
  padding: 10px; /* Visual click area */
}

/* Expanded touch area (invisible) */
.hamburger::before {
  content: '';
  position: absolute;
  inset: -8px; /* 60px × 60px total */
}
```

---

### 3. MOBILE NAVIGATION OVERLAY (Full-Screen)

**Dimensions:**
- Width: `100vw` (100dvw on iOS)
- Height: `100vh` (100dvh on iOS)
- Position: `fixed top-0 left-0`
- Z-index: `999`

**Layout:**
```
┌─────────────────────────────┐
│     Mobile Nav Overlay      │
│   (Dark blur background)    │
│                             │
│      ┌───────────────┐      │
│      │     Home      │      │
│      ├───────────────┤      │
│      │   Services    │      │
│      ├───────────────┤      │
│      │     About     │      │
│      ├───────────────┤      │
│      │  Whitepaper   │      │
│      ├───────────────┤      │
│      │   Roadmap     │      │
│      └───────────────┘      │
│                             │
│   ┌─────────────────────┐   │
│   │   JOIN PRESALE      │   │
│   │   (Primary CTA)     │   │
│   └─────────────────────┘   │
│                             │
│      [Twitter] [Telegram]   │
│                             │
└─────────────────────────────┘
```

**Structure:**
```html
<nav class="mobile-nav-overlay" aria-hidden="true">
  <!-- Nav Links (Centered, vertical) -->
  <ul class="mobile-nav-list">
    <li>
      <a href="/" class="mobile-nav-link">
        Home
      </a>
    </li>
    <!-- More links... -->
  </ul>

  <!-- CTA Button (Full width, max-width 300px) -->
  <div class="mobile-nav-cta">
    <a href="/presale" class="btn btn-primary btn-lg">
      Join Presale
    </a>
  </div>

  <!-- Social Links (Icon row) -->
  <div class="mobile-nav-social">
    <a class="social-link">Twitter</a>
    <a class="social-link">Telegram</a>
  </div>
</nav>
```

**Animation States:**
```css
/* Hidden (initial) */
.mobile-nav-overlay {
  opacity: 0;
  visibility: hidden;
  transform: translateY(-100%);
  transition: all 0.4s ease;
}

/* Visible (active) */
.mobile-nav-overlay.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
```

---

### 4. LANGUAGE SWITCHER (Mobile-Optimized)

**Button Dimensions:**
- Width: `60px` minimum
- Height: `44px` minimum
- Gap: `6px` between elements

**Dropdown Positioning:**
```
┌────────────────────────────┐
│ Header (Fixed)             │
│              [EN ▼] [☰]    │ ← Language button
└────────────────────────────┘
                 │
                 ▼ (8px gap)
         ┌───────────────┐
         │  🇬🇧 English  │ ← Dropdown
         │  🇷🇺 Русский  │   (Fixed position)
         │  🇨🇳 中文      │
         └───────────────┘
```

**CSS Positioning:**
```css
/* Mobile: Fixed positioning relative to viewport */
.lang-dropdown {
  position: fixed;
  top: calc(64px + 8px); /* Header height + gap */
  right: 16px;
  max-width: calc(100vw - 32px);
  z-index: 9999;
}

/* Desktop: Absolute relative to button */
@media (min-width: 768px) {
  .lang-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
  }
}
```

**Touch Targets:**
```css
.lang-btn {
  min-width: 60px;
  min-height: 44px;
  padding: 10px 14px;
}

.lang-option {
  min-height: 44px;
  padding: 14px 16px;
  font-size: 16px; /* Prevents iOS zoom */
}
```

---

### 5. HERO SECTION (Mobile Layout)

**Layout Structure:**
```
┌─────────────────────────────────┐
│        HERO SECTION             │
│                                 │
│  ┌───────────────────────────┐  │
│  │     Main Title (H1)       │  │
│  │   clamp(32px, 10vw, 48px) │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │   Description (P)         │  │
│  │     16px, line-height 1.6 │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  CTA Button (52px height) │  │
│  │     Full width (mobile)   │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌─────────┬─────────┐          │
│  │ Stat 1  │ Stat 2  │          │
│  │ 27 AI   │ 35+     │          │
│  │ Agents  │ Services│          │
│  ├─────────┼─────────┤          │
│  │ Stat 3  │ Stat 4  │          │
│  │ 24/7    │ 50-70%  │          │
│  │Available│ Cheaper │          │
│  └─────────┴─────────┘          │
│   (2-column grid)               │
│                                 │
└─────────────────────────────────┘
```

**Grid Breakpoints:**
```css
/* Mobile: 2 columns */
@media (max-width: 768px) {
  .hero-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

/* Extra small: 1 column */
@media (max-width: 375px) {
  .hero-stats {
    grid-template-columns: 1fr;
  }
}
```

---

### 6. SERVICE CARDS (Mobile Stack)

**Layout:**
```
┌─────────────────────────────────┐
│      SERVICE CARD               │
│  ┌─────────────────────────┐    │
│  │  🔷 Icon (40px)          │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  Title (22px, bold)     │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  Description (15px)     │    │
│  │  Line-height: 1.6       │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  ✓ Feature 1            │    │
│  │  ✓ Feature 2            │    │
│  │  ✓ Feature 3            │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │   Learn More (Button)   │    │
│  │   (44px height)         │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

**Mobile Grid:**
```css
/* Single column on mobile */
@media (max-width: 768px) {
  .featured-services-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .service-card {
    padding: 20px;
  }
}
```

---

### 7. FOOTER (Mobile Center-Aligned)

**Layout:**
```
┌─────────────────────────────────┐
│         FOOTER                  │
│                                 │
│  ┌─────────────────────────┐    │
│  │     Logo (50px)         │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Home | About | Services │    │
│  │ Whitepaper | Docs       │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  [T] [Tel] [Discord]    │    │
│  │  (Social icons, 44px)   │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ © 2024 HypeAI           │    │
│  │ Built on BNB Chain      │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

**Mobile Styling:**
```css
@media (max-width: 768px) {
  .footer {
    text-align: center;
    padding: 48px 0 32px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .footer-links {
    flex-wrap: wrap;
    justify-content: center;
  }

  .social-icon {
    width: 44px;
    height: 44px;
  }
}
```

---

## 🎯 COMPONENT INTERACTION FLOW

### User Journey: Opening Mobile Menu

```
┌──────────────────────────────────────────────────┐
│ 1. User taps hamburger button (44px × 44px)     │
└──────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│ 2. JavaScript event: hamburger.addEventListener  │
│    - Add .active class to hamburger              │
│    - Add .active class to overlay                │
│    - Set aria-expanded="true"                    │
│    - Add .nav-open to body                       │
└──────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│ 3. CSS transitions activate:                    │
│    - Hamburger: 3 lines → X animation (300ms)   │
│    - Overlay: opacity 0→1, translateY (400ms)   │
│    - Body: overflow hidden (no scroll)          │
└──────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│ 4. Overlay fully visible:                       │
│    - Focus moves to first nav link              │
│    - Focus trap activated (Tab cycles inside)   │
│    - Escape key listener active                 │
└──────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│ 5. User taps navigation link:                   │
│    - Link click handler fires                   │
│    - closeNav() called                          │
│    - Page navigation occurs                     │
└──────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│ 6. Cleanup:                                      │
│    - Remove .active classes                     │
│    - Set aria-expanded="false"                  │
│    - Remove .nav-open from body                 │
│    - Return focus to hamburger button           │
└──────────────────────────────────────────────────┘
```

---

## 📐 RESPONSIVE BREAKPOINTS SUMMARY

| Breakpoint | Width | Layout Changes |
|-----------|-------|----------------|
| **Mobile Small** | 320px | - Single column<br>- Stats: 1 column<br>- Smallest fonts<br>- Minimal padding (12px) |
| **Mobile Standard** | 375px | - Single column<br>- Stats: 2 columns<br>- Standard fonts<br>- Medium padding (16px) |
| **Mobile Large** | 414px | - Single column<br>- Stats: 2 columns<br>- Larger fonts<br>- Medium padding (16px) |
| **Tablet** | 768px+ | - Show desktop nav<br>- Hide hamburger<br>- 2-column grids<br>- Larger padding (32px) |
| **Desktop** | 1024px+ | - 3-column grids<br>- Desktop nav always visible<br>- Max container width |

---

## 🎨 TYPOGRAPHY SCALE (Mobile)

```
┌─────────────────────────────────────────────────┐
│ MOBILE TYPOGRAPHY HIERARCHY                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  H1 (Hero Title)                                │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                          │
│  clamp(32px, 10vw, 48px)                        │
│  Line-height: 1.1                               │
│  Weight: 700 (Bold)                             │
│                                                 │
│  H2 (Section Title)                             │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓                                │
│  clamp(24px, 7vw, 36px)                         │
│  Line-height: 1.2                               │
│  Weight: 700 (Bold)                             │
│                                                 │
│  H3 (Card Title)                                │
│  ▓▓▓▓▓▓▓▓▓▓                                    │
│  clamp(20px, 5vw, 28px)                         │
│  Line-height: 1.3                               │
│  Weight: 600 (Semibold)                         │
│                                                 │
│  P (Body Text)                                  │
│  ░░░░░░░░░░░░░░                                │
│  16px (fixed)                                   │
│  Line-height: 1.6                               │
│  Weight: 400 (Regular)                          │
│                                                 │
│  Button Text                                    │
│  ▓▓▓▓▓▓                                        │
│  16px (fixed)                                   │
│  Line-height: 1.5                               │
│  Weight: 600 (Semibold)                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Why 16px for body text?**
- Prevents iOS Safari zoom on input focus
- WCAG AA compliance for readability
- Optimal for mobile reading distance

---

## 🎯 TOUCH TARGET VISUALIZATION

```
┌─────────────────────────────────────────────────┐
│ MINIMUM TOUCH TARGET: 44px × 44px              │
│ (Apple HIG, Material Design)                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Too Small (BAD):          Correct (GOOD):     │
│                                                 │
│  ┌──────────┐              ┌──────────────┐    │
│  │  Button  │              │   Button     │    │
│  │  32×32px │              │   44×44px    │    │
│  └──────────┘              └──────────────┘    │
│                                                 │
│  Hard to tap               Easy to tap         │
│  with finger               with finger         │
│                                                 │
│  ┌────┐                    ┌──────────────┐    │
│  │Icon│                    │  Icon (44px) │    │
│  │24px│                    │  Padded      │    │
│  └────┘                    └──────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Implementation:**
```css
/* All interactive elements */
button,
a,
.interactive {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 24px;
}

/* Expanded touch area (invisible) */
.btn::before {
  content: '';
  position: absolute;
  inset: -8px;
}
```

---

## 🔄 STATE MANAGEMENT DIAGRAM

```
┌─────────────────────────────────────────────────┐
│           APPLICATION STATE FLOW                │
└─────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐      ┌──────────────────┐
│ Mobile Nav   │      │ Language         │
│ State        │      │ Switcher State   │
├──────────────┤      ├──────────────────┤
│ isOpen:      │      │ currentLang: EN  │
│   false/true │      │ isOpen:          │
│              │      │   false/true     │
│ Methods:     │      │                  │
│ - open()     │      │ Methods:         │
│ - close()    │      │ - toggle()       │
│ - toggle()   │      │ - select(lang)   │
└──────────────┘      └──────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌──────────────────────────────────────┐
│         DOM UPDATES                  │
│                                      │
│ - Add/remove .active class           │
│ - Update aria-expanded attribute     │
│ - Add/remove .nav-open on body       │
│ - Trigger CSS transitions            │
└──────────────────────────────────────┘
```

---

## ✅ COMPONENT CHECKLIST

Before marking a component as complete:

### Header Component
- [ ] Fixed positioning works on mobile
- [ ] 64px height on all devices
- [ ] Logo visible and sized correctly (32px height)
- [ ] Hamburger button: 44px × 44px
- [ ] Language switcher: 44px minimum height
- [ ] Safe area insets respected (iPhone notch)
- [ ] Z-index hierarchy correct (1000+)

### Hamburger Menu
- [ ] Smooth X animation (300ms)
- [ ] Touch target: 44px × 44px
- [ ] ARIA labels present
- [ ] Keyboard accessible (Tab, Enter)
- [ ] Focus visible (3px yellow outline)

### Mobile Nav Overlay
- [ ] Full-screen (100vh/100dvh)
- [ ] Dark blur background
- [ ] Smooth slide-in animation (400ms)
- [ ] Body scroll locked when open
- [ ] Focus trapped inside
- [ ] Escape key closes menu
- [ ] Links close menu on tap
- [ ] Safe area insets (iPhone)

### Language Switcher
- [ ] Button: 60px wide, 44px tall
- [ ] Dropdown: Fixed positioning on mobile
- [ ] Options: 44px minimum height
- [ ] Prevents iOS zoom (16px font)
- [ ] Active language highlighted
- [ ] Closes on outside tap
- [ ] Keyboard accessible

### Forms & Inputs
- [ ] All inputs: 16px font-size (iOS zoom prevention)
- [ ] Min height: 44px
- [ ] Touch-optimized padding
- [ ] Labels: 16px font-size
- [ ] Clear focus states

### Cards & Grids
- [ ] Single column on mobile (<768px)
- [ ] 20px padding on cards
- [ ] 16px gap between items
- [ ] No horizontal overflow
- [ ] Readable text contrast

### Buttons & CTAs
- [ ] Min height: 44px
- [ ] Full width on mobile
- [ ] Touch-friendly padding (12px 24px)
- [ ] Clear tap feedback
- [ ] 16px font-size

### Performance
- [ ] Animations reduced on mobile
- [ ] Blur effects optimized (15px max)
- [ ] Heavy decorative elements hidden
- [ ] Images lazy loaded
- [ ] Critical CSS inlined

---

## 🎓 KEY LEARNINGS & BEST PRACTICES

### 1. Always Start Mobile-First
```css
/* ✅ CORRECT */
.element { font-size: 16px; }
@media (min-width: 768px) {
  .element { font-size: 18px; }
}

/* ❌ WRONG */
.element { font-size: 18px; }
@media (max-width: 768px) {
  .element { font-size: 16px !important; }
}
```

### 2. Use clamp() for Fluid Typography
```css
/* Scales between 32px and 48px based on viewport */
h1 {
  font-size: clamp(32px, 10vw, 48px);
}
```

### 3. Touch Targets Must Be 44px Minimum
```css
button {
  min-width: 44px;
  min-height: 44px;
}
```

### 4. Prevent iOS Zoom with 16px Font
```css
input {
  font-size: 16px; /* Critical! */
}
```

### 5. Use Safe Area Insets for iPhone Notch
```css
.header {
  padding-top: max(12px, env(safe-area-inset-top));
}
```

---

## 📚 REFERENCE MATERIALS

### Design Systems Referenced
- **Apple Human Interface Guidelines**: Touch targets, typography
- **Material Design**: Component spacing, elevation
- **BNBChain.org**: Visual design language, color palette

### Accessibility Standards
- **WCAG 2.1 Level AA**: Color contrast, keyboard navigation
- **ARIA**: Semantic HTML, screen reader support

### Performance Benchmarks
- **Google Lighthouse**: Performance scoring
- **Core Web Vitals**: LCP, FID, CLS metrics

---

**Next Steps:**
1. Use this hierarchy as implementation guide
2. Test each component on real devices
3. Verify all touch targets meet 44px minimum
4. Ensure accessibility compliance

**Questions?** Contact System Architecture Designer
