/**
 * HypeAI Twitter Dashboard - Real-time Updates Module
 * Built by AI Agents for HypeAI
 *
 * Simulates real-time data updates and agent activity
 */

// Real-time update configuration
const RealtimeConfig = {
    updateInterval: 3000, // 3 seconds
    agentActivityInterval: 5000, // 5 seconds
    metricsUpdateInterval: 8000, // 8 seconds
    enabled: true
};

// Agent activities for simulation
const AgentActivities = {
    'Content Creator': [
        'Generated new tweet about AI innovation',
        'Created engaging crypto content',
        'Drafted thread about Solana ecosystem',
        'Optimized tweet for maximum engagement',
        'Generated 5 tweet variations for A/B testing'
    ],
    'Engagement Bot': [
        'Responded to 12 mentions',
        'Liked 25 relevant tweets',
        'Retweeted community content',
        'Replied to follower questions',
        'Engaged with crypto influencers'
    ],
    'Analytics Agent': [
        'Generated hourly metrics report',
        'Analyzed tweet performance',
        'Compiled engagement statistics',
        'Identified trending topics',
        'Updated growth projections'
    ],
    'Scheduler': [
        'Optimized posting schedule',
        'Queued 8 tweets for peak hours',
        'Adjusted timing based on analytics',
        'Scheduled thread for tomorrow',
        'Updated content calendar'
    ],
    'Marketing AI': [
        'Started new campaign targeting',
        'Analyzed competitor strategies',
        'Identified partnership opportunities',
        'Updated community outreach plan',
        'Generated campaign performance report'
    ],
    'Content Moderator': [
        'Approved 15 scheduled tweets',
        'Reviewed engagement responses',
        'Validated content compliance',
        'Checked brand consistency',
        'Screened community interactions'
    ]
};

// System events for activity feed
const SystemEvents = [
    { type: 'success', title: 'Performance Milestone', description: 'Engagement rate exceeded target by 15%' },
    { type: 'info', title: 'Content Queue Updated', description: 'Added 12 new tweets to schedule' },
    { type: 'success', title: 'Follower Milestone', description: 'Reached new follower count record' },
    { type: 'info', title: 'Analytics Complete', description: 'Weekly performance report generated' },
    { type: 'success', title: 'Campaign Success', description: 'Marketing campaign achieved 3.8% conversion' },
    { type: 'info', title: 'System Optimization', description: 'AI models updated with latest data' },
    { type: 'success', title: 'Engagement Peak', description: 'Record high interaction rate detected' },
    { type: 'info', title: 'Content Approved', description: 'All queued content passed moderation' }
];

// Initialize real-time updates
document.addEventListener('DOMContentLoaded', () => {
    if (RealtimeConfig.enabled) {
        startAgentActivityUpdates();
        startMetricsSimulation();
        startSystemEvents();
        console.log('✅ Real-time updates active');
    }
});

/**
 * Simulate agent activity updates
 */
function startAgentActivityUpdates() {
    setInterval(() => {
        updateRandomAgent();
    }, RealtimeConfig.agentActivityInterval);
}

function updateRandomAgent() {
    const agentCards = document.querySelectorAll('.agent-card');
    if (agentCards.length === 0) return;

    // Pick random agent
    const randomCard = agentCards[Math.floor(Math.random() * agentCards.length)];
    const agentName = randomCard.querySelector('h3').textContent;
    const activityElement = randomCard.querySelector('.agent-activity');

    if (activityElement && AgentActivities[agentName]) {
        // Get random activity
        const activities = AgentActivities[agentName];
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];

        // Update activity display
        activityElement.textContent = 'Last: Just now';

        // Flash animation
        randomCard.style.transform = 'scale(1.02)';
        randomCard.style.boxShadow = '0 20px 30px rgba(102, 126, 234, 0.3)';

        setTimeout(() => {
            randomCard.style.transform = '';
            randomCard.style.boxShadow = '';
        }, 300);

        // Add to activity feed
        if (window.addActivity) {
            window.addActivity('info', agentName, randomActivity, 'Just now');
        }

        // Update progress bar randomly
        const progressBar = randomCard.querySelector('.progress-fill');
        if (progressBar) {
            const currentWidth = parseInt(progressBar.style.width) || 50;
            const newWidth = Math.min(100, currentWidth + Math.floor(Math.random() * 5));
            progressBar.style.width = newWidth + '%';
        }
    }
}

