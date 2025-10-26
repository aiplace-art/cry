import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';

/**
 * NodeRenderer - Custom node components for different agent types
 *
 * Node Types:
 * - CoordinatorNode: Central orchestrator node
 * - WorkerNode: Individual worker agents
 * - TaskNode: Task execution nodes
 * - DataFlowNode: Data processing nodes
 */

// Status colors
const STATUS_COLORS = {
  active: '#00E5FF',
  idle: '#666666',
  working: '#00AAFF',
  error: '#FF4444',
  success: '#00FF88',
};

// Pulsating animation for active nodes
const pulseAnimation = {
  scale: [1, 1.1, 1],
  boxShadow: [
    '0 0 0 0 rgba(0, 229, 255, 0)',
    '0 0 0 10px rgba(0, 229, 255, 0.3)',
    '0 0 0 0 rgba(0, 229, 255, 0)',
  ],
};

// Base node component
const BaseNode = ({ data, type, icon, children }) => {
  const statusColor = STATUS_COLORS[data.status] || STATUS_COLORS.idle;
  const isActive = data.status === 'active' || data.status === 'working';

  return (
    <motion.div
      className={`custom-node ${type}-node`}
      style={{
        borderColor: statusColor,
        backgroundColor: `${statusColor}10`,
      }}
      animate={isActive ? pulseAnimation : {}}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: statusColor }}
      />

      <div className="node-header">
        <div className="node-icon" style={{ color: statusColor }}>
          {icon}
        </div>
        <div className="node-status-indicator" style={{ backgroundColor: statusColor }} />
      </div>

      <div className="node-content">
        <div className="node-label">{data.label}</div>
        <div className="node-type">{type}</div>
        {data.description && (
          <div className="node-description">{data.description}</div>
        )}
        {children}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: statusColor }}
      />
    </motion.div>
  );
};

// Coordinator Node - Central orchestrator
const CoordinatorNode = memo(({ data }) => {
  return (
    <BaseNode data={data} type="coordinator" icon="👑">
      <div className="node-stats">
        <div className="stat-item">
          <span className="stat-label">Agents:</span>
          <span className="stat-value">{data.agentCount || 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Tasks:</span>
          <span className="stat-value">{data.taskCount || 0}</span>
        </div>
      </div>
    </BaseNode>
  );
});

// Worker Node - Individual agent
const WorkerNode = memo(({ data }) => {
  return (
    <BaseNode data={data} type="worker" icon="🤖">
      <div className="node-stats">
        <div className="stat-item">
          <span className="stat-label">Load:</span>
          <span className="stat-value">{data.load || 0}%</span>
        </div>
        {data.capability && (
          <div className="stat-item">
            <span className="stat-label">Type:</span>
            <span className="stat-value">{data.capability}</span>
          </div>
        )}
      </div>
    </BaseNode>
  );
});

// Task Node - Task execution
const TaskNode = memo(({ data }) => {
  const progress = data.progress || 0;

  return (
    <BaseNode data={data} type="task" icon="📋">
      <div className="node-progress">
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            style={{ backgroundColor: STATUS_COLORS[data.status] }}
          />
        </div>
        <div className="progress-label">{progress}%</div>
      </div>
      {data.assignedTo && (
        <div className="node-info">
          <span className="info-label">Assigned to:</span>
          <span className="info-value">{data.assignedTo}</span>
        </div>
      )}
    </BaseNode>
  );
});

// Data Flow Node - Data processing
const DataFlowNode = memo(({ data }) => {
  return (
    <BaseNode data={data} type="dataflow" icon="📊">
      <div className="node-stats">
        {data.throughput && (
          <div className="stat-item">
            <span className="stat-label">Throughput:</span>
            <span className="stat-value">{data.throughput}/s</span>
          </div>
        )}
        {data.dataSize && (
          <div className="stat-item">
            <span className="stat-label">Size:</span>
            <span className="stat-value">{data.dataSize}</span>
          </div>
        )}
      </div>
      {data.dataType && (
        <div className="node-badge" style={{ backgroundColor: STATUS_COLORS[data.status] }}>
          {data.dataType}
        </div>
      )}
    </BaseNode>
  );
});

// Export all node types
const NodeRenderer = {
  CoordinatorNode,
  WorkerNode,
  TaskNode,
  DataFlowNode,
};

export default NodeRenderer;
