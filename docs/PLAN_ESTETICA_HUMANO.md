# Plan de migración estética: Diccionario de Examen Mental → sistema "humano"

Versión 1.1 (decisiones cerradas, §10) · 2026-10-17

Especificación maestra (valores, componentes, lista negra, contrato de integración):
`antipsicoticos-v3/docs/PLAN_UNIFICACION_ESTETICA.md`. Este documento dice **qué cambia aquí,
en qué archivo y en qué orden**. Si algo choca, gana la especificación maestra.

Alcance: sólo apariencia, tema y marcado de la interfaz. No toca `lexicon/`, `domains/`, `taxonomy/`,
los casos `OSCE_*.json` ni ningún texto clínico.

---

## 1. Diagnóstico

Es la app más alejada del sistema común. No por descuido: tiene una identidad deliberada, pero son
**dos** identidades, una por tema, y ninguna coincide con las otras dos apps.

### 1.1 Dos apps en una
| Aspecto | Tema claro ("Bauhaus-Memphis") | Tema oscuro ("Neo-Gothic forest") |
| --- | --- | --- |
| Fuente | Outfit | **Space Grotesk** (cambia la tipografía al cambiar de tema) |
| Fondo | Crema `#FFF8E7` | `#231f20` y, más abajo, `#1a151b` (dos bloques en conflicto) |
| Primario | Teal `#7acdbf` (1.8:1 como texto; existe `--primary-text #1b6e60` como parche) | Verde bosque `#789d5e` / `#5dcaa5` |
| Acento | Magenta `#95215c` | Menta `#b9e0a6` |
| Bordes | `4px solid #211f1f` | ninguno |
| Sombra | `6px 6px 0 #211f1f` | resplandor negro difuso |
| Textura | `texture-light.png` al 5 % | `texture-dark.png` al 10 % |

La maestra pide lo contrario (P5): la misma casa, distinta luz. Aquí cambian la casa, los muebles y la
letra.

### 1.2 Inventario de señales (`style.css`, 3 527 líneas)
| Señal | Cantidad | Observación |
| --- | --- | --- |
| Sombras desplazadas | 43 | `--v-shadow`, `--v-shadow-sm` y literales |
| Bordes ≥ 2 px | 29 | `--v-border: 4px solid` usado como atajo en 9 reglas |
| `text-transform: uppercase` | 23 | Más el título forzado en JS (ver 1.3) |
| Pesos 800/900 | 28 | |
| `letter-spacing` | 18 | Mayormente tracking ancho de etiquetas |
| Hex sueltos | 99 | |
| Referencias `--bau-*` | 108 | Paleta Memphis directa, sin capa semántica |
| `outline: none` | 4 | Hay un bloque `:focus-visible` al final (línea ~3472) que se conserva |
| Bloques `[data-theme="dark"]` de variables | 2 | Línea 83 y línea 2530, con valores distintos; gana el segundo por orden |
| Transición en `*` | 1 | `* { transition: background-color, color, border, box-shadow, transform }`: costo en listas largas y parpadeo al cambiar tema |
| Textura `body::before` | 1 | `position: fixed; z-index: 1000` sobre toda la app |
| Patrón de puntos Memphis | 1 | `.app-header::after` |

### 1.3 Fuera del CSS
| Archivo | Problema |
| --- | --- |
| `src/theme.js` | Pone `data-theme` en `<body>` (las otras apps en `<html>`); clave `mse-theme`; reescribe el título a `"DICCIONARIO DE EXAMEN MENTAL"` en cada cambio de tema; el botón de tema es un emoji (🌞/🌙, inicialmente 🌓); `theme-color` oscuro `#120C18` no coincide con el del HTML (`#231f20`) |
| `index.html` | Título y subtítulo en mayúsculas en el marcado ("REFERENCIA RÁPIDA", "MODO MAESTRO"); 19 emojis (navegación inferior 📖 🧩 📋 📝 🧠, ℹ️, 📲, ☕, ✕); 18 `style="…"`; `onclick` en línea en el pie; Google Fonts (Outfit, Space Grotesk) |
| `src/dictionary.js` | 104 `style=` y 35 emojis generados en vistas |
| `src/integrator.js` | 5 `style=`, 5 emojis |
| `pwa-minigame/` | Hoja propia `styles.css` con un tercer vocabulario (`--bg/--card/--line/--btn`, `--shadow: 6px 6px 0`, radio 4 px) |
| `vite.config.mjs` | `texture-light.png` y `texture-dark.png` listados en `RUNTIME_FILES` |
| `dist/` | 47 archivos versionados: un build viejo puede desplegarse con la estética antigua tras migrar |

