import { sideBar, refreshSidebarCoins } from '../../components/sidebar/sidebar.js'
import { warning } from '../../components/confirm-modal/confirm-modal.js'
import { escapeHtml } from '../../utils/escape-html.js'
import { pixelIcon } from '../../assets/icons/pixel-icons.js'
import { apiFetch, showMessage, goToLogin } from '../../services/api.js'

const createRewardDiv = document.querySelector('.create-reward-actions')
const rewardList = document.querySelector('.rewards-list')
const mensagem = document.querySelector("#mensagem")
const subtitle = document.querySelector("#reward-sub")

// cor do "presente" de cada recompensa (sempre a mesma para o mesmo id)
const GIFT_COLORS = ["#ffc23d", "#8794ff", "#4cd38a", "#ff8a96", "#ff9f5a", "#c9a0ff", "#5fd8e6"]

let rewardsById = new Map()

sideBar()

async function loadReward() {
  const { ok, status, dados } = await apiFetch("/recompensas/")

  if (status === 401) { goToLogin(dados?.erro); return }
  if (!ok) {
    rewardList.innerHTML = ""
    showMessage(mensagem, dados?.erro || "Não foi possível carregar as recompensas.", "erro")
    return
  }

  const isResponsible = dados.profile_type === "responsible"
  const child = dados.auth_child

  rewardsById = new Map((dados.rewards ?? []).map((r) => [String(r.id), r]))

  renderHeader(isResponsible, child)
  renderRewards(dados.rewards ?? [], isResponsible, child)
}

function renderHeader(isResponsible, child) {
  createRewardDiv.replaceChildren()

  if (!isResponsible) {
    subtitle.textContent = "Troque suas moedas por prêmios, ou escolha um para ser a sua meta."
    createRewardDiv.innerHTML = `
      <p class="wallet-pill" aria-label="Suas moedas">
        ${pixelIcon("coinColor", { size: 20 })}
        <span>${escapeHtml(child?.coins ?? 0)}</span>
      </p>`
    return
  }

  subtitle.textContent = "Os prêmios que as crianças podem trocar pelas moedas das tarefas."

  const btn = document.createElement("button")
  btn.type = "button"
  btn.id = "btn-create-reward"
  btn.className = "btn-primary"
  btn.innerHTML = `${pixelIcon("plus", { size: 14 })} Nova recompensa`

  const dialog = document.createElement("dialog")
  dialog.id = "form-create-reward"
  dialog.className = "task-dialog"
  createRewardDiv.append(btn)
  document.body.append(dialog)

  btn.addEventListener("click", () => {
    loadDialog(dialog)
    dialog.showModal()
  })
}

function giftColor(id) {
  return GIFT_COLORS[Math.abs(Number(id) || 0) % GIFT_COLORS.length]
}

function actionHtml(r, isResponsible, child) {
  if (isResponsible) {
    return `<button type="button" class="btn btn-sm btn-ghost btn-delete" data-acao="deletar" data-id="${escapeHtml(r.id)}">
      ${pixelIcon("trash", { size: 12 })} Excluir</button>`
  }

  const coins = Number(child?.coins) || 0
  const isGoal = String(child?.goal_id) === String(r.id)

  if (coins >= r.amount) {
    return `<button type="button" class="btn-primary btn-buy" data-acao="comprar" data-id="${escapeHtml(r.id)}">Trocar agora</button>`
  }

  const percent = Math.min(100, Math.round((coins / r.amount) * 100))
  return `
    <div class="progress" aria-hidden="true"><span style="--value:${percent}%"></span></div>
    <p class="reward-missing">Faltam ${escapeHtml(r.amount - coins)} moedas</p>
    ${isGoal
      ? `<p class="reward-goal-tag">${pixelIcon("flag", { size: 14 })} Sua meta</p>`
      : `<button type="button" class="btn btn-sm" data-acao="meta" data-id="${escapeHtml(r.id)}">${pixelIcon("flag", { size: 12 })} Virar minha meta</button>`}
  `
}

