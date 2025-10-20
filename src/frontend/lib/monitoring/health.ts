// Health Check Utilities for HypeAI Private Sale
// Monitor system health, dependencies, and availability

interface HealthCheckResult {
  healthy: boolean;
  message?: string;
  latency?: number;
  details?: Record<string, any>;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: number;
  uptime: number;
  checks: Record<string, HealthCheckResult>;
}

class HealthMonitor {
  private startTime = Date.now();
  private lastCheck: SystemHealth | null = null;

  // Perform full health check
  async checkHealth(): Promise<SystemHealth> {
    const checks: Record<string, HealthCheckResult> = {};

    // Check API endpoints
    checks.api = await this.checkAPI();

    // Check database (if accessible)
    checks.database = await this.checkDatabase();

    // Check blockchain RPC
    checks.blockchain = await this.checkBlockchain();

    // Check external dependencies
    checks.external = await this.checkExternalDependencies();

    // Determine overall status
    const allHealthy = Object.values(checks).every((c) => c.healthy);
    const anyUnhealthy = Object.values(checks).some((c) => !c.healthy);

    const health: SystemHealth = {
      status: allHealthy ? 'healthy' : anyUnhealthy ? 'degraded' : 'down',
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      checks,
    };

    this.lastCheck = health;
    return health;
  }

  // Check API endpoints
  private async checkAPI(): Promise<HealthCheckResult> {
    try {
      const start = performance.now();
      const response = await fetch('/api/health', { method: 'GET' });
      const latency = performance.now() - start;

      if (response.ok) {
        return {
          healthy: true,
          latency,
          details: { status: response.status },
        };
      } else {
        return {
          healthy: false,
          message: `API returned ${response.status}`,
          latency,
        };
      }
    } catch (error) {
      return {
        healthy: false,
        message: error instanceof Error ? error.message : 'API check failed',
      };
    }
  }

  // Check database connectivity
  private async checkDatabase(): Promise<HealthCheckResult> {
    try {
      const start = performance.now();
      const response = await fetch('/api/health/db', { method: 'GET' });
      const latency = performance.now() - start;

      if (response.ok) {
        const data = await response.json();
        return {
          healthy: true,
          latency,
          details: data,
        };
      } else {
        return {
          healthy: false,
          message: 'Database connection failed',
          latency,
        };
      }
    } catch (error) {
      return {
        healthy: false,
        message: error instanceof Error ? error.message : 'Database check failed',
      };
    }
  }

  // Check blockchain RPC connectivity
  private async checkBlockchain(): Promise<HealthCheckResult> {
    try {
      if (typeof window === 'undefined') {
        return { healthy: true, message: 'Server-side, skipping' };
      }

      const { ethers } = await import('ethers');
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL || 'https://eth.llamarpc.com'
      );

      const start = performance.now();
      const blockNumber = await provider.getBlockNumber();
      const latency = performance.now() - start;

      return {
        healthy: true,
        latency,
        details: { blockNumber },
      };
    } catch (error) {
      return {
        healthy: false,
        message: error instanceof Error ? error.message : 'Blockchain check failed',
      };
    }
  }

  // Check external dependencies
  private async checkExternalDependencies(): Promise<HealthCheckResult> {
    const checks = {
      cdn: true,
      analytics: true,
      monitoring: true,
    };

    // In production, you would check actual external services
    // For now, we'll just return healthy

    return {
      healthy: Object.values(checks).every((c) => c),
      details: checks,
    };
  }

  // Get last health check result
  getLastCheck(): SystemHealth | null {
    return this.lastCheck;
  }

  // Get uptime in milliseconds
  getUptime(): number {
    return Date.now() - this.startTime;
  }

  // Get uptime in human-readable format
  getUptimeFormatted(): string {
    const uptime = this.getUptime();
    const days = Math.floor(uptime / (24 * 60 * 60 * 1000));
    const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((uptime % (60 * 60 * 1000)) / (60 * 1000));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}

// Global health monitor instance
export const healthMonitor = new HealthMonitor();

// Quick health check functions

// Ping endpoint
export async function ping(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

// Check API response time
export async function checkAPILatency(): Promise<number> {
  const start = performance.now();
  try {
    await fetch('/api/health', { method: 'GET' });
    return performance.now() - start;
  } catch {
    return -1;
  }
}

// Check database latency
export async function checkDatabaseLatency(): Promise<number> {
  const start = performance.now();
  try {
    const response = await fetch('/api/health/db', { method: 'GET' });
    if (response.ok) {
      return performance.now() - start;
    }
    return -1;
  } catch {
    return -1;
  }
}

// Get system status
export async function getSystemStatus(): Promise<{
  status: string;
  uptime: string;
  latency: number;
}> {
  const health = await healthMonitor.checkHealth();

  return {
    status: health.status,
    uptime: healthMonitor.getUptimeFormatted(),
    latency: health.checks.api?.latency || 0,
  };
}

// Export health data for monitoring dashboard
export async function exportHealthData() {
  const health = await healthMonitor.checkHealth();

  return {
    timestamp: new Date().toISOString(),
    status: health.status,
    uptime: healthMonitor.getUptime(),
    uptimeFormatted: healthMonitor.getUptimeFormatted(),
    checks: health.checks,
    metrics: {
      api: {
        healthy: health.checks.api?.healthy || false,
        latency: health.checks.api?.latency || 0,
      },
      database: {
        healthy: health.checks.database?.healthy || false,
        latency: health.checks.database?.latency || 0,
      },
      blockchain: {
        healthy: health.checks.blockchain?.healthy || false,
        latency: health.checks.blockchain?.latency || 0,
        blockNumber: health.checks.blockchain?.details?.blockNumber,
      },
    },
  };
}

// Continuous health monitoring (call periodically)
export async function startHealthMonitoring(intervalMs = 60000) {
  // Initial check
  await healthMonitor.checkHealth();

  // Periodic checks
  setInterval(async () => {
    const health = await healthMonitor.checkHealth();

    // Log health status
    if (health.status === 'healthy') {
      console.log('✅ System healthy');
    } else if (health.status === 'degraded') {
      console.warn('⚠️ System degraded:', health.checks);
    } else {
      console.error('❌ System down:', health.checks);
    }
  }, intervalMs);
}
