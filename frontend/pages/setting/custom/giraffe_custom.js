// ============================================================
// Catálogo de itens da girafa
// ------------------------------------------------------------
// Rotas usadas:
//   GET   /girafas/itens/<item_type>  -> lista de itens (color | background | accessory)
//   PATCH /girafas/me                 -> atualiza a girafa da criança
// ============================================================
import { apiFetch, assetUrl } from '../../../services/api.js'
import { pixelIcon } from '../../../assets/icons/pixel-icons.js'

// Tipos aceitos na rota GET (o mesmo valor vai na URL)
const ITEM_TYPES = ["color", "background", "accessory"]

// Tipo da URL -> campo enviado no PATCH
const ITEM_FIELD = {
  color: "color_id",
  background: "background_id",
  accessory: "accessory_id",
}

// Acessório usa a miniatura centralizada (pasta thumbs/, mesmo nome do arquivo).
// Cor e fundo continuam usando a imagem original.
function thumbUrl(itemType, imageUrl) {
  if (itemType !== "accessory") return imageUrl
  return imageUrl.replace("/accessories/", "/thumbs/accessories/")
}

async function listGiraffeApi(itemType) {
  if (!ITEM_TYPES.includes(itemType)) {
    throw new Error(`Tipo de item inválido: ${itemType}`)
  }

  const { ok, status, dados } = await apiFetch(`/girafas/itens/${itemType}`)
  if (!ok) {
    throw new Error(`Erro ao listar itens (${status})`)
  }
  return dados
}

// Recebe qualquer combinação de { color_id, background_id, accessory_id }.
// Só o que for enviado é alterado; enviar null remove (ex.: tirar o acessório).
async function updateGiraffeApi(changes) {
  const { ok, status, dados } = await apiFetch(`/girafas/me`, {
    method: "PATCH",
    body: changes,
  })
  if (!ok) {
    throw new Error(dados?.erro || `Erro ao atualizar itens (${status})`)
  }
  return dados
}

export async function removeAccessory() {
  try {
    await updateGiraffeApi({ accessory_id: null })
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

// ------------------------------------------------------------
// Desenha o catálogo de um tipo.
// childLevel -> nível atual da criança (item acima disso fica trancado)
// opções: equippedId (item em uso, recebe a moldura amarela)
//         onChange   (chamado depois do PATCH, para redesenhar a girafa)
// ------------------------------------------------------------
export async function renderGiraffeCatalog(
  itemType,
  childLevel,
  container = document.querySelector("#giraffe-catalog"),
  { equippedId = null, onChange = null } = {}
) {
  if (!container) {
    throw new Error("Container do catálogo não encontrado (#giraffe-catalog).")
  }

  container.className = `giraffe-catalog giraffe-catalog--${itemType}`
  container.innerHTML = `<p class="loading">Carregando itens…</p>`

  let items
  try {
    items = await listGiraffeApi(itemType)
  } catch (error) {
    console.error(error)
    container.innerHTML = `<p class="mensagem erro">Não foi possível carregar os itens. Tente de novo.</p>`
    return
  }

  container.innerHTML = ""

  if (!items?.length) {
    container.innerHTML = `<div class="empty"><p>Nenhum item desse tipo ainda.</p></div>`
    return
  }

  // desbloqueados primeiro, depois pelo nível exigido
  const sorted = [...items].sort((a, b) =>
    (childLevel < a.required_level) - (childLevel < b.required_level) || a.required_level - b.required_level)

  sorted.forEach((item) => {
    const isLocked = childLevel < item.required_level

    const button = document.createElement("button")
    button.type = "button"
    button.dataset.itemId = item.id
    button.className = isLocked
      ? "giraffe-item giraffe-item--locked"
      : "giraffe-item giraffe-item--unlocked"
    button.classList.add(`giraffe-item--${itemType}`)

    const isEquipped = item.id === equippedId
    button.classList.toggle("giraffe-item--equipped", isEquipped)
    button.setAttribute("aria-pressed", String(isEquipped))
    button.setAttribute("aria-label", isLocked
      ? `${item.name}, libera no nível ${item.required_level}`
      : `${item.name}${isEquipped ? ", em uso" : ""}`)

    const img = document.createElement("img")
    img.className = "giraffe-item__image"
    img.src = assetUrl(thumbUrl(itemType, item.image_url ?? ""))
    img.alt = ""
    img.loading = "lazy"
    button.appendChild(img)

    if (isLocked) {
      button.disabled = true
      button.title = `Libera no nível ${item.required_level}`

      const overlay = document.createElement("span")
      overlay.className = "giraffe-item__lock"
      overlay.innerHTML = `${pixelIcon("lock", { size: 18 })}<small>Nível ${item.required_level}</small>`
      button.appendChild(overlay)
    } else {
      const check = document.createElement("span")
      check.className = "giraffe-item__check"
      check.innerHTML = pixelIcon("check", { size: 14 })
      button.appendChild(check)

      button.addEventListener("click", () =>
        handleSelectItem(itemType, item, container, onChange)
      )
    }

    container.appendChild(button)
  })
}

// Clique num item desbloqueado: PATCH só do campo daquele tipo,
// move a moldura para ele e redesenha a girafa
async function handleSelectItem(itemType, item, container, onChange) {
  const clicked = container.querySelector(`[data-item-id="${item.id}"]`)
  clicked?.classList.add("is-saving")

  try {
    await updateGiraffeApi({ [ITEM_FIELD[itemType]]: item.id })

    container.querySelectorAll(".giraffe-item--equipped").forEach((el) => {
      el.classList.remove("giraffe-item--equipped")
      el.setAttribute("aria-pressed", "false")
    })
    clicked?.classList.add("giraffe-item--equipped")
    clicked?.setAttribute("aria-pressed", "true")

    if (onChange) await onChange()
  } catch (error) {
    console.error(error)
  } finally {
    clicked?.classList.remove("is-saving")
  }
}
