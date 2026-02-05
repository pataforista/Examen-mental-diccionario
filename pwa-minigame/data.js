// data.js
// Estructura mínima:
// TERMS: {id, term, definition, domain, difficulty, features:[...], discriminators:[{id,label,why}]}
// CASES: {id, stem, domain, difficulty, target_term_id, distractor_term_ids:[...], key_discriminator_id}

window.DB = {
    TERMS: [
        {
            id: "PER_001",
            term: "Alucinación verdadera",
            definition: "Percepción sin objeto, con vividez y corporeidad, ubicada en el espacio externo y con convicción de realidad.",
            domain: "PER",
            difficulty: 2,
            features: ["sin estímulo", "externalidad", "convicción", "corporeidad"],
            discriminators: [
                { id: "d_ext", label: "Ubicación externa + convicción de realidad", why: "Se vive como real y en el espacio externo." },
                { id: "d_ctrl", label: "No voluntaria / no controlable", why: "No depende de la voluntad del paciente." },
            ]
        },
        {
            id: "PER_004",
            term: "Pseudoalucinación",
            definition: "Experiencia perceptiva sin objeto, pero vivida como interna/subjetiva, con mayor distancia o insight variable.",
            domain: "PER",
            difficulty: 2,
            features: ["sin estímulo", "internalidad", "distancia"],
            discriminators: [
                { id: "d_int", label: "Ubicación interna/subjetiva", why: "Se experimenta 'dentro' (p. ej., en la mente)." },
                { id: "d_ins", label: "Insight parcial", why: "Puede reconocer rareza o dudar de la realidad externa." },
            ]
        },
        {
            id: "THO_010",
            term: "Fuga de ideas",
            definition: "Aceleración del pensamiento con asociaciones rápidas; el discurso salta de un tema a otro manteniendo conexiones superficiales.",
            domain: "THO",
            difficulty: 1,
            features: ["taquipsiquia", "asociaciones rápidas", "saltos"],
            discriminators: [
                { id: "d_speed", label: "Velocidad + asociaciones rápidas", why: "Predomina aceleración y cambio rápido." },
                { id: "d_link", label: "Conexiones superficiales presentes", why: "Hay hilo tenue (no es incoherencia total)." },
            ]
        },
        {
            id: "THO_020",
            term: "Incoherencia (ensalada de palabras)",
            definition: "Alteración grave de la forma del pensamiento con ruptura de sintaxis y sentido; el discurso resulta ininteligible.",
            domain: "THO",
            difficulty: 3,
            features: ["ruptura sintáctica", "ininteligible"],
            discriminators: [
                { id: "d_intel", label: "Pérdida de inteligibilidad", why: "No se entiende el mensaje global." },
                { id: "d_syntax", label: "Ruptura de sintaxis", why: "Estructura gramatical desorganizada." },
            ]
        },
        {
            id: "DOM_01_001", // Example for linking with main app domain 1
            term: "Obnubilación",
            definition: "Nivel de conciencia reducido, compromiso de la función de alerta y atención. El paciente requiere estímulos repetidos para responder.",
            domain: "DOM-01",
            difficulty: 2,
            features: ["respuesta lenta", "estímulos necesarios"],
            discriminators: [
                { id: "d_response", label: "Respuesta mantenida solo con estímulo", why: "Se duerme si no se estimula." }
            ]
        }
    ],

    CASES: [
        {
            id: "CASE_001",
            stem: "Paciente refiere: “Escucho una voz clara que viene del pasillo; me insulta y me ordena”. No hay estímulo audible presente.",
            domain: "PER",
            difficulty: 2,
            target_term_id: "PER_001",
            distractor_term_ids: ["PER_004", "THO_010"],
            key_discriminator_id: "d_ext"
        },
        {
            id: "CASE_002",
            stem: "Paciente describe pensamientos que “hablan dentro de mi cabeza”, los percibe como voces internas; reconoce que ‘suena raro’.",
            domain: "PER",
            difficulty: 2,
            target_term_id: "PER_004",
            distractor_term_ids: ["PER_001", "THO_020"],
            key_discriminator_id: "d_int"
        },
        {
            id: "CASE_003",
            stem: "En entrevista: discurso acelerado, cambia rápido de tema pero mantiene asociaciones; dificultad para interrumpirlo.",
            domain: "THO",
            difficulty: 1,
            target_term_id: "THO_010",
            distractor_term_ids: ["THO_020", "PER_004"],
            key_discriminator_id: "d_speed"
        }
    ]
};
