# 🤖 HypeAI Sync Agent

## Автоматический агент синхронизации проекта с сайтом

**Sync Agent** - это интеллектуальный AI агент, который следит за всеми изменениями в проекте HypeAI и автоматически синхронизирует их с сайтом в реальном времени.

---

## 🎯 Возможности

### 📊 Мониторинг проекта
- ✅ Отслеживание всех файлов проекта (*.sol, *.js, *.md, etc.)
- ✅ Подсчет строк кода в реальном времени
- ✅ Мониторинг количества тестов
- ✅ Отслеживание Git коммитов
- ✅ Проверка статуса билда

### 🔄 Автоматическая синхронизация
- ✅ Real-time обновление статистики на сайте
- ✅ Автоматическая генерация status page
- ✅ Обновление каждые 5 секунд
- ✅ Live мониторинг изменений файлов

### 📈 Live Dashboard
- ✅ Красивая страница со статистикой проекта
- ✅ Real-time обновления через WebSocket
- ✅ Визуализация метрик
- ✅ Статус всех AI агентов

### 🚀 Git интеграция
- ✅ Автоматические коммиты (опционально)
- ✅ Отслеживание истории коммитов
- ✅ Подсчет contributors
- ✅ Показ последнего коммита

---

## 🚀 Быстрый старт

### Способ 1: Один клик (РЕКОМЕНДУЕТСЯ)
```bash
cd /Users/ai.place/Crypto/website
./START_SYNC_AGENT.sh
```

### Способ 2: NPM скрипт
```bash
cd /Users/ai.place/Crypto/website
npm install
npm run agent
```

### Способ 3: Вручную
```bash
cd /Users/ai.place/Crypto/website
npm install
node sync-agent.js
```

---

## 📊 Доступные команды

```bash
# Запустить sync agent
npm run sync

# Запустить с auto-restart (nodemon)
npm run sync:watch

# Открыть status page
npm run status

# Запустить всё вместе (agent + server + browser)
npm run agent
```

---

## 🎨 Status Page

После запуска агента откройте:
```
http://localhost:8000/status.html
```

### Что показывается:
- 📊 **Live статистика:**
  - Lines of Code
  - Total Files
  - Smart Contracts
  - Git Commits
  - Tests Passing
  - Documentation Files

- 🤖 **Статус AI агентов:**
  - Sync Agent (ACTIVE)
  - Stats Collector (RUNNING)
  - Auto Sync (ENABLED)
  - Git Monitor (WATCHING)
  - Test Runner (PASSED/RUNNING)
  - Build System (READY)

- ⏱️ **Real-time обновления:**
  - Last update timestamp
  - Agent uptime
  - Last commit info

---

## ⚙️ Конфигурация

Файл: `sync-agent.js`

```javascript
const CONFIG = {
    projectRoot: path.resolve(__dirname, '..'),
    websiteRoot: path.resolve(__dirname),
    watchPaths: [
        '../src/**/*.sol',      // Smart contracts
        '../src/**/*.js',       // JavaScript files
        '../docs/**/*.md',      // Documentation
        '../tests/**/*.js',     // Tests
        '../package.json'       // Dependencies
    ],
    syncInterval: 5000,        // Update every 5 seconds
    autoCommit: true,          // Auto Git commits
    realTimeUpdates: true      // Live updates
};
```

### Настройка:

**Изменить интервал обновлений:**
```javascript
syncInterval: 10000  // 10 seconds instead of 5
```

**Отключить auto-commit:**
```javascript
autoCommit: false
```

**Добавить новые пути для мониторинга:**
```javascript
watchPaths: [
    '../src/**/*.sol',
    '../src/**/*.ts',      // TypeScript
    '../src/**/*.tsx',     // React TypeScript
    '../config/**/*.json'  // Config files
]
```

---

## 📁 Генерируемые файлы

### `stats.json`
JSON файл с актуальной статистикой проекта:
```json
{
  "lastUpdate": "2025-01-09T12:34:56.789Z",
  "totalFiles": 180,
  "linesOfCode": 50000,
  "smartContracts": 5,
  "tests": 1400,
  "documentation": 21,
  "commits": 42,
  "contributors": 8,
  "lastCommit": "abc1234 - Update sync agent",
  "testsPassing": 1323,
  "testsTotal": 1400,
  "buildStatus": "success",
  "uptime": 3600
}
```

### `status.html`
Красивая HTML страница со статистикой (генерируется автоматически).

---

## 🔔 События которые отслеживаются

