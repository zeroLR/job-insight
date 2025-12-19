// Minimal Service Worker
const CACHE_NAME = 'job-insight-v1';
const urlsToCache = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

// 清除舊版本的快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. 跳過非 GET 請求與擴充功能
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // 2. 靜態資源 (JS, CSS, Images) 直接走網路 (由 Vite 的 Hash 機制管理)
  if (
    url.pathname.match(
      /\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot|ico|webp|map)$/,
    )
  ) {
    return;
  }

  // 3. HTML 請求採用 Network First (網路優先)
  // 這樣可以確保拿到最新的 index.html (指向正確的 JS 檔)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 成功拿到網路版本，存入快取
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => {
          // 網路斷線時，才回傳快取版本
          return caches.match(request);
        }),
    );
    return;
  }

  // 4. 其他請求嘗試快取優先
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
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
