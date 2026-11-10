// ============================================================
// dashboard.js -> página "Meu perfil" (a página inicial)
// ============================================================
// O HTML já tem tudo escrito. Aqui só:
//   1. capa: nome, girafa (ou avatar) e números
//   2. família e tarefas (com filtros)
//   3. meta da criança
//   4. eventos
//   5. aviso de "subiu de nível"
// Todas as funções seguem a mesma ideia: pede para a API e monta o HTML com template string.

import { api, imagemDoBackend } from "../../services/api.js"
import { meuPerfil, criancasDaFamilia, nomeDoPapel, avatar } from "../../services/perfil.js"
import { girafaHtml } from "../../components/giraffe/giraffe.js"
import { escapeHtml, dataHora } from "../../utils/formatar.js"
import { situacao, linkTarefaCrianca, fotoUrl, preencherFormularioTarefa, lerFormularioTarefa } from "../../utils/tarefas.js"

const listaTarefas = document.querySelector("#lista-tarefas")
const familia = document.querySelector("#familia")
const caixaMeta = document.querySelector("#meta")
const listaEventos = document.querySelector("#lista-eventos")

const perfil = await meuPerfil()
const ehCrianca = perfil?.profile_type === "child"
const criancas = perfil && !ehCrianca ? await criancasDaFamilia() : []

// o que está escolhido nos filtros das tarefas
let filtro = ""          // ex: "status=late" (vem do data-filtro do botão)
let criancaId = null     // null = todas as crianças


// ============================================================
// 1. CAPA
// ============================================================
async function desenharCapa() {
    document.querySelector("#capa-nome").textContent = perfil.name
    document.querySelector("#capa-papel").textContent = ehCrianca ? `Nível ${perfil.level_id} · Criança` : nomeDoPapel(perfil)
    const fundo = document.querySelector("#capa-fundo")
    const figura = document.querySelector("#capa-figura")

    if (ehCrianca) {
        document.querySelector("#numero-moedas").textContent = perfil.coins
        document.querySelector("#numero-xp").textContent = perfil.xp

        // GET /girafas/me -> a capa é o cenário da girafa e a girafa fica na frente
        const girafa = await api("/girafas/me")
        if (!girafa) return
        fundo.src = imagemDoBackend(girafa.background.image_url)
        figura.innerHTML = girafaHtml(girafa, "hero-giraffe")
        figura.classList.add("hero-figure-giraffe")
        document.querySelector("#capa").classList.add("has-giraffe")
    } else {
        // responsável não tem girafa: a capa é sempre o mesmo cenário e no lugar vai o avatar
        document.querySelector("#numero-criancas").textContent = criancas.length
        fundo.src = imagemDoBackend("static/giraffes/backgrounds/background_10.png")
        figura.innerHTML = avatar(perfil, "avatar-gg")
        figura.classList.add("hero-figure-avatar")
        document.querySelector("#capa").classList.add("has-avatar")
    }
}


// ============================================================
// 2. FAMÍLIA E TAREFAS
// ============================================================

// Cartões das crianças. O primeiro ("Todas") tira o filtro.
function desenharFamilia() {
    familia.innerHTML = `
        <li><button type="button" class="family-card active" data-crianca="">
            <span class="family-card-all-icon"><i class="icone i-users"></i></span>
            <span class="family-card-text"><strong>Todas</strong><small>${criancas.length} crianças</small></span>
        </button></li>
        ${criancas.map((c) => `
        <li><button type="button" class="family-card" data-crianca="${c.id}">
            ${avatar(c)}
            <span class="family-card-text">
                <strong>${escapeHtml(c.name)}</strong>
                <small>Nível ${c.level_id} · <img class="moeda" src="../../assets/icons/coin-color.svg" alt=""> ${c.coins}</small>
            </span>
        </button></li>`).join("")}`
}

