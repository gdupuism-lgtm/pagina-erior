var CACHE = 'erior-p28-v51-dead';

self.addEventListener('install', function (e) {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request, { cache: 'no-store' }).catch(function () {
      return new Response(
        '<!DOCTYPE html><meta charset="utf-8"><title>Erior Center</title><p>Esta app ya no existe.</p>',
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }));
  }
});
