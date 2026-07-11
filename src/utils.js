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
    if (("vibrate" in navigator)) {
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
    const cream = "#FFF8E7";
    const black = "#211f1f";
    const magenta = "#95215c";
    const gold = "#9a8238";
    const teal = "#7acdbf";
    ctx.fillStyle = cream;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = magenta;
    ctx.beginPath();
    ctx.arc(950, 130, 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = teal;
    ctx.fillRect(-50, 900, 300, 300);
    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.moveTo(100, 350);
    ctx.lineTo(980, 200);
    ctx.lineTo(800, 500);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = black;
    ctx.lineWidth = 40;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    ctx.fillStyle = black;
    ctx.fillRect(80, 80, 480, 80);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 40px Outfit, sans-serif";
    ctx.fillText("TERMINOLOGÍA CLÍNICA", 110, 135);
    ctx.fillStyle = black;
    ctx.font = "900 110px Outfit, sans-serif";
    const termName = term.canonical_name.toUpperCase();
    const nameLines = this.wrapText(ctx, termName, 80, 350, 920, 120);
    const badgeY = 350 + nameLines * 120 + 20;
    ctx.fillStyle = magenta;
    ctx.fillRect(80, badgeY, 250, 50);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 30px Outfit, sans-serif";
    ctx.fillText(term.term_kind.toUpperCase(), 100, badgeY + 35);
    ctx.fillStyle = black;
    ctx.font = "500 48px Outfit, sans-serif";
    const definition = term.definition_clinical?.core || "";
    const shortDef = definition.length > 280 ? definition.substring(0, 280) + "..." : definition;
    this.wrapText(ctx, shortDef, 80, 550, 920, 65);
    ctx.fillStyle = black;
    ctx.font = "800 35px Outfit, sans-serif";
    ctx.fillText("DICCIONARIO DE EXAMEN MENTAL", 80, 980);
    ctx.font = "400 30px Outfit, sans-serif";
    ctx.fillText("examen-mental.pages.dev", 80, 1020);
    ctx.font = "900 32px Outfit, sans-serif";
    ctx.fillText("📱 DESCARGA LA APP", 620, 985);
    return new Promise(resolve => {
      canvas.toBlob(resolve, "image/png");
    });
  }
};
