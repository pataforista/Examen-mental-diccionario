# Guía de revisión clínica del diccionario

Esta guía es para quien revisa el **contenido** de los términos: psiquiatras, residentes de últimos años o psicólogos clínicos con formación en semiología. Las herramientas están en [LEXICO.md](LEXICO.md); las auditorías por tema, en [auditorias/](auditorias/README.md).

## Qué significa «revisado»

Firmar un término (`npm run term:review`) afirma que una persona con criterio clínico **leyó el término completo tal como está hoy** y lo considera correcto para enseñar semiología. No afirma que sea exhaustivo.

La firma guarda una huella del contenido. Si alguien cambia el término después, la revisión queda **desactualizada**: la página de revisión lo marca y la app deja de mostrar «Revisado clínicamente» en la ficha hasta que se vuelva a firmar. Nadie puede firmar en nombre de otra persona.

## Antes de empezar

```bash
npm run lexicon:report    # página con todos los términos, filtros y avisos
npm run lexicon:audit     # auditorías por tema en docs/auditorias/
npm run term:review -- --listar
```

Trabaja por lotes pequeños (un dominio o una auditoría por sesión) y sube los cambios al terminar cada lote: así cada revisión queda en el historial con su fecha.

## Orden de prioridad

1. **Revisiones desactualizadas.** Ya estuvieron revisadas; solo hay que leer qué cambió (`git log -p` del archivo) y volver a firmar.
2. **Riesgo alto.** En la página de revisión, ordena por «Mayor riesgo primero». Son los términos que la ficha marca con el recuadro rojo de alerta (riesgo 2 o más: 74 términos hoy) y los que más daño hacen si están mal.
3. **Errores de contenido:** [exclusiones](auditorias/01-exclusiones.md) y [codificación CIE-11](auditorias/02-codificacion-cie11.md).
4. **Por dominio**, en el orden del examen mental (DOM-01 a DOM-15). Revisar un dominio completo de una vez ayuda a ver solapamientos y diferenciales entre términos vecinos.
5. **Taxonomía** ([auditoría](auditorias/06-taxonomia.md)): son decisiones de estilo para todo el diccionario; conviene tomarlas una vez y aplicarlas en bloque.

## Lista de comprobación por término

Lee el término en la página de revisión (o en su archivo). Para cada campo:

| Campo | Qué comprobar |
|---|---|
| **Nombre** | Término de uso actual en español; solo la primera palabra en mayúscula, salvo epónimos. Si el término clásico es en otro idioma, va entre paréntesis. |
| **Tipo** | ¿Es signo (observable), síntoma (referido), fenómeno, síndrome, concepto histórico…? Un error frecuente es llamar «síntoma» a lo que solo se observa. |
| **Definición** | Operacional: permite decidir si está presente. No circular (no usa la palabra que define). No asume etiología. Una o dos oraciones. |
| **Rasgos requeridos** | Los criterios mínimos para afirmarlo; no repiten la definición. |
| **Marcador subjetivo** | Cómo lo diría el paciente, entre comillas y sin tecnicismos. «Refiere experiencia compatible con…» no sirve: no enseña a reconocerlo. |
| **Marcador conductual** | Lo que el examinador observa; nada que dependa de lo que el paciente cuenta. |
| **Sinónimos** | De uso real (pacientes, colegas, tradición clínica). Ninguno debe ser el nombre de otro término; un tipo (micropsia) no es sinónimo de su categoría (distorsión perceptiva). |
| **Dominios** | El dominio donde se expresa principalmente y, si aplica, los secundarios con su relación. |
| **Exclusiones** | Los diferenciales que de verdad se confunden en clínica, cada uno con su razón. Comprueba que el ID lleve al término nombrado. |
| **Riesgo (0–5)** | Coherente con el resto del diccionario. **Hoy la escala no tiene definición escrita para los niveles 3 a 5** (ver [taxonomía](auditorias/06-taxonomia.md)): hasta que se defina, anota en la nota de revisión si el nivel te parece discutible. |
| **Alertas** | Para riesgo alto: una conducta concreta («si hay plan + acceso a medios + horizonte corto, escalar a…»), no una advertencia genérica. |
| **Código CIE-11** | Verificado en el navegador oficial (icd.who.int/browse). Mejor vacío que un código genérico forzado. |
| **Notas docentes y errores frecuentes** | Lo que un residente suele confundir o pasar por alto; perlas breves. |

Si algo necesita cambio: corrígelo (planilla, archivo o `term:new`), regenera (`npm run build:lexicon`) y **firma después**, para que la huella corresponda al contenido corregido.

## Cómo registrar el resultado

| Situación | Qué hacer |
|---|---|
| El término está bien | `npm run term:review -- ID --por "Tu nombre"` |
| Corregiste algo | Corrige, `npm run build:lexicon`, luego firma igual que arriba |
| Necesita cambios que no puedes hacer ahora | `npm run term:review -- ID --estado en_revision --nota "qué falta"` |
| Hay una duda que debe resolver otra persona | `--estado en_revision --nota "Duda: …"` y anótala también en la auditoría del tema |
| Un hallazgo de auditoría no requiere cambio | Escribe en la columna «Decisión» por qué (p. ej. «no aplica: concepto histórico, no se usa al redactar») |

Varias firmas a la vez solo para términos que leíste uno por uno en esa sesión: `npm run term:review -- ID1 ID2 ID3 --por "…"`.

## Desacuerdos

Si dos revisores discrepan, el término queda «en revisión» con una nota que resuma ambas posiciones y la fuente de cada una. Para términos de riesgo alto se recomienda que una segunda persona lea el término antes de firmarlo; menciónala en la nota (`--nota "Segunda lectura: …"`).

## Lo que no se hace

- Firmar en lote términos que no se leyeron.
- Firmar en nombre de otra persona.
- Cambiar un código CIE-11 sin verificarlo en la fuente oficial.
- Elegir automáticamente entre dos versiones contradictorias (códigos, exclusiones): cada caso se decide.
- Reordenar los descriptores de los dominios sin criterio clínico: su orden puede ser una escala (alerta → somnolencia → obnubilación → estupor → coma).

## Ejemplo: Acoasmas (PER_001)

La página de revisión muestra dos avisos:

- **Marcador subjetivo genérico:** «El paciente refiere experiencia compatible con acoasmas.» Una versión útil: «Oigo zumbidos o chasquidos que nadie más escucha».
- **Código CIE-11:** sin código propio, y `lexicon/mappings/` propone uno. Se verifica en la CIE-11 antes de aceptarlo.

Corriges el marcador, verificas el código, corres `npm run build:lexicon` y firmas: `npm run term:review -- PER_001 --por "Tu nombre"`. Al regenerar las auditorías, ambos casos pasan a «Resueltos».
