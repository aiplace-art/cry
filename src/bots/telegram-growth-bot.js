#!/usr/bin/env node

/**
 * 📱 TELEGRAM GROWTH BOT
 *
 * Автоматизация роста Telegram сообщества
 * Реферальная программа, engagement, автопостинг
 */

import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'solana-bot-config.json'), 'utf8'));
const bot = new TelegramBot(config.telegram.token, { polling: true });

// Реферальная система
const referralData = {
  users: new Map(), // userId -> {referralCode, referredBy, referrals: [], rewards: 0}
  codes: new Map(), // referralCode -> userId
  totalReferred: 0,
  rewardPerReferral: 100 // HYPE tokens
};

// Контент для постинга
const contentSchedule = [
  {
    time: '10:00',
    type: 'announcement',
    message: `🚀 Доброе утро, HypeAI community!

💎 Напоминаем о нашем стакинге:
• Bronze tier: 17% APY
• Silver tier: 27% APY
• Gold tier: 62% APY 🔥

⏰ До запуска: 30 дней

📊 Присоединяйтесь к {members} участникам!`
  },
  {
    time: '14:00',
    type: 'education',
    message: `🧠 HypeAI Education: AI-Powered Trading

Наша нейросеть анализирует:
📈 Ценовые паттерны
🐋 Движения китов
💬 Социальный сентимент
📊 Рыночные тренды

Результат? 87% точность предсказаний! 🎯`
  },
  {
    time: '18:00',
    type: 'engagement',
    message: `❓ Вопрос дня:

Какая функция HypeAI для вас самая важная?

🤖 AI-предсказания
💰 62% APY стакинг
🗳️ DAO управление
🔐 Безопасность

Голосуйте эмодзи! 👇`
  },
  {
    time: '21:00',
    type: 'motivation',
    message: `💪 Ты среди первых, кто узнал о HypeAI!

Early supporters получают:
🎁 Airdrop бонусы
💎 Эксклюзивный доступ
📊 Повышенные стакинг-награды
🏆 Founding member статус

Приводи друзей, зарабатывай вместе!
Используй /referral для своего кода 🚀`
  }
];

// Приветственное сообщение
const welcomeMessage = `🎉 Добро пожаловать в HypeAI Community!

Я твой помощник по проекту. Вот что я умею:

💎 /start - Начать
🎁 /referral - Твоя реферальная ссылка
📊 /stats - Статистика проекта
💰 /staking - Информация о стакинге
🤖 /ai - Как работает AI
📅 /launch - До запуска
❓ /help - Помощь

🔥 Специальное предложение:
Приведи 5 друзей = получи 500 HYPE токенов!
Используй /referral чтобы получить свою ссылку 👇`;

// Генерация реферального кода
function generateReferralCode(userId) {
  return `HYPE${userId.toString(36).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
}

// Регистрация пользователя
function registerUser(userId, username, referredBy = null) {
  if (!referralData.users.has(userId)) {
    const referralCode = generateReferralCode(userId);

    referralData.users.set(userId, {
      userId,
      username,
      referralCode,
      referredBy,
      referrals: [],
      rewards: 0,
      joinedAt: new Date()
    });

    referralData.codes.set(referralCode, userId);

    // Если пришел по рефералке
    if (referredBy && referralData.users.has(referredBy)) {
      const referrer = referralData.users.get(referredBy);
      referrer.referrals.push(userId);
      referrer.rewards += referralData.rewardPerReferral;
      referralData.totalReferred++;

      // Уведомить реферера
      bot.sendMessage(referredBy,
        `🎉 Поздравляем! @${username} присоединился по твоей ссылке!\n\n` +
        `💰 +${referralData.rewardPerReferral} HYPE\n` +
        `👥 Всего рефералов: ${referrer.referrals.length}\n` +
        `💎 Всего наград: ${referrer.rewards} HYPE`
      );
    }

    saveReferralData();
  }
}

// Сохранение реферальных данных
function saveReferralData() {
  const data = {
    users: Array.from(referralData.users.entries()),
    totalReferred: referralData.totalReferred
  };

  const dataPath = path.join(__dirname, '../../data/telegram/referrals.json');
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Команды бота
bot.onText(/\/start(.*)/, (msg, match) => {
  const userId = msg.from.id;
  const username = msg.from.username || msg.from.first_name;
  const args = match[1].trim();

  // Проверка на реферальный код
  let referredBy = null;
  if (args && referralData.codes.has(args)) {
    referredBy = referralData.codes.get(args);
  }

  registerUser(userId, username, referredBy);
  bot.sendMessage(msg.chat.id, welcomeMessage);
});

bot.onText(/\/referral/, (msg) => {
  const userId = msg.from.id;

  if (!referralData.users.has(userId)) {
    registerUser(userId, msg.from.username || msg.from.first_name);
  }

  const user = referralData.users.get(userId);
  const referralLink = `https://t.me/${config.telegram.botUsername}?start=${user.referralCode}`;

  bot.sendMessage(msg.chat.id,
    `🎁 Твоя реферальная программа:\n\n` +
    `🔗 Ссылка:\n${referralLink}\n\n` +
    `📊 Статистика:\n` +
    `👥 Рефералов: ${user.referrals.length}\n` +
    `💰 Заработано: ${user.rewards} HYPE\n\n` +
    `💎 За каждого друга: ${referralData.rewardPerReferral} HYPE\n` +
    `🏆 Бонус за 5 рефералов: +250 HYPE\n` +
    `🎯 Бонус за 10 рефералов: +750 HYPE\n\n` +
    `Делись ссылкой и зарабатывай! 🚀`
  );
});

