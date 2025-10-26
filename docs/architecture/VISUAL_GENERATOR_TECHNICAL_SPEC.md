# Visual Generator - Technical Specification
## Implementation Details for Twitter Image Generation System

**Version:** 1.0.0
**Date:** 2025-10-21
**Target:** Development Team

---

## 🎯 Technical Overview

This document provides detailed technical specifications for implementing the Visual Generator system. It includes code examples, class structures, and integration patterns.

---

## 📦 Dependencies & Installation

### Package.json Updates
```json
{
  "dependencies": {
    "canvas": "^3.2.0",
    "sharp": "^0.33.0",
    "node-vibrant": "^3.2.1",
    "puppeteer": "^21.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

### Installation Commands
```bash
# Core rendering engine
npm install canvas sharp

# Optional: HTML rendering
npm install puppeteer

# Optional: Color extraction
npm install node-vibrant

# macOS specific (Canvas native dependencies)
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

### Font Setup
```bash
# Create fonts directory
mkdir -p assets/fonts

# Download required fonts
cd assets/fonts

# Inter (minimalist, professional)
wget https://github.com/rsms/inter/releases/download/v4.0/Inter-4.0.zip
unzip Inter-4.0.zip

# Orbitron (tech, sci-fi)
wget https://fonts.google.com/download?family=Orbitron
unzip Orbitron.zip

# Impact (meme style)
# System font, usually pre-installed
```

---

## 🏗️ Core Class Structures

### 1. VisualGenerator (Main Class)

**File:** `/scripts/visual-generator/index.js`

```javascript
import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export class VisualGenerator {
  constructor(options = {}) {
    this.config = {
      cacheEnabled: options.cacheEnabled ?? true,
      quality: options.quality ?? 'high',
      format: options.format ?? 'png',
      cachePath: options.cachePath ?? './scripts/twitter-media/cache',
      generatedPath: options.generatedPath ?? './scripts/twitter-media/generated',
      assetsPath: options.assetsPath ?? './scripts/twitter-media/assets'
    };

    // Initialize managers
    this.templates = new TemplateManager();
    this.cache = new CacheManager(this.config);
    this.assets = new AssetLoader(this.config.assetsPath);
    this.renderer = new CanvasRenderer();

    // Register fonts
    this.registerFonts();
  }

  /**
   * Register custom fonts for canvas rendering
   */
  registerFonts() {
    const fontPath = './assets/fonts';

    try {
      registerFont(`${fontPath}/Inter-Bold.ttf`, { family: 'Inter', weight: 'bold' });
      registerFont(`${fontPath}/Inter-Regular.ttf`, { family: 'Inter', weight: 'normal' });
      registerFont(`${fontPath}/Orbitron-Bold.ttf`, { family: 'Orbitron', weight: 'bold' });
    } catch (error) {
      console.warn('Font registration warning:', error.message);
    }
  }

  /**
   * Generate image for tweet
   */
  async generate(options) {
    const {
      category,
      title,
      subtitle = null,
      service = null,
      style = null,
      data = {}
    } = options;

    // Generate cache key
    const cacheKey = this.generateCacheKey(options);

    // Check cache first
    if (this.config.cacheEnabled) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        console.log(`✓ Cache hit: ${cacheKey}`);
        return cached;
      }
    }

    // Select template
    const templateName = style || this.templates.select(category, service);
    const template = this.templates.get(templateName);

    console.log(`🎨 Generating: ${templateName} for ${category}`);

    // Load required assets
    const assets = await this.assets.loadForTemplate(template);

    // Render image
    const canvas = await this.renderer.render(template, {
      title,
      subtitle,
      service,
      category,
      data,
      assets
    });

    // Export to file
    const outputPath = await this.export(canvas, cacheKey);

    // Cache result
    if (this.config.cacheEnabled) {
      await this.cache.set(cacheKey, outputPath);
    }

    return outputPath;
  }

  /**
   * Generate unique cache key
   */
  generateCacheKey(options) {
    const { category, service, style, title } = options;
    const content = `${category}-${service || 'none'}-${style || 'auto'}-${title}`;
    const hash = crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
    return `${category}-${hash}`;
  }

  /**
   * Export canvas to file
   */
  async export(canvas, filename) {
    const outputPath = path.join(this.config.generatedPath, `${filename}.${this.config.format}`);

    // Ensure directory exists
    await fs.mkdir(this.config.generatedPath, { recursive: true });

    // Export based on format
    const buffer = canvas.toBuffer(`image/${this.config.format}`);

    // Optimize if using PNG
    if (this.config.format === 'png') {
      const sharp = (await import('sharp')).default;
      const optimized = await sharp(buffer)
        .png({ quality: 85, compressionLevel: 9 })
        .toBuffer();
      await fs.writeFile(outputPath, optimized);
    } else {
      await fs.writeFile(outputPath, buffer);
    }

    console.log(`✓ Exported: ${outputPath}`);
    return outputPath;
  }

  /**
   * Get cached image path
   */
  async getCached(tweetId) {
    return await this.cache.get(tweetId);
  }

  /**
   * Pre-generate common categories
   */
  async preGenerate(categories) {
    console.log('🚀 Pre-generating images...');

    for (const category of categories) {
      await this.generate({
        category,
        title: `HypeAI ${category.charAt(0).toUpperCase() + category.slice(1)}`,
        subtitle: 'AI-Powered Intelligence'
      });
    }

    console.log('✓ Pre-generation complete');
  }

  /**
   * Clear cache
   */
  async clearCache(options = {}) {
    await this.cache.clear(options);
  }
}
```

