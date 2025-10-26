#!/bin/bash
# ╔════════════════════════════════════════════════════════════════╗
# ║  HYPEAI PLATFORM - URGENT SECURITY FIXES                       ║
# ║  Execute IMMEDIATELY before any production deployment          ║
# ╚════════════════════════════════════════════════════════════════╝

set -e

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                    URGENT SECURITY FIXES                          ║"
echo "║            !!! READ CAREFULLY BEFORE EXECUTING !!!                ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Generate new secrets
echo -e "${YELLOW}[STEP 1/8]${NC} Generating new secrets..."
echo ""
echo "Generating strong JWT secret..."
JWT_SECRET=$(openssl rand -base64 32)
echo "✓ JWT_SECRET generated: ${JWT_SECRET:0:10}..."

echo "Generating random API keys..."
API_KEY=$(openssl rand -hex 32)
echo "✓ API_KEY generated: ${API_KEY:0:10}..."

# Step 2: Backup current .env
echo ""
echo -e "${YELLOW}[STEP 2/8]${NC} Backing up current .env files..."
BACKUP_DIR="env-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
find . -name ".env*" -not -path "*/node_modules/*" -exec cp {} "$BACKUP_DIR/" \; 2>/dev/null || true
echo "✓ Backup created in: $BACKUP_DIR"

# Step 3: Create .gitignore entry
echo ""
echo -e "${YELLOW}[STEP 3/8]${NC} Updating .gitignore..."
if ! grep -q ".env" .gitignore 2>/dev/null; then
    cat >> .gitignore << 'GITIGNORE'

# Environment files
.env
.env.*
!.env.example
GITIGNORE
    echo "✓ .gitignore updated"
else
    echo "✓ .gitignore already contains .env rules"
fi

# Step 4: Remove .env from git history
echo ""
echo -e "${YELLOW}[STEP 4/8]${NC} Removing .env files from git history..."
echo -e "${RED}WARNING: This will rewrite git history!${NC}"
echo "Press Ctrl+C to abort, or Enter to continue..."
read -r

echo "Removing sensitive files from git history..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env .env.* || true" \
  --prune-empty --tag-name-filter cat -- --all

echo "✓ .env files removed from history"

# Step 5: Update JWT secret in code
echo ""
echo -e "${YELLOW}[STEP 5/8]${NC} Fixing hardcoded JWT secrets..."

# File 1: src/backend/middleware/auth.js
if [ -f "src/backend/middleware/auth.js" ]; then
    sed -i.bak "s/const JWT_SECRET = process.env.JWT_SECRET || '.*'/const JWT_SECRET = process.env.JWT_SECRET;\\nif (!JWT_SECRET) {\\n  throw new Error('JWT_SECRET environment variable is required');\\n}/" src/backend/middleware/auth.js
    echo "✓ Fixed src/backend/middleware/auth.js"
fi

# File 2: src/backend/controllers/auth.controller.js
if [ -f "src/backend/controllers/auth.controller.js" ]; then
    sed -i.bak "s/const JWT_SECRET = process.env.JWT_SECRET || '.*'/const JWT_SECRET = process.env.JWT_SECRET;\\nif (!JWT_SECRET) {\\n  throw new Error('JWT_SECRET environment variable is required');\\n}/" src/backend/controllers/auth.controller.js
    echo "✓ Fixed src/backend/controllers/auth.controller.js"
fi

# File 3: src/backend/websocket/wsServer.js
if [ -f "src/backend/websocket/wsServer.js" ]; then
    sed -i.bak "s/process.env.JWT_SECRET || '.*'/process.env.JWT_SECRET/" src/backend/websocket/wsServer.js
    echo "✓ Fixed src/backend/websocket/wsServer.js"
fi

# Step 6: Create new .env files
echo ""
echo -e "${YELLOW}[STEP 6/8]${NC} Creating new .env files with secure secrets..."

cat > .env << ENV
# ═══════════════════════════════════════════════════════
#  HYPEAI PLATFORM - PRODUCTION ENVIRONMENT
#  Generated: $(date +%Y-%m-%d)
#  ⚠️  NEVER commit this file to git!
# ═══════════════════════════════════════════════════════

# Server
NODE_ENV=production
PORT=5000

# JWT Authentication (CRITICAL - Keep Secret!)
JWT_SECRET=${JWT_SECRET}

# Database
MONGODB_URI=mongodb://localhost:27017/crypto-platform
REDIS_URL=redis://localhost:6379

# Blockchain
ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
LOG_LEVEL=info

# API Keys (Generate new ones!)
# API_KEY=${API_KEY}
# Add your actual API keys here
ENV

