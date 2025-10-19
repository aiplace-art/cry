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

  // BNB Chain Brand Colors (Official BNB/Binance Palette)
  const BRAND_COLORS = {
    gold: '#F3BA2F',      // PRIMARY: Binance/BNB Yellow Gold
    black: '#000000',     // SECONDARY: Pure Black
    white: '#FFFFFF',     // TERTIARY: Pure White
    darkBg: '#1E2329',    // Dark Gray Background
    darkCard: '#0B0E11',  // Deeper Black
    lightGray: '#EAECEF', // Light Gray Text
    darkGold: '#F0B90B',  // Darker Gold (Hover)
    lightGold: '#FCD535'  // Lighter Gold (Highlights)
  };

  // Background gradient based on category - BNB Chain Gold/Black theme
  const gradients = {
    introduction: [BRAND_COLORS.gold, BRAND_COLORS.black],           // Gold → Black
    features: [BRAND_COLORS.black, BRAND_COLORS.gold],               // Black → Gold
    community: [BRAND_COLORS.darkBg, BRAND_COLORS.gold],             // Dark Gray → Gold
    education: [BRAND_COLORS.darkBg, BRAND_COLORS.black],            // Dark Gray → Black
    launch: [BRAND_COLORS.gold, BRAND_COLORS.darkGold],              // Gold → Dark Gold
    technical: [BRAND_COLORS.darkCard, BRAND_COLORS.darkBg],         // Deep Black → Dark Gray
    engagement: [BRAND_COLORS.gold, BRAND_COLORS.black],             // Gold → Black
    viral: [BRAND_COLORS.lightGold, BRAND_COLORS.gold]               // Light Gold → Gold
  };

  const colors = gradients[tweetData.category] || [BRAND_COLORS.gold, BRAND_COLORS.black];
  const gradient = ctx.createLinearGradient(0, 0, 1200, 675);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 675);

  // Add tech pattern overlay with BNB Chain colors
  ctx.strokeStyle = `rgba(243, 186, 47, 0.12)`; // BNB Gold with transparency
  ctx.lineWidth = 2;

  // Hexagonal blockchain pattern (BNB Chain aesthetic)
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * 1200;
    const y = Math.random() * 675;
    const size = Math.random() * 100 + 50;

    ctx.beginPath();
    // Draw hexagon instead of circle for blockchain feel
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

  // Add circuit lines (tech aesthetic)
  ctx.strokeStyle = `rgba(243, 186, 47, 0.08)`; // Lighter BNB Gold
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    const x1 = Math.random() * 1200;
    const y1 = Math.random() * 675;
    const x2 = x1 + (Math.random() * 200 - 100);
    const y2 = y1 + (Math.random() * 200 - 100);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Add HypeAI logo (OFFICIAL LOGO - see docs/OFFICIAL_LOGO_PATH.md)
  try {
    const logo = await loadImage('./website/logo-icon-only.svg');
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

  // Category badge with BNB Chain styling
  const categoryText = tweetData.category.toUpperCase();
  ctx.fillStyle = BRAND_COLORS.darkCard;
  ctx.globalAlpha = 0.95;
  ctx.fillRect(50, 550, 300, 80);
  ctx.globalAlpha = 1.0;

  // BNB Gold text for category
  ctx.fillStyle = BRAND_COLORS.gold;
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText(categoryText, 70, 600);

  // HypeAI watermark with BNB Chain branding
  ctx.fillStyle = BRAND_COLORS.gold;
  ctx.font = 'bold 60px sans-serif';
  ctx.fillText('HypeAI', 50, 320);

  ctx.fillStyle = BRAND_COLORS.lightGray;
  ctx.font = '28px sans-serif';
  ctx.fillText('Built on BNB Chain', 50, 360);

  // Add BNB Chain themed elements
  ctx.strokeStyle = `rgba(243, 186, 47, 0.3)`; // BNB Gold
  ctx.lineWidth = 3;

  // Blockchain network visualization (nodes and connections)
  const nodes = [];
  for (let i = 0; i < 8; i++) {
    nodes.push({
      x: 900 + Math.random() * 250,
      y: 100 + Math.random() * 500
    });
  }

  // Draw connections between nodes
  for (let i = 0; i < nodes.length - 1; i++) {
    ctx.beginPath();
    ctx.moveTo(nodes[i].x, nodes[i].y);
    ctx.lineTo(nodes[i + 1].x, nodes[i + 1].y);
    ctx.stroke();
  }

  // Draw nodes with BNB gold
  for (const node of nodes) {
    ctx.fillStyle = BRAND_COLORS.gold;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Add glow effect
    ctx.strokeStyle = `rgba(243, 186, 47, 0.4)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Save image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);

  console.log(`   ✅ Generated: ${filename}`);
  return filename;
}

/**
 * Download BNB Chain themed image from Unsplash
 * Enhanced with color filters to match BNB Chain aesthetic
 */
async function downloadFromUnsplash(query, tweetId) {
  // Enhance query with BNB Chain keywords
  const bnbEnhancedQuery = `${query} blockchain technology gold black`;
  console.log(`📥 Downloading from Unsplash: "${bnbEnhancedQuery}"`);

  const filename = `${MEDIA_DIR}/tweet-${tweetId}-unsplash.jpg`;

  // Check if already downloaded
  if (fs.existsSync(filename)) {
    console.log(`   ✅ Using cached image: ${filename}`);
    return filename;
  }

  try {
    const searchUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(bnbEnhancedQuery)}&orientation=landscape&color=yellow&client_id=${UNSPLASH_ACCESS_KEY}`;

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

  // Media strategy based on category - BNB Chain themed
  const strategies = {
    introduction: { type: 'generate', query: 'BNB Chain blockchain technology gold' },
    features: { type: 'generate', query: 'BNB Chain DeFi features blockchain' },
    community: { type: 'generate', query: 'blockchain community BNB ecosystem' },
    education: { type: 'generate', query: 'blockchain education DeFi learning' },
    launch: { type: 'generate', query: 'BNB Chain launch announcement gold' },
    technical: { type: 'generate', query: 'blockchain technology smart contracts' },
    engagement: { type: 'generate', query: 'BNB Chain community engagement' },
    viral: { type: 'generate', query: 'crypto meme professional BNB Chain' }
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
