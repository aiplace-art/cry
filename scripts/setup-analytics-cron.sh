#!/bin/bash

# HypeAI Twitter Analytics - Cron Job Setup Script
# Sets up automated analytics collection and reporting

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANALYTICS_SCRIPT="$PROJECT_DIR/scripts/twitter-analytics.js"
REPORTER_SCRIPT="$PROJECT_DIR/scripts/twitter-reporter.js"

echo "🚀 HypeAI Twitter Analytics - Cron Setup"
echo "========================================"
echo ""
echo "Project directory: $PROJECT_DIR"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Create cron jobs
echo "📝 Creating cron job entries..."
echo ""

CRON_JOBS="
# HypeAI Twitter Analytics - Auto-generated
# Collect analytics daily at 9:00 AM UTC
0 9 * * * cd $PROJECT_DIR && /usr/bin/env node $ANALYTICS_SCRIPT >> $PROJECT_DIR/.twitter/analytics/cron.log 2>&1

# Generate daily report at 9:30 AM UTC
30 9 * * * cd $PROJECT_DIR && /usr/bin/env node $REPORTER_SCRIPT daily >> $PROJECT_DIR/.twitter/analytics/cron.log 2>&1

# Generate weekly report every Monday at 10:00 AM UTC
0 10 * * 1 cd $PROJECT_DIR && /usr/bin/env node $REPORTER_SCRIPT weekly >> $PROJECT_DIR/.twitter/analytics/cron.log 2>&1

# Generate content analysis every Friday at 3:00 PM UTC
0 15 * * 5 cd $PROJECT_DIR && /usr/bin/env node $REPORTER_SCRIPT content >> $PROJECT_DIR/.twitter/analytics/cron.log 2>&1

# Generate competitor analysis every Sunday at 10:00 AM UTC
0 10 * * 0 cd $PROJECT_DIR && /usr/bin/env node $REPORTER_SCRIPT competitors >> $PROJECT_DIR/.twitter/analytics/cron.log 2>&1
"

echo "Cron jobs to be added:"
echo "$CRON_JOBS"
echo ""

# Ask for confirmation
read -p "Do you want to add these cron jobs? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Backup existing crontab
    crontab -l > /tmp/crontab.backup 2>/dev/null || true
    echo "✅ Backed up existing crontab to /tmp/crontab.backup"

    # Add new cron jobs
    (crontab -l 2>/dev/null; echo "$CRON_JOBS") | crontab -
    echo "✅ Cron jobs added successfully"
    echo ""

    echo "Current crontab:"
    crontab -l | grep -A 10 "HypeAI Twitter Analytics"
else
    echo "❌ Cron setup cancelled"
    echo ""
    echo "To add manually, run:"
    echo "  crontab -e"
    echo ""
    echo "Then add these lines:"
    echo "$CRON_JOBS"
fi

echo ""
echo "📋 Manual Testing Commands:"
echo "  node $ANALYTICS_SCRIPT"
echo "  node $REPORTER_SCRIPT all"
echo ""
echo "📊 View Dashboard:"
echo "  open $PROJECT_DIR/scripts/analytics-dashboard.html"
echo ""
echo "📝 Log File Location:"
echo "  $PROJECT_DIR/.twitter/analytics/cron.log"
echo ""
echo "✅ Setup complete!"
