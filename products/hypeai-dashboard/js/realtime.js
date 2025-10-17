/* ===================================
   HypeAI Dashboard - Real-time Data
   Live updates and agent management
   =================================== */

// Agent Data
const agents = [
    {
        id: 'content-creator',
        name: 'Content Creator',
        status: 'active',
        icon: '✍️',
        description: 'Generates engaging tweets and content',
        progress: 75,
        stats: {
            generated: 23,
            quality: 94,
            label: 'Content Generated'
        },
        gradient: 'gradient-purple'
    },
    {
        id: 'engagement-bot',
        name: 'Engagement Bot',
        status: 'rate-limited',
        icon: '💬',
        description: '24/7 community interaction',
        progress: 0,
        stats: {
            interactions: 0,
            target: 100,
            label: 'Rate Limited'
        },
        gradient: 'gradient-blue'
    },
    {
        id: 'analytics-tracker',
        name: 'Analytics Tracker',
        status: 'active',
        icon: '📊',
        description: 'Tracks metrics and generates reports',
        progress: 100,
        stats: {
            reports: 12,
            accuracy: 99,
            label: 'Reports Today'
        },
        gradient: 'gradient-green'
    },
    {
        id: 'scheduler',
        name: 'Scheduler',
        status: 'active',
        icon: '⏰',
        description: 'Optimizes posting schedule',
        progress: 45,
        stats: {
            scheduled: 55,
            optimal: 90,
            label: 'Tweets Scheduled'
        },
        gradient: 'gradient-orange'
    },
    {
        id: 'marketing-ai',
        name: 'Marketing AI',
        status: 'active',
        icon: '🎯',
        description: 'Growth hacking and campaigns',
        progress: 68,
        stats: {
            campaigns: 3,
            reach: 2500,
            label: 'Active Campaigns'
        },
        gradient: 'gradient-pink'
    },
    {
        id: 'content-moderator',
        name: 'Content Moderator',
        status: 'active',
        icon: '🛡️',
        description: 'Quality control and moderation',
        progress: 90,
        stats: {
            reviewed: 23,
            approved: 100,
            label: 'Content Reviewed'
        },
        gradient: 'gradient-cyan'
    }
];

// Render Agents
function renderAgents() {
    const agentsGrid = document.getElementById('agentsGrid');
    if (!agentsGrid) return;

    agentsGrid.innerHTML = agents.map(agent => `
        <div class="agent-card glass" data-agent="${agent.id}">
            <div class="agent-header">
                <div class="agent-icon ${agent.gradient}">${agent.icon}</div>
                <div class="agent-info">
                    <h3 class="agent-name">${agent.name}</h3>
                    <p class="agent-description">${agent.description}</p>
                </div>
                <div class="agent-status ${agent.status === 'active' ? 'status-active' : agent.status === 'rate-limited' ? 'status-warning' : 'status-idle'} pulse"></div>
            </div>
            <div class="agent-progress">
                <div class="progress-info">
                    <span class="progress-label">${agent.status === 'rate-limited' ? 'Waiting for API' : 'Progress'}</span>
                    <span class="progress-percent">${agent.progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${agent.gradient}" style="width: ${agent.progress}%"></div>
                </div>
            </div>
            <div class="agent-stats">
                <div class="stat-item">
                    <span class="stat-label">${agent.stats.label}</span>
                    <span class="stat-value-small">${Object.values(agent.stats)[0]}</span>
                </div>
                ${agent.stats.accuracy !== undefined ? `
                <div class="stat-item">
                    <span class="stat-label">Quality</span>
                    <span class="stat-value-small">${agent.stats.accuracy}%</span>
                </div>
                ` : ''}
                ${agent.stats.reach !== undefined ? `
                <div class="stat-item">
                    <span class="stat-label">Reach</span>
                    <span class="stat-value-small">${agent.stats.reach.toLocaleString()}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAgents);
} else {
    renderAgents();
}
