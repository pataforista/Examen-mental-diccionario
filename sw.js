const CACHE_NAME = 'clinical-pwa-v2.8';
const ASSETS = [
    '/',
    'index.html',
    'style.css',
    'app.js',
    'icon-192.png',
    'icon-512.png',
    'apple-touch-icon.png',
    'favicon-32.png',
    'favicon-16.png',
    'texture-light.png',
    'texture-dark.png',
    'manifest.json',
    'lexicon/lexicon_bundle.json',
    'assets/celada.jpeg',
    // Domain files
    'domains/DOM-01_conciencia_orientacion.json',
    'domains/DOM-02_apariencia_general.json',
    'domains/DOM-03_actitud_interaccion.json',
    'domains/DOM-04_psicomotricidad_conacion.json',
    'domains/DOM-05_habla_lenguaje.json',
    'domains/DOM-06_pensamiento_curso_forma.json',
    'domains/DOM-07_pensamiento_contenido.json',
    'domains/DOM-08_sensopercepcion.json',
    'domains/DOM-09_estado_afectivo_animo_afecto.json',
    'domains/DOM-10_funciones_cognitivas.json',
    'domains/DOM-11_juicio_insight.json',
    'domains/DOM-12_riesgo.json',
    'domains/DOM-13_integracion_sindromatica.json',
    'domains/DOM-14_docencia.json',
    'domains/DOM-15_fenomenologia_historica.json',
    // OSCE case files
    'OSCE_001–003.json',
    'OSCE_004–OSCE_009.json',
    'OSCE_010–OSCE_015.json',
    'OSCE_016–025.json',
    'OSCE_026–035.json',
    'https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Space+Grotesk:wght@300;400;600;700&display=swap'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
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
