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
  // Skip cache for external APIs and extensions
  if (event.request.url.includes('docs.google.com') || 
      event.request.url.includes('allorigins.win') ||
      event.request.url.includes('corsproxy.io') ||
      event.request.url.includes('codetabs.com') ||
      event.request.url.includes('onesignal.com') ||
      event.request.url.includes('chrome-extension') ||
      !event.request.url.startsWith('http')) {
    event.respondWith(fetch(event.request).catch(() => new Response('', {status: 404})));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache only same-origin responses
        if (response && response.status === 200 && response.type === 'basic' && 
            event.request.url.startsWith(self.registration.scope)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            })
            .catch(err => {
              // Cache errors silently
            });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then(response => {
          return response || new Response('', {status: 404});
        });
      })
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll().then(clientList => {
      for (const client of clientList) {
        if (client.url === self.registration.scope && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/oyun-durumum/');
      }
    })
  );
});