/**
 * Simulate metrics updates
 */
function startMetricsSimulation() {
    setInterval(() => {
        simulateMetricChange();
    }, RealtimeConfig.metricsUpdateInterval);
}

function simulateMetricChange() {
    if (!window.AppState) return;

    const metrics = window.AppState.metrics;
    const changeType = Math.random();

    if (changeType > 0.7) {
        // Follower increase
        const increase = Math.floor(Math.random() * 3) + 1;
        metrics.followers += increase;
        metrics.followerGrowth += increase;
        metrics.goalProgress = (metrics.followers / 10000) * 100;

        // Update display
        document.getElementById('currentFollowers').textContent = formatNumber(metrics.followers);
        document.getElementById('followerGrowth').textContent = metrics.followerGrowth;
        document.getElementById('goalProgress').textContent = metrics.goalProgress.toFixed(1);

        // Notification
        if (window.showNotification && Math.random() > 0.6) {
            window.showNotification(`Gained ${increase} new follower${increase > 1 ? 's' : ''}!`, 'success');
        }

        // Activity feed
        if (window.addActivity) {
            window.addActivity('success', 'New Followers', `Gained ${increase} new follower${increase > 1 ? 's' : ''}`, 'Just now');
        }
    } else if (changeType > 0.4) {
        // Engagement update
        const change = (Math.random() * 0.2 - 0.1).toFixed(1);
        metrics.engagementRate = Math.max(0, parseFloat((metrics.engagementRate + parseFloat(change)).toFixed(1)));

        document.getElementById('engagementRate').textContent = metrics.engagementRate + '%';

        if (parseFloat(change) > 0 && window.addActivity) {
            window.addActivity('info', 'Engagement Increase', `Engagement rate improved by ${change}%`, 'Just now');
        }
    } else if (changeType > 0.2) {
        // Tweet posted
        metrics.tweetsPosted += 1;
        document.getElementById('tweetsPosted').textContent = metrics.tweetsPosted;
        document.getElementById('lastTweetTime').textContent = 'Just now';

        if (window.addActivity) {
            window.addActivity('success', 'Tweet Posted', 'New content published successfully', 'Just now');
        }
    }
}

/**
 * Generate random system events
 */
function startSystemEvents() {
    setInterval(() => {
        if (Math.random() > 0.6) {
            generateSystemEvent();
        }
    }, RealtimeConfig.metricsUpdateInterval * 2);
}

function generateSystemEvent() {
    const event = SystemEvents[Math.floor(Math.random() * SystemEvents.length)];

    if (window.addActivity) {
        window.addActivity(event.type, event.title, event.description, 'Just now');
    }
}

/**
 * Animate system indicators
 */
function animateSystemIndicators() {
    const indicators = document.querySelectorAll('.status-indicator.status-active');
    indicators.forEach((indicator, index) => {
        setTimeout(() => {
            indicator.style.animation = 'none';
            setTimeout(() => {
                indicator.style.animation = '';
            }, 50);
        }, index * 200);
    });
}

// Run indicator animation every 30 seconds
setInterval(animateSystemIndicators, 30000);

/**
 * Utility: Format numbers
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

/**
 * Export control functions
 */
window.RealtimeUpdates = {
    enable: () => {
        RealtimeConfig.enabled = true;
        console.log('✅ Real-time updates enabled');
    },
    disable: () => {
        RealtimeConfig.enabled = false;
        console.log('⏸️ Real-time updates paused');
    },
    triggerAgentUpdate: updateRandomAgent,
    triggerMetricChange: simulateMetricChange,
    triggerSystemEvent: generateSystemEvent
};
