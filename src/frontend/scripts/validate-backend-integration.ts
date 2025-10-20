/**
 * Backend Integration Validation Script
 *
 * Tests all backend integrations with BSC Testnet
 */

import { ethers } from 'ethers';
import {
  getProvider,
  getPrivateSaleContract,
  getChainlinkContract,
  getBNBPriceUSD,
  getTokenPrice,
  getTotalRaised,
  calculateBonusPercentage,
  calculateTokensWithBonus,
  calculateVestedTokens,
  CONTRACTS,
  BSC_TESTNET_RPC,
  BSC_TESTNET_CHAIN_ID,
} from '../lib/backend/blockchain';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  duration?: number;
  error?: Error;
}

const results: TestResult[] = [];

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function addResult(result: TestResult) {
  results.push(result);
  const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
  const color = result.status === 'PASS' ? 'green' : result.status === 'WARN' ? 'yellow' : 'red';
  log(color, `${icon} ${result.name}: ${result.message}`);
}

async function testRPCConnection(): Promise<void> {
  const start = Date.now();
  try {
    const provider = getProvider();
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    if (Number(network.chainId) !== BSC_TESTNET_CHAIN_ID) {
      addResult({
        name: 'RPC Connection',
        status: 'FAIL',
        message: `Wrong chain ID: ${network.chainId} (expected ${BSC_TESTNET_CHAIN_ID})`,
        duration: Date.now() - start,
      });
      return;
    }

    addResult({
      name: 'RPC Connection',
      status: 'PASS',
      message: `Connected to BSC Testnet (block ${blockNumber})`,
      duration: Date.now() - start,
    });
  } catch (error) {
    addResult({
      name: 'RPC Connection',
      status: 'FAIL',
      message: `Failed to connect to RPC: ${(error as Error).message}`,
      duration: Date.now() - start,
      error: error as Error,
    });
  }
}

async function testContractAddress(): Promise<void> {
  const start = Date.now();
  try {
    const contract = getPrivateSaleContract();
    const address = await contract.getAddress();

    if (address.toLowerCase() !== CONTRACTS.PRIVATE_SALE.toLowerCase()) {
      addResult({
        name: 'Contract Address',
        status: 'FAIL',
        message: `Contract address mismatch: ${address}`,
        duration: Date.now() - start,
      });
      return;
    }

    // Try to get contract code to verify it's deployed
    const provider = getProvider();
    const code = await provider.getCode(address);

    if (code === '0x') {
      addResult({
        name: 'Contract Address',
        status: 'FAIL',
        message: `No contract code at ${address}`,
        duration: Date.now() - start,
      });
      return;
    }

    addResult({
      name: 'Contract Address',
      status: 'PASS',
      message: `Contract verified at ${address}`,
      duration: Date.now() - start,
    });
  } catch (error) {
    addResult({
      name: 'Contract Address',
      status: 'FAIL',
      message: `Failed to verify contract: ${(error as Error).message}`,
      duration: Date.now() - start,
      error: error as Error,
    });
  }
}

async function testTokenPrice(): Promise<void> {
  const start = Date.now();
  try {
    const price = await getTokenPrice();

    if (price === 0.025) {
      addResult({
        name: 'Token Price',
        status: 'WARN',
        message: `Using fallback price: $${price} (contract call may have failed)`,
        duration: Date.now() - start,
      });
      return;
    }

    if (price > 0 && price < 1) {
      addResult({
        name: 'Token Price',
        status: 'PASS',
        message: `Token price: $${price}`,
        duration: Date.now() - start,
      });
    } else {
      addResult({
        name: 'Token Price',
        status: 'WARN',
        message: `Unusual token price: $${price}`,
        duration: Date.now() - start,
      });
    }
  } catch (error) {
    addResult({
      name: 'Token Price',
      status: 'FAIL',
      message: `Failed to fetch token price: ${(error as Error).message}`,
      duration: Date.now() - start,
      error: error as Error,
    });
  }
}

