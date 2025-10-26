# Twitter Visual System Architecture
## Professional Image Generation for HypeAI Social Media

**Version:** 1.0.0
**Date:** 2025-10-21
**Status:** Production Ready

---

## 🎯 Executive Summary

This architecture defines a comprehensive visual content generation system for HypeAI's Twitter presence. The system generates diverse, professional-quality images dynamically, supporting 8+ distinct visual styles and automatic category-based template selection.

**Key Objectives:**
1. **Diversity**: 8+ unique visual styles (minimalism, tech, gradients, 3D, infographics, etc.)
2. **Professionalism**: Canvas-based server-side rendering with high-quality output
3. **Service Integration**: Each HypeAI service gets unique branded visuals
4. **Dynamic Generation**: Auto-generation based on tweet category and content

**Performance Targets:**
- Image generation: <3 seconds per image
- Quality: 1200x675px (Twitter optimal)
- Format: PNG with fallback to WebP
- Cache hit rate: >80% for common categories

---

## 🏗️ System Architecture

### 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTO-POSTER SYSTEM                           │
│                   (scripts/auto-poster.js)                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                  VISUAL GENERATION ENGINE                       │
│              (scripts/visual-generator.js)                      │
├─────────────────────┬───────────────────────────────────────────┤
│  Template Selector  │  Category → Template Mapping             │
│  Style Manager      │  Color Schemes, Fonts, Layouts           │
│  Asset Loader       │  Logos, Icons, Background Elements       │
│  Canvas Renderer    │  Node-Canvas 3D Acceleration             │
│  Cache Manager      │  Redis/File-based Caching                │
└─────────────────────┴───────────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    ┌─────────┐  ┌─────────┐  ┌──────────┐
    │Templates│  │ Assets  │  │  Cache   │
    │ System  │  │ Library │  │  Store   │
    └─────────┘  └─────────┘  └──────────┘
```

### 2. Component Architecture

#### A. Visual Generator Core
**File:** `/scripts/visual-generator.js`

```javascript
class VisualGenerator {
  constructor(config) {
    this.canvas = require('canvas');
    this.templates = new TemplateManager();
    this.cache = new CacheManager();
    this.assets = new AssetLoader();
  }

