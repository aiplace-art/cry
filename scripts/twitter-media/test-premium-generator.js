#!/usr/bin/env node

/**
 * Test Premium Image Generator - Generate all 5 styles
 *
 * Usage: node test-premium-generator.js
 */

import PremiumImageGenerator from './premium-image-generator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testAllStyles() {
  console.log('🎨 Testing Premium Image Generator...\n');

  const generator = new PremiumImageGenerator();
  const outputDir = path.join(__dirname, 'outputs');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // 1. GLASSMORPHISM
    console.log('1️⃣  Generating Glassmorphism style...');
    const glass = await generator.generateGlassmorphism({
      title: 'HypeAI Premium',
      subtitle: 'AI-Powered DeFi on BNB Chain',
      stats: '10,000+ Users | $5M TVL'
    });
    const glassPath = path.join(outputDir, 'glassmorphism.png');
    fs.writeFileSync(glassPath, glass);
    console.log(`✅ Saved: ${glassPath}\n`);

    // 2. 3D GRADIENT
    console.log('2️⃣  Generating 3D Gradient style...');
    const gradient3d = await generator.generate3DGradient({
      title: 'HYPEAI FEATURES',
      subtitle: 'Next-Generation DeFi Platform',
      highlight: 'Launching Q1 2025'
    });
    const gradientPath = path.join(outputDir, '3d-gradient.png');
    fs.writeFileSync(gradientPath, gradient3d);
    console.log(`✅ Saved: ${gradientPath}\n`);

    // 3. NEON CYBERPUNK
    console.log('3️⃣  Generating Neon Cyberpunk style...');
    const neon = await generator.generateNeonCyberpunk({
      title: 'HYPEAI',
      subtitle: 'The Future of DeFi',
      tagline: 'POWERED BY BNB CHAIN'
    });
    const neonPath = path.join(outputDir, 'neon-cyberpunk.png');
    fs.writeFileSync(neonPath, neon);
    console.log(`✅ Saved: ${neonPath}\n`);

    // 4. ABSTRACT GEOMETRIC
    console.log('4️⃣  Generating Abstract Geometric style...');
    const abstract = await generator.generateAbstractGeo({
      title: 'HypeAI Community',
      subtitle: 'Join the Revolution',
      stats: '5,000+ Members Worldwide'
    });
    const abstractPath = path.join(outputDir, 'abstract-geometric.png');
    fs.writeFileSync(abstractPath, abstract);
    console.log(`✅ Saved: ${abstractPath}\n`);

    // 5. CINEMATIC
    console.log('5️⃣  Generating Cinematic style...');
    const cinematic = await generator.generateCinematic({
      title: 'HYPEAI LAUNCH',
      subtitle: 'The Revolution Begins',
      date: 'Q1 2025'
    });
    const cinematicPath = path.join(outputDir, 'cinematic.png');
    fs.writeFileSync(cinematicPath, cinematic);
    console.log(`✅ Saved: ${cinematicPath}\n`);

    console.log('🎉 SUCCESS! All 5 premium styles generated!\n');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log('\n📊 Generated files:');
    console.log('   1. glassmorphism.png - Frosted glass effect');
    console.log('   2. 3d-gradient.png - Multi-layered depth');
    console.log('   3. neon-cyberpunk.png - Glowing futuristic');
    console.log('   4. abstract-geometric.png - Modern patterns');
    console.log('   5. cinematic.png - Movie poster quality');
    console.log('\n💡 Use these images for Twitter posts with high engagement!\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testAllStyles();
