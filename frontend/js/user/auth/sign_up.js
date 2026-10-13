
import { cleanWindow } from '../../generic/navegation.js';

const formCadastro = document.querySelector("#form-cadastro");
const mensagemErroCadastro = document.querySelector("#mensagem-erro-cadastro");

formCadastro.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const name = document.querySelector("#nome-cadastro").value;
  const email = document.querySelector("#email-cadastro").value;
  const passwd = document.querySelector("#senha-cadastro").value;
  const confirmacaoSenha = document.querySelector("#confirmacao-senha-cadastro").value;
  const dataNascimento = document.querySelector("#data-nasc-cadastro").value;

  if (passwd !== confirmacaoSenha) {
    mensagemErroCadastro.textContent = "As senhas não coincidem!";
    return;
  }

  if (!maioridade(dataNascimento)) {
    mensagemErroCadastro.textContent = "Você precisa ter 18 anos ou mais.";
    return;
  }

  const dados = {
    name: name,
    email: email,
    password: passwd,
    birthDate: dataNascimento,
  };

  const resposta = await apiFetch("/cadastro", {
    method: "POST",
    body: dados,
  });

  if (erroMensagem(resposta, mensagemErroCadastro, "Erro ao criar conta.")) return;

  sessionStorage.setItem("cadastro_pendente", JSON.stringify({
    perfilAdmin: resposta.dados.profile_admin,
    contaFamilia: resposta.dados.family_account,
  }));

  localStorage.setItem("nameProfile", name)

  cleanWindow();
  window.location.href = "dashboard.html";
});

function maioridade(dataNascimento) {
  const dataAtual = new Date();
  const [ano, mes, dia] = dataNascimento.split("-").map(Number);
  const nascimento = new Date(ano, mes - 1, dia);
  const MAIORIDADE = 18;

  let idade = dataAtual.getFullYear() - nascimento.getFullYear();

  const mesAtualMenor = dataAtual.getMonth() < nascimento.getMonth();
  const mesmoMesMasDiaMenor =
    dataAtual.getMonth() === nascimento.getMonth() && dataAtual.getDate() < nascimento.getDate();

  if (mesAtualMenor || mesmoMesMasDiaMenor) {
    idade--;
  }

  return idade >= MAIORIDADE;
}