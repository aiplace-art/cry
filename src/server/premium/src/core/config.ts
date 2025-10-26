import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

dotenvConfig();

const configSchema = z.object({
  // Server
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().int().positive().default(8080),
  host: z.string().default('0.0.0.0'),

  // API Keys
  anthropicApiKey: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
  jwtSecret: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  encryptionKey: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters'),

  // Database
  databaseUrl: z.string().url('DATABASE_URL must be a valid URL'),
  dbPoolMin: z.coerce.number().int().nonnegative().default(2),
  dbPoolMax: z.coerce.number().int().positive().default(10),

  // Redis
  redisUrl: z.string().url('REDIS_URL must be a valid URL'),
  redisPassword: z.string().optional(),
  redisDb: z.coerce.number().int().nonnegative().default(0),

  // WebSocket
  wsHeartbeatInterval: z.coerce.number().int().positive().default(30000),
  wsReconnectAttempts: z.coerce.number().int().positive().default(5),
  wsMaxConnections: z.coerce.number().int().positive().default(10000),

  // Rate Limiting
  rateLimitWindowMs: z.coerce.number().int().positive().default(900000),
  rateLimitMaxRequests: z.coerce.number().int().positive().default(100),

  // Session
  sessionTimeoutMs: z.coerce.number().int().positive().default(3600000),
  sessionCleanupIntervalMs: z.coerce.number().int().positive().default(300000),

  // Monitoring
  sentryDsn: z.string().optional(),
  metricsPort: z.coerce.number().int().positive().default(9090),

  // Agent Orchestration
  agentMaxConcurrent: z.coerce.number().int().positive().default(10),
  agentTimeoutMs: z.coerce.number().int().positive().default(300000),
  agentRetryAttempts: z.coerce.number().int().nonnegative().default(3),

  // Logging
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  logPretty: z.coerce.boolean().default(false),

  // CORS
  corsOrigins: z.string().transform(val => val.split(',')),

  // Security
  helmetCspDirectives: z.string().default("default-src 'self'"),
  bcryptRounds: z.coerce.number().int().positive().default(12),
});

export type Config = z.infer<typeof configSchema>;

const rawConfig = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  host: process.env.HOST,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  jwtSecret: process.env.JWT_SECRET,
  encryptionKey: process.env.ENCRYPTION_KEY,
  databaseUrl: process.env.DATABASE_URL,
  dbPoolMin: process.env.DB_POOL_MIN,
  dbPoolMax: process.env.DB_POOL_MAX,
  redisUrl: process.env.REDIS_URL,
  redisPassword: process.env.REDIS_PASSWORD,
  redisDb: process.env.REDIS_DB,
  wsHeartbeatInterval: process.env.WS_HEARTBEAT_INTERVAL,
  wsReconnectAttempts: process.env.WS_RECONNECT_ATTEMPTS,
  wsMaxConnections: process.env.WS_MAX_CONNECTIONS,
  rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS,
  rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
  sessionTimeoutMs: process.env.SESSION_TIMEOUT_MS,
  sessionCleanupIntervalMs: process.env.SESSION_CLEANUP_INTERVAL_MS,
  sentryDsn: process.env.SENTRY_DSN,
  metricsPort: process.env.METRICS_PORT,
  agentMaxConcurrent: process.env.AGENT_MAX_CONCURRENT,
  agentTimeoutMs: process.env.AGENT_TIMEOUT_MS,
  agentRetryAttempts: process.env.AGENT_RETRY_ATTEMPTS,
  logLevel: process.env.LOG_LEVEL,
  logPretty: process.env.LOG_PRETTY,
  corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:3000',
  helmetCspDirectives: process.env.HELMET_CSP_DIRECTIVES,
  bcryptRounds: process.env.BCRYPT_ROUNDS,
};

export const config = configSchema.parse(rawConfig);

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
export const isTest = config.nodeEnv === 'test';
