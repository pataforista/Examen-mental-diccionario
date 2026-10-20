# Diccionario de Examen Mental — guía para quien modifique el proyecto

PWA clínica en español (Vite + JS sin framework). Se despliega desde `dist/`, que **está versionado**.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` / `npm run build` / `npm run preview` | Desarrollo, build a `dist/`, servir el build |
| `npm test` | lint + validación del léxico + contraste + lista negra de diseño. **Es la puerta para subir** |
| `npm run test:pwa` | Regresión del diálogo de instalación en navegador real (requiere Playwright y `preview` activo) |

## Antes de hacer commit

1. `npm run build` — `dist/` debe quedar al día con el código.
2. `npm test` — mira el **código de salida**, no un `grep` del resumen: una línea filtrada puede ocultar un fallo (la lista negra imprime "N incidencia(s)" sin que se note en un resumen parcial).
3. Si tocaste `src/pwa.js`, el `<dialog id="pwa-guide">`, el banner o su CSS: `npm run test:pwa`.
4. Si cambió cualquier archivo que el service worker sirve (CSS, JS, HTML, íconos, datos): **sube `CACHE_NAME` en `sw.js`**. El SW responde cache-first; con el mismo nombre, quien ya lo instaló no recibe los cambios.

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
- El proxy de la sandbox bloquea CDNs (p. ej. `cdn.jsdelivr.net`, que sirve `fuse.js`): los errores `ERR_TUNNEL_CONNECTION_FAILED` en consola de pruebas son del entorno, no del código.
- Con `serviceWorkers: "block"` en Playwright, `navigator.serviceWorker.register()` resuelve `undefined` y `registerSW` registra "Service Worker registration failed": es un artefacto de la prueba. Para probar el SW de verdad, deja los service workers habilitados.
- Para ver el aspecto, haz capturas de móvil (390 px de ancho y también 320 px) en claro y oscuro; no des por buena una pantalla sin mirarla.

## Estructura útil

- `src/dictionary.js` — arranque, navegación por pestañas e historial (`pushState`/`popstate`), vista "Acerca de".
- `src/pwa.js` — instalación (detección, banner, guía, tarjeta).
- `src/icons.js` — íconos SVG; agrega aquí los nuevos.
- `sw.js` — service worker (`CACHE_NAME`, precaché `ASSETS`).
- `vite.config.mjs` — copia a `dist/` los archivos que la app pide por URL (datos, íconos, SW); si agregas un recurso nuevo cargado en runtime, añádelo a `RUNTIME_FILES`.
