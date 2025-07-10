const CACHE_NAME = 'oyun-durumu-v2';
const urlsToCache = [
  '/oyun-durumum/',
  '/oyun-durumum/index.html',
  '/oyun-durumum/manifest.json',
  '/oyun-durumum/icon-192.png',
  '/oyun-durumum/icon-512.png'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        // Cache hatası, sessizce devam et
      })
  );
  // Hemen aktif ol
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Hemen kontrol et
  self.clients.claim();
});

// Fetch event - Network first, cache fallback
self.addEventListener('fetch', event => {
  // Google Sheets ve proxy istekleri için cache kullanma
  if (event.request.url.includes('docs.google.com') || 
      event.request.url.includes('allorigins.win') ||
      event.request.url.includes('corsproxy.io') ||
      event.request.url.includes('codetabs.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Başarılı yanıtı cache'e kaydet
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Network başarısızsa cache'den dön
        return caches.match(event.request);
      })
  );
});