  async generateImage(tweetData) {
    // 1. Select template based on category
    const template = this.templates.select(tweetData.category);

    // 2. Load required assets
    const assets = await this.assets.load(template.requirements);

    // 3. Render image
    const canvas = await this.render(template, tweetData, assets);

    // 4. Export and cache
    return await this.export(canvas, tweetData.id);
  }
}
```

#### B. Template System
**File:** `/scripts/visual-generator/templates/index.js`

8 Core Template Styles:

1. **Minimalist** - Clean, white space, single accent color
2. **Tech Gradient** - Cyberpunk neon gradients, grids
3. **3D Isometric** - 3D shapes, depth, shadows
4. **Data Viz** - Charts, graphs, infographics
5. **Geometric** - Abstract shapes, patterns
6. **Glitch Art** - Digital distortion effects
7. **Professional** - Corporate, clean, trustworthy
8. **Meme Style** - Bold text, contrasting colors

#### C. Category Mapping

```javascript
const CATEGORY_TEMPLATE_MAP = {
  // Service Categories
  'ai-agents': 'tech-gradient',
  'chatbots': 'minimalist',
  'automation': '3d-isometric',
  'social-media': 'data-viz',
  'analytics': 'professional',

  // Content Categories
  'technical': 'tech-gradient',
  'features': '3d-isometric',
  'education': 'professional',
  'community': 'minimalist',
  'viral': 'meme-style',
  'launch': 'glitch-art',
  'engagement': 'geometric'
};
```

---

## 🎨 Template Specifications

### Template 1: Minimalist
```json
{
  "name": "minimalist",
  "dimensions": [1200, 675],
  "layout": {
    "background": "#FFFFFF",
    "accent": "#00E5FF",
    "text": "#1A1A1A",
    "logo": {
      "position": "top-left",
      "size": 80
    },
    "title": {
      "font": "Inter Bold",
      "size": 64,
      "maxWidth": 900,
      "lineHeight": 1.2
    },
    "subtitle": {
      "font": "Inter Regular",
      "size": 32,
      "color": "#666666"
    }
  }
}
```

### Template 2: Tech Gradient
```json
{
  "name": "tech-gradient",
  "dimensions": [1200, 675],
  "layout": {
    "background": "linear-gradient(135deg, #0A0E27 0%, #1A1F3A 100%)",
    "grid": {
      "enabled": true,
      "color": "#00E5FF",
      "opacity": 0.1
    },
    "particles": {
      "count": 50,
      "color": "#00E5FF",
      "size": [2, 6]
    },
    "title": {
      "font": "Orbitron Bold",
      "size": 72,
      "glow": "#00E5FF",
      "glowBlur": 20
    }
  }
}
```

### Template 3: 3D Isometric
```json
{
  "name": "3d-isometric",
  "dimensions": [1200, 675],
  "layout": {
    "background": "#F5F5F5",
    "perspective": 45,
    "shapes": [
      {
        "type": "cube",
        "color": "#00E5FF",
        "position": [300, 200],
        "size": 150
      },
      {
        "type": "cylinder",
        "color": "#0077FF",
        "position": [600, 250],
        "size": 120
      }
    ],
    "shadows": {
      "enabled": true,
      "blur": 30,
      "opacity": 0.3
    }
  }
}
```

### Template 4: Data Visualization
```json
{
  "name": "data-viz",
  "dimensions": [1200, 675],
  "layout": {
    "background": "#FFFFFF",
    "chart": {
      "type": "bar",
      "data": "dynamic",
      "colors": ["#00E5FF", "#00AAFF", "#0077FF"],
      "position": [100, 150],
      "size": [500, 400]
    },
    "stats": [
      {
        "label": "Growth",
        "value": "dynamic",
        "position": [700, 200]
      }
    ]
  }
}
```

### Template 5: Geometric
```json
{
  "name": "geometric",
  "dimensions": [1200, 675],
  "layout": {
    "background": "#1A1A1A",
    "patterns": [
      {
        "type": "hexagon",
        "count": 30,
        "color": "#00E5FF",
        "opacity": 0.15,
        "size": 60
      },
      {
        "type": "triangle",
        "count": 20,
        "color": "#0077FF",
        "opacity": 0.2
      }
    ]
  }
}
```

### Template 6: Glitch Art
```json
{
  "name": "glitch-art",
  "dimensions": [1200, 675],
  "layout": {
    "background": "#000000",
    "glitch": {
      "intensity": 0.3,
      "rgbShift": true,
      "scanLines": true,
      "noise": 0.1
    },
    "text": {
      "font": "Courier New Bold",
      "size": 80,
      "effects": ["rgb-split", "scan-lines"]
    }
  }
}
```

### Template 7: Professional
```json
{
  "name": "professional",
  "dimensions": [1200, 675],
  "layout": {
    "background": "#FFFFFF",
    "sidebar": {
      "color": "#00E5FF",
      "width": 300
    },
    "content": {
      "padding": [50, 50],
      "font": "Inter",
      "titleSize": 56,
      "bodySize": 28
    },
    "logo": {
      "position": "sidebar-top",
      "size": 120
    }
  }
}
```

### Template 8: Meme Style
```json
{
  "name": "meme-style",
  "dimensions": [1200, 675],
  "layout": {
    "background": "#FFDD00",
    "border": {
      "width": 15,
      "color": "#000000"
    },
    "text": {
      "font": "Impact",
      "size": 96,
      "stroke": "#000000",
      "strokeWidth": 8,
      "fill": "#FFFFFF",
      "align": "center"
    }
  }
}
```

---

## 🛠️ Technology Stack

### Primary Stack: Node.js Canvas
**Why Canvas?**
- ✅ Server-side rendering (no browser needed)
- ✅ Native performance with Cairo backend
- ✅ Full Canvas API support
- ✅ Text rendering with custom fonts
- ✅ Export to PNG, JPEG, WebP, PDF

**Dependencies:**
```json
{
  "canvas": "^3.2.0",
  "sharp": "^0.33.0",
  "node-vibrant": "^3.2.1",
  "font-manager": "^1.0.0"
}
```

### Alternative/Complementary Options

#### Option 2: Puppeteer (HTML → Image)
```javascript
// For complex layouts with CSS
import puppeteer from 'puppeteer';

