// Regresión de la búsqueda del diccionario contra el léxico real.
// Cada caso describe algo que una persona escribe de verdad: con errores,
// sin tildes, en otro orden o con una palabra que solo está en la definición.
import fs from "node:fs";
import Fuse from "fuse.js";
import { createSearch, normalize } from "../src/search.mjs";

const { terms } = JSON.parse(fs.readFileSync(new URL("../lexicon/lexicon_bundle.json", import.meta.url)));
const search = createSearch(terms, Fuse);
const names = q => search(q).map(t => t.canonical_name);

// [consulta, término esperado, puesto máximo aceptable (1 = primero)]
const CASES = [
  // Exactas y sin tildes
  ["ecolalia", "Ecolalia", 1],
  ["ecolalía", "Ecolalia", 1],
  ["despersonalizacion", "Despersonalización", 1],
  ["sindrome serotoninergico", "Síndrome serotoninérgico", 1],
  ["mania", "Manía", 1],
  // Errores de escritura
  ["alusinacion", "Alucinación verdadera", 5],
  ["alucinasion", "Alucinación verdadera", 5],
  ["insigth", "Insight completo", 5],
  ["katatonia", "Catatonia maligna", 1],
  // Palabras en otro orden o con forma distinta
  ["ideas fuga", "Fuga de ideas", 1],
  ["delirio de persecucion", "Delirio persecutorio", 1],
  // Palabras que solo aparecen dentro de la definición (más allá de los primeros caracteres)
  ["zumbidos", "Acoasmas", 1],
  ["serotonina", "Síndrome serotoninérgico", 1],
  ["tristeza", "Depresión", 3]
];

// Consultas que no deben devolver nada (ruido o caracteres de la sintaxis extendida de Fuse)
const EMPTY = ["a", " ", "!^=$'", "xqzwv"];

let failures = 0;
const fail = msg => { failures++; console.log(`FAIL ${msg}`); };

for (const [q, expected, maxRank] of CASES) {
  const list = names(q);
  const rank = list.indexOf(expected) + 1;
  if (rank === 0) fail(`"${q}": no aparece "${expected}" (primeros: ${list.slice(0, 3).join(" ; ") || "ninguno"})`);
  else if (rank > maxRank) fail(`"${q}": "${expected}" en el puesto ${rank}, se esperaba ≤ ${maxRank}`);
  else console.log(`ok   "${q}" → ${expected} (#${rank})`);
}

for (const q of EMPTY) {
  const n = search(q).length;
  if (n) fail(`"${q}" devolvió ${n} resultado(s); se esperaban 0`);
  else console.log(`ok   "${q}" → sin resultados`);
}

// Un término que existe siempre debe encontrarse por su propio nombre, en primer lugar
// o empatado con otro de nombre idéntico al normalizar.
let selfMisses = 0;
for (const t of terms) {
  if (!t || !t.canonical_name) continue;
  const first = search(t.canonical_name)[0];
  if (!first || normalize(first.canonical_name) !== normalize(t.canonical_name)) {
    selfMisses++;
    if (selfMisses <= 5) fail(`buscar "${t.canonical_name}" no lo devuelve primero (devuelve "${first?.canonical_name || "nada"}")`);
  }
}
if (!selfMisses) console.log(`ok   los ${terms.length} términos se encuentran primero por su nombre`);
else if (selfMisses > 5) console.log(`… y ${selfMisses - 5} término(s) más`);

console.log(failures ? `\nBúsqueda: ${failures} fallo(s)` : "\nBúsqueda: todo OK");
process.exit(failures ? 1 : 0);
