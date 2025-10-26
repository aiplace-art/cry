# 🚀 Security Test Execution Guide

## Quick Start

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Run all security tests
npx hardhat test tests/security/*.test.js

# 3. View results
# All tests should pass ✅
```

---

## 📋 Test Files Overview

| File | What It Tests | Time | Tests |
|------|---------------|------|-------|
| `token-security.test.js` | Token reentrancy, overflow, access, economic attacks | ~8s | 45+ |
| `referral-security.test.js` | Referral circular refs, reward manipulation, claims | ~9s | 50+ |
| `private-sale-security.test.js` | Oracle manipulation, payment attacks, access | ~7s | 40+ |
| `staking-security.test.js` | Lock period bypass, reward farming, pool safety | ~6s | 35+ |
| `integration-attacks.test.js` | Cross-contract exploits, attack chains | ~10s | 25+ |

**Total: ~40 seconds, 195+ tests**

---

## 🎯 Running Specific Test Categories

### By Vulnerability Type

```bash
# Reentrancy tests
npx hardhat test tests/security/*.test.js --grep "Reentrancy"

# Overflow/Underflow tests
npx hardhat test tests/security/*.test.js --grep "Integer Overflow"

# Access Control tests
npx hardhat test tests/security/*.test.js --grep "Access Control"

# Oracle manipulation
npx hardhat test tests/security/*.test.js --grep "Oracle"

# Economic attacks
npx hardhat test tests/security/*.test.js --grep "Economic"

# Edge cases
npx hardhat test tests/security/*.test.js --grep "Edge Cases"
```

### By Contract

```bash
# Token contract tests
npx hardhat test tests/security/token-security.test.js

# Referral system tests
npx hardhat test tests/security/referral-security.test.js

# Private sale tests
npx hardhat test tests/security/private-sale-security.test.js

# Staking tests
npx hardhat test tests/security/staking-security.test.js

# Integration tests
npx hardhat test tests/security/integration-attacks.test.js
```

---

## 📊 Coverage Reporting

```bash
# Generate coverage report
npx hardhat coverage --testfiles "tests/security/*.test.js"

# View coverage in browser
open coverage/index.html
```

**Expected Coverage:**
- Statements: >93%
- Branches: >88%
- Functions: >93%
- Lines: >93%

---

## 🐛 Debugging Failed Tests

### Enable Detailed Output

```bash
# Verbose mode
npx hardhat test tests/security/*.test.js --verbose

# Show stack traces
npx hardhat test tests/security/*.test.js --show-stack-traces

# Run single test
npx hardhat test tests/security/*.test.js --grep "exact test name"
```

### Common Issues

**1. Test timeout:**
```bash
# Increase timeout (default 2min)
npx hardhat test --timeout 300000
```

**2. Gas limit errors:**
```javascript
// In hardhat.config.js
networks: {
  hardhat: {
    blockGasLimit: 30000000
  }
}
```

**3. Mock contracts not found:**
```bash
# Create required mock contracts in tests/security/mocks/
# See SECURITY_TEST_SUITE.md for mock contract templates
```

---

## ⚡ Gas Profiling

```bash
# Run with gas reporting
REPORT_GAS=true npx hardhat test tests/security/*.test.js
```

**Gas Benchmarks:**
- Token transfer: <100,000 gas
- Token approve: <50,000 gas
- Stake tokens: <200,000 gas
- Claim rewards: <150,000 gas
- Private sale purchase: <250,000 gas

---

## 🔒 Security Checklist

Before deploying:

### Critical Tests
- [ ] All reentrancy tests pass
- [ ] All overflow/underflow tests pass
- [ ] All access control tests pass
- [ ] All oracle manipulation tests pass

### Economic Security
- [ ] Flash loan attack tests pass
- [ ] Front-running tests pass
- [ ] Sandwich attack tests pass
- [ ] Reward manipulation tests pass

### Edge Cases
- [ ] Zero value tests pass
- [ ] Maximum value tests pass
- [ ] Boundary condition tests pass
- [ ] Concurrent operation tests pass

### Integration
- [ ] Cross-contract tests pass
- [ ] State consistency tests pass
- [ ] Multi-step attack tests pass

---

## 📈 Continuous Integration

### GitHub Actions Example

```yaml
name: Security Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  security:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run security tests
        run: npx hardhat test tests/security/*.test.js

      - name: Generate coverage
        run: npx hardhat coverage --testfiles "tests/security/*.test.js"

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
          fail_ci_if_error: true
```

---

## 🎓 Understanding Test Results

### Passing Test Example
```
✓ Should prevent reentrancy in transfer (234ms)
```
- ✅ Vulnerability is properly mitigated
- Time indicates test execution duration
- Normal range: 50-500ms per test

### Failing Test Example
```
✗ Should prevent reentrancy in transfer (234ms)
  Error: Expected transaction to be reverted with "ReentrancyGuard", but it succeeded
```
- ❌ Vulnerability exists!
- Must fix before deployment
- Review contract code for missing guards

---

## 🔍 Additional Security Validation

### Static Analysis Tools

```bash
# Install Slither
pip3 install slither-analyzer

# Run Slither
slither src/contracts/

# Install Mythril
pip3 install mythril

# Run Mythril
myth analyze src/contracts/Token.sol
```

### Formal Verification

```bash
# Install Echidna (fuzzing)
# Install via: https://github.com/crytic/echidna

echidna-test src/contracts/ --contract HypeAI --config echidna.yaml
```

---

## 📞 Getting Help

### Test Failures
1. Check test output for specific error
2. Review contract code at indicated line
3. Compare with expected behavior
4. Add debugging console.logs if needed

### Questions
- 📧 Email: security@hypeai.io
- 📚 Docs: `/docs/security/SECURITY_TEST_SUITE.md`
- 🐛 Issues: GitHub Issues

---

## 🏆 Success Criteria

**✅ Ready for Audit when:**
- All 195+ security tests pass
- Code coverage >90%
- Gas usage within limits
- Zero high/critical findings
- All medium findings addressed

**✅ Ready for Mainnet when:**
- External audit completed
- Audit recommendations implemented
- Community review period completed
- Bug bounty program active

---

**Last Updated:** 2025-10-21
**Status:** ✅ Complete
**Next Step:** Run tests → Fix any failures → External audit
