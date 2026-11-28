# Auditoría: Exclusiones (no confundir con)

> Generado con `npm run lexicon:audit` el 2026-11-28. La tabla se regenera con los datos actuales; **lo que escribas en «Decisión» se conserva**. Al corregirse, un caso pasa a «Resueltos» con su decisión.

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

## Casos pendientes (0)

Ninguno.

## Resueltos

- 2026-11-27 · SPE_009 · Pararrespuestas (Vorbeireden): "Déficit intelectual" enlaza a COG_003, que es "Memoria de trabajo" — decisión: Creado COG_006 Déficit intelectual y enlazado (2026-11-27)
- 2026-11-27 · SPE_002 · Disartria: "Afasia" enlaza a SPE_005, que es "Logoclonia" — decisión: Creado SPE_012 Afasia y enlazado (2026-11-27)
- 2026-11-27 · CAT_004 · Mutismo catatónico: "Afasia" enlaza a SPE_001, que es "Aprosodia" — decisión: Creado SPE_012 Afasia y enlazado (2026-11-27)
- 2026-11-27 · ARC_006 · Dementia praecox: "Psicosis maníaco-depresiva" enlaza a ARC_006, que es "Dementia praecox" (el propio término) — decisión: Creado ARC_021 Psicosis maníaco-depresiva y enlazado (2026-11-27)
- 2026-11-27 · SPE_001 · Aprosodia: "Afecto plano" enlaza a AFF_011, que es "Atimia" — decisión: Corregido a AFF_010 (2026-11-27)
- 2026-11-27 · SNM_001 · Síndrome Neuroléptico Maligno: "Catatonía Maligna" enlaza a CAT_005, que es "Obediencia automática" — decisión: Corregido a CAT_001 (2026-11-27)
- 2026-11-27 · SELF_009 · Impulsos impuestos: "Actos impuestos" enlaza a SELF_005, que es "Despersonalización" — decisión: Corregido a SELF_001 (2026-11-27)
- 2026-11-27 · RSK_007 · Intento suicida: "Autolesión no suicida" enlaza a RSK_004, que es "Capacidad de colaboración para seguridad" — decisión: Corregido a RSK_003 (2026-11-27)
- 2026-11-27 · PHM_004 · Anomalías de la vivencia del tiempo: "Bradipsiquia" enlaza a AFF_003, que es "Ambivalencia" — decisión: Corregido a CNS_006 (2026-11-27)
- 2026-11-27 · NEU_001 · Agnosia visual: "Alucinación" enlaza a PER_001, que es "Acoasmas" — decisión: Corregido a PER_010 (2026-11-27)
- 2026-11-27 · SPE_006 · Logorrea: SPE_010 figura como "Presión del habla"; hoy se llama "Presión de habla"
- 2026-11-27 · PHM_003 · Pérdida de la perspectiva (EASE): COG_005 figura como "Pensamiento concreto"; hoy se llama "Pensamiento Abstracto / Concreto"
- 2026-11-27 · NSC_003 · Anomalía del sentido de agencia: SELF_001 figura como "Actos impuestos"; hoy se llama "Actos impuestos (pasividad volitiva)"
- 2026-11-27 · NEU_005 · Síndrome de la mano alienígena: SELF_001 figura como "Actos impuestos"; hoy se llama "Actos impuestos (pasividad volitiva)"
- 2026-11-27 · ARC_020 · Wahnstimmung: DEL_018 figura como "Humor delirante"; hoy se llama "Humor delirante (Wahnstimmung)"
- 2026-11-27 · ARC_015 · Monomanía: DEL_010 figura como "Delirio primario"; hoy se llama "Delirio primario (Jaspers)"