async function testBNBPrice(): Promise<void> {
  const start = Date.now();
  try {
    const price = await getBNBPriceUSD();

    if (price === 600) {
      addResult({
        name: 'BNB Price (Chainlink)',
        status: 'WARN',
        message: `Using fallback price: $${price} (oracle may have failed)`,
        duration: Date.now() - start,
      });
      return;
    }

    if (price > 100 && price < 10000) {
      addResult({
        name: 'BNB Price (Chainlink)',
        status: 'PASS',
        message: `BNB price from oracle: $${price.toFixed(2)}`,
        duration: Date.now() - start,
      });
    } else {
      addResult({
        name: 'BNB Price (Chainlink)',
        status: 'WARN',
        message: `Unusual BNB price: $${price}`,
        duration: Date.now() - start,
      });
    }
  } catch (error) {
    addResult({
      name: 'BNB Price (Chainlink)',
      status: 'FAIL',
      message: `Failed to fetch BNB price: ${(error as Error).message}`,
      duration: Date.now() - start,
      error: error as Error,
    });
  }
}

async function testTotalRaised(): Promise<void> {
  const start = Date.now();
  try {
    const { usdtRaised, bnbRaised, totalUSD } = await getTotalRaised();

    if (usdtRaised === 0 && bnbRaised === 0 && totalUSD === 0) {
      addResult({
        name: 'Total Raised',
        status: 'WARN',
        message: 'All values are 0 (contract calls may have failed or no sales yet)',
        duration: Date.now() - start,
      });
      return;
    }

    addResult({
      name: 'Total Raised',
      status: 'PASS',
      message: `USDT: $${usdtRaised.toFixed(2)}, BNB: ${bnbRaised.toFixed(4)}, Total: $${totalUSD.toFixed(2)}`,
      duration: Date.now() - start,
    });
  } catch (error) {
    addResult({
      name: 'Total Raised',
      status: 'FAIL',
      message: `Failed to fetch total raised: ${(error as Error).message}`,
      duration: Date.now() - start,
      error: error as Error,
    });
  }
}

async function testBonusCalculation(): Promise<void> {
  const start = Date.now();
  try {
    const testCases = [
      { amount: 100, expectedBonus: 0 },
      { amount: 1000, expectedBonus: 20 },
      { amount: 5000, expectedBonus: 23 },
      { amount: 10000, expectedBonus: 25 },
      { amount: 25000, expectedBonus: 27 },
      { amount: 50000, expectedBonus: 30 },
    ];

    let allPassed = true;
    const results: string[] = [];

    for (const { amount, expectedBonus } of testCases) {
      const bonus = calculateBonusPercentage(amount);
      if (bonus !== expectedBonus) {
        allPassed = false;
        results.push(`$${amount}: ${bonus}% (expected ${expectedBonus}%)`);
      }
    }

    if (allPassed) {
      addResult({
        name: 'Bonus Calculation',
        status: 'PASS',
        message: 'All bonus tier calculations correct',
        duration: Date.now() - start,
      });
    } else {
      addResult({
        name: 'Bonus Calculation',
        status: 'FAIL',
        message: `Failed: ${results.join(', ')}`,
        duration: Date.now() - start,
      });
    }
  } catch (error) {
    addResult({
      name: 'Bonus Calculation',
      status: 'FAIL',
      message: `Calculation error: ${(error as Error).message}`,
      duration: Date.now() - start,
      error: error as Error,
    });
  }
}

