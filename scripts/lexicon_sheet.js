// Planilla de ida y vuelta para revisar y agregar términos sin tocar JSON.
//
//   npm run lexicon:export                       → docs/planilla-terminos.csv
//   npm run lexicon:import -- planilla.csv       muestra qué cambiaría (no escribe)
//   npm run lexicon:import -- planilla.csv --aplicar
//
// Se abre en Excel, Numbers o Google Sheets (Archivo → Importar). Las listas
// (sinónimos, dominios, notas) van una por línea dentro de la celda.
//
// Reglas de la importación:
// - Solo cambian las columnas clínicas de la planilla; los campos técnicos del
//   término (marcadores computables, exclusiones, códigos…) quedan intactos.
// - Una fila sin id es un término nuevo: necesita prefijo, nombre, tipo,
//   definición y al menos un dominio. Se le asigna el siguiente ID libre.
// - Vaciar una celda que tenía contenido no se aplica salvo con --permitir-vaciar
//   (una celda borrada por accidente no debe borrar datos clínicos).
// - Si hay un error en cualquier fila, no se escribe nada.
// - Columnas de solo lectura: estado_revision y archivo.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { loadLexicon, normalize, reviewState, writeTerm, ROOT } = require("./lexicon_checks");
const { parseCSV, toCSV, nextId, knownPrefixes, buildTerm, createTermFile, addToSubcomponent, similarTerms } = require("./lexicon_edit");

const DEFAULT_PATH = path.join(ROOT, "docs/planilla-terminos.csv");
const COLUMNS = [
  "id", "nombre", "tipo", "riesgo", "definicion", "marcador_subjetivo", "marcador_conductual",
  "sinonimos", "dominios", "notas_docentes", "errores_frecuentes", "prefijo", "lista", "estado_revision", "archivo"
];
const READ_ONLY = new Set(["estado_revision", "archivo"]);
const lines = v => String(v || "").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
const synText = s => (typeof s === "string" ? s : s?.term || "");

const lexicon = loadLexicon();
const domainLabel = Object.fromEntries(lexicon.domains.map(d => [d.domain_id, d.label_es || d.domain_id]));

// ── Exportar ────────────────────────────────────────────────────────────
function exportSheet(out = DEFAULT_PATH) {
  const rows = lexicon.terms
    .map(({ term: t, file }) => [
      t.term_id,
      t.canonical_name,
      t.term_kind,
      t.risk_weight ?? "",
      t.definition_clinical?.core || "",
      t.definition_clinical?.subjective_marker || "",
      t.definition_clinical?.behavioral_marker || "",
      (t.synonyms_and_slang || []).map(synText).filter(Boolean).join("\n"),
      (t.domain_links || []).map(l => `${l.domain_id} ${l.relation} (${domainLabel[l.domain_id] || "?"})`).join("\n"),
      (t.teaching_notes || []).join("\n"),
      (t.cognitive_pitfalls || []).join("\n"),
      "",
      "",
      reviewState(t),
      file
    ])
    .sort((a, b) => String(a[0]).localeCompare(String(b[0]), "en", { numeric: true }));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, toCSV(COLUMNS, rows));
  console.log(`Planilla → ${path.relative(ROOT, out)} (${rows.length} términos)`);
  console.log("Para agregar un término: fila nueva con id vacío y las columnas prefijo, nombre, tipo, definicion y dominios.");
  console.log("Después: npm run lexicon:import -- <archivo.csv>   (muestra los cambios; --aplicar para escribirlos)");
}

// ── Importar ────────────────────────────────────────────────────────────
function parseDomains(cell, errors, where) {
  return lines(cell).map(l => {
    const m = l.match(/^(DOM-\d{2})\s+([a-z_]+)/);
    if (!m) {
      errors.push(`${where}: dominio "${l}" no se entiende (formato: "DOM-07 primary_expression", uno por línea)`);
      return null;
    }
    return { domain_id: m[1], relation: m[2] };
  }).filter(Boolean);
}

