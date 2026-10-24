// init_cadastro.js
import { restoreWindow, activeNavByClick } from '../../../pages/auth/auth-js/navegation.js';

document.addEventListener("DOMContentLoaded", () => {
  restoreWindow("escolher-acao");

  activeNavByClick(() => {
    document.querySelectorAll("#mensagem-erro-login, #mensagem-erro-cadastro")
      .forEach(el => { el.textContent = ""; });
  });
});