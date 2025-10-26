import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import NodeRenderer from './NodeRenderer';
import EdgeRenderer from './EdgeRenderer';
import GraphControls from './GraphControls';
import GraphAnimations from './GraphAnimations';
import './AgentGraph.css';

// Node types configuration
const nodeTypes = {
  coordinator: NodeRenderer.CoordinatorNode,
  worker: NodeRenderer.WorkerNode,
  task: NodeRenderer.TaskNode,
  dataFlow: NodeRenderer.DataFlowNode,
};

// Edge types configuration
const edgeTypes = {
  animated: EdgeRenderer.AnimatedEdge,
  data: EdgeRenderer.DataEdge,
};

/**
 * AgentGraph - Advanced Interactive AI Agent Visualization System
 *
 * Features:
 * - Real-time graph updates with smooth animations
 * - Drag & drop nodes with physics simulation
 * - Interactive zoom & pan controls
 * - Dynamic color coding by agent status
 * - Particle effects for data transmission
 * - Click/hover for detailed information
 */
const AgentGraph = ({
  initialNodes = [],
  initialEdges = [],
  onNodeClick,
  onEdgeClick,
  enableAnimations = true,
  enableParticles = true,
  autoLayout = true,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showParticles, setShowParticles] = useState(enableParticles);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Handle node connection
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, type: 'animated' }, eds)),
    [setEdges]
  );

  // Handle node click with detail panel
  const handleNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  }, [onNodeClick]);

  // Handle edge click
  const handleEdgeClick = useCallback((event, edge) => {
    onEdgeClick?.(edge);
  }, [onEdgeClick]);

  // Add new node dynamically
  const addNode = useCallback((nodeData) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: nodeData.type || 'worker',
      position: nodeData.position || {
        x: Math.random() * 500,
        y: Math.random() * 500
      },
      data: {
        label: nodeData.label || 'New Node',
        status: nodeData.status || 'idle',
        ...nodeData.data,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    return newNode;
  }, [setNodes]);

  // Update node status
  const updateNodeStatus = useCallback((nodeId, status) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              status,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Remove node
  const removeNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  // Add animated edge between nodes
  const addAnimatedEdge = useCallback((sourceId, targetId, data = {}) => {
    const newEdge = {
      id: `edge-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: 'animated',
      animated: true,
      data: {
        ...data,
      },
    };

    setEdges((eds) => [...eds, newEdge]);
    return newEdge;
  }, [setEdges]);

  // Filter nodes by type or status
  const filterNodes = useCallback((filterType) => {
    setFilter(filterType);

    if (filterType === 'all') {
      setNodes((nds) => nds.map((node) => ({ ...node, hidden: false })));
      return;
    }

    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        hidden: node.type !== filterType && node.data?.status !== filterType,
      }))
    );
  }, [setNodes]);

  // Auto-layout algorithm (force-directed)
  useEffect(() => {
    if (autoLayout && nodes.length > 0) {
      const centerX = 400;
      const centerY = 300;
      const radius = 200;

      setNodes((nds) =>
        nds.map((node, index) => {
          const angle = (2 * Math.PI * index) / nds.length;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          return {
            ...node,
            position: { x, y },
          };
        })
      );
    }
  }, [autoLayout, nodes.length, setNodes]);

  // Simulate real-time updates
  useEffect(() => {
    if (!enableAnimations) return;

    const interval = setInterval(() => {
      // Randomly update node statuses
      setNodes((nds) =>
        nds.map((node) => {
          if (Math.random() > 0.7) {
            const statuses = ['active', 'idle', 'working', 'success'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            return {
              ...node,
              data: {
                ...node.data,
                status: randomStatus,
              },
            };
          }
          return node;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [enableAnimations, setNodes]);

  return (
    <div className="agent-graph-container" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        className="agent-graph"
      >
        <Background color="#1a1a1a" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.data?.status) {
              case 'active': return '#00E5FF';
              case 'working': return '#00AAFF';
              case 'success': return '#00FF88';
              case 'error': return '#FF4444';
              default: return '#666666';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.8)"
        />

        <Panel position="top-left">
          <GraphControls
            onAddNode={addNode}
            onFilterChange={filterNodes}
            currentFilter={filter}
            onToggleParticles={() => setShowParticles(!showParticles)}
            showParticles={showParticles}
          />
        </Panel>

        <Panel position="top-right">
          <div className="graph-legend">
            <h3>Agent Status</h3>
            <div className="legend-item">
              <span className="legend-dot active"></span>
              <span>Active</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot working"></span>
              <span>Working</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot idle"></span>
              <span>Idle</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot success"></span>
              <span>Success</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot error"></span>
              <span>Error</span>
            </div>
          </div>
        </Panel>

        {showParticles && <GraphAnimations nodes={nodes} edges={edges} />}
      </ReactFlow>

      <AnimatePresence>
        {selectedNode && (
          <motion.div
            className="node-detail-panel"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <button
              className="close-button"
              onClick={() => setSelectedNode(null)}
            >
              ×
            </button>
            <h2>{selectedNode.data.label}</h2>
            <div className="detail-content">
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{selectedNode.type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status-${selectedNode.data.status}`}>
                  {selectedNode.data.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">ID:</span>
                <span className="detail-value">{selectedNode.id}</span>
              </div>
              {selectedNode.data.metrics && (
                <div className="metrics-section">
                  <h3>Metrics</h3>
                  <pre>{JSON.stringify(selectedNode.data.metrics, null, 2)}</pre>
                </div>
              )}
            </div>
            <div className="detail-actions">
              <button onClick={() => updateNodeStatus(selectedNode.id, 'active')}>
                Activate
              </button>
              <button onClick={() => updateNodeStatus(selectedNode.id, 'idle')}>
                Idle
              </button>
              <button onClick={() => removeNode(selectedNode.id)} className="danger">
                Remove
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentGraph;
