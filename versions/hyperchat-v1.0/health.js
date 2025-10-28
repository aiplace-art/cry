/**
 * Health check endpoint for AI Chat API
 */

export default function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if Anthropic API key is configured
  const hasAPIKey = !!process.env.ANTHROPIC_API_KEY;

  const health = {
    status: hasAPIKey ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'HypeAI AI Chat API',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    configuration: {
      apiKeyConfigured: hasAPIKey,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      maxTokens: process.env.MAX_TOKENS || '4096',
      rateLimit: {
        enabled: true,
        maxRequests: 10,
        window: '60s'
      }
    },
    endpoints: {
      chat: '/api/chat',
      health: '/api/health'
    }
  };

  res.status(200).json(health);
}
