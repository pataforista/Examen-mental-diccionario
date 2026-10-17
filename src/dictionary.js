import { getIcon, DOMAIN_ICONS } from "./icons.js";

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
          App.toast.show("Nuevo: comparte términos como tarjetas clínicas. Pulsa el botón compartir en cualquier ficha.", "info", 5000);
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
        } catch {
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
      console.log(`Clinical data loaded in ${Math.round(performance.now() - startTime)}ms`);
    } catch (error) {
      console.error("Critical error loading clinical data:", error);
      this.data.terms = this.data.terms || [];
      this.data.domains = this.data.domains || [];
      this.data.cases = this.data.cases || [];
      if (this.nodes.allTermsList) {
        this.nodes.allTermsList.innerHTML = `
                    <div class="card empty-state">
                        <div class="empty-state__icon">${getIcon("alert")}</div>
                        <h3>Sin conexión</h3>
                        <p>No se pudo cargar el diccionario. Verifica tu conexión e intenta de nuevo.</p>
                        <button class="btn secondary" onclick="window.location.reload()">${getIcon("refresh")} Reintentar</button>
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
    return getIcon(DOMAIN_ICONS[id] || "compass");
  },
  // Paleta categórica de 6 tonos (EM5): DOM-01 → cat-1 … DOM-07 → cat-1.
  getDomainCat: function (id) {
    const n = parseInt(String(id).replace(/\D/g, ""), 10) || 1;
    return `cat-${((n - 1) % 6) + 1}`;
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
                <div class="card empty-state">
                    <div class="empty-state__icon">${getIcon("compass")}</div>
                    <h3>Sin coincidencias exactas</h3>
                    <p>No encontramos ese término. Mientras tanto, una perla clínica:</p>
                    <div class="empty-state__pearl">
                        <strong>${getIcon("bulb")} Sabías que…</strong>
                        <p>${randomPearl}</p>
                    </div>
                    <button class="btn primary btn-block" onclick="App.viewTerm(App.data.terms[Math.floor(Math.random()*App.data.terms.length)].term_id)">
                        ${getIcon("shuffle")} Explorar un término al azar
                    </button>
                    <p class="muted-note">O vuelve al <button class="link-btn" onclick="App.switchTab('nav-dictionary')">índice general</button></p>
                </div>
            `;
      return;
    } else {
      this.nodes.resultsView.innerHTML = `
                <div class="results-head">
                    <span class="section-label">Resultados (${results.length})</span>
                </div>
                ${results.map(r => `
                    <div class="card card--interactive result-card" onclick="App.viewTerm('${r.item.term_id}')">
                        <div class="result-card__head">
                            <span class="result-card__title">${this.utils.sanitizeHTML(r.item.canonical_name)}</span>
                            <span class="badge ${r.item.risk_weight > 1 ? "badge-risk-critical" : ""}">${this.utils.sanitizeHTML(r.item.term_kind)}</span>
                        </div>
                        <p class="result-card__def">${this.utils.sanitizeHTML(r.item.definition_clinical?.core || "Sin definición disponible.")}</p>
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
            <div class="totd-pearl">
                <strong>${getIcon("bulb")} Perla clínica</strong>
                <span>${this.utils.sanitizeHTML(objMarker)}</span>
            </div>
        ` : "";
    const fullDef = dailyTerm.definition_clinical.core || "";
    const truncatedDef = fullDef.length > 160 ? fullDef.substring(0, 160).trim() + "…" : fullDef;
    this.nodes.termOfTheDay.innerHTML = `
            <div class="totd-card" role="link" tabindex="0" onclick="App.viewTerm('${dailyTerm.term_id}')" onkeydown="if(event.key==='Enter'){App.viewTerm('${dailyTerm.term_id}')}">
                <span class="totd-ribbon">${getIcon("bulb")} Término del día</span>
                <div class="totd-content">
                    <h2 class="totd-title">${this.utils.sanitizeHTML(dailyTerm.canonical_name)}</h2>
                    <span class="badge ${dailyTerm.risk_weight > 1 ? "badge-risk-critical" : ""}">${this.utils.sanitizeHTML(dailyTerm.term_kind)}</span>
                    <p class="totd-snippet">${this.utils.sanitizeHTML(truncatedDef)}</p>
                    ${tipHtml}
                    <div class="totd-footer">
                        <span class="totd-action">Ver ficha completa ${getIcon("arrow-right")}</span>
                        <button class="share-pill" onclick="event.stopPropagation(); App.shareTerm('${dailyTerm.term_id}')">
                            ${getIcon("share")} Compartir
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
        App.toast.show("Tarjeta descargada en tu dispositivo", "success");
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
      const sanitize = v => this.utils.sanitizeHTML(v);
      const isCritical = term.risk_weight > 1;
      this.nodes.termView.innerHTML = `
            <div class="view-actions-header">
                <button class="btn-back" onclick="App.closeTerm()">${getIcon("arrow-left")} Volver</button>
                <div class="view-actions">
                    <button class="btn-icon" onclick="App.speakTerm('${term.term_id}')" title="Leer definición">${getIcon("volume")} Leer</button>
                    <button class="btn-icon" onclick="App.shareTerm('${term.term_id}')" title="Compartir" aria-label="Compartir">${getIcon("share")}</button>
                </div>
            </div>
            <div class="card">
                <div class="term-head">
                    <span class="badge ${isCritical ? "badge-risk-critical" : ""}">${sanitize(term.term_kind || "término")}</span>
                    ${term.status === "active" ? '<span class="status-dot status-dot--ok" title="Término activo" aria-label="Término activo"></span>' : ""}
                </div>
                <h2 class="term-title">${sanitize(term.canonical_name)}</h2>

                ${isCritical ? `
                    <div class="alert-critical-banner" role="note">
                        <div class="alert-critical-header">${getIcon("alert")} Alerta de riesgo clínico</div>
                        <p class="alert-critical-text">
                            ${alerts.length > 0 ? sanitize(alerts[0].message) : "Este término implica un riesgo de seguridad o manejo crítico."}
                        </p>
                    </div>
                ` : ""}

                <div class="definition-section">
                    <span class="section-label">Definición clínica</span>
                    <p>${sanitize(term.definition_clinical?.core || "Sin definición disponible.")}</p>
                </div>

                ${term.definition_clinical?.subjective_marker ? `
                    <div class="definition-section">
                        <span class="section-label">Marcador subjetivo</span>
                        <p><em>"${sanitize(term.definition_clinical.subjective_marker)}"</em></p>
                    </div>
                ` : ""}

                <div class="definition-section">
                    <span class="section-label">Dominios asociados</span>
                    <div class="tag-container">
                        ${domainLinks.length > 0 ? domainLinks.map(link => {
        const domain = this.data.domains.find(d => d.domain_id === link.domain_id);
        const label = domain?.label_es || this.getDomainSlug(link.domain_id).replace(/_/g, " ");
        return `
                                <button class="tag" onclick="event.stopPropagation(); App.viewDomainDetails('${link.domain_id}')">
                                    ${this.getDomainIcon(link.domain_id)} ${sanitize(label)}
                                </button>`;
      }).join("") : '<span class="muted-note">No categorizado</span>'}
                    </div>
                </div>

                ${teachingNotes.length > 0 ? `
                <div class="definition-section">
                    <span class="section-label">Docencia y perlas</span>
                    <ul class="notes-list">
                        ${teachingNotes.map(note => `<li>${sanitize(note)}</li>`).join("")}
                    </ul>
                </div>
                ` : ""}

                ${examples.length > 0 ? `
                    <div class="definition-section">
                        <span class="section-label">Ejemplos clínicos</span>
                        <div class="examples-container">
                            ${examples.map(ex => `
                                <div class="example-item">
                                    ${ex.type === "patient_quote"
        ? `<span class="example-type-badge example-type-badge--patient">${getIcon("quote")} Paciente</span>`
        : `<span class="example-type-badge example-type-badge--observation">${getIcon("eye")} Observación</span>`}
                                    <p>${ex.type === "patient_quote" ? `<em>"${sanitize(ex.text)}"</em>` : sanitize(ex.text)}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}

                <div class="support-nudge">
                    <p>¿Te fue útil esta definición? Apoya el proyecto independiente.</p>
                    <a class="donation-cta" href="https://buymeacoffee.com/herramente" target="_blank" rel="noopener noreferrer">${getIcon("coffee")} Invítame un café</a>
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
    } catch {
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
            <button class="btn-back" onclick="App.switchTab('nav-dictionary')">${getIcon("arrow-left")} Volver</button>

            <div class="about-grid">
                <article class="profile-card">
                    <img class="profile-card__avatar" src="assets/celada.jpeg" alt="Dr. Cesar Celada">
                    <h2 class="profile-card__name">Dr. Cesar Celada</h2>
                    <span class="profile-card__handle">Autor principal</span>
                    <p class="profile-card__role">Médico psiquiatra</p>
                    <p class="profile-card__bio">
                        Médico Cirujano y Especialista en Psiquiatría (INPRFM). Apasionado por la intersección entre la tecnología y la salud mental de precisión.
                    </p>
                </article>

                <div class="action-row">
                    <a class="action-card cat-1" href="mailto:cesar.celada@gmail.com">
                        <span class="action-card__icon">${getIcon("mail")}</span>
                        <span>
                            <span class="action-card__title">Contacto</span>
                            <span class="action-card__sub">Aclaraciones y mejoras · cesar.celada@gmail.com</span>
                        </span>
                    </a>
                    <a class="action-card cat-5" href="https://buymeacoffee.com/herramente" target="_blank" rel="noopener noreferrer">
                        <span class="action-card__icon">${getIcon("coffee")}</span>
                        <span>
                            <span class="action-card__title">Apoyo</span>
                            <span class="action-card__sub">Invítame un café</span>
                        </span>
                    </a>
                </div>
            </div>

            <div class="card">
                <div class="definition-section">
                    <span class="section-label">Fuentes y referencias (APA 7)</span>
                    <ul class="ref-list">
                        <li><strong>Oyebode, F.</strong> (2022). <em>Sims' Symptoms in the Mind: Textbook of Descriptive Psychopathology</em> (7ª ed.). Elsevier.</li>
                        <li><strong>Jaspers, K.</strong> (1997). <em>General Psychopathology</em>. Johns Hopkins University Press.</li>
                        <li><strong>CIE-11 / ICD-11</strong> for Mortality and Morbidity Statistics. World Health Organization.</li>
                    </ul>
                </div>

                <div class="disclaimer-box" role="note">
                    <span class="section-label">Aviso legal y clínico</span>
                    <p>
                        1. Esta herramienta es de carácter estrictamente informativo y pedagógico.
                        <br>2. <strong>No constituye consejo médico</strong> ni sustituye el juicio clínico soberano del profesional.
                        <br>3. El autor no se hace responsable de las decisiones clínicas tomadas basadas en esta guía rápida.
                    </p>
                </div>

                <p class="about-foot">Diccionario MSE · Dr. Cesar Celada © 2026</p>
            </div>
        `;
    this.renderView("about");
    this.nodes.navButtons.forEach(btn => btn.classList.remove("active"));
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
                <div class="intro-box">
                    <h2>Explorador de dominios</h2>
                    <p>Seleccione un dominio para ver su estructura clínica y términos asociados.</p>
                </div>
                <div class="domain-grid">
                    ${this.data.domains.map(d => `
                        <button class="domain-card ${this.getDomainCat(d.domain_id)}" onclick="App.viewDomainDetails('${d.domain_id}')">
                            <span class="domain-icon">${this.getDomainIcon(d.domain_id)}</span>
                            <span>
                                <span class="domain-title">${this.utils.sanitizeHTML(d.label_es || d.domain_name || d.domain_id)}</span>
                                <span class="domain-subtitle">${d.subcomponents ? d.subcomponents.length + " áreas" : "Detalles"}</span>
                            </span>
                        </button>
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
    const sanitize = v => this.utils.sanitizeHTML(v);
    detailContainer.innerHTML = `
            <button class="btn-back" onclick="App.closeDomainDetails()">${getIcon("arrow-left")} Volver a dominios</button>

            <div class="domain-detail-header ${this.getDomainCat(domain.domain_id)}">
                <h2 class="domain-detail-title">
                    <span class="domain-icon">${this.getDomainIcon(domain.domain_id)}</span>
                    ${sanitize(domain.label_es || domain.domain_name)}
                </h2>
                <p class="domain-detail-def">${sanitize(domain.definition_es || "Sin definición disponible.")}</p>
            </div>

            <div class="section-container">
                <h3 class="section-title">Subcomponentes y términos aceptados</h3>
                ${domain.subcomponents ? domain.subcomponents.map(sub => `
                    <div class="subcomponent-item">
                        <span class="subcomponent-label">${sanitize(sub.label_es)}</span>
                        ${sub.notes ? `<p class="subcomponent-notes">${sanitize(sub.notes)}</p>` : ""}
                        <div class="tag-container">
                            ${sub.accepted_terms ? sub.accepted_terms.map(term => `<span class="tag">${sanitize(term)}</span>`).join("") : ""}
                        </div>
                    </div>
                `).join("") : '<p class="muted-note">No hay subcomponentes definidos.</p>'}
            </div>

            ${domain.clinical_notes ? `
                <div class="section-container">
                    <h3 class="section-title">Notas clínicas</h3>
                    <ul class="notes-list">
                        ${domain.clinical_notes.map(note => `<li>${sanitize(note)}</li>`).join("")}
                    </ul>
                </div>
            ` : ""}

            <div class="section-container">
                <h3 class="section-title">Términos en el diccionario</h3>
                <div class="card list-card">
                    ${filteredTerms.length ? filteredTerms.map(t => `
                        <button class="list-item" onclick="App.viewTerm('${t.term_id}')">
                            <span>${sanitize(t.canonical_name)}</span>
                            <span class="list-item__meta">${sanitize(t.term_kind)}</span>
                        </button>
                    `).join("") : '<p class="muted-note list-card__empty">No hay términos específicos registrados aún.</p>'}
                </div>
            </div>

            ${domain.recommended_wording ? `
                <div class="wording-box wording-recommended">
                    <span class="section-label">Lenguaje recomendado</span>
                    <ul class="wording-list">
                        ${domain.recommended_wording.map(w => `<li>${sanitize(w)}</li>`).join("")}
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
    const sanitize = v => this.utils.sanitizeHTML(v);
    this.nodes.casesView.innerHTML = `
            <div class="view-intro">
                <h2>Escenarios OSCE</h2>
                <p>Seleccione un caso para practicar el diagnóstico diferencial.</p>
            </div>
            ${this.data.cases.map(c => `
                <div class="card card--interactive case-card" role="button" tabindex="0" onclick="App.renderCase('${c.case_id}')" onkeydown="if(event.key==='Enter'){App.renderCase('${c.case_id}')}">
                    <div class="case-card__head">
                        <span class="badge">Nivel ${sanitize(String(c.level))}</span>
                        <code class="case-id">${sanitize(c.case_id)}</code>
                    </div>
                    <p class="case-card__setting">${sanitize(c.stem.setting.replace(/_/g, " "))}</p>
                    <p class="case-card__notes">${sanitize(c.stem.contextual_notes)}</p>
                    <div class="case-card__cta">Ver caso ${getIcon("arrow-right")}</div>
                </div>
            `).join("")}
        `;
  },
  renderCase: function (caseId) {
    const c = this.data.cases.find(x => x.case_id === caseId);
    if (!c) return;
    this.donation.increment();
    const sanitize = v => this.utils.sanitizeHTML(v);
    const domainGrid = Object.entries(c.domains).map(([key, data]) => {
      const content = Object.entries(data).map(([k, v]) => `<li><strong>${sanitize(k.replace(/_/g, " "))}:</strong> ${sanitize(String(v || "").replace(/_/g, " "))}</li>`).join("");
      return `
                <div class="case-domain">
                    <div class="case-domain__title">${sanitize(key)}</div>
                    <ul>${content}</ul>
                </div>
            `;
    }).join("");
    this.nodes.casesView.innerHTML = `
            <button class="btn-back" onclick="App.renderCases()">${getIcon("arrow-left")} Volver a la lista de casos</button>
            <div class="card case-detail-view">
                <div class="case-head">
                    <h2 class="term-title">${sanitize(c.case_id)}: ${sanitize(c.stem.sex)}, ${sanitize(c.stem.age_range)}</h2>
                    <span class="badge">${sanitize(c.stem.setting.replace(/_/g, " "))}</span>
                </div>
                <p class="case-quote">"${sanitize(c.stem.contextual_notes)}"</p>

                <h3 class="section-title">Exploración por dominios</h3>
                <div class="case-domain-grid">
                    ${domainGrid}
                </div>

                <div class="interaction-zone">
                    <h3>Análisis clínico y diagnóstico</h3>
                    <p>Intenta formular tu diagnóstico antes de revelar la respuesta.</p>

                    <button id="reveal-btn" class="btn primary" onclick="document.getElementById('analysis-content').classList.remove('hidden'); this.classList.add('hidden');">
                        ${getIcon("eye")} Revelar análisis
                    </button>

                    <div id="analysis-content" class="analysis-content hidden">
                        <div class="analysis-block">
                            <h4>Síndrome principal</h4>
                            <p class="analysis-syndrome">${sanitize(c.expected_engine_output.primary_syndrome.replace(/_/g, " "))}</p>
                            <div class="flag-list">
                                ${c.expected_engine_output.critical_flags.map(f => `<span class="badge badge-risk-critical">${getIcon("flag")} ${sanitize(f.replace(/_/g, " "))}</span>`).join("")}
                            </div>
                        </div>

                        <div class="analysis-cols">
                            <div class="analysis-col analysis-col--ok">
                                <strong>Claves diagnósticas</strong>
                                <ul>${c.assessment_keys.key_discriminators.map(x => `<li>${sanitize(x.replace(/_/g, " "))}</li>`).join("")}</ul>
                            </div>
                            <div class="analysis-col analysis-col--risk">
                                <strong>Errores a evitar</strong>
                                <ul>${c.assessment_keys.errors_to_avoid.map(x => `<li>${sanitize(x.replace(/_/g, " "))}</li>`).join("")}</ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    this.nodes.content.scrollTop = 0;
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
    if (this.nodes.clearSearchBtn) this.nodes.clearSearchBtn.classList.add("hidden");
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
