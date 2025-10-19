// PWA utilities for service worker management and offline support

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[PWA] Service Worker registered:', registration.scope);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            console.log('[PWA] New version available');
            showUpdateNotification();
          }
        });
      });

      return registration;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

export const unregisterServiceWorker = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      return await registration.unregister();
    }
  }
  return false;
};

export const checkForUpdates = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
    }
  }
};

export const skipWaiting = (): void => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
};

export const clearCache = async (): Promise<void> => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  }

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('[PWA] Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

export const subscribeToPushNotifications = async (
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> => {
  try {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('[PWA] Notification permission denied');
      return null;
    }

    // Get VAPID public key from your backend
    const response = await fetch('/api/push/vapid-public-key');
    const { publicKey } = await response.json();

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    // Send subscription to backend
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    console.log('[PWA] Push notification subscription created');
    return subscription;
  } catch (error) {
    console.error('[PWA] Failed to subscribe to push notifications:', error);
    return null;
  }
};

export const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();

        // Notify backend
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        return true;
      }
    }
  }
  return false;
};

export const registerBackgroundSync = async (
  registration: ServiceWorkerRegistration,
  tag: string
): Promise<void> => {
  if ('sync' in registration) {
    try {
      await (registration as any).sync.register(tag);
      console.log(`[PWA] Background sync registered: ${tag}`);
    } catch (error) {
      console.error('[PWA] Background sync registration failed:', error);
    }
  }
};

export const registerPeriodicBackgroundSync = async (
  registration: ServiceWorkerRegistration,
  tag: string,
  minInterval: number = 24 * 60 * 60 * 1000 // 24 hours
): Promise<void> => {
  if ('periodicSync' in registration) {
    try {
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync' as any,
      });

      if (status.state === 'granted') {
        await (registration as any).periodicSync.register(tag, {
          minInterval,
        });
        console.log(`[PWA] Periodic sync registered: ${tag}`);
      }
    } catch (error) {
      console.error('[PWA] Periodic sync registration failed:', error);
    }
  }
};

export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const addOnlineListener = (callback: () => void): void => {
  window.addEventListener('online', callback);
};

export const addOfflineListener = (callback: () => void): void => {
  window.addEventListener('offline', callback);
};

export const removeOnlineListener = (callback: () => void): void => {
  window.removeEventListener('online', callback);
};

export const removeOfflineListener = (callback: () => void): void => {
  window.removeEventListener('offline', callback);
};

export const getNetworkInformation = (): any => {
  return (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
};

export const isStandalone = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

// Store install prompt event
let deferredPrompt: any = null;

// Listen for beforeinstallprompt event
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export const canInstall = (): boolean => {
  return deferredPrompt !== null;
};

export const showInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    return false;
  }

  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    console.error('[PWA] Install prompt failed:', error);
    return false;
  }
};

export const canShare = (): boolean => {
  return 'share' in navigator;
};

export const shareContent = async (data: ShareData): Promise<boolean> => {
  if (canShare()) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('[PWA] Share failed:', error);
      }
      return false;
    }
  }
  return false;
};

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function showUpdateNotification(): void {
  // Create a custom event for update notification
  const event = new CustomEvent('sw-update-available');
  window.dispatchEvent(event);
}

// Auto-update service worker on page load
export const setupAutoUpdate = (): void => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
};

// Prefetch important resources
export const prefetchResources = async (urls: string[]): Promise<void> => {
  if ('caches' in window) {
    const cache = await caches.open('hypeai-runtime-v1.0.0');
    await cache.addAll(urls);
  }
};

// Initialize PWA features
export const initPWA = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    // Register service worker
    const registration = await registerServiceWorker();

    // Setup auto-update
    setupAutoUpdate();

    // Log PWA status
    console.log('[PWA] Initialized successfully');
    console.log('[PWA] Standalone mode:', isStandalone());
    console.log('[PWA] Online:', isOnline());

  } catch (error) {
    console.error('[PWA] Initialization failed:', error);
  }
};
