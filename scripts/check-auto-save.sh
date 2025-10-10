#!/bin/bash

# HypeAI Auto-Save System - Status Check

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$PROJECT_ROOT/.auto-save/auto-save.pid"
LOG_FILE="$PROJECT_ROOT/.auto-save/auto-save.log"
STATS_FILE="$PROJECT_ROOT/.auto-save/stats.json"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📊 HypeAI Auto-Save System Status${NC}"
echo ""

# Check if running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "Status: ${GREEN}✅ Running${NC}"
        echo -e "PID: $PID"

        # Show uptime
        START_TIME=$(ps -p $PID -o lstart=)
        echo -e "Started: $START_TIME"
    else
        echo -e "Status: ${RED}❌ Not Running${NC} (stale PID file)"
        rm "$PID_FILE"
    fi
else
    echo -e "Status: ${RED}❌ Not Running${NC}"
fi

echo ""

# Show stats
if [ -f "$STATS_FILE" ]; then
    echo -e "${BLUE}📈 Statistics:${NC}"
    echo ""

    # Parse JSON (requires jq, but fallback to cat if not available)
    if command -v jq > /dev/null 2>&1; then
        TOTAL_COMMITS=$(jq -r '.totalCommits' "$STATS_FILE")
        TOTAL_BACKUPS=$(jq -r '.totalBackups' "$STATS_FILE")
        TOTAL_FILES=$(jq -r '.totalFilesSaved' "$STATS_FILE")
        LAST_SAVE=$(jq -r '.lastSave' "$STATS_FILE")
        LAST_BACKUP=$(jq -r '.lastBackup' "$STATS_FILE")

        echo -e "  Total Commits: ${GREEN}$TOTAL_COMMITS${NC}"
        echo -e "  Total Backups: ${GREEN}$TOTAL_BACKUPS${NC}"
        echo -e "  Total Files Saved: ${GREEN}$TOTAL_FILES${NC}"

        if [ "$LAST_SAVE" != "null" ]; then
            echo -e "  Last Save: ${YELLOW}$LAST_SAVE${NC}"
        fi

        if [ "$LAST_BACKUP" != "null" ]; then
            echo -e "  Last Backup: ${YELLOW}$LAST_BACKUP${NC}"
        fi
    else
        cat "$STATS_FILE"
    fi
fi

echo ""

# Show recent log entries
if [ -f "$LOG_FILE" ]; then
    echo -e "${BLUE}📝 Recent Activity (last 10 entries):${NC}"
    echo ""
    tail -n 10 "$LOG_FILE"
fi

echo ""

# Show changed files
cd "$PROJECT_ROOT"
CHANGED_FILES=$(git status --porcelain 2>/dev/null | grep -v "node_modules" | grep -v ".auto-save" | wc -l)
echo -e "Changed Files: ${YELLOW}$CHANGED_FILES${NC}"

if [ $CHANGED_FILES -gt 0 ]; then
    echo ""
    git status --short | head -n 20
fi
