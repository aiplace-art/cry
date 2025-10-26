/**
 * WebSocket Server for Real-Time Agent Visualization
 * Handles real-time communication for agent status, task updates, and streaming messages
 */

const { Server } = require('socket.io');
const { createServer } = require('http');

class WebSocketServer {
  constructor(expressApp, corsOptions = {}) {
    this.httpServer = createServer(expressApp);
    this.io = new Server(this.httpServer, {
      cors: {
        origin: corsOptions.origin || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.rooms = new Map(); // sessionId -> Set of socketIds
    this.socketSessions = new Map(); // socketId -> sessionId
    this.heartbeats = new Map(); // socketId -> timestamp

    this.setupEventHandlers();
    this.startHeartbeatMonitor();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`[WebSocket] Client connected: ${socket.id}`);
      this.heartbeats.set(socket.id, Date.now());

      // Join session room
      socket.on('join_session', (sessionId) => {
        this.handleJoinSession(socket, sessionId);
      });

      // Leave session room
      socket.on('leave_session', (sessionId) => {
        this.handleLeaveSession(socket, sessionId);
      });

      // Heartbeat from client
      socket.on('heartbeat', () => {
        this.heartbeats.set(socket.id, Date.now());
        socket.emit('heartbeat_ack');
      });

      // Request current state
      socket.on('request_state', (sessionId) => {
        this.handleStateRequest(socket, sessionId);
      });

      // Disconnect handler
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Error handler
      socket.on('error', (error) => {
        console.error(`[WebSocket] Socket error for ${socket.id}:`, error);
      });
    });
  }

  handleJoinSession(socket, sessionId) {
    if (!sessionId) {
      socket.emit('error', { message: 'Session ID is required' });
      return;
    }

    // Leave previous session if any
    const previousSession = this.socketSessions.get(socket.id);
    if (previousSession) {
      this.handleLeaveSession(socket, previousSession);
    }

    // Join new session
    socket.join(sessionId);

    if (!this.rooms.has(sessionId)) {
      this.rooms.set(sessionId, new Set());
    }
    this.rooms.get(sessionId).add(socket.id);
    this.socketSessions.set(socket.id, sessionId);

    console.log(`[WebSocket] Socket ${socket.id} joined session ${sessionId}`);
    socket.emit('session_joined', { sessionId, timestamp: Date.now() });

    // Notify others in room
    socket.to(sessionId).emit('client_joined', {
      socketId: socket.id,
      timestamp: Date.now()
    });
  }

  handleLeaveSession(socket, sessionId) {
    socket.leave(sessionId);

    const room = this.rooms.get(sessionId);
    if (room) {
      room.delete(socket.id);
      if (room.size === 0) {
        this.rooms.delete(sessionId);
      }
    }

    this.socketSessions.delete(socket.id);
    console.log(`[WebSocket] Socket ${socket.id} left session ${sessionId}`);

    socket.to(sessionId).emit('client_left', {
      socketId: socket.id,
      timestamp: Date.now()
    });
  }

  handleStateRequest(socket, sessionId) {
    // This will be implemented by the orchestrator to send current state
    socket.emit('state_request_received', { sessionId });
  }

  handleDisconnect(socket) {
    console.log(`[WebSocket] Client disconnected: ${socket.id}`);

    const sessionId = this.socketSessions.get(socket.id);
    if (sessionId) {
      this.handleLeaveSession(socket, sessionId);
    }

    this.heartbeats.delete(socket.id);
  }

  startHeartbeatMonitor() {
    // Check for stale connections every 30 seconds
    setInterval(() => {
      const now = Date.now();
      const timeout = 90000; // 90 seconds

      this.heartbeats.forEach((timestamp, socketId) => {
        if (now - timestamp > timeout) {
          console.log(`[WebSocket] Disconnecting stale socket: ${socketId}`);
          const socket = this.io.sockets.sockets.get(socketId);
          if (socket) {
            socket.disconnect(true);
          }
          this.heartbeats.delete(socketId);
        }
      });
    }, 30000);
  }

  // Event emission methods

  /**
   * Emit agent spawned event
   */
  emitAgentSpawned(sessionId, agentData) {
    this.io.to(sessionId).emit('agent_spawned', {
      type: 'agent_spawned',
      timestamp: Date.now(),
      data: {
        agentId: agentData.agentId,
        agentType: agentData.agentType,
        name: agentData.name,
        status: 'initializing',
        capabilities: agentData.capabilities || [],
        position: agentData.position || { x: 0, y: 0 }
      }
    });
  }

  /**
   * Emit agent status update
   */
  emitAgentStatus(sessionId, agentId, status, metadata = {}) {
    this.io.to(sessionId).emit('agent_status', {
      type: 'agent_status',
      timestamp: Date.now(),
      data: {
        agentId,
        status, // initializing, working, waiting, completed, error
        ...metadata
      }
    });
  }

  /**
   * Emit task update
   */
  emitTaskUpdate(sessionId, taskData) {
    this.io.to(sessionId).emit('task_update', {
      type: 'task_update',
      timestamp: Date.now(),
      data: {
        taskId: taskData.taskId,
        agentId: taskData.agentId,
        status: taskData.status, // pending, in_progress, completed, failed
        progress: taskData.progress || 0,
        message: taskData.message || '',
        result: taskData.result || null
      }
    });
  }

  /**
   * Emit streaming message chunk
   */
  emitMessageChunk(sessionId, chunkData) {
    this.io.to(sessionId).emit('message_chunk', {
      type: 'message_chunk',
      timestamp: Date.now(),
      data: {
        messageId: chunkData.messageId,
        chunk: chunkData.chunk,
        isComplete: chunkData.isComplete || false,
        agentId: chunkData.agentId || null
      }
    });
  }

  /**
   * Emit agent connection/edge
   */
  emitAgentConnection(sessionId, fromAgentId, toAgentId, connectionType = 'dependency') {
    this.io.to(sessionId).emit('agent_connection', {
      type: 'agent_connection',
      timestamp: Date.now(),
      data: {
        from: fromAgentId,
        to: toAgentId,
        connectionType // dependency, communication, data_flow
      }
    });
  }

  /**
   * Emit metrics update
   */
  emitMetrics(sessionId, metrics) {
    this.io.to(sessionId).emit('metrics_update', {
      type: 'metrics_update',
      timestamp: Date.now(),
      data: metrics
    });
  }

  /**
   * Emit error event
   */
  emitError(sessionId, error) {
    this.io.to(sessionId).emit('error', {
      type: 'error',
      timestamp: Date.now(),
      data: {
        message: error.message || 'An error occurred',
        code: error.code || 'UNKNOWN_ERROR',
        details: error.details || {}
      }
    });
  }

  /**
   * Emit system notification
   */
  emitNotification(sessionId, notification) {
    this.io.to(sessionId).emit('notification', {
      type: 'notification',
      timestamp: Date.now(),
      data: notification
    });
  }

  /**
   * Get active connections count for a session
   */
  getSessionConnectionCount(sessionId) {
    const room = this.rooms.get(sessionId);
    return room ? room.size : 0;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions() {
    return Array.from(this.rooms.keys());
  }

  /**
   * Start the server
   */
  listen(port, callback) {
    this.httpServer.listen(port, callback);
  }

  /**
   * Close the server
   */
  close(callback) {
    this.io.close(callback);
    this.httpServer.close(callback);
  }
}

module.exports = WebSocketServer;
