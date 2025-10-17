/* ===================================
   HypeAI Dashboard - Twitter Integration v2
   Production-ready with error handling, retry logic, and loading states
   =================================== */

const TWITTER_CONFIG = {
    updateInterval: 30000, // 30 seconds
    maxUpdateInterval: 300000, // 5 minutes
    cacheMaxAge: 300000, // 5 minutes
};

let twitterData = {
    followers: 101,
    following: 1510,
    tweets: 0,
    engagement: 0,
    rateLimitReset: null,
    apiBlocked: true,
};

let twitterService = null;
let updateInterval = null;
let isActive = true;
let isVisible = !document.hidden;

// Initialize Twitter service
function initTwitterService() {
    if (!window.TwitterDataService) {
        console.error('❌ TwitterDataService not loaded');
        return null;
    }

    const service = new window.TwitterDataService();

    // Subscribe to events
    service.subscribe((event, data) => {
        console.log(`📡 Twitter event: ${event}`, data);

        if (event === 'data:loaded') {
            updateDashboardWithData(data);
        } else if (event.includes('error')) {
            handleDataError(event, data);
        }
    });

    return service;
}

// Load Twitter data with error handling
async function loadTwitterData(forceRefresh = false) {
    if (!twitterService) {
        console.error('❌ Twitter service not initialized');
        return;
    }

    // Show loading indicator
    if (forceRefresh) {
        window.UIHelpers?.showLoadingIndicator('.dashboard-content', 'Refreshing Twitter data...');
    }

    try {
        const result = await twitterService.loadAllData(forceRefresh);

        if (result.success || result.cached) {
            console.log('✅ Twitter data loaded:', result);
            updateDashboardWithData(result);
        }

        // Update rate limit info
        const rateLimitReset = new Date('2025-10-18T13:40:00+03:00');
        twitterData.rateLimitReset = rateLimitReset;
        twitterData.apiBlocked = new Date() < rateLimitReset;

        if (twitterData.apiBlocked) {
            window.UIHelpers?.showConnectionStatus(
                'stale',
                `API rate limited until ${rateLimitReset.toLocaleTimeString()}`
            );
        }

    } catch (error) {
        console.error('❌ Failed to load Twitter data:', error);

        window.UIHelpers?.showToast(
            'Failed to load Twitter data. Showing fallback.',
            'error'
        );

        // Use fallback data
        updateDashboardWithRealData();
    } finally {
        if (forceRefresh) {
            window.UIHelpers?.hideLoadingIndicator('.dashboard-content');
        }
    }
}

// Update dashboard with loaded data
function updateDashboardWithData(data) {
    if (!data) return;

    const { analytics, history, insights } = data;

    // Update tweets count from posting history
    if (history?.posted && Array.isArray(history.posted)) {
        twitterData.tweets = history.posted.length;
        console.log('📝 Updated tweets count:', twitterData.tweets);
    }

    // Update analytics metrics
    if (analytics) {
        // Could map website visits, conversions, etc. to dashboard metrics
        console.log('📊 Analytics data available:', analytics);
    }

    // Update marketing insights
    if (insights) {
        console.log('🎯 Marketing insights available:', insights);
    }

    // Update the dashboard UI
    updateDashboardWithRealData();
}

// Handle data loading errors
function handleDataError(event, error) {
    console.error(`❌ Data error: ${event}`, error);

    // Show user-friendly error message
    const errorMessages = {
        'analytics:error': 'Failed to load analytics data',
        'history:error': 'Failed to load posting history',
        'insights:error': 'Failed to load marketing insights'
    };

    const message = errorMessages[event] || 'Failed to load Twitter data';

    // Only show toast for non-cached errors
    if (!twitterService.getFromCache(event.split(':')[0])) {
        window.UIHelpers?.showToast(message, 'warning', 3000);
    }
}

