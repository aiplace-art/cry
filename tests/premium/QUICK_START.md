# 🚀 Quick Start - Premium Test Suite

## Installation (1 minute)

```bash
cd tests/premium
npm install
```

## Run All Tests (5 minutes)

```bash
# Automated test runner
./run-tests.sh

# Or manually:
npm run test:all
```

## Individual Test Suites

```bash
# Unit tests (fastest - 30 seconds)
npm run test:unit

# Integration tests (1 minute)
npm run test:integration

# Accessibility tests (1 minute)
npm run test:a11y

# Performance tests (2 minutes)
npm run test:perf

# E2E tests (3-5 minutes, requires server)
npm run test:e2e
```

## Coverage Report

```bash
npm run test:coverage
open coverage/index.html
```

## Watch Mode (Development)

```bash
npm run test:watch
# Changes trigger automatic re-run
```

## Visual Testing (Storybook)

```bash
npm run storybook
# Opens at http://localhost:6006
```

## Lighthouse Performance Audit

```bash
# Start local server first
python3 -m http.server 3000 --directory ../../public/variant-2

# Run Lighthouse
npm run lighthouse
```

## Expected Results

✅ **Unit Tests**: 50+ tests, <1s
✅ **Integration Tests**: 20+ tests, 2-3s
✅ **E2E Tests**: 15+ tests, 30-60s
✅ **A11y Tests**: 10+ tests, 5-10s
✅ **Performance**: 90+ scores

## Troubleshooting

### Tests fail with "WebSocket not connected"
```bash
# Start backend server first
cd ../../server
npm start
```

### E2E tests timeout
```bash
# Increase timeout in playwright.config.ts
# Or run in headed mode to debug:
npm run test:e2e:headed
```

### Coverage below 95%
```bash
# Check coverage/index.html for uncovered lines
# Add tests for missing branches
```

## CI/CD Integration

```yaml
# .github/workflows/test.yml
- run: cd tests/premium && npm ci
- run: cd tests/premium && npm run test:all
- run: cd tests/premium && npm run lighthouse
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Run `./run-tests.sh`
3. ✅ Check coverage report
4. ✅ Fix any failing tests
5. ✅ Add to CI/CD pipeline

---

**Need help?** Check `/tests/premium/README.md` for detailed documentation.
