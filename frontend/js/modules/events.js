import { paginate } from '../generic/pagination.js'

const DASHBOARD_LIMIT = 7       // eventos que aparecem no dashboard
const DIALOG_PAGE_SIZE = 15     // eventos por página no dialog

// cópia local; o ideal é mover o escapeHtml para o generic/utils.js e importar de lá
const escapeHtml = (v = '') => String(v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const eventCardHtml = (event) => `
  <div class="tarefa-card">
    <h3>📅 ${escapeHtml(event.name)}</h3>
    <p><strong>Data:</strong> ${formatarData(event.event_date)}</p>
  </div>
`


// ---------- Dashboard: só os primeiros 7 ----------

export async function renderEvents(container, profile_type) {
  const divtitleEvents = document.createElement("div")
  divtitleEvents.innerHTML = `<h2 class="title-page">Eventos</h2>`
  const divCreateEvent = document.createElement("div")
  const divListEvents = document.createElement("div")
  container.append(divtitleEvents, divCreateEvent, divListEvents)

  if (profile_type === "responsible") {
    divCreateEvent.innerHTML = `<button type="button" id="btn-create-event" class="btn-create">Criar Evento</button>`
    divCreateEvent.querySelector("#btn-create-event").addEventListener("click", () => {
      createEvents(() => loadListEvents(divListEvents))
    })
  }

  loadListEvents(divListEvents)
}

async function loadListEvents(divContainer) {
  const erroEventMessage = document.createElement("p")
  divContainer.append(erroEventMessage)

  try {
    const response = await eventsListApi(erroEventMessage, 1, DASHBOARD_LIMIT)
    if (!response) return      // deu erro: a mensagem já está na tela

    doListEvents(divContainer, response.events, response.total)
  } catch {
    // tratar depois
  }
}

function doListEvents(divContainer, events, total) {
  const listaHtml = events?.length
    ? events.map(eventCardHtml).join("")
    : `<p>Nenhum evento cadastrado ainda.</p>`

  // só oferece o dialog se existem mais eventos do que os que já aparecem aqui
  const seeMoreHtml = total > DASHBOARD_LIMIT
    ? `<button type="button" id="see-more-events">Ver mais</button>`
    : ""

  divContainer.innerHTML = `
    ${listaHtml}
    ${seeMoreHtml}
  `

  divContainer.querySelector("#see-more-events")
    ?.addEventListener("click", () => dialogFullEvents(total))
}


// ---------- API ----------

// GET /eventos/?page=1&per_page=7  ->  { events, total, page, per_page }
async function eventsListApi(message, page = 1, perPage = DASHBOARD_LIMIT) {
  const { ok, status, dados } = await apiFetch(`/eventos/?page=${page}&per_page=${perPage}`)

  if (status === 401) {
    window.location.href = "auth.html"
    return
  }

  if (!ok) {
    mostrarMensagem(message, dados?.erro || "Erro ao carregar eventos.", "erro")
    return
  }

  return dados
}


// ---------- Dialog: todos os eventos, com paginação ----------

// total: vem do backend (a mesma resposta que montou o dashboard)
async function dialogFullEvents(total) {
  const dialog = document.createElement("dialog")
  dialog.className = "dialog-event"
  document.body.append(dialog)
  dialog.addEventListener("close", () => dialog.remove())

  dialog.innerHTML = `
    <div>
      <button type="button" id="close-full-events">Fechar</button>
    </div>
    <h3>Todos os eventos</h3>
    <div id="full-events-list"></div>
    <p id="full-events-error"></p>
  `

  dialog.querySelector("#close-full-events").addEventListener("click", () => dialog.close())

  const list = dialog.querySelector("#full-events-list")
  const message = dialog.querySelector("#full-events-error")

  dialog.showModal()

  try {
    await paginate({
      total,
      container: list,
      pageSize: DIALOG_PAGE_SIZE,
      mode: "pages",
      empty: "<p>Nenhum evento cadastrado ainda.</p>",
      // o paginate diz qual página quer; o controller recebe page e per_page e calcula offset e limit
      fetchPage: async (page, size) => {
        const response = await eventsListApi(message, page, size)
        if (!response) throw new Error("Falha ao carregar os eventos")   // o paginate mantém a página anterior
        return response.events
      },
      renderItems: (events) => events.map(eventCardHtml).join(""),
    })
  } catch {
    // tratar depois
  }
}


// ---------- Criar evento ----------

async function createEvents(onSaved) {
  const dialogCreateEvent = document.createElement("dialog")
  document.body.append(dialogCreateEvent)

  dialogCreateEvent.innerHTML = `
    <div>
      <button type="button" id="go-back">Voltar</button>
    </div>
    <form>
      <div>
        <label for="event-name-dialog">Nome do evento</label>
        <input id="event-name-dialog" type="text" placeholder="dia das crianças">
      </div>
      <div>
        <label for="event-date-dialog">Data do evento</label>
        <input id="event-date-dialog" type="date">
      </div>
      <button type="submit">Enviar</button>
    </form>
    <p id="event-erro-message"></p>
  `

  dialogCreateEvent.querySelector("#go-back")
    .addEventListener("click", () => dialogCreateEvent.close())

  dialogCreateEvent.addEventListener("close", () => dialogCreateEvent.remove())

  dialogCreateEvent.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault()

    const eventName = dialogCreateEvent.querySelector("#event-name-dialog").value.trim()
    const eventDate = dialogCreateEvent.querySelector("#event-date-dialog").value.trim()
    const eventMessageErro = dialogCreateEvent.querySelector("#event-erro-message")

    const created = await createEventApi(eventName, eventDate, eventMessageErro)
    if (!created) return

    dialogCreateEvent.close()
    onSaved?.()
  })

  dialogCreateEvent.showModal()
}

async function createEventApi(eventName, eventDate, message) {
  if (!eventName || !eventDate) {
    mostrarMensagem(message, "Preencha nome e data do evento.", "erro")
    return false
  }

  const { ok, status, dados } = await apiFetch("/eventos/criar", {
    method: "POST",
    body: { name: eventName, eventDate: eventDate },
  })

  if (status === 401) {
    window.location.href = "auth.html"
    return false
  }

  if (!ok) {
    mostrarMensagem(message, dados?.erro || "Erro ao criar evento.", "erro")
    return false
  }

  return true
}
