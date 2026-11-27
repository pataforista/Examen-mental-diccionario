// Operaciones de escritura sobre el léxico, compartidas por term:new y la planilla
// (lexicon:import). Todo lo que crea o cambia términos pasa por aquí para que el
// formato, los IDs y la colocación en los dominios sean siempre los mismos.
const fs = require("fs");
const path = require("path");
const { ROOT, writeTerm, normalize } = require("./lexicon_checks");

const TERMS_DIR = path.join(ROOT, "lexicon/terms");
const DEPRECATED_DIR = path.join(ROOT, "lexicon/_deprecated");
const REGISTRY_PATH = path.join(ROOT, "lexicon/term_id_registry.json");

// ── CSV (RFC 4180) ──────────────────────────────────────────────────────
// Detecta el separador (coma, punto y coma o tabulador: Excel en español guarda con ";").
function parseCSV(text) {
  const src = text.replace(/^\uFEFF/, "");
  const firstLine = src.slice(0, src.indexOf("\n") === -1 ? src.length : src.indexOf("\n"));
  const counts = [",", ";", "\t"].map(c => [c, firstLine.split(c).length]);
  const sep = counts.sort((a, b) => b[1] - a[1])[0][0];
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"' && field === "") quoted = true;
    else if (c === sep) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  const nonEmpty = rows.filter(r => r.some(v => v.trim() !== ""));
  const [header = [], ...body] = nonEmpty;
  return { header: header.map(h => h.trim()), rows: body, sep };
}

function toCSV(header, rows) {
  const cell = v => {
    const s = String(v ?? "");
    return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // BOM: Excel abre bien los acentos solo si el archivo lo lleva.
  return `\uFEFF${[header, ...rows].map(r => r.map(cell).join(",")).join("\r\n")}\r\n`;
}

// ── IDs y archivos ──────────────────────────────────────────────────────
function existingIds() {
  const ids = [];
  const walk = d =>
    fs.existsSync(d) &&
    fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
      if (e.isDirectory()) walk(path.join(d, e.name));
      else {
        const m = e.name.match(/^([A-Z]+_\d{3})_/);
        if (m) ids.push(m[1]);
      }
    });
  walk(TERMS_DIR);
  walk(DEPRECATED_DIR); // un ID retirado no se reutiliza
  return ids;
}

// Siguiente ID libre del prefijo. `taken` permite reservar varios en una misma importación.
function nextId(prefix, taken = new Set()) {
  if (!/^[A-Z]+$/.test(prefix)) throw new Error(`Prefijo "${prefix}" inválido: solo mayúsculas (p. ej. DEL, PER)`);
  let max = 0;
  for (const id of [...existingIds(), ...taken]) {
    const [p, n] = id.split("_");
    if (p === prefix) max = Math.max(max, parseInt(n, 10));
  }
  try {
    const reg = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
    max = Math.max(max, (reg.prefixes?.[prefix]?.next_seq || 1) - 1);
  } catch {
    /* sin registro */
  }
  const id = `${prefix}_${String(max + 1).padStart(3, "0")}`;
  taken.add(id);
  return id;
}

function knownPrefixes() {
  return fs.readdirSync(TERMS_DIR, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name);
}

const slug = s =>
  normalize(s)
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 60);

// Un término nuevo con la estructura completa del esquema; queda como borrador de revisión.
function buildTerm({ id, name, kind, risk = 0, core, subjective = "", behavioral = "", synonyms = [], domains = [], teaching = [], pitfalls = [] }) {
  return {
    term_id: id,
    canonical_name: name,
    synonyms_and_slang: synonyms.map(term => ({ term, context: "clínico", locale: "es" })),
    term_kind: kind,
    granularity: "atomic",
    risk_weight: risk,
    definition_clinical: { core, required_features: [], subjective_marker: subjective, behavioral_marker: behavioral },
    operationalization: { detectable_by: [], time_relation: [], pharmacological_link: false },
    domain_links: domains.map(d => ({ domain_id: d.domain_id, relation: d.relation, context: d.context || "" })),
    exclusions: [],
    alerts: [],
    teaching_notes: teaching,
    cognitive_pitfalls: pitfalls,
    version: "1.0.0",
    provenance: { phenomenology: [], clinical_tradition: [] },
    status: "active",
    mappings: {},
    review: { status: "borrador" }
  };
}

