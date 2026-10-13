import { createProfile } from './create_profile.js';

const formFamilia = document.querySelector("#form-familia");
const campoNomeAdmin = document.querySelector("#nome-admin");
const campoPinAdmin = document.querySelector("#pin-admin");
const listaMembros = document.querySelector("#lista-membros-adicionados");
const btnAtivarCadastro = document.querySelector("#btn-adicionar-perfil");
const btnSalvarFamilia = formFamilia.querySelector('button[type="submit"]');
const mensagemErroCriarPerfil = document.querySelector("#mensagem-erro-perfis");

const modalPerfil = document.querySelector("#modal-cadastrar-perfil");
const btnCancelarPerfil = document.querySelector("#btn-cancelar-perfil");

const TIPO_RESPONSAVEL = "responsible";
const PIN_REGEX = /^\d{4}$/;

let perfilAdmin = null;
let contaFamilia = null;
let profilesToAdd = [];
let perfisJaSalvos = false;

export function iniciarCadastroPerfis(admin, conta) {
  perfilAdmin = admin;
  contaFamilia = conta;
  campoNomeAdmin.value = admin.name;
  renderizarMembros();
}

function limparErro(elemento) {
  elemento.textContent = "";
  elemento.className = "mensagem";
}

function removeMembro(indice) {
  profilesToAdd.splice(indice, 1);
  renderizarMembros();
}

function renderizarMembros() {
  listaMembros.innerHTML = "";

  if (profilesToAdd.length === 0) {
    const vazio = document.createElement("li");
    vazio.className = "lista-vazia";
    vazio.textContent = "Nenhum perfil adicionado ainda.";
    listaMembros.appendChild(vazio);
    return;
  }

  profilesToAdd.forEach((perfil, indice) => {
    const li = document.createElement("li");
    li.className = "perfil-item";

    const nome = document.createElement("span");
    nome.className = "perfil-nome";
    nome.textContent = perfil.name;

    const tipo = document.createElement("span");
    tipo.className = "etiqueta";
    tipo.textContent = perfil.profileType === TIPO_RESPONSAVEL ? "Responsável" : "Criança";

    li.append(nome, tipo);

    if (perfil.pin) {
      const pin = document.createElement("span");
      pin.className = "etiqueta etiqueta-pin";
      pin.textContent = "PIN";
      li.appendChild(pin);
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "botao-remover";
    btn.setAttribute("aria-label", `Remover ${perfil.name}`);
    btn.textContent = "×";
    btn.addEventListener("click", () => removeMembro(indice));
    li.appendChild(btn);

    listaMembros.appendChild(li);
  });
}

function abrirModal() {
  modalPerfil.innerHTML = "";

  createProfile(modalPerfil, (perfil) => {
    profilesToAdd.push(perfil);
    renderizarMembros();
    modalPerfil.close();
  });

  modalPerfil.showModal();
}

btnAtivarCadastro.addEventListener("click", abrirModal);
btnCancelarPerfil.addEventListener("click", () => modalPerfil.close());

formFamilia.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limparErro(mensagemErroCriarPerfil);

  if (!contaFamilia || !perfilAdmin) {
    mostrarMensagem(mensagemErroCriarPerfil, "Sessão perdida. Faça o cadastro ou login novamente.", "erro");
    return;
  }

  const nomeAdmin = campoNomeAdmin.value.trim();
  const pinAdmin = campoPinAdmin.value.trim();

  if (!nomeAdmin) {
    mostrarMensagem(mensagemErroCriarPerfil, "Informe o seu nome.", "erro");
    return;
  }
  if (pinAdmin && !PIN_REGEX.test(pinAdmin)) {
    mostrarMensagem(mensagemErroCriarPerfil, "O PIN deve ter 4 números.", "erro");
    return;
  }

  btnSalvarFamilia.disabled = true;
  try {
    if (!perfisJaSalvos) {
      const respostaPerfis = await apiFetch(`/conta-familia/${contaFamilia.id}/perfis`, {
        method: "POST",
        body: {
          admin: { id: perfilAdmin.id, name: nomeAdmin, pin: pinAdmin || null },
          profilesToAdd,
        },
      });

      if (erroMensagem(respostaPerfis, mensagemErroCriarPerfil, "Erro ao salvar os perfis.")) return;

      perfisJaSalvos = true;
      btnAtivarCadastro.disabled = true;
    }

    const respostaEntrada = await apiFetch(`/escolher-perfil/${perfilAdmin.id}`, {
      method: "POST",
      body: { pin: pinAdmin || null },
    });

    if (erroMensagem(respostaEntrada, mensagemErroCriarPerfil,
        "Perfis salvos, mas não foi possível entrar no seu perfil.")) return;

    window.location.href = "dashboard.html";
  } finally {
    btnSalvarFamilia.disabled = false;
  }
});