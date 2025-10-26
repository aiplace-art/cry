/**
 * Agent Graph Builder
 * Builds dependency graphs and generates coordinates for agent visualization
 */

class AgentGraphBuilder {
  constructor() {
    this.graphs = new Map(); // sessionId -> graph data
    this.layoutEngines = {
      hierarchical: this.hierarchicalLayout.bind(this),
      circular: this.circularLayout.bind(this),
      force: this.forceDirectedLayout.bind(this),
      grid: this.gridLayout.bind(this)
    };
  }

  /**
   * Initialize graph for a session
   */
  initializeGraph(sessionId, layoutType = 'force') {
    this.graphs.set(sessionId, {
      nodes: new Map(), // agentId -> node data
      edges: [], // array of {from, to, type}
      layoutType,
      bounds: { width: 1200, height: 800 }
    });
  }

  /**
   * Add agent node to graph
   */
  addAgent(sessionId, agentData) {
    const graph = this.graphs.get(sessionId);
    if (!graph) {
      this.initializeGraph(sessionId);
      return this.addAgent(sessionId, agentData);
    }

    const node = {
      id: agentData.agentId,
      type: agentData.agentType,
      name: agentData.name,
      status: agentData.status || 'initializing',
      capabilities: agentData.capabilities || [],
      metadata: agentData.metadata || {},
      position: agentData.position || null,
      dependencies: [],
      dependents: []
    };

    graph.nodes.set(node.id, node);

    // Recalculate layout if position not provided
    if (!node.position) {
      this.calculateLayout(sessionId);
    }

    return node;
  }

  /**
   * Add edge/connection between agents
   */
  addConnection(sessionId, fromAgentId, toAgentId, connectionType = 'dependency') {
    const graph = this.graphs.get(sessionId);
    if (!graph) return null;

    const fromNode = graph.nodes.get(fromAgentId);
    const toNode = graph.nodes.get(toAgentId);

    if (!fromNode || !toNode) {
      console.warn(`[GraphBuilder] Cannot add edge: agent not found`);
      return null;
    }

    const edge = {
      from: fromAgentId,
      to: toAgentId,
      type: connectionType, // dependency, communication, data_flow
      weight: 1
    };

    graph.edges.push(edge);

    // Update node dependencies
    if (connectionType === 'dependency') {
      toNode.dependencies.push(fromAgentId);
      fromNode.dependents.push(toAgentId);
    }

    return edge;
  }

  /**
   * Analyze task and determine agent dependencies
   */
  analyzeTaskDependencies(task, agents) {
    const dependencies = [];

    // Simple heuristic-based dependency detection
    const taskLower = task.toLowerCase();

    // Backend depends on database
    if (taskLower.includes('api') || taskLower.includes('backend')) {
      const dbAgent = agents.find(a => a.type === 'database' || a.type === 'data');
      if (dbAgent) {
        dependencies.push({ requires: dbAgent.id, reason: 'database_access' });
      }
    }

    // Frontend depends on backend
    if (taskLower.includes('ui') || taskLower.includes('frontend')) {
      const backendAgent = agents.find(a => a.type === 'backend' || a.type === 'api');
      if (backendAgent) {
        dependencies.push({ requires: backendAgent.id, reason: 'api_integration' });
      }
    }

    // Testing depends on implementation
    if (taskLower.includes('test')) {
      const implementationAgents = agents.filter(a =>
        a.type === 'coder' || a.type === 'backend' || a.type === 'frontend'
      );
      implementationAgents.forEach(agent => {
        dependencies.push({ requires: agent.id, reason: 'test_target' });
      });
    }

    // Deployment depends on tests
    if (taskLower.includes('deploy') || taskLower.includes('devops')) {
      const testAgent = agents.find(a => a.type === 'tester' || a.type === 'qa');
      if (testAgent) {
        dependencies.push({ requires: testAgent.id, reason: 'quality_assurance' });
      }
    }

    return dependencies;
  }

