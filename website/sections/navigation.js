/**
 * HypeAI Navigation Helper
 *
 * Features:
 * - Smooth scroll to sections (60 FPS)
 * - Active section highlighting as user scrolls
 * - Mobile hamburger menu support
 * - Keyboard accessible navigation
 * - Performance optimized with RAF and throttling
 */

class HypeAINavigation {
    constructor() {
        this.nav = document.querySelector('nav');
        this.navLinks = document.querySelectorAll('a[href^="#"]');
        this.sections = document.querySelectorAll('section[id]');
        this.mobileToggle = document.getElementById('mobileNavToggle');
        this.mobileMenu = document.getElementById('mobileNavMenu');
        this.headerHeight = 100; // Fixed header offset
        this.scrollThrottle = null;
        this.activeSection = null;

        this.init();
    }

    /**
     * Initialize navigation functionality
     */
    init() {
        this.setupSmoothScroll();
        this.setupScrollSpy();
        this.setupMobileMenu();
        this.setupKeyboardNavigation();
        this.setupIntersectionObserver();
    }

    /**
     * Setup smooth scroll behavior (60 FPS)
     */
    setupSmoothScroll() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                // Only handle anchor links
                if (!href.startsWith('#')) return;

                e.preventDefault();

                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    this.smoothScrollTo(targetSection);

                    // Close mobile menu if open
                    if (this.mobileMenu && this.mobileMenu.classList.contains('active')) {
                        this.toggleMobileMenu();
                    }

                    // Update URL without jumping
                    history.pushState(null, null, href);
                }
            });
        });
    }

    /**
     * Smooth scroll to element using requestAnimationFrame (60 FPS)
     */
    smoothScrollTo(element) {
        const targetPosition = element.offsetTop - this.headerHeight;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 800; // ms
        let start = null;

        const easeInOutCubic = (t) => {
            return t < 0.5
                ? 4 * t * t * t
                : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        };

        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);

            window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    }

    /**
     * Setup scroll spy with Intersection Observer (performance optimized)
     */
    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: `-${this.headerHeight}px 0px -50% 0px`,
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.setActiveLink(entry.target.id);
                }
            });
        }, observerOptions);

        this.sections.forEach(section => {
            observer.observe(section);
        });
    }

    /**
     * Setup fallback scroll spy for older browsers
     */
    setupScrollSpy() {
        const handleScroll = () => {
            // Throttle scroll events for performance
            if (this.scrollThrottle) return;

            this.scrollThrottle = setTimeout(() => {
                this.scrollThrottle = null;
                this.updateActiveLink();
            }, 100);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    /**
     * Update active link based on scroll position
     */
    updateActiveLink() {
        const scrollPosition = window.pageYOffset + this.headerHeight + 50;

        let currentSection = null;

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSection = section.id;
            }
        });

        if (currentSection && currentSection !== this.activeSection) {
            this.setActiveLink(currentSection);
        }
    }

    /**
     * Set active link styling
     */
    setActiveLink(sectionId) {
        this.activeSection = sectionId;

        // Remove active class from all links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current section link
        const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Setup mobile hamburger menu
     */
    setupMobileMenu() {
        if (!this.mobileToggle || !this.mobileMenu) return;

        this.mobileToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.mobileMenu.classList.contains('active') &&
                !this.mobileMenu.contains(e.target) &&
                !this.mobileToggle.contains(e.target)) {
                this.toggleMobileMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenu.classList.contains('active')) {
                this.toggleMobileMenu();
            }
        });
    }

    /**
     * Toggle mobile menu visibility
     */
    toggleMobileMenu() {
        if (!this.mobileToggle || !this.mobileMenu) return;

        const isActive = this.mobileMenu.classList.toggle('active');
        this.mobileToggle.classList.toggle('active', isActive);

        // Prevent body scroll when menu is open
        document.body.style.overflow = isActive ? 'hidden' : '';

        // Update ARIA attributes for accessibility
        this.mobileToggle.setAttribute('aria-expanded', isActive);
    }

    /**
     * Setup keyboard navigation (accessibility)
     */
    setupKeyboardNavigation() {
        this.navLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                // Arrow key navigation
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextLink = this.navLinks[index + 1] || this.navLinks[0];
                    nextLink.focus();
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevLink = this.navLinks[index - 1] || this.navLinks[this.navLinks.length - 1];
                    prevLink.focus();
                }
            });
        });
    }

    /**
     * Get current active section
     */
    getCurrentSection() {
        return this.activeSection;
    }

    /**
     * Navigate to section programmatically
     */
    navigateTo(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            this.smoothScrollTo(section);
            history.pushState(null, null, `#${sectionId}`);
        }
    }

    /**
     * Destroy navigation instance
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('scroll', this.updateActiveLink);
        if (this.mobileToggle) {
            this.mobileToggle.removeEventListener('click', this.toggleMobileMenu);
        }
    }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.hypeAINav = new HypeAINavigation();

    // Handle initial hash on page load
    if (window.location.hash) {
        setTimeout(() => {
            const targetId = window.location.hash.substring(1);
            window.hypeAINav.navigateTo(targetId);
        }, 100);
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HypeAINavigation;
}
