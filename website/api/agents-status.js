/**
 * HypeAI - Agent Status API
 *
 * Returns live status of AI agents working on the platform
 * Cached for 5 minutes to reduce load
 *
 * GET /api/agents-status
 */

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cachedData = null;
let cacheTimestamp = null;

/**
 * Mock agent status data
 * TODO: Replace with real metrics from development logs
 */
function getAgentStatus() {
  return {
    totalAgents: 8,
    activeAgents: 8,
    agentDetails: [
      { name: 'Researcher', status: 'active', tasksCompleted: 247 },
      { name: 'Architect', status: 'active', tasksCompleted: 189 },
      { name: 'Smart Contract Coder', status: 'active', tasksCompleted: 156 },
      { name: 'Backend Developer', status: 'active', tasksCompleted: 143 },
      { name: 'Frontend Developer', status: 'active', tasksCompleted: 198 },
      { name: 'ML Developer', status: 'active', tasksCompleted: 134 },
      { name: 'QA Tester', status: 'active', tasksCompleted: 221 },
      { name: 'Security Reviewer', status: 'active', tasksCompleted: 159 }
    ],
    totalTasksCompleted: 1447,
    uptime: '99.9%',
    lastUpdate: new Date().toISOString(),
    systemHealth: 'optimal',
    averageResponseTime: '1.2s',
    successRate: '98.7%'
  };
}

/**
 * Check if cache is still valid
 */
function isCacheValid() {
  if (!cachedData || !cacheTimestamp) return false;
  return (Date.now() - cacheTimestamp) < CACHE_DURATION;
}

/**
 * Main handler function
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      allowedMethods: ['GET']
    });
  }

  try {
    // Check cache
    if (isCacheValid()) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        cached: true,
        cacheAge: Math.floor((Date.now() - cacheTimestamp) / 1000),
        nextUpdate: Math.floor((CACHE_DURATION - (Date.now() - cacheTimestamp)) / 1000)
      });
    }

    // Fetch fresh data
    const statusData = getAgentStatus();

    // Update cache
    cachedData = statusData;
    cacheTimestamp = Date.now();

    // Return response
    return res.status(200).json({
      success: true,
      data: statusData,
      cached: false,
      cacheAge: 0,
      nextUpdate: CACHE_DURATION / 1000
    });

  } catch (error) {
    console.error('Error fetching agent status:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch agent status'
    });
  }
}

/**
 * CORS headers (if needed)
 */
export const config = {
  api: {
    externalResolver: true,
  },
};