async function renderHTML(template, data) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(template.html);
  await page.setViewport({ width: 1200, height: 675 });

  const screenshot = await page.screenshot({
    type: 'png',
    encoding: 'binary'
  });

  await browser.close();
  return screenshot;
}
```

**Pros:** Full CSS support, easy responsive design
**Cons:** Slower (300-500ms vs 50-100ms), higher memory

#### Option 3: Sharp (Image Composition)
```javascript
import sharp from 'sharp';

// For quick image overlays
async function composeImage(background, overlays) {
  return sharp(background)
    .composite(overlays)
    .png()
    .toBuffer();
}
```

**Best for:** Static template + dynamic text overlay

#### Option 4: External APIs (Canva, Figma)
- **Canva API**: Template-based generation
- **Figma API**: Design file → Image export
- **Cloudinary**: URL-based image transformation

**Pros:** Professional design tools
**Cons:** API costs, rate limits, dependency

### Recommended Hybrid Approach

```
┌─────────────────────────────────────────────┐
│           Visual Generator                  │
├─────────────────────────────────────────────┤
│                                             │
│  Simple Templates    → Canvas (fast)       │
│  Complex Layouts     → Puppeteer (quality) │
│  Image Composition   → Sharp (efficient)   │
│  Static Overlays     → Sharp + Canvas      │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
/Users/ai.place/Crypto/
├── scripts/
│   ├── auto-poster.js              # Main posting script
│   ├── visual-generator.js         # Core generator (NEW)
│   │
│   ├── visual-generator/
│   │   ├── index.js                # Main export
│   │   ├── canvas-renderer.js      # Canvas drawing engine
│   │   ├── puppeteer-renderer.js   # HTML → PNG renderer
│   │   ├── sharp-composer.js       # Image composition
│   │   │
│   │   ├── templates/
│   │   │   ├── index.js            # Template registry
│   │   │   ├── minimalist.js
│   │   │   ├── tech-gradient.js
│   │   │   ├── 3d-isometric.js
│   │   │   ├── data-viz.js
│   │   │   ├── geometric.js
│   │   │   ├── glitch-art.js
│   │   │   ├── professional.js
│   │   │   └── meme-style.js
│   │   │
│   │   ├── layouts/
│   │   │   ├── hero.js             # Hero image layouts
│   │   │   ├── quote.js            # Quote card layouts
│   │   │   ├── stats.js            # Statistics layouts
│   │   │   └── comparison.js       # Before/After layouts
│   │   │
│   │   ├── renderers/
│   │   │   ├── text-renderer.js    # Text with effects
│   │   │   ├── shape-renderer.js   # Geometric shapes
│   │   │   ├── chart-renderer.js   # Data visualizations
│   │   │   └── effect-renderer.js  # Glitch, gradients, etc.
│   │   │
│   │   ├── utils/
│   │   │   ├── color-utils.js      # Color manipulation
│   │   │   ├── font-loader.js      # Font management
│   │   │   ├── cache-manager.js    # Image caching
│   │   │   └── optimizer.js        # Image optimization
│   │   │
│   │   └── config/
│   │       ├── templates.json      # Template definitions
│   │       ├── colors.json         # Brand colors
│   │       └── fonts.json          # Font configurations
│   │
│   ├── twitter-media/
│   │   ├── generated/              # Auto-generated images
│   │   ├── cache/                  # Cached images
│   │   ├── templates/              # Static templates
│   │   └── assets/                 # Logos, icons, patterns
│   │       ├── logos/
│   │       ├── icons/
│   │       ├── backgrounds/
│   │       └── patterns/
│   │
│   └── twitter-content/
│       └── tweets-bank.json
│
├── assets/
│   ├── fonts/                      # Custom fonts
│   │   ├── Inter-Bold.ttf
│   │   ├── Inter-Regular.ttf
│   │   ├── Orbitron-Bold.ttf
│   │   └── Impact.ttf
│   │
│   └── visual-templates/           # Design source files
│       ├── figma/                  # Figma designs
│       └── psd/                    # Photoshop templates
│
└── docs/
    └── architecture/
        └── TWITTER_VISUAL_SYSTEM.md  # This file
