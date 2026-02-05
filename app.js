const App = {
    data: {
        terms: [],
        domains: [],
        cases: [],
        fuse: null,
        currentView: 'dictionary', // dictionary, domains, cases, search, term, about
        recentSearches: []
    },

    init: async function () {
        this.cacheDOM();
        this.bindEvents();
        await this.loadData();
        this.setupSearch();
        this.loadRecentSearches();
        this.renderAllTerms();
        this.theme.init();
    },

    theme: {
        current: 'light',
        init: function () {
            const saved = localStorage.getItem('mse-theme') || 'light';
            this.set(saved);
        },
        toggle: function () {
            const next = this.current === 'light' ? 'dark' : 'light';
            this.set(next);
        },
        set: function (theme) {
            this.current = theme;
            document.body.setAttribute('data-theme', theme);
            document.getElementById('theme-toggle').innerHTML = theme === 'light' ? '🌞' : '🌙';
            document.getElementById('app-title').innerText = theme === 'light' ? 'SOFT RUINS' : 'BLACK SIGNAL';
            localStorage.setItem('mse-theme', theme);

            // Update meta theme color
            const metaTheme = document.querySelector('meta[name="theme-color"]');
            if (metaTheme) metaTheme.setAttribute('content', theme === 'light' ? '#FFF8E7' : '#120C18');
        }
    },

    cacheDOM: function () {
        this.nodes = {
            search: document.getElementById('global-search'),
            content: document.getElementById('app-content'),
            dictionaryView: document.getElementById('dictionary-view'),
            resultsView: document.getElementById('results-view'),
            termView: document.getElementById('term-view'),
            domainView: document.getElementById('domain-view'),
            casesView: document.getElementById('cases-view'),
            aboutView: document.getElementById('about-view'),
            allTermsList: document.getElementById('all-terms-list'),
            recentSearchesBar: document.getElementById('recent-searches'),
            recentList: document.getElementById('recent-list'),
            navButtons: document.querySelectorAll('.bottom-nav button'),
            aboutBtn: document.getElementById('about-btn'),
            themeToggle: document.getElementById('theme-toggle')
        };
    },

    bindEvents: function () {
        this.nodes.search.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.nodes.navButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.id));
        });
        this.nodes.aboutBtn.addEventListener('click', () => this.viewAbout());
        this.nodes.themeToggle.addEventListener('click', () => this.theme.toggle());
    },

    loadData: async function () {
        try {
            const registryData = await fetch('lexicon/term_id_registry.json').then(r => r.json());
            const termRegistry = registryData.terms_index;

            const termPromises = termRegistry.map(t =>
                fetch(t.path).then(r => r.json()).catch(err => {
                    console.error(`Error loading term ${t.term_id}:`, err);
                    return null;
                })
            );

            this.data.terms = (await Promise.all(termPromises)).filter(t => t !== null);

            // Sort terms alphabetically
            this.data.terms.sort((a, b) => a.canonical_name.localeCompare(b.canonical_name));

            // Load domains (hardcoded slugs for robustness based on the folder structure)
            const domainIds = Array.from({ length: 14 }, (_, i) => `DOM-${(i + 1).toString().padStart(2, '0')}`);
            const domainPromises = domainIds.map(async id => {
                const slug = this.getDomainSlug(id);
                try {
                    const response = await fetch(`domains/${id}_${slug}.json`);
                    return await response.json();
                } catch (e) {
                    return { domain_id: id, domain_name: id.replace('-', ' ') };
                }
            });
            this.data.domains = await Promise.all(domainPromises);

            // Load cases
            try {
                const caseFiles = ['OSCE_001–003.json', 'OSCE_004–OSCE_009.json', 'OSCE_010–OSCE_015.json'];
                const casePromises = caseFiles.map(file => fetch(file).then(r => r.json()).catch(() => []));
                const allCasesArrays = await Promise.all(casePromises);
                this.data.cases = allCasesArrays.flat();
            } catch (e) {
                console.warn("Could not load OSCE cases");
            }

        } catch (error) {
            console.error("Error loading clinical data:", error);
        }
    },

    getDomainSlug: function (id) {
        const slugs = {
            'DOM-01': 'conciencia_orientacion',
            'DOM-02': 'apariencia_general',
            'DOM-03': 'actitud_interaccion',
            'DOM-04': 'psicomotricidad_conacion',
            'DOM-05': 'habla_lenguaje',
            'DOM-06': 'pensamiento_curso_forma',
            'DOM-07': 'pensamiento_contenido',
            'DOM-08': 'sensopercepcion',
            'DOM-09': 'estado_afectivo_animo_afecto',
            'DOM-10': 'funciones_cognitivas',
            'DOM-11': 'juicio_insight',
            'DOM-12': 'riesgo',
            'DOM-13': 'integracion_sindromatica',
            'DOM-14': 'docencia'
        };
        return slugs[id] || '';
    },

    getDomainIcon: function (id) {
        const icons = {
            'DOM-01': '🧠', 'DOM-02': '👤', 'DOM-03': '🤝', 'DOM-04': '🏃',
            'DOM-05': '🗣️', 'DOM-06': '🔄', 'DOM-07': '💡', 'DOM-08': '👁️',
            'DOM-09': '🎭', 'DOM-10': '🧩', 'DOM-11': '⚖️', 'DOM-12': '⚠️',
            'DOM-13': '🏥', 'DOM-14': '🎓'
        };
        return icons[id] || '🔹';
    },

    setupSearch: function () {
        if (!window.Fuse) return;
        this.data.fuse = new Fuse(this.data.terms, {
            keys: ['canonical_name', 'synonyms_and_slang', 'definition_clinical.core'],
            threshold: 0.3
        });
    },

    handleSearch: function (query) {
        if (query.length < 2) {
            this.renderView('dictionary');
            return;
        }

        const results = this.data.fuse.search(query);
        this.renderResults(results);
    },

    renderAllTerms: function () {
        let currentLetter = '';
        let html = '';

        this.data.terms.forEach(term => {
            const firstLetter = term.canonical_name.charAt(0).toUpperCase();
            if (firstLetter !== currentLetter) {
                currentLetter = firstLetter;
                html += `<div class="alphabet-header">${currentLetter}</div>`;
            }
            html += `
                <div class="list-item" onclick="App.viewTerm('${term.term_id}')">
                    <span>${term.canonical_name}</span>
                    <span style="font-size: 0.7rem; color: var(--text-secondary); opacity: 0.6;">${term.term_kind}</span>
                </div>
            `;
        });

        this.nodes.allTermsList.innerHTML = html;
    },

    renderResults: function (results) {
        this.nodes.resultsView.innerHTML = `
            <h3 style="margin-top:0; font-size: 1rem;">Resultados de búsqueda</h3>
            ${results.map(r => `
                <div class="card" onclick="App.viewTerm('${r.item.term_id}')" style="margin-bottom: 0.75rem; padding: 1rem;">
                    <div style="display:flex; justify-content: space-between; align-items: flex-start;">
                        <strong style="color: var(--primary);">${r.item.canonical_name}</strong>
                        <div class="badge badge-risk-${r.item.risk_weight > 1 ? 'critical' : 'alert'}" style="font-size: 0.6rem;">
                            ${r.item.term_kind}
                        </div>
                    </div>
                    <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.5rem 0 0 0 line-height: 1.4;">
                        ${r.item.definition_clinical.core.substring(0, 80)}...
                    </p>
                </div>
            `).join('')}
        `;
        this.renderView('results');
    },

    viewTerm: function (termId) {
        const term = this.data.terms.find(t => t.term_id === termId);
        if (!term) return;

        this.addToRecent(term);

        this.nodes.termView.innerHTML = `
            <div class="btn-back" onclick="App.closeTerm()">← Volver</div>
            <div class="card">
                <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div class="badge badge-risk-${term.risk_weight > 1 ? 'critical' : 'alert'}">${term.term_kind}</div>
                    ${term.status === 'active' ? '✅' : ''}
                </div>
                <h2 class="term-title">${term.canonical_name}</h2>
                
                ${term.risk_weight > 1 ? `
                    <div class="alert-critical-banner">
                        <div class="alert-critical-header">
                            <span>⚠️</span> ALERTA DE RIESGO CLÍNICO
                        </div>
                        <p style="font-weight: 700; margin: 0; font-size: 0.95rem; color: #742a2a;">
                            ${term.alerts[0]?.message || 'Este término implica un riesgo de seguridad o manejo crítico.'}
                        </p>
                    </div>
                ` : ''}

                <div class="definition-section">
                    <span class="section-label">Definición Clínica</span>
                    <p>${term.definition_clinical.core}</p>
                </div>

                ${term.definition_clinical.subjective_marker ? `
                    <div class="definition-section">
                        <span class="section-label">Marcador Subjetivo</span>
                        <p><em>"${term.definition_clinical.subjective_marker}"</em></p>
                    </div>
                ` : ''}

                <div class="definition-section">
                    <span class="section-label">Dominios Asociados</span>
                    <div class="tag-container" style="margin-top: 0.5rem;">
                        ${term.domain_links && term.domain_links.length > 0 ?
                term.domain_links.map(link => `
                                <span class="tag" onclick="event.stopPropagation(); App.viewDomainDetails('${link.domain_id}')">
                                    ${this.getDomainIcon(link.domain_id)} ${this.getDomainSlug(link.domain_id).replace(/_/g, ' ')}
                                </span>
                            `).join('') : '<span style="font-size: 0.8rem; opacity: 0.5;">No categorizado</span>'}
                    </div>
                </div>

                <div class="definition-section">
                    <span class="section-label">Docencia & Perlas</span>
                    <ul style="padding-left: 1.25rem; font-size: 0.95rem;">
                        ${term.teaching_notes.map(note => `<li style="margin-bottom: 0.5rem;">${note}</li>`).join('')}
                    </ul>
                </div>

                ${term.examples && term.examples.length > 0 ? `
                    <div class="definition-section">
                        <span class="section-label">Ejemplos Clínicos</span>
                        <div class="examples-container">
                            ${term.examples.map(ex => `
                                <div class="example-item ${ex.type}">
                                    <div class="example-type-badge">${ex.type === 'patient_quote' ? '💬 Paciente' : '👁️ Observación'}</div>
                                    <p>${ex.type === 'patient_quote' ? `<em>"${ex.text}"</em>` : ex.text}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        this.renderView('term');
        this.nodes.content.scrollTop = 0;
    },

    loadRecentSearches: function () {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            this.data.recentSearches = JSON.parse(saved);
            this.renderRecentSearches();
        }
    },

    addToRecent: function (term) {
        // Only keep the 5 most recent
        this.data.recentSearches = [
            term.term_id,
            ...this.data.recentSearches.filter(id => id !== term.term_id)
        ].slice(0, 5);

        localStorage.setItem('recentSearches', JSON.stringify(this.data.recentSearches));
        this.renderRecentSearches();
    },

    renderRecentSearches: function () {
        if (this.data.recentSearches.length === 0) {
            this.nodes.recentSearchesBar.classList.add('hidden');
            return;
        }

        this.nodes.recentSearchesBar.classList.remove('hidden');
        this.nodes.recentList.innerHTML = this.data.recentSearches.map(id => {
            const term = this.data.terms.find(t => t.term_id === id);
            if (!term) return '';
            return `<span class="recent-search-tag" onclick="App.viewTerm('${term.term_id}')">${term.canonical_name}</span>`;
        }).join('');
    },

    viewAbout: function () {
        this.nodes.aboutView.innerHTML = `
            <div class="btn-back" onclick="App.switchTab('nav-dictionary')">← Volver</div>
            <div class="card">
                <h2 style="margin-top:0;">SOFT RUINS / BLACK SIGNAL</h2>
                <span class="badge" style="margin-bottom: 1rem;">Rev. 3.0</span>
                <p style="font-size: 0.9rem; font-style: italic; opacity: 0.8; margin-bottom: 1.5rem;">
                    “El bosque es amable hasta que se apaga la linterna.”
                </p>

                <div class="definition-section">
                    <span class="section-label">Naturaleza del Sistema</span>
                    <p style="font-size: 0.9rem;">
                        Registro dual de realidades clínicas. <strong>The Valley</strong> (Fantasía Nostálgica) para la exploración y calma; 
                        <strong>The Void</strong> (Cyber-Ritual) para el análisis profundo y el rigor estructural.
                    </p>
                </div>
                
                <div class="definition-section">
                    <span class="section-label">Fuentes y Referencias</span>
                    <ul style="font-size: 0.85rem; padding-left: 1.25rem;">
                        <li>Vallejo Ruiloba J. - Psicopatología y Psiquiatría.</li>
                        <li>Kaplan & Sadock's Synopsis.</li>
                        <li>EMA CANÓNICO - Protocolo de Excelencia.</li>
                    </ul>
                </div>

                <div class="card ritual-box" style="margin-top: 2rem; border-left: 4px solid var(--accent);">
                    <span class="section-label">Aviso Clínico</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0;">
                        Esta herramienta es un ritual de consulta rápida. No sustituye el juicio clínico. 
                        Uso exclusivo para profesionales versados en la arquitectura del pensamiento.
                    </p>
                </div>
                
                <p style="font-size: 0.7rem; color: var(--text-secondary); text-align: center; margin-top: 2rem; opacity: 0.5;">
                    EMA CANÓNICO v1.3.0 | Rev. 3.0
                </p>
            </div>
        `;
        this.renderView('about');
        this.nodes.navButtons.forEach(btn => btn.classList.remove('active'));
    },

    closeTerm: function () {
        if (this.nodes.search.value.length >= 2) {
            this.renderView('results');
        } else {
            this.renderView(this.data.currentView);
        }
    },

    renderDomains: function () {
        this.nodes.domainView.innerHTML = `
            <div id="domain-grid-container">
                <h3 style="margin-top:0; font-size: 1.2rem; color: var(--primary);">Explorar Dominios</h3>
                <div class="domain-grid">
                    ${this.data.domains.map(d => `
                        <div class="domain-card" onclick="App.viewDomainDetails('${d.domain_id}')">
                            <div class="domain-icon">${this.getDomainIcon(d.domain_id)}</div>
                            <span>${d.label_es || d.domain_name || d.domain_id}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div id="domain-detail-container" class="hidden"></div>
        `;
    },

    viewDomainDetails: function (domainId) {
        const domain = this.data.domains.find(d => d.domain_id === domainId);
        if (!domain) return;

        const filteredTerms = this.data.terms.filter(t =>
            t.domain_links && t.domain_links.some(link => link.domain_id === domainId)
        );

        const detailContainer = document.getElementById('domain-detail-container');
        document.getElementById('domain-grid-container').classList.add('hidden');
        detailContainer.classList.remove('hidden');

        detailContainer.innerHTML = `
            <div class="btn-back" onclick="App.closeDomainDetails()">← Volver a Dominios</div>
            
            <div class="domain-detail-header">
                <h2 class="domain-detail-title">
                    <span>${this.getDomainIcon(domain.domain_id)}</span>
                    ${domain.label_es || domain.domain_name}
                </h2>
                <p style="margin-top: 1rem; opacity: 0.9; line-height: 1.5;">${domain.definition_es || 'Sin definición disponible.'}</p>
            </div>

            <div class="section-container">
                <h3 class="section-label" style="font-size: 1rem;">Subcomponentes y Términos Aceptados</h3>
                ${domain.subcomponents ? domain.subcomponents.map(sub => `
                    <div class="subcomponent-item">
                        <span class="subcomponent-label">${sub.label_es}</span>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${sub.notes || ''}</p>
                        <div class="tag-container">
                            ${sub.accepted_terms ? sub.accepted_terms.map(term => `<span class="tag">${term}</span>`).join('') : ''}
                        </div>
                    </div>
                `).join('') : '<p>No hay subcomponentes definidos.</p>'}
            </div>

            ${domain.clinical_notes ? `
                <div class="section-container" style="margin-top: 1.5rem;">
                    <h3 class="section-label" style="font-size: 1rem;">Notas Clínicas</h3>
                    <ul style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-secondary);">
                        ${domain.clinical_notes.map(note => `<li style="margin-bottom: 0.5rem;">${note}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            <div class="section-container" style="margin-top: 1.5rem;">
                <h3 class="section-label" style="font-size: 1rem;">Términos en el Diccionario</h3>
                <div class="card" style="padding: 0.5rem;">
                    ${filteredTerms.length ? filteredTerms.map(t => `
                        <div class="list-item" onclick="App.viewTerm('${t.term_id}')">
                            <span>${t.canonical_name}</span>
                            <span style="font-size: 0.7rem; color: var(--text-secondary); opacity: 0.6;">${t.term_kind}</span>
                        </div>
                    `).join('') : '<p style="padding: 1rem; font-size: 0.9rem;">No hay términos específicos registrados aún.</p>'}
                </div>
            </div>

            ${domain.recommended_wording ? `
                <div class="wording-box wording-recommended" style="margin-top: 1.5rem;">
                    <span class="section-label" style="color: #2f855a;">Lenguaje Recomendado</span>
                    <ul class="wording-list">
                        ${domain.recommended_wording.map(w => `<li>${w}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;

        this.nodes.content.scrollTop = 0;
    },

    closeDomainDetails: function () {
        document.getElementById('domain-detail-container').classList.add('hidden');
        document.getElementById('domain-grid-container').classList.remove('hidden');
        this.nodes.content.scrollTop = 0;
    },

    renderCases: function () {
        this.nodes.casesView.innerHTML = `
            <h3 style="margin-top:0; color: var(--primary);">Escenarios OSCE</h3>
            ${this.data.cases.map(c => `
                <div class="card" style="padding: 1rem;">
                    <div style="display:flex; justify-content: space-between; align-items: center;">
                        <span class="badge" style="background:#edf2f7; color: #2d3748;">Nivel ${c.level}</span>
                        <code style="font-size: 0.7rem; opacity: 0.5;">${c.case_id}</code>
                    </div>
                    <p style="margin: 0.75rem 0; font-weight: 600; color: var(--primary-dark);">
                        ${c.stem.setting.replace(/_/g, ' ')}
                    </p>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
                        ${c.stem.contextual_notes}
                    </p>
                    <div style="font-size: 0.8rem; background: rgba(0, 51, 102, 0.05); padding: 0.75rem; border-radius: 8px; border-left: 4px solid var(--primary);">
                        <span class="section-label">Sindromática Esperada</span>
                        <strong style="color: var(--primary);">${c.expected_engine_output.primary_syndrome.replace(/_/g, ' ')}</strong>
                    </div>
                </div>
            `).join('')}
        `;
    },

    switchTab: function (id) {
        this.nodes.navButtons.forEach(btn => btn.classList.toggle('active', btn.id === id));
        this.nodes.search.value = '';

        if (id === 'nav-dictionary') {
            this.data.currentView = 'dictionary';
            this.renderView('dictionary');
        } else if (id === 'nav-domains') {
            this.data.currentView = 'domains';
            this.renderDomains();
            this.renderView('domains');
        } else if (id === 'nav-cases') {
            this.data.currentView = 'cases';
            this.renderCases();
            this.renderView('cases');
        }
    },

    renderView: function (viewName) {
        const views = ['dictionary', 'results', 'term', 'domain', 'cases', 'about'];
        views.forEach(v => {
            const node = this.nodes[`${v}View`];
            if (node) {
                if (v === viewName) node.classList.remove('hidden');
                else node.classList.add('hidden');
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;
