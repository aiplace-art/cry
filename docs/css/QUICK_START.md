# Quick Start - Professional Theme

## 1-Minute Integration

### Add to HTML
```html
<head>
  <!-- Professional Theme -->
  <link rel="stylesheet" href="/css/professional-theme.css">
</head>
```

### Use Components

#### Buttons
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-outline">Outline</button>
```

#### Cards
```html
<div class="card hover-lift">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
  </div>
  <div class="card-body">
    <p class="text-secondary">Content here</p>
  </div>
</div>
```

#### Typography
```html
<h1 class="text-5xl font-black">Main Heading</h1>
<p class="text-lg text-secondary">Body text</p>
```

#### Flexbox Layout
```html
<div class="flex items-center justify-between gap-3">
  <span>Left</span>
  <span>Right</span>
</div>
```

## Most Used Utilities

### Text
- `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`
- `font-bold`, `font-semibold`, `font-medium`
- `text-primary`, `text-secondary`, `text-tertiary`

### Spacing
- `m-2`, `m-3`, `m-4` (margin)
- `p-2`, `p-3`, `p-4` (padding)
- `mt-2`, `mb-3` (margin top/bottom)
- `gap-2`, `gap-3`, `gap-4` (flex/grid gap)

### Layout
- `flex`, `flex-col`, `grid`
- `items-center`, `items-start`, `items-end`
- `justify-center`, `justify-between`

### Animations
- `animate-fade-in-up`
- `animate-slide-in-left`
- `hover-lift`, `hover-scale`

## CSS Variables - Top 20

```css
/* Colors */
var(--color-primary)
var(--color-accent)
var(--color-success)
var(--color-error)
var(--color-text)
var(--color-text-muted)

/* Spacing */
var(--space-2)
var(--space-3)
var(--space-4)

/* Typography */
var(--text-base)
var(--text-lg)
var(--text-2xl)

/* Shadows */
var(--shadow-md)
var(--shadow-lg)

/* Transitions */
var(--transition-fast)
var(--transition-base)

/* Radius */
var(--radius-md)
var(--radius-lg)
```

## Examples

### Hero Section
```html
<section class="animate-fade-in-up">
  <h1 class="text-6xl font-black mb-3">
    Welcome to HypeAI
  </h1>
  <p class="text-xl text-secondary mb-4">
    AI-powered crypto trading
  </p>
  <button class="btn btn-primary btn-lg hover-lift">
    Get Started
  </button>
</section>
```

### Stats Grid
```html
<div class="grid" style="grid-template-columns: repeat(3, 1fr); gap: var(--space-4);">
  <div class="card hover-lift text-center">
    <h3 class="text-4xl font-bold text-primary">100K+</h3>
    <p class="text-secondary">Users</p>
  </div>
  <div class="card hover-lift text-center">
    <h3 class="text-4xl font-bold text-success">$50M+</h3>
    <p class="text-secondary">Volume</p>
  </div>
  <div class="card hover-lift text-center">
    <h3 class="text-4xl font-bold text-accent">24/7</h3>
    <p class="text-secondary">Support</p>
  </div>
</div>
```

### Feature Cards
```html
<div class="card hover-lift animate-scale-in">
  <div class="card-header">
    <h3 class="card-title">AI Trading</h3>
  </div>
  <div class="card-body">
    <p class="text-secondary">
      Advanced AI algorithms for optimal trading
    </p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary btn-sm">Learn More</button>
  </div>
</div>
```

## That's it!

Start using professional components and utilities right away. See `/docs/css/CSS_DESIGN_SYSTEM.md` for complete documentation.
