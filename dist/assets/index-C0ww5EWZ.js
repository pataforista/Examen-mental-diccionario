var e=(e,t,n)=>()=>{if(n)throw n[0];try{return e&&(t=e(e=0)),t}catch(e){throw n=[e],e}},t=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports);(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var n,r=e((()=>{n={terms:[],domains:[],cases:[],fuse:null,currentView:`dictionary`,recentSearches:[],searchDebounceTimer:null,chromaPos:{x:0,y:0}}})),i,a=e((()=>{i={sanitizeHTML:function(e){if(!e)return``;let t=document.createElement(`div`);return t.textContent=e,t.innerHTML},speakTerm:function(e){if(`speechSynthesis`in window){window.speechSynthesis.cancel();let t=new SpeechSynthesisUtterance(e);t.lang=`es-MX`,t.rate=.95,window.speechSynthesis.speak(t)}},haptic:function(){if(`vibrate`in navigator)try{navigator.vibrate(10)}catch(e){console.warn(e)}},getTermUrl:function(e){return`${window.location.origin}${window.location.pathname}#term/${e}`},wrapText:function(e,t,n,r,i,a){let o=t.split(` `),s=``,c=0;for(let t=0;t<o.length;t++){let l=s+o[t]+` `;e.measureText(l).width>i&&t>0?(e.fillText(s,n,r),s=o[t]+` `,r+=a,c++):s=l}return e.fillText(s,n,r),c+1},generateShareCard:async function(e){let t=document.createElement(`canvas`);t.width=1080,t.height=1080;let n=t.getContext(`2d`);if(!n)throw Error(`Canvas context unavailable`);let r=`#211f1f`,i=`#95215c`;n.fillStyle=`#FFF8E7`,n.fillRect(0,0,t.width,t.height),n.fillStyle=i,n.beginPath(),n.arc(950,130,180,0,Math.PI*2),n.fill(),n.fillStyle=`#7acdbf`,n.fillRect(-50,900,300,300),n.fillStyle=`#9a8238`,n.beginPath(),n.moveTo(100,350),n.lineTo(980,200),n.lineTo(800,500),n.closePath(),n.fill(),n.strokeStyle=r,n.lineWidth=40,n.strokeRect(20,20,t.width-40,t.height-40),n.fillStyle=r,n.fillRect(80,80,480,80),n.fillStyle=`#FFFFFF`,n.font=`900 40px Outfit, sans-serif`,n.fillText(`TERMINOLOGÍA CLÍNICA`,110,135),n.fillStyle=r,n.font=`900 110px Outfit, sans-serif`;let a=e.canonical_name.toUpperCase(),o=350+this.wrapText(n,a,80,350,920,120)*120+20;n.fillStyle=i,n.fillRect(80,o,250,50),n.fillStyle=`#FFFFFF`,n.font=`800 30px Outfit, sans-serif`,n.fillText(e.term_kind.toUpperCase(),100,o+35),n.fillStyle=r,n.font=`500 48px Outfit, sans-serif`;let s=e.definition_clinical?.core||``,c=s.length>280?s.substring(0,280)+`...`:s;return this.wrapText(n,c,80,550,920,65),n.fillStyle=r,n.font=`800 35px Outfit, sans-serif`,n.fillText(`DICCIONARIO DE EXAMEN MENTAL`,80,980),n.font=`400 30px Outfit, sans-serif`,n.fillText(`examen-mental.pages.dev`,80,1020),n.font=`900 32px Outfit, sans-serif`,n.fillText(`📱 DESCARGA LA APP`,620,985),new Promise(e=>{t.toBlob(e,`image/png`)})}}})),o,s=e((()=>{o={current:`light`,systemPref:function(){return window.matchMedia&&window.matchMedia(`(prefers-color-scheme: dark)`).matches?`dark`:`light`},init:function(){let e=localStorage.getItem(`mse-theme`);e===`light`||e===`dark`?this.set(e):(this.set(this.systemPref(),!1),this.watchSystem())},watchSystem:function(){if(!window.matchMedia)return;let e=window.matchMedia(`(prefers-color-scheme: dark)`),t=e=>{localStorage.getItem(`mse-theme`)||this.set(e.matches?`dark`:`light`,!1)};e.addEventListener?e.addEventListener(`change`,t):e.addListener&&e.addListener(t)},toggle:function(){let e=this.current===`light`?`dark`:`light`;this.set(e)},set:function(e,t=!0){this.current=e,document.body.setAttribute(`data-theme`,e),document.getElementById(`theme-toggle`).innerHTML=e===`light`?`🌞`:`🌙`,document.getElementById(`app-title`).innerText=`DICCIONARIO DE EXAMEN MENTAL`,t&&localStorage.setItem(`mse-theme`,e);let n=document.querySelector(`meta[name="theme-color"]`);n&&n.setAttribute(`content`,e===`light`?`#FFF8E7`:`#120C18`)}}})),c,l=e((()=>{c={currentStep:0,steps:[{id:1,label:`Consciencia y orientación`,domain:`DOM-01`,guide:`¿Está alerta, somnoliento, estuporoso, confuso, obnubilado, en coma?
Orientación: Persona (¿Cómo se llama?), Lugar (¿Dónde estamos?), Tiempo (Día, mes, año), Situación (¿Sabe por qué está aquí?)`,example:`Paciente consciente, alerta. Orientado en persona, lugar, tiempo y situación.`,description:`Evaluación del estado de alerta y ubicación.`},{id:2,label:`Higiene, vestimenta y aliento`,domain:`DOM-02`,components:[`higiene`,`vestimenta_y_aliño`,`aliento`],guide:`Ropa adecuada al clima/situación, limpia o descuidada.
Higiene personal (olor corporal, cabello, uñas).
Aliento (alcohol, cetonas, fétido, normal).`,example:`Vestimenta desordenada, ropa sucia. Higiene deficiente. Aliento normal.`,description:`Observación de aliño y presentación física.`},{id:3,label:`Posición`,domain:`DOM-02`,components:[`postura`],guide:`De pie, sentado, en cama, encamado, postura fija, decúbito activo/pasivo.`,example:`Paciente sentado voluntariamente en la camilla.`,description:`Postura corporal predominante.`},{id:4,label:`Facies`,domain:`DOM-02`,components:[`facies`],guide:`Expresión facial (triste, angustiada, hostil, desconfiada, indiferente, perpleja, eufórica, inexpresiva).`,example:`Facies de angustia e indiferencia.`,description:`Mímica y expresión facial.`},{id:5,label:`Función psicomotriz`,domain:`DOM-04`,guide:`Movimientos anormales (temblor, tics, acatisia, estereotipias, corea). Inhibición o agitación. Catalepsia, flexibilidad cérea.`,example:`Agitación psicomotriz generalizada, sin temblores.`,description:`Actividad motora observable.`},{id:6,label:`Actitud`,domain:`DOM-03`,components:[`actitud`],guide:`Cooperadora, hostil, negativista, seductora, distante, apática, provocadora.`,example:`Actitud cooperadora durante la entrevista.`,description:`Disposición hacia el examinador.`},{id:7,label:`Contacto visual`,domain:`DOM-03`,components:[`contacto_visual`],guide:`Fijo, evitativo, perdido, amenazante, de seducción.`,example:`Contacto visual evitativo, ocasional.`,description:`Conexión visual con el examinador.`},{id:8,label:`Habla (volumen, cantidad, tono)`,domain:`DOM-05`,components:[`volumen_y_tono`,`velocidad_y_ritmo`],guide:`Volumen (alto, bajo, normal), Cantidad (escasa, logorrea, pobre), Tono (monótono, modulado, enfático).`,example:`Habla espontánea, volumen bajo, cantidad escasa, tono monótono.`,description:`Características sonoras del lenguaje.`},{id:9,label:`Discurso`,domain:`DOM-05`,components:[`articulacion`],guide:`Velocidad (lento, presionado, normal), Organización (coherente, divagante, tangencial, circunstancial).`,example:`Discurso lento, coherente pero con tendencia a divagaciones.`,description:`Forma y fluidez del relato.`},{id:10,label:`Lenguaje`,domain:`DOM-05`,components:[`lenguaje_simbolico`],guide:`Neologismos, parafasias, jergafasia, ecolalia, mutismo.`,example:`Lenguaje sin alteraciones; sin neologismos ni parafasias.`,description:`Uso de símbolos y reglas gramaticales.`},{id:11,label:`Curso del pensamiento`,domain:`DOM-06`,guide:`Acelerado, enlentecido, bloqueo, robo, fuga de ideas, incoherencia.`,example:`Curso del pensamiento enlentecido, sin bloqueos.`,description:`Flujo y velocidad de las ideas.`},{id:12,label:`Ideación suicida`,domain:`DOM-12`,guide:`¿Ha pensado que la vida no vale la pena? ¿Ha pensado en morir? ¿Tiene plan/medios?
¿Hay ideación homicida?`,example:`Niega ideación suicida u homicida en la actualidad.`,description:`Evaluación de riesgo vital.`},{id:13,label:`Contenido del pensamiento`,domain:`DOM-07`,guide:`Delirios (persecutorio, místico, grandeza), Obsesiones, Fobias, Ideas sobrevaloradas.`,example:`Contenido delirante de tipo persecutorio y autorreferencial.`,description:`El qué de lo que el paciente piensa.`},{id:14,label:`Ánimo`,domain:`DOM-09`,components:[`animo_subjetivo`],guide:`¿Cómo se ha sentido? ¿Triste, alegre, irritable?
Escala subjetiva 0-10.`,example:`Ánimo disfórico, refiere tristeza 8/10.`,description:`Estado subjetivo reportado por el paciente.`},{id:15,label:`Afecto`,domain:`DOM-09`,components:[`afecto_observable`,`reactividad_afectiva`,`rango_afectivo`,`regulacion_afectiva`,`congruencia_afectiva`],guide:`Tipo (depresivo, ansioso, irritable), Modulación (reactivo, lábil, restringido). Adecuación al discurso.`,example:`Afecto ansioso, reactivo, adecuado al contenido verbal.`,description:`Expresión emocional observable.`},{id:16,label:`Sensopercepción`,domain:`DOM-08`,guide:`¿Oye/ve cosas que otros no? Alucinaciones (auditivas, visuales, etc.), Ilusiones, Despersonalización.`,example:`Alucinaciones auditivas simples (escucha que le llaman).`,description:`Evaluación de percepciones.`},{id:17,label:`Funciones mentales superiores`,domain:`DOM-10`,guide:`a) Memoria (Reciente, Mediata, Remota)
b) Atención (Dígitos, Mundo al revés)
c) Abstracción (Semejanzas, Refranes)
d) Cálculo
e) Conocimiento (Gnosias, info general)`,example:`Memoria y atención conservadas; abstracción en nivel concreto.`,description:`Evaluación cognitiva global.`},{id:18,label:`Conciencia de enfermedad`,domain:`DOM-11`,components:[`insight_de_enfermedad`],guide:`¿Cree que tiene algún problema? ¿Necesita tratamiento?`,example:`Ausencia de conciencia de enfermedad; niega trastorno.`,description:`Reconocimiento de la patología.`},{id:19,label:`Juicio`,domain:`DOM-11`,components:[`juicio_practico`,`juicio_social`],guide:`¿Qué haría ante un incendio? ¿Si se queda sin dinero?`,example:`Juicio conservado para situaciones prácticas.`,description:`Capacidad de toma de decisiones.`},{id:20,label:`Proyección a futuro`,domain:`DOM-11`,components:[`proyeccion_a_futuro`],guide:`¿Cómo se ve en un año? ¿Tiene metas/planes?`,example:`Proyección a futuro pesimista, sin planes concretos.`,description:`Expectativas y prospectiva de vida.`}],responses:{},init:function(){this.cacheDOM(),this.bindEvents(),this.renderStepsList(),this.renderCurrentStep(),this.updateReport(),this.updateProgressBar()},teachingMode:!0,updateProgressBar:function(){let e=this.steps.length,t=this.steps.filter(e=>!!this.responses[e.id]).length/e*100;this.nodes.progressBar&&(this.nodes.progressBar.style.width=`${t}%`)},loadPedagogicalData:function(){this.discriminators={PER_001:{label:`Alucinación verdadera`,why:`Sin objeto, externa, con convicción.`},PER_004:{label:`Pseudoalucinación`,why:`Sin objeto, interna (dentro de la mente).`},THO_010:{label:`Fuga de ideas`,why:`Asociaciones rápidas pero con hilo conductor superficial.`},THO_020:{label:`Incoherencia`,why:`Pérdida total de sintaxis y sentido.`}}},cacheDOM:function(){this.nodes={stepsList:document.getElementById(`integrator-steps-list`),stepLabel:document.getElementById(`step-label`),stepDescription:document.getElementById(`step-description`),optionsContainer:document.getElementById(`step-options-container`),stepText:document.getElementById(`step-text`),prevBtn:document.getElementById(`int-prev-btn`),nextBtn:document.getElementById(`int-next-btn`),reportOutput:document.getElementById(`report-output`),copyBtn:document.getElementById(`int-copy-btn`),resetBtn:document.getElementById(`int-reset-btn`),progressBar:document.getElementById(`int-progress-bar`),teachingToggle:document.getElementById(`int-teaching-mode`)}},bindEvents:function(){this._bound||(this._bound=!0,this.nodes.prevBtn.addEventListener(`click`,()=>this.navigate(-1)),this.nodes.nextBtn.addEventListener(`click`,()=>this.navigate(1)),this.nodes.resetBtn.addEventListener(`click`,()=>this.reset()),this.nodes.copyBtn.addEventListener(`click`,()=>this.copyReport()),this.nodes.stepText.addEventListener(`input`,e=>{let t=this.steps[this.currentStep];this.responses[t.id]=e.target.value,this.updateReport(),this.updateStepStatus(t.id)}),this.nodes.reportOutput.addEventListener(`input`,e=>{}))},renderStepsList:function(){this.nodes.stepsList.innerHTML=this.steps.map((e,t)=>`
                <li class="step-item ${t===this.currentStep?`active`:``} ${this.responses[e.id]?`completed`:``}" 
                    onclick="App.integrator.goToStep(${t})" id="step-nav-${e.id}">
                    <span class="step-number">${t+1}</span>
                    <span class="step-text-label">${e.label}</span>
                </li>
            `).join(``)},renderCurrentStep:function(){let e=this.steps[this.currentStep];e&&(this.nodes.stepLabel.textContent=`${this.currentStep+1}. ${e.label}`,this.nodes.stepDescription.innerHTML=`
                <div style="margin-bottom:0.75rem; color:var(--text-p); font-size:0.9rem; font-weight:500;">${App.utils.sanitizeHTML(e.description)}</div>
                ${e.guide?`<div class="mnemonic-hint" style="background:rgba(var(--accent-rgb), 0.1); border-color:var(--accent); margin-top:0.5rem; padding:0.75rem; border-radius:8px; font-size:0.85rem;"><strong>🔎 QUÉ OBSERVAR / PREGUNTAR:</strong><br>${App.utils.sanitizeHTML(e.guide).replace(/\n/g,`<br>`)}</div>`:``}
                ${e.example?`<div class="mnemonic-hint" style="background:rgba(var(--primary-rgb), 0.05); color:var(--text-secondary); border-style:dashed; margin-top:0.5rem; padding:0.75rem; border-radius:8px; font-size:0.85rem;"><strong>✍️ REDACCIÓN EJEMPLO:</strong><br>${App.utils.sanitizeHTML(e.example)}</div>`:``}
            `,this.nodes.stepText.value=this.responses[e.id]||``,this.nodes.stepText.placeholder=e.example||`Escribe tus observaciones aquí...`,this.renderOptionsForStep(e),this.nodes.prevBtn.disabled=this.currentStep===0,this.nodes.nextBtn.textContent=this.currentStep===this.steps.length-1?`Finalizar`:`Siguiente →`,this.nodes.stepsList.querySelectorAll(`.step-item`).forEach((e,t)=>e.classList.toggle(`active`,t===this.currentStep)))},renderOptionsForStep:function(e){let t=App.data.domains.find(t=>t.domain_id===e.domain);if(!t){this.nodes.optionsContainer.textContent=``,this.nodes.optionsContainer.insertAdjacentHTML(`beforeend`,`<p style="font-size:0.8rem; opacity:0.5;">No hay términos asociados.</p>`);return}let n=[];if(e.components?e.components.forEach(e=>{let r=t.subcomponents?.find(t=>t.id===e);r&&r.accepted_terms&&(n=[...n,...r.accepted_terms])}):t.subcomponents?.forEach(e=>{e.accepted_terms&&(n=[...n,...e.accepted_terms])}),n=[...new Set(n)],n.length===0){this.nodes.optionsContainer.textContent=``,this.nodes.optionsContainer.insertAdjacentHTML(`beforeend`,`<p style="font-size:0.8rem; opacity:0.5;">No hay términos asociados.</p>`);return}this.nodes.optionsContainer.innerHTML=n.map(t=>`<div class="int-opt ${this.responses[e.id]?.includes(t.replace(/_/g,` `))?`selected`:``}" onclick="App.integrator.toggleTerm('${t}')">${t.replace(/_/g,` `)}</div>`).join(``)},toggleTerm:function(e){App.utils.haptic();let t=this.steps[this.currentStep],n=e.replace(/_/g,` `),r=this.responses[t.id]||``;r.includes(n)?(r=r.replace(RegExp(`${n},?\\s?`,`g`),``).trim(),r.endsWith(`,`)&&(r=r.slice(0,-1))):r=r?`${r}, ${n}`:n,this.responses[t.id]=r,this.nodes.stepText.value=r,this.updateReport(),this.renderOptionsForStep(t),this.updateStepStatus(t.id)},updateStepStatus:function(e){let t=document.getElementById(`step-nav-${e}`);t&&t.classList.toggle(`completed`,!!this.responses[e])},navigate:function(e){App.utils.haptic();let t=this.currentStep+e;t>=0&&t<this.steps.length?(this.currentStep=t,this.renderCurrentStep(),App.nodes.content.scrollTop=0):t===this.steps.length&&App.toast.show(`✅ ¡Examen completado! Revisa y copia el reporte final.`,`success`,4e3)},goToStep:function(e){this.currentStep=e,this.renderCurrentStep()},updateReport:function(){let e=``;this.steps.forEach(t=>{this.responses[t.id]&&(e+=`${t.label}: ${this.responses[t.id]}.\n`)}),e?this.nodes.reportOutput.textContent=e:this.nodes.reportOutput.textContent=`Tu reporte aparecerá aquí a medida que avances...`},copyReport:function(){let e=this.nodes.reportOutput.innerText;if(!e||e.startsWith(`Tu reporte`)){App.toast.show(`Completa al menos un paso antes de copiar.`,`warning`);return}navigator.clipboard.writeText(e).then(()=>{App.utils.haptic(),App.toast.show(`📋 Reporte copiado al portapapeles`,`success`);let e=this.nodes.copyBtn.innerHTML;this.nodes.copyBtn.textContent=`✅ ¡Copiado!`,setTimeout(()=>{this.nodes.copyBtn.innerHTML=e},2200)}).catch(()=>{App.toast.show(`No se pudo copiar. Selecciona el texto manualmente.`,`error`)})},reset:function(){confirm(`¿Reiniciar el asistente? Se borrarán todas tus respuestas.`)&&(this.responses={},this.currentStep=0,this.renderStepsList(),this.renderCurrentStep(),this.updateReport(),this.updateProgressBar(),App.toast.show(`Examen reiniciado`,`info`))}}})),u,d=e((()=>{u={stats:{score:0,streak:0,correct:0,wrong:0,highScore:0},arcade:{lives:3,multiplier:1,timeLeft:100,timerInterval:null,maxTime:15,isGameOver:!1},currentMode:`mcq`,diffPhase:1,currentRound:null,init:function(){this.loadStats(),this.cacheDOM(),this.bindEvents(),this.renderStats(),this.initControlsToggle(),this.currentRound||this.nextRound()},initControlsToggle:function(){let e=document.getElementById(`game-config-toggle`),t=document.getElementById(`game-controls-body`),n=document.getElementById(`game-config-arrow`);!e||!t||(e._toggleBound||(e._toggleBound=!0,e.addEventListener(`click`,()=>{let e=t.classList.toggle(`collapsed`);n&&(n.textContent=e?`▶`:`▼`)})),window.innerWidth<=768&&(t.classList.add(`collapsed`),n&&(n.textContent=`▶`)))},cacheDOM:function(){this.nodes={score:document.getElementById(`score`),streak:document.getElementById(`streak`),correct:document.getElementById(`correct`),wrong:document.getElementById(`wrong`),modeMcq:document.getElementById(`modeMcq`),modeDiff:document.getElementById(`modeDiff`),domainSelect:document.getElementById(`domainSelect`),difficultySelect:document.getElementById(`difficultySelect`),prompt:document.getElementById(`prompt`),subprompt:document.getElementById(`subprompt`),options:document.getElementById(`options`),feedback:document.getElementById(`feedback`),hint:document.getElementById(`hint`),btnNext:document.getElementById(`btnNext`),btnReset:document.getElementById(`btnReset`),gameCard:document.getElementById(`gameCard`)}},bindEvents:function(){this._bound||(this._bound=!0,this.nodes.modeMcq.addEventListener(`click`,()=>this.setMode(`mcq`)),this.nodes.modeDiff.addEventListener(`click`,()=>this.setMode(`diff`)),this.nodes.btnNext.addEventListener(`click`,()=>this.nextRound()),this.nodes.btnReset.addEventListener(`click`,()=>this.resetStats()),this.populateDomains())},populateDomains:function(){let e=App.data.domains;this.nodes.domainSelect.innerHTML=`<option value="any">Todos los Dominios</option>`,e.forEach(e=>{let t=document.createElement(`option`);t.value=e.domain_id,t.textContent=e.label_es||e.domain_name,this.nodes.domainSelect.appendChild(t)})},setMode:function(e){this.currentMode=e,this.nodes.modeMcq.setAttribute(`aria-selected`,e===`mcq`),this.nodes.modeDiff.setAttribute(`aria-selected`,e===`diff`),this.nextRound()},loadStats:function(){let e=localStorage.getItem(`mse_game_stats`);e&&(this.stats=JSON.parse(e))},saveStats:function(){localStorage.setItem(`mse_game_stats`,JSON.stringify(this.stats)),this.renderStats()},resetStats:function(){this.stats={score:0,streak:0,correct:0,wrong:0},this.saveStats(),this.showFeedback(`Progreso reiniciado.`,`ok`)},renderStats:function(){if(!this.nodes)return;this.nodes.score&&(this.nodes.score.innerText=this.stats.score),this.nodes.streak&&(this.nodes.streak.innerText=this.stats.streak),this.nodes.correct&&(this.nodes.correct.innerText=this.stats.correct),this.nodes.wrong&&(this.nodes.wrong.innerText=this.stats.wrong);let e=document.getElementById(`game-lives`);e&&(e.innerText=`❤️`.repeat(Math.max(0,this.arcade.lives)));let t=document.getElementById(`game-multiplier`);t&&(t.innerText=`x${this.arcade.multiplier}`,this.arcade.multiplier>1?t.classList.add(`combo-pop`):t.classList.remove(`combo-pop`))},startTimer:function(){clearInterval(this.arcade.timerInterval),this.arcade.timeLeft=100;let e=document.getElementById(`game-timer-bar`),t=document.getElementById(`game-timer-container`);t&&t.classList.remove(`hidden`);let n=100/(this.arcade.maxTime*10);this.arcade.timerInterval=setInterval(()=>{this.arcade.timeLeft-=n,e&&(e.style.transform=`scaleX(${this.arcade.timeLeft/100})`),this.arcade.timeLeft<=0&&this.onTimeUp()},100)},stopTimer:function(){clearInterval(this.arcade.timerInterval);let e=document.getElementById(`game-timer-container`);e&&e.classList.add(`hidden`)},onTimeUp:function(){this.stopTimer(),this.loseLife(`¡Tiempo agotado!`)},loseLife:function(e){if(this.arcade.lives--,this.arcade.multiplier=1,`vibrate`in navigator)try{navigator.vibrate([60,30,60,30,60])}catch(e){console.warn(e)}this.playAudio(`error`),this.showFeedback(e||`Error.`,`bad`),this.nodes.gameCard.classList.add(`animate-shake`),setTimeout(()=>this.nodes.gameCard.classList.remove(`animate-shake`),500),this.renderStats(),this.arcade.lives<=0?this.gameOver():this.currentMode===`mcq`&&this.disableOptions()},gameOver:function(){this.arcade.isGameOver=!0,this.stopTimer(),this.nodes.prompt.textContent=``,this.nodes.prompt.insertAdjacentHTML(`beforeend`,`<span style="color:var(--v-accent); font-size: 2rem;">GAME OVER</span>`),this.nodes.subprompt.textContent=`Puntaje final: ${this.stats.score}`,this.nodes.options.textContent=``,this.nodes.options.insertAdjacentHTML(`beforeend`,`<button class="btn primary" onclick="App.game.restart()">Reiniciar Partida</button>`),this.playAudio(`gameover`)},restart:function(){this.arcade.lives=3,this.arcade.multiplier=1,this.arcade.isGameOver=!1,this.stats.score=0,this.stats.streak=0,this.saveStats(),this.nextRound()},playAudio:function(e){try{App._audioCtx||(App._audioCtx=new(window.AudioContext||window.webkitAudioContext));let t=App._audioCtx;t.state===`suspended`&&t.resume();let n=t.createOscillator(),r=t.createGain();n.connect(r),r.connect(t.destination),e===`correct`?(n.type=`sine`,n.frequency.setValueAtTime(440,t.currentTime),n.frequency.exponentialRampToValueAtTime(880,t.currentTime+.1),r.gain.setValueAtTime(.1,t.currentTime),r.gain.exponentialRampToValueAtTime(.01,t.currentTime+.2),n.start(),n.stop(t.currentTime+.2)):e===`error`?(n.type=`sawtooth`,n.frequency.setValueAtTime(220,t.currentTime),n.frequency.linearRampToValueAtTime(110,t.currentTime+.2),r.gain.setValueAtTime(.1,t.currentTime),r.gain.linearRampToValueAtTime(.01,t.currentTime+.3),n.start(),n.stop(t.currentTime+.3)):e===`gameover`&&(n.type=`square`,n.frequency.setValueAtTime(150,t.currentTime),n.frequency.linearRampToValueAtTime(50,t.currentTime+.5),r.gain.setValueAtTime(.1,t.currentTime),r.gain.linearRampToValueAtTime(.01,t.currentTime+.5),n.start(),n.stop(t.currentTime+.5))}catch(e){console.warn(`Audio Context failed`,e)}},nextRound:function(){this.clearFeedback(),this.nodes.options.textContent=``,this.nodes.hint.textContent=``;let e=document.getElementById(`game-manual-text`),t=this.nodes.domainSelect.value,n=this.nodes.difficultySelect.value;this.currentMode===`mcq`?(this.diffPhase=1,e&&(e.innerHTML=`<strong>Modo Definiciones:</strong> Identifica el término correcto basado en la descripción mostrada.`),this.currentRound=this.buildMcqRound(t,n),this.renderMcqRound(this.currentRound)):(this.diffPhase=1,e&&(e.innerHTML=`<strong>Fase 1 (Diagnóstico):</strong> Analiza el caso y selecciona el <strong>Síndrome Predominante</strong>.`),this.currentRound=this.buildDiffRound(t,n),this.renderDiffPhase1(this.currentRound)),this.arcade.isGameOver||this.startTimer()},toggleInstructions:function(){let e=document.getElementById(`game-instructions`);e&&e.classList.toggle(`hidden`)},buildMcqRound:function(e,t){let n=App.data.terms.filter(e=>e.definition_clinical&&e.definition_clinical.core);if(e!==`any`&&(n=n.filter(t=>t.domain_links&&t.domain_links.some(t=>t.domain_id===e))),n.length<4)return{error:`Insuficientes términos para esta selección.`};let r=this.sampleOne(n);if(!r)return{error:`No se pudo seleccionar un término.`};let i=n.filter(e=>e.term_id!==r.term_id),a=this.sampleMany(i,3);return{mode:`mcq`,target:r,options:this.shuffle([{id:r.term_id,text:r.definition_clinical?.core||``,correct:!0},...a.map(e=>({id:e.term_id,text:e.definition_clinical?.core||``,correct:!1}))])}},renderMcqRound:function(e){if(e.error){this.nodes.prompt.textContent=`Error`,this.nodes.subprompt.textContent=e.error;return}this.nodes.prompt.textContent=`¿Cuál define mejor: "${e.target.canonical_name}"?`,this.nodes.subprompt.textContent=`${e.target.term_kind} · ${App.getDomainSlug(e.target.domain_links?.[0]?.domain_id||``)}`,this.renderOptions(e.options,t=>this.gradeMcq(t.correct,e.target))},gradeMcq:function(e,t){if(this.stopTimer(),e){let e=Math.floor(this.arcade.timeLeft/10),n=this.stats.score;if(this.stats.score+=(10+e)*this.arcade.multiplier,this.stats.streak+=1,this.stats.streak%3==0&&this.arcade.multiplier++,`vibrate`in navigator)try{navigator.vibrate([10,30,10])}catch(e){console.warn(e)}this.playAudio(`correct`),this.showFeedback(`¡Correcto! +${10+e}${this.arcade.multiplier>1?` x`+this.arcade.multiplier:``}`,`ok`),t.teaching_notes&&(this.nodes.hint.textContent=`Nota: ${t.teaching_notes[0]}`),this.nodes.gameCard.classList.add(`animate-pulse`),setTimeout(()=>this.nodes.gameCard.classList.remove(`animate-pulse`),400),this._flashOptions(!0),this._animateScore(n,this.stats.score),this.disableOptions()}else{if(`vibrate`in navigator)try{navigator.vibrate([40,20,40])}catch(e){console.warn(e)}this._flashOptions(!1),this.loseLife(`Incorrecto.`)}this.saveStats()},_flashOptions:function(e){let t=e?`correct-flash`:`wrong-flash`;this.nodes.options.querySelectorAll(`button`).forEach(e=>{e.classList.add(t),setTimeout(()=>e.classList.remove(t),600)})},_animateScore:function(e,t){let n=this.nodes.score;if(!n||e===t)return;let r=performance.now(),i=a=>{let o=Math.min((a-r)/450,1),s=1-(1-o)**3;n.textContent=Math.round(e+(t-e)*s),o<1?requestAnimationFrame(i):(n.textContent=t,n.classList.add(`score-pop`),setTimeout(()=>n.classList.remove(`score-pop`),450))};requestAnimationFrame(i)},buildDiffRound:function(e,t){let n=App.data.cases;if(e!==`any`&&(n=n.filter(t=>t.domains&&t.domains[e])),t!==`any`&&(n=n.filter(e=>String(e.level)===String(t))),n.length===0)return{error:`No hay casos con estos filtros.`};let r=this.sampleOne(n);if(!r)return{error:`No se pudo seleccionar un caso.`};let i=r.expected_engine_output?.primary_syndrome;if(!i)return{error:`Caso incompleto: falta síndrome primario.`};let a=App.data.cases.filter(e=>e.case_id!==r.case_id),o=this.sampleMany(a,3).map(e=>e.expected_engine_output?.primary_syndrome).filter(Boolean),s=[...new Set([i,...o])],c=this.shuffle(s.map(e=>({id:e,text:e.replace(/_/g,` `),correct:e===i}))),l=r.assessment_keys?.key_discriminators||[],u=r.assessment_keys?.errors_to_avoid||[];return l.length===0||u.length===0?{error:`Datos incompletos para este caso.`}:{mode:`diff`,case:r,termOptions:c,discOptions:this.shuffle([{text:this.sampleOne(l),correct:!0,why:`Criterio discriminante clave.`},{text:this.sampleOne(u),correct:!1,why:`Error común a evitar.`}])}},renderDiffPhase1:function(e){if(e.error){this.nodes.prompt.textContent=`Error`,this.nodes.subprompt.textContent=e.error;return}this.nodes.prompt.textContent=`Paso 1: Identifica el Síndrome / Diagnóstico`;let t=e.case?.stem?.contextual_notes||`Caso clínico sin descripción`;this.nodes.subprompt.textContent=`"${t}"`,this.renderOptions(e.termOptions,t=>{t.correct?(this.playAudio(`correct`),this.showFeedback(`Correcto. Ahora valida el criterio clave.`,`ok`),this.disableOptions(),setTimeout(()=>{this.clearFeedback(),this.renderDiffPhase2(e)},500)):this.loseLife(`Diagnóstico incorrecto.`)})},renderDiffPhase2:function(e){this.nodes.prompt.textContent=`Paso 2: Selecciona el criterio discriminante válido`,this.nodes.options.textContent=``,this.startTimer(),this.renderOptions(e.discOptions,e=>{if(this.stopTimer(),e.correct){let t=this.stats.score,n=Math.floor(this.arcade.timeLeft/10);if(this.stats.score+=(20+n)*this.arcade.multiplier,this.stats.streak+=1,this.stats.streak%3==0&&this.arcade.multiplier++,`vibrate`in navigator)try{navigator.vibrate([10,30,10])}catch(e){console.warn(e)}this.playAudio(`correct`),this.showFeedback(`¡Excelente! Caso resuelto.`,`ok`),this.nodes.hint.textContent=`Clave: ${e.text}`,this.nodes.gameCard.classList.add(`animate-pulse`),setTimeout(()=>this.nodes.gameCard.classList.remove(`animate-pulse`),400),this._flashOptions(!0),this._animateScore(t,this.stats.score),this.disableOptions()}else{if(`vibrate`in navigator)try{navigator.vibrate([60,30,60])}catch(e){console.warn(e)}this._flashOptions(!1),this.loseLife(`Criterio incorrecto.`)}this.saveStats()})},renderOptions:function(e,t){this.nodes.options.textContent=``,e.forEach(e=>{let n=document.createElement(`button`);n.className=`opt`,n.textContent=e.text,n.onclick=()=>t(e),this.nodes.options.appendChild(n)})},disableOptions:function(){this.nodes.options.querySelectorAll(`button`).forEach(e=>e.disabled=!0)},showFeedback:function(e,t){this.nodes.feedback.textContent=e,this.nodes.feedback.className=`feedback ${t}`},clearFeedback:function(){this.nodes.feedback.textContent=``,this.nodes.feedback.className=`feedback`},sampleOne:function(e){return!e||e.length===0?null:e[Math.floor(Math.random()*e.length)]},sampleMany:function(e,t){if(!e||e.length===0)return[];let n=[...e];for(let e=n.length-1;e>0;e--){let t=Math.floor(Math.random()*(e+1));[n[e],n[t]]=[n[t],n[e]]}return n.slice(0,t)},shuffle:function(e){if(!e)return[];let t=[...e];for(let e=t.length-1;e>0;e--){let n=Math.floor(Math.random()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}}})),f,p=e((()=>{f={SHOW_AFTER:5,SNOOZE_FOR:20,getCount:function(){return parseInt(localStorage.getItem(`mse-usage-count`)||`0`,10)},setCount:function(e){localStorage.setItem(`mse-usage-count`,String(e))},getDismissedAt:function(){let e=localStorage.getItem(`mse-donation-dismissed-at`);return e===null?null:parseInt(e,10)},shouldShow:function(e){if(e<this.SHOW_AFTER)return!1;let t=this.getDismissedAt();return t===null||e>=t+this.SNOOZE_FOR},show:function(){let e=document.getElementById(`donation-widget`);e&&e.classList.remove(`hidden`)},dismiss:function(){let e=document.getElementById(`donation-widget`);e&&e.classList.add(`hidden`),localStorage.setItem(`mse-donation-dismissed-at`,String(this.getCount()))},increment:function(){let e=this.getCount()+1;this.setCount(e),this.shouldShow(e)&&this.show()},init:function(){let e=document.getElementById(`donation-close`);e&&e.addEventListener(`click`,()=>this.dismiss()),this.shouldShow(this.getCount())&&this.show()}}})),m,h=e((()=>{m={deferredPrompt:null,init:function(){window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),this.deferredPrompt=e;let t=document.getElementById(`pwa-install-banner`);t&&t.classList.remove(`hidden`)}),window.addEventListener(`appinstalled`,()=>{this.deferredPrompt=null;let e=document.getElementById(`pwa-install-banner`);e&&e.classList.add(`hidden`)});let e=document.getElementById(`pwa-install-btn`);e&&e.addEventListener(`click`,async()=>{if(!this.deferredPrompt)return;this.deferredPrompt.prompt();let{outcome:e}=await this.deferredPrompt.userChoice;this.deferredPrompt=null;let t=document.getElementById(`pwa-install-banner`);t&&t.classList.add(`hidden`)});let t=document.getElementById(`pwa-install-dismiss`);t&&t.addEventListener(`click`,()=>{let e=document.getElementById(`pwa-install-banner`);e&&e.classList.add(`hidden`)})}}})),g,_=e((()=>{g={init:async function(){this.cacheDOM(),this.registerSW(),this._showSkeletonTerms(),this.bindEvents(),await this.loadData(),this.setupSearch(),this.loadRecentSearches(),this.renderAllTerms(),this.renderTermOfTheDay(),this.theme.init(),this.donation.init(),this.pwa.init(),this.handleInitialHash(),this.checkOnboarding(),this.navIndicator.init(),this._setupScrollCompact(),setTimeout(()=>this.navIndicator.update(),50)},_showSkeletonTerms:function(){if(!this.nodes.allTermsList)return;let e=Array.from({length:8},()=>`
            <div class="skeleton-card">
                <div class="skeleton-block skeleton-title"></div>
                <div class="skeleton-block skeleton-text"></div>
                <div class="skeleton-block skeleton-text-sm"></div>
            </div>`).join(``);this.nodes.allTermsList.innerHTML=e},_setupScrollCompact:function(){let e=document.querySelector(`.app-header`),t=document.querySelector(`main`);if(!e||!t)return;let n=0;t.addEventListener(`scroll`,()=>{let r=t.scrollTop;r>60&&r>n?e.classList.add(`compact`):(r<n||r<20)&&e.classList.remove(`compact`),n=r},{passive:!0})},checkOnboarding:function(){try{localStorage.getItem(`mse_onboarded_v2.2`)||setTimeout(()=>{App.toast.show(`📤 Nuevo: comparte términos como tarjetas clínicas. Pulsa el botón compartir en cualquier ficha.`,`info`,5e3);try{localStorage.setItem(`mse_onboarded_v2.2`,`true`)}catch(e){console.warn(e)}},1800)}catch(e){console.warn(e)}},speakTerm:function(e){let t=this.data.terms.find(t=>t.term_id===e);if(!t)return;let n=`${t.canonical_name}. ${t.definition_clinical?.core||``}`;this.utils.speakTerm(n),this.utils.haptic()},handleInitialHash:function(){let e=window.location.hash;if(e){if(e.startsWith(`#term/`)){let t=e.replace(`#term/`,``);this.viewTerm(t)}else if(e.startsWith(`#domain/`)){let t=e.replace(`#domain/`,``);this.renderView(`domain`),this.renderDomains(),this.viewDomainDetails(t)}else if(e.length>1){let t=`nav-${e.substring(1)}`;this.switchTab(t)}}},registerSW:function(){if(!(`serviceWorker`in navigator))return;let e=!!navigator.serviceWorker.controller,t=!1;navigator.serviceWorker.addEventListener(`controllerchange`,()=>{t||!e||(t=!0,window.location.reload())});let n=e=>{e&&e.addEventListener(`statechange`,()=>{e.state===`installed`&&navigator.serviceWorker.controller&&e.postMessage({type:`SKIP_WAITING`})})};navigator.serviceWorker.register(`sw.js`).then(e=>{let t=()=>e.update().catch(()=>{});t(),setInterval(t,1e3*60*60),window.addEventListener(`focus`,t),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&t()}),e.waiting&&navigator.serviceWorker.controller&&e.waiting.postMessage({type:`SKIP_WAITING`}),e.addEventListener(`updatefound`,()=>n(e.installing))}).catch(e=>console.error(`Service Worker registration failed:`,e))},cacheDOM:function(){this.nodes={search:document.getElementById(`global-search`),content:document.getElementById(`app-content`),dictionaryView:document.getElementById(`dictionary-view`),resultsView:document.getElementById(`results-view`),termView:document.getElementById(`term-view`),domainView:document.getElementById(`domain-view`),casesView:document.getElementById(`cases-view`),integratorView:document.getElementById(`integrator-view`),aboutView:document.getElementById(`about-view`),allTermsList:document.getElementById(`all-terms-list`),recentSearchesBar:document.getElementById(`recent-searches`),recentList:document.getElementById(`recent-list`),navButtons:document.querySelectorAll(`.bottom-nav button`),aboutBtn:document.getElementById(`about-btn`),themeToggle:document.getElementById(`theme-toggle`),gameView:document.getElementById(`game-view`),clearSearchBtn:document.getElementById(`clear-search`),termOfTheDay:document.getElementById(`term-of-the-day`)}},bindEvents:function(){this.nodes.search.addEventListener(`input`,e=>{clearTimeout(this.data.searchDebounceTimer),this.data.searchDebounceTimer=setTimeout(()=>{this.handleSearch(e.target.value)},180)}),this.nodes.navButtons.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.id;this.switchTab(t),history.pushState({view:t},``,`#${t.replace(`nav-`,``)}`)})}),this.nodes.aboutBtn.addEventListener(`click`,()=>{this.viewAbout(),history.pushState({view:`about`},``,`#about`)}),this.nodes.themeToggle.addEventListener(`click`,()=>this.theme.toggle()),this.nodes.clearSearchBtn&&this.nodes.clearSearchBtn.addEventListener(`click`,()=>{this.nodes.search.value=``,this.nodes.clearSearchBtn.classList.add(`hidden`),this.handleSearch(``),this.nodes.search.focus()}),window.addEventListener(`popstate`,e=>this.handlePopState(e.state)),document.addEventListener(`keydown`,e=>{e.key===`/`&&document.activeElement.tagName!==`INPUT`&&document.activeElement.tagName!==`TEXTAREA`&&(e.preventDefault(),this.nodes.search.focus(),this.nodes.search.select())}),document.addEventListener(`pointerdown`,e=>{let t=e.target.closest(`.btn.primary, .btn.secondary`);if(!t)return;let n=t.getBoundingClientRect(),r=Math.max(n.width,n.height)*1.6,i=document.createElement(`span`);i.className=`ripple-wave`,i.style.cssText=`width:${r}px;height:${r}px;left:${e.clientX-n.left-r/2}px;top:${e.clientY-n.top-r/2}px`,t.appendChild(i),i.addEventListener(`animationend`,()=>i.remove(),{once:!0})})},handlePopState:function(e){if(!e){this.switchTab(`nav-dictionary`);return}e.view===`term`&&e.termId?this.viewTerm(e.termId,!0):e.view===`domain`&&e.domainId?(document.getElementById(`domain-detail-container`)||(this.renderView(`domain`),this.renderDomains()),this.viewDomainDetails(e.domainId,!0)):e.view.startsWith(`nav-`)?this.switchTab(e.view):e.view===`about`?this.viewAbout():this.switchTab(`nav-dictionary`)},loadData:async function(){let e=performance.now();try{let t=fetch(`lexicon/lexicon_bundle.json`).then(e=>e.json()),n=Array.from({length:15},(e,t)=>`DOM-${(t+1).toString().padStart(2,`0`)}`).map(async e=>{let t=this.getDomainSlug(e);try{let n=await fetch(`domains/${e}_${t}.json`);if(!n.ok)throw Error(`Domain ${e} not found`);return await n.json()}catch{return{domain_id:e,domain_name:e.replace(`-`,` `),subcomponents:[]}}}),r=[`OSCE_001–003.json`,`OSCE_004–OSCE_009.json`,`OSCE_010–OSCE_015.json`,`OSCE_016–025.json`,`OSCE_026–035.json`].map(e=>fetch(e).then(e=>e.json()).catch(()=>[])),[i,a,o]=await Promise.all([t,Promise.all(n),Promise.all(r)]);this.data.terms=i.terms||[],this.data.domains=a,this.data.cases=(o||[]).flat(),this.data.terms.sort((e,t)=>(e.canonical_name||``).localeCompare(t.canonical_name||``)),console.log(`🚀 Clinical Data Loaded in ${Math.round(performance.now()-e)}ms`)}catch(e){console.error(`Critical error loading clinical data:`,e),this.data.terms=this.data.terms||[],this.data.domains=this.data.domains||[],this.data.cases=this.data.cases||[],this.nodes.allTermsList&&(this.nodes.allTermsList.innerHTML=`
                    <div style="padding:2rem; text-align:center; opacity:0.7;">
                        <p style="font-size:1.1rem; margin-bottom:1rem;">Sin conexión</p>
                        <p style="font-size:0.9rem;">No se pudo cargar el diccionario. Verifica tu conexión e intenta de nuevo.</p>
                        <button class="btn secondary" style="margin-top:1rem;" onclick="window.location.reload()">Reintentar</button>
                    </div>`)}},getDomainSlug:function(e){return{"DOM-01":`conciencia_orientacion`,"DOM-02":`apariencia_general`,"DOM-03":`actitud_interaccion`,"DOM-04":`psicomotricidad_conacion`,"DOM-05":`habla_lenguaje`,"DOM-06":`pensamiento_curso_forma`,"DOM-07":`pensamiento_contenido`,"DOM-08":`sensopercepcion`,"DOM-09":`estado_afectivo_animo_afecto`,"DOM-10":`funciones_cognitivas`,"DOM-11":`juicio_insight`,"DOM-12":`riesgo`,"DOM-13":`integracion_sindromatica`,"DOM-14":`docencia`,"DOM-15":`fenomenologia_historica`}[e]||``},getDomainIcon:function(e){return{"DOM-01":`🧠`,"DOM-02":`👤`,"DOM-03":`🤝`,"DOM-04":`🏃`,"DOM-05":`🗣️`,"DOM-06":`🔄`,"DOM-07":`💡`,"DOM-08":`👁️`,"DOM-09":`🎭`,"DOM-10":`🧩`,"DOM-11":`⚖️`,"DOM-12":`⚠️`,"DOM-13":`🏥`,"DOM-14":`🎓`,"DOM-15":`📜`}[e]||`🔹`},setupSearch:function(){window.Fuse&&(this.data.fuse=new Fuse(this.data.terms,{keys:[{name:`canonical_name`,weight:1},{name:`synonyms_and_slang.term`,weight:.7},{name:`definition_clinical.core`,weight:.4}],threshold:.4,distance:100,location:0,minMatchCharLength:2,findAllMatches:!0,useExtendedSearch:!0,ignoreLocation:!1}))},handleSearch:function(e){let t=e.trim();if(this.nodes.clearSearchBtn&&this.nodes.clearSearchBtn.classList.toggle(`hidden`,t.length===0),t.length<2){this.renderAllTerms(),this.renderView(`dictionary`);return}let n=this.data.fuse?this.data.fuse.search(t):this.fallbackSearch(t);this.renderResults(n)},normalizeText:function(e){return String(e||``).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).toLowerCase()},fallbackSearch:function(e){let t=this.normalizeText(e);return this.data.terms.filter(e=>[e.canonical_name,...(e.synonyms_and_slang||[]).map(e=>e&&e.term||e),e.definition_clinical?.core].map(e=>this.normalizeText(e)).join(` `).includes(t)).slice(0,50).map(e=>({item:e}))},renderAllTerms:function(){!this.nodes.allTermsList||!this.data.terms||(this.nodes.allTermsList.textContent=``,this.data.terms.filter(e=>e&&e.canonical_name).sort((e,t)=>(e.canonical_name||``).localeCompare(t.canonical_name||``)).forEach(e=>{let t=this.renderTermCard(e);this.nodes.allTermsList.appendChild(t)}))},renderTermCard:function(e){let t=document.createElement(`div`);return t.className=`term-card-simple`,t.onclick=()=>this.viewTerm(e.term_id),t.innerHTML=`
            <div class="term-name">${this.utils.sanitizeHTML(e.canonical_name)}</div>
            <div class="term-snippet">${this.utils.sanitizeHTML(e.definition_clinical?.core?.substring(0,60)||``)}...</div>
        `,t},renderResults:function(e){if(e.length===0){let e=[`¿Sabías que la 'Saliencia aberrante' es el mecanismo neurocognitivo central detrás de la formación de delirios?`,`La fenomenología (EASE) sugiere que los trastornos de la ipseidad suelen preceder a los síntomas psicóticos positivos.`,`En el examen mental, las 'acoasmas' se refieren a alucinaciones auditivas elementales como chasquidos o zumbidos.`,`El concepto de 'Insight' en psiquiatría es multidimensional e incluye la conciencia de enfermedad y la adherencia al tratamiento.`,`La 'prosopagnosia' es la incapacidad de reconocer rostros conocidos, a menudo por lesiones en el área fusiforme.`],t=e[Math.floor(Math.random()*e.length)];this.nodes.resultsView.innerHTML=`
                <div class="card animate-pop" style="text-align: center; padding: 2.5rem 1.5rem; border-color: var(--bau-yellow);">
                    <div style="font-size: 3.5rem; margin-bottom: 1rem;">🕳️</div>
                    <h3 style="margin: 0; color: var(--bau-black); font-family: 'Outfit', sans-serif; font-weight: 800;">¿PERDIDO EN EL PSIQUISMO?</h3>
                    <p style="font-size: 0.95rem; margin-top: 0.75rem; color: var(--text-p);">No encontramos el término exacto, pero no te vayas sin aprender algo:</p>
                    
                    <div style="margin-top: 1.5rem; padding: 1.25rem; background: var(--bau-yellow); border: 3px solid var(--bau-black); box-shadow: 4px 4px 0px var(--bau-black); border-radius: 12px; text-align: left;">
                        <span style="font-weight: 900; font-size: 0.7rem; text-transform: uppercase; color: var(--bau-red); display: block; margin-bottom: 0.5rem;">💡 Sabías que...</span>
                        <p style="margin: 0; font-size: 0.9rem; line-height: 1.5; color: var(--bau-black); font-weight: 600;">${t}</p>
                    </div>

                    <button class="btn" style="margin-top: 1.5rem; width: 100%;" onclick="App.viewTerm(App.data.terms[Math.floor(Math.random()*App.data.terms.length)].term_id)">
                        🎲 Explorar término aleatorio
                    </button>
                    <p style="font-size: 0.8rem; margin-top: 1rem; opacity: 0.6;" onclick="App.switchTab('nav-dictionary')">O vuelve al <span style="text-decoration: underline; cursor: pointer;">índice general</span></p>
                </div>
            `;return}else this.nodes.resultsView.innerHTML=`
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding: 0 0.5rem;">
                    <span class="section-label" style="margin:0;">Resultados (${e.length})</span>
                </div>
                ${e.map(e=>`
                    <div class="card" onclick="App.viewTerm('${e.item.term_id}')" style="cursor: pointer; padding: 1.25rem;">
                        <div style="display:flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                            <strong style="color: var(--primary); font-size: 1.1rem; letter-spacing: -0.02em;">
                                ${this.utils.sanitizeHTML(e.item.canonical_name)}
                            </strong>
                            <div class="badge ${e.item.risk_weight>1?`badge-risk-critical`:``}" style="font-size: 0.65rem; border: 1px solid var(--border-subtle);">
                                ${this.utils.sanitizeHTML(e.item.term_kind)}
                            </div>
                        </div>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                            ${this.utils.sanitizeHTML(e.item.definition_clinical?.core||`Sin definición disponible.`)}
                        </p>
                    </div>
                `).join(``)}
            `;this.renderView(`results`)},renderTermOfTheDay:function(){if(!this.nodes.termOfTheDay||!this.data.terms||this.data.terms.length===0)return;let e=this.data.terms.filter(e=>e&&e.definition_clinical&&e.definition_clinical.core);if(e.length===0)return;let t=new Date,n=t.getFullYear(),r=Math.floor((t-new Date(n,0,1))/864e5),i=n*2654435769>>>0,a=()=>{i=i+1831565813>>>0;let e=Math.imul(i^i>>>15,1|i);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296},o=e.map((e,t)=>t);for(let e=o.length-1;e>0;e--){let t=Math.floor(a()*(e+1));[o[e],o[t]]=[o[t],o[e]]}let s=e[o[r%e.length]],c=s.definition_clinical.subjective_marker||s.definition_clinical.behavioral_marker||(s.teaching_notes?s.teaching_notes[0]:null),l=c?`
            <div style="background: rgba(var(--v-on-primary-container-rgb, 0,0,0), 0.08); padding: 1rem; border-left: 6px solid var(--bau-blue); margin-bottom: 1.25rem; border-radius: 4px; border-top-right-radius: 12px; border-bottom-right-radius: 12px;">
                <strong style="display:block; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 0.3rem; color: inherit; opacity: 0.7;">💡 Perla Clínica:</strong>
                <span style="font-size: 0.9rem; font-style: italic; color: inherit; line-height: 1.4; display: block;">${this.utils.sanitizeHTML(c)}</span>
            </div>
        `:``,u=s.definition_clinical.core||``,d=u.length>160?u.substring(0,160).trim()+`...`:u;this.nodes.termOfTheDay.innerHTML=`
            <div class="totd-card" onclick="App.viewTerm('${s.term_id}')">
                <div class="totd-ribbon">Término del Día</div>
                <div class="totd-content">
                    <h3 class="totd-title" style="color: inherit;">${this.utils.sanitizeHTML(s.canonical_name)}</h3>
                    <div class="badge ${s.risk_weight>1?`badge-risk-critical`:``}" style="display:inline-block; margin-bottom: 0.75rem; font-size: 0.7rem; background: var(--bau-magenta); color: white; border: none;">
                        ${this.utils.sanitizeHTML(s.term_kind)}
                    </div>
                    <p class="totd-snippet" style="color: inherit;">
                        ${this.utils.sanitizeHTML(d)}
                    </p>
                    ${l}
                    <div style="display:flex; gap:1rem; align-items: center; justify-content: space-between;">
                        <div class="totd-action" style="color: inherit;">Explorar Ficha Completa →</div>
                        <button class="share-pill" onclick="event.stopPropagation(); App.shareTerm('${s.term_id}')">
                            <span>📤</span> COMPARTIR
                        </button>
                    </div>
                </div>
            </div>
        `,this.nodes.termOfTheDay.classList.remove(`hidden`)},shareTerm:async function(e){let t=this.data.terms.find(t=>t.term_id===e);if(t){this.utils.haptic(),console.log(`Generating card for ${t.canonical_name}...`);try{let n=await this.utils.generateShareCard(t),r=new File([n],`MSE_${t.canonical_name}.png`,{type:`image/png`});if(navigator.share)await navigator.share({title:`Diccionario MSE: ${t.canonical_name}`,text:`Definición de ${t.canonical_name}: ${t.definition_clinical?.core}`,url:this.utils.getTermUrl(e),files:[r]});else{let e=URL.createObjectURL(n),r=document.createElement(`a`);r.href=e,r.download=`MSE_${t.canonical_name}.png`,r.click(),URL.revokeObjectURL(e),App.toast.show(`🖼️ Tarjeta descargada en tu dispositivo`,`success`)}}catch(n){console.error(`Error sharing:`,n),navigator.share?navigator.share({title:`Diccionario MSE: ${t.canonical_name}`,text:`${t.canonical_name}: ${t.definition_clinical?.core}`,url:this.utils.getTermUrl(e)}).catch(()=>{}):App.toast.show(`No se pudo compartir. Copia el enlace manualmente.`,`warning`)}}},viewTerm:function(e,t=!1){try{let n=this.data.terms.find(t=>t.term_id===e);if(!n)return;this.utils.haptic(),t||history.pushState({view:`term`,termId:e},``,`#term/${e}`),this.addToRecent(n);let r=n.teaching_notes||[],i=n.alerts||[],a=n.examples||[],o=new Set(this.data.domains.map(e=>e.domain_id)),s=(n.domain_links||[]).filter(e=>o.has(e.domain_id));this.nodes.termView.innerHTML=`
            <div class="view-actions-header" style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div class="btn-back" onclick="App.closeTerm()" style="margin:0;">← Volver</div>
                <div style="display:flex; gap:0.5rem;">
                    <button class="btn-icon" onclick="App.speakTerm('${n.term_id}')" title="Leer definición">🔊 Leer</button>
                    <button class="btn-icon" onclick="App.shareTerm('${n.term_id}')" title="Compartir">📤</button>
                </div>
            </div>
            <div class="card">
                <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div class="badge badge-risk-${n.risk_weight>1?`critical`:`alert`}">${this.utils.sanitizeHTML(n.term_kind||`término`)}</div>
                    ${n.status===`active`?`✅`:``}
                </div>
                <h2 class="term-title">${this.utils.sanitizeHTML(n.canonical_name)}</h2>
                
                ${n.risk_weight>1?`
                    <div class="alert-critical-banner">
                        <div class="alert-critical-header">
                            <span>⚠️</span> ALERTA DE RIESGO CLÍNICO
                        </div>
                        <p style="font-weight: 700; margin: 0; font-size: 0.95rem; color: #742a2a;">
                            ${i.length>0?this.utils.sanitizeHTML(i[0].message):`Este término implica un riesgo de seguridad o manejo crítico.`}
                        </p>
                    </div>
                `:``}

                <div class="definition-section">
                    <span class="section-label">Definición Clínica</span>
                    <p>${this.utils.sanitizeHTML(n.definition_clinical?.core||`Sin definición disponible.`)}</p>
                </div>

                ${n.definition_clinical?.subjective_marker?`
                    <div class="definition-section">
                        <span class="section-label">Marcador Subjetivo</span>
                        <p><em>"${this.utils.sanitizeHTML(n.definition_clinical.subjective_marker)}"</em></p>
                    </div>
                `:``}

                <div class="definition-section">
                    <span class="section-label">Dominios Asociados</span>
                    <div class="tag-container" style="margin-top: 0.5rem;">
                        ${s.length>0?s.map(e=>{let t=this.data.domains.find(t=>t.domain_id===e.domain_id)?.label_es||this.getDomainSlug(e.domain_id).replace(/_/g,` `);return`
                                <span class="tag" onclick="event.stopPropagation(); App.viewDomainDetails('${e.domain_id}')">
                                    ${this.getDomainIcon(e.domain_id)} ${this.utils.sanitizeHTML(t)}
                                </span>`}).join(``):`<span style="font-size: 0.8rem; opacity: 0.5;">No categorizado</span>`}
                    </div>
                </div>

                ${r.length>0?`
                <div class="definition-section">
                    <span class="section-label">Docencia & Perlas</span>
                    <ul style="padding-left: 1.25rem; font-size: 0.95rem;">
                        ${r.map(e=>`<li style="margin-bottom: 0.5rem;">${this.utils.sanitizeHTML(e)}</li>`).join(``)}
                    </ul>
                </div>
                `:``}

                ${a.length>0?`
                    <div class="definition-section">
                        <span class="section-label">Ejemplos Clínicos</span>
                        <div class="examples-container">
                            ${a.map(e=>`
                                <div class="example-item ${e.type}">
                                    <div class="example-type-badge">${e.type===`patient_quote`?`💬 Paciente`:`👁️ Observación`}</div>
                                    <p>${e.type===`patient_quote`?`<em>"${this.utils.sanitizeHTML(e.text)}"</em>`:this.utils.sanitizeHTML(e.text)}</p>
                                </div>
                            `).join(``)}
                        </div>
                    </div>
                `:``}

                <div class="support-nudge" style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px dashed var(--border-subtle); text-align: center;">
                    <p style="font-size: 0.8rem; opacity: 0.6; margin-bottom: 0.75rem;">¿Te fue útil esta definición? Apoya el proyecto independiente.</p>
                    <button class="btn secondary" style="font-size: 0.75rem; padding: 0.5rem 1rem;" onclick="window.open('https://buymeacoffee.com/herramente', '_blank')">☕ Invitame un café</button>
                </div>
            </div>
            `,this.renderView(`term`),this.nodes.content.scrollTop=0,this.donation.increment()}catch(e){console.error(`Error rendering term view:`,e),alert(`Error al cargar la ficha. El archivo podría estar incompleto.`)}},loadRecentSearches:function(){try{let e=localStorage.getItem(`recentSearches`);e&&(this.data.recentSearches=JSON.parse(e),this.renderRecentSearches())}catch{this.data.recentSearches=[]}},addToRecent:function(e){this.data.recentSearches=[e.term_id,...this.data.recentSearches.filter(t=>t!==e.term_id)].slice(0,5),localStorage.setItem(`recentSearches`,JSON.stringify(this.data.recentSearches)),this.renderRecentSearches()},renderRecentSearches:function(){if(this.data.recentSearches.length===0){this.nodes.recentSearchesBar.classList.add(`hidden`);return}this.nodes.recentSearchesBar.classList.remove(`hidden`),this.nodes.recentList.innerHTML=this.data.recentSearches.map(e=>{let t=this.data.terms.find(t=>t.term_id===e);return t?`<span class="recent-search-tag" onclick="App.viewTerm('${t.term_id}')">${this.utils.sanitizeHTML(t.canonical_name)}</span>`:``}).join(``)},viewAbout:function(){this.nodes.aboutView.innerHTML=`
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
        `,this.renderView(`about`),this.nodes.navButtons.forEach(e=>e.classList.remove(`active`)),this.setupChromaGrid()},setupChromaGrid:function(){let e=document.getElementById(`about-chroma-grid`);if(!e||typeof gsap>`u`)return;gsap.killTweensOf(this.data.chromaPos);let t=gsap.quickSetter(e,`--x`,`px`),n=gsap.quickSetter(e,`--y`,`px`);e.addEventListener(`pointermove`,r=>{let i=e.getBoundingClientRect(),a=r.clientX-i.left,o=r.clientY-i.top;gsap.to(this.data.chromaPos,{x:a,y:o,duration:.45,ease:`power3.out`,onUpdate:()=>{t(this.data.chromaPos.x),n(this.data.chromaPos.y)},overwrite:!0})}),e.querySelectorAll(`.chroma-card`).forEach(e=>{e.addEventListener(`mousemove`,t=>{let n=e.getBoundingClientRect(),r=t.clientX-n.left,i=t.clientY-n.top;e.style.setProperty(`--mouse-x`,`${r}px`),e.style.setProperty(`--mouse-y`,`${i}px`)})})},closeTerm:function(){this.nodes.search.value.length>=2?this.renderView(`results`):history.back()},renderDomains:function(){this.nodes.domainView.innerHTML=`
            <div id="domain-grid-container">
                <div class="clinical-box" style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(var(--primary-rgb), 0.05); border-radius: 12px;">
                    <h3 style="margin-top:0; font-size: 1.2rem; color: var(--primary);">Explorador de Dominios</h3>
                    <p style="font-size: 0.85rem; opacity: 0.8; margin: 0;">Seleccione un dominio para ver su estructura clínica y términos asociados.</p>
                </div>
                <div class="domain-grid">
                    ${this.data.domains.map(e=>`
                        <div class="domain-card" onclick="App.viewDomainDetails('${e.domain_id}')">
                            <div class="domain-icon">${this.getDomainIcon(e.domain_id)}</div>
                            <span class="domain-title">${this.utils.sanitizeHTML(e.label_es||e.domain_name||e.domain_id)}</span>
                            <div class="domain-subtitle" style="font-size: 0.6rem; opacity: 0.6; text-transform: none;">
                                ${e.subcomponents?e.subcomponents.length+` áreas`:`Detalles`}
                            </div>
                        </div>
                    `).join(``)}
                </div>
            </div>
            <div id="domain-detail-container" class="hidden"></div>
        `},viewDomainDetails:function(e,t=!1){let n=this.data.domains.find(t=>t.domain_id===e);if(!n)return;t||history.pushState({view:`domain`,domainId:e},``,`#domain/${e}`);let r=this.data.terms.filter(t=>t.domain_links&&t.domain_links.some(t=>t.domain_id===e)),i=document.getElementById(`domain-detail-container`);document.getElementById(`domain-grid-container`).classList.add(`hidden`),i.classList.remove(`hidden`),this.donation.increment(),document.title=`Dominio: ${n.label_es||n.domain_name} | Diccionario MSE`,i.innerHTML=`
            <div class="btn-back" onclick="App.closeDomainDetails()">← Volver a Dominios</div>
            
            <div class="domain-detail-header">
                <h2 class="domain-detail-title">
                    <span>${this.getDomainIcon(n.domain_id)}</span>
                    ${this.utils.sanitizeHTML(n.label_es||n.domain_name)}
                </h2>
                <p style="margin-top: 1rem; opacity: 0.9; line-height: 1.5;">${this.utils.sanitizeHTML(n.definition_es||`Sin definición disponible.`)}</p>
            </div>

            <div class="section-container">
                <h3 class="section-label" style="font-size: 1rem;">Subcomponentes y Términos Aceptados</h3>
                ${n.subcomponents?n.subcomponents.map(e=>`
                    <div class="subcomponent-item">
                        <span class="subcomponent-label">${this.utils.sanitizeHTML(e.label_es)}</span>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${this.utils.sanitizeHTML(e.notes||``)}</p>
                        <div class="tag-container">
                            ${e.accepted_terms?e.accepted_terms.map(e=>`<span class="tag">${this.utils.sanitizeHTML(e)}</span>`).join(``):``}
                        </div>
                    </div>
                `).join(``):`<p>No hay subcomponentes definidos.</p>`}
            </div>

            ${n.clinical_notes?`
                <div class="section-container" style="margin-top: 1.5rem;">
                    <h3 class="section-label" style="font-size: 1rem;">Notas Clínicas</h3>
                    <ul style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-secondary);">
                        ${n.clinical_notes.map(e=>`<li style="margin-bottom: 0.5rem;">${this.utils.sanitizeHTML(e)}</li>`).join(``)}
                    </ul>
                </div>
            `:``}

            <div class="section-container" style="margin-top: 1.5rem;">
                <h3 class="section-label" style="font-size: 1rem;">Términos en el Diccionario</h3>
                <div class="card" style="padding: 0.5rem;">
                    ${r.length?r.map(e=>`
                        <div class="list-item" onclick="App.viewTerm('${e.term_id}')">
                            <span>${this.utils.sanitizeHTML(e.canonical_name)}</span>
                            <span style="font-size: 0.7rem; color: var(--text-secondary); opacity: 0.6;">${this.utils.sanitizeHTML(e.term_kind)}</span>
                        </div>
                    `).join(``):`<p style="padding: 1rem; font-size: 0.9rem;">No hay términos específicos registrados aún.</p>`}
                </div>
            </div>

            ${n.recommended_wording?`
                <div class="wording-box wording-recommended" style="margin-top: 1.5rem;">
                    <span class="section-label" style="color: #2f855a;">Lenguaje Recomendado</span>
                    <ul class="wording-list">
                        ${n.recommended_wording.map(e=>`<li>${this.utils.sanitizeHTML(e)}</li>`).join(``)}
                    </ul>
                </div>
            `:``}
        `,this.nodes.content.scrollTop=0},closeDomainDetails:function(){document.getElementById(`domain-detail-container`).classList.add(`hidden`),document.getElementById(`domain-grid-container`).classList.remove(`hidden`),this.nodes.content.scrollTop=0},renderCases:function(){this.nodes.casesView.innerHTML=`
            <h3 style="margin-top:0; color: var(--primary);">Escenarios OSCE</h3>
            <p style="font-size: 0.85rem; opacity: 0.8; margin-bottom: 1rem;">Seleccione un caso para practicar el diagnóstico diferencial.</p>
            ${this.data.cases.map(e=>`
                <div class="card" onclick="App.renderCase('${e.case_id}')" style="padding: 1rem; cursor: pointer;">
                    <div style="display:flex; justify-content: space-between; align-items: center;">
                        <span class="badge" style="background:#edf2f7; color: #2d3748;">Nivel ${this.utils.sanitizeHTML(String(e.level))}</span>
                        <code style="font-size: 0.7rem; opacity: 0.5;">${this.utils.sanitizeHTML(e.case_id)}</code>
                    </div>
                    <p style="margin: 0.75rem 0; font-weight: 600; color: var(--primary-dark);">
                        ${this.utils.sanitizeHTML(e.stem.setting.replace(/_/g,` `))}
                    </p>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
                        ${this.utils.sanitizeHTML(e.stem.contextual_notes)}
                    </p>
                    <div style="font-size: 0.75rem; color: var(--primary); font-weight: 600; text-align: right;">
                        Ver Caso →
                    </div>
                </div>
            `).join(``)}
        `},renderCase:function(e){let t=this.data.cases.find(t=>t.case_id===e);if(!t)return;this.donation.increment();let n=Object.entries(t.domains).map(([e,t])=>`
                <div class="domain-card" style="border: 1px solid var(--border); padding: 0.75rem; border-radius: 8px; font-size: 0.85rem;">
                    <div style="font-weight:bold; color:var(--primary); margin-bottom:0.5rem; border-bottom:1px solid var(--border-subtle);">${e}</div>
                    <ul style="padding-left: 1rem; margin:0;">${Object.entries(t).map(([e,t])=>`<li><strong>${e.replace(/_/g,` `)}:</strong> ${String(t||``).replace(/_/g,` `)}</li>`).join(``)}</ul>
                </div>
            `).join(``);this.nodes.casesView.innerHTML=`
            <div class="btn-back" onclick="App.renderCases()">← Volver a Lista de Casos</div>
            <div class="card">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h2 class="term-title">${t.case_id}: ${t.stem.sex}, ${t.stem.age_range}</h2>
                    <span class="badge">${t.stem.setting.replace(/_/g,` `)}</span>
                </div>
                <p style="font-style:italic; border-left: 3px solid var(--primary); padding-left: 1rem; color: var(--text-secondary); margin: 1.5rem 0;">
                    "${t.stem.contextual_notes}"
                </p>

                <h3 style="margin-top: 1.5rem;">Exploración por Dominios</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    ${n}
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
                            <p style="font-size: 1.1rem; font-weight: bold;">${this.utils.sanitizeHTML(t.expected_engine_output.primary_syndrome.replace(/_/g,` `))}</p>
                            
                            <div style="margin-top: 1rem; display:flex; gap: 0.5rem; flex-wrap: wrap;">
                                ${t.expected_engine_output.critical_flags.map(e=>`<span class="badge" style="background: #fed7d7; color: #742a2a;">🚩 ${this.utils.sanitizeHTML(e.replace(/_/g,` `))}</span>`).join(``)}
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div style="background: rgba(47, 133, 90, 0.1); color: #22543d; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem;">
                                <strong>Claves Diagnósticas:</strong>
                                <ul>${t.assessment_keys.key_discriminators.map(e=>`<li>${this.utils.sanitizeHTML(e.replace(/_/g,` `))}</li>`).join(``)}</ul>
                            </div>
                            <div style="background: rgba(197, 48, 48, 0.1); color: #742a2a; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem;">
                                <strong>Errores a Evitar:</strong>
                                <ul>${t.assessment_keys.errors_to_avoid.map(e=>`<li>${this.utils.sanitizeHTML(e.replace(/_/g,` `))}</li>`).join(``)}</ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,window.scrollTo(0,0)},navIndicator:{init:function(){},update:function(){}},switchTab:function(e){this.utils.haptic(),this.nodes.navButtons.forEach(t=>{let n=t.id===e;t.classList.toggle(`active`,n),n?t.setAttribute(`aria-current`,`page`):t.removeAttribute(`aria-current`)}),this.navIndicator.update(),this.nodes.search.value=``,e===`nav-dictionary`?(this.data.currentView=`dictionary`,this.renderView(`dictionary`)):e===`nav-domains`?(this.data.currentView=`domain`,this.renderView(`domain`),this.renderDomains()):e===`nav-cases`?(this.data.currentView=`cases`,this.renderView(`cases`),this.renderCases()):e===`nav-integrator`?(this.data.currentView=`integrator`,this.integrator.init(),this.renderView(`integrator`)):e===`nav-game`?(this.data.currentView=`game`,this.game.init(),this.renderView(`game`)):this.game&&this.game.stopTimer&&this.game.stopTimer()},renderView:function(e){e!==`game`&&this.game&&this.game.stopTimer&&this.game.stopTimer(),[`dictionary`,`results`,`term`,`domain`,`cases`,`integrator`,`about`,`game`].forEach(t=>{let n=this.nodes[`${t}View`];n&&(t===e?(n.classList.remove(`hidden`),n.classList.remove(`view-enter`),n.offsetWidth,n.classList.add(`view-enter`)):n.classList.add(`hidden`))})}}}));t((()=>{r(),a(),s(),l(),d(),p(),h(),_();var e={data:n,utils:i,theme:o,integrator:c,game:u,donation:f,pwa:m,...g};window.App=e,document.addEventListener(`DOMContentLoaded`,()=>{e.init()})}))();