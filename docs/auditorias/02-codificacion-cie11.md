# Auditoría: Codificación CIE-11

> Generado con `npm run lexicon:audit` el 2026-11-27. La tabla se regenera con los datos actuales; **lo que escribas en «Decisión» se conserva**. Al corregirse, un caso pasa a «Resueltos» con su decisión.

## Qué revisa

Los códigos CIE-11 de cada término (`mappings.cie11.code`) frente a los de la carpeta heredada `lexicon/mappings/`, que la app no usa.

## Por qué importa

Dos fuentes con códigos distintos significan que al menos una está mal. Un código incorrecto en material docente se copia a notas clínicas y a trabajos.

## Cómo decidir

- Verifica cada código en el navegador oficial de la CIE-11 (icd.who.int/browse) con la versión vigente.
- Muchos síntomas no tienen un código propio en la CIE-11: en ese caso es preferible dejar el campo vacío que forzar un código genérico (`.Y`, `.Z`).
- Cuando todos los casos estén resueltos, la carpeta `lexicon/mappings/` se puede eliminar.

## Cómo corregir

Edita `mappings.cie11.code` en el archivo del término. Anota en «Decisión» el código elegido y la fecha de consulta.

Después de corregir: `npm run build:lexicon`, `npm test` y vuelve a generar esta auditoría.

## Casos pendientes (0)

Ninguno.

## Resueltos

- 2026-11-27 · THO_009 · Perseveración: el término dice MB20.Z; lexicon/mappings/ dice MB25.03 — decisión: MB21.9 Perseveration, verificado en bloque MB21 (2026-11-27)
- 2026-11-27 · THO_006 · Fuga de ideas: el término dice MB20.Z; lexicon/mappings/ dice MB25.01 — decisión: MB25.1 Flight of ideas (2026-11-27)
- 2026-11-27 · THO_005 · Ensalada de palabras: el término dice MB20.Z; lexicon/mappings/ dice MB25.00 — decisión: MB25.03 Incoherence (2026-11-27)
- 2026-11-27 · RSK_003 · Autolesión no suicida (NSSI): sin código propio; lexicon/mappings/ propone MB23.R — decisión: Sin equivalente CIE-11: MB23.R es intento suicida, no NSSI (2026-11-27)
- 2026-11-27 · RSK_002 · Acceso a medios letales: sin código propio; lexicon/mappings/ propone MB23.S — decisión: Sin equivalente CIE-11: factor ambiental (2026-11-27)
- 2026-11-27 · RSK_001 · Riesgo autolítico (general): sin código propio; lexicon/mappings/ propone MB26.A — decisión: Sin equivalente CIE-11: riesgo global != ideación (2026-11-27)
- 2026-11-27 · PER_014 · Ilusión: sin código propio; lexicon/mappings/ propone MB27.4 — decisión: MB27.4 Illusions (2026-11-27)
- 2026-11-27 · PER_012 · Distorsión perceptiva visual: sin código propio; lexicon/mappings/ propone MB27.22 — decisión: Sin equivalente CIE-11 propio (2026-11-27)
- 2026-11-27 · PER_011 · Alucinosis: sin código propio; lexicon/mappings/ propone MB27.23 — decisión: Sin equivalente CIE-11 propio (2026-11-27)
- 2026-11-27 · PER_010 · Alucinación verdadera: sin código propio; lexicon/mappings/ propone MB27.4 — decisión: MB27.2 Hallucinations (2026-11-27)
- 2026-11-27 · PER_005 · Alucinaciones hipnagógicas: sin código propio; lexicon/mappings/ propone 6B40 — decisión: MB27.23 Hypnagogic hallucinations (2026-11-27)
- 2026-11-27 · AFF_018 · Fatiga emocional: el término dice QD85; lexicon/mappings/ dice MB24.6 — decisión: Sin equivalente CIE-11: QD85 es burnout ocupacional (2026-11-27)
- 2026-11-27 · AFF_017 · Eutimia: sin código propio; lexicon/mappings/ propone MB24.1 — decisión: Sin equivalente CIE-11: estado basal normal (2026-11-27)
- 2026-11-27 · AFF_016 · Euforia: el término dice MB24.Y; lexicon/mappings/ dice MB24.0 — decisión: MB24.9 Euphoria (2026-11-27)
- 2026-11-27 · AFF_014 · Disforia: el término dice MB24.Y; lexicon/mappings/ dice MB24.4 — decisión: MB24.7 Dysphoria (2026-11-27)
- 2026-11-27 · AFF_011 · Atimia: el término dice MB24.Z; lexicon/mappings/ dice MB24.C — decisión: Sin equivalente CIE-11 (2026-11-27)
- 2026-11-27 · AFF_009 · Apatía: el término dice MB24.Y; lexicon/mappings/ dice MB24.2 — decisión: MB24.4 Apathy (2026-11-27)
- 2026-11-27 · AFF_008 · Ansiedad afectiva: sin código propio; lexicon/mappings/ propone MB24.Z — decisión: Vacío: subtipo de MB24.3 ya asignado a AFF_007 (2026-11-27)
- 2026-11-27 · AFF_007 · Ansiedad: el término dice MB24.2; lexicon/mappings/ dice MB24.3 — decisión: MB24.3 Anxiety (2026-11-27)
- 2026-11-27 · AFF_003 · Ambivalencia: sin código propio; lexicon/mappings/ propone MB24.63 — decisión: MB24.0 Ambivalence (2026-11-27)
- 2026-11-27 · AFF_002 · Alexitimia: el término dice MB24.Y; lexicon/mappings/ dice MB24.8 — decisión: Sin equivalente CIE-11 (2026-11-27)
- 2026-11-27 · AFF_001 · Afecto constreñido: sin código propio; lexicon/mappings/ propone MB24.5 — decisión: MB24.60 Constricted affect (2026-11-27)