---

### 2. TemplateManager

**File:** `/scripts/visual-generator/templates/index.js`

```javascript
import minimalist from './minimalist.js';
import techGradient from './tech-gradient.js';
import isometric from './3d-isometric.js';
import dataViz from './data-viz.js';
import geometric from './geometric.js';
import glitchArt from './glitch-art.js';
import professional from './professional.js';
import memeStyle from './meme-style.js';

// Category to template mapping
const CATEGORY_TEMPLATE_MAP = {
  // Service categories
  'ai-agents': 'tech-gradient',
  'chatbots': 'minimalist',
  'automation': 'isometric',
  'social-media': 'data-viz',
  'analytics': 'professional',
  'smart-contracts': 'isometric',

  // Content categories
  'technical': 'tech-gradient',
  'features': 'isometric',
  'education': 'professional',
  'community': 'minimalist',
  'viral': 'meme-style',
  'launch': 'glitch-art',
  'engagement': 'geometric',
  'introduction': 'minimalist'
};

export class TemplateManager {
  constructor() {
    this.templates = new Map([
      ['minimalist', minimalist],
      ['tech-gradient', techGradient],
      ['isometric', isometric],
      ['data-viz', dataViz],
      ['geometric', geometric],
      ['glitch-art', glitchArt],
      ['professional', professional],
      ['meme-style', memeStyle]
    ]);
  }

  /**
   * Select template based on category/service
   */
  select(category, service = null) {
    // Service-specific override
    if (service && CATEGORY_TEMPLATE_MAP[service]) {
      return CATEGORY_TEMPLATE_MAP[service];
    }

    // Category mapping
    if (CATEGORY_TEMPLATE_MAP[category]) {
      return CATEGORY_TEMPLATE_MAP[category];
    }

    // Default fallback
    return 'minimalist';
  }

  /**
   * Get template configuration
   */
  get(templateName) {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }
    return template;
  }

  /**
   * Register custom template
   */
  register(name, template) {
    this.templates.set(name, template);
  }

  /**
   * List all templates
   */
  list() {
    return Array.from(this.templates.keys());
  }
}
```

---

### 3. CanvasRenderer

**File:** `/scripts/visual-generator/canvas-renderer.js`

