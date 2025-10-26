#!/usr/bin/env node

/**
 * Automation Setup Verification Script
 *
 * Checks that all components are properly configured and ready for production
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║         🔍 AUTOMATION SETUP VERIFICATION                      ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

let allGood = true;
const warnings = [];

// ============================================================================
// CHECK 1: Required Files Exist
// ============================================================================

console.log('📁 Checking required files...\n');

const requiredFiles = [
  { path: './scripts/twitter-scheduler.js', name: 'Twitter Scheduler' },
  { path: './scripts/auto-poster.js', name: 'Auto Poster' },
  { path: './scripts/check-posting-status.js', name: 'Status Monitor' },
  { path: './scripts/setup-cron.sh', name: 'Cron Setup' },
  { path: './scripts/.env.marketing', name: 'Environment Config' },
  { path: './scripts/twitter-content/tweets-bank.json', name: 'Content Bank' }
];

requiredFiles.forEach(({ path: filePath, name }) => {
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${name}: ${filePath}`);
  } else {
    console.log(`   ❌ ${name}: ${filePath} NOT FOUND`);
    allGood = false;
  }
});

// ============================================================================
// CHECK 2: Environment Variables
// ============================================================================

console.log('\n🔐 Checking environment variables...\n');

const envPath = './scripts/.env.marketing';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET'
  ];

  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=xxx`)) {
      console.log(`   ✅ ${varName} configured`);
    } else {
      console.log(`   ❌ ${varName} NOT configured or using placeholder`);
      allGood = false;
    }
  });
} else {
  console.log('   ❌ .env.marketing file not found');
  allGood = false;
}

// ============================================================================
// CHECK 3: Directories
// ============================================================================

console.log('\n📂 Checking directories...\n');

const requiredDirs = [
  { path: './logs', name: 'Logs directory' },
  { path: './data/project-coordination', name: 'Data directory' },
  { path: './scripts/twitter-media', name: 'Media directory' }
];

requiredDirs.forEach(({ path: dirPath, name }) => {
  if (fs.existsSync(dirPath)) {
    console.log(`   ✅ ${name}: ${dirPath}`);
  } else {
    console.log(`   ⚠️  ${name}: ${dirPath} NOT FOUND (will be created)`);
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`   ✅ Created: ${dirPath}`);
    } catch (error) {
      console.log(`   ❌ Failed to create: ${error.message}`);
      allGood = false;
    }
  }
});

// ============================================================================
// CHECK 4: File Permissions
// ============================================================================

console.log('\n🔒 Checking file permissions...\n');

const executableFiles = [
  './scripts/twitter-scheduler.js',
  './scripts/check-posting-status.js',
  './scripts/setup-cron.sh'
];

executableFiles.forEach(filePath => {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    console.log(`   ✅ ${filePath} is executable`);
  } catch {
    console.log(`   ⚠️  ${filePath} not executable (attempting fix...)`);
    try {
      fs.chmodSync(filePath, '755');
      console.log(`   ✅ Fixed: ${filePath}`);
    } catch (error) {
      console.log(`   ❌ Failed to fix: ${error.message}`);
      warnings.push(`${filePath} is not executable. Run: chmod +x ${filePath}`);
    }
  }
});

// ============================================================================
// CHECK 5: Node.js Dependencies
// ============================================================================

console.log('\n📦 Checking Node.js dependencies...\n');

const requiredPackages = [
  'dotenv',
  'twitter-api-v2'
];

try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  requiredPackages.forEach(pkg => {
    if (allDeps[pkg]) {
      console.log(`   ✅ ${pkg}: ${allDeps[pkg]}`);
    } else {
      console.log(`   ❌ ${pkg}: NOT FOUND in package.json`);
      allGood = false;
    }
  });
} catch (error) {
  console.log(`   ⚠️  Could not read package.json: ${error.message}`);
  warnings.push('Verify npm packages are installed: npm install');
}

// ============================================================================
// CHECK 6: Cron/Launchd Setup
// ============================================================================

console.log('\n⏰ Checking scheduled tasks...\n');

try {
  // Check crontab
  const crontab = execSync('crontab -l 2>/dev/null || true', { encoding: 'utf8' });

  if (crontab.includes('twitter-scheduler')) {
    console.log('   ✅ Crontab entries found');
    console.log('   ' + crontab.split('\n').filter(line => line.includes('twitter-scheduler'))[0].substring(0, 70) + '...');
  } else {
    console.log('   ⚠️  No crontab entries found');
    warnings.push('Run: bash scripts/setup-cron.sh to setup automated posting');
  }
} catch (error) {
  console.log('   ⚠️  Could not check crontab');
}

// Check launchd (macOS)
const launchdPlist = `${process.env.HOME}/Library/LaunchAgents/com.hypeai.twitter.scheduler.plist`;
if (fs.existsSync(launchdPlist)) {
  console.log('   ✅ launchd plist found (macOS)');
  try {
    const status = execSync('launchctl list | grep hypeai || true', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('   ✅ launchd service is loaded');
    } else {
      console.log('   ⚠️  launchd service not loaded');
      warnings.push(`Run: launchctl load ${launchdPlist}`);
    }
  } catch (error) {
    console.log('   ⚠️  Could not check launchd status');
  }
}

// ============================================================================
// CHECK 7: Test Scheduler
// ============================================================================

console.log('\n🧪 Testing scheduler (dry-run)...\n');

try {
  const output = execSync('node scripts/twitter-scheduler.js --dry-run 2>&1', {
    encoding: 'utf8',
    timeout: 10000
  });

  if (output.includes('SCHEDULER') && !output.includes('Fatal error')) {
    console.log('   ✅ Scheduler executed successfully');
    console.log('   ℹ️  Scheduler is working correctly');
  } else {
    console.log('   ⚠️  Scheduler ran but may have issues');
    warnings.push('Review scheduler output for warnings');
  }
} catch (error) {
  console.log('   ❌ Scheduler test failed');
  console.log(`   Error: ${error.message}`);
  allGood = false;
}

// ============================================================================
// CHECK 8: Content Bank
// ============================================================================

console.log('\n📝 Checking content bank...\n');

try {
  const contentBank = JSON.parse(fs.readFileSync('./scripts/twitter-content/tweets-bank.json', 'utf8'));

  console.log(`   ✅ Content bank loaded`);
  console.log(`   📊 Total tweets: ${contentBank.meta?.total_tweets || 0}`);
  console.log(`   📂 Categories: ${contentBank.meta?.categories || 'unknown'}`);

  if (contentBank.tweets && contentBank.tweets.length > 0) {
    console.log(`   ✅ ${contentBank.tweets.length} tweets ready to post`);
  } else {
    console.log('   ⚠️  No tweets found in content bank');
    warnings.push('Add tweets to scripts/twitter-content/tweets-bank.json');
  }
} catch (error) {
  console.log(`   ❌ Could not load content bank: ${error.message}`);
  allGood = false;
}

// ============================================================================
// CHECK 9: Posting History
// ============================================================================

console.log('\n📊 Checking posting history...\n');

const historyPath = './data/project-coordination/posting-history.json';
if (fs.existsSync(historyPath)) {
  try {
    const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    console.log('   ✅ Posting history loaded');
    console.log(`   📈 Total posted: ${history.posted?.length || 0}`);
    if (history.lastPosted) {
      console.log(`   🕐 Last post: ${new Date(history.lastPosted.timestamp).toLocaleString('ru-RU')}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Could not parse history: ${error.message}`);
  }
} else {
  console.log('   ℹ️  No posting history yet (will be created on first post)');
}

// ============================================================================
// FINAL SUMMARY
// ============================================================================

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('VERIFICATION SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (allGood && warnings.length === 0) {
  console.log('✅ ALL CHECKS PASSED! System ready for production.\n');
  console.log('🚀 Next steps:');
  console.log('   1. Setup automation: bash scripts/setup-cron.sh');
  console.log('   2. Monitor status: node scripts/check-posting-status.js');
  console.log('   3. View logs: tail -f logs/cron.log\n');
} else if (warnings.length > 0 && allGood) {
  console.log('⚠️  SYSTEM FUNCTIONAL but has warnings:\n');
  warnings.forEach((warning, i) => {
    console.log(`   ${i + 1}. ${warning}`);
  });
  console.log('\n📋 Address warnings before going to production.\n');
} else {
  console.log('❌ CRITICAL ISSUES FOUND! Fix before using:\n');
  console.log('   Review errors above and fix configuration');
  console.log('   Then run this verification again\n');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

process.exit(allGood ? 0 : 1);
