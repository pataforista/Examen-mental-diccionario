# Auditorías del léxico

> Generado con `npm run lexicon:audit` el 2026-11-28. Cómo trabajar con estos documentos: [guía de revisión clínica](../GUIA_REVISION_CLINICA.md).

Cada auditoría reúne un tipo de hallazgo que necesita **criterio clínico**: el validador los detecta, pero no puede decidir cuál es la opción correcta. Los errores que rompen la app no están aquí: los bloquea `npm test`.

| Auditoría | Pendientes | Con decisión anotada | Resueltos |
|---|---:|---:|---:|
| [Exclusiones (no confundir con)](01-exclusiones.md) | 0 | 0 | 16 |
| [Codificación CIE-11](02-codificacion-cie11.md) | 0 | 0 | 22 |
| [Dominios y listas del Integrador](03-dominios.md) | 202 | 1 | 12 |
| [Sinónimos](04-sinonimos.md) | 1 | 1 | 25 |
| [Redacción clínica](05-redaccion.md) | 73 | 0 | 57 |
| [Taxonomía y vocabularios](06-taxonomia.md) | 0 | 0 | 19 |
| [Cobertura de la revisión clínica](07-cobertura-revision.md) | 294 | 0 | 0 |

Orden sugerido: exclusiones y codificación primero (son errores de contenido), luego dominios y sinónimos (afectan a la búsqueda y al Integrador), y al final redacción y taxonomía. La cobertura de revisión avanza en paralelo.