```

---

## 🔄 Integration with Auto-Poster

### Current Flow (scripts/auto-poster.js)
```javascript
// Line 102-151: Media upload logic
async function uploadMedia(client, tweetData) {
  // 1. Try BNB template
  // 2. Fallback to media-generator.js
  // 3. Fallback to logo
}
```

### New Flow (Enhanced)
```javascript
import { VisualGenerator } from './visual-generator/index.js';

const generator = new VisualGenerator({
  cacheEnabled: true,
  quality: 'high',
  format: 'png'
});

async function uploadMedia(client, tweetData) {
  try {
    // Check cache first
    let mediaPath = await generator.getCached(tweetData.id);

    if (!mediaPath) {
      // Generate new image
      console.log(`🎨 Generating image for category: ${tweetData.category}`);
      mediaPath = await generator.generate({
        category: tweetData.category,
        title: tweetData.text.substring(0, 100),
        service: tweetData.service || null,
        style: tweetData.visualStyle || 'auto'
      });

      // Cache for future use
      await generator.cache(tweetData.id, mediaPath);
    }

    // Upload to Twitter
    const mediaId = await client.v1.uploadMedia(mediaPath);
    return mediaId;

  } catch (error) {
    console.error('Visual generation failed:', error);
    // Fallback to logo
    return await client.v1.uploadMedia('./website/logo-icon-only.svg');
  }
}
```

---

## 🎯 Generator API Specification

### Core Generator Class

```javascript
class VisualGenerator {
  /**
   * Generate image for tweet
   * @param {Object} options - Generation options
   * @param {string} options.category - Tweet category
   * @param {string} options.title - Main text/title
   * @param {string} [options.subtitle] - Secondary text
   * @param {string} [options.service] - HypeAI service name
   * @param {string} [options.style] - Template style (auto-select if null)
   * @param {Object} [options.data] - Dynamic data for charts/stats
   * @returns {Promise<string>} Path to generated image
   */
  async generate(options) {
    // Implementation
  }

  /**
   * Get cached image if exists
   * @param {string} tweetId - Tweet identifier
   * @returns {Promise<string|null>} Path to cached image or null
   */
  async getCached(tweetId) {
    // Implementation
  }

  /**
   * Pre-generate images for common categories
   * @param {Array<string>} categories - Categories to pre-generate
   */
  async preGenerate(categories) {
    // Implementation
  }

  /**
   * Clear cache
   * @param {Object} [options] - Clear options
   * @param {number} [options.olderThan] - Clear images older than N days
   */
  async clearCache(options = {}) {
    // Implementation
  }
}
```

### Template Manager

```javascript
class TemplateManager {
  /**
   * Select best template for category
   * @param {string} category - Tweet category
   * @param {Object} [override] - Manual template selection
   * @returns {Object} Template configuration
   */
  select(category, override = null) {
    // Implementation
  }

  /**
   * Register custom template
   * @param {string} name - Template name
   * @param {Object} config - Template configuration
   */
  register(name, config) {
    // Implementation
  }

