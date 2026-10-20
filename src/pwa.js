import { getIcon } from "./icons.js";

const DISMISS_KEY = "mse-pwa-dismissed-at";
const DISMISS_DAYS = 14;

const APP_URL = "examenmental.pages.dev";

// Maqueta de la barra del navegador: el elemento resaltado es el botón que hay que tocar.
// Cada ítem es un nombre de ícono o { text } para la barra de direcciones.
const mock = (items, active) => ({ items, active });

const MENU_GENERIC = "Busca en el menú del navegador una opción llamada <strong>Instalar app</strong> o <strong>Añadir a pantalla de inicio</strong>.";

// platform → browser → { label, note?, steps[] }
const GUIDES = {
  ios: {
    label: "iPhone / iPad",
    icon: "smartphone",
    browsers: {
      safari: {
        label: "Safari",
        note: "Es la mejor opción en iOS: la app se abre a pantalla completa, como una app nativa.",
        steps: [
          { html: "Abre esta página en <strong>Safari</strong>." },
          {
            html: "Toca <strong>Compartir</strong>, el cuadro con la flecha hacia arriba. En iPhone está en la barra inferior; en iPad, arriba a la derecha.",
            mock: mock(["chevron-left", "chevron-right", "share-ios", "book", "layers"], 2)
          },
          { html: "Desplázate y elige <strong>Añadir a pantalla de inicio</strong>. Si no la ves, baja hasta el final de la lista o toca <em>Editar acciones</em>." },
          { html: "Toca <strong>Añadir</strong>. El ícono aparece en tu pantalla de inicio." }
        ]
      },
      chrome: {
        label: "Chrome",
        note: "Desde iOS 16.4. La app se abrirá dentro de Chrome; para pantalla completa real, usa Safari.",
        steps: [
          { html: "Abre esta página en <strong>Chrome</strong>." },
          {
            html: "Toca <strong>Compartir</strong>, a la derecha de la barra de direcciones.",
            mock: mock([{ text: APP_URL }, "share-ios"], 1)
          },
          { html: "Elige <strong>Añadir a pantalla de inicio</strong> y confirma con <strong>Añadir</strong>." }
        ]
      },
      firefox: {
        label: "Firefox",
        note: "Desde iOS 16.4. La app se abrirá dentro de Firefox; para pantalla completa real, usa Safari.",
        steps: [
          { html: "Abre esta página en <strong>Firefox</strong>." },
          { html: "Abre el menú del navegador y toca <strong>Compartir</strong>." },
          { html: "Elige <strong>Añadir a pantalla de inicio</strong> y confirma con <strong>Añadir</strong>." }
        ]
      },
      edge: {
        label: "Edge",
        note: "Desde iOS 16.4. Si no encuentras la opción, usa Safari: es el camino más fiable en iOS.",
        steps: [
          { html: "Abre esta página en <strong>Edge</strong>." },
          { html: "Abre el menú del navegador y busca <strong>Compartir</strong>." },
          { html: "Elige <strong>Añadir a pantalla de inicio</strong> y confirma con <strong>Añadir</strong>." }
        ]
      }
    }
  },
  android: {
    label: "Android",
    icon: "smartphone",
    browsers: {
      chrome: {
        label: "Chrome",
        note: "Se instala como una app real: aparece en tu cajón de aplicaciones.",
        steps: [
          { html: "Abre esta página en <strong>Chrome</strong>." },
          {
            html: "Toca el menú <strong>⋮</strong>, arriba a la derecha.",
            mock: mock([{ text: APP_URL }, "layers", "more-vertical"], 2)
          },
          { html: "Elige <strong>Instalar app</strong> (o <em>Añadir a la pantalla de inicio</em>)." },
          { html: "Confirma con <strong>Instalar</strong>." }
        ]
      },
      samsung: {
        label: "Samsung Internet",
        note: "Si ves el ícono de instalación en la barra de direcciones, tócalo y salta al último paso.",
        steps: [
          { html: "Abre esta página en <strong>Samsung Internet</strong>." },
          {
            html: "Toca el menú <strong>≡</strong>, abajo a la derecha.",
            mock: mock(["chevron-left", "chevron-right", "home", "book", "layers", "menu"], 5)
          },
          { html: "Elige <strong>Añadir página a</strong> y luego <strong>Pantalla de inicio</strong>." },
          { html: "Confirma con <strong>Añadir</strong>." }
        ]
      },
      firefox: {
        label: "Firefox",
        note: "Según tu versión, la opción se llama Instalar o Añadir a pantalla de inicio.",
        steps: [
          { html: "Abre esta página en <strong>Firefox</strong>." },
          { html: "Toca el menú <strong>⋮</strong>." },
          { html: "Elige <strong>Instalar</strong> (o <em>Añadir a pantalla de inicio</em>) y confirma." }
        ]
      },
      edge: {
        label: "Edge",
        steps: [
          { html: "Abre esta página en <strong>Edge</strong>." },
          { html: "Toca el menú <strong>⋯</strong> de la barra inferior." },
          { html: "Elige <strong>Añadir al teléfono</strong> o <strong>Instalar</strong> y confirma." }
        ]
      },
      other: {
        label: "Otro",
        steps: [
          { html: "Abre esta página en tu navegador." },
          { html: "Toca el menú del navegador (⋮ o ≡)." },
          { html: MENU_GENERIC }
        ]
      }
    }
  },
  desktop: {
    label: "Computadora",
    icon: "monitor",
    browsers: {
      chrome: {
        label: "Chrome",
        steps: [
          {
            html: "Haz clic en el ícono de <strong>instalar</strong> al final de la barra de direcciones.",
            mock: mock([{ text: APP_URL }, "download", "star"], 1)
          },
          { html: "Confirma con <strong>Instalar</strong>. Se abre en su propia ventana." },
          { html: "Si no ves el ícono, abre el menú <strong>⋮</strong> y elige <em>Transmitir, guardar y compartir › Instalar página como aplicación</em>." }
        ]
      },
      edge: {
        label: "Edge",
        steps: [
          {
            html: "Haz clic en el ícono de <strong>aplicación</strong> al final de la barra de direcciones.",
            mock: mock([{ text: APP_URL }, "download", "star"], 1)
          },
          { html: "Confirma con <strong>Instalar</strong>." },
          { html: "Si no lo ves, abre el menú <strong>⋯</strong> y elige <em>Aplicaciones › Instalar este sitio como una aplicación</em>." }
        ]
      },
      safari: {
        label: "Safari",
        note: "Requiere macOS Sonoma (14) o posterior.",
        steps: [
          { html: "En la barra de menús, abre <strong>Archivo</strong>." },
          { html: "Elige <strong>Añadir al Dock</strong>." },
          { html: "Confirma con <strong>Añadir</strong>." }
        ]
      },
      firefox: {
        label: "Firefox",
        note: "Firefox de escritorio no instala aplicaciones web. Tienes dos opciones sencillas.",
        steps: [
          { html: "Abre esta página en <strong>Chrome</strong>, <strong>Edge</strong> o <strong>Safari</strong> y sigue los pasos de ese navegador." },
          { html: "O guarda la página en <strong>marcadores</strong> con <strong>Ctrl + D</strong> (<strong>⌘ + D</strong> en Mac) para abrirla rápido." }
        ]
      },
      other: {
        label: "Otro",
        steps: [
          { html: "Busca un ícono de <strong>instalar</strong> en la barra de direcciones." },
          { html: MENU_GENERIC }
        ]
      }
    }
  }
};

