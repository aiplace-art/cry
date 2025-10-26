/**
 * Agent Orchestrator
 * Integrates with Claude Flow MCP to spawn and coordinate agents
 * Sends real-time updates via WebSocket
 */

const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');

class AgentOrchestrator extends EventEmitter {
  constructor(claudeAPI, graphBuilder, websocketServer, mcpClient = null) {
    super();

    this.claudeAPI = claudeAPI;
    this.graphBuilder = graphBuilder;
    this.websocketServer = websocketServer;
    this.mcpClient = mcpClient; // Optional MCP client for advanced coordination

    // Active sessions
    this.sessions = new Map(); // sessionId -> session data

    // Agent registry
    this.agents = new Map(); // sessionId -> Map(agentId -> agent data)

    // Task queue
    this.taskQueue = new Map(); // sessionId -> task queue

    // System prompt for agent coordination
    this.systemPrompt = this.buildSystemPrompt();
  }

  buildSystemPrompt() {
    return `You are an AI Agent Coordinator managing a swarm of specialized agents.

Your responsibilities:
1. Analyze user requests and determine which specialized agents are needed
2. Spawn appropriate agents with clear tasks
3. Coordinate agent interactions and dependencies
4. Monitor agent progress and handle errors
5. Synthesize results from multiple agents into coherent responses

Available agent types:
- researcher: Research and analysis tasks
- coder: Code implementation and debugging
- tester: Test creation and validation
- reviewer: Code review and quality assurance
- architect: System design and architecture
- backend-dev: Backend API development
- frontend-dev: UI/UX implementation
- database: Database design and queries
- devops: Deployment and infrastructure
- analyst: Data analysis and insights

When spawning agents, provide:
1. Agent type
2. Specific task description
3. Expected deliverables
4. Dependencies on other agents

Format your response with clear sections:
[AGENTS] - List of agents to spawn
[COORDINATION] - How agents should work together
[TIMELINE] - Estimated execution flow
[DELIVERABLES] - Expected outputs`;
  }

  /**
   * Create new orchestration session
   */
  async createSession(userRequest, options = {}) {
    const sessionId = options.sessionId || uuidv4();

    const session = {
      id: sessionId,
      userRequest,
      status: 'initializing', // initializing, active, completed, error
      createdAt: Date.now(),
      updatedAt: Date.now(),
      agents: [],
      tasks: [],
      results: [],
      metadata: options.metadata || {}
    };

    this.sessions.set(sessionId, session);
    this.agents.set(sessionId, new Map());
    this.taskQueue.set(sessionId, []);

    // Initialize graph
    this.graphBuilder.initializeGraph(sessionId, options.layoutType || 'force');

    // Notify WebSocket clients
    this.websocketServer.emitNotification(sessionId, {
      type: 'session_created',
      sessionId,
      message: 'Orchestration session created'
    });

    return session;
  }

  /**
   * Process user request with agent orchestration
   */
  async processRequest(sessionId, userRequest) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      session.status = 'active';
      session.updatedAt = Date.now();

      // Step 1: Analyze request and plan agent deployment
      this.websocketServer.emitNotification(sessionId, {
        type: 'analysis_started',
        message: 'Analyzing request and planning agent deployment...'
      });

      const plan = await this.analyzeAndPlan(sessionId, userRequest);

      // Step 2: Spawn agents based on plan
      this.websocketServer.emitNotification(sessionId, {
        type: 'spawning_agents',
        message: `Spawning ${plan.agents.length} specialized agents...`
      });

      const spawnedAgents = await this.spawnAgents(sessionId, plan.agents);

      // Step 3: Build dependency graph
      this.buildDependencyGraph(sessionId, spawnedAgents, plan.dependencies);

      // Step 4: Execute tasks with coordination
      this.websocketServer.emitNotification(sessionId, {
        type: 'execution_started',
        message: 'Executing coordinated agent tasks...'
      });

      const results = await this.executeCoordinatedTasks(sessionId, spawnedAgents);

      // Step 5: Synthesize results
      const finalResponse = await this.synthesizeResults(sessionId, results);

      session.status = 'completed';
      session.results = results;
      session.updatedAt = Date.now();

      this.websocketServer.emitNotification(sessionId, {
        type: 'session_completed',
        message: 'All agents completed their tasks',
        results: finalResponse
      });

