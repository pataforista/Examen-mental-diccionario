# Auditoría: Sinónimos

> Generado con `npm run lexicon:audit` el 2026-11-28. La tabla se regenera con los datos actuales; **lo que escribas en «Decisión» se conserva**. Al corregirse, un caso pasa a «Resueltos» con su decisión.

## Qué revisa

Los sinónimos de cada término: cómo lo dicen pacientes, colegas o la tradición clínica. La búsqueda de la app los usa.

## Por qué importa

Un sinónimo que también es el nombre de otro término hace que la búsqueda mezcle conceptos distintos. Un término sin sinónimos es difícil de encontrar.

## Cómo decidir

- **Compartido:** decide a cuál de los dos términos pertenece. Si es un concepto más amplio que abarca a ambos, quítalo de los dos y menciónalo en las notas docentes.
- **Es el nombre de otro término:** casi siempre debe quitarse del que no es su dueño (p. ej., «micropsia» no es sinónimo de «Distorsión perceptiva visual», es un tipo).
- **Sin sinónimos:** agrega al menos uno de uso real, si existe.

## Cómo corregir

Columna `sinonimos` de la planilla (`npm run lexicon:export`) o `synonyms_and_slang` en el archivo del término.

Después de corregir: `npm run build:lexicon`, `npm test` y vuelve a generar esta auditoría.

## Casos pendientes (1)

### Sinónimo que también usa otro término (1)

| Término o campo | Hallazgo | Decisión |
|---|---|---|
| MEM_016 · Fuga <!-- k:f61a6aecd0 --> | "fuga disociativa" es el nombre de MEM_017 | Pendiente decisión taxonómica: posible duplicado de MEM_017 (2026-11-27) |

## Resueltos

- 2026-11-27 · MOT_007 · Estereotipia: agregar cómo lo dicen pacientes o colegas — decisión: Añadidos: estereotipia motora, movimiento estereotipado (2026-11-27)
- 2026-11-27 · DEL_029 · Síndrome de Cotard: agregar cómo lo dicen pacientes o colegas — decisión: Añadidos: delirio nihilista, delirio de negación (2026-11-27)
- 2026-11-27 · CNT_002 · Obsesión: agregar cómo lo dicen pacientes o colegas — decisión: Añadidos: pensamiento obsesivo, idea obsesiva intrusiva (2026-11-27)
- 2026-11-27 · CNT_001 · Idea sobrevalorada: agregar cómo lo dicen pacientes o colegas — decisión: Añadidos: creencia sobrevalorada, idea prevalente (2026-11-27)
- 2026-11-27 · CAT_001 · Catatonia maligna: agregar cómo lo dicen pacientes o colegas — decisión: Añadidos: catatonia letal, catatonia perniciosa (2026-11-27)
- 2026-11-27 · VOL_002 · Ambivalencia volitiva: "ambitendencia" es el nombre de ARC_001 — decisión: Quitado 'ambitendencia', propio de ARC_001 (2026-11-27)
- 2026-11-27 · THO_007 · Incoherencia: "ensalada de palabras" es el nombre de THO_005 — decisión: Quitado 'ensalada de palabras', propio de THO_005 (2026-11-27)
- 2026-11-27 · THO_005 · Ensalada de palabras: "ensalada de palabras" también en THO_007 — decisión: Quitado de THO_007 (2026-11-27)
- 2026-11-27 · TALD_021 · Pobreza del Habla: "Pobreza del Habla" también en NEG_002 — decisión: Quitado de NEG_002 (2026-11-27)
- 2026-11-27 · TALD_002 · Concretismo: "Concretismo" también en COG_005 — decisión: Quitado de COG_005 (2026-11-27)
- 2026-11-27 · PER_018 · Micropsia: "micropsia" también en PER_012 — decisión: Quitado de PER_012 (2026-11-27)
- 2026-11-27 · PER_017 · Metamorfopsia: "metamorfopsia" también en PER_012 — decisión: Quitado de PER_012 (2026-11-27)
- 2026-11-27 · PER_016 · Macropsia: "macropsia" también en PER_012 — decisión: Quitado de PER_012 (2026-11-27)
- 2026-11-27 · PER_012 · Distorsión perceptiva visual: "macropsia" es el nombre de PER_016 — decisión: Quitados subtipos; añadido 'dismorfopsia visual' (2026-11-27)
- 2026-11-27 · PER_012 · Distorsión perceptiva visual: "micropsia" es el nombre de PER_018 — decisión: Quitados subtipos; añadido 'dismorfopsia visual' (2026-11-27)
- 2026-11-27 · PER_012 · Distorsión perceptiva visual: "metamorfopsia" es el nombre de PER_017 — decisión: Quitados subtipos; añadido 'dismorfopsia visual' (2026-11-27)
- 2026-11-27 · PER_011 · Alucinosis: "síndrome de Charles Bonnet" es el nombre de NEU_003 — decisión: Quitado 'síndrome de Charles Bonnet', propio de NEU_003 (2026-11-27)
- 2026-11-27 · NEG_002 · Alogia: "pobreza del habla" es el nombre de TALD_021 — decisión: Quitado 'pobreza del habla', propio de TALD_021 (2026-11-27)
- 2026-11-27 · HIS_007 · Locura lúcida: "mania sin delirio" es el nombre de ARC_014 — decisión: Reemplazado por 'folie lucide' (2026-11-27)
- 2026-11-27 · DEL_011 · Delirio primario (autóctono): "atmósfera delirante" también en ARC_020 — decisión: Quitado 'atmósfera delirante', propio de ARC_020 (2026-11-27)
- 2026-11-27 · COG_005 · Pensamiento Abstracto / Concreto: "concretismo" es el nombre de TALD_002 — decisión: Quitado 'concretismo', propio de TALD_002 (2026-11-27)
- 2026-11-27 · CAT_002 · Estupor catatónico: "estupor psiquiátrico" es el nombre de CNS_005 — decisión: Reemplazado por 'inmovilidad catatónica' (2026-11-27)
- 2026-11-27 · ARC_020 · Wahnstimmung: "atmósfera delirante" también en DEL_011 — decisión: Mantenido en ARC_020; quitado de DEL_011 (2026-11-27)
- 2026-11-27 · AFF_007 · Ansiedad: "angustia" es el nombre de AFF_005 — decisión: Quitado 'angustia', propio de AFF_005 (2026-11-27)
- 2026-11-27 · AFF_005 · Angustia: "angustia" también en AFF_007 — decisión: Quitado 'angustia' de AFF_007; conceptos distintos (2026-11-27)
