/**
 * HypeAI Service Worker
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'hypeai-v2-cache-v1';
const RUNTIME_CACHE = 'hypeai-v2-runtime';

// Files to cache on install
const STATIC_CACHE_URLS = [
  '/variant-2/',
  '/variant-2/index.html',
  '/variant-2/mobile.js',
  '/variant-2/manifest.json',
  '/variant-2/assets/logo-bnb.svg',
  '/variant-2/assets/logo-bnb-icon.svg',
  '/variant-2/assets/logo-bnb-horizontal.svg'
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - serve from cache, fallback to network
 */
self.addEventListener('fetch', function(event) {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(cachedResponse) {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(function(response) {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache runtime assets
            caches.open(RUNTIME_CACHE)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(function() {
            // Return offline page if available
            return caches.match('/variant-2/');
          });
      })
  );
});

/**
 * Message event - handle cache updates
 */
self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data.action === 'clearCache') {
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
      .then(function() {
        event.ports[0].postMessage({ success: true });
      });
  }
});

console.log('Service Worker: Loaded');
