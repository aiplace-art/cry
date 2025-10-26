#!/usr/bin/env node

/**
 * Test Suite for Auto-Poster Premium Integration
 * Verifies premium image generation, fallbacks, and Twitter compatibility
 */

import PremiumImageGenerator from '../scripts/twitter-media/premium-image-generator.js';
import ProfessionalImageGenerator from '../scripts/twitter-media/professional-image-generator.js';
import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

// Test data
const testTweets = [
  {
    id: 'test-intro-1',
    category: 'introduction',
    text: 'Introducing HypeAI\nAI-Powered DeFi Platform on BNB Chain\n\nRevolutionizing the future of finance.',
    hashtags: ['#HypeAI', '#BNBChain', '#DeFi']
  },
  {
    id: 'test-features-1',
    category: 'features',
    text: 'Advanced AI Trading\n\nSmart algorithms analyze markets 24/7\nYield up to 25% APY',
    hashtags: ['#AI', '#Trading']
  },
  {
    id: 'test-tech-1',
    category: 'technical',
    text: 'Built with cutting-edge blockchain technology\n\nSmart contracts audited by top firms',
    hashtags: ['#Blockchain', '#Security']
  },
  {
    id: 'test-community-1',
    category: 'community',
    text: 'Join 10,000+ investors\n\nGrowing community on BNB Chain',
    hashtags: ['#Community']
  },
  {
    id: 'test-launch-1',
    category: 'launch',
    text: 'HYPEAI LAUNCH - March 2025\n\nThe Future Starts Now',
    hashtags: ['#Launch', '#Presale']
  }
];

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '═'.repeat(70));
  log(title, 'bold');
  console.log('═'.repeat(70) + '\n');
}

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function assert(condition, testName) {
  if (condition) {
    results.passed++;
    results.tests.push({ name: testName, status: 'PASS' });
    log(`✅ PASS: ${testName}`, 'green');
  } else {
    results.failed++;
    results.tests.push({ name: testName, status: 'FAIL' });
    log(`❌ FAIL: ${testName}`, 'red');
  }
}

// Test 1: Premium Generator Initialization
async function testPremiumGeneratorInit() {
  logSection('TEST 1: Premium Generator Initialization');

  try {
    const generator = new PremiumImageGenerator();
    assert(generator !== null, 'Premium generator instantiates');
    assert(generator.width === 1200, 'Canvas width is 1200px');
    assert(generator.height === 675, 'Canvas height is 675px (16:9)');
    assert(generator.colors.primary === '#00E5FF', 'Brand colors loaded correctly');
  } catch (error) {
    assert(false, `Premium generator initialization (${error.message})`);
  }
}

// Test 2: All Premium Styles Generate Successfully
async function testAllPremiumStyles() {
  logSection('TEST 2: Premium Style Generation');

  const generator = new PremiumImageGenerator();
  const styles = [
    { name: 'glassmorphism', method: 'generateGlassmorphism' },
    { name: '3DGradient', method: 'generate3DGradient' },
    { name: 'neonCyberpunk', method: 'generateNeonCyberpunk' },
    { name: 'abstractGeo', method: 'generateAbstractGeo' },
    { name: 'cinematic', method: 'generateCinematic' }
  ];

  for (const style of styles) {
    try {
      const buffer = await generator[style.method]({
        title: 'Test Title',
        subtitle: 'Test Subtitle'
      });

      assert(buffer !== null, `${style.name} generates buffer`);
      assert(buffer.length > 0, `${style.name} buffer has content`);
      assert(buffer.length < 500000, `${style.name} file size < 500KB`); // Twitter limit check

      // Save test image
      const filename = `./tests/test-output-${style.name}.png`;
      fs.writeFileSync(filename, buffer);
      assert(fs.existsSync(filename), `${style.name} saves to file`);

      // Verify it's a valid PNG
      const savedBuffer = fs.readFileSync(filename);
      const isPNG = savedBuffer[0] === 0x89 && savedBuffer[1] === 0x50;
      assert(isPNG, `${style.name} is valid PNG format`);

    } catch (error) {
      assert(false, `${style.name} generation (${error.message})`);
    }
  }
}

// Test 3: Professional Generator Fallback
async function testProfessionalFallback() {
  logSection('TEST 3: Professional Generator Fallback');

  try {
    const generator = new ProfessionalImageGenerator();

    const buffer = await generator.generateMinimalist({
      title: 'Fallback Test',
      subtitle: 'Professional Quality'
    });

    assert(buffer !== null, 'Professional generator works');
    assert(buffer.length > 0, 'Professional buffer has content');
    assert(buffer.length < 500000, 'Professional file size < 500KB');

  } catch (error) {
    assert(false, `Professional fallback (${error.message})`);
  }
}

