import { getIcon } from "./icons.js";

// Contrato común de tema (maestra §9): data-theme en <html>, clave localStorage "theme".
// La clave antigua "mse-theme" se migra una sola vez (EM4); el script del <head> ya lo hace
// antes del primer pintado, aquí se repite por si ese script no corrió.
const KEY = "theme";
const LEGACY_KEY = "mse-theme";
const THEME_COLOR = { light: "#FBF1EC", dark: "#191A2B" };

function readSaved() {
  try {
    let saved = localStorage.getItem(KEY);
    if (saved !== "light" && saved !== "dark") {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy === "light" || legacy === "dark") {
        saved = legacy;
        localStorage.setItem(KEY, legacy);
      }
      localStorage.removeItem(LEGACY_KEY);
    }
    return saved === "light" || saved === "dark" ? saved : null;
  } catch (e) {
    console.warn("Tema: no se pudo leer la preferencia guardada", e);
    return null;
  }
}

export const theme = {
  current: "light",
  systemPref: function () {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  },
  init: function () {
    const saved = readSaved();
    if (saved) {
      this.set(saved, false);
    } else {
      this.set(this.systemPref(), false);
      this.watchSystem();
    }
  },
  watchSystem: function () {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = e => {
      if (!readSaved()) this.set(e.matches ? "dark" : "light", false);
    };
    if (mq.addEventListener) mq.addEventListener("change", handler); else if (mq.addListener) mq.addListener(handler);
  },
  toggle: function () {
    this.set(this.current === "light" ? "dark" : "light");
  },
  set: function (theme, persist = true) {
    this.current = theme;
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.classList.toggle("theme-dark", theme === "dark");
    root.classList.toggle("theme-light", theme === "light");
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      // El ícono muestra el modo al que se cambiará.
      btn.innerHTML = getIcon(theme === "light" ? "moon" : "sun");
      btn.setAttribute("aria-label", theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro");
    }
    if (persist) {
      try {
        localStorage.setItem(KEY, theme);
      } catch (e) {
        console.warn("Tema: no se pudo guardar la preferencia", e);
      }
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLOR[theme]);
  }
};
