/**
 * Cosmic Animations Initialization
 * Creates starfield and particle effects for the hero section
 */

(function() {
  'use strict';

  /**
   * Create animated starfield
   */
  function createStarfield() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;

    const starCount = 150; // Number of stars
    const hero = document.querySelector('.hero');
    const heroRect = hero?.getBoundingClientRect();

    if (!heroRect) return;

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';

      // Random position
      const x = Math.random() * 100;
      const y = Math.random() * 100;

      // Random size (1-3px)
      const size = Math.random() * 2 + 0.5;

      // Random animation delay and duration
      const delay = Math.random() * 3;
      const duration = 2 + Math.random() * 2;

      star.style.cssText = `
        left: ${x}%;
        top: ${y}%;
        width: ${size}px;
        height: ${size}px;
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
      `;

      starfield.appendChild(star);
    }

    console.log(`Created ${starCount} stars`);
  }

  /**
   * Create floating particles
   */
  function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 25; // Number of particles

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';

      // Random horizontal position
      const x = Math.random() * 100;

      // Random start position (from bottom)
      const startY = 100 + Math.random() * 20;

      // Random animation delay and duration
      const delay = Math.random() * 10;
      const duration = 15 + Math.random() * 10;

      // Random horizontal drift
      const drift = (Math.random() - 0.5) * 100;

      particle.style.cssText = `
        left: ${x}%;
        bottom: ${-startY}%;
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
      `;

      // Custom animation with drift
      particle.style.setProperty('--drift', `${drift}px`);

      particlesContainer.appendChild(particle);
    }

    console.log(`Created ${particleCount} particles`);
  }

  /**
   * Add mouse parallax effect
   */
  function initMouseParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Smooth parallax animation
    function animate() {
      // Smooth interpolation
      currentX += (mouseX - currentX) * 0.05;
      currentY += (mouseY - currentY) * 0.05;

      // Apply parallax to orbs
      const orbs = document.querySelectorAll('.gradient-orb');
      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 0.5;
        orb.style.transform = `translate(${currentX * speed * 10}px, ${currentY * speed * 10}px)`;
      });

      // Apply parallax to shapes
      const shapes = document.querySelectorAll('.shape');
      shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.3;
        shape.style.transform = `translate(${currentX * speed * 5}px, ${currentY * speed * 5}px)`;
      });

      requestAnimationFrame(animate);
    }

    animate();
    console.log('Mouse parallax initialized');
  }

  /**
   * Add scroll parallax effect
   */
  function initScrollParallax() {
    const hero = document.querySelector('.hero');
    const heroBackground = document.querySelector('.hero-background');
    if (!hero || !heroBackground) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          const heroHeight = hero.offsetHeight;

          // Only apply parallax when hero is in view
          if (scrolled < heroHeight) {
            // Parallax for background
            heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;

            // Parallax for stars (slower)
            const starfield = document.getElementById('starfield');
            if (starfield) {
              starfield.style.transform = `translateY(${scrolled * 0.3}px)`;
            }

            // Parallax for particles (faster)
            const particles = document.getElementById('particles');
            if (particles) {
              particles.style.transform = `translateY(${scrolled * 0.7}px)`;
            }
          }

          ticking = false;
        });

        ticking = true;
      }
    });

    console.log('Scroll parallax initialized');
  }

  /**
   * Add interactive hover glow to cards
   */
  function initCardHoverGlow() {
    const cards = document.querySelectorAll('.card, .service-card, .pricing-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create radial gradient at cursor position
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // Apply glow effect
        card.style.background = `
          radial-gradient(
            600px circle at ${x}px ${y}px,
            rgba(147, 51, 234, 0.1),
            rgba(30, 32, 38, 0.4)
          )
        `;
      });

      card.addEventListener('mouseleave', () => {
        card.style.background = '';
      });
    });

    console.log(`Interactive glow added to ${cards.length} cards`);
  }

  /**
   * Add button ripple effect
   */
  function initButtonRipple() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');

    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transform: translate(-50%, -50%);
          animation: ripple-animation 0.6s ease-out;
          pointer-events: none;
        `;

        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });

    // Add ripple animation CSS
    if (!document.getElementById('ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple-animation {
          to {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    console.log(`Ripple effect added to ${buttons.length} buttons`);
  }

  /**
   * Performance optimization - reduce animations on low-end devices
   */
  function optimizeForPerformance() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      console.log('Reduced motion detected - simplifying animations');
      document.body.classList.add('reduce-motion');
      return;
    }

    // Check device performance
    const isLowEndDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isLowEndDevice) {
      console.log('Mobile device detected - optimizing animations');

      // Reduce star count on mobile
      const stars = document.querySelectorAll('.star');
      stars.forEach((star, index) => {
        if (index % 2 === 0) star.remove();
      });

      // Reduce particle count on mobile
      const particles = document.querySelectorAll('.particle');
      particles.forEach((particle, index) => {
        if (index % 2 === 0) particle.remove();
      });
    }
  }

  /**
   * Initialize all cosmic effects
   */
  function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    console.log('Initializing cosmic animations...');

    try {
      // Create visual elements
      createStarfield();
      createParticles();

      // Add interactive effects
      initMouseParallax();
      initScrollParallax();
      initCardHoverGlow();
      initButtonRipple();

      // Performance optimization
      optimizeForPerformance();

      console.log('Cosmic animations initialized successfully');
    } catch (error) {
      console.error('Error initializing cosmic animations:', error);
    }
  }

  // Start initialization
  init();

  // Expose for external access if needed
  window.cosmicInit = {
    createStarfield,
    createParticles,
    initMouseParallax,
    initScrollParallax
  };

})();
