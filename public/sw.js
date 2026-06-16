// Production recovery service worker.
// Previous app-shell versions could serve stale hashed chunks as text/html.
// This worker clears all MNWHILE FlowKit caches, unregisters itself, and lets
// the network own every request.
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheKeys = await caches.keys();
    await Promise.all(
      cacheKeys
        .filter((key) => key.startsWith('mnwhile-flowkit-'))
        .map((key) => caches.delete(key))
    );

    const clients = await self.clients.matchAll({ type: 'window' });
    await self.registration.unregister();
    await Promise.all(clients.map((client) => client.navigate(client.url)));
  })());
});
