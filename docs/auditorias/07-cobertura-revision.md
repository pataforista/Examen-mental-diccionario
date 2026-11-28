# Auditoría: Cobertura de la revisión clínica

> Generado con `npm run lexicon:audit` el 2026-11-28. La tabla se regenera con los datos actuales; **lo que escribas en «Decisión» se conserva**. Al corregirse, un caso pasa a «Resueltos» con su decisión.

## Qué revisa

Qué términos tienen revisión clínica firmada y vigente (`npm run term:review`).

## Por qué importa

La ficha solo muestra «Revisado clínicamente» cuando la revisión está vigente. Sin cobertura, el diccionario no puede presentarse como contenido revisado.

## Cómo decidir

- Sigue el orden de prioridad de la guía de revisión (`docs/GUIA_REVISION_CLINICA.md`): primero riesgo alto, luego los términos con avisos.
- Una revisión **desactualizada** significa que el contenido cambió después de firmarse: vuelve a leer el término y firma de nuevo.

## Cómo corregir

`npm run term:review -- ID… --por "Nombre"`.

Después de corregir: `npm run build:lexicon`, `npm test` y vuelve a generar esta auditoría.

## Casos pendientes (294)

### Riesgo alto (≥3) (16)

| Término o campo | Hallazgo | Decisión |
|---|---|---|
| AFF_023 · Ira <!-- k:c407e5267b --> | Sin revisar · riesgo 3/5 |  |
| CAT_001 · Catatonia maligna <!-- k:9b45f2ecd4 --> | Sin revisar · riesgo 5/5 |  |
| CAT_002 · Estupor catatónico <!-- k:ae1ea488d2 --> | Sin revisar · riesgo 3/5 |  |
| CNS_002 · Coma <!-- k:ddcdf70003 --> | Sin revisar · riesgo 5/5 |  |
| MEM_011 · Delirium <!-- k:f1e12d1a15 --> | Sin revisar · riesgo 3/5 |  |
| MEM_025 · Sopor <!-- k:c0f200c10a --> | Sin revisar · riesgo 4/5 |  |
| RSK_001 · Riesgo autolítico (general) <!-- k:b567634449 --> | Sin revisar · riesgo 3/5 |  |
| RSK_002 · Acceso a medios letales <!-- k:a71b61c545 --> | Sin revisar · riesgo 5/5 |  |
| RSK_003 · Autolesión no suicida (NSSI) <!-- k:b25ca2bbd5 --> | Sin revisar · riesgo 3/5 |  |
| RSK_004 · Capacidad de colaboración para seguridad <!-- k:b7f501ce19 --> | Sin revisar · riesgo 4/5 |  |
| RSK_005 · Conducta suicida preparatoria <!-- k:5f4ed4651b --> | Sin revisar · riesgo 4/5 |  |
| RSK_006 · Ideación suicida <!-- k:77ec02a407 --> | Sin revisar · riesgo 3/5 |  |
| RSK_007 · Intento suicida <!-- k:d084951355 --> | Sin revisar · riesgo 5/5 |  |
| RSK_008 · Riesgo de violencia hacia otros <!-- k:a1d329a485 --> | Sin revisar · riesgo 5/5 |  |
| SER_001 · Síndrome serotoninérgico <!-- k:e1e7ce6008 --> | Sin revisar · riesgo 5/5 |  |
| SNM_001 · Síndrome neuroléptico maligno <!-- k:da9f4c3073 --> | Sin revisar · riesgo 5/5 |  |

### Resto (278)

