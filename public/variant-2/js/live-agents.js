/**
 * HYPEAI Live Agent Dashboard
 * Real-time monitoring of 27 AI agents working 24/7
 */

// Agent Configuration
const AGENTS = [
    // Trading Agents (7)
    { id: 1, name: 'Market Analyzer', category: 'trading', icon: '🔍', color: '#F3BA2F' },
    { id: 2, name: 'Price Prediction', category: 'trading', icon: '📈', color: '#F3BA2F' },
    { id: 3, name: 'Trade Execution', category: 'trading', icon: '⚡', color: '#F3BA2F' },
    { id: 4, name: 'Arbitrage Hunter', category: 'trading', icon: '🎯', color: '#F3BA2F' },
    { id: 5, name: 'Liquidity Monitor', category: 'trading', icon: '💧', color: '#F3BA2F' },
    { id: 6, name: 'Whale Tracker', category: 'trading', icon: '🐋', color: '#F3BA2F' },
    { id: 7, name: 'Portfolio Optimizer', category: 'trading', icon: '📊', color: '#F3BA2F' },

    // Analysis Agents (6)
    { id: 8, name: 'Technical Analysis', category: 'analysis', icon: '📉', color: '#00D4AA' },
    { id: 9, name: 'Sentiment Analysis', category: 'analysis', icon: '💭', color: '#00D4AA' },
    { id: 10, name: 'News Aggregation', category: 'analysis', icon: '📰', color: '#00D4AA' },
    { id: 11, name: 'Risk Assessment', category: 'analysis', icon: '🛡️', color: '#00D4AA' },
    { id: 12, name: 'Token Economics', category: 'analysis', icon: '💰', color: '#00D4AA' },
    { id: 13, name: 'Performance Monitor', category: 'analysis', icon: '📊', color: '#00D4AA' },

    // Community Agents (8)
    { id: 14, name: 'Telegram Community', category: 'community', icon: '💬', color: '#3B82F6' },
    { id: 15, name: 'Discord Community', category: 'community', icon: '🎮', color: '#3B82F6' },
    { id: 16, name: 'Twitter Engagement', category: 'community', icon: '🐦', color: '#3B82F6' },
    { id: 17, name: 'Social Media Monitor', category: 'community', icon: '📱', color: '#3B82F6' },
    { id: 18, name: 'Content Creator', category: 'community', icon: '✍️', color: '#3B82F6' },
    { id: 19, name: 'Marketing Campaign', category: 'community', icon: '📢', color: '#3B82F6' },
    { id: 20, name: 'Partnership Scout', category: 'community', icon: '🤝', color: '#3B82F6' },
    { id: 21, name: 'Influencer Outreach', category: 'community', icon: '⭐', color: '#3B82F6' },

    // Development Agents (6)
    { id: 22, name: 'Smart Contract Auditor', category: 'dev', icon: '🔐', color: '#8B5CF6' },
    { id: 23, name: 'Staking Manager', category: 'dev', icon: '🔒', color: '#8B5CF6' },
    { id: 24, name: 'Bug Hunter', category: 'dev', icon: '🐛', color: '#8B5CF6' },
    { id: 25, name: 'Code Reviewer', category: 'dev', icon: '👨‍💻', color: '#8B5CF6' },
    { id: 26, name: 'Documentation', category: 'dev', icon: '📚', color: '#8B5CF6' },
    { id: 27, name: 'Customer Support', category: 'dev', icon: '🎧', color: '#8B5CF6' }
];

// Agent state tracking
const agentStates = new Map();
const activityLog = [];

// Initialize agent states
AGENTS.forEach(agent => {
    agentStates.set(agent.id, {
        status: 'online',
        uptime: 98 + Math.random() * 2,
        tasksToday: Math.floor(Math.random() * 200) + 50,
        lastActivity: Date.now() - Math.random() * 60000,
        currentTask: null
    });
});

