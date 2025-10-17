#!/usr/bin/env node
/**
 * HypeAI Telegram Bot with AI Chat (like ChatGPT)
 * Users can ask any questions about the project
 */

import TelegramBot from 'node-telegram-bot-api';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '../../scripts/.env.telegram');
const env = {};
readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const match = line.match(/^([^#=\s]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].trim();
  }
});

const TELEGRAM_TOKEN = env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY || '';

if (!TELEGRAM_TOKEN || TELEGRAM_TOKEN === 'YOUR_TOKEN_HERE') {
  console.error('❌ TELEGRAM_BOT_TOKEN не настроен!');
  process.exit(1);
}

// Initialize Telegram Bot
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Initialize Claude API (optional, fallback to simple responses)
let claude = null;
if (CLAUDE_API_KEY) {
  claude = new Anthropic({ apiKey: CLAUDE_API_KEY });
}

// Project information for AI context
const PROJECT_CONTEXT = `
Ты - AI-ассистент проекта HypeAI Token. Отвечай на русском языке дружелюбно и профессионально.

## О проекте HypeAI:

### Основная информация:
- Название: HypeAI Token (HYPE)
- Платформа: Binance Smart Chain (BSC)
- Тип: AI-powered DeFi проект
- Команда: 15 специализированных AI-агентов

### Private Sale (Текущий этап):
**Модель: Бонусные токены (НЕ скидка)**
- Цена: $0.0015 за токен (базовая для всех)
- Бонусы: 20-30% дополнительных токенов
- Лимит: $500 максимум на кошелек (анти-кит защита)
- Минимум: $10

**Vesting (Разморозка):**
- 40% сразу при покупке
- 60% vesting за 6 месяцев (10% каждый месяц)

**Бонусные уровни:**
- $50-$99: +5% бонусных токенов
- $100-$249: +10% бонусных токенов
- $250-$499: +20% бонусных токенов
- $500 (максимум): +30% бонусных токенов

### Tokenomics:
- Общее количество: 1,000,000,000 HYPE
- Burn: 1% при каждой транзакции
- Reflection: Держатели получают пассивный доход
- Staking: APY от 17% до 62%

### Стейкинг уровни:
- Bronze (30 дней): 17% APY
- Silver (90 дней): 27% APY
- Gold (180 дней): 62% APY

### Особенности:
- Умные контракты проверены CertiK
- Multi-sig кошелек для безопасности
- Прозрачный vesting в смарт-контракте
- Команда с KYC-верификацией
- Публичная дорожная карта

### Контакты:
- Telegram: @hypeai (t.me/hypeai)
- Twitter: @HypeAIProject
- Website: hypeai.io
- Email: hello@hypeai.io

### Почему HypeAI уникален:
1. **Community-First**: Справедливый запуск, никаких VCs
2. **AI-Driven**: 15 AI-агентов работают 24/7
3. **Transparent**: Весь код open source
4. **Sustainable**: Продуманная экономика токена
5. **Secure**: Аудит безопасности + multi-sig

### FAQ быстрые ответы:

**"Почему private sale?"**
→ Нужны средства для: разработки, аудита, маркетинга, ликвидности на DEX

**"Безопасно ли?"**
→ Да! Аудит CertiK, multi-sig кошелек, прозрачный vesting, KYC команды

**"Когда листинг?"**
→ Планируется после завершения private sale

**"Как купить?"**
→ Заходи на private sale страницу, подключи кошелек, покупай за ETH/USDT/USDC/BNB

**"Можно ли обойти лимит $500?"**
→ Технически можно создать много кошельков, но это против духа проекта

### Стиль общения:
- Дружелюбный, но профессиональный
- Используй эмодзи умеренно 💎🚀
- Если не знаешь ответа - честно скажи и предложи спросить в чате
- Никогда не давай финансовых советов ("DYOR - делай своё исследование")
`;

// Simple responses for common questions (if no Claude API)
const SIMPLE_RESPONSES = {
  '/start': `👋 Привет! Я AI-ассистент HypeAI Token.

Задавай любые вопросы о проекте, и я отвечу!

🔹 Private Sale: $0.0015/токен + до 30% бонус
🔹 Лимит: $500 на кошелек
🔹 Vesting: 40% сразу, 60% за 6 месяцев

Команды:
/help - Помощь
/price - Цена токена
/buy - Как купить
/faq - Частые вопросы
/contact - Контакты

Или просто напиши свой вопрос! 💬`,

  '/help': `🤖 Я могу ответить на любые вопросы о HypeAI:

💰 О токене и tokenomics
🛒 Как участвовать в private sale
📊 Staking и rewards
🔒 Безопасность проекта
📅 Roadmap и планы
📱 Контакты команды

Просто напиши свой вопрос на естественном языке!`,

  '/price': `💎 **Цена токена HYPE**

**Private Sale (сейчас):**
• Базовая цена: $0.0015
• С бонусом 30%: эффективно $0.00115

**После листинга:**
• Ожидаемая: $0.005
• ROI: 233%+ от private sale

**Пример расчёта:**
Покупаешь на $500 → получаешь 433,333 HYPE
После листинга по $0.005 → $2,166 (333% ROI)`,

  '/buy': `🛒 **Как купить HYPE токены:**

1️⃣ Открой private sale страницу
2️⃣ Подключи Web3 кошелек (MetaMask, Trust Wallet)
3️⃣ Выбери валюту: ETH, USDT, USDC, BNB
4️⃣ Введи сумму (мин $10, макс $500)
5️⃣ Подтверди транзакцию

✅ 40% токенов получишь сразу
⏰ 60% vesting за 6 месяцев (10% в месяц)

Есть вопросы? Спрашивай!`,

  '/faq': `❓ **Частые вопросы:**

**Почему private sale?**
→ Нужны средства для разработки, аудита, маркетинга и ликвидности

**Безопасно ли?**
→ Да! Аудит CertiK, multi-sig, transparent vesting, KYC команды

**Когда листинг?**
→ После завершения private sale, точная дата скоро

**Как работает vesting?**
→ 40% сразу, остальные 60% разблокируются по 10% каждый месяц

**Можно ли купить больше $500?**
→ Нет, лимит $500 на кошелек для честного распределения

Другие вопросы? Просто спроси!`,

  '/contact': `📱 **Контакты HypeAI:**

💬 Telegram: @hypeai
   t.me/hypeai

🐦 Twitter: @HypeAIProject
   twitter.com/HypeAIProject

🌐 Website: hypeai.io

✉️ Email:
   • Общие вопросы: hello@hypeai.io
   • Поддержка: support@hypeai.io
   • Партнёрство: partnerships@hypeai.io

Пиши в любой удобный канал! 🚀`
};

