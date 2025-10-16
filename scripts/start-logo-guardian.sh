#!/bin/bash

# 🎨 Logo Guardian Agent - Launcher
# Запускает агента мониторинга логотипов в фоновом режиме

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."
LOG_FILE="$PROJECT_ROOT/logs/logo-guardian.log"
PID_FILE="$PROJECT_ROOT/logo-guardian.pid"

# Создаём директорию для логов
mkdir -p "$PROJECT_ROOT/logs"

echo "🎨 Starting Logo Guardian Agent..."

# Проверяем, не запущен ли уже
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Logo Guardian is already running (PID: $PID)"
        echo "   Use 'bash scripts/stop-logo-guardian.sh' to stop it first"
        exit 1
    else
        echo "🧹 Removing stale PID file..."
        rm "$PID_FILE"
    fi
fi

# Запускаем агента в фоновом режиме с watch mode
cd "$PROJECT_ROOT"
nohup node scripts/logo-guardian.js --watch > "$LOG_FILE" 2>&1 &
PID=$!

# Сохраняем PID
echo $PID > "$PID_FILE"

echo "✅ Logo Guardian started successfully!"
echo "   PID: $PID"
echo "   Log: $LOG_FILE"
echo ""
echo "Commands:"
echo "   bash scripts/logo-guardian-status.sh   # Check status"
echo "   bash scripts/stop-logo-guardian.sh     # Stop agent"
echo "   tail -f $LOG_FILE                      # View logs"
