#!/usr/bin/env node

/**
 * HypeAI AI Assistant API v2.0
 * Production-ready with TypeScript, WebSocket streaming, Redis sessions
 * Features: Real-time streaming, session management, input validation, error handling
 */

import express, { Request, Response, NextFunction } from 'express';
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
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Redis from 'ioredis';
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';
import * as Sentry from '@sentry/node';

// ES Module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    responseTime?: number;
    tokensUsed?: number;
    confidence?: number;
  };
}

interface Session {
  sessionId: string;
  messages: Message[];
  lastActivity: number;
  createdAt: number;
  metadata: {
    language: string;
    userAgent?: string;
    ip?: string;
  };
}

interface ChatRequest {
  message: string;
  sessionId?: string;
  language?: 'en' | 'ru';
}

interface KnowledgeBaseContext {
  documents: string;
  sources: Array<{
    title: string;
    url: string;
  }>;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000).trim(),
  sessionId: z.string().uuid().optional(),
  language: z.enum(['en', 'ru']).optional().default('en')
});

const feedbackSchema = z.object({
  sessionId: z.string().uuid(),
  messageId: z.string().optional(),
  helpful: z.boolean(),
  comment: z.string().max(500).optional()
});

// ============================================================================
// INITIALIZE SENTRY
// ============================================================================

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0
  });
}

// ============================================================================
// INITIALIZE SERVICES
// ============================================================================

// Express app
const app = express();
const httpServer = createServer(app);
const PORT = parseInt(process.env.PORT || '3001', 10);

// Socket.IO for real-time streaming
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Redis client for session management
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryStrategy: (times) => {
    if (times > 3) {
      console.error('❌ Redis connection failed after 3 retries');
      return null; // Stop retrying
    }
    return Math.min(times * 1000, 3000); // Exponential backoff
  }
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

// Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Sentry request handler (must be first)
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
}

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());

    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
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

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '20', 10),
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const trustedIPs = (process.env.TRUSTED_IPS || '').split(',').map(ip => ip.trim());
    return trustedIPs.includes(req.ip || '');
  }
});

app.use('/api/', limiter);

// ============================================================================
// REDIS SESSION STORE
// ============================================================================

class RedisSessionStore {
  private redis: Redis;
  private maxMessages: number;
  private timeout: number;
  private prefix: string;

  constructor(redisClient: Redis) {
    this.redis = redisClient;
    this.maxMessages = parseInt(process.env.MAX_CONTEXT_MESSAGES || '20', 10);
    this.timeout = parseInt(process.env.SESSION_TIMEOUT_MS || '3600000', 10); // 1 hour
    this.prefix = 'session:';
  }

