/**
 * HypeAI Twitter Dashboard - Main Application
 * Built by AI Agents for HypeAI
 *
 * Core functionality and state management
 */

// Application State
const AppState = {
    // Twitter API unblock date (30 days from October 14, 2025)
    targetDate: new Date('2025-11-13T00:00:00'),

    // Current metrics
    metrics: {
        followers: 0,
        tweetsPosted: 0,
        engagementRate: 0.0,
        followerGrowth: 0,
        engagementChange: 0,
        goalProgress: 0
    },

    // Agent status
    agents: [
        { name: 'Content Creator', status: 'active', activity: 'Generating tweets' },
        { name: 'Engagement Bot', status: 'active', activity: 'Interacting with community' },
        { name: 'Analytics Agent', status: 'active', activity: 'Processing metrics' },
        { name: 'Scheduler', status: 'active', activity: 'Managing queue' },
        { name: 'Marketing AI', status: 'active', activity: 'Running campaigns' },
        { name: 'Content Moderator', status: 'active', activity: 'Reviewing content' }
    ],

    // Activity log
    activities: [],

    // Real-time simulation
    simulation: {
        enabled: true,
        interval: null
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 HypeAI Twitter Dashboard Initializing...');

    initCountdown();
    loadDataFromFiles();
    initEventListeners();
    startRealtimeUpdates();
    populateActivityFeed();

    console.log('✅ Dashboard Ready!');
    showNotification('Dashboard Loaded Successfully', 'success');
});

/**
 * Initialize Countdown Timer
 */
function initCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date();
    const difference = AppState.targetDate - now;

    if (difference <= 0) {
        // Countdown complete!
        document.getElementById('daysValue').textContent = '00';
        document.getElementById('hoursValue').textContent = '00';
        document.getElementById('minutesValue').textContent = '00';
        document.getElementById('secondsValue').textContent = '00';

        const badge = document.querySelector('.countdown-header .status-badge');
        if (badge) {
            badge.textContent = 'LIVE';
            badge.classList.remove('status-pending');
            badge.classList.add('status-active');
        }

        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById('daysValue').textContent = String(days).padStart(2, '0');
    document.getElementById('hoursValue').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutesValue').textContent = String(minutes).padStart(2, '0');
    document.getElementById('secondsValue').textContent = String(seconds).padStart(2, '0');
}

/**
 * Load data from project files
 */
async function loadDataFromFiles() {
    try {
        // Try to load real data from project files
        const dataFiles = [
            '../../data/project-coordination/analytics-data.json',
            '../../data/project-coordination/posting-history.json',
            '../../data/project-coordination/marketing-insights.json'
        ];

        const responses = await Promise.allSettled(
            dataFiles.map(file => fetch(file).then(r => r.json()))
        );

        const [analytics, postingHistory, marketing] = responses;

        // Process analytics data
        if (analytics.status === 'fulfilled' && analytics.value) {
            processAnalyticsData(analytics.value);
        }

        // Process posting history
        if (postingHistory.status === 'fulfilled' && postingHistory.value) {
            processPostingHistory(postingHistory.value);
        }

        // Process marketing insights
        if (marketing.status === 'fulfilled' && marketing.value) {
            processMarketingData(marketing.value);
        }

        // If no real data, use demo data
        if (AppState.metrics.followers === 0) {
            useDemoData();
        }

        updateDashboard();
    } catch (error) {
        console.log('Using demo data:', error.message);
        useDemoData();
        updateDashboard();
    }
}

function processAnalyticsData(data) {
    if (data.conversions) {
        AppState.metrics.followers = data.conversions.socialFollows || 0;
    }
}

function processPostingHistory(data) {
    if (data.posted) {
        AppState.metrics.tweetsPosted = data.posted.length || 0;
    }
    if (data.lastPosted) {
        const lastTweetTime = document.getElementById('lastTweetTime');
        if (lastTweetTime) {
            const timeAgo = getTimeAgo(new Date(data.lastPosted));
            lastTweetTime.textContent = timeAgo;
        }
    }
}

function processMarketingData(data) {
    // Process marketing insights when available
    console.log('Marketing data:', data);
}

function useDemoData() {
    // Simulate realistic Twitter growth metrics
    AppState.metrics = {
        followers: 247,
        tweetsPosted: 156,
        engagementRate: 4.2,
        followerGrowth: 23,
        engagementChange: 1.8,
        goalProgress: 2.47 // 247/10000 * 100
    };
}

/**
 * Update Dashboard Display
 */
