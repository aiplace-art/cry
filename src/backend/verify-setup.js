#!/usr/bin/env node

/**
 * Backend Setup Verification Script
 * Checks that all required files and dependencies are in place
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Backend Setup Verification\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// Required files
const requiredFiles = [
  'server.js',
  'package.json',
  '.env.example',
  'config/database.js',
  'config/logger.js',
  'middleware/auth.js',
  'middleware/errorHandler.js',
  'middleware/rateLimiter.js',
  'middleware/validation.js',
  'models/User.js',
  'models/Stake.js',
  'models/Transaction.js',
  'models/TokenPrice.js',
  'models/AIPrediction.js',
  'controllers/auth.controller.js',
  'controllers/staking.controller.js',
  'controllers/token.controller.js',
  'controllers/transaction.controller.js',
  'controllers/analytics.controller.js',
  'controllers/ai.controller.js',
  'services/staking.service.js',
  'services/token.service.js',
  'services/transaction.service.js',
  'services/analytics.service.js',
  'services/ai.service.js',
  'routes/auth.routes.js',
  'routes/staking.routes.js',
  'routes/token.routes.js',
  'routes/transaction.routes.js',
  'routes/analytics.routes.js',
  'routes/ai.routes.js',
  'websocket/wsServer.js'
];

console.log('📁 Checking required files...\n');

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
    checks.passed++;
  } else {
    console.log(`❌ ${file} - MISSING`);
    checks.failed++;
  }
});

// Check .env file
console.log('\n⚙️  Checking environment configuration...\n');

if (fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('✅ .env file exists');
  checks.passed++;
} else {
  console.log('⚠️  .env file not found - copy .env.example to .env');
  checks.warnings++;
}

// Check package.json dependencies
console.log('\n📦 Checking package.json...\n');

try {
  const packageJson = require('./package.json');
  const requiredDeps = [
    'express', 'mongoose', 'ethers', 'jsonwebtoken',
    'ws', 'cors', 'helmet', 'winston', 'joi'
  ];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}`);
      checks.passed++;
    } else {
      console.log(`❌ ${dep} - MISSING`);
      checks.failed++;
    }
  });
} catch (error) {
  console.log('❌ package.json not found or invalid');
  checks.failed++;
}

// Check directories
console.log('\n📂 Checking directories...\n');

const requiredDirs = [
  'config', 'middleware', 'models', 'controllers',
  'services', 'routes', 'websocket', 'logs'
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`✅ ${dir}/`);
    checks.passed++;
  } else {
    console.log(`❌ ${dir}/ - MISSING`);
    checks.failed++;
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Verification Summary\n');
console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);

if (checks.failed === 0 && checks.warnings === 0) {
  console.log('\n✨ All checks passed! Backend is ready to run.\n');
  console.log('Next steps:');
  console.log('1. Copy .env.example to .env and configure');
  console.log('2. Run: npm install');
  console.log('3. Start MongoDB: mongod');
  console.log('4. Run: npm run dev\n');
  process.exit(0);
} else if (checks.failed === 0) {
  console.log('\n⚠️  Setup incomplete but no critical errors.\n');
  console.log('Please review warnings above.\n');
  process.exit(0);
} else {
  console.log('\n❌ Setup verification failed!\n');
  console.log('Please review errors above and ensure all files are in place.\n');
  process.exit(1);
}