### 1.4 Tres vocabularios de variables
1. Registro claro/oscuro: `--v-*` y `--o-*` → resuelven a `--bg`, `--text-p`, `--primary`, `--accent`,
   `--border`, `--shadow`, `--font-main`.
2. Bloque tardío (línea 2530): `--bg`, `--card`, `--muted`, `--text`, `--sub`, `--line`, `--ok`, `--bad`,
   `--btn`, `--btn-text`, `--radius`, que vienen del minijuego.
3. Paleta cruda `--bau-*`.

Además `--border` significa cosas distintas: en claro es un atajo `4px solid #211f1f` (se usa como
`border: var(--border)`), en el bloque tardío es un **color** (`#4e3a4b`). Una regla `border: var(--border)`
en oscuro termina siendo `border: #4e3a4b`, sin grosor ni estilo, que el navegador interpreta como
`medium none`: sin borde. Funciona por accidente.

---

## 2. Estrategia

Aquí no basta con aliasar: hay que **colapsar** primero los tres vocabularios en uno, porque los
alias heredarían las contradicciones.

1. **Fase E0 — Saneamiento sin cambio visual intencionado.** Unificar los dos bloques oscuros,
   separar `--border` en `--border-width/--border-color`, sacar la transición de `*`. Capturas
   antes/después deben coincidir salvo los conflictos que se resuelven (documentarlos).
2. **Fase E1 — Tokens comunes + alias.** `shared/humano-tokens.css` (copia de antipsicóticos con
   versión) y `src/humano-alias.css` (o al inicio de `style.css`) con el mapa del §3.
3. **Fase E2 — Identidad única.** Una fuente, una paleta, una gramática en ambos temas.
4. **Fase E3 — Componentes.** Capa `humano.css` cargada al final.
5. **Fase E4 — Marcado y JS.** Mayúsculas, emojis y estilos en línea en `index.html`, `theme.js`,
   `dictionary.js`, `integrator.js`, `game.js`.
6. **Fase E5 — Minijuego y limpieza.**

Orden de carga final:

```
shared/fonts.css → shared/humano-tokens.css → style.css (con alias al inicio) → humano.css
```

---

## 3. Mapa de tokens

### 3.1 Alias (válidos en ambos temas, sólo `var()` en `:root`)
| Variable propia | Alias |
| --- | --- |
| `--bg`, `--v-bg`, `--o-bg`, `--header-bg` | `var(--bg-app)` (header: `var(--glass-bg)`) |
| `--card`, `--surface-1` | `var(--bg-surface)` |
| `--muted`, `--surface-2` | `var(--bg-elevated)` |
| `--surface-3` | `var(--bg-hover)` |
| `--text-p`, `--text`, `--v-text`, `--o-text` | `var(--text-main)` |
| `--text-secondary`, `--sub` | `var(--text-muted)` |
| `--primary`, `--v-primary`, `--o-accent-b` | `var(--accent)` (índigo en claro, `#A9B3EE` en oscuro) |
| `--primary-text` | `var(--color-primary)` (desaparece el parche de contraste) |
| `--primary-container`, `--v-primary-container` | `var(--accent-soft)` |
| `--on-primary-container` | `var(--accent)` |
| `--btn` | `var(--color-primary)` en claro; `var(--h-btn)` en oscuro (bloque `[data-theme=dark]`) |
| `--btn-text` | `#fff` |
| `--accent`, `--v-accent` (magenta) | **No** a frambuesa por defecto: ver §3.2 |
| `--ok`, `--success` | `var(--h-mint)` |
| `--bad`, `--error`, `--alert-text` | `var(--ritual-red)` |
| `--line`, `--border-subtle` | `var(--border-subtle)` |
| `--border` | partir en `--border-width: 1px` + `--border-color: var(--border-subtle)` y reescribir sus 9 usos como `border: var(--border-width) solid var(--border-color)` |
| `--shadow`, `--v-shadow` | `var(--shadow-neo-md)` |
| `--v-shadow-sm` | `var(--shadow-neo-sm)` |
| `--o-shadow-glow`, `--o-shadow-red` | `var(--shadow-neo-md)` |
| `--font-main`, `--v-font`, `--o-font` | `var(--font-base)`; títulos `var(--font-display)` |
| `--radius-xs/sm` | 12 px (inputs) |
| `--radius-md/soft` | 14 px (botones) |
| `--radius-lg` | 20 px (tarjetas) |
| `--radius-sharp` | eliminar; sustituir por `--radius-xs` |
| `--radius` (minijuego, 4–8 px) | 14 px |
| `--transition-speed` | 200 ms (y quitar de `*`) |

