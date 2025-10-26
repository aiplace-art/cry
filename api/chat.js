/**
 * HypeAI AI Chat API - Vercel Serverless Function
 * Handles chat requests with Claude 3.5 Sonnet
 */

import Anthropic from '@anthropic-ai/sdk';
import { rateLimit } from './_lib/rateLimit.js';
import { cache } from './_lib/cache.js';
import { trackAnalytics } from './_lib/analytics.js';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Serverless function configuration
export const config = {
  maxDuration: 10, // 10 seconds max execution
  regions: ['iad1'], // US East (close to Claude API)
};

/**
 * Main chat endpoint handler
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://hypeai.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed. Use POST.'
    });
  }

  const startTime = Date.now();

  try {
    // Extract request data
    const { message, language = 'ru', sessionId } = req.body;

    // Validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string'
      });
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
      return res.status(400).json({
        error: 'Message cannot be empty'
      });
    }

    if (trimmedMessage.length > 2000) {
      return res.status(400).json({
        error: 'Message too long (max 2000 characters)'
      });
    }

    // Rate limiting
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] ||
                     req.headers['x-real-ip'] ||
                     req.socket?.remoteAddress ||
                     'unknown';

    const rateLimitResult = await rateLimit(clientIP);

    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: language === 'ru'
          ? 'Слишком много запросов. Попробуйте через минуту.'
          : 'Too many requests. Please try again in a minute.',
        retryAfter: rateLimitResult.retryAfter,
        remaining: 0
      });
    }

    // Check cache
    const cacheKey = `chat:${language}:${hashMessage(trimmedMessage)}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      // Return cached response
      return res.status(200).json({
        ...cached,
        cached: true,
        remaining: rateLimitResult.remaining
      });
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: parseInt(process.env.MAX_TOKENS || '4096'),
      temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
      system: getSystemPrompt(language),
      messages: [{
        role: 'user',
        content: trimmedMessage
      }]
    });

    // Extract reply
    const reply = response.content[0].text;
    const responseTime = Date.now() - startTime;

    // Prepare response object
    const responseData = {
      reply,
      timestamp: new Date().toISOString(),
      responseTime,
      cached: false,
      remaining: rateLimitResult.remaining
    };

    // Cache response (1 hour for common queries, 5 minutes for unique)
    const cacheTTL = isCommonQuery(trimmedMessage) ? 3600 : 300;
    await cache.set(cacheKey, responseData, cacheTTL);

    // Track analytics (async, don't await)
    trackAnalytics({
      event: 'chat_message',
      language,
      messageLength: trimmedMessage.length,
      replyLength: reply.length,
      responseTime,
      cached: false,
      sessionId: sessionId || 'anonymous',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens
    }).catch(console.error);

    // Send response
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('[Chat Error]', error);

    // Handle Anthropic API errors
    if (error.status === 429) {
      return res.status(429).json({
        error: language === 'ru'
          ? 'Сервис временно перегружен. Попробуйте через минуту.'
          : 'Service temporarily overloaded. Please try again in a minute.',
        retryAfter: 60
      });
    }

    if (error.status === 529) {
      return res.status(503).json({
        error: language === 'ru'
          ? 'Сервис AI временно недоступен. Попробуйте позже.'
          : 'AI service temporarily unavailable. Please try again later.'
      });
    }

    // Generic error
    return res.status(500).json({
      error: language === 'ru'
        ? 'Произошла ошибка. Попробуйте позже.'
        : 'An error occurred. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get system prompt based on language
 */
function getSystemPrompt(language) {
  const prompts = {
    ru: `Ты - AI ассистент HypeAI, профессиональная платформа для AI сервисов и криптовалюты.

ВАЖНЫЕ ФАКТЫ О HYPEAI:
• Платформа на базе BNB Chain (Binance Smart Chain)
• Токен $HYPE с уникальной токеномикой
• AI агенты для автоматизации бизнеса
• Стейкинг, фарминг, ликвидность
• Приватная продажа токенов активна

ТВОЯ РОЛЬ:
• Отвечай кратко, по делу, на русском языке
• Будь дружелюбным и профессиональным
• Если не знаешь точного ответа - честно признайся
• Не придумывай информацию, которой нет в контексте
• Всегда предлагай посетить официальный сайт для деталей

СТИЛЬ:
• Используй эмодзи умеренно (1-2 на ответ)
• Короткие абзацы, легко читаемые
• Технические термины объясняй простым языком`,

    en: `You are the HypeAI AI assistant, a professional platform for AI services and cryptocurrency.

KEY FACTS ABOUT HYPEAI:
• Built on BNB Chain (Binance Smart Chain)
• $HYPE token with unique tokenomics
• AI agents for business automation
• Staking, farming, liquidity features
• Private token sale currently active

YOUR ROLE:
• Answer concisely and professionally in English
• Be friendly and helpful
• If you don't know something - admit it honestly
• Don't make up information not in context
• Always suggest visiting the official website for details

STYLE:
• Use emojis moderately (1-2 per response)
• Short paragraphs, easy to read
• Explain technical terms in simple language`
  };

  return prompts[language] || prompts.en;
}

/**
 * Hash message for caching (simple implementation)
 */
function hashMessage(message) {
  return message.toLowerCase().trim().slice(0, 100);
}

/**
 * Check if query is common (for extended caching)
 */
function isCommonQuery(message) {
  const commonPatterns = [
    'что такое hypeai',
    'what is hypeai',
    'как купить',
    'how to buy',
    'цена токена',
    'token price',
    'стейкинг',
    'staking',
    'сервисы',
    'services'
  ];

  const lowerMessage = message.toLowerCase();
  return commonPatterns.some(pattern => lowerMessage.includes(pattern));
}
