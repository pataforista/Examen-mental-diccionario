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
        // Modern UX layer
        this.navIndicator.init();
        this._setupScrollCompact();
        // Sync indicator after hash routing
        setTimeout(() => this.navIndicator.update(), 50);
    },

    _showSkeletonTerms: function () {
        if (!this.nodes.allTermsList) return;
        const skeletons = Array.from({ length: 8 }, () => `
            <div class="skeleton-card">
                <div class="skeleton-block skeleton-title"></div>
                <div class="skeleton-block skeleton-text"></div>
                <div class="skeleton-block skeleton-text-sm"></div>
            </div>`).join('');
        this.nodes.allTermsList.innerHTML = skeletons;
    },

    _setupScrollCompact: function () {
        const header = document.querySelector('.app-header');
        const main   = document.querySelector('main');
        if (!header || !main) return;
        let lastY = 0;
        main.addEventListener('scroll', () => {
            const y = main.scrollTop;
            if (y > 60 && y > lastY) {
                header.classList.add('compact');
            } else if (y < lastY || y < 20) {
                header.classList.remove('compact');
            }
            lastY = y;
        }, { passive: true });
    },


    checkOnboarding: function () {
        try {
            if (!localStorage.getItem('mse_onboarded_v2.2')) {
                setTimeout(() => {
                    App.toast.show('📤 Nuevo: comparte términos como tarjetas clínicas. Pulsa el botón compartir en cualquier ficha.', 'info', 5000);
                    try { localStorage.setItem('mse_onboarded_v2.2', 'true'); } catch (e) { }
                }, 1800);
            }
        } catch (e) { }
    },

    speakTerm: function (termId) {
        const term = this.data.terms.find(t => t.term_id === termId);
        if (!term) return;
        const text = `${term.canonical_name}. ${term.definition_clinical?.core || ''}`;
        this.utils.speakTerm(text);
        this.utils.haptic();
    },

    handleInitialHash: function () {
        const hash = window.location.hash;
        if (!hash) return;

        if (hash.startsWith('#term/')) {
            const termId = hash.replace('#term/', '');
            this.viewTerm(termId);
        } else if (hash.startsWith('#domain/')) {
            const domainId = hash.replace('#domain/', '');
            this.renderView('domain');
            this.renderDomains();
            this.viewDomainDetails(domainId);
        } else if (hash.length > 1) {
            const tabId = `nav-${hash.substring(1)}`;
            this.switchTab(tabId);
        }
    },

    registerSW: function () {
        if (!('serviceWorker' in navigator)) return;

        // Register controllerchange BEFORE registering the SW to never miss the event
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });

        navigator.serviceWorker.register('sw.js')
            .then(reg => {
                // Check immediately on load, then every hour
                reg.update();
                setInterval(() => reg.update(), 1000 * 60 * 60);

                reg.addEventListener('updatefound', () => {
                    const incoming = reg.installing;
                    incoming.addEventListener('statechange', () => {
                        if (incoming.state === 'installed' && navigator.serviceWorker.controller) {
                            // skipWaiting() in sw.js will activate the new SW;
                            // controllerchange fires next and reloads the page.
                            incoming.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                });
            })
            .catch(err => console.error('Service Worker registration failed:', err));
    },

    utils: {
        sanitizeHTML: function (str) {
            if (!str) return '';
            const temp = document.createElement('div');
            temp.textContent = str;
            return temp.innerHTML;
        },

        speakTerm: function (text) {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'es-MX';
                utterance.rate = 0.95;
                window.speechSynthesis.speak(utterance);
            }
        },

        haptic: function () {
            if ('vibrate' in navigator) {
                try { navigator.vibrate(10); } catch (e) { }
            }
        },

        getTermUrl: function (termId) {
            return `${window.location.origin}${window.location.pathname}#term/${termId}`;
        },

        wrapText: function (ctx, text, x, y, maxWidth, lineHeight) {
            const words = text.split(' ');
            let line = '';
            let lines = 0;

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    ctx.fillText(line, x, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                    lines++;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x, y);
            return lines + 1;
        },

        generateShareCard: async function (term) {
            const canvas = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 1080;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context unavailable');

            // Colors (Updated Bauhaus/Memphis Palette)
            const cream = '#FFF8E7';
            const black = '#211f1f';
            const magenta = '#95215c';
            const gold = '#9a8238';
            const teal = '#7acdbf';

            // Background
            ctx.fillStyle = cream;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Bauhaus Accents
            // Magenta Circle (Top Right)
            ctx.fillStyle = magenta;
            ctx.beginPath();
            ctx.arc(950, 130, 180, 0, Math.PI * 2);
            ctx.fill();

            // Teal Square (Bottom Left)
            ctx.fillStyle = teal;
            ctx.fillRect(-50, 900, 300, 300);

            // Gold Triangle (Background behind title)
            ctx.fillStyle = gold;
            ctx.beginPath();
            ctx.moveTo(100, 350);
            ctx.lineTo(980, 200);
            ctx.lineTo(800, 500);
            ctx.closePath();
            ctx.fill();

            // Main Border
            ctx.strokeStyle = black;
            ctx.lineWidth = 40;
            ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

            // Title "PALABRA DEL DÍA" Ribbon
            ctx.fillStyle = black;
            ctx.fillRect(80, 80, 480, 80);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '900 40px Outfit, sans-serif';
            ctx.fillText('TERMINOLOGÍA CLÍNICA', 110, 135);

            // Term Name
            ctx.fillStyle = black;
            ctx.font = '900 110px Outfit, sans-serif';
            const termName = term.canonical_name.toUpperCase();
            const nameLines = this.wrapText(ctx, termName, 80, 350, 920, 120);
            const badgeY = 350 + nameLines * 120 + 20;

            // Term Kind Badge — positioned below the (possibly multi-line) term name
            ctx.fillStyle = magenta;
            ctx.fillRect(80, badgeY, 250, 50);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '800 30px Outfit, sans-serif';
            ctx.fillText(term.term_kind.toUpperCase(), 100, badgeY + 35);

            // Definition Text
            ctx.fillStyle = black;
            ctx.font = '500 48px Outfit, sans-serif';
            const definition = term.definition_clinical?.core || "";
            const shortDef = definition.length > 280 ? definition.substring(0, 280) + "..." : definition;
            this.wrapText(ctx, shortDef, 80, 550, 920, 65);

            // Branding / Footer
            ctx.fillStyle = black;
            ctx.font = '800 35px Outfit, sans-serif';
            ctx.fillText('DICCIONARIO DE EXAMEN MENTAL', 80, 980);
            ctx.font = '400 30px Outfit, sans-serif';
            ctx.fillText('examen-mental.pages.dev', 80, 1020);

            // Download App CTA
            ctx.font = '900 32px Outfit, sans-serif';
            ctx.fillText('📱 DESCARGA LA APP', 620, 985);

            return new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });
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
            integratorView: document.getElementById('integrator-view'),
            aboutView: document.getElementById('about-view'),
            allTermsList: document.getElementById('all-terms-list'),
            recentSearchesBar: document.getElementById('recent-searches'),
            recentList: document.getElementById('recent-list'),
            navButtons: document.querySelectorAll('.bottom-nav button'),
            aboutBtn: document.getElementById('about-btn'),
            themeToggle: document.getElementById('theme-toggle'),
            gameView: document.getElementById('game-view'),
            clearSearchBtn: document.getElementById('clear-search'),
            termOfTheDay: document.getElementById('term-of-the-day')
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
        if (this.nodes.clearSearchBtn) {
            this.nodes.clearSearchBtn.addEventListener('click', () => {
                this.nodes.search.value = '';
                this.nodes.clearSearchBtn.classList.add('hidden');
                this.handleSearch('');
                this.nodes.search.focus();
            });
        }

        // History API support
        window.addEventListener('popstate', (e) => this.handlePopState(e.state));

        // Keyboard shortcut: '/' focuses search (skip if already in an input)
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                this.nodes.search.focus();
                this.nodes.search.select();
            }
        });

        // Ripple effect on primary/secondary buttons
        document.addEventListener('pointerdown', (e) => {
            const btn = e.target.closest('.btn.primary, .btn.secondary');
            if (!btn) return;
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 1.6;
            const wave = document.createElement('span');
            wave.className = 'ripple-wave';
            wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
            btn.appendChild(wave);
            wave.addEventListener('animationend', () => wave.remove(), { once: true });
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
            if (!document.getElementById('domain-detail-container')) {
                this.renderView('domain');
                this.renderDomains();
            }
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
        const startTime = performance.now();
        try {
            // Start parallel fetches for all critical resources
            const lexiconPromise = fetch('lexicon/lexicon_bundle.json').then(r => r.json());

            const domainIds = Array.from({ length: 15 }, (_, i) => `DOM-${(i + 1).toString().padStart(2, '0')}`);
            const domainPromises = domainIds.map(async id => {
                const slug = this.getDomainSlug(id);
                try {
                    const response = await fetch(`domains/${id}_${slug}.json`);
                    if (!response.ok) throw new Error(`Domain ${id} not found`);
                    return await response.json();
                } catch (e) {
                    return { domain_id: id, domain_name: id.replace('-', ' '), subcomponents: [] };
                }
            });

            const caseFiles = [
                'OSCE_001–003.json', 'OSCE_004–OSCE_009.json', 'OSCE_010–OSCE_015.json',
                'OSCE_016–025.json', 'OSCE_026–035.json'
            ];
            const casePromises = caseFiles.map(file => fetch(file).then(r => r.json()).catch(() => []));

            // Await all groups in parallel
            const [lexiconData, domainsData, casesDataArrays] = await Promise.all([
                lexiconPromise,
                Promise.all(domainPromises),
                Promise.all(casePromises)
            ]);

            // Assign data
            this.data.terms = lexiconData.terms || [];
            this.data.domains = domainsData;
            this.data.cases = (casesDataArrays || []).flat();

            // Sort terms alphabetically
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
            'DOM-14': 'docencia',
            'DOM-15': 'fenomenologia_historica'
        };
        return slugs[id] || '';
    },

    getDomainIcon: function (id) {
        const icons = {
            'DOM-01': '🧠', 'DOM-02': '👤', 'DOM-03': '🤝', 'DOM-04': '🏃',
            'DOM-05': '🗣️', 'DOM-06': '🔄', 'DOM-07': '💡', 'DOM-08': '👁️',
            'DOM-09': '🎭', 'DOM-10': '🧩', 'DOM-11': '⚖️', 'DOM-12': '⚠️',
            'DOM-13': '🏥', 'DOM-14': '🎓', 'DOM-15': '📜'
        };
        return icons[id] || '🔹';
    },

    setupSearch: function () {
        if (!window.Fuse) return;
        this.data.fuse = new Fuse(this.data.terms, {
            keys: [
                { name: 'canonical_name', weight: 1.0 },
                { name: 'synonyms_and_slang.term', weight: 0.7 },
                { name: 'definition_clinical.core', weight: 0.4 }
            ],
            threshold: 0.4, // Higher tolerance for typos
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
            this.nodes.clearSearchBtn.classList.toggle('hidden', cleanQuery.length === 0);
        }

        if (cleanQuery.length < 2) {
            this.renderAllTerms();
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
                    ...(term.synonyms_and_slang || []).map(s => (s && s.term) || s),
                    term.definition_clinical?.core
                ].map(item => this.normalizeText(item)).join(' ');
                return haystack.includes(normalizedQuery);
            })
            .slice(0, 50)
            .map(item => ({ item }));
    },

    renderAllTerms: function () {
        if (!this.nodes.allTermsList || !this.data.terms) return;
        this.nodes.allTermsList.innerHTML = '';

        const validTerms = this.data.terms.filter(t => t && t.canonical_name);

        validTerms.sort((a, b) => (a.canonical_name || "").localeCompare(b.canonical_name || "")).forEach(term => {
            const card = this.renderTermCard(term);
            this.nodes.allTermsList.appendChild(card);
        });
    },

    renderTermCard: function (term) {
        const div = document.createElement('div');
        div.className = 'term-card-simple';
        div.onclick = () => this.viewTerm(term.term_id);
        div.innerHTML = `
            <div class="term-name">${this.utils.sanitizeHTML(term.canonical_name)}</div>
            <div class="term-snippet">${this.utils.sanitizeHTML(term.definition_clinical?.core?.substring(0, 60) || '')}...</div>
        `;
        return div;
    },

    renderResults: function (results) {
        if (results.length === 0) {
            const pearls = [
                "¿Sabías que la 'Saliencia aberrante' es el mecanismo neurocognitivo central detrás de la formación de delirios?",
                "La fenomenología (EASE) sugiere que los trastornos de la ipseidad suelen preceder a los síntomas psicóticos positivos.",
                "En el examen mental, las 'acoasmas' se refieren a alucinaciones auditivas elementales como chasquidos o zumbidos.",
                "El concepto de 'Insight' en psiquiatría es multidimensional e incluye la conciencia de enfermedad y la adherencia al tratamiento.",
                "La 'prosopagnosia' es la incapacidad de reconocer rostros conocidos, a menudo por lesiones en el área fusiforme."
            ];
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
                            <div class="badge ${r.item.risk_weight > 1 ? 'badge-risk-critical' : ''}" style="font-size: 0.65rem; border: 1px solid var(--border-subtle);">
                                ${this.utils.sanitizeHTML(r.item.term_kind)}
                            </div>
                        </div>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                            ${this.utils.sanitizeHTML(r.item.definition_clinical?.core || 'Sin definición disponible.')}
                        </p>
                    </div>
                `).join('')}
            `;
        }
        this.renderView('results');
    },

    renderTermOfTheDay: function () {
        if (!this.nodes.termOfTheDay || !this.data.terms || this.data.terms.length === 0) return;

        const filterTerms = this.data.terms.filter(t => t && t.definition_clinical && t.definition_clinical.core);
        if (filterTerms.length === 0) return;

        const now = new Date();
        const year = now.getFullYear();
        const dayOfYear = Math.floor((now - new Date(year, 0, 1)) / 86400000);

        // Mulberry32 PRNG seeded by year — produces a different shuffle each year
        let s = (year * 0x9e3779b9) >>> 0;
        const rand = () => {
            s = (s + 0x6d2b79f5) >>> 0;
            let t = Math.imul(s ^ (s >>> 15), 1 | s);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };

        // Fisher-Yates shuffle ensures every term appears before any repeats
        const indices = filterTerms.map((_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        const dailyTerm = filterTerms[indices[dayOfYear % filterTerms.length]];

        // Determine a clinical marker if available
        const objMarker = dailyTerm.definition_clinical.subjective_marker || dailyTerm.definition_clinical.behavioral_marker || (dailyTerm.teaching_notes ? dailyTerm.teaching_notes[0] : null);

        const tipHtml = objMarker ? `
            <div style="background: rgba(var(--v-on-primary-container-rgb, 0,0,0), 0.08); padding: 1rem; border-left: 6px solid var(--bau-blue); margin-bottom: 1.25rem; border-radius: 4px; border-top-right-radius: 12px; border-bottom-right-radius: 12px;">
                <strong style="display:block; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 0.3rem; color: inherit; opacity: 0.7;">💡 Perla Clínica:</strong>
                <span style="font-size: 0.9rem; font-style: italic; color: inherit; line-height: 1.4; display: block;">${this.utils.sanitizeHTML(objMarker)}</span>
            </div>
        ` : '';

        // Safely truncate definition
        const fullDef = dailyTerm.definition_clinical.core || "";
        const truncatedDef = fullDef.length > 160 ? fullDef.substring(0, 160).trim() + "..." : fullDef;

        this.nodes.termOfTheDay.innerHTML = `
            <div class="totd-card" onclick="App.viewTerm('${dailyTerm.term_id}')">
                <div class="totd-ribbon">Término del Día</div>
                <div class="totd-content">
                    <h3 class="totd-title" style="color: inherit;">${this.utils.sanitizeHTML(dailyTerm.canonical_name)}</h3>
                    <div class="badge ${dailyTerm.risk_weight > 1 ? 'badge-risk-critical' : ''}" style="display:inline-block; margin-bottom: 0.75rem; font-size: 0.7rem; background: var(--bau-magenta); color: white; border: none;">
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
        this.nodes.termOfTheDay.classList.remove('hidden');
    },

    shareTerm: async function (termId) {
        const term = this.data.terms.find(t => t.term_id === termId);
        if (!term) return;

        this.utils.haptic();

        // Show loading state or feedback
        console.log(`Generating card for ${term.canonical_name}...`);

        try {
            const blob = await this.utils.generateShareCard(term);
            const file = new File([blob], `MSE_${term.canonical_name}.png`, { type: 'image/png' });

            if (navigator.share) {
                await navigator.share({
                    title: `Diccionario MSE: ${term.canonical_name}`,
                    text: `Definición de ${term.canonical_name}: ${term.definition_clinical?.core}`,
                    url: this.utils.getTermUrl(termId),
                    files: [file]
                });
            } else {
                // Fallback: Download
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `MSE_${term.canonical_name}.png`;
                a.click();
                URL.revokeObjectURL(url);
                App.toast.show('🖼️ Tarjeta descargada en tu dispositivo', 'success');
            }
        } catch (error) {
            console.error("Error sharing:", error);
            if (navigator.share) {
                navigator.share({
                    title: `Diccionario MSE: ${term.canonical_name}`,
                    text: `${term.canonical_name}: ${term.definition_clinical?.core}`,
                    url: this.utils.getTermUrl(termId)
                }).catch(() => { });
            } else {
                App.toast.show('No se pudo compartir. Copia el enlace manualmente.', 'warning');
            }
        }
    },

    viewTerm: function (termId, isPopState = false) {
        try {
            const term = this.data.terms.find(t => t.term_id === termId);
            if (!term) return;
            this.utils.haptic();

            if (!isPopState) {
                history.pushState({ view: 'term', termId: termId }, '', `#term/${termId}`);
            }

            this.addToRecent(term);

            // Defensive defaults for templates
            const teachingNotes = term.teaching_notes || [];
            const alerts = term.alerts || [];
            const examples = term.examples || [];
            // Only show links to domains we actually loaded, so terms pointing at
            // an undefined domain don't render dead/empty tags.
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
                    domainLinks.map(link => {
                        const domain = this.data.domains.find(d => d.domain_id === link.domain_id);
                        const label = domain?.label_es || this.getDomainSlug(link.domain_id).replace(/_/g, ' ');
                        return `
                                <span class="tag" onclick="event.stopPropagation(); App.viewDomainDetails('${link.domain_id}')">
                                    ${this.getDomainIcon(link.domain_id)} ${this.utils.sanitizeHTML(label)}
                                </span>`;
                    }).join('') : '<span style="font-size: 0.8rem; opacity: 0.5;">No categorizado</span>'}
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

                <div class="support-nudge" style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px dashed var(--border-subtle); text-align: center;">
                    <p style="font-size: 0.8rem; opacity: 0.6; margin-bottom: 0.75rem;">¿Te fue útil esta definición? Apoya el proyecto independiente.</p>
                    <button class="btn secondary" style="font-size: 0.75rem; padding: 0.5rem 1rem;" onclick="window.open('https://buymeacoffee.com/herramente', '_blank')">☕ Invitame un café</button>
                </div>
            </div>
            `;
            this.renderView('term');
            this.nodes.content.scrollTop = 0;
            this.donation.increment();
        } catch (e) {
            console.error("Error rendering term view:", e);
            alert("Error al cargar la ficha. El archivo podría estar incompleto.");
        }
    },

    loadRecentSearches: function () {
        try {
            const saved = localStorage.getItem('recentSearches');
            if (saved) {
                this.data.recentSearches = JSON.parse(saved);
                this.renderRecentSearches();
            }
        } catch (e) {
            this.data.recentSearches = [];
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
            return `<span class="recent-search-tag" onclick="App.viewTerm('${term.term_id}')">${this.utils.sanitizeHTML(term.canonical_name)}</span>`;
        }).join('');
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
        this.renderView('about');
        this.nodes.navButtons.forEach(btn => btn.classList.remove('active'));
        this.setupChromaGrid();
    },

    setupChromaGrid: function () {
        const grid = document.getElementById('about-chroma-grid');
        if (!grid || typeof gsap === 'undefined') return;
        gsap.killTweensOf(this.data.chromaPos);

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
        this.donation.increment();

        // Title for SEO
        document.title = `Dominio: ${domain.label_es || domain.domain_name} | Diccionario MSE`;

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
        this.donation.increment();

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
        this.utils.haptic();
        this.nodes.navButtons.forEach(btn => btn.classList.toggle('active', btn.id === id));
        this.navIndicator.update();
        this.nodes.search.value = '';

        if (id === 'nav-dictionary') {
            this.data.currentView = 'dictionary';
            this.renderView('dictionary');
        } else if (id === 'nav-domains') {
            this.data.currentView = 'domain';
            this.renderView('domain'); // Fixed singular/plural
            this.renderDomains();
        } else if (id === 'nav-cases') {
            this.data.currentView = 'cases';
            this.renderView('cases');
            this.renderCases();
        } else if (id === 'nav-integrator') {
            this.data.currentView = 'integrator';
            this.integrator.init();
            this.renderView('integrator');
        } else if (id === 'nav-game') {
            this.data.currentView = 'game';
            this.game.init();
            this.renderView('game');
        } else {
            if (this.game && this.game.stopTimer) this.game.stopTimer();
        }
    },

    // --- MSE INTEGRATOR SUBMODULE ---
    integrator: {
        currentStep: 0,
        steps: [
            {
                id: 1, label: "Consciencia y orientación", domain: "DOM-01",
                guide: "¿Está alerta, somnoliento, estuporoso, confuso, obnubilado, en coma?\nOrientación: Persona (¿Cómo se llama?), Lugar (¿Dónde estamos?), Tiempo (Día, mes, año), Situación (¿Sabe por qué está aquí?)",
                example: "Paciente consciente, alerta. Orientado en persona, lugar, tiempo y situación.",
                description: "Evaluación del estado de alerta y ubicación."
            },
            {
                id: 2, label: "Higiene, vestimenta y aliento", domain: "DOM-02", components: ["higiene", "vestimenta_y_aliño", "aliento"],
                guide: "Ropa adecuada al clima/situación, limpia o descuidada.\nHigiene personal (olor corporal, cabello, uñas).\nAliento (alcohol, cetonas, fétido, normal).",
                example: "Vestimenta desordenada, ropa sucia. Higiene deficiente. Aliento normal.",
                description: "Observación de aliño y presentación física."
            },
            {
                id: 3, label: "Posición", domain: "DOM-02", components: ["postura"],
                guide: "De pie, sentado, en cama, encamado, postura fija, decúbito activo/pasivo.",
                example: "Paciente sentado voluntariamente en la camilla.",
                description: "Postura corporal predominante."
            },
            {
                id: 4, label: "Facies", domain: "DOM-02", components: ["facies"],
                guide: "Expresión facial (triste, angustiada, hostil, desconfiada, indiferente, perpleja, eufórica, inexpresiva).",
                example: "Facies de angustia e indiferencia.",
                description: "Mímica y expresión facial."
            },
            {
                id: 5, label: "Función psicomotriz", domain: "DOM-04",
                guide: "Movimientos anormales (temblor, tics, acatisia, estereotipias, corea). Inhibición o agitación. Catalepsia, flexibilidad cérea.",
                example: "Agitación psicomotriz generalizada, sin temblores.",
                description: "Actividad motora observable."
            },
            {
                id: 6, label: "Actitud", domain: "DOM-03", components: ["actitud"],
                guide: "Cooperadora, hostil, negativista, seductora, distante, apática, provocadora.",
                example: "Actitud cooperadora durante la entrevista.",
                description: "Disposición hacia el examinador."
            },
            {
                id: 7, label: "Contacto visual", domain: "DOM-03", components: ["contacto_visual"],
                guide: "Fijo, evitativo, perdido, amenazante, de seducción.",
                example: "Contacto visual evitativo, ocasional.",
                description: "Conexión visual con el examinador."
            },
            {
                id: 8, label: "Habla (volumen, cantidad, tono)", domain: "DOM-05", components: ["volumen_y_tono", "velocidad_y_ritmo"],
                guide: "Volumen (alto, bajo, normal), Cantidad (escasa, logorrea, pobre), Tono (monótono, modulado, enfático).",
                example: "Habla espontánea, volumen bajo, cantidad escasa, tono monótono.",
                description: "Características sonoras del lenguaje."
            },
            {
                id: 9, label: "Discurso", domain: "DOM-05", components: ["articulacion"],
                guide: "Velocidad (lento, presionado, normal), Organización (coherente, divagante, tangencial, circunstancial).",
                example: "Discurso lento, coherente pero con tendencia a divagaciones.",
                description: "Forma y fluidez del relato."
            },
            {
                id: 10, label: "Lenguaje", domain: "DOM-05", components: ["lenguaje_simbolico"],
                guide: "Neologismos, parafasias, jergafasia, ecolalia, mutismo.",
                example: "Lenguaje sin alteraciones; sin neologismos ni parafasias.",
                description: "Uso de símbolos y reglas gramaticales."
            },
            {
                id: 11, label: "Curso del pensamiento", domain: "DOM-06",
                guide: "Acelerado, enlentecido, bloqueo, robo, fuga de ideas, incoherencia.",
                example: "Curso del pensamiento enlentecido, sin bloqueos.",
                description: "Flujo y velocidad de las ideas."
            },
            {
                id: 12, label: "Ideación suicida", domain: "DOM-12",
                guide: "¿Ha pensado que la vida no vale la pena? ¿Ha pensado en morir? ¿Tiene plan/medios?\n¿Hay ideación homicida?",
                example: "Niega ideación suicida u homicida en la actualidad.",
                description: "Evaluación de riesgo vital."
            },
            {
                id: 13, label: "Contenido del pensamiento", domain: "DOM-07",
                guide: "Delirios (persecutorio, místico, grandeza), Obsesiones, Fobias, Ideas sobrevaloradas.",
                example: "Contenido delirante de tipo persecutorio y autorreferencial.",
                description: "El qué de lo que el paciente piensa."
            },
            {
                id: 14, label: "Ánimo", domain: "DOM-09", components: ["animo_subjetivo"],
                guide: "¿Cómo se ha sentido? ¿Triste, alegre, irritable?\nEscala subjetiva 0-10.",
                example: "Ánimo disfórico, refiere tristeza 8/10.",
                description: "Estado subjetivo reportado por el paciente."
            },
            {
                id: 15, label: "Afecto", domain: "DOM-09", components: ["afecto_observable", "reactividad_afectiva", "rango_afectivo", "regulacion_afectiva", "congruencia_afectiva"],
                guide: "Tipo (depresivo, ansioso, irritable), Modulación (reactivo, lábil, restringido). Adecuación al discurso.",
                example: "Afecto ansioso, reactivo, adecuado al contenido verbal.",
                description: "Expresión emocional observable."
            },
            {
                id: 16, label: "Sensopercepción", domain: "DOM-08",
                guide: "¿Oye/ve cosas que otros no? Alucinaciones (auditivas, visuales, etc.), Ilusiones, Despersonalización.",
                example: "Alucinaciones auditivas simples (escucha que le llaman).",
                description: "Evaluación de percepciones."
            },
            {
                id: 17, label: "Funciones mentales superiores", domain: "DOM-10",
                guide: "a) Memoria (Reciente, Mediata, Remota)\nb) Atención (Dígitos, Mundo al revés)\nc) Abstracción (Semejanzas, Refranes)\nd) Cálculo\ne) Conocimiento (Gnosias, info general)",
                example: "Memoria y atención conservadas; abstracción en nivel concreto.",
                description: "Evaluación cognitiva global."
            },
            {
                id: 18, label: "Conciencia de enfermedad", domain: "DOM-11", components: ["insight_de_enfermedad"],
                guide: "¿Cree que tiene algún problema? ¿Necesita tratamiento?",
                example: "Ausencia de conciencia de enfermedad; niega trastorno.",
                description: "Reconocimiento de la patología."
            },
            {
                id: 19, label: "Juicio", domain: "DOM-11", components: ["juicio_practico", "juicio_social"],
                guide: "¿Qué haría ante un incendio? ¿Si se queda sin dinero?",
                example: "Juicio conservado para situaciones prácticas.",
                description: "Capacidad de toma de decisiones."
            },
            {
                id: 20, label: "Proyección a futuro", domain: "DOM-11", components: ["proyeccion_a_futuro"],
                guide: "¿Cómo se ve en un año? ¿Tiene metas/planes?",
                example: "Proyección a futuro pesimista, sin planes concretos.",
                description: "Expectativas y prospectiva de vida."
            }
        ],
        responses: {}, // stepId -> text

        init: function () {
            this.cacheDOM();
            this.bindEvents();
            this.renderStepsList();
            this.renderCurrentStep();
            this.updateReport();
            this.updateProgressBar();
        },

        teachingMode: true, // Default to true as per user preference for learning

        updateProgressBar: function () {
            const total = this.steps.length;
            const completed = this.steps.filter(s => !!this.responses[s.id]).length;
            const pct = (completed / total) * 100;
            if (this.nodes.progressBar) {
                this.nodes.progressBar.style.width = `${pct}%`;
            }
        },

        loadPedagogicalData: function () {
            this.discriminators = {
                "PER_001": { label: "Alucinación verdadera", why: "Sin objeto, externa, con convicción." },
                "PER_004": { label: "Pseudoalucinación", why: "Sin objeto, interna (dentro de la mente)." },
                "THO_010": { label: "Fuga de ideas", why: "Asociaciones rápidas pero con hilo conductor superficial." },
                "THO_020": { label: "Incoherencia", why: "Pérdida total de sintaxis y sentido." }
            };
        },

        cacheDOM: function () {
            this.nodes = {
                stepsList: document.getElementById('integrator-steps-list'),
                stepLabel: document.getElementById('step-label'),
                stepDescription: document.getElementById('step-description'),
                optionsContainer: document.getElementById('step-options-container'),
                stepText: document.getElementById('step-text'),
                prevBtn: document.getElementById('int-prev-btn'),
                nextBtn: document.getElementById('int-next-btn'),
                reportOutput: document.getElementById('report-output'),
                copyBtn: document.getElementById('int-copy-btn'),
                resetBtn: document.getElementById('int-reset-btn'),
                progressBar: document.getElementById('int-progress-bar'),
                teachingToggle: document.getElementById('int-teaching-mode')
            };
        },

        bindEvents: function () {
            if (this._bound) return;
            this._bound = true;

            this.nodes.prevBtn.addEventListener('click', () => this.navigate(-1));
            this.nodes.nextBtn.addEventListener('click', () => this.navigate(1));
            this.nodes.resetBtn.addEventListener('click', () => this.reset());
            this.nodes.copyBtn.addEventListener('click', () => this.copyReport());

            this.nodes.stepText.addEventListener('input', (e) => {
                const step = this.steps[this.currentStep];
                this.responses[step.id] = e.target.value;
                this.updateReport();
                this.updateStepStatus(step.id);
            });

            this.nodes.reportOutput.addEventListener('input', (e) => {
                // Manual edits to report don't sync back to individual steps easily
                // so we just let the user edit the final output.
            });
        },

        renderStepsList: function () {
            this.nodes.stepsList.innerHTML = this.steps.map((step, index) => `
                <li class="step-item ${index === this.currentStep ? 'active' : ''} ${this.responses[step.id] ? 'completed' : ''}" 
                    onclick="App.integrator.goToStep(${index})" id="step-nav-${step.id}">
                    <span class="step-number">${index + 1}</span>
                    <span class="step-text-label">${step.label}</span>
                </li>
            `).join('');
        },

        renderCurrentStep: function () {
            const step = this.steps[this.currentStep];
            if (!step) return;

            this.nodes.stepLabel.textContent = `${this.currentStep + 1}. ${step.label}`;
            this.nodes.stepDescription.innerHTML = `
                <div style="margin-bottom:0.75rem; color:var(--text-p); font-size:0.9rem; font-weight:500;">${App.utils.sanitizeHTML(step.description)}</div>
                ${step.guide ? `<div class="mnemonic-hint" style="background:rgba(var(--accent-rgb), 0.1); border-color:var(--accent); margin-top:0.5rem; padding:0.75rem; border-radius:8px; font-size:0.85rem;"><strong>🔎 QUÉ OBSERVAR / PREGUNTAR:</strong><br>${App.utils.sanitizeHTML(step.guide).replace(/\n/g, '<br>')}</div>` : ''}
                ${step.example ? `<div class="mnemonic-hint" style="background:rgba(var(--primary-rgb), 0.05); color:var(--text-secondary); border-style:dashed; margin-top:0.5rem; padding:0.75rem; border-radius:8px; font-size:0.85rem;"><strong>✍️ REDACCIÓN EJEMPLO:</strong><br>${App.utils.sanitizeHTML(step.example)}</div>` : ''}
            `;
            this.nodes.stepText.value = this.responses[step.id] || '';
            this.nodes.stepText.placeholder = step.example || "Escribe tus observaciones aquí...";

            // Render options from domain terms
            this.renderOptionsForStep(step);

            this.nodes.prevBtn.disabled = this.currentStep === 0;
            this.nodes.nextBtn.textContent = this.currentStep === this.steps.length - 1 ? 'Finalizar' : 'Siguiente →';

            // Update active class in sidebar
            const items = this.nodes.stepsList.querySelectorAll('.step-item');
            items.forEach((item, i) => item.classList.toggle('active', i === this.currentStep));
        },

        renderOptionsForStep: function (step) {
            const domain = App.data.domains.find(d => d.domain_id === step.domain);
            if (!domain) {
                this.nodes.optionsContainer.innerHTML = '<p style="font-size:0.8rem; opacity:0.5;">No hay términos asociados.</p>';
                return;
            }

            let terms = [];
            if (step.components) {
                // Specific components
                step.components.forEach(compId => {
                    const comp = domain.subcomponents?.find(c => c.id === compId);
                    if (comp && comp.accepted_terms) terms = [...terms, ...comp.accepted_terms];
                });
            } else {
                // All terms for this domain
                domain.subcomponents?.forEach(comp => {
                    if (comp.accepted_terms) terms = [...terms, ...comp.accepted_terms];
                });
            }

            // Deduplicate
            terms = [...new Set(terms)];

            if (terms.length === 0) {
                this.nodes.optionsContainer.innerHTML = '<p style="font-size:0.8rem; opacity:0.5;">No hay términos asociados.</p>';
                return;
            }

            this.nodes.optionsContainer.innerHTML = terms.map(t => {
                const isSelected = this.responses[step.id]?.includes(t.replace(/_/g, ' '));
                return `<div class="int-opt ${isSelected ? 'selected' : ''}" onclick="App.integrator.toggleTerm('${t}')">${t.replace(/_/g, ' ')}</div>`;
            }).join('');
        },

        toggleTerm: function (term) {
            App.utils.haptic();
            const step = this.steps[this.currentStep];
            const cleanTerm = term.replace(/_/g, ' ');
            let current = this.responses[step.id] || '';

            if (current.includes(cleanTerm)) {
                current = current.replace(new RegExp(`${cleanTerm},?\\s?`, 'g'), '').trim();
                if (current.endsWith(',')) current = current.slice(0, -1);
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
            if (el) el.classList.toggle('completed', !!this.responses[stepId]);
        },

        navigate: function (dir) {
            App.utils.haptic();
            const next = this.currentStep + dir;
            if (next >= 0 && next < this.steps.length) {
                this.currentStep = next;
                this.renderCurrentStep();
                App.nodes.content.scrollTop = 0;
            } else if (next === this.steps.length) {
                App.toast.show('✅ ¡Examen completado! Revisa y copia el reporte final.', 'success', 4000);
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
            if (!text || text.startsWith('Tu reporte')) {
                App.toast.show('Completa al menos un paso antes de copiar.', 'warning');
                return;
            }
            navigator.clipboard.writeText(text).then(() => {
                App.utils.haptic();
                App.toast.show('📋 Reporte copiado al portapapeles', 'success');
                const original = this.nodes.copyBtn.innerHTML;
                this.nodes.copyBtn.textContent = '✅ ¡Copiado!';
                setTimeout(() => { this.nodes.copyBtn.innerHTML = original; }, 2200);
            }).catch(() => {
                App.toast.show('No se pudo copiar. Selecciona el texto manualmente.', 'error');
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
                App.toast.show('Examen reiniciado', 'info');
            }
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
            this.initControlsToggle();
            if (!this.currentRound) this.nextRound(); // Only start if not already started
        },

        initControlsToggle: function () {
            const toggle = document.getElementById('game-config-toggle');
            const body = document.getElementById('game-controls-body');
            const arrow = document.getElementById('game-config-arrow');
            if (!toggle || !body) return;
            if (!toggle._toggleBound) {
                toggle._toggleBound = true;
                toggle.addEventListener('click', () => {
                    const isCollapsed = body.classList.toggle('collapsed');
                    if (arrow) arrow.textContent = isCollapsed ? '▶' : '▼';
                });
            }
            // Auto-collapse on mobile so game card is visible immediately
            if (window.innerWidth <= 768) {
                body.classList.add('collapsed');
                if (arrow) arrow.textContent = '▶';
            }
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
            if ('vibrate' in navigator) try { navigator.vibrate([60, 30, 60, 30, 60]); } catch (_) {}
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
            this.clearFeedback();
            this.nodes.options.innerHTML = '';
            this.nodes.hint.textContent = '';

            const manual = document.getElementById('game-manual-text');
            const domain = this.nodes.domainSelect.value;
            const diff = this.nodes.difficultySelect.value;

            if (this.currentMode === 'mcq') {
                this.diffPhase = 1;
                if (manual) manual.innerHTML = "<strong>Modo Definiciones:</strong> Identifica el término correcto basado en la descripción mostrada.";
                this.currentRound = this.buildMcqRound(domain, diff);
                this.renderMcqRound(this.currentRound);
            } else {
                this.diffPhase = 1;
                if (manual) manual.innerHTML = "<strong>Fase 1 (Diagnóstico):</strong> Analiza el caso y selecciona el <strong>Síndrome Predominante</strong>.";
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
                const prevScore = this.stats.score;
                this.stats.score += (10 + timeBonus) * this.arcade.multiplier;
                this.stats.streak += 1;
                if (this.stats.streak % 3 === 0) this.arcade.multiplier++;

                if ('vibrate' in navigator) try { navigator.vibrate([10, 30, 10]); } catch (_) {}
                this.playAudio('correct');
                this.showFeedback(`¡Correcto! +${10 + timeBonus}${this.arcade.multiplier > 1 ? ' x' + this.arcade.multiplier : ''}`, "ok");
                if (target.teaching_notes) this.nodes.hint.textContent = `Nota: ${target.teaching_notes[0]}`;
                this.nodes.gameCard.classList.add('animate-pulse');
                setTimeout(() => this.nodes.gameCard.classList.remove('animate-pulse'), 400);
                this._flashOptions(true);
                this._animateScore(prevScore, this.stats.score);
                this.disableOptions();
            } else {
                if ('vibrate' in navigator) try { navigator.vibrate([40, 20, 40]); } catch (_) {}
                this._flashOptions(false);
                this.loseLife("Incorrecto.");
            }
            this.saveStats();
        },

        _flashOptions: function (correct) {
            const cls = correct ? 'correct-flash' : 'wrong-flash';
            const btns = this.nodes.options.querySelectorAll('button');
            btns.forEach(b => {
                b.classList.add(cls);
                setTimeout(() => b.classList.remove(cls), 600);
            });
        },

        _animateScore: function (from, to) {
            const el = this.nodes.score;
            if (!el || from === to) return;
            const duration = 450;
            const start = performance.now();
            const tick = (now) => {
                const t = Math.min((now - start) / duration, 1);
                const ease = 1 - Math.pow(1 - t, 3);
                el.textContent = Math.round(from + (to - from) * ease);
                if (t < 1) {
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = to;
                    el.classList.add('score-pop');
                    setTimeout(() => el.classList.remove('score-pop'), 450);
                }
            };
            requestAnimationFrame(tick);
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
            const distractors = this.sampleMany(otherCases, 3)
                .map(x => x.expected_engine_output?.primary_syndrome)
                .filter(Boolean);

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
            this.startTimer();
            this.renderOptions(round.discOptions, (opt) => {
                this.stopTimer();
                if (opt.correct) {
                    const prevScore = this.stats.score;
                    const timeBonus = Math.floor(this.arcade.timeLeft / 10);
                    this.stats.score += (20 + timeBonus) * this.arcade.multiplier;
                    this.stats.streak += 1;
                    if (this.stats.streak % 3 === 0) this.arcade.multiplier++;

                    if ('vibrate' in navigator) try { navigator.vibrate([10, 30, 10]); } catch (_) {}
                    this.playAudio('correct');
                    this.showFeedback("¡Excelente! Caso resuelto.", "ok");
                    this.nodes.hint.textContent = `Clave: ${opt.text}`;
                    this.nodes.gameCard.classList.add('animate-pulse');
                    setTimeout(() => this.nodes.gameCard.classList.remove('animate-pulse'), 400);
                    this._flashOptions(true);
                    this._animateScore(prevScore, this.stats.score);
                    this.disableOptions();
                } else {
                    if ('vibrate' in navigator) try { navigator.vibrate([60, 30, 60]); } catch (_) {}
                    this._flashOptions(false);
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
            const copy = [...arr];
            for (let i = copy.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [copy[i], copy[j]] = [copy[j], copy[i]];
            }
            return copy.slice(0, n);
        },
        shuffle: function (arr) {
            if (!arr) return [];
            const copy = [...arr];
            for (let i = copy.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [copy[i], copy[j]] = [copy[j], copy[i]];
            }
            return copy;
        }
    },

    // ── Donation widget ──────────────────────────────────────────────────────
    donation: {
        SHOW_AFTER: 5,   // show after this many key interactions
        SNOOZE_FOR: 20,  // after dismissal, wait this many more interactions

        getCount: function () {
            return parseInt(localStorage.getItem('mse-usage-count') || '0', 10);
        },
        setCount: function (n) {
            localStorage.setItem('mse-usage-count', String(n));
        },
        getDismissedAt: function () {
            const v = localStorage.getItem('mse-donation-dismissed-at');
            return v !== null ? parseInt(v, 10) : null;
        },
        shouldShow: function (count) {
            if (count < this.SHOW_AFTER) return false;
            const dismissedAt = this.getDismissedAt();
            if (dismissedAt === null) return true;
            return count >= dismissedAt + this.SNOOZE_FOR;
        },
        show: function () {
            const widget = document.getElementById('donation-widget');
            if (widget) widget.classList.remove('hidden');
        },
        dismiss: function () {
            const widget = document.getElementById('donation-widget');
            if (widget) widget.classList.add('hidden');
            localStorage.setItem('mse-donation-dismissed-at', String(this.getCount()));
        },
        increment: function () {
            const n = this.getCount() + 1;
            this.setCount(n);
            if (this.shouldShow(n)) this.show();
        },
        init: function () {
            const closeBtn = document.getElementById('donation-close');
            if (closeBtn) closeBtn.addEventListener('click', () => this.dismiss());
            if (this.shouldShow(this.getCount())) this.show();
        }
    },
    // ─────────────────────────────────────────────────────────────────────────

    pwa: {
        deferredPrompt: null,
        init: function () {
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                this.deferredPrompt = e;
                const banner = document.getElementById('pwa-install-banner');
                if (banner) banner.classList.remove('hidden');
            });
            window.addEventListener('appinstalled', () => {
                this.deferredPrompt = null;
                const banner = document.getElementById('pwa-install-banner');
                if (banner) banner.classList.add('hidden');
            });
            const installBtn = document.getElementById('pwa-install-btn');
            if (installBtn) {
                installBtn.addEventListener('click', async () => {
                    if (!this.deferredPrompt) return;
                    this.deferredPrompt.prompt();
                    const { outcome } = await this.deferredPrompt.userChoice;
                    this.deferredPrompt = null;
                    const banner = document.getElementById('pwa-install-banner');
                    if (banner) banner.classList.add('hidden');
                });
            }
            const dismissBtn = document.getElementById('pwa-install-dismiss');
            if (dismissBtn) {
                dismissBtn.addEventListener('click', () => {
                    const banner = document.getElementById('pwa-install-banner');
                    if (banner) banner.classList.add('hidden');
                });
            }
        }
    },

    renderView: function (viewName) {
        if (viewName !== 'game' && this.game && this.game.stopTimer) {
            this.game.stopTimer();
        }
        const views = ['dictionary', 'results', 'term', 'domain', 'cases', 'integrator', 'about', 'game'];
        views.forEach(v => {
            const node = this.nodes[`${v}View`];
            if (node) {
                if (v === viewName) {
                    node.classList.remove('hidden');
                    // Spring entrance animation
                    node.classList.remove('view-enter');
                    void node.offsetWidth; // force reflow
                    node.classList.add('view-enter');
                } else {
                    node.classList.add('hidden');
                }
            }
        });
    }
};

// ── Toast notification system ─────────────────────────────────
App.toast = {
    _container: null,
    _get: function () {
        if (!this._container) {
            this._container = document.createElement('div');
            this._container.className = 'toast-container';
            document.body.appendChild(this._container);
        }
        return this._container;
    },
    show: function (message, type = 'info', duration = 2800) {
        const container = this._get();
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.textContent = message;
        container.appendChild(el);
        const dismiss = () => {
            el.classList.add('leaving');
            setTimeout(() => el.remove(), 250);
        };
        el.addEventListener('click', dismiss);
        setTimeout(dismiss, duration);
        return el;
    }
};

// ── Animated bottom-nav indicator ────────────────────────────
App.navIndicator = {
    el: null,
    init: function () {
        const nav = document.querySelector('.bottom-nav');
        if (!nav || this.el) return;
        this.el = document.createElement('div');
        this.el.className = 'nav-indicator';
        nav.appendChild(this.el);
        this.update();
    },
    update: function () {
        const nav = document.querySelector('.bottom-nav');
        const active = nav && nav.querySelector('button.active');
        if (!active || !this.el) return;
        const navRect = nav.getBoundingClientRect();
        const btnRect = active.getBoundingClientRect();
        this.el.style.left  = `${btnRect.left - navRect.left}px`;
        this.el.style.width = `${btnRect.width}px`;
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;
