# Security Quick Reference Guide

## For Development Agents

This is a condensed security reference for quick consultation during development.

---

## Smart Contract Security (Critical Rules)

### DO's

```solidity
✅ USE OpenZeppelin libraries
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

✅ USE ReentrancyGuard
function withdraw() external nonReentrant { }

✅ USE SafeERC20
using SafeERC20 for IERC20;

✅ USE Checks-Effects-Interactions pattern
function transfer() {
    require(condition);    // Checks
    balance -= amount;     // Effects
    recipient.call();      // Interactions
}

✅ USE AccessControl
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
modifier onlyAdmin() { require(hasRole(ADMIN_ROLE, msg.sender)); _; }

✅ USE Pausable for emergencies
function emergencyPause() external onlyOwner { _pause(); }

✅ EMIT events for all state changes
emit Transfer(from, to, amount);

✅ USE custom errors (Solidity 0.8.4+)
error InsufficientBalance(uint256 available, uint256 required);
```

### DON'Ts

```solidity
❌ NEVER use tx.origin
if (tx.origin == owner) // Vulnerable to phishing!

❌ NEVER ignore return values
token.transfer(to, amount); // Ignores return value!
// Use: require(token.transfer(to, amount));

❌ NEVER use block.timestamp for critical logic
if (block.timestamp > deadline) // Manipulable by miners!

❌ NEVER use delegatecall without validation
target.delegatecall(data); // Extremely dangerous!

❌ NEVER perform external calls before state updates
recipient.call{value: amount}("");
balance -= amount; // REENTRANCY VULNERABILITY!

❌ NEVER hardcode addresses
address constant OWNER = 0x123...; // Use configuration

❌ NEVER use floating pragma
pragma solidity ^0.8.0; // Use: pragma solidity 0.8.20;
```

---

## Backend API Security (Essential Patterns)

### Authentication

```javascript
✅ SECURE JWT IMPLEMENTATION
const token = jwt.sign(
  { userId, role },
  process.env.JWT_SECRET,
  {
    expiresIn: '15m',
    algorithm: 'HS256',
    issuer: 'exchange-api'
  }
);

✅ VERIFY TOKENS
const decoded = jwt.verify(token, secret, {
  algorithms: ['HS256'],
  issuer: 'exchange-api'
});

✅ USE httpOnly COOKIES
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 900000
});

❌ NEVER store tokens in localStorage
localStorage.setItem('token', token); // XSS vulnerable!

❌ NEVER use weak secrets
const secret = 'password123'; // Use 256-bit random key
```

### Input Validation

```javascript
✅ VALIDATE ALL INPUTS
const validateOrder = [
  body('symbol').isString().trim().matches(/^[A-Z]+\/[A-Z]+$/),
  body('quantity').isFloat({ min: 0.00000001, max: 1000000 }),
  body('side').isIn(['buy', 'sell'])
];

✅ USE PARAMETERIZED QUERIES
await db.query('SELECT * FROM users WHERE id = ?', [userId]);

✅ SANITIZE HTML
const clean = DOMPurify.sanitize(dirty);

❌ NEVER concatenate SQL
const query = `SELECT * FROM users WHERE id = ${userId}`; // SQL INJECTION!

❌ NEVER trust user input
const amount = req.body.amount; // Validate first!
```

### Rate Limiting

```javascript
✅ IMPLEMENT RATE LIMITING
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.user?.id || req.ip
});

app.use('/api/', limiter);

✅ DIFFERENT LIMITS PER ENDPOINT
router.post('/api/orders', rateLimiter({ max: 10, windowMs: 1000 }));
router.get('/api/data', rateLimiter({ max: 100, windowMs: 60000 }));
```

---

## Common Vulnerability Patterns

### 1. Reentrancy

**Vulnerable:**
```solidity
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
    balances[msg.sender] -= amount; // Too late!
}
```

**Secure:**
```solidity
function withdraw(uint256 amount) external nonReentrant {
    require(balances[msg.sender] >= amount);
    balances[msg.sender] -= amount; // Update first!
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
}
```

### 2. SQL Injection

