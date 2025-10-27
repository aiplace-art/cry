# 🚀 Testing Quick Reference - HYPEAI Platform

**Quick access guide for developers and QA engineers**

---

## 📊 Current Test Status (At a Glance)

```
✅ Unit Tests:        30+ files  (GOOD)
✅ Integration:       10+ files  (GOOD)
✅ Security:          10+ files  (EXCELLENT)
⚠️  E2E Tests:        2 files    (CRITICAL GAP)
⚠️  Performance:      2 files    (NEED MORE)
❌ Mobile Tests:      0 files    (MISSING)
❌ Visual Regression: 0 files    (MISSING)

Overall Score: 65% → Target: 85%
```

---

## 🎯 Critical Missing Tests

### 🔴 MUST HAVE (Week 1-2)

1. **E2E User Journeys** (ZERO coverage)
   - `/tests/e2e/journeys/new-user-onboarding.spec.js` ❌
   - `/tests/e2e/journeys/token-purchase-flow.spec.js` ❌
   - `/tests/e2e/journeys/ai-assistant-usage.spec.js` ❌

2. **Mobile Testing** (ZERO coverage)
   - `/tests/e2e/mobile/mobile-navigation.spec.js` ❌
   - `/tests/e2e/mobile/mobile-chat.spec.js` ❌
   - `/tests/e2e/mobile/touch-gestures.spec.js` ❌

3. **Visual Regression** (ZERO coverage)
   - `/tests/visual/homepage-visual.spec.js` ❌
   - `/tests/visual/services-page-visual.spec.js` ❌
   - `/tests/visual/mobile-visual.spec.js` ❌

### 🟡 SHOULD HAVE (Week 3-4)

4. **Load Testing**
   - `/tests/performance/load/ai-chat-load.test.js` ❌
   - `/tests/performance/load/concurrent-users.test.js` ❌

5. **Accessibility Enhancements**
   - `/tests/accessibility/keyboard-navigation.spec.js` ❌
   - `/tests/accessibility/screen-reader.spec.js` ❌

---

## ⚡ Quick Start Commands

### Run All Tests
```bash
# Run entire test suite
npm test

# Run with coverage
npm run test:coverage
```

### Run Specific Test Types
```bash
# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e

# Performance tests
npm run test:performance

# Accessibility tests
npm run test:a11y

# Cross-browser tests
npm run test:browsers
```

### Run Single Test File
```bash
# Jest (unit/integration)
npm test -- tests/unit/ai-assistant.test.js

# Playwright (E2E)
npx playwright test tests/e2e/journeys/new-user-onboarding.spec.js
```

### Watch Mode (Development)
```bash
# Jest watch mode
npm test -- --watch

# Playwright UI mode
npx playwright test --ui
```

---

## 📁 Test File Organization

```
tests/
├── unit/                     # ✅ 30+ files (GOOD)
│   ├── frontend/
│   │   ├── ai-assistant.test.js
│   │   ├── cookie-consent.test.js ❌ NEED
│   │   └── wallet-connection.test.js ❌ NEED
│   └── backend/
│       ├── api-backend.test.js
│       └── groq-integration.test.js ❌ NEED
│
├── integration/              # ✅ 10+ files (GOOD)
│   ├── api/
│   │   ├── chat-groq.test.js
│   │   └── wallet-integration.test.js ❌ NEED
│   └── components/
│       └── ai-chat-full-flow.test.js ❌ NEED
│
├── e2e/                      # ⚠️ 2 files (CRITICAL GAP)
│   ├── journeys/
│   │   ├── new-user-onboarding.spec.js ❌ CRITICAL
│   │   ├── token-purchase-flow.spec.js ❌ CRITICAL
│   │   └── ai-assistant-usage.spec.js ❌ CRITICAL
│   ├── mobile/
│   │   ├── mobile-navigation.spec.js ❌ CRITICAL
│   │   └── touch-gestures.spec.js ❌ CRITICAL
│   └── smoke/
│       └── critical-paths.spec.js ❌ NEED
│
├── performance/              # ⚠️ 2 files (NEED MORE)
│   ├── load/
│   │   ├── ai-chat-load.test.js ❌ NEED
│   │   └── concurrent-users.test.js ❌ NEED
│   └── frontend/
│       └── core-web-vitals.test.js ❌ NEED
│
├── visual/                   # ❌ 0 files (MISSING)
│   ├── homepage-visual.spec.js ❌ NEED
│   ├── services-page-visual.spec.js ❌ NEED
│   └── mobile-visual.spec.js ❌ NEED
│
├── accessibility/            # ✅ 1 file (NEED MORE)
│   ├── wcag-compliance.test.js ✅
│   ├── keyboard-navigation.spec.js ❌ NEED
│   └── screen-reader.spec.js ❌ NEED
│
├── security/                 # ✅ 10+ files (EXCELLENT)
│   ├── xss-csrf.test.js ✅
│   ├── token-security.test.js ✅
│   └── ... (many more) ✅
│
└── browser/                  # ✅ 1 file (BASIC)
    └── cross-browser.spec.js ✅ (needs mobile)
```

