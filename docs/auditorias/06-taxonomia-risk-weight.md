# Recalibración de `risk_weight` (escala 0–5)

> Registro auditable de Commit D (2026-11-27). Definición canónica de niveles en `taxonomy/controlled_vocabularies.json` (`risk_weight_levels`); rango y tipo en `lexicon/lexicon.schema.json`.
> Deuda UI (badges diferenciados `2` / `3–4` / `5`): **`emd-dt0`**. Revisión clínica de `AFF_023` Ira: **`emd-y9e`**. Evaluación de `risk_axis` en nivel 5: **`emd-jwg`**.

## Tabla completa de auditoría (25 términos: 15 cambiados + 10 confirmados)

| `term_id` | Término | Valor anterior | Valor nuevo | Motivo |
|---|---|---:|---:|---|
| `CAT_001` | Catatonia maligna | 3 | **5** | Emergencia vital con disautonomía/hipertermia |
| `SNM_001` | Síndrome neuroléptico maligno | 2 | **5** | Emergencia médica potencialmente letal |
| `SER_001` | Síndrome serotoninérgico | 2 | **5** | Emergencia toxicológica potencialmente letal |
| `CNS_002` | Coma | 2 | **5** | Emergencia médica vital |
| `MEM_011` | Delirium | 2 | **3** | Riesgo alto de morbimortalidad médica |
| `RSK_003` | Autolesión no suicida (NSSI) | 2 | **3** | Riesgo alto; requiere evaluación/plan de seguridad (distinto de intento = 5) |
| `SPE_007` | Mutismo | 3 | **2** | Alerta clínica; la urgencia depende de la causa (catatonia/delirium) |
| `JUD_002` | Juicio de Realidad | 3 | **1** | Concepto evaluativo general, no urgencia por sí solo |
| `ARC_003` | Bouffée délirante | 3 | **1** | Categoría histórica francesa de psicosis aguda |
| `ARC_006` | Dementia praecox | 3 | **0** | Regla `concepto_historico => 0` |
| `ARC_013` | Lypemanía | 3 | **0** | Término histórico decimonónico (Esquirol), sin riesgo agudo propio |
| `ARC_011` | Locura circular | 2 | **0** | Regla `concepto_historico => 0` |
| `HIS_003` | Dipsomanía | 1 | **0** | Regla `concepto_historico => 0` |
| `HIS_004` | Poriomanía | 1 | **0** | Regla `concepto_historico => 0` |
| `HIS_005` | Nimfomanía / Satiriasis | 1 | **0** | Regla `concepto_historico => 0` |
| `RSK_002` | Acceso a medios letales | 5 | **5** | Revisado, se mantiene (emergencia letal inmediata) |
| `RSK_007` | Intento suicida | 5 | **5** | Revisado, se mantiene (emergencia vital) |
| `RSK_008` | Riesgo de violencia hacia otros | 5 | **5** | Revisado, se mantiene (emergencia vital a terceros; eje pendiente en `emd-jwg`) |
| `MEM_025` | Sopor | 4 | **4** | Revisado, se mantiene (compromiso agudo de conciencia) |
| `RSK_004` | Capacidad de colaboración para seguridad | 4 | **4** | Revisado, se mantiene (modificador crítico de riesgo inminente) |
| `RSK_005` | Conducta suicida preparatoria | 4 | **4** | Revisado, se mantiene (riesgo suicida inminente) |
| `RSK_001` | Riesgo autolítico (general) | 3 | **3** | Revisado, se mantiene (riesgo alto / vigilancia prioritaria) |
| `RSK_006` | Ideación suicida | 3 | **3** | Revisado, se mantiene (riesgo alto / vigilancia prioritaria) |
| `CAT_002` | Estupor catatónico | 3 | **3** | Revisado, se mantiene (riesgo alto médico/nutricional/trombótico) |
| `AFF_023` | Ira | 3 | **2** | Recalibrado en Commit F (2026-11-28): coherencia con manía/pánico (nivel 2); el riesgo conductual vive en `RSK_008` |

## Notas taxonómicas post-fusión (`emd-zf5`, 2026-11-28)

- **C3 (`MEM_016` → `MEM_017`):** Fusión con colapso `síntoma` → `síndrome`; `MEM_017` mantiene `term_kind: "síndrome"`.
- **C4 (`TALD_016` → `CNS_006`):** Revisar `term_kind` de `CNS_006` (`signo`) tras absorber `DOM-06 primary_expression` (Pensamiento) en `emd-y9e`.

## Notas Commit F (previo a firma de Lote 1 `emd-y9e`, 2026-11-28)

- `AFF_023` Ira bajado de `3 → 2` (distribución final `113/110/53/5/3/7`).
- `MEM_011` Delirium: exclusiones en texto libre (`Demencia`, `Esquizofrenia`) pendientes de vinculación por `term_id` si se crean esos términos.