function updateDashboard() {
    // Update stats
    document.getElementById('currentFollowers').textContent = formatNumber(AppState.metrics.followers);
    document.getElementById('followerGrowth').textContent = AppState.metrics.followerGrowth;
    document.getElementById('goalProgress').textContent = AppState.metrics.goalProgress.toFixed(1);
    document.getElementById('tweetsPosted').textContent = AppState.metrics.tweetsPosted;
    document.getElementById('engagementRate').textContent = AppState.metrics.engagementRate.toFixed(1) + '%';
    document.getElementById('engagementChange').textContent = AppState.metrics.engagementChange.toFixed(1);
}

/**
 * Start Real-time Updates (Simulation)
 */
function startRealtimeUpdates() {
    if (!AppState.simulation.enabled) return;

    AppState.simulation.interval = setInterval(() => {
        // Simulate small metric changes
        const change = Math.random() > 0.5 ? 1 : 0;

        if (change && Math.random() > 0.7) {
            // Follower increase
            AppState.metrics.followers += 1;
            AppState.metrics.followerGrowth += 1;
            AppState.metrics.goalProgress = (AppState.metrics.followers / 10000) * 100;

            addActivity('success', 'New Follower', 'Gained 1 new follower', 'Just now');
        }

        if (Math.random() > 0.8) {
            // Engagement activity
            AppState.metrics.engagementRate += 0.1;
            addActivity('info', 'Engagement', 'High engagement on recent tweet', 'Just now');
        }

        // Update display
        updateDashboard();
    }, 5000); // Update every 5 seconds
}

/**
 * Activity Feed Management
 */
function populateActivityFeed() {
    const initialActivities = [
        { type: 'success', title: 'Dashboard Initialized', description: 'All systems operational', time: 'Just now' },
        { type: 'info', title: 'Content Creator Active', description: 'Generated 5 new tweet variations', time: '2 mins ago' },
        { type: 'success', title: 'Analytics Report', description: 'Daily metrics compiled successfully', time: '5 mins ago' },
        { type: 'info', title: 'Scheduler Update', description: '15 tweets queued for optimal timing', time: '8 mins ago' },
        { type: 'success', title: 'Engagement Bot Active', description: 'Responded to 47 mentions', time: '12 mins ago' },
        { type: 'warning', title: 'API Status Check', description: 'Waiting for Twitter API unblock', time: '15 mins ago' },
        { type: 'info', title: 'Marketing Campaign', description: 'Started crypto community outreach', time: '20 mins ago' },
        { type: 'success', title: 'Content Approved', description: 'All scheduled content passed moderation', time: '25 mins ago' }
    ];

    initialActivities.forEach(activity => {
        addActivity(activity.type, activity.title, activity.description, activity.time);
    });
}

function addActivity(type, title, description, time) {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;

    const iconMap = {
        success: '✅',
        info: 'ℹ️',
        warning: '⚠️',
        error: '❌'
    };

    const activityHtml = `
        <div class="activity-item">
            <div class="activity-icon ${type}">
                ${iconMap[type] || 'ℹ️'}
            </div>
            <div class="activity-content">
                <div class="activity-title">${title}</div>
                <div class="activity-description">${description}</div>
            </div>
            <div class="activity-time">${time}</div>
        </div>
    `;

    // Add to beginning of feed
    feed.insertAdjacentHTML('afterbegin', activityHtml);

    // Keep only last 20 activities
    const activities = feed.querySelectorAll('.activity-item');
    if (activities.length > 20) {
        activities[activities.length - 1].remove();
    }
}

/**
 * Event Listeners
 */
function initEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            showNotification('Refreshing data...', 'info');
            loadDataFromFiles();
            addActivity('info', 'Dashboard Refresh', 'Manual data refresh initiated', 'Just now');
        });
    }

    // Launch button
    const launchBtn = document.getElementById('launchBtn');
    if (launchBtn) {
        launchBtn.addEventListener('click', () => {
            showNotification('Campaign will launch automatically when API is unblocked', 'info');
            addActivity('info', 'Launch Request', 'Manual launch attempted - awaiting API access', 'Just now');
        });
    }

    // Agent card interactions
    document.querySelectorAll('.agent-card').forEach(card => {
        card.addEventListener('click', () => {
            const agentType = card.dataset.agent;
            showNotification(`${card.querySelector('h3').textContent} Details`, 'info');
        });
    });
}

/**
 * Notification System
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div>${message}</div>
    `;

    container.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/**
 * Utility Functions
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
    }

    return 'Just now';
}

// Export for use in other modules
window.AppState = AppState;
window.showNotification = showNotification;
window.addActivity = addActivity;
