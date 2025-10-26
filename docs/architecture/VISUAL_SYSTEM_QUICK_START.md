# Visual System Quick Start Guide
## Get Professional Twitter Images Running in 15 Minutes

**Version:** 1.0.0
**Status:** Ready to Deploy

---

## 🚀 Quick Installation (5 minutes)

### Step 1: Install Dependencies
```bash
cd /Users/ai.place/Crypto

# Install Node.js packages
npm install canvas sharp puppeteer

# macOS: Install system dependencies
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

### Step 2: Download Fonts
```bash
# Create fonts directory
mkdir -p assets/fonts
cd assets/fonts

# Download Inter (modern, clean)
curl -L https://github.com/rsms/inter/releases/download/v4.0/Inter-4.0.zip -o Inter.zip
unzip Inter.zip
mv "Inter Desktop/Inter-Bold.otf" Inter-Bold.ttf
mv "Inter Desktop/Inter-Regular.otf" Inter-Regular.ttf

# Download Orbitron (tech, futuristic)
curl -L https://fonts.google.com/download?family=Orbitron -o Orbitron.zip
unzip Orbitron.zip
mv static/Orbitron-Bold.ttf ./

# Cleanup
rm -rf Inter.zip Orbitron.zip "Inter Desktop" static OFL.txt README.txt

cd ../..
```

### Step 3: Create Directory Structure
```bash
# Create required directories
mkdir -p scripts/visual-generator/templates
mkdir -p scripts/visual-generator/utils
mkdir -p scripts/visual-generator/config
mkdir -p scripts/twitter-media/generated
mkdir -p scripts/twitter-media/cache
mkdir -p scripts/twitter-media/assets/logos
mkdir -p scripts/twitter-media/assets/icons
```

### Step 4: Copy Official Logos
```bash
# Copy HypeAI logos to assets
cp website/logo-official-BRIGHT.svg scripts/twitter-media/assets/logos/
cp website/logo-icon-only.svg scripts/twitter-media/assets/logos/
```

---

## 📝 Core Files Setup (5 minutes)

### File 1: Main Generator
Copy code from `/docs/architecture/VISUAL_GENERATOR_TECHNICAL_SPEC.md` section:
- **VisualGenerator class** → `scripts/visual-generator/index.js`

### File 2: Template Manager
- **TemplateManager class** → `scripts/visual-generator/templates/index.js`

### File 3: Canvas Renderer
- **CanvasRenderer class** → `scripts/visual-generator/canvas-renderer.js`

### File 4: Cache Manager
- **CacheManager class** → `scripts/visual-generator/utils/cache-manager.js`

### File 5: Asset Loader
- **AssetLoader class** → `scripts/visual-generator/utils/asset-loader.js`

### File 6: Example Template
- **Minimalist template** → `scripts/visual-generator/templates/minimalist.js`

---

## 🧪 Test It! (2 minutes)

### Quick Test Script
Create `scripts/visual-generator/quick-test.js`:

```javascript
#!/usr/bin/env node

import { VisualGenerator } from './index.js';