async function testTokenCalculation(): Promise<void> {
  const start = Date.now();
  try {
    const amount = 10000; // $10k investment
    const tokenPrice = 0.025;

    const result = calculateTokensWithBonus(amount, tokenPrice);

    const expectedBase = amount / tokenPrice; // 400,000 tokens
    const expectedBonus = 25; // 25% for $10k
    const expectedBonusTokens = expectedBase * 0.25; // 100,000 tokens
    const expectedTotal = expectedBase + expectedBonusTokens; // 500,000 tokens

    if (
      Math.abs(result.baseTokens - expectedBase) < 1 &&
      result.bonusPercentage === expectedBonus &&
      Math.abs(result.bonusTokens - expectedBonusTokens) < 1 &&
      Math.abs(result.totalTokens - expectedTotal) < 1
    ) {
      addResult({
        name: 'Token Calculation',
        status: 'PASS',
        message: `Correct: ${result.totalTokens.toFixed(0)} tokens for $${amount} (${result.bonusPercentage}% bonus)`,
        duration: Date.now() - start,
      });
    } else {
      addResult({
        name: 'Token Calculation',
        status: 'FAIL',
        message: `Incorrect calculation: got ${result.totalTokens}, expected ${expectedTotal}`,
        duration: Date.now() - start,
      });
    }
  } catch (error) {
    addResult({
      name: 'Token Calculation',
      status: 'FAIL',
      message: `Calculation error: ${(error as Error).message}`,
      duration: Date.now() - start,
      error: error as Error,
    });
  }
}

async function testVestingCalculation(): Promise<void> {
  const start = Date.now();
  try {
    const totalTokens = 100000;
    const now = Date.now();
    const purchaseTime = now - (1000); // 1 second ago

    // Test immediate unlock (20%)
    const immediate = calculateVestedTokens(totalTokens, purchaseTime, now);
    const expectedImmediate = totalTokens * 0.2;

    // Test during cliff (45 days)
    const duringCliff = now + (45 * 24 * 60 * 60 * 1000); // 45 days
    const cliffVested = calculateVestedTokens(totalTokens, purchaseTime, duringCliff);

    // Test after cliff (180 days = cliff + 90 days vesting)
    const afterCliff = now + (180 * 24 * 60 * 60 * 1000);
    const afterCliffVested = calculateVestedTokens(totalTokens, purchaseTime, afterCliff);
    // Expected: 20% immediate + (80% * 90/540) = 20,000 + 13,333.33 = 33,333.33

    // Test full vesting (630 days)
    const fullVest = now + (630 * 24 * 60 * 60 * 1000);
    const fullyVested = calculateVestedTokens(totalTokens, purchaseTime, fullVest);

    const tests = [
      { name: 'Immediate (20%)', actual: immediate, expected: expectedImmediate, tolerance: 1 },
      { name: 'During cliff (20%)', actual: cliffVested, expected: expectedImmediate, tolerance: 1 },
      { name: 'After 180 days', actual: afterCliffVested, expected: 33333.33, tolerance: 100 },
      { name: 'Full vesting (100%)', actual: fullyVested, expected: totalTokens, tolerance: 1 },
    ];

    let allPassed = true;
    const results: string[] = [];

    for (const test of tests) {
      if (Math.abs(test.actual - test.expected) > test.tolerance) {
        allPassed = false;
        results.push(`${test.name}: ${test.actual.toFixed(2)} (expected ${test.expected.toFixed(2)})`);
      }
    }

    if (allPassed) {
      addResult({
        name: 'Vesting Calculation',
        status: 'PASS',
        message: 'All vesting calculations correct (20% immediate, 90d cliff, 18mo linear)',
        duration: Date.now() - start,
      });
    } else {
      addResult({
        name: 'Vesting Calculation',
        status: 'FAIL',
        message: `Failed: ${results.join(', ')}`,
        duration: Date.now() - start,
      });
    }
  } catch (error) {
    addResult({
      name: 'Vesting Calculation',
      status: 'FAIL',
      message: `Calculation error: ${(error as Error).message}`,
      duration: Date.now() - start,
      error: error as Error,
    });
  }
}