// Update dashboard with current Twitter data
function updateDashboardWithRealData() {
    // Sanitize values before display
    const sanitize = window.TwitterValidators?.sanitizeForDisplay || (v => v);

    // Update followers
    const followersEl = document.getElementById('followersCount');
    if (followersEl) {
        followersEl.textContent = sanitize(twitterData.followers.toLocaleString());
    }

    // Update tweets count
    const tweetsEl = document.querySelector('[data-metric="tweets"]');
    if (tweetsEl) {
        tweetsEl.textContent = sanitize(twitterData.tweets.toLocaleString());
    }

    // Update engagement rate
    const engagementEl = document.getElementById('engagementRate');
    if (engagementEl) {
        engagementEl.textContent = twitterData.engagement > 0
            ? sanitize(`${twitterData.engagement.toFixed(1)}%`)
            : 'Calculating...';
    }

    // Update goal progress
    const goalProgressEl = document.getElementById('goalProgress');
    if (goalProgressEl) {
        const progress = (twitterData.followers / 10000 * 100).toFixed(1);
        goalProgressEl.textContent = sanitize(`${progress}%`);
    }

    // Update goal progress text
    const goalProgressElement = document.getElementById('goalProgress');
    if (goalProgressElement) {
        const goalCard = goalProgressElement.closest('.metric-card');
        if (goalCard) {
            const goalTextEl = goalCard.querySelector('.metric-change');
            if (goalTextEl) {
                const remaining = 10000 - twitterData.followers;
                goalTextEl.textContent = sanitize(`${remaining.toLocaleString()} to 10K`);
            }
        }
    }

    // Update growth rate
    const growthEl = document.getElementById('growthRate');
    if (growthEl && twitterData.followers > 101) {
        const growth = ((twitterData.followers - 101) / 101 * 100).toFixed(1);
        growthEl.textContent = sanitize(`+${growth}%`);
    }

    // Update last updated timestamp
    updateLastUpdatedTimestamp();

    console.log('✅ Dashboard updated with Twitter data:', twitterData);
}

// Update last updated timestamp
function updateLastUpdatedTimestamp() {
    const timestampEl = document.getElementById('lastUpdated') || createLastUpdatedElement();
    if (timestampEl) {
        const now = new Date();
        timestampEl.textContent = `Last updated: ${now.toLocaleTimeString()}`;
        timestampEl.title = now.toLocaleString();
    }
}

function createLastUpdatedElement() {
    const element = document.createElement('div');
    element.id = 'lastUpdated';
    element.className = 'last-updated';

    const header = document.querySelector('.dashboard-header .header-right');
    if (header) {
        header.appendChild(element);
    }

    return element;
}

// Adaptive polling based on user activity
function setupAdaptivePolling() {
    // Detect visibility changes
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
        adjustUpdateFrequency();
    });

    // Detect user activity
    let idleTimer;
    const resetIdle = () => {
        isActive = true;
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            isActive = false;
            adjustUpdateFrequency();
        }, 60000); // 1 minute idle threshold
    };

    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetIdle, { passive: true });
    });
}

function adjustUpdateFrequency() {
    let interval;

    if (!isVisible) {
        interval = TWITTER_CONFIG.maxUpdateInterval; // 5 minutes when not visible
    } else if (!isActive) {
        interval = TWITTER_CONFIG.updateInterval * 2; // 1 minute when idle
    } else {
        interval = TWITTER_CONFIG.updateInterval; // 30 seconds when active
    }

    console.log(`⏱️ Adjusting update interval to ${interval / 1000}s (visible: ${isVisible}, active: ${isActive})`);

    if (updateInterval) {
        clearInterval(updateInterval);
    }

    updateInterval = setInterval(() => loadTwitterData(false), interval);
}

// Setup refresh button handler
function setupRefreshButton() {
    const refreshBtn = window.UIHelpers?.createRefreshButton();

    if (refreshBtn) {
        window.addEventListener('twitter:refresh', async (e) => {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '⏳ Refreshing...';

            try {
                // Clear cache
                if (twitterService && e.detail?.force) {
                    twitterService.clearCache();
                }

                await loadTwitterData(true);

                refreshBtn.innerHTML = '✓ Updated';
                setTimeout(() => {
                    refreshBtn.innerHTML = '🔄 Refresh';
                    refreshBtn.disabled = false;
                }, 2000);
            } catch (error) {
                refreshBtn.innerHTML = '✗ Failed';
                setTimeout(() => {
                    refreshBtn.innerHTML = '🔄 Refresh';
                    refreshBtn.disabled = false;
                }, 2000);
            }
        });
    }
}

// Initialize Twitter integration
async function initTwitterIntegration() {
    console.log('🐦 Initializing Twitter integration v2...');

    // Initialize service
    twitterService = initTwitterService();

    if (!twitterService) {
        console.error('❌ Failed to initialize Twitter service');
        return;
    }

    // Setup UI components
    window.UIHelpers?.createConnectionStatusBar();
    setupRefreshButton();

    // Setup adaptive polling
    setupAdaptivePolling();

    // Initial load
    await loadTwitterData(false);

    // Start periodic updates
    adjustUpdateFrequency();

    // Log status
    if (twitterData.apiBlocked) {
        console.log('⚠️ Twitter API is rate limited');
        console.log('⏰ Reset time:', twitterData.rateLimitReset);
    }

    console.log('✅ Twitter integration v2 initialized');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTwitterIntegration);
} else {
    initTwitterIntegration();
}

// Export for debugging
window.TwitterConnect = {
    loadTwitterData,
    updateDashboardWithRealData,
    twitterData,
    twitterService,
    version: '2.0'
};
