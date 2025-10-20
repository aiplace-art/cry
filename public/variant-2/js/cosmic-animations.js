/**
 * Cosmic Animation System
 * Premium space/galaxy animations for hero section
 * Performance-optimized with 60fps target
 */

class CosmicAnimations {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.stars = [];
    this.particles = [];
    this.animationFrame = null;
    this.isInitialized = false;
    this.mouseX = 0;
    this.mouseY = 0;

    // Performance settings
    this.targetFPS = 60;
    this.frameTime = 1000 / this.targetFPS;
    this.lastFrameTime = 0;

    // Configuration
    this.config = {
      stars: {
        count: 200,
        maxSize: 2.5,
        minSize: 0.5,
        twinkleSpeed: 0.02,
        parallaxFactor: 0.3
      },
      particles: {
        count: 30,
        maxSize: 4,
        minSize: 1,
        speed: 0.3,
        glowIntensity: 0.6
      },
      mouse: {
        interactionRadius: 150,
        repelForce: 0.5
      }
    };
  }

  /**
   * Initialize the cosmic animation system
   */
  init() {
    if (this.isInitialized) return;

    // Create canvas
    this.createCanvas();

    // Generate stars
    this.generateStars();

    // Generate particles
    this.generateParticles();

    // Setup event listeners
    this.setupEventListeners();

    // Start animation loop
    this.animate();

    this.isInitialized = true;
    console.log('Cosmic animations initialized');
  }

  /**
   * Create and setup canvas
   */
  createCanvas() {
    // Check if canvas already exists
    let existingCanvas = document.getElementById('cosmic-canvas');
    if (existingCanvas) {
      this.canvas = existingCanvas;
    } else {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'cosmic-canvas';
      this.canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
      `;

      const heroBackground = document.querySelector('.hero-background');
      if (heroBackground) {
        heroBackground.insertBefore(this.canvas, heroBackground.firstChild);
      }
    }

    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.resizeCanvas();
  }

  /**
   * Resize canvas to match container
   */
  resizeCanvas() {
    if (!this.canvas) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = hero.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';

    this.ctx.scale(dpr, dpr);

    // Regenerate stars and particles on resize
    if (this.isInitialized) {
      this.generateStars();
      this.generateParticles();
    }
  }

  /**
   * Generate starfield
   */
  generateStars() {
    this.stars = [];
    const { count, maxSize, minSize } = this.config.stars;

    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * (maxSize - minSize) + minSize,
        opacity: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleDirection: Math.random() > 0.5 ? 1 : -1,
        layer: Math.floor(Math.random() * 3) // 3 parallax layers
      });
    }
  }

  /**
   * Generate floating particles
   */
  generateParticles() {
    this.particles = [];
    const { count, maxSize, minSize, speed } = this.config.particles;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * (maxSize - minSize) + minSize,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        opacity: Math.random() * 0.5 + 0.3,
        hue: 45 + Math.random() * 10, // Yellow hue variations
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02
      });
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Mouse move for interactive effects
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    // Resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.resizeCanvas(), 150);
    });

    // Pause animation when tab is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  /**
   * Update stars (twinkling effect)
   */
  updateStars(scrollY) {
    this.stars.forEach(star => {
      // Twinkling
      star.opacity += star.twinkleSpeed * star.twinkleDirection;

      if (star.opacity <= 0.2 || star.opacity >= 1) {
        star.twinkleDirection *= -1;
      }

      // Parallax scrolling effect
      star.parallaxY = star.y + (scrollY * (star.layer * 0.1));
    });
  }

  /**
   * Update particles (floating effect)
   */
  updateParticles() {
    const { interactionRadius, repelForce } = this.config.mouse;

    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Pulse effect
      particle.pulsePhase += particle.pulseSpeed;
      particle.currentOpacity = particle.opacity + Math.sin(particle.pulsePhase) * 0.2;

      // Mouse interaction (repel)
      const dx = particle.x - this.mouseX;
      const dy = particle.y - this.mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < interactionRadius) {
        const force = (interactionRadius - distance) / interactionRadius;
        particle.x += (dx / distance) * force * repelForce;
        particle.y += (dy / distance) * force * repelForce;
      }

      // Boundary wrapping
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
    });
  }

  /**
   * Draw stars
   */
  drawStars(scrollY) {
    this.stars.forEach(star => {
      const y = star.parallaxY || star.y;

      // Skip if star is out of view
      if (y < -10 || y > this.canvas.height + 10) return;

      this.ctx.save();
      this.ctx.globalAlpha = star.opacity * 0.8;
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.shadowBlur = star.size * 2;
      this.ctx.shadowColor = '#FFFFFF';

      this.ctx.beginPath();
      this.ctx.arc(star.x, y, star.size, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  /**
   * Draw particles
   */
  drawParticles() {
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.currentOpacity;

      // Glow effect
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 3
      );

      gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 70%, 0.8)`);
      gradient.addColorStop(0.5, `hsla(${particle.hue}, 100%, 60%, 0.4)`);
      gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 50%, 0)`);

      this.ctx.fillStyle = gradient;

      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
      this.ctx.fill();

      // Core particle
      this.ctx.globalAlpha = 1;
      this.ctx.fillStyle = `hsl(${particle.hue}, 100%, 80%)`;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  /**
   * Main animation loop
   */
  animate(currentTime = 0) {
    if (!this.isInitialized) return;

    // Frame rate limiting
    const deltaTime = currentTime - this.lastFrameTime;

    if (deltaTime < this.frameTime) {
      this.animationFrame = requestAnimationFrame((time) => this.animate(time));
      return;
    }

    this.lastFrameTime = currentTime - (deltaTime % this.frameTime);

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Get scroll position for parallax
    const scrollY = window.pageYOffset;

    // Update and draw
    this.updateStars(scrollY);
    this.updateParticles();

    this.drawStars(scrollY);
    this.drawParticles();

    // Continue animation
    this.animationFrame = requestAnimationFrame((time) => this.animate(time));
  }

  /**
   * Pause animation
   */
  pause() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Resume animation
   */
  resume() {
    if (!this.animationFrame) {
      this.animate();
    }
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    this.pause();

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.stars = [];
    this.particles = [];
    this.isInitialized = false;

    console.log('Cosmic animations destroyed');
  }
}

// Text glow effect for hero elements
class TextGlowEffect {
  constructor() {
    this.elements = [];
    this.isActive = false;
  }

  /**
   * Initialize text glow effects
   */
  init() {
    // Find elements with gradient-text class
    const gradientTexts = document.querySelectorAll('.gradient-text');
    const statValues = document.querySelectorAll('.stat-value');
    const heroLabel = document.querySelector('.hero-label');

    this.elements = [...gradientTexts, ...statValues];
    if (heroLabel) this.elements.push(heroLabel);

    this.applyGlow();
    this.isActive = true;
  }

  /**
   * Apply subtle pulsing glow
   */
  applyGlow() {
    this.elements.forEach((element, index) => {
      // Add CSS animation with staggered delay
      const delay = index * 0.2;
      element.style.animation = `text-pulse 3s ease-in-out ${delay}s infinite`;
    });
  }

  /**
   * Remove glow effects
   */
  remove() {
    this.elements.forEach(element => {
      element.style.animation = '';
    });
    this.isActive = false;
  }
}

// Interactive hover effects for cards
class CosmicHoverEffects {
  constructor() {
    this.cards = [];
  }

  /**
   * Initialize hover effects
   */
  init() {
    const cards = document.querySelectorAll('.card, .service-card, .pricing-card');
    this.cards = Array.from(cards);

    this.cards.forEach(card => {
      this.setupCardEffect(card);
    });
  }

  /**
   * Setup individual card effect
   */
  setupCardEffect(card) {
    let sparkles = [];

    card.addEventListener('mouseenter', (e) => {
      this.createSparkles(card, e);
    });

    card.addEventListener('mousemove', (e) => {
      this.updateCardGlow(card, e);
    });

    card.addEventListener('mouseleave', () => {
      this.removeCardGlow(card);
    });
  }

  /**
   * Create sparkle effect on card
   */
  createSparkles(card, event) {
    const sparkleCount = 5;

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
          animation: sparkle-fade 1s ease-out forwards;
          z-index: 10;
        `;

        card.style.position = 'relative';
        card.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 1000);
      }, i * 100);
    }
  }

  /**
   * Update card glow based on mouse position
   */
  updateCardGlow(card, event) {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    card.style.setProperty('--mouse-x', `${xPercent}%`);
    card.style.setProperty('--mouse-y', `${yPercent}%`);

    // Apply radial gradient at mouse position
    card.style.background = `
      radial-gradient(circle 200px at ${xPercent}% ${yPercent}%,
        rgba(255, 233, 0, 0.08),
        rgba(30, 32, 38, 0.4)
      )
    `;
  }

  /**
   * Remove card glow
   */
  removeCardGlow(card) {
    card.style.background = '';
  }
}

// Export for global use
window.CosmicAnimations = CosmicAnimations;
window.TextGlowEffect = TextGlowEffect;
window.CosmicHoverEffects = CosmicHoverEffects;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCosmicAnimations);
} else {
  initCosmicAnimations();
}

function initCosmicAnimations() {
  // Wait for hero section to be visible
  const hero = document.querySelector('.hero');
  if (!hero) {
    console.warn('Hero section not found, skipping cosmic animations');
    return;
  }

  // Initialize cosmic animations
  window.cosmicAnim = new CosmicAnimations();
  window.cosmicAnim.init();

  // Initialize text glow
  window.textGlow = new TextGlowEffect();
  window.textGlow.init();

  // Initialize hover effects
  window.hoverEffects = new CosmicHoverEffects();
  window.hoverEffects.init();

  console.log('All cosmic effects initialized');
}
