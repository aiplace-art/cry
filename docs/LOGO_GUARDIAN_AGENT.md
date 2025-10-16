# 🎨 Logo Guardian Agent - Документация

**Агент мониторинга единообразия логотипов HypeAI**

## 📋 Описание

Logo Guardian Agent - это автоматический агент, который следит за тем, чтобы во всём проекте использовались только утверждённые версии логотипа HypeAI и не использовались устаревшие версии.

### 🎯 Основные функции:

1. **Сканирование проекта** - проверяет все файлы на наличие ссылок на логотипы
2. **Выявление нарушений** - находит использование устаревших логотипов
3. **Автоматическое исправление** - заменяет устаревшие логотипы на утверждённые
4. **Генерация отчётов** - создаёт подробные отчёты о соответствии
5. **Постоянный мониторинг** - работает в фоновом режиме 24/7
6. **Интеграция с координацией** - уведомляет систему о нарушениях

---

## 📁 Файлы агента

```
scripts/
├── logo-guardian.js              # Основной скрипт агента
├── start-logo-guardian.sh        # Запуск в фоновом режиме
├── stop-logo-guardian.sh         # Остановка агента
└── logo-guardian-status.sh       # Проверка статуса

data/project-coordination/
└── logo-compliance-report.json   # Отчёт о соответствии

docs/
└── LOGO_GUARDIAN_AGENT.md        # Эта документация

logs/
└── logo-guardian.log             # Логи работы агента
```

---

## 🚀 Использование

### 1. Сканирование проекта

Проверить весь проект на соответствие:

```bash
node scripts/logo-guardian.js --scan
```

**Результат:**
```
🎨 LOGO GUARDIAN AGENT - Starting scan...
📁 Project root: /Users/ai.place/Crypto
✅ Approved logos: logo-official.svg, logo-icon-only.svg, logo-premium-animated.html
🚫 Deprecated logos: logo-hypeai.svg, logo-brain-lightning.html, ...

🚫 docs/OLD_README.md
   Line 15: DEPRECATED_LOGO - "logo-hypeai.svg"

✅ website/index.html
✅ Scan completed in 2.34s
📊 Files scanned: 1,247
✅ Compliant files: 23
🚫 Violations found: 5
```

### 2. Автоматическое исправление

Автоматически заменить все устаревшие логотипы:

```bash
node scripts/logo-guardian.js --fix
```

**Что делает:**
- Находит все файлы с устаревшими логотипами
- Заменяет их на утверждённые версии
- Сохраняет изменения
- Пересканирует проект

**Пример:**
```
🔧 LOGO GUARDIAN - Auto-fixing violations...

✅ docs/OLD_README.md: logo-hypeai.svg → logo-official.svg
✅ website/archive/old.html: logo-hypeai-compact.svg → logo-icon-only.svg
✅ src/components/Header.jsx: ∞ → ⚡

✅ Auto-fix completed
📁 Files fixed: 3
🔧 Violations fixed: 5
```

### 3. Показать отчёт

Посмотреть последний отчёт о соответствии:

```bash
node scripts/logo-guardian.js --report
```

**Отчёт включает:**
- Статус соответствия (COMPLIANT / VIOLATIONS_FOUND)
- Оценка соответствия (0-100%)
- Список нарушений с номерами строк
- Рекомендации по исправлению

### 4. Постоянный мониторинг (Watch Mode)

Запустить агента в фоновом режиме для постоянного мониторинга:

```bash
node scripts/logo-guardian.js --watch
```

или через launcher:

```bash
bash scripts/start-logo-guardian.sh
```

**Агент будет:**
- Сканировать проект каждые 60 секунд
- Генерировать отчёты при изменениях
- Записывать результаты в лог
- Работать до остановки (Ctrl+C или stop script)

---

## 🛠️ Launcher Scripts

### Запуск агента

```bash
bash scripts/start-logo-guardian.sh
```

**Результат:**
```
🎨 Starting Logo Guardian Agent...
✅ Logo Guardian started successfully!
   PID: 12345
   Log: /Users/ai.place/Crypto/logs/logo-guardian.log

Commands:
   bash scripts/logo-guardian-status.sh   # Check status
   bash scripts/stop-logo-guardian.sh     # Stop agent
   tail -f logs/logo-guardian.log         # View logs
```

