// Lista negra del sistema "humano" (maestra §5). Falla si aparece alguna regla
// prohibida en el CSS migrado o algún emoji en el repositorio. Las excepciones permitidas
// (foco de 2 px, borde izquierdo de alerta) se marcan en la misma línea con
// un comentario que contiene "excepción permitida" o "no es trazo".
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = f => fs.readFileSync(path.join(root, f), "utf8");
const CSS = ["style.css", "shared/humano-tokens.css"];
// Emojis: cualquier archivo de texto versionado, salvo el build generado (dist/).
const { execSync } = require("node:child_process");
const TEXT = /\.(js|mjs|cjs|html|css|json|md|webmanifest|txt|xml)$/;
const UI = execSync("git ls-files", { cwd: root, encoding: "utf8" })
  .split("\n")
  .filter(f => f && !f.startsWith("dist/") && TEXT.test(f));

const RULES = [
  ["sombra desplazada", /\b[1-9]\d*px [1-9]\d*px 0(px)?\s/],
  ["borde ≥ 2 px", /[2-9]px (solid|dashed|dotted)/],
  ["mayúsculas forzadas", /text-transform:\s*uppercase/],
  ["peso 800/900", /font-weight:\s*(800|900)/],
  ["outline: none sin reemplazo", /outline:\s*none(?![^\n]*reemplazad)/]
];
const EXEMPT = /excepción permitida|no es trazo/;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

let problems = 0;
for (const f of CSS) {
  read(f).split("\n").forEach((line, i) => {
    if (EXEMPT.test(line)) return;
    for (const [name, re] of RULES) {
      if (re.test(line)) {
        problems++;
        console.log(`${f}:${i + 1} ${name}: ${line.trim()}`);
      }
    }
  });
}
for (const f of UI) {
  read(f).split("\n").forEach((line, i) => {
    if (EMOJI.test(line)) {
      problems++;
      console.log(`${f}:${i + 1} emoji: ${line.trim().slice(0, 100)}`);
    }
  });
}

if (problems) {
  console.error(`\nLista negra: ${problems} incidencia(s)`);
  process.exit(1);
}
console.log("Lista negra: 0 incidencias");
