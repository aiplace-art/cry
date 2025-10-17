/**
 * Navigation System with Smooth Scrolling
 * Features: smooth scroll, active section highlighting, mobile menu
 * Browser support: Chrome, Safari, Firefox, Edge, iOS Safari, Chrome Mobile
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    headerOffset: 100,
    scrollDuration: 800,
    throttleDelay: 100,
    mobileBreakpoint: 768,
    activeClass: 'active',
    sections: ['services', 'token-growth', 'ai-agents']
  };

  // State
  let isScrolling = false;
  let ticking = false;

  /**
   * Initialize navigation system
   */
  function init() {
    setupSmoothScroll();
    setupActiveSection();
    setupMobileMenu();
    setupKeyboardShortcuts();
  }

  /**
   * Smooth scroll functionality with easing
   */
  function setupSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
      link.addEventListener('click', handleSmoothScroll);
    });
  }

  /**
   * Handle smooth scroll on link click
   */
  function handleSmoothScroll(e) {
    const href = e.currentTarget.getAttribute('href');

    // Ignore empty hash or just '#'
    if (!href || href === '#' || href === '#!') {
      return;
    }

    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (!targetElement) {
      return;
    }

    e.preventDefault();

    // Close mobile menu if open
    closeMobileMenu();

    // Perform smooth scroll
    smoothScrollTo(targetElement);
  }

  /**
   * Smooth scroll to element with easing
   * @param {HTMLElement} target - Target element to scroll to
   */
  function smoothScrollTo(target) {
    if (isScrolling) return;

    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - CONFIG.headerOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    // Check for native smooth scroll support
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      return;
    }

    // Fallback: Manual smooth scroll with easing
    isScrolling = true;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / CONFIG.scrollDuration, 1);

      // Ease-in-out cubic easing function
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startPosition + distance * ease);

      if (timeElapsed < CONFIG.scrollDuration) {
        requestAnimationFrame(animation);
      } else {
        isScrolling = false;
      }
    }

    requestAnimationFrame(animation);
  }

  /**
   * Active section highlighting on scroll
   */
  function setupActiveSection() {
    window.addEventListener('scroll', throttle(updateActiveSection, CONFIG.throttleDelay));

    // Initial check
    updateActiveSection();
  }

  /**
   * Update active section based on scroll position
   */
  function updateActiveSection() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollPosition = window.pageYOffset + CONFIG.headerOffset + 50;
        let currentSection = null;

        // Find current section
        CONFIG.sections.forEach(sectionId => {
          const section = document.getElementById(sectionId);
          if (!section) return;

          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;

          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            currentSection = sectionId;
          }
        });

        // Update active states
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
          const href = link.getAttribute('href').substring(1);

          if (href === currentSection) {
            link.classList.add(CONFIG.activeClass);
          } else {
            link.classList.remove(CONFIG.activeClass);
          }
        });

        ticking = false;
      });

      ticking = true;
    }
  }

  /**
   * Mobile hamburger menu functionality
   */
  function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const nav = document.querySelector('nav');

    if (!hamburger) return;

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', toggleMobileMenu);

    // Close menu on link click
    const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!nav || !nav.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Prevent menu close when clicking inside
    if (mobileMenu) {
      mobileMenu.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }

  /**
   * Toggle mobile menu
   */
  function toggleMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;

    if (!hamburger || !mobileMenu) return;

    const isOpen = hamburger.classList.contains('active');

    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  /**
   * Open mobile menu
   */
  function openMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;

    if (!hamburger || !mobileMenu) return;

    hamburger.classList.add('active');
    mobileMenu.classList.add('active');
    body.style.overflow = 'hidden';
  }

  /**
   * Close mobile menu
   */
  function closeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;

    if (!hamburger || !mobileMenu) return;

    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    body.style.overflow = '';
  }

  /**
   * Keyboard shortcuts
   */
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // ESC key closes mobile menu
      if (e.key === 'Escape' || e.keyCode === 27) {
        closeMobileMenu();
      }
    });
  }

  /**
   * Throttle function for performance
   * @param {Function} func - Function to throttle
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Throttled function
   */
  function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(this, args);
      }
    };
  }

  /**
   * Debounce function for resize events
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    // Close mobile menu on desktop
    if (window.innerWidth > CONFIG.mobileBreakpoint) {
      closeMobileMenu();
    }
  }

  // Setup resize handler
  window.addEventListener('resize', debounce(handleResize, 250));

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API
  window.Navigation = {
    scrollTo: smoothScrollTo,
    closeMobileMenu: closeMobileMenu,
    openMobileMenu: openMobileMenu,
    toggleMobileMenu: toggleMobileMenu
  };

})();
