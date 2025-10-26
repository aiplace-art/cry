#!/bin/bash

##
# Threads Cron Job Script
# Automated posting and analytics collection for Threads
# Setup with: crontab -e
##

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load environment
source .env.marketing 2>/dev/null || true

# Log file
LOG_FILE="$SCRIPT_DIR/../logs/threads-cron.log"
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🚀 Starting Threads automation tasks"

##
# 1. Process scheduled posts
##
log "📤 Processing scheduled Threads posts..."
node "$SCRIPT_DIR/threads/threads-auto-poster.js" process >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
  log "✅ Scheduled posts processed"
else
  log "❌ Failed to process scheduled posts"
fi

##
# 2. Collect analytics (once per hour)
##
HOUR=$(date '+%H')
if [ "$HOUR" -eq 0 ] || [ "$HOUR" -eq 12 ]; then
  log "📊 Collecting Threads analytics..."
  node "$SCRIPT_DIR/threads/threads-analytics.js" collect >> "$LOG_FILE" 2>&1

  if [ $? -eq 0 ]; then
    log "✅ Analytics collected"
  else
    log "⚠️  Analytics collection failed (may require manual mode)"
  fi
fi

##
# 3. Update analytics report (daily at midnight)
##
if [ "$HOUR" -eq 0 ]; then
  log "📈 Updating analytics report..."
  node "$SCRIPT_DIR/threads/threads-analytics.js" update >> "$LOG_FILE" 2>&1

  if [ $? -eq 0 ]; then
    log "✅ Analytics report updated"
  fi
fi

##
# 4. Cross-post from Twitter (check every 30 minutes)
##
log "🔄 Checking for Twitter posts to cross-post..."
node "$SCRIPT_DIR/cross-post-monitor.js" >> "$LOG_FILE" 2>&1

log "✅ Threads automation tasks completed"

# Cleanup old logs (keep last 7 days)
find "$(dirname "$LOG_FILE")" -name "*.log" -mtime +7 -delete

exit 0
