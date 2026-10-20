import { getIcon } from "./icons.js";

const DISMISS_KEY = "mse-pwa-dismissed-at";
const DISMISS_DAYS = 14;

// Pasos por plataforma. Cada paso lleva un ícono para reconocer el botón real del navegador.
const GUIDES = {
  ios: {
    label: "iPhone / iPad",
    note: "Funciona desde Safari. Si abriste el enlace dentro de otra app (WhatsApp, Instagram, correo), ábrelo primero en Safari.",
    steps: [
      { icon: "compass", html: "Abre esta página en <strong>Safari</strong>." },
      { icon: "share-ios", html: "Toca el botón <strong>Compartir</strong> (el cuadro con la flecha hacia arriba), en la barra inferior o junto a la barra de direcciones." },
      { icon: "plus-square", html: "Desplázate y elige <strong>Añadir a pantalla de inicio</strong>. Si no lo ves, baja hasta el final de la lista o toca <em>Editar acciones</em>." },
      { icon: "check-circle", html: "Toca <strong>Añadir</strong>. El ícono aparece en tu pantalla de inicio y abre la app a pantalla completa, sin conexión." }
    ]
  },
  android: {
    label: "Android",
    note: "Funciona desde Chrome, Edge, Samsung Internet y Firefox.",
    steps: [
      { icon: "compass", html: "Abre esta página en <strong>Chrome</strong>." },
      { icon: "more-vertical", html: "Toca el menú <strong>⋮</strong> (tres puntos), arriba a la derecha." },
      { icon: "download", html: "Elige <strong>Instalar app</strong> o <strong>Añadir a la pantalla de inicio</strong>." },
      { icon: "check-circle", html: "Confirma con <strong>Instalar</strong>. La app queda en tu cajón de aplicaciones y funciona sin conexión." }
    ]
  }
};

export const pwa = {
  deferredPrompt: null,
  platform: null,

  detectPlatform: function () {
    const ua = navigator.userAgent || "";
    // iPadOS 13+ se identifica como Mac; se distingue por la pantalla táctil.
    const isIPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
    if (/iPhone|iPad|iPod/.test(ua) || isIPadOS) return "ios";
    if (/Android/.test(ua)) return "android";
    return "other";
  },

  isStandalone: function () {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
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

  // Texto y acción del banner según lo que el navegador permita.
  configureBanner: function () {
    const label = document.getElementById("pwa-install-text");
    const btn = document.getElementById("pwa-install-btn");
    if (!label || !btn) return;
    if (this.deferredPrompt) {
      label.textContent = "Instala la app para usarla sin conexión";
      btn.textContent = "Instalar";
      btn.dataset.mode = "native";
    } else {
      label.textContent = this.platform === "ios"
        ? "Añádela a tu pantalla de inicio y úsala sin conexión"
        : "Instala la app para usarla sin conexión";
      btn.textContent = "Cómo hacerlo";
      btn.dataset.mode = "guide";
    }
  },

  showGuide: function (platform) {
    const dialog = document.getElementById("pwa-guide");
    if (!dialog) return;
    this.renderGuide(platform || (this.platform === "android" ? "android" : "ios"));
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  },

  closeGuide: function () {
    const dialog = document.getElementById("pwa-guide");
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  },

  renderGuide: function (platform) {
    const guide = GUIDES[platform];
    const tabs = document.getElementById("pwa-guide-tabs");
    const body = document.getElementById("pwa-guide-body");
    if (!guide || !tabs || !body) return;
    tabs.querySelectorAll("[data-platform]").forEach(tab => {
      tab.setAttribute("aria-selected", String(tab.dataset.platform === platform));
    });
    body.innerHTML = `
      <p class="pwa-guide__note">${guide.note}</p>
      <ol class="pwa-steps">
        ${guide.steps.map(step => `
          <li class="pwa-step">
            <span class="pwa-step__icon">${getIcon(step.icon)}</span>
            <span class="pwa-step__text">${step.html}</span>
          </li>`).join("")}
      </ol>`;
  },

  // Tarjeta para la vista "Acerca de": siempre disponible, aunque el banner se haya cerrado.
  renderInstallCard: function () {
    if (this.isStandalone()) {
      return `
        <div class="card pwa-card">
          <span class="section-label">Instalación</span>
          <p class="pwa-card__text">${getIcon("check-circle")} Ya estás usando la app instalada.</p>
        </div>`;
    }
    return `
      <div class="card pwa-card">
        <span class="section-label">Instalar en tu dispositivo</span>
        <p class="pwa-card__text">Añade el diccionario a tu pantalla de inicio: abre a pantalla completa y funciona sin conexión.</p>
        <button class="btn primary btn-block" onclick="App.pwa.install()">${getIcon("download")} Cómo instalar</button>
      </div>`;
  },

  // Punto de entrada único: diálogo nativo si existe, guía en cualquier otro caso.
  install: async function () {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      this.setBanner(false);
      return;
    }
    this.showGuide();
  },

  init: function () {
    this.platform = this.detectPlatform();
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

    // iOS nunca dispara beforeinstallprompt; Android lo hace solo en navegadores compatibles.
    // En ambos casos el banner ofrece la guía manual.
    if ((this.platform === "ios" || this.platform === "android") && !this.isDismissed()) {
      this.configureBanner();
      this.setBanner(true);
    }

    const installBtn = document.getElementById("pwa-install-btn");
    if (installBtn) installBtn.addEventListener("click", () => this.install());

    const dismissBtn = document.getElementById("pwa-install-dismiss");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", () => {
        this.setBanner(false);
        this.rememberDismissal();
      });
    }

    const dialog = document.getElementById("pwa-guide");
    if (dialog) {
      document.getElementById("pwa-guide-close")?.addEventListener("click", () => this.closeGuide());
      document.getElementById("pwa-guide-done")?.addEventListener("click", () => this.closeGuide());
      // Clic sobre el fondo oscurecido cierra el diálogo.
      dialog.addEventListener("click", e => {
        if (e.target === dialog) this.closeGuide();
      });
      document.getElementById("pwa-guide-tabs")?.addEventListener("click", e => {
        const tab = e.target.closest("[data-platform]");
        if (tab) this.renderGuide(tab.dataset.platform);
      });
    }
  }
};