| Término o campo | Hallazgo | Decisión |
|---|---|---|
| AFF_001 · Afecto constreñido <!-- k:4117b5f7ea --> | Sin revisar · riesgo 1/5 |  |
| AFF_002 · Alexitimia <!-- k:ef186bd271 --> | Sin revisar · riesgo 1/5 |  |
| AFF_003 · Ambivalencia <!-- k:b81376097b --> | Sin revisar · riesgo 1/5 |  |
| AFF_005 · Angustia <!-- k:9b6338d138 --> | Sin revisar · riesgo 2/5 |  |
| AFF_006 · Anhedonia <!-- k:c104e37b60 --> | Sin revisar · riesgo 1/5 |  |
| AFF_007 · Ansiedad <!-- k:ce3d2be1b4 --> | Sin revisar · riesgo 1/5 |  |
| AFF_008 · Ansiedad afectiva <!-- k:8e3186299d --> | Sin revisar · riesgo 1/5 |  |
| AFF_009 · Apatía <!-- k:ed8070236c --> | Sin revisar · riesgo 1/5 |  |
| AFF_010 · Aplanamiento afectivo <!-- k:de4ee7cb52 --> | Sin revisar · riesgo 1/5 |  |
| AFF_011 · Atimia <!-- k:b366361ef7 --> | Sin revisar · riesgo 2/5 |  |
| AFF_012 · Culpa patológica <!-- k:58a209495f --> | Sin revisar · riesgo 2/5 |  |
| AFF_013 · Depresión <!-- k:d56d7b788b --> | Sin revisar · riesgo 2/5 |  |
| AFF_014 · Disforia <!-- k:14436075fc --> | Sin revisar · riesgo 1/5 |  |
| AFF_015 · Embotamiento afectivo <!-- k:bf8e6ed83d --> | Sin revisar · riesgo 1/5 |  |
| AFF_016 · Euforia <!-- k:7500670fce --> | Sin revisar · riesgo 1/5 |  |
| AFF_017 · Eutimia <!-- k:3b86c9f0be --> | Sin revisar · riesgo 0/5 |  |
| AFF_018 · Fatiga emocional <!-- k:4fe538e73c --> | Sin revisar · riesgo 1/5 |  |
| AFF_019 · Hipomanía <!-- k:eee5767ccd --> | Sin revisar · riesgo 1/5 |  |
| AFF_020 · Hipotimia <!-- k:733ac095b0 --> | Sin revisar · riesgo 1/5 |  |
| AFF_021 · Incongruencia afectiva <!-- k:1b691a1468 --> | Sin revisar · riesgo 1/5 |  |
| AFF_022 · Incontinencia afectiva <!-- k:ac1bb7ef65 --> | Sin revisar · riesgo 1/5 |  |
| AFF_024 · Irritabilidad <!-- k:d3d5766b92 --> | Sin revisar · riesgo 1/5 |  |
| AFF_025 · Labilidad afectiva <!-- k:cb7cd5a08c --> | Sin revisar · riesgo 1/5 |  |
| AFF_026 · Llaneza afectiva <!-- k:a2634253ee --> | Sin revisar · riesgo 0/5 |  |
| AFF_027 · Manía <!-- k:0f54872df0 --> | Sin revisar · riesgo 2/5 |  |
| AFF_028 · Miedo <!-- k:90b6de6dc1 --> | Sin revisar · riesgo 1/5 |  |
| AFF_030 · Perplejidad <!-- k:6cf8826fb9 --> | Sin revisar · riesgo 1/5 |  |
| AFF_031 · Pánico <!-- k:de69348245 --> | Sin revisar · riesgo 2/5 |  |
| AFF_032 · Raptus <!-- k:090ed5c52d --> | Sin revisar · riesgo 2/5 |  |
| AFF_033 · Rigidez afectiva <!-- k:3916c3636b --> | Sin revisar · riesgo 1/5 |  |
| AFF_034 · Sentimientos impuestos <!-- k:5965729266 --> | Sin revisar · riesgo 2/5 |  |
| AFF_035 · Ánimo depresivo <!-- k:31774958e6 --> | Sin revisar · riesgo 1/5 |  |
| AFF_036 · Ánimo elevado <!-- k:c1ff91dd59 --> | Sin revisar · riesgo 1/5 |  |
| AKT_001 · Acatisia <!-- k:7ca2224596 --> | Sin revisar · riesgo 2/5 |  |
| APP_001 · Actitud hacia el entrevistador <!-- k:99d99bc01c --> | Sin revisar · riesgo 0/5 |  |
| APP_002 · Aliño e higiene <!-- k:2488f866f4 --> | Sin revisar · riesgo 0/5 |  |
| APP_003 · Contacto visual <!-- k:4bbd57e24d --> | Sin revisar · riesgo 0/5 |  |
| APP_004 · Facies y mímica <!-- k:8fb0a1565c --> | Sin revisar · riesgo 0/5 |  |
| ARC_001 · Ambitendencia <!-- k:f53b01f4f4 --> | Sin revisar · riesgo 0/5 |  |
| ARC_002 · Amentia <!-- k:a208069d37 --> | Sin revisar · riesgo 2/5 |  |
| ARC_003 · Bouffée délirante <!-- k:cc3de57bd7 --> | Sin revisar · riesgo 1/5 |  |
| ARC_004 · Degeneracionismo <!-- k:630f6d9cb0 --> | Sin revisar · riesgo 0/5 |  |
| ARC_006 · Dementia praecox <!-- k:13e90dfacb --> | Sin revisar · riesgo 0/5 |  |
| ARC_007 · Ecmnesia <!-- k:b161a01ccc --> | Sin revisar · riesgo 1/5 |  |
| ARC_008 · Hipermnesia <!-- k:3e6de6b64c --> | Sin revisar · riesgo 0/5 |  |
| ARC_009 · Histeria <!-- k:c2680f7e83 --> | Sin revisar · riesgo 1/5 |  |
| ARC_011 · Locura circular <!-- k:7c3f239747 --> | Sin revisar · riesgo 0/5 |  |
| ARC_012 · Locura de la duda <!-- k:04b63cf14c --> | Sin revisar · riesgo 1/5 |  |
| ARC_013 · Lypemanía <!-- k:69d0a0ff4d --> | Sin revisar · riesgo 0/5 |  |
| ARC_014 · Manía sin delirio <!-- k:7bfbbfc681 --> | Sin revisar · riesgo 2/5 |  |
| ARC_015 · Monomanía <!-- k:16f6dd668d --> | Sin revisar · riesgo 1/5 |  |
| ARC_016 · Neurastenia <!-- k:0ead30fec8 --> | Sin revisar · riesgo 0/5 |  |
| ARC_017 · Parafrenia <!-- k:aad7840481 --> | Sin revisar · riesgo 2/5 |  |
| ARC_018 · Paranoia querulans <!-- k:3c54f9a7b8 --> | Sin revisar · riesgo 1/5 |  |
| ARC_019 · Psicastenia <!-- k:be3a42a13b --> | Sin revisar · riesgo 1/5 |  |
| ARC_020 · Wahnstimmung <!-- k:2026df7a38 --> | Sin revisar · riesgo 2/5 |  |
| ARC_021 · Psicosis maníaco-depresiva <!-- k:ffb3688a65 --> | Sin revisar · riesgo 0/5 |  |
| CAT_003 · Mitmachen y Mitgehen <!-- k:2192692fa0 --> | Sin revisar · riesgo 2/5 |  |
| CAT_004 · Mutismo catatónico <!-- k:febcb8c9c3 --> | Sin revisar · riesgo 2/5 |  |
| CAT_005 · Obediencia automática <!-- k:1f5ea09541 --> | Sin revisar · riesgo 2/5 |  |
| CNS_001 · Anergia <!-- k:3eb6e9d50a --> | Sin revisar · riesgo 1/5 |  |
| CNS_003 · Estado crepuscular <!-- k:4c5727ad45 --> | Sin revisar · riesgo 2/5 |  |
| CNS_004 · Estados oniroides o de trastorno hipnagógico patológico <!-- k:6e74c3e3c3 --> | Sin revisar · riesgo 1/5 |  |
| CNS_005 · Estupor psiquiátrico <!-- k:37029bfd2a --> | Sin revisar · riesgo 2/5 |  |
| CNS_006 · Lentitud del Pensamiento (Bradipsiquia) <!-- k:8e73edfc48 --> | Sin revisar · riesgo 1/5 |  |
| CNS_007 · Letargo <!-- k:29fdf8b7e0 --> | Sin revisar · riesgo 1/5 |  |
| CNS_008 · Moria <!-- k:45724a902e --> | Sin revisar · riesgo 1/5 |  |
| CNS_009 · Síncope <!-- k:ffbc5d05ad --> | Sin revisar · riesgo 2/5 |  |
| CNS_010 · Trance <!-- k:4e04167687 --> | Sin revisar · riesgo 0/5 |  |
| CNT_001 · Idea sobrevalorada <!-- k:a498fe403b --> | Sin revisar · riesgo 0/5 |  |
| CNT_002 · Obsesión <!-- k:4f2a1518a1 --> | Sin revisar · riesgo 0/5 |  |
| COG_001 · Atención y concentración <!-- k:0fa1c3f5ec --> | Sin revisar · riesgo 1/5 |  |
| COG_002 · Confabulación <!-- k:d3e90fa4ed --> | Sin revisar · riesgo 1/5 |  |
| COG_003 · Memoria de trabajo <!-- k:3860fbbe2c --> | Sin revisar · riesgo 1/5 |  |
| COG_004 · Orientación <!-- k:e60229bb37 --> | Sin revisar · riesgo 1/5 |  |
| COG_005 · Pensamiento abstracto/concreto <!-- k:786c04c56c --> | Sin revisar · riesgo 1/5 |  |
| COG_006 · Déficit intelectual <!-- k:b6d5588a70 --> | Sin revisar · riesgo 1/5 |  |
| DEL_001 · Apofanía <!-- k:5ba319a441 --> | Sin revisar · riesgo 0/5 |  |
| DEL_002 · BLIPS <!-- k:9b17780fc0 --> | Sin revisar · riesgo 0/5 |  |
| DEL_003 · Celotipia (Síndrome de Otelo) <!-- k:a53d276f4d --> | Sin revisar · riesgo 0/5 |  |
| DEL_004 · Cristalización delirante <!-- k:0d3197806d --> | Sin revisar · riesgo 0/5 |  |
| DEL_005 · Delirio de infestación (Ekbom) <!-- k:add282c233 --> | Sin revisar · riesgo 0/5 |  |
| DEL_006 · Delirio de ruina/pobreza <!-- k:a8be840fa3 --> | Sin revisar · riesgo 0/5 |  |
| DEL_007 · Delirio grandioso <!-- k:367f5ba439 --> | Sin revisar · riesgo 0/5 |  |
| DEL_008 · Delirio místico-religioso de mandato <!-- k:72c94f6b20 --> | Sin revisar · riesgo 0/5 |  |
| DEL_009 · Delirio persecutorio <!-- k:de93861a81 --> | Sin revisar · riesgo 2/5 |  |
| DEL_010 · Delirio primario (Jaspers) <!-- k:85edbe7879 --> | Sin revisar · riesgo 0/5 |  |
| DEL_011 · Delirio primario (autóctono) <!-- k:8cf3053229 --> | Sin revisar · riesgo 0/5 |  |
| DEL_012 · Delirio querulante <!-- k:b65a07ffe2 --> | Sin revisar · riesgo 0/5 |  |
| DEL_013 · Delirio referencial <!-- k:38d9d4af1e --> | Sin revisar · riesgo 0/5 |  |
| DEL_014 · Delirio somático monotemático <!-- k:153c2e6cd9 --> | Sin revisar · riesgo 0/5 |  |
| DEL_015 · Difusión del pensamiento <!-- k:cdd9dacdec --> | Sin revisar · riesgo 0/5 |  |
| DEL_016 · Erotomanía (Síndrome de Clérambault) <!-- k:4bb0b7268a --> | Sin revisar · riesgo 0/5 |  |
| DEL_017 · Fenómenos de pasividad <!-- k:cfbf548b56 --> | Sin revisar · riesgo 0/5 |  |
| DEL_018 · Humor delirante (Wahnstimmung) <!-- k:8cf07618a1 --> | Sin revisar · riesgo 0/5 |  |
| DEL_019 · Idea delirante de culpa <!-- k:82f516f45d --> | Sin revisar · riesgo 2/5 |  |
| DEL_020 · Ideas de referencia <!-- k:0ac3ccc741 --> | Sin revisar · riesgo 0/5 |  |
| DEL_021 · Ideas sobrevaloradas <!-- k:aae8dd2ea0 --> | Sin revisar · riesgo 0/5 |  |
| DEL_022 · Inserción del pensamiento <!-- k:0322708b9d --> | Sin revisar · riesgo 0/5 |  |
| DEL_023 · Intermetamorfosis <!-- k:4827ce32e0 --> | Sin revisar · riesgo 0/5 |  |
| DEL_024 · Interpretación delirante <!-- k:7628c2a729 --> | Sin revisar · riesgo 0/5 |  |
| DEL_025 · Perplejidad delirante <!-- k:3179bdf716 --> | Sin revisar · riesgo 0/5 |  |
| DEL_026 · Revelación delirante (intuición delirante) <!-- k:f737940119 --> | Sin revisar · riesgo 0/5 |  |
| DEL_027 · Robo del pensamiento <!-- k:8e6365f76d --> | Sin revisar · riesgo 0/5 |  |
| DEL_028 · Síndrome de Capgras <!-- k:c7ef0dccbb --> | Sin revisar · riesgo 0/5 |  |
| DEL_029 · Síndrome de Cotard <!-- k:bcfb46e1ad --> | Sin revisar · riesgo 0/5 |  |
| DEL_030 · Síndrome de Fregoli <!-- k:3454eb9efc --> | Sin revisar · riesgo 0/5 |  |
| DEL_031 · Síntomas positivos atenuados <!-- k:d8c249de27 --> | Sin revisar · riesgo 0/5 |  |
| HIS_001 · Folie à deux <!-- k:f58f21e53c --> | Sin revisar · riesgo 2/5 |  |
| HIS_002 · Moral insanity <!-- k:d2c1433289 --> | Sin revisar · riesgo 0/5 |  |
| HIS_003 · Dipsomanía <!-- k:56811e01b3 --> | Sin revisar · riesgo 0/5 |  |
| HIS_004 · Poriomanía <!-- k:6b7ec4db2f --> | Sin revisar · riesgo 0/5 |  |
| HIS_005 · Nimfomanía / Satiriasis <!-- k:7b7c9fb6b8 --> | Sin revisar · riesgo 0/5 |  |
| HIS_006 · Furor uterino <!-- k:e122135649 --> | Sin revisar · riesgo 0/5 |  |
| HIS_007 · Locura lúcida <!-- k:c2dfbc2417 --> | Sin revisar · riesgo 0/5 |  |
| HIS_008 · Esquizofrenia simple (concepto histórico) <!-- k:53b5683438 --> | Sin revisar · riesgo 0/5 |  |
| HIS_009 · Psicosis tóxica <!-- k:7ffb484902 --> | Sin revisar · riesgo 0/5 |  |
| HIS_010 · Neurosis de angustia <!-- k:37170c5ab5 --> | Sin revisar · riesgo 0/5 |  |
| INS_001 · Anosognosia <!-- k:25af651e0e --> | Sin revisar · riesgo 2/5 |  |
| INS_002 · Ausencia de insight psiquiátrico <!-- k:9812969942 --> | Sin revisar · riesgo 2/5 |  |
| INS_003 · Egocintonía <!-- k:741fac4e23 --> | Sin revisar · riesgo 0/5 |  |
| INS_004 · Egodistonía <!-- k:0c949f009d --> | Sin revisar · riesgo 0/5 |  |
| INS_005 · Insight completo <!-- k:6d3a516b35 --> | Sin revisar · riesgo 0/5 |  |
| INS_006 · Insight emocional <!-- k:d780cb37eb --> | Sin revisar · riesgo 0/5 |  |
| INS_007 · Insight intelectual <!-- k:213d6699c6 --> | Sin revisar · riesgo 1/5 |  |
| INS_008 · Insight nulo <!-- k:e22eb01088 --> | Sin revisar · riesgo 1/5 |  |
| INS_009 · Insight parcial <!-- k:16cfe36983 --> | Sin revisar · riesgo 1/5 |  |
| INS_010 · Noesis de recuperación <!-- k:b555051ddb --> | Sin revisar · riesgo 1/5 |  |
| JUD_001 · Juicio <!-- k:4c0e408d7b --> | Sin revisar · riesgo 1/5 |  |
| JUD_002 · Juicio de Realidad <!-- k:1e3e04518e --> | Sin revisar · riesgo 1/5 |  |
| MEM_001 · Alteración de conciencia <!-- k:ebbdf5e318 --> | Sin revisar · riesgo 0/5 |  |
| MEM_002 · Amnesia anterógrada <!-- k:7dffc13725 --> | Sin revisar · riesgo 1/5 |  |
| MEM_003 · Amnesia anterógrada disociativa <!-- k:bfd84cf42e --> | Sin revisar · riesgo 1/5 |  |
| MEM_004 · Amnesia disociativa <!-- k:c3ab92e0dc --> | Sin revisar · riesgo 0/5 |  |
| MEM_005 · Amnesia global transitoria <!-- k:ed9eb51346 --> | Sin revisar · riesgo 1/5 |  |
| MEM_006 · Amnesia psicógena <!-- k:bc83503208 --> | Sin revisar · riesgo 1/5 |  |
| MEM_007 · Amnesia retrógrada <!-- k:cf3ef8c5b5 --> | Sin revisar · riesgo 1/5 |  |
| MEM_008 · Confabulación espontánea <!-- k:ab18839cdc --> | Sin revisar · riesgo 1/5 |  |
| MEM_009 · Confabulación provocada <!-- k:014f6b3a8a --> | Sin revisar · riesgo 0/5 |  |
| MEM_010 · Criptomnesia <!-- k:4144658e5e --> | Sin revisar · riesgo 0/5 |  |
| MEM_012 · Déjà senti <!-- k:38687148df --> | Sin revisar · riesgo 0/5 |  |
| MEM_013 · Déjà vu <!-- k:4f77756f74 --> | Sin revisar · riesgo 0/5 |  |
| MEM_014 · Déjà vu / Jamais vu <!-- k:b86acef2b6 --> | Sin revisar · riesgo 0/5 |  |
| MEM_015 · Estado confusional <!-- k:a698c23ece --> | Sin revisar · riesgo 1/5 |  |
| MEM_016 · Fuga <!-- k:09697abee8 --> | Sin revisar · riesgo 2/5 |  |
| MEM_017 · Fuga disociativa <!-- k:987fe49306 --> | Sin revisar · riesgo 2/5 |  |
| MEM_018 · Inatención <!-- k:5f26d05bdf --> | Sin revisar · riesgo 0/5 |  |
| MEM_019 · Jamais vu <!-- k:5d7c21932a --> | Sin revisar · riesgo 0/5 |  |
| MEM_020 · Memoria dependiente del estado <!-- k:94c47e918f --> | Sin revisar · riesgo 0/5 |  |
| MEM_021 · Obnubilación <!-- k:db1c1bad25 --> | Sin revisar · riesgo 1/5 |  |
| MEM_022 · Onirismo <!-- k:5d28765a54 --> | Sin revisar · riesgo 2/5 |  |
| MEM_023 · Paramnesia reduplicativa <!-- k:fc44672a1f --> | Sin revisar · riesgo 1/5 |  |
| MEM_024 · Presque vu patológico <!-- k:c84f98e8a8 --> | Sin revisar · riesgo 0/5 |  |
| MEM_026 · Síndrome de Korsakoff <!-- k:0572898bec --> | Sin revisar · riesgo 2/5 |  |
| MEM_027 · Hipermnesia traumática <!-- k:34d040c986 --> | Sin revisar · riesgo 2/5 |  |
| MEM_028 · Paramnesia del espejo <!-- k:baa562327d --> | Sin revisar · riesgo 1/5 |  |
| MOT_001 · Apraxia constructiva <!-- k:6a26bfe561 --> | Sin revisar · riesgo 0/5 |  |
| MOT_002 · Apraxia ideacional <!-- k:abb63f44e4 --> | Sin revisar · riesgo 0/5 |  |
| MOT_003 · Apraxia ideomotora <!-- k:4ce05bc465 --> | Sin revisar · riesgo 0/5 |  |
| MOT_004 · Catalepsia <!-- k:f7d472dd0c --> | Sin revisar · riesgo 1/5 |  |
| MOT_005 · Discinesia <!-- k:0f7dbd1c58 --> | Sin revisar · riesgo 1/5 |  |
| MOT_006 · Distonía aguda <!-- k:798b893c49 --> | Sin revisar · riesgo 1/5 |  |
| MOT_007 · Estereotipia <!-- k:7bc01baaf2 --> | Sin revisar · riesgo 0/5 |  |
| MOT_008 · Manierismos <!-- k:6538f93c0a --> | Sin revisar · riesgo 0/5 |  |
| MOT_009 · Mitgehen <!-- k:fe4ef9735c --> | Sin revisar · riesgo 0/5 |  |
| MOT_010 · Tics <!-- k:be22332221 --> | Sin revisar · riesgo 0/5 |  |
| NEG_001 · Aislamiento/retraimiento social (social withdrawal/asociality) <!-- k:880663cce8 --> | Sin revisar · riesgo 1/5 |  |
| NEG_002 · Alogia <!-- k:30b70b035d --> | Sin revisar · riesgo 2/5 |  |
| NEG_003 · Deterioro o descuido grave del autocuidado/higiene (síndrome negativo/defecto) <!-- k:24779a0347 --> | Sin revisar · riesgo 2/5 |  |
| NEU_001 · Agnosia visual <!-- k:cc1c4fdb74 --> | Sin revisar · riesgo 1/5 |  |
| NEU_002 · Prosopagnosia <!-- k:5ca1a04e37 --> | Sin revisar · riesgo 1/5 |  |
| NEU_003 · Síndrome de Charles Bonnet <!-- k:4c44181ccb --> | Sin revisar · riesgo 1/5 |  |
| NEU_004 · Alucinosis peduncular <!-- k:789a9f7df2 --> | Sin revisar · riesgo 1/5 |  |
| NEU_005 · Síndrome de la mano alienígena <!-- k:2ecb825580 --> | Sin revisar · riesgo 1/5 |  |
| NEU_006 · Comportamiento de utilización <!-- k:4863a8aab7 --> | Sin revisar · riesgo 1/5 |  |
| NEU_007 · Paratonía (Gegenhalten) <!-- k:4028e799fe --> | Sin revisar · riesgo 1/5 |  |
| NSC_001 · Saliencia aberrante <!-- k:dff876eea6 --> | Sin revisar · riesgo 2/5 |  |
| NSC_002 · Metacognición <!-- k:aaa6d770c5 --> | Sin revisar · riesgo 0/5 |  |
| NSC_003 · Anomalía del sentido de agencia <!-- k:83786fc150 --> | Sin revisar · riesgo 1/5 |  |
| PER_001 · Acoasmas <!-- k:94f44a399b --> | Sin revisar · riesgo 0/5 |  |
| PER_002 · Alucinaciones auditivas comentadoras <!-- k:2f6673983d --> | Sin revisar · riesgo 0/5 |  |
| PER_003 · Alucinaciones auditivas dialogantes <!-- k:08e55339be --> | Sin revisar · riesgo 0/5 |  |
| PER_004 · Alucinaciones cenestésicas <!-- k:0383da77e5 --> | Sin revisar · riesgo 0/5 |  |
| PER_005 · Alucinaciones hipnagógicas <!-- k:6a65de3a28 --> | Sin revisar · riesgo 0/5 |  |
| PER_006 · Alucinaciones hipnopómpicas <!-- k:28915d898d --> | Sin revisar · riesgo 0/5 |  |
| PER_007 · Alucinación extracampina <!-- k:7c583f9409 --> | Sin revisar · riesgo 1/5 |  |
| PER_008 · Alucinación funcional <!-- k:e00fd0c884 --> | Sin revisar · riesgo 1/5 |  |
| PER_009 · Alucinación refleja <!-- k:980ef7fe39 --> | Sin revisar · riesgo 1/5 |  |
| PER_010 · Alucinación verdadera <!-- k:a2c13de2be --> | Sin revisar · riesgo 2/5 |  |
| PER_011 · Alucinosis <!-- k:781040d721 --> | Sin revisar · riesgo 1/5 |  |
| PER_012 · Distorsión perceptiva visual <!-- k:840b454462 --> | Sin revisar · riesgo 1/5 |  |
| PER_013 · Flashback <!-- k:c32d3d48ed --> | Sin revisar · riesgo 2/5 |  |
| PER_014 · Ilusión <!-- k:679181ad20 --> | Sin revisar · riesgo 0/5 |  |
| PER_015 · Imagen eidética <!-- k:eb6a1f3f97 --> | Sin revisar · riesgo 0/5 |  |
| PER_016 · Macropsia <!-- k:441229b460 --> | Sin revisar · riesgo 0/5 |  |
| PER_017 · Metamorfopsia <!-- k:d4a861c6a5 --> | Sin revisar · riesgo 0/5 |  |
| PER_018 · Micropsia <!-- k:bc1109da23 --> | Sin revisar · riesgo 0/5 |  |
| PER_019 · Palinopsia <!-- k:ba5096d35a --> | Sin revisar · riesgo 0/5 |  |
| PER_020 · Pareidolia <!-- k:b8b7719e6e --> | Sin revisar · riesgo 0/5 |  |
| PER_021 · Pseudoalucinación <!-- k:ae68576beb --> | Sin revisar · riesgo 1/5 |  |
| PER_022 · Sentido de Presencia <!-- k:2d99d6ad2c --> | Sin revisar · riesgo 1/5 |  |
| PER_023 · Sonorización del pensamiento (Gedankenlautwerden) <!-- k:87e51b33cf --> | Sin revisar · riesgo 0/5 |  |
| PHM_001 · Alteración del campo de conciencia (EASE) <!-- k:8d1bb3a650 --> | Sin revisar · riesgo 1/5 |  |
| PHM_002 · Rapto de atención (EASE) <!-- k:d4feaca43d --> | Sin revisar · riesgo 1/5 |  |
| PHM_003 · Pérdida de la perspectiva (EASE) <!-- k:da0f6d4ce3 --> | Sin revisar · riesgo 1/5 |  |
| PHM_004 · Anomalías de la vivencia del tiempo <!-- k:426b5d7ceb --> | Sin revisar · riesgo 1/5 |  |
| PHM_005 · Déficit metacognitivo <!-- k:51f03d5c3d --> | Sin revisar · riesgo 1/5 |  |
| PHM_006 · Alteración de la teoría de la mente <!-- k:27a14c553e --> | Sin revisar · riesgo 1/5 |  |
| PHM_007 · Interocepción aberrante <!-- k:564b665a47 --> | Sin revisar · riesgo 1/5 |  |
| PHM_008 · Anomalías del sentido de pertenencia <!-- k:114c194a49 --> | Sin revisar · riesgo 1/5 |  |
| SELF_001 · Actos impuestos (pasividad volitiva) <!-- k:9a5b3ea532 --> | Sin revisar · riesgo 2/5 |  |
| SELF_002 · Anosognosia cognitiva <!-- k:1292848f99 --> | Sin revisar · riesgo 1/5 |  |
| SELF_003 · Anosognosia psicótica <!-- k:34435ac173 --> | Sin revisar · riesgo 2/5 |  |
| SELF_004 · Autoscopia <!-- k:03272a99a1 --> | Sin revisar · riesgo 0/5 |  |
| SELF_005 · Despersonalización <!-- k:f25bdecb4b --> | Sin revisar · riesgo 1/5 |  |
| SELF_006 · Desrealización <!-- k:1084c17bc9 --> | Sin revisar · riesgo 1/5 |  |
| SELF_007 · Disminución de la autoafección <!-- k:a5af6c454c --> | Sin revisar · riesgo 0/5 |  |
| SELF_008 · Hiperreflexividad <!-- k:9921f04488 --> | Sin revisar · riesgo 0/5 |  |
| SELF_009 · Impulsos impuestos <!-- k:c8b593303d --> | Sin revisar · riesgo 1/5 |  |
| SELF_010 · Pérdida de la evidencia natural <!-- k:b1767ead81 --> | Sin revisar · riesgo 0/5 |  |
| SELF_011 · Transitivismo <!-- k:d455d87df0 --> | Sin revisar · riesgo 1/5 |  |
| SOM_001 · Dismorfofobia <!-- k:8f9486d650 --> | Sin revisar · riesgo 2/5 |  |
| SOM_002 · Hipocondría <!-- k:67f8241850 --> | Sin revisar · riesgo 1/5 |  |
| SPE_001 · Aprosodia <!-- k:7bad45b75b --> | Sin revisar · riesgo 0/5 |  |
| SPE_002 · Disartria <!-- k:8eabdd561e --> | Sin revisar · riesgo 1/5 |  |
| SPE_003 · Ecolalia <!-- k:289469647a --> | Sin revisar · riesgo 0/5 |  |
| SPE_004 · Latencia de respuesta aumentada <!-- k:dece11a8c8 --> | Sin revisar · riesgo 0/5 |  |
| SPE_005 · Logoclonia <!-- k:1468c6a7af --> | Sin revisar · riesgo 0/5 |  |
| SPE_006 · Logorrea <!-- k:357ae9366a --> | Sin revisar · riesgo 0/5 |  |
| SPE_007 · Mutismo <!-- k:3bb8f11eb2 --> | Sin revisar · riesgo 2/5 |  |
| SPE_008 · Palilalia <!-- k:d82a6491c2 --> | Sin revisar · riesgo 0/5 |  |
| SPE_009 · Pararrespuestas (Vorbeireden) <!-- k:3eb7f2b23d --> | Sin revisar · riesgo 0/5 |  |
| SPE_010 · Presión de habla <!-- k:09a9af6779 --> | Sin revisar · riesgo 0/5 |  |
| SPE_011 · Verbigeración <!-- k:1c220dd275 --> | Sin revisar · riesgo 0/5 |  |
| SPE_012 · Afasia <!-- k:d5fa9cd70b --> | Sin revisar · riesgo 1/5 |  |
| TALD_001 · Bloqueo <!-- k:9d48e899cd --> | Sin revisar · riesgo 2/5 |  |
| TALD_002 · Concretismo <!-- k:a676b56a8e --> | Sin revisar · riesgo 1/5 |  |
| TALD_003 · Descarrilamiento <!-- k:e1cff2b7ba --> | Sin revisar · riesgo 1/5 |  |
| TALD_004 · Disfunción expresiva del lenguaje <!-- k:1b11a7e9ae --> | Sin revisar · riesgo 2/5 |  |
| TALD_005 · Disfunción receptiva del lenguaje <!-- k:a646ac35d4 --> | Sin revisar · riesgo 2/5 |  |
| TALD_006 · Disfunción de la iniciativa e intencionalidad <!-- k:e1eabfc46d --> | Sin revisar · riesgo 2/5 |  |
| TALD_007 · Disociación del Pensamiento <!-- k:105adad7be --> | Sin revisar · riesgo 1/5 |  |
| TALD_008 · Glosomanía / Clanging <!-- k:a38622dd18 --> | Sin revisar · riesgo 1/5 |  |
| TALD_009 · Habla manierista <!-- k:f0587a3025 --> | Sin revisar · riesgo 1/5 |  |
| TALD_010 · Habla presionada <!-- k:10ad04f2ef --> | Sin revisar · riesgo 1/5 |  |
| TALD_011 · Interferencia del Pensamiento <!-- k:42a36f4187 --> | Sin revisar · riesgo 2/5 |  |
| TALD_012 · Neologismos <!-- k:fcc4f8e080 --> | Sin revisar · riesgo 1/5 |  |
| TALD_013 · Para-respuesta / Crosstalk <!-- k:fbbec73940 --> | Sin revisar · riesgo 1/5 |  |
| TALD_014 · Parafasia fonémica <!-- k:377d2dae2b --> | Sin revisar · riesgo 1/5 |  |
| TALD_015 · Parafasia semántica <!-- k:68471df421 --> | Sin revisar · riesgo 1/5 |  |
| TALD_016 · Pensamiento enlentecido <!-- k:6ce8f09b25 --> | Sin revisar · riesgo 1/5 |  |
| TALD_017 · Pensamiento inhibido <!-- k:870019b193 --> | Sin revisar · riesgo 2/5 |  |
| TALD_018 · Pensamiento restringido <!-- k:d3cf4cb40a --> | Sin revisar · riesgo 1/5 |  |
| TALD_019 · Pobreza de Contenido del Habla <!-- k:9e0063d86f --> | Sin revisar · riesgo 1/5 |  |
| TALD_020 · Pobreza de Pensamiento <!-- k:90d14364d5 --> | Sin revisar · riesgo 2/5 |  |
| TALD_021 · Pobreza del Habla <!-- k:70547a28e7 --> | Sin revisar · riesgo 1/5 |  |
| TALD_022 · Presión/Agalopamiento de Ideas <!-- k:4c9175632b --> | Sin revisar · riesgo 2/5 |  |
| TALD_023 · Rumiación <!-- k:b7046baf19 --> | Sin revisar · riesgo 2/5 |  |
| TALD_024 · Ruptura del Pensamiento <!-- k:6051c0a601 --> | Sin revisar · riesgo 1/5 |  |
| THO_001 · Asociaciones laxas <!-- k:5a92c2ec0a --> | Sin revisar · riesgo 0/5 |  |
| THO_002 · Asociación por consonancia (clang) <!-- k:5f6c7afe07 --> | Sin revisar · riesgo 0/5 |  |
| THO_003 · Bloqueo del pensamiento <!-- k:ee3fcb0132 --> | Sin revisar · riesgo 0/5 |  |
| THO_004 · Circunstancialidad <!-- k:d30bc4f0f2 --> | Sin revisar · riesgo 0/5 |  |
| THO_005 · Ensalada de palabras <!-- k:6a57d0df08 --> | Sin revisar · riesgo 0/5 |  |
| THO_006 · Fuga de ideas <!-- k:864957d904 --> | Sin revisar · riesgo 0/5 |  |
| THO_007 · Incoherencia <!-- k:6892fc0367 --> | Sin revisar · riesgo 2/5 |  |
| THO_008 · Paralogia <!-- k:afdacfe527 --> | Sin revisar · riesgo 1/5 |  |
| THO_009 · Perseveración <!-- k:ab491aa618 --> | Sin revisar · riesgo 0/5 |  |
| THO_010 · Tangencialidad <!-- k:a72a1fe2d6 --> | Sin revisar · riesgo 0/5 |  |
| VOL_001 · Abulia <!-- k:bc8ee49514 --> | Sin revisar · riesgo 2/5 |  |
| VOL_002 · Ambivalencia volitiva <!-- k:190e605a26 --> | Sin revisar · riesgo 1/5 |  |
| VOL_003 · Ecopraxia <!-- k:500d81ccf7 --> | Sin revisar · riesgo 1/5 |  |
| VOL_004 · Flexibilidad cérea <!-- k:1d2f3e4ef8 --> | Sin revisar · riesgo 2/5 |  |
| VOL_005 · Hiperbulia <!-- k:dc71eca246 --> | Sin revisar · riesgo 1/5 |  |
| VOL_006 · Hipobulia <!-- k:2085fb1c98 --> | Sin revisar · riesgo 1/5 |  |
| VOL_007 · Impulsividad <!-- k:2a31924328 --> | Sin revisar · riesgo 2/5 |  |
| VOL_008 · Impulsividad patológica <!-- k:694af9c696 --> | Sin revisar · riesgo 2/5 |  |
| VOL_009 · Negativismo <!-- k:06ee52a9ca --> | Sin revisar · riesgo 2/5 |  |

## Resueltos

Aún ninguno.
