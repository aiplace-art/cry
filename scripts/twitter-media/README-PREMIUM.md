# Premium Image Generator 🎨

Advanced visual styles for Twitter posts with maximum engagement.

## 🚀 Quick Start

```bash
# Test all 5 styles
node test-premium-generator.js

# Generate examples
node premium-examples.js

# Use in your code
import PremiumImageGenerator from './premium-image-generator.js';
const generator = new PremiumImageGenerator();
```

## 🎭 5 Premium Styles

### 1. Glassmorphism 🪟
**Frosted glass effect with modern blur**

```javascript
const image = await generator.generateGlassmorphism({
  title: 'HypeAI Premium',
  subtitle: 'AI-Powered DeFi on BNB Chain',
  stats: '10,000+ Users | $5M TVL'
});
```

**Best for:** Premium announcements, feature launches, milestones

---

### 2. 3D Gradient 🎭
**Multi-layered depth with shadows**

```javascript
const image = await generator.generate3DGradient({
  title: 'HYPEAI FEATURES',
  subtitle: 'Next-Generation DeFi Platform',
  highlight: 'Launching Q1 2025'
});
```

**Best for:** Service showcases, partnerships, promotions

---

### 3. Neon Cyberpunk ⚡
**Glowing futuristic design**

```javascript
const image = await generator.generateNeonCyberpunk({
  title: 'HYPEAI',
  subtitle: 'The Future of DeFi',
  tagline: 'POWERED BY BNB CHAIN'
});
```

**Best for:** Tech announcements, gaming, Web3 content

---

### 4. Abstract Geometric 🔷
**Modern patterns and tessellations**

```javascript
const image = await generator.generateAbstractGeo({
  title: 'HypeAI Community',
  subtitle: 'Join the Revolution',
  stats: '5,000+ Members Worldwide'
});
```

**Best for:** Community events, contests, creative content

---

### 5. Cinematic 🎬
**Movie poster quality**

```javascript
const image = await generator.generateCinematic({
  title: 'HYPEAI LAUNCH',
  subtitle: 'The Revolution Begins',
  date: 'Q1 2025'
});
```

**Best for:** Major launches, mainnet releases, big milestones

---

## 📐 Specifications

- **Dimensions:** 1200×675px (16:9 Twitter optimal)
- **Format:** PNG
- **Quality:** Maximum (lossless)
- **File Size:** 100-300KB
- **Colors:** HypeAI + BNB Chain brand integration

## 🎯 Style Selection Guide

| Content Type | Recommended Style |
|-------------|-------------------|
| Product Launch | Glassmorphism |
| Service Announcement | 3D Gradient |
| Tech Feature | Neon Cyberpunk |
| Community Event | Abstract Geometric |
| Major Milestone | Cinematic |
| Stats/Numbers | Glassmorphism |
| Partnership | 3D Gradient |
| Gaming/NFT | Neon Cyberpunk |
| Contest/Giveaway | Abstract Geometric |
| Season Launch | Cinematic |

## 🛠️ Advanced Features

### Custom Colors
```javascript
generator.colors.primary = '#00E5FF';  // HypeAI Cyan
generator.colors.gold = '#F3BA2F';     // BNB Gold
```

### Helper Methods
```javascript
generator.roundRect(ctx, x, y, w, h, radius, fill, stroke);
generator.drawHexagon(ctx, x, y, size, color, alpha);
generator.drawBlurredOrb(ctx, x, y, radius, color, alpha);
generator.hexToRgba(hex, alpha);
```

## 📊 Brand Integration

**HypeAI Colors:**
- Primary: `#00E5FF` (Electric Cyan)
- Secondary: `#00AAFF` (Blue)
- Accent: `#0077FF` (Dark Blue)

**BNB Chain Colors:**
- Gold: `#F3BA2F`
- Yellow: `#FFE900`

**Hybrid Gradients:**
- Automatically blend HypeAI + BNB Chain colors
- Consistent brand identity across all styles

## 📝 Usage Tips

### Text Length Guidelines
- **Title:** 1-3 words (max 20 chars)
- **Subtitle:** 3-6 words (max 40 chars)
- **Stats/Tagline:** 2-5 words (max 30 chars)

### Best Practices
1. **Choose style based on content importance**
   - Cinematic: Most important
   - Glassmorphism: Premium/professional
   - Neon: Tech-focused
   - 3D Gradient: Marketing/promotion
   - Abstract: Creative/community

2. **Text formatting**
   - ALL CAPS for dramatic effect (Cinematic, Neon)
   - Title Case for professional (Glassmorphism, 3D)
   - Include numbers when available

3. **Brand consistency**
   - Always mention BNB Chain
   - Use official colors
   - Maintain hexagon logo theme

## 🧪 Testing

```bash
# Generate all 5 test images
node test-premium-generator.js

# Output: scripts/twitter-media/outputs/
# - glassmorphism.png
# - 3d-gradient.png
# - neon-cyberpunk.png
# - abstract-geometric.png
# - cinematic.png
```

## 📚 Full Documentation

See `/Users/ai.place/Crypto/docs/PREMIUM_IMAGE_GENERATOR.md` for complete documentation.

## 🔗 Integration

### With Auto-Poster
```javascript
import PremiumImageGenerator from './premium-image-generator.js';
import { uploadToTwitter } from './auto-poster.js';

const generator = new PremiumImageGenerator();
const image = await generator.generateGlassmorphism({...});
const mediaId = await uploadToTwitter(image);
```

### Weekly Content Calendar
```javascript
import { generateWeeklyContent } from './premium-examples.js';
await generateWeeklyContent();
```

---

**Version:** 1.0.0
**Created:** 2025-10-21
**Framework:** Canvas API (node-canvas)
**Brand:** HypeAI × BNB Chain
