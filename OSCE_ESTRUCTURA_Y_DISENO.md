# Estructura recomendada para casos OSCE (Examen Mental)

Esta guía define **qué debe llevar un caso OSCE** en este repositorio y cómo diseñarlo para evaluación docente.

## 1) Estructura mínima obligatoria del caso

Cada caso debe incluir estos bloques:

1. **Identificación del caso**
   - `case_id` (ej. `OSCE_016`)
   - `level` (complejidad)
   - `difficulty_variant` (A/B/C)

2. **Planteamiento clínico (stem)**
   - `setting` (urgencias, consulta externa, etc.)
   - `age_range`
   - `sex`
   - `contextual_notes` (motivo breve, curso temporal, disparadores)

3. **Hallazgos por dominios (DOM-01 a DOM-12)**
   - Se codifican observables/entrevista por dominio.
   - Debe existir consistencia interna entre dominios (p. ej., delirium = alteración atencional + curso fluctuante + compromiso del sensorio).

4. **Salida esperada del motor (`expected_engine_output`)**
   - `primary_syndrome`
   - `confidence_band` (`possible`/`probable`/`strong`)
   - `critical_flags` (red flags clínicas)
   - `mandatory_checks` (claves que no se pueden omitir)

5. **Claves de evaluación docente (`assessment_keys`)**
   - `errors_to_avoid` (errores de razonamiento frecuentes)
   - `key_discriminators` (pistas de alto valor diagnóstico)

---

## 2) Qué debe llevar (contenido pedagógico)

Además del JSON estructurado, cada caso OSCE bien diseñado debe tener:

- **Objetivo de aprendizaje principal** (qué competencia evalúa).
- **Diagnóstico diferencial mínimo** (2–4 alternativas plausibles).
- **Punto de seguridad** (riesgo suicida, heteroagresión, vulnerabilidad médica, etc.).
- **Criterio de aprobación** (qué acciones/hallazgos son indispensables).
- **Criterio de excelencia** (integración sindromática + priorización de riesgo + plan inicial).

> Recomendación: conservar estos elementos en una guía docente o rúbrica asociada al caso, aunque el archivo JSON no tenga todos esos campos explícitos.

---

## 3) Checklist de diseño (rápido)

Antes de publicar un caso, verificar:

- [ ] El `stem` orienta, pero no “regala” el diagnóstico.
- [ ] Los dominios contienen datos suficientes para discriminar al menos 2 diagnósticos.
- [ ] Los valores seleccionados existen en los vocabularios/controlados del proyecto.
- [ ] `primary_syndrome` es coherente con los dominios críticos.
- [ ] `mandatory_checks` apunta a los nodos de mayor rendimiento diagnóstico.
- [ ] `errors_to_avoid` captura sesgos esperables en estudiantes.
- [ ] Hay al menos un elemento de seguridad clínica en `critical_flags` o DOM-12.

---

## 4) Plantilla práctica (copiar y completar)

Ver archivo: `OSCE_CASE_TEMPLATE.json`.

---

## 5) Ejemplo de objetivos por nivel

- **Nivel 1**: descripción fenomenológica básica (qué observa).
- **Nivel 2**: organización sindromática inicial (qué síndrome sospecha).
- **Nivel 3**: diagnóstico diferencial + riesgo + conducta inicial (qué hace primero y por qué).

---

## 6) ¿Puedo diseñar los casos por ti?

Sí. Puedo ayudarte a construir series completas, por ejemplo:

- Set por síndromes (confusional, psicótico, afectivo, cognitivo, catatónico).
- Set por contexto (urgencias, hospitalización, consulta externa).
- Set por dificultad (A/B/C) con distractores progresivos.

Si quieres, en el siguiente paso puedo proponerte **10 casos OSCE listos** con objetivos, claves de corrección y JSON compatible con tu repositorio.
