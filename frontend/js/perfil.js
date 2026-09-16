const perfil = document.querySelector("#atualizar-usuario-perfil")
const nome_user = document.querySelector("#nome-usuario-perfil")
const email_user = document.querySelector("#email-usuario-perfil")
const senha_user = document.querySelector("#pwd-usuario-perfil")
const strike_user = document.querySelector("#strike-usuario-perfil")
const labelStrike = document.querySelector("#label-strike")
const mensagem = document.querySelector("#mensagem")

const btnMudarPerfil = document.querySelector("#btn-mudar-perfil")
const btnAtualizar = document.querySelector("#btn-atualizar-perfil")

async function carregarPerfil() {
    try {
        const {ok, status, dados} = await apiFetch('/usuarios/perfil', {method: 'GET'})

        if (status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (!ok) {
            mostrarMensagem(mensagem, dados?.erro || "Erro ao carregar perfil.", "erro");
            return;
        }

        nome_user.value = dados.usuario.nome;
        email_user.value = dados.usuario.email;
        senha_user.value = "";
        senha_user.placeholder = "********";

        if (dados.tipo_usuario === "crianca") {
            strike_user.value = dados.crianca.strike ?? 0;
            labelStrike.classList.remove("nao-visivel");
            strike_user.classList.remove("nao-visivel");
        }
    } catch (erro) {
        mostrarMensagem(mensagem, "Erro de conexão. Tente novamente.", "erro");
    }
}

function ativarEdicao() {
    nome_user.readOnly = false;
    email_user.readOnly = false;
    senha_user.readOnly = false;

    btnAtualizar.classList.remove("nao-visivel");
    btnMudarPerfil.classList.add("nao-visivel");
}

async function atualizarPerfil(e) {
    e.preventDefault();

    const corpo = {
        nome: nome_user.value,
        email: email_user.value
    };

    if (senha_user.value.trim() !== "") {
        corpo.senha = senha_user.value;
    }

    try {
        const {ok, status, dados} = await apiFetch('/usuarios/perfil', {
            method: 'PUT',
            body: corpo
        });

        if (status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (!ok) {
            mostrarMensagem(mensagem, dados?.erro || "Erro ao atualizar perfil.", "erro");
            return;
        }

        mostrarMensagem(mensagem, "Perfil atualizado com sucesso!", "sucesso");

        nome_user.readOnly = true;
        email_user.readOnly = true;
        senha_user.readOnly = true;
        senha_user.value = "";

        btnAtualizar.classList.add("nao-visivel");
        btnMudarPerfil.classList.remove("nao-visivel");

    } catch (erro) {
        mostrarMensagem(mensagem, "Erro de conexão. Tente novamente.", "erro");
    }
}

btnMudarPerfil.addEventListener("click", ativarEdicao);
perfil.addEventListener("submit", atualizarPerfil);

document.addEventListener("DOMContentLoaded", ()=>{
    carregarPerfil()
})