# 🎨 Brand Colors Quick Reference

## 📦 Import

```javascript
import { HYPEAI_BRAND, BNB_CHAIN, COMBINED_PALETTE, LOGO_PATHS } from './brand-colors.js';
```

## 🎨 Main Colors

### HypeAI
- **Primary:** `#00E5FF` ⚡ Electric Cyan
- **Secondary:** `#00AAFF` 🔵 Blue  
- **Accent:** `#0077FF` 🌊 Dark Blue

### BNB Chain
- **Gold:** `#F3BA2F` 🪙 BNB Gold
- **Yellow:** `#FFE900` ⚡ BNB Yellow
- **Dark:** `#14151A` 🌑 BNB Dark

### Combined
- **Background:** `#0A0E27` 🌌 Dark Space
- **Text:** `#FFFFFF` ⚪ White

## 🌈 Gradients

```javascript
HYPEAI_BRAND.gradient.cosmic     // #0077FF → #00E5FF → #00AAFF
HYPEAI_BRAND.gradient.energy     // Radial: #00E5FF → #0077FF
BNB_CHAIN.gradient.hybrid        // #F3BA2F → #00E5FF
BNB_CHAIN.gradient.energyFlow    // #F3BA2F → #00E5FF → #F3BA2F
```

## 💧 Alpha (Transparency)

```javascript
HYPEAI_BRAND.alpha.primary10  // 10%
HYPEAI_BRAND.alpha.primary20  // 20%
HYPEAI_BRAND.alpha.primary50  // 50%
BNB_CHAIN.alpha.gold20        // 20%
BNB_CHAIN.alpha.gold50        // 50%
```

## 📐 Logo Paths

```javascript
LOGO_PATHS.hypeai  // Full logo with text
LOGO_PATHS.icon    // Icon only
```

## 📚 Full Documentation

- **Guide:** `/docs/BRAND_COLORS_GUIDE.md`
- **Config:** `/config/brand-colors.js`
- **Visuals:** `/config/visual-config.js`
