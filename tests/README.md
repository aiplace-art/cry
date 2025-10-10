# Integration Test Suite

Comprehensive integration tests for the HypedToken project.

## Quick Start

```bash
# Run all integration tests
node tests/test-integration.js

# Or use npm script
npm test
```

## Test Coverage

### 1. Environment Configuration (5 tests)
- ✓ Node.js version >= 16
- ✓ Package.json validation
- ✓ Hardhat config exists
- ✓ .env file present
- ✓ Dependencies installed

### 2. Project Structure (6 tests)
- ✓ Contracts directory
- ✓ Smart contract files (Token.sol, Staking.sol)
- ✓ Backend directory structure
- ✓ Core backend files
- ✓ MVC architecture (models, routes, controllers)
- ✓ Deployment scripts

### 3. Smart Contract Validation (4 tests)
- ✓ Solidity syntax validation
- ✓ Contract compilation
- ✓ Artifact generation
- ✓ ABI and bytecode validation

### 4. Backend Configuration (5 tests)
- ✓ Express app structure
- ✓ Tokenomics calculator
- ✓ Database configuration
- ✓ API routes
- ✓ Controller functions

### 5. Dependencies (2 tests)
- ✓ Required packages installed
- ✓ Hardhat functionality

### 6. Documentation (2 tests)
- ✓ README exists
- ✓ Contract documentation (NatSpec)

## Output Format

```
🧪 HypedToken Integration Test Suite
Testing complete system integration...

============================================================
  Environment Configuration Tests
============================================================
✓ Node.js version >= 16
✓ Package.json exists and valid
...

============================================================
📊 TEST RESULTS
============================================================
✓ Passed:  25
✗ Failed:  0
============================================================
Success Rate: 100.0%
Duration: 12.45s
============================================================

🎉 All tests passed! System is ready.
```

## Color Codes

- 🟢 **Green**: Test passed
- 🔴 **Red**: Test failed
- 🟡 **Yellow**: Test skipped
- 🔵 **Blue**: Informational message
- 🔷 **Cyan**: Section headers

## Exit Codes

- `0`: All tests passed
- `1`: One or more tests failed

## Test Structure

Each test follows the Arrange-Act-Assert pattern:

```javascript
await runTest('Test name', async () => {
  // Arrange: Set up test conditions
  const configPath = join(rootDir, 'hardhat.config.js');

  // Act: Perform the operation
  const exists = existsSync(configPath);

  // Assert: Verify the result
  if (!exists) {
    throw new Error('hardhat.config.js not found');
  }
});
```

## Adding New Tests

To add a new test suite:

```javascript
async function testNewFeature() {
  testHeader('New Feature Tests');

  await runTest('Feature works correctly', async () => {
    // Your test logic here
    if (somethingWrong) {
      throw new Error('Descriptive error message');
    }
  });
}

// Add to testIntegration() function:
async function testIntegration() {
  // ...
  await testNewFeature();  // Add this line
  // ...
}
```

## Debugging Failed Tests

When tests fail, they show:
1. Which test failed
2. The error message
3. Section where the failure occurred

Example:
```
✗ Contracts compile successfully
  Error: Compilation failed: Missing semicolon at line 42
```

## CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run Integration Tests
  run: node tests/test-integration.js
```

## Memory Storage

Test results are stored in Claude Flow memory:

```bash
npx claude-flow@alpha hooks post-edit \
  --file "tests/test-integration.js" \
  --memory-key "swarm/tests/integration"
```

## Next Steps

After all tests pass:

1. Deploy contracts: `npm run deploy`
2. Start backend: `node src/backend/server.js`
3. Run full test suite: `npm test`
4. Check coverage: `npm run coverage`

## Troubleshooting

### Common Issues

**Issue**: "node_modules not found"
```bash
npm install
```

**Issue**: ".env file not found"
```bash
cp .env.example .env
# Edit .env with your values
```

**Issue**: "Hardhat compilation failed"
```bash
npx hardhat clean
npx hardhat compile
```

**Issue**: "OpenZeppelin v5 compatibility errors"
- Update constructors to pass `initialOwner`
- Remove SafeMath usage (Solidity 0.8+ has built-in overflow protection)

## Performance

- Average runtime: 3-15 seconds
- Compilation tests take longest (~10s)
- File structure tests are fastest (<1s)

## Related Files

- `/hardhat.config.js` - Hardhat configuration
- `/package.json` - Project dependencies
- `/.env` - Environment variables
- `/contracts/` - Smart contracts
- `/src/backend/` - Backend code
- `/scripts/deploy.js` - Deployment script

---

**Created by**: Integration Test Agent
**Stored in**: `swarm/tests/integration` (Claude Flow memory)
**Last Updated**: 2025-10-09
