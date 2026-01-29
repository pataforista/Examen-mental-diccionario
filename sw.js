const CACHE_NAME = 'clinical-pwa-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    'https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.basic.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                // Cache new data requests (JSON files)
                if (event.request.url.endsWith('.json')) {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, fetchResponse.clone());
                        return fetchResponse;
                    });
                }
                return fetchResponse;
            });
        })
    );
});
