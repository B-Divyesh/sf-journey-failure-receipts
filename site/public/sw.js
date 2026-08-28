const CACHE = 'journey-receipts-v2';
const SHELL = ['/', '/index.html', '/privacy/', '/terms/', '/blueprint-journey.webp', '/favicon.svg', '/fonts/instrument-sans-600.woff2', '/fonts/instrument-sans-700.woff2', '/fonts/ibm-plex-mono-400.woff2', '/fonts/ibm-plex-mono-600.woff2'];
self.addEventListener('install', (event) => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  await cache.addAll(SHELL);
  const html = await (await cache.match('/index.html')).text();
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map((match) => match[1]);
  await cache.addAll(assets);
  await self.skipWaiting();
})()));
self.addEventListener('activate', (event) => event.waitUntil((async () => {
  await Promise.all((await caches.keys()).filter((key) => key !== CACHE).map((key) => caches.delete(key)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => event.request.mode === 'navigate' ? caches.match('/index.html') : Response.error())));
});
