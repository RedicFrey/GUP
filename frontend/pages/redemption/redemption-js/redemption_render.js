import { paginate } from '../../../utils/pagination.js'
import { escapeHtml } from '../../../utils/escape-html.js'
import { formatarDataEHorario } from '../../../utils/formatar.js'
import { pixelIcon } from '../../../assets/icons/pixel-icons.js'
import { avatar } from '../../../components/avatar/avatar.js'
import { apiFetch, showMessage, goToLogin } from '../../../services/api.js'

const URL_STATUS_RESGATE = "/resgates_feitos/confirmar"

export const PAGE_SIZE = 10

const STATUS = {
  pending: { tag: "tag-awaiting", label: "Falta entregar", action: "Marcar como entregue", btn: "btn-success" },
  done: { tag: "tag-done", label: "Entregue", action: "Desfazer", btn: "btn-ghost" },
}

export function renderizarFiltro(criancas, criancaAtualId, isResponsible, filtroCriancas) {
  if (!isResponsible || !criancas?.length) {
    filtroCriancas.innerHTML = ""
    return
  }

  // sem criança na URL, o back mostra a primeira
  const atual = criancaAtualId ?? criancas[0]?.id

  filtroCriancas.innerHTML = `
    <nav class="chip-row" aria-label="Escolher criança">
      ${criancas.map((c) => {
        const params = new URLSearchParams({ profile_id: c.id })
        const ativo = String(c.id) === String(atual)
        return `<a class="chip ${ativo ? "ativo" : ""}" ${ativo ? 'aria-current="true"' : ""}
          href="redemption.html?${params}">${avatar(c, { size: 28 })}${escapeHtml(c.name)}</a>`
      }).join("")}
    </nav>`
}

const statusAreaHtml = (r, isResponsible) => {
  const state = STATUS[r.status] ?? STATUS.pending
  const tag = `<span class="tag ${state.tag}">${state.label}</span>`
  if (!isResponsible || !STATUS[r.status]) return tag

  return `
    ${tag}
    <button type="button" class="btn btn-sm ${state.btn} redeem-btn"
      data-id="${escapeHtml(r.id)}" data-status="${escapeHtml(r.status)}">${state.action}</button>`
}

const resgateHtml = (isResponsible) => (r) => `
  <li class="resgates-realizados ${r.status === "done" ? "is-done" : ""}">
    <span class="redemption-icon">${pixelIcon("gift", { size: 24 })}</span>
    <div class="redemption-text">
      <p class="nome-resgate">${escapeHtml(r.name)}</p>
      <p class="horario-resgate">${escapeHtml(formatarDataEHorario(r.created_at))}</p>
    </div>
    <span class="valor-resgate coin-amount">${pixelIcon("coinColor", { size: 14 })}${escapeHtml(r.amount)}</span>
    <div class="redemption-status">${statusAreaHtml(r, isResponsible)}</div>
  </li>
`

function bindStatusClick(listaResgates, isResponsible) {
  listaResgates.onclick = async (event) => {
    const btn = event.target.closest(".redeem-btn")
    if (!btn) return

    btn.disabled = true

    const { ok, status, dados } = await apiFetch(URL_STATUS_RESGATE, {
      method: "PUT",
      body: { id: Number(btn.dataset.id), status: btn.dataset.status },
    })

    if (status === 401) {
      goToLogin(dados?.erro)
      return
    }
    if (!ok) {
      showMessage(document.querySelector("#mensagem"), dados?.erro || "Não foi possível atualizar o resgate.", "erro")
      btn.disabled = false
      return
    }

    // troca o status na tela sem recarregar
    const nextStatus = btn.dataset.status === "pending" ? "done" : "pending"
    const row = btn.closest(".resgates-realizados")
    row.classList.toggle("is-done", nextStatus === "done")
    row.querySelector(".redemption-status").innerHTML =
      statusAreaHtml({ id: btn.dataset.id, status: nextStatus }, isResponsible)
  }
}

export function renderizarResgates(total, listaResgates, isResponsible, fetchPage) {
  bindStatusClick(listaResgates, isResponsible)

  return paginate({
    total,
    container: listaResgates,
    fetchPage,
    renderItems: (parte) => parte.map(resgateHtml(isResponsible)).join(""),
    pageSize: PAGE_SIZE,
    mode: "pages",
    empty: `<li class="empty">${pixelIcon("ticket", { size: 28 })}<p>${isResponsible
      ? "Nenhuma recompensa foi trocada ainda."
      : "Você ainda não trocou moedas por nenhuma recompensa."}</p></li>`,
  })
}
