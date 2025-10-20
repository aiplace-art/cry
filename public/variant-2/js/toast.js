/**
 * Binance-Level Toast Notification System
 * Professional toast notifications with queue management, auto-dismiss, and smooth animations
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.queue = [];
    this.maxVisible = 3;
    this.activeToasts = new Map();
    this.init();
  }

  /**
   * Initialize toast container
   */
  init() {
    // Create container if it doesn't exist
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(this.container);
    }
  }

  /**
   * Show a toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type (success, error, warning, info)
   * @param {number} duration - Auto-dismiss duration in ms
   */
  show(message, type = 'info', duration = 4000) {
    const toast = this.createToast(message, type, duration);
    this.queue.push(toast);
    this.render();
    return toast.id;
  }

  /**
   * Create toast object
   * @param {string} message - Toast message
   * @param {string} type - Toast type
   * @param {number} duration - Duration in ms
   * @returns {Object} Toast object
   */
  createToast(message, type, duration) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const colors = {
      success: '#0ECB81',
      error: '#F6465D',
      warning: '#F0B90B',
      info: '#3772FF'
    };

    return {
      id,
      message: this.sanitizeMessage(message),
      type,
      duration,
      icon: icons[type] || icons.info,
      color: colors[type] || colors.info,
      timestamp: Date.now()
    };
  }

  /**
   * Sanitize message to prevent XSS
   * @param {string} message - Raw message
   * @returns {string} Sanitized message
   */
  sanitizeMessage(message) {
    const div = document.createElement('div');
    div.textContent = message;
    return div.innerHTML;
  }

  /**
   * Render visible toasts
   */
  render() {
    // Only show max visible toasts
    const visible = this.queue.slice(-this.maxVisible);

    // Clear container
    this.container.innerHTML = '';

    // Render each toast
    visible.forEach(toast => {
      const toastElement = this.createToastElement(toast);
      this.container.appendChild(toastElement);

      // Setup auto-dismiss
      if (!this.activeToasts.has(toast.id)) {
        const timeoutId = setTimeout(() => {
          this.dismiss(toast.id);
        }, toast.duration);

        this.activeToasts.set(toast.id, {
          element: toastElement,
          timeoutId
        });
      }
    });
  }

  /**
   * Create toast DOM element
   * @param {Object} toast - Toast object
   * @returns {HTMLElement} Toast element
   */
  createToastElement(toast) {
    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${toast.type}`;
    toastEl.setAttribute('data-id', toast.id);
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');

    toastEl.innerHTML = `
      <div class="toast-icon" style="background: ${toast.color}">${toast.icon}</div>
      <div class="toast-message">${toast.message}</div>
      <button class="toast-close" aria-label="Close notification">×</button>
      <div class="toast-progress" style="animation-duration: ${toast.duration}ms; background: ${toast.color}"></div>
    `;

    // Add close button listener
    const closeBtn = toastEl.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.dismiss(toast.id));

    // Add swipe to dismiss for touch devices
    this.addSwipeHandler(toastEl, toast.id);

    return toastEl;
  }

  /**
   * Add swipe to dismiss handler
   * @param {HTMLElement} element - Toast element
   * @param {string} id - Toast ID
   */
  addSwipeHandler(element, id) {
    let startX = 0;
    let currentX = 0;

    element.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    element.addEventListener('touchmove', (e) => {
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;

      if (diff > 0) {
        element.style.transform = `translateX(${diff}px)`;
        element.style.opacity = 1 - (diff / 200);
      }
    }, { passive: true });

    element.addEventListener('touchend', () => {
      const diff = currentX - startX;

      if (diff > 100) {
        // Swipe dismissed
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'translateX(400px)';
        element.style.opacity = '0';
        setTimeout(() => this.dismiss(id), 300);
      } else {
        // Reset
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'translateX(0)';
        element.style.opacity = '1';
      }

      startX = 0;
      currentX = 0;
    }, { passive: true });
  }

  /**
   * Dismiss a toast
   * @param {string} id - Toast ID
   */
  dismiss(id) {
    // Clear timeout
    const activeToast = this.activeToasts.get(id);
    if (activeToast) {
      clearTimeout(activeToast.timeoutId);
      this.activeToasts.delete(id);
    }

    // Remove from queue
    this.queue = this.queue.filter(t => t.id !== id);

    // Animate out
    const element = this.container.querySelector(`[data-id="${id}"]`);
    if (element) {
      element.style.animation = 'slideOut 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
      setTimeout(() => {
        this.render();
      }, 300);
    } else {
      this.render();
    }
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    this.activeToasts.forEach((toast, id) => {
      clearTimeout(toast.timeoutId);
    });
    this.activeToasts.clear();
    this.queue = [];
    this.render();
  }

  /**
   * Convenience method: Success toast
   * @param {string} message - Message to display
   * @param {number} duration - Optional duration
   */
  success(message, duration = 4000) {
    return this.show(message, 'success', duration);
  }

  /**
   * Convenience method: Error toast
   * @param {string} message - Message to display
   * @param {number} duration - Optional duration (default 5s for errors)
   */
  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  }

  /**
   * Convenience method: Warning toast
   * @param {string} message - Message to display
   * @param {number} duration - Optional duration
   */
  warning(message, duration = 4000) {
    return this.show(message, 'warning', duration);
  }

  /**
   * Convenience method: Info toast
   * @param {string} message - Message to display
   * @param {number} duration - Optional duration
   */
  info(message, duration = 4000) {
    return this.show(message, 'info', duration);
  }

  /**
   * Cleanup and remove toast system
   */
  destroy() {
    this.dismissAll();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
  }
}

// Create global instance
const toast = new ToastManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = toast;
}

// Make available globally
window.toast = toast;

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => toast.init());
} else {
  toast.init();
}

// Export default
export default toast;
