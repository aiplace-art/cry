#!/usr/bin/env node

/**
 * Test suite for Professional Image Generator
 * Validates all image generation styles
 */

import ProfessionalImageGenerator from './twitter-media/professional-image-generator.js';
import CacheManager from './twitter-media/cache-manager.js';
import fs from 'fs';

async function test() {
  console.log('🧪 TESTING PROFESSIONAL IMAGE GENERATOR\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const generator = new ProfessionalImageGenerator();
  const cache = new CacheManager();
  let passed = 0;
  let failed = 0;

  // Test 1: Minimalist Style
  try {
    console.log('1️⃣  Testing Minimalist Style...');
    const minimal = await generator.generateMinimalist({
      title: 'HypeAI Launches on BNB Chain',
      subtitle: '42 AI Agents | Fair Launch Nov 15'
    });
    fs.writeFileSync('/tmp/test-minimalist.png', minimal);
    console.log('   ✅ Saved to /tmp/test-minimalist.png');
    console.log(`   📊 Size: ${(minimal.length / 1024).toFixed(2)} KB\n`);
    passed++;
  } catch (error) {
    console.error('   ❌ FAILED:', error.message, '\n');
    failed++;
  }

  // Test 2: Tech Gradient Style
  try {
    console.log('2️⃣  Testing Tech Gradient Style...');
    const tech = await generator.generateTechGradient({
      title: 'AI-Powered DeFi',
      subtitle: 'The Future is Here'
    });
    fs.writeFileSync('/tmp/test-tech-gradient.png', tech);
    console.log('   ✅ Saved to /tmp/test-tech-gradient.png');
    console.log(`   📊 Size: ${(tech.length / 1024).toFixed(2)} KB\n`);
    passed++;
  } catch (error) {
    console.error('   ❌ FAILED:', error.message, '\n');
    failed++;
  }

  // Test 3: Service Showcase Style
  try {
    console.log('3️⃣  Testing Service Showcase Style...');
    const service = await generator.generateServiceShowcase({
      name: 'Social Media Automation',
      icon: '🤖',
      description: 'Automate Twitter, LinkedIn, Instagram with AI agents. Save 10+ hours per week.',
      price: 'From $299/mo'
    });
    fs.writeFileSync('/tmp/test-service.png', service);
    console.log('   ✅ Saved to /tmp/test-service.png');
    console.log(`   📊 Size: ${(service.length / 1024).toFixed(2)} KB\n`);
    passed++;
  } catch (error) {
    console.error('   ❌ FAILED:', error.message, '\n');
    failed++;
  }

  // Test 4: Meme Style
  try {
    console.log('4️⃣  Testing Meme Style...');
    const meme = await generator.generateMeme({
      topText: 'WHEN YOU FIND',
      bottomText: 'HYPEAI ON BNB CHAIN'
    });
    fs.writeFileSync('/tmp/test-meme.png', meme);
    console.log('   ✅ Saved to /tmp/test-meme.png');
    console.log(`   📊 Size: ${(meme.length / 1024).toFixed(2)} KB\n`);
    passed++;
  } catch (error) {
    console.error('   ❌ FAILED:', error.message, '\n');
    failed++;
  }

  // Test 5: Data Visualization Style
  try {
    console.log('5️⃣  Testing Data Visualization Style...');
    const dataViz = await generator.generateDataViz({
      title: 'HypeAI Analytics',
      stats: [
        { label: 'Total Value Locked', value: '$1.2M' },
        { label: 'Active Users', value: '5,000+' },
        { label: 'Transactions', value: '50K+' }
      ]
    });
    fs.writeFileSync('/tmp/test-dataviz.png', dataViz);
    console.log('   ✅ Saved to /tmp/test-dataviz.png');
    console.log(`   📊 Size: ${(dataViz.length / 1024).toFixed(2)} KB\n`);
    passed++;
  } catch (error) {
    console.error('   ❌ FAILED:', error.message, '\n');
    failed++;
  }

  // Test 6: Cache Manager
  try {
    console.log('6️⃣  Testing Cache Manager...');
    const testData = { title: 'Test', category: 'test' };
    const testStyle = 'minimalist';
    const cacheKey = cache.getCacheKey(testData, testStyle);

    // Set cache
    const testBuffer = Buffer.from('test image data');
    cache.set(cacheKey, testBuffer);

    // Get cache
    const cached = cache.get(cacheKey);
    if (cached && cached.toString() === 'test image data') {
      console.log('   ✅ Cache set/get works correctly');
      const stats = cache.getStats();
      console.log(`   📊 Cache stats: ${stats.count} files, ${stats.totalSizeMB} MB\n`);
      passed++;
    } else {
      throw new Error('Cache data mismatch');
    }
  } catch (error) {
    console.error('   ❌ FAILED:', error.message, '\n');
    failed++;
  }

  // Final Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TEST RESULTS\n');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('\n💾 Generated images saved to /tmp/test-*.png');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.log('⚠️  SOME TESTS FAILED\n');
    process.exit(1);
  }
}

test().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
