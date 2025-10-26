# 🎨 Visual Content Best Practices - HypeAI Twitter Media

**Guide for creating high-quality, on-brand social media visuals**

---

## 🎯 GOLDEN RULES

### 1. ALWAYS Use Official HypeAI Colors

```javascript
// ✅ CORRECT - Official HypeAI Palette
const HYPEAI_COLORS = {
  primary: '#00E5FF',    // Bright Cyan (main brand color)
  secondary: '#00AAFF',  // Blue (secondary)
  accent: '#0077FF',     // Dark Blue (accents)
  text: '#FFFFFF',       // White (text)
  background: '#000000'  // Black (backgrounds)
};

// ❌ WRONG - Never use these
const WRONG_COLORS = {
  gold: '#F3BA2F',       // This is BNB Chain, not HypeAI!
  green: '#00FF7F',      // Not our brand
  yellow: '#FFE900'      // Not our brand
};
```

### 2. ALWAYS Use Official Logo

**Primary logo (with text):**
```
/Users/ai.place/Crypto/website/logo-official-BRIGHT.svg
```

**Icon only (no text):**
```
/Users/ai.place/Crypto/website/logo-icon-only.svg
```

**Never:**
- Create new logos
- Modify logo colors
- Use old logo versions
- Stretch or distort logo

### 3. ALWAYS Maintain Brand Consistency

**Every image MUST have:**
- Official HypeAI colors ✅
- HypeAI logo (size: 80-200px) ✅
- Professional quality ✅
- Readable text (WCAG AA: 4.5:1 contrast) ✅
- Twitter-optimized size (1200x675px) ✅

---

## 📐 TECHNICAL SPECIFICATIONS

### Image Dimensions
```
Width: 1200px
Height: 675px
Aspect Ratio: 16:9
Format: PNG (transparency support)
Max File Size: 500KB (target: 250-350KB)
Color Space: RGB
DPI: 72 (screen optimal)
```

### Text Requirements
```
Minimum font size: 28px (readable on mobile)
Maximum text width: 1000px (margins for safety)
Line height: 1.2-1.5 (readability)
Font weight: Bold for headers (60-72px)
            Regular for body (28-40px)
Shadow: 10-20px blur for contrast
```

### Logo Placement
```
Preferred positions:
- Top-left: (50-80px, 50-80px)
- Top-right: (width - logoSize - 80px, 50px)
- Center: (600 - logoSize/2, 337 - logoSize/2)

Logo sizes:
- Small: 80px
- Medium: 120px
- Large: 200px
```

---

## 🎨 APPROVED DESIGN PATTERNS

### Pattern 1: Gradient Hero
```javascript
const ctx = canvas.getContext('2d');
const gradient = ctx.createLinearGradient(0, 0, 1200, 675);
gradient.addColorStop(0, '#00E5FF');  // Cyan
gradient.addColorStop(0.5, '#00AAFF'); // Blue
gradient.addColorStop(1, '#0077FF');   // Dark blue
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 1200, 675);
```

**Best for:** Announcements, launches, bold statements

### Pattern 2: Dark Professional
```javascript
// Dark background with cyan accents
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, 1200, 675);

// Cyan accent lines
ctx.strokeStyle = '#00E5FF';
ctx.lineWidth = 4;
ctx.strokeRect(40, 40, 1120, 595);
```

**Best for:** Technical content, features, education

### Pattern 3: Minimalist Clean
```javascript
// White or light gray background
ctx.fillStyle = '#F8F9FA';
ctx.fillRect(0, 0, 1200, 675);

// Cyan header bar
const gradient = ctx.createLinearGradient(0, 0, 1200, 150);
gradient.addColorStop(0, '#00E5FF');
gradient.addColorStop(1, '#0077FF');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 1200, 150);
```

**Best for:** Stats, infographics, professional reports

### Pattern 4: Blockchain Network
```javascript
// Dark background
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, 1200, 675);

// Hexagonal grid overlay
ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)'; // HypeAI cyan, transparent
ctx.lineWidth = 2;

for (let i = 0; i < 12; i++) {
  const x = Math.random() * 1200;
  const y = Math.random() * 675;
  const size = Math.random() * 80 + 40;

  // Draw hexagon
  ctx.beginPath();
  for (let j = 0; j < 6; j++) {
    const angle = (Math.PI / 3) * j;
    const hx = x + size * Math.cos(angle);
    const hy = y + size * Math.sin(angle);
    if (j === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke();
}

// Network nodes (cyan dots)
ctx.fillStyle = '#00E5FF';
nodes.forEach(node => {
  ctx.beginPath();
  ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
  ctx.fill();
});
```

**Best for:** Technical showcases, blockchain content, innovation

---

## ✍️ TYPOGRAPHY GUIDELINES

