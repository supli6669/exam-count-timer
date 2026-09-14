// Production build replaces these markers with its exact asset list and version.
const CACHE_NAME = 'exam-countdown-__BUILD_VERSION__';
const ASSETS_TO_CACHE = /* BUILD_ASSETS */ ['./', './index.html', './favicon.svg', './manifest.json'];
const allowed = new Set(ASSETS_TO_CACHE.map(path => new URL(path, self.registration.scope).href));

self.addEventListener('install', event => {
  // The worker waits until existing tabs close; do not mix application versions.
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE)));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith('exam-countdown-') && key !== CACHE_NAME)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (!allowed.has(url.href) && event.request.mode !== 'navigate') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // An installed shell and its hashed assets always come from the same build.
    const cached = await cache.match(event.request.mode === 'navigate' ? './index.html' : event.request);
    if (cached) return cached;
    try { return await fetch(event.request); }
    catch { return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } }); }
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
    const existing = clients.find(client => client.url.startsWith(self.registration.scope) && 'focus' in client);
    return existing ? existing.focus() : self.clients.openWindow(self.registration.scope);
  }));
});
