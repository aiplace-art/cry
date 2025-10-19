#!/usr/bin/env node

/**
 * BNB Chain Template Generator
 * Creates all category templates in BNB Chain style
 */

import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

const TEMPLATES_DIR = './scripts/twitter-media/bnb-templates';
if (!fs.existsSync(TEMPLATES_DIR)) {
  fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
}

// BNB Chain Brand Colors
const COLORS = {
  gold: '#F3BA2F',      // PRIMARY: Binance/BNB Yellow Gold
  black: '#000000',     // SECONDARY: Pure Black
  white: '#FFFFFF',     // TERTIARY: Pure White
  darkBg: '#1E2329',    // Dark Gray Background
  darkCard: '#0B0E11',  // Deeper Black
  lightGray: '#EAECEF', // Light Gray Text
  darkGold: '#F0B90B',  // Darker Gold (Hover)
  lightGold: '#FCD535'  // Lighter Gold (Highlights)
};

/**
 * Generate template for specific category
 */
async function generateTemplate(category, config) {
  console.log(`\n🎨 Generating ${category} template...`);

  const canvas = createCanvas(1200, 675);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 1200, 675);
  gradient.addColorStop(0, config.gradientStart);
  gradient.addColorStop(1, config.gradientEnd);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 675);

  // Add hexagonal pattern overlay
  ctx.strokeStyle = `rgba(243, 186, 47, ${config.patternOpacity || 0.12})`;
  ctx.lineWidth = 2;

  for (let i = 0; i < config.patternDensity; i++) {
    const x = Math.random() * 1200;
    const y = Math.random() * 675;
    const size = Math.random() * 100 + 50;

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

  // Add circuit lines
  ctx.strokeStyle = `rgba(243, 186, 47, 0.08)`;
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

  // Try to load HypeAI logo
  try {
    const logo = await loadImage('./website/logo-icon-only.svg');
    const logoSize = 180;
    ctx.drawImage(logo, 60, 60, logoSize, logoSize);
  } catch (error) {
    // If logo not found, draw a placeholder
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(150, 150, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.black;
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText('H', 130, 170);
  }

  // Category badge
  ctx.fillStyle = COLORS.darkCard;
  ctx.globalAlpha = 0.95;
  ctx.fillRect(60, 520, 380, 95);
  ctx.globalAlpha = 1.0;

  // Category text in BNB gold
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 48px sans-serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 15;
  ctx.fillText(category.toUpperCase(), 85, 580);

  // HypeAI branding
  ctx.shadowBlur = 20;
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 72px sans-serif';
  ctx.fillText('HypeAI', 60, 330);

  ctx.shadowBlur = 10;
  ctx.fillStyle = COLORS.lightGray;
  ctx.font = '32px sans-serif';
  ctx.fillText('Built on BNB Chain', 60, 380);

  // Add blockchain network nodes
  const nodes = [];
  for (let i = 0; i < 10; i++) {
    nodes.push({
      x: 750 + Math.random() * 400,
      y: 100 + Math.random() * 500
    });
  }

  // Draw connections
  ctx.strokeStyle = `rgba(243, 186, 47, 0.3)`;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  for (let i = 0; i < nodes.length - 1; i++) {
    if (Math.random() > 0.5) {
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y);
      ctx.lineTo(nodes[i + 1].x, nodes[i + 1].y);
      ctx.stroke();
    }
  }

  // Draw nodes
  for (const node of nodes) {
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(243, 186, 47, 0.5)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Add category-specific icon/text overlay
  if (config.overlayText) {
    ctx.fillStyle = `rgba(243, 186, 47, 0.15)`;
    ctx.font = 'bold 180px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(config.overlayText, 1100, 400);
  }

  // Save
  const filename = `${TEMPLATES_DIR}/${category}.png`;
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);

  console.log(`   ✅ Saved: ${filename}`);
  return filename;
}

/**
 * Generate all templates
 */
async function generateAllTemplates() {
  console.log('🚀 BNB CHAIN TEMPLATE GENERATOR');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const templates = {
    technical: {
      gradientStart: COLORS.darkCard,
      gradientEnd: COLORS.darkBg,
      patternDensity: 20,
      patternOpacity: 0.15,
      overlayText: '</>'
    },
    features: {
      gradientStart: COLORS.black,
      gradientEnd: COLORS.gold,
      patternDensity: 15,
      patternOpacity: 0.12,
      overlayText: '★'
    },
    community: {
      gradientStart: COLORS.darkBg,
      gradientEnd: COLORS.gold,
      patternDensity: 18,
      patternOpacity: 0.10,
      overlayText: '◆'
    },
    education: {
      gradientStart: COLORS.darkBg,
      gradientEnd: COLORS.black,
      patternDensity: 12,
      patternOpacity: 0.08,
      overlayText: '?'
    },
    launch: {
      gradientStart: COLORS.gold,
      gradientEnd: COLORS.darkGold,
      patternDensity: 25,
      patternOpacity: 0.20,
      overlayText: '→'
    },
    engagement: {
      gradientStart: COLORS.gold,
      gradientEnd: COLORS.black,
      patternDensity: 15,
      patternOpacity: 0.12,
      overlayText: '♦'
    },
    viral: {
      gradientStart: COLORS.lightGold,
      gradientEnd: COLORS.gold,
      patternDensity: 16,
      patternOpacity: 0.10,
      overlayText: '⚡'
    },
    introduction: {
      gradientStart: COLORS.gold,
      gradientEnd: COLORS.black,
      patternDensity: 14,
      patternOpacity: 0.12,
      overlayText: '▶'
    }
  };

  const results = [];
  for (const [category, config] of Object.entries(templates)) {
    try {
      const path = await generateTemplate(category, config);
      results.push({ category, status: 'success', path });
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      results.push({ category, status: 'failed', error: error.message });
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ TEMPLATE GENERATION COMPLETE\n');

  console.log('📊 Summary:');
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  console.log(`   ✅ Success: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📁 Location: ${TEMPLATES_DIR}/`);

  console.log('\n📋 Templates Created:');
  results.forEach(r => {
    if (r.status === 'success') {
      console.log(`   ✅ ${r.category}.png`);
    }
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run
generateAllTemplates().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