  /**
   * Calculate layout positions for all agents
   */
  calculateLayout(sessionId) {
    const graph = this.graphs.get(sessionId);
    if (!graph) return;

    const layoutEngine = this.layoutEngines[graph.layoutType] || this.layoutEngines.force;
    const positions = layoutEngine(graph);

    // Update node positions
    positions.forEach((position, agentId) => {
      const node = graph.nodes.get(agentId);
      if (node) {
        node.position = position;
      }
    });

    return positions;
  }

  /**
   * Hierarchical layout (top-down based on dependencies)
   */
  hierarchicalLayout(graph) {
    const positions = new Map();
    const { width, height } = graph.bounds;

    // Calculate levels based on dependencies
    const levels = this.calculateLevels(graph);
    const maxLevel = Math.max(...Array.from(levels.values()));

    const levelHeight = height / (maxLevel + 2);
    const nodesPerLevel = new Map();

    // Group nodes by level
    levels.forEach((level, agentId) => {
      if (!nodesPerLevel.has(level)) {
        nodesPerLevel.set(level, []);
      }
      nodesPerLevel.get(level).push(agentId);
    });

    // Position nodes
    nodesPerLevel.forEach((agentIds, level) => {
      const levelWidth = width / (agentIds.length + 1);
      agentIds.forEach((agentId, index) => {
        positions.set(agentId, {
          x: levelWidth * (index + 1),
          y: levelHeight * (level + 1)
        });
      });
    });

    return positions;
  }

  /**
   * Calculate node levels based on dependencies (BFS)
   */
  calculateLevels(graph) {
    const levels = new Map();
    const visited = new Set();

    // Find root nodes (no dependencies)
    const rootNodes = Array.from(graph.nodes.values())
      .filter(node => node.dependencies.length === 0)
      .map(node => node.id);

    // BFS to assign levels
    const queue = rootNodes.map(id => ({ id, level: 0 }));

    while (queue.length > 0) {
      const { id, level } = queue.shift();

      if (visited.has(id)) continue;
      visited.add(id);

      levels.set(id, level);

      const node = graph.nodes.get(id);
      if (node && node.dependents) {
        node.dependents.forEach(dependentId => {
          if (!visited.has(dependentId)) {
            queue.push({ id: dependentId, level: level + 1 });
          }
        });
      }
    }

    // Assign level to unvisited nodes (cycles or isolated)
    graph.nodes.forEach((node, id) => {
      if (!levels.has(id)) {
        levels.set(id, 0);
      }
    });

    return levels;
  }

