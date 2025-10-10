#!/usr/bin/env node

/**
 * Image Optimization Script for ElonBTC Presale
 *
 * This script optimizes all images in the public/images directory by:
 * - Converting to WebP and AVIF formats
 * - Generating responsive sizes
 * - Compressing with optimal quality settings
 * - Creating blur placeholders for Next.js
 *
 * Usage:
 *   node scripts/optimize-images.js
 *   npm run optimize:images
 */

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const { createHash } = require('crypto')

// Configuration
const CONFIG = {
  inputDir: path.join(__dirname, '../public/images'),
  outputDir: path.join(__dirname, '../public/optimized'),
  quality: {
    webp: 85,
    avif: 75,
    jpeg: 85,
    png: 90
  },
  sizes: [320, 640, 768, 1024, 1280, 1920],
  blurSize: 10,
  formats: ['webp', 'avif']
}

// Statistics tracking
const stats = {
  processed: 0,
  failed: 0,
  originalSize: 0,
  optimizedSize: 0,
  savedBytes: 0
}

/**
 * Create output directory if it doesn't exist
 */
function ensureOutputDir() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true })
    console.log(`✓ Created output directory: ${CONFIG.outputDir}\n`)
  }
}

/**
 * Get file size in bytes
 */
function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size
  } catch (error) {
    return 0
  }
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Generate blur placeholder data URL
 */
async function generateBlurPlaceholder(filePath) {
  try {
    const buffer = await sharp(filePath)
      .resize(CONFIG.blurSize)
      .webp({ quality: 20 })
      .toBuffer()

    const base64 = buffer.toString('base64')
    return `data:image/webp;base64,${base64}`
  } catch (error) {
    console.error(`  ✗ Failed to generate blur placeholder: ${error.message}`)
    return null
  }
}

/**
 * Optimize a single image
 */
async function optimizeImage(filePath) {
  const fileName = path.basename(filePath)
  const nameWithoutExt = path.basename(filePath, path.extname(filePath))
  const ext = path.extname(filePath).toLowerCase()

  console.log(`Processing: ${fileName}`)

  try {
    const image = sharp(filePath)
    const metadata = await image.metadata()

    console.log(`  Format: ${metadata.format}, Size: ${metadata.width}x${metadata.height}`)

    const originalSize = getFileSize(filePath)
    stats.originalSize += originalSize

    let totalOptimizedSize = 0

    // Generate blur placeholder
    const blurDataURL = await generateBlurPlaceholder(filePath)
    if (blurDataURL) {
      const placeholderPath = path.join(CONFIG.outputDir, `${nameWithoutExt}-blur.txt`)
      fs.writeFileSync(placeholderPath, blurDataURL)
      console.log(`  ✓ Generated blur placeholder`)
    }

    // Generate responsive sizes
    for (const size of CONFIG.sizes) {
      // Only generate if size is smaller than original
      if (size >= metadata.width) continue

      // WebP format
      if (CONFIG.formats.includes('webp')) {
        const webpPath = path.join(CONFIG.outputDir, `${nameWithoutExt}-${size}.webp`)
        await image
          .clone()
          .resize(size, null, { withoutEnlargement: true })
          .webp({ quality: CONFIG.quality.webp, effort: 6 })
          .toFile(webpPath)

        totalOptimizedSize += getFileSize(webpPath)
      }

      // AVIF format
      if (CONFIG.formats.includes('avif')) {
        const avifPath = path.join(CONFIG.outputDir, `${nameWithoutExt}-${size}.avif`)
        await image
          .clone()
          .resize(size, null, { withoutEnlargement: true })
          .avif({ quality: CONFIG.quality.avif, effort: 6 })
          .toFile(avifPath)

        totalOptimizedSize += getFileSize(avifPath)
      }
    }

    // Optimize original format
    if (ext === '.jpg' || ext === '.jpeg') {
      const optimizedPath = path.join(CONFIG.outputDir, `${nameWithoutExt}-optimized.jpg`)
      await image
        .jpeg({ quality: CONFIG.quality.jpeg, progressive: true, mozjpeg: true })
        .toFile(optimizedPath)
      totalOptimizedSize += getFileSize(optimizedPath)
    } else if (ext === '.png') {
      const optimizedPath = path.join(CONFIG.outputDir, `${nameWithoutExt}-optimized.png`)
      await image
        .png({ quality: CONFIG.quality.png, compressionLevel: 9, effort: 10 })
        .toFile(optimizedPath)
      totalOptimizedSize += getFileSize(optimizedPath)
    }

    stats.optimizedSize += totalOptimizedSize
    const saved = originalSize - (totalOptimizedSize / CONFIG.formats.length)
    stats.savedBytes += saved

    console.log(`  ✓ Original: ${formatBytes(originalSize)}`)
    console.log(`  ✓ Optimized: ${formatBytes(totalOptimizedSize / CONFIG.formats.length)}`)
    console.log(`  ✓ Saved: ${formatBytes(saved)} (${Math.round((saved / originalSize) * 100)}%)\n`)

    stats.processed++
  } catch (error) {
    console.error(`  ✗ Failed to optimize: ${error.message}\n`)
    stats.failed++
  }
}

/**
 * Process all images in the input directory
 */
async function processAllImages() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  ElonBTC Presale - Image Optimization')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  ensureOutputDir()

  // Check if input directory exists
  if (!fs.existsSync(CONFIG.inputDir)) {
    console.error(`✗ Input directory not found: ${CONFIG.inputDir}`)
    console.log('  Please create the directory and add images to optimize.\n')
    process.exit(1)
  }

  // Get all image files
  const files = fs.readdirSync(CONFIG.inputDir)
  const imageFiles = files.filter(file =>
    /\.(jpg|jpeg|png)$/i.test(file)
  )

  if (imageFiles.length === 0) {
    console.log('✗ No images found to optimize.\n')
    process.exit(0)
  }

  console.log(`Found ${imageFiles.length} image(s) to optimize`)
  console.log(`Output directory: ${CONFIG.outputDir}`)
  console.log(`Formats: ${CONFIG.formats.join(', ')}`)
  console.log(`Responsive sizes: ${CONFIG.sizes.join(', ')}\n`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Process each image
  for (const file of imageFiles) {
    await optimizeImage(path.join(CONFIG.inputDir, file))
  }

  // Print summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Optimization Summary')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`✓ Successfully processed: ${stats.processed}`)
  console.log(`✗ Failed: ${stats.failed}`)
  console.log(`📦 Original total size: ${formatBytes(stats.originalSize)}`)
  console.log(`📦 Optimized total size: ${formatBytes(stats.optimizedSize / CONFIG.formats.length)}`)
  console.log(`💾 Total saved: ${formatBytes(stats.savedBytes)} (${Math.round((stats.savedBytes / stats.originalSize) * 100)}%)`)
  console.log('\n✓ All images optimized successfully!\n')
}

// Run the script
if (require.main === module) {
  processAllImages().catch(error => {
    console.error('\n✗ Optimization failed:', error.message)
    process.exit(1)
  })
}

module.exports = { optimizeImage, processAllImages }
