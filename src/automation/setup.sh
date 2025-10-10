#!/bin/bash

# HypeAI Content Automation Setup Script
# This script sets up the automation system on Linux/Mac

set -e

echo "🚀 HypeAI Content Automation Setup"
echo "===================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ first."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm --version) detected"
echo ""

# Create directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p backups
echo "✅ Directories created"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file and add your API credentials!"
    echo "   Twitter, Telegram, and Discord credentials are required."
    echo ""
else
    echo "✅ .env file exists"
    echo ""
fi

# Test configuration
echo "🧪 Testing configuration..."
node -e "require('dotenv').config(); console.log('✅ Environment variables loaded')"
echo ""

# Install PM2 globally (optional)
read -p "Install PM2 for production deployment? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Installing PM2..."
    npm install -g pm2
    echo "✅ PM2 installed"
    echo ""
fi

# Setup cron jobs (optional)
read -p "Setup cron jobs for automation? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📅 Setting up cron jobs..."

    # Get current directory
    CURRENT_DIR=$(pwd)

    # Create cron entries
    CRON_ENTRIES="
# HypeAI Content Automation
# Start scheduler on reboot
@reboot cd $CURRENT_DIR && node content-scheduler.js start >> logs/cron.log 2>&1

# Daily reminder at 8 AM
0 8 * * * cd $CURRENT_DIR && node calendar-manager.js remind

# Weekly analytics (Mondays at 9 AM)
0 9 * * 1 cd $CURRENT_DIR && node calendar-manager.js analytics >> logs/analytics.log 2>&1
"

    # Add to crontab
    (crontab -l 2>/dev/null; echo "$CRON_ENTRIES") | crontab -

    echo "✅ Cron jobs added"
    echo "   - Scheduler auto-starts on reboot"
    echo "   - Daily reminders at 8 AM"
    echo "   - Weekly analytics on Mondays"
    echo ""
fi

# Test posting (optional)
read -p "Run test post to verify credentials? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧪 Testing multi-platform posting..."
    node multi-publisher.js test
    echo ""
fi

echo "✨ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API credentials"
echo "2. Start scheduler: node content-scheduler.js start"
echo "3. Open admin panel: python3 -m http.server 8080"
echo "4. Or use PM2: pm2 start ecosystem.config.js"
echo ""
echo "Documentation: README.md"
echo "Support: https://github.com/hypeai/automation"
echo ""
