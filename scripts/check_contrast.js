// Prueba de contraste WCAG de los tokens (EM6; maestra §0.2).
// Lee shared/humano-tokens.css y los alias de style.css, resuelve var() por tema
// y exige ≥ 4.5:1 en los pares de texto. Sale con código 1 si alguno falla.
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const css = ["shared/humano-tokens.css", "style.css"].map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n");

// Bloques de variables: ":root" (y el bloque claro) vs. "[data-theme=\"dark\"]".
function collect(themeDark) {
  const vars = {};
  const blockRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = blockRe.exec(css))) {
    const sel = m[1].trim().split("\n").pop().trim();
    const full = m[1];
    const isRoot = /(^|,)\s*:root\s*(,|$)/m.test(full) && !/data-theme="dark"/.test(full);
    const isLight = /data-theme="light"/.test(full) && !/data-theme="dark"/.test(full);
    const isDark = /^\s*(\.theme-dark,\s*)?\[data-theme="dark"\]\s*$/m.test(full.trim()) || /^\.theme-dark,\s*\n?\s*\[data-theme="dark"\]$/.test(full.trim());
    if (!(isRoot || isLight || (themeDark && isDark))) continue;
    if (!sel) continue;
    const declRe = /(--[\w-]+)\s*:\s*([^;]+);/g;
    let d;
    while ((d = declRe.exec(m[2]))) vars[d[1]] = d[2].trim();
  }
  return vars;
}

function resolve(vars, value, depth = 0) {
  if (depth > 10) throw new Error("var() circular: " + value);
  return value.replace(/var\((--[\w-]+)(?:,\s*([^)]+))?\)/g, (_, name, fb) => {
    if (vars[name] !== undefined) return resolve(vars, vars[name], depth + 1);
    if (fb) return resolve(vars, fb, depth + 1);
    throw new Error("Token sin definir: " + name);
  });
}

function parseColor(str) {
  str = str.trim();
  let m = str.match(/^#([0-9a-f]{6})$/i);
  if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16), 1];
  m = str.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const p = m[1].split(",").map(x => parseFloat(x));
    return [p[0], p[1], p[2], p[3] === undefined ? 1 : p[3]];
  }
  throw new Error("Color no soportado: " + str);
}

const over = (fg, bg) => [0, 1, 2].map(i => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat(1);

function lum([r, g, b]) {
  const c = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function ratio(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// [texto, fondo, capa tenue opcional sobre el fondo]
const PAIRS = [
  ["--text-main", "--bg-app"],
  ["--text-main", "--bg-surface"],
  ["--text-main", "--bg-elevated"],
  ["--text-muted", "--bg-surface"],
  ["--text-muted", "--bg-elevated"],
  ["--text-muted", "--bg-app"],
  ["--ritual-red", "--bg-surface"],
  ["#FFFFFF", "--h-indigo"],
  ["#FFFFFF", "--h-btn"],
  ["#FFFFFF", "--h-btn-hover"],
  ["--accent", "--bg-surface"],
  ["--accent", "--accent-soft"],
  ["--accent", "--bg-app"],
  ["--mint-text", "--bg-surface"],
  ["--mint-text", "--bg-surface", "rgba(62, 156, 127, 0.12)"],
  ["--h-amber-text", "--bg-surface", "--h-warn-bg"],
  ["--ritual-red", "--bg-surface", "rgba(190, 54, 80, 0.10)"],
  ["--text-main", "--bg-surface", "--h-warn-bg"],
  ...[1, 2, 3, 4, 5, 6].map(i => [`--cat-${i}-fg`, "--bg-surface", `--cat-${i}-bg`])
];

let failures = 0;
for (const dark of [false, true]) {
  const vars = collect(dark);
  const get = t => parseColor(t.startsWith("--") ? resolve(vars, `var(${t})`) : resolve(vars, t));
  for (const [fgT, bgT, tintT] of PAIRS) {
    let bg = get(bgT);
    if (tintT) bg = over(get(tintT), bg);
    const fg = over(get(fgT), bg);
    const r = ratio(fg, bg);
    const ok = r >= 4.5;
    if (!ok) failures++;
    console.log(`${ok ? "ok  " : "FAIL"} ${dark ? "oscuro" : "claro "} ${fgT} sobre ${bgT}${tintT ? " + " + tintT : ""}: ${r.toFixed(2)}:1`);
  }
}

if (failures) {
  console.error(`\n${failures} par(es) por debajo de 4.5:1`);
  process.exit(1);
}
console.log("\nContraste de tokens: todos los pares ≥ 4.5:1");
