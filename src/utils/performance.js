import { InteractionManager } from 'react-native';

/**
 * Performance optimization utilities
 */

/**
 * Run task after interactions (animations, gestures) complete
 */
export const runAfterInteractions = (callback) => {
  return InteractionManager.runAfterInteractions(callback);
};

/**
 * Debounce function for search and input
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for scroll events
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Lazy load component
 */
export const lazyLoad = (importFunc, fallback = null) => {
  return React.lazy(() => importFunc());
};

/**
 * Memoize expensive computations
 */
export const memoize = (func) => {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);

    return result;
  };
};

/**
 * Batch state updates
 */
export const batchUpdates = (callback) => {
  // React Native automatically batches updates
  callback();
};

/**
 * Request animation frame wrapper
 */
export const nextFrame = (callback) => {
  return requestAnimationFrame(callback);
};

/**
 * Cancel animation frame
 */
export const cancelFrame = (frameId) => {
  return cancelAnimationFrame(frameId);
};

/**
 * Measure performance
 */
export const measurePerformance = (name, callback) => {
  const startTime = Date.now();

  const result = callback();

  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log(`Performance [${name}]: ${duration}ms`);

  return result;
};

/**
 * Check if low-end device
 */
export const isLowEndDevice = () => {
  // Simple heuristic based on screen size and platform
  const { width, height } = require('react-native').Dimensions.get('window');
  const totalPixels = width * height;

  // Devices with < 1M pixels are likely low-end
  return totalPixels < 1000000;
};

/**
 * Optimize images for current device
 */
export const getOptimizedImageSize = (originalSize) => {
  if (isLowEndDevice()) {
    return Math.floor(originalSize * 0.5);
  }

  const { width } = require('react-native').Dimensions.get('window');
  const scale = require('react-native').PixelRatio.get();

  return Math.min(originalSize, width * scale);
};

export default {
  runAfterInteractions,
  debounce,
  throttle,
  lazyLoad,
  memoize,
  batchUpdates,
  nextFrame,
  cancelFrame,
  measurePerformance,
  isLowEndDevice,
  getOptimizedImageSize,
};
