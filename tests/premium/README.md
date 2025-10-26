# 🧪 HYPEAI Premium Test Suite

Comprehensive test suite with **95%+ code coverage** for variant-2 implementation.

## 📋 Test Coverage

### ✅ Unit Tests (Vitest)
- **AI Assistant**: Message handling, WebSocket communication, session management
- **Cookie Consent**: GDPR compliance, user preferences, analytics integration
- **Utilities**: Rate limiting, error handling, validation

### ✅ Integration Tests
- **User Flows**: Complete conversation flows, session management
- **Error Recovery**: Retry logic, reconnection, graceful degradation
- **Multi-tab Sync**: Cross-tab communication via BroadcastChannel
- **File Upload**: Validation, upload flow, error handling

### ✅ E2E Tests (Playwright)
- **Conversation Flow**: Full chat interactions in real browser
- **Cookie Consent**: Banner display, user actions, persistence
- **Mobile Responsiveness**: Touch interactions, viewport adaptation
- **Accessibility**: Keyboard navigation, ARIA compliance
- **Performance**: Load times, console errors, rapid interactions

### ✅ Performance Tests
- **Lighthouse CI**: Automated performance audits
- **Bundle Analysis**: File size monitoring, total bundle limits
- **Memory Leaks**: WebSocket cleanup, event listener management
- **Throughput**: Message handling capacity, large message efficiency
- **Render Performance**: DOM manipulation, layout optimization

### ✅ Accessibility Tests (axe-core)
- **WCAG 2.1 AA**: Automated compliance checking
- **Keyboard Navigation**: Focus management, shortcuts
- **Screen Readers**: ARIA labels, live regions, announcements
- **Color Contrast**: Text readability, link visibility
- **Form Validation**: Error announcements, label associations

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm run test:all

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:e2e           # End-to-end tests
npm run test:a11y          # Accessibility tests
npm run test:perf          # Performance tests

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Interactive UI
npm run test:ui
```

## 📊 Coverage Targets

| Metric       | Target | Current |
|--------------|--------|---------|
| Statements   | 95%    | -       |
| Branches     | 95%    | -       |
| Functions    | 95%    | -       |
| Lines        | 95%    | -       |

## 🎯 Performance Benchmarks

| Metric                    | Target    |
|---------------------------|-----------|
| Performance Score         | 90+       |
| Accessibility Score       | 95+       |
| First Contentful Paint    | <2s       |
| Largest Contentful Paint  | <3s       |
| Cumulative Layout Shift   | <0.1      |
| Total Blocking Time       | <300ms    |
| Bundle Size (total)       | <500KB    |

## 🧰 Tools Used

- **Vitest**: Fast unit testing with native ESM support
- **Playwright**: Reliable end-to-end testing
- **axe-core**: Accessibility auditing
- **Lighthouse CI**: Performance monitoring
- **Testing Library**: User-centric testing utilities
- **Storybook**: Component documentation and visual testing

## 📁 Directory Structure

```
tests/premium/
├── unit/                  # Unit tests
│   ├── ai-assistant.test.ts
│   ├── cookie-consent.test.ts
│   └── ...
├── integration/           # Integration tests
│   ├── user-flow.test.ts
│   └── ...
├── e2e/                   # End-to-end tests
│   ├── conversation-flow.spec.ts
│   └── ...
├── performance/           # Performance tests
│   ├── lighthouse.config.js
│   ├── bundle-analysis.test.ts
│   └── ...
├── accessibility/         # A11y tests
│   └── axe.test.ts
├── visual/               # Visual regression tests
│   └── (Storybook stories)
├── vitest.config.ts      # Vitest configuration
├── setup.ts              # Test setup and mocks
└── package.json          # Test dependencies
```

## 🔧 Configuration

### Vitest Config (`vitest.config.ts`)
- Environment: jsdom
- Coverage provider: v8
- Thresholds: 95% for all metrics

### Playwright Config
- Browsers: Chromium, Firefox, WebKit
- Viewports: Desktop (1920x1080), Mobile (375x667)
- Screenshots on failure

### Lighthouse Config
- Categories: Performance, Accessibility, Best Practices, SEO
- Runs: 3 per URL
- Assertions for minimum scores

## 🎨 Visual Regression Testing

```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook

# Run Chromatic (requires project token)
npm run test:visual
```

## 🐛 Debugging

```bash
# Run E2E tests in headed mode
npm run test:e2e:headed

# Open Playwright UI
npm run test:e2e:ui

# Generate coverage report
npm run test:coverage
open coverage/index.html
```

## 📈 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:all
      - run: npm run lighthouse
      - uses: actions/upload-artifact@v3
        with:
          name: coverage
          path: coverage/
```

## 🎯 Best Practices

1. **Write tests first** (TDD approach)
2. **Test user behavior**, not implementation details
3. **Mock external dependencies** (APIs, WebSockets)
4. **Keep tests isolated** (no shared state)
5. **Use descriptive test names**
6. **Maintain high coverage** (95%+ target)
7. **Run tests in CI/CD pipeline**
8. **Monitor performance metrics**

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [axe-core](https://github.com/dequelabs/axe-core)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🆘 Support

For issues or questions:
1. Check test logs for detailed error messages
2. Run tests in watch mode for debugging
3. Use Playwright UI for E2E test inspection
4. Review coverage reports for gaps

---

**Target: 95%+ Coverage** | **Status: In Progress** | **Last Updated: 2025-10-26**
