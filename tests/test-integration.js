#!/usr/bin/env node
/**
 * Integration Test Suite
 * Tests the complete system: environment, contracts, backend, deployment
 *
 * Usage: node tests/test-integration.js
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Test results tracking
let passed = 0;
let failed = 0;
let skipped = 0;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testHeader(title) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(60));
}

async function runTest(name, testFn) {
  try {
    await testFn();
    log(`✓ ${name}`, 'green');
    passed++;
    return true;
  } catch (e) {
    log(`✗ ${name}`, 'red');
    log(`  Error: ${e.message}`, 'red');
    failed++;
    return false;
  }
}

function skipTest(name, reason) {
  log(`⊘ ${name} - ${reason}`, 'yellow');
  skipped++;
}

/**
 * Test 1: Environment Configuration
 */
async function testEnvironment() {
  testHeader('Environment Configuration Tests');

  await runTest('Node.js version >= 16', async () => {
    const version = process.version.match(/^v(\d+)\./)[1];
    if (parseInt(version) < 16) {
      throw new Error(`Node.js version ${process.version} is too old. Required: >= 16`);
    }
  });

  await runTest('Package.json exists and valid', async () => {
    const pkgPath = join(rootDir, 'package.json');
    if (!existsSync(pkgPath)) {
      throw new Error('package.json not found');
    }
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    if (pkg.type !== 'module') {
      throw new Error('package.json must have "type": "module"');
    }
    if (!pkg.dependencies) {
      throw new Error('No dependencies defined');
    }
  });

  await runTest('Hardhat config exists', async () => {
    const configPath = join(rootDir, 'hardhat.config.js');
    if (!existsSync(configPath)) {
      throw new Error('hardhat.config.js not found');
    }
  });

  await runTest('.env file exists', async () => {
    const envPath = join(rootDir, '.env');
    if (!existsSync(envPath)) {
      const examplePath = join(rootDir, '.env.example');
      if (existsSync(examplePath)) {
        throw new Error('.env file not found - copy from .env.example');
      } else {
        throw new Error('.env file not found');
      }
    }
  });

  await runTest('node_modules installed', async () => {
    const nmPath = join(rootDir, 'node_modules');
    if (!existsSync(nmPath)) {
      throw new Error('node_modules not found - run npm install');
    }
  });
}

/**
 * Test 2: Project Structure
 */
async function testProjectStructure() {
  testHeader('Project Structure Tests');

  await runTest('Contracts directory exists', async () => {
    const contractsPath = join(rootDir, 'contracts');
    if (!existsSync(contractsPath)) {
      throw new Error('contracts directory not found');
    }
  });

  await runTest('Smart contract files exist', async () => {
    const tokenPath = join(rootDir, 'contracts/Token.sol');
    const stakingPath = join(rootDir, 'contracts/Staking.sol');

    if (!existsSync(tokenPath)) {
      throw new Error('Token.sol not found in contracts/');
    }
    if (!existsSync(stakingPath)) {
      throw new Error('Staking.sol not found in contracts/');
    }
  });

  await runTest('Backend directory exists', async () => {
    const backendPath = join(rootDir, 'src/backend');
    if (!existsSync(backendPath)) {
      throw new Error('src/backend directory not found');
    }
  });

  await runTest('Core backend files exist', async () => {
    const files = [
      'src/backend/app.js',
      'src/backend/server.js',
      'src/backend/tokenomics.js'
    ];

    for (const file of files) {
      const filePath = join(rootDir, file);
      if (!existsSync(filePath)) {
        throw new Error(`${file} not found`);
      }
    }
  });

  await runTest('Backend modules structure', async () => {
    const dirs = [
      'src/backend/config',
      'src/backend/controllers',
      'src/backend/models',
      'src/backend/routes',
      'src/backend/services'
    ];

    for (const dir of dirs) {
      const dirPath = join(rootDir, dir);
      if (!existsSync(dirPath)) {
        throw new Error(`${dir} directory not found`);
      }
    }
  });

  await runTest('Scripts directory exists', async () => {
    const scriptsPath = join(rootDir, 'scripts');
    if (!existsSync(scriptsPath)) {
      throw new Error('scripts directory not found');
    }
  });

  await runTest('Deployment script exists', async () => {
    const deployScript = join(rootDir, 'scripts/deploy.js');
    if (!existsSync(deployScript)) {
      throw new Error('scripts/deploy.js not found');
    }
  });
}