async function testAPIEndpoint(): Promise<void> {
  const start = Date.now();
  try {
    const response = await fetch('http://localhost:3001/api/private-sale/stats');

    if (!response.ok) {
      addResult({
        name: 'API Endpoint',
        status: 'FAIL',
        message: `HTTP ${response.status}: ${response.statusText}`,
        duration: Date.now() - start,
      });
      return;
    }

    const data = await response.json();

    if (!data.success || !data.stats) {
      addResult({
        name: 'API Endpoint',
        status: 'FAIL',
        message: 'Invalid API response format',
        duration: Date.now() - start,
      });
      return;
    }

    // Check critical fields
    const stats = data.stats;
    const checks = [
      { field: 'vestingMonths', value: stats.vestingMonths, expected: 21 },
      { field: 'tokenPrice', value: stats.tokenPrice, expected: 0.025 },
      { field: 'goal', value: stats.goal, expected: 5000000 },
    ];

    let allPassed = true;
    const failures: string[] = [];

    for (const check of checks) {
      if (check.value !== check.expected) {
        allPassed = false;
        failures.push(`${check.field}: ${check.value} (expected ${check.expected})`);
      }
    }

    if (allPassed) {
      addResult({
        name: 'API Endpoint',
        status: 'PASS',
        message: `Response OK with vestingMonths=${stats.vestingMonths}`,
        duration: Date.now() - start,
      });
    } else {
      addResult({
        name: 'API Endpoint',
        status: 'FAIL',
        message: `Field mismatches: ${failures.join(', ')}`,
        duration: Date.now() - start,
      });
    }
  } catch (error) {
    addResult({
      name: 'API Endpoint',
      status: 'FAIL',
      message: `Request failed: ${(error as Error).message}`,
      duration: Date.now() - start,
      error: error as Error,
    });
  }
}

async function printSummary() {
  log('cyan', '\n' + '='.repeat(80));
  log('cyan', 'BACKEND INTEGRATION TEST SUMMARY');
  log('cyan', '='.repeat(80));

  const passed = results.filter(r => r.status === 'PASS').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  log('green', `\n✅ PASSED: ${passed}/${total}`);
  if (warned > 0) log('yellow', `⚠️  WARNINGS: ${warned}/${total}`);
  if (failed > 0) log('red', `❌ FAILED: ${failed}/${total}`);

  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
  log('blue', `\n⏱️  Total duration: ${totalDuration}ms`);

  if (failed > 0) {
    log('red', '\n❌ FAILED TESTS:');
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        log('red', `  • ${r.name}: ${r.message}`);
        if (r.error) {
          log('red', `    Error: ${r.error.message}`);
        }
      });
  }

  if (warned > 0) {
    log('yellow', '\n⚠️  WARNINGS:');
    results
      .filter(r => r.status === 'WARN')
      .forEach(r => {
        log('yellow', `  • ${r.name}: ${r.message}`);
      });
  }

  log('cyan', '\n' + '='.repeat(80) + '\n');
}

async function main() {
  log('cyan', '\n' + '='.repeat(80));
  log('cyan', '🚀 BACKEND INTEGRATION VALIDATION - HypeAI Private Sale');
  log('cyan', '='.repeat(80) + '\n');

  log('blue', '📋 Test Suite:');
  log('blue', '  1. RPC Connection to BSC Testnet');
  log('blue', '  2. Contract Address Verification');
  log('blue', '  3. Token Price Fetching');
  log('blue', '  4. BNB Price (Chainlink Oracle)');
  log('blue', '  5. Total Raised Amounts');
  log('blue', '  6. Bonus Tier Calculations');
  log('blue', '  7. Token Amount Calculations');
  log('blue', '  8. Vesting Schedule Calculations');
  log('blue', '  9. API Endpoint Response\n');

  log('cyan', 'Running tests...\n');

  await testRPCConnection();
  await testContractAddress();
  await testTokenPrice();
  await testBNBPrice();
  await testTotalRaised();
  await testBonusCalculation();
  await testTokenCalculation();
  await testVestingCalculation();
  await testAPIEndpoint();

  await printSummary();

  const failed = results.filter(r => r.status === 'FAIL').length;
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(error => {
  log('red', `\n❌ Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
