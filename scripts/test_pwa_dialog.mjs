// Prueba de regresión del flujo de instalación PWA (banner, tarjeta de "Acerca de" y diálogo).
// No forma parte de `npm test` porque necesita un navegador: ejecútala antes de tocar
// src/pwa.js, el <dialog id="pwa-guide"> de index.html o su CSS.
//
//   npm run build && npm run preview -- --port 4173     (en otra terminal)
//   npm run test:pwa                                    (BASE_URL y CHROMIUM_PATH opcionales)
//
// Requiere Playwright (npm i -D playwright, o una instalación global). Lista de lo que cubre,
// y por qué existe cada comprobación, en CLAUDE.md › "Diálogo de instalación PWA".
import { readFileSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:4173/";
let playwright;
for (const spec of ["playwright", "/opt/node-tools/node_modules/playwright/index.mjs"]) {
  try { playwright = await import(spec); break; } catch { /* siguiente */ }
}
if (!playwright) { console.error("Falta Playwright: npm i -D playwright"); process.exit(2); }
const { chromium } = playwright;
const CACHE = /CACHE_NAME\s*=\s*"([^"]+)"/.exec(readFileSync(new URL("../sw.js", import.meta.url), "utf8"))[1];
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : (process.env.PLAYWRIGHT_BROWSERS_PATH ? { executablePath: process.env.PLAYWRIGHT_BROWSERS_PATH + '/chromium' } : {}));
const UA = {
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  and: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36',
  dsk: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
};
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const mk = async (ua, w = 390, h = 800, init) => {
  const ctx = await b.newContext({ userAgent: UA[ua], viewport: { width: w, height: h }, hasTouch: ua !== 'dsk', serviceWorkers: 'block' });
  if (init) await ctx.addInitScript(init);
  const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', e => p.errs.push(e.message)); p.on('console', m => { const t = m.text(); if (m.type() === 'error' && !/ERR_TUNNEL_CONNECTION_FAILED/.test(t) && !/Service Worker registration failed/.test(t)) p.errs.push(t); });
  await p.goto(BASE); await p.waitForSelector('#pwa-install-banner, #about-btn'); await p.waitForTimeout(900);
  return { ctx, p };
};
const isOpen = p => p.evaluate(() => document.getElementById('pwa-guide').open);
const lock = p => p.evaluate(() => document.documentElement.classList.contains('pwa-guide-open'));
const focusId = p => p.evaluate(() => document.activeElement?.id || document.activeElement?.className || document.activeElement?.tagName);

