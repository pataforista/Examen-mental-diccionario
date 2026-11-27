# Diccionario de Examen Mental — guía para quien modifique el proyecto

PWA clínica en español (Vite + JS sin framework). Se despliega desde `dist/`, que **está versionado**.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` / `npm run build` / `npm run preview` | Desarrollo, build a `dist/`, servir el build |
| `npm test` | lint + validación del léxico + búsqueda + herramientas del léxico + contraste + lista negra de diseño. **Es la puerta para subir** |
| `npm run validate` | Reglas del léxico: errores bloquean; avisos de calidad se resumen. `-- --detalle` o `-- --regla <id>` para verlos |
| `npm run lexicon:report` | Genera `docs/revision-lexico.html` (no versionado): todos los términos con filtros y sus avisos |
| `npm run lexicon:audit` | Regenera `docs/auditorias/` (versionado): un documento por tema con los casos actuales; conserva la columna «Decisión» y mueve lo corregido a «Resueltos» |
| `npm run term:review -- ID… --por "Nombre"` | Firma la revisión clínica de términos (`--estado en_revision`, `--nota`, `--listar`) |
| `npm run term:new -- --prefijo … --nombre … --tipo … --dominio … --definicion …` | Crea un término (ID asignado, borrador, detección de duplicados; `--lista DOM-xx/sub`, `--prueba`) |
| `npm run lexicon:export` / `lexicon:import -- f.csv [--aplicar]` | Planilla de ida y vuelta de los campos clínicos (ver `docs/LEXICO.md`) |
| `npm run build:lexicon` | Regenera `lexicon/lexicon_bundle.json` (lo que lee la app) desde `lexicon/terms/` |
| `npm run search` | Regresión de la búsqueda contra el léxico real (`scripts/test_search.mjs`) |
| `npm run test:pwa` | Regresión del diálogo de instalación en navegador real (requiere Playwright y `preview` activo) |

## Antes de hacer commit

1. `npm run build` — `dist/` debe quedar al día con el código.
2. `npm test` — mira el **código de salida**, no un `grep` del resumen: una línea filtrada puede ocultar un fallo (la lista negra imprime "N incidencia(s)" sin que se note en un resumen parcial).
3. Si tocaste `src/pwa.js`, el `<dialog id="pwa-guide">`, el banner o su CSS: `npm run test:pwa`.
4. Si cambió cualquier archivo que el service worker sirve (CSS, JS, HTML, íconos, datos): **sube `CACHE_NAME` en `sw.js`**. El SW responde cache-first; con el mismo nombre, quien ya lo instaló no recibe los cambios.
5. Precaché: los archivos con hash de `dist/assets/` los inserta `vite.config.mjs` en el marcador `/* __VITE_ASSETS__ */` de `sw.js`; no los listes a mano ni borres el marcador. Las búsquedas en caché usan `ignoreVary` porque el JS/CSS se pide con `crossorigin` y un `Vary: Origin` del servidor impedía la coincidencia (la app quedaba vacía sin conexión tras la primera visita).

## Reglas del sistema de diseño ("humano")

Las aplica `scripts/check_blacklist.js` sobre `style.css` y `shared/humano-tokens.css`:

- Sin bordes de 2 px o más (`2px solid`…). Para un anillo o énfasis usa 1 px, `box-shadow` o `outline` de foco. Excepciones solo con el comentario `excepción permitida` en la misma línea.
- Sin sombras desplazadas duras, sin `text-transform: uppercase`, sin `font-weight` 800/900, sin `outline: none` sin reemplazo.
- Sin emojis en archivos versionados. Los íconos son SVG de trazo en `src/icons.js` (`getIcon("nombre")`). Símbolos tipográficos como ⋮ ≡ ⋯ ⌘ en texto sí pasan.
- Usa tokens (`var(--accent)`, `--bg-surface`, `--space-*`, `--radius-*`) en lugar de colores fijos; así el modo oscuro funciona sin código extra. Contraste mínimo 4.5:1 (`npm run contrast`).
- Animaciones: ya existe un bloque global de `prefers-reduced-motion`; no lo contradigas.

## Diálogo de instalación PWA (`src/pwa.js`, `#pwa-guide`)

