// Prometheus-compatible Metrics Endpoint
// Exports metrics in Prometheus format for external monitoring

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate Prometheus metrics
    const metrics = generatePrometheusMetrics();

    // Set content type for Prometheus
    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    res.status(200).send(metrics);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate metrics',
    });
  }
}

function generatePrometheusMetrics(): string {
  const timestamp = Date.now();

  // In production, these would be actual metrics from your monitoring system
  // For now, we'll return example metrics structure

  return `
# HELP hypeai_uptime_seconds Total uptime in seconds
# TYPE hypeai_uptime_seconds counter
hypeai_uptime_seconds ${process.uptime()} ${timestamp}

# HELP hypeai_http_requests_total Total HTTP requests
# TYPE hypeai_http_requests_total counter
hypeai_http_requests_total{method="GET",status="200"} 1000 ${timestamp}
hypeai_http_requests_total{method="POST",status="200"} 500 ${timestamp}
hypeai_http_requests_total{method="GET",status="404"} 10 ${timestamp}

# HELP hypeai_http_request_duration_seconds HTTP request duration in seconds
# TYPE hypeai_http_request_duration_seconds histogram
hypeai_http_request_duration_seconds_bucket{le="0.1"} 800 ${timestamp}
hypeai_http_request_duration_seconds_bucket{le="0.5"} 950 ${timestamp}
hypeai_http_request_duration_seconds_bucket{le="1.0"} 990 ${timestamp}
hypeai_http_request_duration_seconds_bucket{le="+Inf"} 1000 ${timestamp}

# HELP hypeai_purchases_total Total purchases completed
# TYPE hypeai_purchases_total counter
hypeai_purchases_total{payment_method="ETH"} 100 ${timestamp}
hypeai_purchases_total{payment_method="BNB"} 80 ${timestamp}
hypeai_purchases_total{payment_method="USDT"} 120 ${timestamp}

# HELP hypeai_purchase_value_usd Total purchase value in USD
# TYPE hypeai_purchase_value_usd counter
hypeai_purchase_value_usd 150000 ${timestamp}

# HELP hypeai_active_users Current active users
# TYPE hypeai_active_users gauge
hypeai_active_users 42 ${timestamp}

# HELP hypeai_errors_total Total errors
# TYPE hypeai_errors_total counter
hypeai_errors_total{severity="low"} 5 ${timestamp}
hypeai_errors_total{severity="medium"} 2 ${timestamp}
hypeai_errors_total{severity="high"} 0 ${timestamp}
hypeai_errors_total{severity="critical"} 0 ${timestamp}

# HELP nodejs_memory_usage_bytes Node.js memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="rss"} ${process.memoryUsage().rss} ${timestamp}
nodejs_memory_usage_bytes{type="heapTotal"} ${process.memoryUsage().heapTotal} ${timestamp}
nodejs_memory_usage_bytes{type="heapUsed"} ${process.memoryUsage().heapUsed} ${timestamp}
nodejs_memory_usage_bytes{type="external"} ${process.memoryUsage().external} ${timestamp}

# HELP nodejs_version_info Node.js version info
# TYPE nodejs_version_info gauge
nodejs_version_info{version="${process.version}"} 1 ${timestamp}
`.trim();
}
