# 💻 VPS Deployment - Twitter Auto-Poster

## Лучший VPS для production: Hetzner ($5/мес)

**Почему Hetzner:**
- ✅ Самая низкая цена ($4.50/мес за 2GB RAM)
- ✅ Отличная производительность
- ✅ Европейские серверы (низкий ping)
- ✅ 20TB трафика включено

---

## 🚀 БЫСТРАЯ УСТАНОВКА (5 минут)

### Шаг 1: Создать VPS на Hetzner

1. Зайти на **hetzner.com/cloud**
2. Создать аккаунт
3. **Create Server:**
   - Location: Finland (Helsinki) или Germany
   - Image: Ubuntu 22.04
   - Type: CPX11 (2 vCPU, 2GB RAM, $4.50/мес)
   - SSH Key: добавить свой публичный ключ

### Шаг 2: Подключиться к серверу

```bash
# Получить IP адрес сервера из Hetzner панели
ssh root@YOUR_SERVER_IP
```

### Шаг 3: Установить Node.js и зависимости

```bash
# Обновить систему
apt update && apt upgrade -y

# Установить Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Установить Git
apt install -y git

# Установить зависимости для canvas (для генерации изображений)
apt install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Проверить установку
node --version  # должно быть v20.x
npm --version
```

### Шаг 4: Клонировать проект

```bash
# Создать директорию для проекта
mkdir -p /var/www
cd /var/www

# Клонировать репозиторий (замените на ваш URL)
git clone https://github.com/YOUR_USERNAME/Crypto.git hypeai-twitter
cd hypeai-twitter

# Установить npm пакеты
npm install
```

### Шаг 5: Настроить переменные окружения

```bash
# Создать .env файл с Twitter credentials
cat > scripts/.env.marketing << 'EOF'
TWITTER_API_KEY=fNfTLRfg9PwGVDkqBk13lBlNv
TWITTER_API_SECRET=7Y8MQ9ROX6u1ErY22BaOyw25IotcWaHitddQepUO5LNnpghXL7
TWITTER_ACCESS_TOKEN=1390354277353336836-nBCyDadSN4I06THZHtR3DgK2QqD0Rc
TWITTER_ACCESS_TOKEN_SECRET=E1nuYmpAqdEfcm8ybOr5i3BcKM3IRqMU9PMfkK0CHgbPs
EOF

# Проверить права доступа
chmod 600 scripts/.env.marketing
```

### Шаг 6: Тестовый запуск

```bash
# Запустить вручную для проверки
node scripts/twitter-scheduler.js

# Если всё работает, увидите:
# ✅ IN SCHEDULED WINDOW или ⏳ NOT IN SCHEDULED WINDOW
```

### Шаг 7: Настроить cron для автопостинга

```bash
# Открыть crontab
crontab -e

# Добавить задачу (каждый час с 8 до 22)
0 8-22 * * * /var/www/hypeai-twitter/scripts/cron-twitter.sh >> /var/www/hypeai-twitter/logs/twitter-cron.log 2>&1

# Сохранить и выйти (Ctrl+X, затем Y, затем Enter)
```

### Шаг 8: Настроить systemd (опционально, для автозапуска)

```bash
# Создать systemd service
cat > /etc/systemd/system/twitter-poster.service << 'EOF'
[Unit]
Description=HypeAI Twitter Auto-Poster
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/hypeai-twitter
ExecStart=/usr/bin/node scripts/twitter-scheduler.js
Restart=always
RestartSec=3600

[Install]
WantedBy=multi-user.target
EOF

# Включить и запустить сервис
systemctl enable twitter-poster
systemctl start twitter-poster

# Проверить статус
systemctl status twitter-poster
```

---

## 📊 Мониторинг и управление

### Просмотр логов:

```bash
# Логи cron
tail -f /var/www/hypeai-twitter/logs/twitter-cron.log

# Логи systemd (если используется)
journalctl -u twitter-poster -f

# Статистика постов
cat /var/www/hypeai-twitter/data/project-coordination/posting-history.json | jq
```

### Полезные команды:

```bash
# Перезапустить cron
service cron restart

# Остановить сервис
systemctl stop twitter-poster

# Запустить сервис
systemctl start twitter-poster

# Обновить код с GitHub
cd /var/www/hypeai-twitter
git pull origin main
npm install
systemctl restart twitter-poster
```

### Автоматические обновления:

```bash
# Создать скрипт для автообновлений
cat > /var/www/hypeai-twitter/scripts/auto-update.sh << 'EOF'
#!/bin/bash
cd /var/www/hypeai-twitter
git pull origin main
npm install
systemctl restart twitter-poster
echo "✅ Updated at $(date)" >> logs/auto-update.log
EOF

chmod +x /var/www/hypeai-twitter/scripts/auto-update.sh

# Добавить в cron (обновляться каждый день в 3 утра)
crontab -e
# Добавить строку:
0 3 * * * /var/www/hypeai-twitter/scripts/auto-update.sh
```

---

## 🔒 Безопасность

```bash
# Настроить firewall
ufw allow 22/tcp  # SSH
ufw enable

# Отключить root login по паролю (только SSH keys)
nano /etc/ssh/sshd_config
# Изменить: PermitRootLogin prohibit-password
systemctl restart sshd

# Установить fail2ban (защита от брутфорса)
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

---

## 💰 Стоимость:

**Hetzner CPX11:**
- €4.51/мес (~$5)
- 2 vCPU
- 2 GB RAM
- 40 GB SSD
- 20 TB трафика

**Альтернативы:**
- DigitalOcean: $6/мес (1 vCPU, 1GB RAM)
- Linode: $5/мес (1 vCPU, 1GB RAM)
- Vultr: $5/мес (1 vCPU, 1GB RAM)

---

## ✅ Готово!

Теперь система работает 24/7 автономно:
- ✅ Посты каждый час (8-22)
- ✅ Автоматические обновления
- ✅ Логи и мониторинг
- ✅ Автозапуск после перезагрузки сервера
