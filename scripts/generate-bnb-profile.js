#!/usr/bin/env node

/**
 * BNB Chain Profile Assets Generator
 * Creates Twitter profile avatar and banner in BNB Chain style
 */

import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

const MEDIA_DIR = './scripts/twitter-media';
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

const COLORS = {
  gold: '#F3BA2F',
  black: '#000000',
  white: '#FFFFFF',
  darkBg: '#1E2329',
  darkCard: '#0B0E11',
  lightGray: '#EAECEF',
  darkGold: '#F0B90B'
};

/**
 * Generate profile avatar (400x400)
 */
async function generateAvatar() {
  console.log('🎨 Generating BNB Chain profile avatar...');

  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext('2d');

  // Radial gradient background (gold to black)
  const gradient = ctx.createRadialGradient(200, 200, 50, 200, 200, 200);
  gradient.addColorStop(0, COLORS.gold);
  gradient.addColorStop(1, COLORS.black);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 400, 400);

  // Add hexagon pattern
  ctx.strokeStyle = 'rgba(243, 186, 47, 0.15)';
  ctx.lineWidth = 2;

  for (let i = 0; i < 12; i++) {
    const x = 200 + Math.cos(i * Math.PI / 6) * (80 + i * 10);
    const y = 200 + Math.sin(i * Math.PI / 6) * (80 + i * 10);
    const size = 40 + i * 5;

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

  // Try to load logo
  try {
    const logo = await loadImage('./website/logo-icon-only.svg');
    ctx.drawImage(logo, 100, 100, 200, 200);
  } catch (error) {
    // Fallback: Draw stylized "H"
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 200px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 20;
    ctx.fillText('H', 200, 210);
  }

  // Add border
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(200, 200, 194, 0, Math.PI * 2);
  ctx.stroke();

  const filename = `${MEDIA_DIR}/avatar-bnb.png`;
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);

  console.log(`   ✅ Saved: ${filename}`);
  return filename;
}

/**
 * Generate profile banner (1500x500)
 */
async function generateBanner() {
  console.log('🎨 Generating BNB Chain profile banner...');

  const canvas = createCanvas(1500, 500);
  const ctx = canvas.getContext('2d');

  // Horizontal gradient
  const gradient = ctx.createLinearGradient(0, 0, 1500, 0);
  gradient.addColorStop(0, COLORS.black);
  gradient.addColorStop(0.3, COLORS.darkBg);
  gradient.addColorStop(0.6, COLORS.gold);
  gradient.addColorStop(1, COLORS.darkGold);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1500, 500);

  // Add hexagon pattern
  ctx.strokeStyle = 'rgba(243, 186, 47, 0.12)';
  ctx.lineWidth = 2;

  for (let i = 0; i < 25; i++) {
    const x = Math.random() * 1500;
    const y = Math.random() * 500;
    const size = Math.random() * 60 + 30;

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
  ctx.strokeStyle = 'rgba(243, 186, 47, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 40; i++) {
    const x1 = Math.random() * 1500;
    const y1 = Math.random() * 500;
    const x2 = x1 + (Math.random() * 150 - 75);
    const y2 = y1 + (Math.random() * 150 - 75);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Try to load logo
  try {
    const logo = await loadImage('./website/logo-icon-only.svg');
    ctx.drawImage(logo, 80, 150, 200, 200);
  } catch (error) {
    // Fallback
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(180, 250, 80, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main text
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 110px sans-serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 25;
  ctx.fillText('HypeAI', 320, 220);

  ctx.fillStyle = COLORS.lightGray;
  ctx.font = '42px sans-serif';
  ctx.shadowBlur = 15;
  ctx.fillText('15 AI Agents • Built on BNB Chain • Fair Launch', 320, 290);

  ctx.font = 'bold 36px sans-serif';
  ctx.fillStyle = COLORS.white;
  ctx.fillText('Where Hype Meets Intelligence', 320, 340);

  // Blockchain nodes network on right
  const nodes = [];
  for (let i = 0; i < 15; i++) {
    nodes.push({
      x: 1100 + Math.random() * 350,
      y: 50 + Math.random() * 400
    });
  }

  ctx.strokeStyle = 'rgba(243, 186, 47, 0.35)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  for (let i = 0; i < nodes.length - 1; i++) {
    if (Math.random() > 0.4) {
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y);
      ctx.lineTo(nodes[i + 1].x, nodes[i + 1].y);
      ctx.stroke();
    }
  }

  for (const node of nodes) {
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(243, 186, 47, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
    ctx.stroke();
  }

  const filename = `${MEDIA_DIR}/banner-bnb.png`;
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);

  console.log(`   ✅ Saved: ${filename}`);
  return filename;
}

/**
 * Generate all profile assets
 */
async function generateAllProfileAssets() {
  console.log('🚀 BNB CHAIN PROFILE ASSETS GENERATOR');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    await generateAvatar();
    await generateBanner();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PROFILE ASSETS GENERATION COMPLETE\n');
    console.log('📁 Files created:');
    console.log(`   • ${MEDIA_DIR}/avatar-bnb.png (400x400)`);
    console.log(`   • ${MEDIA_DIR}/banner-bnb.png (1500x500)`);
    console.log('\n📋 Next steps:');
    console.log('   1. Upload avatar-bnb.png as Twitter profile picture');
    console.log('   2. Upload banner-bnb.png as Twitter header banner');
    console.log('   3. Update profile colors to match BNB gold (#F3BA2F)');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run
generateAllProfileAssets();
