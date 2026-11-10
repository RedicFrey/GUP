// ============================================================
// auth.js -> login e cadastro
// ============================================================
// Trocar entre as telas (entrar / criar conta) é feito só com CSS (ver auth.css).
// Aqui ficam só os dois formulários que falam com o backend.

import { api, mostrarMensagem } from "../../services/api.js"

const mensagemLogin = document.querySelector("#mensagem-erro-login")
const mensagemCadastro = document.querySelector("#mensagem-erro-cadastro")


// ---------- Login ----------
// POST /login com { email, password } -> depois escolhe o perfil
document.querySelector("#form-login").addEventListener("submit", async (evento) => {
    evento.preventDefault()   // impede o formulário de recarregar a página

    const entrou = await api("/login", {
        method: "POST",
        body: {
            email: document.querySelector("#email-dono").value,
            password: document.querySelector("#senha-dono").value,
        },
        mensagem: mensagemLogin,
    })
    if (entrou) location.href = "../choose-profile/profiles.html"
})


// ---------- Cadastro ----------
// POST /cadastro com { name, email, password, birthDate }
// (a idade mínima de 18 anos o backend confere)
document.querySelector("#form-cadastro").addEventListener("submit", async (evento) => {
    evento.preventDefault()

    const senha = document.querySelector("#senha-cadastro").value
    if (senha !== document.querySelector("#confirmacao-senha-cadastro").value) {
        mostrarMensagem(mensagemCadastro, "As duas senhas precisam ser iguais.")
        return
    }

    const criou = await api("/cadastro", {
        method: "POST",
        body: {
            name: document.querySelector("#nome-cadastro").value.trim(),
            email: document.querySelector("#email-cadastro").value.trim(),
            password: senha,
            birthDate: document.querySelector("#data-nasc-cadastro").value,
        },
        mensagem: mensagemCadastro,
    })
    // quem cria a conta já entra direto no próprio perfil (administrador)
    if (criou) location.href = "../home/dashboard.html"
})
