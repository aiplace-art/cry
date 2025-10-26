/**
 * Main Express Application
 * Integrates all backend components for AI Chat with Real-Time Agent Visualization
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const WebSocketServer = require('./websocket');
const ClaudeAPIClient = require('./claude-api');
const AgentGraphBuilder = require('./graph-builder');
const AgentOrchestrator = require('./orchestrator');
const APIRoutes = require('../api/routes');

class AIAgentChatApp {
  constructor(config = {}) {
    this.config = {
      port: config.port || process.env.PORT || 3001,
      corsOrigin: config.corsOrigin || process.env.CORS_ORIGIN || 'http://localhost:3000',
      anthropicApiKey: config.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
      nodeEnv: config.nodeEnv || process.env.NODE_ENV || 'development',
      enableRateLimiting: config.enableRateLimiting !== false,
      maxRequestsPerMinute: config.maxRequestsPerMinute || 50
    };

    this.validateConfig();

    // Initialize Express app
    this.app = express();

    // Initialize core components
    this.initializeComponents();

    // Setup middleware
    this.setupMiddleware();

    // Setup routes
    this.setupRoutes();

    // Setup error handling
    this.setupErrorHandling();
  }

  validateConfig() {
    if (!this.config.anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is required. Set it in .env file or pass in config.');
    }
  }

  initializeComponents() {
    console.log('[App] Initializing components...');

    // Initialize Claude API Client
    this.claudeAPI = new ClaudeAPIClient(this.config.anthropicApiKey, {
      maxRequestsPerMinute: this.config.maxRequestsPerMinute,
      enableRateLimiting: this.config.enableRateLimiting
    });

    // Initialize Graph Builder
    this.graphBuilder = new AgentGraphBuilder();

    // Initialize WebSocket Server (will be started later)
    this.websocketServer = new WebSocketServer(this.app, {
      origin: this.config.corsOrigin
    });

    // Initialize Orchestrator
    this.orchestrator = new AgentOrchestrator(
      this.claudeAPI,
      this.graphBuilder,
      this.websocketServer
    );

    // Initialize API Routes
    this.apiRoutes = new APIRoutes(
      this.orchestrator,
      this.claudeAPI,
      this.graphBuilder
    );

    console.log('[App] Components initialized successfully');
  }

  setupMiddleware() {
    // Security
    this.app.use(helmet({
      contentSecurityPolicy: false // Allow WebSocket connections
    }));

    // CORS
    this.app.use(cors({
      origin: this.config.corsOrigin,
      credentials: true
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (this.config.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Request ID middleware
    this.app.use((req, res, next) => {
      req.id = require('crypto').randomUUID();
      res.setHeader('X-Request-ID', req.id);
      next();
    });

    // Request timing
    this.app.use((req, res, next) => {
      req.startTime = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - req.startTime;
        console.log(`[${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`);
      });
      next();
    });
  }

  setupRoutes() {
    // API routes
    this.app.use('/api', this.apiRoutes.getRouter());

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'AI Agent Chat Backend',
        version: '1.0.0',
        status: 'online',
        endpoints: {
          health: '/api/health',
          chat: '/api/chat',
          agents: '/api/agents',
          metrics: '/api/metrics',
          websocket: '/ws'
        },
        documentation: '/api/docs'
      });
    });

    // API documentation
    this.app.get('/api/docs', (req, res) => {
      res.json({
        name: 'AI Agent Chat API',
        version: '1.0.0',
        baseUrl: `http://localhost:${this.config.port}/api`,
        endpoints: [
          {
            method: 'GET',
            path: '/health',
            description: 'Health check endpoint',
            response: 'Server health status and metrics'
          },
          {
            method: 'POST',
            path: '/chat',
            description: 'Send chat message with agent orchestration',
            body: {
              message: 'string (required)',
              sessionId: 'string (optional)',
              useOrchestration: 'boolean (default: true)'
            },
            response: 'Chat response with agent information'
          },
          {
            method: 'POST',
            path: '/chat/stream',
            description: 'Streaming chat endpoint (SSE)',
            body: {
              message: 'string (required)',
              sessionId: 'string (optional)'
            },
            response: 'Server-Sent Events stream'
          },
          {
            method: 'POST',
            path: '/chat/session',
            description: 'Create new chat session',
            body: {
              userRequest: 'string (required)',
              layoutType: 'string (optional: force|hierarchical|circular|grid)',
              metadata: 'object (optional)'
            },
            response: 'Session ID and status'
          },
          {
            method: 'GET',
            path: '/agents',
            description: 'Get all active agents',
            response: 'List of all agents across sessions'
          },
          {
            method: 'GET',
            path: '/agents/:sessionId',
            description: 'Get agents for specific session',
            response: 'List of agents in session'
          },
          {
            method: 'GET',
            path: '/metrics',
            description: 'Get global metrics',
            response: 'System-wide metrics and statistics'
          },
          {
            method: 'GET',
            path: '/metrics/:sessionId',
            description: 'Get session-specific metrics',
            response: 'Session metrics and agent statistics'
          },
          {
            method: 'GET',
            path: '/graph/:sessionId',
            description: 'Get agent graph for visualization',
            response: 'Graph nodes, edges, and layout data'
          },
          {
            method: 'PUT',
            path: '/graph/:sessionId/layout',
            description: 'Change graph layout type',
            body: {
              layoutType: 'string (hierarchical|circular|force|grid)'
            },
            response: 'Updated graph with new layout'
          },
          {
            method: 'GET',
            path: '/sessions',
            description: 'Get all active sessions',
            response: 'List of sessions with status'
          },
          {
            method: 'GET',
            path: '/sessions/:sessionId',
            description: 'Get session status and details',
            response: 'Complete session information'
          },
          {
            method: 'DELETE',
            path: '/chat/session/:sessionId',
            description: 'Delete session and cleanup',
            response: 'Deletion confirmation'
          }
        ],
        websocket: {
          url: 'ws://localhost:' + this.config.port + '/ws',
          events: {
            client_to_server: [
              'join_session',
              'leave_session',
              'heartbeat',
              'request_state'
            ],
            server_to_client: [
              'agent_spawned',
              'agent_status',
              'task_update',
              'message_chunk',
              'agent_connection',
              'metrics_update',
              'notification',
              'error'
            ]
          }
        }
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: {
          message: 'Route not found',
          code: 'NOT_FOUND',
          path: req.path
        }
      });
    });
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error('[App Error]', error);

      // Handle specific error types
      let statusCode = error.statusCode || 500;
      let errorCode = error.code || 'INTERNAL_ERROR';

      if (error.name === 'ValidationError') {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
      } else if (error.name === 'UnauthorizedError') {
        statusCode = 401;
        errorCode = 'UNAUTHORIZED';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: errorCode,
          requestId: req.id,
          ...(this.config.nodeEnv === 'development' && { stack: error.stack })
        }
      });
    });

    // Unhandled rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      console.error('[Unhandled Rejection]', reason);
    });

    // Uncaught exception handler
    process.on('uncaughtException', (error) => {
      console.error('[Uncaught Exception]', error);
      this.shutdown(1);
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      try {
        // Start WebSocket server (which includes HTTP server)
        this.websocketServer.listen(this.config.port, () => {
          console.log('');
          console.log('╔══════════════════════════════════════════════════╗');
          console.log('║   AI Agent Chat Backend - Server Started        ║');
          console.log('╚══════════════════════════════════════════════════╝');
          console.log('');
          console.log(`🚀 Server:        http://localhost:${this.config.port}`);
          console.log(`📡 WebSocket:     ws://localhost:${this.config.port}/ws`);
          console.log(`📚 API Docs:      http://localhost:${this.config.port}/api/docs`);
          console.log(`🏥 Health Check:  http://localhost:${this.config.port}/api/health`);
          console.log(`🌍 Environment:   ${this.config.nodeEnv}`);
          console.log(`🔧 CORS Origin:   ${this.config.corsOrigin}`);
          console.log('');
          console.log('📊 Features:');
          console.log('   ✓ Real-time agent visualization');
          console.log('   ✓ WebSocket communication');
          console.log('   ✓ Claude API integration');
          console.log('   ✓ Agent orchestration');
          console.log('   ✓ Graph-based agent coordination');
          console.log('');

          resolve(this);
        });

        // Graceful shutdown handling
        process.on('SIGTERM', () => this.shutdown(0));
        process.on('SIGINT', () => this.shutdown(0));

      } catch (error) {
        console.error('[App] Failed to start server:', error);
        reject(error);
      }
    });
  }

  shutdown(exitCode = 0) {
    console.log('\n[App] Shutting down gracefully...');

    // Close WebSocket server
    this.websocketServer.close(() => {
      console.log('[App] WebSocket server closed');
    });

    // Cleanup sessions
    const sessions = this.orchestrator.sessions.keys();
    for (const sessionId of sessions) {
      this.orchestrator.cleanupSession(sessionId);
    }

    console.log('[App] Cleanup completed');

    setTimeout(() => {
      process.exit(exitCode);
    }, 1000);
  }

  getComponents() {
    return {
      app: this.app,
      websocketServer: this.websocketServer,
      claudeAPI: this.claudeAPI,
      graphBuilder: this.graphBuilder,
      orchestrator: this.orchestrator
    };
  }
}

module.exports = AIAgentChatApp;
