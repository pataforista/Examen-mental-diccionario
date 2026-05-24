const CACHE_NAME = 'clinical-pwa-v2.5';
const ASSETS = [
    '/',
    'index.html',
    'style.css',
    'app.js',
    'icon.png',
    'manifest.json',
    'lexicon/lexicon_bundle.json',
    'assets/celada.jpeg',
    'https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Space+Grotesk:wght@300;400;600;700&display=swap'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Strategy: Stale-While-Revalidate for clinical data (JSON)
    if (event.request.url.includes('.json')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    const fetchPromise = fetch(event.request).then((networkResponse) => {
                        if (networkResponse.ok) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => cachedResponse);

                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // Default: Cache-First for static assets
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
