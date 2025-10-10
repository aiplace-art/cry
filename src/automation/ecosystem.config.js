module.exports = {
  apps: [
    {
      name: 'hypeai-automation',
      script: './content-scheduler.js',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true
    },
    {
      name: 'hypeai-reminder',
      script: './calendar-manager.js',
      args: 'remind',
      instances: 1,
      autorestart: true,
      watch: false,
      cron_restart: '0 8 * * *', // Daily at 8 AM
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