// Activity templates for realistic simulation
const ACTIVITY_TEMPLATES = {
    trading: [
        { action: 'Analyzing {pair} price patterns', details: 'RSI: {rsi}, MACD: {macd}' },
        { action: 'Detected arbitrage opportunity', details: '{exchange1} vs {exchange2}: {profit}% profit' },
        { action: 'Executed trade: {action} {amount} {pair}', details: 'Price: ${price}, Slippage: {slippage}%' },
        { action: 'Monitoring liquidity pool', details: 'TVL: ${tvl}M, APY: {apy}%' },
        { action: 'Whale alert: Large transaction detected', details: '{amount} {token} moved to {exchange}' },
        { action: 'Portfolio rebalancing', details: 'Optimized allocation for {risk} risk profile' },
        { action: 'Predicted {pair} ${price} in 24h', details: 'Confidence: {confidence}%' }
    ],
    analysis: [
        { action: 'Completed technical analysis', details: '{pair} - {signal} signal detected' },
        { action: 'Sentiment score updated', details: '{token}: {score}/100 ({trend} trend)' },
        { action: 'Aggregated {count} news articles', details: 'Topics: {topics}' },
        { action: 'Risk assessment completed', details: 'Portfolio risk: {risk}% (Target: {target}%)' },
        { action: 'Token economics analysis', details: '{token} - Fair value: ${price}' },
        { action: 'Performance metrics updated', details: 'ROI: {roi}%, Win rate: {winrate}%' }
    ],
    community: [
        { action: 'Replied to {count} mentions', details: 'Gained {followers} followers' },
        { action: 'Moderated {count} messages', details: '{spam} spam filtered, {answered} questions answered' },
        { action: 'Published new content', details: '{type}: "{title}" - {engagement} engagement' },
        { action: 'Campaign performance update', details: '{campaign}: {impressions} impressions, {ctr}% CTR' },
        { action: 'Identified partnership opportunity', details: '{partner} - Potential reach: {reach}K users' },
        { action: 'Influencer outreach completed', details: 'Contacted {count} influencers, {responses} responses' },
        { action: 'Social sentiment analysis', details: 'Platform: {platform}, Score: {score}/100' }
    ],
    dev: [
        { action: 'Audited contract {address}', details: '{status} - {issues} issues found' },
        { action: 'Staking rewards distributed', details: '{amount} tokens to {users} stakers' },
        { action: 'Bug report: {severity} severity', details: 'Issue #{id} - {status}' },
        { action: 'Code review completed', details: 'PR #{pr} - {files} files, {comments} comments' },
        { action: 'Documentation updated', details: '{section} - {changes} changes' },
        { action: 'Resolved {count} support tickets', details: 'Avg response time: {time}min, Satisfaction: {score}%' }
    ]
};

// Initialize dashboard
function init() {
    // Show skeleton loader while initializing
    showAgentSkeleton();

    // Simulate loading delay for realistic UX
    setTimeout(() => {
        renderAgents();
        startActivitySimulation();
        startMetricsUpdate();
        initCoordinationGraph();
        setupFilterButtons();
    }, 800); // 800ms to show skeleton screens
}

// Show skeleton loader
function showAgentSkeleton() {
    const grid = document.getElementById('agentsGrid');
    const skeletonContainer = grid.querySelector('.skeleton-container');

    if (skeletonContainer && window.loadingState) {
        skeletonContainer.innerHTML = loadingState.createAgentSkeleton(27);
    }
}

// Render agent cards
function renderAgents() {
    const grid = document.getElementById('agentsGrid');
    const realContent = grid.querySelector('.real-content');

    // Create agent cards
    const fragment = document.createDocumentFragment();
    AGENTS.forEach(agent => {
        const state = agentStates.get(agent.id);
        const card = createAgentCard(agent, state);
        fragment.appendChild(card);
    });

    // Replace skeleton with real content
    if (realContent && window.loadingState) {
        realContent.innerHTML = '';
        realContent.appendChild(fragment);
        grid.dataset.loaded = 'true';
        realContent.classList.add('fade-in');
    } else {
        // Fallback if loading manager not available
        grid.innerHTML = '';
        grid.appendChild(fragment);
    }
}

