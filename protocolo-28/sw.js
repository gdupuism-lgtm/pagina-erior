self.addEventListener('install', function (e) {
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).catch(function () { return caches.match('./index.html'); }));
});
self.addEventListener('push', function (e) {
  var data = { title: 'ERIOR', body: 'Reto de Manifestación 28.' };
  try {
    if (e.data) data = e.data.json();
  } catch (err) {
    try { data.body = e.data.text(); } catch (e2) {}
  }
  e.waitUntil(self.registration.showNotification(data.title || 'ERIOR', {
    body: data.body || '',
    icon: 'icon.svg',
    badge: 'icon.svg',
    tag: data.tag || 'p28-daily',
    renotify: true
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(self.clients.openWindow('./index.html'));
});
self.addEventListener('message', function (e) {
  var d = e.data || {};
  if (d.type === 'notify' && d.title) {
    self.registration.showNotification(d.title, {
      body: d.body || '',
      icon: 'icon.svg',
      badge: 'icon.svg',
      tag: d.tag || 'p28-daily',
      renotify: true
    });
  }
});
