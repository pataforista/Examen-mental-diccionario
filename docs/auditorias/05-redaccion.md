# Auditoría: Redacción clínica

> Generado con `npm run lexicon:audit` el 2026-11-27. La tabla se regenera con los datos actuales; **lo que escribas en «Decisión» se conserva**. Al corregirse, un caso pasa a «Resueltos» con su decisión.

## Qué revisa

La calidad del texto que lee el estudiante: marcadores subjetivos, mayúsculas de los nombres y notas docentes.

## Por qué importa

Un marcador subjetivo genérico («refiere experiencia compatible con…») no enseña cómo suena el síntoma en la voz del paciente, que es justo lo que el residente necesita reconocer en la entrevista.

## Cómo decidir

- **Marcador genérico:** reescríbelo como lo diría un paciente, entre comillas, sin tecnicismos. Ejemplo para acoasmas: «Oigo zumbidos o chasquidos que nadie más escucha».
- **Mayúsculas:** en español solo va en mayúscula la primera palabra y los nombres propios (epónimos).
- **Sin notas docentes:** prioriza los términos de riesgo alto y los que se confunden con frecuencia.

## Cómo corregir

Planilla (`marcador_subjetivo`, `nombre`, `notas_docentes`) o el archivo del término.

Después de corregir: `npm run build:lexicon`, `npm test` y vuelve a generar esta auditoría.

## Casos pendientes (110)

### Sin notas docentes (73)

