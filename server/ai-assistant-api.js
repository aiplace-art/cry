#!/usr/bin/env node

/**
 * HypeAI AI Assistant API
 * Production-ready Express API with Claude 3.5 Sonnet integration
 * Features: RAG, rate limiting, session management, analytics
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Allow frontend connections
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
};

app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '10'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for trusted IPs
    const trustedIPs = (process.env.TRUSTED_IPS || '').split(',').map(ip => ip.trim());
    return trustedIPs.includes(req.ip);
  }
});

app.use('/api/', limiter);

// ============================================================================
// IN-MEMORY SESSION STORE (Production: use Redis)
// ============================================================================

class SessionStore {
  constructor() {
    this.sessions = new Map();
    this.maxMessages = parseInt(process.env.MAX_CONTEXT_MESSAGES || '20');
    this.timeout = parseInt(process.env.SESSION_TIMEOUT_MS || '3600000'); // 1 hour
  }

  get(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check if session expired
    if (Date.now() - session.lastActivity > this.timeout) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  set(sessionId, messages) {
    this.sessions.set(sessionId, {
      messages: messages.slice(-this.maxMessages), // Keep only recent messages
      lastActivity: Date.now(),
      createdAt: this.sessions.get(sessionId)?.createdAt || Date.now()
    });
  }

  delete(sessionId) {
    this.sessions.delete(sessionId);
  }

  cleanup() {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.timeout) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

const sessionStore = new SessionStore();

// Cleanup expired sessions every 5 minutes
setInterval(() => sessionStore.cleanup(), 300000);

// ============================================================================
// KNOWLEDGE BASE LOADER
// ============================================================================

class KnowledgeBase {
  constructor() {
    this.content = '';
    this.systemPrompt = '';
    this.loaded = false;
  }

  async load() {
    try {
      // Load knowledge base
      const kbPath = path.resolve(__dirname, process.env.KNOWLEDGE_BASE_PATH || '../docs/PROJECT_KNOWLEDGE_BASE.md');
      this.content = await fs.readFile(kbPath, 'utf-8');

      // Load system prompt
      const promptPath = path.resolve(__dirname, process.env.SYSTEM_PROMPT_PATH || './system-prompt.txt');
      this.systemPrompt = await fs.readFile(promptPath, 'utf-8');

      this.loaded = true;
      console.log('✅ Knowledge base loaded successfully');
      console.log(`📚 Knowledge base size: ${(this.content.length / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.error('❌ Error loading knowledge base:', error.message);
      this.loaded = false;
      // Use fallback content
      this.systemPrompt = 'You are the HypeAI assistant. Answer questions about HypeAI platform.';
      this.content = 'HypeAI is a cryptocurrency platform with AI services on BNB Chain.';
    }
  }

  search(query) {
    // Simple keyword-based search (MVP)
    // Future: Implement vector similarity search with embeddings
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const lines = this.content.split('\n');
    const relevantLines = [];

    for (const line of lines) {
      const lineLower = line.toLowerCase();
      const matches = keywords.filter(kw => lineLower.includes(kw)).length;
      if (matches > 0) {
        relevantLines.push({ line, score: matches });
      }
    }

    // Sort by relevance and take top results
    relevantLines.sort((a, b) => b.score - a.score);
    const topResults = relevantLines.slice(0, 30).map(r => r.line);

    return topResults.join('\n');
  }

  buildPrompt(userMessage, language = 'en') {
    const context = this.search(userMessage);

    let prompt = this.systemPrompt + '\n\n';
    prompt += `LANGUAGE: Respond in ${language === 'ru' ? 'Russian' : 'English'}\n\n`;
    prompt += `CONTEXT (from HypeAI knowledge base):\n${context}\n\n`;
    prompt += `USER QUESTION:\n${userMessage}\n\n`;
    prompt += `INSTRUCTIONS:\n`;
    prompt += `- Answer based ONLY on the CONTEXT provided above\n`;
    prompt += `- If the context doesn't contain the answer, say "I don't have that information"\n`;
    prompt += `- Be helpful, concise, and professional\n`;
    prompt += `- Include relevant links when appropriate\n`;

    return prompt;
  }
}

const knowledgeBase = new KnowledgeBase();

// ============================================================================
// ANALYTICS LOGGER
// ============================================================================

class Analytics {
  constructor() {
    this.logFile = path.resolve(__dirname, process.env.ANALYTICS_FILE || './analytics/usage.json');
    this.buffer = [];
    this.flushInterval = 60000; // Flush every minute

    // Create analytics directory
    fs.mkdir(path.dirname(this.logFile), { recursive: true }).catch(console.error);

    // Flush buffer periodically
    setInterval(() => this.flush(), this.flushInterval);
  }

  async log(event) {
    if (process.env.TRACK_ANALYTICS !== 'true') return;

    this.buffer.push({
      timestamp: new Date().toISOString(),
      ...event
    });

    if (this.buffer.length >= 100) {
      await this.flush();
    }
  }

  async flush() {
    if (this.buffer.length === 0) return;

    try {
      const data = this.buffer.splice(0);
      const existing = await fs.readFile(this.logFile, 'utf-8').catch(() => '[]');
      const logs = JSON.parse(existing);
      logs.push(...data);

      await fs.writeFile(this.logFile, JSON.stringify(logs, null, 2));
    } catch (error) {
      console.error('Analytics flush error:', error.message);
    }
  }
}

const analytics = new Analytics();

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/api/ai-assistant/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    knowledgeBase: knowledgeBase.loaded,
    sessions: sessionStore.sessions.size,
    uptime: process.uptime()
  });
});

/**
 * Chat endpoint - Main AI assistant interaction
 */
