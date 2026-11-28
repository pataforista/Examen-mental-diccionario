// Reglas de calidad del léxico. Las usan el validador (npm run validate) y la
// página de revisión (npm run lexicon:report), para que ambos digan lo mismo.
//
// Severidad:
//   error → rompe la app o la integridad de los datos; bloquea `npm test`.
//   aviso → calidad clínica o de redacción; se revisa, no bloquea.
//
// Para añadir una regla: agrega un objeto a RULES con id, severidad, título
// (lo que verá quien revisa) y una función check(term, ctx) que devuelve
// un texto con el problema, una lista de textos, o nada si está bien.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TERMS_DIR = path.join(ROOT, "lexicon/terms");
const DOMAINS_DIR = path.join(ROOT, "domains");
const MAPPINGS_DIR = path.join(ROOT, "lexicon/mappings");
const VOCAB_PATH = path.join(ROOT, "taxonomy/controlled_vocabularies.json");

const crypto = require("crypto");

// Estado de revisión clínica (bloque "review" de cada término). Sin bloque = sin revisar.
const REVIEW_STATUSES = ["borrador", "en_revision", "revisado"];

// Huella del contenido clínico en el momento de revisarlo: todo el término salvo el
// propio bloque "review", con las claves ordenadas (reordenar el archivo no la cambia).
function stableStringify(v) {
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.keys(v)
      .sort()
      .map(k => `${JSON.stringify(k)}:${stableStringify(v[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v);
}
function reviewHash(term) {
  const { review, ...content } = term; // eslint-disable-line no-unused-vars
  return crypto.createHash("sha256").update(stableStringify(content)).digest("hex").slice(0, 16);
}
// "vigente" | "desactualizada" | "sin_revisar" | estado en curso ("borrador", "en_revision")
function reviewState(term) {
  const r = term.review;
  if (!r || !r.status) return "sin_revisar";
  if (r.status !== "revisado") return r.status;
  return r.content_hash === reviewHash(term) ? "vigente" : "desactualizada";
}

// Cómo va un término al lexicon_bundle.json que lee la app: el bloque de revisión
// se reduce a lo que la ficha puede mostrar, y una revisión desactualizada no
// cuenta como revisión (la app nunca dice "revisado" de un contenido que cambió).
function bundleTerm(term) {
  if (!term.review) return term;
  const state = reviewState(term);
  const out = { ...term };
  out.review =
    state === "vigente"
      ? { status: "revisado", reviewer: term.review.reviewer, date: term.review.date }
      : { status: state === "desactualizada" ? "revision_desactualizada" : term.review.status };
  return out;
}

// Formato único de los archivos de término (2 espacios y salto final).
function writeTerm(file, term) {
  fs.writeFileSync(path.isAbsolute(file) ? file : path.join(ROOT, file), `${JSON.stringify(term, null, 2)}\n`);
}

const normalize = s =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return e.name.endsWith(".json") ? [p] : [];
  });
}

// Lee todo lo necesario una sola vez. Los JSON ilegibles se devuelven aparte
// como errores de carga (no pueden pasar por las reglas).
function loadLexicon() {
  const loadErrors = [];
  const terms = [];
  for (const file of walk(TERMS_DIR)) {
    const rel = path.relative(ROOT, file).split(path.sep).join("/");
    try {
      terms.push({ term: JSON.parse(fs.readFileSync(file, "utf8")), file: rel });
    } catch (e) {
      loadErrors.push({ file: rel, message: `JSON inválido: ${e.message}` });
    }
  }
  const domainFiles = {};
  const domains = fs
    .readdirSync(DOMAINS_DIR)
    .filter(f => /^DOM-\d+_.+\.json$/.test(f))
    .map(f => {
      const d = JSON.parse(fs.readFileSync(path.join(DOMAINS_DIR, f), "utf8"));
      domainFiles[d.domain_id] = `domains/${f}`;
      return d;
    });
  const vocab = JSON.parse(fs.readFileSync(VOCAB_PATH, "utf8")).controlled_vocabularies;
  // Códigos en lexicon/mappings/ (carpeta heredada que la app no lee): solo se comparan.
  const externalCodes = {};
  if (fs.existsSync(MAPPINGS_DIR)) {
    for (const f of fs.readdirSync(MAPPINGS_DIR)) {
      try {
        const m = JSON.parse(fs.readFileSync(path.join(MAPPINGS_DIR, f), "utf8"));
        if (m.term_id && m.coding_standards?.ICD_11) externalCodes[m.term_id] = m.coding_standards.ICD_11;
      } catch {
        /* se ignora: no es fuente de la app */
      }
    }
  }
  return { terms, domains, domainFiles, vocab, externalCodes, loadErrors };
}

function buildContext({ terms, domains, vocab, externalCodes }) {
  // Qué términos del léxico enlaza cada dominio desde sus listas (term_links).
  const linkedFrom = new Map(); // term_id → Set(domain_id)
  for (const d of domains) {
    for (const sc of d.subcomponents || []) {
      for (const id of Object.values(sc.term_links || {})) {
        if (!linkedFrom.has(id)) linkedFrom.set(id, new Set());
        linkedFrom.get(id).add(d.domain_id);
      }
    }
  }
  const byId = new Map();
  const idCount = new Map();
  const nameOwners = new Map();
  const synonymOwners = new Map();
  for (const { term } of terms) {
    idCount.set(term.term_id, (idCount.get(term.term_id) || 0) + 1);
    byId.set(term.term_id, term);
    const n = normalize(term.canonical_name);
    nameOwners.set(n, [...(nameOwners.get(n) || []), term.term_id]);
    for (const s of term.synonyms_and_slang || []) {
      const k = normalize(typeof s === "string" ? s : s?.term);
      if (!k) continue;
      const owners = synonymOwners.get(k) || new Set();
      owners.add(term.term_id);
      synonymOwners.set(k, owners);
    }
  }
  return {
    byId,
    idCount,
    nameOwners,
    synonymOwners,
    domainIds: new Set(domains.map(d => d.domain_id)),
    linkedFrom,
    vocab,
    externalCodes
  };
}

const list = v => (Array.isArray(v) ? v : []);
const inVocab = (ctx, key, value) => !ctx.vocab[key] || ctx.vocab[key].includes(value);

// "igual" | "nombre" (mismo concepto, nombre ampliado o cambiado) | "otro" (no se parece: ID equivocado).
function exclusionMismatch(e, ctx) {
  if (!e.term_id || !e.canonical_name || !ctx.byId.has(e.term_id)) return "igual";
  const stored = normalize(e.canonical_name);
  const current = normalize(ctx.byId.get(e.term_id).canonical_name);
  if (stored === current) return "igual";
  const base = s => s.replace(/\(.*?\)/g, "").trim();
  if (current.includes(base(stored)) || stored.includes(base(current))) return "nombre";
  // Mismas palabras con otra forma ("Presión del habla" / "Presión de habla").
  const words = x => new Set(base(x).split(" ").filter(w => w.length > 3));
  const a = words(stored);
  const b = words(current);
  const shared = [...a].filter(w => b.has(w)).length;
  if (shared && shared / Math.max(a.size, b.size) >= 0.5) return "nombre";
  return "otro";
}

const RULES = [
  // ── Errores: integridad ─────────────────────────────────────────────
  {
    id: "id-formato",
    severity: "error",
    title: "Identificador con formato inválido",
    check: (t, ctx, file) => {
      if (!/^[A-Z]+_\d{3}$/.test(t.term_id || "")) return `"${t.term_id}" no sigue PREFIJO_NNN (p. ej. RSK_006)`;
      const [prefix] = t.term_id.split("_");
      const parts = file.split("/");
      if (parts[parts.length - 2] !== prefix) return `está en la carpeta ${parts[parts.length - 2]}/ y su prefijo es ${prefix}`;
      if (!parts[parts.length - 1].startsWith(`${t.term_id}_`)) return `el archivo no empieza por ${t.term_id}_`;
    }
  },
  {
    id: "id-duplicado",
    severity: "error",
    title: "Identificador repetido",
    check: (t, ctx) => (ctx.idCount.get(t.term_id) > 1 ? `${t.term_id} aparece en ${ctx.idCount.get(t.term_id)} archivos` : null)
  },
  {
    id: "campos-obligatorios",
    severity: "error",
    title: "Falta un campo obligatorio",
    check: t => {
      const missing = [];
      if (!t.canonical_name) missing.push("canonical_name");
      if (!t.term_kind) missing.push("term_kind");
      if (!t.definition_clinical?.core) missing.push("definition_clinical.core");
      if (!list(t.domain_links).length) missing.push("domain_links (al menos un dominio)");
      return missing.length ? `falta: ${missing.join(", ")}` : null;
    }
  },
  {
    id: "nombre-duplicado",
    severity: "error",
    title: "Dos términos con el mismo nombre",
    check: (t, ctx) => {
      const owners = ctx.nameOwners.get(normalize(t.canonical_name)) || [];
      return owners.length > 1 ? `mismo nombre que ${owners.filter(id => id !== t.term_id).join(", ")}` : null;
    }
  },
  {
    id: "vocabulario",
    severity: "error",
    title: "Valor fuera del vocabulario controlado",
    check: (t, ctx) => {
      const out = [];
      if (t.term_kind && !inVocab(ctx, "term_kind", t.term_kind)) out.push(`term_kind "${t.term_kind}"`);
      if (t.granularity && !inVocab(ctx, "granularity", t.granularity)) out.push(`granularity "${t.granularity}"`);
      if (t.risk_weight !== undefined) {
        if (!Number.isInteger(t.risk_weight) || !inVocab(ctx, "risk_weight", t.risk_weight)) {
          out.push(`risk_weight ${t.risk_weight} (debe ser entero 0–5)`);
        } else if (ctx.vocab.risk_weight_levels && !ctx.vocab.risk_weight_levels[String(t.risk_weight)]) {
          out.push(`risk_weight ${t.risk_weight} sin definición en risk_weight_levels`);
        }
        if (t.risk_weight > 0 && !list(t.domain_links).length) {
          out.push(`risk_weight ${t.risk_weight} > 0 sin domain_links`);
        }
        if (t.risk_weight >= 3 && !list(t.operationalization?.detectable_by).length) {
          out.push(`risk_weight ${t.risk_weight} ≥ 3 sin detectable_by`);
        }
        if (t.term_kind === "concepto_historico" && t.risk_weight !== 0) {
          out.push(`concepto_historico debe tener risk_weight 0 (tiene ${t.risk_weight})`);
        }
      }
      for (const l of list(t.domain_links)) {
        if (l.relation && !inVocab(ctx, "domain_relation", l.relation)) out.push(`relación de dominio "${l.relation}"`);
      }
      for (const a of list(t.alerts)) {
        const type = typeof a === "string" ? undefined : a?.type;
        if (!type) out.push("alerta sin tipo (la app mostraría el recuadro vacío)");
        else if (!inVocab(ctx, "alert_type", type)) out.push(`tipo de alerta "${type}"`);
      }
      for (const d of list(t.operationalization?.detectable_by)) {
        if (!inVocab(ctx, "detectable_by", d)) out.push(`detectable_by "${d}"`);
      }
      for (const r of list(t.operationalization?.time_relation)) {
        if (!inVocab(ctx, "time_relation", r)) out.push(`time_relation "${r}"`);
      }
      return out.length ? `${out.join("; ")} — valores válidos en taxonomy/controlled_vocabularies.json` : null;
    }
  },
  {
    id: "dominio-inexistente",
    severity: "error",
    title: "Enlace a un dominio que no existe",
    check: (t, ctx) => {
      const bad = list(t.domain_links).map(l => l.domain_id).filter(id => !ctx.domainIds.has(id));
      return bad.length ? `dominios desconocidos: ${bad.join(", ")}` : null;
    }
  },
  {
    id: "exclusion-rota",
    severity: "error",
    title: "Exclusión que apunta a un término inexistente",
    check: (t, ctx) => {
      // ref_status "forward" marca a propósito un término aún no redactado.
      const bad = list(t.exclusions).filter(e => e.term_id && e.ref_status !== "forward" && !ctx.byId.has(e.term_id));
      return bad.length ? bad.map(e => `${e.term_id} (${e.canonical_name || "sin nombre"})`).join(", ") : null;
    }
  },

  {
    id: "revision-invalida",
    severity: "error",
    title: "Bloque de revisión incompleto",
    check: t => {
      const r = t.review;
      if (!r) return null;
      const out = [];
      if (!REVIEW_STATUSES.includes(r.status)) out.push(`estado "${r.status}" (válidos: ${REVIEW_STATUSES.join(", ")})`);
      if (r.status === "revisado") {
        if (!r.reviewer) out.push("falta quién revisó (reviewer)");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date || "") || Number.isNaN(Date.parse(r.date))) out.push(`fecha "${r.date || ""}" (formato AAAA-MM-DD)`);
        else if (Date.parse(r.date) > Date.now() + 864e5) out.push(`fecha futura ${r.date}`);
        if (!r.content_hash) out.push("falta la huella de contenido: márcalo con npm run term:review");
      }
      return out.length ? `${out.join("; ")}. Usa npm run term:review` : null;
    }
  },

  // ── Avisos: calidad clínica y de redacción ──────────────────────────
  {
    id: "cie11-conflicto",
    severity: "aviso",
    title: "Código CIE-11 distinto en lexicon/mappings/",
    check: (t, ctx) => {
      const own = t.mappings?.cie11?.code;
      const ext = ctx.externalCodes[t.term_id];
      if (own && ext && own !== ext) return `el término dice ${own}; lexicon/mappings/ dice ${ext}`;
      if (!own && ext) return `sin código propio; lexicon/mappings/ propone ${ext}`;
    }
  },
  {
    id: "marcador-generico",
    severity: "aviso",
    title: "Marcador subjetivo genérico",
    check: t => {
      const m = t.definition_clinical?.subjective_marker || "";
      return /compatible con/i.test(m) ? `"${m}" — describir lo que la persona refiere, con sus palabras` : null;
    }
  },
  {
    id: "mayusculas",
    severity: "aviso",
    title: "Nombre con Mayúscula En Cada Palabra",
    check: t => {
      // Ignora paréntesis (epónimos y términos en otro idioma) y palabras cortas.
      // También ignora lo que sigue a "de", "del", "von", "y": epónimos ("Síndrome de Capgras").
      // Cada alternativa separada por "/" empieza de nuevo ("Déjà vu / Jamais vu").
      const words = String(t.canonical_name || "")
        .replace(/\(.*?\)/g, "")
        .split("/")
        .flatMap(seg => {
          const all = seg.trim().split(/\s+/);
          const cut = all.findIndex((w, i) => i > 0 && /^(de|del|von|van)$/i.test(w) && /^\p{Lu}/u.test(all[i + 1] || ""));
          return (cut > 0 ? all.slice(1, cut) : all.slice(1)).filter((w, i, a) => !/^y$/i.test(a[i - 1] || ""));
        })
        .filter(w => w.length > 3 && /^\p{L}/u.test(w));
      return words.length && words.every(w => /^\p{Lu}/u.test(w)) ? `"${t.canonical_name}" — en español solo la primera palabra` : null;
    }
  },
  {
    id: "sinonimo-compartido",
    severity: "aviso",
    title: "Sinónimo que también usa otro término",
    check: (t, ctx) => {
      const out = [];
      for (const s of list(t.synonyms_and_slang)) {
        const label = typeof s === "string" ? s : s?.term;
        const k = normalize(label);
        const others = [...(ctx.synonymOwners.get(k) || [])].filter(id => id !== t.term_id);
        const nameClash = (ctx.nameOwners.get(k) || []).filter(id => id !== t.term_id);
        if (nameClash.length) out.push(`"${label}" es el nombre de ${nameClash.join(", ")}`);
        else if (others.length) out.push(`"${label}" también en ${others.join(", ")}`);
      }
      return out;
    }
  },
  {
    id: "dominio-no-reciproco",
    severity: "aviso",
    title: "Un dominio lo lista, pero el término no enlaza ese dominio",
    check: (t, ctx) => {
      const own = new Set(list(t.domain_links).map(l => l.domain_id));
      const missing = [...(ctx.linkedFrom.get(t.term_id) || [])].filter(d => !own.has(d));
      return missing.length ? `aparece en las listas de ${missing.join(", ")}; agrega ese dominio a domain_links` : null;
    }
  },
  {
    id: "fuera-de-listas",
    severity: "info",
    title: "No figura en las listas de su dominio (Integrador y vista Dominios)",
    check: (t, ctx) => {
      const primary = list(t.domain_links).filter(l => l.relation === "primary_expression").map(l => l.domain_id);
      const linked = ctx.linkedFrom.get(t.term_id) || new Set();
      const out = primary.filter(d => !linked.has(d));
      return out.length ? `expresión principal en ${out.join(", ")}, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio` : null;
    }
  },
  {
    id: "revision-desactualizada",
    severity: "aviso",
    title: "Cambió después de revisarse",
    check: t =>
      reviewState(t) === "desactualizada" && t.review.content_hash
        ? `revisado por ${t.review.reviewer} el ${t.review.date}; el contenido cambió después. Vuelve a revisarlo y márcalo con npm run term:review`
        : null
  },
  {
    // El nombre guardado no se parece al del término enlazado: el ID probablemente es otro.
    id: "exclusion-id-equivocado",
    severity: "aviso",
    title: "Exclusión enlazada a otro término",
    check: (t, ctx) =>
      list(t.exclusions)
        .filter(e => exclusionMismatch(e, ctx) === "otro")
        .map(e => `"${e.canonical_name}" enlaza a ${e.term_id}, que es "${ctx.byId.get(e.term_id).canonical_name}"${e.term_id === t.term_id ? " (el propio término)" : ""}`)
  },
  {
    id: "exclusion-nombre",
    severity: "aviso",
    title: "Exclusión con el nombre desactualizado",
    check: (t, ctx) =>
      list(t.exclusions)
        .filter(e => exclusionMismatch(e, ctx) === "nombre")
        .map(e => `${e.term_id} figura como "${e.canonical_name}"; hoy se llama "${ctx.byId.get(e.term_id).canonical_name}"`)
  },
  {
    id: "sin-sinonimos",
    severity: "aviso",
    title: "Sin sinónimos (más difícil de encontrar)",
    check: t => (list(t.synonyms_and_slang).length ? null : "agregar cómo lo dicen pacientes o colegas")
  },
  {
    id: "sin-docencia",
    severity: "aviso",
    title: "Sin notas docentes",
    check: t => (list(t.teaching_notes).length ? null : "sin teaching_notes")
  }
];

// Avisos en orden de importancia clínica: así los listan el validador y la página.
const WARNING_ORDER = [
  "revision-desactualizada",
  "exclusion-id-equivocado",
  "cie11-conflicto",
  "sinonimo-compartido",
  "marcador-generico",
  "dominio-no-reciproco",
  "enlace-sugerido",
  "exclusion-nombre",
  "mayusculas",
  "sin-sinonimos",
  "sin-docencia"
];
const rank = r => (r.severity === "error" ? -1 : r.severity === "info" ? 1e3 : WARNING_ORDER.indexOf(r.id) === -1 ? WARNING_ORDER.length : WARNING_ORDER.indexOf(r.id));
RULES.sort((a, b) => rank(a) - rank(b));

// Reglas sobre los archivos de dominio (sus hallazgos llevan el ID del dominio).
const DOMAIN_RULES = [
  {
    id: "enlace-dominio-roto",
    severity: "error",
    title: "Enlace de dominio a un término inexistente",
    check: (d, ctx) => {
      const out = [];
      for (const sc of d.subcomponents || []) {
        for (const [label, id] of Object.entries(sc.term_links || {})) {
          if (!ctx.byId.has(id)) out.push(`${sc.id}: "${label}" → ${id} no existe`);
          if (!(sc.accepted_terms || []).includes(label)) out.push(`${sc.id}: "${label}" está en term_links pero no en accepted_terms`);
        }
      }
      return out;
    }
  },
  {
    id: "enlace-sugerido",
    severity: "aviso",
    title: "Descriptor que coincide con un término del léxico sin enlazar",
    check: (d, ctx) => {
      const out = [];
      for (const sc of d.subcomponents || []) {
        for (const label of sc.accepted_terms || []) {
          if ((sc.term_links || {})[label]) continue;
          const k = normalize(label.replace(/_/g, " "));
          const byName = ctx.nameOwners.get(k) || ctx.nameOwners.get(k.replace(/\(.*?\)/g, "").trim());
          if (byName && byName.length === 1) {
            out.push(`${sc.id}: "${label}" = ${byName[0]} (${ctx.byId.get(byName[0]).canonical_name}); enlázalo en term_links`);
            continue;
          }
          const bySyn = [...(ctx.synonymOwners.get(k) || [])];
          if (bySyn.length === 1) out.push(`${sc.id}: "${label}" es sinónimo de ${bySyn[0]} (${ctx.byId.get(bySyn[0]).canonical_name}); enlázalo solo si es el mismo concepto`);
        }
      }
      return out;
    }
  }
];

// Devuelve { findings: [{term_id, file, rule, severity, title, message}], loadErrors }.
function runChecks(lexicon = loadLexicon()) {
  const ctx = buildContext(lexicon);
  const findings = [];
  for (const { term, file } of lexicon.terms) {
    for (const rule of RULES) {
      let res;
      try {
        res = rule.check(term, ctx, file);
      } catch (e) {
        res = `la regla falló: ${e.message}`;
      }
      for (const message of [].concat(res || [])) {
        findings.push({ term_id: term.term_id, file, rule: rule.id, severity: rule.severity, title: rule.title, message });
      }
    }
  }
  for (const d of lexicon.domains) {
    for (const rule of DOMAIN_RULES) {
      let res;
      try {
        res = rule.check(d, ctx);
      } catch (e) {
        res = `la regla falló: ${e.message}`;
      }
      for (const message of [].concat(res || [])) {
        findings.push({ term_id: d.domain_id, file: lexicon.domainFiles[d.domain_id], rule: rule.id, severity: rule.severity, title: rule.title, message, scope: "domain" });
      }
    }
  }
  return { findings, loadErrors: lexicon.loadErrors, lexicon, ctx };
}

// Todas las reglas, para listarlas (validador y página).
const ALL_RULES = [...RULES, ...DOMAIN_RULES].sort((a, b) => rank(a) - rank(b));

module.exports = { RULES: ALL_RULES, REVIEW_STATUSES, loadLexicon, runChecks, normalize, reviewHash, reviewState, bundleTerm, writeTerm, walk, ROOT };
