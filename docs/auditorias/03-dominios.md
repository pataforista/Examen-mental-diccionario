# Auditoría: Dominios y listas del Integrador

> Generado con `npm run lexicon:audit` el 2026-11-28. La tabla se regenera con los datos actuales; **lo que escribas en «Decisión» se conserva**. Al corregirse, un caso pasa a «Resueltos» con su decisión.

## Qué revisa

La relación entre cada término y los 15 dominios del examen mental: los enlaces del término (`domain_links`) y las listas de descriptores de cada dominio, que alimentan el Integrador y la vista Dominios.

## Por qué importa

Un término mal ubicado no aparece donde el clínico lo busca, y un descriptor enlazado al concepto equivocado lleva a la ficha equivocada.

## Cómo decidir

- **El dominio lo lista, pero el término no lo declara:** decide la relación (expresión principal, signo asociado, contexto de riesgo…) y agrégala al término.
- **Posible enlace por sinónimo:** enlaza solo si es el mismo concepto. Ejemplo: la taquilalia (habla rápida) no equivale a la presión del habla.
- **No figura en las listas de su dominio:** decide si el Integrador debe ofrecerlo como opción al redactar. No todo término del diccionario es un descriptor útil para redactar; muchos conceptos históricos o teóricos no lo son. Anota «no aplica» cuando sea así.

## Cómo corregir

Relación del término: `domain_links` en su archivo. Listas: `npm run term:new … --lista DOM-xx/subcomponente` para términos nuevos, o en el archivo del dominio `accepted_terms` (respetando el orden clínico) más `term_links`.

Después de corregir: `npm run build:lexicon`, `npm test` y vuelve a generar esta auditoría.

## Casos pendientes (202)

### No figura en las listas de su dominio (Integrador y vista Dominios) (201)