      return {
        success: true,
        sessionId,
        response: finalResponse,
        agents: spawnedAgents,
        results
      };

    } catch (error) {
      session.status = 'error';
      session.updatedAt = Date.now();

      this.websocketServer.emitError(sessionId, {
        message: error.message,
        code: 'ORCHESTRATION_ERROR',
        details: { stack: error.stack }
      });

      throw error;
    }
  }

  /**
   * Analyze request and create agent deployment plan
   */
  async analyzeAndPlan(sessionId, userRequest) {
    const analysisPrompt = `Analyze this request and create an agent deployment plan:

Request: "${userRequest}"

Provide a structured plan with:
1. Which agents to spawn (type, name, task)
2. Dependencies between agents
3. Execution order

Respond in JSON format:
{
  "agents": [
    {"type": "agent_type", "name": "Agent Name", "task": "Specific task", "priority": 1}
  ],
  "dependencies": [
    {"from": "agent1", "to": "agent2", "reason": "why"}
  ],
  "strategy": "parallel|sequential|hybrid"
}`;

    try {
      const response = await this.claudeAPI.sendMessage(
        sessionId,
        analysisPrompt,
        this.systemPrompt
      );

      // Parse JSON from response
      const jsonMatch = response.response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse agent plan from response');
      }

      const plan = JSON.parse(jsonMatch[0]);

      // Validate plan
      if (!plan.agents || !Array.isArray(plan.agents)) {
        throw new Error('Invalid plan: missing agents array');
      }

      return plan;

    } catch (error) {
      console.error('[Orchestrator] Planning error:', error);

      // Fallback to simple plan
      return {
        agents: [
          {
            type: 'researcher',
            name: 'Research Agent',
            task: `Analyze and research: ${userRequest}`,
            priority: 1
          },
          {
            type: 'coder',
            name: 'Implementation Agent',
            task: `Implement solution for: ${userRequest}`,
            priority: 2
          }
        ],
        dependencies: [
          { from: 'researcher', to: 'coder', reason: 'implementation_requires_research' }
        ],
        strategy: 'sequential'
      };
    }
  }

  /**
   * Spawn agents based on plan
   */
  async spawnAgents(sessionId, agentPlan) {
    const spawnedAgents = [];

    for (const agentSpec of agentPlan) {
      const agentId = uuidv4();

      const agent = {
        id: agentId,
        type: agentSpec.type,
        name: agentSpec.name || `${agentSpec.type}-${agentId.slice(0, 8)}`,
        task: agentSpec.task,
        status: 'initializing',
        priority: agentSpec.priority || 1,
        createdAt: Date.now(),
        result: null,
        error: null
      };

      // Store agent
      const sessionAgents = this.agents.get(sessionId);
      sessionAgents.set(agentId, agent);

      // Add to graph
      const graphNode = this.graphBuilder.addAgent(sessionId, {
        agentId,
        agentType: agent.type,
        name: agent.name,
        status: 'initializing',
        capabilities: this.getAgentCapabilities(agent.type)
      });

      agent.position = graphNode.position;

      // Notify via WebSocket
      this.websocketServer.emitAgentSpawned(sessionId, {
        agentId,
        agentType: agent.type,
        name: agent.name,
        capabilities: this.getAgentCapabilities(agent.type),
        position: agent.position
      });

      spawnedAgents.push(agent);

      // Small delay for visualization
      await this.delay(100);
    }

    return spawnedAgents;
  }

  /**
   * Build dependency graph between agents
   */
  buildDependencyGraph(sessionId, agents, dependencies) {
    if (!dependencies || dependencies.length === 0) return;

    // Create map of agent type/name to ID
    const agentMap = new Map();
    agents.forEach(agent => {
      agentMap.set(agent.type, agent.id);
      agentMap.set(agent.name, agent.id);
    });

    dependencies.forEach(dep => {
      const fromId = agentMap.get(dep.from) || dep.from;
      const toId = agentMap.get(dep.to) || dep.to;

      if (fromId && toId) {
        this.graphBuilder.addConnection(sessionId, fromId, toId, 'dependency');

        this.websocketServer.emitAgentConnection(sessionId, fromId, toId, 'dependency');
      }
    });

    // Recalculate layout with dependencies
    this.graphBuilder.calculateLayout(sessionId);
  }

  /**
   * Execute tasks with agent coordination
   */
  async executeCoordinatedTasks(sessionId, agents) {
    const results = [];

    // Sort agents by priority
    const sortedAgents = agents.sort((a, b) => a.priority - b.priority);

    for (const agent of sortedAgents) {
      try {
        // Update status to working
        agent.status = 'working';
        this.websocketServer.emitAgentStatus(sessionId, agent.id, 'working', {
          task: agent.task
        });

        this.graphBuilder.updateAgentStatus(sessionId, agent.id, 'working');

        // Execute task with streaming
        const taskResult = await this.executeAgentTask(sessionId, agent);

        // Update status to completed
        agent.status = 'completed';
        agent.result = taskResult;

        this.websocketServer.emitAgentStatus(sessionId, agent.id, 'completed', {
          result: taskResult
        });

        this.graphBuilder.updateAgentStatus(sessionId, agent.id, 'completed', {
          result: taskResult
        });

        results.push({
          agentId: agent.id,
          agentType: agent.type,
          task: agent.task,
          result: taskResult
        });

      } catch (error) {
        agent.status = 'error';
        agent.error = error.message;

        this.websocketServer.emitAgentStatus(sessionId, agent.id, 'error', {
          error: error.message
        });

        this.graphBuilder.updateAgentStatus(sessionId, agent.id, 'error', {
          error: error.message
        });

        results.push({
          agentId: agent.id,
          agentType: agent.type,
          task: agent.task,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Execute individual agent task
   */
  async executeAgentTask(sessionId, agent) {
    const messageId = uuidv4();

    // Build task context with previous results
    const session = this.sessions.get(sessionId);
    const context = this.buildTaskContext(sessionId, agent);

    const taskPrompt = `${context}

Your Task: ${agent.task}

Provide detailed results for your task. Be specific and actionable.`;

    let fullResponse = '';

    // Stream response with chunks
    await this.claudeAPI.streamMessage(
      `${sessionId}-${agent.id}`,
      taskPrompt,
      `You are a specialized ${agent.type} agent. Focus on your specific task and provide high-quality results.`,
      (chunkData) => {
        fullResponse = chunkData.fullResponse;

        this.websocketServer.emitMessageChunk(sessionId, {
          messageId,
          agentId: agent.id,
          chunk: chunkData.chunk,
          isComplete: chunkData.isComplete
        });

        // Update task progress
        if (!chunkData.isComplete) {
          const progress = Math.min(95, Math.floor((fullResponse.length / 1000) * 100));

          this.websocketServer.emitTaskUpdate(sessionId, {
            taskId: agent.id,
            agentId: agent.id,
            status: 'in_progress',
            progress,
            message: `Processing... (${fullResponse.length} chars)`
          });
        }
      }
    );

    // Final task update
    this.websocketServer.emitTaskUpdate(sessionId, {
      taskId: agent.id,
      agentId: agent.id,
      status: 'completed',
      progress: 100,
      message: 'Task completed',
      result: fullResponse
    });

    return fullResponse;
  }

  /**
   * Build context for agent task
   */
  buildTaskContext(sessionId, currentAgent) {
    const sessionAgents = this.agents.get(sessionId);
    if (!sessionAgents) return '';

    const completedAgents = Array.from(sessionAgents.values())
      .filter(a => a.status === 'completed' && a.id !== currentAgent.id);

    if (completedAgents.length === 0) return '';

    let context = 'Previous Agent Results:\n\n';

    completedAgents.forEach(agent => {
      context += `[${agent.type} - ${agent.name}]\n`;
      context += `Task: ${agent.task}\n`;
      context += `Result: ${agent.result}\n\n`;
    });

    return context;
  }

  /**
   * Synthesize results from all agents
   */
  async synthesizeResults(sessionId, results) {
    const session = this.sessions.get(sessionId);

    const synthesisPrompt = `Synthesize these agent results into a coherent final response:

Original Request: "${session.userRequest}"

Agent Results:
${results.map(r => `
[${r.agentType}]
Task: ${r.task}
Result: ${r.result || r.error}
`).join('\n')}

Provide a comprehensive, well-structured final response that addresses the original request.`;

    const response = await this.claudeAPI.sendMessage(
      sessionId,
      synthesisPrompt,
      'You are synthesizing results from multiple specialized agents. Create a cohesive, actionable response.'
    );

    return response.response;
  }

  /**
   * Get agent capabilities by type
   */
  getAgentCapabilities(type) {
    const capabilities = {
      researcher: ['research', 'analysis', 'documentation'],
      coder: ['coding', 'debugging', 'implementation'],
      tester: ['testing', 'validation', 'quality_assurance'],
      reviewer: ['code_review', 'security_audit', 'best_practices'],
      architect: ['system_design', 'architecture', 'scalability'],
      'backend-dev': ['api_development', 'server_logic', 'database_integration'],
      'frontend-dev': ['ui_development', 'user_experience', 'responsive_design'],
      database: ['schema_design', 'query_optimization', 'data_modeling'],
      devops: ['deployment', 'ci_cd', 'infrastructure'],
      analyst: ['data_analysis', 'insights', 'reporting']
    };

    return capabilities[type] || ['general'];
  }

  /**
   * Get session status
   */
  getSessionStatus(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const agents = Array.from(this.agents.get(sessionId).values());
    const graphData = this.graphBuilder.getGraphData(sessionId);

    return {
      session: {
        id: session.id,
        status: session.status,
        userRequest: session.userRequest,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      },
      agents: agents.map(a => ({
        id: a.id,
        type: a.type,
        name: a.name,
        status: a.status,
        position: a.position
      })),
      graph: graphData,
      metrics: this.getSessionMetrics(sessionId)
    };
  }

  /**
   * Get session metrics
   */
  getSessionMetrics(sessionId) {
    const session = this.sessions.get(sessionId);
    const agents = this.agents.get(sessionId);

    if (!session || !agents) return null;

    const agentArray = Array.from(agents.values());

    return {
      totalAgents: agentArray.length,
      completedAgents: agentArray.filter(a => a.status === 'completed').length,
      activeAgents: agentArray.filter(a => a.status === 'working').length,
      errorAgents: agentArray.filter(a => a.status === 'error').length,
      duration: Date.now() - session.createdAt,
      status: session.status
    };
  }

  /**
   * Utility: delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up session
   */
  cleanupSession(sessionId) {
    this.sessions.delete(sessionId);
    this.agents.delete(sessionId);
    this.taskQueue.delete(sessionId);
    this.graphBuilder.clearGraph(sessionId);
    this.claudeAPI.clearContext(sessionId);
  }
}

module.exports = AgentOrchestrator;
