# Comprehensive Testing Guide

## Overview

This document provides a complete guide to the testing framework for the crypto staking application. Our testing strategy follows the testing pyramid approach with emphasis on Test-Driven Development (TDD).

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Structure](#test-structure)
3. [Smart Contract Tests](#smart-contract-tests)
4. [Backend API Tests](#backend-api-tests)
5. [Frontend Tests](#frontend-tests)
6. [E2E Tests](#e2e-tests)
7. [Security Tests](#security-tests)
8. [Performance Tests](#performance-tests)
9. [Running Tests](#running-tests)
10. [CI/CD Integration](#cicd-integration)
11. [Best Practices](#best-practices)

## Testing Philosophy

Our testing approach prioritizes:

- **Test-First Development**: Write tests before implementation
- **Comprehensive Coverage**: Aim for >80% code coverage
- **Fast Feedback**: Tests should run quickly
- **Isolation**: Each test should be independent
- **Readability**: Tests serve as documentation

## Test Structure

```
tests/
├── smart-contracts/      # Hardhat/Truffle tests
│   ├── Token.test.js
│   ├── Staking.test.js
│   └── fixtures/
├── backend/              # API and integration tests
│   ├── api.test.js
│   ├── integration.test.js
│   ├── load.test.js
│   └── helpers/
│       └── database.js
├── frontend/             # React component tests
│   ├── App.test.jsx
│   ├── components/
│   └── hooks/
├── e2e/                  # End-to-end tests
│   ├── staking.spec.js
│   └── auth.spec.js
├── security/             # Security-specific tests
│   └── Security.test.js
└── integration/          # Cross-system tests
```

## Smart Contract Tests

### Technology Stack
- **Hardhat** / **Truffle**: Testing framework
- **Chai**: Assertions
- **Waffle**: Contract testing utilities
- **Ethers.js**: Blockchain interaction

### Token Contract Tests

Located in: `tests/smart-contracts/Token.test.js`

**Coverage:**
- Deployment verification
- Token transfers
- Allowance mechanisms
- Minting and burning
- Gas optimization
- Edge cases

**Example Test:**
```javascript
describe("Token Contract", () => {
  it("Should transfer tokens between accounts", async () => {
    const { token, owner, addr1 } = await loadFixture(deployTokenFixture);

    await expect(token.transfer(addr1.address, ethers.parseEther("50")))
      .to.changeTokenBalances(
        token,
        [owner, addr1],
        [ethers.parseEther("-50"), ethers.parseEther("50")]
      );
  });
});
```

### Staking Contract Tests

Located in: `tests/smart-contracts/Staking.test.js`

**Coverage:**
- Staking operations
- Withdrawal mechanisms
- Reward calculations
- Emergency functions
- Time-based operations
- Gas efficiency

**Running Smart Contract Tests:**
```bash
# Run all contract tests
npx hardhat test

# Run specific test file
npx hardhat test tests/smart-contracts/Token.test.js

# With coverage
npx hardhat coverage

# With gas reporting
REPORT_GAS=true npx hardhat test
```

## Backend API Tests

### Technology Stack
- **Jest**: Test runner
- **Supertest**: HTTP assertions
- **PostgreSQL**: Database testing
- **MongoDB**: NoSQL testing

### API Endpoint Tests

Located in: `tests/backend/api.test.js`

**Coverage:**
- Authentication endpoints
- Wallet operations
- Staking CRUD operations
- Rate limiting
- Error handling
- CORS

**Example Test:**
```javascript
describe('POST /api/staking/stake', () => {
  it('should create staking position', async () => {
    const response = await request(app)
      .post('/api/staking/stake')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: '1000',
        duration: 30,
        transactionHash: '0x123abc...'
      })
      .expect(201);

    expect(response.body).toHaveProperty('stakingId');
  });
});
```

### Integration Tests

Located in: `tests/backend/integration.test.js`

**Coverage:**
- Complete user journeys
- Blockchain integration
- Database transactions
- WebSocket communication
- Caching mechanisms
- External APIs

### Load Tests

Located in: `tests/backend/load.test.js`

**Coverage:**
- Concurrent requests
- Response times
- Memory usage
- Rate limiting
- Stress testing

**Running Load Tests:**
```bash
npm run test:load
```

## Frontend Tests

### Technology Stack
- **React Testing Library**: Component testing
- **Jest**: Test runner
- **User Event**: User interaction simulation

### Component Tests

Located in: `tests/frontend/App.test.jsx`

**Coverage:**
- Component rendering
- User interactions
- State management
- Routing
- Wallet integration
- Error boundaries
- Accessibility

**Example Test:**
```javascript
describe('Wallet Connection', () => {
  it('should connect MetaMask wallet', async () => {
    const { user } = setup(<App />);

    await user.click(screen.getByText('Connect Wallet'));
    await user.click(screen.getByText('MetaMask'));

    await waitFor(() => {
      expect(screen.getByText(/0x742d/)).toBeInTheDocument();
    });
  });
});
```

**Running Frontend Tests:**
```bash
# Run all frontend tests
npm run test:frontend

# Watch mode
npm run test:frontend -- --watch

# With coverage
npm run test:frontend -- --coverage
```

## E2E Tests

### Technology Stack
- **Playwright**: Browser automation
- **Test fixtures**: Setup and teardown

### E2E Test Suites

Located in: `tests/e2e/staking.spec.js`

**Coverage:**
- User registration and login
- Wallet connection
- Complete staking flow
- Dashboard interactions
- Responsive design
- Error scenarios
- Security validation

**Example Test:**
```javascript
test('should complete full staking flow', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Connect wallet
  await page.click('text=Connect Wallet');
  await page.click('text=MetaMask');

  // Navigate to staking
  await page.click('text=Stake Tokens');
  await page.fill('input[name="amount"]', '1000');
  await page.click('button:has-text("Confirm Stake")');

  // Verify success
  await expect(page.locator('text=Staking successful')).toBeVisible();
});
```

**Running E2E Tests:**
```bash
# Run all E2E tests
npx playwright test

# Run specific browser
npx playwright test --project=chromium

# Debug mode
npx playwright test --debug

# Headed mode
npx playwright test --headed

# Generate report
npx playwright show-report
```

## Security Tests

### Technology Stack
- **Hardhat Security**: Contract auditing
- **OWASP ZAP**: Penetration testing
- **Custom test suites**: Specific vulnerability checks

### Security Test Coverage

Located in: `tests/security/Security.test.js`

**Coverage:**
- Reentrancy attacks
- Integer overflow/underflow
- Access control
- Front-running protection
- Denial of Service
- Token safety
- Timestamp manipulation

**Example Test:**
```javascript
describe('Reentrancy Protection', () => {
  it('should prevent reentrancy attacks', async () => {
    const { staking, malicious } = await setup();

    await expect(
      malicious.attack()
    ).to.be.revertedWith("ReentrancyGuard: reentrant call");
  });
});
```

**Running Security Tests:**
```bash
# Run security test suite
npm run test:security

# Run contract security analysis
npx hardhat check

# Run slither analysis
slither .
```

## Performance Tests

### Metrics Tracked
- Response times (p50, p95, p99)
- Throughput (requests/second)
- Error rates
- Memory usage
- Gas consumption

### Performance Benchmarks

| Metric | Target | Critical |
|--------|--------|----------|
| API Response (p95) | <500ms | <1000ms |
| Frontend Load | <2s | <3s |
| Gas per Transfer | <65k | <100k |
| Throughput | >1000 rps | >500 rps |

## Running Tests

### Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:contracts
npm run test:backend
npm run test:frontend
npm run test:e2e
npm run test:security
npm run test:load
```

### Watch Mode

```bash
# Watch smart contracts
npm run test:contracts -- --watch

# Watch backend
npm run test:backend -- --watch

# Watch frontend
npm run test:frontend -- --watch
```

### Coverage Reports

```bash
# Generate all coverage reports
npm run test:coverage

# View HTML report
open coverage/index.html
```

### Test Environment Variables

Create `.env.test` file:

```env
# Database
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_NAME=crypto_test
TEST_DB_USER=test
TEST_DB_PASSWORD=test

# Blockchain
BLOCKCHAIN_NETWORK=hardhat
INFURA_API_KEY=your_key

# API
JWT_SECRET=test_secret
API_PORT=3001

# Frontend
REACT_APP_API_URL=http://localhost:3001
```

## CI/CD Integration

### GitHub Actions Workflow

Located in: `config/ci-cd.yml`

**Pipeline Stages:**
1. **Install**: Dependencies installation
2. **Lint**: Code quality checks
3. **Type Check**: TypeScript validation
4. **Unit Tests**: Fast tests (contracts, backend, frontend)
5. **Integration Tests**: Database and API integration
6. **E2E Tests**: Browser automation tests
7. **Security Scan**: Vulnerability detection
8. **Coverage**: Report generation
9. **Deploy**: Staging/production deployment

### Running CI Pipeline Locally

```bash
# Install act (GitHub Actions locally)
brew install act

# Run pipeline
act -j test
```

## Best Practices

### General Testing Principles

1. **Write Tests First**: Follow TDD methodology
2. **Keep Tests Simple**: One assertion per test when possible
3. **Use Descriptive Names**: Test names should explain what and why
4. **Isolate Tests**: No dependencies between tests
5. **Mock External Services**: Keep tests fast and reliable

### Smart Contract Testing

- Use fixtures for deployment setup
- Test edge cases (zero values, maximum values)
- Verify events are emitted correctly
- Check gas consumption
- Test revert scenarios with proper messages
- Consider time-dependent behaviors

### Backend Testing

- Setup and teardown database for each test
- Use factories for test data
- Mock blockchain interactions
- Test authentication and authorization
- Verify error responses
- Test rate limiting

### Frontend Testing

- Query by accessibility attributes
- Test user interactions, not implementation
- Mock API calls
- Test loading and error states
- Verify accessibility
- Test responsive behavior

### E2E Testing

- Use Page Object Model pattern
- Keep tests independent
- Use test-specific data
- Handle async operations properly
- Test critical user paths
- Verify cross-browser compatibility

## Troubleshooting

### Common Issues

**Smart Contract Tests Failing:**
```bash
# Clean and recompile
npx hardhat clean
npx hardhat compile
```

**Database Connection Errors:**
```bash
# Reset test database
npm run db:reset:test
```

**Frontend Test Timeouts:**
```javascript
// Increase timeout for specific test
test('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

**E2E Tests Flaky:**
- Use explicit waits instead of timeouts
- Increase viewport size if needed
- Check for race conditions
- Verify network stability

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Jest Documentation](https://jestjs.io/docs)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide)

## Continuous Improvement

- Review and update tests with new features
- Monitor test execution times
- Refactor slow or flaky tests
- Keep dependencies updated
- Conduct regular security audits
- Collect and analyze test metrics

---

**Last Updated**: 2025-10-09
**Maintainer**: QA Team
**Version**: 1.0.0
