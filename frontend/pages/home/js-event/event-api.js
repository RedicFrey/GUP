import { apiFetch, showMessage, goToLogin } from '../../../services/api.js'

export async function eventsListApi(message, page = 1, perPage = 10) {
  const { ok, status, dados } = await apiFetch(`/eventos/?page=${page}&per_page=${perPage}`)

  if (status === 401) {
    goToLogin(dados?.erro)
    return
  }

  if (!ok) {
    showMessage(message, dados?.erro || "Erro ao carregar eventos.", "erro")
    return
  }

  return dados
}

export async function createEventApi(eventName, eventDate, message) {
  const { ok, status, dados } = await apiFetch("/eventos/criar", {
    method: "POST",
    body: { name: eventName, eventDate: eventDate },
  })

  if (status === 401) {
    goToLogin(dados?.erro)
    return false
  }

  if (!ok) {
    showMessage(message, dados?.erro || "Erro ao criar evento.", "erro")
    return false
  }

  return true
}
