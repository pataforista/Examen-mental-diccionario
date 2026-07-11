export const theme = {
  current: "light",
  systemPref: function () {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  },
  init: function () {
    const saved = localStorage.getItem("mse-theme");
    if (saved === "light" || saved === "dark") {
      this.set(saved);
    } else {
      this.set(this.systemPref(), false);
      this.watchSystem();
    }
  },
  watchSystem: function () {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = e => {
      if (!localStorage.getItem("mse-theme")) this.set(e.matches ? "dark" : "light", false);
    };
    if (mq.addEventListener) mq.addEventListener("change", handler); else if (mq.addListener) mq.addListener(handler);
  },
  toggle: function () {
    const next = this.current === "light" ? "dark" : "light";
    this.set(next);
  },
  set: function (theme, persist = true) {
    this.current = theme;
    document.body.setAttribute("data-theme", theme);
    document.getElementById("theme-toggle").innerHTML = theme === "light" ? "🌞" : "🌙";
    document.getElementById("app-title").innerText = "DICCIONARIO DE EXAMEN MENTAL";
    if (persist) localStorage.setItem("mse-theme", theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", theme === "light" ? "#FFF8E7" : "#120C18");
  }
};
