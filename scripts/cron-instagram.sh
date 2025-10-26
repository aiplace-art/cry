#!/bin/bash

###############################################################################
# Instagram Cron Job Script
# Runs scheduled Instagram posts at optimal times
#
# Schedule: 11:00, 14:00, 19:00 Moscow Time (UTC+3)
# Crontab entries:
#   0 8 * * * /path/to/cron-instagram.sh  # 11:00 Moscow = 08:00 UTC
#   0 11 * * * /path/to/cron-instagram.sh # 14:00 Moscow = 11:00 UTC
#   0 16 * * * /path/to/cron-instagram.sh # 19:00 Moscow = 16:00 UTC
###############################################################################

# Change to project directory
cd "$(dirname "$0")/.." || exit 1

# Load environment
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

# Log file
LOG_FILE="./logs/instagram-cron.log"
mkdir -p "$(dirname "$LOG_FILE")"

# Timestamp
echo "========================================" >> "$LOG_FILE"
echo "Instagram Cron Job" >> "$LOG_FILE"
echo "Time: $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$LOG_FILE"
echo "Moscow Time: $(TZ=Europe/Moscow date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# Run scheduler
node scripts/instagram-scheduler.js >> "$LOG_FILE" 2>&1

# Capture exit code
EXIT_CODE=$?

# Log result
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Cron job completed successfully" >> "$LOG_FILE"
else
    echo "❌ Cron job failed with exit code $EXIT_CODE" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"

# Rotate log if too large (keep last 1000 lines)
if [ -f "$LOG_FILE" ]; then
    LINE_COUNT=$(wc -l < "$LOG_FILE")
    if [ "$LINE_COUNT" -gt 2000 ]; then
        tail -n 1000 "$LOG_FILE" > "$LOG_FILE.tmp"
        mv "$LOG_FILE.tmp" "$LOG_FILE"
        echo "📝 Log rotated" >> "$LOG_FILE"
    fi
fi

exit $EXIT_CODE