```javascript
import { createCanvas, loadImage } from 'canvas';

export class CanvasRenderer {
  /**
   * Render template to canvas
   */
  async render(template, data) {
    const { width, height } = template.dimensions;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Execute template render function
    await template.render(ctx, data, this);

    return canvas;
  }

  /**
   * Draw text with advanced styling
   */
  drawText(ctx, text, options) {
    const {
      x,
      y,
      font,
      size,
      color = '#000000',
      align = 'left',
      baseline = 'top',
      maxWidth = null,
      lineHeight = 1.2,
      stroke = null,
      strokeWidth = 0,
      shadow = null
    } = options;

    // Set font
    ctx.font = `${size}px ${font}`;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;

    // Apply shadow if specified
    if (shadow) {
      ctx.shadowColor = shadow.color;
      ctx.shadowBlur = shadow.blur;
      ctx.shadowOffsetX = shadow.offsetX || 0;
      ctx.shadowOffsetY = shadow.offsetY || 0;
    }

    // Draw stroke
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      if (maxWidth) {
        ctx.strokeText(text, x, y, maxWidth);
      } else {
        ctx.strokeText(text, x, y);
      }
    }

    // Draw fill
    ctx.fillStyle = color;
    if (maxWidth) {
      ctx.fillText(text, x, y, maxWidth);
    } else {
      ctx.fillText(text, x, y);
    }

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  /**
   * Draw wrapped text (multi-line)
   */
  drawWrappedText(ctx, text, options) {
    const { x, y, maxWidth, lineHeight = 1.2, size } = options;

    const words = text.split(' ');
    let line = '';
    let yPos = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && i > 0) {
        this.drawText(ctx, line, { ...options, y: yPos });
        line = words[i] + ' ';
        yPos += size * lineHeight;
      } else {
        line = testLine;
      }
    }

    this.drawText(ctx, line, { ...options, y: yPos });
  }

  /**
   * Draw linear gradient
   */
  drawGradient(ctx, gradient, bounds) {
    const { x1, y1, x2, y2 } = this.getGradientCoords(gradient.angle, bounds);
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);

    gradient.stops.forEach(stop => {
      grad.addColorStop(stop.position, stop.color);
    });

    ctx.fillStyle = grad;
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  /**
   * Calculate gradient coordinates based on angle
   */
  getGradientCoords(angle, bounds) {
    const rad = (angle * Math.PI) / 180;
    const width = bounds.width;
    const height = bounds.height;

    return {
      x1: bounds.x + width / 2 - Math.cos(rad) * width / 2,
      y1: bounds.y + height / 2 - Math.sin(rad) * height / 2,
      x2: bounds.x + width / 2 + Math.cos(rad) * width / 2,
      y2: bounds.y + height / 2 + Math.sin(rad) * height / 2
    };
  }

  /**
   * Draw rounded rectangle
   */
  drawRoundedRect(ctx, x, y, width, height, radius, fillStyle) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  /**
   * Draw image with scaling
   */
  async drawImage(ctx, imagePath, x, y, width, height, options = {}) {
    const image = await loadImage(imagePath);

    const { opacity = 1, blend = 'source-over' } = options;

    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = blend;

    ctx.drawImage(image, x, y, width, height);

    // Reset
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Apply glow effect
   */
  applyGlow(ctx, color, blur) {
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
  }

  /**
   * Clear glow effect
   */
  clearGlow(ctx) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
}
```

---

### 4. CacheManager

**File:** `/scripts/visual-generator/utils/cache-manager.js`