| Término o campo | Hallazgo | Decisión |
|---|---|---|
| AFF_002 · Alexitimia <!-- k:54ecc20c1e --> | sin teaching_notes |  |
| AFF_006 · Anhedonia <!-- k:f15645638b --> | sin teaching_notes |  |
| AFF_007 · Ansiedad <!-- k:860cd6683d --> | sin teaching_notes |  |
| AFF_009 · Apatía <!-- k:f245321361 --> | sin teaching_notes |  |
| AFF_010 · Aplanamiento afectivo <!-- k:7ad7f3fe05 --> | sin teaching_notes |  |
| AFF_012 · Culpa patológica <!-- k:25cf4e0cf1 --> | sin teaching_notes |  |
| AFF_013 · Depresión <!-- k:929d75c546 --> | sin teaching_notes |  |
| AFF_014 · Disforia <!-- k:4151cc4bdf --> | sin teaching_notes |  |
| AFF_015 · Embotamiento afectivo <!-- k:0b47f3159e --> | sin teaching_notes |  |
| AFF_016 · Euforia <!-- k:4786d78757 --> | sin teaching_notes |  |
| AFF_017 · Eutimia <!-- k:081fdc0c79 --> | sin teaching_notes |  |
| AFF_018 · Fatiga emocional <!-- k:25a01b2b15 --> | sin teaching_notes |  |
| AFF_019 · Hipomanía <!-- k:afd307745e --> | sin teaching_notes |  |
| AFF_020 · Hipotimia <!-- k:1e8ca70cd4 --> | sin teaching_notes |  |
| AFF_021 · Incongruencia afectiva <!-- k:b29c26dd05 --> | sin teaching_notes |  |
| AFF_024 · Irritabilidad <!-- k:9556c60972 --> | sin teaching_notes |  |
| AFF_025 · Labilidad afectiva <!-- k:0cce32d83b --> | sin teaching_notes |  |
| AFF_026 · Llaneza afectiva <!-- k:7a40d3cb4d --> | sin teaching_notes |  |
| AFF_027 · Manía <!-- k:356c1a0127 --> | sin teaching_notes |  |
| AFF_028 · Miedo <!-- k:0b301bf15d --> | sin teaching_notes |  |
| AFF_030 · Perplejidad <!-- k:f369dae684 --> | sin teaching_notes |  |
| AFF_031 · Pánico <!-- k:ab32148619 --> | sin teaching_notes |  |
| AFF_034 · Sentimientos impuestos <!-- k:2be9d25074 --> | sin teaching_notes |  |
| CAT_004 · Mutismo catatónico <!-- k:d3d47f5291 --> | sin teaching_notes |  |
| CNS_001 · Anergia <!-- k:ac304396f1 --> | sin teaching_notes |  |
| CNS_002 · Coma <!-- k:a56067768f --> | sin teaching_notes |  |
| CNS_003 · Estado crepuscular <!-- k:bdfbe804c6 --> | sin teaching_notes |  |
| CNS_004 · Estados oniroides o de trastorno hipnagógico patológico <!-- k:7e0bd7ca2b --> | sin teaching_notes |  |
| CNS_005 · Estupor psiquiátrico <!-- k:b53f93ea0c --> | sin teaching_notes |  |
| CNS_006 · Lentitud del Pensamiento (Bradipsiquia) <!-- k:01765ca881 --> | sin teaching_notes |  |
| CNS_007 · Letargo <!-- k:5ac92bc9f8 --> | sin teaching_notes |  |
| CNS_008 · Moria <!-- k:74e7eeab36 --> | sin teaching_notes |  |
| CNS_009 · Síncope <!-- k:62515f842c --> | sin teaching_notes |  |
| CNS_010 · Trance <!-- k:870c76981f --> | sin teaching_notes |  |
| DEL_029 · Síndrome de Cotard <!-- k:f461f95d00 --> | sin teaching_notes |  |
| INS_001 · Anosognosia <!-- k:b688184c55 --> | sin teaching_notes |  |
| INS_002 · Ausencia de insight psiquiátrico <!-- k:618ce6ba2d --> | sin teaching_notes |  |
| INS_003 · Egocintonía <!-- k:965fadaf37 --> | sin teaching_notes |  |
| INS_004 · Egodistonía <!-- k:e04aca1537 --> | sin teaching_notes |  |
| INS_006 · Insight emocional <!-- k:a3787826c5 --> | sin teaching_notes |  |
| INS_007 · Insight intelectual <!-- k:baa29674ec --> | sin teaching_notes |  |
| INS_009 · Insight parcial <!-- k:16dbc0f98f --> | sin teaching_notes |  |
| INS_010 · Noesis de recuperación <!-- k:74330ccbab --> | sin teaching_notes |  |
| MEM_002 · Amnesia anterógrada <!-- k:2b42d9ad81 --> | sin teaching_notes |  |
| MEM_003 · Amnesia anterógrada disociativa <!-- k:e9b182bdb2 --> | sin teaching_notes |  |
| MEM_005 · Amnesia global transitoria <!-- k:f84cdef559 --> | sin teaching_notes |  |
| MEM_006 · Amnesia psicógena <!-- k:357a806aaa --> | sin teaching_notes |  |
| MEM_007 · Amnesia retrógrada <!-- k:f60239fb67 --> | sin teaching_notes |  |
| MEM_008 · Confabulación espontánea <!-- k:4cf0c846b8 --> | sin teaching_notes |  |
| MEM_009 · Confabulación provocada <!-- k:9694336231 --> | sin teaching_notes |  |
| MEM_010 · Criptomnesia <!-- k:24a79ae588 --> | sin teaching_notes |  |
| MEM_011 · Delirium <!-- k:f3ded90e82 --> | sin teaching_notes |  |
| MEM_012 · Déjà senti <!-- k:089d698e36 --> | sin teaching_notes |  |
| MEM_013 · Déjà vu <!-- k:c718c6d1be --> | sin teaching_notes |  |
| MEM_015 · Estado confusional <!-- k:5a6f96db14 --> | sin teaching_notes |  |
| MEM_017 · Fuga disociativa <!-- k:7b023890b8 --> | sin teaching_notes |  |
| MEM_019 · Jamais vu <!-- k:49c854989d --> | sin teaching_notes |  |
| MEM_020 · Memoria dependiente del estado <!-- k:774d33d306 --> | sin teaching_notes |  |
| MEM_023 · Paramnesia reduplicativa <!-- k:7b784d2048 --> | sin teaching_notes |  |
| MEM_024 · Presque vu patológico <!-- k:bf5cd77256 --> | sin teaching_notes |  |
| MEM_026 · Síndrome de Korsakoff <!-- k:4da788b216 --> | sin teaching_notes |  |
| MOT_007 · Estereotipia <!-- k:9efb19beaf --> | sin teaching_notes |  |
| NEG_001 · Aislamiento/retraimiento social (social withdrawal/asociality) <!-- k:5aefa374e1 --> | sin teaching_notes |  |
| NEG_002 · Alogia <!-- k:45b1168b05 --> | sin teaching_notes |  |
| NEG_003 · Deterioro o descuido grave del autocuidado/higiene (síndrome negativo/defecto) <!-- k:3765a2ea8f --> | sin teaching_notes |  |
| VOL_001 · Abulia <!-- k:17d2271175 --> | sin teaching_notes |  |
| VOL_002 · Ambivalencia volitiva <!-- k:6599f26479 --> | sin teaching_notes |  |
| VOL_003 · Ecopraxia <!-- k:e9b6566bc4 --> | sin teaching_notes |  |
| VOL_004 · Flexibilidad cérea <!-- k:e9740ab8fe --> | sin teaching_notes |  |
| VOL_005 · Hiperbulia <!-- k:093b80eeae --> | sin teaching_notes |  |
| VOL_006 · Hipobulia <!-- k:138df43934 --> | sin teaching_notes |  |
| VOL_008 · Impulsividad patológica <!-- k:f1ecf43763 --> | sin teaching_notes |  |
| VOL_009 · Negativismo <!-- k:f1a8f11620 --> | sin teaching_notes |  |