function termPath(term) {
  const prefix = term.term_id.split("_")[0];
  return path.join(TERMS_DIR, prefix, `${term.term_id}_${slug(term.canonical_name) || "termino"}.json`);
}

function createTermFile(term) {
  const file = termPath(term);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) throw new Error(`Ya existe ${path.relative(ROOT, file)}`);
  writeTerm(file, term);
  return path.relative(ROOT, file).split(path.sep).join("/");
}

// Añade el término al final de una lista de dominio ("DOM-07/ideas_delirantes"),
// enlazado por ID. El orden de esas listas es clínico: revisa dónde quedó.
function addToSubcomponent(target, term) {
  const [domainId, subId] = String(target).split("/");
  const file = fs.readdirSync(path.join(ROOT, "domains")).find(f => f.startsWith(`${domainId}_`));
  if (!file) throw new Error(`No existe el dominio ${domainId}`);
  const p = path.join(ROOT, "domains", file);
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  const sc = (d.subcomponents || []).find(s => s.id === subId);
  if (!sc) throw new Error(`${domainId} no tiene el subcomponente "${subId}". Disponibles: ${(d.subcomponents || []).map(s => s.id).join(", ")}`);
  const label = normalize(term.canonical_name).replace(/\(.*?\)/g, "").trim().replace(/\s+/g, "_");
  sc.accepted_terms = sc.accepted_terms || [];
  if (!sc.accepted_terms.includes(label)) sc.accepted_terms.push(label);
  // term_links va justo después de accepted_terms, como en el resto de dominios.
  const links = { ...(sc.term_links || {}), [label]: term.term_id };
  const rebuilt = {};
  for (const [k, v] of Object.entries(sc)) {
    if (k === "term_links") continue;
    rebuilt[k] = v;
    if (k === "accepted_terms") rebuilt.term_links = links;
  }
  Object.keys(sc).forEach(k => delete sc[k]);
  Object.assign(sc, rebuilt);
  fs.writeFileSync(p, `${JSON.stringify(d, null, 2)}\n`);
  return { file: `domains/${file}`, label };
}

// ── Posibles duplicados ─────────────────────────────────────────────────
const base = s => normalize(String(s).replace(/\(.*?\)/g, "")).trim();
function lev(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}
function sameConcept(a, b) {
  const x = base(a);
  const y = base(b);
  if (!x || !y) return false;
  if (x === y) return true;
  // Cada palabra a ≤ 2 letras de su par: "alucinacion hipnopompica" ~ "alucinaciones hipnopompicas".
  const wx = x.split(" ");
  const wy = y.split(" ");
  return wx.length === wy.length && wx.every((w, i) => lev(w, wy[i]) <= Math.min(2, Math.floor(w.length / 4)));
}

// Busca con el mismo buscador de la app (nombres, sinónimos, tolerancia a errores).
// "Delirio de celos" con sinónimo "celotipia" encuentra "Celotipia (Síndrome de Otelo)".
// Devuelve [{ t, q, exact }]: exact = mismo concepto por nombre o sinónimo.
async function similarTerms(terms, queries) {
  const { default: Fuse } = await import("fuse.js");
  const { createSearch } = await import("../src/search.mjs");
  const search = createSearch(terms, Fuse, { limit: 3 });
  const found = new Map();
  for (const q of queries.map(x => String(x).trim()).filter(Boolean)) {
    for (const t of search(q)) {
      const exact = [t.canonical_name, ...(t.synonyms_and_slang || []).map(s => s.term || s)].some(x => sameConcept(x, q));
      const prev = found.get(t.term_id);
      // Parecido que vale la pena mostrar: comparte una palabra de 5+ letras (o casi igual).
      const words = x => base(x).split(" ").filter(w => w.length >= 5);
      const qw = words(q);
      const related = exact || [t.canonical_name, ...(t.synonyms_and_slang || []).map(s => s.term || s)].some(x => words(x).some(w => qw.some(v => lev(v, w) <= 1)));
      if (!related) continue;
      if (!prev || (exact && !prev.exact)) found.set(t.term_id, { t, q, exact });
    }
  }
  return [...found.values()];
}

module.exports = { parseCSV, toCSV, nextId, knownPrefixes, buildTerm, createTermFile, addToSubcomponent, slug, similarTerms, sameConcept };
