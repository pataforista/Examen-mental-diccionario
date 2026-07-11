export const pwa = {
  deferredPrompt: null,
  init: function () {
    window.addEventListener("beforeinstallprompt", e => {
      e.preventDefault();
      this.deferredPrompt = e;
      const banner = document.getElementById("pwa-install-banner");
      if (banner) banner.classList.remove("hidden");
    });
    window.addEventListener("appinstalled", () => {
      this.deferredPrompt = null;
      const banner = document.getElementById("pwa-install-banner");
      if (banner) banner.classList.add("hidden");
    });
    const installBtn = document.getElementById("pwa-install-btn");
    if (installBtn) {
      installBtn.addEventListener("click", async () => {
        if (!this.deferredPrompt) return;
        this.deferredPrompt.prompt();
        const {outcome} = await this.deferredPrompt.userChoice;
        this.deferredPrompt = null;
        const banner = document.getElementById("pwa-install-banner");
        if (banner) banner.classList.add("hidden");
      });
    }
    const dismissBtn = document.getElementById("pwa-install-dismiss");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", () => {
        const banner = document.getElementById("pwa-install-banner");
        if (banner) banner.classList.add("hidden");
      });
    }
  }
};