Cada punto de esta lista corresponde a un error real que ocurrió y que `npm run test:pwa` vigila.

- **Inicializa temprano.** `pwa.init()` va *antes* de `await loadData()` en `dictionary.init`. `beforeinstallprompt` puede dispararse en cualquier momento; si el listener se registra tarde se pierde el evento, y un clic temprano abría un diálogo sin listeners (imposible de cerrar) y con plataforma `null`.
- **Cierre por fondo: compara coordenadas, no `e.target`.** El padding del `<dialog>` también devuelve `target === dialog`, así que `target === dialog` cierra el modal al tocar su propio margen. Se usa el rectángulo del diálogo y se exige que `pointerdown` también haya sido fuera (para no cerrar al arrastrar una selección).
- **Una sola vía de cierre.** Escape, `dialog.close()`, fondo, botones y `popstate` terminan en el evento `close` → `onClose()`, que libera el scroll y devuelve el foco. No pongas esa lógica solo en `closeGuide()`: Escape no la ejecutaría.
- **Foco.** Guarda el elemento activo solo cuando el diálogo se abre de verdad (si `showGuide()` se llama con el diálogo ya abierto, el "activo" estaría dentro del modal). Al cambiar de pestaña o chip no reconstruyas el botón pulsado, o recoloca el foco; si no, el teclado pierde su sitio.
- **Medidas con el diálogo visible.** `scrollTop`, `scrollIntoView`, `offsetLeft`… no funcionan mientras el `<dialog>` está cerrado (`display: none`). Ejecútalas después de `showModal()`.
- **Flex con altura máxima encoge a los hijos.** El diálogo es columna flex con `max-height`; sin `flex: none` en sus hijos el héroe y los chips se aplastaban. Mantén `.pwa-guide[open] > * { flex: none }`.
- **Semántica ARIA.** Los selectores de dispositivo y navegador son botones de alternancia (`role="group"` + `aria-pressed`), no `role="tab"`: no hay panel ni navegación por flechas, y prometer pestañas sin cumplirlas es peor que no declararlas.
- **El evento nativo se consume.** `deferredPrompt` solo sirve una vez; se anula antes de llamar a `prompt()`, y si falla se vuelve a la guía manual y el banner recupera "Cómo hacerlo".
- **Almacenamiento puede fallar** (modo privado, bloqueado). Toda lectura/escritura de `localStorage` va en `try/catch`.
- **Detección.** iPadOS se identifica como Mac: se distingue con `maxTouchPoints`. Los navegadores integrados (Instagram, Facebook, WebView de Android) no pueden instalar: la guía avisa de abrir en Safari/Chrome.
- **Contenido de la guía verificado.** Firefox de escritorio no instala PWAs; Chrome y Firefox en iOS (16.4+) añaden a inicio pero la app se abre dentro de ese navegador; Safari de escritorio requiere macOS 14+. Los pasos de **Edge en iOS y Edge en Android no se han confirmado** con fuente: están redactados en general. Verifícalos en un dispositivo real antes de afirmar más detalle.
- `innerHTML` solo se usa con constantes del propio archivo (`GUIDES`). No metas en él texto del usuario ni de los JSON clínicos sin `utils.sanitizeHTML`.

## Trampas de entorno (sesiones en la nube / sandbox)

- **No uses `pkill -f <patrón>` con un patrón que aparezca en tu propia línea de comando** (por ejemplo `vite preview`): mata el propio shell (código 144). Guarda el PID al lanzar (`cmd & echo $! > pid`) y usa `kill $(cat pid)`.
- El proxy de la sandbox bloquea CDNs. La app ya no depende de ninguno (Fuse va empaquetado); si aparece `ERR_TUNNEL_CONNECTION_FAILED`, revisa qué recurso externo se coló.
- Con `serviceWorkers: "block"` en Playwright, `navigator.serviceWorker.register()` resuelve `undefined` y `registerSW` registra "Service Worker registration failed": es un artefacto de la prueba. Para probar el SW de verdad, deja los service workers habilitados.
- Para ver el aspecto, haz capturas de móvil (390 px de ancho y también 320 px) en claro y oscuro; no des por buena una pantalla sin mirarla.

