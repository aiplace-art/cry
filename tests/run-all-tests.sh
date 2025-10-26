#!/bin/bash

# Comprehensive Test Suite Runner for HypeAI AI-Chat System
# Runs all test categories and generates reports

set -e

echo "🧪 HypeAI AI-Chat Comprehensive Test Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0

# Create reports directory
mkdir -p reports

echo "📦 Installing dependencies..."
cd /Users/ai.place/Crypto
npm install --no-save jest @jest/globals @playwright/test @testing-library/dom @testing-library/jest-dom jest-environment-jsdom @swc/jest 2>/dev/null || true

cd tests

echo ""
echo "1️⃣  Running Unit Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npm test -- --testPathPattern=unit --coverage --json --outputFile=reports/unit-results.json 2>&1 | tee reports/unit-output.txt; then
  echo -e "${GREEN}✅ Unit tests passed${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}❌ Unit tests failed${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "2️⃣  Running Integration Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npm test -- --testPathPattern=integration --json --outputFile=reports/integration-results.json 2>&1 | tee reports/integration-output.txt; then
  echo -e "${GREEN}✅ Integration tests passed${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}❌ Integration tests failed${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "3️⃣  Running Performance Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npm test -- --testPathPattern=performance --json --outputFile=reports/performance-results.json 2>&1 | tee reports/performance-output.txt; then
  echo -e "${GREEN}✅ Performance tests passed${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}❌ Performance tests failed${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "4️⃣  Running Security Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npm test -- --testPathPattern=security --json --outputFile=reports/security-results.json 2>&1 | tee reports/security-output.txt; then
  echo -e "${GREEN}✅ Security tests passed${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}❌ Security tests failed${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "5️⃣  Running Accessibility Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npm test -- --testPathPattern=accessibility --json --outputFile=reports/accessibility-results.json 2>&1 | tee reports/accessibility-output.txt; then
  echo -e "${GREEN}✅ Accessibility tests passed${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}❌ Accessibility tests failed${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "6️⃣  Running Cross-Browser Tests (Playwright)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npx playwright test --reporter=json > reports/browser-results.json 2>&1 | tee reports/browser-output.txt; then
  echo -e "${GREEN}✅ Browser tests passed${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${YELLOW}⚠️  Browser tests skipped or failed (may need server running)${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "📊 Generating Test Report..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Generate summary
cat > reports/test-summary.txt <<EOF
HypeAI AI-Chat Test Suite Results
Generated: $(date)
======================================

Test Categories: 6
Tests Passed: $TESTS_PASSED
Tests Failed: $TESTS_FAILED

Details:
--------
1. Unit Tests: $(if [ -f reports/unit-output.txt ] && grep -q "✅" reports/unit-output.txt; then echo "PASS"; else echo "FAIL"; fi)
2. Integration Tests: $(if [ -f reports/integration-output.txt ] && grep -q "✅" reports/integration-output.txt; then echo "PASS"; else echo "FAIL"; fi)
3. Performance Tests: $(if [ -f reports/performance-output.txt ] && grep -q "✅" reports/performance-output.txt; then echo "PASS"; else echo "FAIL"; fi)
4. Security Tests: $(if [ -f reports/security-output.txt ] && grep -q "✅" reports/security-output.txt; then echo "PASS"; else echo "FAIL"; fi)
5. Accessibility Tests: $(if [ -f reports/accessibility-output.txt ] && grep -q "✅" reports/accessibility-output.txt; then echo "PASS"; else echo "FAIL"; fi)
6. Browser Tests: $(if [ -f reports/browser-output.txt ] && grep -q "✅" reports/browser-output.txt; then echo "PASS"; else echo "SKIP/FAIL"; fi)

Coverage Report:
----------------
$(if [ -f coverage/coverage-summary.json ]; then cat coverage/coverage-summary.json; else echo "Coverage data not available"; fi)

Reports Location:
-----------------
- Full reports: ./reports/
- Coverage: ./coverage/
- HTML reports: Open ./reports/test-report.html in browser

EOF

cat reports/test-summary.txt

echo ""
if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed! ($TESTS_PASSED/6)${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Some tests failed or were skipped ($TESTS_PASSED/$((TESTS_PASSED + TESTS_FAILED)))${NC}"
  echo "Check reports/ directory for details"
  exit 1
fi
