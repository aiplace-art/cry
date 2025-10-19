# HypeAI Logo Guide - Variant 2 (Binance Chain Edition)

## Overview

The HypeAI Variant 2 logo represents our connection to Binance Chain, combining the iconic BNB gold aesthetic with cutting-edge AI neural network design. This guide ensures consistent, professional usage across all platforms.

## Design Philosophy

**Core Concept**: Neural Network Diamond
- Inspired by Binance's diamond/hexagon geometry
- Neural network nodes represent AI intelligence
- BNB gold gradient (#F3BA2F → #FCD535) for brand recognition
- Premium, trustworthy, innovative aesthetic

## Logo Variations

### 1. Primary Logo (`logo-bnb.svg`)
**Horizontal layout with icon + text "HypeAI"**
- **Use for**: Website headers, documents, presentations
- **Dimensions**: 200x60px (scalable)
- **Minimum width**: 120px
- **Format**: SVG (vector, scales perfectly)

### 2. Icon Only (`logo-bnb-icon.svg`)
**Neural network diamond without text**
- **Use for**: Favicons, app icons, social avatars, mobile
- **Dimensions**: 50x50px (square, scalable)
- **Minimum size**: 16x16px
- **Format**: SVG + PNG exports

### 3. Horizontal Layout (`logo-bnb-horizontal.svg`)
**Extended version with tagline**
- **Use for**: Footers, partner pages, official documents
- **Dimensions**: 280x70px (scalable)
- **Includes**: "POWERED BY BINANCE CHAIN" tagline
- **Format**: SVG

### 4. Animated Logo (`logo-bnb-animated.svg`)
**Premium animated version**
- **Use for**: Hero sections, loading screens, splash pages
- **Effects**: Pulse, glow, neural network animation
- **Duration**: 2-3 second loops
- **Format**: SVG with CSS animations

## File Formats & Sizes

### SVG Files (Vector - Primary)
```
/assets/logo-bnb.svg              - Full logo (200x60)
/assets/logo-bnb-icon.svg         - Icon only (50x50)
/assets/logo-bnb-horizontal.svg   - Horizontal with tagline (280x70)
/assets/logo-bnb-animated.svg     - Animated version (100x100)
```

### PNG Exports (Raster - For Compatibility)
```
Icon sizes:
- logo-bnb-icon-512.png   - High-res (App Store, Play Store)
- logo-bnb-icon-192.png   - Android app icon
- logo-bnb-icon-64.png    - Medium icon
- logo-bnb-icon-32.png    - Favicon
- logo-bnb-icon-16.png    - Small favicon
```

**Note**: PNG files can be generated from SVG using:
```bash
node /Users/ai.place/Crypto/scripts/svg-to-png-puppeteer.js
```

## Brand Colors

### Primary Colors

| Color Name | HEX | RGB | Usage |
|------------|-----|-----|-------|
| **BNB Gold** | `#F3BA2F` | `243, 186, 47` | Primary brand color, logo, accents |
| **Light Gold** | `#FCD535` | `252, 213, 53` | Gradients, highlights, hover states |

### Supporting Colors

| Color Name | HEX | RGB | Usage |
|------------|-----|-----|-------|
| **Dark Background** | `#1E2026` | `30, 32, 38` | Backgrounds, UI elements |
| **White** | `#FFFFFF` | `255, 255, 255` | Light backgrounds, contrast |

### Gradient Definition

**Official BNB Gold Gradient**:
```css
background: linear-gradient(135deg, #F3BA2F 0%, #FCD535 100%);
```

Used in logo, buttons, headings, and premium elements.

## Typography

### Logo Text: "HypeAI"
- **Font**: Orbitron (700 weight) or 'Arial Black' fallback
- **Size**: 28px for "Hype", 24px for "AI" superscript
- **Letter-spacing**: 2px
- **Color**: BNB Gold gradient
- **Style**: Bold, futuristic, tech-forward

### Tagline: "BINANCE CHAIN"
- **Font**: Orbitron (400 weight)
- **Size**: 8-10px
- **Letter-spacing**: 3-4px
- **Color**: #F3BA2F (solid, 80% opacity)
- **Style**: Uppercase, spaced

## Usage Guidelines

### ✅ DO's

1. **Use on solid backgrounds**
   - White backgrounds for light mode
   - Dark (#1E2026) backgrounds for dark mode
   - BNB gold for premium sections

2. **Maintain clear space**
   - Keep area around logo equal to icon height
   - Minimum 20px padding on all sides

3. **Use correct variations**
   - Full logo for wide spaces (headers, footers)
   - Icon only for squares (social, mobile)
   - Animated for hero sections (sparingly)

4. **Scale proportionally**
   - Always lock aspect ratio
   - Use SVG when possible for crisp rendering
   - Minimum sizes: 16px (icon), 120px (full logo)

5. **Stick to brand colors**
   - Use official gradient definition
   - No color modifications

### ❌ DON'Ts

1. **Don't alter colors**
   - ❌ No different gradients
   - ❌ No monochrome versions (except white on dark)
   - ❌ No color tints or filters

2. **Don't add effects**
   - ❌ No drop shadows
   - ❌ No outlines or strokes
   - ❌ No 3D effects
   - ❌ No additional glows (already built-in)

3. **Don't distort**
   - ❌ No stretching or squashing
   - ❌ No rotation (except 90° increments if needed)
   - ❌ No skewing or perspective

4. **Don't use on busy backgrounds**
   - ❌ No complex images or patterns
   - ❌ Ensure sufficient contrast
   - ❌ No overlapping important content

5. **Don't modify structure**
   - ❌ No rearranging elements
   - ❌ No removing neural nodes
   - ❌ No changing icon geometry

## Implementation Examples

### HTML

```html
<!-- Full Logo -->
<img src="/assets/logo-bnb.svg" alt="HypeAI" width="200" height="60">

<!-- Icon Only -->
<img src="/assets/logo-bnb-icon.svg" alt="HypeAI" width="50" height="50">

<!-- Animated Hero -->
<div class="hero-logo">
  <object data="/assets/logo-bnb-animated.svg" type="image/svg+xml"></object>
</div>
```

### React/Next.js

```jsx
import Image from 'next/image'

// Full logo
<Image
  src="/assets/logo-bnb.svg"
  alt="HypeAI - Binance Chain AI Platform"
  width={200}
  height={60}
  priority
/>

// Icon with hover effect
<Image
  src="/assets/logo-bnb-icon.svg"
  alt="HypeAI"
  width={50}
  height={50}
  className="hover:scale-110 transition-transform"
/>
```

### Favicon Links

```html
<!-- Modern browsers -->
<link rel="icon" type="image/svg+xml" href="/assets/logo-bnb-icon.svg">

<!-- iOS -->
<link rel="apple-touch-icon" sizes="180x180" href="/assets/logo-bnb-icon-180.png">

<!-- Standard favicons -->
<link rel="icon" type="image/png" sizes="32x32" href="/assets/logo-bnb-icon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/logo-bnb-icon-16.png">

<!-- Android -->
<link rel="icon" type="image/png" sizes="192x192" href="/assets/logo-bnb-icon-192.png">
```

### CSS Gradient (Buttons, Text)

```css
/* Button with BNB gold gradient */
.btn-primary {
  background: linear-gradient(135deg, #F3BA2F 0%, #FCD535 100%);
  color: #1E2026;
  font-weight: 700;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  box-shadow: 0 10px 30px rgba(243, 186, 47, 0.4);
  transform: translateY(-2px);
}

/* Text with gradient */
.heading-gold {
  background: linear-gradient(135deg, #F3BA2F 0%, #FCD535 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

## Context-Specific Usage

### Website Header
- **Logo**: Full logo (`logo-bnb.svg`)
- **Size**: 160-200px wide
- **Background**: Dark or transparent
- **Position**: Top-left, vertically centered

### Mobile Header
- **Logo**: Icon only (`logo-bnb-icon.svg`)
- **Size**: 40-48px
- **Background**: Same as desktop
- **Position**: Center or left

### Social Media

#### Twitter/X
- **Profile**: Icon only, 400x400px PNG
- **Banner**: Horizontal logo on BNB gold gradient background, 1500x500px
- **Posts**: Icon for thumbnails

#### Discord/Telegram
- **Server Icon**: Icon only, 512x512px PNG
- **Emojis**: Icon variations at 128x128px

#### LinkedIn
- **Company Logo**: Icon only, 300x300px
- **Cover**: Horizontal logo, 1128x191px

### Documentation
- **Headers**: Full logo, 180px wide
- **Footers**: Horizontal layout
- **Inline**: Icon only, 24-32px

### Mobile Apps
- **iOS App Icon**: 1024x1024px PNG (icon only)
- **Android App Icon**: 512x512px PNG (icon only)
- **Splash Screen**: Animated logo, centered

## Print Guidelines

### Business Cards
- **Size**: Full logo or icon
- **Colors**: Use CMYK equivalent
  - BNB Gold: C:0 M:27 Y:88 K:5
  - Light Gold: C:0 M:16 Y:79 K:1

### Letterhead
- **Position**: Top-center or top-left
- **Size**: 2-3 inches wide
- **Format**: High-res PNG or SVG

### Merchandise
- **T-shirts**: Icon only, large (12-14 inches)
- **Stickers**: Icon only, 2-4 inches
- **Mugs**: Full logo or icon

## Accessibility

### Alt Text Examples
```html
<!-- Descriptive -->
<img src="logo-bnb.svg" alt="HypeAI - Binance Chain AI Platform">

<!-- Icon -->
<img src="logo-bnb-icon.svg" alt="HypeAI">

<!-- Decorative (if redundant with surrounding text) -->
<img src="logo-bnb.svg" alt="" aria-hidden="true">
```

### Contrast Ratios
- **Gold on white**: 4.5:1 (passes WCAG AA)
- **Gold on dark (#1E2026)**: 8.2:1 (passes WCAG AAA)
- **White on gold**: 3.8:1 (use bold text)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-10-19 | Initial Binance Chain variant, neural network diamond design |

## Logo Concepts Archive

Three concepts were developed:

### Concept A: AI Lightning + BNB
- Hexagonal frame with stylized "H"
- Lightning bolt through center
- Circuit board background pattern
- **File**: `logo-concept-a.svg`

### Concept B: Neural Network Diamond (SELECTED)
- Binance-inspired diamond shape
- Neural network nodes at vertices
- Central AI core with connections
- **File**: `logo-concept-b.svg`

### Concept C: Binance + Brain Fusion
- Hexagonal frame with brain hemispheres
- Neural pathways through center
- Premium geometric accents
- **File**: `logo-concept-c.svg`

**Selected**: Concept B best combines Binance identity with AI innovation.

## Support & Questions

For logo usage questions or custom variations:
- Review this guide first
- Check `logo-showcase.html` for visual examples
- Ensure compliance with brand guidelines

## Asset Locations

```
/Users/ai.place/Crypto/public/variant-2/assets/
├── logo-bnb.svg                  # Primary full logo
├── logo-bnb-icon.svg             # Icon only
├── logo-bnb-horizontal.svg       # Extended with tagline
├── logo-bnb-animated.svg         # Animated version
├── logo-concept-a.svg            # Concept A (archive)
├── logo-concept-b.svg            # Concept B (selected base)
├── logo-concept-c.svg            # Concept C (archive)
└── [PNG exports when generated]

/Users/ai.place/Crypto/public/variant-2/
└── logo-showcase.html            # Interactive showcase
```

## Showcase Page

View all logo variations, sizes, and usage examples:
```
file:///Users/ai.place/Crypto/public/variant-2/logo-showcase.html
```

---

**Remember**: Consistency is key to strong brand recognition. When in doubt, use the primary logo on a solid background with proper clear space.

**HypeAI** - Powered by Binance Chain 🚀