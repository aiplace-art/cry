# Quick Integration Guide - Security Modules

## 5-Minute Setup

### Step 1: Add Scripts (1 minute)

Add these lines to your HTML `<head>`:

```html
<!-- Security Modules (load in this order) -->
<script src="/variant-2/js/security.js"></script>
<script src="/variant-2/js/logger.js"></script>
<script src="/variant-2/js/rate-limiter.js"></script>
<script src="/variant-2/js/wallet-secure.js"></script>
```

### Step 2: Update Wallet Button (30 seconds)

Replace your connect wallet button:

```html
<!-- OLD -->
<button id="connectWallet">Connect Wallet</button>

<!-- NEW -->
<button id="connectWallet" onclick="WalletSecure.connect()">
  Connect Wallet
</button>
```

The secure module handles everything automatically!

### Step 3: Enable Apache Modules (2 minutes)

```bash
# Enable required modules
sudo a2enmod headers
sudo a2enmod rewrite

# Restart Apache
sudo service apache2 restart
```

### Step 4: Verify (1 minute)

Open browser console and test:

```javascript
// Test XSS protection
SecurityUtils.escapeHTML('<script>alert("test")</script>');
// Should output: &lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;

// Test wallet security
WalletSecure.isConnected();
// Should return: false (or true if already connected)

// Test rate limiter
const limiter = new RateLimiter(5, 60000);
limiter.isAllowed('test');
// Should return: true
```

**Done!** Your dashboard is now Binance-level secure.

---

## Usage Examples

### Sanitize User Input

```javascript
// Before displaying any user input
const userInput = '<img src=x onerror=alert("XSS")>';
const safe = SecurityUtils.escapeHTML(userInput);
document.getElementById('output').textContent = safe;
```

### Validate Email

```javascript
const email = document.getElementById('email').value;
if (SecurityUtils.validateEmail(email)) {
  // Process email
} else {
  alert('Invalid email address');
}
```

### Validate Amounts

```javascript
const amount = document.getElementById('amount').value;
if (SecurityUtils.validateAmount(amount, 0.01, 1000000)) {
  // Process amount
} else {
  alert('Invalid amount');
}
```

### Rate Limit API Calls

```javascript
const apiLimiter = new RateLimiter(10, 60000); // 10 calls per minute

async function callAPI() {
  if (!apiLimiter.isAllowed('api_call')) {
    alert('Too many requests. Please wait.');
    return;
  }

  // Make API call
  const response = await fetch('/api/endpoint');
}
```

### Connect Wallet Securely

```javascript
// Auto-initialized, just call:
await WalletSecure.connect();

// Check connection status
if (WalletSecure.isConnected()) {
  const address = WalletSecure.getAddress();
  console.log('Connected:', address);
}

// Disconnect
WalletSecure.disconnect();
```

### Log Safely

```javascript
// Development only - removed in production
Logger.log('Debug info', { data: value });

// Always logged but sanitized
Logger.error('Error occurred', { error: e });

// Track user actions
Logger.track('button_clicked', { button: 'buy' });
```

---

## Common Patterns

### Form Submission

```javascript
document.getElementById('myForm').addEventListener('submit', (e) => {
  e.preventDefault();

  // Get and validate inputs
  const email = e.target.email.value;
  const amount = e.target.amount.value;

  // Validate
  if (!SecurityUtils.validateEmail(email)) {
    alert('Invalid email');
    return;
  }

  if (!SecurityUtils.validateAmount(amount)) {
    alert('Invalid amount');
    return;
  }

  // Sanitize before sending
  const data = {
    email: SecurityUtils.escapeHTML(email),
    amount: parseFloat(amount)
  };

  // Submit safely
  submitForm(data);
});
```

### Dynamic Content

```javascript
// Rendering user-generated content
function renderComment(comment) {
  const container = document.getElementById('comments');
  const div = document.createElement('div');

  // Sanitize all fields
  const safeAuthor = SecurityUtils.escapeHTML(comment.author);
  const safeText = SecurityUtils.escapeHTML(comment.text);

  div.innerHTML = `
    <div class="comment">
      <strong>${safeAuthor}</strong>
      <p>${safeText}</p>
    </div>
  `;

  container.appendChild(div);
}
```

### API Calls with Rate Limiting

```javascript
const apiLimiter = new RateLimiter(10, 60000);

async function fetchData(endpoint) {
  // Check rate limit
  if (!apiLimiter.isAllowed('api')) {
    const wait = Math.ceil(apiLimiter.getTimeUntilReset('api') / 1000);
    alert(`Rate limited. Wait ${wait}s`);
    return null;
  }

  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    return data;
  } catch (error) {
    Logger.error('API call failed', { error });
    return null;
  }
}
```