### 3.2 Semántica de los colores propios
| Color | Uso encontrado | Destino |
| --- | --- | --- |
| `--bau-magenta` / `--v-accent` | Acentos de título, insignias, "badge-risk-critical" | Insignia de riesgo crítico → `--ritual-red`; resto (títulos, decoración) → `--accent` o `--h-pink` (sólo fondos) |
| `--bau-teal` | Primario | `--accent`. El teal puede sobrevivir **sólo** como color del ícono de la app (decisión abierta) |
| `--bau-yellow` | Puntos Memphis, destacados | `--h-peach` en fondos; nunca texto |
| `--bau-gold`, `--bau-olive`, `--bau-brown`, `--bau-brick`, `--bau-green`, `--bau-blue` | Tarjetas de dominio, etiquetas de tipo de ejemplo | Paleta categórica nueva de 6 tonos derivada del sistema (índigo, frambuesa suave, menta, ámbar, rosa, índigo claro), cada uno con fondo al 14 % y texto ≥ 4.5:1. Los dominios no son riesgo: no usar frambuesa sólida |
| `--o-accent-a` (menta), `--o-light` (musgo) | Acentos oscuros | `--accent` |
| `--o-primary-container` (púrpura), `--o-secondary-container` (vino) | Contenedores oscuros | `--accent-soft` / `--bg-elevated` |

---

## 4. Componentes, sección por sección de `style.css`

