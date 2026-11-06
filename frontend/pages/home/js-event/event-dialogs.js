import { paginate } from '../../../utils/pagination.js'
import { escapeHtml } from '../../../utils/escape-html.js'
import { separarData, diasAte } from '../../../utils/formatar.js'
import { pixelIcon } from '../../../assets/icons/pixel-icons.js'
import { showMessage } from '../../../services/api.js'
import { eventsListApi, createEventApi } from './event-api.js'

const DIALOG_PAGE_SIZE = 15

const pad = (n) => String(n).padStart(2, "0")

const todayInputValue = () => {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function dialogHead(title) {
  return `
    <div class="task-dialog-head">
      <h3 class="dialog-title">${escapeHtml(title)}</h3>
      <button type="button" class="btn btn-ghost btn-icon" data-close aria-label="Fechar">
        ${pixelIcon("close", { size: 16 })}
      </button>
    </div>`
}

// usado aqui e no perfil
export const eventCardHtml = (event) => {
  const { dia, mes } = separarData(event.event_date)

  return `
    <article class="event-card">
      <div class="event-date" aria-hidden="true">
        <span class="event-day">${dia}</span>
        <span class="event-month">${mes}</span>
      </div>
      <div class="event-text">
        <h3 class="event-name">${escapeHtml(event.name)}</h3>
        <p class="event-when">${escapeHtml(diasAte(event.event_date))}</p>
      </div>
    </article>
  `
}

export async function dialogFullEvents(total) {
  const dialog = document.createElement("dialog")
  dialog.className = "dialog-event"
  document.body.append(dialog)
  dialog.addEventListener("close", () => dialog.remove())

  dialog.innerHTML = `
    ${dialogHead("Todos os eventos")}
    <div id="full-events-list" class="events-list"></div>
    <p id="full-events-error" class="mensagem"></p>
  `

  dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close())

  const list = dialog.querySelector("#full-events-list")
  const message = dialog.querySelector("#full-events-error")

  dialog.showModal()

  try {
    await paginate({
      total,
      container: list,
      pageSize: DIALOG_PAGE_SIZE,
      mode: "pages",
      empty: `<div class="empty"><p>Nenhum evento marcado ainda.</p></div>`,
      fetchPage: async (page, size) => {
        const response = await eventsListApi(message, page, size)
        if (!response) throw new Error("Falha ao carregar os eventos")
        return response.events
      },
      renderItems: (events) => events.map(eventCardHtml).join(""),
    })
  } catch (err) {
    console.error(err)
  }
}


// -- Criar evento --
export async function createEvents(onSaved) {
  const dialogCreateEvent = document.createElement("dialog")
  document.body.append(dialogCreateEvent)

  dialogCreateEvent.innerHTML = `
    ${dialogHead("Novo evento")}
    <form>
      <div class="field">
        <label for="event-name-dialog">Nome do evento</label>
        <input id="event-name-dialog" type="text" maxlength="30" placeholder="Aniversário da vovó">
      </div>
      <div class="field">
        <label for="event-date-dialog">Data</label>
        <input id="event-date-dialog" type="date" min="${todayInputValue()}">
      </div>
      <p id="event-erro-message" class="mensagem"></p>
      <div class="dialog-actions">
        <button type="button" class="btn btn-ghost" id="go-back">Cancelar</button>
        <button type="submit" class="btn-primary">Criar evento</button>
      </div>
    </form>
  `

  dialogCreateEvent.querySelector("#go-back")
    .addEventListener("click", () => dialogCreateEvent.close())
  dialogCreateEvent.querySelector("[data-close]")
    .addEventListener("click", () => dialogCreateEvent.close())

  dialogCreateEvent.addEventListener("close", () => dialogCreateEvent.remove())

  dialogCreateEvent.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault()

    const eventName = dialogCreateEvent.querySelector("#event-name-dialog").value.trim()
    const eventDate = dialogCreateEvent.querySelector("#event-date-dialog").value.trim()
    const eventMessageErro = dialogCreateEvent.querySelector("#event-erro-message")

    if (!eventName || !eventDate) {
      showMessage(eventMessageErro, "Preencha o nome e a data do evento.", "erro")
      return
    }
    if (eventDate < todayInputValue()) {
      showMessage(eventMessageErro, "Escolha uma data de hoje em diante.", "erro")
      return
    }

    const created = await createEventApi(eventName, eventDate, eventMessageErro)
    if (!created) return

    dialogCreateEvent.close()
    onSaved?.()
  })

  dialogCreateEvent.showModal()
}
