// Performance Monitoring Utilities for HypeAI Private Sale
// Track API performance, page load times, and custom metrics

import { trackAPICall } from '../../sentry.client.config';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics

  // Track custom performance metric
  track(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow operations
    if (value > 1000) {
      console.warn(`Slow operation: ${name} took ${value}ms`, metadata);
    }

    return metric;
  }

  // Get metrics by name
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter((m) => m.name === name);
    }
    return this.metrics;
  }

  // Get average performance for a metric
  getAverage(name: string, last = 100): number {
    const metrics = this.getMetrics(name).slice(-last);
    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  // Get p95 percentile
  getP95(name: string, last = 100): number {
    const metrics = this.getMetrics(name).slice(-last);
    if (metrics.length === 0) return 0;

    const sorted = metrics.map((m) => m.value).sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index] || 0;
  }

  // Clear all metrics
  clear() {
    this.metrics = [];
  }

  // Export metrics for analysis
  export(): PerformanceMetric[] {
    return [...this.metrics];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Measure async function performance
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    performanceMonitor.track(name, duration, { ...metadata, status: 'success' });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.track(name, duration, { ...metadata, status: 'error' });
    throw error;
  }
}

// Measure sync function performance
export function measureSync<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>
): T {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    performanceMonitor.track(name, duration, { ...metadata, status: 'success' });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.track(name, duration, { ...metadata, status: 'error' });
    throw error;
  }
}

// API call wrapper with performance tracking
export async function trackedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const method = options?.method || 'GET';
  const span = trackAPICall(url, method);

  const start = performance.now();
  try {
    const response = await fetch(url, options);
    const duration = performance.now() - start;

    performanceMonitor.track(`api.${method}.${url}`, duration, {
      status: response.status,
      ok: response.ok,
    });

    if (span) span.finish();

    return response;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.track(`api.${method}.${url}`, duration, {
      error: true,
    });

    if (span) span.finish();
    throw error;
  }
}

// Web Vitals tracking (Core Web Vitals)
export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        const lcp = lastEntry.renderTime || lastEntry.loadTime;
        performanceMonitor.track('web_vitals.lcp', lcp, {
          url: window.location.pathname,
        });
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.warn('LCP tracking failed:', e);
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime;
          performanceMonitor.track('web_vitals.fid', fid, {
            url: window.location.pathname,
          });
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.warn('FID tracking failed:', e);
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        performanceMonitor.track('web_vitals.cls', clsValue, {
          url: window.location.pathname,
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('CLS tracking failed:', e);
    }
  }

  // Time to First Byte (TTFB)
  if (window.performance && window.performance.timing) {
    const ttfb =
      window.performance.timing.responseStart - window.performance.timing.requestStart;
    performanceMonitor.track('web_vitals.ttfb', ttfb, {
      url: window.location.pathname,
    });
  }

  // Page Load Time
  window.addEventListener('load', () => {
    if (window.performance && window.performance.timing) {
      const loadTime =
        window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      performanceMonitor.track('page.load_time', loadTime, {
        url: window.location.pathname,
      });
    }
  });
}

// React component render tracking
export function useRenderTracking(componentName: string) {
  if (typeof window === 'undefined') return;

  const start = performance.now();

  return () => {
    const duration = performance.now() - start;
    performanceMonitor.track(`component.render.${componentName}`, duration);
  };
}

// Example usage in React component:
// const trackRender = useRenderTracking('MyComponent');
// useEffect(() => {
//   trackRender();
// }, []);

// Bundle size tracking
export function trackBundleSize() {
  if (typeof window === 'undefined') return;

  // Track script sizes
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  scripts.forEach((script) => {
    const src = (script as HTMLScriptElement).src;
    if (src.includes('_next')) {
      // Estimate size from transfer-size if available
      if ('performance' in window && 'getEntriesByName' in window.performance) {
        const entries = window.performance.getEntriesByName(src);
        if (entries.length > 0) {
          const entry = entries[0] as any;
          const size = entry.transferSize || entry.encodedBodySize || 0;
          performanceMonitor.track('bundle.script_size', size, {
            script: src.split('/').pop(),
          });
        }
      }
    }
  });

  // Track stylesheet sizes
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  stylesheets.forEach((link) => {
    const href = (link as HTMLLinkElement).href;
    if (href.includes('_next')) {
      if ('performance' in window && 'getEntriesByName' in window.performance) {
        const entries = window.performance.getEntriesByName(href);
        if (entries.length > 0) {
          const entry = entries[0] as any;
          const size = entry.transferSize || entry.encodedBodySize || 0;
          performanceMonitor.track('bundle.css_size', size, {
            stylesheet: href.split('/').pop(),
          });
        }
      }
    }
  });
}

// Database query performance (for API routes)
export async function trackDatabaseQuery<T>(
  query: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    performanceMonitor.track('database.query', duration, {
      query: query.substring(0, 100), // First 100 chars
      status: 'success',
    });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.track('database.query', duration, {
      query: query.substring(0, 100),
      status: 'error',
    });
    throw error;
  }
}

// Blockchain RPC call performance
export async function trackRPCCall<T>(
  method: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    performanceMonitor.track('blockchain.rpc', duration, {
      method,
      status: 'success',
    });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.track('blockchain.rpc', duration, {
      method,
      status: 'error',
    });
    throw error;
  }
}

// Get performance summary
export function getPerformanceSummary() {
  return {
    api: {
      average: performanceMonitor.getAverage('api'),
      p95: performanceMonitor.getP95('api'),
    },
    database: {
      average: performanceMonitor.getAverage('database.query'),
      p95: performanceMonitor.getP95('database.query'),
    },
    blockchain: {
      average: performanceMonitor.getAverage('blockchain.rpc'),
      p95: performanceMonitor.getP95('blockchain.rpc'),
    },
    pageLoad: {
      average: performanceMonitor.getAverage('page.load_time'),
      p95: performanceMonitor.getP95('page.load_time'),
    },
    webVitals: {
      lcp: performanceMonitor.getAverage('web_vitals.lcp'),
      fid: performanceMonitor.getAverage('web_vitals.fid'),
      cls: performanceMonitor.getAverage('web_vitals.cls'),
      ttfb: performanceMonitor.getAverage('web_vitals.ttfb'),
    },
  };
}