function validateFields(f, errors, where) {
  const { vocab } = lexicon;
  if (f.tipo !== undefined && f.tipo !== "" && !vocab.term_kind.includes(f.tipo)) errors.push(`${where}: tipo "${f.tipo}" no está en el vocabulario (${vocab.term_kind.join(", ")})`);
  if (f.riesgo !== undefined && f.riesgo !== "" && !vocab.risk_weight.includes(Number(f.riesgo))) errors.push(`${where}: riesgo "${f.riesgo}" inválido (0 a 5)`);
  for (const d of f.dominios || []) {
    if (!domainLabel[d.domain_id]) errors.push(`${where}: el dominio ${d.domain_id} no existe`);
    if (!vocab.domain_relation.includes(d.relation)) errors.push(`${where}: relación "${d.relation}" no está en el vocabulario`);
  }
}

const short = v => {
  const s = Array.isArray(v) ? v.join(" | ") : String(v ?? "");
  return s.length > 90 ? `${s.slice(0, 87)}…` : s || "(vacío)";
};

async function importSheet(file, { apply, allowEmpty }) {
  if (!file || !fs.existsSync(file)) {
    console.error(`No encuentro la planilla "${file || ""}". Uso: npm run lexicon:import -- archivo.csv [--aplicar]`);
    process.exit(2);
  }
  const { header, rows, sep } = parseCSV(fs.readFileSync(file, "utf8"));
  const col = Object.fromEntries(header.map((h, i) => [normalize(h).replace(/\s+/g, "_"), i]));
  const unknown = header.filter(h => !COLUMNS.includes(normalize(h).replace(/\s+/g, "_")));
  if (!("id" in col) || !("nombre" in col)) {
    console.error('La planilla necesita al menos las columnas "id" y "nombre" (usa npm run lexicon:export como plantilla).');
    process.exit(2);
  }
  if (unknown.length) console.log(`Columnas ignoradas: ${unknown.join(", ")}`);
  const has = k => k in col && !READ_ONLY.has(k);
  const get = (row, k) => (k in col ? String(row[col[k]] ?? "").trim() : undefined);

  const byId = new Map(lexicon.terms.map(t => [t.term.term_id, t]));
  const errors = [];
  const skippedEmpty = [];
  const changes = []; // { id, file, term, fields: [[campo, antes, después]], list }
  const created = []; // { term, list }
  const taken = new Set();
  const seenIds = new Set();

  for (const [i, row] of rows.entries()) {
    const where = `fila ${i + 2}`;
    const id = get(row, "id");
    const f = {
      nombre: get(row, "nombre"),
      tipo: get(row, "tipo"),
      riesgo: get(row, "riesgo"),
      dominios: has("dominios") ? parseDomains(get(row, "dominios"), errors, where) : undefined
    };
    const errorsBefore = errors.length;
    validateFields(f, errors, where);
    if (errors.length > errorsBefore) continue; // la fila ya tiene errores: no se analiza más

    if (!id) {
      // Término nuevo
      const prefix = (get(row, "prefijo") || "").toUpperCase();
      const missing = [["prefijo", prefix], ["nombre", f.nombre], ["tipo", f.tipo], ["definicion", get(row, "definicion")], ["dominios", f.dominios?.length]].filter(([, v]) => !v).map(([k]) => k);
      if (missing.length) {
        errors.push(`${where}: término nuevo sin ${missing.join(", ")}`);
        continue;
      }
      if (!knownPrefixes().includes(prefix)) {
        errors.push(`${where}: prefijo ${prefix} desconocido`);
        continue;
      }
      const similar = await similarTerms([...lexicon.terms.map(t => t.term), ...created.map(c => c.term)], [f.nombre, ...lines(get(row, "sinonimos"))]);
      const same = similar.filter(x => x.exact);
      if (same.length) {
        errors.push(`${where}: "${f.nombre}" ya existe como ${same.map(x => `${x.t.term_id} ${x.t.canonical_name}`).join(", ")}. Edita esa fila en lugar de crear otra`);
        continue;
      }
      const term = buildTerm({
        id: nextId(prefix, taken),
        name: f.nombre,
        kind: f.tipo,
        risk: f.riesgo === "" || f.riesgo === undefined ? 0 : Number(f.riesgo),
        core: get(row, "definicion"),
        subjective: get(row, "marcador_subjetivo") || "",
        behavioral: get(row, "marcador_conductual") || "",
        synonyms: lines(get(row, "sinonimos")),
        domains: f.dominios,
        teaching: lines(get(row, "notas_docentes")),
        pitfalls: lines(get(row, "errores_frecuentes"))
      });
      created.push({ term, list: get(row, "lista"), similar });
      continue;
    }

    // Término existente
    if (seenIds.has(id)) {
      errors.push(`${where}: ${id} aparece dos veces en la planilla`);
      continue;
    }
    seenIds.add(id);
    const entry = byId.get(id);
    if (!entry) {
      errors.push(`${where}: no existe el término ${id} (para uno nuevo, deja id vacío)`);
      continue;
    }
    const t = JSON.parse(JSON.stringify(entry.term));
    const fields = [];
    const setText = (key, label, current, assign) => {
      if (!has(key)) return;
      const next = get(row, key);
      if (next === (current || "")) return;
      if (!next && current && !allowEmpty) {
        skippedEmpty.push(`${id} · ${label}`);
        return;
      }
      fields.push([label, current, next]);
      assign(next);
    };
    const setList = (key, label, current, assign) => {
      if (!has(key)) return;
      const next = lines(get(row, key));
      if (JSON.stringify(next) === JSON.stringify(current)) return;
      if (!next.length && current.length && !allowEmpty) {
        skippedEmpty.push(`${id} · ${label}`);
        return;
      }
      fields.push([label, current, next]);
      assign(next);
    };
    t.definition_clinical = t.definition_clinical || {};
    setText("nombre", "nombre", t.canonical_name, v => (t.canonical_name = v));
    setText("tipo", "tipo", t.term_kind, v => (t.term_kind = v));
    if (has("riesgo") && get(row, "riesgo") !== "" && Number(get(row, "riesgo")) !== t.risk_weight) {
      fields.push(["riesgo", t.risk_weight, Number(get(row, "riesgo"))]);
      t.risk_weight = Number(get(row, "riesgo"));
    }
    setText("definicion", "definición", t.definition_clinical.core, v => (t.definition_clinical.core = v));
    setText("marcador_subjetivo", "marcador subjetivo", t.definition_clinical.subjective_marker, v => (t.definition_clinical.subjective_marker = v));
    setText("marcador_conductual", "marcador conductual", t.definition_clinical.behavioral_marker, v => (t.definition_clinical.behavioral_marker = v));
    setList("sinonimos", "sinónimos", (t.synonyms_and_slang || []).map(synText).filter(Boolean), next => {
      // Conserva contexto e idioma de los sinónimos que siguen; los nuevos van como "clínico".
      const old = new Map((t.synonyms_and_slang || []).map(s => [normalize(synText(s)), s]));
      t.synonyms_and_slang = next.map(s => old.get(normalize(s)) || { term: s, context: "clínico", locale: "es" });
    });
    if (f.dominios) {
      const current = (t.domain_links || []).map(l => `${l.domain_id} ${l.relation}`);
      const next = f.dominios.map(d => `${d.domain_id} ${d.relation}`);
      if (JSON.stringify(current) !== JSON.stringify(next)) {
        if (!next.length && !allowEmpty) skippedEmpty.push(`${id} · dominios`);
        else {
          const old = new Map((t.domain_links || []).map(l => [`${l.domain_id} ${l.relation}`, l]));
          fields.push(["dominios", current, next]);
          t.domain_links = f.dominios.map(d => old.get(`${d.domain_id} ${d.relation}`) || { ...d, context: "" });
        }
      }
    }
    setList("notas_docentes", "notas docentes", t.teaching_notes || [], v => (t.teaching_notes = v));
    setList("errores_frecuentes", "errores frecuentes", t.cognitive_pitfalls || [], v => (t.cognitive_pitfalls = v));
    const list = get(row, "lista");
    if (fields.length || list) changes.push({ id, file: entry.file, term: t, fields, list, wasReviewed: reviewState(entry.term) === "vigente" });
  }

  // Resumen
  console.log(`Planilla ${path.basename(file)} (separador "${sep === "\t" ? "tab" : sep}"): ${rows.length} filas · ${changes.filter(c => c.fields.length).length} términos con cambios · ${created.length} nuevos`);
  for (const c of changes) {
    if (!c.fields.length && !c.list) continue;
    console.log(`\n${c.id} · ${c.term.canonical_name}${c.wasReviewed && c.fields.length ? "   (estaba revisado: la revisión quedará desactualizada)" : ""}`);
    for (const [label, before, after] of c.fields) console.log(`  ${label}:\n    antes:   ${short(before)}\n    después: ${short(after)}`);
    if (c.list) console.log(`  añadir a la lista ${c.list}`);
  }
  for (const c of created) {
    console.log(`\nNUEVO ${c.term.term_id} · ${c.term.canonical_name} (${c.term.term_kind}; ${c.term.domain_links.map(d => d.domain_id).join(", ")})${c.list ? ` → lista ${c.list}` : ""}`);
    if (c.similar.length) console.log(`  parecidos existentes: ${c.similar.map(x => `${x.t.term_id} ${x.t.canonical_name}`).join("; ")}`);
  }
  if (skippedEmpty.length) console.log(`\nNo se vacían (usa --permitir-vaciar si es intencional): ${skippedEmpty.join("; ")}`);
  if (errors.length) {
    console.log(`\nErrores (no se escribió nada):\n  ${errors.join("\n  ")}`);
    process.exit(1);
  }
  if (!apply) {
    console.log(`\nVista previa: no se escribió nada. Para aplicar: npm run lexicon:import -- ${path.relative(ROOT, path.resolve(file))} --aplicar`);
    return;
  }

  for (const c of changes) if (c.fields.length) writeTerm(c.file, c.term);
  for (const c of created) console.log(`Creado ${createTermFile(c.term)}`);
  for (const c of [...changes, ...created]) {
    if (!c.list) continue;
    try {
      const placed = addToSubcomponent(c.list, c.term);
      console.log(`Añadido ${c.term.term_id} a ${c.list} como "${placed.label}" (al final: si es una escala, muévelo a su lugar)`);
    } catch (e) {
      console.error(`No se añadió ${c.term.term_id} a la lista ${c.list}: ${e.message}`);
    }
  }
  execFileSync(process.execPath, [path.join(__dirname, "optimize_lexicon.js")], { stdio: "inherit" });
  try {
    execFileSync(process.execPath, [path.join(__dirname, "validate_terms.js")], { stdio: "inherit" });
  } catch {
    console.error("\nLa importación se aplicó, pero la validación encontró errores: corrígelos antes de subir.");
    process.exit(1);
  }
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === "exportar") exportSheet(rest[0] ? path.resolve(rest[0]) : undefined);
else if (cmd === "importar") {
  importSheet(rest.find(a => !a.startsWith("--")), { apply: rest.includes("--aplicar"), allowEmpty: rest.includes("--permitir-vaciar") }).catch(e => {
    console.error(e);
    process.exit(1);
  });
} else {
  console.log("Uso: node scripts/lexicon_sheet.js exportar [ruta.csv] | importar <ruta.csv> [--aplicar] [--permitir-vaciar]");
  process.exit(2);
}
