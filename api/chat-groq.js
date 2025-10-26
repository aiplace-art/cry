/**
 * HypeAI Chat API - Groq Integration
 * Serverless function for Vercel
 * Connects Diamond Chat to Groq's Llama 3.3 70B model
 */

const { GroqClient } = require('./_lib/groq-client');
const { RateLimiter } = require('./_lib/rate-limiter');
const { generateSystemPrompt } = require('./_lib/system-prompt');

// Initialize rate limiter (10 requests per minute per IP)
const rateLimiter = new RateLimiter(10, 60000);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

/**
 * Main handler
 */
module.exports = async (req, res) => {
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  try {
    // Debug: Log environment variables
    console.log('[Chat API] Environment check:', {
      hasGroqKey: !!process.env.GROQ_API_KEY,
      keyLength: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0,
      nodeEnv: process.env.NODE_ENV,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('GROQ'))
    });
    // Get client IP
    const clientIp = req.headers['x-forwarded-for'] ||
                     req.headers['x-real-ip'] ||
                     req.connection.remoteAddress ||
                     'unknown';

    // Check rate limit
    const rateLimitResult = rateLimiter.checkLimit(clientIp);
    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Слишком много запросов. Попробуйте через минуту.',
        retryAfter: Math.ceil(rateLimitResult.resetIn / 1000)
      });
    }

    // Validate request body
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Message is required and must be a string'
      });
    }

    // Validate message length (max 1000 chars)
    if (message.length > 1000) {
      return res.status(400).json({
        error: 'Message too long',
        message: 'Сообщение не должно превышать 1000 символов'
      });
    }

    // Validate conversation history
    if (!Array.isArray(conversationHistory)) {
      return res.status(400).json({
        error: 'Invalid conversation history',
        message: 'Conversation history must be an array'
      });
    }

    // Limit conversation history to last 5 messages
    const limitedHistory = conversationHistory.slice(-5);

    // Initialize Groq client
    const groq = new GroqClient(process.env.GROQ_API_KEY);

    // Generate system prompt with knowledge base
    const systemPrompt = generateSystemPrompt();

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...limitedHistory,
      { role: 'user', content: message }
    ];

    // Call Groq API
    const response = await groq.chat(messages, {
      temperature: 0.7,
      maxTokens: 500,
      topP: 0.9
    });

    // Track request
    console.log(`[Chat API] Request from ${clientIp}: ${message.substring(0, 50)}...`);
    console.log(`[Chat API] Response: ${response.substring(0, 50)}...`);

    // Return success response
    return res.status(200).json({
      success: true,
      response: response,
      model: 'llama-3.3-70b-versatile',
      timestamp: new Date().toISOString(),
      rateLimit: {
        remaining: rateLimitResult.remaining,
        resetIn: Math.ceil(rateLimitResult.resetIn / 1000)
      }
    });

  } catch (error) {
    console.error('[Chat API] Error:', error);

    // Handle specific error types
    if (error.message.includes('API key')) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Сервис временно недоступен. Попробуйте позже.'
      });
    }

    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        error: 'API rate limit',
        message: 'Сервис перегружен. Попробуйте через минуту.'
      });
    }

    if (error.message.includes('timeout')) {
      return res.status(504).json({
        error: 'Timeout',
        message: 'Запрос занял слишком много времени. Попробуйте еще раз.'
      });
    }

    // Generic error response
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Произошла ошибка. Попробуйте позже.',
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message
      })
    });
  }
};
