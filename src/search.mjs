// Búsqueda del diccionario, sin dependencias del DOM (la prueba la ejecuta en Node).
//
// Por niveles, en este orden:
//   0. el nombre empieza con la consulta
//   1. todas las palabras están en el nombre o en un sinónimo
//   2. todas las palabras están en la definición, al inicio de una palabra
//   3. tolerancia a errores (Fuse) sobre nombre y sinónimos
// Los niveles estrictos van primero para que una coincidencia exacta no quede
// por debajo de un parecido; la tolerancia solo añade lo que ellos no hallaron.

export const normalize = text =>
  String(text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ]+/g, " ")
    .trim();

const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Distancia de edición; desempata los resultados tolerantes ("katatonia" → Catatonia antes que Paratonía).
const levenshtein = (a, b) => {
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
};

export function createSearch(terms, Fuse, { limit = 50 } = {}) {
  const docs = (terms || []).filter(t => t && t.canonical_name).map(term => {
    const synonyms = (term.synonyms_and_slang || []).map(s => (s && s.term) || s).filter(s => typeof s === "string");
    return {
      term,
      name: normalize(term.canonical_name),
      syn: synonyms.map(normalize).join(" | "),
      def: normalize(term.definition_clinical?.core)
    };
  });

  const fuse = Fuse
    ? new Fuse(docs, {
        keys: [
          { name: "name", weight: 1 },
          { name: "syn", weight: 0.7 }
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
        includeScore: true,
        // El espacio funciona como "y": cada palabra debe parecerse a algo del término.
        useExtendedSearch: true
      })
    : null;

  return function search(query) {
    const q = normalize(query);
    if (q.length < 2) return [];
    const tokens = q.split(" ");
    const wordStart = tokens.map(t => new RegExp(`(^|\\s)${escapeRe(t)}`));
    const ranked = [];
    const seen = new Set();

    docs.forEach(d => {
      const nameSyn = `${d.name} | ${d.syn}`;
      let tier = -1;
      if (d.name.startsWith(q)) tier = 0;
      else if (tokens.every(t => nameSyn.includes(t))) tier = 1;
      else if (tokens.every((t, i) => wordStart[i].test(d.def) || nameSyn.includes(t))) tier = 2;
      if (tier >= 0) {
        // Dentro del nivel: primero donde la consulta abre una palabra del nombre, luego los nombres cortos.
        const opensWord = wordStart.every(re => re.test(d.name)) ? 0 : 1;
        ranked.push({ d, key: [tier, opensWord, d.name.length] });
        seen.add(d);
      }
    });

    if (fuse) {
      // Los caracteres especiales de la búsqueda extendida ya los quitó normalize().
      fuse.search(tokens.join(" ")).forEach(r => {
        if (seen.has(r.item)) return;
        const words = r.item.name.split(" ");
        const closest = Math.min(...words.map(w => levenshtein(tokens[0], w.slice(0, tokens[0].length + 1))));
        ranked.push({ d: r.item, key: [3, closest, r.score] });
      });
    }

    ranked.sort((a, b) => {
      for (let i = 0; i < a.key.length; i++) if (a.key[i] !== b.key[i]) return a.key[i] - b.key[i];
      return 0;
    });
    return ranked.slice(0, limit).map(r => r.d.term);
  };
}
