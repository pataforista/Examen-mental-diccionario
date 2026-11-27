// Validación del léxico (npm run validate; forma parte de npm test).
//
//   node scripts/validate_terms.js            resumen: errores completos, avisos por regla
//   node scripts/validate_terms.js --detalle  además, cada aviso con su término
//   node scripts/validate_terms.js --regla mayusculas   solo los hallazgos de esa regla
//
// Los errores hacen fallar el comando (código 1). Los avisos no: se revisan en la
// página de revisión (npm run lexicon:report).
const fs = require("fs");
const path = require("path");
const { RULES, runChecks } = require("./lexicon_checks");

const ROOT = path.join(__dirname, "..");
const BUNDLE_PATH = path.join(ROOT, "lexicon/lexicon_bundle.json");
const args = process.argv.slice(2);
const detail = args.includes("--detalle");
const onlyRule = args.includes("--regla") ? args[args.indexOf("--regla") + 1] : null;

const { findings, loadErrors, lexicon } = runChecks();
const shown = onlyRule ? findings.filter(f => f.rule === onlyRule) : findings;
if (onlyRule && !RULES.some(r => r.id === onlyRule)) {
  console.error(`No existe la regla "${onlyRule}". Reglas: ${RULES.map(r => r.id).join(", ")}`);
  process.exit(2);
}

const errors = shown.filter(f => f.severity === "error");
const warnings = shown.filter(f => f.severity === "aviso");

// La app lee lexicon_bundle.json, no los archivos sueltos: debe coincidir con ellos.
const bundleProblems = [];
if (!onlyRule) {
  let bundle;
  try {
    bundle = JSON.parse(fs.readFileSync(BUNDLE_PATH, "utf8"));
  } catch (e) {
    bundleProblems.push(`no se pudo leer lexicon_bundle.json (${e.message})`);
  }
  if (bundle) {
    const inBundle = new Map((bundle.terms || []).map(t => [t.term_id, JSON.stringify(t)]));
    const stale = [];
    for (const { term } of lexicon.terms) {
      if (inBundle.get(term.term_id) !== JSON.stringify(term)) stale.push(term.term_id);
      inBundle.delete(term.term_id);
    }
    const extra = [...inBundle.keys()];
    if (stale.length || extra.length) {
      bundleProblems.push(
        `lexicon_bundle.json está desactualizado (${stale.length} término(s) distintos o nuevos${extra.length ? `, ${extra.length} que ya no existen` : ""}: ` +
          `${[...stale, ...extra].slice(0, 6).join(", ")}${stale.length + extra.length > 6 ? "…" : ""}). Corre: npm run build:lexicon`
      );
    }
  }
}

console.log(`Validando el léxico: ${lexicon.terms.length} términos, ${RULES.length} reglas\n`);

for (const e of loadErrors) console.log(`ERROR  ${e.file}: ${e.message}`);
for (const p of bundleProblems) console.log(`ERROR  ${p}`);
for (const f of errors) console.log(`ERROR  ${f.term_id} · ${f.title}: ${f.message}\n       ${f.file}`);

if (warnings.length) {
  console.log(`\nAvisos de calidad (no bloquean):`);
  for (const rule of RULES.filter(r => r.severity === "aviso")) {
    const of = warnings.filter(f => f.rule === rule.id);
    if (!of.length) continue;
    const terms = new Set(of.map(f => f.term_id)).size;
    console.log(`  ${String(terms).padStart(4)} término(s) · ${rule.title}  [--regla ${rule.id}]`);
    if (detail || onlyRule) for (const f of of) console.log(`         ${f.term_id}: ${f.message}`);
  }
  if (!detail && !onlyRule) console.log(`\n  Detalle: node scripts/validate_terms.js --detalle  ·  Revisión visual: npm run lexicon:report`);
}

const totalErrors = errors.length + loadErrors.length + bundleProblems.length;
console.log(`\nErrores: ${totalErrors} · Avisos: ${warnings.length}`);
if (totalErrors) {
  console.log("Validación del léxico: FALLÓ. Corrige los errores de arriba.");
  process.exit(1);
}
console.log("Validación del léxico: sin errores.");
