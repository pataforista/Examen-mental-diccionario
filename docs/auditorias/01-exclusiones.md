# Auditoría: Exclusiones (no confundir con)

> Generado con `npm run lexicon:audit` el 2026-11-27. La tabla se regenera con los datos actuales; **lo que escribas en «Decisión» se conserva**. Al corregirse, un caso pasa a «Resueltos» con su decisión.

## Qué revisa

Las exclusiones de cada término: el diagnóstico diferencial que el diccionario enseña («no confundir con…»). Cada exclusión guarda el ID del otro término y su nombre.

## Por qué importa

Una exclusión que apunta al término equivocado enseña un diferencial falso. Hoy la app no muestra exclusiones, pero son contenido clínico y la próxima función que las use heredará el error.

## Cómo decidir

- **Enlazada a otro término:** lee el nombre guardado y decide cuál es el término correcto. Si existe, corrige el ID; si no existe, decide si se crea o si la exclusión se elimina.
- **Nombre desactualizado:** basta con copiar el nombre actual del término enlazado, salvo que el cambio de nombre revele que ya no es el diferencial pertinente.
- **Se excluye a sí mismo:** casi siempre es un error de copia; busca el término al que debía apuntar.

## Cómo corregir

Edita `exclusions` en el archivo del término (`term_id`, `canonical_name`, `reason`). Si el término exclusión aún no existe y quieres conservarla, deja `"ref_status": "forward"`.

Después de corregir: `npm run build:lexicon`, `npm test` y vuelve a generar esta auditoría.

## Casos pendientes (16)

### Exclusión enlazada a otro término (10)

| Término o campo | Hallazgo | Decisión |
|---|---|---|
| ARC_006 · Dementia praecox <!-- k:56e0dc3e2d --> | "Psicosis maníaco-depresiva" enlaza a ARC_006, que es "Dementia praecox" (el propio término) |  |
| CAT_004 · Mutismo catatónico <!-- k:0833b766cc --> | "Afasia" enlaza a SPE_001, que es "Aprosodia" |  |
| NEU_001 · Agnosia visual <!-- k:007fb41a7a --> | "Alucinación" enlaza a PER_001, que es "Acoasmas" |  |
| PHM_004 · Anomalías de la vivencia del tiempo <!-- k:6205617987 --> | "Bradipsiquia" enlaza a AFF_003, que es "Ambivalencia" |  |
| RSK_007 · Intento suicida <!-- k:83b7302554 --> | "Autolesión no suicida" enlaza a RSK_004, que es "Capacidad de colaboración para seguridad" |  |
| SELF_009 · Impulsos impuestos <!-- k:329990995e --> | "Actos impuestos" enlaza a SELF_005, que es "Despersonalización" |  |
| SNM_001 · Síndrome Neuroléptico Maligno <!-- k:3bccc572fd --> | "Catatonía Maligna" enlaza a CAT_005, que es "Obediencia automática" |  |
| SPE_001 · Aprosodia <!-- k:4b38f3b6e9 --> | "Afecto plano" enlaza a AFF_011, que es "Atimia" |  |
| SPE_002 · Disartria <!-- k:0abfdcd7f1 --> | "Afasia" enlaza a SPE_005, que es "Logoclonia" |  |
| SPE_009 · Pararrespuestas (Vorbeireden) <!-- k:b572f29b50 --> | "Déficit intelectual" enlaza a COG_003, que es "Memoria de trabajo" |  |

### Exclusión con el nombre desactualizado (6)

| Término o campo | Hallazgo | Decisión |
|---|---|---|
| ARC_015 · Monomanía <!-- k:88197b3cc5 --> | DEL_010 figura como "Delirio primario"; hoy se llama "Delirio primario (Jaspers)" |  |
| ARC_020 · Wahnstimmung <!-- k:ae4bb09f97 --> | DEL_018 figura como "Humor delirante"; hoy se llama "Humor delirante (Wahnstimmung)" |  |
| NEU_005 · Síndrome de la mano alienígena <!-- k:8d6a41a3b5 --> | SELF_001 figura como "Actos impuestos"; hoy se llama "Actos impuestos (pasividad volitiva)" |  |
| NSC_003 · Anomalía del sentido de agencia <!-- k:bcae21d1c8 --> | SELF_001 figura como "Actos impuestos"; hoy se llama "Actos impuestos (pasividad volitiva)" |  |
| PHM_003 · Pérdida de la perspectiva (EASE) <!-- k:52c424d4af --> | COG_005 figura como "Pensamiento concreto"; hoy se llama "Pensamiento Abstracto / Concreto" |  |
| SPE_006 · Logorrea <!-- k:af16ab54bf --> | SPE_010 figura como "Presión del habla"; hoy se llama "Presión de habla" |  |

## Resueltos

Aún ninguno.
