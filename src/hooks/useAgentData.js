import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing agent data and real-time updates
 */
export const useAgentData = () => {
  const [agents, setAgents] = useState([]);
  const [connections, setConnections] = useState([]);
  const [activeAgents, setActiveAgents] = useState([]);
  const [metrics, setMetrics] = useState({
    tokenUsage: [],
    responseTime: [],
    agentDistribution: [],
    taskCompletion: { completed: 0, pending: 0, failed: 0 },
    totalTasks: 0,
    activeAgents: 0,
    avgResponseTime: 0,
    totalTokens: 0
  });

  // Simulate real-time updates (replace with actual WebSocket/API calls)
  useEffect(() => {
    const interval = setInterval(() => {
      updateMetrics();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const updateMetrics = useCallback(() => {
    const now = new Date().toLocaleTimeString();

    setMetrics((prev) => ({
      ...prev,
      tokenUsage: [
        ...prev.tokenUsage.slice(-9),
        { time: now, tokens: Math.floor(Math.random() * 1000) + 500 }
      ],
      responseTime: [
        ...prev.responseTime.slice(-9),
        { time: now, ms: Math.floor(Math.random() * 200) + 50 }
      ],
      totalTokens: prev.totalTokens + Math.floor(Math.random() * 100),
      avgResponseTime: Math.floor(Math.random() * 200) + 50
    }));
  }, []);

  const initializeAgents = useCallback((agentList) => {
    const formattedAgents = agentList.map((agent, index) => ({
      id: `agent-${index}`,
      name: agent.name || `Agent ${index + 1}`,
      type: agent.type || 'default',
      status: agent.status || 'idle',
      metrics: agent.metrics || {
        tasks: 0,
        uptime: '0m',
        successRate: 100
      }
    }));

    setAgents(formattedAgents);

    // Generate connections
    const newConnections = [];
    for (let i = 0; i < formattedAgents.length - 1; i++) {
      newConnections.push({
        source: formattedAgents[i].id,
        target: formattedAgents[i + 1].id,
        active: false,
        label: 'coordinates'
      });
    }
    setConnections(newConnections);

    // Update agent distribution
    const distribution = {};
    formattedAgents.forEach((agent) => {
      distribution[agent.type] = (distribution[agent.type] || 0) + 1;
    });

    setMetrics((prev) => ({
      ...prev,
      agentDistribution: Object.entries(distribution).map(([name, value]) => ({
        name,
        value
      }))
    }));
  }, []);

  const activateAgent = useCallback((agentId) => {
    setActiveAgents((prev) => [...new Set([...prev, agentId])]);
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId ? { ...agent, status: 'active' } : agent
      )
    );

    // Update connections
    setConnections((prev) =>
      prev.map((conn) =>
        conn.source === agentId || conn.target === agentId
          ? { ...conn, active: true }
          : conn
      )
    );

    setMetrics((prev) => ({
      ...prev,
      activeAgents: prev.activeAgents + 1
    }));
  }, []);

  const deactivateAgent = useCallback((agentId) => {
    setActiveAgents((prev) => prev.filter((id) => id !== agentId));
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId ? { ...agent, status: 'idle' } : agent
      )
    );

    setConnections((prev) =>
      prev.map((conn) =>
        conn.source === agentId || conn.target === agentId
          ? { ...conn, active: false }
          : conn
      )
    );

    setMetrics((prev) => ({
      ...prev,
      activeAgents: Math.max(0, prev.activeAgents - 1)
    }));
  }, []);

  const updateTaskCompletion = useCallback((status) => {
    setMetrics((prev) => ({
      ...prev,
      taskCompletion: {
        ...prev.taskCompletion,
        [status]: prev.taskCompletion[status] + 1
      },
      totalTasks: prev.totalTasks + 1
    }));
  }, []);

  return {
    agents,
    connections,
    activeAgents,
    metrics,
    initializeAgents,
    activateAgent,
    deactivateAgent,
    updateTaskCompletion
  };
};

export default useAgentData;
