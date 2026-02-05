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
            document.getElementById('app-title').innerText = 'DICCIONARIO DE EXAMEN MENTAL';
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
                const caseFiles = [
                    'OSCE_001–003.json',
                    'OSCE_004–OSCE_009.json',
                    'OSCE_010–OSCE_015.json',
                    'OSCE_016–025.json',
                    'OSCE_026–035.json'
                ];
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
        try {
            const term = this.data.terms.find(t => t.term_id === termId);
            if (!term) return;

            this.addToRecent(term);

            // Defensive defaults for templates
            const teachingNotes = term.teaching_notes || [];
            const alerts = term.alerts || [];
            const examples = term.examples || [];
            const domainLinks = term.domain_links || [];

            this.nodes.termView.innerHTML = `
            <div class="btn-back" onclick="App.closeTerm()">← Volver</div>
            <div class="card">
                <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div class="badge badge-risk-${term.risk_weight > 1 ? 'critical' : 'alert'}">${term.term_kind || 'término'}</div>
                    ${term.status === 'active' ? '✅' : ''}
                </div>
                <h2 class="term-title">${term.canonical_name}</h2>
                
                ${term.risk_weight > 1 ? `
                    <div class="alert-critical-banner">
                        <div class="alert-critical-header">
                            <span>⚠️</span> ALERTA DE RIESGO CLÍNICO
                        </div>
                        <p style="font-weight: 700; margin: 0; font-size: 0.95rem; color: #742a2a;">
                            ${alerts.length > 0 ? alerts[0].message : 'Este término implica un riesgo de seguridad o manejo crítico.'}
                        </p>
                    </div>
                ` : ''}

                <div class="definition-section">
                    <span class="section-label">Definición Clínica</span>
                    <p>${term.definition_clinical?.core || 'Sin definición disponible.'}</p>
                </div>

                ${term.definition_clinical?.subjective_marker ? `
                    <div class="definition-section">
                        <span class="section-label">Marcador Subjetivo</span>
                        <p><em>"${term.definition_clinical.subjective_marker}"</em></p>
                    </div>
                ` : ''}

                <div class="definition-section">
                    <span class="section-label">Dominios Asociados</span>
                    <div class="tag-container" style="margin-top: 0.5rem;">
                        ${domainLinks.length > 0 ?
                    domainLinks.map(link => `
                                <span class="tag" onclick="event.stopPropagation(); App.viewDomainDetails('${link.domain_id}')">
                                    ${this.getDomainIcon(link.domain_id)} ${this.getDomainSlug(link.domain_id).replace(/_/g, ' ')}
                                </span>
                            `).join('') : '<span style="font-size: 0.8rem; opacity: 0.5;">No categorizado</span>'}
                    </div>
                </div>

                ${teachingNotes.length > 0 ? `
                <div class="definition-section">
                    <span class="section-label">Docencia & Perlas</span>
                    <ul style="padding-left: 1.25rem; font-size: 0.95rem;">
                        ${teachingNotes.map(note => `<li style="margin-bottom: 0.5rem;">${note}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                ${examples.length > 0 ? `
                    <div class="definition-section">
                        <span class="section-label">Ejemplos Clínicos</span>
                        <div class="examples-container">
                            ${examples.map(ex => `
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
        } catch (e) {
            console.error("Error rendering term view:", e);
            alert("Error al cargar la ficha. El archivo podría estar incompleto.");
        }
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
                <h2 style="margin-top:0;">DICCIONARIO DE EXAMEN MENTAL</h2>
                <span class="badge" style="margin-bottom: 1rem;">Versión 1.3.0</span>
                
                <div class="definition-section">
                    <span class="section-label">Sobre la herramienta</span>
                    <p style="font-size: 0.9rem;">
                        Este recurso ha sido diseñado como una guía de consulta rápida para profesionales de la salud mental y estudiantes en formación. Su objetivo es estandarizar la terminología psicopatológica y facilitar la precisión en el registro del examen mental.
                    </p>
                </div>

                <div class="definition-section">
                    <span class="section-label">Cómo se usa</span>
                    <div style="font-size: 0.9rem; line-height: 1.5;">
                        <p><strong>1. Búsqueda:</strong> Utilice la barra superior para buscar términos por nombre, sinónimos o descripción.</p>
                        <p><strong>2. Dominios:</strong> Explore el menú de "Dominios" para ver los términos agrupados por funciones psíquicas (Conciencia, Pensamiento, Afecto, etc.).</p>
                        <p><strong>3. Casos OSCE:</strong> Revise escenarios clínicos prácticos para entrenar la identificación de signos y síntomas.</p>
                        <p><strong>4. Modos Visuales:</strong> Use el icono del sol/luna para alternar entre modos de alto y bajo contraste según su preferencia de lectura.</p>
                    </div>
                </div>
                
                <div class="definition-section">
                    <span class="section-label">Fuentes y Referencias (APA 7)</span>
                    <ul style="font-size: 0.8rem; padding-left: 1.25rem; line-height: 1.4;">
                        <li style="margin-bottom: 0.5rem;"><strong>Oyebode, F.</strong> (2022). <em>Sims' Symptoms in the Mind: Textbook of Descriptive Psychopathology</em> (7ª ed.). Elsevier.</li>
                        <li style="margin-bottom: 0.5rem;"><strong>Robinson, D. J.</strong> (2017). <em>The Mental Status Exam Explained</em> (3ª ed.). Rapid Psychler Press.</li>
                        <li style="margin-bottom: 0.5rem;"><strong>Mendez, M. F.</strong> (2021). <em>The Mental Status Examination Handbook</em> (1ª ed.). Elsevier.</li>
                        <li style="margin-bottom: 0.5rem;"><strong>Voss, R. M., & Das, J. M.</strong> (2024). Mental Status Examination. En <em>StatPearls</em> [Internet]. StatPearls Publishing.</li>
                        <li style="margin-bottom: 0.5rem;"><strong>Hughes, S.</strong> (s.f.). <em>History Taking & Risk Assessment & Mental State Examination Resource Pack</em>. University of Bristol, Academic Unit of Psychiatry.</li>
                    </ul>
                </div>

                <div class="card clinical-box" style="margin-top: 2rem; border-left: 4px solid var(--accent);">
                    <span class="section-label">Aviso Clínico</span>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0;">
                        Esta herramienta es de carácter informativo y apoyo pedagógico. No sustituye el juicio clínico soberano del profesional ni los protocolos institucionales vigentes.
                    </p>
                </div>
                
                <p style="font-size: 0.7rem; color: var(--text-secondary); text-align: center; margin-top: 2rem; opacity: 0.5;">
                    Diccionario MSE | SOPORTE ACADÉMICO v1.3.0
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
                <div class="clinical-box" style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(var(--primary-rgb), 0.05); border-radius: 12px;">
                    <h3 style="margin-top:0; font-size: 1.2rem; color: var(--primary);">Explorador de Dominios</h3>
                    <p style="font-size: 0.85rem; opacity: 0.8; margin: 0;">Seleccione un dominio para ver su estructura clínica y términos asociados.</p>
                </div>
                <div class="domain-grid">
                    ${this.data.domains.map(d => `
                        <div class="domain-card" onclick="App.viewDomainDetails('${d.domain_id}')">
                            <div class="domain-icon">${this.getDomainIcon(d.domain_id)}</div>
                            <span class="domain-title">${d.label_es || d.domain_name || d.domain_id}</span>
                            <div class="domain-subtitle" style="font-size: 0.6rem; opacity: 0.6; text-transform: none;">
                                ${d.subcomponents ? d.subcomponents.length + ' áreas' : 'Detalles'}
                            </div>
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
            <p style="font-size: 0.85rem; opacity: 0.8; margin-bottom: 1rem;">Seleccione un caso para practicar el diagnóstico diferencial.</p>
            ${this.data.cases.map(c => `
                <div class="card" onclick="App.renderCase('${c.case_id}')" style="padding: 1rem; cursor: pointer;">
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
                    <div style="font-size: 0.75rem; color: var(--primary); font-weight: 600; text-align: right;">
                        Ver Caso →
                    </div>
                </div>
            `).join('')}
        `;
    },

    renderCase: function (caseId) {
        const c = this.data.cases.find(x => x.case_id === caseId);
        if (!c) return;

        const domainGrid = Object.entries(c.domains).map(([key, data]) => {
            const domainName = key;
            const content = Object.entries(data)
                .map(([k, v]) => `<li><strong>${k.replace(/_/g, ' ')}:</strong> ${String(v || '').replace(/_/g, ' ')}</li>`)
                .join('');

            return `
                <div class="domain-card" style="border: 1px solid var(--border); padding: 0.75rem; border-radius: 8px; font-size: 0.85rem;">
                    <div style="font-weight:bold; color:var(--primary); margin-bottom:0.5rem; border-bottom:1px solid var(--border-subtle);">${domainName}</div>
                    <ul style="padding-left: 1rem; margin:0;">${content}</ul>
                </div>
            `;
        }).join('');

        this.nodes.casesView.innerHTML = `
            <div class="btn-back" onclick="App.renderCases()">← Volver a Lista de Casos</div>
            <div class="card">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h2 class="term-title">${c.case_id}: ${c.stem.sex}, ${c.stem.age_range}</h2>
                    <span class="badge">${c.stem.setting.replace(/_/g, ' ')}</span>
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
                            <p style="font-size: 1.1rem; font-weight: bold;">${c.expected_engine_output.primary_syndrome.replace(/_/g, ' ')}</p>
                            
                            <div style="margin-top: 1rem; display:flex; gap: 0.5rem; flex-wrap: wrap;">
                                ${c.expected_engine_output.critical_flags.map(f =>
            `<span class="badge" style="background: #fed7d7; color: #742a2a;">🚩 ${f.replace(/_/g, ' ')}</span>`
        ).join('')}
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div style="background: rgba(47, 133, 90, 0.1); color: #22543d; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem;">
                                <strong>Claves Diagnósticas:</strong>
                                <ul>${c.assessment_keys.key_discriminators.map(x => `<li>${x.replace(/_/g, ' ')}</li>`).join('')}</ul>
                            </div>
                            <div style="background: rgba(197, 48, 48, 0.1); color: #742a2a; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem;">
                                <strong>Errores a Evitar:</strong>
                                <ul>${c.assessment_keys.errors_to_avoid.map(x => `<li>${x.replace(/_/g, ' ')}</li>`).join('')}</ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        window.scrollTo(0, 0);
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
            this.renderView('domain');
        } else if (id === 'nav-cases') {
            this.data.currentView = 'cases';
            this.renderCases();
            this.renderView('cases');
        } else if (id === 'nav-game') {
            this.data.currentView = 'game';
            this.game.init();
            this.renderView('game');
        }
    },

    // --- GAME ENGINE SUBMODULE ---
    game: {
        stats: { score: 0, streak: 0, correct: 0, wrong: 0 },
        currentMode: 'mcq', // 'mcq' or 'diff'
        diffPhase: 1,
        currentRound: null,

        init: function () {
            this.loadStats();
            this.cacheDOM();
            this.bindEvents();
            this.renderStats();
            if (!this.currentRound) this.nextRound(); // Only start if not already started
        },

        cacheDOM: function () {
            this.nodes = {
                score: document.getElementById('score'),
                streak: document.getElementById('streak'),
                correct: document.getElementById('correct'),
                wrong: document.getElementById('wrong'),
                modeMcq: document.getElementById('modeMcq'),
                modeDiff: document.getElementById('modeDiff'),
                domainSelect: document.getElementById('domainSelect'),
                difficultySelect: document.getElementById('difficultySelect'),
                prompt: document.getElementById('prompt'),
                subprompt: document.getElementById('subprompt'),
                options: document.getElementById('options'),
                feedback: document.getElementById('feedback'),
                hint: document.getElementById('hint'),
                btnNext: document.getElementById('btnNext'),
                btnReset: document.getElementById('btnReset')
            };
        },

        bindEvents: function () {
            // Check if already bound to avoid duplicates in SPA
            if (this._bound) return;
            this._bound = true;

            this.nodes.modeMcq.addEventListener('click', () => this.setMode('mcq'));
            this.nodes.modeDiff.addEventListener('click', () => this.setMode('diff'));
            this.nodes.btnNext.addEventListener('click', () => this.nextRound());
            this.nodes.btnReset.addEventListener('click', () => this.resetStats());

            // Populate domains from main App data
            this.populateDomains();
        },

        populateDomains: function () {
            const domains = App.data.domains; // Use main app data
            this.nodes.domainSelect.innerHTML = '<option value="any">Todos los Dominios</option>';
            domains.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.domain_id;
                opt.textContent = d.label_es || d.domain_name;
                this.nodes.domainSelect.appendChild(opt);
            });
        },

        setMode: function (mode) {
            this.currentMode = mode;
            this.nodes.modeMcq.setAttribute('aria-selected', mode === 'mcq');
            this.nodes.modeDiff.setAttribute('aria-selected', mode === 'diff');
            this.nextRound();
        },

        loadStats: function () {
            const saved = localStorage.getItem('mse_game_stats');
            if (saved) this.stats = JSON.parse(saved);
        },

        saveStats: function () {
            localStorage.setItem('mse_game_stats', JSON.stringify(this.stats));
            this.renderStats();
        },

        resetStats: function () {
            this.stats = { score: 0, streak: 0, correct: 0, wrong: 0 };
            this.saveStats();
            this.showFeedback("Progreso reiniciado.", "ok");
        },

        renderStats: function () {
            if (!this.nodes) return;
            this.nodes.score.innerText = this.stats.score;
            this.nodes.streak.innerText = this.stats.streak;
            this.nodes.correct.innerText = this.stats.correct;
            this.nodes.wrong.innerText = this.stats.wrong;
        },

        nextRound: function () {
            this.clearFeedback();
            this.nodes.options.innerHTML = '';
            this.nodes.hint.textContent = '';

            const domain = this.nodes.domainSelect.value;
            const diff = this.nodes.difficultySelect.value;

            if (this.currentMode === 'mcq') {
                this.diffPhase = 1;
                this.currentRound = this.buildMcqRound(domain, diff);
                this.renderMcqRound(this.currentRound);
            } else {
                this.diffPhase = 1;
                this.currentRound = this.buildDiffRound(domain, diff);
                this.renderDiffPhase1(this.currentRound);
            }
        },

        // --- MCQ LOGIC ---
        buildMcqRound: function (domainId, diffObj) {
            // Filter terms from main App.data.terms
            let pool = App.data.terms.filter(t => t.definition_clinical && t.definition_clinical.core);
            if (domainId !== 'any') {
                pool = pool.filter(t => t.domain_links && t.domain_links.some(l => l.domain_id === domainId));
            }
            // Add difficulty filter if data supports it (assuming defaults for now)

            if (pool.length < 4) return { error: "Insuficientes términos para esta selección." };

            const target = this.sampleOne(pool);
            const distractorPool = pool.filter(t => t.term_id !== target.term_id);
            const distractors = this.sampleMany(distractorPool, 3);

            const options = this.shuffle([
                { id: target.term_id, text: target.definition_clinical.core, correct: true },
                ...distractors.map(d => ({ id: d.term_id, text: d.definition_clinical.core, correct: false }))
            ]);

            return { mode: 'mcq', target, options };
        },

        renderMcqRound: function (round) {
            if (round.error) {
                this.nodes.prompt.textContent = "Error";
                this.nodes.subprompt.textContent = round.error;
                return;
            }
            this.nodes.prompt.textContent = `¿Cuál define mejor: "${round.target.canonical_name}"?`;
            this.nodes.subprompt.textContent = `${round.target.term_kind} · ${App.getDomainSlug(round.target.domain_links?.[0]?.domain_id || '')}`;

            this.renderOptions(round.options, (opt) => this.gradeMcq(opt.correct, round.target));
        },

        gradeMcq: function (isCorrect, target) {
            if (isCorrect) {
                this.stats.score += 10;
                this.stats.streak += 1;
                this.stats.correct += 1;
                this.showFeedback("¡Correcto!", "ok");
                if (target.teaching_notes) this.nodes.hint.textContent = `Nota: ${target.teaching_notes[0]}`;
                this.disableOptions();
            } else {
                this.stats.score = Math.max(0, this.stats.score - 5);
                this.stats.streak = 0;
                this.stats.wrong += 1;
                this.showFeedback("Incorrecto.", "bad");
            }
            this.saveStats();
        },

        // --- DIFFERENTIAL LOGIC ---
        buildDiffRound: function (domainId, diffObj) {
            let pool = App.data.cases;
            if (domainId !== 'any') {
                // Simple domain check via domains object keys
                pool = pool.filter(c => c.domains && c.domains[domainId]);
            }
            if (diffObj !== 'any') {
                pool = pool.filter(c => String(c.level) === String(diffObj));
            }

            if (pool.length === 0) return { error: "No hay casos con estos filtros." };

            const c = this.sampleOne(pool);
            // In the real app, we don't have 'target_term_id' explicitly in case json sometimes, 
            // but we have 'primary_syndrome'. We will use primary_syndrome as the target.

            const targetName = c.expected_engine_output.primary_syndrome;

            // Create options: Target + Random Distractors from other cases
            const otherCases = App.data.cases.filter(x => x.case_id !== c.case_id);
            const distractors = this.sampleMany(otherCases, 3).map(x => x.expected_engine_output.primary_syndrome);

            // Unique set
            const uniqueOptions = [...new Set([targetName, ...distractors])];
            // Ensure we have at least 2 distinct

            const termOptions = this.shuffle(uniqueOptions.map(name => ({
                id: name,
                text: name.replace(/_/g, ' '),
                correct: name === targetName
            })));

            // Phase 2: Key Discriminators
            const correctKeys = c.assessment_keys.key_discriminators;
            const wrongKeys = c.assessment_keys.errors_to_avoid; // Use errors as distractors for phase 2

            const discOptions = this.shuffle([
                { text: this.sampleOne(correctKeys), correct: true, why: "Criterio discriminante clave." },
                { text: this.sampleOne(wrongKeys), correct: false, why: "Error común a evitar." }
            ]);

            return { mode: 'diff', case: c, termOptions, discOptions };
        },

        renderDiffPhase1: function (round) {
            if (round.error) {
                this.nodes.prompt.textContent = "Error";
                this.nodes.subprompt.textContent = round.error;
                return;
            }
            this.nodes.prompt.textContent = "Paso 1: Identifica el Síndrome / Diagnóstico";
            this.nodes.subprompt.textContent = `"${round.case.stem.contextual_notes}"`;

            this.renderOptions(round.termOptions, (opt) => {
                if (opt.correct) {
                    this.showFeedback("Correcto. Ahora valida el criterio clave.", "ok");
                    this.disableOptions();
                    setTimeout(() => {
                        this.clearFeedback();
                        this.renderDiffPhase2(round);
                    }, 500);
                } else {
                    this.stats.score = Math.max(0, this.stats.score - 5);
                    this.stats.streak = 0;
                    this.stats.wrong += 1;
                    this.saveStats();
                    this.showFeedback("Diagnóstico incorrecto.", "bad");
                }
            });
        },

        renderDiffPhase2: function (round) {
            this.nodes.prompt.textContent = "Paso 2: Selecciona el criterio discriminante válido";
            this.nodes.options.innerHTML = '';
            this.renderOptions(round.discOptions, (opt) => {
                if (opt.correct) {
                    this.stats.score += 20;
                    this.stats.streak += 1;
                    this.stats.correct += 1;
                    this.showFeedback("¡Excelente! Caso resuelto.", "ok");
                    this.nodes.hint.textContent = `Clave: ${opt.text}`;
                    this.disableOptions();
                } else {
                    this.stats.score = Math.max(0, this.stats.score - 5);
                    this.stats.streak = 0;
                    this.stats.wrong += 1;
                    this.showFeedback("Criterio incorrecto (es un error común).", "bad");
                }
                this.saveStats();
            });
        },

        // --- UTILS ---
        renderOptions: function (options, callback) {
            this.nodes.options.innerHTML = '';
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'opt';
                btn.textContent = opt.text;
                btn.onclick = () => callback(opt);
                this.nodes.options.appendChild(btn);
            });
        },
        disableOptions: function () {
            const btns = this.nodes.options.querySelectorAll('button');
            btns.forEach(b => b.disabled = true);
        },
        showFeedback: function (msg, cls) {
            this.nodes.feedback.textContent = msg;
            this.nodes.feedback.className = `feedback ${cls}`;
        },
        clearFeedback: function () {
            this.nodes.feedback.textContent = '';
            this.nodes.feedback.className = 'feedback';
        },
        sampleOne: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
        sampleMany: function (arr, n) { return [...arr].sort(() => 0.5 - Math.random()).slice(0, n); },
        shuffle: function (arr) { return arr.sort(() => 0.5 - Math.random()); }
    },

    renderView: function (viewName) {
        const views = ['dictionary', 'results', 'term', 'domain', 'cases', 'about', 'game'];
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
