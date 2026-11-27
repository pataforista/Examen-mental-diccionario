// Marca el estado de revisión clínica de uno o varios términos.
//
//   npm run term:review -- RSK_006 RSK_007 --por "Dr. Cesar Celada"
//   npm run term:review -- RSK_006 --estado en_revision --nota "Falta revisar exclusiones"
//   npm run term:review -- --listar            resumen del estado de revisión
//
// --estado  revisado (por defecto) | en_revision | borrador
// --por     quién revisa; si falta, se usa LEXICON_REVIEWER o el nombre de git
// --nota    comentario opcional (se guarda en review.notes)
//
// Al marcar "revisado" se guarda la huella del contenido: si el término cambia
// después, el validador avisa "Cambió después de revisarse". Al terminar se
// regenera lexicon_bundle.json.
const { execFileSync } = require("child_process");
const path = require("path");
const { REVIEW_STATUSES, loadLexicon, reviewHash, reviewState, writeTerm, ROOT } = require("./lexicon_checks");

const args = process.argv.slice(2);
const opt = name => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const optionNames = ["--estado", "--por", "--nota"];
const ids = args.filter((a, i) => !a.startsWith("--") && !optionNames.includes(args[i - 1]));

const { terms } = loadLexicon();

if (args.includes("--listar") || (!ids.length && !args.length)) {
  const by = {};
  for (const { term } of terms) (by[reviewState(term)] = by[reviewState(term)] || []).push(term.term_id);
  const labels = { vigente: "Revisados y vigentes", desactualizada: "Cambiaron tras revisarse", en_revision: "En revisión", borrador: "Borrador", sin_revisar: "Sin revisar" };
  for (const [k, label] of Object.entries(labels)) {
    const list = by[k] || [];
    console.log(`${String(list.length).padStart(4)}  ${label}${list.length && k !== "sin_revisar" ? `: ${list.join(", ")}` : ""}`);
  }
  if (!args.length) console.log("\nUso: npm run term:review -- <ID…> [--estado revisado|en_revision|borrador] [--por \"Nombre\"] [--nota \"…\"]");
  process.exit(0);
}

const status = opt("--estado") || "revisado";
if (!REVIEW_STATUSES.includes(status)) {
  console.error(`Estado "${status}" no válido. Usa: ${REVIEW_STATUSES.join(", ")}`);
  process.exit(2);
}
let reviewer = opt("--por") || process.env.LEXICON_REVIEWER;
if (!reviewer) {
  try {
    reviewer = execFileSync("git", ["config", "user.name"], { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    /* sin git */
  }
}
if (status === "revisado" && !reviewer) {
  console.error('Falta quién revisa: usa --por "Nombre" o define LEXICON_REVIEWER.');
  process.exit(2);
}
if (!ids.length) {
  console.error("Indica al menos un ID de término (p. ej. RSK_006).");
  process.exit(2);
}

const byId = new Map(terms.map(t => [t.term.term_id, t]));
const missing = ids.filter(id => !byId.has(id));
if (missing.length) {
  console.error(`No existen: ${missing.join(", ")}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
for (const id of ids) {
  const { term, file } = byId.get(id);
  const review = { status, reviewer: reviewer || "", date: today };
  if (status === "revisado") review.content_hash = reviewHash(term);
  const note = opt("--nota");
  if (note) review.notes = note;
  else if (term.review?.notes && term.review.status === status) review.notes = term.review.notes;
  term.review = review;
  writeTerm(file, term);
  console.log(`${id}  ${term.canonical_name}  → ${status}${status === "revisado" ? ` por ${reviewer}, ${today}` : ""}`);
}

execFileSync(process.execPath, [path.join(__dirname, "optimize_lexicon.js")], { stdio: "inherit" });
