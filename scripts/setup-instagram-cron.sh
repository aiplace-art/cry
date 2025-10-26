#!/bin/bash

###############################################################################
# Instagram Cron Setup Script
# Configures automated Instagram posting schedule
###############################################################################

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         📸 Instagram Automation Cron Setup                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Get project directory
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CRON_SCRIPT="$PROJECT_DIR/scripts/cron-instagram.sh"

echo "📂 Project directory: $PROJECT_DIR"
echo ""

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x "$CRON_SCRIPT"
chmod +x "$PROJECT_DIR/scripts/instagram-scheduler.js"
chmod +x "$PROJECT_DIR/scripts/instagram-auto-poster.js"
echo "   ✅ Scripts are executable"
echo ""

# Test Instagram API connection
echo "🔌 Testing Instagram API connection..."
if node "$PROJECT_DIR/scripts/instagram-auto-poster.js" --dry-run > /dev/null 2>&1; then
    echo "   ✅ Instagram API connection OK"
else
    echo "   ❌ Instagram API test failed"
    echo "   Please check your credentials in .env.marketing"
    exit 1
fi
echo ""

# Create log directory
echo "📁 Creating log directory..."
mkdir -p "$PROJECT_DIR/logs"
echo "   ✅ Log directory created"
echo ""

# Display cron schedule
echo "📅 Instagram Posting Schedule:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   Moscow Time (UTC+3) | UTC Time | Frequency"
echo "   ─────────────────────|──────────|─────────────"
echo "   11:00 (Morning)      | 08:00    | Daily"
echo "   14:00 (Afternoon)    | 11:00    | Daily"
echo "   19:00 (Evening) 🌟   | 16:00    | Daily"
echo ""
echo "   🌟 = Best engagement time"
echo ""

# Generate crontab entries
echo "📝 Crontab entries to add:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "# Instagram automated posting (3x daily)"
echo "0 8 * * * $CRON_SCRIPT   # 11:00 Moscow - Morning post"
echo "0 11 * * * $CRON_SCRIPT  # 14:00 Moscow - Afternoon post"
echo "0 16 * * * $CRON_SCRIPT  # 19:00 Moscow - Evening post (best time)"
echo ""
echo "# Instagram analytics (daily at midnight)"
echo "0 21 * * * cd $PROJECT_DIR && node scripts/instagram-analytics.js --quiet"
echo ""

# Ask to install
read -p "Install these cron jobs? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⚙️  Installing cron jobs..."

    # Backup existing crontab
    crontab -l > /tmp/crontab-backup-$(date +%Y%m%d-%H%M%S).txt 2>/dev/null || true

    # Add new entries (avoid duplicates)
    (
        crontab -l 2>/dev/null | grep -v "cron-instagram.sh" | grep -v "instagram-analytics.js" || true
        echo ""
        echo "# Instagram Automation - Added $(date '+%Y-%m-%d')"
        echo "0 8 * * * $CRON_SCRIPT   # 11:00 Moscow"
        echo "0 11 * * * $CRON_SCRIPT  # 14:00 Moscow"
        echo "0 16 * * * $CRON_SCRIPT  # 19:00 Moscow"
        echo "0 21 * * * cd $PROJECT_DIR && node scripts/instagram-analytics.js --quiet"
    ) | crontab -

    echo "   ✅ Cron jobs installed"
    echo ""

    # Verify installation
    echo "📋 Current crontab:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    crontab -l | grep -A 5 "Instagram"
    echo ""

    echo "✅ SETUP COMPLETE!"
    echo ""
    echo "📊 Monitor posts:"
    echo "   tail -f $PROJECT_DIR/logs/instagram-cron.log"
    echo ""
    echo "🧪 Test scheduler:"
    echo "   node scripts/instagram-scheduler.js --dry-run"
    echo ""
    echo "⚡ Force post now:"
    echo "   node scripts/instagram-auto-poster.js"
    echo ""
    echo "📈 View analytics:"
    echo "   node scripts/instagram-analytics.js"
    echo ""

else
    echo ""
    echo "❌ Installation cancelled"
    echo ""
    echo "To install manually:"
    echo "   crontab -e"
    echo ""
    echo "Then add the cron entries shown above."
    echo ""
fi

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              Instagram Automation Ready! 🎉                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
