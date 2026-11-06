import { sideBar } from '../../../components/sidebar/sidebar.js'
import { renderizarFiltro, renderizarResgates, PAGE_SIZE } from './redemption_render.js'
import { withoutChildren } from '../../../components/confirm-modal/confirm-modal.js'
import { loadFamilyContext } from '../../../utils/family-context.js'
import { apiFetch, showMessage, goToLogin } from '../../../services/api.js'

const redemptionList = document.querySelector('.redemption-list')
const filtroCriancas = document.querySelector(".filtro-criancas")
const mensagem = document.querySelector("#mensagem")
const subtitle = document.querySelector("#redemption-sub")

sideBar()

function idCriancaDaUrl() {
  return new URLSearchParams(window.location.search).get("profile_id")
}

function buscarPagina(criancaId, pagina, tamanho = PAGE_SIZE) {
  const params = new URLSearchParams()
  if (criancaId) params.set("crianca_id", criancaId)
  params.set("pagina", pagina)
  params.set("por_pagina", tamanho)
  return apiFetch(`/resgates_feitos/?${params.toString()}`)
}

function makeFetchPage(criancaId, firstPage) {
  let cached = firstPage

  return async (pagina, tamanho) => {
    if (pagina === 1 && cached) {
      const items = cached
      cached = null
      return items
    }

    const { ok, status, dados } = await buscarPagina(criancaId, pagina, tamanho)

    if (status === 401) {
      goToLogin(dados?.erro)
      throw new Error("Sessão expirada")
    }
    if (!ok) throw new Error(dados?.erro || "Erro ao carregar resgates.")

    return dados.dados ?? []
  }
}

async function carregarResgates(ctx) {
  const criancaId = idCriancaDaUrl()

  const { ok, status, dados } = await buscarPagina(criancaId, 1)

  if (status === 401) {
    goToLogin(dados?.erro)
    return
  }
  if (!ok) {
    redemptionList.innerHTML = ""
    showMessage(mensagem, dados?.erro || "Não foi possível carregar os resgates.", "erro")
    return
  }

  if (!ctx.isResponsible) {
    subtitle.textContent = "As recompensas que você trocou por moedas. Quando um responsável entregar, aparece aqui."
  }

  renderizarFiltro(ctx.children, criancaId, ctx.isResponsible, filtroCriancas)

  const fetchPage = makeFetchPage(criancaId, dados.dados)
  await renderizarResgates(dados.total, redemptionList, ctx.isResponsible, fetchPage)
}

document.addEventListener("DOMContentLoaded", async () => {
  const ctx = await loadFamilyContext()
  if (!ctx.profile) return

  if (ctx.isResponsible && !ctx.hasChildren) {
    withoutChildren(redemptionList)
    return
  }
  await carregarResgates(ctx)
})
