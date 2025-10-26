import { Registry, Counter, Histogram, Gauge } from 'prom-client';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@core/logger.js';

const logger = new Logger('Metrics');

export class MetricsService {
  private static instance: MetricsService;
  private registry: Registry;

  // HTTP Metrics
  private httpRequestsTotal: Counter;
  private httpRequestDuration: Histogram;
  private httpRequestSize: Histogram;
  private httpResponseSize: Histogram;

  // WebSocket Metrics
  private wsConnectionsActive: Gauge;
  private wsConnectionsTotal: Counter;
  private wsMessagesTotal: Counter;

  // Agent Metrics
  private agentExecutionsTotal: Counter;
  private agentExecutionDuration: Histogram;
  private agentTasksQueued: Gauge;

  // Database Metrics
  private dbQueryDuration: Histogram;
  private dbConnectionsActive: Gauge;
  private dbErrorsTotal: Counter;

  // Redis Metrics
  private redisOperationDuration: Histogram;
  private redisErrorsTotal: Counter;

  // System Metrics
  private memoryUsage: Gauge;
  private cpuUsage: Gauge;

  private constructor() {
    this.registry = new Registry();

    // HTTP Metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_ms',
      help: 'HTTP request duration in milliseconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
      registers: [this.registry],
    });

    this.httpRequestSize = new Histogram({
      name: 'http_request_size_bytes',
      help: 'HTTP request size in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 1000, 10000, 100000, 1000000],
      registers: [this.registry],
    });

    this.httpResponseSize = new Histogram({
      name: 'http_response_size_bytes',
      help: 'HTTP response size in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 1000, 10000, 100000, 1000000],
      registers: [this.registry],
    });

    // WebSocket Metrics
    this.wsConnectionsActive = new Gauge({
      name: 'websocket_connections_active',
      help: 'Number of active WebSocket connections',
      registers: [this.registry],
    });

    this.wsConnectionsTotal = new Counter({
      name: 'websocket_connections_total',
      help: 'Total number of WebSocket connections',
      labelNames: ['status'],
      registers: [this.registry],
    });

    this.wsMessagesTotal = new Counter({
      name: 'websocket_messages_total',
      help: 'Total number of WebSocket messages',
      labelNames: ['direction', 'event'],
      registers: [this.registry],
    });

    // Agent Metrics
    this.agentExecutionsTotal = new Counter({
      name: 'agent_executions_total',
      help: 'Total number of agent task executions',
      labelNames: ['agent_type', 'status'],
      registers: [this.registry],
    });

    this.agentExecutionDuration = new Histogram({
      name: 'agent_execution_duration_ms',
      help: 'Agent task execution duration in milliseconds',
      labelNames: ['agent_type'],
      buckets: [100, 500, 1000, 5000, 10000, 30000, 60000],
      registers: [this.registry],
    });

    this.agentTasksQueued = new Gauge({
      name: 'agent_tasks_queued',
      help: 'Number of agent tasks in queue',
      registers: [this.registry],
    });

    // Database Metrics
    this.dbQueryDuration = new Histogram({
      name: 'database_query_duration_ms',
      help: 'Database query duration in milliseconds',
      labelNames: ['operation'],
      buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
      registers: [this.registry],
    });

    this.dbConnectionsActive = new Gauge({
      name: 'database_connections_active',
      help: 'Number of active database connections',
      registers: [this.registry],
    });

    this.dbErrorsTotal = new Counter({
      name: 'database_errors_total',
      help: 'Total number of database errors',
      labelNames: ['operation'],
      registers: [this.registry],
    });

    // Redis Metrics
    this.redisOperationDuration = new Histogram({
      name: 'redis_operation_duration_ms',
      help: 'Redis operation duration in milliseconds',
      labelNames: ['operation'],
      buckets: [1, 5, 10, 25, 50, 100],
      registers: [this.registry],
    });

    this.redisErrorsTotal = new Counter({
      name: 'redis_errors_total',
      help: 'Total number of Redis errors',
      labelNames: ['operation'],
      registers: [this.registry],
    });

    // System Metrics
    this.memoryUsage = new Gauge({
      name: 'process_memory_usage_bytes',
      help: 'Process memory usage in bytes',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.cpuUsage = new Gauge({
      name: 'process_cpu_usage_percent',
      help: 'Process CPU usage percentage',
      registers: [this.registry],
    });

    // Collect default metrics (process metrics)
    this.startSystemMetricsCollection();

    logger.info('Metrics service initialized');
  }

  static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  /**
   * Express middleware for HTTP metrics
   */
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      const route = req.route?.path || req.path;

      // Track request size
      const requestSize = parseInt(req.get('content-length') || '0');
      this.httpRequestSize.observe({ method: req.method, route }, requestSize);

      // Original end function
      const originalEnd = res.end;
      const self = this;

      res.end = function (this: Response, ...args: any[]): Response {
        const duration = Date.now() - start;
        const statusCode = res.statusCode.toString();

        // Track metrics
        self.httpRequestsTotal.inc({ method: req.method, route, status_code: statusCode });
        self.httpRequestDuration.observe({ method: req.method, route, status_code: statusCode }, duration);

        // Track response size
        const responseSize = parseInt(res.get('content-length') || '0');
        self.httpResponseSize.observe({ method: req.method, route }, responseSize);

        return originalEnd.apply(this, args as any);
      };

      next();
    };
  }

  /**
   * Record WebSocket connection
   */
  recordWsConnection(status: 'connected' | 'disconnected'): void {
    this.wsConnectionsTotal.inc({ status });
    if (status === 'connected') {
      this.wsConnectionsActive.inc();
    } else {
      this.wsConnectionsActive.dec();
    }
  }

  /**
   * Record WebSocket message
   */
  recordWsMessage(direction: 'inbound' | 'outbound', event: string): void {
    this.wsMessagesTotal.inc({ direction, event });
  }

  /**
   * Record agent execution
   */
  recordAgentExecution(
    agentType: string,
    status: 'success' | 'failure',
    duration: number
  ): void {
    this.agentExecutionsTotal.inc({ agent_type: agentType, status });
    this.agentExecutionDuration.observe({ agent_type: agentType }, duration);
  }

  /**
   * Set agent queue size
   */
  setAgentQueueSize(size: number): void {
    this.agentTasksQueued.set(size);
  }

  /**
   * Record database query
   */
  recordDbQuery(operation: string, duration: number, error?: boolean): void {
    this.dbQueryDuration.observe({ operation }, duration);
    if (error) {
      this.dbErrorsTotal.inc({ operation });
    }
  }

  /**
   * Set database connection count
   */
  setDbConnections(count: number): void {
    this.dbConnectionsActive.set(count);
  }

  /**
   * Record Redis operation
   */
  recordRedisOperation(operation: string, duration: number, error?: boolean): void {
    this.redisOperationDuration.observe({ operation }, duration);
    if (error) {
      this.redisErrorsTotal.inc({ operation });
    }
  }

  /**
   * Get metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Start collecting system metrics
   */
  private startSystemMetricsCollection(): void {
    setInterval(() => {
      const usage = process.memoryUsage();
      this.memoryUsage.set({ type: 'rss' }, usage.rss);
      this.memoryUsage.set({ type: 'heap_total' }, usage.heapTotal);
      this.memoryUsage.set({ type: 'heap_used' }, usage.heapUsed);
      this.memoryUsage.set({ type: 'external' }, usage.external);

      const cpuUsage = process.cpuUsage();
      const totalUsage = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
      this.cpuUsage.set(totalUsage);
    }, 5000); // Collect every 5 seconds
  }
}

export const metrics = MetricsService.getInstance();
