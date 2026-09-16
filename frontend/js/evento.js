const formEvento = document.querySelector("#form-evento");
const mensagem = document.querySelector("#mensagem");

formEvento.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const dados = {
    titulo: document.querySelector("#titulo").value,
    descricao: document.querySelector("#descricao").value,
    data: document.querySelector("#data").value,
  };

  const resposta = await apiFetch("/eventos/", {
    method: "POST",
    body: dados,
  });

  if (erroMensagem(resposta, mensagem, "Erro ao criar evento.")) return;

  window.location.href = "dashboard.html";
});
