/**
 * Mobile Navigation - Perfect iOS Experience
 * Hamburger menu with smooth animations and accessibility
 * @version 2.0 - Complete Rewrite
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
      this.focusableElements = [];
      this.lastFocusedElement = null;

      this.init();
    }

    /**
     * Initialize mobile navigation
     */
    init() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    /**
     * Setup navigation elements
     */
    setup() {
      this.createHamburger();
      this.createOverlay();
      this.setupEventListeners();
      this.setupViewportFix();

      console.log('✅ Mobile navigation initialized');
    }

    /**
     * Create hamburger button
     */
    createHamburger() {
      // Find header
      const header = document.querySelector('.header-content') ||
                     document.querySelector('.header');

      if (!header) {
        console.warn('⚠️ Header not found');
        return;
      }

      // Create hamburger
      this.hamburger = document.createElement('button');
      this.hamburger.className = 'hamburger';
      this.hamburger.setAttribute('type', 'button');
      this.hamburger.setAttribute('aria-label', 'Toggle navigation menu');
      this.hamburger.setAttribute('aria-expanded', 'false');
      this.hamburger.setAttribute('aria-controls', 'mobile-nav-overlay');

      this.hamburger.innerHTML = `
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      `;

      // Create header actions container if needed
      let headerActions = header.querySelector('.header-actions');
      if (!headerActions) {
        headerActions = document.createElement('div');
        headerActions.className = 'header-actions';
        header.appendChild(headerActions);
      }

      // Insert hamburger
      headerActions.appendChild(this.hamburger);
    }

    /**
     * Create mobile overlay
     */
    createOverlay() {
      // Get navigation elements
      const desktopNav = document.querySelector('.nav');
      const langSwitcher = document.querySelector('.language-switcher');
      const ctaButton = document.querySelector('.btn-primary');

      console.log('🔍 Creating overlay - Found elements:', {
        desktopNav: !!desktopNav,
        langSwitcher: !!langSwitcher,
        ctaButton: !!ctaButton
      });

      // Create overlay
      this.overlay = document.createElement('div');
      this.overlay.id = 'mobile-nav-overlay';
      this.overlay.className = 'mobile-nav-overlay';
      this.overlay.setAttribute('aria-hidden', 'true');
      this.overlay.setAttribute('role', 'dialog');
      this.overlay.setAttribute('aria-modal', 'true');

      // Create content container
      const content = document.createElement('div');
      content.className = 'mobile-nav-content';

      // Clone and add navigation - WITH FALLBACK
      if (desktopNav) {
        const navList = desktopNav.querySelector('.nav-list');
        if (navList) {
          const clonedNav = navList.cloneNode(true);
          console.log('✅ Menu items cloned:', clonedNav.querySelectorAll('li').length);
          content.appendChild(clonedNav);
        } else {
          console.warn('⚠️ .nav-list not found, creating fallback menu');
          content.appendChild(this.createFallbackMenu());
        }
      } else {
        console.warn('⚠️ .nav not found, creating fallback menu');
        content.appendChild(this.createFallbackMenu());
      }

      // Clone and add language switcher
      if (langSwitcher) {
        const clonedLang = langSwitcher.cloneNode(true);
        clonedLang.classList.add('mobile-lang-switcher');
        // Re-initialize language switcher for clone
        this.initLanguageSwitcher(clonedLang);
        content.appendChild(clonedLang);
        console.log('✅ Language switcher cloned');
      } else {
        console.warn('⚠️ Language switcher not found');
      }

      // Clone and add CTA
      if (ctaButton) {
        const clonedCTA = ctaButton.cloneNode(true);
        clonedCTA.setAttribute('tabindex', '0');
        clonedCTA.classList.add('mobile-cta');
        content.appendChild(clonedCTA);
        console.log('✅ CTA button cloned');
      }

      this.overlay.appendChild(content);
      this.body.appendChild(this.overlay);

      console.log('✅ Mobile overlay created successfully');
    }

    /**
     * Create fallback navigation menu
     */
    createFallbackMenu() {
      const navList = document.createElement('ul');
      navList.className = 'nav-list';

      const menuItems = [
        { href: 'index.html', text: 'Home' },
        { href: 'services.html', text: 'Services', active: true },
        { href: 'index.html#tokenomics', text: 'Tokenomics' },
        { href: 'index.html#roadmap', text: 'Roadmap' },
        { href: 'index.html#contact', text: 'Contact' }
      ];

      menuItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'nav-item';

        const a = document.createElement('a');
        a.href = item.href;
        a.className = 'nav-link' + (item.active ? ' active' : '');
        a.textContent = item.text;

        li.appendChild(a);
        navList.appendChild(li);
      });

      console.log('✅ Fallback menu created with', menuItems.length, 'items');
      return navList;
    }

    /**
     * Initialize language switcher in overlay
     */
    initLanguageSwitcher(switcher) {
      const btn = switcher.querySelector('.lang-btn');
      const dropdown = switcher.querySelector('.lang-dropdown');

      if (!btn || !dropdown) return;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
        const isExpanded = dropdown.classList.contains('active');
        btn.setAttribute('aria-expanded', isExpanded);
      });

      // Close dropdown when option selected
      const options = dropdown.querySelectorAll('.lang-option');
      options.forEach(option => {
        option.addEventListener('click', () => {
          dropdown.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
        });
      });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
      if (!this.hamburger || !this.overlay) return;

      // Hamburger click
      this.hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      // Overlay link clicks - close menu
      const links = this.overlay.querySelectorAll('a, .btn');
      links.forEach(link => {
        link.addEventListener('click', () => {
          // Small delay for visual feedback
          setTimeout(() => this.close(), 100);
        });
      });

      // ESC key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // Click outside overlay
      document.addEventListener('click', (e) => {
        if (this.isOpen &&
            !this.overlay.contains(e.target) &&
            !this.hamburger.contains(e.target)) {
          this.close();
        }
      });

      // Prevent clicks inside overlay from closing
      this.overlay.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // Window resize - close on desktop
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (window.innerWidth > 768 && this.isOpen) {
            this.close();
          }
        }, 250);
      });

      // Orientation change
      window.addEventListener('orientationchange', () => {
        if (this.isOpen) {
          // Recalculate viewport on orientation change
          setTimeout(() => this.setupViewportFix(), 300);
        }
      });
    }

    /**
     * Toggle menu
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
      // Store last focused element
      this.lastFocusedElement = document.activeElement;

      this.isOpen = true;

      // Update hamburger
      if (this.hamburger) {
        this.hamburger.classList.add('active');
        this.hamburger.setAttribute('aria-expanded', 'true');
      }

      // Show overlay
      if (this.overlay) {
        this.overlay.classList.add('active');
        this.overlay.setAttribute('aria-hidden', 'false');
      }

      // Prevent body scroll
      this.body.style.overflow = 'hidden';
      this.body.style.position = 'fixed'; // iOS Safari fix
      this.body.style.width = '100%';
      this.body.style.top = `-${window.scrollY}px`;

      // Focus management
      this.setupFocusTrap();

      // Announce to screen readers
      this.announce('Navigation menu opened');
    }

    /**
     * Close menu
     */
    close() {
      this.isOpen = false;

      // Update hamburger
      if (this.hamburger) {
        this.hamburger.classList.remove('active');
        this.hamburger.setAttribute('aria-expanded', 'false');
      }

      // Hide overlay
      if (this.overlay) {
        this.overlay.classList.remove('active');
        this.overlay.setAttribute('aria-hidden', 'true');
      }

      // Restore scroll
      const scrollY = Math.abs(parseInt(this.body.style.top || '0'));
      this.body.style.overflow = '';
      this.body.style.position = '';
      this.body.style.width = '';
      this.body.style.top = '';
      window.scrollTo(0, scrollY);

      // Restore focus
      if (this.lastFocusedElement) {
        this.lastFocusedElement.focus();
      } else if (this.hamburger) {
        this.hamburger.focus();
      }

      // Announce to screen readers
      this.announce('Navigation menu closed');
    }

    /**
     * Setup focus trap
     */
    setupFocusTrap() {
      if (!this.overlay) return;

      // Get focusable elements
      this.focusableElements = Array.from(
        this.overlay.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      if (this.focusableElements.length === 0) return;

      const firstElement = this.focusableElements[0];
      const lastElement = this.focusableElements[this.focusableElements.length - 1];

      // Focus first element
      setTimeout(() => firstElement.focus(), 100);

      // Trap focus
      const trapFocus = (e) => {
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
      };

      // Add listener
      this.overlay.addEventListener('keydown', trapFocus);

      // Store for cleanup
      this.overlay._trapFocus = trapFocus;
    }

    /**
     * Setup viewport height fix for iOS
     */
    setupViewportFix() {
      // Fix for iOS Safari 100vh issue
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      setVH();
      window.addEventListener('resize', setVH);
      window.addEventListener('orientationchange', () => {
        setTimeout(setVH, 300);
      });
    }

    /**
     * Announce to screen readers
     */
    announce(message) {
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      this.body.appendChild(announcement);

      setTimeout(() => {
        this.body.removeChild(announcement);
      }, 1000);
    }
  }

  /**
   * Mobile detection and device classes
   */
  function detectDevice() {
    const ua = navigator.userAgent;
    const html = document.documentElement;

    // Detect mobile
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      html.classList.add('mobile-device');
    }

    // Detect iOS
    if (/iPhone|iPad|iPod/i.test(ua)) {
      html.classList.add('ios-device');
    }

    // Detect Android
    if (/Android/i.test(ua)) {
      html.classList.add('android-device');
    }

    // Detect standalone mode (PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      html.classList.add('standalone-mode');
    }
  }

  /**
   * Prevent double-tap zoom on iOS
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
   * Add screen reader only styles
   */
  function addA11yStyles() {
    if (!document.getElementById('mobile-a11y-styles')) {
      const style = document.createElement('style');
      style.id = 'mobile-a11y-styles';
      style.textContent = `
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Initialize
   */
  function init() {
    // Detect device
    detectDevice();

    // Add accessibility styles
    addA11yStyles();

    // Initialize mobile nav
    window.mobileNav = new MobileNav();

    // Prevent double-tap zoom on mobile
    if (document.documentElement.classList.contains('mobile-device')) {
      preventDoubleTapZoom();
    }

    console.log('✅ Mobile enhancements loaded');
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.MobileNav = MobileNav;

})();
