import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from 'reactflow';
import { motion } from 'framer-motion';
import 'reactflow/dist/style.css';
import AgentNode from './AgentNode';

const nodeTypes = {
  agent: AgentNode
};

const AgentVisualization = ({ agents, connections, activeAgents }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Convert agents to React Flow nodes
  useEffect(() => {
    if (!agents || agents.length === 0) return;

    const newNodes = agents.map((agent, index) => {
      const angle = (2 * Math.PI * index) / agents.length;
      const radius = 250;
      const x = 400 + radius * Math.cos(angle);
      const y = 300 + radius * Math.sin(angle);

      return {
        id: agent.id,
        type: 'agent',
        position: { x, y },
        data: {
          label: agent.name,
          type: agent.type,
          status: activeAgents?.includes(agent.id) ? 'active' : 'idle',
          metrics: agent.metrics,
          onClick: () => setSelectedAgent(agent)
        }
      };
    });

    setNodes(newNodes);
  }, [agents, activeAgents, setNodes]);

  // Convert connections to React Flow edges
  useEffect(() => {
    if (!connections || connections.length === 0) return;

    const newEdges = connections.map((conn) => ({
      id: `${conn.source}-${conn.target}`,
      source: conn.source,
      target: conn.target,
      animated: conn.active,
      style: {
        stroke: conn.active ? '#00E5FF' : '#4B5563',
        strokeWidth: conn.active ? 2 : 1
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: conn.active ? '#00E5FF' : '#4B5563'
      },
      label: conn.label,
      labelStyle: {
        fill: '#9CA3AF',
        fontSize: 10
      },
      labelBgStyle: {
        fill: '#1F2937',
        fillOpacity: 0.8
      }
    }));

    setEdges(newEdges);
  }, [connections, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gray-900/50 backdrop-blur-xl border-b border-gray-700/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Agent Network</h2>
            <p className="text-sm text-gray-400">
              {agents?.length || 0} agents • {activeAgents?.length || 0} active
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-600 rounded-full" />
              <span className="text-sm text-gray-300">Idle</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-sm text-gray-300">Working</span>
            </div>
          </div>
        </div>
      </div>

      {/* React Flow Graph */}
      <div className="h-full pt-20">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="bg-transparent"
        >
          <Background
            color="#374151"
            gap={20}
            size={1}
            variant="dots"
          />
          <Controls
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg"
          />
          <MiniMap
            nodeColor={(node) => {
              if (node.data.status === 'active') return '#10B981';
              if (node.data.status === 'working') return '#F59E0B';
              return '#6B7280';
            }}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg"
          />
        </ReactFlow>
      </div>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="absolute top-20 right-4 w-80 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">{selectedAgent.name}</h3>
            <button
              onClick={() => setSelectedAgent(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400">Type</p>
              <p className="text-sm text-white font-medium">{selectedAgent.type}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Status</p>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  selectedAgent.status === 'active'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-600/20 text-gray-400'
                }`}
              >
                {selectedAgent.status}
              </span>
            </div>

            {selectedAgent.metrics && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Metrics</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Tasks</span>
                    <span className="text-sm text-white font-medium">
                      {selectedAgent.metrics.tasks}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Uptime</span>
                    <span className="text-sm text-white font-medium">
                      {selectedAgent.metrics.uptime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Success Rate</span>
                    <span className="text-sm text-white font-medium">
                      {selectedAgent.metrics.successRate}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AgentVisualization;
