# 🔄 HypeAI Auto-Save System

**Профессиональная система автоматического сохранения для HypeAI проекта**

## 🎯 Возможности

✅ **Автоматические Git Commits**
- Каждые 5 минут проверяет изменения
- Умные commit messages с статистикой
- Автоматический git add для всех файлов
- Исключает node_modules, .git, логи

✅ **Инкрементальные Бэкапы**
- Автоматический backup каждые 30 минут
- Создает .tar.gz архивы
- Хранит последние 10 бэкапов
- Автоматическое удаление старых

✅ **Детальное Логирование**
- Все действия записываются в лог
- Статистика сохранений
- История изменений
- Временные метки

✅ **Мониторинг Изменений**
- Отслеживание всех файлов
- Умная фильтрация
- Статистика по типам изменений
- Real-time статус

---

## 🚀 Быстрый Старт

### 1. Запуск Auto-Save

```bash
# Запустить как фоновый процесс
./scripts/start-auto-save.sh

# Или запустить в текущем терминале
node scripts/auto-save-system.js start
```

### 2. Проверка Статуса

```bash
./scripts/check-auto-save.sh
```

### 3. Остановка

```bash
./scripts/stop-auto-save.sh
```

---

## 📋 Команды

### Node.js Commands

```bash
# Запуск системы (foreground)
node scripts/auto-save-system.js start

# Ручное сохранение
node scripts/auto-save-system.js save

# Ручной бэкап
node scripts/auto-save-system.js backup

# Показать статус
node scripts/auto-save-system.js status
```

### Shell Scripts (рекомендуется)

```bash
# Запустить в фоне
./scripts/start-auto-save.sh

# Проверить статус
./scripts/check-auto-save.sh

# Остановить
./scripts/stop-auto-save.sh
```

---

## ⚙️ Настройки

Вы можете настроить систему, редактируя `/scripts/auto-save-system.js`:

```javascript
const autoSave = new AutoSaveSystem({
  projectRoot: process.cwd(),       // Корневая папка проекта
  saveInterval: 5 * 60 * 1000,      // Интервал сохранения (5 мин)
  backupInterval: 30 * 60 * 1000,   // Интервал бэкапа (30 мин)
  maxBackups: 10                     // Максимум бэкапов
});
```

### Интервалы

- **saveInterval**: Как часто делать git commit
  - По умолчанию: 5 минут (300,000 ms)
  - Минимум: 1 минута
  - Рекомендуется: 5-10 минут

- **backupInterval**: Как часто создавать бэкапы
  - По умолчанию: 30 минут (1,800,000 ms)
  - Минимум: 10 минут
  - Рекомендуется: 30-60 минут

- **maxBackups**: Сколько бэкапов хранить
  - По умолчанию: 10
  - Старые автоматически удаляются

---

## 📁 Структура Файлов

```
.auto-save/
├── auto-save.log          # Лог всех действий
├── auto-save.pid          # PID запущенного процесса
├── stats.json             # Статистика (commits, backups)
└── backups/               # Директория с бэкапами
    ├── backup-2025-10-10-12-00-00.tar.gz
    ├── backup-2025-10-10-12-30-00.tar.gz
    └── ...
```

---

## 📊 Формат Commit Messages

Auto-Save создает структурированные commit messages:

```
💾 Auto-save: +3 added, ~5 modified, -1 deleted

🕒 Timestamp: 2025-10-10 12:30:45
📊 Total commits: 142

Added:
  + docs/new-feature.md
  + src/components/NewComponent.tsx
  + tests/new.test.js

Modified:
  ~ README.md
  ~ package.json
  ~ src/App.tsx

🤖 HypeAI Auto-Save System
Co-Authored-By: AutoSave Bot <autosave@hypeai.io>
```

---

## 🔍 Мониторинг

### Просмотр Логов

```bash
# Последние 20 записей
tail -n 20 .auto-save/auto-save.log

# Следить за логом в реальном времени
tail -f .auto-save/auto-save.log

# Поиск ошибок
grep ERROR .auto-save/auto-save.log
```

### Просмотр Статистики

```bash
# Красиво отформатированный JSON
cat .auto-save/stats.json | jq

# Или просто
cat .auto-save/stats.json
```

Пример stats.json:
```json
{
  "totalCommits": 142,
  "totalBackups": 28,
  "totalFilesSaved": 856,
  "startTime": "2025-10-10T09:00:00.000Z",
  "lastSave": "2025-10-10T12:30:45.123Z",
  "lastBackup": "2025-10-10T12:30:00.456Z"
}
```

---

## 💾 Восстановление из Бэкапа

### Список Бэкапов

```bash
ls -lh .auto-save/backups/
```

### Восстановить Бэкап

```bash
# 1. Остановить auto-save
./scripts/stop-auto-save.sh

# 2. Выбрать бэкап
BACKUP=".auto-save/backups/backup-2025-10-10-12-00-00.tar.gz"

# 3. Создать папку для восстановления
mkdir ../hypeai-restore
cd ../hypeai-restore

# 4. Распаковать
tar -xzf "../Crypto/$BACKUP"

# 5. Проверить содержимое
ls -la

# 6. Скопировать нужные файлы обратно
cp -r path/to/needed/files ../Crypto/
```

---

## 🚨 Исключенные Файлы/Папки

Auto-Save **НЕ** сохраняет:

- `node_modules/` - зависимости npm
- `.git/` - git репозиторий (сохраняются commits, но не сама папка .git)
- `.auto-save/` - собственные файлы
- `dist/`, `build/` - сборки
- `*.log` - логи
- `.env`, `.env.*` - файлы с секретами (но должны быть в .gitignore!)

---

## 🔄 Интеграция с PM2

Для production можно запустить через PM2:

```bash
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'hypeai-autosave',
    script: './scripts/auto-save-system.js',
    args: 'start',
    cwd: '/path/to/Crypto',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'production'
    }
  }]
};

# Запуск
pm2 start ecosystem.config.js
pm2 save
```

---

## 📈 Производительность

### Ресурсы

- **CPU**: ~0.1-0.5% (периодические проверки)
- **Memory**: ~50-100 MB
- **Disk I/O**: Минимальная (только при сохранении)

### Оптимизация

**Для больших проектов** (>1000 файлов):
```javascript
saveInterval: 10 * 60 * 1000,  // Увеличить до 10 минут
backupInterval: 60 * 60 * 1000 // Увеличить до 1 часа
```

**Для активной разработки**:
```javascript
saveInterval: 2 * 60 * 1000,   // Сократить до 2 минут
backupInterval: 15 * 60 * 1000 // Сократить до 15 минут
```

---

## 🐛 Troubleshooting

### Auto-Save не запускается

```bash
# Проверить, есть ли git
git --version

# Проверить, инициализирован ли репозиторий
git status

# Проверить права на выполнение
chmod +x scripts/*.sh
```

### "Git repository not found"

```bash
# Инициализировать git
git init

# Сделать первый commit
git add .
git commit -m "Initial commit"

# Теперь запустить auto-save
./scripts/start-auto-save.sh
```

### Процесс "зависает"

```bash
# Найти PID
cat .auto-save/auto-save.pid

# Принудительно завершить
kill -9 <PID>

# Удалить PID файл
rm .auto-save/auto-save.pid

# Запустить заново
./scripts/start-auto-save.sh
```

### Слишком много бэкапов

```bash
# Уменьшить maxBackups в настройках
# Или вручную удалить старые
rm .auto-save/backups/backup-*-old-date-*.tar.gz
```

---

## 🔐 Безопасность

### ⚠️ ВАЖНО:

1. **НЕ коммитить секреты** - Убедитесь, что `.env` в `.gitignore`
2. **Проверяйте .gitignore** - Перед первым запуском
3. **Бэкапы не шифруются** - Содержимое в `.auto-save/backups/` в открытом виде
4. **Логи могут содержать пути** - Будьте осторожны при публикации

### Рекомендации:

```bash
# Добавить в .gitignore
echo ".auto-save/" >> .gitignore
echo "*.log" >> .gitignore

# Никогда не коммитить:
# - .env файлы
# - API ключи
# - Пароли
# - Private keys
```

---

## 📞 Поддержка

### Логи

Если что-то не работает, проверьте логи:

```bash
# Показать последние ошибки
grep ERROR .auto-save/auto-save.log

# Показать последние 50 записей
tail -n 50 .auto-save/auto-save.log
```

### Статус

```bash
# Полный статус системы
./scripts/check-auto-save.sh

# Git статус
git status

# Измененные файлы
git diff --name-only
```

---

## 🎯 Лучшие Практики

### ✅ DO

- Запускать auto-save при старте работы
- Проверять статус периодически
- Делать ручные commits для важных изменений
- Создавать бэкапы перед большими изменениями
- Останавливать auto-save перед git rebase/merge

### ❌ DON'T

- Не оставлять auto-save на ночь (лишние commits)
- Не использовать с git rebase (может создать конфликты)
- Не полагаться только на auto-save (делайте ручные commits)
- Не запускать несколько инстансов одновременно

---

## 🚀 Production Deployment

### Systemd Service (Linux)

```ini
# /etc/systemd/system/hypeai-autosave.service
[Unit]
Description=HypeAI Auto-Save System
After=network.target

[Service]
Type=simple
User=yourusername
WorkingDirectory=/path/to/Crypto
ExecStart=/usr/bin/node /path/to/Crypto/scripts/auto-save-system.js start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Запустить
sudo systemctl start hypeai-autosave
sudo systemctl enable hypeai-autosave

# Проверить статус
sudo systemctl status hypeai-autosave

# Посмотреть логи
sudo journalctl -u hypeai-autosave -f
```

---

## 📝 Changelog

### v1.0.0 (2025-10-10)

✅ Initial release:
- Auto git commits (5 min interval)
- Auto backups (30 min interval)
- Smart commit messages
- Activity logging
- Statistics tracking
- Shell scripts для управления
- Graceful shutdown
- Old backup cleanup

---

## 🤝 Contributing

Если вы хотите улучшить Auto-Save System:

1. Предложите изменения в `/scripts/auto-save-system.js`
2. Тестируйте на копии проекта
3. Документируйте изменения
4. Создайте PR с описанием

---

## 📄 License

MIT © HypeAI Team

---

**🤖 Система создана 26 AI агентами команды HypeAI**
**💾 Автоматическое сохранение работает 24/7**
**🚀 Ни одна строка кода не потеряется!**

---

## 🔗 См. также

- [Git Best Practices](https://git-scm.com/book/en/v2)
- [Backup Strategies](https://www.backblaze.com/blog/the-3-2-1-backup-strategy/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

---

**Last Updated:** 2025-10-10
**Version:** 1.0.0
**Status:** Production Ready ✅