```javascript
import fs from 'fs/promises';
import path from 'path';

export class CacheManager {
  constructor(config) {
    this.cachePath = config.cachePath;
    this.memoryCache = new Map(); // L1 cache
    this.maxMemoryCacheSize = 50;
  }

  /**
   * Get cached image path
   */
  async get(key) {
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // Check file cache
    const cachePath = path.join(this.cachePath, `${key}.png`);

    try {
      await fs.access(cachePath);

      // Add to memory cache
      this.memoryCache.set(key, cachePath);

      return cachePath;
    } catch {
      return null;
    }
  }

  /**
   * Set cache entry
   */
  async set(key, imagePath) {
    // Copy to cache directory
    const cachePath = path.join(this.cachePath, `${key}.png`);

    await fs.mkdir(this.cachePath, { recursive: true });
    await fs.copyFile(imagePath, cachePath);

    // Add to memory cache
    this.memoryCache.set(key, cachePath);

    // Limit memory cache size
    if (this.memoryCache.size > this.maxMemoryCacheSize) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
  }

  /**
   * Clear cache
   */
  async clear(options = {}) {
    const { olderThan = null, maxSize = null, keepMostUsed = 0 } = options;

    // Clear memory cache
    this.memoryCache.clear();

    // Clear file cache
    const files = await fs.readdir(this.cachePath);
    const fileStats = [];

    for (const file of files) {
      const filePath = path.join(this.cachePath, file);
      const stat = await fs.stat(filePath);

      fileStats.push({
        path: filePath,
        mtime: stat.mtime,
        size: stat.size,
        atime: stat.atime
      });
    }

    // Sort by access time (most recent first)
    fileStats.sort((a, b) => b.atime - a.atime);

    // Keep most used
    const toKeep = fileStats.slice(0, keepMostUsed);
    const toCheck = fileStats.slice(keepMostUsed);

    for (const file of toCheck) {
      let shouldDelete = false;

      // Check age
      if (olderThan) {
        const ageInDays = (Date.now() - file.mtime) / (1000 * 60 * 60 * 24);
        if (ageInDays > olderThan) {
          shouldDelete = true;
        }
      }

      if (shouldDelete) {
        await fs.unlink(file.path);
        console.log(`✓ Deleted: ${path.basename(file.path)}`);
      }
    }

    // Check total size
    if (maxSize) {
      let totalSize = toKeep.reduce((sum, f) => sum + f.size, 0);

      for (const file of toCheck) {
        totalSize += file.size;

        if (totalSize > maxSize) {
          await fs.unlink(file.path);
          console.log(`✓ Deleted (size): ${path.basename(file.path)}`);
        }
      }
    }
  }
}
```

---

### 5. AssetLoader

**File:** `/scripts/visual-generator/utils/asset-loader.js`

```javascript
import { loadImage } from 'canvas';
import fs from 'fs/promises';
import path from 'path';

export class AssetLoader {
  constructor(assetsPath) {
    this.assetsPath = assetsPath;
    this.cache = new Map();
  }

  /**
   * Load assets required for template
   */
  async loadForTemplate(template) {
    const { requirements = [] } = template;
    const assets = {};

    for (const req of requirements) {
      assets[req.name] = await this.load(req.path);
    }

    return assets;
  }

  /**
   * Load single asset
   */
  async load(assetPath) {
    // Check cache
    if (this.cache.has(assetPath)) {
      return this.cache.get(assetPath);
    }

    // Load from file
    const fullPath = path.join(this.assetsPath, assetPath);

    try {
      const asset = await loadImage(fullPath);
      this.cache.set(assetPath, asset);
      return asset;
    } catch (error) {
      console.warn(`Asset not found: ${assetPath}`);
      return null;
    }
  }

  /**
   * Load logo
   */
  async loadLogo(variant = 'official') {
    const logoPath = variant === 'icon'
      ? 'logos/logo-icon-only.svg'
      : 'logos/logo-official-BRIGHT.svg';

    return await this.load(logoPath);
  }

  /**
   * Preload common assets
   */
  async preload() {
    const common = [
      'logos/logo-official-BRIGHT.svg',
      'logos/logo-icon-only.svg',
      'icons/ai-chip.svg',
      'icons/rocket.svg',
      'icons/chart.svg'
    ];

    for (const asset of common) {
      await this.load(asset);
    }
  }
}
```

---

## 🎨 Template Implementations

### Example: Minimalist Template

**File:** `/scripts/visual-generator/templates/minimalist.js`

```javascript
export default {
  name: 'minimalist',
  dimensions: { width: 1200, height: 675 },
  requirements: [
    { name: 'logo', path: 'logos/logo-icon-only.svg' }
  ],

  async render(ctx, data, renderer) {
    const { width, height } = this.dimensions;
    const { title, subtitle, assets } = data;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Logo
    if (assets.logo) {
      await renderer.drawImage(ctx, assets.logo.src, 50, 50, 80, 80);
    }

    // Title
    renderer.drawText(ctx, title, {
      x: 50,
      y: 250,
      font: 'Inter',
      size: 64,
      color: '#1A1A1A',
      maxWidth: 900,
      align: 'left'
    });

    // Subtitle
    if (subtitle) {
      renderer.drawText(ctx, subtitle, {
        x: 50,
        y: 350,
        font: 'Inter',
        size: 32,
        color: '#666666',
        maxWidth: 900
      });
    }

    // Accent line
    ctx.fillStyle = '#00E5FF';
    ctx.fillRect(50, 500, 200, 8);
  }
};
```

