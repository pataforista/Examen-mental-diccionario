// app.js
(() => {
    "use strict";

    const $ = (sel) => document.querySelector(sel);

    // --- Estado persistente simple ---
    const STORAGE_KEY = "minigame_v1_stats";
    const THEME_KEY = "minigame_v1_theme";
    const defaultStats = { score: 0, streak: 0, correct: 0, wrong: 0 };
    let stats = loadStats();

    // --- UI refs ---
    const elScore = $("#score");
    const elStreak = $("#streak");
    const elCorrect = $("#correct");
    const elWrong = $("#wrong");

    const btnNext = $("#btnNext");
    const btnReset = $("#btnReset");

    const btnInstall = $("#btnInstall");
    const btnTheme = $("#btnTheme");
    let deferredPrompt = null;

    const modeMcq = $("#modeMcq");
    const modeDiff = $("#modeDiff");
    const domainSelect = $("#domainSelect");
    const difficultySelect = $("#difficultySelect");

    const promptEl = $("#prompt");
    const subpromptEl = $("#subprompt");
    const optionsEl = $("#options");
    const feedbackEl = $("#feedback");
    const hintEl = $("#hint");

    // --- Estado runtime ---
    const GameMode = { MCQ: "mcq", DIFF: "diff" };
    let currentMode = GameMode.MCQ;

    // Diferencial: fase 1 (término) o fase 2 (criterio)
    let diffPhase = 1;
    let currentRound = null; // objeto con datos de ronda

    // --- Init ---
    initTheme();
    initPWA();
    initControls();
    populateDomains();
    renderStats();
    nextRound();

    // ---------------- PWA / Install / SW ----------------
    function initPWA() {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("./sw.js").catch(() => { });
        }

        window.addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault();
            deferredPrompt = e;
            btnInstall.hidden = false;
        });

        btnInstall.addEventListener("click", async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            try { await deferredPrompt.userChoice; } catch { }
            deferredPrompt = null;
            btnInstall.hidden = true;
        });
    }

    // ---------------- UI controls ----------------
    function initControls() {
        modeMcq.addEventListener("click", () => setMode(GameMode.MCQ));
        modeDiff.addEventListener("click", () => setMode(GameMode.DIFF));
        btnNext.addEventListener("click", nextRound);
        btnTheme.addEventListener("click", toggleTheme);

        btnReset.addEventListener("click", () => {
            stats = { ...defaultStats };
            saveStats(stats);
            renderStats();
            showFeedback("Progreso borrado.", "ok");
        });
    }

    function initTheme() {
        const saved = localStorage.getItem(THEME_KEY) || "light";
        setTheme(saved);
    }

    function toggleTheme() {
        const current = document.body.getAttribute("data-theme") || "light";
        const next = current === "light" ? "dark" : "light";
        setTheme(next);
    }

    function setTheme(theme) {
        document.body.setAttribute("data-theme", theme);
        btnTheme.textContent = theme === "light" ? "🌞" : "🌙";
        localStorage.setItem(THEME_KEY, theme);
        
        // Update manifest color
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", theme === "light" ? "#FFF8E7" : "#231f20");
    }

    function setMode(mode) {
        currentMode = mode;
        modeMcq.setAttribute("aria-selected", String(mode === GameMode.MCQ));
        modeDiff.setAttribute("aria-selected", String(mode === GameMode.DIFF));
        nextRound();
    }

    function populateDomains() {
        const domains = Array.from(new Set(window.DB.TERMS.map(t => t.domain))).sort();
        domainSelect.innerHTML = "";
        const optAll = document.createElement("option");
        optAll.value = "all";
        optAll.textContent = "Todos";
        domainSelect.appendChild(optAll);

        for (const d of domains) {
            const o = document.createElement("option");
            o.value = d;
            o.textContent = d;
            domainSelect.appendChild(o);
        }
    }

    // ---------------- Rounds ----------------
    function nextRound() {
        clearFeedback();
        optionsEl.innerHTML = "";
        hintEl.textContent = "";

        const domain = domainSelect.value;
        const diff = difficultySelect.value; // "any" o "1/2/3"

        if (currentMode === GameMode.MCQ) {
            diffPhase = 1;
            currentRound = buildMcqRound(domain, diff);
            renderMcqRound(currentRound);
        } else {
            diffPhase = 1;
            currentRound = buildDiffRound(domain, diff);
            renderDiffPhase1(currentRound);
        }
    }

    // -------- MCQ: término -> 4 definiciones --------
    function buildMcqRound(domain, diff) {
        const pool = filterTerms({ domain, diff });
        if (pool.length < 4) {
            return { error: "No hay suficientes términos para generar 4 opciones con esos filtros." };
        }

        const target = sampleOne(pool);
        // Distractores por dominio y dificultad similar si es posible
        const distractorPool = pool.filter(t => t.id !== target.id);
        const distractors = sampleMany(distractorPool, 3);

        const options = shuffle([
            { id: target.id, text: target.definition, correct: true },
            ...distractors.map(d => ({ id: d.id, text: d.definition, correct: false }))
        ]);

        return { mode: "mcq", target, options };
    }

    function renderMcqRound(round) {
        if (round.error) {
            promptEl.textContent = "No se pudo generar ronda.";
            subpromptEl.textContent = round.error;
            return;
        }

        promptEl.textContent = `¿Cuál es la mejor definición de: “${round.target.term}”?`;
        subpromptEl.textContent = `Dominio: ${round.target.domain} · Dificultad: ${round.target.difficulty}`;
        renderOptions(round.options, (opt) => {
            gradeMcq(opt.correct, round.target);
        });
    }

    function gradeMcq(isCorrect, target) {
        if (isCorrect) {
            stats.score += 10;
            stats.streak += 1;
            stats.correct += 1;
            saveStats(stats);
            renderStats();
            showFeedback("Correcto.", "ok");
            hintEl.textContent = `Rasgos guía: ${target.features?.slice(0, 4).join(" · ") || "—"}`;
            disableOptions();
        } else {
            stats.score = Math.max(0, stats.score - 5);
            stats.streak = 0;
            stats.wrong += 1;
            saveStats(stats);
            renderStats();
            showFeedback("Incorrecto. Revisa el rasgo discriminante.", "bad");
            // No bloquea inmediatamente: puedes decidir bloquear tras 1 error (aquí lo dejamos abierto)
        }
    }

    // -------- Diferencial 2 pasos --------
    function buildDiffRound(domain, diff) {
        const casePool = filterCases({ domain, diff });
        if (casePool.length === 0) {
            return { error: "No hay casos que cumplan esos filtros." };
        }

        const c = sampleOne(casePool);

        const target = findTerm(c.target_term_id);
        if (!target) return { error: "Caso con target_term_id no encontrado en TERMS." };

        // Opciones de términos: target + 2 distractores (si el caso no trae suficientes, se completan)
        let distractors = (c.distractor_term_ids || []).map(findTerm).filter(Boolean);
        distractors = distractors.filter(t => t.id !== target.id);

        // Completar si faltan distractores
        if (distractors.length < 2) {
            const pool = filterTerms({ domain: "all", diff: "any" }).filter(t => t.id !== target.id);
            const need = 2 - distractors.length;
            distractors = distractors.concat(sampleMany(pool.filter(t => !distractors.some(d => d.id === t.id)), need));
        } else {
            distractors = sampleMany(distractors, 2);
        }

        const termOptions = shuffle([
            { id: target.id, text: target.term, correct: true },
            ...distractors.map(d => ({ id: d.id, text: d.term, correct: false }))
        ]);

        // Paso 2: opciones de discriminadores (1 correcto + 2 distractores)
        const correctDiscId = c.key_discriminator_id;
        const correctDisc = (target.discriminators || []).find(d => d.id === correctDiscId) || null;

        // Si no hay discriminador correcto, fallback: usa el primero
        const effectiveCorrectDisc = correctDisc || (target.discriminators?.[0] ?? null);

        const discPool = (target.discriminators || []).filter(d => d.id !== (effectiveCorrectDisc?.id));
        let discDistractors = sampleMany(discPool, Math.min(2, discPool.length));

        // Si faltan, tomar de otros términos mismo dominio
        if (discDistractors.length < 2) {
            const otherTerms = window.DB.TERMS.filter(t => t.domain === target.domain && t.id !== target.id);
            const otherDiscs = otherTerms.flatMap(t => (t.discriminators || []).map(d => ({ ...d, _from: t.id })));
            const need = 2 - discDistractors.length;
            discDistractors = discDistractors.concat(sampleMany(otherDiscs, Math.min(need, otherDiscs.length)));
        }

        const discOptions = shuffle([
            { id: effectiveCorrectDisc?.id || "disc_ok", text: effectiveCorrectDisc?.label || "Criterio discriminante", correct: true, why: effectiveCorrectDisc?.why || "" },
            ...discDistractors.map(d => ({ id: d.id, text: d.label, correct: false, why: d.why || "" }))
        ]);

        return { mode: "diff", case: c, target, termOptions, discOptions };
    }

    function renderDiffPhase1(round) {
        if (round.error) {
            promptEl.textContent = "No se pudo generar ronda.";
            subpromptEl.textContent = round.error;
            return;
        }

        promptEl.textContent = "Diferencial (Paso 1/2): elige el término más compatible";
        subpromptEl.textContent = round.case.stem;
        renderOptions(round.termOptions, (opt) => {
            if (opt.correct) {
                showFeedback("Paso 1 correcto. Ahora elige el criterio discriminante (Paso 2/2).", "ok");
                diffPhase = 2;
                // bloquear opciones de fase 1
                disableOptions();
                setTimeout(() => {
                    clearFeedback();
                    renderDiffPhase2(round);
                }, 350);
            } else {
                stats.score = Math.max(0, stats.score - 3);
                stats.streak = 0;
                stats.wrong += 1;
                saveStats(stats);
                renderStats();
                showFeedback("No. Enfócate en el rasgo que separa fenómenos cercanos.", "bad");
            }
        });
    }

    function renderDiffPhase2(round) {
        promptEl.textContent = "Diferencial (Paso 2/2): ¿qué criterio define mejor la elección correcta?";
        subpromptEl.textContent = `Término objetivo: ${round.target.term} · Caso: ${round.case.id}`;
        optionsEl.innerHTML = "";
        renderOptions(round.discOptions, (opt) => {
            gradeDiffPhase2(opt.correct, round.target, opt);
        });
    }

    function gradeDiffPhase2(isCorrect, target, opt) {
        if (isCorrect) {
            stats.score += 15;
            stats.streak += 1;
            stats.correct += 1;
            saveStats(stats);
            renderStats();

            showFeedback("Correcto. Discriminador aplicado.", "ok");
            hintEl.textContent = opt.why ? `Por qué: ${opt.why}` : `Rasgos: ${target.features?.slice(0, 4).join(" · ") || "—"}`;
            disableOptions();
        } else {
            stats.score = Math.max(0, stats.score - 5);
            stats.streak = 0;
            stats.wrong += 1;
            saveStats(stats);
            renderStats();
            showFeedback("Incorrecto. El criterio correcto debe separar este fenómeno de sus vecinos.", "bad");
        }
    }

    // ---------------- Rendering options ----------------
    function renderOptions(options, onPick) {
        optionsEl.innerHTML = "";
        for (const opt of options) {
            const btn = document.createElement("button");
            btn.className = "opt";
            btn.type = "button";
            btn.textContent = opt.text;
            btn.addEventListener("click", () => onPick(opt));
            optionsEl.appendChild(btn);
        }
    }

    function disableOptions() {
        for (const el of optionsEl.querySelectorAll("button.opt")) {
            el.disabled = true;
        }
    }

    function showFeedback(msg, kind) {
        feedbackEl.textContent = msg;
        feedbackEl.className = "feedback " + (kind || "");
    }

    function clearFeedback() {
        feedbackEl.textContent = "";
        feedbackEl.className = "feedback";
    }

    // ---------------- Filters & helpers ----------------
    function filterTerms({ domain, diff }) {
        let arr = window.DB.TERMS.slice();
        if (domain && domain !== "all") arr = arr.filter(t => t.domain === domain);
        if (diff && diff !== "any") arr = arr.filter(t => String(t.difficulty || 1) === String(diff));
        return arr;
    }

    function filterCases({ domain, diff }) {
        let arr = window.DB.CASES.slice();
        if (domain && domain !== "all") arr = arr.filter(c => c.domain === domain);
        if (diff && diff !== "any") arr = arr.filter(c => String(c.difficulty || 1) === String(diff));
        return arr;
    }

    function findTerm(id) {
        return window.DB.TERMS.find(t => t.id === id) || null;
    }

    function sampleOne(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function sampleMany(arr, n) {
        const copy = arr.slice();
        shuffle(copy);
        return copy.slice(0, n);
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ---------------- Stats ----------------
    function renderStats() {
        elScore.textContent = String(stats.score);
        elStreak.textContent = String(stats.streak);
        elCorrect.textContent = String(stats.correct);
        elWrong.textContent = String(stats.wrong);
    }

    function loadStats() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return { ...defaultStats };
            const parsed = JSON.parse(raw);
            return { ...defaultStats, ...parsed };
        } catch {
            return { ...defaultStats };
        }
    }

    function saveStats(s) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { }
    }
})();
