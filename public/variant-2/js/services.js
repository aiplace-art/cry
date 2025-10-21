/**
 * Services Page JavaScript
 * Professional interactive functionality with cosmic animations
 * @version 2.0.0
 */

(function() {
  'use strict';

  /**
   * Main Services Controller
   */
  class ServicesController {
    constructor() {
      this.tabs = document.querySelectorAll('.services-tab');
      this.serviceCards = document.querySelectorAll('.service-card, .service-featured-card');
      this.buttons = document.querySelectorAll('.btn-primary, .btn-outline, .btn-secondary');
      this.advantageCards = document.querySelectorAll('.advantage-card');
      this.currentFilter = 'all';

      // Animation settings
      this.staggerDelay = 100; // ms between card animations
      this.animationDuration = 500; // ms

      this.init();
    }

    /**
     * Initialize all functionality
     */
    init() {
      this.setupTabFiltering();
      this.setupSmoothScroll();
      this.setupButtonHandlers();
      this.setupScrollAnimations();
      this.setupCardHoverEffects();
      this.initializeCardAnimations();

      console.log('Services page initialized');
    }

    /**
     * Setup tab filtering with smooth animations
     */
    setupTabFiltering() {
      this.tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          const targetAudience = tab.dataset.tab;

          // Don't filter if already active
          if (this.currentFilter === targetAudience) return;

          this.currentFilter = targetAudience;

          // Update active tab with animation
          this.updateActiveTab(tab);

          // Filter cards with staggered animation
          this.filterCards(targetAudience);
        });
      });
    }

    /**
     * Update active tab state
     */
    updateActiveTab(activeTab) {
      this.tabs.forEach(tab => {
        tab.classList.remove('active');

        // Add ripple effect
        if (tab === activeTab) {
          tab.classList.add('active');
          this.createRipple(tab);
        }
      });
    }

    /**
     * Create ripple effect on tab click
     */
    createRipple(element) {
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background: rgba(255, 233, 0, 0.4);
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        animation: ripple-expand 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
      `;

      element.style.position = 'relative';
      element.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    }

    /**
     * Filter service cards with smooth animations
     */
    filterCards(targetAudience) {
      const cardsToShow = [];
      const cardsToHide = [];

      // Categorize cards
      this.serviceCards.forEach(card => {
        const cardAudience = card.dataset.audience || 'all';
        const audiences = cardAudience.split(' ');

        if (targetAudience === 'all' || audiences.includes(targetAudience) || audiences.includes('all')) {
          cardsToShow.push(card);
        } else {
          cardsToHide.push(card);
        }
      });

      // Hide cards first
      cardsToHide.forEach(card => {
        card.classList.add('hidden');
        card.classList.remove('visible');

        setTimeout(() => {
          if (card.classList.contains('hidden')) {
            card.style.display = 'none';
          }
        }, this.animationDuration);
      });

      // Show cards with stagger
      setTimeout(() => {
        cardsToShow.forEach((card, index) => {
          setTimeout(() => {
            card.style.display = 'flex';
            card.classList.remove('hidden');
            card.classList.add('visible');
          }, index * this.staggerDelay);
        });
      }, 100);
    }

    /**
     * Setup smooth scrolling for anchor links
     */
    setupSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const href = anchor.getAttribute('href');

          // Skip empty anchors
          if (href === '#') return;

          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();

            const offset = 80; // Account for fixed header
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        });
      });
    }

    /**
     * Setup button click handlers
     */
    setupButtonHandlers() {
      this.buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          // Don't prevent default for actual links
          if (button.tagName === 'A' && button.getAttribute('href') !== '#') {
            return;
          }

          const buttonText = button.textContent.trim();

          // Add click animation
          this.animateButtonClick(button);

          // Handle different button types
          if (buttonText.includes('Get Started') || buttonText.includes('Order') || buttonText.includes('Start')) {
            e.preventDefault();
            this.handleOrderAction(buttonText);
          } else if (buttonText.includes('Contact') || buttonText.includes('Sales')) {
            e.preventDefault();
            this.handleContactAction();
          } else if (buttonText.includes('Learn More') || buttonText.includes('View')) {
            e.preventDefault();
            this.handleLearnMoreAction(buttonText);
          }
        });
      });
    }

    /**
     * Animate button click
     */
    animateButtonClick(button) {
      button.style.transform = 'scale(0.95)';

      setTimeout(() => {
        button.style.transform = '';
      }, 150);
    }

    /**
     * Handle order action
     */
    handleOrderAction(buttonText) {
      console.log('Order action:', buttonText);

      // Create notification
      this.showNotification(
        '🚀 Service Ordering',
        'Order system launching soon! Contact us directly for early access.',
        'info'
      );
    }

    /**
     * Handle contact action
     */
    handleContactAction() {
      console.log('Contact action');

      this.showNotification(
        '📧 Contact Us',
        'Contact form coming soon! Reach out via Telegram or Twitter.',
        'info'
      );
    }

    /**
     * Handle learn more action
     */
    handleLearnMoreAction(buttonText) {
      console.log('Learn more:', buttonText);

      this.showNotification(
        '📚 More Information',
        'Detailed service information pages coming soon!',
        'info'
      );
    }

    /**
     * Show notification toast
     */
    showNotification(title, message, type = 'info') {
      // Check if toast system exists
      if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
      }

      // Fallback to custom notification
      const notification = document.createElement('div');
      notification.className = 'custom-notification';
      notification.innerHTML = `
        <div class="notification-content">
          <strong>${title}</strong>
          <p>${message}</p>
        </div>
      `;

      notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        max-width: 400px;
        background: rgba(30, 32, 38, 0.95);
        backdrop-filter: blur(20px);
        border: 2px solid rgba(255, 233, 0, 0.3);
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 233, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        color: #FFFFFF;
      `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => notification.remove(), 400);
      }, 4000);
    }

    /**
     * Setup scroll-based animations
     */
    setupScrollAnimations() {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -80px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            entry.target.classList.add('animated');
          }
        });
      }, observerOptions);

      // Observe advantage cards
      this.advantageCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
        observer.observe(card);
      });
    }

    /**
     * Setup card hover effects
     */
    setupCardHoverEffects() {
      this.serviceCards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
          this.createCardSparkles(card);
        });

        card.addEventListener('mousemove', (e) => {
          this.updateCardGradient(card, e);
        });

        card.addEventListener('mouseleave', (e) => {
          this.resetCardGradient(card);
        });
      });
    }

    /**
     * Create sparkle effects on card hover
     */
    createCardSparkles(card) {
      const sparkleCount = 3;

      for (let i = 0; i < sparkleCount; i++) {
        setTimeout(() => {
          const sparkle = document.createElement('div');
          sparkle.className = 'cosmic-sparkle';

          const rect = card.getBoundingClientRect();
          const x = Math.random() * rect.width;
          const y = Math.random() * rect.height;

          sparkle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, #FFE900, transparent);
            border-radius: 50%;
            pointer-events: none;
            animation: sparkle 1s ease-out forwards;
            z-index: 10;
          `;

          card.appendChild(sparkle);
          setTimeout(() => sparkle.remove(), 1000);
        }, i * 150);
      }
    }

    /**
     * Update card gradient based on mouse position
     */
    updateCardGradient(card, event) {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;

      card.style.setProperty('--mouse-x', `${xPercent}%`);
      card.style.setProperty('--mouse-y', `${yPercent}%`);

      // Apply subtle radial gradient
      const overlay = card.querySelector('.card-overlay') || this.createCardOverlay(card);
      overlay.style.background = `
        radial-gradient(circle 300px at ${xPercent}% ${yPercent}%,
          rgba(255, 233, 0, 0.08),
          transparent
        )
      `;
    }

    /**
     * Create card overlay for gradient effect
     */
    createCardOverlay(card) {
      const overlay = document.createElement('div');
      overlay.className = 'card-overlay';
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        border-radius: inherit;
        transition: background 0.3s ease;
        z-index: 0;
      `;

      card.style.position = 'relative';
      card.insertBefore(overlay, card.firstChild);

      // Ensure content is above overlay
      Array.from(card.children).forEach(child => {
        if (child !== overlay && !child.style.position) {
          child.style.position = 'relative';
          child.style.zIndex = '1';
        }
      });

      return overlay;
    }

    /**
     * Reset card gradient
     */
    resetCardGradient(card) {
      const overlay = card.querySelector('.card-overlay');
      if (overlay) {
        overlay.style.background = '';
      }
    }

    /**
     * Initialize card entrance animations
     */
    initializeCardAnimations() {
      this.serviceCards.forEach((card, index) => {
        // Set initial state
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';

        // Animate in with stagger
        setTimeout(() => {
          card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 80 + 300);
      });
    }
  }

  /**
   * Language Toggle Handler
   */
  class LanguageToggle {
    constructor() {
      this.langToggle = document.getElementById('lang-toggle');
      this.currentLang = 'EN';

      if (this.langToggle) {
        this.init();
      }
    }

    init() {
      this.langToggle.addEventListener('click', () => {
        this.toggleLanguage();
      });
    }

    toggleLanguage() {
      const currentLangElement = document.querySelector('.lang-current');

      if (currentLangElement) {
        this.currentLang = this.currentLang === 'EN' ? 'RU' : 'EN';
        currentLangElement.textContent = this.currentLang;

        console.log(`Language switched to: ${this.currentLang}`);

        // Here you would typically load translations
        // For now, just show a notification
        if (window.servicesController) {
          window.servicesController.showNotification(
            '🌐 Language',
            `Switched to ${this.currentLang}. Full translations coming soon!`,
            'info'
          );
        }
      }
    }
  }

  /**
   * Add required CSS animations dynamically
   */
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple-expand {
        from {
          transform: translate(-50%, -50%) scale(0);
          opacity: 1;
        }
        to {
          transform: translate(-50%, -50%) scale(30);
          opacity: 0;
        }
      }

      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }

      .custom-notification strong {
        display: block;
        margin-bottom: 0.5rem;
        color: #FFE900;
        font-size: 1.1rem;
      }

      .custom-notification p {
        margin: 0;
        color: #B7BDC6;
        line-height: 1.5;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Initialize on DOM ready
   */
  function init() {
    // Inject required styles
    injectStyles();

    // Initialize controllers
    window.servicesController = new ServicesController();
    window.languageToggle = new LanguageToggle();

    console.log('✅ Services page fully loaded and interactive');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