  /**
   * List all available templates
   * @returns {Array<Object>} Template list
   */
  list() {
    // Implementation
  }
}
```

### Canvas Renderer

```javascript
class CanvasRenderer {
  /**
   * Render template to canvas
   * @param {Object} template - Template configuration
   * @param {Object} data - Dynamic data
   * @returns {Promise<Canvas>} Rendered canvas
   */
  async render(template, data) {
    // Implementation
  }

  /**
   * Draw text with effects
   * @param {Canvas} ctx - Canvas context
   * @param {string} text - Text to draw
   * @param {Object} style - Text styling
   */
  drawText(ctx, text, style) {
    // Implementation
  }

  /**
   * Draw gradient background
   * @param {Canvas} ctx - Canvas context
   * @param {Object} gradient - Gradient configuration
   */
  drawGradient(ctx, gradient) {
    // Implementation
  }

  /**
   * Apply effects (glitch, glow, shadow)
   * @param {Canvas} ctx - Canvas context
   * @param {string} effect - Effect name
   * @param {Object} params - Effect parameters
   */
  applyEffect(ctx, effect, params) {
    // Implementation
  }
}
```

---

## 🎨 HypeAI Service Visuals

### Service-Specific Templates

Each HypeAI service gets a unique visual identity:

#### 1. AI Agent Deployment
```json
{
  "service": "ai-agents",
  "template": "tech-gradient",
  "colors": {
    "primary": "#00E5FF",
    "secondary": "#0077FF",
    "accent": "#FF00E5"
  },
  "icon": "robot-arm.svg",
  "background": "neural-network-pattern"
}
```

#### 2. Custom Chatbots
```json
{
  "service": "chatbots",
  "template": "minimalist",
  "colors": {
    "primary": "#00E5FF",
    "secondary": "#FFFFFF",
    "text": "#1A1A1A"
  },
  "icon": "chat-bubble.svg",
  "background": "clean-white"
}
```

#### 3. Social Media Automation
```json
{
  "service": "social-automation",
  "template": "data-viz",
  "colors": {
    "primary": "#00E5FF",
    "secondary": "#00FF88",
    "accent": "#FFD700"
  },
  "icon": "share-network.svg",
  "background": "graph-pattern"
}
```

#### 4. Business Intelligence
```json
{
  "service": "analytics",
  "template": "professional",
  "colors": {
    "primary": "#0077FF",
    "secondary": "#00E5FF",
    "accent": "#1A1A1A"
  },
  "icon": "chart-line.svg",
  "background": "data-visualization"
}
```

#### 5. Smart Contract Services
```json
{
  "service": "smart-contracts",
  "template": "3d-isometric",
  "colors": {
    "primary": "#00E5FF",
    "secondary": "#9D00FF",
    "accent": "#FFD700"
  },
  "icon": "blockchain.svg",
  "background": "3d-blocks"
}
```

---

## 💾 Caching Strategy

### Cache Levels

```
┌─────────────────────────────────────────────┐
│          CACHE HIERARCHY                    │
├─────────────────────────────────────────────┤
│                                             │
│  L1: Memory Cache (Hot Images)             │
│      - Size: 50 images                     │
│      - TTL: 1 hour                         │
│      - Hit Rate Target: >90%               │
│                                             │
│  L2: File System Cache (Generated)         │
│      - Location: /scripts/twitter-media/cache/
│      - TTL: 7 days                         │
│      - Size Limit: 500MB                   │
│                                             │
│  L3: Template Cache (Pre-rendered)         │
│      - Location: /scripts/twitter-media/templates/
│      - TTL: 30 days                        │
│      - Size Limit: 1GB                     │
│                                             │
└─────────────────────────────────────────────┘
```

### Cache Keys

```javascript
// Format: category-service-style-hash
const cacheKey = `${category}-${service}-${style}-${contentHash}`;

