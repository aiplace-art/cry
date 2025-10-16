#!/bin/bash

# Growth Hacker Bot - Installation Verification Script
# Verifies all files are in place and dependencies are ready

echo "=============================================="
echo "  Growth Hacker Bot - Installation Check"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check file existence
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
    else
        echo -e "${RED}✗${NC} Missing: $1"
        ((ERRORS++))
    fi
}

# Function to check directory
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} Directory exists: $1"
    else
        echo -e "${YELLOW}⚠${NC} Directory missing (will be created on first run): $1"
        ((WARNINGS++))
    fi
}

# Check main bot file
echo "Checking Core Files:"
echo "-------------------"
check_file "/Users/ai.place/Crypto/src/bots/growth-hacker-bot.js"
echo ""

# Check documentation
echo "Checking Documentation:"
echo "----------------------"
check_file "/Users/ai.place/Crypto/docs/growth-bot-guide.md"
check_file "/Users/ai.place/Crypto/src/bots/README-growth-bot.md"
check_file "/Users/ai.place/Crypto/GROWTH-BOT-SUMMARY.md"
echo ""

# Check tests and examples
echo "Checking Tests & Examples:"
echo "-------------------------"
check_file "/Users/ai.place/Crypto/tests/growth-hacker-bot.test.js"
check_file "/Users/ai.place/Crypto/examples/growth-hacker-example.js"
echo ""

# Check data directories (these are created at runtime)
echo "Checking Data Directories:"
echo "-------------------------"
check_dir "/Users/ai.place/Crypto/data/growth-hacker"
echo ""

# Check Node.js
echo "Checking Node.js:"
echo "----------------"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    ((ERRORS++))
fi
echo ""

# Check npm
echo "Checking npm:"
echo "------------"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    ((ERRORS++))
fi
echo ""

# Check package.json
echo "Checking package.json:"
echo "---------------------"
if [ -f "/Users/ai.place/Crypto/package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json found"
else
    echo -e "${YELLOW}⚠${NC} package.json not found - run 'npm init' first"
    ((WARNINGS++))
fi
echo ""

# Check dependencies
echo "Checking Required Dependencies:"
echo "------------------------------"

# Function to check if npm package is installed
check_npm_package() {
    if npm list "$1" &> /dev/null 2>&1 || npm list -g "$1" &> /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $1 installed"
    else
        echo -e "${YELLOW}⚠${NC} $1 not installed (run: npm install $1)"
        ((WARNINGS++))
    fi
}

check_npm_package "node-telegram-bot-api"
check_npm_package "axios"
check_npm_package "node-cron"
check_npm_package "dotenv"
echo ""

# Check .env file
echo "Checking Configuration:"
echo "----------------------"
if [ -f "/Users/ai.place/Crypto/.env" ]; then
    echo -e "${GREEN}✓${NC} .env file found"

    # Check if required variables are set
    if grep -q "GROWTH_BOT_TOKEN" /Users/ai.place/Crypto/.env; then
        echo -e "${GREEN}✓${NC} GROWTH_BOT_TOKEN configured"
    else
        echo -e "${YELLOW}⚠${NC} GROWTH_BOT_TOKEN not found in .env"
        ((WARNINGS++))
    fi

    if grep -q "ADMIN_TELEGRAM_ID" /Users/ai.place/Crypto/.env; then
        echo -e "${GREEN}✓${NC} ADMIN_TELEGRAM_ID configured"
    else
        echo -e "${YELLOW}⚠${NC} ADMIN_TELEGRAM_ID not found in .env"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} .env file not found (create one with bot token and admin ID)"
    ((WARNINGS++))
fi
echo ""

# File size check
echo "File Sizes:"
echo "----------"
ls -lh /Users/ai.place/Crypto/src/bots/growth-hacker-bot.js 2>/dev/null | awk '{print "Bot Implementation: " $5}'
ls -lh /Users/ai.place/Crypto/docs/growth-bot-guide.md 2>/dev/null | awk '{print "Documentation: " $5}'
ls -lh /Users/ai.place/Crypto/tests/growth-hacker-bot.test.js 2>/dev/null | awk '{print "Tests: " $5}'
echo ""

# Summary
echo "=============================================="
echo "  Verification Summary"
echo "=============================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ Perfect!${NC} All checks passed."
    echo ""
    echo "Next steps:"
    echo "1. Install dependencies: npm install node-telegram-bot-api axios node-cron dotenv"
    echo "2. Configure .env file with your bot token and admin ID"
    echo "3. Run the bot: node /Users/ai.place/Crypto/src/bots/growth-hacker-bot.js"
    echo "4. Send /start to your bot in Telegram"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Installation incomplete${NC} - $WARNINGS warning(s)"
    echo ""
    echo "Action required:"
    echo "- Install missing dependencies (see warnings above)"
    echo "- Configure .env file if not done"
    echo ""
    echo "Then run: node /Users/ai.place/Crypto/src/bots/growth-hacker-bot.js"
else
    echo -e "${RED}✗ Installation has issues${NC} - $ERRORS error(s), $WARNINGS warning(s)"
    echo ""
    echo "Please fix the errors above before running the bot."
fi

echo ""
echo "=============================================="

exit $ERRORS
