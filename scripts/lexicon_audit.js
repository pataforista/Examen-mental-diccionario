// Documentos de auditoría por tema (npm run lexicon:audit → docs/auditorias/).
//
// Cada documento tiene una parte fija (qué se revisa, por qué importa, cómo decidir,
// cómo corregir) y una tabla de casos que se regenera con los datos actuales.
// La columna "Decisión" se conserva al regenerar: escribe ahí lo que decidas.
// Cuando un caso desaparece (porque se corrigió), pasa a "Resueltos" con su
// decisión y la fecha, de modo que el documento guarda el historial.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { runChecks, reviewState, normalize, ROOT } = require("./lexicon_checks");

const OUT_DIR = path.join(ROOT, "docs/auditorias");
const today = new Date().toISOString().slice(0, 10);
const { findings, lexicon } = runChecks();
const terms = lexicon.terms.map(t => t.term);
const byId = new Map(terms.map(t => [t.term_id, t]));
const domainLabel = Object.fromEntries(lexicon.domains.map(d => [d.domain_id, d.label_es || d.domain_id]));

const cell = s => String(s ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
const keyOf = (...parts) => crypto.createHash("sha1").update(parts.join("¦")).digest("hex").slice(0, 10);
const who = id => (byId.has(id) ? `${id} · ${byId.get(id).canonical_name}` : domainLabel[id] ? `${id} · ${domainLabel[id]}` : id);

// ── Temas ───────────────────────────────────────────────────────────────
// rows(): [{ key, subject, finding, group? }]. El texto fijo va en Markdown.
const fromRules = ids => () =>
  findings
    .filter(f => ids.includes(f.rule))
    .map(f => ({ key: keyOf(f.rule, f.term_id, f.message), subject: who(f.term_id), finding: f.message, group: f.title }));

const TOPICS = [
  {
    slug: "01-exclusiones",
    title: "Exclusiones (no confundir con)",
    rules: ["exclusion-rota", "exclusion-id-equivocado", "exclusion-nombre"],
    what: "Las exclusiones de cada término: el diagnóstico diferencial que el diccionario enseña («no confundir con…»). Cada exclusión guarda el ID del otro término y su nombre.",
    why: "Una exclusión que apunta al término equivocado enseña un diferencial falso. Hoy la app no muestra exclusiones, pero son contenido clínico y la próxima función que las use heredará el error.",
    decide: [
      "**Enlazada a otro término:** lee el nombre guardado y decide cuál es el término correcto. Si existe, corrige el ID; si no existe, decide si se crea o si la exclusión se elimina.",
      "**Nombre desactualizado:** basta con copiar el nombre actual del término enlazado, salvo que el cambio de nombre revele que ya no es el diferencial pertinente.",
      "**Se excluye a sí mismo:** casi siempre es un error de copia; busca el término al que debía apuntar."
    ],
    fix: "Edita `exclusions` en el archivo del término (`term_id`, `canonical_name`, `reason`). Si el término exclusión aún no existe y quieres conservarla, deja `\"ref_status\": \"forward\"`."
  },
  {
    slug: "02-codificacion-cie11",
    title: "Codificación CIE-11",
    rules: ["cie11-conflicto"],
    what: "Los códigos CIE-11 de cada término (`mappings.cie11.code`) frente a los de la carpeta heredada `lexicon/mappings/`, que la app no usa.",
    why: "Dos fuentes con códigos distintos significan que al menos una está mal. Un código incorrecto en material docente se copia a notas clínicas y a trabajos.",
    decide: [
      "Verifica cada código en el navegador oficial de la CIE-11 (icd.who.int/browse) con la versión vigente.",
      "Muchos síntomas no tienen un código propio en la CIE-11: en ese caso es preferible dejar el campo vacío que forzar un código genérico (`.Y`, `.Z`).",
      "Cuando todos los casos estén resueltos, la carpeta `lexicon/mappings/` se puede eliminar."
    ],
    fix: "Edita `mappings.cie11.code` en el archivo del término. Anota en «Decisión» el código elegido y la fecha de consulta."
  },
  {
    slug: "03-dominios",
    title: "Dominios y listas del Integrador",
    rules: ["dominio-inexistente", "enlace-dominio-roto", "dominio-no-reciproco", "enlace-sugerido", "fuera-de-listas"],
    what: "La relación entre cada término y los 15 dominios del examen mental: los enlaces del término (`domain_links`) y las listas de descriptores de cada dominio, que alimentan el Integrador y la vista Dominios.",
    why: "Un término mal ubicado no aparece donde el clínico lo busca, y un descriptor enlazado al concepto equivocado lleva a la ficha equivocada.",
    decide: [
      "**El dominio lo lista, pero el término no lo declara:** decide la relación (expresión principal, signo asociado, contexto de riesgo…) y agrégala al término.",
      "**Posible enlace por sinónimo:** enlaza solo si es el mismo concepto. Ejemplo: la taquilalia (habla rápida) no equivale a la presión del habla.",
      "**No figura en las listas de su dominio:** decide si el Integrador debe ofrecerlo como opción al redactar. No todo término del diccionario es un descriptor útil para redactar; muchos conceptos históricos o teóricos no lo son. Anota «no aplica» cuando sea así."
    ],
    fix: "Relación del término: `domain_links` en su archivo. Listas: `npm run term:new … --lista DOM-xx/subcomponente` para términos nuevos, o en el archivo del dominio `accepted_terms` (respetando el orden clínico) más `term_links`."
  },
  {
    slug: "04-sinonimos",
    title: "Sinónimos",
    rules: ["sinonimo-compartido", "sin-sinonimos"],
    what: "Los sinónimos de cada término: cómo lo dicen pacientes, colegas o la tradición clínica. La búsqueda de la app los usa.",
    why: "Un sinónimo que también es el nombre de otro término hace que la búsqueda mezcle conceptos distintos. Un término sin sinónimos es difícil de encontrar.",
    decide: [
      "**Compartido:** decide a cuál de los dos términos pertenece. Si es un concepto más amplio que abarca a ambos, quítalo de los dos y menciónalo en las notas docentes.",
      "**Es el nombre de otro término:** casi siempre debe quitarse del que no es su dueño (p. ej., «micropsia» no es sinónimo de «Distorsión perceptiva visual», es un tipo).",
      "**Sin sinónimos:** agrega al menos uno de uso real, si existe."
    ],
    fix: "Columna `sinonimos` de la planilla (`npm run lexicon:export`) o `synonyms_and_slang` en el archivo del término."
  },
  {
    slug: "05-redaccion",
    title: "Redacción clínica",
    rules: ["marcador-generico", "mayusculas", "sin-docencia"],
    what: "La calidad del texto que lee el estudiante: marcadores subjetivos, mayúsculas de los nombres y notas docentes.",
    why: "Un marcador subjetivo genérico («refiere experiencia compatible con…») no enseña cómo suena el síntoma en la voz del paciente, que es justo lo que el residente necesita reconocer en la entrevista.",
    decide: [
      "**Marcador genérico:** reescríbelo como lo diría un paciente, entre comillas, sin tecnicismos. Ejemplo para acoasmas: «Oigo zumbidos o chasquidos que nadie más escucha».",
      "**Mayúsculas:** en español solo va en mayúscula la primera palabra y los nombres propios (epónimos).",
      "**Sin notas docentes:** prioriza los términos de riesgo alto y los que se confunden con frecuencia."
    ],
    fix: "Planilla (`marcador_subjetivo`, `nombre`, `notas_docentes`) o el archivo del término."
  },
  {
    slug: "06-taxonomia",
    title: "Taxonomía y vocabularios",
    custom: "taxonomy",
    what: "Los valores que clasifican los términos: escala de riesgo (`risk_weight`), tipo de término (`term_kind`) y la operacionalización (`detectable_by`: cómo se detecta; `time_relation`: su relación temporal).",
    why: "Si el mismo valor se escribe de varias formas (con y sin tilde, en masculino y femenino, en español e inglés), cualquier filtro o estadística por esos campos da resultados falsos.",
    decide: [
      "Para cada grupo de variantes, elige la forma canónica (recomendado: español, sin tildes en valores técnicos, con guion bajo, igual que el resto de identificadores).",
      "Para `term_kind`, decide si `estado de riesgo` y `factor de riesgo` se escriben con guion bajo como `concepto_histórico`, o al revés. Es una decisión de estilo que debe ser única.",
      "**Escala de riesgo:** escribe qué significa cada nivel de `risk_weight` (criterio clínico, no solo una etiqueta) y revisa con esa definición los términos de nivel alto. La ficha muestra el recuadro rojo de «Alerta de riesgo clínico» desde el nivel 2 (`risk_weight > 1` en `src/dictionary.js`), así que la escala decide qué ve el estudiante como urgente.",
      "Decide si `detectable_by` y `time_relation` deben pasar a ser vocabularios cerrados en `taxonomy/controlled_vocabularies.json`; así el validador impediría variantes nuevas."
    ],
    fix: "Una vez decidida la forma canónica, el cambio es mecánico en todos los archivos: pídelo y se aplica con un script, se regenera el bundle y se valida."
  },
  {
    slug: "07-cobertura-revision",
    title: "Cobertura de la revisión clínica",
    custom: "review",
    what: "Qué términos tienen revisión clínica firmada y vigente (`npm run term:review`).",
    why: "La ficha solo muestra «Revisado clínicamente» cuando la revisión está vigente. Sin cobertura, el diccionario no puede presentarse como contenido revisado.",
    decide: [
      "Sigue el orden de prioridad de la guía de revisión (`docs/GUIA_REVISION_CLINICA.md`): primero riesgo alto, luego los términos con avisos.",
      "Una revisión **desactualizada** significa que el contenido cambió después de firmarse: vuelve a leer el término y firma de nuevo."
    ],
    fix: "`npm run term:review -- ID… --por \"Nombre\"`."
  }
];

// ── Filas de los temas especiales ───────────────────────────────────────
function taxonomyRows() {
  const rows = [];
  const variants = (field, get) => {
    const counts = new Map();
    for (const t of terms) for (const v of [].concat(get(t) || [])) counts.set(v, (counts.get(v) || 0) + 1);
    // Agrupa variantes: sin tildes, sin paréntesis, y sin la vocal final (episodica/episodico).
    const groups = new Map();
    for (const [v, n] of counts) {
      const k = normalize(String(v).replace(/\(.*?\)/g, "")).replace(/[\s_]+/g, "_").replace(/[oa]$/, "");
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push([v, n]);
    }
    for (const list of groups.values()) {
      if (list.length < 2) continue;
      const desc = list.sort((a, b) => b[1] - a[1]).map(([v, n]) => `\`${v}\` (${n})`).join(", ");
      rows.push({ key: keyOf("tax", field, desc), subject: field, finding: `Variantes del mismo valor: ${desc}`, group: `Variantes en ${field}` });
    }
    const english = [...counts.keys()].filter(v => /^(clinical|patient|collateral|current|past|interview)/i.test(v));
    if (english.length) rows.push({ key: keyOf("tax-en", field, english.join()), subject: field, finding: `Valores en inglés: ${english.map(v => `\`${v}\``).join(", ")}`, group: `Variantes en ${field}` });
  };
  const kinds = lexicon.vocab.term_kind;
  const mixed = kinds.filter(k => /\s/.test(k));
  const underscored = kinds.filter(k => /_/.test(k));
  if (mixed.length && underscored.length) {
    rows.push({
      key: keyOf("tax-kind-style", kinds.join()),
      subject: "term_kind",
      finding: `Dos estilos en el vocabulario de tipos: con espacio ${mixed.map(v => `\`${v}\``).join(", ")}; con guion bajo ${underscored.map(v => `\`${v}\``).join(", ")}`,
      group: "Tipo de término"
    });
  }
  // Escala de riesgo: el esquema la define 0–2; los datos y el vocabulario usan 0–5 sin definición escrita.
  let schemaRisk = null;
  try {
    schemaRisk = JSON.parse(fs.readFileSync(path.join(ROOT, "lexicon/lexicon.schema.json"), "utf8")).controlled_vocabularies?.risk_weight;
  } catch {
    /* sin esquema */
  }
  const used = [...new Set(terms.map(t => t.risk_weight))].filter(v => v !== undefined).sort();
  const defined = schemaRisk && typeof schemaRisk === "object" && !Array.isArray(schemaRisk) ? Object.keys(schemaRisk).map(Number) : [];
  const undefinedLevels = used.filter(v => !defined.includes(v));
  if (undefinedLevels.length) {
    const high = terms.filter(t => undefinedLevels.includes(t.risk_weight)).sort((a, b) => b.risk_weight - a.risk_weight);
    rows.push({
      key: keyOf("tax-risk", used.join(), defined.join()),
      subject: "risk_weight",
      finding: `El esquema define ${defined.length ? defined.map(v => `${v} = ${schemaRisk[v]}`).join(", ") : "ningún nivel"}; los términos usan ${used.join(", ")}. Sin definición escrita para ${undefinedLevels.join(", ")}. Términos en esos niveles: ${high.map(t => `${t.term_id} ${t.canonical_name} (${t.risk_weight})`).join("; ")}`,
      group: "Escala de riesgo"
    });
  }
  variants("detectable_by", t => t.operationalization?.detectable_by);
  variants("time_relation", t => t.operationalization?.time_relation);
  return rows;
}

function reviewRows() {
  const rows = [];
  for (const t of terms) {
    const st = reviewState(t);
    if (st === "vigente") continue;
    const label = { sin_revisar: "Sin revisar", borrador: "Borrador", en_revision: "En revisión", desactualizada: "Cambió después de revisarse" }[st] || st;
    const risk = t.risk_weight >= 3 ? "Riesgo alto (≥3)" : "Resto";
    rows.push({
      key: keyOf("rev", t.term_id, st),
      subject: who(t.term_id),
      finding: `${label}${t.review?.reviewer ? ` (última firma: ${t.review.reviewer}, ${t.review.date})` : ""} · riesgo ${t.risk_weight ?? "?"}/5`,
      group: st === "desactualizada" ? "Desactualizadas (volver a revisar)" : risk
    });
  }
  const order = ["Desactualizadas (volver a revisar)", "Riesgo alto (≥3)", "Resto"];
  return rows.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));
}

// ── Lectura de decisiones previas ───────────────────────────────────────
function readPrevious(file) {
  const decisions = new Map();
  const resolved = [];
  if (!fs.existsSync(file)) return { decisions, resolved };
  const text = fs.readFileSync(file, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/<!-- k:([0-9a-f]{10}) -->/);
    if (!m) continue;
    const cells = line.split(/(?<!\\)\|/).map(c => c.trim());
    // | Término <!-- k --> | Hallazgo | Decisión |
    decisions.set(m[1], { subject: cells[1].replace(/<!--.*?-->/, "").trim(), finding: cells[2], decision: cells[3] || "" });
  }
  const res = text.split("## Resueltos")[1];
  if (res) for (const line of res.split("\n")) if (line.startsWith("- ")) resolved.push(line);
  return { decisions, resolved };
}

// ── Escritura ───────────────────────────────────────────────────────────
fs.mkdirSync(OUT_DIR, { recursive: true });
const summary = [];
for (const topic of TOPICS) {
  const file = path.join(OUT_DIR, `${topic.slug}.md`);
  const rows = topic.custom === "taxonomy" ? taxonomyRows() : topic.custom === "review" ? reviewRows() : fromRules(topic.rules)();
  const { decisions, resolved } = readPrevious(file);
  const current = new Set(rows.map(r => r.key));
  for (const [key, prev] of decisions) {
    if (current.has(key)) continue;
    const decision = prev.decision ? ` — decisión: ${prev.decision}` : "";
    resolved.unshift(`- ${today} · ${prev.subject}: ${prev.finding}${decision}`);
  }

  const groups = [...new Set(rows.map(r => r.group))];
  const tables = groups
    .map(g => {
      const list = rows.filter(r => r.group === g);
      return [
        `### ${g} (${list.length})`,
        "",
        "| Término o campo | Hallazgo | Decisión |",
        "|---|---|---|",
        ...list.map(r => `| ${cell(r.subject)} <!-- k:${r.key} --> | ${cell(r.finding)} | ${cell(decisions.get(r.key)?.decision || "")} |`)
      ].join("\n");
    })
    .join("\n\n");

  const doc = [
    `# Auditoría: ${topic.title}`,
    "",
    `> Generado con \`npm run lexicon:audit\` el ${today}. La tabla se regenera con los datos actuales; **lo que escribas en «Decisión» se conserva**. Al corregirse, un caso pasa a «Resueltos» con su decisión.`,
    "",
    "## Qué revisa",
    "",
    topic.what,
    "",
    "## Por qué importa",
    "",
    topic.why,
    "",
    "## Cómo decidir",
    "",
    ...topic.decide.map(d => `- ${d}`),
    "",
    "## Cómo corregir",
    "",
    topic.fix,
    "",
    "Después de corregir: `npm run build:lexicon`, `npm test` y vuelve a generar esta auditoría.",
    "",
    `## Casos pendientes (${rows.length})`,
    "",
    rows.length ? tables : "Ninguno.",
    "",
    "## Resueltos",
    "",
    resolved.length ? resolved.join("\n") : "Aún ninguno.",
    ""
  ].join("\n");
  fs.writeFileSync(file, doc);
  summary.push({ topic, count: rows.length, decided: rows.filter(r => decisions.get(r.key)?.decision).length, resolved: resolved.length });
}

