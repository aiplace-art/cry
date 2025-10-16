#!/bin/bash

# 🎨 Logo Guardian Agent - Status Check

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."
PID_FILE="$PROJECT_ROOT/logo-guardian.pid"
LOG_FILE="$PROJECT_ROOT/logs/logo-guardian.log"

echo "🎨 Logo Guardian Agent - Status"
echo "═══════════════════════════════════════"

if [ ! -f "$PID_FILE" ]; then
    echo "Status: ❌ NOT RUNNING"
    echo ""
    echo "To start: bash scripts/start-logo-guardian.sh"
    exit 1
fi

PID=$(cat "$PID_FILE")

if ps -p $PID > /dev/null 2>&1; then
    echo "Status: ✅ RUNNING"
    echo "PID: $PID"

    # Uptime
    if [ -f "$LOG_FILE" ]; then
        START_TIME=$(stat -f %B "$LOG_FILE" 2>/dev/null || stat -c %Y "$LOG_FILE" 2>/dev/null)
        if [ ! -z "$START_TIME" ]; then
            CURRENT_TIME=$(date +%s)
            UPTIME=$((CURRENT_TIME - START_TIME))
            HOURS=$((UPTIME / 3600))
            MINUTES=$(((UPTIME % 3600) / 60))
            echo "Uptime: ${HOURS}h ${MINUTES}m"
        fi
    fi

    # Последний отчёт
    REPORT_FILE="$PROJECT_ROOT/data/project-coordination/logo-compliance-report.json"
    if [ -f "$REPORT_FILE" ]; then
        echo ""
        echo "📊 Last Report:"
        if command -v jq &> /dev/null; then
            echo "   Status: $(jq -r '.status' "$REPORT_FILE")"
            echo "   Compliance: $(jq -r '.compliance.score' "$REPORT_FILE")%"
            echo "   Violations: $(jq -r '.scan.violationsFound' "$REPORT_FILE")"
            echo "   Scanned: $(jq -r '.scan.filesScanned' "$REPORT_FILE") files"
            echo "   Time: $(jq -r '.timestamp' "$REPORT_FILE" | cut -d'T' -f2 | cut -d'.' -f1)"
        else
            echo "   (Install jq for detailed report)"
        fi
    fi

    echo ""
    echo "Commands:"
    echo "   node scripts/logo-guardian.js --report   # Full report"
    echo "   bash scripts/stop-logo-guardian.sh       # Stop agent"
    echo "   tail -f $LOG_FILE                        # View logs"
else
    echo "Status: ❌ NOT RUNNING (stale PID)"
    rm "$PID_FILE"
    echo ""
    echo "To start: bash scripts/start-logo-guardian.sh"
fi

echo "═══════════════════════════════════════"
