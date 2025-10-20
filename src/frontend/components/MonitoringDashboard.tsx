// Monitoring Dashboard Component for HypeAI Private Sale
// Real-time system monitoring, metrics, and alerts

import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { getPerformanceSummary } from '../lib/monitoring/performance';
import { getBusinessMetrics } from '../lib/monitoring/analytics';
import { getSecurityHealth } from '../lib/monitoring/security';
import { healthMonitor } from '../lib/monitoring/health';

interface DashboardProps {
  refreshInterval?: number; // milliseconds
}

export function MonitoringDashboard({ refreshInterval = 30000 }: DashboardProps) {
  const [performance, setPerformance] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [security, setSecurity] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Initial load
    updateMetrics();

    // Periodic refresh
    const interval = setInterval(updateMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const updateMetrics = async () => {
    setPerformance(getPerformanceSummary());
    setBusiness(getBusinessMetrics());
    setSecurity(getSecurityHealth());
    setHealth(await healthMonitor.checkHealth());
    setLastUpdate(new Date());
  };

  if (!performance || !business || !security || !health) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading monitoring data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Production Monitoring</h1>
        <div className="text-sm text-gray-400">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusCard
          title="System Status"
          value={health.status}
          status={health.status}
          icon="🖥️"
        />
        <StatusCard
          title="Uptime"
          value={healthMonitor.getUptimeFormatted()}
          status="healthy"
          icon="⏱️"
        />
        <StatusCard
          title="API Latency"
          value={`${Math.round(performance.api.p95)}ms`}
          status={performance.api.p95 < 500 ? 'healthy' : 'degraded'}
          icon="⚡"
        />
        <StatusCard
          title="Error Rate"
          value={`${((business.errors.total / business.funnel.pageViews) * 100).toFixed(2)}%`}
          status={business.errors.total < 10 ? 'healthy' : 'degraded'}
          icon="⚠️"
        />
      </div>

      {/* Performance Metrics */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="API Performance"
            metrics={[
              { label: 'Average', value: `${Math.round(performance.api.average)}ms` },
              { label: 'P95', value: `${Math.round(performance.api.p95)}ms` },
            ]}
          />
          <MetricCard
            title="Database Performance"
            metrics={[
              { label: 'Average', value: `${Math.round(performance.database.average)}ms` },
              { label: 'P95', value: `${Math.round(performance.database.p95)}ms` },
            ]}
          />
          <MetricCard
            title="Blockchain RPC"
            metrics={[
              { label: 'Average', value: `${Math.round(performance.blockchain.average)}ms` },
              { label: 'P95', value: `${Math.round(performance.blockchain.p95)}ms` },
            ]}
          />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-white mb-3">Web Vitals</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <WebVitalCard
              label="LCP"
              value={Math.round(performance.webVitals.lcp)}
              unit="ms"
              threshold={2500}
            />
            <WebVitalCard
              label="FID"
              value={Math.round(performance.webVitals.fid)}
              unit="ms"
              threshold={100}
            />
            <WebVitalCard
              label="CLS"
              value={performance.webVitals.cls.toFixed(3)}
              unit=""
              threshold={0.1}
            />
            <WebVitalCard
              label="TTFB"
              value={Math.round(performance.webVitals.ttfb)}
              unit="ms"
              threshold={800}
            />
          </div>
        </div>
      </Card>

      {/* Business Metrics */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Business Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Purchases"
            metrics={[
              { label: 'Total', value: business.purchases.total },
              { label: 'Value', value: `$${business.purchases.totalValue.toLocaleString()}` },
              { label: 'Failed', value: business.purchases.failed, highlight: business.purchases.failed > 0 },
            ]}
          />
          <MetricCard
            title="Wallets"
            metrics={[
              { label: 'Connected', value: business.wallets.connected },
              { label: 'Disconnected', value: business.wallets.disconnected },
            ]}
          />
          <MetricCard
            title="Conversion Funnel"
            metrics={[
              { label: 'Page Views', value: business.funnel.pageViews },
              { label: 'Wallet Connects', value: business.funnel.walletConnects },
              { label: 'Purchases', value: business.funnel.purchaseCompletes },
              { label: 'Conversion Rate', value: `${business.funnel.conversionRate.toFixed(2)}%` },
            ]}
          />
        </div>

        {/* Payment Methods Breakdown */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-white mb-3">Sales by Payment Method</h3>
          <div className="space-y-2">
            {Object.entries(business.purchases.byPaymentMethod as Record<string, number>).map(
              ([method, amount]) => (
                <div key={method} className="flex items-center justify-between">
                  <span className="text-gray-300">{method}</span>
                  <span className="text-white font-semibold">
                    ${(amount as number).toLocaleString()}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </Card>

      {/* Security Monitoring */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Security Monitoring</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Security Events (24h)</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-red-400">🔴 Critical</span>
                <span className="text-white font-semibold">
                  {security.events.bySeverity.critical}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-orange-400">🟠 High</span>
                <span className="text-white font-semibold">
                  {security.events.bySeverity.high}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400">🟡 Medium</span>
                <span className="text-white font-semibold">
                  {security.events.bySeverity.medium}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-400">🔵 Low</span>
                <span className="text-white font-semibold">
                  {security.events.bySeverity.low}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-3">Security Summary</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Blocked IPs</span>
                <span className="text-white font-semibold">
                  {security.blockedIPs}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Suspicious Wallets</span>
                <span className="text-white font-semibold">
                  {security.suspiciousWallets}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Total Events</span>
                <span className="text-white font-semibold">
                  {security.events.total}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Statistics */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-white mb-3">Transaction Statistics (24h)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {security.transactions.total}
              </div>
              <div className="text-sm text-gray-400">Total Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                ${security.transactions.totalVolume.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                ${Math.round(security.transactions.avgAmount).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Avg Amount</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {security.transactions.uniqueWallets}
              </div>
              <div className="text-sm text-gray-400">Unique Wallets</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Health Checks */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Health Checks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(health.checks).map(([name, check]) => (
            <HealthCheckCard key={name} name={name} check={check as any} />
          ))}
        </div>
      </Card>
    </div>
  );
}

// Status Card Component
function StatusCard({
  title,
  value,
  status,
  icon,
}: {
  title: string;
  value: string;
  status: string;
  icon: string;
}) {
  const statusColors = {
    healthy: 'bg-green-500/20 text-green-400 border-green-500/30',
    degraded: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    down: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <Card className={`p-4 border ${statusColors[status as keyof typeof statusColors] || statusColors.degraded}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-400">{title}</div>
          <div className="text-2xl font-bold mt-1">{value}</div>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </Card>
  );
}

// Metric Card Component
function MetricCard({
  title,
  metrics,
}: {
  title: string;
  metrics: Array<{ label: string; value: string | number; highlight?: boolean }>;
}) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h3 className="text-lg font-medium text-white mb-3">{title}</h3>
      <div className="space-y-2">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-400">{metric.label}</span>
            <span className={`font-semibold ${metric.highlight ? 'text-red-400' : 'text-white'}`}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Web Vital Card Component
function WebVitalCard({
  label,
  value,
  unit,
  threshold,
}: {
  label: string;
  value: string | number;
  unit: string;
  threshold: number;
}) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const status = numValue <= threshold ? 'good' : 'poor';
  const colors = {
    good: 'text-green-400 border-green-500/30',
    poor: 'text-red-400 border-red-500/30',
  };

  return (
    <div className={`bg-gray-800/50 rounded-lg p-3 border ${colors[status]}`}>
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-xl font-bold mt-1">
        {value}
        {unit}
      </div>
    </div>
  );
}

// Health Check Card Component
function HealthCheckCard({ name, check }: { name: string; check: any }) {
  const status = check.healthy ? 'healthy' : 'unhealthy';
  const colors = {
    healthy: 'text-green-400 border-green-500/30',
    unhealthy: 'text-red-400 border-red-500/30',
  };

  return (
    <div className={`bg-gray-800/50 rounded-lg p-4 border ${colors[status]}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-white capitalize">{name}</h3>
        <span className="text-2xl">{check.healthy ? '✅' : '❌'}</span>
      </div>
      {check.latency && (
        <div className="text-sm text-gray-400">Latency: {Math.round(check.latency)}ms</div>
      )}
      {check.message && <div className="text-sm text-gray-400 mt-1">{check.message}</div>}
    </div>
  );
}
