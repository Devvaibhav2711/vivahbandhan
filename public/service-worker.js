const CACHE_NAME = 'shubhvivahbandhan-v1';
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
    // Navigation (HTML pages): Stale-While-Revalidate
    // Return cached shell immediately, then update cache from network
    event.respondWith(
      caches.match(OFFLINE_URL).then((cachedResponse) => {
        const networkFetch = fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }
            // Clone and cache updated version
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
            });
            return response;
          })
          .catch(() => {
             // Network failed, just return what we have (or offline page if nothing)
             // We already returned cache below if available? 
             // Actually SWR pattern usually returns cache immediately.
          });

        //Ideally we match event.request (the URL), falling back to OFFLINE_URL (the App Shell)
        // Since this is an SPA, all navigation usually serves index.html (or offline.html in our offline logic)
        // Let's try to match the exact request first, then /index.html, then network.
        
        return caches.match(event.request).then((specificCache) => {
             if (specificCache) return specificCache;
             
             // If specific URL not cached (rare for navigation in SPA, usually we serve index.html),
             // We serve /index.html (App Shell) which should be in cache from install.
             return caches.match('/index.html').then((shellCache) => {
                 return shellCache || networkFetch; // Return shell or wait for network
             });
        });
      })
    );
    
    // simplified SWR for Navigation to ensure "Instant" feel:
    // 1. Try Cache (specific URL or Shell) -> Return IMMEDIATELY
    // 2. Fetch Network -> Update Cache
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Create a promise for the network request to update cache
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return networkResponse;
            }).catch(() => {
                 // Network failed
            });

            // If we have a cached response, return it immediately!
            if (cachedResponse) {
                return cachedResponse; 
            }
            
            // If not cached specifically, try the App Shell (/index.html)
            return caches.match('/index.html').then((shellResponse) => {
                if (shellResponse) {
                     return shellResponse;
                }
                // If no shell (first load?), wait for network
                return fetchPromise;
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
