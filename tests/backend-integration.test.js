/**
 * AI Agent Chat Backend - Integration Tests
 * Tests all major backend components and API endpoints
 */

const request = require('supertest');
const { io: ioClient } = require('socket.io-client');
const AIAgentChatApp = require('../src/server/app');

describe('AI Agent Chat Backend - Integration Tests', () => {
  let app;
  let server;
  let apiUrl;
  let wsUrl;
  let testSessionId;

  // Setup before all tests
  beforeAll(async () => {
    // Create app with test configuration
    app = new AIAgentChatApp({
      port: 3002, // Use different port for tests
      corsOrigin: 'http://localhost:3000',
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || 'test-key',
      nodeEnv: 'test',
      enableRateLimiting: false // Disable for tests
    });

    // Start server
    await app.start();

    const { websocketServer } = app.getComponents();
    server = websocketServer.httpServer;

    apiUrl = 'http://localhost:3002';
    wsUrl = 'ws://localhost:3002';
  });

  // Cleanup after all tests
  afterAll((done) => {
    app.shutdown(0);
    setTimeout(done, 1000);
  });

  describe('Health Check', () => {
    test('GET /api/health should return healthy status', async () => {
      const response = await request(server)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveProperty('orchestrator', 'online');
    });
  });

  describe('Session Management', () => {
    test('POST /api/chat/session should create new session', async () => {
      const response = await request(server)
        .post('/api/chat/session')
        .send({
          userRequest: 'Test request',
          layoutType: 'force'
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('sessionId');
      expect(response.body.data).toHaveProperty('status');

      testSessionId = response.body.data.sessionId;
    });

    test('GET /api/sessions should list sessions', async () => {
      const response = await request(server)
        .get('/api/sessions')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('sessions');
      expect(Array.isArray(response.body.data.sessions)).toBe(true);
    });

    test('GET /api/sessions/:sessionId should return session status', async () => {
      const response = await request(server)
        .get(`/api/sessions/${testSessionId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('session');
      expect(response.body.data.session.id).toBe(testSessionId);
    });

    test('DELETE /api/chat/session/:sessionId should delete session', async () => {
      const response = await request(server)
        .delete(`/api/chat/session/${testSessionId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.sessionId).toBe(testSessionId);
    });
  });

  describe('Chat Endpoints', () => {
    let chatSessionId;

    test('POST /api/chat should send message without orchestration', async () => {
      // This test requires valid API key - skip if not available
      if (!process.env.ANTHROPIC_API_KEY) {
        console.log('⚠️  Skipping chat test - ANTHROPIC_API_KEY not set');
        return;
      }

      const response = await request(server)
        .post('/api/chat')
        .send({
          message: 'Hello, how are you?',
          useOrchestration: false
        })
        .timeout(30000)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('response');
      expect(response.body.data).toHaveProperty('sessionId');

      chatSessionId = response.body.data.sessionId;
    }, 30000);

    test('POST /api/chat with orchestration should spawn agents', async () => {
      // This test requires valid API key - skip if not available
      if (!process.env.ANTHROPIC_API_KEY) {
        console.log('⚠️  Skipping orchestration test - ANTHROPIC_API_KEY not set');
        return;
      }

      const response = await request(server)
        .post('/api/chat')
        .send({
          message: 'Build a simple calculator',
          useOrchestration: true
        })
        .timeout(60000)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('agents');
      expect(Array.isArray(response.body.data.agents)).toBe(true);
    }, 60000);

    test('POST /api/chat should validate required fields', async () => {
      const response = await request(server)
        .post('/api/chat')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error.code).toBe('MISSING_PARAMETER');
    });
  });

  describe('Agent Endpoints', () => {
    test('GET /api/agents should return all agents', async () => {
      const response = await request(server)
        .get('/api/agents')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('agents');
      expect(response.body.data).toHaveProperty('count');
    });

    test('GET /api/agents/:sessionId should return 404 for invalid session', async () => {
      const response = await request(server)
        .get('/api/agents/invalid-session-id')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error.code).toBe('SESSION_NOT_FOUND');
    });
  });

  describe('Metrics Endpoints', () => {
    test('GET /api/metrics should return global metrics', async () => {
      const response = await request(server)
        .get('/api/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('claude');
      expect(response.body.data).toHaveProperty('sessions');
      expect(response.body.data).toHaveProperty('agents');
      expect(response.body.data).toHaveProperty('timestamp');
    });
  });

  describe('Graph Endpoints', () => {
    let graphSessionId;

    beforeAll(async () => {
      // Create a session for graph testing
      const response = await request(server)
        .post('/api/chat/session')
        .send({ userRequest: 'Graph test' });

      graphSessionId = response.body.data.sessionId;
    });

    test('GET /api/graph/:sessionId should return graph data', async () => {
      const response = await request(server)
        .get(`/api/graph/${graphSessionId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('graph');
      expect(response.body.data).toHaveProperty('stats');
    });

    test('PUT /api/graph/:sessionId/layout should change layout', async () => {
      const response = await request(server)
        .put(`/api/graph/${graphSessionId}/layout`)
        .send({ layoutType: 'hierarchical' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.layoutType).toBe('hierarchical');
    });

    test('PUT /api/graph/:sessionId/layout should validate layout type', async () => {
      const response = await request(server)
        .put(`/api/graph/${graphSessionId}/layout`)
        .send({ layoutType: 'invalid-layout' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error.code).toBe('INVALID_LAYOUT');
    });
  });

  describe('WebSocket Communication', () => {
    let socket;
    let wsSessionId;

    beforeAll(async () => {
      // Create session for WebSocket testing
      const response = await request(server)
        .post('/api/chat/session')
        .send({ userRequest: 'WebSocket test' });

      wsSessionId = response.body.data.sessionId;
    });

    beforeEach((done) => {
      socket = ioClient(wsUrl, {
        transports: ['websocket']
      });

      socket.on('connect', done);
    });

    afterEach(() => {
      if (socket.connected) {
        socket.disconnect();
      }
    });

    test('Should connect to WebSocket server', (done) => {
      expect(socket.connected).toBe(true);
      done();
    });

    test('Should join session room', (done) => {
      socket.emit('join_session', wsSessionId);

      socket.on('session_joined', (data) => {
        expect(data).toHaveProperty('sessionId', wsSessionId);
        expect(data).toHaveProperty('timestamp');
        done();
      });
    });

    test('Should respond to heartbeat', (done) => {
      socket.emit('heartbeat');

      socket.on('heartbeat_ack', () => {
        done();
      });
    });

    test('Should receive agent_spawned events', (done) => {
      socket.emit('join_session', wsSessionId);

      socket.on('agent_spawned', (data) => {
        expect(data).toHaveProperty('type', 'agent_spawned');
        expect(data).toHaveProperty('timestamp');
        expect(data.data).toHaveProperty('agentId');
        expect(data.data).toHaveProperty('agentType');
        done();
      });

      // Trigger agent spawn via orchestrator
      const { orchestrator } = app.getComponents();
      orchestrator.websocketServer.emitAgentSpawned(wsSessionId, {
        agentId: 'test-agent',
        agentType: 'coder',
        name: 'Test Agent'
      });
    });

    test('Should leave session room', (done) => {
      socket.emit('join_session', wsSessionId);

      socket.on('session_joined', () => {
        socket.emit('leave_session', wsSessionId);
        setTimeout(done, 100);
      });
    });
  });

  describe('Error Handling', () => {
    test('Should return 404 for invalid routes', async () => {
      const response = await request(server)
        .get('/api/invalid-route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    test('Should handle malformed JSON', async () => {
      const response = await request(server)
        .post('/api/chat')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });

  describe('API Documentation', () => {
    test('GET /api/docs should return API documentation', async () => {
      const response = await request(server)
        .get('/api/docs')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('endpoints');
      expect(Array.isArray(response.body.endpoints)).toBe(true);
      expect(response.body).toHaveProperty('websocket');
    });

    test('GET / should return server info', async () => {
      const response = await request(server)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('status', 'online');
      expect(response.body).toHaveProperty('endpoints');
    });
  });
});

describe('Component Unit Tests', () => {
  describe('Graph Builder', () => {
    const AgentGraphBuilder = require('../src/server/graph-builder');
    let builder;

    beforeEach(() => {
      builder = new AgentGraphBuilder();
    });

    test('Should initialize graph', () => {
      builder.initializeGraph('test-session', 'force');
      const graph = builder.getGraphData('test-session');

      expect(graph).not.toBeNull();
      expect(graph.layoutType).toBe('force');
      expect(graph.nodes).toHaveLength(0);
    });

    test('Should add agent nodes', () => {
      builder.initializeGraph('test-session');
      builder.addAgent('test-session', {
        agentId: 'agent-1',
        agentType: 'coder',
        name: 'Test Agent'
      });

      const graph = builder.getGraphData('test-session');
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0].id).toBe('agent-1');
    });

    test('Should add connections between agents', () => {
      builder.initializeGraph('test-session');
      builder.addAgent('test-session', {
        agentId: 'agent-1',
        agentType: 'researcher',
        name: 'Researcher'
      });
      builder.addAgent('test-session', {
        agentId: 'agent-2',
        agentType: 'coder',
        name: 'Coder'
      });

      builder.addConnection('test-session', 'agent-1', 'agent-2', 'dependency');

      const graph = builder.getGraphData('test-session');
      expect(graph.edges).toHaveLength(1);
      expect(graph.edges[0].from).toBe('agent-1');
      expect(graph.edges[0].to).toBe('agent-2');
    });

    test('Should calculate different layouts', () => {
      builder.initializeGraph('test-session', 'hierarchical');
      builder.addAgent('test-session', {
        agentId: 'agent-1',
        agentType: 'coder',
        name: 'Agent 1'
      });

      builder.calculateLayout('test-session');

      const graph = builder.getGraphData('test-session');
      expect(graph.nodes[0].position).toBeDefined();
      expect(graph.nodes[0].position).toHaveProperty('x');
      expect(graph.nodes[0].position).toHaveProperty('y');
    });

    test('Should get graph statistics', () => {
      builder.initializeGraph('test-session');
      builder.addAgent('test-session', {
        agentId: 'agent-1',
        agentType: 'coder',
        name: 'Agent 1'
      });

      const stats = builder.getGraphStats('test-session');
      expect(stats).toHaveProperty('nodeCount', 1);
      expect(stats).toHaveProperty('edgeCount', 0);
      expect(stats).toHaveProperty('layoutType');
    });
  });
});
