// Minimal Service Worker
const CACHE_NAME = 'job-insight-v1';
const urlsToCache = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip caching for:
  // 1. Chrome extensions
  // 2. Non-GET requests
  // 3. Assets (JS, CSS, images, fonts, etc.) - let Vite handle these
  if (
    url.protocol === 'chrome-extension:' ||
    request.method !== 'GET' ||
    url.pathname.match(
      /\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot|ico|webp|map)$/,
    )
  ) {
    return;
  }

  // Only cache navigation requests (HTML pages)
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(request).then((fetchResponse) => {
        // Only cache successful responses
        if (fetchResponse && fetchResponse.status === 200) {
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return fetchResponse;
      });
    }),
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
