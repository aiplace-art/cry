# 🚀 NeuralChain - Complete Development Guide

Полное руководство по локальной разработке и запуску проекта.

---

## 📋 Содержание

1. [Системные требования](#системные-требования)
2. [Быстрый старт с Docker](#быстрый-старт-с-docker)
3. [Ручная установка](#ручная-установка)
4. [Развертывание контрактов](#развертывание-контрактов)
5. [Конфигурация](#конфигурация)
6. [Тестирование](#тестирование)
7. [Troubleshooting](#troubleshooting)

---

## 🖥️ Системные требования

### Минимальные требования:
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Docker** >= 20.10 (для Docker setup)
- **Docker Compose** >= 2.0 (для Docker setup)
- **Git** >= 2.30

### Рекомендуемые требования:
- **RAM:** 8GB+
- **Storage:** 10GB свободного места
- **OS:** macOS, Linux, Windows (WSL2)

---

## 🐳 Быстрый старт с Docker

### Шаг 1: Клонирование репозитория
```bash
git clone https://github.com/aiplace-art/cry.git
cd cry
```

### Шаг 2: Запуск всех сервисов
```bash
# Запустить все сервисы (Hardhat, MongoDB, PostgreSQL, Redis, Backend, Frontend)
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Проверка статуса
docker-compose ps
```

### Шаг 3: Развертывание контрактов
```bash
# В отдельном терминале
docker-compose exec hardhat npx hardhat run scripts/deploy.js --network localhost
```

### Шаг 4: Доступ к приложению
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Hardhat Node:** http://localhost:8545
- **MongoDB:** localhost:27017
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

### Остановка сервисов
```bash
# Остановить все сервисы
docker-compose down

# Остановить и удалить volumes (ВНИМАНИЕ: удалит все данные!)
docker-compose down -v
```

---

## 🔧 Ручная установка

### Шаг 1: Установка зависимостей

#### Корневая директория (Smart Contracts)
```bash
npm install
```

#### Backend
```bash
cd src/backend
npm install
```

#### Frontend
```bash
cd src/frontend
npm install --legacy-peer-deps
```

### Шаг 2: Настройка баз данных

#### MongoDB
```bash
# Установка MongoDB (macOS)
brew install mongodb-community@7.0

# Запуск MongoDB
brew services start mongodb-community@7.0

# Создание базы данных
mongosh
> use crypto_db
> db.createUser({
    user: "admin",
    pwd: "password123",
    roles: ["readWrite", "dbAdmin"]
  })
> exit
```

#### PostgreSQL
```bash
# Установка PostgreSQL (macOS)
brew install postgresql@16

# Запуск PostgreSQL
brew services start postgresql@16

# Создание базы данных
psql postgres
postgres=# CREATE DATABASE crypto_analytics;
postgres=# CREATE USER postgres WITH PASSWORD 'password123';
postgres=# GRANT ALL PRIVILEGES ON DATABASE crypto_analytics TO postgres;
postgres=# \q
```

#### Redis
```bash
# Установка Redis (macOS)
brew install redis

# Запуск Redis
brew services start redis

# Или запуск с паролем
redis-server --requirepass password123
```

### Шаг 3: Конфигурация окружения

#### Корневая директория `.env`
```bash
cp .env.example .env
```

Отредактируйте `.env`:
```env
# Network Configuration
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
BSC_RPC_URL=https://bsc-dataseed.binance.org

# Private Keys (NEVER commit these!)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Etherscan API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
BSCSCAN_API_KEY=your_bscscan_api_key
```

#### Backend `.env`
```bash
cd src/backend
cp .env.example .env
```

Отредактируйте `src/backend/.env`:
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/crypto_db
POSTGRES_URI=postgresql://postgres:password123@localhost:5432/crypto_analytics
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d

# Blockchain
BLOCKCHAIN_RPC_URL=http://localhost:8545
CHAIN_ID=31337

# External APIs
COINGECKO_API_KEY=your_coingecko_api_key_optional
ETHERSCAN_API_KEY=your_etherscan_api_key

# WebSocket
WS_PORT=5000
```

#### Frontend `.env.local`
```bash
cd src/frontend
cp .env.example .env.local
```

Отредактируйте `src/frontend/.env.local`:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws

# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545

# Contract Addresses (will be filled after deployment)
NEXT_PUBLIC_TOKEN_ADDRESS=
NEXT_PUBLIC_STAKING_ADDRESS=
NEXT_PUBLIC_GOVERNANCE_ADDRESS=
```

### Шаг 4: Запуск локальной блокчейн ноды

#### Terminal 1: Hardhat Node
```bash
npx hardhat node
```

Это запустит локальную Ethereum ноду на `http://localhost:8545` с 20 тестовыми аккаунтами.

**Сохраните адреса и приватные ключи для тестирования!**

### Шаг 5: Развертывание контрактов

#### Terminal 2: Deploy Scripts
```bash
npx hardhat run scripts/deploy.js --network localhost
```

После развертывания вы получите адреса контрактов:
```
Token deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Staking deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Governance deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

**Обновите `src/frontend/.env.local` с этими адресами!**

### Шаг 6: Запуск Backend

#### Terminal 3: Backend Server
```bash
cd src/backend
npm run dev
```

Сервер запустится на `http://localhost:5000`

Проверьте health check:
```bash
curl http://localhost:5000/health
```

### Шаг 7: Запуск Frontend

#### Terminal 4: Frontend App
```bash
cd src/frontend
npm run dev
```

Приложение запустится на `http://localhost:3000`

---

## 📜 Развертывание контрактов

### Локальная сеть (Hardhat)
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Тестовая сеть (Goerli)
```bash
# Убедитесь, что .env настроен с GOERLI_RPC_URL и DEPLOYER_PRIVATE_KEY
npx hardhat run scripts/deploy.js --network goerli

# Верификация контрактов
npx hardhat verify --network goerli <TOKEN_ADDRESS>
npx hardhat verify --network goerli <STAKING_ADDRESS> <TOKEN_ADDRESS>
npx hardhat verify --network goerli <GOVERNANCE_ADDRESS> <TOKEN_ADDRESS> 1000000 604800 2000
```

### Mainnet (Production)
```bash
# ВНИМАНИЕ: Убедитесь, что все тесты прошли и контракты аудированы!
npx hardhat run scripts/deploy.js --network mainnet

# Верификация
npx hardhat verify --network mainnet <TOKEN_ADDRESS>
```

---

## ⚙️ Конфигурация

### MetaMask Setup

1. Откройте MetaMask
2. Добавьте локальную сеть:
   - **Network Name:** Hardhat Local
   - **RPC URL:** http://localhost:8545
   - **Chain ID:** 31337
   - **Currency Symbol:** ETH

3. Импортируйте тестовый аккаунт:
   - Скопируйте приватный ключ из вывода `npx hardhat node`
   - MetaMask → Import Account → Paste private key

### Hardhat Configuration

Отредактируйте `hardhat.config.js` для настройки сетей:

```javascript
module.exports = {
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    }
  }
};
```

---

## 🧪 Тестирование

### Smart Contracts
```bash
# Запуск всех тестов
npx hardhat test

# Запуск конкретного теста
npx hardhat test tests/Token.test.js

# Тесты с покрытием кода
npx hardhat coverage

# Gas report
REPORT_GAS=true npx hardhat test
```

### Backend API
```bash
cd src/backend

# Запуск всех тестов
npm test

# Запуск с покрытием
npm run test:coverage

# Запуск конкретного теста
npm test -- tests/api.test.js

# Watch mode
npm test -- --watch
```

### Frontend
```bash
cd src/frontend

# Запуск unit тестов
npm test

# E2E тесты (requires running app)
npm run test:e2e
```

### Integration Tests
```bash
# Убедитесь, что все сервисы запущены
# 1. Hardhat node
# 2. Backend server
# 3. Frontend app

# Затем запустите E2E тесты
cd tests/e2e
npx playwright test
```

---

## 🔍 Troubleshooting

### Проблема: "Cannot connect to MongoDB"
```bash
# Проверьте, запущен ли MongoDB
brew services list | grep mongodb

# Перезапустите MongoDB
brew services restart mongodb-community@7.0

# Проверьте логи
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Проблема: "Port 3000 already in use"
```bash
# Найдите процесс на порту 3000
lsof -i :3000

# Убейте процесс
kill -9 <PID>

# Или используйте другой порт
PORT=3001 npm run dev
```

### Проблема: "Transaction failed: insufficient funds"
```bash
# Убедитесь, что вы используете аккаунт с тестовым ETH
# В Hardhat local network все аккаунты имеют 10000 ETH

# Проверьте баланс в консоли Hardhat
npx hardhat console --network localhost
> const [deployer] = await ethers.getSigners();
> const balance = await ethers.provider.getBalance(deployer.address);
> console.log(ethers.utils.formatEther(balance));
```

### Проблема: "Contract not deployed"
```bash
# Убедитесь, что контракты развернуты
npx hardhat run scripts/deploy.js --network localhost

# Проверьте адреса контрактов в .env.local
cat src/frontend/.env.local
```

### Проблема: "CORS error in browser"
```bash
# Убедитесь, что backend CORS настроен правильно
# В src/backend/server.js должно быть:
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Проблема: "Module not found" после npm install
```bash
# Очистите node_modules и переустановите
rm -rf node_modules package-lock.json
npm install

# Для frontend с конфликтами
npm install --legacy-peer-deps
```

### Docker Issues

#### Containers not starting:
```bash
# Проверьте логи
docker-compose logs backend
docker-compose logs frontend

# Пересоздайте контейнеры
docker-compose down
docker-compose up --build
```

#### Database connection issues:
```bash
# Проверьте, что containers запущены
docker-compose ps

# Проверьте сетевое подключение
docker-compose exec backend ping mongodb
```

---

## 📚 Полезные команды

### Hardhat
```bash
npx hardhat compile          # Компиляция контрактов
npx hardhat clean            # Очистка артефактов
npx hardhat node             # Запуск локальной ноды
npx hardhat console          # Интерактивная консоль
npx hardhat accounts         # Список аккаунтов
```

### Git
```bash
git status                   # Статус изменений
git add .                    # Добавить все файлы
git commit -m "message"      # Создать коммит
git push origin main         # Загрузить в GitHub
```

### Docker
```bash
docker-compose up -d         # Запуск в фоне
docker-compose down          # Остановка
docker-compose logs -f       # Просмотр логов
docker-compose ps            # Статус контейнеров
docker-compose restart       # Перезапуск
```

### Database
```bash
# MongoDB
mongosh mongodb://localhost:27017/crypto_db
> db.users.find()           # Посмотреть пользователей
> db.stakes.find()          # Посмотреть стейки

# PostgreSQL
psql -d crypto_analytics
\dt                          # Список таблиц
SELECT * FROM users;         # Запрос

# Redis
redis-cli
> KEYS *                     # Все ключи
> GET key_name              # Получить значение
```

---

## 🎯 Следующие шаги

После успешного запуска локального окружения:

1. ✅ Протестируйте все функции через frontend
2. ✅ Изучите smart contracts в `src/contracts/`
3. ✅ Ознакомьтесь с backend API в `docs/api-docs.md`
4. ✅ Прочитайте документацию в `docs/`
5. ✅ Начните разработку новых функций!

---

## 🆘 Нужна помощь?

- **Documentation:** `/docs` folder
- **GitHub Issues:** https://github.com/aiplace-art/cry/issues
- **API Docs:** http://localhost:5000/api-docs (when backend is running)

---

**Happy Coding! 🚀**