export const pwa = {
  deferredPrompt: null,
  platform: null,
  browser: null,
  inApp: false,
  _view: { platform: null, browser: null },
  _lastFocus: null,
  _ready: false,

  detect: function () {
    const ua = navigator.userAgent || "";
    // iPadOS 13+ se presenta como Mac; la pantalla táctil lo delata.
    const isIPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
    if (/iPhone|iPad|iPod/.test(ua) || isIPadOS) {
      this.platform = "ios";
      this.inApp = /FBAN|FBAV|Instagram|Line\/|Snapchat|MicroMessenger|GSA\//.test(ua);
      this.browser = /CriOS/.test(ua) ? "chrome" : /FxiOS/.test(ua) ? "firefox" : /EdgiOS/.test(ua) ? "edge" : "safari";
    } else if (/Android/.test(ua)) {
      this.platform = "android";
      this.inApp = /FBAN|FBAV|Instagram|Line\/|Snapchat|MicroMessenger|; wv\)/.test(ua);
      this.browser = /SamsungBrowser/.test(ua) ? "samsung"
        : /EdgA/.test(ua) ? "edge"
        : /Firefox/.test(ua) ? "firefox"
        : /OPR\/|Opera|Vivaldi|DuckDuckGo|Brave/.test(ua) ? "other"
        : /Chrome/.test(ua) ? "chrome" : "other";
    } else {
      this.platform = "desktop";
      this.inApp = false;
      this.browser = /Edg\//.test(ua) ? "edge"
        : /Firefox/.test(ua) ? "firefox"
        : /OPR\/|Opera|Vivaldi/.test(ua) ? "other"
        : /Chrome/.test(ua) ? "chrome"
        : /Safari/.test(ua) ? "safari" : "other";
    }
  },

  isStandalone: function () {
    return window.navigator.standalone === true
      || ["standalone", "fullscreen", "minimal-ui"].some(mode => window.matchMedia(`(display-mode: ${mode})`).matches);
  },

  isDismissed: function () {
    try {
      const at = parseInt(localStorage.getItem(DISMISS_KEY) || "", 10);
      return Number.isFinite(at) && Date.now() - at < DISMISS_DAYS * 864e5;
    } catch {
      return false;
    }
  },

  rememberDismissal: function () {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* sin almacenamiento: el aviso volverá en la próxima visita */
    }
  },

  setBanner: function (visible) {
    const banner = document.getElementById("pwa-install-banner");
    if (banner) banner.classList.toggle("hidden", !visible);
  },

  configureBanner: function () {
    const sub = document.getElementById("pwa-install-text");
    const btn = document.getElementById("pwa-install-btn");
    if (!sub || !btn) return;
    sub.textContent = "Sin conexión y a pantalla completa";
    btn.textContent = this.deferredPrompt ? "Instalar" : "Cómo hacerlo";
  },

  // ── Guía ────────────────────────────────────────────────────────────────

  browserLabel: function (platform, browser) {
    return GUIDES[platform]?.browsers[browser]?.label || "";
  },

  renderGuide: function (platform, browser) {
    const group = GUIDES[platform];
    if (!group) return;
    if (!group.browsers[browser]) browser = platform === this.platform && group.browsers[this.browser] ? this.browser : Object.keys(group.browsers)[0];
    this._view = { platform, browser };
    const guide = group.browsers[browser];

    document.querySelectorAll("#pwa-guide-tabs [data-platform]").forEach(tab => {
      tab.setAttribute("aria-pressed", String(tab.dataset.platform === platform));
    });

    const chips = document.getElementById("pwa-guide-browsers");
    chips.innerHTML = Object.entries(group.browsers).map(([key, g]) => {
      const mine = platform === this.platform && key === this.browser;
      return `<button type="button" class="pwa-chip" data-browser="${key}" aria-pressed="${key === browser}">${g.label}${mine ? '<span class="pwa-chip__dot" role="img" aria-label="tu navegador"></span>' : ""}</button>`;
    }).join("");

    const notices = [];
    if (this.inApp && platform === this.platform) {
      notices.push(`<div class="pwa-notice pwa-notice--warn">${getIcon("alert")}<span>Parece que abriste el enlace dentro de otra app (WhatsApp, Instagram, correo…). Ábrelo primero en ${platform === "ios" ? "<strong>Safari</strong>" : "<strong>Chrome</strong>"}: desde aquí no se puede instalar.</span></div>`);
    }
    if (guide.note) notices.push(`<div class="pwa-notice">${getIcon("info")}<span>${guide.note}</span></div>`);

    const steps = guide.steps.map(step => `
      <li class="pwa-step">
        <div class="pwa-step__body">
          <p class="pwa-step__text">${step.html}</p>
          ${step.mock ? this.renderMock(step.mock) : ""}
        </div>
      </li>`).join("");

    document.getElementById("pwa-guide-body").innerHTML = `${notices.join("")}<ol class="pwa-steps">${steps}</ol>`;
  },

  renderMock: function ({ items, active }) {
    const cells = items.map((item, i) => {
      const cls = `pwa-mock__item${i === active ? " is-active" : ""}${typeof item === "object" ? " pwa-mock__item--url" : ""}`;
      const inner = typeof item === "object" ? `<span>${item.text}</span>` : getIcon(item);
      return `<span class="${cls}">${inner}</span>`;
    }).join("");
    return `<div class="pwa-mock" aria-hidden="true">${cells}</div>`;
  },

  showGuide: function (platform, browser) {
    const dialog = document.getElementById("pwa-guide");
    if (!dialog) return;
    if (!this.platform) this.detect();
    this.renderGuide(platform || this.platform, browser || this.browser);
    const who = document.getElementById("pwa-guide-detected");
    if (who) {
      const label = this.browserLabel(this.platform, this.browser);
      who.textContent = label ? `Detectamos ${label} en ${GUIDES[this.platform].label}` : "";
      who.classList.toggle("hidden", !label);
    }
    if (dialog.open) return;
    this._lastFocus = document.activeElement;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    this.onOpen();
    // Estas medidas solo existen con el diálogo visible.
    dialog.scrollTop = 0;
    this.revealSelectedChip();
  },

  revealSelectedChip: function () {
    const row = document.getElementById("pwa-guide-browsers");
    const chip = row?.querySelector('[aria-pressed="true"]');
    if (!row || !chip) return;
    row.scrollLeft = chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2;
  },

  closeGuide: function () {
    const dialog = document.getElementById("pwa-guide");
    if (!dialog?.open) return;
    if (typeof dialog.close === "function") dialog.close();
    else {
      dialog.removeAttribute("open");
      this.onClose();
    }
  },

  // Se ejecutan al abrir y al cerrar, sea cual sea la vía (botón, Escape, fondo, Atrás).
  onOpen: function () {
    document.documentElement.classList.add("pwa-guide-open");
  },

  onClose: function () {
    document.documentElement.classList.remove("pwa-guide-open");
    const back = this._lastFocus;
    this._lastFocus = null;
    if (back && back.isConnected && typeof back.focus === "function") back.focus();
  },

  renderInstallCard: function () {
    if (this.isStandalone()) {
      return `
        <div class="card pwa-card pwa-card--done">
          <span class="pwa-card__badge">${getIcon("check-circle")}</span>
          <div>
            <span class="section-label">Instalación</span>
            <p class="pwa-card__text">Ya estás usando la app instalada.</p>
          </div>
        </div>`;
    }
    return `
      <div class="card pwa-card">
        <img class="pwa-card__app" src="icon-192.png" alt="" width="56" height="56">
        <div class="pwa-card__main">
          <span class="section-label">Instalar en tu dispositivo</span>
          <p class="pwa-card__text">Ábrela desde tu pantalla de inicio, a pantalla completa y sin conexión.</p>
          <button class="btn primary" onclick="App.pwa.install()">${getIcon("download")} Cómo instalar</button>
        </div>
      </div>`;
  },

  // Diálogo nativo si el navegador lo ofrece; guía manual en cualquier otro caso.
  install: async function () {
    const event = this.deferredPrompt;
    if (event) {
      // El evento solo sirve una vez, acepten o no.
      this.deferredPrompt = null;
      try {
        await event.prompt();
        await event.userChoice;
        this.setBanner(false);
        return;
      } catch {
        /* el navegador rechazó el diálogo nativo: se ofrece la guía manual */
        this.configureBanner();
      }
    }
    this.showGuide();
  },

  init: function () {
    if (this._ready) return;
    this._ready = true;
    this.detect();
    if (this.isStandalone()) return;

    window.addEventListener("beforeinstallprompt", e => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.configureBanner();
      if (!this.isDismissed()) this.setBanner(true);
    });
    window.addEventListener("appinstalled", () => {
      this.deferredPrompt = null;
      this.setBanner(false);
      this.closeGuide();
    });

    // iOS nunca dispara beforeinstallprompt, y en Android solo algunos navegadores lo hacen:
    // en móvil el banner ofrece siempre la guía manual.
    if ((this.platform === "ios" || this.platform === "android") && !this.isDismissed()) {
      this.configureBanner();
      this.setBanner(true);
    }

    document.getElementById("pwa-install-btn")?.addEventListener("click", () => this.install());
    document.getElementById("pwa-install-dismiss")?.addEventListener("click", () => {
      this.setBanner(false);
      this.rememberDismissal();
    });

    const dialog = document.getElementById("pwa-guide");
    if (!dialog) return;
    document.getElementById("pwa-guide-close")?.addEventListener("click", () => this.closeGuide());
    document.getElementById("pwa-guide-done")?.addEventListener("click", () => this.closeGuide());

    // Escape, close() y cierre por fondo terminan todos aquí.
    dialog.addEventListener("close", () => this.onClose());

    // Clic en el fondo oscurecido: se compara con el rectángulo del diálogo, porque su
    // propio padding también devuelve target === dialog.
    let downOutside = false;
    const outside = e => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    dialog.addEventListener("pointerdown", e => { downOutside = e.target === dialog && outside(e); });
    dialog.addEventListener("click", e => {
      if (e.target === dialog && downOutside && outside(e)) this.closeGuide();
      downOutside = false;
    });

    // Atrás del navegador cambia la vista de fondo: no dejar el modal huérfano encima.
    window.addEventListener("popstate", () => this.closeGuide());

    document.getElementById("pwa-guide-tabs")?.addEventListener("click", e => {
      const tab = e.target.closest("[data-platform]");
      if (!tab) return;
      const platform = tab.dataset.platform;
      this.renderGuide(platform, platform === this.platform ? this.browser : null);
      this.revealSelectedChip();
    });
    document.getElementById("pwa-guide-browsers")?.addEventListener("click", e => {
      const chip = e.target.closest("[data-browser]");
      if (!chip) return;
      this.renderGuide(this._view.platform, chip.dataset.browser);
      // Los chips se reconstruyen: devolver el foco al que se acaba de pulsar.
      document.querySelector(`#pwa-guide-browsers [data-browser="${chip.dataset.browser}"]`)?.focus();
    });
  }
};