| Sección (línea aprox.) | Selectores | Cambio |
| --- | --- | --- |
| Textura (156) | `body::before` | Eliminar. La calidez la da el fondo durazno. Quitar los PNG de `RUNTIME_FILES` y del SW |
| Header (175–260) | `.app-header`, `.ritual-header`, `.ritual-subtitle`, `#app-title`, `.app-header::after` | Header común: `--glass-bg` + blur, borde 1 px; título `--font-display` 600, sin mayúsculas, primera letra frambuesa; subtítulo 13 px `--text-muted`; eliminar el patrón de puntos o convertirlo en blobs (maestra §3.5) si el header actúa como hero |
| `.icon-btn` | botones de tema y "acerca de" | Botón circular 40 px, `--bg-surface`, borde 1 px, ícono SVG de trazo |
| Búsqueda (260–350) | `.search-container`, `::before`, `input`, `.clear-btn` | Buscador del hero de antipsicóticos: superficie blanca, radio 20 px, `--shadow-neo-sm`, foco con anillo índigo; `.clear-btn` con ícono SVG |
| Tarjetas (353–600) | `.card`, `.totd-card`, `.term-card-simple`, `.list-item`, `.share-pill`, `.totd-ribbon` | Tarjeta común (radio 20 px, borde 1 px, sombra sm→md). "Término del día" como tarjeta destacada con `--hero-gradient` y un blob. `.totd-ribbon` → chip píldora |
| Insignias (593, 779) | `.badge-risk-critical`, `.tag`, `.section-label` | Chip común; crítico → frambuesa 10 % + texto frambuesa; etiquetas sin mayúsculas |
| Navegación inferior (640–690, 1661, 3230–3260) | `.bottom-nav`, `button`, `.nav-icon`, `.nav-indicator`, `.active::after` | Nav inferior común (`.m3-bottom-nav`): vidrio + blur, ítem activo `--accent-soft` con ícono `--accent`; íconos SVG |
| Dominios (708–760) | `.domain-grid`, `.domain-card`, `.domain-icon` | Como `.mission-card`: ícono en caja de 16 px con el color categórico al 14 % |
| Scrollbar (759) | `::-webkit-scrollbar-thumb` | `--border-subtle` / `--text-muted` |
| Juego (912–1190, 1345–1445, 3263–3300) | `.game-card`, `.segmented-control`, `.game-stats`, `.game-prompt`, `.opt`, `.feedback`, `.game-timer-bar`, `.animate-shake`, flashes | Opciones como `.guru-option`; retroalimentación como `.guru-feedback`; control segmentado con píldora activa `--accent-soft`; temporizador en índigo que pasa a ámbar y frambuesa (es estado); `animate-shake` y flashes bajo `prefers-reduced-motion` |
| Botones (1107–1190) | `.btn`, `.btn.primary`, `::before`, `.btn.ghost`, `.btn.secondary` | Botón primario, fantasma y secundario comunes; quitar el `::before` decorativo |
| ChromaGrid / autor (1190–1345) | `.chroma-*`, `.coffee-card` | Tarjeta de autor como `.brutal-profile-card` de antipsicóticos; CTA de apoyo como `.donation-cta` (píldora, durazno) |
| Detalle de término (1445–1660) | `.btn-back`, secciones de definición, `.recent-search-tag`, `.domain-detail-*`, `.subcomponent-item`, `.wording-box`, `.example-item`, `.example-type-badge` | Tarjetas y chips comunes; `.wording-box` con `--accent-soft` y radio 16 px (patrón `.disclaimer-lead`); tipos de ejemplo con la paleta categórica |
| Donación (1892–2000) | `.donation-widget`, `.donation-link` | `.donation-cta` |
| Interruptor (2003) | `.m3-switch`, `-slider` | Pista `--border-subtle`, activa `--color-primary` (oscuro `--h-btn`), pulgar blanco con `--shadow-neo-xs` |
| Integrador (2107–2530) | `.integrator-header`, `.m3-progress-bar`, `.stepper-sidebar`, `.step-item`, `.int-opt`, `.step-writing-area`, `.report-preview-panel`, `.report-actions` | Stepper como navegación lateral común (ítem activo superficie + sombra sm; completado con punto menta); opciones como chips; área de escritura como input grande (radio 16 px); vista previa como tarjeta elevada; barra de progreso índigo de 6 px redondeada |
| Overrides oscuros (2530–2890) | segundo bloque `[data-theme="dark"]` | Absorbido por los tokens; se borra cuando las capturas oscuras coincidan con la gramática |
| Banner PWA (2898) | `.pwa-install-banner` | Toast/banner común, sin emoji, radio 16 px |
| Toast (3152–3220) | `.toast`, `.info` | Toast común |
| Esqueleto (3300) | `.skeleton-block` | `--bg-hover` |
| Movimiento (3415) y foco (3472) | `prefers-reduced-motion`, `:focus-visible` | Conservar; alinear el foco a `2px solid var(--accent)`, offset 2 px |

Casos OSCE (`#cases-view`): no tiene sección propia identificable en `style.css`; se renderiza desde
`src/dictionary.js` con estilos en línea. Se trata en la Fase E4 con las clases comunes (tarjeta,
acordeón, chip). Ver también `OSCE_ESTRUCTURA_Y_DISENO.md` para su arquitectura de información, que
no cambia.

---

## 5. Marcado y JavaScript

### 5.1 `src/theme.js`
```js
// Objetivo
set(theme, persist = true) {
  this.current = theme;
  document.documentElement.setAttribute("data-theme", theme);   // <html>, no <body>
  document.documentElement.classList.toggle("theme-dark", theme === "dark");
  document.documentElement.classList.toggle("theme-light", theme === "light");
  // ícono SVG de trazo (sol/luna) en vez de emoji; el título ya no se reescribe
  if (persist) { localStorage.setItem("theme", theme); }
  meta.setAttribute("content", theme === "light" ? "#FBF1EC" : "#191A2B");
}
```
- Leer `localStorage["theme"]` primero y `mse-theme` como respaldo; al encontrar la vieja, copiarla a
  `theme` y borrarla (EM4).
- Selectores `[data-theme="dark"] body`, `[data-theme="dark"] .x` siguen funcionando con el atributo en
  `<html>`; buscar los que dependan de `body[data-theme]` (`grep -n "body\[data-theme" style.css`).
