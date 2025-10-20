/**
 * Loading State Manager - Binance-Level UX
 * Handles skeleton screens, spinners, overlays, and smooth transitions
 */

class LoadingStateManager {
  constructor() {
    this.activeOverlays = new Set();
    this.activeLoaders = new Map();
  }

  /**
   * Show full-screen loading overlay
   * @param {string} message - Main loading message
   * @param {string} submessage - Optional subtitle
   * @returns {string} Overlay ID for removal
   */
  showOverlay(message = 'Loading...', submessage = '') {
    const overlayId = `overlay-${Date.now()}`;
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = overlayId;
    overlay.innerHTML = `
      <div class="loading-overlay-content">
        <div class="spinner large"></div>
        <div class="loading-overlay-text">${message}</div>
        ${submessage ? `<div class="loading-overlay-subtext">${submessage}</div>` : ''}
      </div>
    `;
    document.body.appendChild(overlay);
    this.activeOverlays.add(overlayId);

    // Prevent scroll
    document.body.style.overflow = 'hidden';

    return overlayId;
  }

  /**
   * Hide loading overlay
   * @param {string} overlayId - Optional specific overlay to remove
   */
  hideOverlay(overlayId = null) {
    if (overlayId) {
      const overlay = document.getElementById(overlayId);
      if (overlay) {
        overlay.style.animation = 'fadeOut 0.2s forwards';
        setTimeout(() => {
          overlay.remove();
          this.activeOverlays.delete(overlayId);
          if (this.activeOverlays.size === 0) {
            document.body.style.overflow = '';
          }
        }, 200);
      }
    } else {
      // Remove all overlays
      document.querySelectorAll('.loading-overlay').forEach(overlay => {
        overlay.style.animation = 'fadeOut 0.2s forwards';
        setTimeout(() => overlay.remove(), 200);
      });
      this.activeOverlays.clear();
      document.body.style.overflow = '';
    }
  }

  /**
   * Set button loading state
   * @param {HTMLElement} button - Button element
   * @param {boolean} loading - Loading state
   * @param {string} loadingText - Optional loading text
   */
  setButtonLoading(button, loading = true, loadingText = 'Loading...') {
    if (loading) {
      button.classList.add('btn-loading');
      button.disabled = true;
      if (!button.dataset.originalText) {
        button.dataset.originalText = button.textContent;
      }
      button.innerHTML = `<span class="btn-text">${loadingText}</span>`;
    } else {
      button.classList.remove('btn-loading');
      button.disabled = false;
      button.innerHTML = button.dataset.originalText || button.textContent;
      delete button.dataset.originalText;
    }
  }

  /**
   * Create agent card skeleton
   * @param {number} count - Number of skeleton cards
   * @returns {string} HTML string
   */
  createAgentSkeleton(count = 6) {
    const skeletons = Array(count).fill(0).map(() => `
      <div class="agent-skeleton">
        <div class="agent-skeleton-header">
          <div class="skeleton skeleton-avatar"></div>
          <div style="flex: 1;">
            <div class="skeleton skeleton-text" style="width: 60%; margin-bottom: 8px;"></div>
            <div class="skeleton skeleton-text small" style="width: 40%;"></div>
          </div>
        </div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
        <div class="agent-skeleton-stats">
          <div class="skeleton skeleton-text small"></div>
          <div class="skeleton skeleton-text small"></div>
        </div>
      </div>
    `).join('');

    return skeletons;
  }

  /**
   * Create hero stats skeleton
   * @param {number} count - Number of stat cards
   * @returns {string} HTML string
   */
  createHeroStatsSkeleton(count = 4) {
    const skeletons = Array(count).fill(0).map(() => `
      <div class="hero-stat-skeleton">
        <div class="skeleton skeleton-text small" style="width: 40%;"></div>
        <div class="skeleton skeleton-text xlarge" style="width: 70%; margin-top: 8px;"></div>
        <div class="skeleton skeleton-text small" style="width: 50%; margin-top: 4px;"></div>
      </div>
    `).join('');

    return skeletons;
  }

