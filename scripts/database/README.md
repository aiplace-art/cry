# HypeAI Database Scripts

Быстрый запуск единой базы данных для всех AI-агентов проекта HypeAI.

## 🚀 Быстрый старт (1 команда)

```bash
bash scripts/database/setup-all.sh
```

Эта команда:
1. ✅ Проверит установку PostgreSQL
2. ✅ Запустит PostgreSQL сервер
3. ✅ Создаст пользователя `hypeai_user`
4. ✅ Создаст базу данных `hypeai`
5. ✅ Применит схему (30+ таблиц)
6. ✅ Установит зависимости Node.js

## 📋 Отдельные команды

### Создать пользователя и БД
```bash
bash scripts/database/create-user.sh
```

### Применить схему
```bash
# Bash вариант
bash scripts/database/init-database.sh

# Node.js вариант (кросс-платформенный)
node scripts/database/init-database.js
```

### Тест подключения
```bash
node scripts/database/test-connection.js
```

## 🤖 Запуск координатора

После успешной инициализации запусти Database Coordinator Agent:

```bash
node src/bots/database-coordinator-agent.js
```

Координатор будет:
- 🔄 Синхронизировать данные из JSON файлов каждую минуту
- 💓 Отправлять heartbeat каждые 30 секунд
- 📊 Показывать отчет о здоровье каждые 5 минут
- 🤝 Обеспечивать связь между агентами

## 📂 Структура файлов

```
scripts/database/
├── README.md              # Эта инструкция
├── setup-all.sh          # Полная установка (1 команда)
├── create-user.sh        # Создание пользователя
├── init-database.sh      # Инициализация (Bash)
├── init-database.js      # Инициализация (Node.js)
└── test-connection.js    # Тест подключения

config/database/
└── schema.sql            # Полная схема БД (30+ таблиц)

src/backend/utils/
└── database-pool.js      # Connection pool для всех агентов

src/bots/
└── database-coordinator-agent.js  # Агент-координатор БД
```

## 🗄️ Таблицы в БД

**Private Sale (5 таблиц):**
- private_sale_config
- private_sale_purchases
- private_sale_wallet_limits
- private_sale_referrals
- private_sale_claims

**Project Coordination (3 таблицы):**
- project_state
- project_milestones
- project_alerts

**Agent Coordination (3 таблицы):**
- active_agents
- agent_activity
- agent_messages

**Tokenomics (3 таблицы):**
- tokenomics_distribution
- distribution_flows
- validation_alerts

**Social Media (3 таблицы):**
- twitter_metrics
- twitter_posts
- telegram_metrics

**Analytics (3 таблицы):**
- financial_reports
- growth_metrics
- marketing_insights

## 🔌 Использование в агентах

### Простой запрос
```javascript
const { query } = require('../backend/utils/database-pool');

const result = await query('SELECT * FROM project_state WHERE id = 1');
console.log('Twitter followers:', result.rows[0].twitter_followers);
```

### Транзакция
```javascript
const { getClient } = require('../backend/utils/database-pool');

const client = await getClient();
try {
  await client.beginTransaction();

  await client.query('UPDATE project_state SET twitter_followers = $1', [105]);
  await client.query('INSERT INTO agent_activity VALUES ($1, $2)', ['my-agent', 'update']);

  await client.commitTransaction();
} catch (error) {
  await client.rollbackTransaction();
} finally {
  client.release();
}
```

### Регистрация агента
```javascript
await query(`
  INSERT INTO active_agents (agent_name, agent_type, pid, status)
  VALUES ($1, $2, $3, 'running')
  ON CONFLICT (agent_name) DO UPDATE SET
    last_heartbeat = NOW()
`, ['my-agent', 'marketing', process.pid]);
```

## ⚙️ Конфигурация

Файл: `scripts/.env.database`

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hypeai
DB_USER=hypeai_user
DB_PASSWORD=hypeai_password

DB_POOL_MAX=20
DB_POOL_MIN=5
```

## 🐛 Проблемы?

### PostgreSQL не установлен
```bash
# macOS
brew install postgresql@14

# Ubuntu
sudo apt install postgresql

# Windows
# Скачай с postgresql.org
```

### PostgreSQL не запущен
```bash
# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
```

### База не создается
```bash
# Используй скрипт создания пользователя
bash scripts/database/create-user.sh

# Или вручную
psql -U postgres -c "CREATE USER hypeai_user WITH PASSWORD 'hypeai_password';"
psql -U postgres -c "CREATE DATABASE hypeai OWNER hypeai_user;"
```

### Тест не проходит
```bash
# Запусти тест подключения
node scripts/database/test-connection.js

# Проверь логи
psql -U hypeai_user -d hypeai
```

## 📚 Документация

Полная документация: `docs/DATABASE_GUIDE.md`

## ✅ Checklist установки

- [ ] PostgreSQL установлен и запущен
- [ ] Пользователь `hypeai_user` создан
- [ ] База данных `hypeai` создана
- [ ] Схема применена (30+ таблиц)
- [ ] Тест подключения прошел успешно
- [ ] Database Coordinator запущен
- [ ] Агенты обновлены для использования БД

---

**Вопросы?** Смотри `docs/DATABASE_GUIDE.md` или спроси в чате проекта.
