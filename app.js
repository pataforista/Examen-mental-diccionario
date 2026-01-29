/**
 * Examen Mental - Diccionario Clínico
 * Core Application Engine
 */

const App = {
    data: {
        terms: [],
        domains: [],
        cases: [],
        fuse: null
    },

    init: async function () {
        this.cacheDOM();
        this.bindEvents();
        await this.loadData();
        this.setupSearch();
        this.renderDomains();
    },

    cacheDOM: function () {
        this.nodes = {
            search: document.getElementById('global-search'),
            content: document.getElementById('app-content'),
            resultsView: document.getElementById('results-view'),
            termView: document.getElementById('term-view'),
            domainView: document.getElementById('domain-view'),
            casesView: document.getElementById('cases-view'),
            navButtons: document.querySelectorAll('.bottom-nav button')
        };
    },

    bindEvents: function () {
        this.nodes.search.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.nodes.navButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.id));
        });
    },

    loadData: async function () {
        try {
            const [registryData, manifest] = await Promise.all([
                fetch('lexicon/term_id_registry.json').then(r => r.json()),
                fetch('lexicon/meta/lexicon.manifest.json').then(r => r.json())
            ]);

            const termRegistry = registryData.terms_index;

            // Load terms from their actual paths
            const termPromises = termRegistry.map(t =>
                fetch(t.path).then(r => r.json())
            );

            this.data.terms = await Promise.all(termPromises);

            // Load domains
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
            const cases = await fetch('OSCE_001–003.json').then(r => r.json());
            this.data.cases = cases;

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

    setupSearch: function () {
        if (!window.Fuse) return;
        this.data.fuse = new Fuse(this.data.terms, {
            keys: ['canonical_name', 'synonyms_and_slang', 'definition_clinical.core'],
            threshold: 0.3
        });
    },

    handleSearch: function (query) {
        if (query.length < 2) {
            this.nodes.resultsView.classList.add('hidden');
            this.nodes.domainView.classList.remove('hidden');
            return;
        }

        const results = this.data.fuse.search(query);
        this.renderResults(results);
    },

    renderResults: function (results) {
        this.nodes.resultsView.innerHTML = results.map(r => `
            <div class="card result-item" onclick="App.viewTerm('${r.item.term_id}')">
                <div class="badge badge-risk-${r.item.risk_weight > 1 ? 'critical' : 'alert'}">
                    ${r.item.term_kind}
                </div>
                <strong>${r.item.canonical_name}</strong>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.25rem 0;">
                    ${r.item.definition_clinical.core.substring(0, 100)}...
                </p>
            </div>
        `).join('');
        this.nodes.resultsView.classList.remove('hidden');
        this.nodes.domainView.classList.add('hidden');
        this.nodes.termView.classList.add('hidden');
    },

    viewTerm: function (termId) {
        const term = this.data.terms.find(t => t.term_id === termId);
        if (!term) return;

        this.nodes.termView.innerHTML = `
            <div class="card">
                <button onclick="App.closeTerm()" style="float:right; border:none; background:none; font-size:1.2rem;">&times;</button>
                <div class="badge badge-risk-${term.risk_weight > 1 ? 'critical' : 'alert'}">${term.term_kind}</div>
                <h2 class="term-title">${term.canonical_name}</h2>
                
                <div class="definition-section">
                    <span class="section-label">Definición Clínica</span>
                    <p>${term.definition_clinical.core}</p>
                </div>

                ${term.definition_clinical.subjective_marker ? `
                    <div class="definition-section">
                        <span class="section-label">Marcador Subjetivo</span>
                        <p><em>${term.definition_clinical.subjective_marker}</em></p>
                    </div>
                ` : ''}

                ${term.alerts.length ? `
                    <div class="card" style="background: #FFF5F5; border-left: 4px solid var(--accent); margin-top: 1rem;">
                        <span class="section-label" style="color: var(--accent);">Alerta Clínica</span>
                        <p style="font-weight: 600; margin: 0; font-size: 0.9rem;">${term.alerts[0].message}</p>
                    </div>
                ` : ''}

                <div class="definition-section">
                    <span class="section-label">Perlas de Docencia</span>
                    <ul>
                        ${term.teaching_notes.map(note => `<li>${note}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        this.nodes.termView.classList.remove('hidden');
        this.nodes.resultsView.classList.add('hidden');
        this.nodes.domainView.classList.add('hidden');
    },

    closeTerm: function () {
        this.nodes.termView.classList.add('hidden');
        if (this.nodes.search.value.length > 1) {
            this.nodes.resultsView.classList.remove('hidden');
        } else {
            this.nodes.domainView.classList.remove('hidden');
        }
    },

    renderDomains: function () {
        this.nodes.domainView.innerHTML = `
            <h3 style="margin-top:0;">Explorar por Dominios</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                ${this.data.domains.map(d => `
                    <div class="card" style="padding: 0.75rem; text-align: center; margin: 0; font-size: 0.85rem; font-weight: 600; color: var(--primary);">
                        ${d.label_es || d.domain_name || d.domain_id}
                    </div>
                `).join('')}
            </div>
        `;
    },

    switchTab: function (id) {
        this.nodes.navButtons.forEach(btn => btn.classList.toggle('active', btn.id === id));

        this.nodes.domainView.classList.add('hidden');
        this.nodes.resultsView.classList.add('hidden');
        this.nodes.termView.classList.add('hidden');
        this.nodes.casesView.classList.add('hidden');

        if (id === 'nav-dictionary') {
            if (this.nodes.search.value.length > 1) this.nodes.resultsView.classList.remove('hidden');
            else this.nodes.domainView.classList.remove('hidden');
        } else if (id === 'nav-domains') {
            this.nodes.domainView.classList.remove('hidden');
        } else if (id === 'nav-cases') {
            this.renderCases();
            this.nodes.casesView.classList.remove('hidden');
        }
    },

    renderCases: function () {
        this.nodes.casesView.innerHTML = `
            <h3>Escenarios OSCE</h3>
            ${this.data.cases.map(c => `
                <div class="card">
                    <div style="display:flex; justify-content: space-between; align-items: center;">
                        <span class="badge" style="background:#E0E0E0;">Nivel ${c.level}</span>
                        <code style="font-size: 0.7rem;">${c.case_id}</code>
                    </div>
                    <p style="margin: 0.5rem 0;"><strong>${c.stem.setting.replace('_', ' ')}</strong> - ${c.stem.contextual_notes}</p>
                    <div style="font-size: 0.8rem; background: var(--background); padding: 0.5rem; border-radius: 4px;">
                        <strong>Salida esperada:</strong> ${c.expected_engine_output.primary_syndrome.replace('_', ' ')}
                    </div>
                </div>
            `).join('')}
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App; // Globals for inline event handlers
