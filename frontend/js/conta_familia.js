const tituloFamilia = document.querySelector("#titulo-familia");
const listaMembros = document.querySelector("#lista-membros");
const mensagem = document.querySelector("#mensagem");
const liderFamilia = document.querySelector("#lider_conta");

async function carregarConta() {

  const resposta = await apiFetch("/contas/info");

  if (resposta.status === 401) {
    window.location.href = "login.html";
    return;
  };

  if (erroMensagem(resposta, mensagem, "Erro ao apresentar as informações da conta família")) return;

  const { dados } = resposta;

  tituloFamilia.textContent = `Família: ${dados.nome_familia}`;

  if (!dados.membros.length) {
    listaMembros.innerHTML = "<p>Nenhuma pessoa encontrada nesta família.</p>";
    return;
  };

  liderFamilia.innerHTML = `<strong>Dono da conta:</strong> ${dados.dono_conta.email}`;

  listaMembros.innerHTML = `<ul>${dados.membros
    .map((m) => `<li><strong>${m.nome}</strong> <em>(${m.tipo_usuario})</em></li>`)
    .join("")}</ul>`;
};

document.addEventListener("DOMContentLoaded", () => {
  carregarConta();
});