// ── T1 banner → abrir / Escape / foco ─────────────────────────────
{
  const { ctx, p } = await mk('ios');
  await p.click('#pwa-install-btn'); await p.waitForTimeout(400);
  ok(await isOpen(p), 'T1 banner abre el diálogo');
  ok(await lock(p), 'T1 bloquea scroll de fondo al abrir');
  ok(await p.evaluate(() => document.getElementById('pwa-guide').contains(document.activeElement)), 'T1 foco dentro del diálogo');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  ok(!(await isOpen(p)), 'T1 Escape cierra');
  ok(!(await lock(p)), 'T1 Escape libera scroll');
  ok((await focusId(p)) === 'pwa-install-btn', 'T1 foco vuelve al botón del banner (' + await focusId(p) + ')');
  await p.click('#pwa-install-btn'); await p.waitForTimeout(300);
  ok(await isOpen(p), 'T1 reabre tras cerrar');
  // ── T2 cierre por fondo vs padding ──
  const r = await p.evaluate(() => { const r = document.getElementById('pwa-guide').getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; });
  await p.mouse.click(r.l + 6, r.t + 200); await p.waitForTimeout(200); // padding lateral (dentro)
  ok(await isOpen(p), 'T2 clic en el padding interior NO cierra');
  await p.mouse.move(r.l + 50, r.t + 200); await p.mouse.down(); await p.mouse.move(r.l + 50, 20); await p.mouse.up(); await p.waitForTimeout(200);
  ok(await isOpen(p), 'T2 arrastre desde dentro hacia el fondo NO cierra');
  await p.mouse.click(190, 20); await p.waitForTimeout(250);
  ok(!(await isOpen(p)), 'T2 clic en el fondo oscurecido cierra');
  ok(!(await lock(p)), 'T2 libera scroll');
  // botones X y Entendido
  for (const id of ['pwa-guide-close', 'pwa-guide-done']) {
    await p.click('#pwa-install-btn'); await p.waitForTimeout(250);
    await p.click('#' + id); await p.waitForTimeout(200);
    ok(!(await isOpen(p)) && (await focusId(p)) === 'pwa-install-btn', `T3 ${id} cierra y devuelve foco`);
  }
  // ── T4 pestañas / chips ──
  await p.click('#pwa-install-btn'); await p.waitForTimeout(250);
  await p.focus('[data-platform=android]'); await p.keyboard.press('Enter'); await p.waitForTimeout(100);
  ok((await focusId(p)) === '' || await p.evaluate(() => document.activeElement.dataset.platform === 'android'), 'T4 foco se queda en la pestaña pulsada');
  ok(await p.evaluate(() => document.querySelector('[data-platform=android]').getAttribute('aria-pressed') === 'true' && document.querySelector('[data-platform=ios]').getAttribute('aria-pressed') === 'false'), 'T4 aria-pressed exclusivo');
  ok(await p.locator('#pwa-guide-browsers .pwa-chip').count() === 5, 'T4 Android muestra 5 chips');
  await p.click('[data-browser=samsung]'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => document.activeElement.dataset.browser === 'samsung'), 'T4 foco se queda en el chip pulsado');
  ok((await p.locator('.pwa-step').count()) === 4, 'T4 Samsung 4 pasos');
  await p.click('[data-platform=desktop]'); await p.click('[data-browser=firefox]');
  ok((await p.locator('.pwa-step').count()) === 2 && /no instala/.test(await p.locator('.pwa-notice').first().innerText()), 'T4 Firefox escritorio explica que no instala');
  // Tab queda atrapado dentro del modal
  for (let i = 0; i < 14; i++) await p.keyboard.press('Tab');
  ok(await p.evaluate(() => document.getElementById('pwa-guide').contains(document.activeElement)), 'T4 Tab no se escapa del modal');
  await p.keyboard.press('Escape');
  // showGuide doble no rompe el foco
  await p.evaluate(() => { App.pwa.showGuide(); App.pwa.showGuide(); }); await p.waitForTimeout(150);
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  ok((await focusId(p)) !== 'pwa-guide-close', 'T4 doble showGuide no deja foco huérfano (' + await focusId(p) + ')');
  // ── T5 tarjeta Acerca de ──
  await p.click('#about-btn'); await p.waitForTimeout(250);
  await p.click('.pwa-card button'); await p.waitForTimeout(300);
  ok(await isOpen(p), 'T5 tarjeta de Acerca de abre');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.activeElement.classList.contains('btn')), 'T5 foco vuelve a la tarjeta');
  // ── T9 Atrás del navegador ──
  await p.click('.pwa-card button'); await p.waitForTimeout(250);
  await p.goBack(); await p.waitForTimeout(400);
  ok(!(await isOpen(p)) && !(await lock(p)), 'T9 Atrás cierra el modal y libera scroll');
  // ── T10 descartar banner persiste ──
  await p.reload(); await p.waitForTimeout(900);
  const vis = await p.locator('#pwa-install-banner').evaluate(e => !e.classList.contains('hidden'));
  if (vis) { await p.click('#pwa-install-dismiss'); await p.reload(); await p.waitForTimeout(900); }
  ok(!(await p.locator('#pwa-install-banner').evaluate(e => !e.classList.contains('hidden'))), 'T10 descartar persiste tras recargar');
  ok(p.errs.length === 0, 'T1-10 sin errores de consola ' + JSON.stringify(p.errs));
  await ctx.close();
}

