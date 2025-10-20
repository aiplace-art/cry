# 📊 HypeAI Services Data

Эта папка содержит все данные о сервисах HypeAI в структурированном JSON формате.

## 📁 Структура

```
/data/services/
├── README.md                    (этот файл)
├── pricing-plans.json          (цены на все сервисы)
├── service-catalog.json        (каталог всех сервисов)
└── [будущие файлы данных]
```

## 📄 Файлы

### `pricing-plans.json`
**Что содержит:**
- Полные pricing планы для всех активных сервисов
- Twitter Automation (Basic, Professional, Premium)
- Resume/CV (Basic, Professional, Premium)
- Social Media Automation (Starter, Professional, Enterprise)
- Скидки ($HYPE token 30%, annual 20%, referral 10%)
- Гарантии (30-day money-back, satisfaction, security)
- Revenue projections (прогнозы дохода)

**Используется:**
- Сайтом для отображения цен
- Database coordinator для синхронизации с БД
- Admin панелью для управления ценами

### `service-catalog.json`
**Что содержит:**
- Полный каталог всех 60+ сервисов
- Статус каждого сервиса (active, coming-soon, planned)
- Категории сервисов (8 категорий)
- Приоритеты запуска
- Статистика и метрики

**Используется:**
- services.html для отображения каталога
- Database coordinator
- Tracking системой

## 🔄 Database Sync

Database Coordinator Agent (`src/bots/database-coordinator-agent.cjs`) автоматически синхронизирует эти данные с PostgreSQL базой каждые 60 секунд.

## 📊 Текущая Статистика

**Активные сервисы:** 3
- Twitter/X Automation
- Resume & CV Writing
- Social Media Automation (скоро)

**Coming Soon:** 57 сервисов

**Revenue Projections:**
- Month 1: $6,975
- Month 3: $20,925
- Month 6: $34,875
- Year 1: $167,400+

## 🚀 Добавление Новых Сервисов

Когда добавляешь новый сервис:

1. Добавь pricing в `pricing-plans.json`:
```json
{
  "services": {
    "your-service": {
      "serviceId": "unique-id",
      "name": "Service Name",
      "plans": { ... }
    }
  }
}
```

2. Добавь в каталог `service-catalog.json`:
```json
{
  "activeServices": [
    {
      "id": "unique-id",
      "name": "Service Name",
      "status": "active",
      ...
    }
  ]
}
```

3. Database Coordinator автоматически подхватит изменения через 60 секунд!

## 🤖 Агенты, Использующие Эти Данные

- `database-coordinator-agent` - синхронизация с БД
- `pricing-manager-agent` - управление ценами
- `revenue-tracker-agent` - отслеживание дохода
- `service-delivery-agent` - доставка сервисов

## 📝 Формат Данных

Все JSON файлы следуют структуре:

```json
{
  "meta": {
    "version": "1.0.0",
    "lastUpdate": "2025-10-21",
    ...
  },
  "data": { ... }
}
```

Это позволяет:
- Отслеживать версии
- Валидировать данные
- Миграции при обновлениях

---

**Последнее обновление:** 2025-10-21
**Maintained by:** Database Coordinator Agent
