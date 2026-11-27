# Cómo revisar y agregar términos del diccionario

Cada término vive en su propio archivo (`lexicon/terms/<PREFIJO>/<ID>_<nombre>.json`). No hace falta abrirlos para el trabajo habitual: estas herramientas cubren revisar, corregir, agregar y firmar.

## 1. Ver el estado del diccionario

```bash
npm run lexicon:report
```

Genera `docs/revision-lexico.html`: todos los términos en una página, con filtros por dominio, tipo, estado de revisión y aviso. Arriba, la lista de avisos ordenada por importancia clínica; toca uno para ver solo esos términos.

En la terminal, el mismo resumen:

```bash
npm run validate                          # resumen
npm run validate -- --regla mayusculas    # los términos de un aviso concreto
```

Los **errores** impiden subir cambios (rompen la app o la integridad). Los **avisos** son de calidad: se revisan con criterio clínico, no se corrigen solos.

## 2. Corregir o agregar en una planilla

```bash
npm run lexicon:export      # crea docs/planilla-terminos.csv
```

Ábrela en Excel, Numbers o Google Sheets (Archivo → Importar). Las listas (sinónimos, dominios, notas docentes) van **una por línea dentro de la celda**.

- **Corregir:** edita la celda. Solo cambian las columnas de la planilla; lo técnico del término queda igual.
- **Agregar:** fila nueva con `id` vacío y `prefijo`, `nombre`, `tipo`, `definicion` y `dominios` (p. ej. `DOM-08 primary_expression`). Si escribes una lista en `lista` (p. ej. `DOM-08/distorsiones_perceptivas`), el término aparecerá también en el Integrador y en la vista Dominios.
- Guarda como CSV (cualquier separador sirve).

```bash
npm run lexicon:import -- docs/planilla-terminos.csv            # muestra qué cambiaría
npm run lexicon:import -- docs/planilla-terminos.csv --aplicar  # lo aplica
```

Protecciones: si una fila tiene un error no se escribe nada; una celda vaciada no borra datos salvo con `--permitir-vaciar`; un término que ya existe por nombre o sinónimo (aunque sea en plural o sin paréntesis) no se crea dos veces.

## 3. Agregar un solo término desde la terminal

```bash
npm run term:new -- --prefijo PER --nombre "Palinopsia" --tipo síntoma \
  --dominio DOM-08 --definicion "…" --sinonimos "a; b" --lista DOM-08/distorsiones_perceptivas
```

`--prueba` muestra el resultado sin escribir. Antes de crear, busca términos parecidos y se detiene si ya existe.

## 4. Firmar la revisión clínica

```bash
npm run term:review -- PER_001 PER_002 --por "Dr. Cesar Celada"
npm run term:review -- PER_003 --estado en_revision --nota "Falta revisar exclusiones"
npm run term:review -- --listar
```

La firma guarda una huella del contenido. Si el término cambia después, la revisión queda **desactualizada**: la página lo marca y la app deja de mostrar "Revisado clínicamente" hasta que se vuelva a firmar.

Los términos nuevos nacen como **borrador**.

## 5. Antes de subir

```bash
npm run build && npm test
```

Si cambió el léxico, sube también `CACHE_NAME` en `sw.js` (ver `CLAUDE.md`).
