// Regresión de las herramientas del léxico (parte de npm test). No escribe en el léxico:
// trabaja sobre copias en un directorio temporal y usa la importación en vista previa.
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { parseCSV, toCSV } = require("./lexicon_edit.js");
const SHEET = path.join(path.dirname(fileURLToPath(import.meta.url)), "lexicon_sheet.js");

let failures = 0;
const check = (ok, label, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}${!ok && detail ? `\n     ${detail}` : ""}`);
};
const run = args => {
  try {
    return { code: 0, out: execFileSync(process.execPath, [SHEET, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (e) {
    return { code: e.status, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
};

// 1. CSV: comillas, saltos de línea dentro de la celda y separadores de Excel en español.
const rows = [["a", 'con "comillas"', "línea 1\nlínea 2", "x;y"], ["", "", "ñandú", "fin"]];
const back = parseCSV(toCSV(["c1", "c2", "c3", "c4"], rows));
check(JSON.stringify(back.rows) === JSON.stringify(rows), "CSV ida y vuelta (comillas, saltos de línea, ';')", JSON.stringify(back.rows));
const semi = parseCSV('\uFEFFid;nombre\r\nX_001;"a;b"\r\n');
check(semi.sep === ";" && semi.rows[0][1] === "a;b", "CSV con ';' y BOM (Excel en español)");
const tab = parseCSV("id\tnombre\nX_001\tuno\n");
check(tab.sep === "\t" && tab.rows[0][1] === "uno", "CSV con tabulador");

// 2. Exportar e importar sin tocar nada no cambia nada.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lexico-"));
const csv = path.join(dir, "planilla.csv");
run(["exportar", csv]);
const same = run(["importar", csv]);
check(same.code === 0 && /0 términos con cambios · 0 nuevos/.test(same.out), "exportar → importar sin cambios = 0 cambios", same.out.split("\n")[0]);

// 3. Una edición se detecta; un valor fuera del vocabulario bloquea sin escribir.
const sheet = parseCSV(fs.readFileSync(csv, "utf8"));
const col = Object.fromEntries(sheet.header.map((h, i) => [h, i]));
const edited = sheet.rows.map(r => [...r]);
edited[0][col.definicion] += " (editado en la prueba)";
fs.writeFileSync(csv, toCSV(sheet.header, edited));
const change = run(["importar", csv]);
check(change.code === 0 && /1 términos con cambios/.test(change.out) && /Vista previa/.test(change.out), "una definición editada aparece en la vista previa", change.out.split("\n")[0]);

edited[1][col.tipo] = "sintoma";
fs.writeFileSync(csv, toCSV(sheet.header, edited));
const bad = run(["importar", csv, "--aplicar"]);
check(bad.code === 1 && /no se escribió nada/.test(bad.out), "un tipo fuera del vocabulario bloquea la importación");

fs.rmSync(dir, { recursive: true, force: true });

// 4. Regresión de recalibración risk_weight (Commit D): 15 términos + distribución 0..5.
const bundle = JSON.parse(fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../lexicon/lexicon_bundle.json"), "utf8"));
const byId = Object.fromEntries(bundle.terms.map(t => [t.term_id, t]));
const expectedRisk = {
  CAT_001: 5, SPE_007: 2, JUD_002: 1, ARC_003: 1, ARC_006: 0,
  ARC_013: 0, SNM_001: 5, SER_001: 5, CNS_002: 5, MEM_011: 3,
  RSK_003: 3, ARC_011: 0, HIS_003: 0, HIS_004: 0, HIS_005: 0,
  AFF_023: 2, DEL_003: 2, DEL_006: 2, DEL_008: 2, DEL_028: 2, DEL_029: 2
};
const riskDiffs = Object.entries(expectedRisk).filter(([id, w]) => byId[id]?.risk_weight !== w).map(([id, w]) => `${id}=${byId[id]?.risk_weight} (esperado ${w})`);
check(riskDiffs.length === 0, "recalibración risk_weight de los 21 términos", riskDiffs.join(", "));
const dist = [0, 1, 2, 3, 4, 5].map(w => bundle.terms.filter(t => t.risk_weight === w).length);
check(dist.join("/") === "106/110/58/5/3/7", `distribución risk_weight 0..5 = ${dist.join("/")}`, "esperado 106/110/58/5/3/7");

// 5. Snapshot textual de 15 definiciones críticas (evita cambios accidentales en definition_clinical.core).
const coreSnapshot = {
  RSK_007: "a097200808f1", RSK_006: "080d09492038", RSK_003: "cd88032a27c4", RSK_008: "e846588367d8", CAT_001: "15642c7c4c33",
  SNM_001: "21f1b94f408f", SER_001: "b2e858570a77", CNS_002: "88eecd53bdc1", MEM_011: "1933ae85b7a9", DEL_009: "f651dd1fee46",
  PER_010: "9e2b9795ee8c", AFF_013: "14adb682cea3", AFF_027: "2518d52d4315", THO_006: "14beaf3e4b67", THO_007: "798f124624ae"
};
const coreDiffs = Object.entries(coreSnapshot).filter(([id, h]) => crypto.createHash("sha256").update(byId[id]?.definition_clinical?.core || "").digest("hex").slice(0, 12) !== h).map(([id]) => id);
check(coreDiffs.length === 0, "snapshot de 15 definiciones críticas (definition_clinical.core)", `cambiaron: ${coreDiffs.join(", ")}`);

console.log(failures ? `\nHerramientas del léxico: ${failures} fallo(s)` : "\nHerramientas del léxico: todo OK");
process.exit(failures ? 1 : 0);
