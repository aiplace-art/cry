#!/bin/bash

################################################################################
# Twitter Auto-Posting Cron Setup Script
#
# This script helps setup automated Twitter posting using cron
# Posts 2-3 times per day at optimal times (Moscow Time UTC+3)
################################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SCHEDULER_PATH="$SCRIPT_DIR/twitter-scheduler.js"
LOG_DIR="$PROJECT_DIR/logs"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         🤖 Twitter Auto-Poster Cron Setup                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Create logs directory
mkdir -p "$LOG_DIR"

# Check if scheduler exists
if [ ! -f "$SCHEDULER_PATH" ]; then
    echo "❌ Error: twitter-scheduler.js not found at $SCHEDULER_PATH"
    exit 1
fi

echo "📍 Project Directory: $PROJECT_DIR"
echo "📍 Scheduler Path: $SCHEDULER_PATH"
echo "📍 Logs Directory: $LOG_DIR"
echo ""

# Check if running on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    SYSTEM="macOS"
    echo "🍎 Detected: macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    SYSTEM="Linux"
    echo "🐧 Detected: Linux"
else
    echo "⚠️  Warning: Unknown OS. This script is tested on macOS and Linux only."
    SYSTEM="Unknown"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CRON SCHEDULE (Moscow Time UTC+3)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📅 Monday-Friday:"
echo "   • 09:00 - Morning post"
echo "   • 15:00 - Afternoon post"
echo "   • 21:00 - Evening post"
echo ""
echo "📅 Saturday-Sunday:"
echo "   • 15:00 - Afternoon post"
echo "   • 21:00 - Evening post"
echo ""

# Convert Moscow Time to local time for cron
# Moscow is UTC+3
# We need to find the offset to local time

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "INSTALLATION OPTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1) Auto-install crontab entries (recommended)"
echo "2) Show manual crontab entries (copy-paste yourself)"
echo "3) Show launchd plist for macOS (more reliable on macOS)"
echo "4) Cancel"
echo ""
read -p "Choose option [1-4]: " choice

case $choice in
    1)
        echo ""
        echo "🔧 Installing crontab entries..."

        # Create temporary cron file
        TEMP_CRON=$(mktemp)

        # Get existing crontab (if any)
        crontab -l > "$TEMP_CRON" 2>/dev/null || true

        # Remove old HypeAI entries
        sed -i.bak '/HypeAI Twitter Auto-Poster/d' "$TEMP_CRON"
        sed -i.bak '/twitter-scheduler.js/d' "$TEMP_CRON"

        # Add new entries
        cat >> "$TEMP_CRON" << EOF

# HypeAI Twitter Auto-Poster (Moscow Time UTC+3)
# Morning post - 9:00 AM Moscow = 6:00 AM UTC (for UTC system, adjust for your timezone)
0 6 * * 1-5 cd $PROJECT_DIR && /usr/local/bin/node $SCHEDULER_PATH >> $LOG_DIR/cron.log 2>&1

# Afternoon post - 3:00 PM Moscow = 12:00 PM UTC
0 12 * * * cd $PROJECT_DIR && /usr/local/bin/node $SCHEDULER_PATH >> $LOG_DIR/cron.log 2>&1

# Evening post - 9:00 PM Moscow = 6:00 PM UTC
0 18 * * * cd $PROJECT_DIR && /usr/local/bin/node $SCHEDULER_PATH >> $LOG_DIR/cron.log 2>&1
EOF

        # Install new crontab
        crontab "$TEMP_CRON"
        rm "$TEMP_CRON" "$TEMP_CRON.bak" 2>/dev/null || true

        echo "✅ Crontab entries installed successfully!"
        echo ""
        echo "📋 Current crontab:"
        crontab -l | grep -A 3 "HypeAI Twitter"
        echo ""
        echo "📝 Logs will be written to: $LOG_DIR/cron.log"
        ;;

    2)
        echo ""
        echo "📋 MANUAL CRONTAB ENTRIES"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Run: crontab -e"
        echo ""
        echo "Then paste these lines:"
        echo ""
        cat << EOF
# HypeAI Twitter Auto-Poster (Moscow Time UTC+3)
# Morning post - 9:00 AM Moscow = 6:00 AM UTC (adjust for your timezone)
0 6 * * 1-5 cd $PROJECT_DIR && /usr/local/bin/node $SCHEDULER_PATH >> $LOG_DIR/cron.log 2>&1

