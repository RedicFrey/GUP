const formCadastro = document.querySelector("#form-cadastro");
const mensagem = document.querySelector("#mensagem");

formCadastro.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const dados = {
    nome: document.querySelector("#nome").value,
    email: document.querySelector("#email").value,
    senha: document.querySelector("#senha").value,
    confirmacao_senha: document.querySelector("#confirmacao_senha").value,
    data_nasc: document.querySelector("#data_nasc").value,
  };

  const resposta = await apiFetch("/auth-usuarios/cadastro", {
    method: "POST",
    body: dados,
  });

  // se não tiver a propriedade ok, vai dar mostrar o erro ou colocar a outra mensagem e retornar nada
  if (erroMensagem(resposta, mensagem, "Erro ao criar conta.")) return;

  // redireciona pro dashboard.html
  window.location.href = "dashboard.html";
});