### Font Hierarchy
```
H1 (Main headline):
  Size: 60-72px
  Weight: Bold
  Color: #FFFFFF (white) or #00E5FF (cyan)

H2 (Subheading):
  Size: 40-48px
  Weight: Bold or Semi-bold
  Color: #FFFFFF or #00AAFF

Body text:
  Size: 28-36px
  Weight: Regular
  Color: #FFFFFF or #EAECEF

Category badge:
  Size: 36-40px
  Weight: Bold
  Color: #00E5FF
  Background: rgba(0, 0, 0, 0.9)
```

### Text Positioning
```javascript
// Centered text
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('Text', 600, 337); // Center of 1200x675

// Left-aligned
ctx.textAlign = 'left';
ctx.fillText('Text', 80, 300); // 80px margin

// Right-aligned
ctx.textAlign = 'right';
ctx.fillText('Text', 1120, 300); // 80px margin from right
```

### Text Effects
```javascript
// Drop shadow (for contrast)
ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
ctx.shadowBlur = 20;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 2;

// Glow effect (HypeAI cyan)
ctx.shadowColor = 'rgba(0, 229, 255, 0.8)';
ctx.shadowBlur = 30;

// Stroke text (outline)
ctx.strokeStyle = '#000000';
ctx.lineWidth = 3;
ctx.strokeText('Text', x, y);
ctx.fillText('Text', x, y);
```

---

## 🎭 STYLE TEMPLATES

### 1. Announcement Template
```javascript
// Background: Cyan to Dark Blue gradient
// Logo: Top-left, 120px
// Title: Center, 72px bold white
// Subtitle: Below title, 48px cyan
// Footer: Bottom, "HypeAI - Infinite Intelligence"
```

**Use for:** Product launches, major updates, news

### 2. Feature Showcase
```javascript
// Background: Dark with hexagonal pattern
// Logo: Top-left, 100px
// Feature list: Left side, cyan bullets
// Visual: Right side (icon or graphic)
// Category badge: Bottom-left
```

**Use for:** Feature announcements, capabilities, specs

### 3. Stats/Metrics
```javascript
// Background: Light gray or white
// Header: Cyan gradient bar with logo
// Stats: 2x2 or 3x2 grid
// Numbers: Large bold (60px)
// Labels: Smaller (28px)
// Footer: Hashtag or tagline
```

**Use for:** Milestones, metrics, achievements

### 4. Quote/Testimonial
```javascript
// Background: Minimalist (white or light)
// Quote: Large italic text, center
// Attribution: Below quote, smaller
// Logo: Top-right corner, subtle
// Accent: Cyan quotation marks or border
```

**Use for:** Community feedback, testimonials

### 5. Educational
```javascript
// Background: Professional gradient
// Title: Top, bold
// Content: Step-by-step or bullet points
// Visuals: Icons or simple graphics
// Footer: "Learn more at hypeai.com"
```

**Use for:** Tutorials, explanations, guides

---

## 🚫 COMMON MISTAKES TO AVOID

### Color Mistakes ❌
```javascript
// ❌ Using wrong colors
'#F3BA2F' // BNB gold
'#FFE900' // Yellow
'#00FF7F' // Green

// ✅ Use HypeAI colors only
'#00E5FF' // Cyan
'#00AAFF' // Blue
'#0077FF' // Dark Blue
```

