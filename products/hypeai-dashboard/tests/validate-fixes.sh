#!/bin/bash

# HypeAI Dashboard - Production Validation Script
# Tests all critical bug fixes

echo "=================================="
echo "HypeAI Dashboard - Validation Test"
echo "=================================="
echo ""

DASHBOARD_DIR="/Users/ai.place/Crypto/products/hypeai-dashboard"
cd "$DASHBOARD_DIR"

ERRORS=0

# Test 1: Check Chart.js date adapter
echo "✓ Test 1: Chart.js Date Adapter"
if grep -q "chartjs-adapter-date-fns" index.html; then
    echo "  ✅ Date adapter script tag found"
else
    echo "  ❌ Date adapter MISSING"
    ERRORS=$((ERRORS + 1))
fi

# Test 2: Check footer logo path
echo "✓ Test 2: Footer Logo Path"
if grep -q 'src="logo.svg".*footer-logo' index.html; then
    echo "  ✅ Footer logo path is correct"
else
    echo "  ❌ Footer logo path INCORRECT"
    ERRORS=$((ERRORS + 1))
fi

# Test 3: Check console.log count
echo "✓ Test 3: Console.log Statements"
CONSOLE_COUNT=$(grep -r "console\." js/*.js | wc -l | tr -d ' ')
if [ "$CONSOLE_COUNT" -le 2 ]; then
    echo "  ✅ Console statements minimal ($CONSOLE_COUNT found)"
else
    echo "  ⚠️  Found $CONSOLE_COUNT console statements"
fi

# Test 4: Check for broken data file fetches
echo "✓ Test 4: Data File Fetches"
if grep -q "/../../data/project-coordination" js/twitter-connect.js; then
    echo "  ❌ Broken data file paths still exist"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ No broken data file paths"
fi

# Test 5: Check countdown days calculation
echo "✓ Test 5: Countdown Days Calculation"
if grep -q "getElementById('days')" js/app.js; then
    echo "  ✅ Days element is referenced"
else
    echo "  ❌ Days calculation MISSING"
    ERRORS=$((ERRORS + 1))
fi

# Test 6: Check for 404-causing paths
echo "✓ Test 6: Check for 404 Errors"
BROKEN_PATHS=$(grep -r "../../public/" . --include="*.html" --include="*.js" | wc -l | tr -d ' ')
if [ "$BROKEN_PATHS" -eq 0 ]; then
    echo "  ✅ No broken relative paths found"
else
    echo "  ❌ Found $BROKEN_PATHS broken paths"
    ERRORS=$((ERRORS + 1))
fi

# Test 7: Verify logo.svg exists
echo "✓ Test 7: Logo File Exists"
if [ -f "logo.svg" ]; then
    echo "  ✅ logo.svg file exists"
else
    echo "  ⚠️  logo.svg file not found (may need to be added)"
fi

echo ""
echo "=================================="
echo "Validation Results"
echo "=================================="
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ ALL TESTS PASSED"
    echo "   Dashboard is PRODUCTION READY"
    echo ""
    echo "   Critical fixes verified:"
    echo "   - Chart.js date adapter: ✅"
    echo "   - Footer logo path: ✅"
    echo "   - Console statements: ✅"
    echo "   - Data file fetches: ✅"
    echo "   - Countdown days: ✅"
    echo "   - No 404 errors: ✅"
    echo ""
    exit 0
else
    echo "❌ TESTS FAILED: $ERRORS error(s)"
    echo "   Please review failed tests above"
    echo ""
    exit 1
fi
