import { cleanWindow } from './navegation.js';
import { pageUrl } from '../../../services/api.js'

const formLogin = document.querySelector("#form-login");
const messageErroLogin = document.querySelector("#mensagem-erro-login");

formLogin.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.querySelector("#email-dono").value;
  const password = document.querySelector("#senha-dono").value;

  const data = { email, password };

  const response = await apiFetch("/login", {
    method: "POST",
    body: data,
  });

  if (erroMensagem(response, messageErroLogin, "Erro ao fazer login")) return;

  cleanWindow();
  window.location.href = pageUrl("pages/chose-profile/profiles.html");
});