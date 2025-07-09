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
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('[ServiceWorker] Cache failed:', err);
      })
  );
  // Hemen aktif ol
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
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

// Push notification desteği için
self.addEventListener('push', event => {
  console.log('[ServiceWorker] Push received');
  
  const title = 'bigfiggings Oyun Durumu';
  const options = {
    body: event.data ? event.data.text() : 'Yeni güncelleme var!',
    icon: '/oyun-durumum/icon-192.png',
    badge: '/oyun-durumum/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  console.log('[ServiceWorker] Notification click');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/oyun-durumum/')
  );
});