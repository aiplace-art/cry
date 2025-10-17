/* ===================================
   HypeAI Dashboard - Core Application
   Countdown, Real-time Updates, Animations
   =================================== */

// Configuration
const CONFIG = {
    countdownTarget: new Date('2025-10-18T13:40:00+03:00'), // Tomorrow 13:40 MSK
    updateInterval: 5000, // 5 seconds
    activityFeedLimit: 10,
    animationDuration: 300,
};

// State
const state = {
    agents: [
        { id: 'content-creator', name: 'Content Creator', status: 'active', progress: 75, generated: 23 },
        { id: 'engagement-bot', name: 'Engagement Bot', status: 'idle', progress: 0, interactions: 0 },
        { id: 'analytics', name: 'Analytics Tracker', status: 'active', progress: 100, reports: 12 },
        { id: 'scheduler', name: 'Scheduler', status: 'active', progress: 45, scheduled: 55 },
        { id: 'marketing', name: 'Marketing AI', status: 'active', progress: 68, campaigns: 3 },
        { id: 'moderator', name: 'Content Moderator', status: 'active', progress: 90, reviewed: 23 },
    ],
    activities: [],
    stats: {
        followers: 101,
        tweets: 55,
        engagement: 4.2,
        following: 1510,
    },
};

// Countdown Timer
function updateCountdown() {
    const now = new Date();
    const diff = CONFIG.countdownTarget - now;

    if (diff <= 0) {
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// Update Agent Status
function updateAgentStatus() {
    state.agents.forEach(agent => {
        const card = document.querySelector(`[data-agent="${agent.id}"]`);
        if (!card) return;

        // Simulate activity changes
        if (agent.status === 'active') {
            // Random progress changes
            const progressChange = Math.random() * 10 - 5;
            agent.progress = Math.max(0, Math.min(100, agent.progress + progressChange));

            const progressBar = card.querySelector('.progress-fill');
            if (progressBar) {
                progressBar.style.width = `${agent.progress}%`;
            }

            // Update generated count
            if (agent.generated !== undefined && Math.random() > 0.7) {
                agent.generated += 1;
                const statValue = card.querySelector('.stat-value-small');
                if (statValue) {
                    animateValue(statValue, agent.generated - 1, agent.generated, 500);
                }
            }
        }
    });
}

// Animate Number Values
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            element.textContent = Math.round(end);
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

// Add Activity to Feed
function addActivity(type, text) {
    const activityFeed = document.querySelector('.activity-feed');
    if (!activityFeed) return;

    const icons = {
        success: { icon: '✓', gradient: 'gradient-green' },
        info: { icon: 'ℹ', gradient: 'gradient-blue' },
        warning: { icon: '⚠', gradient: 'gradient-orange' },
        error: { icon: '✗', gradient: 'gradient-pink' },
    };

    const { icon, gradient } = icons[type] || icons.info;

    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.setAttribute('data-type', type);
    activityItem.innerHTML = `
        <div class="activity-icon ${gradient}">${icon}</div>
        <div class="activity-content">
            <p class="activity-text">${text}</p>
            <span class="activity-time">Just now</span>
        </div>
    `;

    // Add to beginning
    activityFeed.insertBefore(activityItem, activityFeed.firstChild);

    // Limit feed items
    const items = activityFeed.querySelectorAll('.activity-item');
    if (items.length > CONFIG.activityFeedLimit) {
        items[items.length - 1].remove();
    }

    // Update timestamps
    updateActivityTimestamps();
}

// Update Activity Timestamps
function updateActivityTimestamps() {
    const activities = document.querySelectorAll('.activity-item');
    activities.forEach((item, index) => {
        const timeElement = item.querySelector('.activity-time');
        if (!timeElement) return;

        const minutes = index * 3 + 2;
        timeElement.textContent = minutes < 60
            ? `${minutes} minutes ago`
            : `${Math.floor(minutes / 60)} hours ago`;
    });
}

// Simulate Real-time Updates
function simulateRealtimeUpdates() {
    const updates = [
        { type: 'success', text: 'Content Creator generated 5 new tweets' },
        { type: 'info', text: 'Analytics Tracker: Engagement rate increased to 4.2%' },
        { type: 'success', text: 'Marketing AI: Campaign reached 500 impressions' },
        { type: 'info', text: 'Scheduler optimized posting times for next 24h' },
        { type: 'warning', text: 'API rate limit approaching - 75% used' },
        { type: 'success', text: 'Content Moderator approved 5 tweets' },
        { type: 'info', text: 'New follower acquired - Total: 101' },
    ];

    // Add random update
    if (Math.random() > 0.5) {
        const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
        addActivity(randomUpdate.type, randomUpdate.text);
    }

    // Update stats randomly
    if (Math.random() > 0.8) {
        state.stats.followers += Math.floor(Math.random() * 3);
        state.stats.engagement = (state.stats.engagement + (Math.random() * 0.4 - 0.2)).toFixed(1);
    }
}

// Update Last Update Timestamp
function updateLastUpdateTime() {
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (!lastUpdateElement) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    lastUpdateElement.textContent = timeString;
}

// Pulse Effect for Active Cards
function addPulseEffects() {
    const activeCards = document.querySelectorAll('[data-agent]');
    activeCards.forEach(card => {
        const status = card.querySelector('.agent-status');
        if (status && status.classList.contains('status-active')) {
            // Add subtle glow animation
            card.style.animation = 'subtleGlow 3s ease-in-out infinite';
        }
    });
}

// Initialize Dashboard
function init() {
    console.log('🚀 HypeAI Dashboard initializing...');

    // Start countdown
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Start real-time updates
    setInterval(() => {
        updateAgentStatus();
        simulateRealtimeUpdates();
        updateLastUpdateTime();
    }, CONFIG.updateInterval);

    // Initial activities
    addActivity('success', 'Content Creator generated 5 new tweets');
    addActivity('info', 'Analytics Tracker: Engagement rate increased to 4.2%');
    addActivity('warning', 'API rate limit approaching - 75% used');
    addActivity('success', 'Marketing AI: New campaign reached 500 impressions');
    addActivity('info', 'Scheduler optimized posting times for next 24h');

    // Add pulse effects
    addPulseEffects();

    // Update timestamps
    updateActivityTimestamps();
    setInterval(updateActivityTimestamps, 60000); // Update every minute

    console.log('✅ HypeAI Dashboard ready!');
}

// Add CSS for subtle glow animation
const style = document.createElement('style');
style.textContent = `
    @keyframes subtleGlow {
        0%, 100% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
        }
        50% {
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.4);
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for use in other modules
window.HypeAIDashboard = {
    addActivity,
    updateAgentStatus,
    state,
};