### Проверка статуса

```bash
bash scripts/logo-guardian-status.sh
```

**Результат:**
```
🎨 Logo Guardian Agent - Status
═══════════════════════════════════════
Status: ✅ RUNNING
PID: 12345
Uptime: 2h 34m

📊 Last Report:
   Status: COMPLIANT
   Compliance: 100%
   Violations: 0
   Scanned: 1,247 files
   Time: 14:23:45

Commands:
   node scripts/logo-guardian.js --report   # Full report
   bash scripts/stop-logo-guardian.sh       # Stop agent
   tail -f logs/logo-guardian.log           # View logs
═══════════════════════════════════════
```

### Остановка агента

```bash
bash scripts/stop-logo-guardian.sh
```

**Результат:**
```
🛑 Stopping Logo Guardian Agent...
✅ Logo Guardian stopped successfully (PID: 12345)
```

---

## 📊 Отчёты

Агент генерирует JSON-отчёты в `data/project-coordination/logo-compliance-report.json`

### Структура отчёта:

```json
{
  "timestamp": "2025-10-16T18:45:00.000Z",
  "scan": {
    "duration": "2.34s",
    "filesScanned": 1247,
    "compliantFiles": 23,
    "violationsFound": 5
  },
  "status": "VIOLATIONS_FOUND",
  "compliance": {
    "score": 82,
    "approved": ["logo-official.svg", "logo-icon-only.svg", "logo-premium-animated.html"],
    "deprecated": ["logo-hypeai.svg", "logo-brain-lightning.html", ...]
  },
  "violations": [
    {
      "file": "docs/OLD_README.md",
      "violations": [
        {
          "line": 15,
          "type": "DEPRECATED_LOGO",
          "match": "logo-hypeai.svg",
          "suggestion": "logo-official.svg"
        }
      ],
      "timestamp": "2025-10-16T18:45:00.000Z"
    }
  ],
  "compliantFiles": [
    "website/index.html",
    "public/index.html",
    ...
  ],
  "recommendations": [
    {
      "priority": "HIGH",
      "action": "Run auto-fix to replace deprecated logos",
      "command": "node scripts/logo-guardian.js --fix"
    }
  ]
}
```

---

## ✅ Утверждённые логотипы

Агент проверяет использование **ТОЛЬКО** этих версий:

| Файл | Размер | Использование |
|------|--------|---------------|
| `logo-official.svg` | 500×500px | Полный логотип с текстом "HYPEAI" и tagline |
| `logo-icon-only.svg` | 400×400px | Только иконка без текста (favicon, соцсети) |
| `logo-premium-animated.html` | - | Анимированная версия (landing page, demo) |

---

## 🚫 Запрещённые логотипы

Агент находит и предлагает заменить эти версии:

| Старая версия | Причина | Замена на |
|---------------|---------|-----------|
| `logo-hypeai.svg` | Старый дизайн (infinity) | `logo-official.svg` |
| `logo-hypeai-compact.svg` | Старая компактная версия | `logo-icon-only.svg` |
| `logo-hypeai-lightning.svg` | Старая версия с молниями | `logo-official.svg` |
| `logo-brain-lightning.html` | Отклонено ("детский сад") | `logo-premium-animated.html` |
| `logo-animated.html` | Старая анимация | `logo-premium-animated.html` |
| `logo-premium-lightning.svg` | Исходная версия | `logo-official.svg` |
| `logo-ultra-premium.svg` | Альтернатива (не выбрана) | `logo-official.svg` |

---

## 🔧 Конфигурация

### Директории для сканирования:

```javascript
scanDirs: [
  'website',   // Основной сайт
  'public',    // Публичные файлы
  'docs',      // Документация
  'src',       // Исходный код
  'scripts',   // Скрипты
  'data'       // Данные проекта
]
```

### Расширения файлов:

```javascript
fileExtensions: [
  '.html',   // Веб-страницы
  '.md',     // Документация
  '.json',   // Конфиги
  '.js',     // JavaScript
  '.jsx',    // React компоненты
  '.tsx',    // TypeScript React
  '.css',    // Стили
  '.svg'     // SVG файлы
]
```

### Исключения:

