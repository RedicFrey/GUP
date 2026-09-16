const formEntrar = document.querySelector("#form-entrar-familia");
const mensagem = document.querySelector("#mensagem");

document.addEventListener("DOMContentLoaded", async() => {
  const usuario = await exigirLogin();
  if (!usuario) return;
})

formEntrar.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const dados = {
    email_dono: document.querySelector("#email_dono").value,
    pin: document.querySelector("#pin").value,
  };

  const resposta = await apiFetch("/auth-contas/login", {
    method: "POST",
    body: dados,
  });

  if (erroMensagem(resposta, mensagem, "Erro ao entrar na família")) return;

  window.location.href = "dashboard.html";
});