# Afternoon post - 3:00 PM Moscow = 12:00 PM UTC
0 12 * * * cd $PROJECT_DIR && /usr/local/bin/node $SCHEDULER_PATH >> $LOG_DIR/cron.log 2>&1

# Evening post - 9:00 PM Moscow = 6:00 PM UTC
0 18 * * * cd $PROJECT_DIR && /usr/local/bin/node $SCHEDULER_PATH >> $LOG_DIR/cron.log 2>&1
EOF
        echo ""
        ;;

    3)
        if [[ "$SYSTEM" != "macOS" ]]; then
            echo "⚠️  Warning: launchd is only available on macOS"
            exit 1
        fi

        PLIST_DIR="$HOME/Library/LaunchAgents"
        PLIST_FILE="$PLIST_DIR/com.hypeai.twitter.scheduler.plist"

        mkdir -p "$PLIST_DIR"

        echo ""
        echo "📋 Creating launchd plist: $PLIST_FILE"

        cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.hypeai.twitter.scheduler</string>

    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>$SCHEDULER_PATH</string>
    </array>

    <key>WorkingDirectory</key>
    <string>$PROJECT_DIR</string>

    <key>StartCalendarInterval</key>
    <array>
        <!-- Morning post: 9:00 AM Moscow (6:00 AM UTC) Mon-Fri -->
        <dict>
            <key>Hour</key>
            <integer>6</integer>
            <key>Minute</key>
            <integer>0</integer>
            <key>Weekday</key>
            <integer>1</integer>
        </dict>
        <dict>
            <key>Hour</key>
            <integer>6</integer>
            <key>Minute</key>
            <integer>0</integer>
            <key>Weekday</key>
            <integer>2</integer>
        </dict>
        <dict>
            <key>Hour</key>
            <integer>6</integer>
            <key>Minute</key>
            <integer>0</integer>
            <key>Weekday</key>
            <integer>3</integer>
        </dict>
        <dict>
            <key>Hour</key>
            <integer>6</integer>
            <key>Minute</key>
            <integer>0</integer>
            <key>Weekday</key>
            <integer>4</integer>
        </dict>
        <dict>
            <key>Hour</key>
            <integer>6</integer>
            <key>Minute</key>
            <integer>0</integer>
            <key>Weekday</key>
            <integer>5</integer>
        </dict>

        <!-- Afternoon post: 3:00 PM Moscow (12:00 PM UTC) Every day -->
        <dict>
            <key>Hour</key>
            <integer>12</integer>
            <key>Minute</key>
            <integer>0</integer>
        </dict>

        <!-- Evening post: 9:00 PM Moscow (6:00 PM UTC) Every day -->
        <dict>
            <key>Hour</key>
            <integer>18</integer>
            <key>Minute</key>
            <integer>0</integer>
        </dict>
    </array>

    <key>StandardOutPath</key>
    <string>$LOG_DIR/launchd.log</string>

    <key>StandardErrorPath</key>
    <string>$LOG_DIR/launchd.error.log</string>
</dict>
</plist>
EOF

        echo "✅ Plist created: $PLIST_FILE"
        echo ""
        echo "🔧 Loading launchd service..."
        launchctl load "$PLIST_FILE" 2>/dev/null || launchctl unload "$PLIST_FILE" 2>/dev/null && launchctl load "$PLIST_FILE"

        echo "✅ launchd service loaded successfully!"
        echo ""
        echo "📝 Logs will be written to:"
        echo "   Standard output: $LOG_DIR/launchd.log"
        echo "   Errors: $LOG_DIR/launchd.error.log"
        echo ""
        echo "🔍 To check status: launchctl list | grep hypeai"
        echo "🛑 To stop: launchctl unload $PLIST_FILE"
        ;;

    4)
        echo "Cancelled."
        exit 0
        ;;

    *)
        echo "Invalid option."
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TESTING & MONITORING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 Test scheduler now:"
echo "   cd $PROJECT_DIR"
echo "   node $SCHEDULER_PATH --dry-run"
echo ""
echo "📊 Check posting status:"
echo "   node $SCRIPT_DIR/check-posting-status.js"
echo ""
echo "📝 View logs:"
echo "   tail -f $LOG_DIR/cron.log"
echo ""
echo "✅ Setup complete! Automated posting is now active."
echo ""
