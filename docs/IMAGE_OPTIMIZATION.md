# Image Optimization Guide

## Overview

Comprehensive guide for optimizing images in the ElonBTC presale page to achieve optimal loading performance and Core Web Vitals scores.

---

## Image Audit Checklist

### Current Images to Optimize

- [ ] Logo (header, footer)
- [ ] Hero background
- [ ] Token icons
- [ ] Team photos
- [ ] Partner logos
- [ ] Social media icons
- [ ] Chart backgrounds
- [ ] Decorative elements

---

## Optimization Strategies

### 1. Use Next.js Image Component

**Before:**
```jsx
<img src="/images/logo.png" alt="ElonBTC" />
```

**After:**
```jsx
import Image from 'next/image'

<Image
  src="/images/logo.png"
  alt="ElonBTC"
  width={200}
  height={200}
  priority // For above-the-fold images
/>
```

### 2. Image Format Selection

#### Format Priority

1. **AVIF**: Best compression (50% smaller than JPEG)
   - Use for: Photos, complex images
   - Browser support: Chrome, Firefox, Opera

2. **WebP**: Good compression (30% smaller than JPEG)
   - Use for: All images
   - Browser support: All modern browsers

3. **SVG**: Vector format
   - Use for: Logos, icons, simple graphics
   - Benefits: Scalable, small file size

4. **PNG**: Lossless compression
   - Use for: Transparent backgrounds
   - Fallback for complex transparency

5. **JPEG**: Standard compression
   - Use for: Photos (fallback)

#### Conversion Commands

```bash
# Install sharp for image processing
npm install sharp

# Convert images to WebP
npx sharp -i input.jpg -o output.webp

# Convert to AVIF
npx sharp -i input.jpg -o output.avif

# Batch conversion
for file in public/images/*.jpg; do
  npx sharp -i "$file" -o "${file%.jpg}.webp"
done
```

### 3. Image Sizing

#### Responsive Image Sizes

```jsx
<Image
  src="/hero.jpg"
  alt="Hero"
  fill
  sizes="(max-width: 768px) 100vw,
         (max-width: 1200px) 50vw,
         33vw"
  priority
/>
```

#### Device-Specific Sizes

- **Mobile**: 320px, 640px, 750px
- **Tablet**: 768px, 1024px
- **Desktop**: 1280px, 1920px, 2560px

### 4. Lazy Loading

```jsx
// Above-the-fold: Load immediately
<Image src="/hero.jpg" alt="Hero" priority />

// Below-the-fold: Lazy load (default)
<Image src="/team.jpg" alt="Team" loading="lazy" />
```

### 5. Placeholder Blur

```jsx
import logo from '../public/images/logo.jpg'

<Image
  src={logo}
  alt="Logo"
  placeholder="blur" // Automatic blur placeholder
  blurDataURL={logo.blurDataURL}
/>
```

**Generate blur placeholder:**

```bash
# Create blur data URL
npx plaiceholder ./public/images/logo.jpg
```

---

## Optimization Script

Create `/scripts/optimize-images.js`:

```javascript
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const imagesDir = path.join(__dirname, '../public/images')
const outputDir = path.join(__dirname, '../public/optimized')

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Image quality settings
const QUALITY = {
  webp: 85,
  avif: 75,
  jpeg: 85,
  png: 90
}

// Size presets
const SIZES = [320, 640, 768, 1024, 1280, 1920]

async function optimizeImage(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath))
  const ext = path.extname(filePath).toLowerCase()

  console.log(`Optimizing: ${fileName}${ext}`)

  try {
    const image = sharp(filePath)
    const metadata = await image.metadata()

    // Generate responsive sizes
    for (const size of SIZES) {
      if (size < metadata.width) {
        // WebP
        await image
          .resize(size)
          .webp({ quality: QUALITY.webp })
          .toFile(path.join(outputDir, `${fileName}-${size}.webp`))

        // AVIF
        await image
          .resize(size)
          .avif({ quality: QUALITY.avif })
          .toFile(path.join(outputDir, `${fileName}-${size}.avif`))
      }
    }

    // Optimized original format
    if (ext === '.jpg' || ext === '.jpeg') {
      await image
        .jpeg({ quality: QUALITY.jpeg, progressive: true })
        .toFile(path.join(outputDir, `${fileName}-optimized.jpg`))
    } else if (ext === '.png') {
      await image
        .png({ quality: QUALITY.png, compressionLevel: 9 })
        .toFile(path.join(outputDir, `${fileName}-optimized.png`))
    }

    console.log(`✓ Optimized: ${fileName}`)
  } catch (error) {
    console.error(`✗ Failed to optimize ${fileName}:`, error.message)
  }
}

async function processAllImages() {
  const files = fs.readdirSync(imagesDir)
  const imageFiles = files.filter(file =>
    /\.(jpg|jpeg|png)$/i.test(file)
  )

  console.log(`Found ${imageFiles.length} images to optimize\n`)

  for (const file of imageFiles) {
    await optimizeImage(path.join(imagesDir, file))
  }

  console.log('\n✓ All images optimized!')
}

processAllImages()
```