const index = [
  "# Auditorías del léxico",
  "",
  `> Generado con \`npm run lexicon:audit\` el ${today}. Cómo trabajar con estos documentos: [guía de revisión clínica](../GUIA_REVISION_CLINICA.md).`,
  "",
  "Cada auditoría reúne un tipo de hallazgo que necesita **criterio clínico**: el validador los detecta, pero no puede decidir cuál es la opción correcta. Los errores que rompen la app no están aquí: los bloquea `npm test`.",
  "",
  "| Auditoría | Pendientes | Con decisión anotada | Resueltos |",
  "|---|---:|---:|---:|",
  ...summary.map(s => `| [${s.topic.title}](${s.topic.slug}.md) | ${s.count} | ${s.decided} | ${s.resolved} |`),
  "",
  "Orden sugerido: exclusiones y codificación primero (son errores de contenido), luego dominios y sinónimos (afectan a la búsqueda y al Integrador), y al final redacción y taxonomía. La cobertura de revisión avanza en paralelo.",
  ""
].join("\n");
fs.writeFileSync(path.join(OUT_DIR, "README.md"), index);

console.log(`Auditorías → ${path.relative(ROOT, OUT_DIR)}/`);
for (const s of summary) console.log(`  ${s.topic.slug.padEnd(24)} ${String(s.count).padStart(4)} pendientes · ${s.decided} con decisión · ${s.resolved} resueltos`);