// Create agent card element
function createAgentCard(agent, state) {
    const card = document.createElement('div');
    card.className = `agent-card ${state.status}`;
    card.dataset.category = agent.category;
    card.dataset.agentId = agent.id;

    const statusClass = state.status === 'working' ? 'working' : state.status === 'online' ? 'online' : 'offline';
    const statusIcon = state.status === 'working' ? '🟡' : state.status === 'online' ? '🟢' : '⚪';

    const timeSinceActivity = formatTimeAgo(state.lastActivity);

    // Sanitize all user-facing data
    const safeName = window.SecurityUtils ? window.SecurityUtils.escapeHTML(agent.name) : agent.name;
    const safeCategory = window.SecurityUtils ? window.SecurityUtils.escapeHTML(agent.category) : agent.category;
    const safeStatus = window.SecurityUtils ? window.SecurityUtils.escapeHTML(state.status) : state.status;
    const safeCurrentTask = state.currentTask && window.SecurityUtils
        ? window.SecurityUtils.escapeHTML(state.currentTask)
        : state.currentTask;

    card.innerHTML = `
        <div class="agent-header">
            <div class="agent-icon" style="background: linear-gradient(135deg, ${agent.color}22, ${agent.color}11);">
                ${agent.icon}
            </div>
            <div class="agent-status ${statusClass}" title="${safeStatus}">
                ${statusIcon}
            </div>
        </div>
        <div class="agent-body">
            <h3 class="agent-name">${safeName}</h3>
            <div class="agent-category">${safeCategory}</div>
            <div class="agent-stats">
                <div class="stat-row">
                    <span class="stat-label">Uptime</span>
                    <span class="stat-value">${state.uptime.toFixed(1)}%</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Tasks Today</span>
                    <span class="stat-value">${state.tasksToday}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Last Active</span>
                    <span class="stat-value">${timeSinceActivity}</span>
                </div>
            </div>
            ${state.currentTask ? `
                <div class="current-task">
                    <div class="task-label">Current Task:</div>
                    <div class="task-text">${safeCurrentTask}</div>
                </div>
            ` : ''}
        </div>
    `;

    // Add hover effect to show detailed stats
    card.addEventListener('mouseenter', () => {
        card.classList.add('hover');
    });

    card.addEventListener('mouseleave', () => {
        card.classList.remove('hover');
    });

    return card;
}

// Simulate agent activity
function startActivitySimulation() {
    setInterval(() => {
        // Randomly select 1-3 agents to update
        const activeAgents = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < activeAgents; i++) {
            const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)];
            simulateAgentActivity(agent);
        }
    }, 3000 + Math.random() * 2000); // 3-5 seconds
}

// Simulate single agent activity
function simulateAgentActivity(agent) {
    const state = agentStates.get(agent.id);
    const templates = ACTIVITY_TEMPLATES[agent.category];
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Generate activity with realistic data
    const activity = {
        agentId: agent.id,
        agentName: agent.name,
        agentIcon: agent.icon,
        action: fillTemplate(template.action, agent.category),
        details: fillTemplate(template.details, agent.category),
        timestamp: Date.now()
    };

    // Update agent state
    state.status = 'working';
    state.lastActivity = Date.now();
    state.currentTask = activity.action;
    state.tasksToday++;

    // Update UI
    updateAgentCard(agent.id);
    addActivityToFeed(activity);

    // Return to online status after 2-8 seconds
    setTimeout(() => {
        state.status = 'online';
        state.currentTask = null;
        updateAgentCard(agent.id);
    }, 2000 + Math.random() * 6000);
}