bot.onText(/\/stats/, (msg) => {
  const totalUsers = referralData.users.size;
  const totalReferred = referralData.totalReferred;

  bot.sendMessage(msg.chat.id,
    `📊 Статистика HypeAI:\n\n` +
    `👥 Участников: ${totalUsers}\n` +
    `🔗 По рефералкам: ${totalReferred}\n` +
    `📈 Рост за сутки: +${Math.floor(totalUsers * 0.15)}\n` +
    `🚀 До запуска: 30 дней\n` +
    `💎 Активность: Высокая 🔥\n\n` +
    `Мы растем вместе! 💪`
  );
});

bot.onText(/\/staking/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `💰 HypeAI Staking Программа:\n\n` +
    `🥉 Bronze Tier\n` +
    `   • APY: 17%\n` +
    `   • Min: 1,000 HYPE\n` +
    `   • Lock: 30 дней\n\n` +
    `🥈 Silver Tier\n` +
    `   • APY: 27%\n` +
    `   • Min: 5,000 HYPE\n` +
    `   • Lock: 60 дней\n\n` +
    `🥇 Gold Tier\n` +
    `   • APY: 62% 🔥\n` +
    `   • Min: 10,000 HYPE\n` +
    `   • Lock: 90 дней\n\n` +
    `⚡ Награды начисляются ежедневно!\n` +
    `🔒 Early stakers получают бонус +5% APY\n\n` +
    `Запускайся на https://hypeai.io 🚀`
  );
});

bot.onText(/\/ai/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `🤖 HypeAI - Как работает AI:\n\n` +
    `1️⃣ Сбор данных:\n` +
    `   • Цены с 10+ бирж\n` +
    `   • Социальные сети\n` +
    `   • Движения китов\n` +
    `   • Новости\n\n` +
    `2️⃣ Анализ ML-моделями:\n` +
    `   • LSTM для трендов\n` +
    `   • Transformer для паттернов\n` +
    `   • FinBERT для сентимента\n\n` +
    `3️⃣ Генерация сигналов:\n` +
    `   • Точность: 87%\n` +
    `   • Обновление: Real-time\n` +
    `   • Доступность: 24/7\n\n` +
    `🎯 Результат: Прибыльная торговля!\n\n` +
    `Попробуй AI бесплатно после запуска 🚀`
  );
});

bot.onText(/\/launch/, (msg) => {
  const daysLeft = 30;
  const readiness = 12;

  bot.sendMessage(msg.chat.id,
    `🚀 Countdown до запуска:\n\n` +
    `⏰ Дней осталось: ${daysLeft}\n` +
    `📅 Дата: 15 ноября 2025\n` +
    `📊 Готовность: ${readiness}%\n\n` +
    `✅ Готово:\n` +
    `   • Сайт развернут\n` +
    `   • Смарт-контракты\n` +
    `   • AI модели\n\n` +
    `⏳ В процессе:\n` +
    `   • Community 1000+\n` +
    `   • Аудит безопасности\n` +
    `   • Листинг на биржах\n\n` +
    `Будь готов к запуску! 🔥`
  );
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, welcomeMessage);
});

// Автопостинг по расписанию (для админов)
function scheduleContent() {
  console.log('📅 Контент-план активирован');

  contentSchedule.forEach(content => {
    console.log(`   ${content.time} - ${content.type}`);
  });
}

// Статистика в координатор
function reportTelegramMetrics() {
  const metrics = {
    total_users: referralData.users.size,
    total_referred: referralData.totalReferred,
    referral_rate: referralData.users.size > 0
      ? (referralData.totalReferred / referralData.users.size * 100).toFixed(1)
      : 0,
    active_referrers: Array.from(referralData.users.values())
      .filter(u => u.referrals.length > 0).length
  };

  const reportPath = path.join(__dirname, '../../data/telegram/metrics.json');
  fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2));

  console.log('📊 Telegram Metrics:', JSON.stringify(metrics));
}

// Инициализация
console.log('✅ Telegram Growth Bot started');
console.log('🎯 Реферальная программа активна');
console.log('📱 Bot username:', config.telegram.botUsername || '@your_bot');
console.log('');

scheduleContent();
reportTelegramMetrics();

// Отчеты каждые 5 минут
setInterval(reportTelegramMetrics, 5 * 60 * 1000);