// Um cartão de tarefa. Os botões mudam conforme quem vê e o status.
function cartaoTarefa(tarefa) {
    const { chave, texto } = situacao(tarefa)
    const crianca = criancas.find((c) => c.id === tarefa.child_profile_id)

    // criança abre a parte dela; responsável abre a tarefa inteira (editar, aprovar...)
    const link = ehCrianca ? linkTarefaCrianca(tarefa) : `../task/task-responsible-view.html?task_id=${tarefa.task_id}`

    let botoes = `<a class="btn btn-sm" href="${link}">Abrir</a>`
    if (ehCrianca && (chave === "pending" || chave === "late")) {
        botoes = `<a class="btn-primary btn-sm" href="${link}">Fazer tarefa</a>`
    }
    if (!ehCrianca && tarefa.status === "awaiting_approval") {
        botoes = `
            <button type="button" class="btn btn-sm btn-danger" data-acao="reprovar" data-id="${tarefa.assignment_id}">Recusar</button>
            <button type="button" class="btn btn-sm btn-success" data-acao="aprovar" data-id="${tarefa.assignment_id}">Aprovar</button>`
    }
    if (tarefa.proof_photo) {
        botoes = `<button type="button" class="btn btn-sm btn-ghost" data-foto="${escapeHtml(tarefa.proof_photo)}"><i class="icone i-camera"></i> Ver foto</button>` + botoes
    }

    return `
        <article class="task-card task-${chave}">
            <div class="task-card-main">
                <h3 class="task-title"><a href="${link}">${escapeHtml(tarefa.name)}</a></h3>
                <p class="task-meta">
                    ${crianca ? `<span class="task-who">${avatar(crianca, "avatar-pp")} ${escapeHtml(crianca.name)}</span>` : ""}
                    <span class="task-meta-item"><i class="icone i-clock"></i> ${dataHora(tarefa.deadline)}</span>
                    ${Number(tarefa.required_proof) ? `<span class="task-meta-item"><i class="icone i-camera"></i> Precisa de foto</span>` : ""}
                </p>
            </div>
            <span class="tag tag-${chave} task-card-tag">${texto}</span>
            <div class="task-card-foot">
                <span class="task-rewards">
                    <span class="coin-amount"><img class="moeda" src="../../assets/icons/coin-color.svg" alt="">+${tarefa.coins_reward}</span>
                    <span class="xp-amount"><i class="icone i-star"></i>+${tarefa.xp_reward} XP</span>
                </span>
                <div class="task-card-actions">${botoes}</div>
            </div>
        </article>`
}

// GET /tarefas/listar -> { tasks: [...] }
// Sem filtro o backend devolve só as de hoje. 50 é o máximo que ele manda de uma vez.
async function carregarTarefas() {
    let endereco = `/tarefas/listar?size=50&${filtro}`
    if (criancaId) endereco += `&child_profile_id=${criancaId}`

    const resposta = await api(endereco)
    if (!resposta) return

    listaTarefas.innerHTML = resposta.tasks.length
        ? resposta.tasks.map(cartaoTarefa).join("")
        : `<div class="empty"><i class="icone icone-g i-check"></i><p>Nenhuma tarefa por aqui.</p></div>`
}

// Clique num filtro (Hoje / Em espera / Atrasadas / Próximas)
document.querySelector("#filtros").addEventListener("click", (evento) => {
    const botao = evento.target.closest("button")
    if (!botao) return
    document.querySelectorAll("#filtros button").forEach((b) => b.classList.remove("active"))
    botao.classList.add("active")
    filtro = botao.dataset.filtro
    carregarTarefas()
})

// Clique num cartão da família
familia.addEventListener("click", (evento) => {
    const cartao = evento.target.closest(".family-card")
    if (!cartao) return
    familia.querySelectorAll(".family-card").forEach((c) => c.classList.remove("active"))
    cartao.classList.add("active")
    criancaId = cartao.dataset.crianca || null
    carregarTarefas()
})

// Cliques nos botões dos cartões de tarefa
listaTarefas.addEventListener("click", async (evento) => {
    const botao = evento.target.closest("button")
    if (!botao) return

    // ver foto: coloca a foto na janelinha e abre
    if (botao.dataset.foto) {
        document.querySelector("#foto-grande").src = fotoUrl(botao.dataset.foto)
        document.querySelector("#dialogo-foto").showModal()
        return
    }

    // POST /tarefas/<id>/aprovar  ou  /tarefas/<id>/reprovar
    botao.disabled = true
    if (await api(`/tarefas/${botao.dataset.id}/${botao.dataset.acao}`, { method: "POST" })) carregarTarefas()
    botao.disabled = false
})

// Nova tarefa: abre a janelinha (o formulário está no HTML)
document.querySelector("#nova-tarefa").addEventListener("click", () => {
    preencherFormularioTarefa(criancas)
    document.querySelector("#dialogo-tarefa").showModal()
})

// POST /tarefas/criar
document.querySelector("#form-tarefa").addEventListener("submit", async (evento) => {
    evento.preventDefault()   // não deixa o formulário recarregar a página
    const criou = await api("/tarefas/criar", {
        method: "POST",
        body: lerFormularioTarefa(),
        mensagem: document.querySelector("#tarefa-mensagem"),
    })
    if (!criou) return
    document.querySelector("#dialogo-tarefa").close()
    carregarTarefas()
})


