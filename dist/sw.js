const CACHE_NAME = "em-clinical-pwa-v4.1";
const ASSETS = [
  "/",
  "index.html",
  "style.css",
  "shared/fonts.css",
  "shared/humano-tokens.css",
  "shared/fonts/inter-latin-wght-normal.woff2",
  "shared/fonts/inter-latin-ext-wght-normal.woff2",
  "shared/fonts/poppins-latin-500-normal.woff2",
  "shared/fonts/poppins-latin-600-normal.woff2",
  "shared/fonts/poppins-latin-700-normal.woff2",
  "shared/fonts/poppins-latin-ext-500-normal.woff2",
  "shared/fonts/poppins-latin-ext-600-normal.woff2",
  "shared/fonts/poppins-latin-ext-700-normal.woff2",
  "shared/fonts/jetbrains-mono-latin-500-normal.woff2",
  "shared/fonts/jetbrains-mono-latin-ext-500-normal.woff2",
  // ES modules loaded by index.html (no bundling step needed to serve the app)
  "src/main.js",
  "src/state.js",
  "src/utils.js",
  "src/theme.js",
  "src/icons.js",
  "src/toast.js",
  "src/integrator.js",
  "src/game.js",
  "src/donation.js",
  "src/pwa.js",
  "src/dictionary.js",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png",
  "favicon-32.png",
  "favicon-16.png",
  "manifest.json",
  "lexicon/lexicon_bundle.json",
  "assets/celada.jpeg",
  // Domain files
  "domains/DOM-01_conciencia_orientacion.json",
  "domains/DOM-02_apariencia_general.json",
  "domains/DOM-03_actitud_interaccion.json",
  "domains/DOM-04_psicomotricidad_conacion.json",
  "domains/DOM-05_habla_lenguaje.json",
  "domains/DOM-06_pensamiento_curso_forma.json",
  "domains/DOM-07_pensamiento_contenido.json",
  "domains/DOM-08_sensopercepcion.json",
  "domains/DOM-09_estado_afectivo_animo_afecto.json",
  "domains/DOM-10_funciones_cognitivas.json",
  "domains/DOM-11_juicio_insight.json",
  "domains/DOM-12_riesgo.json",
  "domains/DOM-13_integracion_sindromatica.json",
  "domains/DOM-14_docencia.json",
  "domains/DOM-15_fenomenologia_historica.json",
  // OSCE case files
  "OSCE_001–003.json",
  "OSCE_004–OSCE_009.json",
  "OSCE_010–OSCE_015.json",
  "OSCE_016–025.json",
  "OSCE_026–035.json",
  "https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/dist/fuse.min.js",
];

self.addEventListener("install", (event) => {
  // Activate this new SW immediately instead of waiting for old tabs to close.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Best-effort caching: cache.addAll() is atomic, so a single failed
      // asset (e.g. an offline/blocked CDN file) would abort the whole
      // install and the update would never activate. Cache each asset
      // independently so the forced update always completes.
      Promise.all(
        ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("SW: failed to cache", url, err);
          }),
        ),
      ),
    ),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  // Strategy: Stale-While-Revalidate for clinical data (JSON)
  if (event.request.url.includes(".json")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      }),
    );
    return;
  }

  // Default: Cache-First for static assets. Successful same-origin GETs that
  // were not precached (e.g. hashed bundles from a Vite build) are stored on
  // first use so the app keeps working offline.
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).then((networkResponse) => {
        const sameOrigin = new URL(event.request.url).origin === self.location.origin;
        if (event.request.method === "GET" && sameOrigin && networkResponse.ok) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      });
    }),
  );
});