// Example:
"technical-ai-agents-tech-gradient-a1b2c3d4"
"viral-chatbots-meme-style-e5f6g7h8"
```

### Cache Invalidation

```javascript
// Automatic cleanup
schedule.every('1 day', async () => {
  await cache.cleanup({
    olderThan: 7, // days
    maxSize: 500 * 1024 * 1024, // 500MB
    keepMostUsed: 100
  });
});
```

---

## 📊 Performance Optimization

### Generation Performance Targets

| Template | Target Time | Complexity | Cache Priority |
|----------|-------------|------------|----------------|
| Minimalist | <100ms | Low | Medium |
| Tech Gradient | <200ms | Medium | High |
| 3D Isometric | <500ms | High | High |
| Data Viz | <300ms | Medium | High |
| Geometric | <150ms | Low | Medium |
| Glitch Art | <400ms | High | Low |
| Professional | <200ms | Medium | High |
| Meme Style | <100ms | Low | Medium |

### Optimization Techniques

#### 1. Lazy Asset Loading
```javascript
class AssetLoader {
  constructor() {
    this.cache = new Map();
  }

  async load(assetPath) {
    if (this.cache.has(assetPath)) {
      return this.cache.get(assetPath);
    }

    const asset = await loadImage(assetPath);
    this.cache.set(assetPath, asset);
    return asset;
  }
}
```

#### 2. Pre-rendering Common Templates
```javascript
// On server start
await generator.preGenerate([
  'technical',
  'features',
  'community',
  'education'
]);
```

#### 3. Worker Pool for Parallel Generation
```javascript
import { Worker } from 'worker_threads';

class RenderPool {
  constructor(size = 4) {
    this.workers = Array(size).fill(null).map(() =>
      new Worker('./render-worker.js')
    );
  }

  async render(template, data) {
    const worker = this.getAvailableWorker();
    return worker.render(template, data);
  }
}
```

#### 4. Image Compression
```javascript
import sharp from 'sharp';

async function optimize(buffer) {
  return sharp(buffer)
    .png({ quality: 85, compressionLevel: 9 })
    .toBuffer();
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1)
- [ ] Setup visual-generator directory structure
- [ ] Install dependencies (canvas, sharp, puppeteer)
- [ ] Implement VisualGenerator core class
- [ ] Create TemplateManager
- [ ] Setup cache system
- [ ] Integrate with auto-poster.js

### Phase 2: Template Development (Week 2)
- [ ] Implement Minimalist template
- [ ] Implement Tech Gradient template
- [ ] Implement 3D Isometric template
- [ ] Implement Data Viz template
- [ ] Test all templates

### Phase 3: Advanced Templates (Week 3)
- [ ] Implement Geometric template
- [ ] Implement Glitch Art template
- [ ] Implement Professional template
- [ ] Implement Meme Style template

### Phase 4: Service Integration (Week 4)
- [ ] Create service-specific configurations
- [ ] Design unique visuals for each HypeAI service
- [ ] Generate asset library (icons, backgrounds)
- [ ] Create template variations

### Phase 5: Optimization & Testing (Week 5)
- [ ] Performance benchmarking
- [ ] Cache optimization
- [ ] Error handling
- [ ] Integration testing
- [ ] Production deployment

---

## 🔧 Configuration Files

### 1. templates.json
```json
{
  "templates": {
    "minimalist": {
      "renderer": "canvas",
      "priority": "high",
      "complexity": "low",
      "avgRenderTime": 100
    },
    "tech-gradient": {
      "renderer": "canvas",
      "priority": "high",
      "complexity": "medium",
      "avgRenderTime": 200
    }
  }
}
```

### 2. colors.json
```json
{
  "brand": {
    "primary": "#00E5FF",
    "secondary": "#00AAFF",
    "dark": "#0077FF",
    "accent": "#FF00E5",
    "gold": "#FFD700"
  },
  "gradients": {
    "cyber": ["#0A0E27", "#1A1F3A", "#00E5FF"],
    "sunset": ["#FF6B6B", "#FFD93D", "#6BCF7F"],
    "ocean": ["#00E5FF", "#0077FF", "#9D00FF"]
  }
}
```

