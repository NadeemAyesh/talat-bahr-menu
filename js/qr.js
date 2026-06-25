/**
 * صفحة رمز QR — طلة البحر
 */
(function () {
  "use strict";

  const MENU_URL = "https://talat-bahr-menu.netlify.app/";
  const canvas = document.getElementById("qr-canvas");
  const poster = document.getElementById("qr-poster");
  const logoImg = document.querySelector(".qr-poster__logo");

  async function drawQr() {
    await QRCode.toCanvas(canvas, MENU_URL, {
      width: 280,
      margin: 1,
      errorCorrectionLevel: "H",
      color: {
        dark: "#0a1628",
        light: "#ffffff",
      },
    });

    const ctx = canvas.getContext("2d");
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.src = "images/logo.png";

    await new Promise((resolve, reject) => {
      logo.onload = resolve;
      logo.onerror = reject;
    });

    const size = 56;
    const x = (canvas.width - size) / 2;
    const y = (canvas.height - size * 0.55) / 2;
    const h = size * 0.55;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(x - 6, y - 4, size + 12, h + 8, 8);
    ctx.fill();

    ctx.drawImage(logo, x, y, size, h);
  }

  function downloadPoster() {
    const exportCanvas = document.createElement("canvas");
    const scale = 2;
    const w = poster.offsetWidth;
    const h = poster.offsetHeight;

    exportCanvas.width = w * scale;
    exportCanvas.height = h * scale;
    const ctx = exportCanvas.getContext("2d");

    ctx.scale(scale, scale);
    ctx.fillStyle = "#0a1628";
    ctx.fillRect(0, 0, w, h);

    let y = 48;

    if (logoImg.complete) {
      const lw = 200;
      const lh = lw * (logoImg.naturalHeight / logoImg.naturalWidth);
      ctx.drawImage(logoImg, (w - lw) / 2, y, lw, lh);
      y += lh + 24;
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#7dd3fc";
    ctx.font = '600 22px "El Messiri", serif';
    ctx.fillText("امسح الرمز للاطلاع على المنيو", w / 2, y);
    y += 28;
    ctx.fillStyle = "rgba(125, 211, 252, 0.6)";
    ctx.font = '400 14px "Cairo", sans-serif';
    ctx.fillText("Scan to view our menu", w / 2, y);
    y += 40;

    const qrSize = 240;
    const qrX = (w - qrSize) / 2;

    ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(qrX - 16, y - 16, qrSize + 32, qrSize + 32, 20);
    ctx.stroke();

    ctx.drawImage(canvas, qrX, y, qrSize, qrSize);
    y += qrSize + 36;

    ctx.fillStyle = "#bae6fd";
    ctx.font = '500 15px "Cairo", sans-serif';
    ctx.fillText("talat-bahr-menu.netlify.app", w / 2, y);
    y += 24;
    ctx.fillStyle = "rgba(186, 230, 253, 0.55)";
    ctx.font = '400 13px "Amiri", serif';
    ctx.fillText("مأكولات بحرية طازجة · من البحر لسفرتك", w / 2, y);

    const link = document.createElement("a");
    link.download = "talat-bahr-qr.png";
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  }

  document.getElementById("btn-print").addEventListener("click", () => window.print());
  document.getElementById("btn-download").addEventListener("click", downloadPoster);

  drawQr().catch(() => {
    canvas.insertAdjacentHTML(
      "afterend",
      '<p class="qr-poster__error">تعذّر إنشاء الرمز — تحقق من الاتصال</p>'
    );
  });
})();
