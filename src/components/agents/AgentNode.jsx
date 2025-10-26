import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';

const agentIcons = {
  coder: '💻',
  researcher: '🔬',
  tester: '🧪',
  reviewer: '👁️',
  coordinator: '🎯',
  architect: '🏗️',
  'backend-dev': '⚙️',
  'ml-developer': '🤖',
  'cicd-engineer': '🚀',
  default: '🤖'
};

const AgentNode = ({ data }) => {
  const icon = agentIcons[data.type] || agentIcons.default;
  const isActive = data.status === 'active';
  const isWorking = data.status === 'working';

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="relative"
      onClick={data.onClick}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-cyan-500 border-2 border-gray-900"
      />

      <div
        className={`
          relative px-6 py-4 rounded-2xl min-w-[160px]
          backdrop-blur-xl border-2 transition-all cursor-pointer
          ${
            isActive
              ? 'bg-green-500/10 border-green-500 shadow-lg shadow-green-500/20'
              : isWorking
              ? 'bg-yellow-500/10 border-yellow-500 shadow-lg shadow-yellow-500/20'
              : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
          }
        `}
      >
        {/* Pulse Animation for Active */}
        {isActive && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 rounded-2xl bg-green-500/20 pointer-events-none"
          />
        )}

        <div className="flex items-center gap-3">
          {/* Icon */}
          <motion.div
            animate={
              isActive || isWorking
                ? {
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="text-3xl"
          >
            {icon}
          </motion.div>

          <div className="flex-1">
            {/* Agent Name */}
            <div className="text-sm font-bold text-white mb-1">
              {data.label}
            </div>

            {/* Agent Type */}
            <div className="text-xs text-gray-400">{data.type}</div>

            {/* Status Badge */}
            <motion.div
              animate={isActive ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`
                inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium
                ${
                  isActive
                    ? 'bg-green-500/20 text-green-400'
                    : isWorking
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-gray-700/50 text-gray-400'
                }
              `}
            >
              {data.status}
            </motion.div>
          </div>
        </div>

        {/* Metrics */}
        {data.metrics && (
          <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Tasks</span>
              <span className="text-white font-medium">{data.metrics.tasks}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Uptime</span>
              <span className="text-white font-medium">{data.metrics.uptime}</span>
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-cyan-500 border-2 border-gray-900"
      />
    </motion.div>
  );
};

export default memo(AgentNode);
