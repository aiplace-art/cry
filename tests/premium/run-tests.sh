#!/bin/bash

# HYPEAI Premium Test Suite Runner
# Comprehensive testing with coverage reports

set -e

echo "🧪 HYPEAI Premium Test Suite"
echo "============================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Run unit tests
echo -e "${BLUE}1️⃣  Running Unit Tests...${NC}"
npm run test:unit

echo ""
echo -e "${BLUE}2️⃣  Running Integration Tests...${NC}"
npm run test:integration

echo ""
echo -e "${BLUE}3️⃣  Running Accessibility Tests...${NC}"
npm run test:a11y

echo ""
echo -e "${BLUE}4️⃣  Running Performance Tests...${NC}"
npm run test:perf

echo ""
echo -e "${BLUE}5️⃣  Generating Coverage Report...${NC}"
npm run test:coverage

echo ""
echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "📊 Coverage Report: ./coverage/index.html"
echo ""

# Optional: E2E tests (requires server)
read -p "Run E2E tests? (requires local server) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}6️⃣  Running E2E Tests...${NC}"
    npm run test:e2e
fi

echo ""
echo -e "${GREEN}🎉 Test suite complete!${NC}"
