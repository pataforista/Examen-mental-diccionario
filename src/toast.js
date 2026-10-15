export const toast = {
  _container: null,
  _get: function () {
    if (!this._container) {
      this._container = document.createElement("div");
      this._container.className = "toast-container";
      document.body.appendChild(this._container);
    }
    return this._container;
  },
  show: function (message, type = "info", duration = 2800) {
    const container = this._get();
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    const dismiss = () => {
      el.classList.add("leaving");
      setTimeout(() => el.remove(), 250);
    };
    el.addEventListener("click", dismiss);
    setTimeout(dismiss, duration);
    return el;
  }
};