| Término o campo | Hallazgo | Decisión |
|---|---|---|
| AFF_001 · Afecto constreñido <!-- k:5cc7ffb9ce --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_002 · Alexitimia <!-- k:794c6176f5 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_003 · Ambivalencia <!-- k:e04f741a06 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_005 · Angustia <!-- k:9a7b7de532 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_006 · Anhedonia <!-- k:d88f9d8fed --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_007 · Ansiedad <!-- k:a2272a2128 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_008 · Ansiedad afectiva <!-- k:2c92cd1e39 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_009 · Apatía <!-- k:307ef4408b --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_011 · Atimia <!-- k:d88c669bc2 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_012 · Culpa patológica <!-- k:7607a84a36 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_013 · Depresión <!-- k:65a5643de8 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_014 · Disforia <!-- k:bec00733b9 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_015 · Embotamiento afectivo <!-- k:bb10e1ea49 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_016 · Euforia <!-- k:0a42deb925 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_019 · Hipomanía <!-- k:8f91893400 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_020 · Hipotimia <!-- k:05e26dadc0 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_021 · Incongruencia afectiva <!-- k:abaa0a7d4d --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_023 · Ira <!-- k:bf54cb756e --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_024 · Irritabilidad <!-- k:d3180ed148 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_027 · Manía <!-- k:016a49f3b1 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_028 · Miedo <!-- k:2afc3923a8 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_031 · Pánico <!-- k:1270a11063 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_032 · Raptus <!-- k:ea8786ddc0 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_033 · Rigidez afectiva <!-- k:208529c433 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_034 · Sentimientos impuestos <!-- k:64d69f6447 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_035 · Ánimo depresivo <!-- k:e4367f368b --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| AFF_036 · Ánimo elevado <!-- k:e1d4eed8a3 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| APP_001 · Actitud hacia el entrevistador <!-- k:383fd7ca05 --> | expresión principal en DOM-03, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| APP_002 · Aliño e higiene <!-- k:c00d37c4e7 --> | expresión principal en DOM-02, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| APP_003 · Contacto visual <!-- k:ba0cfc5cfe --> | expresión principal en DOM-03, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| APP_004 · Facies y mímica <!-- k:24057c02e3 --> | expresión principal en DOM-02, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| ARC_007 · Ecmnesia <!-- k:a87cfddaeb --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| ARC_008 · Hipermnesia <!-- k:2fe320054f --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| ARC_020 · Wahnstimmung <!-- k:47dd3f2443 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| CAT_001 · Catatonia maligna <!-- k:9325cc19ed --> | expresión principal en DOM-04, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| CAT_003 · Mitmachen y Mitgehen <!-- k:4cad69cbe2 --> | expresión principal en DOM-04, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| CAT_004 · Mutismo catatónico <!-- k:4d9bb9deb5 --> | expresión principal en DOM-04, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| CNS_002 · Coma <!-- k:47522b0de0 --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| CNS_003 · Estado crepuscular <!-- k:e1de1947f0 --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| CNS_007 · Letargo <!-- k:0c242908ef --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| CNS_009 · Síncope <!-- k:f9be0ddd12 --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| CNT_001 · Idea sobrevalorada <!-- k:a1d97fc877 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| CNT_002 · Obsesión <!-- k:47c7143f5b --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| COG_001 · Atención y concentración <!-- k:a81f2a516f --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| COG_002 · Confabulación <!-- k:0312a5ed1d --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| COG_003 · Memoria de trabajo <!-- k:65838d3b92 --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| COG_004 · Orientación <!-- k:932f1f2033 --> | expresión principal en DOM-01, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| COG_005 · Pensamiento abstracto/concreto <!-- k:bd26e17213 --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_001 · Apofanía <!-- k:5d3b5e7601 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_002 · BLIPS <!-- k:db492bcef9 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_003 · Celotipia (Síndrome de Otelo) <!-- k:3622579690 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_004 · Cristalización delirante <!-- k:6005b83d82 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_005 · Delirio de infestación (Ekbom) <!-- k:b7890e1e94 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_006 · Delirio de ruina/pobreza <!-- k:95d019693f --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_007 · Delirio grandioso <!-- k:551c0b2aa0 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_008 · Delirio místico-religioso de mandato <!-- k:2fc272335a --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_010 · Delirio primario (Jaspers) <!-- k:7e34932e64 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_011 · Delirio primario (autóctono) <!-- k:0542a0931f --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_012 · Delirio querulante <!-- k:f85aba087a --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_013 · Delirio referencial <!-- k:4fe0abdbbb --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_014 · Delirio somático monotemático <!-- k:24d0f183a4 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_015 · Difusión del pensamiento <!-- k:17bea2a8a3 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_016 · Erotomanía (Síndrome de Clérambault) <!-- k:4de20dc1ab --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_017 · Fenómenos de pasividad <!-- k:0b213512b4 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_018 · Humor delirante (Wahnstimmung) <!-- k:21ba5362ec --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_019 · Idea delirante de culpa <!-- k:3480a59876 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_020 · Ideas de referencia <!-- k:099a08b600 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_021 · Ideas sobrevaloradas <!-- k:278e539114 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_022 · Inserción del pensamiento <!-- k:ce2181ab1a --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_023 · Intermetamorfosis <!-- k:e8a4eabeb0 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_024 · Interpretación delirante <!-- k:30c5e7bc7e --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_025 · Perplejidad delirante <!-- k:29bec12d88 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_026 · Revelación delirante (intuición delirante) <!-- k:7ba95e057d --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_027 · Robo del pensamiento <!-- k:2442184807 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_028 · Síndrome de Capgras <!-- k:c73bcc7865 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_030 · Síndrome de Fregoli <!-- k:7b9ad6e6e3 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| DEL_031 · Síntomas positivos atenuados <!-- k:4043b8682f --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| INS_001 · Anosognosia <!-- k:5ac3e69c3d --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| INS_002 · Ausencia de insight psiquiátrico <!-- k:0888733895 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| INS_005 · Insight completo <!-- k:d2ce28c852 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| INS_009 · Insight parcial <!-- k:7550b4159d --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| JUD_001 · Juicio <!-- k:cd7fa95cea --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| JUD_002 · Juicio de Realidad <!-- k:a87cff9227 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_001 · Alteración de conciencia <!-- k:907f015536 --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_003 · Amnesia anterógrada disociativa <!-- k:91a81d6204 --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_004 · Amnesia disociativa <!-- k:55a65ff56c --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_005 · Amnesia global transitoria <!-- k:232b7fe3d0 --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_006 · Amnesia psicógena <!-- k:1c1977e1f1 --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_011 · Delirium <!-- k:1b0ca06891 --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_014 · Déjà vu / Jamais vu <!-- k:00018575c9 --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_015 · Estado confusional <!-- k:ae19765d04 --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_016 · Fuga <!-- k:f304c510c0 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_017 · Fuga disociativa <!-- k:7a5077ada9 --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_018 · Inatención <!-- k:e82a089d9f --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_021 · Obnubilación <!-- k:5d3376e807 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_022 · Onirismo <!-- k:48a8bb86e1 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_023 · Paramnesia reduplicativa <!-- k:c1152efd6c --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_025 · Sopor <!-- k:b2d65e2fe3 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_026 · Síndrome de Korsakoff <!-- k:bdd7cc25be --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_027 · Hipermnesia traumática <!-- k:d4655a677d --> | expresión principal en DOM-10, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MEM_028 · Paramnesia del espejo <!-- k:00c6c8ee35 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MOT_001 · Apraxia constructiva <!-- k:8ec614eef4 --> | expresión principal en DOM-04, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MOT_002 · Apraxia ideacional <!-- k:915780bd57 --> | expresión principal en DOM-04, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MOT_003 · Apraxia ideomotora <!-- k:501963c0aa --> | expresión principal en DOM-04, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MOT_004 · Catalepsia <!-- k:e201d08154 --> | expresión principal en DOM-04, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MOT_005 · Discinesia <!-- k:12be23ceba --> | expresión principal en DOM-04, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MOT_007 · Estereotipia <!-- k:fb1d451a8b --> | expresión principal en DOM-04, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| MOT_009 · Mitgehen <!-- k:3e107e17ab --> | expresión principal en DOM-04, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| NEG_001 · Aislamiento/retraimiento social (social withdrawal/asociality) <!-- k:1d50411b96 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| NEG_002 · Alogia <!-- k:d077ceb952 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| NEG_003 · Deterioro o descuido grave del autocuidado/higiene (síndrome negativo/defecto) <!-- k:4f806867b6 --> | expresión principal en DOM-09, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| NEU_003 · Síndrome de Charles Bonnet <!-- k:a4b79fa5fe --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| NEU_004 · Alucinosis peduncular <!-- k:04cc9be2fc --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| NEU_005 · Síndrome de la mano alienígena <!-- k:ad835b1a54 --> | expresión principal en DOM-04, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| NEU_006 · Comportamiento de utilización <!-- k:fb370e6565 --> | expresión principal en DOM-04, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| NEU_007 · Paratonía (Gegenhalten) <!-- k:0a333f0b4e --> | expresión principal en DOM-04, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| NSC_003 · Anomalía del sentido de agencia <!-- k:750cbfca03 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PER_001 · Acoasmas <!-- k:00f2c06c42 --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PER_002 · Alucinaciones auditivas comentadoras <!-- k:66bf2e23d2 --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PER_003 · Alucinaciones auditivas dialogantes <!-- k:6bbd1ab025 --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PER_004 · Alucinaciones cenestésicas <!-- k:93a2033fee --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PER_005 · Alucinaciones hipnagógicas <!-- k:80cd6518c8 --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PER_006 · Alucinaciones hipnopómpicas <!-- k:9aa156d9c4 --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PER_007 · Alucinación extracampina <!-- k:56b09deced --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PER_008 · Alucinación funcional <!-- k:f5965f2b4c --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PER_009 · Alucinación refleja <!-- k:e95390bec7 --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PER_012 · Distorsión perceptiva visual <!-- k:cefd5a799e --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PER_013 · Flashback <!-- k:9a4e601908 --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PER_015 · Imagen eidética <!-- k:04fffb037e --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PER_017 · Metamorfopsia <!-- k:48e39c67b9 --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PER_019 · Palinopsia <!-- k:f60f642609 --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PER_020 · Pareidolia <!-- k:634f20d942 --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PER_022 · Sentido de Presencia <!-- k:fa432bae0c --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PER_023 · Sonorización del pensamiento (Gedankenlautwerden) <!-- k:5e0493ec53 --> | expresión principal en DOM-08, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PHM_001 · Alteración del campo de conciencia (EASE) <!-- k:8af9c96868 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PHM_002 · Rapto de atención (EASE) <!-- k:e44c8fa0ce --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PHM_003 · Pérdida de la perspectiva (EASE) <!-- k:1013ed1df1 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PHM_004 · Anomalías de la vivencia del tiempo <!-- k:e5b783b5f9 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PHM_005 · Déficit metacognitivo <!-- k:d9240e6b1a --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PHM_007 · Interocepción aberrante <!-- k:249d17064f --> | expresión principal en DOM-14, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| PHM_008 · Anomalías del sentido de pertenencia <!-- k:030ff37702 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| RSK_001 · Riesgo autolítico (general) <!-- k:928a066e98 --> | expresión principal en DOM-12, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| RSK_002 · Acceso a medios letales <!-- k:26af2b6f5f --> | expresión principal en DOM-12, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| RSK_004 · Capacidad de colaboración para seguridad <!-- k:1494ce7b79 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| RSK_005 · Conducta suicida preparatoria <!-- k:c9d9ec2cff --> | expresión principal en DOM-12, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| RSK_006 · Ideación suicida <!-- k:27d563b3ed --> | expresión principal en DOM-12, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| RSK_007 · Intento suicida <!-- k:41ce76e414 --> | expresión principal en DOM-12, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| RSK_008 · Riesgo de violencia hacia otros <!-- k:3a4d28d2a6 --> | expresión principal en DOM-12, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SELF_001 · Actos impuestos (pasividad volitiva) <!-- k:c1a8a913b6 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SELF_002 · Anosognosia cognitiva <!-- k:f7e31eb4e3 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SELF_003 · Anosognosia psicótica <!-- k:363fea44da --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SELF_004 · Autoscopia <!-- k:9593577e43 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SELF_005 · Despersonalización <!-- k:9d854ef5a0 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SELF_006 · Desrealización <!-- k:f930f7a928 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SELF_007 · Disminución de la autoafección <!-- k:0d4101b976 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SELF_008 · Hiperreflexividad <!-- k:0ad4ecfaa3 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SELF_009 · Impulsos impuestos <!-- k:4e070d684a --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SELF_010 · Pérdida de la evidencia natural <!-- k:80df1498b3 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SELF_011 · Transitivismo <!-- k:1e98976854 --> | expresión principal en DOM-11, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SER_001 · Síndrome serotoninérgico <!-- k:1ab50aa3fb --> | expresión principal en DOM-04, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SNM_001 · Síndrome neuroléptico maligno <!-- k:7eb5cb6759 --> | expresión principal en DOM-04, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SOM_001 · Dismorfofobia <!-- k:af4ab921a1 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SOM_002 · Hipocondría <!-- k:7f9cabf79c --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SPE_001 · Aprosodia <!-- k:6fe54cb8c5 --> | expresión principal en DOM-05, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SPE_004 · Latencia de respuesta aumentada <!-- k:0b8fd793b2 --> | expresión principal en DOM-05, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SPE_005 · Logoclonia <!-- k:597e9bb6f0 --> | expresión principal en DOM-05, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SPE_007 · Mutismo <!-- k:f5bfe7420d --> | expresión principal en DOM-03, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SPE_008 · Palilalia <!-- k:d1d11a3309 --> | expresión principal en DOM-05, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SPE_009 · Pararrespuestas (Vorbeireden) <!-- k:e218f5478c --> | expresión principal en DOM-05, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SPE_010 · Presión de habla <!-- k:f8388090c6 --> | expresión principal en DOM-05, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SPE_011 · Verbigeración <!-- k:093ea16643 --> | expresión principal en DOM-05, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| SPE_012 · Afasia <!-- k:67e6aabc94 --> | expresión principal en DOM-05, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_001 · Bloqueo <!-- k:a274ddcd38 --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_002 · Concretismo <!-- k:48c853f750 --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_004 · Disfunción expresiva del lenguaje <!-- k:e4de4a17d0 --> | expresión principal en DOM-05, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_005 · Disfunción receptiva del lenguaje <!-- k:5faf2ce775 --> | expresión principal en DOM-05, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_006 · Disfunción de la iniciativa e intencionalidad <!-- k:523e70193d --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_007 · Disociación del Pensamiento <!-- k:f60b0a6816 --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_008 · Glosomanía / Clanging <!-- k:0f41e66f49 --> | expresión principal en DOM-05, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_009 · Habla manierista <!-- k:028d5a164d --> | expresión principal en DOM-05, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_010 · Habla presionada <!-- k:aa68d28f3c --> | expresión principal en DOM-05, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_011 · Interferencia del Pensamiento <!-- k:40d38f29cd --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_013 · Para-respuesta / Crosstalk <!-- k:2e32ee478a --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_014 · Parafasia fonémica <!-- k:4886b3fe6e --> | expresión principal en DOM-05, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_015 · Parafasia semántica <!-- k:acb42489a1 --> | expresión principal en DOM-05, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_016 · Pensamiento enlentecido <!-- k:e0436a0663 --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_017 · Pensamiento inhibido <!-- k:0d1bb103c5 --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_018 · Pensamiento restringido <!-- k:c156dd2140 --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_019 · Pobreza de Contenido del Habla <!-- k:4eb1809f3c --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_020 · Pobreza de Pensamiento <!-- k:02feaaba46 --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_021 · Pobreza del Habla <!-- k:0f6942bc58 --> | expresión principal en DOM-05, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_022 · Presión/Agalopamiento de Ideas <!-- k:0df0f6f850 --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_023 · Rumiación <!-- k:2317f62210 --> | expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| TALD_024 · Ruptura del Pensamiento <!-- k:33d7cd485e --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| THO_002 · Asociación por consonancia (clang) <!-- k:abacbc4d89 --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| THO_004 · Circunstancialidad <!-- k:db798d00b4 --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| THO_007 · Incoherencia <!-- k:f178eff366 --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| THO_008 · Paralogia <!-- k:b16f8b5f6f --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| THO_010 · Tangencialidad <!-- k:dcd794913d --> | expresión principal en DOM-06, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| VOL_005 · Hiperbulia <!-- k:e60710d770 --> | expresión principal en DOM-04, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |
| VOL_008 · Impulsividad patológica <!-- k:ae8e08018b --> | expresión principal en DOM-04, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio |  |