### Example: Tech Gradient Template

**File:** `/scripts/visual-generator/templates/tech-gradient.js`

```javascript
export default {
  name: 'tech-gradient',
  dimensions: { width: 1200, height: 675 },
  requirements: [
    { name: 'logo', path: 'logos/logo-official-BRIGHT.svg' }
  ],

  async render(ctx, data, renderer) {
    const { width, height } = this.dimensions;
    const { title, subtitle } = data;

    // Gradient background
    renderer.drawGradient(ctx, {
      angle: 135,
      stops: [
        { position: 0, color: '#0A0E27' },
        { position: 1, color: '#1A1F3A' }
      ]
    }, { x: 0, y: 0, width, height });

    // Grid pattern
    this.drawGrid(ctx, width, height);

    // Glow particles
    this.drawParticles(ctx, width, height);

    // Title with glow
    renderer.applyGlow(ctx, '#00E5FF', 20);
    renderer.drawText(ctx, title, {
      x: width / 2,
      y: height / 2 - 50,
      font: 'Orbitron',
      size: 72,
      color: '#00E5FF',
      align: 'center',
      baseline: 'middle',
      maxWidth: width - 100
    });
    renderer.clearGlow(ctx);

    // Subtitle
    if (subtitle) {
      renderer.drawText(ctx, subtitle, {
        x: width / 2,
        y: height / 2 + 60,
        font: 'Inter',
        size: 32,
        color: '#FFFFFF',
        align: 'center',
        baseline: 'middle'
      });
    }
  },

  drawGrid(ctx, width, height) {
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.1)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  },

  drawParticles(ctx, width, height) {
    ctx.fillStyle = '#00E5FF';

    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 4 + 2;
      const opacity = Math.random() * 0.5 + 0.3;

      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
};
```

---

## 🔌 Integration with Auto-Poster

### Updated auto-poster.js

**File:** `/scripts/auto-poster.js` (Lines 102-151)

```javascript
import { VisualGenerator } from './visual-generator/index.js';

// Initialize generator (singleton)
const visualGenerator = new VisualGenerator({
  cacheEnabled: true,
  quality: 'high',
  format: 'png'
});

// Updated uploadMedia function
async function uploadMedia(client, tweetData) {
  try {
    let mediaPath = null;

    console.log(`🎨 Generating visual for category: ${tweetData.category}`);

    // Try visual generator first
    try {
      mediaPath = await visualGenerator.generate({
        category: tweetData.category,
        title: tweetData.text.substring(0, 100),
        subtitle: tweetData.subtitle || null,
        service: tweetData.service || null,
        style: tweetData.visualStyle || null
      });

      console.log(`✅ Visual generated: ${mediaPath}`);
    } catch (genError) {
      console.warn(`⚠️  Visual generation failed: ${genError.message}`);

      // Fallback to BNB templates
      const templatePath = BNB_TEMPLATE_MAP[tweetData.category];
      if (templatePath && fs.existsSync(templatePath)) {
        console.log(`📦 Using fallback template: ${tweetData.category}`);
        mediaPath = templatePath;
      }
    }

    // Ultimate fallback: official logo
    if (!mediaPath || !fs.existsSync(mediaPath)) {
      console.log(`🏷️  Using official logo fallback`);
      mediaPath = './website/logo-icon-only.svg';
    }

    // Upload to Twitter
    const mimeType = getMimeType(mediaPath);
    const mediaId = await client.v1.uploadMedia(mediaPath, { mimeType });

    console.log(`✅ Media uploaded: ${mediaId}`);
    return mediaId;

  } catch (error) {
    console.error(`❌ Media upload failed: ${error.message}`);
    return null;
  }
}
```

---

