// Crea un término nuevo con su ID asignado y la estructura completa del esquema.
//
//   npm run term:new -- --prefijo DEL --nombre "Delirio de celos" --tipo síntoma \
//     --dominio DOM-07 --definicion "Convicción delirante de infidelidad de la pareja."
//
// Obligatorios: --prefijo, --nombre, --tipo, --dominio, --definicion
// Opcionales:   --relacion primary_expression (por defecto)  --riesgo 0-5 (0)
//               --sinonimos "celotipia; delirio celotípico"   --subjetivo "…"  --conductual "…"
//               --lista DOM-07/ideas_delirantes   (lo añade a esa lista del dominio: Integrador y vista Dominios)
//               --prueba   (muestra lo que haría, sin escribir)
//               --forzar   (crear aunque un término existente tenga ese nombre o sinónimo)
//
// El término queda en revisión "borrador". Después: completa el archivo (exclusiones,
// notas docentes…) y firma la revisión con npm run term:review.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { loadLexicon, normalize } = require("./lexicon_checks");
const { nextId, knownPrefixes, buildTerm, createTermFile, addToSubcomponent, similarTerms } = require("./lexicon_edit");

const args = process.argv.slice(2);
const opt = name => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const fail = msg => {
  console.error(`No se creó el término: ${msg}`);
  process.exit(1);
};

const { terms, domains, vocab } = loadLexicon();
const prefix = (opt("--prefijo") || "").toUpperCase();
const name = (opt("--nombre") || "").trim();
const kind = opt("--tipo");
const domainId = opt("--dominio");
const core = (opt("--definicion") || "").trim();
const relation = opt("--relacion") || "primary_expression";
const risk = opt("--riesgo") === undefined ? 0 : Number(opt("--riesgo"));
const list = opt("--lista");
const dryRun = args.includes("--prueba");

if (!args.length || args.includes("--ayuda")) {
  console.log(fs.readFileSync(__filename, "utf8").split("\n").filter(l => l.startsWith("//")).map(l => l.slice(3)).join("\n"));
  process.exit(0);
}
const missing = [["--prefijo", prefix], ["--nombre", name], ["--tipo", kind], ["--dominio", domainId], ["--definicion", core]].filter(([, v]) => !v).map(([k]) => k);
if (missing.length) fail(`faltan ${missing.join(", ")} (npm run term:new -- --ayuda)`);
if (!knownPrefixes().includes(prefix)) fail(`prefijo ${prefix} desconocido. Existentes: ${knownPrefixes().join(", ")}`);
if (!vocab.term_kind.includes(kind)) fail(`tipo "${kind}" no está en el vocabulario: ${vocab.term_kind.join(", ")}`);
if (!domains.some(d => d.domain_id === domainId)) fail(`dominio ${domainId} no existe`);
if (!vocab.domain_relation.includes(relation)) fail(`relación "${relation}" no está en el vocabulario`);
if (!vocab.risk_weight.includes(risk)) fail(`riesgo ${opt("--riesgo")} inválido (0 a 5)`);
if (list && !list.startsWith(`${domainId}/`)) fail(`--lista debe ser del mismo dominio (${domainId}/…)`);
const clash = terms.find(({ term }) => normalize(term.canonical_name) === normalize(name));
if (clash) fail(`ya existe "${clash.term.canonical_name}" (${clash.term.term_id})`);


const id = nextId(prefix);
const term = buildTerm({
  id,
  name,
  kind,
  risk,
  core,
  subjective: opt("--subjetivo") || "",
  behavioral: opt("--conductual") || "",
  synonyms: (opt("--sinonimos") || "").split(";").map(s => s.trim()).filter(Boolean),
  domains: [{ domain_id: domainId, relation }]
});

(async () => {
const similar = await similarTerms(terms.map(t => t.term), [name, ...(opt("--sinonimos") || "").split(";")]);
const blocking = similar.filter(x => x.exact);
if (similar.length) {
  console.log("Términos parecidos que ya existen:");
  for (const { t, q, exact } of similar) console.log(`  ${exact ? "≡" : "~"} ${t.term_id} ${t.canonical_name}  (por "${q}"${exact ? ", es su nombre o un sinónimo" : ""})`);
}
if (blocking.length && !args.includes("--forzar")) {
  fail("ya hay un término con ese nombre o sinónimo. Si es otro concepto, repite el comando con --forzar; si es el mismo, agrega lo que falte a ese término.");
}

if (dryRun) {
  console.log(`(prueba) Se crearía ${id}:\n${JSON.stringify(term, null, 2)}${list ? `\n(prueba) y se añadiría a la lista ${list}` : ""}`);
  process.exit(0);
}

const file = createTermFile(term);
console.log(`Creado ${id} · ${name} → ${file}`);
if (list) {
  try {
    const placed = addToSubcomponent(list, term);
    console.log(`Añadido a ${list} como "${placed.label}" (${placed.file}). Va al final de la lista: si es una escala, muévelo a su lugar.`);
  } catch (e) {
    console.error(`El término se creó, pero no se añadió a la lista: ${e.message}`);
  }
}
execFileSync(process.execPath, [path.join(__dirname, "optimize_lexicon.js")], { stdio: "inherit" });
console.log(`\nSiguiente: completa ${file} (exclusiones, notas docentes, alertas) y firma con npm run term:review -- ${id} --por "Nombre".`);
})();
