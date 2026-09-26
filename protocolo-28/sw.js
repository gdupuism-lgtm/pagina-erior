self.addEventListener('install', function (e) {
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(function () { return caches.match('./index.html'); }));
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