async function quickTest() {
  console.log('🎨 Testing Visual Generator...\n');

  const generator = new VisualGenerator({
    cacheEnabled: false
  });

  try {
    const image = await generator.generate({
      category: 'technical',
      title: 'HypeAI - AI-Powered Intelligence',
      subtitle: 'Deploy Custom AI Agents in Minutes'
    });

    console.log('✅ SUCCESS!');
    console.log(`📷 Image generated: ${image}`);
    console.log('\nOpen the image to verify quality.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

quickTest();
```

**Run test:**
```bash
chmod +x scripts/visual-generator/quick-test.js
node scripts/visual-generator/quick-test.js
```

**Expected output:**
```
🎨 Testing Visual Generator...

🎨 Generating: minimalist for technical
✓ Exported: /Users/ai.place/Crypto/scripts/twitter-media/generated/technical-a1b2c3d4.png
✅ SUCCESS!
📷 Image generated: /Users/ai.place/Crypto/scripts/twitter-media/generated/technical-a1b2c3d4.png
```

---

## 🔌 Integrate with Auto-Poster (3 minutes)

### Update `scripts/auto-poster.js`

**Add import at top:**
```javascript
import { VisualGenerator } from './visual-generator/index.js';
```

**Initialize generator (after imports):**
```javascript
const visualGenerator = new VisualGenerator({
  cacheEnabled: true,
  quality: 'high',
  format: 'png'
});
```

**Replace uploadMedia function (lines 102-151):**
```javascript
async function uploadMedia(client, tweetData) {
  try {
    let mediaPath = null;

    console.log(`🎨 Generating visual for: ${tweetData.category}`);

    // Generate image
    try {
      mediaPath = await visualGenerator.generate({
        category: tweetData.category,
        title: tweetData.text.substring(0, 100),
        service: tweetData.service || null
      });
    } catch (error) {
      console.warn(`⚠️  Generation failed, using fallback`);
      mediaPath = './website/logo-icon-only.svg';
    }

    // Upload to Twitter
    const mimeType = getMimeType(mediaPath);
    const mediaId = await client.v1.uploadMedia(mediaPath, { mimeType });

    return mediaId;
  } catch (error) {
    console.error(`❌ Upload failed: ${error.message}`);
    return null;
  }
}
```

---

## ✅ Verification Checklist

### Installation
- [ ] `npm install canvas sharp` - No errors
- [ ] Fonts downloaded to `assets/fonts/`
- [ ] Directories created

### Files Created
- [ ] `scripts/visual-generator/index.js`
- [ ] `scripts/visual-generator/templates/index.js`
- [ ] `scripts/visual-generator/canvas-renderer.js`
- [ ] `scripts/visual-generator/utils/cache-manager.js`
- [ ] `scripts/visual-generator/utils/asset-loader.js`
- [ ] `scripts/visual-generator/templates/minimalist.js`

### Testing
- [ ] Quick test runs successfully
- [ ] Generated image looks professional
- [ ] Image size is 1200x675px
- [ ] File size < 500KB

### Integration
- [ ] Auto-poster.js updated
- [ ] Test tweet posts with image
- [ ] Verify image appears on Twitter
- [ ] Check cache is working

---

## 🎨 Template Selection Guide

### Available Templates (Start with 1, add more later)

**Phase 1 (MVP):**
1. **Minimalist** - Clean, professional (IMPLEMENT FIRST)

**Phase 2 (Week 2):**
2. **Tech Gradient** - Cyberpunk, neon
3. **Professional** - Corporate, trustworthy

**Phase 3 (Week 3):**
4. **Meme Style** - Viral content
5. **Data Viz** - Analytics, stats

**Phase 4 (Advanced):**
6. **3D Isometric** - 3D shapes
7. **Geometric** - Abstract patterns
8. **Glitch Art** - Digital effects

### Quick Template Mapping

```javascript
// In scripts/visual-generator/templates/index.js
const CATEGORY_TEMPLATE_MAP = {
  'technical': 'minimalist',      // Start simple
  'features': 'minimalist',
  'education': 'minimalist',
  'community': 'minimalist',
  'viral': 'minimalist',          // Add meme-style later
  'launch': 'minimalist',
  'engagement': 'minimalist'
};
```

**Strategy:** Start with ONE template (minimalist), verify it works perfectly, then add more.

---

## 🚨 Common Issues & Fixes

### Issue 1: Canvas Installation Fails

**Error:**
```
gyp ERR! stack Error: Cannot find module 'node-gyp'
```

**Fix:**
```bash
# Install build tools
npm install -g node-gyp

# macOS: Install Xcode Command Line Tools
xcode-select --install

# Retry
npm install canvas
```

### Issue 2: Font Not Found

**Error:**
```
Error: Could not load font: Inter
```

**Fix:**
```bash
# Verify fonts exist
ls -la assets/fonts/

# Should see:
# Inter-Bold.ttf
# Inter-Regular.ttf
# Orbitron-Bold.ttf

# If missing, re-download fonts (see Step 2)
```

### Issue 3: Generated Image is Blank

**Error:** Image file created but appears white/blank

**Fix:**
```javascript
// In template render function, verify:
// 1. Background is drawn
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, width, height);

// 2. Text color is not white-on-white
ctx.fillStyle = '#000000'; // Black text on white

// 3. Check console for errors
console.log('Drawing text:', title);
```

### Issue 4: Twitter Upload Fails

**Error:**
```
Error: Request failed with status code 400
```

**Fix:**
```javascript
// Ensure image is valid PNG/JPEG
// Check file size (must be < 5MB)

const stats = await fs.stat(imagePath);
console.log('File size:', stats.size / 1024 / 1024, 'MB');

// If too large, compress:
import sharp from 'sharp';
await sharp(imagePath)
  .png({ quality: 80 })
  .toFile(compressedPath);
```

---

## 📊 Performance Expectations

### Generation Times (Target)

| Template | Expected Time | Acceptable Max |
|----------|---------------|----------------|
| Minimalist | 50-100ms | 200ms |
| Tech Gradient | 100-200ms | 400ms |
| Professional | 100-150ms | 300ms |

### File Sizes (Target)

| Quality | File Size | Use Case |
|---------|-----------|----------|
| High | 200-400KB | Default |
| Medium | 100-200KB | Fast posting |
| Low | 50-100KB | High volume |

### Cache Performance

**First generation:** 100-200ms
**Cached retrieval:** <10ms
**Cache hit rate:** >80% after 24 hours

---

## 🎯 Next Steps

### After Basic Setup Works:

1. **Add More Templates** (Week 2)
   - Tech Gradient for technical content
   - Meme Style for viral posts

2. **Service-Specific Designs** (Week 3)
   - AI Agents → Tech Gradient
   - Chatbots → Minimalist
   - Analytics → Data Viz

3. **Advanced Features** (Week 4)
   - Dynamic data charts
   - User-uploaded images
   - Video thumbnail generation

4. **Optimization** (Week 5)
   - Worker pools for parallel generation
   - Redis cache for multi-server setup
   - CDN integration for fast delivery

---

## 📚 Full Documentation

For complete details, see:
- **Architecture:** `/docs/architecture/TWITTER_VISUAL_SYSTEM.md`
- **Technical Spec:** `/docs/architecture/VISUAL_GENERATOR_TECHNICAL_SPEC.md`
- **Auto-Poster Integration:** `/scripts/auto-poster.js`

---

## 🆘 Need Help?

### Debug Mode
```javascript
const generator = new VisualGenerator({
  cacheEnabled: false,
  debug: true // Enable verbose logging
});
```

### Test Individual Components
```javascript
// Test template manager
const templates = new TemplateManager();
console.log(templates.list());

// Test asset loader
const assets = new AssetLoader('./scripts/twitter-media/assets');
const logo = await assets.loadLogo();
console.log('Logo loaded:', logo);

// Test cache
const cache = new CacheManager({ cachePath: './cache-test' });
await cache.set('test', '/path/to/image.png');
const cached = await cache.get('test');
console.log('Cached:', cached);
```

---

**Total Setup Time: ~15 minutes**
**Difficulty: Medium**
**Prerequisites: Node.js 16+, npm**

✅ **Ready to generate professional Twitter images!** 🎨
