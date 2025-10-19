# HypeAI Private Sale Dashboard - Test Suite

## 🎯 Coverage Target: 95%+

This comprehensive test suite ensures ZERO BUGS in the Private Sale Dashboard.

## 📁 Test Structure

```
tests/
├── dashboard/              # Component & Integration Tests
│   ├── PrivateSaleWidget.test.tsx
│   ├── hooks.test.tsx
│   └── integration.test.tsx
├── e2e/                   # End-to-End Tests
│   └── private-sale-flow.test.ts
├── smart-contract/        # Smart Contract Tests
│   └── private-sale-contract.test.ts
├── utils/                 # Utility Function Tests
│   └── token-calculations.test.ts
├── setup.js              # Test environment setup
├── jest.config.js        # Jest configuration
└── playwright.config.ts  # Playwright configuration
```

## 🧪 Test Types

### 1. Unit Tests (95%+ Coverage)

**Components:**
- PrivateSaleWidget
  - Wallet connection
  - Amount input validation
  - Token calculation display
  - Purchase flow
  - Success screen
  - Error handling

**Hooks:**
- usePrivateSale
  - Token calculations
  - Purchase processing
  - History tracking
  - Countdown timer
  - Progress tracking
  - Referral system

- useWallet
  - MetaMask connection
  - WalletConnect integration
  - Phantom wallet support
  - Account changes
  - Chain changes

**Utilities:**
- Token calculations
- Bonus tier logic
- Vesting schedule
- Price formatting
- Performance optimization

### 2. Integration Tests

**User Flows:**
- Complete purchase journey
- Multiple sequential purchases
- Real-time updates (countdown, progress)
- State synchronization
- Purchase history management
- Referral system integration
- Error recovery

### 3. E2E Tests (Playwright)

**Complete Workflows:**
- Initial page load
- Wallet connection flow
- Purchase amount input
- Full purchase completion
- Transaction verification
- Responsive design (mobile, tablet, desktop)
- Referral link generation
- FAQ interactions
- Performance benchmarks

**Cross-Browser Testing:**
- Chrome/Chromium
- Firefox
- Safari/WebKit
- Mobile Chrome
- Mobile Safari

### 4. Smart Contract Tests

**Contract Functionality:**
- Deployment and initialization
- Purchase flow with bonus tiers
- Vesting schedule (40% immediate, 60% over 6 months)
- Token claiming
- Referral system (5% bonus)
- Sale management (pause/unpause)
- Security (reentrancy, overflow, validation)
- Gas optimization

## 🚀 Running Tests

### All Tests
```bash
npm run test:all
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Smart Contract Tests
```bash
npm run test:contract
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run coverage
```

### Coverage Threshold Check
```bash
npm run coverage:check
```

## 📊 Coverage Requirements

```javascript
{
  "global": {
    "statements": 95,
    "branches": 90,
    "functions": 95,
    "lines": 95
  }
}
```

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)

- **Environment:** jsdom (browser simulation)
- **Setup:** `tests/setup.js`
- **Coverage:** All frontend components
- **Transform:** @swc/jest (fast TypeScript compilation)
- **Timeout:** 10 seconds per test

### Playwright Configuration (`playwright.config.ts`)

- **Base URL:** http://localhost:3000
- **Browsers:** Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Screenshots:** On failure
- **Video:** On failure
- **Traces:** On first retry

## 📝 Writing Tests

### Unit Test Example

```typescript
describe('ComponentName', () => {
  it('should do something specific', () => {
    // Arrange
    const { result } = renderHook(() => useHook());

    // Act
    result.current.doSomething();

    // Assert
    expect(result.current.value).toBe(expected);
  });
});
```

### E2E Test Example

```typescript
test('should complete user flow', async ({ page }) => {
  await page.goto('/private-sale');
  await page.click('text=Connect MetaMask');
  await expect(page.locator('text=Connected')).toBeVisible();
  // ... continue flow
});
```

### Integration Test Example

```typescript
test('should sync state across components', async () => {
  const { rerender } = render(<Page />);

  // Trigger state change
  await userEvent.click(button);

  // Verify state sync
  rerender(<Page />);
  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

## 🐛 Debugging Tests

### Debug Single Test
```bash
npm test -- --testNamePattern="test name"
```

### Debug with Chrome DevTools
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright Debug Mode
```bash
npx playwright test --debug
```

### View Playwright Report
```bash
npx playwright show-report
```

## 📈 Performance Benchmarks

### Expected Performance

- **Unit Tests:** < 100ms per test
- **Integration Tests:** < 500ms per test
- **E2E Tests:** < 5s per test
- **Total Suite:** < 5 minutes
- **Page Load:** < 3 seconds
- **Component Render:** < 1 second

### Performance Tests

```typescript
test('should render within 1 second', () => {
  const start = performance.now();
  render(<Component />);
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(1000);
});
```

## ✅ Quality Gates

### Before Commit
1. Run unit tests: `npm run test:unit`
2. Check coverage: `npm run coverage:check`
3. Lint tests: `npm run lint:tests`
4. Type check: `npm run type-check`

### Before Push
1. Run all tests: `npm run test:all`
2. Verify coverage: `npm run coverage`
3. Review test output

### CI/CD Pipeline
```bash
npm run test:ci
```

## 🔍 Test Coverage Areas

### ✓ Wallet Integration
- MetaMask connection
- WalletConnect support
- Phantom wallet support
- Account switching
- Network changes
- Connection errors

### ✓ Purchase Flow
- Amount validation (min $50, max $500)
- Token calculation (all bonus tiers)
- Payment method selection
- Transaction submission
- Success confirmation
- Email notifications

### ✓ Vesting System
- Immediate unlock (40%)
- Monthly vesting (10% × 6 months)
- Unlock schedule display
- Claim functionality

### ✓ Referral System
- Link generation
- Clipboard copy
- Referral tracking
- Bonus calculation (5%)

### ✓ UI/UX
- Responsive design
- Loading states
- Error messages
- Accessibility
- Keyboard navigation

### ✓ Security
- Input validation
- XSS prevention
- CSRF protection
- Reentrancy guards
- Integer overflow checks

### ✓ Edge Cases
- Zero amounts
- Decimal inputs
- Maximum values
- Network failures
- Concurrent operations
- Race conditions

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Playwright Docs](https://playwright.dev/)
- [Hardhat Testing](https://hardhat.org/tutorial/testing-contracts)

## 🎯 Test Philosophy

1. **Test behavior, not implementation**
2. **Write tests first (TDD)**
3. **One assertion per test when possible**
4. **Descriptive test names**
5. **Arrange-Act-Assert pattern**
6. **Mock external dependencies**
7. **Test edge cases thoroughly**
8. **Maintain test independence**
9. **Keep tests fast and focused**
10. **Document complex test scenarios**

## 🏆 Success Criteria

- ✅ 95%+ code coverage
- ✅ All tests passing
- ✅ No console errors/warnings
- ✅ Cross-browser compatibility
- ✅ Performance benchmarks met
- ✅ Security tests passing
- ✅ Accessibility tests passing
- ✅ E2E flows complete successfully

---

**Remember:** Tests are a safety net that enables confident refactoring and prevents regressions. Invest in good tests—they pay dividends in maintainability!
