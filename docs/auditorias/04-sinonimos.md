# Auditoría: Sinónimos

> Generado con `npm run lexicon:audit` el 2026-11-27. La tabla se regenera con los datos actuales; **lo que escribas en «Decisión» se conserva**. Al corregirse, un caso pasa a «Resueltos» con su decisión.

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

## Casos pendientes (26)

### Sinónimo que también usa otro término (21)

| Término o campo | Hallazgo | Decisión |
|---|---|---|
| AFF_005 · Angustia <!-- k:ca0e12be79 --> | "angustia" también en AFF_007 |  |
| AFF_007 · Ansiedad <!-- k:1892a2bd6e --> | "angustia" es el nombre de AFF_005 |  |
| ARC_020 · Wahnstimmung <!-- k:e394236372 --> | "atmósfera delirante" también en DEL_011 |  |
| CAT_002 · Estupor catatónico <!-- k:229790dff4 --> | "estupor psiquiátrico" es el nombre de CNS_005 |  |
| COG_005 · Pensamiento Abstracto / Concreto <!-- k:93f54082c4 --> | "concretismo" es el nombre de TALD_002 |  |
| DEL_011 · Delirio primario (autóctono) <!-- k:415a4d128e --> | "atmósfera delirante" también en ARC_020 |  |
| HIS_007 · Locura lúcida <!-- k:06d5bf7965 --> | "mania sin delirio" es el nombre de ARC_014 |  |
| MEM_016 · Fuga <!-- k:f61a6aecd0 --> | "fuga disociativa" es el nombre de MEM_017 |  |
| NEG_002 · Alogia <!-- k:cd993ee001 --> | "pobreza del habla" es el nombre de TALD_021 |  |
| PER_011 · Alucinosis <!-- k:c3f6506577 --> | "síndrome de Charles Bonnet" es el nombre de NEU_003 |  |
| PER_012 · Distorsión perceptiva visual <!-- k:b17dfc0971 --> | "metamorfopsia" es el nombre de PER_017 |  |
| PER_012 · Distorsión perceptiva visual <!-- k:9a5663b4ea --> | "micropsia" es el nombre de PER_018 |  |
| PER_012 · Distorsión perceptiva visual <!-- k:6b86877481 --> | "macropsia" es el nombre de PER_016 |  |
| PER_016 · Macropsia <!-- k:e11c3b6691 --> | "macropsia" también en PER_012 |  |
| PER_017 · Metamorfopsia <!-- k:b3f2850b29 --> | "metamorfopsia" también en PER_012 |  |
| PER_018 · Micropsia <!-- k:72b779cb3d --> | "micropsia" también en PER_012 |  |
| TALD_002 · Concretismo <!-- k:904f322092 --> | "Concretismo" también en COG_005 |  |
| TALD_021 · Pobreza del Habla <!-- k:9d7085751f --> | "Pobreza del Habla" también en NEG_002 |  |
| THO_005 · Ensalada de palabras <!-- k:9699376152 --> | "ensalada de palabras" también en THO_007 |  |
| THO_007 · Incoherencia <!-- k:72fd0cad77 --> | "ensalada de palabras" es el nombre de THO_005 |  |
| VOL_002 · Ambivalencia volitiva <!-- k:b66806e400 --> | "ambitendencia" es el nombre de ARC_001 |  |

### Sin sinónimos (más difícil de encontrar) (5)

| Término o campo | Hallazgo | Decisión |
|---|---|---|
| CAT_001 · Catatonia maligna <!-- k:7812321586 --> | agregar cómo lo dicen pacientes o colegas |  |
| CNT_001 · Idea sobrevalorada <!-- k:eab897132f --> | agregar cómo lo dicen pacientes o colegas |  |
| CNT_002 · Obsesión <!-- k:16be423f24 --> | agregar cómo lo dicen pacientes o colegas |  |
| DEL_029 · Síndrome de Cotard <!-- k:13e87761ac --> | agregar cómo lo dicen pacientes o colegas |  |
| MOT_007 · Estereotipia <!-- k:49be1c6fce --> | agregar cómo lo dicen pacientes o colegas |  |

## Resueltos

Aún ninguno.