```javascript
excludePaths: [
  'node_modules',    // Зависимости
  '.git',            // Git репозиторий
  'dist',            // Сборка
  'build',           // Build артефакты
  '.next'            // Next.js кеш
]
```

---

## 📈 Метрики

Агент отслеживает:

- **Оценка соответствия (Compliance Score)** - % файлов с правильными логотипами
- **Количество нарушений** - сколько файлов используют старые версии
- **Файлов проверено** - общее количество проверенных файлов
- **Время сканирования** - как быстро прошло сканирование
- **Uptime** - сколько агент работает в watch mode

### Целевые метрики:

| Метрика | Цель | Текущее |
|---------|------|---------|
| Compliance Score | 100% | - |
| Violations | 0 | - |
| Response Time | < 3s | - |
| Coverage | 100% files | - |

---

## 🔗 Интеграция с системой координации

Агент интегрирован с системой координации проекта:

### 1. Отчёты в project-coordination

Сохраняет отчёты в `data/project-coordination/logo-compliance-report.json`

### 2. Hooks интеграция

Можно добавить в pre-commit hook:

```bash
# .git/hooks/pre-commit
node scripts/logo-guardian.js --scan
if [ $? -ne 0 ]; then
    echo "❌ Logo compliance check failed"
    echo "Run: node scripts/logo-guardian.js --fix"
    exit 1
fi
```

### 3. CI/CD интеграция

Добавить в GitHub Actions:

```yaml
- name: Check logo compliance
  run: node scripts/logo-guardian.js --scan

- name: Auto-fix logos
  if: failure()
  run: |
    node scripts/logo-guardian.js --fix
    git add .
    git commit -m "🎨 Auto-fix logo compliance"
```

---

## 📝 Примеры использования

### Ежедневная проверка

```bash
# Утром проверяем статус
bash scripts/logo-guardian-status.sh

# Если есть нарушения - исправляем
node scripts/logo-guardian.js --fix

# Проверяем результат
node scripts/logo-guardian.js --report
```

### Перед коммитом

```bash
# Сканируем изменения
node scripts/logo-guardian.js --scan

# Если ОК - коммитим
git add .
git commit -m "..."

# Если нарушения - исправляем
node scripts/logo-guardian.js --fix
git add .
git commit -m "🎨 Fix logo compliance"
```

### Непрерывный мониторинг

```bash
# Запускаем агента один раз
bash scripts/start-logo-guardian.sh

# Агент работает 24/7
# Проверяем статус когда нужно
bash scripts/logo-guardian-status.sh

# Смотрим логи
tail -f logs/logo-guardian.log
```

---

## 🐛 Troubleshooting

### Проблема: Агент не запускается

**Решение:**
```bash
# Проверяем, не запущен ли уже
bash scripts/logo-guardian-status.sh

# Останавливаем старый процесс
bash scripts/stop-logo-guardian.sh

# Запускаем заново
bash scripts/start-logo-guardian.sh
```

### Проблема: Много ложных срабатываний

**Решение:**
Добавьте исключения в конфигурацию `logo-guardian.js`:

```javascript
excludePaths: [
  'archive',      // Старые файлы
  'backup',       // Бэкапы
  'examples/old'  // Старые примеры
]
```

### Проблема: Auto-fix не работает

**Решение:**
```bash
# Проверяем права доступа
chmod +x scripts/logo-guardian.js

# Запускаем с правами записи
node scripts/logo-guardian.js --fix

# Проверяем Git статус
git status
```

---

## 📞 Поддержка

**Агент создан:** 16 октября 2025
**Версия:** 1.0.0
**Статус:** ✅ Активен

**Команды:**
- Сканирование: `node scripts/logo-guardian.js --scan`
- Исправление: `node scripts/logo-guardian.js --fix`
- Отчёт: `node scripts/logo-guardian.js --report`
- Мониторинг: `node scripts/logo-guardian.js --watch`

**Файлы:**
- Скрипт: `scripts/logo-guardian.js`
- Отчёты: `data/project-coordination/logo-compliance-report.json`
- Логи: `logs/logo-guardian.log`
- Документация: `docs/LOGO_GUARDIAN_AGENT.md`

---

**🤖 Generated by Claude Code**
**Last updated:** 2025-10-16 21:30:00 UTC
