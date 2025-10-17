/* ===================================
   Loading State Manager
   Manages UI loading states and indicators
   =================================== */

class LoadingStateManager {
    constructor() {
        this.states = new Map();
        this.listeners = new Set();
    }

    setLoading(key, isLoading, message = '') {
        this.states.set(key, {
            isLoading,
            message,
            timestamp: Date.now()
        });
        this.notify(key);
    }

    isLoading(key) {
        return this.states.get(key)?.isLoading ?? false;
    }

    getMessage(key) {
        return this.states.get(key)?.message ?? '';
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notify(key) {
        const state = this.states.get(key);
        this.listeners.forEach(callback => callback(key, state));
    }

    clear(key) {
        this.states.delete(key);
        this.notify(key);
    }
}

// UI Components for loading states
function showLoadingIndicator(targetSelector, message) {
    const target = typeof targetSelector === 'string'
        ? document.querySelector(targetSelector)
        : targetSelector;

    if (!target) return;

    // Remove existing loader
    hideLoadingIndicator(target);

    const loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.innerHTML = `
        <div class="loading-content">
            <div class="spinner"></div>
            <p class="loading-message">${message || 'Loading...'}</p>
        </div>
    `;

    target.style.position = 'relative';
    target.appendChild(loader);
}

function hideLoadingIndicator(targetSelector) {
    const target = typeof targetSelector === 'string'
        ? document.querySelector(targetSelector)
        : targetSelector;

    if (!target) return;

    const loader = target.querySelector('.loading-overlay');
    if (loader) {
        loader.remove();
    }
}

function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    }[type] || 'ℹ';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('toast-show'), 10);

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function showErrorBanner(message, error) {
    const banner = document.createElement('div');
    banner.className = 'error-banner';
    banner.innerHTML = `
        <div class="error-banner-content">
            <span class="error-banner-icon">⚠️</span>
            <div class="error-banner-text">
                <strong>Error:</strong> ${message}
                ${error ? `<br><small>${error.message}</small>` : ''}
            </div>
            <button class="error-banner-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    const existingBanner = document.querySelector('.error-banner');
    if (existingBanner) {
        existingBanner.remove();
    }

    document.body.insertBefore(banner, document.body.firstChild);
}

function showConnectionStatus(status, message) {
    const statusBar = document.getElementById('connectionStatus') || createConnectionStatusBar();

    const states = {
        connected: { text: 'Live', class: 'status-success', icon: '🟢' },
        disconnected: { text: 'Offline', class: 'status-error', icon: '🔴' },
        reconnecting: { text: 'Reconnecting...', class: 'status-warning', icon: '🟡' },
        stale: { text: 'Using cached data', class: 'status-warning', icon: '⚠️' },
        loading: { text: 'Loading...', class: 'status-info', icon: '⏳' }
    };

    const state = states[status] || states.connected;

    statusBar.innerHTML = `
        <span class="status-icon">${state.icon}</span>
        <span class="status-text">${message || state.text}</span>
    `;

    statusBar.className = `connection-status ${state.class}`;
}

function createConnectionStatusBar() {
    const statusBar = document.createElement('div');
    statusBar.id = 'connectionStatus';
    statusBar.className = 'connection-status';

    const header = document.querySelector('.dashboard-header .header-right');
    if (header) {
        header.insertBefore(statusBar, header.firstChild);
    }

    return statusBar;
}

function createRefreshButton() {
    const button = document.createElement('button');
    button.id = 'refreshButton';
    button.className = 'refresh-btn';
    button.innerHTML = '🔄 Refresh';

    button.onclick = async () => {
        const event = new CustomEvent('twitter:refresh', { detail: { force: true } });
        window.dispatchEvent(event);
    };

    const header = document.querySelector('.dashboard-header .header-right');
    if (header) {
        header.appendChild(button);
    }

    return button;
}

// Export
window.LoadingStateManager = LoadingStateManager;
window.UIHelpers = {
    showLoadingIndicator,
    hideLoadingIndicator,
    showToast,
    showErrorBanner,
    showConnectionStatus,
    createConnectionStatusBar,
    createRefreshButton
};