// ── T6 clic temprano (antes de cargar datos) ──────────────────────
{
  const ctx = await b.newContext({ userAgent: UA.ios, viewport: { width: 390, height: 800 }, serviceWorkers: 'block' });
  await ctx.route('**/lexicon_bundle.json', async r => { await new Promise(x => setTimeout(x, 2500)); r.continue(); });
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.goto(BASE); await p.waitForTimeout(500);
  const bannerEarly = await p.locator('#pwa-install-banner').evaluate(e => !e.classList.contains('hidden'));
  ok(bannerEarly, 'T6 banner ya visible antes de terminar de cargar datos');
  await p.click('#pwa-install-btn'); await p.waitForTimeout(300);
  ok(await isOpen(p) && (await p.locator('.pwa-step').count()) > 0, 'T6 guía abre con contenido durante la carga');
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  ok(!(await isOpen(p)), 'T6 y cierra durante la carga');
  await p.waitForTimeout(3000);
  ok(p.errs.length === 0, 'T6 sin errores ' + JSON.stringify(p.errs));
  await ctx.close();
}

// ── T7 beforeinstallprompt nativo ─────────────────────────────────
{
  const { ctx, p } = await mk('dsk', 1100, 800);
  ok(!(await p.locator('#pwa-install-banner').evaluate(e => !e.classList.contains('hidden'))), 'T7 escritorio sin evento: sin banner');
  await p.evaluate(() => {
    window.__calls = 0;
    const e = new Event('beforeinstallprompt', { cancelable: true });
    e.prompt = async () => { window.__calls++; };
    e.userChoice = Promise.resolve({ outcome: 'accepted' });
    window.dispatchEvent(e);
  });
  await p.waitForTimeout(150);
  ok((await p.locator('#pwa-install-btn').innerText()) === 'Instalar', 'T7 con evento: botón dice "Instalar"');
  await p.click('#pwa-install-btn'); await p.waitForTimeout(250);
  ok((await p.evaluate(() => window.__calls)) === 1 && !(await isOpen(p)), 'T7 usa el diálogo nativo (1 llamada) sin abrir guía');
  ok(!(await p.locator('#pwa-install-banner').evaluate(e => !e.classList.contains('hidden'))), 'T7 banner se oculta tras instalar');
  await p.click('#about-btn'); await p.click('.pwa-card button'); await p.waitForTimeout(250);
  ok(await isOpen(p), 'T7 evento consumido: la tarjeta cae a la guía manual');
  // appinstalled cierra
  await p.evaluate(() => window.dispatchEvent(new Event('appinstalled'))); await p.waitForTimeout(200);
  ok(!(await isOpen(p)) && !(await lock(p)), 'T8 appinstalled cierra el modal y libera scroll');
  ok(p.errs.length === 0, 'T7-8 sin errores ' + JSON.stringify(p.errs));
  await ctx.close();
}
// prompt() rechazado
{
  const { ctx, p } = await mk('and');
  await p.evaluate(() => {
    const e = new Event('beforeinstallprompt', { cancelable: true });
    e.prompt = async () => { throw new Error('not allowed'); }; e.userChoice = new Promise(() => {});
    window.dispatchEvent(e);
  });
  ok((await p.locator('#pwa-install-btn').innerText()) === 'Instalar', 'T7b Android con evento: "Instalar"');
  await p.click('#pwa-install-btn'); await p.waitForTimeout(350);
  ok(await isOpen(p), 'T7b prompt() rechazado → abre la guía');
  ok((await p.locator('#pwa-install-btn').innerText()) === 'Cómo hacerlo', 'T7b y el banner vuelve a "Cómo hacerlo"');
  await ctx.close();
}

