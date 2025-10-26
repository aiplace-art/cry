import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { config } from '@core/config.js';
import { logger } from '@core/logger.js';
import { db, redis } from '@database/client.js';
import { SocketServer } from '@websocket/socket-server.js';
import { metrics } from '@monitoring/metrics.js';
import { sentry } from '@monitoring/sentry.js';
import chatRoutes from '@api/routes/chat.routes.js';

const log = logger.child('Server');

export class Server {
  private app: Express;
  private httpServer: ReturnType<typeof createServer>;
  private socketServer: SocketServer;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.socketServer = new SocketServer(this.httpServer);

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Sentry request tracking
    this.app.use(sentry.requestHandler());

    // Security headers
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // CORS
    this.app.use(cors({
      origin: config.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Metrics collection
    this.app.use(metrics.middleware());

    log.info('Middleware configured');
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', async (req: Request, res: Response) => {
      const dbHealthy = await db.healthCheck();
      const redisHealthy = await redis.healthCheck();

      const health = {
        status: dbHealthy && redisHealthy ? 'healthy' : 'unhealthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        checks: {
          database: dbHealthy ? 'connected' : 'disconnected',
          redis: redisHealthy ? 'connected' : 'disconnected',
          websocket: this.socketServer.getActiveConnections() >= 0 ? 'active' : 'inactive',
        },
      };

      res.status(health.status === 'healthy' ? 200 : 503).json(health);
    });

    // Metrics endpoint
    this.app.get('/metrics', async (req: Request, res: Response) => {
      try {
        const metricsData = await metrics.getMetrics();
        res.set('Content-Type', 'text/plain');
        res.send(metricsData);
      } catch (error) {
        log.error('Failed to generate metrics', error);
        res.status(500).send('Error generating metrics');
      }
    });

    // API routes
    this.app.use('/api/chat', chatRoutes);

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
      });
    });

    log.info('Routes configured');
  }

  private setupErrorHandling(): void {
    // Sentry error handler
    this.app.use(sentry.errorHandler());

    // Global error handler
    this.app.use((err: Error, req: Request, res: Response, next: any) => {
      log.error('Unhandled error', err);

      res.status(500).json({
        error: 'Internal Server Error',
        message: config.nodeEnv === 'production'
          ? 'An unexpected error occurred'
          : err.message,
        ...(config.nodeEnv !== 'production' && { stack: err.stack }),
      });
    });

    // Uncaught exception handler
    process.on('uncaughtException', (error: Error) => {
      log.fatal('Uncaught exception', error);
      sentry.captureException(error);
      this.shutdown().then(() => process.exit(1));
    });

    // Unhandled rejection handler
    process.on('unhandledRejection', (reason: any) => {
      log.fatal('Unhandled rejection', { reason });
      sentry.captureException(new Error(`Unhandled rejection: ${reason}`));
      this.shutdown().then(() => process.exit(1));
    });

    // Graceful shutdown signals
    process.on('SIGTERM', () => {
      log.info('SIGTERM received, shutting down gracefully');
      this.shutdown().then(() => process.exit(0));
    });

    process.on('SIGINT', () => {
      log.info('SIGINT received, shutting down gracefully');
      this.shutdown().then(() => process.exit(0));
    });

    log.info('Error handling configured');
  }

  async start(): Promise<void> {
    try {
      // Test database connection
      const dbHealthy = await db.healthCheck();
      if (!dbHealthy) {
        throw new Error('Database connection failed');
      }
      log.info('Database connected');

      // Test Redis connection
      const redisHealthy = await redis.healthCheck();
      if (!redisHealthy) {
        throw new Error('Redis connection failed');
      }
      log.info('Redis connected');

      // Start HTTP server
      await new Promise<void>((resolve) => {
        this.httpServer.listen(config.port, config.host, () => {
          log.info(`Server listening`, {
            host: config.host,
            port: config.port,
            env: config.nodeEnv,
          });
          resolve();
        });
      });

      log.info('🚀 HYPEAI Enterprise Chat Backend started successfully');
    } catch (error) {
      log.fatal('Failed to start server', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    log.info('Starting graceful shutdown...');

    try {
      // Close WebSocket server
      await this.socketServer.close();
      log.info('WebSocket server closed');

      // Close HTTP server
      await new Promise<void>((resolve, reject) => {
        this.httpServer.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      log.info('HTTP server closed');

      // Close database connections
      await db.close();
      log.info('Database connections closed');

      // Close Redis connections
      await redis.close();
      log.info('Redis connections closed');

      // Flush Sentry events
      await sentry.flush();
      await sentry.close();
      log.info('Sentry closed');

      log.info('Graceful shutdown completed');
    } catch (error) {
      log.error('Error during shutdown', error);
      throw error;
    }
  }
}

// Start server if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new Server();

  server.start().catch((error) => {
    log.fatal('Failed to start server', error);
    process.exit(1);
  });
}

export default Server;
