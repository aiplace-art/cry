/**
 * Lazy Loading Module
 * Implements Intersection Observer for images and heavy content
 * Improves Lighthouse Performance score significantly
 */

class LazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.01,
      loadingClass: options.loadingClass || 'lazy-loading',
      loadedClass: options.loadedClass || 'lazy-loaded',
      errorClass: options.errorClass || 'lazy-error'
    };

    this.observer = null;
    this.init();
  }

  /**
   * Initialize Intersection Observer
   */
  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => this.onIntersection(entries),
        {
          rootMargin: this.options.rootMargin,
          threshold: this.options.threshold
        }
      );

      this.observe();
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadAllImages();
    }
  }

  /**
   * Observe all lazy-loadable elements
   */
  observe() {
    const images = document.querySelectorAll('img[data-src], img[data-srcset]');
    const iframes = document.querySelectorAll('iframe[data-src]');
    const backgrounds = document.querySelectorAll('[data-bg]');

    [...images, ...iframes, ...backgrounds].forEach((element) => {
      this.observer.observe(element);
    });
  }

  /**
   * Handle intersection
   */
  onIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.loadElement(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  /**
   * Load individual element
   */
  loadElement(element) {
    element.classList.add(this.options.loadingClass);

    if (element.tagName === 'IMG') {
      this.loadImage(element);
    } else if (element.tagName === 'IFRAME') {
      this.loadIframe(element);
    } else if (element.hasAttribute('data-bg')) {
      this.loadBackground(element);
    }
  }

  /**
   * Load image with srcset support
   */
  loadImage(img) {
    const src = img.getAttribute('data-src');
    const srcset = img.getAttribute('data-srcset');

    img.addEventListener('load', () => {
      img.classList.remove(this.options.loadingClass);
      img.classList.add(this.options.loadedClass);
    });

    img.addEventListener('error', () => {
      img.classList.remove(this.options.loadingClass);
      img.classList.add(this.options.errorClass);
    });

    if (srcset) {
      img.srcset = srcset;
    }
    if (src) {
      img.src = src;
    }

    // Remove data attributes
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');
  }

  /**
   * Load iframe
   */
  loadIframe(iframe) {
    const src = iframe.getAttribute('data-src');

    iframe.addEventListener('load', () => {
      iframe.classList.remove(this.options.loadingClass);
      iframe.classList.add(this.options.loadedClass);
    });

    if (src) {
      iframe.src = src;
    }

    iframe.removeAttribute('data-src');
  }

  /**
   * Load background image
   */
  loadBackground(element) {
    const bg = element.getAttribute('data-bg');

    if (bg) {
      const img = new Image();
      img.addEventListener('load', () => {
        element.style.backgroundImage = `url(${bg})`;
        element.classList.remove(this.options.loadingClass);
        element.classList.add(this.options.loadedClass);
      });

      img.src = bg;
    }

    element.removeAttribute('data-bg');
  }

  /**
   * Fallback: Load all images immediately
   */
  loadAllImages() {
    const elements = document.querySelectorAll('[data-src], [data-srcset], [data-bg]');
    elements.forEach((element) => this.loadElement(element));
  }

  /**
   * Manually trigger loading of an element
   */
  load(element) {
    if (this.observer) {
      this.observer.unobserve(element);
    }
    this.loadElement(element);
  }

  /**
   * Destroy the observer
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// WebP detection with fallback
class ImageOptimizer {
  constructor() {
    this.supportsWebP = false;
    this.detectWebP();
  }

  /**
   * Detect WebP support
   */
  async detectWebP() {
    if (!self.createImageBitmap) {
      this.supportsWebP = false;
      return;
    }

    const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';

    try {
      const blob = await fetch(webpData).then(r => r.blob());
      this.supportsWebP = await createImageBitmap(blob).then(() => true, () => false);
    } catch (e) {
      this.supportsWebP = false;
    }

    // Add class to document
    if (this.supportsWebP) {
      document.documentElement.classList.add('webp');
    } else {
      document.documentElement.classList.add('no-webp');
    }
  }

  /**
   * Get optimized image source
   */
  getSource(path, format = 'webp') {
    if (this.supportsWebP && format === 'webp') {
      return path.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    return path;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LazyLoader, ImageOptimizer };
}

// Auto-initialize if not imported as module
if (typeof module === 'undefined') {
  window.LazyLoader = LazyLoader;
  window.ImageOptimizer = ImageOptimizer;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.lazyLoader = new LazyLoader();
      window.imageOptimizer = new ImageOptimizer();
    });
  } else {
    window.lazyLoader = new LazyLoader();
    window.imageOptimizer = new ImageOptimizer();
  }
}