// ============================================================
// 3. META DA CRIANÇA
// ============================================================
// GET /recompensas/meta -> { reward_id, reward_name, reward_amount, child_coins }
// Se a criança já juntou moedas suficientes, a recompensa é comprada sozinha.
async function carregarMeta() {
    const meta = await api("/recompensas/meta")
    if (!meta) return

    if (!meta.reward_id) {
        caixaMeta.innerHTML = `
            <p class="goal-empty">Escolha uma recompensa para juntar moedas até ela.</p>
            <a class="btn btn-sm" href="../reward/reward.html">Escolher uma meta</a>`
        return
    }

    if (meta.child_coins >= meta.reward_amount) {
        const crianca = await api(`/recompensas/comprar/${meta.reward_id}`, { method: "POST" })
        if (crianca) {
            document.querySelector("#numero-moedas").textContent = crianca.coins
            caixaMeta.innerHTML = `<p class="mensagem sucesso">Você juntou o suficiente e ganhou "${escapeHtml(meta.reward_name)}"! Peça para um responsável entregar.</p>`
            return
        }
    }

    // porcentagem da barra (no máximo 100%)
    const porcentagem = Math.min(100, Math.round((meta.child_coins / meta.reward_amount) * 100))

    caixaMeta.innerHTML = `
        <p class="goal-name">${escapeHtml(meta.reward_name)}</p>
        <div class="progress"><span style="width:${porcentagem}%"></span></div>
        <p class="goal-numbers">
            <span class="coin-amount"><img class="moeda" src="../../assets/icons/coin-color.svg" alt="">${meta.child_coins} de ${meta.reward_amount}</span>
            <span class="goal-missing">faltam ${meta.reward_amount - meta.child_coins}</span>
        </p>
        <div class="goal-actions">
            <a class="btn btn-sm btn-ghost" href="../reward/reward.html">Trocar meta</a>
            <button type="button" class="btn btn-sm btn-ghost" id="remover-meta">Remover</button>
        </div>`

    // DELETE /recompensas/meta
    document.querySelector("#remover-meta").addEventListener("click", async () => {
        if (await api("/recompensas/meta", { method: "DELETE" })) carregarMeta()
    })
}


// ============================================================
// 4. EVENTOS
// ============================================================
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]

// GET /eventos/?per_page=50 -> { events: [...], total }
async function carregarEventos() {
    const resposta = await api("/eventos/?page=1&per_page=50")
    if (!resposta) return
    document.querySelector("#numero-eventos").textContent = resposta.total

    listaEventos.innerHTML = resposta.events.length
        ? resposta.events.map((evento) => {
            const [, mes, dia] = evento.event_date.split("-")   // "2026-11-14" -> ["2026", "11", "14"]
            return `
                <article class="event-card">
                    <div class="event-date"><span class="event-day">${dia}</span><span class="event-month">${MESES[mes - 1]}</span></div>
                    <h3 class="event-name">${escapeHtml(evento.name)}</h3>
                </article>`
        }).join("")
        : `<div class="empty"><p>Nenhum evento marcado.</p></div>`
}

document.querySelector("#novo-evento").addEventListener("click", () => {
    document.querySelector("#dialogo-evento").showModal()
})

// POST /eventos/criar com { name, eventDate }
document.querySelector("#form-evento").addEventListener("submit", async (evento) => {
    evento.preventDefault()
    const criou = await api("/eventos/criar", {
        method: "POST",
        body: {
            name: document.querySelector("#evento-nome").value.trim(),
            eventDate: document.querySelector("#evento-data").value,
        },
        mensagem: document.querySelector("#evento-mensagem"),
    })
    if (!criou) return
    document.querySelector("#dialogo-evento").close()
    document.querySelector("#form-evento").reset()   // limpa os campos
    carregarEventos()
})


// ============================================================
// 5. SUBIU DE NÍVEL
// ============================================================
// GET /niveis/pendente -> { pending, to_level, unlocked_items }
// Quando a janelinha fecha, avisa o backend (POST /niveis/visto) para não mostrar de novo.
async function verificarNivel() {
    const nivel = await api("/niveis/pendente")
    if (!nivel?.pending) return

    document.querySelector("#nivel-numero").textContent = nivel.to_level
    document.querySelector("#nivel-itens").innerHTML = nivel.unlocked_items.map((item) => `
        <li><img class="level-up-thumb" src="${imagemDoBackend(item.image_url)}" alt=""> ${escapeHtml(item.name)}</li>
    `).join("")

    const dialogo = document.querySelector("#dialogo-nivel")
    dialogo.addEventListener("close", () => api("/niveis/visto", { method: "POST", body: { level: nivel.to_level } }))
    dialogo.showModal()
}


// ============================================================
// COMEÇO
// ============================================================
if (perfil) {
    desenharCapa()
    carregarEventos()

    if (ehCrianca) {
        carregarTarefas()
        carregarMeta()
        verificarNivel()
    } else if (criancas.length === 0) {
        // responsável sem crianças: só mostra o aviso (o CSS esconde o resto)
        document.querySelector("#sem-criancas").hidden = false
    } else {
        desenharFamilia()
        carregarTarefas()
    }
}
