import React, { memo } from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import { motion } from 'framer-motion';

/**
 * EdgeRenderer - Custom edge components for agent connections
 *
 * Edge Types:
 * - AnimatedEdge: Animated data flow edge with particles
 * - DataEdge: Data transmission edge with metrics
 */

// Animated Edge with flowing particles
const AnimatedEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Particle animation along the edge
  const particleVariants = {
    animate: {
      offsetDistance: ['0%', '100%'],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: data?.color || '#00E5FF',
          strokeWidth: 2,
          filter: 'drop-shadow(0 0 4px rgba(0, 229, 255, 0.5))',
        }}
      />

      {/* Animated particle */}
      <motion.circle
        r="4"
        fill={data?.color || '#00E5FF'}
        variants={particleVariants}
        animate="animate"
      >
        <animateMotion dur="2s" repeatCount="indefinite">
          <mpath href={`#${id}`} />
        </animateMotion>
      </motion.circle>

      <EdgeLabelRenderer>
        {data?.label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 500,
              color: data?.color || '#00E5FF',
              border: `1px solid ${data?.color || '#00E5FF'}`,
              pointerEvents: 'all',
            }}
            className="edge-label"
          >
            {data.label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
});

// Data Edge with transmission metrics
const DataEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeColor = data?.active ? '#00AAFF' : '#666666';
  const edgeWidth = data?.bandwidth ? Math.max(2, Math.min(8, data.bandwidth / 10)) : 2;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: edgeWidth,
          strokeDasharray: data?.active ? '5, 5' : 'none',
          filter: data?.active ? 'drop-shadow(0 0 4px rgba(0, 170, 255, 0.5))' : 'none',
        }}
      />

      {data?.active && (
        <motion.path
          d={edgePath}
          fill="none"
          stroke={edgeColor}
          strokeWidth={edgeWidth + 2}
          strokeDasharray="5, 5"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -20 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      <EdgeLabelRenderer>
        {data?.metrics && (
          <motion.div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: 'rgba(0, 0, 0, 0.9)',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 500,
              color: '#ffffff',
              border: `1px solid ${edgeColor}`,
              pointerEvents: 'all',
              minWidth: '120px',
            }}
            className="edge-metrics"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="metric-row">
              <span className="metric-label">Bandwidth:</span>
              <span className="metric-value">{data.metrics.bandwidth || 'N/A'}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Latency:</span>
              <span className="metric-value">{data.metrics.latency || 'N/A'}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Packets:</span>
              <span className="metric-value">{data.metrics.packets || 'N/A'}</span>
            </div>
          </motion.div>
        )}
      </EdgeLabelRenderer>
    </>
  );
});

// Gradient Edge with color transition
const GradientEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const gradientId = `gradient-${id}`;

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={data?.sourceColor || '#00E5FF'} />
          <stop offset="100%" stopColor={data?.targetColor || '#00AAFF'} />
        </linearGradient>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: `url(#${gradientId})`,
          strokeWidth: 3,
          filter: 'drop-shadow(0 0 4px rgba(0, 229, 255, 0.4))',
        }}
      />
    </>
  );
});

// Pulse Edge with pulsating animation
const PulseEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <motion.path
        d={edgePath}
        fill="none"
        stroke={data?.color || '#00E5FF'}
        strokeWidth={2}
        style={style}
        markerEnd={markerEnd}
        animate={{
          strokeWidth: [2, 4, 2],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </>
  );
});

// Export all edge types
const EdgeRenderer = {
  AnimatedEdge,
  DataEdge,
  GradientEdge,
  PulseEdge,
};

export default EdgeRenderer;