### Descriptor que coincide con un término del léxico sin enlazar (1)

| Término o campo | Hallazgo | Decisión |
|---|---|---|
| DOM-05 · Habla y lenguaje <!-- k:7d27141f1a --> | velocidad_y_ritmo: "taquilalia" es sinónimo de SPE_010 (Presión de habla); enlázalo solo si es el mismo concepto | NO enlazar: taquilalia != presión de habla (contraejemplo de la guía) (2026-11-27) |

## Resueltos

- 2026-11-27 · DOM-15 · Fenomenología histórica y conceptos clásicos: conceptos_arcaicos: "neurosis_histerica" es sinónimo de ARC_009 (Histeria); enlázalo solo si es el mismo concepto — decisión: Enlazado neurosis_histerica -> ARC_009 (histórico en DOM-15) (2026-11-27)
- 2026-11-27 · DOM-09 · Estado afectivo (ánimo y afecto): afecto_observable: "afecto_labil" es sinónimo de AFF_025 (Labilidad afectiva); enlázalo solo si es el mismo concepto — decisión: Enlazado afecto_labil -> AFF_025 (2026-11-27)
- 2026-11-27 · DOM-07 · Pensamiento: contenido: ideas_delirantes: "delirio_nihilista" es sinónimo de DEL_029 (Síndrome de Cotard); enlázalo solo si es el mismo concepto — decisión: Enlazado delirio_nihilista -> DEL_029 (2026-11-27)
- 2026-11-27 · THO_005 · Ensalada de palabras: aparece en las listas de DOM-05; agrega ese dominio a domain_links — decisión: Añadido DOM-05 secondary_expression (2026-11-27)
- 2026-11-27 · TALD_002 · Concretismo: aparece en las listas de DOM-05, DOM-10; agrega ese dominio a domain_links — decisión: Añadidos DOM-05 secondary_expression y DOM-10 cognitive_deficit; ya tenía DOM-06 primary_expression (2026-11-27)
- 2026-11-27 · MOT_003 · Apraxia ideomotora: aparece en las listas de DOM-10; agrega ese dominio a domain_links — decisión: Añadido DOM-10 cognitive_deficit (2026-11-27)
- 2026-11-27 · MOT_001 · Apraxia constructiva: aparece en las listas de DOM-10; agrega ese dominio a domain_links — decisión: Añadido DOM-10 cognitive_deficit (2026-11-27)
- 2026-11-27 · MEM_021 · Obnubilación: aparece en las listas de DOM-01; agrega ese dominio a domain_links — decisión: Añadido DOM-01 primary_expression (2026-11-27)
- 2026-11-27 · INS_001 · Anosognosia: aparece en las listas de DOM-10; agrega ese dominio a domain_links — decisión: Añadido DOM-10 associated_sign (2026-11-27)
- 2026-11-27 · CNS_008 · Moria: aparece en las listas de DOM-09; agrega ese dominio a domain_links — decisión: Añadido DOM-09 associated_sign (2026-11-27)
- 2026-11-27 · CNS_002 · Coma: aparece en las listas de DOM-01; agrega ese dominio a domain_links — decisión: Añadido DOM-01 primary_expression (2026-11-27)
- 2026-11-27 · DEL_029 · Síndrome de Cotard: expresión principal en DOM-07, sin entrada en sus listas. Para agregarla: npm run term:new … o term_links del dominio
