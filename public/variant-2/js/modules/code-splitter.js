/**
 * Code Splitting Module
 * Dynamic imports for better performance
 * Only load what's needed on each page
 */

class CodeSplitter {
  constructor() {
    this.loadedModules = new Set();
    this.moduleCache = new Map();
  }

  /**
   * Load Chart.js only when needed
   */
  async loadCharts() {
    if (this.loadedModules.has('charts')) {
      return this.moduleCache.get('charts');
    }

    try {
      const Chart = await import('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js');
      this.loadedModules.add('charts');
      this.moduleCache.set('charts', Chart);
      return Chart;
    } catch (error) {
      console.error('Failed to load Chart.js:', error);
      throw error;
    }
  }

  /**
   * Load wallet connection libraries
   */
  async loadWalletConnector() {
    if (this.loadedModules.has('wallet')) {
      return this.moduleCache.get('wallet');
    }

    try {
      const [ethers, web3Modal] = await Promise.all([
        import('https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js'),
        import('https://cdn.jsdelivr.net/npm/web3modal@1.9.12/dist/index.js')
      ]);

      const wallet = { ethers, web3Modal };
      this.loadedModules.add('wallet');
      this.moduleCache.set('wallet', wallet);
      return wallet;
    } catch (error) {
      console.error('Failed to load wallet libraries:', error);
      throw error;
    }
  }

  /**
   * Load analytics modules
   */
  async loadAnalytics() {
    if (this.loadedModules.has('analytics')) {
      return this.moduleCache.get('analytics');
    }

    try {
      const analytics = await import('./analytics-bundle.js');
      this.loadedModules.add('analytics');
      this.moduleCache.set('analytics', analytics);
      return analytics;
    } catch (error) {
      console.error('Failed to load analytics:', error);
      throw error;
    }
  }

  /**
   * Load trading interface
   */
  async loadTrading() {
    if (this.loadedModules.has('trading')) {
      return this.moduleCache.get('trading');
    }

    try {
      const trading = await import('./trading-bundle.js');
      this.loadedModules.add('trading');
      this.moduleCache.set('trading', trading);
      return trading;
    } catch (error) {
      console.error('Failed to load trading module:', error);
      throw error;
    }
  }

  /**
   * Preload module based on user interaction
   */
  preload(moduleName) {
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'modulepreload';

    const moduleMap = {
      charts: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
      wallet: 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js',
      analytics: './js/modules/analytics-bundle.js',
      trading: './js/modules/trading-bundle.js'
    };

    if (moduleMap[moduleName]) {
      preloadLink.href = moduleMap[moduleName];
      document.head.appendChild(preloadLink);
    }
  }

  /**
   * Smart module loading based on route
   */
  async loadForRoute(route) {
    const routeModules = {
      '/': [],
      '/trade.html': ['charts', 'wallet', 'trading'],
      '/analytics.html': ['charts', 'analytics'],
      '/stake.html': ['wallet'],
      '/pools.html': ['wallet', 'charts']
    };

    const modules = routeModules[route] || [];
    const promises = modules.map(module => {
      switch (module) {
        case 'charts': return this.loadCharts();
        case 'wallet': return this.loadWalletConnector();
        case 'analytics': return this.loadAnalytics();
        case 'trading': return this.loadTrading();
        default: return Promise.resolve();
      }
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to load route modules:', error);
    }
  }

  /**
   * Prefetch modules on link hover
   */
  enablePrefetch() {
    const links = document.querySelectorAll('a[href$=".html"]');

    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const href = link.getAttribute('href');
        if (href.includes('trade') || href.includes('analytics')) {
          this.preload('charts');
        }
        if (href.includes('trade') || href.includes('stake') || href.includes('pools')) {
          this.preload('wallet');
        }
      }, { once: true, passive: true });
    });
  }
}

// Create global instance
window.codeSplitter = new CodeSplitter();

// Auto-detect current page and load appropriate modules
(function() {
  const currentPath = window.location.pathname;
  const route = currentPath.endsWith('/') ? '/' : currentPath.split('/').pop();

  // Load modules for current route
  window.codeSplitter.loadForRoute('/' + route);

  // Enable prefetch on hover
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.codeSplitter.enablePrefetch();
    });
  } else {
    window.codeSplitter.enablePrefetch();
  }
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CodeSplitter;
}
