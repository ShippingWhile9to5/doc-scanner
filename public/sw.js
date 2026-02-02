const CACHE_NAME = 'docsqueezer-v3-cleanup';
// We are intentionally not caching anything right now to fix the ChunkLoadErrors
// caused by stale assets or failed fetches in the previous SW version.
const ASSETS = [];

self.addEventListener('install', (event) => {
    // Force this new service worker to become the active one immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // CLAIM CLIENTS IMMEDIATELY so we control the page right now
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            // DELETE ALL PREVIOUS CACHES to fix the "stuck" state
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        console.log('Deleting cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            })
        ])
    );
});

self.addEventListener('fetch', (event) => {
    // NETWORK ONLY STRATEGY
    // We strictly pass through to the network. No caching.
    // This resolves the ChunkLoadErrors by ensuring the browser always gets the live file.
    event.respondWith(fetch(event.request));
});