// ── T11 standalone y localStorage bloqueado ───────────────────────
{
  const { ctx, p } = await mk('ios', 390, 800, () => { Object.defineProperty(navigator, 'standalone', { value: true }); });
  ok(!(await p.locator('#pwa-install-banner').evaluate(e => !e.classList.contains('hidden'))), 'T11 instalada: sin banner');
  await p.click('#about-btn'); await p.waitForTimeout(250);
  ok(/Ya estás usando la app instalada/.test(await p.locator('.pwa-card').innerText()) && (await p.locator('.pwa-card button').count()) === 0, 'T11 instalada: tarjeta de confirmación sin botón');
  await ctx.close();
}
{
  const { ctx, p } = await mk('ios', 390, 800, () => {
    Storage.prototype.getItem = () => { throw new Error('blocked'); }; Storage.prototype.setItem = () => { throw new Error('blocked'); };
  });
  ok(await p.locator('#pwa-install-banner').evaluate(e => !e.classList.contains('hidden')), 'T11b sin localStorage: banner igual aparece');
  await p.click('#pwa-install-dismiss'); await p.waitForTimeout(100);
  ok(!(await p.locator('#pwa-install-banner').evaluate(e => !e.classList.contains('hidden'))), 'T11b descartar funciona sin localStorage');
  await ctx.close();
}

// ── T13 desbordes a 320 px y altura baja, todas las guías ─────────
{
  const { ctx, p } = await mk('ios', 320, 568);
  await p.click('#pwa-install-btn'); await p.waitForTimeout(300);
  const groups = { ios: ['safari', 'chrome', 'firefox', 'edge'], android: ['chrome', 'samsung', 'firefox', 'edge', 'other'], desktop: ['chrome', 'edge', 'safari', 'firefox', 'other'] };
  let bad = [];
  for (const [pl, brs] of Object.entries(groups)) {
    await p.click(`[data-platform=${pl}]`);
    for (const br of brs) {
      await p.click(`[data-browser=${br}]`);
      const m = await p.evaluate(() => { const d = document.getElementById('pwa-guide'); const r = d.getBoundingClientRect(); return { hx: d.scrollWidth > d.clientWidth + 1, w: r.width, fit: r.right <= innerWidth + 1 && r.left >= -1, pageX: document.documentElement.scrollWidth > innerWidth }; });
      if (m.hx || !m.fit || m.pageX) bad.push(pl + '/' + br + JSON.stringify(m));
    }
  }
  ok(bad.length === 0, 'T13 sin desbordes horizontales a 320px en las 14 guías ' + bad.join(' | '));
  const sheet = await p.evaluate(() => { const r = document.getElementById('pwa-guide').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: innerHeight }; });
  ok(sheet.bottom <= sheet.h + 1 && sheet.top >= 0, 'T13 la hoja cabe en 568px de alto y hace scroll interno ' + JSON.stringify(sheet));
  const canScroll = await p.evaluate(() => { const d = document.getElementById('pwa-guide'); return d.scrollHeight > d.clientHeight; });
  await p.evaluate(() => document.getElementById('pwa-guide').scrollTo(0, 9999)); await p.waitForTimeout(100);
  const doneVisible = await p.evaluate(() => { const r = document.getElementById('pwa-guide-done').getBoundingClientRect(); return r.bottom <= innerHeight + 1; });
  ok(!canScroll || doneVisible, 'T13 "Entendido" alcanzable con scroll');
  await ctx.close();
}
// ── T14 service worker real ────────────────────────────────────────
{
  const ctx = await b.newContext({ userAgent: UA.ios, viewport: { width: 390, height: 800 } });
  const p = await ctx.newPage();
  await p.goto(BASE); await p.waitForTimeout(2500);
  const info = await p.evaluate(async CACHE => ({ keys: await caches.keys(), icon: !!(await (await caches.open(CACHE)).match('icon-192.png')) }), CACHE);
  ok(info.keys.length === 1 && info.keys[0] === CACHE, 'T14 solo existe la caché vigente de sw.js ' + JSON.stringify(info.keys));
  ok(info.icon, 'T14 icon-192.png (usado por banner/diálogo) está precacheado');
  await p.click('#about-btn'); await p.click('.pwa-card button'); await p.waitForTimeout(300);
  ok(await isOpen(p), 'T14 diálogo funciona con service worker activo');
  await ctx.close();
}
await b.close();
console.log(fails ? `\n${fails} FALLO(S)` : '\nTODO OK');
process.exit(fails ? 1 : 0);
