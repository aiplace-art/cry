/**
 * Server Entry Point
 * Starts the AI Agent Chat Backend
 */

const AIAgentChatApp = require('./app');

// Load environment variables
require('dotenv').config();

// Configuration
const config = {
  port: process.env.PORT || 3001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  nodeEnv: process.env.NODE_ENV || 'development',
  enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
  maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 50
};

// Validate environment
if (!config.anthropicApiKey) {
  console.error('❌ Error: ANTHROPIC_API_KEY is not set');
  console.error('Please set ANTHROPIC_API_KEY in your .env file');
  process.exit(1);
}

// Create and start app
const app = new AIAgentChatApp(config);

app.start()
  .then(() => {
    console.log('✅ Server started successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

// Export app instance for testing
module.exports = app;
