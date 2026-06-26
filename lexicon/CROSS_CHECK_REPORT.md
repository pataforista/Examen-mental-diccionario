# Informe de Cross-Check del Diccionario

_Generado: 2026-06-26_

## Integridad estructural (OK)
- 294 archivos de término = 294 en `lexicon_bundle.json` = 294 en `term_id_registry.json`
- 0 `term_id` duplicados · 0 nombres canónicos duplicados · 0 JSON inválidos
- Nombres y definiciones del bundle sincronizados con los archivos fuente
- 15/15 dominios referenciados; `domain_links` válidos

## Exclusiones (diferenciales) — hallazgo principal
El campo `canonical_name` (y `reason`) de cada exclusión es la fuente de verdad;
el puntero `term_id` estaba desincronizado en la mayoría de los casos.

| Categoría | Acción | Nº |
|---|---|---|
| A — ya correctas | sin cambios | 23 |
| B — puntero roto | **reparado** (term_id ↔ canonical_name) | 119 |
| C — placeholder auto-referencial | **eliminado** | 55 |
| D — referencia a concepto ausente del léxico | **pendiente de criterio clínico** | 76 |

## D — Pendientes de revisión clínica
Estas exclusiones citan un concepto que **no existe como término** en el léxico.
Decisión del autor: (a) crear el término, (b) renombrar al sinónimo existente, o (c) dejar como diferencial externo.
Algunos parecen sinónimos de términos ya presentes (p. ej. "Presión del habla" ≈ SPE "Presión de habla";
"Autolesión no suicida" ≈ RSK_003); otros son diagnósticos fuera de alcance (Depresión mayor, Demencia, Narcolepsia).

- AFF_003 → "Indecisión por rumiación/obsesión"
- AFF_005 → "Ataque de pánico"
- AFF_007 → "Angustia vital"
- AFF_010 → "Depresión mayor"
- AFF_012 → "Culpa adaptativa"
- AFF_013 → "Duelo normal"
- AFF_018 → "Depresión mayor"
- AFF_019 → "Temperamento hipertímico"
- AFF_020 → "Depresión mayor"
- AFF_024 → "Hostilidad"
- AFF_025 → "Afecto fugaz"
- AFF_025 → "Incontinencia afectiva pseudobulbar"
- AFF_030 → "Confusión"
- AFF_031 → "Ansiedad generalizada"
- AFF_031 → "Crisis autonómica médica"
- AFF_034 → "Depersonalización afectiva"
- ARC_005 → "Esquizofrenia concepto Bleuleriano"
- ARC_006 → "Psicosis maníaco-depresiva"
- ARC_010 → "DSM-5 o CIE-11 Trastorno de Síntomas Neurológicos Funcionales o el Trastorno Disociativo"
- ARC_015 → "Delirio primario"
- ARC_020 → "Humor delirante"
- CAT_002 → "Estupor orgánico"
- CAT_004 → "Afasia"
- CNS_001 → "Astenia somática secundaria pura de patología física (p. ej. Anemia/Neoplasias) versus Anergia funcional Depresiva y Apatía"
- CNS_002 → "Muerte Encefálica"
- CNS_004 → "Onirismo o Delirio y/o parasomnias (T. Comportamiento sueños REM)"
- CNS_005 → "Estupor Orgánico"
- CNS_006 → "Bloqueo o interceptación del pensamiento (Trastorno formal esquizofrénico)"
- CNS_007 → "Narcolepsia"
- CNS_008 → "Euforia de Manía Pura (Trastorno Afectivo Bipolar)"
- CNS_009 → "Crisis epiléptica generalizada (convulsión)"
- CNS_010 → "Trance de Posesión Patológico"
- COG_002 → "Pseudología fantástica"
- INS_001 → "Negación psicológica (denial)"
- INS_010 → "Depresión comórbida simple"
- MEM_003 → "Amnesia anterógrada orgánica"
- MEM_008 → "Mentira patológica (pseudología fantástica)"
- MEM_010 → "Plagio consciente"
- MEM_011 → "Demencia"
- MEM_011 → "Esquizofrenia"
- MEM_013 → "Aura epiléptica"
- MEM_017 → "Amnesia disociativa simple"
- MEM_017 → "Trastorno disociativo de identidad"
- MEM_020 → "Amnesia por intoxicación"
- MEM_023 → "Confabulación simple"
- MEM_024 → "Anomia orgánica"
- MEM_026 → "Amnesia anterógrada simple"
- MEM_026 → "Demencia"
- NEG_001 → "Fobia Social / TEPT"
- NEG_002 → "Afasia o Mutismo Psicógeno Selectivo"
- NEG_002 → "Bradipsiquia"
- NEG_003 → "Negligencia en Melancolía Severa Aguda o de TOC paralizante Agudo"
- NEU_001 → "Alucinación"
- NEU_005 → "Actos impuestos"
- NSC_003 → "Actos impuestos"
- PHM_003 → "Pensamiento concreto"
- PHM_004 → "Bradipsiquia"
- RSK_007 → "Autolesión no suicida"
- SELF_008 → "Obsesiones"
- SELF_009 → "Actos impuestos"
- SELF_010 → "Confusión"
- SELF_011 → "Confusión"
- SNM_001 → "Catatonía Maligna"
- SOM_001 → "Anorexia nerviosa"
- SPE_001 → "Afecto plano"
- SPE_002 → "Afasia"
- SPE_006 → "Presión del habla"
- SPE_009 → "Déficit intelectual"
- SPE_011 → "Obsesiones"
- VOL_001 → "Retardo psicomotor"
- VOL_002 → "Bloqueo motor parkinsoniano (freezing)"
- VOL_003 → "Imitación social (mirroring)"
- VOL_004 → "Rigidez en rueda dentada"
- VOL_005 → "Agitación psicomotora"
- VOL_008 → "Compulsión"
- VOL_009 → "Oposicionismo"


