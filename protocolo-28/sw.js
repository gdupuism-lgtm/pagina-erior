var CACHE = 'erior-p28-v48';
var PRECACHE = [
  './',
  './index.html',
  './protocolo.css?v=54',
  './access.js?v=38',
  './phrases.js?v=24',
  './routines.js?v=24',
  './plan.js?v=22',
  './vault.js?v=37',
  './vision.js?v=7',
  './protocolo.js?v=48',
  './manifest.webmanifest',
  './icon.svg?v=35',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png?v=35',
  './logo-tile.png?v=35',
  './stamps/acceso.svg',
  './stamps/reto.svg',
  './stamps/oficial.svg'
];

function cacheFirst(req) {
  return caches.match(req).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    });
  });
}

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(PRECACHE.map(function (u) {
        return cache.add(u).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) {
        return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.search.indexOf('fresh=') >= 0) return;
  if (url.pathname.indexOf('/.netlify/functions/') >= 0 || url.pathname.indexOf('/api/') >= 0) return;

  if (url.origin !== self.location.origin) {
    if (/fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
      e.respondWith(cacheFirst(e.request));
    }
    return;
  }

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
        }
        return res;
      }).catch(function () {
        return caches.match('./index.html').then(function (hit) { return hit || caches.match('./'); });
      })
    );
    return;
  }

  e.respondWith(
    cacheFirst(e.request).catch(function () { return caches.match('./index.html'); })
  );
});

self.addEventListener('push', function (e) {
  var data = { title: 'Erior Center', body: 'Erior Center.' };
  try {
    if (e.data) data = e.data.json();
  } catch (err) {
    try { data.body = e.data.text(); } catch (e2) {}
  }
  e.waitUntil(self.registration.showNotification(data.title || 'Erior Center', {
    body: data.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: data.tag || 'p28-daily',
    renotify: true
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clients) {
      for (var i = 0; i < clients.length; i += 1) {
        if (clients[i].url && 'focus' in clients[i]) return clients[i].focus();
      }
      return self.clients.openWindow('./index.html');
    })
  );
});

self.addEventListener('message', function (e) {
  var d = e.data || {};
  if (d.type === 'notify' && d.title) {
    self.registration.showNotification(d.title, {
      body: d.body || '',
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      tag: d.tag || 'p28-daily',
      renotify: true
    });
  }
});
