# ⚡ NeuralChain - 5-Minute Quickstart

Самый быстрый способ запустить проект локально.

---

## 🚀 Быстрый старт с Docker (Рекомендуется)

### Требования
- Docker Desktop установлен и запущен
- Git

### Шаги

```bash
# 1. Клонировать репозиторий
git clone https://github.com/aiplace-art/cry.git
cd cry

# 2. Запустить все сервисы
docker-compose up -d

# 3. Дождаться запуска (30-60 секунд)
docker-compose logs -f

# 4. Развернуть контракты
docker-compose exec hardhat npx hardhat run scripts/deploy.js --network localhost

# 5. Открыть приложение
open http://localhost:3000
```

**Готово!** Приложение запущено на http://localhost:3000

---

## 🖥️ Ручной запуск (без Docker)

### Требования
- Node.js 18+
- MongoDB
- PostgreSQL
- Redis

### Шаги

```bash
# 1. Установить зависимости
npm install
cd src/backend && npm install
cd ../frontend && npm install --legacy-peer-deps

# 2. Настроить окружение
cp .env.example .env
cp src/backend/.env.example src/backend/.env
cp src/frontend/.env.example src/frontend/.env.local

# 3. Запустить базы данных (в отдельных терминалах)
mongod
postgres -D /usr/local/var/postgres
redis-server

# 4. Запустить Hardhat (Terminal 1)
npx hardhat node

# 5. Развернуть контракты (Terminal 2)
npx hardhat run scripts/deploy.js --network localhost

# 6. Обновить .env.local с адресами контрактов

# 7. Запустить Backend (Terminal 3)
cd src/backend && npm run dev

# 8. Запустить Frontend (Terminal 4)
cd src/frontend && npm run dev

# 9. Открыть http://localhost:3000
```

---

## 🎯 Что дальше?

1. **Подключить MetaMask:**
   - Добавить сеть: Hardhat Local (Chain ID: 31337, RPC: http://localhost:8545)
   - Импортировать тестовый аккаунт из Hardhat node

2. **Тестировать:**
   - Подключить кошелек
   - Застейкать токены
   - Проголосовать в DAO
   - Посмотреть AI predictions

3. **Изучить:**
   - [Полное руководство разработчика](DEVELOPMENT_GUIDE.md)
   - [Документация API](docs/api-docs.md)
   - [Архитектура](docs/architecture.md)

---

## 🆘 Проблемы?

- **Port уже используется:** Измените порт в .env
- **База данных не подключается:** Проверьте, что сервисы запущены
- **Ошибки контрактов:** Перезапустите Hardhat node

Подробнее: [Troubleshooting](DEVELOPMENT_GUIDE.md#troubleshooting)

---

**Happy Coding! 🚀**
