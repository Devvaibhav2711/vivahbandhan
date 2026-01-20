const CACHE_NAME = 'shubhvivahbandhan-v2';
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

// Fetch Event: Optimized strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. SKIP: Non-GET requests
  if (event.request.method !== 'GET') return;

  // 2. SKIP: Supabase API (Rest/Auth) - Keep fresh
  if (url.href.includes('supabase.co') && (url.pathname.includes('/rest/v1') || url.pathname.includes('/auth/v1'))) {
    return;
  }

  // 3. STRATEGY: Navigation (HTML) -> Network First, Fallback to Cache (App Shell)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If valid network response, cache it (update index.html) and return
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Network failed? Try cache or fallback to offline.html
          return caches.match(event.request)
            .then((response) => {
               if (response) return response;
               return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // 4. STRATEGY: Hashed Assets (JS/CSS) -> Cache First (Immutable-ish)
  // Vite generates files like assets/index-D8s7s.js which are unique.
  // If we have it, return it. No need to check network.
  if (url.pathname.includes('/assets/') && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) {
     event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
           if (cachedResponse) return cachedResponse;
           return fetch(event.request).then((networkResponse) => {
               if (networkResponse && networkResponse.status === 200) {
                   const clone = networkResponse.clone();
                   caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
               }
               return networkResponse;
           });
        })
     );
     return;
  }

  // 5. STRATEGY: Images & Others -> Stale-While-Revalidate
  // Serve from cache immediately, but update in background
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache 'basic' (same-origin) and 'cors' (external images like Supabase Storage)
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
           const clone = networkResponse.clone();
           caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      });
      // Return cached if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
