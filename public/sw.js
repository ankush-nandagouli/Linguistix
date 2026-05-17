const CACHE_NAME = 'linguistix-cache-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  'https://cdn.jsdelivr.net/npm/aksharmukha-node@1.0.1/aksharmukha.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== 'ocr-data') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Cache-first for specifically requested static assets and CDN scripts
  const isCachable = urlsToCache.some(cacheUrl => event.request.url.includes(cacheUrl)) || 
                     url.origin === 'https://cdn.jsdelivr.net' || 
                     url.origin === 'https://fonts.gstatic.com' ||
                     url.origin === 'https://fonts.googleapis.com';

  if (isCachable) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Special handling for large binary assets (Cache-first)
  if (event.request.url.includes('.traineddata') || event.request.url.includes('tesseract')) {
    event.respondWith(
      caches.open('ocr-data').then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Network-first for most other requests (like API calls) to ensure freshness, 
  // but fallback to cache if offline
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