function renderRewards(rewards, isResponsible, child) {
  if (!rewards.length) {
    rewardList.innerHTML = `
      <li class="empty">
        ${pixelIcon("gift", { size: 32 })}
        <p>${isResponsible
          ? "Ainda não há recompensas. Crie a primeira para as crianças terem um objetivo."
          : "Ainda não há recompensas. Peça para um responsável criar algumas!"}</p>
      </li>`
    return
  }

  const sorted = [...rewards].sort((a, b) => a.amount - b.amount)

  rewardList.innerHTML = sorted.map((r) => {
    const isGoal = !isResponsible && String(child?.goal_id) === String(r.id)
    return `
      <li class="reward-card ${isGoal ? "is-goal" : ""}">
        <span class="reward-gift" style="--gift:${giftColor(r.id)}">${pixelIcon("gift", { size: 40 })}</span>
        <h2 class="reward-name">${escapeHtml(r.name)}</h2>
        <p class="reward-price coin-amount">${pixelIcon("coinColor", { size: 16 })}${escapeHtml(r.amount)}</p>
        <div class="acoes">${actionHtml(r, isResponsible, child)}</div>
      </li>`
  }).join("")
}

rewardList.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-acao]")
  if (!btn) return

  const { acao, id } = btn.dataset
  if (acao === "deletar") deleteReward(id)
  if (acao === "comprar") buyReward(id)
  if (acao === "meta") goalChoice(id)
})

// -- Dialog --
function loadDialog(dialog) {
  dialog.innerHTML = `
    <div class="task-dialog-head">
      <h3 class="dialog-title">Nova recompensa</h3>
      <button type="button" class="btn btn-ghost btn-icon" data-close aria-label="Fechar">
        ${pixelIcon("close", { size: 16 })}
      </button>
    </div>
    <form id="form-recompensa">
      <div class="field">
        <label for="name-reward">Nome da recompensa</label>
        <input type="text" id="name-reward" maxlength="30" placeholder="Cinema no sábado" required>
      </div>
      <div class="field">
        <label for="amount">Quantas moedas custa</label>
        <input type="number" id="amount" min="1" step="1" inputmode="numeric" placeholder="150" required>
      </div>
      <p id="reward-form-message" class="mensagem"></p>
      <div class="dialog-actions">
        <button type="button" class="btn btn-ghost" id="btn-fechar">Cancelar</button>
        <button type="submit" class="btn-primary">Criar recompensa</button>
      </div>
    </form>
  `

  const formReward = dialog.querySelector("#form-recompensa")
  dialog.querySelectorAll("#btn-fechar, [data-close]").forEach((b) => b.addEventListener("click", () => dialog.close()))

  formReward.addEventListener("submit", (e) => {
    e.preventDefault()
    createReward(dialog, formReward)
  })
}

// -- Api --
async function createReward(dialog, formReward) {
  const dados = {
    name: formReward.querySelector("#name-reward").value.trim(),
    amount: formReward.querySelector("#amount").value,
  }

  const { ok, dados: resposta } = await apiFetch("/recompensas/criar", {
    method: "POST",
    body: dados,
  })

  if (!ok) {
    showMessage(formReward.querySelector("#reward-form-message"), resposta?.erro || "Não foi possível criar a recompensa.", "erro")
    return
  }

  formReward.reset()
  dialog.close()
  loadReward()
}

async function rewardAction(path, method, errorMessage) {
  const { ok, status, dados } = await apiFetch(path, { method })

  if (status === 401) {
    goToLogin(dados?.erro)
    return null
  }

  if (!ok) {
    showMessage(mensagem, dados?.erro || errorMessage, "erro")
    return null
  }

  mensagem.className = "mensagem"
  mensagem.textContent = ""
  return dados ?? {}
}

async function deleteReward(rewardId) {
  const reward = rewardsById.get(String(rewardId))
  const confirmed = await warning(`Excluir a recompensa "${reward?.name ?? ""}"?`, { confirmLabel: "Excluir" })
  if (!confirmed) return

  const deleted = await rewardAction(`/recompensas/deletar/${rewardId}`, "DELETE", "Não foi possível excluir a recompensa.")
  if (deleted) loadReward()
}

async function goalChoice(rewardId) {
  const done = await rewardAction(`/recompensas/definir-meta/${rewardId}`, "POST", "Não foi possível definir a meta.")
  if (done) loadReward()
}

async function buyReward(rewardId) {
  const reward = rewardsById.get(String(rewardId))
  const confirmed = await warning(
    `Trocar ${reward?.amount ?? ""} moedas por "${reward?.name ?? ""}"?`,
    { confirmLabel: "Trocar", cancelLabel: "Agora não", tone: "primary" }
  )
  if (!confirmed) return

  const child = await rewardAction(`/recompensas/comprar/${rewardId}`, "POST", "Não foi possível trocar as moedas.")
  if (!child) return

  if (child.coins !== undefined) refreshSidebarCoins(child.coins)
  showMessage(mensagem, `Pronto! "${reward?.name ?? "A recompensa"}" foi para os seus resgates. Avise um responsável.`, "sucesso")
  loadReward()
}

loadReward()