**Run optimization:**

```bash
node scripts/optimize-images.js
```

---

## SVG Optimization

### Optimize SVG Files

```bash
# Install SVGO
npm install -D svgo

# Optimize single file
npx svgo input.svg -o output.svg

# Optimize directory
npx svgo -f public/icons -o public/optimized-icons

# Configuration in svgo.config.js
module.exports = {
  multipass: true,
  plugins: [
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeTitle',
    'removeDesc',
    'removeUselessDefs',
    'removeEditorsNSData',
    'removeEmptyAttrs',
    'removeHiddenElems',
    'removeEmptyText',
    'removeEmptyContainers',
    'cleanupEnableBackground',
    'convertStyleToAttrs',
    'convertColors',
    'convertPathData',
    'convertTransform',
    'removeUnknownsAndDefaults',
    'removeNonInheritableGroupAttrs',
    'removeUselessStrokeAndFill',
    'removeUnusedNS',
    'cleanupIDs',
    'cleanupNumericValues',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'collapseGroups',
    'mergePaths',
    'convertShapeToPath',
    'sortAttrs',
    'removeDimensions',
  ]
}
```

---

## CDN Configuration

### Vercel Image Optimization

Automatically enabled with Next.js on Vercel. Configuration in `next.config.js`:

```javascript
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [
      'bscscan.com',
      'assets.coingecko.com',
      'your-cdn-domain.com'
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}
```

### CloudFlare Image Resizing

If using CloudFlare:

```jsx
<Image
  src="/cf-images/logo.jpg"
  alt="Logo"
  loader={({ src, width, quality }) => {
    return `https://yourdomain.com/cdn-cgi/image/width=${width},quality=${quality || 75}/${src}`
  }}
  width={200}
  height={200}
/>
```

---

## Performance Metrics

### Target Metrics

- **Image file size**: < 200KB per image
- **Total image payload**: < 1MB per page
- **LCP (Largest Contentful Paint)**: < 2.5s
- **CLS (Cumulative Layout Shift)**: < 0.1

### Measurement Tools

```bash
# Analyze image sizes
du -sh public/images/*

# Check total size
du -sh public/images/

# Lighthouse audit
npx lighthouse https://yourdomain.com --view
```

---

## Image Optimization Checklist

### Pre-Production

- [ ] All images converted to WebP/AVIF
- [ ] SVGs optimized with SVGO
- [ ] Responsive image sizes generated
- [ ] Next.js Image component used everywhere
- [ ] Priority attribute set for above-the-fold images
- [ ] Lazy loading enabled for below-the-fold images
- [ ] Blur placeholders implemented
- [ ] Alt text added to all images
- [ ] Width and height specified to prevent CLS
- [ ] CDN configured
- [ ] Image sizes under target limits
- [ ] LCP image identified and optimized

### Production Monitoring

- [ ] Monitor LCP scores
- [ ] Track image load times
- [ ] Check CLS impact
- [ ] Review bandwidth usage
- [ ] Analyze user experience by device
- [ ] Test on slow connections

---

## Example Component

Complete implementation:

```tsx
import Image from 'next/image'
import logo from '@/public/images/logo.jpg'

export function HeroSection() {
  return (
    <section className="relative h-screen">
      {/* Background image - above the fold, priority load */}
      <Image
        src="/images/hero-bg.jpg"
        alt="Hero background"
        fill
        sizes="100vw"
        priority
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..."
        className="object-cover"
      />

      {/* Logo - critical, immediate load */}
      <div className="relative z-10">
        <Image
          src={logo}
          alt="ElonBTC Logo"
          width={200}
          height={200}
          priority
          placeholder="blur"
        />
      </div>

      {/* Team photos - below fold, lazy load */}
      <div className="mt-20">
        <Image
          src="/images/team.jpg"
          alt="Team"
          width={800}
          height={600}
          loading="lazy"
          quality={80}
        />
      </div>
    </section>
  )
}
```

---

## Troubleshooting

### Issue: Images not optimizing

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Issue: Large bundle size

**Solution:**
```javascript
// Use dynamic imports for image-heavy components
const Gallery = dynamic(() => import('./Gallery'), {
  loading: () => <p>Loading gallery...</p>
})
```

### Issue: Slow image loading

**Solution:**
1. Enable priority for above-the-fold images
2. Preconnect to image CDN
3. Use smaller image sizes
4. Implement progressive loading

---

## Resources

- Next.js Image Optimization: https://nextjs.org/docs/pages/building-your-application/optimizing/images
- Sharp Documentation: https://sharp.pixelplumbing.com
- SVGO: https://github.com/svg/svgo
- WebP: https://developers.google.com/speed/webp
- AVIF: https://jakearchibald.com/2020/avif-has-landed

---

**Result:** Optimized images = Faster load times = Better user experience! 🖼️⚡

**Last Updated:** 2025-10-10