- El script de arranque en línea de `index.html` (línea ~83) ya evita el destello, pero escribe en
  `document.body` y lee sólo `mse-theme`. Cambiarlo a `document.documentElement`, leer `theme` con
  `mse-theme` de respaldo, y fijar también `theme-color`. Su `catch (e) { }` vacío debe registrar el
  error (`console.warn`), como hace antidepresivos.

### 5.2 `index.html`
| Elemento | Cambio |
| --- | --- |
| `<h1 id="app-title">DICCIONARIO DE EXAMEN MENTAL</h1>` | "Diccionario de examen mental" (y quitar la reescritura en `theme.js`) |
| `REFERENCIA RÁPIDA`, `MODO MAESTRO` | Frase normal; estilos en línea → clase |
| Navegación inferior 📖 🧩 📋 📝 🧠 | Íconos SVG de trazo (libro, cuadrícula, portapapeles, lápiz, cerebro/diana) |
| 🌓 ℹ️ ✕ 📲 ☕ | SVG; ☕ fuera del botón (texto "Apoyar el proyecto") |
| `onclick="window.open(...)"` del pie | `<a href target="_blank" rel="noopener">` con clase `.donation-cta` |
| Google Fonts | Fuentes locales compartidas; CSP `font-src 'self'` y quitar `fonts.googleapis.com` de `default-src`/`style-src` |
| `theme-color` | `#FBF1EC` / `#191A2B` |

### 5.3 Vistas generadas
- `src/dictionary.js` (104 estilos en línea, 35 emojis): extraer un pequeño conjunto de clases
  (`.term-meta`, `.label-eyebrow`, `.example-type-badge--<tipo>`, `.status-dot--*`) y reemplazar.
  Prioridad: los que llevan color, borde, radio o mayúsculas.
- `src/integrator.js` y `src/game.js`: mismo patrón.
- Íconos: crear `src/icons.js` con un `getIcon(name)` equivalente al de antipsicóticos (mismos trazos)
  para que las tres apps compartan dibujo.

---

## 6. Minijuego (`pwa-minigame/`)

Tiene `styles.css` propio. Dos opciones:

| Opción | Pros | Contras |
| --- | --- | --- |
| A. Enlazar `humano-tokens.css` y aliasar su vocabulario (`--bg/--card/--line/--btn/--shadow/--radius`) | Poco trabajo, mismo resultado visual | Sigue siendo una hoja aparte |
| B. Absorberlo en la vista "Entrenamiento" de la app principal | Una sola base de código | Más trabajo; requiere revisar si se publica por separado |

Decisión (EM1, §10): opción A. La B queda fuera de este plan.

---

## 7. Secuencia de PR

| PR | Contenido | Riesgo | Validación extra |
| --- | --- | --- | --- |
| E0 | Saneamiento: un solo bloque oscuro, `--border` partido, sin transición en `*` | Medio: puede cambiar detalles del oscuro | Capturas antes/después; lista de diferencias esperadas en el PR |
| E1 | Tokens comunes + alias (§3.1) + test de contraste + fuentes locales | Alto: cambia todo el color y la letra | Matriz completa; §3.2 revisado vista por vista |
| E2 | `theme.js`, script de arranque en línea, `theme-color`, clave común (§5.1) | Bajo | Cambiar tema, recargar, offline |
| E3a | Header, búsqueda, nav inferior, botones, tarjetas, chips (§4) | Medio | Diccionario y detalle de término |
| E3b | Dominios, juego, integrador (§4) | Medio | Recorrer un juego y un informe completo |
| E4 | Marcado: mayúsculas, emojis, estilos en línea (§5.2–5.3) | Medio: toca JS de vistas | `npm test` (lint + validación de términos) |
| E5 | Minijuego (opción A), quitar texturas, limpiar `--bau-*` muertos | Bajo | Build y despliegue de prueba |
| E6 | Dejar de versionar `dist/` (EM2, sólo tras configurar el build en Pages) | Medio: afecta la publicación | Despliegue de vista previa antes de fusionar |

## 8. Verificación (cada PR)