  /**
   * Circular layout
   */
  circularLayout(graph) {
    const positions = new Map();
    const { width, height } = graph.bounds;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;

    const agents = Array.from(graph.nodes.keys());
    const angleStep = (2 * Math.PI) / agents.length;

    agents.forEach((agentId, index) => {
      const angle = index * angleStep;
      positions.set(agentId, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    });

    return positions;
  }

  /**
   * Force-directed layout (simplified)
   */
  forceDirectedLayout(graph) {
    const positions = new Map();
    const { width, height } = graph.bounds;

    // Initialize random positions
    graph.nodes.forEach((node, agentId) => {
      positions.set(agentId, {
        x: Math.random() * width,
        y: Math.random() * height
      });
    });

    // Simplified force simulation
    const iterations = 50;
    const repulsionStrength = 5000;
    const attractionStrength = 0.01;
    const damping = 0.5;

    for (let iter = 0; iter < iterations; iter++) {
      const forces = new Map();

      // Initialize forces
      positions.forEach((pos, agentId) => {
        forces.set(agentId, { x: 0, y: 0 });
      });

      // Repulsion between all nodes
      const agentIds = Array.from(positions.keys());
      for (let i = 0; i < agentIds.length; i++) {
        for (let j = i + 1; j < agentIds.length; j++) {
          const id1 = agentIds[i];
          const id2 = agentIds[j];
          const pos1 = positions.get(id1);
          const pos2 = positions.get(id2);

          const dx = pos2.x - pos1.x;
          const dy = pos2.y - pos1.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;

          const force = repulsionStrength / (distance * distance);
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          const force1 = forces.get(id1);
          const force2 = forces.get(id2);

          force1.x -= fx;
          force1.y -= fy;
          force2.x += fx;
          force2.y += fy;
        }
      }

      // Attraction along edges
      graph.edges.forEach(edge => {
        const pos1 = positions.get(edge.from);
        const pos2 = positions.get(edge.to);

        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = distance * attractionStrength;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        const force1 = forces.get(edge.from);
        const force2 = forces.get(edge.to);

        force1.x += fx;
        force1.y += fy;
        force2.x -= fx;
        force2.y -= fy;
      });

      // Apply forces
      forces.forEach((force, agentId) => {
        const pos = positions.get(agentId);
        pos.x += force.x * damping;
        pos.y += force.y * damping;

        // Keep within bounds
        pos.x = Math.max(50, Math.min(width - 50, pos.x));
        pos.y = Math.max(50, Math.min(height - 50, pos.y));
      });
    }

    return positions;
  }

  /**
   * Grid layout
   */
  gridLayout(graph) {
    const positions = new Map();
    const { width, height } = graph.bounds;

    const agents = Array.from(graph.nodes.keys());
    const cols = Math.ceil(Math.sqrt(agents.length));
    const rows = Math.ceil(agents.length / cols);

    const cellWidth = width / (cols + 1);
    const cellHeight = height / (rows + 1);

    agents.forEach((agentId, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      positions.set(agentId, {
        x: cellWidth * (col + 1),
        y: cellHeight * (row + 1)
      });
    });

    return positions;
  }

  /**
   * Get graph data for visualization
   */
  getGraphData(sessionId) {
    const graph = this.graphs.get(sessionId);
    if (!graph) return null;

    return {
      nodes: Array.from(graph.nodes.values()),
      edges: graph.edges,
      layoutType: graph.layoutType,
      bounds: graph.bounds
    };
  }

  /**
   * Update agent status in graph
   */
  updateAgentStatus(sessionId, agentId, status, metadata = {}) {
    const graph = this.graphs.get(sessionId);
    if (!graph) return;

    const node = graph.nodes.get(agentId);
    if (node) {
      node.status = status;
      node.metadata = { ...node.metadata, ...metadata };
    }
  }

  /**
   * Clear graph for session
   */
  clearGraph(sessionId) {
    this.graphs.delete(sessionId);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions() {
    return Array.from(this.graphs.keys());
  }

  /**
   * Set layout type for session
   */
  setLayoutType(sessionId, layoutType) {
    const graph = this.graphs.get(sessionId);
    if (graph) {
      graph.layoutType = layoutType;
      this.calculateLayout(sessionId);
    }
  }

  /**
   * Get statistics for graph
   */
  getGraphStats(sessionId) {
    const graph = this.graphs.get(sessionId);
    if (!graph) return null;

    return {
      nodeCount: graph.nodes.size,
      edgeCount: graph.edges.length,
      layoutType: graph.layoutType,
      agentTypes: this.getAgentTypeCounts(graph),
      avgDependencies: this.getAverageDependencies(graph)
    };
  }

  getAgentTypeCounts(graph) {
    const counts = {};
    graph.nodes.forEach(node => {
      counts[node.type] = (counts[node.type] || 0) + 1;
    });
    return counts;
  }

  getAverageDependencies(graph) {
    let total = 0;
    graph.nodes.forEach(node => {
      total += node.dependencies.length;
    });
    return graph.nodes.size > 0 ? total / graph.nodes.size : 0;
  }
}

module.exports = AgentGraphBuilder;
