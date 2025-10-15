#!/bin/bash

# HypeAI AI Marketing Bot - Quick Setup Script
# Automatically installs and configures everything

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${PURPLE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🤖 HypeAI AI Marketing Bot Setup 🤖                   ║
║                                                          ║
║   Autonomous Marketing System Installer                 ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

# Step 1: Check Node.js
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Step 1: Checking Node.js...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    echo -e "${YELLOW}Please install Node.js from: https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}\n"

# Step 2: Install Dependencies
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Step 2: Installing npm packages...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

cd "$PROJECT_ROOT"

# Create package.json if not exists
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}Creating package.json...${NC}"
    npm init -y
fi

# Install required packages
echo -e "${YELLOW}Installing dependencies...${NC}\n"

npm install --save \
    openai \
    axios \
    dotenv \
    twitter-api-v2 \
    node-telegram-bot-api \
    sharp \
    node-cron

echo -e "\n${GREEN}✅ Dependencies installed!${NC}\n"

# Step 3: Setup .env
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Step 3: Configuring environment...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created!${NC}\n"
else
    echo -e "${GREEN}✅ .env file already exists${NC}\n"
fi

# Step 4: API Keys Setup
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Step 4: API Keys Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}You need to add your API keys to .env file${NC}\n"
echo -e "Required APIs:"
echo -e "  1️⃣  ${CYAN}OpenAI${NC} (for AI content generation)"
echo -e "      → Get key: ${BLUE}https://platform.openai.com/api-keys${NC}"
echo -e ""
echo -e "  2️⃣  ${CYAN}Twitter${NC} (for posting tweets)"
echo -e "      → Get keys: ${BLUE}https://developer.twitter.com/en/portal/dashboard${NC}"
echo -e ""
echo -e "  3️⃣  ${CYAN}Telegram${NC} (for posting to channel)"
echo -e "      → Create bot: ${BLUE}https://t.me/BotFather${NC}"
echo -e ""

echo -e "${YELLOW}Optional APIs:${NC}"
echo -e "  • Discord (webhooks)"
echo -e "  • Medium (publishing)"
echo -e ""

read -p "$(echo -e ${CYAN}"Do you want to configure API keys now? (y/n): "${NC})" configure_now

if [[ "$configure_now" == "y" || "$configure_now" == "Y" ]]; then
    echo ""
    echo -e "${CYAN}Let's configure your API keys!${NC}\n"

    # OpenAI
    read -p "$(echo -e ${YELLOW}"Enter OpenAI API Key (or press Enter to skip): "${NC})" openai_key
    if [ ! -z "$openai_key" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$openai_key/" .env
        else
            sed -i "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$openai_key/" .env
        fi
        echo -e "${GREEN}✅ OpenAI key saved${NC}\n"
    fi

    # Twitter
    read -p "$(echo -e ${YELLOW}"Enter Twitter API Key (or press Enter to skip): "${NC})" twitter_key
    if [ ! -z "$twitter_key" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/TWITTER_API_KEY=.*/TWITTER_API_KEY=$twitter_key/" .env
        else
            sed -i "s/TWITTER_API_KEY=.*/TWITTER_API_KEY=$twitter_key/" .env
        fi
        echo -e "${GREEN}✅ Twitter key saved${NC}\n"
    fi

    # Telegram
    read -p "$(echo -e ${YELLOW}"Enter Telegram Bot Token (or press Enter to skip): "${NC})" telegram_token
    if [ ! -z "$telegram_token" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/TELEGRAM_BOT_TOKEN=.*/TELEGRAM_BOT_TOKEN=$telegram_token/" .env
        else
            sed -i "s/TELEGRAM_BOT_TOKEN=.*/TELEGRAM_BOT_TOKEN=$telegram_token/" .env
        fi
        echo -e "${GREEN}✅ Telegram token saved${NC}\n"
    fi

    echo -e "${GREEN}✅ API keys configured!${NC}\n"
else
    echo -e "${YELLOW}⚠️  Remember to edit .env file manually later!${NC}\n"
fi

# Step 5: Create directories
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Step 5: Creating directories...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

mkdir -p .marketing/{metrics,logs,images,content}
mkdir -p logs

echo -e "${GREEN}✅ Directories created!${NC}\n"

# Step 6: Make scripts executable
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Step 6: Setting permissions...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

chmod +x scripts/*.sh
chmod +x scripts/*.js

echo -e "${GREEN}✅ Permissions set!${NC}\n"

# Step 7: Test installation
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Step 7: Testing installation...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Running quick test...${NC}\n"

node scripts/ai-marketing-bot.js config > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Bot is ready!${NC}\n"
else
    echo -e "${RED}⚠️  Some issues detected. Check logs.${NC}\n"
fi

# Installation Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}🎉 INSTALLATION COMPLETE!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

cat << EOF
$(echo -e ${GREEN}✅ What's installed:${NC})
  • Node.js dependencies
  • AI Marketing Bot scripts
  • Configuration files
  • Directory structure

$(echo -e ${CYAN}📋 Next Steps:${NC})

  1️⃣  Edit API keys in .env file:
     $(echo -e ${YELLOW}nano .env${NC})
     $(echo -e ${YELLOW}# or: code .env${NC})

  2️⃣  Run a demo test:
     $(echo -e ${YELLOW}node scripts/ai-marketing-bot.js demo${NC})

  3️⃣  Start the bot:
     $(echo -e ${YELLOW}node scripts/ai-marketing-bot.js start${NC})

  4️⃣  Or use PM2 for 24/7 operation:
     $(echo -e ${YELLOW}npm install -g pm2${NC})
     $(echo -e ${YELLOW}pm2 start scripts/ai-marketing-bot.js --name "marketing-bot"${NC})

$(echo -e ${CYAN}📚 Documentation:${NC})
  • Setup Guide: docs/AI_BOT_SETUP.md
  • Marketing Strategy: docs/MARKETING_STRATEGY.md
  • API Key Instructions: .env.example

$(echo -e ${CYAN}🔗 Helpful Links:${NC})
  • OpenAI API: https://platform.openai.com/api-keys
  • Twitter Dev: https://developer.twitter.com/en/portal/dashboard
  • Telegram Bot: https://t.me/BotFather
  • Full Docs: docs/AI_BOT_SETUP.md

$(echo -e ${CYAN}🆘 Need Help?${NC})
  • Telegram: https://t.me/hypeai_support
  • Email: support@hypeai.io
  • Docs: docs/AI_BOT_SETUP.md

EOF

echo -e "${PURPLE}🤖 AI Marketing Bot is ready to launch your project! 🚀${NC}\n"

# Ask to run demo
read -p "$(echo -e ${CYAN}"Would you like to run a demo now? (y/n): "${NC})" run_demo

if [[ "$run_demo" == "y" || "$run_demo" == "Y" ]]; then
    echo -e "\n${YELLOW}Starting demo...${NC}\n"
    node scripts/ai-marketing-bot.js demo
fi

echo -e "\n${GREEN}Setup complete! Happy marketing! 🎉${NC}\n"
