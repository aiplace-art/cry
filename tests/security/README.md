# 🔒 HYPEAI Security Test Suite

## 📁 Directory Contents

```
/tests/security/
├── README.md (this file)
├── security-test-spec.md              # Specification
├── token-security.test.js             # Token tests (45+)
├── referral-security.test.js          # Referral tests (50+)
├── private-sale-security.test.js      # Private Sale tests (40+)
├── staking-security.test.js           # Staking tests (35+)
└── integration-attacks.test.js        # Integration tests (25+)
```

## 🚀 Quick Start

```bash
# Run all security tests
npx hardhat test tests/security/*.test.js

# Run specific test file
npx hardhat test tests/security/token-security.test.js

# Generate coverage
npx hardhat coverage --testfiles "tests/security/*.test.js"
```

## 📊 Test Summary

| File | Tests | Focus |
|------|-------|-------|
| `token-security.test.js` | 45+ | Reentrancy, Overflow, Access Control |
| `referral-security.test.js` | 50+ | Circular Refs, Reward Manipulation |
| `private-sale-security.test.js` | 40+ | Oracle, Payment Attacks |
| `staking-security.test.js` | 35+ | Lock Period, Reward Farming |
| `integration-attacks.test.js` | 25+ | Cross-Contract Exploits |

**Total: 195+ security tests**

## 🛡️ What's Tested

### Critical Vulnerabilities
- ✅ Reentrancy attacks (13 scenarios)
- ✅ Integer overflow/underflow (13 scenarios)
- ✅ Access control bypass (25 scenarios)
- ✅ Oracle manipulation (5 scenarios)
- ✅ Flash loan attacks (3 scenarios)

### Economic Attacks
- ✅ Reward manipulation (10 scenarios)
- ✅ Front-running (8 scenarios)
- ✅ Sandwich attacks (2 scenarios)
- ✅ Circular referrals (5 scenarios)
- ✅ Sybil attacks (3 scenarios)

### Edge Cases
- ✅ Zero values (10+ scenarios)
- ✅ Maximum values (10+ scenarios)
- ✅ Boundary conditions (10+ scenarios)
- ✅ Concurrent operations (10+ scenarios)

## 📚 Documentation

See `/docs/security/` for complete documentation:

- **SECURITY_TEST_SUITE.md** - Full test suite documentation
- **SECURITY_TEST_EXECUTION_GUIDE.md** - How to run tests
- **SECURITY_SUITE_SUMMARY.md** - Delivery summary

## ✅ Pre-Deployment Checklist

- [ ] All 195+ tests pass
- [ ] Coverage >90%
- [ ] Gas usage within limits
- [ ] Zero critical findings
- [ ] All medium findings addressed
- [ ] External audit completed
- [ ] Bug bounty active

## 📞 Support

- **Docs:** `/docs/security/SECURITY_TEST_SUITE.md`
- **Guide:** `/docs/security/SECURITY_TEST_EXECUTION_GUIDE.md`
- **Email:** security@hypeai.io

---

**Status:** ✅ Production Ready
**Last Updated:** 2025-10-21
**Version:** 1.0.0