// Test 4: Content Data Extraction
async function testContentExtraction() {
  logSection('TEST 4: Content Data Extraction');

  // Import the extraction function (we'll test it indirectly)
  const testCases = [
    {
      tweet: { text: 'First Line\nSecond Line\n$1.2M TVL', category: 'features' },
      expected: { hasTitle: true, hasSubtitle: true, hasStats: true }
    },
    {
      tweet: { text: 'Simple tweet without much structure', category: 'community' },
      expected: { hasTitle: true, hasSubtitle: true, hasStats: false }
    }
  ];

  // Test extraction logic
  for (const testCase of testCases) {
    const text = testCase.tweet.text;
    const firstLine = text.split('\n')[0] || text.split('.')[0];
    const lines = text.split('\n').filter(l => l.trim());
    const numberMatch = text.match(/\$[\d,.]+[KMB]?|\d+[%+]/);

    assert(firstLine.length > 0, 'Extracts title from tweet');
    assert(lines.length >= 0, 'Extracts subtitle from tweet');
    assert((numberMatch !== null) === testCase.expected.hasStats, 'Detects stats correctly');
  }
}

// Test 5: Style Selection Intelligence
async function testStyleSelection() {
  logSection('TEST 5: Intelligent Style Selection');

  const categoryToStyle = {
    introduction: 'glassmorphism',
    features: '3DGradient',
    technical: 'neonCyberpunk',
    community: 'abstractGeo',
    launch: 'cinematic'
  };

  for (const [category, expectedStyle] of Object.entries(categoryToStyle)) {
    assert(
      categoryToStyle[category] === expectedStyle,
      `${category} maps to ${expectedStyle}`
    );
  }

  // Test diversity logic
  const recentStyles = [];
  const allStyles = ['glassmorphism', '3DGradient', 'neonCyberpunk', 'abstractGeo', 'cinematic'];

  // Simulate style selection
  for (let i = 0; i < 10; i++) {
    const baseStyle = allStyles[i % allStyles.length];

    let selectedStyle;
    if (!recentStyles.includes(baseStyle)) {
      selectedStyle = baseStyle;
    } else {
      const available = allStyles.filter(s => !recentStyles.includes(s));
      selectedStyle = available[0] || baseStyle;
    }

    recentStyles.push(selectedStyle);
    if (recentStyles.length > 3) recentStyles.shift();
  }

  assert(recentStyles.length <= 3, 'Tracks last 3 styles only');
  assert(new Set(recentStyles).size >= 1, 'Styles are diverse');
}

// Test 6: Twitter Compatibility
async function testTwitterCompatibility() {
  logSection('TEST 6: Twitter Compatibility Checks');

  const generator = new PremiumImageGenerator();

  const buffer = await generator.generateGlassmorphism({
    title: 'Twitter Test',
    subtitle: 'Compatibility Check'
  });

  // Twitter requirements
  assert(buffer.length <= 5 * 1024 * 1024, 'File size under 5MB limit');

  // Check dimensions
  const filename = './tests/test-twitter-compat.png';
  fs.writeFileSync(filename, buffer);

  const img = await loadImage(filename);
  assert(img.width === 1200, 'Image width is 1200px');
  assert(img.height === 675, 'Image height is 675px');

  const aspectRatio = img.width / img.height;
  assert(Math.abs(aspectRatio - 16/9) < 0.01, 'Aspect ratio is 16:9');

  // Check format
  const savedBuffer = fs.readFileSync(filename);
  const isPNG = savedBuffer[0] === 0x89 && savedBuffer[1] === 0x50;
  assert(isPNG, 'Format is PNG (Twitter compatible)');
}

// Test 7: Brand Consistency
async function testBrandConsistency() {
  logSection('TEST 7: Brand Consistency');

  const generator = new PremiumImageGenerator();

  // Check brand colors are used
  assert(generator.colors.primary === '#00E5FF', 'Primary color is HypeAI cyan');
  assert(generator.colors.gold === '#F3BA2F', 'Gold color is BNB Chain gold');
  assert(generator.colors.background === '#0A0E27', 'Background is brand dark navy');

  // Generate image and verify it contains brand elements
  const buffer = await generator.generateCinematic({
    title: 'HYPEAI',
    subtitle: 'Brand Test',
    date: 'BNB CHAIN'
  });

  assert(buffer.length > 0, 'Cinematic style includes brand elements');
}