### 3. fonts.json
```json
{
  "fonts": [
    {
      "family": "Inter",
      "weights": ["400", "700"],
      "path": "/assets/fonts/Inter-{weight}.ttf"
    },
    {
      "family": "Orbitron",
      "weights": ["700"],
      "path": "/assets/fonts/Orbitron-Bold.ttf"
    }
  ]
}
```

---

## 📈 Success Metrics

### KPIs
1. **Engagement Rate**: +50% increase with professional visuals
2. **Click-Through Rate**: +30% with compelling graphics
3. **Brand Recognition**: Consistent visual identity across 100+ posts
4. **Generation Performance**: <500ms average render time
5. **Cache Hit Rate**: >80% for repeat categories
6. **Quality Score**: User satisfaction >4.5/5

### A/B Testing Plan
- Test template performance per category
- Compare engagement: text-only vs. images
- Test color schemes (cyan vs. purple vs. gold)
- Measure optimal posting times with visuals

---

## 🛡️ Error Handling & Fallbacks

### Error Cascade
```
1. Try selected template → Success ✓
                         ↓ Error
2. Try fallback template → Success ✓
                         ↓ Error
3. Try simple overlay → Success ✓
                         ↓ Error
4. Use official logo → Always works ✓
```

### Fallback Configuration
```javascript
const FALLBACK_CHAIN = [
  'selected-template',
  'minimalist-fallback',
  'logo-overlay',
  'official-logo'
];
```

---

## 📚 Usage Examples

### Example 1: Simple Tweet
```javascript
const image = await generator.generate({
  category: 'technical',
  title: 'HypeAI launches AI Agent Marketplace',
  subtitle: 'Deploy custom AI agents in minutes'
});
// Output: /scripts/twitter-media/generated/tweet-123.png
```

### Example 2: Service Announcement
```javascript
const image = await generator.generate({
  category: 'launch',
  service: 'ai-agents',
  title: 'AI Agent Deployment',
  style: 'tech-gradient',
  data: {
    price: '$99/mo',
    features: ['24/7 Support', 'Custom Training', 'API Access']
  }
});
```

### Example 3: Data Visualization
```javascript
const image = await generator.generate({
  category: 'analytics',
  style: 'data-viz',
  title: 'Q4 Performance',
  data: {
    chart: {
      type: 'bar',
      values: [45, 67, 89, 92]
    },
    stats: {
      growth: '+125%',
      users: '50K+'
    }
  }
});
```

---

## 🎓 Developer Guide

### Quick Start
```bash
# Install dependencies
npm install canvas sharp puppeteer

# Initialize generator
node scripts/visual-generator/init.js

# Test generation
node scripts/visual-generator/test.js --template minimalist

# Generate for all categories
npm run visual:generate-all
```

### Adding Custom Templates
```javascript
// 1. Create template file
// scripts/visual-generator/templates/my-template.js

export default {
  name: 'my-template',
  render: async (ctx, data) => {
    // Your rendering logic
  }
};

// 2. Register in index.js
import myTemplate from './my-template.js';
templateManager.register('my-template', myTemplate);

// 3. Add to category mapping
CATEGORY_TEMPLATE_MAP['my-category'] = 'my-template';
```

---

## 🔗 Related Documentation

- [Auto-Poster System](/scripts/auto-poster.js)
- [Twitter Content Bank](/scripts/twitter-content/tweets-bank.json)
- [HypeAI Brand Guidelines](/branding/OFFICIAL_BRAND_ASSETS.md)
- [Services Catalog](/public/variant-2/docs/B2C_SERVICE_CATALOG.json)

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-21 | Initial architecture design |

---

**Designed by:** System Architect
**For:** HypeAI Social Media Marketing
**Status:** Ready for Implementation ✅