### File Events:
- ➕ **File added** - новый файл создан
- 📝 **File changed** - файл изменен
- ➖ **File removed** - файл удален

### Git Events:
- 💾 **Commit** - новый коммит
- 🔄 **Push** - push в remote
- 📊 **Stats update** - обновление статистики

### Build Events:
- ✅ **Tests passed** - тесты прошли
- ⚠️ **Tests failed** - тесты не прошли
- 🔨 **Build started** - билд начался
- ✅ **Build completed** - билд завершен

---

## 🖥️ Консоль агента

При запуске агента вы увидите красивую консоль:

```
🤖 HypeAI Sync Agent - ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Files: 180 | Lines: 50,000
💻 Contracts: 5 | Tests: 1323/1400
📝 Commits: 42 | Docs: 21
⏱️  Uptime: 60 minutes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 Auto-sync: ENABLED
👀 Watching: 5 paths
📡 Status page: http://localhost:8000/status.html
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ All systems operational. Press Ctrl+C to stop.
```

---

## 🐛 Troubleshooting

### Проблема: "command not found: node"
**Решение:** Установите Node.js:
```bash
# macOS
brew install node

# или скачайте с
https://nodejs.org/
```

### Проблема: "Cannot find module 'chokidar'"
**Решение:** Установите зависимости:
```bash
npm install
```

### Проблема: "Port 8000 already in use"
**Решение:** Используйте другой порт:
```bash
python3 -m http.server 8001
```

### Проблема: "EACCES: permission denied"
**Решение:** Дайте права на выполнение:
```bash
chmod +x START_SYNC_AGENT.sh
```

---

## 🎨 Интеграция с сайтом

### Добавить Live Stats на главную страницу:

```html
<script>
// Загрузка live статистики
async function loadLiveStats() {
    const response = await fetch('stats.json');
    const stats = await response.json();

    document.getElementById('linesOfCode').textContent =
        stats.linesOfCode.toLocaleString();
    document.getElementById('commits').textContent =
        stats.commits;
    document.getElementById('tests').textContent =
        `${stats.testsPassing}/${stats.testsTotal}`;
}

// Обновлять каждые 5 секунд
setInterval(loadLiveStats, 5000);
loadLiveStats();
</script>
```

---

## 📈 Расширенные возможности

### Добавить WebSocket для real-time updates:

```javascript
// В sync-agent.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    ws.send(JSON.stringify(projectStats));
});

// Отправлять обновления всем клиентам
function broadcastUpdate() {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(projectStats));
        }
    });
}
```

### На сайте:
```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (event) => {
    const stats = JSON.parse(event.data);
    updateDashboard(stats);
};
```

---

## 🤖 Что агент делает автоматически

1. **Сканирует проект** каждые 5 секунд
2. **Считает метрики:**
   - Lines of code
   - Number of files
   - Smart contracts
   - Tests
   - Documentation

3. **Обновляет stats.json** с актуальными данными
4. **Генерирует status.html** с красивой визуализацией
5. **Следит за Git** и показывает коммиты
6. **Запускает тесты** и показывает результаты
7. **Мониторит билд** и показывает статус

---

## 💡 Советы по использованию

### Для разработки:
```bash
# Запустить в режиме watch (auto-restart)
npm run sync:watch
```

### Для продакшена:
```bash
# Запустить как демон (background)
nohup node sync-agent.js > agent.log 2>&1 &
```

### Для CI/CD:
```bash
# Добавить в GitHub Actions
- name: Update Stats
  run: |
    node sync-agent.js --once
    git add stats.json status.html
    git commit -m "Update stats"
    git push
```

---

## 🎯 Что дальше?

### Идеи для улучшения:

1. **Добавить уведомления:**
   - Slack/Discord webhooks
   - Email alerts
   - Telegram bot

2. **Расширить мониторинг:**
   - Gas costs tracking
   - Security vulnerabilities
   - Performance metrics

3. **Улучшить визуализацию:**
   - Charts и графики
   - Historical data
   - Trends analysis

4. **Добавить AI анализ:**
   - Code quality scoring
   - Automatic suggestions
   - Predictive analytics

---

## 🆘 Поддержка

Если что-то не работает:

1. Проверь логи: `cat agent.log`
2. Убедись что Node.js установлен: `node --version`
3. Проверь зависимости: `npm list`
4. Перезапусти агент: `./START_SYNC_AGENT.sh`

---

**Sync Agent - работает ∞ бесконечно для вас! 🤖💚**

**HypeAI - Where AI Meets Opportunity**
