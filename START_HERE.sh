#!/bin/bash

echo "🚀 HYPEAI - AI ЧАТ С ВИЗУАЛИЗАЦИЕЙ АГЕНТОВ"
echo "=========================================="
echo ""
echo "Что хочешь сделать?"
echo ""
echo "1. 👁️  Посмотреть демо визуализации агентов (1 минута)"
echo "2. 📖 Прочитать executive summary (5 минут)"
echo "3. 🚀 Запустить полную систему (5 минут setup)"
echo "4. 📊 Посмотреть все документы"
echo "5. 🔒 Запустить security audit"
echo ""
read -p "Выбери (1-5): " choice

case $choice in
  1)
    echo "Открываю демо визуализации..."
    open /Users/ai.place/Crypto/src/components/visualization/demo.html
    ;;
  2)
    echo "Открываю executive summary..."
    open /Users/ai.place/Crypto/docs/research/EXECUTIVE_SUMMARY.md
    ;;
  3)
    echo "Запускаю полную систему..."
    echo ""
    echo "Шаг 1: Проверяю Redis..."
    if ! redis-cli ping > /dev/null 2>&1; then
      echo "❌ Redis не запущен. Запускаю..."
      brew services start redis
    else
      echo "✅ Redis работает"
    fi
    
    echo ""
    echo "Шаг 2: Устанавливаю зависимости..."
    cd /Users/ai.place/Crypto/server
    npm install --silent
    
    echo ""
    echo "Шаг 3: Создаю .env файл..."
    if [ ! -f .env ]; then
      cat > .env << 'ENVEOF'
ANTHROPIC_API_KEY=sk-ant-your-key-here
REDIS_URL=redis://localhost:6379
JWT_SECRET=$(openssl rand -base64 32)
PORT=3001
ENVEOF
      echo "⚠️  ВНИМАНИЕ: Добавь свой ANTHROPIC_API_KEY в server/.env"
    else
      echo "✅ .env уже существует"
    fi
    
    echo ""
    echo "Шаг 4: Запускаю backend..."
    echo "👉 Запусти в отдельном терминале:"
    echo "   cd /Users/ai.place/Crypto/server && npm run dev"
    echo ""
    echo "Шаг 5: Запусти frontend:"
    echo "   npm run chat:dev"
    echo ""
    echo "Шаг 6: Открой браузер:"
    echo "   http://localhost:3000"
    ;;
  4)
    echo "Открываю индекс документов..."
    echo ""
    echo "📚 ВСЯ ДОКУМЕНТАЦИЯ:"
    echo ""
    echo "RESEARCH & BEST PRACTICES:"
    echo "  - docs/research/EXECUTIVE_SUMMARY.md (начни отсюда)"
    echo "  - docs/research/COMPARISON_MATRIX.md (vs ChatGPT)"
    echo "  - docs/research/AI_CHAT_BEST_PRACTICES_2025.md"
    echo ""
    echo "SECURITY & CODE REVIEW:"
    echo "  - docs/security/SECURITY_AUDIT_PRODUCTION.md"
    echo "  - docs/CODE_REVIEW_FINAL.md"
    echo "  - AUDIT_SUMMARY.md"
    echo ""
    echo "DEPLOYMENT:"
    echo "  - docs/deployment/PRODUCTION_READINESS.md"
    echo "  - docs/deployment/DEPLOYMENT_GUIDE.md"
    echo "  - docs/deployment/RUNBOOK.md"
    echo ""
    echo "ARCHITECTURE:"
    echo "  - docs/architecture/PRODUCTION_ARCHITECTURE.md"
    echo "  - docs/architecture/MIGRATION_TO_PRODUCTION.md"
    echo "  - docs/architecture/COST_ANALYSIS.md"
    echo ""
    read -p "Открыть папку с документами? (y/n): " open_docs
    if [ "$open_docs" = "y" ]; then
      open /Users/ai.place/Crypto/docs
    fi
    ;;
  5)
    echo "Запускаю security audit скрипт..."
    if [ -f /Users/ai.place/Crypto/URGENT_FIXES_NOW.sh ]; then
      bash /Users/ai.place/Crypto/URGENT_FIXES_NOW.sh
    else
      echo "❌ Скрипт не найден"
      echo "Читай: docs/security/SECURITY_AUDIT_PRODUCTION.md"
    fi
    ;;
  *)
    echo "❌ Неправильный выбор"
    ;;
esac

echo ""
echo "✅ Готово!"
