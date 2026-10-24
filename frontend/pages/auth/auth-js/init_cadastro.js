// init_cadastro.js
import { restoreWindow, activeNavByClick } from './navegation.js';
import { assetUrl } from '../../../services/api.js';

document.addEventListener("DOMContentLoaded", () => {
  // imagens da cena vêm do backend (/static)
  document.querySelectorAll("img[data-asset]").forEach((img) => {
    img.src = assetUrl(img.dataset.asset);
    img.addEventListener("error", () => img.remove(), { once: true });
  });

  restoreWindow("gateway");

  activeNavByClick(() => {
    document.querySelectorAll("#mensagem-erro-login, #mensagem-erro-cadastro")
      .forEach(el => { el.textContent = ""; el.className = "mensagem"; });
    // leva o foco para o primeiro campo da tela nova
    document.querySelector("main > section:not(.nao-visivel) input")?.focus();
  });
});
