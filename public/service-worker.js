const CACHE_NAME = 'vivahbandhan-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.png',
  '/og-image.png',
  // Add other critical assets like CSS/JS bundles if they are static, 
  // but Vite generates hashed filenames, so we rely on runtime caching for them.
];

const OFFLINE_URL = '/offline.html';

// Install Event: Cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
     // console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            // console.log('[Service Worker] Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Network-first for pages, Cache-first for assets (or similar strategy)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Exclude API calls (Supabase, etc.) from caching if needed
  // But user wants to cache public pages.
  // We should generally avoid caching authentication requests / sensitive data.
  // For simplicity and safety, we filter out non-GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // Define strategy based on request destination
  if (event.request.mode === 'navigate') {
    // Navigation (HTML pages): Network First, fall back to Cache, then Offline Page
    event.respondWith(
      fetch(event.request)
        .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }
            // Clone the response to store in cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
            });
            return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If not in cache and it's a navigation request, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
        })
    );
  } else {
    // Static Assets (CSS, JS, Images): Stale-While-Revalidate or Cache First
    // Let's use Stale-While-Revalidate for JS/CSS/Images to ensure updates are eventually seen
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
           // Update cache with new version
           if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                 cache.put(event.request, responseToCache);
              });
           }
           return networkResponse;
        });
        // Return cached response immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
    );
  }
});
