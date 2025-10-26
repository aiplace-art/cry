/**
 * API Routes for AI Chat Backend
 * RESTful endpoints for chat, agents, and metrics
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

class APIRoutes {
  constructor(orchestrator, claudeAPI, graphBuilder) {
    this.router = express.Router();
    this.orchestrator = orchestrator;
    this.claudeAPI = claudeAPI;
    this.graphBuilder = graphBuilder;

    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupRoutes() {
    // Health check
    this.router.get('/health', this.handleHealthCheck.bind(this));

    // Chat endpoints
    this.router.post('/chat', this.handleChatMessage.bind(this));
    this.router.post('/chat/stream', this.handleStreamingChat.bind(this));
    this.router.post('/chat/session', this.handleCreateSession.bind(this));
    this.router.delete('/chat/session/:sessionId', this.handleDeleteSession.bind(this));

    // Agent endpoints
    this.router.get('/agents', this.handleGetAgents.bind(this));
    this.router.get('/agents/:sessionId', this.handleGetSessionAgents.bind(this));
    this.router.get('/agents/:sessionId/:agentId', this.handleGetAgentDetails.bind(this));

    // Metrics endpoints
    this.router.get('/metrics', this.handleGetMetrics.bind(this));
    this.router.get('/metrics/:sessionId', this.handleGetSessionMetrics.bind(this));

    // Graph endpoints
    this.router.get('/graph/:sessionId', this.handleGetGraph.bind(this));
    this.router.put('/graph/:sessionId/layout', this.handleSetLayout.bind(this));

    // Session management
    this.router.get('/sessions', this.handleGetSessions.bind(this));
    this.router.get('/sessions/:sessionId', this.handleGetSessionStatus.bind(this));
  }

  setupErrorHandling() {
    // Global error handler
    this.router.use((error, req, res, next) => {
      console.error('[API Error]', error);

      const statusCode = error.statusCode || 500;
      const response = {
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: error.code || 'INTERNAL_ERROR',
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        }
      };

      res.status(statusCode).json(response);
    });
  }

  // Health Check
  async handleHealthCheck(req, res) {
    try {
      const health = {
        status: 'healthy',
        timestamp: Date.now(),
        uptime: process.uptime(),
        services: {
          orchestrator: 'online',
          claude_api: 'online',
          graph_builder: 'online'
        },
        metrics: this.claudeAPI.getMetrics()
      };

      res.json(health);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error.message
      });
    }
  }

  // Create new chat session
  async handleCreateSession(req, res, next) {
    try {
      const { userRequest, layoutType = 'force', metadata = {} } = req.body;

      if (!userRequest) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'userRequest is required',
            code: 'MISSING_PARAMETER'
          }
        });
      }

      const session = await this.orchestrator.createSession(userRequest, {
        layoutType,
        metadata
      });

      res.status(201).json({
        success: true,
        data: {
          sessionId: session.id,
          status: session.status,
          createdAt: session.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Send chat message (with agent orchestration)
  async handleChatMessage(req, res, next) {
    try {
      const { message, sessionId, useOrchestration = true } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'message is required',
            code: 'MISSING_PARAMETER'
          }
        });
      }

      let effectiveSessionId = sessionId || uuidv4();

      if (useOrchestration) {
        // Create session if needed
        if (!this.orchestrator.sessions.has(effectiveSessionId)) {
          await this.orchestrator.createSession(message, {
            sessionId: effectiveSessionId
          });
        }

        // Process with orchestration
        const result = await this.orchestrator.processRequest(effectiveSessionId, message);

        res.json({
          success: true,
          data: {
            sessionId: effectiveSessionId,
            response: result.response,
            agents: result.agents.map(a => ({
              id: a.id,
              type: a.type,
              name: a.name,
              status: a.status
            })),
            usage: result.usage
          }
        });
      } else {
        // Simple chat without orchestration
        const result = await this.claudeAPI.sendMessage(effectiveSessionId, message);

        res.json({
          success: true,
          data: {
            sessionId: effectiveSessionId,
            response: result.response,
            usage: result.usage
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // Streaming chat endpoint
  async handleStreamingChat(req, res, next) {
    try {
      const { message, sessionId } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'message is required',
            code: 'MISSING_PARAMETER'
          }
        });
      }

      const effectiveSessionId = sessionId || uuidv4();

      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Stream response
      await this.claudeAPI.streamMessage(
        effectiveSessionId,
        message,
        null,
        (chunkData) => {
          const data = JSON.stringify({
            chunk: chunkData.chunk,
            fullResponse: chunkData.fullResponse,
            isComplete: chunkData.isComplete
          });

          res.write(`data: ${data}\n\n`);

          if (chunkData.isComplete) {
            res.end();
          }
        }
      );
    } catch (error) {
      const errorData = JSON.stringify({
        error: error.message,
        code: error.code
      });
      res.write(`data: ${errorData}\n\n`);
      res.end();
    }
  }

  // Delete session
  async handleDeleteSession(req, res, next) {
    try {
      const { sessionId } = req.params;

      this.orchestrator.cleanupSession(sessionId);

      res.json({
        success: true,
        data: {
          message: 'Session deleted successfully',
          sessionId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all active agents across sessions
  async handleGetAgents(req, res, next) {
    try {
      const allAgents = [];

      this.orchestrator.agents.forEach((agentsMap, sessionId) => {
        agentsMap.forEach(agent => {
          allAgents.push({
            sessionId,
            ...agent
          });
        });
      });

      res.json({
        success: true,
        data: {
          agents: allAgents,
          count: allAgents.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get agents for specific session
  async handleGetSessionAgents(req, res, next) {
    try {
      const { sessionId } = req.params;

      const agentsMap = this.orchestrator.agents.get(sessionId);

      if (!agentsMap) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Session not found',
            code: 'SESSION_NOT_FOUND'
          }
        });
      }

      const agents = Array.from(agentsMap.values());

      res.json({
        success: true,
        data: {
          sessionId,
          agents,
          count: agents.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get specific agent details
  async handleGetAgentDetails(req, res, next) {
    try {
      const { sessionId, agentId } = req.params;

      const agentsMap = this.orchestrator.agents.get(sessionId);

      if (!agentsMap) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Session not found',
            code: 'SESSION_NOT_FOUND'
          }
        });
      }

      const agent = agentsMap.get(agentId);

      if (!agent) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Agent not found',
            code: 'AGENT_NOT_FOUND'
          }
        });
      }

      res.json({
        success: true,
        data: agent
      });
    } catch (error) {
      next(error);
    }
  }

  // Get global metrics
  async handleGetMetrics(req, res, next) {
    try {
      const claudeMetrics = this.claudeAPI.getMetrics();

      const totalSessions = this.orchestrator.sessions.size;
      const activeSessions = Array.from(this.orchestrator.sessions.values())
        .filter(s => s.status === 'active').length;

      const totalAgents = Array.from(this.orchestrator.agents.values())
        .reduce((sum, agentsMap) => sum + agentsMap.size, 0);

      res.json({
        success: true,
        data: {
          claude: claudeMetrics,
          sessions: {
            total: totalSessions,
            active: activeSessions
          },
          agents: {
            total: totalAgents
          },
          timestamp: Date.now()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get session-specific metrics
  async handleGetSessionMetrics(req, res, next) {
    try {
      const { sessionId } = req.params;

      const metrics = this.orchestrator.getSessionMetrics(sessionId);

      if (!metrics) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Session not found',
            code: 'SESSION_NOT_FOUND'
          }
        });
      }

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  }

  // Get graph data for session
  async handleGetGraph(req, res, next) {
    try {
      const { sessionId } = req.params;

      const graphData = this.graphBuilder.getGraphData(sessionId);

      if (!graphData) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Graph not found for session',
            code: 'GRAPH_NOT_FOUND'
          }
        });
      }

      const stats = this.graphBuilder.getGraphStats(sessionId);

      res.json({
        success: true,
        data: {
          graph: graphData,
          stats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Set graph layout type
  async handleSetLayout(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { layoutType } = req.body;

      if (!['hierarchical', 'circular', 'force', 'grid'].includes(layoutType)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid layout type',
            code: 'INVALID_LAYOUT'
          }
        });
      }

      this.graphBuilder.setLayoutType(sessionId, layoutType);

      const graphData = this.graphBuilder.getGraphData(sessionId);

      res.json({
        success: true,
        data: {
          layoutType,
          graph: graphData
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all sessions
  async handleGetSessions(req, res, next) {
    try {
      const sessions = Array.from(this.orchestrator.sessions.values()).map(session => ({
        id: session.id,
        status: session.status,
        userRequest: session.userRequest,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        agentCount: this.orchestrator.agents.get(session.id)?.size || 0
      }));

      res.json({
        success: true,
        data: {
          sessions,
          count: sessions.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get session status
  async handleGetSessionStatus(req, res, next) {
    try {
      const { sessionId } = req.params;

      const status = this.orchestrator.getSessionStatus(sessionId);

      if (!status) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Session not found',
            code: 'SESSION_NOT_FOUND'
          }
        });
      }

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  }

  getRouter() {
    return this.router;
  }
}

module.exports = APIRoutes;
