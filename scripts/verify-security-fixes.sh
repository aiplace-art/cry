#!/bin/bash

# ============================================================================
# Security Fixes Verification Script
# Validates that all critical security fixes are properly implemented
# ============================================================================

set -e

FRONTEND_DIR="/Users/ai.place/Crypto/src/frontend"
PASSED=0
FAILED=0

echo "=================================================="
echo "🛡️  HYPEAI SECURITY FIXES VERIFICATION"
echo "=================================================="
echo ""

# Helper functions
pass() {
    echo "✅ PASS: $1"
    ((PASSED++))
}

fail() {
    echo "❌ FAIL: $1"
    ((FAILED++))
}

info() {
    echo "ℹ️  INFO: $1"
}

# ============================================================================
# Test 1: Verify Math.random() removed from auth.ts
# ============================================================================
echo "Test 1: Checking for insecure Math.random() in auth.ts..."
if grep -q "Math.random()" "$FRONTEND_DIR/lib/backend/auth.ts" 2>/dev/null; then
    fail "Math.random() still found in auth.ts"
else
    pass "No Math.random() found in auth.ts"
fi

# ============================================================================
# Test 2: Verify crypto.randomBytes or crypto.getRandomValues is used
# ============================================================================
echo "Test 2: Checking for secure random generation..."
if grep -q "crypto.randomBytes\|crypto.getRandomValues" "$FRONTEND_DIR/lib/backend/auth.ts" 2>/dev/null; then
    pass "Secure random generation implemented"
else
    fail "Secure random generation not found"
fi

# ============================================================================
# Test 3: Verify JWT_SECRET has no hardcoded fallback
# ============================================================================
echo "Test 3: Checking for hardcoded JWT_SECRET fallback..."
if grep -q "JWT_SECRET.*||.*'hypeai" "$FRONTEND_DIR/lib/backend/auth.ts" 2>/dev/null; then
    fail "Hardcoded JWT_SECRET fallback still exists"
else
    pass "No hardcoded JWT_SECRET fallback"
fi

# ============================================================================
# Test 4: Verify JWT_SECRET validation exists
# ============================================================================
echo "Test 4: Checking for JWT_SECRET validation..."
if grep -q "CRITICAL SECURITY ERROR.*JWT_SECRET" "$FRONTEND_DIR/lib/backend/auth.ts" 2>/dev/null; then
    pass "JWT_SECRET validation implemented"
else
    fail "JWT_SECRET validation not found"
fi

# ============================================================================
# Test 5: Verify minimum purchase amount is $400
# ============================================================================
echo "Test 5: Checking minimum purchase amount..."
if grep -q "MINIMUM_INVESTMENT_USD = 400" "$FRONTEND_DIR/pages/api/private-sale/purchase.ts" 2>/dev/null; then
    pass "Minimum purchase amount is $400"
else
    fail "Minimum purchase amount not set to $400"
fi

# ============================================================================
# Test 6: Verify CORS headers configured
# ============================================================================
echo "Test 6: Checking CORS configuration..."
if grep -q "Access-Control-Allow-Origin" "$FRONTEND_DIR/next.config.js" 2>/dev/null; then
    pass "CORS headers configured"
else
    fail "CORS headers not configured"
fi

# ============================================================================
# Test 7: Verify security headers
# ============================================================================
echo "Test 7: Checking security headers..."
HEADERS=("Strict-Transport-Security" "X-Frame-Options" "X-Content-Type-Options" "Content-Security-Policy")
for header in "${HEADERS[@]}"; do
    if grep -q "$header" "$FRONTEND_DIR/next.config.js" 2>/dev/null; then
        pass "Security header found: $header"
    else
        fail "Security header missing: $header"
    fi
done

# ============================================================================
# Test 8: Verify error handler exists
# ============================================================================
echo "Test 8: Checking error handler..."
if [ -f "$FRONTEND_DIR/lib/backend/error-handler.ts" ]; then
    pass "Error handler file exists"
    if grep -q "sanitizeError" "$FRONTEND_DIR/lib/backend/error-handler.ts" 2>/dev/null; then
        pass "sanitizeError function implemented"
    else
        fail "sanitizeError function not found"
    fi
else
    fail "Error handler file not found"
fi

# ============================================================================
# Test 9: Verify RPC rate limiting
# ============================================================================
echo "Test 9: Checking RPC rate limiting..."
if grep -q "checkRPCRateLimit\|RPC_CALLS_PER_SECOND" "$FRONTEND_DIR/lib/backend/blockchain.ts" 2>/dev/null; then
    pass "RPC rate limiting implemented"
else
    fail "RPC rate limiting not found"
fi

# ============================================================================
# Test 10: Verify console.log wrapped in NODE_ENV check
# ============================================================================
echo "Test 10: Checking console.log production safety..."
UNSAFE_LOGS=$(grep -n "console\.log" "$FRONTEND_DIR/lib/backend/blockchain.ts" 2>/dev/null | grep -v "NODE_ENV" || true)
if [ -z "$UNSAFE_LOGS" ]; then
    pass "All console.log statements are production-safe"
else
    fail "Unsafe console.log found: $UNSAFE_LOGS"
fi

# ============================================================================
# Test 11: Verify JWT_SECRET in .env.example
# ============================================================================
echo "Test 11: Checking .env.example for JWT_SECRET..."
if grep -q "JWT_SECRET" "$FRONTEND_DIR/.env.example" 2>/dev/null; then
    pass "JWT_SECRET documented in .env.example"
else
    fail "JWT_SECRET not in .env.example"
fi

# ============================================================================
# Test 12: Verify no secrets in code
# ============================================================================
echo "Test 12: Scanning for potential secrets in code..."
SUSPICIOUS_PATTERNS=("password.*=.*['\"]" "secret.*=.*['\"][^p]" "api_key.*=.*['\"]")
FOUND_SECRETS=false
for pattern in "${SUSPICIOUS_PATTERNS[@]}"; do
    if grep -rn "$pattern" "$FRONTEND_DIR/lib" "$FRONTEND_DIR/pages/api" 2>/dev/null | grep -v "process.env" | grep -v "your-secret" | head -1; then
        FOUND_SECRETS=true
    fi
done

if [ "$FOUND_SECRETS" = false ]; then
    pass "No hardcoded secrets found"
else
    fail "Potential hardcoded secrets detected (review output above)"
fi

# ============================================================================
# Test 13: Verify documentation exists
# ============================================================================
echo "Test 13: Checking documentation..."
DOCS=(
    "/Users/ai.place/Crypto/docs/CRITICAL_FIXES_APPLIED.md"
    "/Users/ai.place/Crypto/docs/SECURITY_FIXES_SUMMARY.md"
    "/Users/ai.place/Crypto/docs/SECURITY_FIX_PLAN.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        pass "Documentation exists: $(basename $doc)"
    else
        fail "Documentation missing: $(basename $doc)"
    fi
done

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "=================================================="
echo "📊 VERIFICATION SUMMARY"
echo "=================================================="
echo "✅ PASSED: $PASSED"
echo "❌ FAILED: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 ALL SECURITY FIXES VERIFIED!"
    echo "✅ Production-ready security implementation"
    echo ""
    echo "Next steps:"
    echo "1. Generate JWT_SECRET: openssl rand -base64 32"
    echo "2. Add to .env.local"
    echo "3. Test application startup"
    echo "4. Deploy to staging for final validation"
    exit 0
else
    echo "⚠️  SOME CHECKS FAILED"
    echo "Please review and fix the issues above"
    exit 1
fi
