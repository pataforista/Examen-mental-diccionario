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

## Casos pendientes (22)

### Código CIE-11 distinto en lexicon/mappings/ (22)

| Término o campo | Hallazgo | Decisión |
|---|---|---|
| AFF_001 · Afecto constreñido <!-- k:b14615e3db --> | sin código propio; lexicon/mappings/ propone MB24.5 |  |
| AFF_002 · Alexitimia <!-- k:d9e5f7f874 --> | el término dice MB24.Y; lexicon/mappings/ dice MB24.8 |  |
| AFF_003 · Ambivalencia <!-- k:898cc2ca41 --> | sin código propio; lexicon/mappings/ propone MB24.63 |  |
| AFF_007 · Ansiedad <!-- k:a81bbf5a94 --> | el término dice MB24.2; lexicon/mappings/ dice MB24.3 |  |
| AFF_008 · Ansiedad afectiva <!-- k:2cd55b5e55 --> | sin código propio; lexicon/mappings/ propone MB24.Z |  |
| AFF_009 · Apatía <!-- k:eb912ebed0 --> | el término dice MB24.Y; lexicon/mappings/ dice MB24.2 |  |
| AFF_011 · Atimia <!-- k:2c071be36e --> | el término dice MB24.Z; lexicon/mappings/ dice MB24.C |  |
| AFF_014 · Disforia <!-- k:cd2c9d8ad2 --> | el término dice MB24.Y; lexicon/mappings/ dice MB24.4 |  |
| AFF_016 · Euforia <!-- k:77128d620d --> | el término dice MB24.Y; lexicon/mappings/ dice MB24.0 |  |
| AFF_017 · Eutimia <!-- k:b4c69f2b5e --> | sin código propio; lexicon/mappings/ propone MB24.1 |  |
| AFF_018 · Fatiga emocional <!-- k:8cafb73d1d --> | el término dice QD85; lexicon/mappings/ dice MB24.6 |  |
| PER_005 · Alucinaciones hipnagógicas <!-- k:7c4f1335c3 --> | sin código propio; lexicon/mappings/ propone 6B40 |  |
| PER_010 · Alucinación verdadera <!-- k:20877b2487 --> | sin código propio; lexicon/mappings/ propone MB27.4 |  |
| PER_011 · Alucinosis <!-- k:f511e23002 --> | sin código propio; lexicon/mappings/ propone MB27.23 |  |
| PER_012 · Distorsión perceptiva visual <!-- k:285d656ebc --> | sin código propio; lexicon/mappings/ propone MB27.22 |  |
| PER_014 · Ilusión <!-- k:5564be39fe --> | sin código propio; lexicon/mappings/ propone MB27.4 |  |
| RSK_001 · Riesgo autolítico (general) <!-- k:c86332bb75 --> | sin código propio; lexicon/mappings/ propone MB26.A |  |
| RSK_002 · Acceso a medios letales <!-- k:6c1fee44a9 --> | sin código propio; lexicon/mappings/ propone MB23.S |  |
| RSK_003 · Autolesión no suicida (NSSI) <!-- k:5830e733bd --> | sin código propio; lexicon/mappings/ propone MB23.R |  |
| THO_005 · Ensalada de palabras <!-- k:c07f9f5bc3 --> | el término dice MB20.Z; lexicon/mappings/ dice MB25.00 |  |
| THO_006 · Fuga de ideas <!-- k:cfda1d710b --> | el término dice MB20.Z; lexicon/mappings/ dice MB25.01 |  |
| THO_009 · Perseveración <!-- k:e6ab78be8f --> | el término dice MB20.Z; lexicon/mappings/ dice MB25.03 |  |

## Resueltos

Aún ninguno.