echo "✓ Created .env with secure secrets"
echo ""
echo -e "${RED}IMPORTANT: Update the following in .env:${NC}"
echo "  - MONGODB_URI (production database)"
echo "  - REDIS_URL (production Redis)"
echo "  - ETH_RPC_URL (your Alchemy/Infura key)"
echo "  - CORS_ORIGIN (your production domain)"
echo "  - Any other API keys"

# Step 7: Install security dependencies
echo ""
echo -e "${YELLOW}[STEP 7/8]${NC} Installing security dependencies..."
npm install --save bcrypt express-rate-limit rate-limit-redis express-validator helmet
echo "✓ Security packages installed"

# Step 8: Create quick fix checklist
echo ""
echo -e "${YELLOW}[STEP 8/8]${NC} Creating fix checklist..."

cat > SECURITY_FIXES_CHECKLIST.md << 'CHECKLIST'
# Security Fixes Checklist

## ✅ Completed Automatically

- [x] Generated strong JWT secret
- [x] Created secure .env file
- [x] Removed .env from git history
- [x] Updated .gitignore
- [x] Fixed hardcoded JWT secrets
- [x] Installed security packages

## 🔴 URGENT - Complete Manually TODAY

### 1. Password Hashing (2 hours)
- [ ] Replace mock auth endpoints in `src/backend/app.js`
- [ ] Implement bcrypt in registration
- [ ] Implement bcrypt in login
- [ ] Test authentication flow

### 2. WebSocket Authentication (4 hours)
- [ ] Add auth check before processing messages
- [ ] Implement rate limiting per connection
- [ ] Add connection timeout
- [ ] Test WebSocket security

### 3. Rate Limiting (6 hours)
- [ ] Setup Redis connection
- [ ] Configure rate limiter middleware
- [ ] Apply to auth endpoints (5 req/15min)
- [ ] Apply to API endpoints (100 req/15min)
- [ ] Test rate limiting

### 4. Environment Variables (1 hour)
- [ ] Update .env with production values
- [ ] Configure MongoDB connection string
- [ ] Add Redis URL
- [ ] Add Alchemy/Infura RPC URL
- [ ] Set production CORS origin
- [ ] Generate and add API keys

## 🟡 HIGH PRIORITY - Complete This Week

### 5. Input Validation (12 hours)
- [ ] Add validation to staking endpoints
- [ ] Add validation to transaction endpoints
- [ ] Add validation to user endpoints
- [ ] Test all validations

### 6. HTTPS Enforcement (4 hours)
- [ ] Setup SSL certificates
- [ ] Configure Nginx/Apache
- [ ] Add HTTPS redirect
- [ ] Enable HSTS headers
- [ ] Test SSL configuration

### 7. Smart Contract Timelock (8 hours)
- [ ] Add timelock to emergency withdraw
- [ ] Implement 3-day delay
- [ ] Add cancel function
- [ ] Update tests
- [ ] Re-deploy contract (testnet first!)

## 📋 Verification Steps

After completing all fixes:

```bash
# 1. Check JWT secret
grep -r "JWT_SECRET.*||" src/ # Should return nothing

# 2. Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. Test rate limiting
for i in {1..10}; do
  curl http://localhost:5000/api/auth/login
done
# Should see rate limit error after 5 requests

# 4. Verify HTTPS
curl -I https://yourdomain.com
# Should return 200 OK with security headers

# 5. Run security audit
npm audit
npm audit fix
```

## 📊 Success Criteria

- [ ] All critical security issues resolved
- [ ] npm audit shows 0 critical vulnerabilities
- [ ] Rate limiting functional
- [ ] HTTPS enabled
- [ ] Passwords hashed with bcrypt
- [ ] WebSocket authenticated
- [ ] Input validation on all endpoints
- [ ] .env files not in git
CHECKLIST

echo "✓ Created SECURITY_FIXES_CHECKLIST.md"

# Final summary
echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                    URGENT FIXES COMPLETED                         ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✓ Automatic fixes completed successfully!${NC}"
echo ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo "1. Review and update .env file with production values"
echo "2. Complete manual fixes in SECURITY_FIXES_CHECKLIST.md"
echo "3. Test all changes in staging environment"
echo "4. Deploy to production"
echo ""
echo -e "${RED}CRITICAL:${NC}"
echo "- NEVER commit .env files to git"
echo "- Rotate ALL API keys before production"
echo "- Complete manual security fixes before launch"
echo ""
echo "Full audit reports:"
echo "  - docs/security/SECURITY_AUDIT_PRODUCTION.md"
echo "  - docs/CODE_REVIEW_FINAL.md"
echo "  - AUDIT_SUMMARY.md"
echo ""
echo "For help: security@hypeai.io"
echo ""