---

## Troubleshooting

### "SecurityUtils is not defined"

**Solution:** Ensure `security.js` is loaded before other scripts:

```html
<script src="/variant-2/js/security.js"></script> <!-- Load first -->
<script src="/variant-2/js/app.js"></script>
```

### Wallet connection fails

**Check:**
1. Is MetaMask installed?
2. Is WalletSecure loaded?
3. Check console for errors
4. Verify button has correct onclick handler

```javascript
// Debug wallet connection
console.log('WalletSecure loaded:', typeof WalletSecure !== 'undefined');
console.log('MetaMask installed:', typeof window.ethereum !== 'undefined');
```

### Rate limiter not working

**Check localStorage:**

```javascript
// View rate limiter data
const data = localStorage.getItem('rate_limiter_data');
console.log(JSON.parse(data));

// Reset if needed
localStorage.removeItem('rate_limiter_data');
```

### CSP blocking scripts

**Check .htaccess** is in correct location:
- Should be in: `/public/variant-2/.htaccess`
- Not in: `/public/.htaccess`

**Verify Apache modules enabled:**

```bash
apache2ctl -M | grep headers
apache2ctl -M | grep rewrite
```

---

## Performance Tips

### 1. Lazy Load SecurityUtils

```javascript
// Only load when needed
if (needsValidation) {
  if (typeof SecurityUtils === 'undefined') {
    await import('/variant-2/js/security.js');
  }
}
```

### 2. Batch Rate Limit Checks

```javascript
// Check once, use multiple times
const canProceed = limiter.isAllowed('user');
if (canProceed) {
  action1();
  action2();
  action3();
}
```

### 3. Cache Sanitized Values

```javascript
// Don't re-sanitize same value
const cache = new Map();

function getSafe(value) {
  if (!cache.has(value)) {
    cache.set(value, SecurityUtils.escapeHTML(value));
  }
  return cache.get(value);
}
```

---

## Production Checklist

Before deploying to production:

- [ ] All security scripts loaded in HTML
- [ ] .htaccess file in correct location
- [ ] Apache modules enabled (headers, rewrite)
- [ ] SSL certificate installed
- [ ] HTTPS redirect enabled
- [ ] Wallet connection tested
- [ ] Rate limiting tested
- [ ] Console logs removed (Logger does this automatically)
- [ ] XSS protection verified
- [ ] Input validation on all forms
- [ ] Error messages sanitized

---

## Testing Commands

### Test XSS Protection

```javascript
// Should NOT execute alert
const malicious = '<img src=x onerror=alert("XSS")>';
document.body.innerHTML += SecurityUtils.escapeHTML(malicious);
```

### Test Rate Limiting

```javascript
const limiter = new RateLimiter(5, 60000);
for (let i = 0; i < 10; i++) {
  console.log(`Attempt ${i+1}:`, limiter.isAllowed('test'));
}
// First 5 should be true, rest false
```

### Test Wallet Validation

```javascript
console.log('Valid:', SecurityUtils.validateEthAddress('0x1234567890123456789012345678901234567890'));
// true

console.log('Invalid:', SecurityUtils.validateEthAddress('not-an-address'));
// false
```

### Test Logger

```javascript
// Development - should log
Logger.log('Test message');

// Production - should NOT log
Logger.log('This will not appear in production');

// Errors always logged
Logger.error('Test error');
```

---

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `SecurityUtils.escapeHTML()` | Sanitize HTML | `escapeHTML(userInput)` |
| `SecurityUtils.validateEmail()` | Validate email | `validateEmail(email)` |
| `SecurityUtils.validateAmount()` | Validate number | `validateAmount(amount)` |
| `SecurityUtils.validateEthAddress()` | Validate address | `validateEthAddress(addr)` |
| `Logger.log()` | Dev logging | `Logger.log('debug')` |
| `Logger.error()` | Error logging | `Logger.error('err', e)` |
| `Logger.track()` | User tracking | `Logger.track('action')` |
| `RateLimiter.isAllowed()` | Check limit | `limiter.isAllowed(key)` |
| `WalletSecure.connect()` | Connect wallet | `await WalletSecure.connect()` |
| `WalletSecure.disconnect()` | Disconnect | `WalletSecure.disconnect()` |

---

## Support

**Documentation:**
- Full Guide: `/docs/variant-2/SECURITY_IMPLEMENTATION.md`
- Summary: `/docs/variant-2/SECURITY_FIXES_SUMMARY.md`
- Score Card: `/docs/variant-2/SECURITY_SCORE_CARD.md`

**Help:**
- Email: security@hypeai.io
- GitHub: github.com/hypeai/dashboard/issues

---

**Last Updated:** October 19, 2025
**Version:** 1.0