### Marcador subjetivo genérico (37)

| Término o campo | Hallazgo | Decisión |
|---|---|---|
| DEL_002 · BLIPS <!-- k:eeb55c43e0 --> | "El paciente refiere experiencia compatible con blips." — describir lo que la persona refiere, con sus palabras |  |
| DEL_004 · Cristalización delirante <!-- k:6f902f3163 --> | "El paciente refiere experiencia compatible con cristalización delirante." — describir lo que la persona refiere, con sus palabras |  |
| DEL_005 · Delirio de infestación (Ekbom) <!-- k:3c71938e3a --> | "El paciente refiere experiencia compatible con delirio de infestación (ekbom)." — describir lo que la persona refiere, con sus palabras |  |
| DEL_006 · Delirio de ruina/pobreza <!-- k:f8ef14e87c --> | "El paciente refiere experiencia compatible con delirio de ruina/pobreza." — describir lo que la persona refiere, con sus palabras |  |
| DEL_007 · Delirio grandioso <!-- k:805d1dba76 --> | "El paciente refiere experiencia compatible con delirio grandioso." — describir lo que la persona refiere, con sus palabras |  |
| DEL_008 · Delirio místico-religioso de mandato <!-- k:da882d34a8 --> | "El paciente refiere experiencia compatible con delirio místico-religioso de mandato." — describir lo que la persona refiere, con sus palabras |  |
| DEL_010 · Delirio primario (Jaspers) <!-- k:7a86c645d4 --> | "El paciente refiere experiencia compatible con delirio primario (jaspers)." — describir lo que la persona refiere, con sus palabras |  |
| DEL_012 · Delirio querulante <!-- k:9202faab31 --> | "El paciente refiere experiencia compatible con delirio querulante." — describir lo que la persona refiere, con sus palabras |  |
| DEL_013 · Delirio referencial <!-- k:1b78ec53b8 --> | "El paciente refiere experiencia compatible con delirio referencial." — describir lo que la persona refiere, con sus palabras |  |
| DEL_014 · Delirio somático monotemático <!-- k:6f942731fc --> | "El paciente refiere experiencia compatible con delirio somático monotemático." — describir lo que la persona refiere, con sus palabras |  |
| DEL_016 · Erotomanía (Síndrome de Clérambault) <!-- k:eab8014cae --> | "El paciente refiere experiencia compatible con erotomanía (síndrome de clérambault)." — describir lo que la persona refiere, con sus palabras |  |
| DEL_020 · Ideas de referencia <!-- k:c91676d901 --> | "El paciente refiere experiencia compatible con ideas de referencia." — describir lo que la persona refiere, con sus palabras |  |
| DEL_021 · Ideas sobrevaloradas <!-- k:a2b2104a78 --> | "El paciente refiere experiencia compatible con ideas sobrevaloradas." — describir lo que la persona refiere, con sus palabras |  |
| DEL_023 · Intermetamorfosis <!-- k:ddd3fada86 --> | "El paciente refiere experiencia compatible con intermetamorfosis." — describir lo que la persona refiere, con sus palabras |  |
| DEL_024 · Interpretación delirante <!-- k:2a2374ed36 --> | "El paciente refiere experiencia compatible con interpretación delirante." — describir lo que la persona refiere, con sus palabras |  |
| DEL_025 · Perplejidad delirante <!-- k:8dc74e2578 --> | "El paciente refiere experiencia compatible con perplejidad delirante." — describir lo que la persona refiere, con sus palabras |  |
| DEL_026 · Revelación delirante (intuición delirante) <!-- k:8ee21d65fb --> | "El paciente refiere experiencia compatible con revelación delirante (intuición delirante)." — describir lo que la persona refiere, con sus palabras |  |
| DEL_030 · Síndrome de Fregoli <!-- k:5c96806da1 --> | "El paciente refiere experiencia compatible con síndrome de fregoli." — describir lo que la persona refiere, con sus palabras |  |
| DEL_031 · Síntomas positivos atenuados <!-- k:8ea5956b2d --> | "El paciente refiere experiencia compatible con síntomas positivos atenuados." — describir lo que la persona refiere, con sus palabras |  |
| MEM_001 · Alteración de conciencia <!-- k:41356ed58f --> | "El paciente refiere experiencia compatible con alteración de conciencia." — describir lo que la persona refiere, con sus palabras |  |
| MEM_004 · Amnesia disociativa <!-- k:835f22a023 --> | "El paciente refiere experiencia compatible con amnesia disociativa." — describir lo que la persona refiere, con sus palabras |  |
| MEM_018 · Inatención <!-- k:c3c32e7bac --> | "El paciente refiere experiencia compatible con inatención." — describir lo que la persona refiere, con sus palabras |  |
| MOT_001 · Apraxia constructiva <!-- k:cb5d7d3102 --> | "El paciente refiere experiencia compatible con apraxia constructiva." — describir lo que la persona refiere, con sus palabras |  |
| MOT_002 · Apraxia ideacional <!-- k:c0c2676b5e --> | "El paciente refiere experiencia compatible con apraxia ideacional." — describir lo que la persona refiere, con sus palabras |  |
| MOT_003 · Apraxia ideomotora <!-- k:80bb921631 --> | "El paciente refiere experiencia compatible con apraxia ideomotora." — describir lo que la persona refiere, con sus palabras |  |
| MOT_009 · Mitgehen <!-- k:918124442a --> | "El paciente refiere experiencia compatible con mitgehen." — describir lo que la persona refiere, con sus palabras |  |
| PER_001 · Acoasmas <!-- k:afe2eb604d --> | "El paciente refiere experiencia compatible con acoasmas." — describir lo que la persona refiere, con sus palabras |  |
| PER_002 · Alucinaciones auditivas comentadoras <!-- k:4d324dd704 --> | "El paciente refiere experiencia compatible con alucinaciones auditivas comentadoras." — describir lo que la persona refiere, con sus palabras |  |
| PER_003 · Alucinaciones auditivas dialogantes <!-- k:570f264eca --> | "El paciente refiere experiencia compatible con alucinaciones auditivas dialogantes." — describir lo que la persona refiere, con sus palabras |  |
| PER_004 · Alucinaciones cenestésicas <!-- k:36e60fd026 --> | "El paciente refiere experiencia compatible con alucinaciones cenestésicas." — describir lo que la persona refiere, con sus palabras |  |
| PER_016 · Macropsia <!-- k:b709124bc8 --> | "El paciente refiere experiencia compatible con macropsia." — describir lo que la persona refiere, con sus palabras |  |
| PER_017 · Metamorfopsia <!-- k:aa3f883dc3 --> | "El paciente refiere experiencia compatible con metamorfopsia." — describir lo que la persona refiere, con sus palabras |  |
| PER_018 · Micropsia <!-- k:28274e0cc1 --> | "El paciente refiere experiencia compatible con micropsia." — describir lo que la persona refiere, con sus palabras |  |
| PER_019 · Palinopsia <!-- k:3dadf7b559 --> | "El paciente refiere experiencia compatible con palinopsia." — describir lo que la persona refiere, con sus palabras |  |
| PER_023 · Sonorización del pensamiento (Gedankenlautwerden) <!-- k:444186aaa6 --> | "El paciente refiere experiencia compatible con sonorización del pensamiento (gedankenlautwerden)." — describir lo que la persona refiere, con sus palabras |  |
| THO_002 · Asociación por consonancia (clang) <!-- k:df2857f220 --> | "El paciente refiere experiencia compatible con asociación por consonancia (clang)." — describir lo que la persona refiere, con sus palabras |  |
| THO_009 · Perseveración <!-- k:d487915b67 --> | "El paciente refiere experiencia compatible con perseveración." — describir lo que la persona refiere, con sus palabras |  |