  /**
   * Create staking tier skeleton
   * @param {number} count - Number of tier cards
   * @returns {string} HTML string
   */
  createStakingTierSkeleton(count = 3) {
    const skeletons = Array(count).fill(0).map(() => `
      <div class="tier-skeleton">
        <div class="tier-skeleton-header">
          <div class="skeleton skeleton-text large" style="width: 40%;"></div>
          <div class="skeleton skeleton-text" style="width: 30%;"></div>
        </div>
        <div class="skeleton skeleton-text" style="width: 90%; margin: 12px 0;"></div>
        <div class="tier-skeleton-benefits">
          <div class="skeleton skeleton-text small"></div>
          <div class="skeleton skeleton-text small"></div>
          <div class="skeleton skeleton-text small"></div>
          <div class="skeleton skeleton-text small"></div>
        </div>
        <div class="skeleton skeleton-button" style="width: 100%; margin-top: 20px;"></div>
      </div>
    `).join('');

    return skeletons;
  }

  /**
   * Create order book skeleton
   * @param {number} rows - Number of rows
   * @returns {string} HTML string
   */
  createOrderBookSkeleton(rows = 10) {
    const skeletons = Array(rows).fill(0).map(() => `
      <div class="orderbook-row-skeleton">
        <div class="skeleton skeleton-text small"></div>
        <div class="skeleton skeleton-text small"></div>
        <div class="skeleton skeleton-text small"></div>
      </div>
    `).join('');

    return `<div class="orderbook-skeleton">${skeletons}</div>`;
  }

  /**
   * Create table skeleton
   * @param {number} rows - Number of rows
   * @param {number} columns - Number of columns
   * @returns {string} HTML string
   */
  createTableSkeleton(rows = 5, columns = 4) {
    const skeletons = Array(rows).fill(0).map(() => {
      const cols = Array(columns).fill(0).map(() =>
        `<div class="skeleton skeleton-text"></div>`
      ).join('');
      return `<div class="table-skeleton-row">${cols}</div>`;
    }).join('');

    return `<div class="table-skeleton">${skeletons}</div>`;
  }

  /**
   * Create chart skeleton
   * @returns {string} HTML string
   */
  createChartSkeleton() {
    return '<div class="chart-skeleton"></div>';
  }

  /**
   * Replace skeleton with real content
   * @param {HTMLElement} container - Container element
   * @param {HTMLElement|string} content - New content
   * @param {boolean} fadeIn - Apply fade-in animation
   */
  replaceSkeleton(container, content, fadeIn = true) {
    // Mark as loaded
    container.dataset.loaded = 'true';

    // Get real content container
    let realContent = container.querySelector('.real-content');
    if (!realContent) {
      realContent = document.createElement('div');
      realContent.className = 'real-content';
      container.appendChild(realContent);
    }

    // Add content
    if (typeof content === 'string') {
      realContent.innerHTML = content;
    } else {
      realContent.innerHTML = '';
      realContent.appendChild(content);
    }

    // Apply fade-in
    if (fadeIn) {
      realContent.classList.add('fade-in');
    }
  }

  /**
   * Show inline spinner
   * @param {HTMLElement} element - Element to add spinner to
   * @param {string} size - Spinner size (small, medium, large)
   * @returns {string} Loader ID
   */
  showInlineSpinner(element, size = 'small') {
    const loaderId = `loader-${Date.now()}`;
    const spinner = document.createElement('div');
    spinner.className = `spinner ${size} inline`;
    spinner.id = loaderId;
    element.appendChild(spinner);
    this.activeLoaders.set(loaderId, element);
    return loaderId;
  }

  /**
   * Hide inline spinner
   * @param {string} loaderId - Loader ID to remove
   */
  hideInlineSpinner(loaderId) {
    const spinner = document.getElementById(loaderId);
    if (spinner) {
      spinner.remove();
      this.activeLoaders.delete(loaderId);
    }
  }

  /**
   * Update progress bar
   * @param {HTMLElement} element - Progress bar element
   * @param {number} percent - Progress percentage (0-100)
   */
  updateProgress(element, percent) {
    const fill = element.querySelector('.progress-bar-fill');
    if (fill) {
      fill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }
  }

