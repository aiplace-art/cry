# 📊 Как проверить прогресс агентов

## 🔍 Мониторинг работы агентов

### 1️⃣ Проверить логи координатора:
```bash
tail -f /Users/ai.place/Crypto/logs/coordinator-all-agents.log
```

### 2️⃣ Проверить активные процессы:
```bash
ps aux | grep -E "(agent|coordinator)" | grep node
```

### 3️⃣ Проверить созданные файлы:
```bash
# Frontend
ls -lh /Users/ai.place/Crypto/src/frontend/pages/private-sale*
ls -lh /Users/ai.place/Crypto/src/frontend/components/*PrivateSale*

# Backend
ls -lh /Users/ai.place/Crypto/src/backend/routes/privateSale*
ls -lh /Users/ai.place/Crypto/src/backend/services/privateSale*

# Tokenomics
ls -lh /Users/ai.place/Crypto/data/tokenomics/private-sale*

# Marketing
ls -lh /Users/ai.place/Crypto/marketing/*PRIVATE*
```

### 4️⃣ Проверить статус через Telegram:
```
/status - Полный статус проекта
/agents - Статус всех агентов
/alerts - Любые проблемы
```

## ⏰ Timeline ожидания

- **Через 4 часа**: Основные файлы должны быть созданы
- **Через 8 часов**: Frontend + Backend готовы к тестированию
- **Через 24 часа**: Полностью готово к deploy

## 📁 Ожидаемые результаты

### Frontend файлы:
- ✅ `/src/frontend/pages/private-sale.tsx`
- ✅ `/src/frontend/components/PrivateSaleWidget.tsx`
- ✅ `/src/frontend/components/PaymentMethods.tsx`
- ✅ `/src/frontend/hooks/usePrivateSale.ts`

### Backend файлы:
- ✅ `/src/backend/routes/privateSale.ts`
- ✅ `/src/backend/services/privateSaleService.ts`
- ✅ `/src/backend/db/privateSaleSchema.sql`

### Documentation:
- ✅ `/docs/PRIVATE_SALE_PLAN.md`
- ✅ `/marketing/PRIVATE_SALE_COPY.md`
- ✅ `/docs/PRIVATE_SALE_LAUNCH_CHECKLIST.md`

## 🚨 Что делать если что-то не работает

1. **Проверить алерты:**
   ```bash
   cat /Users/ai.place/Crypto/data/project-coordination/alerts.json
   ```

2. **Перезапустить агентов:**
   ```bash
   /Users/ai.place/Crypto/scripts/restart-all-agents.sh
   ```

3. **Проверить задание:**
   ```bash
   cat /Users/ai.place/Crypto/OMEGA_TASK_PRIVATE_SALE.md
   ```

---

**Статус**: Агенты работают автономно
**Дата старта**: $(date)
**Ожидаемое завершение**: Через 24 часа
