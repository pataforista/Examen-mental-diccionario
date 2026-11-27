// Página de revisión del léxico (npm run lexicon:report).
// Genera docs/revision-lexico.html: los términos en una sola página, con filtros y
// los avisos de scripts/lexicon_checks.js marcados en cada uno. Solo lectura; para
// corregir, se edita el archivo del término que la página indica.
// El HTML se genera, no se versiona (está en .gitignore): vuelve a correr el comando.
const fs = require("fs");
const path = require("path");
const { RULES, runChecks } = require("./lexicon_checks");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs/revision-lexico.html");

const { findings, loadErrors, lexicon } = runChecks();
const domainLabels = Object.fromEntries(lexicon.domains.map(d => [d.domain_id, d.label_es || d.domain_id]));

const text = v => (typeof v === "string" ? v : v?.term || v?.message || v?.text || "");
const terms = lexicon.terms
  .map(({ term: t, file }) => ({
    id: t.term_id,
    file,
    name: t.canonical_name || "",
    kind: t.term_kind || "",
    risk: t.risk_weight ?? null,
    status: t.status || "",
    core: t.definition_clinical?.core || "",
    features: (t.definition_clinical?.required_features || []).map(text),
    subj: t.definition_clinical?.subjective_marker || "",
    behav: t.definition_clinical?.behavioral_marker || "",
    syn: (t.synonyms_and_slang || []).map(text).filter(Boolean),
    domains: (t.domain_links || []).map(l => ({ id: l.domain_id, rel: l.relation || "" })),
    teaching: (t.teaching_notes || []).map(text),
    pitfalls: (t.cognitive_pitfalls || []).map(text),
    alerts: (t.alerts || []).map(text),
    excl: (t.exclusions || []).map(e => ({ id: e.term_id || "", name: e.canonical_name || "", reason: e.reason || "" })),
    cie11: t.mappings?.cie11?.code || "",
    issues: findings.filter(f => f.term_id === t.term_id).map(f => ({ rule: f.rule, sev: f.severity, msg: f.message }))
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "es"));

const data = {
  generated: new Date().toISOString(),
  terms,
  domains: domainLabels,
  rules: RULES.map(r => ({ id: r.id, sev: r.severity, title: r.title })),
  loadErrors
};
// Seguro dentro de <script>: ningún "</script>" ni "<!--" del contenido cierra la etiqueta.
const json = JSON.stringify(data).replace(/</g, "\\u003c").replace(/[\u2028\u2029]/g, c => (c === "\u2028" ? "\\u2028" : "\\u2029"));

const template = fs.readFileSync(path.join(__dirname, "lexicon_report.template.html"), "utf8");
if (!template.includes("/*__DATA__*/null")) throw new Error("La plantilla no tiene el marcador /*__DATA__*/null");
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, template.replace("/*__DATA__*/null", () => json));

const withIssues = terms.filter(t => t.issues.length).length;
console.log(`Revisión del léxico → ${path.relative(ROOT, OUT)}`);
console.log(`${terms.length} términos · ${withIssues} con avisos o errores · ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
