# Groq AI Chat - Руководство по тестированию

## 📋 Содержание

1. [Введение](#введение)
2. [Типы тестов](#типы-тестов)
3. [Настройка окружения](#настройка-окружения)
4. [Автоматизированное тестирование](#автоматизированное-тестирование)
5. [Ручное тестирование](#ручное-тестирование)
6. [Критерии приемки](#критерии-приемки)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Введение

Это руководство описывает полный процесс тестирования интеграции Groq AI API в HypeAI чат.

### Цели тестирования:
- ✅ Проверить корректность работы API
- ✅ Убедиться в качестве ответов на русском языке
- ✅ Протестировать обработку ошибок
- ✅ Проверить производительность
- ✅ Убедиться в безопасности интеграции

---

## 🧪 Типы тестов

### 1. Модульные тесты (Unit Tests)
**Файл**: `/tests/api/groq-api.test.js`

**Что тестируют**:
- API подключение
- Обработка ответов
- Валидация данных
- Обработка ошибок
- Rate limiting
- Безопасность

**Запуск**:
```bash
npm test tests/api/groq-api.test.js
```

### 2. Интеграционные тесты (E2E)
**Файл**: `/tests/integration/chat-groq.test.js`

**Что тестируют**:
- Полный путь пользователя
- UI взаимодействия
- Реальные API вызовы
- Мобильная адаптация
- Доступность (a11y)

**Запуск**:
```bash
npx playwright test tests/integration/chat-groq.test.js
```

### 3. Нагрузочные тесты (Load Tests)
**Файл**: `/tests/performance/groq-load.test.js`

**Что тестируют**:
- Время ответа
- Конкурентные запросы
- Утечки памяти
- Rate limiting в действии

**Запуск**:
```bash
npm test tests/performance/groq-load.test.js
```

### 4. Ручное тестирование
**Файл**: `/docs/testing/GROQ_MANUAL_TEST_CHECKLIST.md`

**Что проверяется**:
- UX/UI качество
- Реальные сценарии использования
- Краевые случаи
- Кросс-браузерность

---

## ⚙️ Настройка окружения

### Требования:
- Node.js 18+
- npm или yarn
- Groq API ключ
- Playwright (для E2E)

### Установка зависимостей:

```bash
# Основные зависимости
npm install

# Jest для unit тестов
npm install --save-dev jest @jest/globals

# Playwright для E2E
npm install --save-dev @playwright/test

# Дополнительно
npm install --save-dev axios
```

### Переменные окружения:

Создайте `.env.test`:
```env
GROQ_API_KEY=your_test_api_key_here
NODE_ENV=test
API_TIMEOUT=5000
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW=60000
```

### Конфигурация Jest:

`jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    }
  },
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  setupFiles: ['<rootDir>/tests/setup.js']
};
```

### Конфигурация Playwright:

`tests/playwright.config.js`:
```javascript
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/integration',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 🤖 Автоматизированное тестирование

### Запуск всех тестов:

```bash
# Все тесты
npm test

# С покрытием кода
npm test -- --coverage

# Только измененные файлы
npm test -- --onlyChanged

# Режим watch
npm test -- --watch
```

### Запуск по типам:

```bash
# Только API тесты
npm test tests/api/

# Только E2E тесты
npx playwright test

# Только производительность
npm test tests/performance/

# Конкретный файл
npm test tests/api/groq-api.test.js
```

### Отладка тестов:

```bash
# Playwright UI mode
npx playwright test --ui

# Пошаговая отладка
npx playwright test --debug

# Jest debug
node --inspect-brk node_modules/.bin/jest tests/api/groq-api.test.js
```

### CI/CD интеграция:

`.github/workflows/test-groq.yml`:
```yaml
name: Groq AI Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --coverage
        env:
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}

      - name: Run E2E tests
        run: npx playwright test
        env:
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 🖐️ Ручное тестирование

### Подготовка:

1. **Запустить dev сервер**:
```bash
npm run dev
```

2. **Открыть браузер**:
```
http://localhost:5173/public/variant-2/index.html
```

3. **Открыть DevTools**:
- Chrome: F12
- Firefox: F12
- Safari: Cmd+Option+I

### Основные сценарии:

#### ✅ Сценарий 1: Happy Path
1. Откройте чат
2. Введите: "Что такое HypeAI?"
3. Проверьте:
   - ✅ Ответ получен < 3 сек
   - ✅ Ответ на русском
   - ✅ Содержит информацию о проекте

4. Введите: "Какие агенты?"
5. Проверьте:
   - ✅ Список агентов
   - ✅ Эмодзи присутствуют
   - ✅ Описания корректны

#### ❌ Сценарий 2: Обработка ошибок
1. Откройте Network tab в DevTools
2. Включите "Offline" режим
3. Отправьте сообщение
4. Проверьте:
   - ✅ Показывается fallback ответ
   - ✅ Сообщение об ошибке на русском
   - ✅ Есть кнопка "Повторить"

5. Выключите Offline
6. Нажмите "Повторить"
7. Проверьте:
   - ✅ Запрос выполнен успешно

#### ⚡ Сценарий 3: Rate Limiting
1. Быстро отправьте 15 сообщений
2. Проверьте:
   - ✅ После ~10 появляется предупреждение
   - ✅ Указано время ожидания
3. Подождите 1 минуту
4. Отправьте новое сообщение
5. Проверьте:
   - ✅ Работает снова

### Тестирование на устройствах:

#### Desktop:
- [ ] Chrome (Windows/Mac/Linux)
- [ ] Firefox (Windows/Mac/Linux)
- [ ] Safari (Mac)
- [ ] Edge (Windows)

#### Mobile:
- [ ] iOS Safari (iPhone)
- [ ] iOS Chrome (iPhone)
- [ ] Android Chrome (Pixel/Samsung)
- [ ] Android Firefox (Pixel/Samsung)

### Инструменты:

**Browser DevTools**:
- Console: проверка ошибок
- Network: мониторинг API вызовов
- Performance: профилирование
- Application: проверка кэша/storage

**Расширения**:
- React DevTools
- Lighthouse (для производительности)
- axe DevTools (для доступности)

---

## ✅ Критерии приемки

### Функциональность:
- ✅ Чат открывается/закрывается
- ✅ Сообщения отправляются и получаются
- ✅ Контекст беседы сохраняется
- ✅ Fallback работает при ошибках
- ✅ Rate limiting функционирует

### Производительность:
- ✅ Ответ простого запроса: **< 3 сек**
- ✅ Ответ сложного запроса: **< 5 сек**
- ✅ Открытие чата: **< 1 сек**
- ✅ Потребление памяти: **< 50MB**

### Качество:
- ✅ Все ответы на **русском языке**
- ✅ Эмодзи используются корректно
- ✅ Информация о проекте точная
- ✅ Нет грамматических ошибок

### Надежность:
- ✅ Обработка всех типов ошибок
- ✅ Graceful degradation
- ✅ Retry механизм работает
- ✅ Нет утечек памяти

### Безопасность:
- ✅ API ключ не виден в frontend
- ✅ XSS защита работает
- ✅ Input санитизация работает
- ✅ CORS настроен правильно

### Доступность:
- ✅ Клавиатурная навигация
- ✅ Screen reader поддержка
- ✅ ARIA метки присутствуют
- ✅ Контраст текста достаточный

### Мобильная версия:
- ✅ Адаптивный дизайн
- ✅ Touch-friendly элементы (≥44px)
- ✅ Клавиатура не перекрывает UI
- ✅ Плавная прокрутка

---

## 🔧 Troubleshooting

### Проблема: Тесты не запускаются

**Решение**:
```bash
# Переустановить зависимости
rm -rf node_modules package-lock.json
npm install

# Проверить версию Node
node -v  # Должна быть 18+

# Проверить Jest
npx jest --version
```

### Проблема: API возвращает 401

**Решение**:
```bash
# Проверить API ключ
echo $GROQ_API_KEY

# Установить API ключ
export GROQ_API_KEY="your-key-here"

# Или в .env.test
echo "GROQ_API_KEY=your-key-here" >> .env.test
```

### Проблема: E2E тесты падают

**Решение**:
```bash
# Установить браузеры Playwright
npx playwright install

# Запустить с UI для отладки
npx playwright test --ui

# Проверить доступность сервера
curl http://localhost:5173
```

### Проблема: Тесты медленные

**Решение**:
```bash
# Запустить только измененные
npm test -- --onlyChanged

# Параллельное выполнение
npm test -- --maxWorkers=4

# Пропустить медленные тесты
npm test -- --testPathIgnorePatterns=performance
```

### Проблема: Ложные срабатывания

**Решение**:
1. Увеличьте timeout:
```javascript
test('slow test', async () => {
  // ...
}, 10000); // 10 секунд
```

2. Добавьте ретраи:
```javascript
test.retry(2)('flaky test', async () => {
  // ...
});
```

3. Используйте waitFor:
```javascript
await page.waitForSelector('.message', { timeout: 5000 });
```

---

## 📊 Метрики и отчеты

### Coverage отчет:

```bash
# Генерация coverage
npm test -- --coverage

# Открыть HTML отчет
open coverage/lcov-report/index.html
```

### Playwright отчет:

```bash
# После E2E тестов
npx playwright show-report
```

### Performance метрики:

```bash
# Запустить performance тесты
npm test tests/performance/

# Результаты в консоли:
# - Время ответа
# - Throughput
# - Утечки памяти
```

---

## 🚀 Best Practices

### 1. Организация тестов:
- ✅ Группируйте по функциональности (`describe`)
- ✅ Понятные названия тестов
- ✅ Один тест = одна проверка
- ✅ Используйте `beforeEach` для setup

### 2. Моки и стабы:
- ✅ Мокайте внешние API
- ✅ Используйте фикстуры
- ✅ Изолируйте тесты друг от друга

### 3. Ассерты:
- ✅ Точные проверки
- ✅ Понятные сообщения об ошибках
- ✅ Проверяйте и позитивные, и негативные сценарии

### 4. Производительность:
- ✅ Быстрые unit тесты (< 100ms)
- ✅ Используйте параллелизацию
- ✅ Кэшируйте где возможно

### 5. Поддержка:
- ✅ Комментируйте сложные тесты
- ✅ Обновляйте при изменении функциональности
- ✅ Документируйте известные проблемы

---

## 📚 Дополнительные ресурсы

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Groq API Docs](https://console.groq.com/docs)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Версия**: 1.0
**Последнее обновление**: 2025-01-26
**Автор**: QA Team