  async get(sessionId: string): Promise<Session | null> {
    try {
      const data = await this.redis.get(this.prefix + sessionId);
      if (!data) return null;

      const session: Session = JSON.parse(data);

      // Check if session expired
      if (Date.now() - session.lastActivity > this.timeout) {
        await this.delete(sessionId);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Session get error:', error);
      return null;
    }
  }

  async set(sessionId: string, session: Session): Promise<void> {
    try {
      // Keep only recent messages
      if (session.messages.length > this.maxMessages) {
        session.messages = session.messages.slice(-this.maxMessages);
      }

      session.lastActivity = Date.now();

      await this.redis.setex(
        this.prefix + sessionId,
        Math.floor(this.timeout / 1000),
        JSON.stringify(session)
      );
    } catch (error) {
      console.error('Session set error:', error);
    }
  }

  async delete(sessionId: string): Promise<void> {
    try {
      await this.redis.del(this.prefix + sessionId);
    } catch (error) {
      console.error('Session delete error:', error);
    }
  }

  async cleanup(): Promise<number> {
    // Redis handles TTL automatically, but we can scan for expired sessions
    try {
      let cursor = '0';
      let deleted = 0;
      const pattern = this.prefix + '*';

      do {
        const [nextCursor, keys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;

        for (const key of keys) {
          const data = await this.redis.get(key);
          if (data) {
            const session: Session = JSON.parse(data);
            if (Date.now() - session.lastActivity > this.timeout) {
              await this.redis.del(key);
              deleted++;
            }
          }
        }
      } while (cursor !== '0');

      return deleted;
    } catch (error) {
      console.error('Session cleanup error:', error);
      return 0;
    }
  }
}

const sessionStore = new RedisSessionStore(redis);

// Cleanup expired sessions every 5 minutes
setInterval(async () => {
  const deleted = await sessionStore.cleanup();
  if (deleted > 0) {
    console.log(`🧹 Cleaned up ${deleted} expired sessions`);
  }
}, 300000);

// ============================================================================
// KNOWLEDGE BASE LOADER
// ============================================================================

class KnowledgeBase {
  private content: string = '';
  private systemPrompt: string = '';
  public loaded: boolean = false;

  async load(): Promise<void> {
    try {
      const kbPath = path.resolve(__dirname, process.env.KNOWLEDGE_BASE_PATH || '../docs/PROJECT_KNOWLEDGE_BASE.md');
      this.content = await fs.readFile(kbPath, 'utf-8');

      const promptPath = path.resolve(__dirname, process.env.SYSTEM_PROMPT_PATH || './system-prompt.txt');
      this.systemPrompt = await fs.readFile(promptPath, 'utf-8');

      this.loaded = true;
      console.log('✅ Knowledge base loaded successfully');
      console.log(`📚 Knowledge base size: ${(this.content.length / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.error('❌ Error loading knowledge base:', error);
      this.loaded = false;
      this.systemPrompt = 'You are the HypeAI assistant. Answer questions about HypeAI platform.';
      this.content = 'HypeAI is a cryptocurrency platform with AI services on BNB Chain.';
    }
  }

  search(query: string): string {
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const lines = this.content.split('\n');
    const relevantLines: Array<{ line: string; score: number }> = [];

    for (const line of lines) {
      const lineLower = line.toLowerCase();
      const matches = keywords.filter(kw => lineLower.includes(kw)).length;
      if (matches > 0) {
        relevantLines.push({ line, score: matches });
      }
    }

    relevantLines.sort((a, b) => b.score - a.score);
    const topResults = relevantLines.slice(0, 30).map(r => r.line);

    return topResults.join('\n');
  }

  buildPrompt(userMessage: string, language: 'en' | 'ru' = 'en'): string {
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
// INPUT SANITIZATION
// ============================================================================

function sanitizeInput(input: string): string {
  // Remove HTML tags and scripts
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });

  // Trim and normalize whitespace
  return cleaned.trim().replace(/\s+/g, ' ');
}

// ============================================================================
// ANALYTICS LOGGER (with batching)
// ============================================================================

interface AnalyticsEvent {
  timestamp: string;
  event: string;
  [key: string]: any;
}

class Analytics {
  private logFile: string;
  private buffer: AnalyticsEvent[] = [];
  private flushInterval: number;
  private maxBufferSize: number;

  constructor() {
    this.logFile = path.resolve(__dirname, process.env.ANALYTICS_FILE || './analytics/usage.json');
    this.flushInterval = 60000; // Flush every minute
    this.maxBufferSize = 100;

    fs.mkdir(path.dirname(this.logFile), { recursive: true }).catch(console.error);

    setInterval(() => this.flush(), this.flushInterval);
  }

  async log(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    if (process.env.TRACK_ANALYTICS !== 'true') return;

    this.buffer.push({
      timestamp: new Date().toISOString(),
      ...event
    });

    if (this.buffer.length >= this.maxBufferSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    try {
      const data = this.buffer.splice(0);
      const existing = await fs.readFile(this.logFile, 'utf-8').catch(() => '[]');
      const logs: AnalyticsEvent[] = JSON.parse(existing);
      logs.push(...data);

      await fs.writeFile(this.logFile, JSON.stringify(logs, null, 2));
    } catch (error) {
      console.error('Analytics flush error:', error);
    }
  }
}

const analytics = new Analytics();

// ============================================================================
// WEBSOCKET REAL-TIME STREAMING
// ============================================================================

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('chat:start', async ({ message, sessionId, language }: ChatRequest) => {
    try {
      // Validate input
      const validated = chatRequestSchema.parse({ message, sessionId, language });

      // Sanitize message
      const sanitizedMessage = sanitizeInput(validated.message);
      if (!sanitizedMessage) {
        socket.emit('chat:error', { error: 'Invalid message after sanitization' });
        return;
      }

      // Generate or validate session ID
      const currentSessionId = validated.sessionId || uuidv4();

      // Get or create session
      let session = await sessionStore.get(currentSessionId);
      if (!session) {
        session = {
          sessionId: currentSessionId,
          messages: [],
          lastActivity: Date.now(),
          createdAt: Date.now(),
          metadata: {
            language: validated.language || 'en'
          }
        };
      }

      // Add user message to history
      const userMessage: Message = {
        role: 'user',
        content: sanitizedMessage,
        timestamp: new Date().toISOString()
      };
      session.messages.push(userMessage);

      // Build prompt with RAG
      const systemMessage = knowledgeBase.buildPrompt(sanitizedMessage, validated.language || 'en');

      // Stream response from Claude
      const stream = await anthropic.messages.stream({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: parseInt(process.env.MAX_TOKENS || '4096', 10),
        temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
        system: systemMessage,
        messages: session.messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      let fullResponse = '';
      const startTime = Date.now();

      // Stream chunks to client
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text;
          fullResponse += text;

          socket.emit('chat:chunk', {
            chunk: text,
            sessionId: currentSessionId
          });
        }
      }

      const responseTime = Date.now() - startTime;

      // Add assistant response to history
      const assistantMessage: Message = {
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString(),
        metadata: {
          responseTime,
          tokensUsed: stream.finalMessage?.usage?.output_tokens || 0
        }
      };
      session.messages.push(assistantMessage);

      // Save session
      await sessionStore.set(currentSessionId, session);

      // Send completion event
      socket.emit('chat:complete', {
        sessionId: currentSessionId,
        responseTime,
        timestamp: new Date().toISOString()
      });

      // Log analytics
      await analytics.log({
        event: 'chat',
        sessionId: currentSessionId,
        messageLength: sanitizedMessage.length,
        replyLength: fullResponse.length,
        language: validated.language,
        responseTime,
        tokensUsed: stream.finalMessage?.usage?.output_tokens || 0
      });

    } catch (error) {
      console.error('WebSocket chat error:', error);
      socket.emit('chat:error', {
        error: error instanceof Error ? error.message : 'An error occurred'
      });

      if (process.env.SENTRY_DSN) {
        Sentry.captureException(error);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ============================================================================
// REST API ROUTES (fallback for non-WebSocket clients)
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/api/ai-assistant/health', async (req: Request, res: Response) => {
  const redisHealthy = redis.status === 'ready';

  res.json({
    status: redisHealthy && knowledgeBase.loaded ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    knowledgeBase: knowledgeBase.loaded,
    redis: redisHealthy,
    sessions: await redis.dbsize(),
    uptime: process.uptime()
  });
});

/**
 * Chat endpoint - Main AI assistant interaction (REST fallback)
 */
app.post('/api/ai-assistant/chat', async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    // Validate input
    const validated = chatRequestSchema.parse(req.body);

    // Sanitize message
    const sanitizedMessage = sanitizeInput(validated.message);
    if (!sanitizedMessage) {
      return res.status(400).json({
        error: 'Invalid message after sanitization'
      });
    }

    // Generate or validate session ID
    const currentSessionId = validated.sessionId || uuidv4();

    // Get or create session
    let session = await sessionStore.get(currentSessionId);
    if (!session) {
      session = {
        sessionId: currentSessionId,
        messages: [],
        lastActivity: Date.now(),
        createdAt: Date.now(),
        metadata: {
          language: validated.language || 'en',
          userAgent: req.headers['user-agent'],
          ip: req.ip
        }
      };
    }

    // Build prompt with RAG
    const systemMessage = knowledgeBase.buildPrompt(sanitizedMessage, validated.language || 'en');

    // Add user message to history
    const userMessage: Message = {
      role: 'user',
      content: sanitizedMessage,
      timestamp: new Date().toISOString()
    };
    session.messages.push(userMessage);

    // Call Claude API (non-streaming)
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: parseInt(process.env.MAX_TOKENS || '4096', 10),
      temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
      system: systemMessage,
      messages: session.messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    });

    const reply = response.content[0].text;
    const responseTime = Date.now() - startTime;

    // Add assistant response to history
    const assistantMessage: Message = {
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString(),
      metadata: {
        responseTime,
        tokensUsed: response.usage.output_tokens
      }
    };
    session.messages.push(assistantMessage);

    // Save session
    await sessionStore.set(currentSessionId, session);

    // Log analytics
    await analytics.log({
      event: 'chat',
      sessionId: currentSessionId,
      messageLength: sanitizedMessage.length,
      replyLength: reply.length,
      language: validated.language,
      responseTime,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens
    });

    res.json({
      reply,
      sessionId: currentSessionId,
      timestamp: new Date().toISOString(),
      responseTime
    });

  } catch (error) {
    console.error('Chat error:', error);

    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error);
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as { status: number; message?: string };

      if (apiError.status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: 60
        });
      }

      return res.status(apiError.status).json({
        error: apiError.message || 'API error occurred'
      });
    }

    res.status(500).json({
      error: 'An error occurred processing your request',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * Feedback endpoint
 */
app.post('/api/ai-assistant/feedback', async (req: Request, res: Response) => {
  try {
    const validated = feedbackSchema.parse(req.body);

    await analytics.log({
      event: 'feedback',
      sessionId: validated.sessionId,
      messageId: validated.messageId || 'unknown',
      helpful: validated.helpful,
      comment: validated.comment || ''
    });

    res.json({
      success: true,
      message: 'Thank you for your feedback!'
    });

  } catch (error) {
    console.error('Feedback error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Error recording feedback'
    });
  }
});

/**
 * Clear session endpoint
 */
app.post('/api/ai-assistant/session/clear', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({
        error: 'sessionId is required'
      });
    }

    await sessionStore.delete(sessionId);

    res.json({
      success: true,
      message: 'Session cleared'
    });
  } catch (error) {
    console.error('Clear session error:', error);
    res.status(500).json({
      error: 'Error clearing session'
    });
  }
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

// Sentry error handler (must be before other error handlers)
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error:', err);

  res.status((err as any).status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer(): Promise<void> {
  try {
    // Wait for Redis connection
    if (redis.status !== 'ready') {
      console.log('⏳ Waiting for Redis connection...');
      await new Promise((resolve) => {
        redis.once('ready', resolve);
      });
    }

    // Load knowledge base
    await knowledgeBase.load();

    // Start server
    httpServer.listen(PORT, () => {
      console.log('');
      console.log('🚀 HypeAI AI Assistant API v2.0');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Health: http://localhost:${PORT}/api/ai-assistant/health`);
      console.log(`🤖 Chat:   POST http://localhost:${PORT}/api/ai-assistant/chat`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🧠 Model: ${process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'}`);
      console.log(`🛡️  Rate limit: ${process.env.RATE_LIMIT_MAX || 20} requests/${process.env.RATE_LIMIT_WINDOW_MS || 60000}ms`);
      console.log(`💾 Session store: Redis`);
      console.log(`🔄 Real-time: Socket.IO enabled`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received, shutting down gracefully...`);

  // Close HTTP server
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
  });

  // Close Socket.IO
  io.close(() => {
    console.log('✅ Socket.IO closed');
  });

  // Flush analytics
  await analytics.flush();
  console.log('✅ Analytics flushed');

  // Close Redis connection
  await redis.quit();
  console.log('✅ Redis connection closed');

  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();

export default app;
