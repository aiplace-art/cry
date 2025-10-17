/* ===================================
   HypeAI Dashboard - Mobile Features
   Touch gestures, mobile navigation
   =================================== */

// Mobile Navigation
function initMobileNav() {
    const navItems = document.querySelectorAll('.mobile-nav-item');
    const sections = document.querySelectorAll('section[id]');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Scroll to section
            const targetId = item.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Update active nav on scroll
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateActiveNav(sections, navItems);
                ticking = false;
            });
            ticking = true;
        }
    });
}

function updateActiveNav(sections, navItems) {
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${sectionId}`) {
                    item.classList.add('active');
                }
            });
        }
    });
}

// Touch Gestures
let touchStartX = 0;
let touchStartY = 0;

function initTouchGestures() {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
}

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
    if (!touchStartX || !touchStartY) return;

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;

    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe left
                navigateSection('next');
            } else {
                // Swipe right
                navigateSection('prev');
            }
        }
    }

    touchStartX = 0;
    touchStartY = 0;
}

function navigateSection(direction) {
    const activeNav = document.querySelector('.mobile-nav-item.active');
    if (!activeNav) return;

    const navItems = Array.from(document.querySelectorAll('.mobile-nav-item'));
    const currentIndex = navItems.indexOf(activeNav);

    let nextIndex;
    if (direction === 'next') {
        nextIndex = (currentIndex + 1) % navItems.length;
    } else {
        nextIndex = (currentIndex - 1 + navItems.length) % navItems.length;
    }

    navItems[nextIndex].click();
}

// Orientation Change
function handleOrientationChange() {
    // Reload charts on orientation change
    if (window.HypeAICharts && typeof window.HypeAICharts.updateCharts === 'function') {
        setTimeout(() => {
            window.HypeAICharts.updateCharts();
        }, 300);
    }
}

// Viewport Height Fix (for mobile browsers)
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Initialize
function initMobile() {
    // Check if mobile
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    initMobileNav();
    initTouchGestures();
    setVH();

    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            setVH();
            handleOrientationChange();
        }, 100);
    });

    // Handle resize
    window.addEventListener('resize', () => {
        setVH();
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobile);
} else {
    initMobile();
}
