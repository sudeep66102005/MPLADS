/* Cache public application files only. Private API responses never enter CacheStorage. */
const ROOT = new URL('./', self.location.href);
const CACHE = 'mplads-field-shell-v1';
const FIELD = new URL('field/', ROOT).href;
function publicAsset(url) { return url.origin === ROOT.origin && url.pathname.startsWith(ROOT.pathname + '_next/static/'); }
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(c => c.add(FIELD))); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('message', event => {
  if (event.data?.type !== 'CACHE_SHELL' || !Array.isArray(event.data.assets)) return;
  event.waitUntil(caches.open(CACHE).then(async cache => {
    await Promise.allSettled(event.data.assets.filter(u => { try { return publicAsset(new URL(u)); } catch { return false; } }).map(u => cache.add(u)));
  }));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || event.request.headers.has('Authorization')) return;
  if (event.request.mode === 'navigate' && url.origin === ROOT.origin && url.pathname === new URL(FIELD).pathname) {
    event.respondWith(fetch(event.request).then(async response => { if (response.ok) {const cache = await caches.open(CACHE); await cache.put(FIELD, response.clone());} return response; }).catch(() => caches.match(FIELD))); return;
  }
  if (publicAsset(url)) event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(async response => { if (response.ok) {const cache = await caches.open(CACHE); await cache.put(event.request, response.clone());} return response; })));
});
