export const utils = {
  sanitizeHTML: function (str) {
    if (!str) return "";
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
  },
  speakTerm: function (text) {
    if (("speechSynthesis" in window)) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-MX";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  },
  haptic: function () {
    // Chrome blocks (and logs) vibrate() before the first user gesture.
    if (("vibrate" in navigator) && navigator.userActivation?.hasBeenActive !== false) {
      try {
        navigator.vibrate(10);
      } catch(e) { console.warn(e); }
    }
  },
  getTermUrl: function (termId) {
    return `${window.location.origin}${window.location.pathname}#term/${termId}`;
  },
  wrapText: function (ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let lines = 0;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
        lines++;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
    return lines + 1;
  },
  generateShareCard: async function (term) {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");
    // Colores de la paleta base (independientes del tema): la tarjeta siempre sale en claro.
    const css = getComputedStyle(document.documentElement);
    const tok = name => css.getPropertyValue(name).trim();
    const peach = tok("--h-peach");
    const pinkSoft = tok("--h-pink-soft");
    const pink = tok("--h-pink");
    const indigo = tok("--h-indigo");
    const ink = tok("--h-indigo-deep");
    const raspberry = tok("--h-raspberry");
    if (document.fonts && document.fonts.load) {
      await Promise.all([document.fonts.load('600 96px "Poppins"'), document.fonts.load('400 44px "Inter"')]).catch(() => {});
    }
    const bg = ctx.createLinearGradient(0, 0, 1080, 1080);
    bg.addColorStop(0, peach);
    bg.addColorStop(1, pinkSoft);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1080);
    // Blobs orgánicos, como en las cabeceras de la app
    const blob = (x, y, r, color, alpha) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    blob(960, 110, 340, pink, 0.55);
    blob(90, 1000, 300, indigo, 0.18);
    // Tarjeta blanca central
    ctx.save();
    ctx.shadowColor = "rgba(46, 56, 112, 0.12)";
    ctx.shadowBlur = 48;
    ctx.shadowOffsetY = 20;
    ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
    ctx.beginPath();
    ctx.roundRect(60, 60, 960, 960, 56);
    ctx.fill();
    ctx.restore();
    // Etiqueta superior (píldora)
    ctx.fillStyle = tok("--h-indigo-soft");
    ctx.beginPath();
    ctx.roundRect(120, 130, 380, 64, 32);
    ctx.fill();
    ctx.fillStyle = indigo;
    ctx.font = '600 30px "Inter", sans-serif';
    ctx.fillText("Terminología clínica", 152, 173);
    // Nombre del término
    ctx.fillStyle = ink;
    ctx.font = '600 92px "Poppins", "Inter", sans-serif';
    const nameLines = this.wrapText(ctx, term.canonical_name, 120, 330, 840, 104);
    let y = 330 + nameLines * 104;
    // Tipo de término
    const kind = term.term_kind || "término";
    const isCritical = term.risk_weight > 1;
    ctx.font = '600 30px "Inter", sans-serif';
    const kindW = ctx.measureText(kind).width + 56;
    ctx.fillStyle = isCritical ? "rgba(190, 54, 80, 0.10)" : tok("--h-indigo-soft");
    ctx.beginPath();
    ctx.roundRect(120, y - 10, kindW, 56, 28);
    ctx.fill();
    ctx.fillStyle = isCritical ? raspberry : indigo;
    ctx.fillText(kind, 148, y + 28);
    y += 120;
    // Definición
    ctx.fillStyle = ink;
    ctx.font = '400 42px "Inter", sans-serif';
    const definition = term.definition_clinical?.core || "";
    const maxLines = Math.max(2, Math.floor((900 - y) / 60));
    let shortDef = definition;
    const approxChars = maxLines * 38;
    if (shortDef.length > approxChars) shortDef = shortDef.substring(0, approxChars).trim() + "…";
    this.wrapText(ctx, shortDef, 120, y, 840, 60);
    // Pie
    ctx.fillStyle = ink;
    ctx.font = '600 34px "Poppins", "Inter", sans-serif';
    ctx.fillText("Diccionario de examen mental", 120, 950);
    ctx.fillStyle = indigo;
    ctx.font = '500 28px "Inter", sans-serif';
    ctx.fillText("examenmental.pages.dev", 120, 990);
    return new Promise(resolve => {
      canvas.toBlob(resolve, "image/png");
    });
  }
};
