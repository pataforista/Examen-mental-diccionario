export const donation = {
  SHOW_AFTER: 5,
  SNOOZE_FOR: 20,
  getCount: function () {
    return parseInt(localStorage.getItem("mse-usage-count") || "0", 10);
  },
  setCount: function (n) {
    localStorage.setItem("mse-usage-count", String(n));
  },
  getDismissedAt: function () {
    const v = localStorage.getItem("mse-donation-dismissed-at");
    return v !== null ? parseInt(v, 10) : null;
  },
  shouldShow: function (count) {
    if (count < this.SHOW_AFTER) return false;
    const dismissedAt = this.getDismissedAt();
    if (dismissedAt === null) return true;
    return count >= dismissedAt + this.SNOOZE_FOR;
  },
  show: function () {
    const widget = document.getElementById("donation-widget");
    if (widget) widget.classList.remove("hidden");
  },
  dismiss: function () {
    const widget = document.getElementById("donation-widget");
    if (widget) widget.classList.add("hidden");
    localStorage.setItem("mse-donation-dismissed-at", String(this.getCount()));
  },
  increment: function () {
    const n = this.getCount() + 1;
    this.setCount(n);
    if (this.shouldShow(n)) this.show();
  },
  init: function () {
    const closeBtn = document.getElementById("donation-close");
    if (closeBtn) closeBtn.addEventListener("click", () => this.dismiss());
    if (this.shouldShow(this.getCount())) this.show();
  }
};
