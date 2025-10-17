#!/usr/bin/env node

/**
 * Media Generator - AI Image Generation & Download for Tweets
 * Generates unique images for each tweet using AI or downloads from stock
 */

import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { createCanvas, loadImage, registerFont } from 'canvas';

dotenv.config({ path: './scripts/.env.marketing' });

// Media cache directory
const MEDIA_DIR = './scripts/twitter-media';
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

// Unsplash API for free stock photos
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'demo';

/**
 * Generate AI-themed image based on tweet category and content
 */
async function generateAIImage(tweetData) {
  console.log(`🎨 Generating AI image for: ${tweetData.category}`);

  const filename = `${MEDIA_DIR}/tweet-${tweetData.id}-generated.png`;

  // Check if already generated
  if (fs.existsSync(filename)) {
    console.log(`   ✅ Using cached image: ${filename}`);
    return filename;
  }

  // Create canvas (1200x675 - Twitter optimal size)
  const canvas = createCanvas(1200, 675);
  const ctx = canvas.getContext('2d');

  // HypeAI Brand Colors (from website/branding)
  const BRAND_COLORS = {
    blue: '#00D4FF',      // Primary Blue (Electric Blue)
    purple: '#9D4EDD',    // Primary Purple
    green: '#39FF14',     // Accent Green
    darkBg: '#0A0E27',    // Dark Background
    darkCard: '#1A1F3A'   // Dark Card
  };

  // Background gradient based on category - using ONLY brand colors
  const gradients = {
    introduction: [BRAND_COLORS.blue, BRAND_COLORS.purple],           // Blue → Purple
    features: [BRAND_COLORS.purple, BRAND_COLORS.blue],                // Purple → Blue
    community: [BRAND_COLORS.blue, BRAND_COLORS.green],                // Blue → Green
    education: [BRAND_COLORS.green, BRAND_COLORS.blue],                // Green → Blue
    launch: [BRAND_COLORS.purple, BRAND_COLORS.green],                 // Purple → Green
    technical: [BRAND_COLORS.darkCard, BRAND_COLORS.blue],             // Dark → Blue
    engagement: [BRAND_COLORS.blue, BRAND_COLORS.purple],              // Blue → Purple
    viral: [BRAND_COLORS.green, BRAND_COLORS.purple]                   // Green → Purple
  };

  const colors = gradients[tweetData.category] || [BRAND_COLORS.blue, BRAND_COLORS.purple];
  const gradient = ctx.createLinearGradient(0, 0, 1200, 675);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 675);

  // Add tech pattern overlay with brand colors
  ctx.strokeStyle = `rgba(0, 212, 255, 0.15)`; // Brand blue with transparency
  ctx.lineWidth = 2;
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * 1200;
    const y = Math.random() * 675;
    const size = Math.random() * 100 + 50;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Add purple accents
  ctx.strokeStyle = `rgba(157, 78, 221, 0.15)`; // Brand purple
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * 1200;
    const y = Math.random() * 675;
    const size = Math.random() * 80 + 40;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Add HypeAI logo
  try {
    const logo = await loadImage('./website/branding/logos/twitter/hypeai-logo-1024.png');
    const logoSize = 200;
    ctx.drawImage(logo, 50, 50, logoSize, logoSize);
  } catch (error) {
    console.log(`   ⚠️  Logo not loaded: ${error.message}`);
  }

  // Add text overlay
  ctx.fillStyle = 'white';
  ctx.font = 'bold 60px sans-serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 20;

  // Category badge with brand styling
  const categoryText = tweetData.category.toUpperCase();
  ctx.fillStyle = BRAND_COLORS.darkCard;
  ctx.globalAlpha = 0.95;
  ctx.fillRect(50, 550, 300, 80);
  ctx.globalAlpha = 1.0;

  // Gradient text for category
  const catGradient = ctx.createLinearGradient(70, 580, 320, 600);
  catGradient.addColorStop(0, BRAND_COLORS.blue);
  catGradient.addColorStop(1, BRAND_COLORS.purple);
  ctx.fillStyle = catGradient;
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText(categoryText, 70, 600);

  // HypeAI watermark with brand gradient
  const logoGradient = ctx.createLinearGradient(50, 280, 250, 320);
  logoGradient.addColorStop(0, BRAND_COLORS.blue);
  logoGradient.addColorStop(1, BRAND_COLORS.purple);
  ctx.fillStyle = logoGradient;
  ctx.font = 'bold 60px sans-serif';
  ctx.fillText('HypeAI', 50, 320);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '28px sans-serif';
  ctx.fillText('Where Hype Meets Intelligence', 50, 360);

  // Add AI-themed icons/elements
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 3;

  // Neural network visualization
  for (let i = 0; i < 10; i++) {
    const x1 = 900 + Math.random() * 200;
    const y1 = 100 + Math.random() * 400;
    const x2 = 900 + Math.random() * 200;
    const y2 = 100 + Math.random() * 400;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(x1, y1, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Save image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);

  console.log(`   ✅ Generated: ${filename}`);
  return filename;
}