app.post('/api/ai-assistant/chat', async (req, res) => {
  const startTime = Date.now();

  try {
    const { message, sessionId, language = 'en' } = req.body;

    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string'
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        error: 'Message too long (max 2000 characters)'
      });
    }

    // Generate or validate session ID
    const currentSessionId = sessionId || uuidv4();

    // Get or create session
    let session = sessionStore.get(currentSessionId);
    const messages = session?.messages || [];

    // Build prompt with RAG
    const systemMessage = knowledgeBase.buildPrompt(message, language);

    // Add user message to history
    messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: parseInt(process.env.MAX_TOKENS || '4096'),
      temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
      system: systemMessage,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    });

    // Extract reply
    const reply = response.content[0].text;
    const responseTime = Date.now() - startTime;

    // Add assistant response to history
    messages.push({
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString()
    });

    // Save session
    sessionStore.set(currentSessionId, messages);

    // Log analytics
    await analytics.log({
      event: 'chat',
      sessionId: currentSessionId,
      messageLength: message.length,
      replyLength: reply.length,
      language,
      responseTime,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens
    });

    // Log to console if enabled
    if (process.env.LOG_QUERIES === 'true') {
      console.log(`[${new Date().toISOString()}] Query: "${message.substring(0, 50)}..." -> ${responseTime}ms`);
    }

    // Send response
    res.json({
      reply,
      sessionId: currentSessionId,
      timestamp: new Date().toISOString(),
      responseTime
    });

  } catch (error) {
    console.error('Chat error:', error);

    // Handle rate limits
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: 60
      });
    }

    // Handle API errors
    if (error.status) {
      return res.status(error.status).json({
        error: error.message || 'API error occurred'
      });
    }

    // Generic error
    res.status(500).json({
      error: 'An error occurred processing your request',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Feedback endpoint - Collect user feedback on responses
 */
app.post('/api/ai-assistant/feedback', async (req, res) => {
  try {
    const { sessionId, messageId, helpful, comment } = req.body;

    if (!sessionId || typeof helpful !== 'boolean') {
      return res.status(400).json({
        error: 'sessionId and helpful (boolean) are required'
      });
    }

    // Log feedback
    await analytics.log({
      event: 'feedback',
      sessionId,
      messageId: messageId || 'unknown',
      helpful,
      comment: comment || '',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Thank you for your feedback!'
    });

  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({
      error: 'Error recording feedback'
    });
  }
});

/**
 * Clear session endpoint
 */
app.post('/api/ai-assistant/session/clear', (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      error: 'sessionId is required'
    });
  }

  sessionStore.delete(sessionId);

  res.json({
    success: true,
    message: 'Session cleared'
  });
});

/**
 * Get popular questions (analytics)
 */
app.get('/api/ai-assistant/analytics/popular', async (req, res) => {
  try {
    const data = await fs.readFile(analytics.logFile, 'utf-8').catch(() => '[]');
    const logs = JSON.parse(data);

    // Count query frequencies (simplified)
    const queries = logs
      .filter(log => log.event === 'chat')
      .map(log => log.messageLength); // In production, track actual queries

    res.json({
      totalQueries: queries.length,
      averageResponseTime: logs
        .filter(log => log.responseTime)
        .reduce((acc, log) => acc + log.responseTime, 0) / logs.length || 0,
      sessions: new Set(logs.map(log => log.sessionId)).size
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error fetching analytics'
    });
  }
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    // Load knowledge base
    await knowledgeBase.load();

    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 HypeAI AI Assistant API');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Health: http://localhost:${PORT}/api/ai-assistant/health`);
      console.log(`🤖 Chat:   POST http://localhost:${PORT}/api/ai-assistant/chat`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🧠 Model: ${process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'}`);
      console.log(`🛡️  Rate limit: ${process.env.RATE_LIMIT_MAX || 10} requests/${process.env.RATE_LIMIT_WINDOW_MS || 60000}ms`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await analytics.flush();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  await analytics.flush();
  process.exit(0);
});

// Start the server
startServer();

export default app;