// Track user conversations for context
const userConversations = new Map();

// AI Response with Claude (or fallback to simple)
async function getAIResponse(userMessage, userId) {
  // Get conversation history
  let conversation = userConversations.get(userId) || [];

  // Add user message to history
  conversation.push({
    role: 'user',
    content: userMessage
  });

  // Keep only last 10 messages to save tokens
  if (conversation.length > 10) {
    conversation = conversation.slice(-10);
  }

  try {
    if (claude && CLAUDE_API_KEY) {
      // Use Claude API
      const response = await claude.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        system: PROJECT_CONTEXT,
        messages: conversation
      });

      const aiMessage = response.content[0].text;

      // Add AI response to history
      conversation.push({
        role: 'assistant',
        content: aiMessage
      });

      userConversations.set(userId, conversation);
      return aiMessage;
    } else {
      // Fallback to simple pattern matching
      const lowerMsg = userMessage.toLowerCase();

      if (lowerMsg.includes('цена') || lowerMsg.includes('стоимость') || lowerMsg.includes('price')) {
        return SIMPLE_RESPONSES['/price'];
      }
      if (lowerMsg.includes('купить') || lowerMsg.includes('buy') || lowerMsg.includes('приобрести')) {
        return SIMPLE_RESPONSES['/buy'];
      }
      if (lowerMsg.includes('безопасн') || lowerMsg.includes('security') || lowerMsg.includes('аудит')) {
        return `🔒 **Безопасность HypeAI:**

✅ Аудит смарт-контрактов от CertiK
✅ Multi-signature кошелек
✅ Transparent vesting в блокчейне
✅ KYC верифицированная команда
✅ Open source код

Все средства защищены! Делай своё исследование (DYOR) 💎`;
      }
      if (lowerMsg.includes('vesting') || lowerMsg.includes('вестинг') || lowerMsg.includes('разблокировк')) {
        return `⏰ **Vesting Schedule:**

📅 При покупке:
• 40% токенов доступны СРАЗУ
• 60% заблокированы на vesting

📅 Разблокировка:
• Каждый месяц: 10% от общего количества
• За 6 месяцев: все 60% разблокируются

Пример: купил 400,000 HYPE
• День 0: получаешь 160,000 HYPE
• Месяц 1: +40,000 HYPE
• Месяц 2: +40,000 HYPE
• ... и так 6 месяцев

Можешь стейкать ВСЕ токены сразу и зарабатывать! 💰`;
      }

      // Default response
      return `Спасибо за вопрос!

Я лучше отвечаю на конкретные темы:
💰 Цена и покупка
🔒 Безопасность
📊 Tokenomics и staking
⏰ Vesting расписание

Можешь переформулировать вопрос или использовать команды:
/price /buy /faq /contact

Или задай конкретный вопрос! 😊`;
    }
  } catch (error) {
    console.error('AI Response Error:', error);
    return 'Извини, возникла проблема с ответом. Попробуй позже или используй команду /help 🤖';
  }
}

// Handle all messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text || '';

  console.log(`📨 Message from ${msg.from.username || msg.from.first_name}: ${text}`);

  // Handle commands
  if (text.startsWith('/')) {
    const command = text.split(' ')[0];
    if (SIMPLE_RESPONSES[command]) {
      await bot.sendMessage(chatId, SIMPLE_RESPONSES[command], { parse_mode: 'Markdown' });
      return;
    }
  }

  // Handle regular messages with AI
  try {
    // Show typing indicator
    await bot.sendChatAction(chatId, 'typing');

    const response = await getAIResponse(text, userId);
    await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Message handling error:', error);
    await bot.sendMessage(chatId, 'Извини, произошла ошибка. Попробуй /help или напиши позже 🙏');
  }
});

// Handle polling errors
bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error.code);
  // Don't crash, just log
});

// Start bot
console.log('🤖 Starting AI Telegram Bot...\n');
console.log('✅ Bot is LIVE and ready to chat!');
console.log('💬 Users can ask any questions in natural language');
console.log('\n📱 Try messaging your bot @hypeai_bot\n');
console.log('⏸️  Press Ctrl+C to stop\n');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Stopping bot...');
  bot.stopPolling();
  console.log('✅ Bot stopped\n');
  process.exit(0);
});
