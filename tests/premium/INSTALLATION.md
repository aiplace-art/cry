# 📦 Installation Guide - Premium Test Suite

## Prerequisites

- **Node.js**: v18+ recommended
- **npm**: v9+ or yarn v1.22+
- **Python**: 3.8+ (for local server)
- **Git**: For version control

## Step 1: Navigate to Test Directory

```bash
cd /Users/ai.place/Crypto/tests/premium
```

## Step 2: Install Dependencies

```bash
npm install
```

### What Gets Installed

**Testing Frameworks:**
- `vitest` - Fast unit testing
- `@playwright/test` - E2E testing
- `@testing-library/dom` - User-centric testing utilities

**Coverage & Reporting:**
- `@vitest/coverage-v8` - Coverage provider
- `lighthouse` - Performance auditing
- `lhci` - Lighthouse CI

**Accessibility:**
- `axe-core` - Accessibility engine
- `@axe-core/playwright` - Playwright integration
- `@storybook/addon-a11y` - Storybook integration

**Visual Testing:**
- `storybook` - Component documentation
- `chromatic` - Visual regression testing
- `@storybook/html` - HTML renderer

**Utilities:**
- `jsdom` - DOM implementation
- `happy-dom` - Fast DOM alternative
- `typescript` - Type checking

## Step 3: Verify Installation

```bash
# Check Vitest
npx vitest --version

# Check Playwright
npx playwright --version

# Check Lighthouse
npx lighthouse --version
```

## Step 4: Install Playwright Browsers

```bash
npx playwright install chromium firefox webkit
```

## Step 5: Run Sample Test

```bash
# Run a quick unit test
npm run test:unit -- --run --reporter=verbose
```

Expected output:
```
✓ tests/premium/unit/utilities.test.ts (25)
  ✓ Utilities - Rate Limiter (3)
  ✓ Utilities - Input Validation (5)
  ...

Test Files  3 passed (3)
     Tests  60 passed (60)
  Start at  11:10:00
  Duration  1.23s
```

## Optional: Global Installation

For faster CLI access:

```bash
# Vitest
npm install -g vitest

# Playwright
npm install -g @playwright/test

# Lighthouse
npm install -g lighthouse lhci
```

## Troubleshooting

### Issue: `npm install` fails

**Solution 1: Clear cache**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Solution 2: Use specific Node version**
```bash
# Using nvm
nvm install 18
nvm use 18
npm install
```

### Issue: Playwright browsers not installing

```bash
# Install with sudo (macOS/Linux)
sudo npx playwright install-deps

# Or manually download
npx playwright install --with-deps
```

### Issue: Permission errors

```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Issue: TypeScript errors

```bash
# Install TypeScript globally
npm install -g typescript

# Or use local version
npx tsc --version
```

## Environment Setup

### VS Code Extensions (Recommended)

1. **Vitest** - `vitest.explorer`
2. **Playwright Test** - `ms-playwright.playwright`
3. **ESLint** - `dbaeumer.vscode-eslint`
4. **Prettier** - `esbenp.prettier-vscode`

### VS Code Settings

Already configured in `.vscode/settings.json`:
- ✅ Format on save
- ✅ Vitest integration
- ✅ Auto-fix ESLint
- ✅ TypeScript support

## Verify Complete Setup

Run the full verification:

```bash
./run-tests.sh
```

This will:
1. ✅ Check dependencies
2. ✅ Run unit tests
3. ✅ Run integration tests
4. ✅ Run accessibility tests
5. ✅ Run performance tests
6. ✅ Generate coverage report

## Next Steps

1. ✅ Read `QUICK_START.md` for usage
2. ✅ Check `README.md` for detailed docs
3. ✅ Review `TEST_COVERAGE_REPORT.md` for metrics
4. ✅ Start writing tests!

## Maintenance

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update all
npm update

# Update specific package
npm update vitest
```

### Clean Installation

```bash
# Remove everything and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Support

- **Documentation**: `/tests/premium/README.md`
- **Quick Start**: `/tests/premium/QUICK_START.md`
- **Coverage Report**: `/tests/premium/TEST_COVERAGE_REPORT.md`

---

**Installation Time**: ~2-3 minutes
**Disk Space**: ~500MB (with Playwright browsers)
**Status**: ✅ Ready for testing