## Léxico (términos del diccionario)

- **Fuente de verdad:** un archivo por término en `lexicon/terms/<PREFIJO>/<ID>_<nombre>.json`. La app no los lee: lee `lexicon/lexicon_bundle.json`, que genera `npm run build:lexicon`. Tras editar un término, corre ese comando; `npm test` falla si el bundle quedó desactualizado.
- **Escribir términos** solo con las herramientas (`scripts/lexicon_edit.js` es el módulo común): mantienen el formato (2 espacios, salto final), no reutilizan IDs retirados (`lexicon/_deprecated/`) y detectan duplicados con el buscador de la app. Guía para personas: `docs/LEXICO.md` (herramientas) y `docs/GUIA_REVISION_CLINICA.md` (criterios de revisión).
- **Reglas** en `scripts/lexicon_checks.js`, compartidas por el validador y la página de revisión. Para una regla nueva, añade un objeto a `RULES` (y su lugar en `WARNING_ORDER` si es aviso). Error = rompe la app o la integridad; aviso = calidad clínica o de redacción.
- **Vocabularios cerrados** (`term_kind`, `granularity`, `risk_weight`, relaciones de dominio, tipos de alerta) en `taxonomy/controlled_vocabularies.json`. Un valor nuevo se añade ahí a propósito, no por accidente en un término.
- `lexicon/mappings/` es una carpeta heredada que la app no usa; sus códigos CIE-11 contradicen a veces los del término. La regla `cie11-conflicto` los señala para decisión clínica: no elijas uno automáticamente.
- **Dominios y léxico:** `domains/*.json` tienen descriptores para redactar (`accepted_terms`, cuyo **orden es clínico**: p. ej. alerta → somnolencia → … → coma). Los que son términos del diccionario se enlazan en `term_links` del subcomponente (`"descriptor": "ID"`) sin moverlos; en la vista Dominios abren la ficha. Enlaza por nombre exacto; un sinónimo puede no ser el mismo concepto (la regla `enlace-sugerido` lo deja a decisión clínica).
- **Revisión clínica:** bloque `review` del término (`status`, `reviewer`, `date`, `content_hash`). Escríbelo solo con `npm run term:review`: la huella permite avisar si el término cambia después de revisado, y el bundle (vía `bundleTerm`) solo marca como revisado lo vigente, que es lo único que la ficha muestra. **No firmes revisiones en nombre de nadie**: es una afirmación clínica.
- **Auditorías** (`docs/auditorias/`): las genera `scripts/lexicon_audit.js` a partir de las reglas. La columna «Decisión» la escriben personas: al regenerar se conserva por clave (`<!-- k:… -->`), no la borres. Un tema nuevo se añade en `TOPICS`.
- **Escala de riesgo sin definir:** el esquema define 0–2, los datos usan 0–5; la ficha pinta la alerta roja con `risk_weight > 1`. No asignes niveles 3–5 sin la definición clínica (pendiente en la auditoría de taxonomía).
- Las alertas son objetos `{ type, message }`; una alerta en texto suelto dejaba vacío el recuadro de riesgo de la ficha.

## Estructura útil

- `src/dictionary.js` — arranque, navegación por pestañas e historial (`pushState`/`popstate`), vista "Acerca de".
- `src/search.mjs` — búsqueda por niveles (nombre → sinónimos → definición → tolerancia a errores con Fuse). Sin DOM, para poder probarla en Node. Si cambias la lógica o el léxico, corre `npm run search`; si una consulta real falla, añádela a `CASES`.
- `src/pwa.js` — instalación (detección, banner, guía, tarjeta).
- `src/icons.js` — íconos SVG; agrega aquí los nuevos.
- `sw.js` — service worker (`CACHE_NAME`, precaché `ASSETS`).
- `vite.config.mjs` — copia a `dist/` los archivos que la app pide por URL (datos, íconos, SW); si agregas un recurso nuevo cargado en runtime, añádelo a `RUNTIME_FILES`.