---

## 🧪 Test Templates

### Unit Test Template
```javascript
// /tests/unit/feature-name.test.js

import { describe, test, expect, beforeEach } from '@jest/globals';
import { FeatureName } from '../../src/feature-name';

describe('FeatureName', () => {
  let feature;

  beforeEach(() => {
    feature = new FeatureName();
  });

  describe('method()', () => {
    test('should handle normal case', () => {
      const result = feature.method('input');
      expect(result).toBe('expected');
    });

    test('should handle edge case', () => {
      expect(() => feature.method(null)).toThrow();
    });

    test('should handle async operation', async () => {
      const result = await feature.asyncMethod();
      expect(result).toBeDefined();
    });
  });
});
```

### E2E Test Template
```javascript
// /tests/e2e/journeys/feature-flow.spec.js

import { test, expect } from '@playwright/test';

test.describe('Feature Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete feature journey', async ({ page }) => {
    // Step 1: Initial state
    await expect(page.locator('#element')).toBeVisible();

    // Step 2: User action
    await page.locator('button').click();

    // Step 3: Verify result
    await expect(page.locator('.result')).toContainText('success');
  });

  test('handles error scenario', async ({ page }) => {
    // Trigger error
    await page.route('**/api/**', route => route.abort());

    // Verify error handling
    await page.locator('button').click();
    await expect(page.locator('.error')).toBeVisible();
  });
});
```

### Performance Test Template
```javascript
// /tests/performance/load/feature-load.test.js

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '3m', target: 1000 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const response = http.post('https://hypeai.io/api/endpoint', {
    data: 'test',
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

---

## 🎯 Test Coverage Targets

| Category | Current | Target | Gap |
|----------|---------|--------|-----|
| Overall Code Coverage | 65% | 85% | 20% |
| Unit Test Coverage | 70% | 80% | 10% |
| E2E Critical Flows | 10% | 100% | 90% ⚠️ |
| Mobile Coverage | 0% | 90% | 90% ⚠️ |
| Browser Coverage | 60% | 95% | 35% |
| Performance Tests | 20% | 80% | 60% |
| Accessibility | 70% | 100% | 30% |

---

## 🔍 What to Test (Checklist)

### ✅ Frontend Components
- [x] AI Chat Widget (basic)
- [ ] Cookie Consent ❌
- [ ] Mobile Navigation ❌
- [ ] Service Filtering ❌
- [ ] Wallet Connection ❌
- [ ] Toast Notifications ❌
- [ ] Form Validation ❌

### ✅ Backend APIs
- [x] AI Chat Endpoint (basic)
- [x] Authentication ✅
- [x] Referral System ✅
- [ ] Groq Integration ❌
- [ ] Rate Limiting ❌
- [ ] Error Handling ❌

### ✅ User Flows (E2E)
- [ ] New User Onboarding ❌ CRITICAL
- [ ] Token Purchase ❌ CRITICAL
- [ ] AI Assistant Usage ❌ CRITICAL
- [ ] Service Selection ❌ CRITICAL
- [ ] Mobile Experience ❌ CRITICAL

### ✅ Performance
- [x] Response Time (basic)
- [ ] Load Testing (1000+ users) ❌
- [ ] Core Web Vitals ❌
- [ ] Memory Leaks ❌

### ✅ Security
- [x] XSS Prevention ✅
- [x] CSRF Protection ✅
- [x] SQL Injection ✅
- [x] Authentication ✅
- [x] Token Security ✅

### ✅ Accessibility
- [x] WCAG Framework ✅
- [ ] Keyboard Navigation (live) ❌
- [ ] Screen Reader (live) ❌
- [ ] Color Contrast (automated) ❌

---

## 🚨 Pre-Deployment Checklist

Before deploying to production:

```bash
# 1. Run full test suite
npm run test:all