/**
 * Download AI-related image from Unsplash
 */
async function downloadFromUnsplash(query, tweetId) {
  console.log(`📥 Downloading from Unsplash: "${query}"`);

  const filename = `${MEDIA_DIR}/tweet-${tweetId}-unsplash.jpg`;

  // Check if already downloaded
  if (fs.existsSync(filename)) {
    console.log(`   ✅ Using cached image: ${filename}`);
    return filename;
  }

  try {
    const searchUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;

    const imageUrl = await new Promise((resolve, reject) => {
      https.get(searchUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.urls.regular);
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });

    // Download image
    await new Promise((resolve, reject) => {
      https.get(imageUrl, (res) => {
        const stream = fs.createWriteStream(filename);
        res.pipe(stream);
        stream.on('finish', () => {
          stream.close();
          resolve();
        });
      }).on('error', reject);
    });

    console.log(`   ✅ Downloaded: ${filename}`);
    return filename;

  } catch (error) {
    console.log(`   ⚠️  Unsplash download failed: ${error.message}`);
    return null;
  }
}

/**
 * Get appropriate media for tweet
 */
export async function getMediaForTweet(tweetData) {
  console.log(`\n🎬 Getting media for tweet #${tweetData.id}...`);

  // Media strategy based on category
  const strategies = {
    introduction: { type: 'generate', query: 'artificial intelligence technology' },
    features: { type: 'unsplash', query: 'AI neural network abstract' },
    community: { type: 'unsplash', query: 'community people together' },
    education: { type: 'generate', query: 'AI learning education' },
    launch: { type: 'generate', query: 'rocket launch success' },
    technical: { type: 'unsplash', query: 'code programming technology' },
    engagement: { type: 'generate', query: 'social media engagement' },
    viral: { type: 'generate', query: 'viral trending social' }
  };

  const strategy = strategies[tweetData.category] || { type: 'generate' };

  let mediaPath = null;

  if (strategy.type === 'generate') {
    // Generate AI image
    mediaPath = await generateAIImage(tweetData);
  } else if (strategy.type === 'unsplash') {
    // Try Unsplash first, fallback to generated
    mediaPath = await downloadFromUnsplash(strategy.query, tweetData.id);

    if (!mediaPath) {
      console.log('   🔄 Fallback to generated image...');
      mediaPath = await generateAIImage(tweetData);
    }
  }

  return mediaPath;
}

/**
 * CLI testing
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const testTweet = {
    id: 999,
    category: 'features',
    text: 'Test tweet for media generation',
    media_suggestion: 'AI visualization'
  };

  getMediaForTweet(testTweet).then(path => {
    console.log(`\n✅ Media ready: ${path}`);
  });
}
