const formLogin = document.querySelector("#form-login");
const mensagem = document.querySelector("#mensagem");

formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const email = document.querySelector("#email").value;
  const senha = document.querySelector("#senha").value;

  const resposta = await apiFetch("/auth-usuarios/login", {
    method: "POST",
    body: { email, senha },
  });

  if (erroMensagem(resposta, mensagem, "Erro ao fazer login")) return;

  window.location.href = "dashboard.html";
});
