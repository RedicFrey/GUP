import { eventsListApi } from './event-api.js'
import { eventCardHtml, dialogFullEvents, createEvents } from './event-dialogs.js'
import { pixelIcon } from '../../../assets/icons/pixel-icons.js'

const DASHBOARD_LIMIT = 4

// container: a seção de eventos (tem .events-list e .div-create-event dentro)
// onTotal(total): avisa quantos eventos existem (vai para os números do perfil)
export async function renderEvents(container, profile_type, { onTotal } = {}) {
  const divListEvents = container.querySelector('.events-list')
  const divCreateEvent = container.querySelector('.div-create-event')

  if (profile_type === "responsible" && divCreateEvent) {
    divCreateEvent.innerHTML = `
      <button type="button" id="btn-create-event" class="btn btn-sm">
        ${pixelIcon("plus", { size: 12 })} Novo
      </button>`
    divCreateEvent.querySelector("#btn-create-event").addEventListener("click", () => {
      createEvents(() => loadListEvents(divListEvents, onTotal))
    })
  }

  loadListEvents(divListEvents, onTotal)
}

async function loadListEvents(divContainer, onTotal) {
  const erroEventMessage = document.createElement("p")
  erroEventMessage.className = "mensagem"
  divContainer.replaceChildren(erroEventMessage)

  try {
    const response = await eventsListApi(erroEventMessage, 1, DASHBOARD_LIMIT)
    if (!response) return

    onTotal?.(response.total ?? 0)
    doListEvents(divContainer, response.events, response.total)
  } catch (err) {
    console.error(err)
  }
}

function doListEvents(divContainer, events, total) {
  const listaHtml = events?.length
    ? events.map(eventCardHtml).join("")
    : `<div class="empty">${pixelIcon("calendar", { size: 24 })}<p>Nenhum evento marcado.</p></div>`

  const seeMoreHtml = total > DASHBOARD_LIMIT
    ? `<button type="button" id="see-more-events" class="btn btn-ghost btn-sm btn-block">Ver todos os ${total} eventos</button>`
    : ""

  divContainer.innerHTML = `
    ${listaHtml}
    ${seeMoreHtml}
  `

  divContainer.querySelector("#see-more-events")
    ?.addEventListener("click", () => dialogFullEvents(total))
}