## Resueltos

- 2026-11-27 · TALD_018 · Pensamiento Restringido: "Pensamiento Restringido" — en español solo la primera palabra — decisión: Normalizado a "Pensamiento restringido" (2026-11-27)
- 2026-11-27 · TALD_017 · Pensamiento Inhibido: "Pensamiento Inhibido" — en español solo la primera palabra — decisión: Normalizado a "Pensamiento inhibido" (2026-11-27)
- 2026-11-27 · TALD_016 · Pensamiento Enlentecido: "Pensamiento Enlentecido" — en español solo la primera palabra — decisión: Normalizado a "Pensamiento enlentecido" (2026-11-27)
- 2026-11-27 · TALD_015 · Parafasia Semántica: "Parafasia Semántica" — en español solo la primera palabra — decisión: Normalizado a "Parafasia semántica" (2026-11-27)
- 2026-11-27 · TALD_014 · Parafasia Fonémica: "Parafasia Fonémica" — en español solo la primera palabra — decisión: Normalizado a "Parafasia fonémica" (2026-11-27)
- 2026-11-27 · TALD_010 · Habla Presionada: "Habla Presionada" — en español solo la primera palabra — decisión: Normalizado a "Habla presionada" (2026-11-27)
- 2026-11-27 · TALD_009 · Habla Manierista: "Habla Manierista" — en español solo la primera palabra — decisión: Normalizado a "Habla manierista" (2026-11-27)
- 2026-11-27 · TALD_006 · Disfunción de la Iniciativa e Intencionalidad: "Disfunción de la Iniciativa e Intencionalidad" — en español solo la primera palabra — decisión: Normalizado a "Disfunción de la iniciativa e intencionalidad" (2026-11-27)
- 2026-11-27 · TALD_005 · Disfunción Receptiva del Lenguaje: "Disfunción Receptiva del Lenguaje" — en español solo la primera palabra — decisión: Normalizado a "Disfunción receptiva del lenguaje" (2026-11-27)
- 2026-11-27 · TALD_004 · Disfunción Expresiva del Lenguaje: "Disfunción Expresiva del Lenguaje" — en español solo la primera palabra — decisión: Normalizado a "Disfunción expresiva del lenguaje" (2026-11-27)
- 2026-11-27 · SNM_001 · Síndrome Neuroléptico Maligno: "Síndrome Neuroléptico Maligno" — en español solo la primera palabra — decisión: Normalizado a "Síndrome neuroléptico maligno" (2026-11-27)
- 2026-11-27 · SER_001 · Síndrome Serotoninérgico: "Síndrome Serotoninérgico" — en español solo la primera palabra — decisión: Normalizado a "Síndrome serotoninérgico" (2026-11-27)
- 2026-11-27 · PER_015 · Imagen Eidética: "Imagen Eidética" — en español solo la primera palabra — decisión: Normalizado a "Imagen eidética" (2026-11-27)
- 2026-11-27 · PER_009 · Alucinación Refleja: "Alucinación Refleja" — en español solo la primera palabra — decisión: Normalizado a "Alucinación refleja" (2026-11-27)
- 2026-11-27 · PER_008 · Alucinación Funcional: "Alucinación Funcional" — en español solo la primera palabra — decisión: Normalizado a "Alucinación funcional" (2026-11-27)
- 2026-11-27 · PER_007 · Alucinación Extracampina: "Alucinación Extracampina" — en español solo la primera palabra — decisión: Normalizado a "Alucinación extracampina" (2026-11-27)
- 2026-11-27 · NEG_003 · Deterioro o Descuido Grave del Autocuidado / Higiene (Síndrome Negativo / Defecto): "Deterioro o Descuido Grave del Autocuidado / Higiene (Síndrome Negativo / Defecto)" — en español solo la primera palabra — decisión: Normalizado a "Deterioro o descuido grave del autocuidado/higiene (síndrome negativo/defecto)" (2026-11-27)
- 2026-11-27 · NEG_001 · Aislamiento / Retraimiento Social (Social Withdrawal / Asociality): "Aislamiento / Retraimiento Social (Social Withdrawal / Asociality)" — en español solo la primera palabra — decisión: Normalizado a "Aislamiento/retraimiento social (social withdrawal/asociality)" (2026-11-27)
- 2026-11-27 · COG_005 · Pensamiento Abstracto / Concreto: "Pensamiento Abstracto / Concreto" — en español solo la primera palabra — decisión: Normalizado a "Pensamiento abstracto/concreto" (2026-11-27)
- 2026-11-27 · CNS_004 · Estados Oniroides o de Trastorno Hipnagógico patológico: "Estados Oniroides o de Trastorno Hipnagógico patológico" — en español solo la primera palabra — decisión: Normalizado a "Estados oniroides o de trastorno hipnagógico patológico" (2026-11-27)
