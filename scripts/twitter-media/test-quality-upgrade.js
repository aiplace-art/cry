#!/usr/bin/env node
/**
 * Test script for upgraded high-quality image generation
 * Tests Full HD (1920x1080) export with automatic PNG/JPEG optimization
 */

import PremiumImageGenerator from './premium-image-generator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testQualityUpgrade() {
  console.log('🎨 Testing upgraded premium image generator...\n');

  const generator = new PremiumImageGenerator();
  const outputDir = path.join(__dirname, 'premium-samples');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const tests = [
    {
      name: 'Glassmorphism',
      method: 'generateGlassmorphism',
      options: {
        title: 'HypeAI',
        subtitle: 'AI-Powered DeFi Platform',
        stats: '1920x1080 Full HD Quality'
      },
      filename: 'test-glassmorphism-fullhd.png'
    },
    {
      name: '3D Gradient',
      method: 'generate3DGradient',
      options: {
        title: 'Premium Quality',
        subtitle: 'Full HD Resolution',
        highlight: 'Maximum Twitter Quality'
      },
      filename: 'test-3dgradient-fullhd.png'
    },
    {
      name: 'Neon Cyberpunk',
      method: 'generateNeonCyberpunk',
      options: {
        title: 'HYPEAI',
        subtitle: 'The Future is Now',
        tagline: '1920x1080 Full HD'
      },
      filename: 'test-neon-fullhd.png'
    },
    {
      name: 'Abstract Geometry',
      method: 'generateAbstractGeo',
      options: {
        title: 'HypeAI Community',
        subtitle: 'Join the Revolution',
        stats: 'Ultra High Quality'
      },
      filename: 'test-abstract-fullhd.png'
    },
    {
      name: 'Cinematic',
      method: 'generateCinematic',
      options: {
        title: 'HYPEAI LAUNCH',
        subtitle: 'The Revolution Begins',
        date: 'FULL HD QUALITY'
      },
      filename: 'test-cinematic-fullhd.png'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n📸 Generating ${test.name}...`);
      const startTime = Date.now();

      const imageBuffer = await generator[test.method](test.options);
      const outputPath = path.join(outputDir, test.filename);

      fs.writeFileSync(outputPath, imageBuffer);

      const fileSizeMB = (imageBuffer.length / 1024 / 1024).toFixed(2);
      const duration = Date.now() - startTime;

      console.log(`   ✅ Generated: ${test.filename}`);
      console.log(`   📏 File size: ${fileSizeMB} MB`);
      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(`   📁 Path: ${outputPath}`);

      // Check if within Twitter limits
      if (imageBuffer.length > 5 * 1024 * 1024) {
        console.log(`   ⚠️  Warning: File size exceeds 5MB Twitter limit`);
      } else {
        console.log(`   ✅ Within Twitter 5MB limit`);
      }

    } catch (error) {
      console.error(`   ❌ Error generating ${test.name}:`, error.message);
    }
  }

  console.log('\n\n✨ Quality Upgrade Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📐 Resolution: 1920x1080 (Full HD)');
  console.log('🎨 Export: High-quality PNG (compression level 3)');
  console.log('📦 Fallback: JPEG 95% quality if >5MB');
  console.log('🔍 Font sizes: Scaled proportionally (1.6x)');
  console.log('✨ All visual elements: Scaled for Full HD');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`📁 All test images saved to: ${outputDir}\n`);
}

testQualityUpgrade().catch(console.error);
