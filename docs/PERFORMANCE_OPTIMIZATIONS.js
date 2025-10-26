// ============================================
// PERFORMANCE OPTIMIZATIONS - Ready to Integrate
// HypeAI AI Chat Premium - Optimized Version
// ============================================

// ============================================
// 1. COSMIC PARTICLES MANAGER (Memory Leak Fix)
// ============================================

class CosmicParticlesManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d', {
            alpha: true,
            desynchronized: true // Better performance
        });

        this.particles = [];
        this.animationId = null;
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;

        this.init();
    }

    init() {
        this.resize();
        this.createParticles();
        this.bindEvents();
        this.start();
    }

    bindEvents() {
        this.handleResize = this.resize.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);

        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.stop();
        } else {
            this.start();
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createParticles();
    }

    createParticles() {
        this.particles = [];
        const area = this.canvas.width * this.canvas.height;
        const particleCount = Math.min(Math.floor(area / 15000), 100);

        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }

    animate(currentTime) {
        if (!this.isRunning) return;

        // Frame rate limiting
        const elapsed = currentTime - this.lastFrameTime;

        if (elapsed > this.frameInterval) {
            this.lastFrameTime = currentTime - (elapsed % this.frameInterval);

            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and draw particles
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                p.update(this.canvas);
                p.draw(this.ctx);
            }

            // Draw connections (optimized with distance squared)
            this.drawConnections();
        }

        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }

    drawConnections() {
        const maxDistance = 150;
        const maxDistanceSq = maxDistance * maxDistance;

        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i];

            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distanceSq = dx * dx + dy * dy;

                if (distanceSq < maxDistanceSq) {
                    const distance = Math.sqrt(distanceSq);
                    const opacity = 0.15 * (1 - distance / maxDistance);

                    this.ctx.strokeStyle = `rgba(243, 186, 47, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.animate(this.lastFrameTime);
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    destroy() {
        this.stop();
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        this.particles = [];
        this.ctx = null;
    }
}

class Particle {
    constructor(canvas) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = this.randomColor();
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    randomColor() {
        const colors = [
            'rgba(243, 186, 47, ',
            'rgba(252, 213, 53, ',
            'rgba(0, 229, 255, ',
            'rgba(59, 130, 246, '
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(canvas) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw(ctx) {
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color + '0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ============================================
// 2. AGENT NETWORK VISUALIZER (Layout Thrashing Fix)
// ============================================

class AgentNetworkVisualizer {
    constructor(canvasId, agentsRef) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d', {
            alpha: true,
            desynchronized: true
        });

        this.agents = agentsRef;
        this.agentPositions = {};
        this.pulsePhase = 0;
        this.animationId = null;
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.fps = 30; // Lower FPS for background visualization
        this.frameInterval = 1000 / this.fps;

        // Cached dimensions
        this.width = 0;
        this.height = 200;
        this.centerX = 0;
        this.centerY = 100;
        this.radius = 60;

        this.init();
    }

    init() {
        this.resize();
        this.calculateAgentPositions();
        this.bindEvents();
        this.start();
    }

    bindEvents() {
        this.handleResize = this.resize.bind(this);
        window.addEventListener('resize', this.handleResize);
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.width = rect.width;
        this.centerX = this.width / 2;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.calculateAgentPositions();
    }

    calculateAgentPositions() {
        const agentIds = ['coordinator', 'researcher', 'coder', 'analyst', 'optimizer'];
        const angleStep = (Math.PI * 2) / (agentIds.length - 1);

        this.agentPositions = {};

        agentIds.forEach((agentId, i) => {
            if (agentId === 'coordinator') {
                this.agentPositions[agentId] = {
                    x: this.centerX,
                    y: this.centerY,
                    color: '#00E5FF'
                };
            } else {
                const angle = (i - 1) * angleStep;
                this.agentPositions[agentId] = {
                    x: this.centerX + Math.cos(angle) * this.radius,
                    y: this.centerY + Math.sin(angle) * this.radius,
                    color: this.getAgentColor(agentId)
                };
            }
        });
    }

    getAgentColor(agentId) {
        const colors = {
            researcher: '#F3BA2F',
            coder: '#FCD535',
            analyst: '#FFE900',
            optimizer: '#F3BA2F'
        };
        return colors[agentId] || '#F3BA2F';
    }

    animate(currentTime) {
        if (!this.isRunning) return;

        const elapsed = currentTime - this.lastFrameTime;

        if (elapsed > this.frameInterval) {
            this.lastFrameTime = currentTime - (elapsed % this.frameInterval);

            // Clear
            this.ctx.clearRect(0, 0, this.width, this.height);

            // Cache agent states once per frame
            const agentStates = {};
            Object.keys(this.agentPositions).forEach(id => {
                agentStates[id] = this.agents[id]?.status || 'idle';
            });

            // Draw connections first
            this.drawConnections(agentStates);

            // Draw nodes on top
            this.drawNodes(agentStates);

            // Update animation state
            this.pulsePhase += 0.05;
        }

        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }

    drawConnections(agentStates) {
        const coordinator = this.agentPositions.coordinator;

        Object.entries(this.agentPositions).forEach(([agentId, pos]) => {
            if (agentId === 'coordinator') return;

            const status = agentStates[agentId];
            const isActive = status === 'working' || status === 'active';

            const gradient = this.ctx.createLinearGradient(
                pos.x, pos.y,
                coordinator.x, coordinator.y
            );
            gradient.addColorStop(0, pos.color + (isActive ? '60' : '40'));
            gradient.addColorStop(1, coordinator.color + (isActive ? 'A0' : '80'));

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = isActive ? 2 : 1;
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
            this.ctx.lineTo(coordinator.x, coordinator.y);
            this.ctx.stroke();

            if (status === 'working') {
                this.drawPulse(pos, coordinator);
            }
        });
    }

    drawPulse(start, end) {
        const progress = (Math.sin(this.pulsePhase) + 1) / 2;
        const pulseX = start.x + (end.x - start.x) * progress;
        const pulseY = start.y + (end.y - start.y) * progress;

        this.ctx.fillStyle = start.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = start.color;
        this.ctx.beginPath();
        this.ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    drawNodes(agentStates) {
        Object.entries(this.agentPositions).forEach(([agentId, pos]) => {
            const status = agentStates[agentId];
            const isCoordinator = agentId === 'coordinator';
            const nodeSize = isCoordinator ? 8 : 6;
            const isActive = status === 'working' || status === 'active';

            // Outer glow
            if (isActive) {
                const glowSize = nodeSize + 3 + Math.sin(this.pulsePhase * 2) * 2;
                this.ctx.fillStyle = pos.color + '30';
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, glowSize, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // Node
            this.ctx.fillStyle = pos.color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = pos.color;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, nodeSize, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            // Status ring
            if (status === 'working') {
                this.ctx.strokeStyle = pos.color;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, nodeSize + 4, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.animate(this.lastFrameTime);
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    destroy() {
        this.stop();
        window.removeEventListener('resize', this.handleResize);
    }
}

// ============================================
// 3. OPTIMIZED CHAT CLASS (Main Integration)
// ============================================

class HypeAIChatPremiumOptimized {
    constructor() {
        // DOM element cache
        this.dom = this.cacheDOM();

        // Data
        this.messages = [];
        this.currentChatId = 'current';
        this.agents = this.initializeAgents();
        this.responseTime = [];

        // Managers
        this.cosmicParticles = null;
        this.agentNetwork = null;

        // Event tracking
        this.eventListeners = [];
        this.boundMethods = {};

        // Timeouts/debounces
        this.resizeTimeout = null;
        this.resizeDebounce = null;
        this.inputDebounce = null;

        this.init();
    }

    cacheDOM() {
        return {
            // Main elements
            messagesContainer: document.getElementById('messagesContainer'),
            messagesList: document.getElementById('messagesList'),
            welcomeScreen: document.getElementById('welcomeScreen'),
            chatInput: document.getElementById('chatInput'),
            sendBtn: document.getElementById('sendBtn'),

            // Sidebars
            leftSidebar: document.getElementById('chatHistory'),
            rightSidebar: document.getElementById('agentPanel'),

            // Buttons
            newChatBtn: document.getElementById('newChatBtn'),
            leftSidebarToggle: document.getElementById('leftSidebarToggle'),
            rightSidebarToggle: document.getElementById('rightSidebarToggle'),
            attachFileBtn: document.getElementById('attachFileBtn'),

            // Stats
            messageCountEl: document.getElementById('messageCount'),
            responseTimeEl: document.getElementById('responseTime'),
            agentWorkingEl: document.getElementById('agentWorking'),
            agentWorkingText: document.getElementById('agentWorkingText'),

            // Canvas
            cosmicCanvas: document.getElementById('cosmic-particles'),
            agentNetworkCanvas: document.getElementById('agentNetworkCanvas'),

            // Containers
            agentCards: document.getElementById('agentCards'),
            chatHistoryList: document.getElementById('chatHistoryList')
        };
    }

    initializeAgents() {
        return {
            coordinator: { status: 'active', tasks: 0, icon: '🎯', role: 'Task Management', quality: 'High' },
            marketAnalyzer: { status: 'idle', tasks: 0, icon: '📈', role: 'Market Analysis', quality: '99%' },
            // ... (all 27 agents)
        };
    }

    init() {
        this.initEventListeners();
        this.initManagers();
        this.renderAgentCards();
        this.initMobileMenu();
        this.initCommandPalette();
    }

    initManagers() {
        // Initialize canvas managers
        if (this.dom.cosmicCanvas) {
            this.cosmicParticles = new CosmicParticlesManager('cosmic-particles');
        }

        if (this.dom.agentNetworkCanvas) {
            this.agentNetwork = new AgentNetworkVisualizer('agentNetworkCanvas', this.agents);
        }
    }

    initEventListeners() {
        // Bind methods once
        this.boundMethods = {
            sendMessage: this.sendMessage.bind(this),
            handleKeyDown: this.handleKeyDown.bind(this),
            handleInput: this.handleInput.bind(this),
            handleResize: this.handleResize.bind(this),
            handleQuickAction: this.handleQuickAction.bind(this)
        };

        // Add listeners
        this.addEventListener(this.dom.sendBtn, 'click', this.boundMethods.sendMessage);
        this.addEventListener(this.dom.chatInput, 'keydown', this.boundMethods.handleKeyDown);
        this.addEventListener(this.dom.chatInput, 'input', this.boundMethods.handleInput);
        this.addEventListener(window, 'resize', this.boundMethods.handleResize);

        // Event delegation for quick actions
        this.addEventListener(document, 'click', this.boundMethods.handleQuickAction);

        // Initialize ripple effects
        this.initRippleEffect();
    }

    addEventListener(element, event, handler) {
        if (!element) return;
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleInput() {
        // Debounced input handling
        clearTimeout(this.inputDebounce);
        this.inputDebounce = setTimeout(() => {
            this.dom.sendBtn.disabled = !this.dom.chatInput.value.trim();
            this.autoResizeTextarea();
        }, 16); // ~60fps
    }

    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            if (this.cosmicParticles) this.cosmicParticles.resize();
            if (this.agentNetwork) this.agentNetwork.resize();
        }, 250);
    }

    handleQuickAction(e) {
        const card = e.target.closest('.quick-action-card');
        if (card) {
            const prompt = card.dataset.prompt;
            this.dom.chatInput.value = prompt;
            this.dom.sendBtn.disabled = false;
            this.sendMessage();
        }
    }

    autoResizeTextarea() {
        clearTimeout(this.resizeDebounce);
        this.resizeDebounce = setTimeout(() => {
            const textarea = this.dom.chatInput;
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
        }, 16);
    }

    async sendMessage() {
        const content = this.dom.chatInput.value.trim();
        if (!content) return;

        this.addMessage('user', content);
        this.dom.chatInput.value = '';
        this.dom.sendBtn.disabled = true;
        this.autoResizeTextarea();

        if (this.dom.welcomeScreen) {
            this.dom.welcomeScreen.style.display = 'none';
        }

        await this.simulateAIResponse(content);
    }

    addMessage(role, content, streaming = false, activeAgents = null) {
        const message = {
            id: Date.now(),
            role,
            content,
            timestamp: new Date(),
            activeAgents
        };

        this.messages.push(message);
        this.updateMessageCount();

        const messageEl = this.createMessageElement(message, streaming);
        this.dom.messagesList.appendChild(messageEl);
        this.scrollToBottom();

        return messageEl;
    }

    createMessageElement(message, streaming = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}`;
        messageDiv.dataset.messageId = message.id;

        const avatar = message.role === 'user' ? '👤' : '🤖';
        const authorName = message.role === 'user' ? 'You' : 'HypeAI';

        messageDiv.innerHTML = `
            <div class="message-avatar ${message.role}-avatar">
                ${avatar}
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">${authorName}</span>
                    <span class="message-time">${this.formatTime(message.timestamp)}</span>
                </div>
                <div class="message-body">
                    ${streaming ? '<div class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>' : this.formatContent(message.content)}
                </div>
            </div>
        `;

        return messageDiv;
    }

    formatContent(content) {
        // Simple synchronous formatting for small content
        if (typeof marked !== 'undefined' && content.length < 5000) {
            return marked.parse(content);
        }
        return content.replace(/\n/g, '<br>');
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    scrollToBottom() {
        // Use cached reference
        this.dom.messagesContainer.scrollTop = this.dom.messagesContainer.scrollHeight;
    }

    updateMessageCount() {
        if (this.dom.messageCountEl) {
            this.dom.messageCountEl.textContent = this.messages.length;
        }
    }

    async simulateAIResponse(userMessage) {
        const startTime = Date.now();

        const typingMessage = this.addMessage('assistant', '', true);
        this.showAgentWorking();

        // Simulate agent work
        await this.delay(800 + Math.random() * 500);

        const response = this.generateResponse(userMessage);
        typingMessage.remove();

        this.addMessage('assistant', response, false, null);
        this.hideAgentWorking();

        const duration = Date.now() - startTime;
        this.responseTime.push(duration);
        this.updateResponseTime();

        // Highlight code in idle callback
        this.highlightCodeOptimized();
    }

    highlightCodeOptimized() {
        if (typeof hljs === 'undefined') return;

        const blocks = this.dom.messagesList.querySelectorAll('pre code:not(.highlighted)');
        if (blocks.length === 0) return;

        let index = 0;
        const processBlock = (deadline) => {
            while (index < blocks.length && deadline.timeRemaining() > 0) {
                const block = blocks[index];
                hljs.highlightElement(block);
                block.classList.add('highlighted');
                index++;
            }

            if (index < blocks.length) {
                requestIdleCallback(processBlock);
            }
        };

        requestIdleCallback(processBlock);
    }

    generateResponse(userMessage) {
        // Simplified response generation
        return `I understand you're asking about: **"${userMessage}"**\n\nBased on my analysis, here's what I can tell you...`;
    }

    showAgentWorking() {
        if (this.dom.agentWorkingEl) {
            this.dom.agentWorkingEl.style.display = 'flex';
        }
    }

    hideAgentWorking() {
        if (this.dom.agentWorkingEl) {
            this.dom.agentWorkingEl.style.display = 'none';
        }
    }

    updateResponseTime() {
        if (this.dom.responseTimeEl && this.responseTime.length > 0) {
            const avg = this.responseTime.reduce((a, b) => a + b, 0) / this.responseTime.length;
            this.dom.responseTimeEl.textContent = Math.round(avg) + 'ms';
        }
    }

    renderAgentCards() {
        if (!this.dom.agentCards) return;

        const cards = Object.entries(this.agents).map(([id, agent]) => `
            <div class="agent-card" data-agent="${id}">
                <div class="agent-card-header">
                    <div class="agent-avatar">${agent.icon}</div>
                    <div class="agent-info">
                        <div class="agent-name">${id}</div>
                        <div class="agent-role">${agent.role}</div>
                    </div>
                    <div class="agent-status-dot status-${agent.status}"></div>
                </div>
            </div>
        `);

        this.dom.agentCards.innerHTML = cards.join('');
    }

    initRippleEffect() {
        this.addEventListener(document, 'click', (e) => {
            const container = e.target.closest('.ripple-container');
            if (container) {
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                const rect = container.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
                ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
                container.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            }
        });
    }

    initMobileMenu() {
        // Mobile menu implementation
    }

    initCommandPalette() {
        // Command palette implementation
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    destroy() {
        // Clean up all event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        // Clear timeouts
        clearTimeout(this.resizeTimeout);
        clearTimeout(this.resizeDebounce);
        clearTimeout(this.inputDebounce);

        // Destroy managers
        if (this.cosmicParticles) this.cosmicParticles.destroy();
        if (this.agentNetwork) this.agentNetwork.destroy();

        // Clear references
        this.dom = null;
        this.messages = [];
        this.agents = {};
    }
}

// ============================================
// 4. PERFORMANCE MONITOR
// ============================================

class PerformanceMonitor {
    constructor() {
        this.fps = [];
        this.memory = [];
        this.startTime = performance.now();
        this.frameCount = 0;
        this.lastFPSCheck = this.startTime;
    }

    start() {
        this.trackFPS();
        this.trackMemory();
    }

    trackFPS() {
        const loop = () => {
            this.frameCount++;
            const currentTime = performance.now();

            if (currentTime >= this.lastFPSCheck + 1000) {
                const currentFPS = this.frameCount;
                this.fps.push(currentFPS);
                this.frameCount = 0;
                this.lastFPSCheck = currentTime;

                if (currentFPS < 55) {
                    console.warn(`⚠️ FPS drop detected: ${currentFPS}fps`);
                }
            }

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

    trackMemory() {
        if (performance.memory) {
            setInterval(() => {
                const memUsage = performance.memory.usedJSHeapSize / 1048576;
                this.memory.push(memUsage);

                if (memUsage > 100) {
                    console.warn(`⚠️ High memory usage: ${memUsage.toFixed(2)}MB`);
                }
            }, 5000);
        }
    }

    getStats() {
        return {
            averageFPS: this.fps.reduce((a, b) => a + b, 0) / this.fps.length,
            minFPS: Math.min(...this.fps),
            maxFPS: Math.max(...this.fps),
            averageMemory: this.memory.reduce((a, b) => a + b, 0) / this.memory.length,
            peakMemory: Math.max(...this.memory)
        };
    }
}

// ============================================
// 5. INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize optimized chat
    window.hypeAIChat = new HypeAIChatPremiumOptimized();

    // Start performance monitoring (development only)
    if (window.location.hostname === 'localhost') {
        window.perfMonitor = new PerformanceMonitor();
        window.perfMonitor.start();

        // Log stats every 30 seconds
        setInterval(() => {
            console.log('📊 Performance Stats:', window.perfMonitor.getStats());
        }, 30000);
    }

    console.log('✅ HypeAI Chat Premium Optimized - Ready');
});

// ============================================
// EXPORT FOR MODULE USAGE
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HypeAIChatPremiumOptimized,
        CosmicParticlesManager,
        AgentNetworkVisualizer,
        PerformanceMonitor
    };
}