# 2. Check coverage
npm run test:coverage
# ✅ Must be > 80%

# 3. Run E2E tests
npm run test:e2e
# ✅ Must pass all critical flows

# 4. Performance tests
npm run test:performance
# ✅ Response times < 500ms

# 5. Accessibility audit
npm run test:a11y
# ✅ WCAG 2.1 AA compliant

# 6. Security scan
npm run test:security
# ✅ No critical vulnerabilities

# 7. Visual regression
npm run test:visual
# ✅ No unexpected UI changes

# 8. Cross-browser
npm run test:browsers
# ✅ Chrome, Firefox, Safari, Edge
```

---

## 🛠️ Common Test Commands

### Debugging
```bash
# Debug specific test
npm test -- --verbose tests/unit/feature.test.js

# Debug Playwright with inspector
npx playwright test --debug

# Run in headed mode (see browser)
npx playwright test --headed

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=webkit
npx playwright test --project=firefox
```

### Coverage
```bash
# Generate coverage report
npm run test:coverage

# Open coverage report in browser
open coverage/lcov-report/index.html
```

### CI/CD
```bash
# Run in CI mode (no watch, fail on error)
npm run test:ci

# Generate JUnit XML report
npm test -- --ci --reporters=jest-junit
```

---

## 🐛 When Tests Fail

### 1. Check Error Message
```bash
# Run with verbose output
npm test -- --verbose

# Check logs
tail -f logs/test.log
```

### 2. Isolate the Problem
```bash
# Run single test
npm test -- -t "test name pattern"

# Run single file
npm test -- path/to/test.test.js
```

### 3. Debug Interactively
```bash
# Jest debug
node --inspect-brk node_modules/.bin/jest --runInBand

# Playwright debug
npx playwright test --debug
```

### 4. Check Environment
```bash
# Verify Node version
node --version  # Should be >= 18.0.0

# Clear cache
npm run test:clear-cache

# Reinstall dependencies
rm -rf node_modules && npm install
```

---

## 📊 Test Metrics Dashboard

### Key Metrics to Track
- **Test Count:** 45 → Target: 80
- **Code Coverage:** 65% → Target: 85%
- **E2E Coverage:** 10% → Target: 100%
- **Test Duration:** ~5 min → Target: < 10 min
- **Flaky Tests:** <2% (excellent)
- **Bug Escape Rate:** ~8% → Target: < 5%

### Performance Benchmarks
- **API Response Time:** < 500ms (95th percentile)
- **Page Load Time:** < 2s (First Contentful Paint)
- **Time to Interactive:** < 3s
- **Lighthouse Score:** > 90

---

## 🎓 Learning Resources

### Internal
- `/tests/README.md` - Test suite overview
- `/docs/testing/COMPREHENSIVE_TESTING_STRATEGY.md` - Full strategy
- `/docs/testing/` - Testing guidelines

### External
- [Jest Docs](https://jestjs.io/)
- [Playwright Docs](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [k6 Load Testing](https://k6.io/docs/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🚀 Next Actions

### This Week
1. ✅ Create E2E test structure
2. ✅ Write 3 critical E2E tests
3. ✅ Setup mobile testing environment

### Next Week
1. ⏳ Add load testing with k6
2. ⏳ Visual regression setup
3. ⏳ Expand unit test coverage

### This Month
1. ⏳ 85%+ code coverage
2. ⏳ 100% E2E critical flows
3. ⏳ Mobile testing complete

---

**Last Updated:** 2025-10-26
**Maintained by:** QA Team
**Questions?** See `/docs/testing/COMPREHENSIVE_TESTING_STRATEGY.md`