- `npm test` (lint + `validate_terms`) y `npm run build`.
- Test de contraste de tokens (copiado de antipsicóticos) en verde.
- Capturas: {diccionario, resultados, término, dominios, caso OSCE, integrador, entrenamiento, acerca de,
  banner PWA} × {claro, oscuro} × {1280, 390 px}, junto a las equivalentes de antipsicóticos.
- Lista negra de la maestra sobre `style.css` y `pwa-minigame/styles.css` sin regresiones; en 0 al cerrar E5.
- 0 errores de consola; Lighthouse PWA sin regresión.
- Android Chrome: confirmar que no vuelve el "font boosting" del Integrador (`text-size-adjust` en `html`
  se conserva).
- Si `dist/` sigue versionado, regenerarlo en el mismo PR o el despliegue mostrará la estética anterior.

## 9. Riesgos específicos de esta app

| Riesgo | Mitigación |
| --- | --- |
| Perder la identidad que hacía reconocible la app | Teal en el ícono de app (D2); el resto, sistema común |
| `--border` con dos significados rompe bordes al aliasar | Partirlo en E0 antes de cualquier alias |
| Mover `data-theme` a `<html>` rompe selectores que asumen el atributo en `body` | Hoy no hay `body[data-theme]` en `style.css`; repetir el `grep` en `src/` y `pwa-minigame/` en E2 |
| Quitar la transición en `*` elimina suavidad en el cambio de tema | Transición explícita sólo en `body`, tarjetas y botones |
| Las tarjetas de dominio pierden su color diferenciador | Paleta categórica de 6 tonos (§3.2) |
| Build viejo en `dist/` | Ver §8 |

## 10. Decisiones tomadas (2026-10-17)

Delegadas por el responsable del proyecto. Las comunes están justificadas en la maestra (§13).

| # | Decisión | Por qué / efecto aquí |
| --- | --- | --- |
| D2 (maestra) | **Índigo pleno** en la interfaz; el teal queda sólo en el ícono de la app (manifest, favicon, `apple-touch-icon`) | El teal no llega a AA como texto (1.8:1) y hoy necesita un parche (`--primary-text`). Un color que exige parches no debe ser el de trabajo |
| D5 (maestra) | Sin versión en inglés por ahora; el selector de idioma del shell se oculta en esta app | Traducir el léxico es contenido clínico, fuera de este plan |
| EM1 | Minijuego: **opción A** (enlazar tokens y aliasar su hoja) | Cambio pequeño y reversible. La opción B (absorberlo en "Entrenamiento") es un refactor de producto, no de estética; si se quiere, va en un plan propio después de la Fase 3 |
| EM2 | **`dist/` deja de versionarse**, en dos pasos y en este orden: (1) configurar el proyecto de Cloudflare Pages con comando `npm run build` y directorio `dist`, y comprobar un despliegue de vista previa; (2) en un PR aparte, añadir `dist/` a `.gitignore` y `git rm -r --cached dist` | Un artefacto versionado se desincroniza del código (ya hay commits "Regenera dist/…" a mano) y duplica cada diff. El orden evita dejar el sitio sin publicar: hoy no hay configuración de despliegue en el repo, así que es probable que Pages sirva `dist/` tal cual. Hasta completar el paso 1, cada PR de estética regenera `dist/` |
| EM3 | Las texturas (`texture-*.png`) **se eliminan**, no se sustituyen | La calidez la dan el fondo durazno y los blobs; un `position: fixed` con `z-index: 1000` sobre toda la app es costo de pintado sin información. Se borran también de `RUNTIME_FILES` y del precache del SW |
| EM4 | Clave de tema: se lee `theme` y, si no existe, `mse-theme`; se escribe sólo `theme`. `mse-theme` se borra al leerla | Migración de un solo paso: el valor viejo se copia la primera vez y no queda estado duplicado |
| EM5 | Las tarjetas de dominio usan una paleta categórica de 6 tonos derivada del sistema, nunca frambuesa sólida | Los dominios no son riesgo (maestra §6); mantienen diferenciación sin romper la semántica |
| EM6 | Se añade una prueba de contraste de tokens (copiada de antipsicóticos) a `npm test` | Hoy `npm test` es lint + validación de términos; sin esta red, la Fase E1 podría bajar AA sin que nadie lo note |
