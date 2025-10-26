import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const COLORS = ['#00E5FF', '#00AAFF', '#0077FF', '#10B981', '#F59E0B'];

const MetricsPanel = ({ metrics }) => {
  const {
    tokenUsage = [],
    responseTime = [],
    agentDistribution = [],
    taskCompletion = { completed: 0, pending: 0, failed: 0 },
    totalTasks = 0,
    activeAgents = 0,
    avgResponseTime = 0,
    totalTokens = 0
  } = metrics || {};

  const completionRate =
    totalTasks > 0
      ? ((taskCompletion.completed / totalTasks) * 100).toFixed(1)
      : 0;

  const statCards = [
    {
      title: 'Active Agents',
      value: activeAgents,
      icon: '🤖',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: '📋',
      color: 'from-blue-500 to-purple-500'
    },
    {
      title: 'Avg Response',
      value: `${avgResponseTime}ms`,
      icon: '⚡',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Total Tokens',
      value: totalTokens.toLocaleString(),
      icon: '🎯',
      color: 'from-green-500 to-cyan-500'
    }
  ];

  const taskCompletionData = [
    { name: 'Completed', value: taskCompletion.completed, color: '#10B981' },
    { name: 'Pending', value: taskCompletion.pending, color: '#F59E0B' },
    { name: 'Failed', value: taskCompletion.failed, color: '#EF4444' }
  ];

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Performance Metrics</h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time system analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 bg-green-500 rounded-full"
          />
          <span className="text-sm text-gray-300">Live</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 hover:border-cyan-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-gray-400">{stat.title}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Completion Rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4">Task Completion Rate</h3>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-cyan-400">
                    {completionRate}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-cyan-500 to-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{taskCompletion.completed}</p>
            <p className="text-xs text-gray-400">Completed</p>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Usage Chart */}
        {tokenUsage.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Token Usage Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={tokenUsage}>
                <defs>
                  <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  stroke="#00E5FF"
                  fillOpacity={1}
                  fill="url(#tokenGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Response Time Chart */}
        {responseTime.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Response Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={responseTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ms"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Agent Distribution */}
        {agentDistribution.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Agent Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={agentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {agentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Task Completion Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">Task Status</h3>
          <div className="space-y-4">
            {taskCompletionData.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{item.value}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(item.value / totalTasks) * 100}%`
                    }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MetricsPanel;
