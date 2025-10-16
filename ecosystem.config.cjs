/**
 * PM2 Ecosystem Configuration
 *
 * Manages all HypeAI project management agents
 * Run with: pm2 start ecosystem.config.cjs
 */

module.exports = {
  apps: [
    {
      name: 'project-coordinator',
      script: './src/bots/project-master-coordinator.js',
      cwd: '/Users/ai.place/Crypto',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/coordinator-error.log',
      out_file: './logs/coordinator-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'community-manager',
      script: './src/bots/community-manager-agent.js',
      cwd: '/Users/ai.place/Crypto',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/community-error.log',
      out_file: './logs/community-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true
    },
    {
      name: 'analytics-tracker',
      script: './src/bots/analytics-tracker-agent.js',
      cwd: '/Users/ai.place/Crypto',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/analytics-error.log',
      out_file: './logs/analytics-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true
    },
    {
      name: 'launch-coordinator',
      script: './src/bots/launch-coordinator-agent.js',
      cwd: '/Users/ai.place/Crypto',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/launch-error.log',
      out_file: './logs/launch-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true
    },
    {
      name: 'social-monitor',
      script: './src/bots/social-monitor-agent.js',
      cwd: '/Users/ai.place/Crypto',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/social-error.log',
      out_file: './logs/social-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true
    },
    {
      name: 'marketing-executor',
      script: './src/bots/marketing-executor-agent.js',
      cwd: '/Users/ai.place/Crypto',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/marketing-error.log',
      out_file: './logs/marketing-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true
    }
  ]
};
