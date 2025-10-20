// Security Monitoring for HypeAI Private Sale
// Track security events, anomalies, and potential threats

import { trackSecurityEvent } from '../../sentry.server.config';

interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000;
  private blockedIPs: Set<string> = new Set();
  private suspiciousWallets: Set<string> = new Set();

  // Log security event
  logEvent(
    type: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string,
    metadata?: Record<string, any>
  ) {
    const event: SecurityEvent = {
      type,
      severity,
      message,
      timestamp: Date.now(),
      metadata,
    };

    this.events.push(event);

    // Keep only last N events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Send critical events to Sentry
    if (severity === 'critical' || severity === 'high') {
      trackSecurityEvent(message, severity, metadata);
    }

    // Log to console
    const emoji = {
      low: '🔵',
      medium: '🟡',
      high: '🟠',
      critical: '🔴',
    };
    console.warn(`${emoji[severity]} [Security] ${type}: ${message}`, metadata);

    return event;
  }

  // Get security events
  getEvents(type?: string, severity?: string): SecurityEvent[] {
    let filtered = this.events;
    if (type) {
      filtered = filtered.filter((e) => e.type === type);
    }
    if (severity) {
      filtered = filtered.filter((e) => e.severity === severity);
    }
    return filtered;
  }

  // Block IP address
  blockIP(ip: string, reason: string) {
    this.blockedIPs.add(ip);
    this.logEvent('ip_blocked', 'high', `IP ${ip} blocked: ${reason}`, { ip, reason });
  }

  // Check if IP is blocked
  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  // Flag suspicious wallet
  flagWallet(address: string, reason: string) {
    this.suspiciousWallets.add(address);
    this.logEvent('wallet_flagged', 'medium', `Wallet ${address} flagged: ${reason}`, {
      address,
      reason,
    });
  }

  // Check if wallet is suspicious
  isWalletSuspicious(address: string): boolean {
    return this.suspiciousWallets.has(address);
  }

  // Export security log
  export(): SecurityEvent[] {
    return [...this.events];
  }

  // Clear events
  clear() {
    this.events = [];
  }

  // Get security summary
  getSummary() {
    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const recentEvents = this.events.filter((e) => e.timestamp > last24h);

    return {
      total: recentEvents.length,
      bySeverity: {
        critical: recentEvents.filter((e) => e.severity === 'critical').length,
        high: recentEvents.filter((e) => e.severity === 'high').length,
        medium: recentEvents.filter((e) => e.severity === 'medium').length,
        low: recentEvents.filter((e) => e.severity === 'low').length,
      },
      byType: recentEvents.reduce((acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      blockedIPs: this.blockedIPs.size,
      suspiciousWallets: this.suspiciousWallets.size,
    };
  }
}

// Global security monitor instance
export const securityMonitor = new SecurityMonitor();

// Rate limiting tracker
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  // Track request
  track(identifier: string) {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Remove requests older than 1 minute
    const recentRequests = requests.filter((t) => now - t < 60000);
    recentRequests.push(now);

    this.requests.set(identifier, recentRequests);

    return recentRequests.length;
  }

  // Check if rate limit exceeded
  isRateLimited(identifier: string, maxRequests = 10): boolean {
    const count = this.track(identifier);
    return count > maxRequests;
  }

  // Get request count
  getCount(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    return requests.filter((t) => now - t < 60000).length;
  }

  // Clear old requests
  cleanup() {
    const now = Date.now();
    for (const [key, requests] of this.requests.entries()) {
      const recentRequests = requests.filter((t) => now - t < 60000);
      if (recentRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recentRequests);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Anomaly detector for transaction patterns
class AnomalyDetector {
  private transactionHistory: Array<{
    amount: number;
    timestamp: number;
    wallet: string;
  }> = [];

  // Add transaction to history
  addTransaction(wallet: string, amount: number) {
    this.transactionHistory.push({
      wallet,
      amount,
      timestamp: Date.now(),
    });

    // Keep only last 1000 transactions
    if (this.transactionHistory.length > 1000) {
      this.transactionHistory.shift();
    }
  }

  // Check for unusual transaction patterns
  detectAnomalies(wallet: string, amount: number): string[] {
    const anomalies: string[] = [];

    // Get wallet's transaction history
    const walletTxs = this.transactionHistory.filter((tx) => tx.wallet === wallet);

    // Check for suspiciously large transaction
    if (walletTxs.length > 0) {
      const avgAmount = walletTxs.reduce((sum, tx) => sum + tx.amount, 0) / walletTxs.length;
      if (amount > avgAmount * 10) {
        anomalies.push('unusually_large_transaction');
      }
    }

    // Check for rapid successive transactions
    const now = Date.now();
    const recentTxs = walletTxs.filter((tx) => now - tx.timestamp < 60000); // Last minute
    if (recentTxs.length > 5) {
      anomalies.push('rapid_transactions');
    }

    // Check for round amounts (potential test/fake transactions)
    if (amount % 1000 === 0 && amount >= 10000) {
      anomalies.push('round_amount_large');
    }

    return anomalies;
  }

  // Get transaction statistics
  getStats() {
    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const recentTxs = this.transactionHistory.filter((tx) => tx.timestamp > last24h);

    return {
      total: recentTxs.length,
      totalVolume: recentTxs.reduce((sum, tx) => sum + tx.amount, 0),
      avgAmount: recentTxs.length > 0
        ? recentTxs.reduce((sum, tx) => sum + tx.amount, 0) / recentTxs.length
        : 0,
      uniqueWallets: new Set(recentTxs.map((tx) => tx.wallet)).size,
    };
  }
}

export const anomalyDetector = new AnomalyDetector();

// Common security tracking functions

// Track failed login attempt
export function trackFailedAuth(identifier: string, reason: string) {
  const count = rateLimiter.track(`auth_fail_${identifier}`);

  if (count > 5) {
    securityMonitor.logEvent(
      'auth_attack',
      'high',
      `Multiple failed auth attempts: ${identifier}`,
      { identifier, count, reason }
    );

    // Block after 10 failed attempts
    if (count > 10) {
      securityMonitor.blockIP(identifier, 'Too many failed auth attempts');
    }
  } else {
    securityMonitor.logEvent(
      'auth_failure',
      'low',
      `Failed auth attempt: ${identifier}`,
      { identifier, reason }
    );
  }
}

// Track successful authentication
export function trackSuccessfulAuth(identifier: string, wallet?: string) {
  securityMonitor.logEvent(
    'auth_success',
    'low',
    `Successful auth: ${identifier}`,
    { identifier, wallet }
  );
}

// Track transaction validation
export function trackTransactionValidation(
  wallet: string,
  amount: number,
  valid: boolean,
  reason?: string
) {
  if (!valid) {
    securityMonitor.logEvent(
      'transaction_rejected',
      'medium',
      `Transaction rejected: ${reason}`,
      { wallet, amount, reason }
    );
  }

  // Check for anomalies
  const anomalies = anomalyDetector.detectAnomalies(wallet, amount);
  if (anomalies.length > 0) {
    securityMonitor.logEvent(
      'transaction_anomaly',
      'high',
      `Unusual transaction pattern detected`,
      { wallet, amount, anomalies }
    );
  }

  // Add to history
  if (valid) {
    anomalyDetector.addTransaction(wallet, amount);
  }
}

// Track rate limit violation
export function trackRateLimitViolation(
  identifier: string,
  endpoint: string,
  count: number
) {
  securityMonitor.logEvent(
    'rate_limit',
    'medium',
    `Rate limit exceeded: ${endpoint}`,
    { identifier, endpoint, count }
  );

  // Block after severe violations
  if (count > 50) {
    securityMonitor.blockIP(identifier, 'Severe rate limit violation');
  }
}

// Track smart contract interaction
export function trackContractInteraction(
  wallet: string,
  method: string,
  success: boolean,
  error?: string
) {
  if (!success) {
    securityMonitor.logEvent(
      'contract_failure',
      'medium',
      `Contract call failed: ${method}`,
      { wallet, method, error }
    );
  }
}

// Track suspicious activity
export function trackSuspiciousActivity(
  type: string,
  description: string,
  metadata?: Record<string, any>
) {
  securityMonitor.logEvent('suspicious_activity', 'high', description, {
    type,
    ...metadata,
  });
}

// Track data breach attempt
export function trackDataBreachAttempt(
  identifier: string,
  attemptType: string,
  details: string
) {
  securityMonitor.logEvent(
    'breach_attempt',
    'critical',
    `Data breach attempt: ${attemptType}`,
    { identifier, attemptType, details }
  );

  // Immediately block
  securityMonitor.blockIP(identifier, 'Data breach attempt');
}

// Track XSS attempt
export function trackXSSAttempt(identifier: string, payload: string) {
  securityMonitor.logEvent('xss_attempt', 'high', 'XSS payload detected', {
    identifier,
    payload: payload.substring(0, 100), // First 100 chars
  });
}

// Track SQL injection attempt
export function trackSQLInjectionAttempt(identifier: string, query: string) {
  securityMonitor.logEvent('sql_injection', 'critical', 'SQL injection detected', {
    identifier,
    query: query.substring(0, 100), // First 100 chars
  });

  // Immediately block
  securityMonitor.blockIP(identifier, 'SQL injection attempt');
}

// Track CORS violation
export function trackCORSViolation(origin: string, identifier: string) {
  securityMonitor.logEvent('cors_violation', 'medium', 'CORS policy violation', {
    origin,
    identifier,
  });
}

// Get security health
export function getSecurityHealth() {
  const summary = securityMonitor.getSummary();
  const stats = anomalyDetector.getStats();

  return {
    status: summary.bySeverity.critical > 0 ? 'critical' :
            summary.bySeverity.high > 10 ? 'warning' : 'healthy',
    events: summary,
    transactions: stats,
    blockedIPs: securityMonitor['blockedIPs'].size,
    suspiciousWallets: securityMonitor['suspiciousWallets'].size,
  };
}

// Cleanup old data (run periodically)
export function cleanupSecurityData() {
  rateLimiter.cleanup();
  securityMonitor.logEvent('cleanup', 'low', 'Security data cleanup completed');
}