## 🧪 Testing Suite

### Test File

**File:** `/scripts/visual-generator/test.js`

```javascript
#!/usr/bin/env node

import { VisualGenerator } from './index.js';
import fs from 'fs/promises';

async function runTests() {
  console.log('🧪 Visual Generator Test Suite\n');

  const generator = new VisualGenerator({
    cacheEnabled: false // Disable cache for testing
  });

  const testCases = [
    {
      name: 'Minimalist - Simple',
      options: {
        category: 'introduction',
        title: 'HypeAI - Where Hype Meets Intelligence',
        subtitle: 'AI-Powered Innovation'
      }
    },
    {
      name: 'Tech Gradient - Feature',
      options: {
        category: 'technical',
        title: 'Deploy AI Agents in Minutes',
        subtitle: 'No code required'
      }
    },
    {
      name: 'Meme Style - Viral',
      options: {
        category: 'viral',
        title: 'WHEN AI MEETS BLOCKCHAIN',
        style: 'meme-style'
      }
    },
    {
      name: 'Service - AI Agents',
      options: {
        category: 'ai-agents',
        service: 'ai-agents',
        title: 'Custom AI Agent Deployment',
        subtitle: 'Starting at $99/month'
      }
    }
  ];

  for (const test of testCases) {
    console.log(`\n▶ Testing: ${test.name}`);

    const start = Date.now();

    try {
      const imagePath = await generator.generate(test.options);
      const duration = Date.now() - start;

      const stats = await fs.stat(imagePath);
      const sizeKB = (stats.size / 1024).toFixed(2);

      console.log(`  ✅ Success`);
      console.log(`     Time: ${duration}ms`);
      console.log(`     Size: ${sizeKB}KB`);
      console.log(`     Path: ${imagePath}`);

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
    }
  }

  console.log('\n✨ Test suite complete!\n');
}

runTests().catch(console.error);
```

**Run tests:**
```bash
chmod +x scripts/visual-generator/test.js
node scripts/visual-generator/test.js
```

---

## 📊 Performance Benchmarks

### Benchmark Script

**File:** `/scripts/visual-generator/benchmark.js`

```javascript
#!/usr/bin/env node

import { VisualGenerator } from './index.js';

async function benchmark() {
  const generator = new VisualGenerator({ cacheEnabled: false });

  const iterations = 10;
  const results = {};

  const templates = [
    'minimalist',
    'tech-gradient',
    'isometric',
    'data-viz',
    'geometric',
    'glitch-art',
    'professional',
    'meme-style'
  ];

  for (const template of templates) {
    console.log(`\n📊 Benchmarking: ${template}`);

    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = Date.now();

      await generator.generate({
        category: 'test',
        title: 'Benchmark Test',
        style: template
      });

      times.push(Date.now() - start);
    }

    const avg = times.reduce((a, b) => a + b) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    results[template] = { avg, min, max };

    console.log(`  Average: ${avg.toFixed(2)}ms`);
    console.log(`  Min: ${min}ms`);
    console.log(`  Max: ${max}ms`);
  }

  console.log('\n📈 Summary:');
  console.table(results);
}

benchmark().catch(console.error);
```

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Install dependencies: `npm install canvas sharp`
- [ ] Download and install fonts
- [ ] Create directory structure
- [ ] Test all templates
- [ ] Run benchmarks
- [ ] Setup cache directory

### Integration
- [ ] Update auto-poster.js imports
- [ ] Test with actual tweets
- [ ] Verify Twitter upload
- [ ] Monitor performance
- [ ] Setup error logging

### Production
- [ ] Enable caching
- [ ] Setup cache cleanup cron
- [ ] Monitor disk usage
- [ ] Track generation times
- [ ] A/B test engagement

---

## 📚 Additional Resources

### Canvas API Reference
- https://github.com/Automattic/node-canvas
- https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

### Sharp Documentation
- https://sharp.pixelplumbing.com/

### Twitter Media Best Practices
- Image size: 1200x675px (16:9)
- Max file size: 5MB
- Supported formats: PNG, JPEG, GIF, WebP

---

**Ready for implementation! 🎨**
