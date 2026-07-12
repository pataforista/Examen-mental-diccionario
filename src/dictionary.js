export const dictionary = {
  init: async function () {
    this.cacheDOM();
    this.registerSW();
    this._showSkeletonTerms();
    this.bindEvents();
    await this.loadData();
    this.setupSearch();
    this.loadRecentSearches();
    this.renderAllTerms();
    this.renderTermOfTheDay();
    this.theme.init();
    this.donation.init();
    this.pwa.init();
    this.handleInitialHash();
    this.checkOnboarding();
    this.navIndicator.init();
    this._setupScrollCompact();
    setTimeout(() => this.navIndicator.update(), 50);
  },
  _showSkeletonTerms: function () {
    if (!this.nodes.allTermsList) return;
    const skeletons = Array.from({
      length: 8
    }, () => `
            <div class="skeleton-card">
                <div class="skeleton-block skeleton-title"></div>
                <div class="skeleton-block skeleton-text"></div>
                <div class="skeleton-block skeleton-text-sm"></div>
            </div>`).join("");
    this.nodes.allTermsList.innerHTML = skeletons;
  },
  _setupScrollCompact: function () {
    const header = document.querySelector(".app-header");
    const main = document.querySelector("main");
    if (!header || !main) return;
    let lastY = 0;
    main.addEventListener("scroll", () => {
      const y = main.scrollTop;
      if (y > 60 && y > lastY) {
        header.classList.add("compact");
      } else if (y < lastY || y < 20) {
        header.classList.remove("compact");
      }
      lastY = y;
    }, {
      passive: true
    });
  },
  checkOnboarding: function () {
    try {
      if (!localStorage.getItem("mse_onboarded_v2.2")) {
        setTimeout(() => {
          App.toast.show("📤 Nuevo: comparte términos como tarjetas clínicas. Pulsa el botón compartir en cualquier ficha.", "info", 5000);
          try {
            localStorage.setItem("mse_onboarded_v2.2", "true");
          } catch(e) { console.warn(e); }
        }, 1800);
      }
    } catch(e) { console.warn(e); }
  },
  speakTerm: function (termId) {
    const term = this.data.terms.find(t => t.term_id === termId);
    if (!term) return;
    const text = `${term.canonical_name}. ${term.definition_clinical?.core || ""}`;
    this.utils.speakTerm(text);
    this.utils.haptic();
  },
  handleInitialHash: function () {
    const hash = window.location.hash;
    if (!hash) return;
    if (hash.startsWith("#term/")) {
      const termId = hash.replace("#term/", "");
      this.viewTerm(termId);
    } else if (hash.startsWith("#domain/")) {
      const domainId = hash.replace("#domain/", "");
      this.renderView("domain");
      this.renderDomains();
      this.viewDomainDetails(domainId);
    } else if (hash.length > 1) {
      const tabId = `nav-${hash.substring(1)}`;
      this.switchTab(tabId);
    }
  },
  registerSW: function () {
    if (!(("serviceWorker" in navigator))) return;
    const hadController = !!navigator.serviceWorker.controller;
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing || !hadController) return;
      refreshing = true;
      window.location.reload();
    });
    const promote = worker => {
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          worker.postMessage({
            type: "SKIP_WAITING"
          });
        }
      });
    };
    navigator.serviceWorker.register("sw.js").then(reg => {
      const checkForUpdate = () => reg.update().catch(() => {});
      checkForUpdate();
      setInterval(checkForUpdate, 1000 * 60 * 60);
      window.addEventListener("focus", checkForUpdate);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkForUpdate();
      });
      if (reg.waiting && navigator.serviceWorker.controller) {
        reg.waiting.postMessage({
          type: "SKIP_WAITING"
        });
      }
      reg.addEventListener("updatefound", () => promote(reg.installing));
    }).catch(err => console.error("Service Worker registration failed:", err));
  },
  cacheDOM: function () {
    this.nodes = {
      search: document.getElementById("global-search"),
      content: document.getElementById("app-content"),
      dictionaryView: document.getElementById("dictionary-view"),
      resultsView: document.getElementById("results-view"),
      termView: document.getElementById("term-view"),
      domainView: document.getElementById("domain-view"),
      casesView: document.getElementById("cases-view"),
      integratorView: document.getElementById("integrator-view"),
      aboutView: document.getElementById("about-view"),
      allTermsList: document.getElementById("all-terms-list"),
      recentSearchesBar: document.getElementById("recent-searches"),
      recentList: document.getElementById("recent-list"),
      navButtons: document.querySelectorAll(".bottom-nav button"),
      aboutBtn: document.getElementById("about-btn"),
      themeToggle: document.getElementById("theme-toggle"),
      gameView: document.getElementById("game-view"),
      clearSearchBtn: document.getElementById("clear-search"),
      termOfTheDay: document.getElementById("term-of-the-day")
    };
  },
  bindEvents: function () {
    this.nodes.search.addEventListener("input", e => {
      clearTimeout(this.data.searchDebounceTimer);
      this.data.searchDebounceTimer = setTimeout(() => {
        this.handleSearch(e.target.value);
      }, 180);
    });
    this.nodes.navButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const tabId = btn.id;
        this.switchTab(tabId);
        history.pushState({
          view: tabId
        }, "", `#${tabId.replace("nav-", "")}`);
      });
    });
    this.nodes.aboutBtn.addEventListener("click", () => {
      this.viewAbout();
      history.pushState({
        view: "about"
      }, "", "#about");
    });
    this.nodes.themeToggle.addEventListener("click", () => this.theme.toggle());
    if (this.nodes.clearSearchBtn) {
      this.nodes.clearSearchBtn.addEventListener("click", () => {
        this.nodes.search.value = "";
        this.nodes.clearSearchBtn.classList.add("hidden");
        this.handleSearch("");
        this.nodes.search.focus();
      });
    }
    window.addEventListener("popstate", e => this.handlePopState(e.state));
    document.addEventListener("keydown", e => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        this.nodes.search.focus();
        this.nodes.search.select();
      }
    });
    document.addEventListener("pointerdown", e => {
      const btn = e.target.closest(".btn.primary, .btn.secondary");
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.6;
      const wave = document.createElement("span");
      wave.className = "ripple-wave";
      wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(wave);
      wave.addEventListener("animationend", () => wave.remove(), {
        once: true
      });
    });
  },
  handlePopState: function (state) {
    if (!state) {
      this.switchTab("nav-dictionary");
      return;
    }
    if (state.view === "term" && state.termId) {
      this.viewTerm(state.termId, true);
    } else if (state.view === "domain" && state.domainId) {
      if (!document.getElementById("domain-detail-container")) {
        this.renderView("domain");
        this.renderDomains();
      }
      this.viewDomainDetails(state.domainId, true);
    } else if (state.view.startsWith("nav-")) {
      this.switchTab(state.view);
    } else if (state.view === "about") {
      this.viewAbout();
    } else {
      this.switchTab("nav-dictionary");
    }
  },
  loadData: async function () {
    const startTime = performance.now();
    try {
      const lexiconPromise = fetch("lexicon/lexicon_bundle.json").then(r => r.json());
      const domainIds = Array.from({
        length: 15
      }, (_, i) => `DOM-${(i + 1).toString().padStart(2, "0")}`);
      const domainPromises = domainIds.map(async id => {
        const slug = this.getDomainSlug(id);
        try {
          const response = await fetch(`domains/${id}_${slug}.json`);
          if (!response.ok) throw new Error(`Domain ${id} not found`);
          return await response.json();
        } catch (e) {
          return {
            domain_id: id,
            domain_name: id.replace("-", " "),
            subcomponents: []
          };
        }
      });
      const caseFiles = ["OSCE_001–003.json", "OSCE_004–OSCE_009.json", "OSCE_010–OSCE_015.json", "OSCE_016–025.json", "OSCE_026–035.json"];
      const casePromises = caseFiles.map(file => fetch(file).then(r => r.json()).catch(() => []));
      const [lexiconData, domainsData, casesDataArrays] = await Promise.all([lexiconPromise, Promise.all(domainPromises), Promise.all(casePromises)]);
      this.data.terms = lexiconData.terms || [];
      this.data.domains = domainsData;
      this.data.cases = (casesDataArrays || []).flat();
      this.data.terms.sort((a, b) => (a.canonical_name || "").localeCompare(b.canonical_name || ""));
      console.log(`🚀 Clinical Data Loaded in ${Math.round(performance.now() - startTime)}ms`);
    } catch (error) {
      console.error("Critical error loading clinical data:", error);
      this.data.terms = this.data.terms || [];
      this.data.domains = this.data.domains || [];
      this.data.cases = this.data.cases || [];
      if (this.nodes.allTermsList) {
        this.nodes.allTermsList.innerHTML = `
                    <div style="padding:2rem; text-align:center; opacity:0.7;">
                        <p style="font-size:1.1rem; margin-bottom:1rem;">Sin conexión</p>
                        <p style="font-size:0.9rem;">No se pudo cargar el diccionario. Verifica tu conexión e intenta de nuevo.</p>
                        <button class="btn secondary" style="margin-top:1rem;" onclick="window.location.reload()">Reintentar</button>
                    </div>`;
      }
    }
  },
  getDomainSlug: function (id) {
    const slugs = {
      "DOM-01": "conciencia_orientacion",
      "DOM-02": "apariencia_general",
      "DOM-03": "actitud_interaccion",
      "DOM-04": "psicomotricidad_conacion",
      "DOM-05": "habla_lenguaje",
      "DOM-06": "pensamiento_curso_forma",
      "DOM-07": "pensamiento_contenido",
      "DOM-08": "sensopercepcion",
      "DOM-09": "estado_afectivo_animo_afecto",
      "DOM-10": "funciones_cognitivas",
      "DOM-11": "juicio_insight",
      "DOM-12": "riesgo",
      "DOM-13": "integracion_sindromatica",
      "DOM-14": "docencia",
      "DOM-15": "fenomenologia_historica"
    };
    return slugs[id] || "";
  },
  getDomainIcon: function (id) {
    const icons = {
      "DOM-01": "🧠",
      "DOM-02": "👤",
      "DOM-03": "🤝",
      "DOM-04": "🏃",
      "DOM-05": "🗣️",
      "DOM-06": "🔄",
      "DOM-07": "💡",
      "DOM-08": "👁️",
      "DOM-09": "🎭",
      "DOM-10": "🧩",
      "DOM-11": "⚖️",
      "DOM-12": "⚠️",
      "DOM-13": "🏥",
      "DOM-14": "🎓",
      "DOM-15": "📜"
    };
    return icons[id] || "🔹";
  },
  setupSearch: function () {
    if (!window.Fuse) return;
    this.data.fuse = new Fuse(this.data.terms, {
      keys: [{
        name: "canonical_name",
        weight: 1.0
      }, {
        name: "synonyms_and_slang.term",
        weight: 0.7
      }, {
        name: "definition_clinical.core",
        weight: 0.4
      }],
      threshold: 0.4,
      distance: 100,
      location: 0,
      minMatchCharLength: 2,
      findAllMatches: true,
      useExtendedSearch: true,
      ignoreLocation: false
    });
  },
  handleSearch: function (query) {
    const cleanQuery = query.trim();
    if (this.nodes.clearSearchBtn) {
      this.nodes.clearSearchBtn.classList.toggle("hidden", cleanQuery.length === 0);
    }
    if (cleanQuery.length < 2) {
      this.renderAllTerms();
      this.renderView("dictionary");
      return;
    }
    const results = this.data.fuse ? this.data.fuse.search(cleanQuery) : this.fallbackSearch(cleanQuery);
    this.renderResults(results);
  },
  normalizeText: function (text) {
    return String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  },
  fallbackSearch: function (query) {
    const normalizedQuery = this.normalizeText(query);
    return this.data.terms.filter(term => {
      const haystack = [term.canonical_name, ...(term.synonyms_and_slang || []).map(s => s && s.term || s), term.definition_clinical?.core].map(item => this.normalizeText(item)).join(" ");
      return haystack.includes(normalizedQuery);
    }).slice(0, 50).map(item => ({
      item
    }));
  },
  renderAllTerms: function () {
    if (!this.nodes.allTermsList || !this.data.terms) return;
    this.nodes.allTermsList.textContent = "";
    const validTerms = this.data.terms.filter(t => t && t.canonical_name);
    validTerms.sort((a, b) => (a.canonical_name || "").localeCompare(b.canonical_name || "")).forEach(term => {
      const card = this.renderTermCard(term);
      this.nodes.allTermsList.appendChild(card);
    });
  },
  renderTermCard: function (term) {
    const div = document.createElement("div");
    div.className = "term-card-simple";
    div.onclick = () => this.viewTerm(term.term_id);
    div.innerHTML = `
            <div class="term-name">${this.utils.sanitizeHTML(term.canonical_name)}</div>
            <div class="term-snippet">${this.utils.sanitizeHTML(term.definition_clinical?.core?.substring(0, 60) || "")}...</div>
        `;
    return div;
  },
  renderResults: function (results) {
    if (results.length === 0) {
      const pearls = ["¿Sabías que la 'Saliencia aberrante' es el mecanismo neurocognitivo central detrás de la formación de delirios?", "La fenomenología (EASE) sugiere que los trastornos de la ipseidad suelen preceder a los síntomas psicóticos positivos.", "En el examen mental, las 'acoasmas' se refieren a alucinaciones auditivas elementales como chasquidos o zumbidos.", "El concepto de 'Insight' en psiquiatría es multidimensional e incluye la conciencia de enfermedad y la adherencia al tratamiento.", "La 'prosopagnosia' es la incapacidad de reconocer rostros conocidos, a menudo por lesiones en el área fusiforme."];
      const randomPearl = pearls[Math.floor(Math.random() * pearls.length)];
      this.nodes.resultsView.innerHTML = `
                <div class="card animate-pop" style="text-align: center; padding: 2.5rem 1.5rem; border-color: var(--bau-yellow);">
                    <div style="font-size: 3.5rem; margin-bottom: 1rem;">🕳️</div>
                    <h3 style="margin: 0; color: var(--bau-black); font-family: 'Outfit', sans-serif; font-weight: 800;">¿PERDIDO EN EL PSIQUISMO?</h3>
                    <p style="font-size: 0.95rem; margin-top: 0.75rem; color: var(--text-p);">No encontramos el término exacto, pero no te vayas sin aprender algo:</p>
                    
                    <div style="margin-top: 1.5rem; padding: 1.25rem; background: var(--bau-yellow); border: 3px solid var(--bau-black); box-shadow: 4px 4px 0px var(--bau-black); border-radius: 12px; text-align: left;">
                        <span style="font-weight: 900; font-size: 0.7rem; text-transform: uppercase; color: var(--bau-red); display: block; margin-bottom: 0.5rem;">💡 Sabías que...</span>
                        <p style="margin: 0; font-size: 0.9rem; line-height: 1.5; color: var(--bau-black); font-weight: 600;">${randomPearl}</p>
                    </div>

                    <button class="btn" style="margin-top: 1.5rem; width: 100%;" onclick="App.viewTerm(App.data.terms[Math.floor(Math.random()*App.data.terms.length)].term_id)">
                        🎲 Explorar término aleatorio
                    </button>
                    <p style="font-size: 0.8rem; margin-top: 1rem; opacity: 0.6;" onclick="App.switchTab('nav-dictionary')">O vuelve al <span style="text-decoration: underline; cursor: pointer;">índice general</span></p>
                </div>
            `;
      return;
    } else {
      this.nodes.resultsView.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding: 0 0.5rem;">
                    <span class="section-label" style="margin:0;">Resultados (${results.length})</span>
                </div>
                ${results.map(r => `
                    <div class="card" onclick="App.viewTerm('${r.item.term_id}')" style="cursor: pointer; padding: 1.25rem;">
                        <div style="display:flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                            <strong style="color: var(--primary); font-size: 1.1rem; letter-spacing: -0.02em;">
                                ${this.utils.sanitizeHTML(r.item.canonical_name)}
                            </strong>
                            <div class="badge ${r.item.risk_weight > 1 ? "badge-risk-critical" : ""}" style="font-size: 0.65rem; border: 1px solid var(--border-subtle);">
                                ${this.utils.sanitizeHTML(r.item.term_kind)}
                            </div>
                        </div>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                            ${this.utils.sanitizeHTML(r.item.definition_clinical?.core || "Sin definición disponible.")}
                        </p>
                    </div>
                `).join("")}
            `;
    }
    this.renderView("results");
  },
  renderTermOfTheDay: function () {
    if (!this.nodes.termOfTheDay || !this.data.terms || this.data.terms.length === 0) return;
    const filterTerms = this.data.terms.filter(t => t && t.definition_clinical && t.definition_clinical.core);
    if (filterTerms.length === 0) return;
    const now = new Date();
    const year = now.getFullYear();
    const dayOfYear = Math.floor((now - new Date(year, 0, 1)) / 86400000);
    let s = year * 0x9e3779b9 >>> 0;
    const rand = () => {
      s = s + 0x6d2b79f5 >>> 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
    const indices = filterTerms.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const dailyTerm = filterTerms[indices[dayOfYear % filterTerms.length]];
    const objMarker = dailyTerm.definition_clinical.subjective_marker || dailyTerm.definition_clinical.behavioral_marker || (dailyTerm.teaching_notes ? dailyTerm.teaching_notes[0] : null);
    const tipHtml = objMarker ? `
            <div style="background: rgba(var(--v-on-primary-container-rgb, 0,0,0), 0.08); padding: 1rem; border-left: 6px solid var(--bau-blue); margin-bottom: 1.25rem; border-radius: 4px; border-top-right-radius: 12px; border-bottom-right-radius: 12px;">
                <strong style="display:block; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 0.3rem; color: inherit; opacity: 0.7;">💡 Perla Clínica:</strong>
                <span style="font-size: 0.9rem; font-style: italic; color: inherit; line-height: 1.4; display: block;">${this.utils.sanitizeHTML(objMarker)}</span>
            </div>
        ` : "";
    const fullDef = dailyTerm.definition_clinical.core || "";
    const truncatedDef = fullDef.length > 160 ? fullDef.substring(0, 160).trim() + "..." : fullDef;
    this.nodes.termOfTheDay.innerHTML = `
            <div class="totd-card" onclick="App.viewTerm('${dailyTerm.term_id}')">
                <div class="totd-ribbon">Término del Día</div>
                <div class="totd-content">
                    <h3 class="totd-title" style="color: inherit;">${this.utils.sanitizeHTML(dailyTerm.canonical_name)}</h3>
                    <div class="badge ${dailyTerm.risk_weight > 1 ? "badge-risk-critical" : ""}" style="display:inline-block; margin-bottom: 0.75rem; font-size: 0.7rem; background: var(--bau-magenta); color: white; border: none;">
                        ${this.utils.sanitizeHTML(dailyTerm.term_kind)}
                    </div>
                    <p class="totd-snippet" style="color: inherit;">
                        ${this.utils.sanitizeHTML(truncatedDef)}
                    </p>
                    ${tipHtml}
                    <div style="display:flex; gap:1rem; align-items: center; justify-content: space-between;">
                        <div class="totd-action" style="color: inherit;">Explorar Ficha Completa →</div>
                        <button class="share-pill" onclick="event.stopPropagation(); App.shareTerm('${dailyTerm.term_id}')">
                            <span>📤</span> COMPARTIR
                        </button>
                    </div>
                </div>
            </div>
        `;
    this.nodes.termOfTheDay.classList.remove("hidden");
  },
  shareTerm: async function (termId) {
    const term = this.data.terms.find(t => t.term_id === termId);
    if (!term) return;
    this.utils.haptic();
    console.log(`Generating card for ${term.canonical_name}...`);
    try {
      const blob = await this.utils.generateShareCard(term);
      const file = new File([blob], `MSE_${term.canonical_name}.png`, {
        type: "image/png"
      });
      if (navigator.share) {
        await navigator.share({
          title: `Diccionario MSE: ${term.canonical_name}`,
          text: `Definición de ${term.canonical_name}: ${term.definition_clinical?.core}`,
          url: this.utils.getTermUrl(termId),
          files: [file]
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `MSE_${term.canonical_name}.png`;
        a.click();
        URL.revokeObjectURL(url);
        App.toast.show("🖼️ Tarjeta descargada en tu dispositivo", "success");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      if (navigator.share) {
        navigator.share({
          title: `Diccionario MSE: ${term.canonical_name}`,
          text: `${term.canonical_name}: ${term.definition_clinical?.core}`,
          url: this.utils.getTermUrl(termId)
        }).catch(() => {});
      } else {
        App.toast.show("No se pudo compartir. Copia el enlace manualmente.", "warning");
      }
    }
  },
  viewTerm: function (termId, isPopState = false) {
    try {
      const term = this.data.terms.find(t => t.term_id === termId);
      if (!term) return;
      this.utils.haptic();
      if (!isPopState) {
        history.pushState({
          view: "term",
          termId: termId
        }, "", `#term/${termId}`);
      }
      this.addToRecent(term);
      const teachingNotes = term.teaching_notes || [];
      const alerts = term.alerts || [];
      const examples = term.examples || [];
      const knownDomainIds = new Set(this.data.domains.map(d => d.domain_id));
      const domainLinks = (term.domain_links || []).filter(l => knownDomainIds.has(l.domain_id));
      this.nodes.termView.innerHTML = `
            <div class="view-actions-header" style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div class="btn-back" onclick="App.closeTerm()" style="margin:0;">← Volver</div>
                <div style="display:flex; gap:0.5rem;">
                    <button class="btn-icon" onclick="App.speakTerm('${term.term_id}')" title="Leer definición">🔊 Leer</button>
                    <button class="btn-icon" onclick="App.shareTerm('${term.term_id}')" title="Compartir">📤</button>
                </div>
            </div>
            <div class="card">
                <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div class="badge badge-risk-${term.risk_weight > 1 ? "critical" : "alert"}">${this.utils.sanitizeHTML(term.term_kind || "término")}</div>
                    ${term.status === "active" ? "✅" : ""}
                </div>
                <h2 class="term-title">${this.utils.sanitizeHTML(term.canonical_name)}</h2>
                
                ${term.risk_weight > 1 ? `
                    <div class="alert-critical-banner">
                        <div class="alert-critical-header">
                            <span>⚠️</span> ALERTA DE RIESGO CLÍNICO
                        </div>
                        <p style="font-weight: 700; margin: 0; font-size: 0.95rem; color: #742a2a;">
                            ${alerts.length > 0 ? this.utils.sanitizeHTML(alerts[0].message) : "Este término implica un riesgo de seguridad o manejo crítico."}
                        </p>
                    </div>
                ` : ""}

                <div class="definition-section">
                    <span class="section-label">Definición Clínica</span>
                    <p>${this.utils.sanitizeHTML(term.definition_clinical?.core || "Sin definición disponible.")}</p>
                </div>

                ${term.definition_clinical?.subjective_marker ? `
                    <div class="definition-section">
                        <span class="section-label">Marcador Subjetivo</span>
                        <p><em>"${this.utils.sanitizeHTML(term.definition_clinical.subjective_marker)}"</em></p>
                    </div>
                ` : ""}

                <div class="definition-section">
                    <span class="section-label">Dominios Asociados</span>
                    <div class="tag-container" style="margin-top: 0.5rem;">
                        ${domainLinks.length > 0 ? domainLinks.map(link => {
        const domain = this.data.domains.find(d => d.domain_id === link.domain_id);
        const label = domain?.label_es || this.getDomainSlug(link.domain_id).replace(/_/g, " ");
        return `
                                <span class="tag" onclick="event.stopPropagation(); App.viewDomainDetails('${link.domain_id}')">
                                    ${this.getDomainIcon(link.domain_id)} ${this.utils.sanitizeHTML(label)}
                                </span>`;
      }).join("") : '<span style="font-size: 0.8rem; opacity: 0.5;">No categorizado</span>'}
                    </div>
                </div>

                ${teachingNotes.length > 0 ? `
                <div class="definition-section">
                    <span class="section-label">Docencia & Perlas</span>
                    <ul style="padding-left: 1.25rem; font-size: 0.95rem;">
                        ${teachingNotes.map(note => `<li style="margin-bottom: 0.5rem;">${this.utils.sanitizeHTML(note)}</li>`).join("")}
                    </ul>
                </div>
                ` : ""}

                ${examples.length > 0 ? `
                    <div class="definition-section">
                        <span class="section-label">Ejemplos Clínicos</span>
                        <div class="examples-container">
                            ${examples.map(ex => `
                                <div class="example-item ${ex.type}">
                                    <div class="example-type-badge">${ex.type === "patient_quote" ? "💬 Paciente" : "👁️ Observación"}</div>
                                    <p>${ex.type === "patient_quote" ? `<em>"${this.utils.sanitizeHTML(ex.text)}"</em>` : this.utils.sanitizeHTML(ex.text)}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}

                <div class="support-nudge" style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px dashed var(--border-subtle); text-align: center;">
                    <p style="font-size: 0.8rem; opacity: 0.6; margin-bottom: 0.75rem;">¿Te fue útil esta definición? Apoya el proyecto independiente.</p>
                    <button class="btn secondary" style="font-size: 0.75rem; padding: 0.5rem 1rem;" onclick="window.open('https://buymeacoffee.com/herramente', '_blank')">☕ Invitame un café</button>
                </div>
            </div>
            `;
      this.renderView("term");
      this.nodes.content.scrollTop = 0;
      this.donation.increment();
    } catch (e) {
      console.error("Error rendering term view:", e);
      alert("Error al cargar la ficha. El archivo podría estar incompleto.");
    }
  },
  loadRecentSearches: function () {
    try {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        this.data.recentSearches = JSON.parse(saved);
        this.renderRecentSearches();
      }
    } catch (e) {
      this.data.recentSearches = [];
    }
  },
  addToRecent: function (term) {
    this.data.recentSearches = [term.term_id, ...this.data.recentSearches.filter(id => id !== term.term_id)].slice(0, 5);
    localStorage.setItem("recentSearches", JSON.stringify(this.data.recentSearches));
    this.renderRecentSearches();
  },
  renderRecentSearches: function () {
    if (this.data.recentSearches.length === 0) {
      this.nodes.recentSearchesBar.classList.add("hidden");
      return;
    }
    this.nodes.recentSearchesBar.classList.remove("hidden");
    this.nodes.recentList.innerHTML = this.data.recentSearches.map(id => {
      const term = this.data.terms.find(t => t.term_id === id);
      if (!term) return "";
      return `<span class="recent-search-tag" onclick="App.viewTerm('${term.term_id}')">${this.utils.sanitizeHTML(term.canonical_name)}</span>`;
    }).join("");
  },
  viewAbout: function () {
    this.nodes.aboutView.innerHTML = `
            <div class="btn-back" onclick="App.switchTab('nav-dictionary')">← Volver</div>
            
            <div class="chroma-grid" id="about-chroma-grid">
                <article class="chroma-card" style="--card-border: #56D8B6; --cols: 1;">
                    <div class="chroma-img-wrapper">
                        <img src="assets/celada.jpeg" alt="Dr. Cesar Celada">
                    </div>
                    <footer class="chroma-info">
                        <h3 class="name">Dr. Cesar Celada</h3>
                        <span class="handle">Autor Principal</span>
                        <p class="role">Médico Psiquiatra</p>
                        <p style="font-size: 0.8rem; margin-top: 1rem; opacity: 0.7;">
                            Médico Cirujano y Especialista en Psiquiatría (INPRFM). Apasionado por la intersección entre la tecnología y la salud mental de precisión.
                        </p>
                    </footer>
                </article>

                <article class="chroma-card" style="--card-border: #F59E0B;" onclick="window.location.href='mailto:cesar.celada@gmail.com'">
                    <div class="chroma-img-wrapper" style="display: flex; align-items: center; justify-content: center; background: rgba(var(--primary-rgb), 0.1);">
                        <span style="font-size: 3rem;">📩</span>
                    </div>
                    <footer class="chroma-info">
                        <h3 class="name">Contacto</h3>
                        <span class="handle">Aclaraciones y Mejoras</span>
                        <p class="role">cesar.celada@gmail.com</p>
                    </footer>
                </article>

                <article class="chroma-card" style="--card-border: #FF3C3C;" onclick="window.open('https://buymeacoffee.com/herramente', '_blank')">
                    <div class="chroma-img-wrapper" style="display: flex; align-items: center; justify-content: center; background: rgba(var(--accent-rgb), 0.1);">
                        <span style="font-size: 3rem;">☕</span>
                    </div>
                    <footer class="chroma-info">
                        <h3 class="name">Apoyo</h3>
                        <span class="handle">Donaciones</span>
                        <p class="role">Invitame un café</p>
                    </footer>
                </article>
            </div>

            <div class="card" style="margin-top: 2rem;">
                <div class="definition-section">
                    <span class="section-label">Fuentes y Referencias (APA 7)</span>
                    <ul style="font-size: 0.75rem; padding-left: 1.25rem; line-height: 1.4; opacity: 0.8;">
                        <li style="margin-bottom: 0.5rem;"><strong>Oyebode, F.</strong> (2022). <em>Sims' Symptoms in the Mind: Textbook of Descriptive Psychopathology</em> (7ª ed.). Elsevier.</li>
                        <li style="margin-bottom: 0.5rem;"><strong>Jaspers, K.</strong> (1997). <em>General Psychopathology</em>. Johns Hopkins University Press.</li>
                        <li style="margin-bottom: 0.5rem;"><strong>CIE-11 / ICD-11</strong> for Mortality and Morbidity Statistics. World Health Organization.</li>
                    </ul>
                </div>

                <div class="card clinical-box" style="margin-top: 2rem; border-left: 4px solid var(--accent); background: rgba(255, 60, 60, 0.05);">
                    <span class="section-label" style="color: var(--o-accent-a);">AVISO LEGAL Y CLÍNICO</span>
                    <p style="font-size: 0.8rem; line-height: 1.5; color: var(--text-p);">
                        1. Esta herramienta es de carácter estrictamente informativo y pedagógico.
                        <br>2. **No constituye consejo médico** ni sustituye el juicio clínico soberano del profesional.
                        <br>3. El autor no se hace responsable de las decisiones clínicas tomadas basadas en esta guía rápida.
                    </p>
                </div>
                
                <p style="font-size: 0.7rem; color: var(--text-secondary); text-align: center; margin-top: 2rem; opacity: 0.5;">
                    Diccionario MSE | Dr. Cesar Celada © 2026
                </p>
            </div>
        `;
    this.renderView("about");
    this.nodes.navButtons.forEach(btn => btn.classList.remove("active"));
    this.setupChromaGrid();
  },
  setupChromaGrid: function () {
    const grid = document.getElementById("about-chroma-grid");
    if (!grid || typeof gsap === "undefined") return;
    gsap.killTweensOf(this.data.chromaPos);
    const setX = gsap.quickSetter(grid, "--x", "px");
    const setY = gsap.quickSetter(grid, "--y", "px");
    grid.addEventListener("pointermove", e => {
      const rect = grid.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      gsap.to(this.data.chromaPos, {
        x,
        y,
        duration: 0.45,
        ease: "power3.out",
        onUpdate: () => {
          setX(this.data.chromaPos.x);
          setY(this.data.chromaPos.y);
        },
        overwrite: true
      });
    });
    const cards = grid.querySelectorAll(".chroma-card");
    cards.forEach(card => {
      card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    });
  },
  closeTerm: function () {
    if (this.nodes.search.value.length >= 2) {
      this.renderView("results");
    } else {
      history.back();
    }
  },
  renderDomains: function () {
    this.nodes.domainView.innerHTML = `
            <div id="domain-grid-container">
                <div class="clinical-box" style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(var(--primary-rgb), 0.05); border-radius: 12px;">
                    <h3 style="margin-top:0; font-size: 1.2rem; color: var(--primary);">Explorador de Dominios</h3>
                    <p style="font-size: 0.85rem; opacity: 0.8; margin: 0;">Seleccione un dominio para ver su estructura clínica y términos asociados.</p>
                </div>
                <div class="domain-grid">
                    ${this.data.domains.map(d => `
                        <div class="domain-card" onclick="App.viewDomainDetails('${d.domain_id}')">
                            <div class="domain-icon">${this.getDomainIcon(d.domain_id)}</div>
                            <span class="domain-title">${this.utils.sanitizeHTML(d.label_es || d.domain_name || d.domain_id)}</span>
                            <div class="domain-subtitle" style="font-size: 0.6rem; opacity: 0.6; text-transform: none;">
                                ${d.subcomponents ? d.subcomponents.length + " áreas" : "Detalles"}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
            <div id="domain-detail-container" class="hidden"></div>
        `;
  },
  viewDomainDetails: function (domainId, isPopState = false) {
    const domain = this.data.domains.find(d => d.domain_id === domainId);
    if (!domain) return;
    if (!isPopState) {
      history.pushState({
        view: "domain",
        domainId: domainId
      }, "", `#domain/${domainId}`);
    }
    const filteredTerms = this.data.terms.filter(t => t.domain_links && t.domain_links.some(link => link.domain_id === domainId));
    const detailContainer = document.getElementById("domain-detail-container");
    document.getElementById("domain-grid-container").classList.add("hidden");
    detailContainer.classList.remove("hidden");
    this.donation.increment();
    document.title = `Dominio: ${domain.label_es || domain.domain_name} | Diccionario MSE`;
    detailContainer.innerHTML = `
            <div class="btn-back" onclick="App.closeDomainDetails()">← Volver a Dominios</div>
            
            <div class="domain-detail-header">
                <h2 class="domain-detail-title">
                    <span>${this.getDomainIcon(domain.domain_id)}</span>
                    ${this.utils.sanitizeHTML(domain.label_es || domain.domain_name)}
                </h2>
                <p style="margin-top: 1rem; opacity: 0.9; line-height: 1.5;">${this.utils.sanitizeHTML(domain.definition_es || "Sin definición disponible.")}</p>
            </div>

            <div class="section-container">
                <h3 class="section-label" style="font-size: 1rem;">Subcomponentes y Términos Aceptados</h3>
                ${domain.subcomponents ? domain.subcomponents.map(sub => `
                    <div class="subcomponent-item">
                        <span class="subcomponent-label">${this.utils.sanitizeHTML(sub.label_es)}</span>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${this.utils.sanitizeHTML(sub.notes || "")}</p>
                        <div class="tag-container">
                            ${sub.accepted_terms ? sub.accepted_terms.map(term => `<span class="tag">${this.utils.sanitizeHTML(term)}</span>`).join("") : ""}
                        </div>
                    </div>
                `).join("") : "<p>No hay subcomponentes definidos.</p>"}
            </div>

            ${domain.clinical_notes ? `
                <div class="section-container" style="margin-top: 1.5rem;">
                    <h3 class="section-label" style="font-size: 1rem;">Notas Clínicas</h3>
                    <ul style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-secondary);">
                        ${domain.clinical_notes.map(note => `<li style="margin-bottom: 0.5rem;">${this.utils.sanitizeHTML(note)}</li>`).join("")}
                    </ul>
                </div>
            ` : ""}

            <div class="section-container" style="margin-top: 1.5rem;">
                <h3 class="section-label" style="font-size: 1rem;">Términos en el Diccionario</h3>
                <div class="card" style="padding: 0.5rem;">
                    ${filteredTerms.length ? filteredTerms.map(t => `
                        <div class="list-item" onclick="App.viewTerm('${t.term_id}')">
                            <span>${this.utils.sanitizeHTML(t.canonical_name)}</span>
                            <span style="font-size: 0.7rem; color: var(--text-secondary); opacity: 0.6;">${this.utils.sanitizeHTML(t.term_kind)}</span>
                        </div>
                    `).join("") : '<p style="padding: 1rem; font-size: 0.9rem;">No hay términos específicos registrados aún.</p>'}
                </div>
            </div>

            ${domain.recommended_wording ? `
                <div class="wording-box wording-recommended" style="margin-top: 1.5rem;">
                    <span class="section-label" style="color: #2f855a;">Lenguaje Recomendado</span>
                    <ul class="wording-list">
                        ${domain.recommended_wording.map(w => `<li>${this.utils.sanitizeHTML(w)}</li>`).join("")}
                    </ul>
                </div>
            ` : ""}
        `;
    this.nodes.content.scrollTop = 0;
  },
  closeDomainDetails: function () {
    document.getElementById("domain-detail-container").classList.add("hidden");
    document.getElementById("domain-grid-container").classList.remove("hidden");
    this.nodes.content.scrollTop = 0;
  },
  renderCases: function () {
    this.nodes.casesView.innerHTML = `
            <h3 style="margin-top:0; color: var(--primary);">Escenarios OSCE</h3>
            <p style="font-size: 0.85rem; opacity: 0.8; margin-bottom: 1rem;">Seleccione un caso para practicar el diagnóstico diferencial.</p>
            ${this.data.cases.map(c => `
                <div class="card" onclick="App.renderCase('${c.case_id}')" style="padding: 1rem; cursor: pointer;">
                    <div style="display:flex; justify-content: space-between; align-items: center;">
                        <span class="badge" style="background:#edf2f7; color: #2d3748;">Nivel ${this.utils.sanitizeHTML(String(c.level))}</span>
                        <code style="font-size: 0.7rem; opacity: 0.5;">${this.utils.sanitizeHTML(c.case_id)}</code>
                    </div>
                    <p style="margin: 0.75rem 0; font-weight: 600; color: var(--primary-dark);">
                        ${this.utils.sanitizeHTML(c.stem.setting.replace(/_/g, " "))}
                    </p>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
                        ${this.utils.sanitizeHTML(c.stem.contextual_notes)}
                    </p>
                    <div style="font-size: 0.75rem; color: var(--primary); font-weight: 600; text-align: right;">
                        Ver Caso →
                    </div>
                </div>
            `).join("")}
        `;
  },
  renderCase: function (caseId) {
    const c = this.data.cases.find(x => x.case_id === caseId);
    if (!c) return;
    this.donation.increment();
    const domainGrid = Object.entries(c.domains).map(([key, data]) => {
      const domainName = key;
      const content = Object.entries(data).map(([k, v]) => `<li><strong>${k.replace(/_/g, " ")}:</strong> ${String(v || "").replace(/_/g, " ")}</li>`).join("");
      return `
                <div class="domain-card" style="border: 1px solid var(--border); padding: 0.75rem; border-radius: 8px; font-size: 0.85rem;">
                    <div style="font-weight:bold; color:var(--primary); margin-bottom:0.5rem; border-bottom:1px solid var(--border-subtle);">${domainName}</div>
                    <ul style="padding-left: 1rem; margin:0;">${content}</ul>
                </div>
            `;
    }).join("");
    this.nodes.casesView.innerHTML = `
            <div class="btn-back" onclick="App.renderCases()">← Volver a Lista de Casos</div>
            <div class="card">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h2 class="term-title">${c.case_id}: ${c.stem.sex}, ${c.stem.age_range}</h2>
                    <span class="badge">${c.stem.setting.replace(/_/g, " ")}</span>
                </div>
                <p style="font-style:italic; border-left: 3px solid var(--primary); padding-left: 1rem; color: var(--text-secondary); margin: 1.5rem 0;">
                    "${c.stem.contextual_notes}"
                </p>

                <h3 style="margin-top: 1.5rem;">Exploración por Dominios</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    ${domainGrid}
                </div>

                <!-- Interaction Zone -->
                <div class="interaction-zone" style="background: var(--surface-2); padding: 1.5rem; border-radius: 12px; text-align: center; border: 1px solid var(--border);">
                    <h3 style="margin-top:0;">Análisis Clínico y Diagnóstico</h3>
                    <p style="margin-bottom: 1rem; opacity: 0.8;">Intenta formular tu diagnóstico antes de revelar la respuesta.</p>
                    
                    <button id="reveal-btn" class="filter-chip" style="background: var(--primary); color: #fff; font-weight: bold; padding: 0.75rem 1.5rem; cursor: pointer; border: none; border-radius: 50px;" 
                            onclick="document.getElementById('analysis-content').style.display='block'; this.style.display='none';">
                        👁️ Revelar Análisis
                    </button>

                    <div id="analysis-content" style="display: none; text-align: left; margin-top: 1.5rem; animation: fadeIn 0.5s;">
                        <div style="background: var(--bg); padding: 1rem; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 1rem;">
                            <h4 style="margin-top:0; color: var(--primary);">Síndrome Principal</h4>
                            <p style="font-size: 1.1rem; font-weight: bold;">${this.utils.sanitizeHTML(c.expected_engine_output.primary_syndrome.replace(/_/g, " "))}</p>
                            
                            <div style="margin-top: 1rem; display:flex; gap: 0.5rem; flex-wrap: wrap;">
                                ${c.expected_engine_output.critical_flags.map(f => `<span class="badge" style="background: #fed7d7; color: #742a2a;">🚩 ${this.utils.sanitizeHTML(f.replace(/_/g, " "))}</span>`).join("")}
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div style="background: rgba(47, 133, 90, 0.1); color: #22543d; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem;">
                                <strong>Claves Diagnósticas:</strong>
                                <ul>${c.assessment_keys.key_discriminators.map(x => `<li>${this.utils.sanitizeHTML(x.replace(/_/g, " "))}</li>`).join("")}</ul>
                            </div>
                            <div style="background: rgba(197, 48, 48, 0.1); color: #742a2a; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem;">
                                <strong>Errores a Evitar:</strong>
                                <ul>${c.assessment_keys.errors_to_avoid.map(x => `<li>${this.utils.sanitizeHTML(x.replace(/_/g, " "))}</li>`).join("")}</ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    window.scrollTo(0, 0);
  },
  navIndicator: {
    // The active-tab underline is rendered purely in CSS via
    // `.bottom-nav button.active::after`, so there is no DOM node to move.
    // These no-ops exist so the calls in init()/switchTab() don't throw a
    // TypeError (which previously aborted switchTab before it could render
    // the target view, breaking every bottom-nav button).
    init: function () {},
    update: function () {}
  },
  switchTab: function (id) {
    this.utils.haptic();
    this.nodes.navButtons.forEach(btn => {
      const isActive = btn.id === id;
      btn.classList.toggle("active", isActive);
      if (isActive) btn.setAttribute("aria-current", "page"); else btn.removeAttribute("aria-current");
    });
    this.navIndicator.update();
    this.nodes.search.value = "";
    if (id === "nav-dictionary") {
      this.data.currentView = "dictionary";
      this.renderView("dictionary");
    } else if (id === "nav-domains") {
      this.data.currentView = "domain";
      this.renderView("domain");
      this.renderDomains();
    } else if (id === "nav-cases") {
      this.data.currentView = "cases";
      this.renderView("cases");
      this.renderCases();
    } else if (id === "nav-integrator") {
      this.data.currentView = "integrator";
      this.integrator.init();
      this.renderView("integrator");
    } else if (id === "nav-game") {
      this.data.currentView = "game";
      this.game.init();
      this.renderView("game");
    } else {
      if (this.game && this.game.stopTimer) this.game.stopTimer();
    }
  },
  renderView: function (viewName) {
    if (viewName !== "game" && this.game && this.game.stopTimer) {
      this.game.stopTimer();
    }
    const views = ["dictionary", "results", "term", "domain", "cases", "integrator", "about", "game"];
    views.forEach(v => {
      const node = this.nodes[`${v}View`];
      if (node) {
        if (v === viewName) {
          node.classList.remove("hidden");
          node.classList.remove("view-enter");
          void node.offsetWidth;
          node.classList.add("view-enter");
        } else {
          node.classList.add("hidden");
        }
      }
    });
  }
};
