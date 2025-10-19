/**
 * HypeAI Variant 2 - Mobile Interactions
 * Handles hamburger menu, touch interactions, and mobile optimizations
 */

(function() {
    'use strict';

    // DOM Elements
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.nav-mobile');
    const mobileNavLinks = document.querySelectorAll('.nav-mobile a');
    const body = document.body;

    // State
    let isMenuOpen = false;

    /**
     * Toggle mobile menu
     */
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isMenuOpen);

        // Prevent body scroll when menu is open
        if (isMenuOpen) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    }

    /**
     * Close mobile menu
     */
    function closeMenu() {
        if (isMenuOpen) {
            isMenuOpen = false;
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
        }
    }

    /**
     * Handle hamburger click
     */
    if (hamburger) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });
    }

    /**
     * Close menu when clicking navigation links
     */
    mobileNavLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });

    /**
     * Close menu when clicking outside
     */
    document.addEventListener('click', function(e) {
        if (isMenuOpen && !mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
            closeMenu();
        }
    });

    /**
     * Close menu on ESC key
     */
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
            hamburger.focus();
        }
    });

    /**
     * Handle window resize
     */
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Close mobile menu when switching to desktop
            if (window.innerWidth >= 1024 && isMenuOpen) {
                closeMenu();
            }
        }, 250);
    });

    /**
     * Lazy load images
     */
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(function(img) {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for older browsers
            images.forEach(function(img) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }

    /**
     * Smooth scroll for anchor links
     */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                // Don't prevent default for # only links
                if (href === '#') return;

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL without jumping
                    if (history.pushState) {
                        history.pushState(null, null, href);
                    }
                }
            });
        });
    }

    /**
     * Add touch feedback to buttons
     */
    function initTouchFeedback() {
        const buttons = document.querySelectorAll('button, .btn-bnb-primary');

        buttons.forEach(function(button) {
            button.addEventListener('touchstart', function() {
                this.style.opacity = '0.8';
            });

            button.addEventListener('touchend', function() {
                this.style.opacity = '';
            });

            button.addEventListener('touchcancel', function() {
                this.style.opacity = '';
            });
        });
    }

    /**
     * Detect if device is touch-enabled
     */
    function detectTouch() {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        if (isTouch) {
            document.body.classList.add('touch-device');
        } else {
            document.body.classList.add('no-touch');
        }
    }

    /**
     * Initialize performance monitoring
     */
    function initPerformanceMonitoring() {
        if ('PerformanceObserver' in window) {
            // Monitor Largest Contentful Paint (LCP)
            const lcpObserver = new PerformanceObserver(function(entries) {
                const lastEntry = entries.getEntries().pop();
                if (lastEntry) {
                    console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
                }
            });

            try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // LCP not supported
            }

            // Monitor First Input Delay (FID)
            const fidObserver = new PerformanceObserver(function(entries) {
                entries.getEntries().forEach(function(entry) {
                    console.log('FID:', entry.processingStart - entry.startTime);
                });
            });

            try {
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                // FID not supported
            }
        }
    }

    /**
     * Check if user prefers reduced motion
     */
    function respectReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduce-motion');
        }
    }

    /**
     * Initialize viewport height fix for mobile browsers
     */
    function initViewportFix() {
        // Fix for mobile browsers with dynamic URL bars
        const setVH = function() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', vh + 'px');
        };

        setVH();
        window.addEventListener('resize', setVH);
    }

    /**
     * Initialize all features
     */
    function init() {
        detectTouch();
        lazyLoadImages();
        initSmoothScroll();
        initTouchFeedback();
        respectReducedMotion();
        initViewportFix();

        // Only init performance monitoring in development
        if (window.location.hostname === 'localhost') {
            initPerformanceMonitoring();
        }

        console.log('HypeAI Mobile v2.0 - Ready');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose public API
    window.HypeAIMobile = {
        closeMenu: closeMenu,
        toggleMenu: toggleMenu
    };

})();
