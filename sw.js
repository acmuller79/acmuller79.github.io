const CACHE_NAME = 'ia-acmuller-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instala e cacheia
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Responde com cache ou fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
