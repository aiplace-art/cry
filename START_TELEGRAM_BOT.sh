#!/bin/bash

# 🤖 HypeAI Telegram Bot - Quick Start Script
# Автоматический запуск Telegram бота

echo "🤖 HypeAI Telegram Bot - Starting..."
echo ""

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен!"
    echo "Установите: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js: $(node --version)"

# Проверка зависимостей
if [ ! -d "node_modules/node-telegram-bot-api" ]; then
    echo "📦 Установка зависимостей..."
    npm install node-telegram-bot-api axios dotenv
fi

echo "✅ Зависимости установлены"

# Проверка .env файла
if [ ! -f "scripts/.env.telegram" ]; then
    echo "❌ Файл scripts/.env.telegram не найден!"
    echo "Скопируйте: cp scripts/.env.telegram.example scripts/.env.telegram"
    exit 1
fi

echo "✅ Конфигурация найдена"

# Создать директории
mkdir -p .telegram/backups .telegram/exports

echo "✅ Директории созданы"
echo ""
echo "🚀 Запуск бота..."
echo ""

# Запустить бота
node scripts/telegram-community-bot.js
