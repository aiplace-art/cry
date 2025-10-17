/* ===================================
   Twitter Data Service
   Production-ready data fetching with error handling
   =================================== */

class TwitterDataService {
    constructor() {
        this.retryManager = new window.RetryManager({
            maxRetries: 3,
            baseDelay: 1000,
            strategy: 'exponential',
            timeout: 10000
        });

        this.loadingState = new window.LoadingStateManager();
        this.cache = new Map();
        this.subscribers = new Set();
        this.abortController = null;

        // Determine base path based on environment
        this.basePath = this.getBasePath();
        console.log('📍 Base path:', this.basePath);
    }

    getBasePath() {
        // In development, files are served from the root
        // In production, use API endpoints
        const isDevelopment = window.location.hostname === 'localhost' ||
                            window.location.hostname === '127.0.0.1' ||
                            window.location.protocol === 'file:';

        if (isDevelopment) {
            // Use relative path from dashboard location to data folder
            return '/data/project-coordination';
        } else {
            // Production API endpoints
            return '/api/twitter';
        }
    }

    getDataPath(type) {
        const paths = {
            analytics: `${this.basePath}/analytics-data.json`,
            history: `${this.basePath}/posting-history.json`,
            insights: `${this.basePath}/marketing-insights.json`
        };
        return paths[type];
    }

    async fetchWithRetry(url, validateFn, schemaType) {
        return this.retryManager.execute(async () => {
            const response = await window.fetchWithAbort(url, { timeout: 10000 });
            const data = await response.json();

            // Validate data
            if (validateFn) {
                validateFn(data, schemaType);
            }

            return data;
        });
    }

    async loadAnalytics(forceRefresh = false) {
        const cacheKey = 'analytics';

        // Check cache
        if (!forceRefresh) {
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                console.log('📦 Using cached analytics data');
                return cached;
            }
        }

        this.loadingState.setLoading(cacheKey, true, 'Loading analytics...');

        try {
            const data = await this.fetchWithRetry(
                this.getDataPath('analytics'),
                window.TwitterValidators?.validateTwitterData,
                'analytics'
            );

            this.setCache(cacheKey, data);
            this.notify('analytics:loaded', data);

            return data;
        } catch (error) {
            console.error('❌ Failed to load analytics:', error);
            this.notify('analytics:error', error);
            throw error;
        } finally {
            this.loadingState.setLoading(cacheKey, false);
        }
    }

    async loadPostingHistory(forceRefresh = false) {
        const cacheKey = 'history';

        if (!forceRefresh) {
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                console.log('📦 Using cached posting history');
                return cached;
            }
        }

        this.loadingState.setLoading(cacheKey, true, 'Loading posting history...');

        try {
            const data = await this.fetchWithRetry(
                this.getDataPath('history'),
                window.TwitterValidators?.validateTwitterData,
                'posting_history'
            );

            this.setCache(cacheKey, data);
            this.notify('history:loaded', data);

            return data;
        } catch (error) {
            console.error('❌ Failed to load posting history:', error);
            this.notify('history:error', error);
            throw error;
        } finally {
            this.loadingState.setLoading(cacheKey, false);
        }
    }

    async loadMarketingInsights(forceRefresh = false) {
        const cacheKey = 'insights';

        if (!forceRefresh) {
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                console.log('📦 Using cached marketing insights');
                return cached;
            }
        }

        this.loadingState.setLoading(cacheKey, true, 'Loading marketing insights...');

        try {
            const data = await this.fetchWithRetry(
                this.getDataPath('insights'),
                window.TwitterValidators?.validateTwitterData,
                'marketing_insights'
            );

            this.setCache(cacheKey, data);
            this.notify('insights:loaded', data);

            return data;
        } catch (error) {
            console.error('❌ Failed to load marketing insights:', error);
            this.notify('insights:error', error);
            throw error;
        } finally {
            this.loadingState.setLoading(cacheKey, false);
        }
    }

    async loadAllData(forceRefresh = false) {
        // Cancel previous request
        if (this.abortController) {
            this.abortController.abort();
        }

        window.UIHelpers?.showConnectionStatus('loading', 'Loading Twitter data...');

        try {
            // Load all data in parallel
            const results = await Promise.allSettled([
                this.loadAnalytics(forceRefresh),
                this.loadPostingHistory(forceRefresh),
                this.loadMarketingInsights(forceRefresh)
            ]);

            // Check for failures
            const failures = results.filter(r => r.status === 'rejected');

            if (failures.length === results.length) {
                // All failed
                throw new Error('Failed to load all data sources');
            } else if (failures.length > 0) {
                // Partial failure
                console.warn('⚠️ Some data sources failed to load:', failures);
                window.UIHelpers?.showToast(
                    `Loaded ${results.length - failures.length}/${results.length} data sources`,
                    'warning'
                );
            } else {
                // All succeeded
                window.UIHelpers?.showToast('Twitter data loaded successfully', 'success', 2000);
            }

            // Extract successful data
            const [analytics, history, insights] = results.map(r =>
                r.status === 'fulfilled' ? r.value : null
            );

            // Check data freshness
            if (analytics?.timestamp) {
                const freshness = window.TwitterValidators?.checkDataFreshness(analytics.timestamp);
                if (freshness && !freshness.fresh) {
                    window.UIHelpers?.showConnectionStatus('stale', freshness.warning);
                } else {
                    window.UIHelpers?.showConnectionStatus('connected', 'Live data');
                }
            }

            this.notify('data:loaded', { analytics, history, insights });

            return { analytics, history, insights, success: true };

        } catch (error) {
            console.error('❌ Critical error loading Twitter data:', error);

            window.UIHelpers?.showErrorBanner(
                'Failed to load Twitter data. Using cached data if available.',
                error
            );

            window.UIHelpers?.showConnectionStatus('disconnected', 'Error loading data');

            // Try to use cached data as fallback
            const cachedData = {
                analytics: this.getFromCache('analytics'),
                history: this.getFromCache('history'),
                insights: this.getFromCache('insights')
            };

            if (cachedData.analytics || cachedData.history || cachedData.insights) {
                console.log('📦 Using cached data as fallback');
                window.UIHelpers?.showConnectionStatus('stale', 'Using cached data');
                return { ...cachedData, success: false, cached: true };
            }

            throw error;
        }
    }

    getFromCache(key, maxAgeMs = 300000) { // 5 minutes default
        const cached = this.cache.get(key);
        if (!cached) return null;

        const age = Date.now() - cached.timestamp;
        if (age > maxAgeMs) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clearCache(key) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    notify(event, data) {
        this.subscribers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Error in subscriber callback:', error);
            }
        });
    }

    isLoading(key) {
        return this.loadingState.isLoading(key);
    }
}

// Export
window.TwitterDataService = TwitterDataService;
