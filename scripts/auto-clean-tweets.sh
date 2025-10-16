#!/bin/bash

# Auto Clean Tweets - Runs cleanup in cycles with rate limit delays
# Deletes old tweets automatically until all are removed

echo "🤖 Starting automatic tweet cleanup..."
echo "   This will run in cycles until all old tweets are deleted"
echo ""

CYCLES=0
MAX_CYCLES=10  # Maximum 10 cycles (should be enough)
WAIT_TIME=900  # 15 minutes = 900 seconds

while [ $CYCLES -lt $MAX_CYCLES ]; do
    CYCLES=$((CYCLES + 1))

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔄 Cycle $CYCLES of $MAX_CYCLES"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Run cleanup script
    node scripts/clean-old-tweets.js

    EXIT_CODE=$?

    echo ""
    echo "✅ Cycle $CYCLES complete"
    echo ""

    # Check if we should continue
    if [ $CYCLES -lt $MAX_CYCLES ]; then
        echo "⏳ Waiting 15 minutes for rate limit reset..."
        echo "   Next cycle: $(date -u -v+15M '+%H:%M:%S UTC')"
        echo ""

        # Wait 15 minutes
        sleep $WAIT_TIME
    fi
done

echo ""
echo "🎉 Automatic cleanup completed!"
echo "   Total cycles: $CYCLES"
echo ""
echo "📊 Check your profile: https://twitter.com/HypeAIProject"
echo ""
