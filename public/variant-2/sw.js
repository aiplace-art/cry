/**
 * HypeAI Service Worker - Enhanced for Lighthouse 95+
 * Aggressive caching strategy for optimal performance
 * Version: 2.0.0
 */

const CACHE_VERSION = 'v2.0.0';
const STATIC_CACHE = `hypeai-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `hypeai-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `hypeai-images-${CACHE_VERSION}`;

// Cache duration in seconds
const CACHE_DURATION = {
  static: 31536000, // 1 year for static assets
  dynamic: 86400,   // 1 day for HTML/API
  images: 2592000   // 30 days for images
};

// Static assets to cache on install (critical files only)
const STATIC_ASSETS = [
  '/variant-2/',
  '/variant-2/index.html',
  '/variant-2/css/critical.css',
  '/variant-2/css/bnb-theme.css',
  '/variant-2/js/app.optimized.js',
  '/variant-2/assets/logo-bnb-icon.svg',
  '/variant-2/manifest.json'
];

// Image patterns to cache
const IMAGE_PATTERNS = [
  /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i
];

// API patterns (network-first strategy)
const API_PATTERNS = [
  /\/api\//,
  /bscscan\.com/,
  /pancakeswap/
];

/**
 * Install event - Cache static assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('hypeai-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch event - Intelligent caching strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests - Network First with fallback
  if (API_PATTERNS.some(pattern => pattern.test(url.href))) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Images - Cache First with network fallback
  if (IMAGE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // HTML pages - Stale While Revalidate
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    return;
  }

  // Static assets (CSS, JS) - Cache First
  if (url.pathname.match(/\.(css|js|woff2?|ttf|eot)$/)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Default - Network First
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

/**
 * Cache First Strategy
 * Best for: Static assets, images
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network First Strategy
 * Best for: API calls, dynamic content
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Stale While Revalidate Strategy
 * Best for: HTML pages that change occasionally
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Fetch fresh version in background
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  // Return cached immediately if available, otherwise wait for network
  return cached || fetchPromise;
}

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Implement offline data sync logic
  const cache = await caches.open(DYNAMIC_CACHE);
  // Add your sync logic here
}

/**
 * Push notifications
 */
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/variant-2/assets/logo-bnb-icon.svg',
    badge: '/variant-2/assets/logo-bnb-icon.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('HypeAI', options)
  );
});

/**
 * Message handler for cache management
 */
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
        })
        .then(() => {
          if (event.ports[0]) {
            event.ports[0].postMessage({ success: true });
          }
        })
    );
  }

  if (event.data.action === 'getCacheSize') {
    event.waitUntil(
      getCacheSize().then((size) => {
        if (event.ports[0]) {
          event.ports[0].postMessage({ size });
        }
      })
    );
  }
});

/**
 * Calculate total cache size
 */
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}
