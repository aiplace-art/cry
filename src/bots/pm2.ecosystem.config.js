module.exports = {
  apps: [
    {
      name: 'hypeai-discord-bot',
      script: './src/bots/discord-bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        BOT_TYPE: 'discord'
      },
      error_file: './logs/discord-error.log',
      out_file: './logs/discord-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true
    },
    {
      name: 'hypeai-telegram-bot',
      script: './src/bots/telegram-bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        BOT_TYPE: 'telegram'
      },
      error_file: './logs/telegram-error.log',
      out_file: './logs/telegram-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true
    },
    {
      name: 'hypeai-twitter-bot',
      script: './src/bots/twitter-bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        BOT_TYPE: 'twitter'
      },
      error_file: './logs/twitter-error.log',
      out_file: './logs/twitter-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/hypeai.git',
      path: '/var/www/hypeai',
      'post-deploy': 'npm install && pm2 reload pm2.ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
