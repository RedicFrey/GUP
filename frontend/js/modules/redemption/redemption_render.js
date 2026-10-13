import { paginate } from '../../generic/pagination.js'
import { escapeHtml } from '../../generic/utils.js'

const URL_STATUS_RESGATE = "/resgates_feitos/confirmar"

// quantos resgates por página (o redemption.js usa o mesmo valor ao buscar)
export const PAGE_SIZE = 10

const svg = (path) => `
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
       stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`

// pending mostra o V (marcar como feito); done mostra o X (desmarcar)
const STATUS_BTN = {
  pending: { className: "redeem-pending", label: "Marcar como feito", icon: svg('<path d="M5 13l4 4L19 7"/>') },
  done:    { className: "redeem-done",    label: "Desmarcar",         icon: svg('<path d="M6 6l12 12M18 6L6 18"/>') },
}

// Escolher o filho: só para o responsável. Criança não vê.
export function renderizarFiltro(criancas, criancaAtualId, isResponsible, filtroCriancas) {
    if (!isResponsible || !criancas?.length) {
        filtroCriancas.innerHTML = "";
        return;
    }

    filtroCriancas.innerHTML =
        "<strong>Ver resgates de:</strong> " +
        criancas
        .map((c) => {
            const params = new URLSearchParams();
            params.set("profile_id", c.id);
            const ativo = c.id == criancaAtualId ? "ativo" : "";
            return `<a class="chip ${ativo}" href="redemption.html?${params.toString()}">${c.name}</a>`;
        })
        .join(" ");
}

// Botão de status: só o responsável vê
const statusButtonHtml = (r, isResponsible) => {
    const state = STATUS_BTN[r.status]
    if (!isResponsible || !state) return ""
    return `
        <button type="button" class="redeem-btn ${state.className}"
                data-id="${escapeHtml(r.id)}" data-status="${escapeHtml(r.status)}"
                title="${state.label}" aria-label="${state.label}">
        ${state.icon}
        </button>`
}

const resgateHtml = (isResponsible) => (r) => `
    <div class="resgates-realizados">
        <div>
        <p class="nome-resgate">${escapeHtml(r.name)}</p>
        <p>${r.amount} moedas — ${formatarDataEHorario(r.created_at)}</p>
        </div>
        ${statusButtonHtml(r, isResponsible)}
    </div>
`;

function showError(text) {
  const el = document.querySelector("#mensagem")
  if (el) mostrarMensagem(el, text, "erro")
  else alert(text)
}

// Um clique no botão: manda o id e o status atual; se der certo, troca ícone e cor no lugar.
// O status atual fica no próprio botão (data-status), porque cada página é buscada de novo no back.
function bindStatusClick(listaResgates) {
  listaResgates.onclick = async (event) => {
    const btn = event.target.closest(".redeem-btn")
    if (!btn) return

    btn.disabled = true

    const { ok, status, dados } = await apiFetch(URL_STATUS_RESGATE, {
      method: "PUT",
      body: { id: Number(btn.dataset.id), status: btn.dataset.status },   // o status que está agora
    })

    if (status === 401) {
      window.location.href = "auth.html"
      return
    }
    if (!ok) {
      showError(dados?.erro || "Erro ao atualizar o resgate.")
      btn.disabled = false
      return
    }

    const nextStatus = btn.dataset.status === "pending" ? "done" : "pending"
    const next = STATUS_BTN[nextStatus]

    btn.dataset.status = nextStatus
    btn.className = `redeem-btn ${next.className}`
    btn.innerHTML = next.icon
    btn.title = next.label
    btn.setAttribute("aria-label", next.label)
    btn.disabled = false
  }
}

// Paginação por página (Anterior, 1 2 3, Próxima), com busca no back a cada página.
//   total      -> COUNT(*) devolvido pelo back
//   fetchPage  -> async (pagina, tamanho) => lista de resgates daquela página
export function renderizarResgates(total, listaResgates, isResponsible, fetchPage) {
  bindStatusClick(listaResgates)

  return paginate({
    total,
    container: listaResgates,
    fetchPage,
    renderItems: (parte) => parte.map(resgateHtml(isResponsible)).join(""),
    pageSize: PAGE_SIZE,
    mode: "pages",
    empty: "<p>Nenhum resgate realizado ainda.</p>",
  })
}