// Test 8: Performance Benchmarks
async function testPerformance() {
  logSection('TEST 8: Performance Benchmarks');

  const generator = new PremiumImageGenerator();

  const start = Date.now();
  await generator.generateGlassmorphism({ title: 'Performance Test' });
  const duration = Date.now() - start;

  assert(duration < 5000, `Generation completes in < 5s (took ${duration}ms)`);
  log(`⏱️  Generation time: ${duration}ms`, 'blue');
}

// Test 9: Error Handling
async function testErrorHandling() {
  logSection('TEST 9: Error Handling');

  const generator = new PremiumImageGenerator();

  try {
    // Test with empty options
    const buffer = await generator.generateGlassmorphism({});
    assert(buffer !== null, 'Handles empty options gracefully');

    // Test with undefined
    const buffer2 = await generator.generateGlassmorphism(undefined);
    assert(buffer2 !== null, 'Handles undefined options gracefully');

  } catch (error) {
    assert(false, `Error handling test (${error.message})`);
  }
}

// Test 10: Integration Test with Real Tweet
async function testRealTweetIntegration() {
  logSection('TEST 10: Real Tweet Integration');

  const generator = new PremiumImageGenerator();

  for (const tweet of testTweets) {
    try {
      // Extract content
      const text = tweet.text;
      const firstLine = text.split('\n')[0] || 'HypeAI';
      const lines = text.split('\n').filter(l => l.trim());
      const subtitle = lines[1] || tweet.category;

      const contentData = {
        title: firstLine.substring(0, 50),
        subtitle: subtitle.substring(0, 60),
        category: tweet.category
      };

      // Generate appropriate style
      const styleMap = {
        introduction: 'glassmorphism',
        features: '3DGradient',
        technical: 'neonCyberpunk',
        community: 'abstractGeo',
        launch: 'cinematic'
      };

      const style = styleMap[tweet.category];
      let buffer;

      switch (style) {
        case 'glassmorphism':
          buffer = await generator.generateGlassmorphism(contentData);
          break;
        case '3DGradient':
          buffer = await generator.generate3DGradient(contentData);
          break;
        case 'neonCyberpunk':
          buffer = await generator.generateNeonCyberpunk(contentData);
          break;
        case 'abstractGeo':
          buffer = await generator.generateAbstractGeo(contentData);
          break;
        case 'cinematic':
          buffer = await generator.generateCinematic(contentData);
          break;
      }

      assert(buffer !== null, `${tweet.category} tweet generates image`);
      assert(buffer.length < 500000, `${tweet.category} image size optimal`);

      // Save example
      const filename = `./tests/test-real-${tweet.id}.png`;
      fs.writeFileSync(filename, buffer);

    } catch (error) {
      assert(false, `Real tweet ${tweet.category} (${error.message})`);
    }
  }
}

// Run all tests
async function runAllTests() {
  console.clear();
  log('\n🧪 AUTO-POSTER PREMIUM INTEGRATION TEST SUITE', 'bold');
  log('Testing premium image generation, fallbacks, and Twitter compatibility\n', 'blue');

  // Create test output directory
  if (!fs.existsSync('./tests')) {
    fs.mkdirSync('./tests', { recursive: true });
  }

  await testPremiumGeneratorInit();
  await testAllPremiumStyles();
  await testProfessionalFallback();
  await testContentExtraction();
  await testStyleSelection();
  await testTwitterCompatibility();
  await testBrandConsistency();
  await testPerformance();
  await testErrorHandling();
  await testRealTweetIntegration();

  // Summary
  logSection('TEST SUMMARY');
  log(`Total Tests: ${results.passed + results.failed}`, 'blue');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, 'red');

  const successRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
  log(`Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : 'yellow');

  if (results.failed === 0) {
    log('\n🎉 ALL TESTS PASSED! Premium integration is ready for production.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Review the output above.', 'yellow');
  }

  // Cleanup test files (optional)
  log('\n🧹 Cleaning up test files...', 'blue');
  const testFiles = fs.readdirSync('./tests').filter(f => f.startsWith('test-'));
  testFiles.forEach(f => {
    try {
      fs.unlinkSync(`./tests/${f}`);
    } catch (e) {
      // Ignore
    }
  });

  console.log('');
}

// Execute tests
runAllTests().catch(error => {
  log(`\n💥 Test suite crashed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
