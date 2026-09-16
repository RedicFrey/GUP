const formFamilia = document.querySelector("#form-familia");
const mensagem = document.querySelector("#mensagem");

document.addEventListener("DOMContentLoaded", async () => {
  const usuario = await exigirLogin();
  if (!usuario) return;
});

formFamilia.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const dados = {
    nome: document.querySelector("#nome").value,
    pin: document.querySelector("#pin").value,
    cargo: document.querySelector("#cargo").value
  };

  const resposta = await apiFetch("/auth-contas/criar", {
    method: "POST",
    body: dados,
  });

  if (erroMensagem(resposta, mensagem, "Erro ao criar conta.")) return;

  window.location.href = "dashboard.html";
});
