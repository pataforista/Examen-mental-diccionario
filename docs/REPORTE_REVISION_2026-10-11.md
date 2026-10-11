# Reporte de revisión: `Examen-mental-diccionario`

| | |
| --- | --- |
| **Fecha** | 2026-10-11 |
| **Tipo** | Revisión de lectura. **No se modificó código ni configuración.** |
| **Origen** | Evaluación previa a una posible migración de dominio (ver `PLAN_MIGRACION_DOMINIO.md` en `coordinacionclasespsiquiatria`) |
| **No ejecutado** | `npm ci`, `vite build`, lint. Los hallazgos salen de leer archivos y del contenido de `dist/` ya versionado |

## Resumen

| ID | Severidad | Hallazgo |
| --- | --- | --- |
| E-1 | Alta si se publica `dist/`; sin efecto si se publica la raíz | El build de Vite no incluye los datos ni el service worker que la app necesita |
| E-2 | Media | `dist/` está versionado y mezcla artefactos con fuente |
| E-3 | Baja | El service worker precachea `app.js`, que no existe |
| E-4 | Baja | Enlace inconsistente: `examenmental.pages.dev` vs `examen-mental.pages.dev` |
| E-5 | Baja | Sin CI, `npm test` es un marcador que falla |

---

## E-1. El build no empaqueta lo que la app carga en ejecución

**Evidencia**

- `dist/` contiene solo `index.html` y `assets/` (JS, CSS, íconos y manifest con nombres hasheados).
- `src/dictionary.js` carga datos con `fetch("lexicon/lexicon_bundle.json")` y `fetch("domains/…")`, y registra el SW con `serviceWorker.register("sw.js")`. Ninguna de esas rutas existe en `dist/`.
- Tampoco están en `dist/` los cinco archivos `OSCE_*.json`, que `sw.js` precachea.
- El manifest de `dist` es `/assets/manifest-iEtVNZH7.json` y declara íconos relativos (`icon-192.png`). Resuelven a `/assets/icon-192.png`, pero los archivos reales se llaman `icon-192-BE24A7Mv.png`.
- Causa: no hay `vite.config.*` ni carpeta `public/`. `sw.js`, `lexicon/`, `domains/`, `OSCE_*.json` y `manifest.json` viven en la raíz, y Vite solo procesa lo que `index.html` referencia.

**Impacto**

Si Cloudflare publica `dist/`, el diccionario no carga datos (404 en `lexicon_bundle.json` y `domains/*`), el SW no se registra y los íconos del manifest fallan. El diccionario queda sin contenido.

**Insufficient data for qué se publica hoy.** No hay `wrangler.toml` ni CI en el repo. Dos escenarios:

| Escenario | Qué ocurre |
| --- | --- |
| Pages sirve la **raíz** del repo sin build | Todo funciona (el módulo `/src/main.js` se carga tal cual). `dist/` es un resto sin uso |
| Pages sirve **`dist/`** | La app arranca sin datos ni PWA |

Para decidir: panel de Cloudflare → Pages → proyecto → *Settings → Builds & deployments* (comando de build y directorio de salida), y abrir `/lexicon/lexicon_bundle.json` en el sitio publicado.

**Sugerencia (no aplicada)**

Elegir un solo modelo. Si se mantiene Vite, mover los estáticos a `public/` para que se copien tal cual. Si se sirve la raíz, retirar `dist/` y Vite.

---

## E-2. `dist/` versionado

**Evidencia**

`.gitignore` excluye `build/` pero no `dist/`. `git ls-files dist` lista sus archivos. Se actualizó por última vez en `ba42819` (2026-07-23), después del último cambio en `src/` (`896b03e`, 2026-07-12).

**Impacto**

Cada cambio de fuente puede dejar `dist/` desfasado. Hace creer que el deploy usa `dist/` (ver E-1).

---

## E-3. Service worker precachea un archivo inexistente

**Evidencia**

`sw.js` lista `app.js` en `ASSETS`. No existe en la raíz ni en `dist/` (el código está en `src/*.js`).

**Impacto**

Bajo. La instalación del SW tolera fallos individuales, pero queda un aviso en consola y una entrada de caché muerta.

---

## E-4. Dirección inconsistente entre repos

**Evidencia**

- `index.html` declara `https://examenmental.pages.dev/` como canonical.
- `coordinacionclasespsiquiatria/config.json` (línea 128) enlaza a `https://examen-mental.pages.dev/` (con guion).

**Impacto**

Uno de los dos enlaces puede estar roto. **Insufficient data for cuál es el vivo.**

---

## E-5. Sin CI ni pruebas

**Evidencia**

- No existe `.github/`.
- `npm test` ejecuta `echo "Error: no test specified" && exit 1`.
- `package.json` declara `"type": "commonjs"` mientras `src/` usa módulos ES (`import`). Vite lo tolera; **Insufficient data for el efecto en eslint**, que no se ejecutó.

---

## Fuera de alcance de esta revisión

- Correctitud clínica del léxico, los dominios y los casos OSCE.
- Resultados de lint o build.
- Configuración del proyecto en el panel de Cloudflare.