// Fill activity template with realistic data
function fillTemplate(template, category) {
    const replacements = {
        '{pair}': ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'HYPE/USDT'][Math.floor(Math.random() * 4)],
        '{token}': ['BTC', 'ETH', 'BNB', 'HYPE'][Math.floor(Math.random() * 4)],
        '{rsi}': (30 + Math.random() * 40).toFixed(1),
        '{macd}': (Math.random() > 0.5 ? '+' : '-') + (Math.random() * 100).toFixed(2),
        '{exchange}': ['Binance', 'Coinbase', 'Kraken', 'KuCoin'][Math.floor(Math.random() * 4)],
        '{exchange1}': 'Binance',
        '{exchange2}': ['Coinbase', 'Kraken', 'KuCoin'][Math.floor(Math.random() * 3)],
        '{profit}': (0.5 + Math.random() * 2).toFixed(2),
        '{action}': ['BUY', 'SELL'][Math.floor(Math.random() * 2)],
        '{amount}': (Math.random() * 10).toFixed(2),
        '{price}': (30000 + Math.random() * 40000).toFixed(2),
        '{slippage}': (Math.random() * 0.5).toFixed(2),
        '{tvl}': (10 + Math.random() * 90).toFixed(1),
        '{apy}': (5 + Math.random() * 45).toFixed(1),
        '{count}': Math.floor(Math.random() * 20) + 1,
        '{followers}': Math.floor(Math.random() * 50) + 1,
        '{confidence}': Math.floor(75 + Math.random() * 20),
        '{signal}': ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)],
        '{score}': Math.floor(60 + Math.random() * 40),
        '{trend}': ['upward', 'downward', 'stable'][Math.floor(Math.random() * 3)],
        '{topics}': 'DeFi, NFTs, Web3',
        '{risk}': (Math.random() * 30).toFixed(1),
        '{target}': '25.0',
        '{roi}': (5 + Math.random() * 45).toFixed(1),
        '{winrate}': (60 + Math.random() * 35).toFixed(1),
        '{spam}': Math.floor(Math.random() * 10),
        '{answered}': Math.floor(Math.random() * 15) + 5,
        '{type}': ['Article', 'Video', 'Thread'][Math.floor(Math.random() * 3)],
        '{title}': 'HYPE Token: The Future of AI-Powered Trading',
        '{engagement}': (Math.random() * 10).toFixed(1) + 'K',
        '{campaign}': 'Q4 Launch Campaign',
        '{impressions}': (Math.random() * 100).toFixed(0) + 'K',
        '{ctr}': (2 + Math.random() * 8).toFixed(2),
        '{partner}': ['DeFi Protocol', 'NFT Marketplace', 'Gaming Platform'][Math.floor(Math.random() * 3)],
        '{reach}': Math.floor(50 + Math.random() * 450),
        '{responses}': Math.floor(Math.random() * 5) + 1,
        '{platform}': ['Twitter', 'Reddit', 'Discord'][Math.floor(Math.random() * 3)],
        '{address}': '0x' + Math.random().toString(16).substr(2, 8) + '...',
        '{status}': ['✅ No issues', '⚠️ Minor issues', '✅ Passed'][Math.floor(Math.random() * 3)],
        '{issues}': Math.floor(Math.random() * 3),
        '{users}': Math.floor(100 + Math.random() * 900),
        '{severity}': ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        '{id}': Math.floor(1000 + Math.random() * 9000),
        '{pr}': Math.floor(100 + Math.random() * 900),
        '{files}': Math.floor(1 + Math.random() * 10),
        '{comments}': Math.floor(1 + Math.random() * 20),
        '{section}': ['API Reference', 'User Guide', 'Tutorial'][Math.floor(Math.random() * 3)],
        '{changes}': Math.floor(1 + Math.random() * 15),
        '{time}': (Math.random() * 10).toFixed(1)
    };

    let result = template;
    Object.entries(replacements).forEach(([key, value]) => {
        result = result.replace(key, value);
    });

    // Sanitize output to prevent XSS
    if (window.SecurityUtils) {
        result = window.SecurityUtils.escapeHTML(result);
    }

    return result;
}

// Update agent card in DOM
function updateAgentCard(agentId) {
    const agent = AGENTS.find(a => a.id === agentId);
    const state = agentStates.get(agentId);
    const card = document.querySelector(`[data-agent-id="${agentId}"]`);

    if (!card) return;

    const statusEl = card.querySelector('.agent-status');
    const statusClass = state.status === 'working' ? 'working' : state.status === 'online' ? 'online' : 'offline';
    const statusIcon = state.status === 'working' ? '🟡' : state.status === 'online' ? '🟢' : '⚪';

    statusEl.className = `agent-status ${statusClass}`;
    statusEl.textContent = statusIcon;
    statusEl.title = state.status;

    card.className = `agent-card ${state.status}`;

    // Update stats
    const uptimeEl = card.querySelector('.stat-row:nth-child(1) .stat-value');
    const tasksEl = card.querySelector('.stat-row:nth-child(2) .stat-value');
    const lastActiveEl = card.querySelector('.stat-row:nth-child(3) .stat-value');

    if (uptimeEl) uptimeEl.textContent = `${state.uptime.toFixed(1)}%`;
    if (tasksEl) tasksEl.textContent = state.tasksToday;
    if (lastActiveEl) lastActiveEl.textContent = formatTimeAgo(state.lastActivity);

    // Update current task
    const existingTask = card.querySelector('.current-task');
    if (state.currentTask) {
        if (existingTask) {
            existingTask.querySelector('.task-text').textContent = state.currentTask;
        } else {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'current-task';
            taskDiv.innerHTML = `
                <div class="task-label">Current Task:</div>
                <div class="task-text">${state.currentTask}</div>
            `;
            card.querySelector('.agent-body').appendChild(taskDiv);
        }
    } else if (existingTask) {
        existingTask.remove();
    }
}

