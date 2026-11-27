# Auditoría: Taxonomía y vocabularios

> Generado con `npm run lexicon:audit` el 2026-11-27. La tabla se regenera con los datos actuales; **lo que escribas en «Decisión» se conserva**. Al corregirse, un caso pasa a «Resueltos» con su decisión.

## Qué revisa

Los valores que clasifican los términos: escala de riesgo (`risk_weight`), tipo de término (`term_kind`) y la operacionalización (`detectable_by`: cómo se detecta; `time_relation`: su relación temporal).

## Por qué importa

Si el mismo valor se escribe de varias formas (con y sin tilde, en masculino y femenino, en español e inglés), cualquier filtro o estadística por esos campos da resultados falsos.

## Cómo decidir

- Para cada grupo de variantes, elige la forma canónica (recomendado: español, sin tildes en valores técnicos, con guion bajo, igual que el resto de identificadores).
- Para `term_kind`, decide si `estado de riesgo` y `factor de riesgo` se escriben con guion bajo como `concepto_histórico`, o al revés. Es una decisión de estilo que debe ser única.
- **Escala de riesgo:** escribe qué significa cada nivel de `risk_weight` (criterio clínico, no solo una etiqueta) y revisa con esa definición los términos de nivel alto. La ficha muestra el recuadro rojo de «Alerta de riesgo clínico» desde el nivel 2 (`risk_weight > 1` en `src/dictionary.js`), así que la escala decide qué ve el estudiante como urgente.
- Decide si `detectable_by` y `time_relation` deben pasar a ser vocabularios cerrados en `taxonomy/controlled_vocabularies.json`; así el validador impediría variantes nuevas.

## Cómo corregir

Una vez decidida la forma canónica, el cambio es mecánico en todos los archivos: pídelo y se aplica con un script, se regenera el bundle y se valida.

Después de corregir: `npm run build:lexicon`, `npm test` y vuelve a generar esta auditoría.

## Casos pendientes (1)

### Escala de riesgo (1)

| Término o campo | Hallazgo | Decisión |
|---|---|---|
| risk_weight <!-- k:20a74dedf9 --> | El esquema define 0 = neutral, 1 = alert, 2 = critical; los términos usan 0, 1, 2, 3, 4, 5. Sin definición escrita para 3, 4, 5. Términos en esos niveles: RSK_002 Acceso a medios letales (5); RSK_007 Intento suicida (5); RSK_008 Riesgo de violencia hacia otros (5); MEM_025 Sopor (4); RSK_004 Capacidad de colaboración para seguridad (4); RSK_005 Conducta suicida preparatoria (4); AFF_023 Ira (3); ARC_003 Bouffée délirante (3); ARC_006 Dementia praecox (3); ARC_013 Lypemanía (3); CAT_001 Catatonia maligna (3); CAT_002 Estupor catatónico (3); JUD_002 Juicio de Realidad (3); RSK_001 Riesgo autolítico (general) (3); RSK_006 Ideación suicida (3); SPE_007 Mutismo (3) |  |

## Resueltos

- 2026-11-27 · time_relation: Valores en inglés: `current`, `past` — decisión: actual <- current; historico <- past (2026-11-27)
- 2026-11-27 · time_relation: Variantes del mismo valor: `prodrómica` (6), `prodrómico` (1) — decisión: prodromica <- prodrómica, prodrómico (2026-11-27)
- 2026-11-27 · time_relation: Variantes del mismo valor: `aguda` (4), `agudo` (1)
- 2026-11-27 · time_relation: Variantes del mismo valor: `paroxistica` (3), `paroxística` (1) — decisión: paroxistica <- paroxística (2026-11-27)
- 2026-11-27 · time_relation: Variantes del mismo valor: `episodica` (23), `episódica` (7), `episodico` (4)
- 2026-11-27 · detectable_by: Valores en inglés: `clinical_interview`, `patient_report`, `collateral_history` — decisión: entrevista_clinica <- clinical_interview; autoinforme <- patient_report; historia_colateral <- collateral_history (2026-11-27)
- 2026-11-27 · detectable_by: Variantes del mismo valor: `entrevista_fenomenológica (EASE)` (3), `entrevista_fenomenológica` (2) — decisión: entrevista_fenomenologica <- entrevista_fenomenológica, entrevista_fenomenológica (EASE) (2026-11-27)
- 2026-11-27 · detectable_by: Variantes del mismo valor: `entrevista_clinica_fenomenologica` (3), `entrevista_clinica_fenomenológica` (1) — decisión: entrevista_clinica_fenomenologica <- entrevista_clinica_fenomenológica (2026-11-27)
- 2026-11-27 · detectable_by: Variantes del mismo valor: `historia_clinica_longitudinal` (3), `historia_clínica_longitudinal` (1)
- 2026-11-27 · detectable_by: Variantes del mismo valor: `historia_clínica` (2), `historia_clinica` (1) — decisión: historia_clinica <- historia_clínica (2026-11-27)
- 2026-11-27 · detectable_by: Variantes del mismo valor: `observacion_clinica` (9), `observación_clínica` (2)
- 2026-11-27 · detectable_by: Variantes del mismo valor: `entrevista_clinica` (173), `entrevista_clínica` (4), `entrevista_clínica (TEPT)` (1)
- 2026-11-27 · term_kind: Dos estilos en el vocabulario de tipos: con espacio `estado de riesgo`, `factor de riesgo`; con guion bajo `concepto_histórico`, `distinción_clínica` — decisión: Unificado a guion bajo sin tilde: estado_de_riesgo, factor_de_riesgo, concepto_historico, distincion_clinica (2026-11-27)
- 2026-11-27 · time_relation: Variantes del mismo valor: `aguda` (3), `agudo` (1)
- 2026-11-27 · time_relation: Variantes del mismo valor: `episodica` (22), `episódica` (7), `episodico` (4)
- 2026-11-27 · detectable_by: Variantes del mismo valor: `historia_clinica_longitudinal` (1), `historia_clínica_longitudinal` (1)
- 2026-11-27 · detectable_by: Variantes del mismo valor: `observacion_clinica` (8), `observación_clínica` (2)
- 2026-11-27 · detectable_by: Variantes del mismo valor: `entrevista_clinica` (171), `entrevista_clínica` (4), `entrevista_clínica (TEPT)` (1)
