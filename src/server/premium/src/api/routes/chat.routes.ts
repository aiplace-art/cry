import { Router } from 'express';
import { z } from 'zod';
import { AuthMiddleware, AuthRequest } from '@middleware/auth.middleware.js';
import { ValidationMiddleware, commonSchemas } from '@middleware/validation.middleware.js';
import { RateLimitMiddleware } from '@middleware/rate-limit.middleware.js';
import { sessionRepository } from '@database/repositories/session.repository.js';
import { messageRepository } from '@database/repositories/message.repository.js';
import { agentOrchestrator } from '@agents/orchestrator.js';
import { claudeClient } from '@agents/claude-client.js';
import { Logger } from '@core/logger.js';
import { metrics } from '@monitoring/metrics.js';

const logger = new Logger('ChatRoutes');
const router = Router();

// Apply authentication to all chat routes
router.use(AuthMiddleware.authenticate);

// Rate limiting for chat endpoints
router.use(RateLimitMiddleware.strict({
  maxRequests: 30,
  windowMs: 60000, // 30 requests per minute
}));

/**
 * POST /api/chat/send
 * Send a chat message
 */
const sendMessageSchema = z.object({
  sessionId: commonSchemas.uuid,
  content: commonSchemas.messageContent,
  agentType: z.string().optional().default('chat-assistant'),
});

router.post(
  '/send',
  ValidationMiddleware.validateBody(sendMessageSchema),
  ValidationMiddleware.sanitizeHtml,
  async (req: AuthRequest, res) => {
    const start = Date.now();

    try {
      const { sessionId, content, agentType } = req.body;
      const userId = req.user!.userId;

      // Verify session ownership
      const session = await sessionRepository.findById(sessionId);
      if (!session || session.userId !== userId) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Session not found or access denied',
        });
        return;
      }

      // Save user message
      const userMessage = await messageRepository.create({
        sessionId,
        userId,
        role: 'user',
        content,
      });

      // Create agent task
      const taskId = await agentOrchestrator.createTask(
        agentType,
        sessionId,
        userId,
        {
          messages: [{ role: 'user', content }],
        },
        'high'
      );

      const duration = Date.now() - start;
      metrics.recordAgentExecution(agentType, 'success', duration);

      res.status(200).json({
        success: true,
        messageId: userMessage.id,
        taskId,
        message: 'Message sent successfully',
      });

      logger.info('Message sent', { userId, sessionId, taskId });
    } catch (error) {
      logger.error('Failed to send message', error);

      const duration = Date.now() - start;
      metrics.recordAgentExecution('chat-assistant', 'failure', duration);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to send message',
      });
    }
  }
);

/**
 * GET /api/chat/history/:sessionId
 * Get chat message history
 */
const historyQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

router.get(
  '/history/:sessionId',
  ValidationMiddleware.validateParams(z.object({ sessionId: commonSchemas.uuid })),
  ValidationMiddleware.validateQuery(historyQuerySchema),
  async (req: AuthRequest, res) => {
    try {
      const { sessionId } = req.params;
      const { limit, offset } = req.query as any;
      const userId = req.user!.userId;

      // Verify session ownership
      const session = await sessionRepository.findById(sessionId);
      if (!session || session.userId !== userId) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Session not found or access denied',
        });
        return;
      }

      // Get messages
      const messages = await messageRepository.findBySessionId(sessionId, limit, offset);
      const total = await messageRepository.countBySessionId(sessionId);

      res.status(200).json({
        success: true,
        data: {
          messages,
          pagination: {
            limit,
            offset,
            total,
            hasMore: offset + messages.length < total,
          },
        },
      });

      logger.debug('Chat history retrieved', { userId, sessionId, count: messages.length });
    } catch (error) {
      logger.error('Failed to retrieve chat history', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve chat history',
      });
    }
  }
);

/**
 * GET /api/chat/suggestions
 * Get AI-generated suggestions based on context
 */
const suggestionsQuerySchema = z.object({
  sessionId: commonSchemas.uuid,
  count: z.coerce.number().int().positive().max(5).default(3),
});

router.get(
  '/suggestions',
  ValidationMiddleware.validateQuery(suggestionsQuerySchema),
  async (req: AuthRequest, res) => {
    try {
      const { sessionId, count } = req.query as any;
      const userId = req.user!.userId;

      // Verify session ownership
      const session = await sessionRepository.findById(sessionId);
      if (!session || session.userId !== userId) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Session not found or access denied',
        });
        return;
      }

      // Get recent messages for context
      const recentMessages = await messageRepository.findBySessionId(sessionId, 5);
      const context = recentMessages
        .reverse()
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      // Generate suggestions
      const suggestions = await claudeClient.generateSuggestions(context, count);

      res.status(200).json({
        success: true,
        data: { suggestions },
      });

      logger.debug('Suggestions generated', { userId, sessionId, count: suggestions.length });
    } catch (error) {
      logger.error('Failed to generate suggestions', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to generate suggestions',
      });
    }
  }
);

/**
 * POST /api/chat/session
 * Create a new chat session
 */
const createSessionSchema = z.object({
  title: commonSchemas.sessionTitle.optional(),
  agentType: z.string().optional(),
});

router.post(
  '/session',
  ValidationMiddleware.validateBody(createSessionSchema),
  async (req: AuthRequest, res) => {
    try {
      const { title, agentType } = req.body;
      const userId = req.user!.userId;

      const session = await sessionRepository.create({
        userId,
        title,
        agentType,
      });

      res.status(201).json({
        success: true,
        data: { session },
      });

      logger.info('Session created', { userId, sessionId: session.id });
    } catch (error) {
      logger.error('Failed to create session', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create session',
      });
    }
  }
);

/**
 * GET /api/chat/sessions
 * List user's chat sessions
 */
router.get(
  '/sessions',
  ValidationMiddleware.validateQuery(commonSchemas.pagination),
  async (req: AuthRequest, res) => {
    try {
      const { limit, offset } = req.query as any;
      const userId = req.user!.userId;

      const sessions = await sessionRepository.findByUserId(userId, limit, offset);

      res.status(200).json({
        success: true,
        data: {
          sessions,
          pagination: { limit, offset },
        },
      });

      logger.debug('Sessions listed', { userId, count: sessions.length });
    } catch (error) {
      logger.error('Failed to list sessions', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to list sessions',
      });
    }
  }
);

/**
 * DELETE /api/chat/session/:sessionId
 * Delete a chat session
 */
router.delete(
  '/session/:sessionId',
  ValidationMiddleware.validateParams(z.object({ sessionId: commonSchemas.uuid })),
  async (req: AuthRequest, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.userId;

      // Verify session ownership
      const session = await sessionRepository.findById(sessionId);
      if (!session || session.userId !== userId) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Session not found or access denied',
        });
        return;
      }

      await sessionRepository.delete(sessionId);

      res.status(200).json({
        success: true,
        message: 'Session deleted successfully',
      });

      logger.info('Session deleted', { userId, sessionId });
    } catch (error) {
      logger.error('Failed to delete session', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete session',
      });
    }
  }
);

export default router;