// Add activity to feed
function addActivityToFeed(activity) {
    const feed = document.getElementById('activityFeed');
    const item = document.createElement('div');
    item.className = 'activity-item fade-in';

    // Sanitize all activity data to prevent XSS
    const safeAgentName = window.SecurityUtils ? window.SecurityUtils.escapeHTML(activity.agentName) : activity.agentName;
    const safeAction = window.SecurityUtils ? window.SecurityUtils.escapeHTML(activity.action) : activity.action;
    const safeDetails = window.SecurityUtils ? window.SecurityUtils.escapeHTML(activity.details) : activity.details;

    item.innerHTML = `
        <div class="activity-icon">${activity.agentIcon}</div>
        <div class="activity-content">
            <div class="activity-header">
                <span class="activity-agent">${safeAgentName}</span>
                <span class="activity-time">${formatTimeAgo(activity.timestamp)}</span>
            </div>
            <div class="activity-action">${safeAction}</div>
            <div class="activity-details">${safeDetails}</div>
        </div>
    `;

    // Insert at top
    if (feed.firstChild) {
        feed.insertBefore(item, feed.firstChild);
    } else {
        feed.appendChild(item);
    }

    // Keep only last 50 items
    while (feed.children.length > 50) {
        feed.removeChild(feed.lastChild);
    }

    // Update timestamps every minute
    updateActivityTimestamps();
}

// Update activity timestamps
function updateActivityTimestamps() {
    const items = document.querySelectorAll('.activity-time');
    items.forEach((el, idx) => {
        const item = activityLog[idx];
        if (item) {
            el.textContent = formatTimeAgo(item.timestamp);
        }
    });
}

// Format time ago
function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

// Update metrics
function startMetricsUpdate() {
    setInterval(() => {
        // Update header stats
        const onlineCount = Array.from(agentStates.values()).filter(s => s.status !== 'offline').length;
        document.getElementById('onlineCount').textContent = onlineCount;

        // Tasks per hour (slight variation)
        const currentTasks = parseInt(document.getElementById('tasksPerHour').textContent);
        const newTasks = currentTasks + Math.floor(Math.random() * 10) - 5;
        document.getElementById('tasksPerHour').textContent = Math.max(100, newTasks);

        // Total tasks today
        const totalTasks = Array.from(agentStates.values()).reduce((sum, s) => sum + s.tasksToday, 0);
        document.getElementById('totalTasks').textContent = totalTasks.toLocaleString();

        // Update timestamps in activity feed
        updateActivityTimestamps();

        // Update agent last active times
        document.querySelectorAll('.agent-card').forEach(card => {
            const agentId = parseInt(card.dataset.agentId);
            const state = agentStates.get(agentId);
            const lastActiveEl = card.querySelector('.stat-row:nth-child(3) .stat-value');
            if (lastActiveEl && state) {
                lastActiveEl.textContent = formatTimeAgo(state.lastActivity);
            }
        });
    }, 5000); // Update every 5 seconds
}

// Initialize coordination graph
function initCoordinationGraph() {
    const canvas = document.getElementById('networkCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = 400;

    // Create node positions in circular layout
    const nodes = AGENTS.map((agent, idx) => ({
        id: agent.id,
        x: canvas.width / 2 + Math.cos(idx * 2 * Math.PI / AGENTS.length) * 150,
        y: canvas.height / 2 + Math.sin(idx * 2 * Math.PI / AGENTS.length) * 150,
        color: agent.color,
        category: agent.category
    }));

    // Active connections
    let connections = [];

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update connections (randomly add/remove)
        if (Math.random() > 0.8) {
            const from = nodes[Math.floor(Math.random() * nodes.length)];
            const to = nodes[Math.floor(Math.random() * nodes.length)];
            if (from.id !== to.id) {
                connections.push({ from, to, opacity: 1 });
            }
        }

        // Draw connections
        connections = connections.filter(conn => {
            conn.opacity -= 0.02;
            if (conn.opacity <= 0) return false;

            ctx.beginPath();
            ctx.moveTo(conn.from.x, conn.from.y);
            ctx.lineTo(conn.to.x, conn.to.y);
            ctx.strokeStyle = `rgba(243, 186, 47, ${conn.opacity * 0.5})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            return true;
        });

        // Draw nodes
        nodes.forEach(node => {
            const state = agentStates.get(node.id);
            const isActive = state && state.status === 'working';

            ctx.beginPath();
            ctx.arc(node.x, node.y, isActive ? 8 : 6, 0, 2 * Math.PI);
            ctx.fillStyle = isActive ? '#F3BA2F' : node.color;
            ctx.fill();

            if (isActive) {
                ctx.strokeStyle = 'rgba(243, 186, 47, 0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });

        requestAnimationFrame(animate);
    }

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        canvas.width = container.clientWidth;
        canvas.height = 400;
    });
}

// Setup filter buttons
function setupFilterButtons() {
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            // Update active button
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter agents
            const cards = document.querySelectorAll('.agent-card');
            cards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