### Layout Mistakes ❌
- Text too small (< 28px)
- No margins (text touching edges)
- Logo too small (< 60px)
- Overcrowded design
- Poor contrast (can't read text)

### Branding Mistakes ❌
- Wrong logo file
- Modified logo colors
- Missing logo entirely
- Inconsistent fonts
- Non-brand colors

### Technical Mistakes ❌
- Wrong dimensions (not 1200x675)
- File too large (> 500KB)
- Low quality/pixelation
- Wrong format (not PNG)
- No transparency support

---

## ✅ QUALITY CHECKLIST

Before posting ANY image, verify:

### Visual Quality
- [ ] Dimensions exactly 1200x675px
- [ ] File size < 500KB (ideally 250-350KB)
- [ ] PNG format with transparency
- [ ] No pixelation or artifacts
- [ ] Text is sharp and crisp
- [ ] Logo is clear and visible

### Brand Compliance
- [ ] Uses official HypeAI colors (#00E5FF, #00AAFF, #0077FF)
- [ ] Official logo file used (logo-official-BRIGHT.svg)
- [ ] Logo properly sized (80-200px)
- [ ] No BNB Chain or other branding
- [ ] Consistent with other HypeAI materials

### Readability
- [ ] Text size minimum 28px
- [ ] Contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] Text has shadow/outline if needed
- [ ] No text in margins (80px safe area)
- [ ] Readable on mobile devices

### Content
- [ ] Message clear and concise
- [ ] Category accurately represented
- [ ] Professional appearance
- [ ] No typos or errors
- [ ] Appropriate for audience

---

## 🔧 CODE IMPLEMENTATION

### Centralized Color Config
```javascript
// Create: config/brand-colors.js
export const HYPEAI_BRAND = {
  colors: {
    primary: '#00E5FF',
    secondary: '#00AAFF',
    accent: '#0077FF',
    text: '#FFFFFF',
    textSecondary: '#EAECEF',
    background: '#000000',
    backgroundLight: '#1A1A1A'
  },

  gradients: {
    hero: ['#00E5FF', '#00AAFF', '#0077FF'],
    subtle: ['#0077FF', '#000000'],
    vibrant: ['#00E5FF', '#0077FF']
  },

  logo: {
    primary: '/Users/ai.place/Crypto/website/logo-official-BRIGHT.svg',
    icon: '/Users/ai.place/Crypto/website/logo-icon-only.svg'
  }
};

// Usage in generators:
import { HYPEAI_BRAND } from '../config/brand-colors.js';

const gradient = ctx.createLinearGradient(0, 0, 1200, 675);
HYPEAI_BRAND.gradients.hero.forEach((color, i) => {
  gradient.addColorStop(i / 2, color);
});
```

### Contrast Checking
```javascript
// Check if text is readable on background
function checkContrast(textColor, bgColor) {
  // Convert hex to RGB
  const rgb1 = hexToRgb(textColor);
  const rgb2 = hexToRgb(bgColor);

  // Calculate relative luminance
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);

  // Calculate contrast ratio
  const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  // WCAG AA requires 4.5:1 for normal text
  return contrast >= 4.5;
}

// Usage
if (!checkContrast('#FFFFFF', bgGradientColor)) {
  // Add shadow or change text color
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 20;
}
```

### Image Validation
```javascript
// Validate generated image before saving
function validateImage(canvas) {
  const errors = [];

  // Check dimensions
  if (canvas.width !== 1200 || canvas.height !== 675) {
    errors.push('Invalid dimensions');
  }

  // Check file size
  const buffer = canvas.toBuffer('image/png');
  if (buffer.length > 500 * 1024) { // 500KB
    errors.push('File too large');
  }

  // Check if logo was loaded
  // (implement logo presence detection)

  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## 📊 PERFORMANCE OPTIMIZATION

### File Size Optimization
```javascript
// Use PNG compression level 6 (balanced)
const buffer = canvas.toBuffer('image/png', {
  compressionLevel: 6,
  filters: canvas.PNG_FILTER_NONE
});

// For photos, consider JPEG with 85% quality
const jpegBuffer = canvas.toBuffer('image/jpeg', {
  quality: 0.85,
  progressive: true
});
```

### Caching Strategy
```javascript
// Check if image already exists
const cacheKey = `${category}-${tweetId}`;
const cachedPath = `${MEDIA_DIR}/${cacheKey}.png`;

if (fs.existsSync(cachedPath)) {
  console.log('Using cached image');
  return cachedPath;
}

// Generate and save
const newImage = await generateImage(data);
fs.writeFileSync(cachedPath, newImage);
```

---

## 🎯 ENGAGEMENT TIPS

### Visual Psychology
- **Cyan/Blue:** Trust, technology, innovation ✅
- **Gradients:** Modern, dynamic, energetic ✅
- **Hexagons:** Blockchain, connectivity, structure ✅
- **White space:** Professional, clean, focused ✅

### Call-to-Action Visual Cues
- Arrows pointing to important info
- Highlighted text with cyan background
- "New" or "Launch" badges
- Progress indicators
- Before/After comparisons

### Social Media Best Practices
- **Twitter:** 1200x675px (16:9)
- **Instagram:** 1080x1080px (1:1) - adapt layout
- **LinkedIn:** 1200x627px - similar to Twitter
- **Facebook:** 1200x630px - nearly identical

---

## 📈 ANALYTICS & ITERATION

### Track These Metrics
- Engagement rate by image style
- CTR on tweets with images
- Image views duration
- Shares/retweets by visual type
- Comments mentioning visuals

### A/B Testing Ideas
- Gradient vs solid backgrounds
- Logo size variations
- Text placement
- Color intensity
- Category badge styles

### Continuous Improvement
1. Weekly review of top-performing images
2. Monthly style refresh based on data
3. Quarterly trend analysis
4. User feedback integration
5. Competitor visual monitoring

---

## 🏁 FINAL NOTES

**Remember:**
- Quality over quantity
- Consistency builds brand recognition
- Test on mobile devices
- Monitor engagement metrics
- Iterate based on data

**Resources:**
- Official brand guide: `/Users/ai.place/Crypto/branding/OFFICIAL_BRAND_ASSETS.md`
- Logo files: `/Users/ai.place/Crypto/website/`
- Color palette: HypeAI cyan (#00E5FF), blue (#00AAFF), dark blue (#0077FF)

**Questions?** Review with marketing team before launching new styles.

---

**Document Version:** 1.0
**Last Updated:** October 21, 2025
**Maintained By:** HypeAI Marketing Team
