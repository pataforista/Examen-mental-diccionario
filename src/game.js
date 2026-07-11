export const game = {
  stats: {
    score: 0,
    streak: 0,
    correct: 0,
    wrong: 0,
    highScore: 0
  },
  arcade: {
    lives: 3,
    multiplier: 1,
    timeLeft: 100,
    timerInterval: null,
    maxTime: 15,
    isGameOver: false
  },
  currentMode: "mcq",
  diffPhase: 1,
  currentRound: null,
  init: function () {
    this.loadStats();
    this.cacheDOM();
    this.bindEvents();
    this.renderStats();
    this.initControlsToggle();
    if (!this.currentRound) this.nextRound();
  },
  initControlsToggle: function () {
    const toggle = document.getElementById("game-config-toggle");
    const body = document.getElementById("game-controls-body");
    const arrow = document.getElementById("game-config-arrow");
    if (!toggle || !body) return;
    if (!toggle._toggleBound) {
      toggle._toggleBound = true;
      toggle.addEventListener("click", () => {
        const isCollapsed = body.classList.toggle("collapsed");
        if (arrow) arrow.textContent = isCollapsed ? "▶" : "▼";
      });
    }
    if (window.innerWidth <= 768) {
      body.classList.add("collapsed");
      if (arrow) arrow.textContent = "▶";
    }
  },
  cacheDOM: function () {
    this.nodes = {
      score: document.getElementById("score"),
      streak: document.getElementById("streak"),
      correct: document.getElementById("correct"),
      wrong: document.getElementById("wrong"),
      modeMcq: document.getElementById("modeMcq"),
      modeDiff: document.getElementById("modeDiff"),
      domainSelect: document.getElementById("domainSelect"),
      difficultySelect: document.getElementById("difficultySelect"),
      prompt: document.getElementById("prompt"),
      subprompt: document.getElementById("subprompt"),
      options: document.getElementById("options"),
      feedback: document.getElementById("feedback"),
      hint: document.getElementById("hint"),
      btnNext: document.getElementById("btnNext"),
      btnReset: document.getElementById("btnReset"),
      gameCard: document.getElementById("gameCard")
    };
  },
  bindEvents: function () {
    if (this._bound) return;
    this._bound = true;
    this.nodes.modeMcq.addEventListener("click", () => this.setMode("mcq"));
    this.nodes.modeDiff.addEventListener("click", () => this.setMode("diff"));
    this.nodes.btnNext.addEventListener("click", () => this.nextRound());
    this.nodes.btnReset.addEventListener("click", () => this.resetStats());
    this.populateDomains();
  },
  populateDomains: function () {
    const domains = App.data.domains;
    this.nodes.domainSelect.innerHTML = '<option value="any">Todos los Dominios</option>';
    domains.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d.domain_id;
      opt.textContent = d.label_es || d.domain_name;
      this.nodes.domainSelect.appendChild(opt);
    });
  },
  setMode: function (mode) {
    this.currentMode = mode;
    this.nodes.modeMcq.setAttribute("aria-selected", mode === "mcq");
    this.nodes.modeDiff.setAttribute("aria-selected", mode === "diff");
    this.nextRound();
  },
  loadStats: function () {
    const saved = localStorage.getItem("mse_game_stats");
    if (saved) this.stats = JSON.parse(saved);
  },
  saveStats: function () {
    localStorage.setItem("mse_game_stats", JSON.stringify(this.stats));
    this.renderStats();
  },
  resetStats: function () {
    this.stats = {
      score: 0,
      streak: 0,
      correct: 0,
      wrong: 0
    };
    this.saveStats();
    this.showFeedback("Progreso reiniciado.", "ok");
  },
  renderStats: function () {
    if (!this.nodes) return;
    if (this.nodes.score) this.nodes.score.innerText = this.stats.score;
    if (this.nodes.streak) this.nodes.streak.innerText = this.stats.streak;
    if (this.nodes.correct) this.nodes.correct.innerText = this.stats.correct;
    if (this.nodes.wrong) this.nodes.wrong.innerText = this.stats.wrong;
    const elLives = document.getElementById("game-lives");
    if (elLives) elLives.innerText = ("❤️").repeat(Math.max(0, this.arcade.lives));
    const elMult = document.getElementById("game-multiplier");
    if (elMult) {
      elMult.innerText = `x${this.arcade.multiplier}`;
      if (this.arcade.multiplier > 1) elMult.classList.add("combo-pop"); else elMult.classList.remove("combo-pop");
    }
  },
  startTimer: function () {
    clearInterval(this.arcade.timerInterval);
    this.arcade.timeLeft = 100;
    const timerBar = document.getElementById("game-timer-bar");
    const timerContainer = document.getElementById("game-timer-container");
    if (timerContainer) timerContainer.classList.remove("hidden");
    const step = 100 / (this.arcade.maxTime * 10);
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
    const timerContainer = document.getElementById("game-timer-container");
    if (timerContainer) timerContainer.classList.add("hidden");
  },
  onTimeUp: function () {
    this.stopTimer();
    this.loseLife("¡Tiempo agotado!");
  },
  loseLife: function (reason) {
    this.arcade.lives--;
    this.arcade.multiplier = 1;
    if (("vibrate" in navigator)) try {
      navigator.vibrate([60, 30, 60, 30, 60]);
    } catch(e) { console.warn(e); }
    this.playAudio("error");
    this.showFeedback(reason || "Error.", "bad");
    this.nodes.gameCard.classList.add("animate-shake");
    setTimeout(() => this.nodes.gameCard.classList.remove("animate-shake"), 500);
    this.renderStats();
    if (this.arcade.lives <= 0) {
      this.gameOver();
    } else if (this.currentMode === "mcq") {
      this.disableOptions();
    }
  },
  gameOver: function () {
    this.arcade.isGameOver = true;
    this.stopTimer();
    this.nodes.prompt.textContent = "";
    this.nodes.prompt.insertAdjacentHTML("beforeend", `<span style="color:var(--v-accent); font-size: 2rem;">GAME OVER</span>`);
    this.nodes.subprompt.textContent = `Puntaje final: ${this.stats.score}`;
    this.nodes.options.textContent = "";
    this.nodes.options.insertAdjacentHTML("beforeend", `<button class="btn primary" onclick="App.game.restart()">Reiniciar Partida</button>`);
    this.playAudio("gameover");
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
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === "correct") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "gameover") {
        osc.type = "square";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn("Audio Context failed", e);
    }
  },
  nextRound: function () {
    this.clearFeedback();
    this.nodes.options.textContent = "";
    this.nodes.hint.textContent = "";
    const manual = document.getElementById("game-manual-text");
    const domain = this.nodes.domainSelect.value;
    const diff = this.nodes.difficultySelect.value;
    if (this.currentMode === "mcq") {
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
    const el = document.getElementById("game-instructions");
    if (el) el.classList.toggle("hidden");
  },
  buildMcqRound: function (domainId, diffObj) {
    let pool = App.data.terms.filter(t => t.definition_clinical && t.definition_clinical.core);
    if (domainId !== "any") {
      pool = pool.filter(t => t.domain_links && t.domain_links.some(l => l.domain_id === domainId));
    }
    if (pool.length < 4) return {
      error: "Insuficientes términos para esta selección."
    };
    const target = this.sampleOne(pool);
    if (!target) return {
      error: "No se pudo seleccionar un término."
    };
    const distractorPool = pool.filter(t => t.term_id !== target.term_id);
    const distractors = this.sampleMany(distractorPool, 3);
    const options = this.shuffle([{
      id: target.term_id,
      text: target.definition_clinical?.core || "",
      correct: true
    }, ...distractors.map(d => ({
      id: d.term_id,
      text: d.definition_clinical?.core || "",
      correct: false
    }))]);
    return {
      mode: "mcq",
      target,
      options
    };
  },
  renderMcqRound: function (round) {
    if (round.error) {
      this.nodes.prompt.textContent = "Error";
      this.nodes.subprompt.textContent = round.error;
      return;
    }
    this.nodes.prompt.textContent = `¿Cuál define mejor: "${round.target.canonical_name}"?`;
    this.nodes.subprompt.textContent = `${round.target.term_kind} · ${App.getDomainSlug(round.target.domain_links?.[0]?.domain_id || "")}`;
    this.renderOptions(round.options, opt => this.gradeMcq(opt.correct, round.target));
  },
  gradeMcq: function (isCorrect, target) {
    this.stopTimer();
    if (isCorrect) {
      const timeBonus = Math.floor(this.arcade.timeLeft / 10);
      const prevScore = this.stats.score;
      this.stats.score += (10 + timeBonus) * this.arcade.multiplier;
      this.stats.streak += 1;
      if (this.stats.streak % 3 === 0) this.arcade.multiplier++;
      if (("vibrate" in navigator)) try {
        navigator.vibrate([10, 30, 10]);
      } catch(e) { console.warn(e); }
      this.playAudio("correct");
      this.showFeedback(`¡Correcto! +${10 + timeBonus}${this.arcade.multiplier > 1 ? " x" + this.arcade.multiplier : ""}`, "ok");
      if (target.teaching_notes) this.nodes.hint.textContent = `Nota: ${target.teaching_notes[0]}`;
      this.nodes.gameCard.classList.add("animate-pulse");
      setTimeout(() => this.nodes.gameCard.classList.remove("animate-pulse"), 400);
      this._flashOptions(true);
      this._animateScore(prevScore, this.stats.score);
      this.disableOptions();
    } else {
      if (("vibrate" in navigator)) try {
        navigator.vibrate([40, 20, 40]);
      } catch(e) { console.warn(e); }
      this._flashOptions(false);
      this.loseLife("Incorrecto.");
    }
    this.saveStats();
  },
  _flashOptions: function (correct) {
    const cls = correct ? "correct-flash" : "wrong-flash";
    const btns = this.nodes.options.querySelectorAll("button");
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
    const tick = now => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * ease);
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = to;
        el.classList.add("score-pop");
        setTimeout(() => el.classList.remove("score-pop"), 450);
      }
    };
    requestAnimationFrame(tick);
  },
  buildDiffRound: function (domainId, diffObj) {
    let pool = App.data.cases;
    if (domainId !== "any") {
      pool = pool.filter(c => c.domains && c.domains[domainId]);
    }
    if (diffObj !== "any") {
      pool = pool.filter(c => String(c.level) === String(diffObj));
    }
    if (pool.length === 0) return {
      error: "No hay casos con estos filtros."
    };
    const c = this.sampleOne(pool);
    if (!c) return {
      error: "No se pudo seleccionar un caso."
    };
    const targetName = c.expected_engine_output?.primary_syndrome;
    if (!targetName) return {
      error: "Caso incompleto: falta síndrome primario."
    };
    const otherCases = App.data.cases.filter(x => x.case_id !== c.case_id);
    const distractors = this.sampleMany(otherCases, 3).map(x => x.expected_engine_output?.primary_syndrome).filter(Boolean);
    const uniqueOptions = [...new Set([targetName, ...distractors])];
    const termOptions = this.shuffle(uniqueOptions.map(name => ({
      id: name,
      text: name.replace(/_/g, " "),
      correct: name === targetName
    })));
    const correctKeys = c.assessment_keys?.key_discriminators || [];
    const wrongKeys = c.assessment_keys?.errors_to_avoid || [];
    if (correctKeys.length === 0 || wrongKeys.length === 0) {
      return {
        error: "Datos incompletos para este caso."
      };
    }
    const discOptions = this.shuffle([{
      text: this.sampleOne(correctKeys),
      correct: true,
      why: "Criterio discriminante clave."
    }, {
      text: this.sampleOne(wrongKeys),
      correct: false,
      why: "Error común a evitar."
    }]);
    return {
      mode: "diff",
      case: c,
      termOptions,
      discOptions
    };
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
    this.renderOptions(round.termOptions, opt => {
      if (opt.correct) {
        this.playAudio("correct");
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
    this.nodes.options.textContent = "";
    this.startTimer();
    this.renderOptions(round.discOptions, opt => {
      this.stopTimer();
      if (opt.correct) {
        const prevScore = this.stats.score;
        const timeBonus = Math.floor(this.arcade.timeLeft / 10);
        this.stats.score += (20 + timeBonus) * this.arcade.multiplier;
        this.stats.streak += 1;
        if (this.stats.streak % 3 === 0) this.arcade.multiplier++;
        if (("vibrate" in navigator)) try {
          navigator.vibrate([10, 30, 10]);
        } catch(e) { console.warn(e); }
        this.playAudio("correct");
        this.showFeedback("¡Excelente! Caso resuelto.", "ok");
        this.nodes.hint.textContent = `Clave: ${opt.text}`;
        this.nodes.gameCard.classList.add("animate-pulse");
        setTimeout(() => this.nodes.gameCard.classList.remove("animate-pulse"), 400);
        this._flashOptions(true);
        this._animateScore(prevScore, this.stats.score);
        this.disableOptions();
      } else {
        if (("vibrate" in navigator)) try {
          navigator.vibrate([60, 30, 60]);
        } catch(e) { console.warn(e); }
        this._flashOptions(false);
        this.loseLife("Criterio incorrecto.");
      }
      this.saveStats();
    });
  },
  renderOptions: function (options, callback) {
    this.nodes.options.textContent = "";
    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "opt";
      btn.textContent = opt.text;
      btn.onclick = () => callback(opt);
      this.nodes.options.appendChild(btn);
    });
  },
  disableOptions: function () {
    const btns = this.nodes.options.querySelectorAll("button");
    btns.forEach(b => b.disabled = true);
  },
  showFeedback: function (msg, cls) {
    this.nodes.feedback.textContent = msg;
    this.nodes.feedback.className = `feedback ${cls}`;
  },
  clearFeedback: function () {
    this.nodes.feedback.textContent = "";
    this.nodes.feedback.className = "feedback";
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
};
