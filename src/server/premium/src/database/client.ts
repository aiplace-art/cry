import pg from 'pg';
import Redis from 'ioredis';
import { config } from '@core/config.js';
import { Logger } from '@core/logger.js';

const { Pool } = pg;
const logger = new Logger('Database');

// PostgreSQL Connection Pool
export class DatabaseClient {
  private static instance: DatabaseClient;
  private pool: pg.Pool;

  private constructor() {
    this.pool = new Pool({
      connectionString: config.databaseUrl,
      min: config.dbPoolMin,
      max: config.dbPoolMax,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      statement_timeout: 60000,
      query_timeout: 60000,
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected PostgreSQL pool error', err);
    });

    this.pool.on('connect', () => {
      logger.debug('New PostgreSQL client connected');
    });
  }

  static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  async query<T = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      logger.debug('Query executed', { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      logger.error('Query failed', { text, error });
      throw error;
    }
  }

  async transaction<T>(callback: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
    logger.info('PostgreSQL pool closed');
  }
}

// Redis Client
export class RedisClient {
  private static instance: RedisClient;
  private client: Redis;
  private subscriber: Redis;

  private constructor() {
    const redisOptions: Redis.RedisOptions = {
      host: new URL(config.redisUrl).hostname,
      port: parseInt(new URL(config.redisUrl).port || '6379'),
      password: config.redisPassword,
      db: config.redisDb,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis reconnecting, attempt ${times}`, { delay });
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
    };

    this.client = new Redis(redisOptions);
    this.subscriber = new Redis(redisOptions);

    this.client.on('error', (err) => {
      logger.error('Redis client error', err);
    });

    this.client.on('connect', () => {
      logger.info('Redis client connected');
    });

    this.subscriber.on('error', (err) => {
      logger.error('Redis subscriber error', err);
    });
  }

  static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  getClient(): Redis {
    return this.client;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

  async set(key: string, value: string, expiryMs?: number): Promise<void> {
    if (expiryMs) {
      await this.client.set(key, value, 'PX', expiryMs);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async setHash(key: string, data: Record<string, string>): Promise<void> {
    await this.client.hset(key, data);
  }

  async getHash(key: string): Promise<Record<string, string>> {
    return await this.client.hgetall(key);
  }

  async publish(channel: string, message: string): Promise<void> {
    await this.client.publish(channel, message);
  }

  async subscribe(channel: string, handler: (message: string) => void): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        handler(msg);
      }
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    await this.client.quit();
    await this.subscriber.quit();
    logger.info('Redis clients closed');
  }
}

export const db = DatabaseClient.getInstance();
export const redis = RedisClient.getInstance();
