/**
 * Mobile Navigation Handler
 * Hamburger menu and mobile navigation functionality
 * @version 1.0.0
 */

(function() {
  'use strict';

  /**
   * Mobile Navigation Controller
   */
  class MobileNav {
    constructor() {
      this.isOpen = false;
      this.hamburger = null;
      this.overlay = null;
      this.body = document.body;

      this.init();
    }

    /**
     * Initialize mobile navigation
     */
    init() {
      // Create hamburger button
      this.createHamburgerButton();

      // Create mobile overlay
      this.createMobileOverlay();

      // Setup event listeners
      this.setupEventListeners();

      console.log('✅ Mobile navigation initialized');
    }

    /**
     * Create hamburger menu button
     */
    createHamburgerButton() {
      // Find header nav actions container
      const headerActions = document.querySelector('.header-content .nav') ||
                           document.querySelector('.nav-actions') ||
                           document.querySelector('.header-content');

      if (!headerActions) {
        console.warn('Header nav not found');
        return;
      }

      // Create hamburger button
      this.hamburger = document.createElement('button');
      this.hamburger.className = 'hamburger';
      this.hamburger.setAttribute('aria-label', 'Toggle navigation menu');
      this.hamburger.setAttribute('aria-expanded', 'false');
      this.hamburger.innerHTML = `
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      `;

      // Insert hamburger before or after nav
      const insertionPoint = headerActions.parentElement;
      if (insertionPoint) {
        insertionPoint.appendChild(this.hamburger);
      }
    }

    /**
     * Create mobile navigation overlay
     */
    createMobileOverlay() {
      // Find existing nav
      const desktopNav = document.querySelector('.nav') ||
                        document.querySelector('.nav-list')?.parentElement;

      if (!desktopNav) {
        console.warn('Desktop nav not found');
        return;
      }

      // Clone nav links
      const navList = desktopNav.querySelector('.nav-list');
      const clonedNavList = navList ? navList.cloneNode(true) : null;

      // Clone language switcher
      const langSwitcher = document.querySelector('.language-switcher');
      const clonedLangSwitcher = langSwitcher ? langSwitcher.cloneNode(true) : null;

      // Clone CTA button
      const ctaButton = document.querySelector('.btn-primary');
      const clonedCTA = ctaButton ? ctaButton.cloneNode(true) : null;

      // Create overlay
      this.overlay = document.createElement('div');
      this.overlay.className = 'mobile-nav-overlay';
      this.overlay.setAttribute('aria-hidden', 'true');

      // Build overlay content
      const overlayContent = document.createElement('div');
      overlayContent.className = 'mobile-nav-content';

      if (clonedNavList) {
        overlayContent.appendChild(clonedNavList);
      }

      if (clonedLangSwitcher) {
        overlayContent.appendChild(clonedLangSwitcher);
      }

      if (clonedCTA) {
        overlayContent.appendChild(clonedCTA);
      }

      this.overlay.appendChild(overlayContent);

      // Append to body
      this.body.appendChild(this.overlay);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
      if (!this.hamburger) return;

      // Hamburger click
      this.hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      // Overlay links click - close menu
      if (this.overlay) {
        const overlayLinks = this.overlay.querySelectorAll('a');
        overlayLinks.forEach(link => {
          link.addEventListener('click', () => {
            this.close();
          });
        });
      }

      // ESC key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // Click outside to close
      document.addEventListener('click', (e) => {
        if (this.isOpen &&
            !this.overlay.contains(e.target) &&
            !this.hamburger.contains(e.target)) {
          this.close();
        }
      });

      // Window resize - close on desktop
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (window.innerWidth > 768 && this.isOpen) {
            this.close();
          }
        }, 250);
      });
    }

    /**
     * Toggle menu open/close
     */
    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    /**
     * Open menu
     */
    open() {
      this.isOpen = true;

      if (this.hamburger) {
        this.hamburger.classList.add('active');
        this.hamburger.setAttribute('aria-expanded', 'true');
      }

      if (this.overlay) {
        this.overlay.classList.add('active');
        this.overlay.setAttribute('aria-hidden', 'false');
      }

      // Prevent body scroll
      this.body.style.overflow = 'hidden';

      // Focus management
      this.trapFocus();
    }

    /**
     * Close menu
     */
    close() {
      this.isOpen = false;

      if (this.hamburger) {
        this.hamburger.classList.remove('active');
        this.hamburger.setAttribute('aria-expanded', 'false');
      }

      if (this.overlay) {
        this.overlay.classList.remove('active');
        this.overlay.setAttribute('aria-hidden', 'true');
      }

      // Restore body scroll
      this.body.style.overflow = '';

      // Return focus to hamburger
      if (this.hamburger) {
        this.hamburger.focus();
      }
    }

    /**
     * Trap focus within overlay when open
     */
    trapFocus() {
      if (!this.overlay) return;

      const focusableElements = this.overlay.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Focus first element
      firstElement.focus();

      // Handle tab navigation
      this.overlay.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      });
    }
  }

  /**
   * Mobile viewport height fix (iOS)
   * Fixes 100vh issues on mobile browsers
   */
  function setMobileVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  /**
   * Detect mobile browser
   */
  function detectMobile() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      document.documentElement.classList.add('mobile-device');
    }

    // Detect iOS
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS) {
      document.documentElement.classList.add('ios-device');
    }

    // Detect Android
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) {
      document.documentElement.classList.add('android-device');
    }

    return isMobile;
  }

  /**
   * Prevent zoom on double-tap (iOS)
   */
  function preventDoubleTapZoom() {
    let lastTouchEnd = 0;

    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  }

  /**
   * Initialize on DOM ready
   */
  function init() {
    // Detect mobile
    const isMobile = detectMobile();

    // Set mobile viewport height
    setMobileVH();
    window.addEventListener('resize', setMobileVH);

    // Initialize mobile nav
    window.mobileNav = new MobileNav();

    // Prevent double-tap zoom on iOS
    if (isMobile) {
      preventDoubleTapZoom();
    }

    console.log('✅ Mobile enhancements loaded');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