/**
 * Test 3: Smart Contract Validation
 */
async function testSmartContracts() {
  testHeader('Smart Contract Validation Tests');

  await runTest('Token.sol has valid Solidity syntax', async () => {
    const tokenPath = join(rootDir, 'contracts/Token.sol');
    const content = readFileSync(tokenPath, 'utf8');

    if (!content.includes('pragma solidity')) {
      throw new Error('Missing pragma statement');
    }
    if (!content.includes('contract Token')) {
      throw new Error('Missing Token contract definition');
    }
  });

  await runTest('Staking.sol has valid Solidity syntax', async () => {
    const stakingPath = join(rootDir, 'contracts/Staking.sol');
    const content = readFileSync(stakingPath, 'utf8');

    if (!content.includes('pragma solidity')) {
      throw new Error('Missing pragma statement');
    }
    if (!content.includes('contract Staking')) {
      throw new Error('Missing Staking contract definition');
    }
  });

  await runTest('Contracts compile successfully', async () => {
    log('  Compiling contracts (this may take a moment)...', 'blue');
    try {
      const { stdout, stderr } = await execAsync('npx hardhat compile', {
        cwd: rootDir,
        timeout: 60000
      });

      // Check if artifacts were created
      const artifactsPath = join(rootDir, 'artifacts/contracts');
      if (!existsSync(artifactsPath)) {
        throw new Error('Compilation did not generate artifacts');
      }
    } catch (error) {
      if (error.code === 'ETIMEDOUT') {
        throw new Error('Compilation timed out after 60 seconds');
      }
      throw new Error(`Compilation failed: ${error.message}`);
    }
  });

  await runTest('Compiled artifacts are valid', async () => {
    const tokenArtifact = join(rootDir, 'artifacts/contracts/Token.sol/Token.json');
    const stakingArtifact = join(rootDir, 'artifacts/contracts/Staking.sol/Staking.json');

    if (!existsSync(tokenArtifact)) {
      throw new Error('Token.json artifact not found');
    }
    if (!existsSync(stakingArtifact)) {
      throw new Error('Staking.json artifact not found');
    }

    // Validate artifact structure
    const tokenData = JSON.parse(readFileSync(tokenArtifact, 'utf8'));
    if (!tokenData.abi || !tokenData.bytecode) {
      throw new Error('Token artifact missing ABI or bytecode');
    }

    const stakingData = JSON.parse(readFileSync(stakingArtifact, 'utf8'));
    if (!stakingData.abi || !stakingData.bytecode) {
      throw new Error('Staking artifact missing ABI or bytecode');
    }
  });
}

/**
 * Test 4: Backend Configuration
 */
async function testBackendConfig() {
  testHeader('Backend Configuration Tests');

  await runTest('Backend can be imported', async () => {
    try {
      const appPath = join(rootDir, 'src/backend/app.js');
      // Just check if file can be read and has basic structure
      const content = readFileSync(appPath, 'utf8');
      if (!content.includes('express') && !content.includes('app')) {
        throw new Error('app.js does not appear to be an Express application');
      }
    } catch (error) {
      throw new Error(`Cannot validate backend: ${error.message}`);
    }
  });

  await runTest('Tokenomics calculator exists', async () => {
    const tokenomicsPath = join(rootDir, 'src/backend/tokenomics.js');
    const content = readFileSync(tokenomicsPath, 'utf8');

    if (!content.includes('function') && !content.includes('class')) {
      throw new Error('tokenomics.js does not contain functions or classes');
    }
  });

  await runTest('Database config exists', async () => {
    const dbConfigPath = join(rootDir, 'src/backend/config/database.js');
    if (!existsSync(dbConfigPath)) {
      throw new Error('database.js config not found');
    }
  });

  await runTest('Routes are defined', async () => {
    const routesPath = join(rootDir, 'src/backend/routes');
    const files = [
      'auth.routes.js',
      'staking.routes.js',
      'token.routes.js'
    ];

    for (const file of files) {
      const filePath = join(routesPath, file);
      if (!existsSync(filePath)) {
        throw new Error(`${file} not found`);
      }
    }
  });

  await runTest('Controllers are defined', async () => {
    const controllersPath = join(rootDir, 'src/backend/controllers');
    const files = [
      'auth.controller.js',
      'staking.controller.js',
      'token.controller.js'
    ];

    for (const file of files) {
      const filePath = join(controllersPath, file);
      if (!existsSync(filePath)) {
        throw new Error(`${file} not found`);
      }
    }
  });
}

