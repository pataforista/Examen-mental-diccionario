export const integrator = {
  currentStep: 0,
  steps: [{
    id: 1,
    label: "Consciencia y orientación",
    domain: "DOM-01",
    guide: "¿Está alerta, somnoliento, estuporoso, confuso, obnubilado, en coma?\nOrientación: Persona (¿Cómo se llama?), Lugar (¿Dónde estamos?), Tiempo (Día, mes, año), Situación (¿Sabe por qué está aquí?)",
    example: "Paciente consciente, alerta. Orientado en persona, lugar, tiempo y situación.",
    description: "Evaluación del estado de alerta y ubicación."
  }, {
    id: 2,
    label: "Higiene, vestimenta y aliento",
    domain: "DOM-02",
    components: ["higiene", "vestimenta_y_aliño", "aliento"],
    guide: "Ropa adecuada al clima/situación, limpia o descuidada.\nHigiene personal (olor corporal, cabello, uñas).\nAliento (alcohol, cetonas, fétido, normal).",
    example: "Vestimenta desordenada, ropa sucia. Higiene deficiente. Aliento normal.",
    description: "Observación de aliño y presentación física."
  }, {
    id: 3,
    label: "Posición",
    domain: "DOM-02",
    components: ["postura"],
    guide: "De pie, sentado, en cama, encamado, postura fija, decúbito activo/pasivo.",
    example: "Paciente sentado voluntariamente en la camilla.",
    description: "Postura corporal predominante."
  }, {
    id: 4,
    label: "Facies",
    domain: "DOM-02",
    components: ["facies"],
    guide: "Expresión facial (triste, angustiada, hostil, desconfiada, indiferente, perpleja, eufórica, inexpresiva).",
    example: "Facies de angustia e indiferencia.",
    description: "Mímica y expresión facial."
  }, {
    id: 5,
    label: "Función psicomotriz",
    domain: "DOM-04",
    guide: "Movimientos anormales (temblor, tics, acatisia, estereotipias, corea). Inhibición o agitación. Catalepsia, flexibilidad cérea.",
    example: "Agitación psicomotriz generalizada, sin temblores.",
    description: "Actividad motora observable."
  }, {
    id: 6,
    label: "Actitud",
    domain: "DOM-03",
    components: ["actitud"],
    guide: "Cooperadora, hostil, negativista, seductora, distante, apática, provocadora.",
    example: "Actitud cooperadora durante la entrevista.",
    description: "Disposición hacia el examinador."
  }, {
    id: 7,
    label: "Contacto visual",
    domain: "DOM-03",
    components: ["contacto_visual"],
    guide: "Fijo, evitativo, perdido, amenazante, de seducción.",
    example: "Contacto visual evitativo, ocasional.",
    description: "Conexión visual con el examinador."
  }, {
    id: 8,
    label: "Habla (volumen, cantidad, tono)",
    domain: "DOM-05",
    components: ["volumen_y_tono", "velocidad_y_ritmo"],
    guide: "Volumen (alto, bajo, normal), Cantidad (escasa, logorrea, pobre), Tono (monótono, modulado, enfático).",
    example: "Habla espontánea, volumen bajo, cantidad escasa, tono monótono.",
    description: "Características sonoras del lenguaje."
  }, {
    id: 9,
    label: "Discurso",
    domain: "DOM-05",
    components: ["articulacion"],
    guide: "Velocidad (lento, presionado, normal), Organización (coherente, divagante, tangencial, circunstancial).",
    example: "Discurso lento, coherente pero con tendencia a divagaciones.",
    description: "Forma y fluidez del relato."
  }, {
    id: 10,
    label: "Lenguaje",
    domain: "DOM-05",
    components: ["lenguaje_simbolico"],
    guide: "Neologismos, parafasias, jergafasia, ecolalia, mutismo.",
    example: "Lenguaje sin alteraciones; sin neologismos ni parafasias.",
    description: "Uso de símbolos y reglas gramaticales."
  }, {
    id: 11,
    label: "Curso del pensamiento",
    domain: "DOM-06",
    guide: "Acelerado, enlentecido, bloqueo, robo, fuga de ideas, incoherencia.",
    example: "Curso del pensamiento enlentecido, sin bloqueos.",
    description: "Flujo y velocidad de las ideas."
  }, {
    id: 12,
    label: "Ideación suicida",
    domain: "DOM-12",
    guide: "¿Ha pensado que la vida no vale la pena? ¿Ha pensado en morir? ¿Tiene plan/medios?\n¿Hay ideación homicida?",
    example: "Niega ideación suicida u homicida en la actualidad.",
    description: "Evaluación de riesgo vital."
  }, {
    id: 13,
    label: "Contenido del pensamiento",
    domain: "DOM-07",
    guide: "Delirios (persecutorio, místico, grandeza), Obsesiones, Fobias, Ideas sobrevaloradas.",
    example: "Contenido delirante de tipo persecutorio y autorreferencial.",
    description: "El qué de lo que el paciente piensa."
  }, {
    id: 14,
    label: "Ánimo",
    domain: "DOM-09",
    components: ["animo_subjetivo"],
    guide: "¿Cómo se ha sentido? ¿Triste, alegre, irritable?\nEscala subjetiva 0-10.",
    example: "Ánimo disfórico, refiere tristeza 8/10.",
    description: "Estado subjetivo reportado por el paciente."
  }, {
    id: 15,
    label: "Afecto",
    domain: "DOM-09",
    components: ["afecto_observable", "reactividad_afectiva", "rango_afectivo", "regulacion_afectiva", "congruencia_afectiva"],
    guide: "Tipo (depresivo, ansioso, irritable), Modulación (reactivo, lábil, restringido). Adecuación al discurso.",
    example: "Afecto ansioso, reactivo, adecuado al contenido verbal.",
    description: "Expresión emocional observable."
  }, {
    id: 16,
    label: "Sensopercepción",
    domain: "DOM-08",
    guide: "¿Oye/ve cosas que otros no? Alucinaciones (auditivas, visuales, etc.), Ilusiones, Despersonalización.",
    example: "Alucinaciones auditivas simples (escucha que le llaman).",
    description: "Evaluación de percepciones."
  }, {
    id: 17,
    label: "Funciones mentales superiores",
    domain: "DOM-10",
    guide: "a) Memoria (Reciente, Mediata, Remota)\nb) Atención (Dígitos, Mundo al revés)\nc) Abstracción (Semejanzas, Refranes)\nd) Cálculo\ne) Conocimiento (Gnosias, info general)",
    example: "Memoria y atención conservadas; abstracción en nivel concreto.",
    description: "Evaluación cognitiva global."
  }, {
    id: 18,
    label: "Conciencia de enfermedad",
    domain: "DOM-11",
    components: ["insight_de_enfermedad"],
    guide: "¿Cree que tiene algún problema? ¿Necesita tratamiento?",
    example: "Ausencia de conciencia de enfermedad; niega trastorno.",
    description: "Reconocimiento de la patología."
  }, {
    id: 19,
    label: "Juicio",
    domain: "DOM-11",
    components: ["juicio_practico", "juicio_social"],
    guide: "¿Qué haría ante un incendio? ¿Si se queda sin dinero?",
    example: "Juicio conservado para situaciones prácticas.",
    description: "Capacidad de toma de decisiones."
  }, {
    id: 20,
    label: "Proyección a futuro",
    domain: "DOM-11",
    components: ["proyeccion_a_futuro"],
    guide: "¿Cómo se ve en un año? ¿Tiene metas/planes?",
    example: "Proyección a futuro pesimista, sin planes concretos.",
    description: "Expectativas y prospectiva de vida."
  }],
  responses: {},
  init: function () {
    this.cacheDOM();
    this.bindEvents();
    this.renderStepsList();
    this.renderCurrentStep();
    this.updateReport();
    this.updateProgressBar();
  },
  teachingMode: true,
  updateProgressBar: function () {
    const total = this.steps.length;
    const completed = this.steps.filter(s => !!this.responses[s.id]).length;
    const pct = completed / total * 100;
    if (this.nodes.progressBar) {
      this.nodes.progressBar.style.width = `${pct}%`;
    }
  },
  loadPedagogicalData: function () {
    this.discriminators = {
      PER_001: {
        label: "Alucinación verdadera",
        why: "Sin objeto, externa, con convicción."
      },
      PER_004: {
        label: "Pseudoalucinación",
        why: "Sin objeto, interna (dentro de la mente)."
      },
      THO_010: {
        label: "Fuga de ideas",
        why: "Asociaciones rápidas pero con hilo conductor superficial."
      },
      THO_020: {
        label: "Incoherencia",
        why: "Pérdida total de sintaxis y sentido."
      }
    };
  },
  cacheDOM: function () {
    this.nodes = {
      stepsList: document.getElementById("integrator-steps-list"),
      stepLabel: document.getElementById("step-label"),
      stepDescription: document.getElementById("step-description"),
      optionsContainer: document.getElementById("step-options-container"),
      stepText: document.getElementById("step-text"),
      prevBtn: document.getElementById("int-prev-btn"),
      nextBtn: document.getElementById("int-next-btn"),
      reportOutput: document.getElementById("report-output"),
      copyBtn: document.getElementById("int-copy-btn"),
      resetBtn: document.getElementById("int-reset-btn"),
      progressBar: document.getElementById("int-progress-bar"),
      teachingToggle: document.getElementById("int-teaching-mode")
    };
  },
  bindEvents: function () {
    if (this._bound) return;
    this._bound = true;
    this.nodes.prevBtn.addEventListener("click", () => this.navigate(-1));
    this.nodes.nextBtn.addEventListener("click", () => this.navigate(1));
    this.nodes.resetBtn.addEventListener("click", () => this.reset());
    this.nodes.copyBtn.addEventListener("click", () => this.copyReport());
    this.nodes.stepText.addEventListener("input", e => {
      const step = this.steps[this.currentStep];
      this.responses[step.id] = e.target.value;
      this.updateReport();
      this.updateStepStatus(step.id);
    });
    this.nodes.reportOutput.addEventListener("input", e => {});
  },
  renderStepsList: function () {
    this.nodes.stepsList.innerHTML = this.steps.map((step, index) => `
                <li class="step-item ${index === this.currentStep ? "active" : ""} ${this.responses[step.id] ? "completed" : ""}" 
                    onclick="App.integrator.goToStep(${index})" id="step-nav-${step.id}">
                    <span class="step-number">${index + 1}</span>
                    <span class="step-text-label">${step.label}</span>
                </li>
            `).join("");
  },
  renderCurrentStep: function () {
    const step = this.steps[this.currentStep];
    if (!step) return;
    this.nodes.stepLabel.textContent = `${this.currentStep + 1}. ${step.label}`;
    this.nodes.stepDescription.innerHTML = `
                <div style="margin-bottom:0.75rem; color:var(--text-p); font-size:0.9rem; font-weight:500;">${App.utils.sanitizeHTML(step.description)}</div>
                ${step.guide ? `<div class="mnemonic-hint" style="background:rgba(var(--accent-rgb), 0.1); border-color:var(--accent); margin-top:0.5rem; padding:0.75rem; border-radius:8px; font-size:0.85rem;"><strong>🔎 QUÉ OBSERVAR / PREGUNTAR:</strong><br>${App.utils.sanitizeHTML(step.guide).replace(/\n/g, "<br>")}</div>` : ""}
                ${step.example ? `<div class="mnemonic-hint" style="background:rgba(var(--primary-rgb), 0.05); color:var(--text-secondary); border-style:dashed; margin-top:0.5rem; padding:0.75rem; border-radius:8px; font-size:0.85rem;"><strong>✍️ REDACCIÓN EJEMPLO:</strong><br>${App.utils.sanitizeHTML(step.example)}</div>` : ""}
            `;
    this.nodes.stepText.value = this.responses[step.id] || "";
    this.nodes.stepText.placeholder = step.example || "Escribe tus observaciones aquí...";
    this.renderOptionsForStep(step);
    this.nodes.prevBtn.disabled = this.currentStep === 0;
    this.nodes.nextBtn.textContent = this.currentStep === this.steps.length - 1 ? "Finalizar" : "Siguiente →";
    const items = this.nodes.stepsList.querySelectorAll(".step-item");
    items.forEach((item, i) => item.classList.toggle("active", i === this.currentStep));
  },
  renderOptionsForStep: function (step) {
    const domain = App.data.domains.find(d => d.domain_id === step.domain);
    if (!domain) {
      this.nodes.optionsContainer.textContent = "";
      this.nodes.optionsContainer.insertAdjacentHTML("beforeend", '<p style="font-size:0.8rem; opacity:0.5;">No hay términos asociados.</p>');
      return;
    }
    let terms = [];
    if (step.components) {
      step.components.forEach(compId => {
        const comp = domain.subcomponents?.find(c => c.id === compId);
        if (comp && comp.accepted_terms) terms = [...terms, ...comp.accepted_terms];
      });
    } else {
      domain.subcomponents?.forEach(comp => {
        if (comp.accepted_terms) terms = [...terms, ...comp.accepted_terms];
      });
    }
    terms = [...new Set(terms)];
    if (terms.length === 0) {
      this.nodes.optionsContainer.textContent = "";
      this.nodes.optionsContainer.insertAdjacentHTML("beforeend", '<p style="font-size:0.8rem; opacity:0.5;">No hay términos asociados.</p>');
      return;
    }
    this.nodes.optionsContainer.innerHTML = terms.map(t => {
      const isSelected = this.responses[step.id]?.includes(t.replace(/_/g, " "));
      return `<div class="int-opt ${isSelected ? "selected" : ""}" onclick="App.integrator.toggleTerm('${t}')">${t.replace(/_/g, " ")}</div>`;
    }).join("");
  },
  toggleTerm: function (term) {
    App.utils.haptic();
    const step = this.steps[this.currentStep];
    const cleanTerm = term.replace(/_/g, " ");
    let current = this.responses[step.id] || "";
    if (current.includes(cleanTerm)) {
      current = current.replace(new RegExp(`${cleanTerm},?\\s?`, "g"), "").trim();
      if (current.endsWith(",")) current = current.slice(0, -1);
    } else {
      current = current ? `${current}, ${cleanTerm}` : cleanTerm;
    }
    this.responses[step.id] = current;
    this.nodes.stepText.value = current;
    this.updateReport();
    this.renderOptionsForStep(step);
    this.updateStepStatus(step.id);
  },
  updateStepStatus: function (stepId) {
    const el = document.getElementById(`step-nav-${stepId}`);
    if (el) el.classList.toggle("completed", !!this.responses[stepId]);
  },
  navigate: function (dir) {
    App.utils.haptic();
    const next = this.currentStep + dir;
    if (next >= 0 && next < this.steps.length) {
      this.currentStep = next;
      this.renderCurrentStep();
      App.nodes.content.scrollTop = 0;
    } else if (next === this.steps.length) {
      App.toast.show("✅ ¡Examen completado! Revisa y copia el reporte final.", "success", 4000);
    }
  },
  goToStep: function (index) {
    this.currentStep = index;
    this.renderCurrentStep();
  },
  updateReport: function () {
    let fullText = "";
    this.steps.forEach(s => {
      if (this.responses[s.id]) {
        fullText += `${s.label}: ${this.responses[s.id]}.\n`;
      }
    });
    if (!fullText) {
      this.nodes.reportOutput.textContent = "Tu reporte aparecerá aquí a medida que avances...";
    } else {
      this.nodes.reportOutput.textContent = fullText;
    }
  },
  copyReport: function () {
    const text = this.nodes.reportOutput.innerText;
    if (!text || text.startsWith("Tu reporte")) {
      App.toast.show("Completa al menos un paso antes de copiar.", "warning");
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      App.utils.haptic();
      App.toast.show("📋 Reporte copiado al portapapeles", "success");
      const original = this.nodes.copyBtn.innerHTML;
      this.nodes.copyBtn.textContent = "✅ ¡Copiado!";
      setTimeout(() => {
        this.nodes.copyBtn.innerHTML = original;
      }, 2200);
    }).catch(() => {
      App.toast.show("No se pudo copiar. Selecciona el texto manualmente.", "error");
    });
  },
  reset: function () {
    if (confirm("¿Reiniciar el asistente? Se borrarán todas tus respuestas.")) {
      this.responses = {};
      this.currentStep = 0;
      this.renderStepsList();
      this.renderCurrentStep();
      this.updateReport();
      this.updateProgressBar();
      App.toast.show("Examen reiniciado", "info");
    }
  }
};
