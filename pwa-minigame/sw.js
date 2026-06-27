// sw.js
const CACHE_VERSION = "v1.0.1";
const CACHE_NAME = `minigame-cache-${CACHE_VERSION}`;

const ASSETS = [
    "./",
    "./index.html",
    "./styles.css",
    "./app.js",
    "./data.js",
    "./manifest.webmanifest",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        // Best-effort caching: a single failed asset must not abort the install,
        // or the forced update would never activate.
        caches.open(CACHE_NAME).then((cache) =>
            Promise.all(
                ASSETS.map((url) =>
                    cache.add(url).catch((err) => {
                        console.warn("SW: failed to cache", url, err);
                    })
                )
            )
        )
    );
    self.skipWaiting();
});

self.addEventListener("message", (event) => {
    if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)));
        self.clients.claim();
    })());
});

self.addEventListener("fetch", (event) => {
    const req = event.request;

    // Cache-first (simple y robusto offline)
    event.respondWith((async () => {
        const cached = await caches.match(req);
        if (cached) return cached;

        try {
            const fresh = await fetch(req);
            // opcional: cachear nuevos GET same-origin
            if (req.method === "GET" && new URL(req.url).origin === location.origin) {
                const cache = await caches.open(CACHE_NAME);
                cache.put(req, fresh.clone());
            }
            return fresh;
        } catch (e) {
            // fallback básico
            return caches.match("./index.html");
        }
    })());
});