**Vulnerable:**
```javascript
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

**Secure:**
```javascript
const query = 'SELECT * FROM users WHERE email = ?';
await db.execute(query, [email]);
```

### 3. XSS

**Vulnerable:**
```javascript
res.send(`<div>${userInput}</div>`); // XSS!
```

**Secure:**
```javascript
const escaped = escapeHtml(userInput);
res.send(`<div>${escaped}</div>`);
```

### 4. Access Control

**Vulnerable:**
```javascript
router.delete('/api/users/:id', async (req, res) => {
  await User.delete(req.params.id); // Anyone can delete!
});
```

**Secure:**
```javascript
router.delete('/api/users/:id',
  authenticate,
  authorize(['ADMIN']),
  async (req, res) => {
    // Check user can only delete themselves or is admin
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await User.delete(req.params.id);
  }
);
```

---

## Security Testing Checklist

### Smart Contracts

```bash
# Static analysis
slither contracts/

# Gas and security
forge test --gas-report
forge test --fuzz-runs 10000

# Coverage
forge coverage
```

### Backend API

```javascript
// Authentication tests
test('requires authentication')
test('rejects invalid tokens')
test('enforces token expiration')

// Authorization tests
test('enforces role-based access')
test('prevents horizontal privilege escalation')
test('prevents vertical privilege escalation')

// Input validation
test('rejects SQL injection attempts')
test('rejects XSS payloads')
test('validates all inputs')

// Rate limiting
test('enforces rate limits')
test('blocks after limit exceeded')
```

---

## Emergency Response

### Smart Contract Emergency

```solidity
// Pause contract
function emergencyPause() external onlyOwner {
    _pause();
}

// Unpause after fix
function unpause() external onlyOwner {
    _unpause();
}
```

### Backend Emergency

```javascript
// Kill switch
if (process.env.EMERGENCY_SHUTDOWN === 'true') {
  app.use((req, res) => {
    res.status(503).json({ error: 'Service temporarily unavailable' });
  });
}

// Rate limit to zero
const emergencyLimiter = rateLimit({
  windowMs: 1000,
  max: 0 // No requests allowed
});
```

---

## Security Headers (Required)

```javascript
const helmet = require('helmet');

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
    imgSrc: ["'self'", "https:"],
    connectSrc: ["'self'"]
  }
}));

app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));
```

---

## Secrets Management

```javascript
✅ USE ENVIRONMENT VARIABLES
const apiKey = process.env.API_KEY;

✅ USE VAULT FOR PRODUCTION
const vault = require('node-vault')();
const secret = await vault.read('secret/data/api-keys');

❌ NEVER COMMIT SECRETS
const apiKey = 'sk_live_123456'; // Never do this!

❌ NEVER LOG SECRETS
console.log('API Key:', apiKey); // Never log secrets!
```

---

## Code Review Checklist (Quick)

### Every Pull Request Must Have:

- [ ] No hardcoded secrets
- [ ] Input validation on all user inputs
- [ ] Parameterized queries (no SQL injection)
- [ ] Authentication and authorization checks
- [ ] Rate limiting on endpoints
- [ ] Error handling (no info leakage)
- [ ] Security tests added
- [ ] Dependencies updated
- [ ] No vulnerable patterns (tx.origin, reentrancy, etc.)
- [ ] Logging without sensitive data

---

## Pre-Deployment Checklist

### Smart Contracts
- [ ] External audit completed
- [ ] All findings resolved
- [ ] Multi-sig configured
- [ ] Emergency pause tested
- [ ] Test coverage >95%

### Backend
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] HTTPS/TLS configured
- [ ] Secrets in vault
- [ ] Monitoring active
- [ ] Backup tested

### Infrastructure
- [ ] Firewall rules set
- [ ] DDoS protection active
- [ ] Intrusion detection enabled
- [ ] Logging configured
- [ ] Alerts configured

---

## Quick Security Commands

```bash
# NPM audit
npm audit
npm audit fix

# Smart contract analysis
slither .
forge test
forge coverage

# Secret scanning
git secrets --scan
gitleaks detect

# Dependency check
npm outdated
npm update

# Security headers test
curl -I https://api.exchange.com

# SSL/TLS test
openssl s_client -connect api.exchange.com:443
```

---

## Resources

- OpenZeppelin Contracts: https://docs.openzeppelin.com/
- OWASP Top 10: https://owasp.org/Top10/
- Smart Contract Security: https://consensys.github.io/smart-contract-best-practices/
- Node.js Security: https://nodejs.org/en/docs/guides/security/

---

**Remember:** Security is not optional. Every line of code must be secure.

**When in doubt:** Ask the security team or refer to the full security audit document.