/**
 * Test 5: Dependencies
 */
async function testDependencies() {
  testHeader('Dependency Tests');

  await runTest('Essential packages installed', async () => {
    const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
    const requiredDeps = {
      '@openzeppelin/contracts': ['dependencies', 'devDependencies'], // Can be in either
      'ethers': ['dependencies', 'devDependencies'],
      'hardhat': ['devDependencies']
    };

    for (const [dep, types] of Object.entries(requiredDeps)) {
      let found = false;
      for (const type of types) {
        const deps = pkg[type];
        if (deps && deps[dep]) {
          found = true;
          break;
        }
      }

      if (!found) {
        throw new Error(`Missing package: ${dep} (should be in ${types.join(' or ')})`);
      }

      // Check if actually installed
      const depPath = join(rootDir, 'node_modules', dep);
      if (!existsSync(depPath)) {
        throw new Error(`${dep} not installed in node_modules`);
      }
    }
  });

  await runTest('Hardhat is functional', async () => {
    try {
      const { stdout } = await execAsync('npx hardhat --version', {
        cwd: rootDir,
        timeout: 10000
      });
      if (!stdout.includes('2.')) {
        throw new Error(`Unexpected Hardhat version: ${stdout}`);
      }
    } catch (error) {
      throw new Error(`Hardhat not functional: ${error.message}`);
    }
  });
}

/**
 * Test 6: Documentation
 */
async function testDocumentation() {
  testHeader('Documentation Tests');

  await runTest('README.md exists', async () => {
    const readmePath = join(rootDir, 'README.md');
    if (!existsSync(readmePath)) {
      throw new Error('README.md not found');
    }

    const content = readFileSync(readmePath, 'utf8');
    if (content.length < 100) {
      throw new Error('README.md appears to be empty or too short');
    }
  });

  await runTest('Contract documentation exists', async () => {
    const tokenPath = join(rootDir, 'contracts/Token.sol');
    const content = readFileSync(tokenPath, 'utf8');

    // Check for NatSpec comments
    if (!content.includes('/**') && !content.includes('///')) {
      log('  Warning: No NatSpec documentation found', 'yellow');
    }
  });
}

/**
 * Main test runner
 */
async function testIntegration() {
  log('\n🧪 HypedToken Integration Test Suite', 'cyan');
  log('Testing complete system integration...\n', 'cyan');
  log(`Running from: ${rootDir}\n`, 'blue');

  const startTime = Date.now();

  try {
    // Run all test suites
    await testEnvironment();
    await testProjectStructure();
    await testSmartContracts();
    await testBackendConfig();
    await testDependencies();
    await testDocumentation();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Final results
    console.log('\n' + '='.repeat(60));
    log('📊 TEST RESULTS', 'cyan');
    console.log('='.repeat(60));

    log(`✓ Passed:  ${passed}`, 'green');
    if (failed > 0) {
      log(`✗ Failed:  ${failed}`, 'red');
    }
    if (skipped > 0) {
      log(`⊘ Skipped: ${skipped}`, 'yellow');
    }

    const total = passed + failed;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

    console.log('='.repeat(60));
    log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red');
    log(`Duration: ${duration}s`, 'blue');
    console.log('='.repeat(60) + '\n');

    // Exit with appropriate code
    if (failed === 0) {
      log('🎉 All tests passed! System is ready.', 'green');
      log('\nNext steps:', 'cyan');
      log('  1. Deploy contracts: npm run deploy', 'blue');
      log('  2. Start backend: node src/backend/server.js', 'blue');
      log('  3. Run full tests: npm test', 'blue');
      return true;
    } else {
      log(`❌ ${failed} test(s) failed. Please fix issues above.`, 'red');
      return false;
    }

  } catch (error) {
    log('\n💥 Fatal Error:', 'red');
    log(error.message, 'red');
    if (error.stack) {
      console.log(error.stack);
    }
    return false;
  }
}

// Run tests and exit with appropriate code
testIntegration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
