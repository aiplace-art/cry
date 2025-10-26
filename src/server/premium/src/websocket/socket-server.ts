import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { config } from '@core/config.js';
import { Logger } from '@core/logger.js';
import { AuthMiddleware, AuthPayload } from '@middleware/auth.middleware.js';
import { redis } from '@database/client.js';
import { MessageQueue } from './message-queue.js';

const logger = new Logger('SocketServer');

export interface AuthenticatedSocket extends Socket {
  user?: AuthPayload;
  sessionId?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class SocketServer {
  private io: SocketIOServer;
  private connections: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>
  private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map();
  private messageQueue: MessageQueue;

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.corsOrigins,
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e6, // 1MB
      transports: ['websocket', 'polling'],
    });

    this.messageQueue = new MessageQueue();
    this.setupMiddleware();
    this.setupEventHandlers();
    this.setupCleanup();

    logger.info('WebSocket server initialized');
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication required'));
        }

        const user = AuthMiddleware.verifyToken(token);
        if (!user) {
          return next(new Error('Invalid token'));
        }

        socket.user = user;
        next();
      } catch (error) {
        logger.error('Socket authentication error', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      if (!socket.user) return;

      const userId = socket.user.userId;
      logger.info('Client connected', { userId, socketId: socket.id });

      // Track connection
      if (!this.connections.has(userId)) {
        this.connections.set(userId, new Set());
      }
      this.connections.get(userId)!.add(socket.id);

      // Join user room
      socket.join(`user:${userId}`);

      // Setup heartbeat
      this.startHeartbeat(socket);

      // Join session room
      socket.on('join-session', async (sessionId: string) => {
        socket.sessionId = sessionId;
        socket.join(`session:${sessionId}`);
        logger.debug('Client joined session', { userId, sessionId });

        // Send queued messages
        const queuedMessages = await this.messageQueue.getMessages(sessionId);
        if (queuedMessages.length > 0) {
          socket.emit('queued-messages', queuedMessages);
          await this.messageQueue.clearMessages(sessionId);
        }

        socket.emit('session-joined', { sessionId });
      });

      // Leave session room
      socket.on('leave-session', (sessionId: string) => {
        socket.leave(`session:${sessionId}`);
        socket.sessionId = undefined;
        logger.debug('Client left session', { userId, sessionId });
        socket.emit('session-left', { sessionId });
      });

      // Chat message
      socket.on('chat-message', async (data: { sessionId: string; content: string }) => {
        try {
          const message: ChatMessage = {
            id: crypto.randomUUID(),
            sessionId: data.sessionId,
            role: 'user',
            content: data.content,
            timestamp: Date.now(),
          };

          // Broadcast to session room
          this.io.to(`session:${data.sessionId}`).emit('message', message);

          // Store in Redis for processing
          await redis.getClient().lpush(
            `pending:${data.sessionId}`,
            JSON.stringify(message)
          );

          socket.emit('message-sent', { messageId: message.id });
        } catch (error) {
          logger.error('Error handling chat message', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Typing indicator
      socket.on('typing', (data: { sessionId: string; isTyping: boolean }) => {
        socket.to(`session:${data.sessionId}`).emit('user-typing', {
          userId,
          isTyping: data.isTyping,
        });
      });

      // Heartbeat response
      socket.on('pong', () => {
        logger.trace('Heartbeat received', { userId, socketId: socket.id });
      });

      // Disconnection
      socket.on('disconnect', (reason) => {
        this.handleDisconnect(socket, reason);
      });

      // Error handling
      socket.on('error', (error) => {
        logger.error('Socket error', { userId, socketId: socket.id, error });
      });

      // Send welcome message
      socket.emit('connected', {
        userId,
        socketId: socket.id,
        timestamp: Date.now(),
      });
    });
  }

  private startHeartbeat(socket: AuthenticatedSocket): void {
    const interval = setInterval(() => {
      socket.emit('ping');
    }, config.wsHeartbeatInterval);

    this.heartbeatIntervals.set(socket.id, interval);
  }

  private handleDisconnect(socket: AuthenticatedSocket, reason: string): void {
    if (!socket.user) return;

    const userId = socket.user.userId;
    logger.info('Client disconnected', { userId, socketId: socket.id, reason });

    // Clear heartbeat
    const interval = this.heartbeatIntervals.get(socket.id);
    if (interval) {
      clearInterval(interval);
      this.heartbeatIntervals.delete(socket.id);
    }

    // Remove from connections
    const userSockets = this.connections.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        this.connections.delete(userId);
      }
    }
  }

  private setupCleanup(): void {
    // Cleanup inactive connections every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [userId, sockets] of this.connections.entries()) {
        if (sockets.size === 0) {
          this.connections.delete(userId);
          logger.debug('Cleaned up inactive user connection', { userId });
        }
      }
    }, 300000);
  }

  /**
   * Send message to specific session
   */
  async sendToSession(sessionId: string, event: string, data: any): Promise<void> {
    const room = `session:${sessionId}`;
    const socketsInRoom = await this.io.in(room).fetchSockets();

    if (socketsInRoom.length === 0) {
      // Queue message for later delivery
      await this.messageQueue.queueMessage(sessionId, { event, data });
      logger.debug('Message queued (no active connections)', { sessionId, event });
    } else {
      this.io.to(room).emit(event, data);
      logger.debug('Message sent to session', { sessionId, event, recipients: socketsInRoom.length });
    }
  }

  /**
   * Send message to specific user (all connections)
   */
  sendToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
    logger.debug('Message sent to user', { userId, event });
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(event: string, data: any): void {
    this.io.emit(event, data);
    logger.debug('Message broadcasted', { event });
  }

  /**
   * Get active connections count
   */
  getActiveConnections(): number {
    return this.io.sockets.sockets.size;
  }

  /**
   * Get user connection status
   */
  isUserOnline(userId: string): boolean {
    return this.connections.has(userId) && this.connections.get(userId)!.size > 0;
  }

  /**
   * Disconnect user (all sockets)
   */
  async disconnectUser(userId: string, reason?: string): Promise<void> {
    const sockets = await this.io.in(`user:${userId}`).fetchSockets();
    for (const socket of sockets) {
      socket.disconnect(true);
    }
    logger.info('User disconnected', { userId, reason, socketCount: sockets.length });
  }

  /**
   * Get server instance for raw Socket.IO operations
   */
  getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Graceful shutdown
   */
  async close(): Promise<void> {
    // Clear all heartbeat intervals
    for (const interval of this.heartbeatIntervals.values()) {
      clearInterval(interval);
    }
    this.heartbeatIntervals.clear();

    // Disconnect all clients
    this.io.disconnectSockets(true);

    // Close server
    this.io.close();

    logger.info('WebSocket server closed');
  }
}
