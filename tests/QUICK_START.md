# Quick Start Guide - Test Suite

## Installation (One-Time Setup)

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# User journey tests only
npm test hyper-chat-user-journey

# Mobile tests only
npm run test:mobile

# Desktop browsers only
npm run test:desktop

# Performance tests only
npm run test:performance

# Accessibility tests only
npm run test:accessibility
```

### Interactive Mode
```bash
# Visual test runner
npm run test:ui

# Debug mode with browser
npm run test:debug

# Run with browser visible
npm run test:headed
```

### View Reports
```bash
npm run test:report
```

## First Test Run

1. **Start the server** (in a separate terminal):
```bash
npm run server
```

2. **Run tests**:
```bash
npm test
```

3. **View results**:
```bash
npm run test:report
```

## Expected Results

**Total Tests:** ~60+ tests
- User Journey: 7 tests
- Mobile (5 devices): 30 tests
- Performance: 7 tests
- Accessibility: 10 tests
- Additional tests: ~10 tests

**Coverage Target:** 85%+

## Troubleshooting

### Port 8080 in use
```bash
# Find and kill process
lsof -ti:8080 | xargs kill -9

# Or use different port in playwright.config.js
```

### Browsers not installed
```bash
npx playwright install
```

### Tests timeout
- Increase timeout in `playwright.config.js`
- Check network connection
- Verify server is running

## CI/CD Integration

Tests are ready for CI/CD with:
- Automatic retries (2x)
- HTML, JSON, JUnit reports
- Screenshots on failure
- Videos on failure

Add to your CI pipeline:
```yaml
- name: Install dependencies
  run: npm install

- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run tests
  run: npm test

- name: Upload reports
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: tests/e2e/reports/
```

## Next Steps

1. ✓ Run all tests
2. ✓ Review coverage report
3. ✓ Fix any failing tests
4. ✓ Add to CI/CD pipeline
5. ✓ Monitor test results

## Support

See `tests/README.md` for detailed documentation.