  /**
   * Create and show progress bar
   * @param {HTMLElement} container - Container for progress bar
   * @param {number} percent - Initial percentage
   * @param {boolean} animated - Add pulse animation
   * @returns {HTMLElement} Progress bar element
   */
  createProgressBar(container, percent = 0, animated = false) {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = `
      <div class="progress-bar-fill ${animated ? 'animated' : ''}" style="width: ${percent}%"></div>
    `;
    container.appendChild(progressBar);
    return progressBar;
  }

  /**
   * Show loading dots
   * @param {HTMLElement} element - Element to add dots to
   * @returns {HTMLElement} Dots element
   */
  createLoadingDots(element) {
    const dots = document.createElement('span');
    dots.className = 'loading-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';
    element.appendChild(dots);
    return dots;
  }

  /**
   * Set element loading state
   * @param {HTMLElement} element - Element to set loading state
   * @param {boolean} loading - Loading state
   */
  setElementLoading(element, loading = true) {
    if (loading) {
      element.classList.add('loading-transition', 'loading');
      element.setAttribute('aria-busy', 'true');
    } else {
      element.classList.remove('loading');
      element.setAttribute('aria-busy', 'false');
      setTimeout(() => {
        element.classList.remove('loading-transition');
      }, 300);
    }
  }

  /**
   * Show success state
   * @param {HTMLElement} element - Element to show success on
   * @param {number} duration - Duration to show success (ms)
   */
  showSuccess(element, duration = 2000) {
    element.classList.add('loading-success');
    setTimeout(() => {
      element.classList.remove('loading-success');
    }, duration);
  }

  /**
   * Show error state
   * @param {HTMLElement} element - Element to show error on
   * @param {number} duration - Duration to show error (ms)
   */
  showError(element, duration = 2000) {
    element.classList.add('loading-error');
    setTimeout(() => {
      element.classList.remove('loading-error');
    }, duration);
  }

  /**
   * Simulate loading with automatic progress
   * @param {HTMLElement} progressBar - Progress bar element
   * @param {number} duration - Duration in ms
   * @returns {Promise} Resolves when complete
   */
  simulateProgress(progressBar, duration = 3000) {
    return new Promise(resolve => {
      let progress = 0;
      const interval = 50;
      const increment = (100 / duration) * interval;

      const timer = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
          progress = 100;
          clearInterval(timer);
          this.updateProgress(progressBar, 100);
          setTimeout(resolve, 200);
        } else {
          this.updateProgress(progressBar, progress);
        }
      }, interval);
    });
  }

  /**
   * Clean up all loading states
   */
  cleanup() {
    this.hideOverlay();
    this.activeLoaders.forEach((element, loaderId) => {
      this.hideInlineSpinner(loaderId);
    });
  }
}

// Create global instance
const loadingState = new LoadingStateManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = loadingState;
}

// Make available globally
window.loadingState = loadingState;

// Add fadeOut animation for overlay
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Example usage patterns in comments for reference
/*
// Page load skeleton
document.addEventListener('DOMContentLoaded', () => {
  const agentGrid = document.querySelector('.agents-grid');
  agentGrid.innerHTML = `
    <div class="skeleton-container">
      ${loadingState.createAgentSkeleton(27)}
    </div>
    <div class="real-content" style="display: none;"></div>
  `;

  // Load data
  fetchAgents().then(agents => {
    loadingState.replaceSkeleton(agentGrid, renderAgents(agents));
  });
});

// Button loading
connectBtn.addEventListener('click', async () => {
  loadingState.setButtonLoading(connectBtn, true, 'Connecting...');
  try {
    await connectWallet();
  } finally {
    loadingState.setButtonLoading(connectBtn, false);
  }
});

// Full page overlay
const overlayId = loadingState.showOverlay('Initializing...', 'Please wait');
try {
  await initialize();
} finally {
  loadingState.hideOverlay(overlayId);
}

// Progress bar
const progressBar = loadingState.createProgressBar(container, 0, true);
await loadingState.simulateProgress(progressBar, 3000);
*/
