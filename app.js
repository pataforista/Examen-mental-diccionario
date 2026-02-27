const App = {
    data: {
        terms: [],
        domains: [],
        cases: [],
        fuse: null,
        currentView: 'dictionary',
        recentSearches: [],
        searchDebounceTimer: null,
        chromaPos: { x: 0, y: 0 }
    },

    init: async function () {
        this.cacheDOM();
        this.registerSW();
        this.bindEvents();
        await this.loadData();
        this.setupSearch();
        this.loadRecentSearches();
        this.renderAllTerms();
        this.theme.init();
    },

    registerSW: function () {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(reg => {
                    console.log('Service Worker Registered', reg.scope);
                    // Check for updates every hour
                    setInterval(() => reg.update(), 1000 * 60 * 60);
                })
                .catch(err => console.error('Service Worker Registration Failed', err));

            // Reload when a new service worker takes over
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    },

    utils: {
        sanitizeHTML: function (text) {
            if (typeof text !== 'string') return text;
            // Basic entity map for manual escape
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            let safe = text.replace(/[&<>"']/g, m => map[m]);
            // Restore allowed clinical tags
            return safe
                .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
                .replace(/&lt;strong&gt;/gi, '<strong>')
                .replace(/&lt;\/strong&gt;/gi, '</strong>')
                .replace(/&lt;em&gt;/gi, '<em>')
                .replace(/&lt;\/em&gt;/gi, '</em>')
                .replace(/&lt;ul&gt;/gi, '<ul>')
                .replace(/&lt;\/ul&gt;/gi, '</ul>')
                .replace(/&lt;li&gt;/gi, '<li>')
                .replace(/&lt;\/li&gt;/gi, '</li>');
        }
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
            themeToggle: document.getElementById('theme-toggle'),
            gameView: document.getElementById('game-view')
        };
    },

    bindEvents: function () {
        this.nodes.search.addEventListener('input', (e) => {
            clearTimeout(this.data.searchDebounceTimer);
            this.data.searchDebounceTimer = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 180);
        });
        this.nodes.navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.id;
                this.switchTab(tabId);
                history.pushState({ view: tabId }, '', `#${tabId.replace('nav-', '')}`);
            });
        });
        this.nodes.aboutBtn.addEventListener('click', () => {
            this.viewAbout();
            history.pushState({ view: 'about' }, '', '#about');
        });
        this.nodes.themeToggle.addEventListener('click', () => this.theme.toggle());

        // History API support
        window.addEventListener('popstate', (e) => this.handlePopState(e.state));

        // Floating coffee CTA
        const coffeeClose = document.getElementById('coffee-float-close');
        if (coffeeClose) coffeeClose.addEventListener('click', (e) => {
            e.stopPropagation();
            this.coffee.dismiss();
        });
        const coffeeLink = document.getElementById('coffee-float-link');
        if (coffeeLink) coffeeLink.addEventListener('click', () => {
            window.open('https://buymeacoffee.com/herramente', '_blank');
            this.coffee.dismiss();
        });
    },

    handlePopState: function (state) {
        if (!state) {
            this.switchTab('nav-dictionary');
            return;
        }
        if (state.view === 'term' && state.termId) {
            this.viewTerm(state.termId, true);
        } else if (state.view === 'domain' && state.domainId) {
            this.viewDomainDetails(state.domainId, true);
        } else if (state.view.startsWith('nav-')) {
            this.switchTab(state.view);
        } else if (state.view === 'about') {
            this.viewAbout();
        } else {
            this.switchTab('nav-dictionary');
        }
    },

    loadData: async function () {
        try {
            // Load optimized lexicon bundle
            const bundle = await fetch('lexicon/lexicon_bundle.json').then(r => r.json());
            this.data.terms = bundle.terms;

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
        const cleanQuery = query.trim();
        if (cleanQuery.length < 2) {
            this.renderView('dictionary');
            return;
        }

        const results = this.data.fuse
            ? this.data.fuse.search(cleanQuery)
            : this.fallbackSearch(cleanQuery);

        this.renderResults(results);
    },

    normalizeText: function (text) {
        return String(text || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    },

    fallbackSearch: function (query) {
        const normalizedQuery = this.normalizeText(query);
        return this.data.terms
            .filter(term => {
                const haystack = [
                    term.canonical_name,
                    ...(term.synonyms_and_slang || []),
                    term.definition_clinical?.core
                ].map(item => this.normalizeText(item)).join(' ');
                return haystack.includes(normalizedQuery);
            })
            .slice(0, 50)
            .map(item => ({ item }));
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
                        <strong style="color: var(--primary);">${this.utils.sanitizeHTML(r.item.canonical_name)}</strong>
                        <div class="badge badge-risk-${r.item.risk_weight > 1 ? 'critical' : 'alert'}" style="font-size: 0.6rem;">
                            ${this.utils.sanitizeHTML(r.item.term_kind)}
                        </div>
                    </div>
                    <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.5rem 0 0 0; line-height: 1.4;">
                        ${this.utils.sanitizeHTML((r.item.definition_clinical?.core || 'Sin definición disponible.').substring(0, 80))}...
                    </p>
                </div>
            `).join('')}
        `;
        this.renderView('results');
    },

    viewTerm: function (termId, isPopState = false) {
        try {
            const term = this.data.terms.find(t => t.term_id === termId);
            if (!term) return;

            if (!isPopState) {
                history.pushState({ view: 'term', termId: termId }, '', `#term/${termId}`);
            }

            this.addToRecent(term);
            this.coffee.increment();

            // Defensive defaults for templates
            const teachingNotes = term.teaching_notes || [];
            const alerts = term.alerts || [];
            const examples = term.examples || [];
            const domainLinks = term.domain_links || [];

            this.nodes.termView.innerHTML = `
            <div class="btn-back" onclick="App.closeTerm()">← Volver</div>
            <div class="card">
                <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div class="badge badge-risk-${term.risk_weight > 1 ? 'critical' : 'alert'}">${this.utils.sanitizeHTML(term.term_kind || 'término')}</div>
                    ${term.status === 'active' ? '✅' : ''}
                </div>
                <h2 class="term-title">${this.utils.sanitizeHTML(term.canonical_name)}</h2>
                
                ${term.risk_weight > 1 ? `
                    <div class="alert-critical-banner">
                        <div class="alert-critical-header">
                            <span>⚠️</span> ALERTA DE RIESGO CLÍNICO
                        </div>
                        <p style="font-weight: 700; margin: 0; font-size: 0.95rem; color: #742a2a;">
                            ${alerts.length > 0 ? this.utils.sanitizeHTML(alerts[0].message) : 'Este término implica un riesgo de seguridad o manejo crítico.'}
                        </p>
                    </div>
                ` : ''}

                <div class="definition-section">
                    <span class="section-label">Definición Clínica</span>
                    <p>${this.utils.sanitizeHTML(term.definition_clinical?.core || 'Sin definición disponible.')}</p>
                </div>

                ${term.definition_clinical?.subjective_marker ? `
                    <div class="definition-section">
                        <span class="section-label">Marcador Subjetivo</span>
                        <p><em>"${this.utils.sanitizeHTML(term.definition_clinical.subjective_marker)}"</em></p>
                    </div>
                ` : ''}

                <div class="definition-section">
                    <span class="section-label">Dominios Asociados</span>
                    <div class="tag-container" style="margin-top: 0.5rem;">
                        ${domainLinks.length > 0 ?
                    domainLinks.map(link => `
                                <span class="tag" onclick="event.stopPropagation(); App.viewDomainDetails('${link.domain_id}')">
                                    ${this.getDomainIcon(link.domain_id)} ${this.utils.sanitizeHTML(this.getDomainSlug(link.domain_id).replace(/_/g, ' '))}
                                </span>
                            `).join('') : '<span style="font-size: 0.8rem; opacity: 0.5;">No categorizado</span>'}
                    </div>
                </div>

                ${teachingNotes.length > 0 ? `
                <div class="definition-section">
                    <span class="section-label">Docencia & Perlas</span>
                    <ul style="padding-left: 1.25rem; font-size: 0.95rem;">
                        ${teachingNotes.map(note => `<li style="margin-bottom: 0.5rem;">${this.utils.sanitizeHTML(note)}</li>`).join('')}
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
                                    <p>${ex.type === 'patient_quote' ? `<em>"${this.utils.sanitizeHTML(ex.text)}"</em>` : this.utils.sanitizeHTML(ex.text)}</p>
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
            
            <div class="chroma-grid" id="about-chroma-grid">
                <article class="chroma-card" style="--card-border: #56D8B6; --cols: 1;">
                    <div class="chroma-img-wrapper">
                        <img src="https://i.pravatar.cc/300?u=cesarcelada" alt="Dr. Cesar Celada">
                    </div>
                    <footer class="chroma-info">
                        <h3 class="name">Dr. Cesar Celada</h3>
                        <span class="handle">Autor Principal</span>
                        <p class="role">Médico Psiquiatra</p>
                        <p style="font-size: 0.8rem; margin-top: 1rem; opacity: 0.7;">
                            Creador del Diccionario de Examen Mental. Proyecto independiente y sin fines de lucro para la formación clínica.
                        </p>
                    </footer>
                </article>

                <article class="chroma-card" style="--card-border: #F59E0B;" onclick="window.location.href='mailto:drceladapsiquiatria@gmail.com'">
                    <div class="chroma-img-wrapper" style="display: flex; align-items: center; justify-content: center; background: rgba(var(--primary-rgb), 0.1);">
                        <span style="font-size: 3rem;">📩</span>
                    </div>
                    <footer class="chroma-info">
                        <h3 class="name">Contacto</h3>
                        <span class="handle">Aclaraciones y Mejoras</span>
                        <p class="role">drceladapsiquiatria@gmail.com</p>
                    </footer>
                </article>

                <article class="chroma-card coffee-card" onclick="window.open('https://buymeacoffee.com/herramente', '_blank')">
                    <div class="chroma-img-wrapper" style="display: flex; align-items: center; justify-content: center; background: #FFDD00;">
                        <span style="font-size: 3.5rem;">☕</span>
                    </div>
                    <footer class="chroma-info">
                        <h3 class="name" style="color: #6d4c41;">Invitame un café</h3>
                        <span class="handle" style="color: #6d4c41; opacity: 0.8;">Donar para mantener el servidor</span>
                        <p class="role" style="font-weight: 800; color: #444;">buymeacoffee.com/herramente</p>
                    </footer>
                    <div style="margin-top: 1rem; padding: 0.5rem 1rem; background: #FFDD00; color: #444; border-radius: 20px; font-weight: 800; font-size: 0.8rem;">DONAR AHORA</div>
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
        this.renderView('about');
        this.nodes.navButtons.forEach(btn => btn.classList.remove('active'));
        this.setupChromaGrid();
    },

    setupChromaGrid: function () {
        const grid = document.getElementById('about-chroma-grid');
        if (!grid) return;

        // Mouse follow on grid
        const setX = gsap.quickSetter(grid, '--x', 'px');
        const setY = gsap.quickSetter(grid, '--y', 'px');

        grid.addEventListener('pointermove', (e) => {
            const rect = grid.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            gsap.to(this.data.chromaPos, {
                x, y,
                duration: 0.45,
                ease: 'power3.out',
                onUpdate: () => {
                    setX(this.data.chromaPos.x);
                    setY(this.data.chromaPos.y);
                },
                overwrite: true
            });
        });

        // Mouse follow on cards
        const cards = grid.querySelectorAll('.chroma-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    },

    closeTerm: function () {
        if (this.nodes.search.value.length >= 2) {
            this.renderView('results');
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
                                ${d.subcomponents ? d.subcomponents.length + ' áreas' : 'Detalles'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div id="domain-detail-container" class="hidden"></div>
        `;
    },

    viewDomainDetails: function (domainId, isPopState = false) {
        const domain = this.data.domains.find(d => d.domain_id === domainId);
        if (!domain) return;

        if (!isPopState) {
            history.pushState({ view: 'domain', domainId: domainId }, '', `#domain/${domainId}`);
        }

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
                    ${this.utils.sanitizeHTML(domain.label_es || domain.domain_name)}
                </h2>
                <p style="margin-top: 1rem; opacity: 0.9; line-height: 1.5;">${this.utils.sanitizeHTML(domain.definition_es || 'Sin definición disponible.')}</p>
            </div>

            <div class="section-container">
                <h3 class="section-label" style="font-size: 1rem;">Subcomponentes y Términos Aceptados</h3>
                ${domain.subcomponents ? domain.subcomponents.map(sub => `
                    <div class="subcomponent-item">
                        <span class="subcomponent-label">${this.utils.sanitizeHTML(sub.label_es)}</span>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${this.utils.sanitizeHTML(sub.notes || '')}</p>
                        <div class="tag-container">
                            ${sub.accepted_terms ? sub.accepted_terms.map(term => `<span class="tag">${this.utils.sanitizeHTML(term)}</span>`).join('') : ''}
                        </div>
                    </div>
                `).join('') : '<p>No hay subcomponentes definidos.</p>'}
            </div>

            ${domain.clinical_notes ? `
                <div class="section-container" style="margin-top: 1.5rem;">
                    <h3 class="section-label" style="font-size: 1rem;">Notas Clínicas</h3>
                    <ul style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-secondary);">
                        ${domain.clinical_notes.map(note => `<li style="margin-bottom: 0.5rem;">${this.utils.sanitizeHTML(note)}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            <div class="section-container" style="margin-top: 1.5rem;">
                <h3 class="section-label" style="font-size: 1rem;">Términos en el Diccionario</h3>
                <div class="card" style="padding: 0.5rem;">
                    ${filteredTerms.length ? filteredTerms.map(t => `
                        <div class="list-item" onclick="App.viewTerm('${t.term_id}')">
                            <span>${this.utils.sanitizeHTML(t.canonical_name)}</span>
                            <span style="font-size: 0.7rem; color: var(--text-secondary); opacity: 0.6;">${this.utils.sanitizeHTML(t.term_kind)}</span>
                        </div>
                    `).join('') : '<p style="padding: 1rem; font-size: 0.9rem;">No hay términos específicos registrados aún.</p>'}
                </div>
            </div>

            ${domain.recommended_wording ? `
                <div class="wording-box wording-recommended" style="margin-top: 1.5rem;">
                    <span class="section-label" style="color: #2f855a;">Lenguaje Recomendado</span>
                    <ul class="wording-list">
                        ${domain.recommended_wording.map(w => `<li>${this.utils.sanitizeHTML(w)}</li>`).join('')}
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
                        <span class="badge" style="background:#edf2f7; color: #2d3748;">Nivel ${this.utils.sanitizeHTML(String(c.level))}</span>
                        <code style="font-size: 0.7rem; opacity: 0.5;">${this.utils.sanitizeHTML(c.case_id)}</code>
                    </div>
                    <p style="margin: 0.75rem 0; font-weight: 600; color: var(--primary-dark);">
                        ${this.utils.sanitizeHTML(c.stem.setting.replace(/_/g, ' '))}
                    </p>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
                        ${this.utils.sanitizeHTML(c.stem.contextual_notes)}
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
                            <p style="font-size: 1.1rem; font-weight: bold;">${this.utils.sanitizeHTML(c.expected_engine_output.primary_syndrome.replace(/_/g, ' '))}</p>
                            
                            <div style="margin-top: 1rem; display:flex; gap: 0.5rem; flex-wrap: wrap;">
                                ${c.expected_engine_output.critical_flags.map(f =>
            `<span class="badge" style="background: #fed7d7; color: #742a2a;">🚩 ${this.utils.sanitizeHTML(f.replace(/_/g, ' '))}</span>`
        ).join('')}
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div style="background: rgba(47, 133, 90, 0.1); color: #22543d; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem;">
                                <strong>Claves Diagnósticas:</strong>
                                <ul>${c.assessment_keys.key_discriminators.map(x => `<li>${this.utils.sanitizeHTML(x.replace(/_/g, ' '))}</li>`).join('')}</ul>
                            </div>
                            <div style="background: rgba(197, 48, 48, 0.1); color: #742a2a; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem;">
                                <strong>Errores a Evitar:</strong>
                                <ul>${c.assessment_keys.errors_to_avoid.map(x => `<li>${this.utils.sanitizeHTML(x.replace(/_/g, ' '))}</li>`).join('')}</ul>
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
        } else {
            // Stop game timer if we switch to any other tab
            if (this.game && this.game.stopTimer) this.game.stopTimer();
        }
    },

    // --- GAME ENGINE SUBMODULE ---
    game: {
        stats: { score: 0, streak: 0, correct: 0, wrong: 0, highScore: 0 },
        arcade: {
            lives: 3,
            multiplier: 1,
            timeLeft: 100,
            timerInterval: null,
            maxTime: 15, // seconds per question
            isGameOver: false
        },
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
                btnReset: document.getElementById('btnReset'),
                gameCard: document.getElementById('gameCard')
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
            if (this.nodes.score) this.nodes.score.innerText = this.stats.score;
            if (this.nodes.streak) this.nodes.streak.innerText = this.stats.streak;
            if (this.nodes.correct) this.nodes.correct.innerText = this.stats.correct;
            if (this.nodes.wrong) this.nodes.wrong.innerText = this.stats.wrong;
            const elLives = document.getElementById('game-lives');
            if (elLives) elLives.innerText = '❤️'.repeat(Math.max(0, this.arcade.lives));
            const elMult = document.getElementById('game-multiplier');
            if (elMult) {
                elMult.innerText = `x${this.arcade.multiplier}`;
                if (this.arcade.multiplier > 1) elMult.classList.add('combo-pop');
                else elMult.classList.remove('combo-pop');
            }
        },

        // --- ARCADE LOGIC ---
        startTimer: function () {
            clearInterval(this.arcade.timerInterval);
            this.arcade.timeLeft = 100;
            const timerBar = document.getElementById('game-timer-bar');
            const timerContainer = document.getElementById('game-timer-container');
            if (timerContainer) timerContainer.classList.remove('hidden');

            const step = 100 / (this.arcade.maxTime * 10); // 100ms intervals
            this.arcade.timerInterval = setInterval(() => {
                this.arcade.timeLeft -= step;
                if (timerBar) timerBar.style.transform = `scaleX(${this.arcade.timeLeft / 100})`;

                if (this.arcade.timeLeft <= 0) {
                    this.onTimeUp();
                }
            }, 100);
        },

        stopTimer: function () {
            clearInterval(this.arcade.timerInterval);
            const timerContainer = document.getElementById('game-timer-container');
            if (timerContainer) timerContainer.classList.add('hidden');
        },

        onTimeUp: function () {
            this.stopTimer();
            this.loseLife("¡Tiempo agotado!");
        },

        loseLife: function (reason) {
            this.arcade.lives--;
            this.arcade.multiplier = 1;
            this.playAudio('error');
            this.showFeedback(reason || "Error.", "bad");
            this.nodes.gameCard.classList.add('animate-shake');
            setTimeout(() => this.nodes.gameCard.classList.remove('animate-shake'), 500);
            this.renderStats();

            if (this.arcade.lives <= 0) {
                this.gameOver();
            } else if (this.currentMode === 'mcq') {
                // In MCQ, skip to next round on error or timeup? 
                // Let's allow one retry in MCQ but skip in Diff? 
                // Actually, arcade style: lose life, show correct, NEXT.
                this.disableOptions();
            }
        },

        gameOver: function () {
            this.arcade.isGameOver = true;
            this.stopTimer();
            this.nodes.prompt.innerHTML = `<span style="color:var(--v-accent); font-size: 2rem;">GAME OVER</span>`;
            this.nodes.subprompt.textContent = `Puntaje final: ${this.stats.score}`;
            this.nodes.options.innerHTML = `<button class="btn primary" onclick="App.game.restart()">Reiniciar Partida</button>`;
            this.playAudio('gameover');
        },

        restart: function () {
            this.arcade.lives = 3;
            this.arcade.multiplier = 1;
            this.arcade.isGameOver = false;
            this.stats.score = 0;
            this.stats.streak = 0;
            this.saveStats();
            this.nextRound();
        },

        playAudio: function (type) {
            try {
                if (!App._audioCtx) {
                    App._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                }
                const ctx = App._audioCtx;
                if (ctx.state === 'suspended') ctx.resume();

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                if (type === 'correct') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(440, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
                    gain.gain.setValueAtTime(0.1, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.2);
                } else if (type === 'error') {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(220, ctx.currentTime);
                    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);
                    gain.gain.setValueAtTime(0.1, ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.3);
                } else if (type === 'gameover') {
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(150, ctx.currentTime);
                    osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.5);
                    gain.gain.setValueAtTime(0.1, ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.5);
                }
            } catch (e) { console.warn("Audio Context failed", e); }
        },

        nextRound: function () {
            if (this.currentRound) App.coffee.increment(); // count completed rounds (not first init)
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
            if (!this.arcade.isGameOver) this.startTimer();
        },

        toggleInstructions: function () {
            const el = document.getElementById('game-instructions');
            if (el) el.classList.toggle('hidden');
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
            if (!target) return { error: "No se pudo seleccionar un término." };

            const distractorPool = pool.filter(t => t.term_id !== target.term_id);
            const distractors = this.sampleMany(distractorPool, 3);

            const options = this.shuffle([
                { id: target.term_id, text: target.definition_clinical?.core || "", correct: true },
                ...distractors.map(d => ({ id: d.term_id, text: d.definition_clinical?.core || "", correct: false }))
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
            this.stopTimer();
            if (isCorrect) {
                const timeBonus = Math.floor(this.arcade.timeLeft / 10);
                this.stats.score += (10 + timeBonus) * this.arcade.multiplier;
                this.stats.streak += 1;
                if (this.stats.streak % 3 === 0) this.arcade.multiplier++;

                this.playAudio('correct');
                this.showFeedback(`¡Correcto! +${10 + timeBonus}${this.arcade.multiplier > 1 ? ' x' + this.arcade.multiplier : ''}`, "ok");
                if (target.teaching_notes) this.nodes.hint.textContent = `Nota: ${target.teaching_notes[0]}`;
                this.nodes.gameCard.classList.add('animate-pulse');
                setTimeout(() => this.nodes.gameCard.classList.remove('animate-pulse'), 400);
                this.disableOptions();
            } else {
                this.loseLife("Incorrecto.");
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
            if (!c) return { error: "No se pudo seleccionar un caso." };

            // In the real app, we don't have 'target_term_id' explicitly in case json sometimes,
            // but we have 'primary_syndrome'. We will use primary_syndrome as the target.

            const targetName = c.expected_engine_output?.primary_syndrome;
            if (!targetName) return { error: "Caso incompleto: falta síndrome primario." };

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
            const correctKeys = c.assessment_keys?.key_discriminators || [];
            const wrongKeys = c.assessment_keys?.errors_to_avoid || []; // Use errors as distractors for phase 2

            // Ensure we have valid options
            if (correctKeys.length === 0 || wrongKeys.length === 0) {
                return { error: "Datos incompletos para este caso." };
            }

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
            const contextNotes = round.case?.stem?.contextual_notes || "Caso clínico sin descripción";
            this.nodes.subprompt.textContent = `"${contextNotes}"`;

            this.renderOptions(round.termOptions, (opt) => {
                if (opt.correct) {
                    this.playAudio('correct');
                    this.showFeedback("Correcto. Ahora valida el criterio clave.", "ok");
                    this.disableOptions();
                    setTimeout(() => {
                        this.clearFeedback();
                        this.renderDiffPhase2(round);
                    }, 500);
                } else {
                    this.loseLife("Diagnóstico incorrecto.");
                }
            });
        },

        renderDiffPhase2: function (round) {
            this.nodes.prompt.textContent = "Paso 2: Selecciona el criterio discriminante válido";
            this.nodes.options.innerHTML = '';
            this.startTimer(); // Reset timer for phase 2
            this.renderOptions(round.discOptions, (opt) => {
                this.stopTimer();
                if (opt.correct) {
                    const timeBonus = Math.floor(this.arcade.timeLeft / 10);
                    this.stats.score += (20 + timeBonus) * this.arcade.multiplier;
                    this.stats.streak += 1;
                    if (this.stats.streak % 3 === 0) this.arcade.multiplier++;

                    this.playAudio('correct');
                    this.showFeedback("¡Excelente! Caso resuelto.", "ok");
                    this.nodes.hint.textContent = `Clave: ${opt.text}`;
                    this.nodes.gameCard.classList.add('animate-pulse');
                    setTimeout(() => this.nodes.gameCard.classList.remove('animate-pulse'), 400);
                    this.disableOptions();
                } else {
                    this.loseLife("Criterio incorrecto.");
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
        sampleOne: function (arr) {
            if (!arr || arr.length === 0) return null;
            return arr[Math.floor(Math.random() * arr.length)];
        },
        sampleMany: function (arr, n) {
            if (!arr || arr.length === 0) return [];
            return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
        },
        shuffle: function (arr) {
            if (!arr) return [];
            return arr.sort(() => 0.5 - Math.random());
        }
    },

    // --- COFFEE CTA MODULE ---
    coffee: {
        SHOW_AFTER: 5,     // interactions before first show
        SNOOZE_DAYS: 3,    // days before showing again after dismiss
        REPEAT_AFTER: 8,   // interactions after snooze before showing again

        increment: function () {
            const total = parseInt(localStorage.getItem('mse-use-count') || '0') + 1;
            localStorage.setItem('mse-use-count', total);

            const dismissed = localStorage.getItem('mse-coffee-dismissed');

            if (!dismissed) {
                if (total >= this.SHOW_AFTER) this.show();
                return;
            }

            // After a previous dismiss: respect snooze period
            const daysSince = (Date.now() - parseInt(dismissed)) / 86400000;
            if (daysSince < this.SNOOZE_DAYS) return;

            // Snooze expired: count interactions since last dismiss
            const since = parseInt(localStorage.getItem('mse-coffee-since-dismiss') || '0') + 1;
            localStorage.setItem('mse-coffee-since-dismiss', since);
            if (since >= this.REPEAT_AFTER) this.show();
        },

        show: function () {
            const el = document.getElementById('coffee-float');
            if (!el || el.classList.contains('coffee-visible')) return;
            el.classList.add('coffee-visible');
        },

        dismiss: function () {
            const el = document.getElementById('coffee-float');
            if (el) el.classList.remove('coffee-visible');
            localStorage.setItem('mse-coffee-dismissed', Date.now());
            localStorage.setItem('mse-coffee-since-dismiss', '0');
        }
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
