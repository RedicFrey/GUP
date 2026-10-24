import { loadMyProfile } from '../../../services/perfil-service.js'
import { renderGiraffeCatalog, removeAccessory } from './giraffe_custom.js'
import { giraffeApi, viewGiraffe } from '../../../components/giraffe-view/giraffe-view.js'
import { sideBar } from '../../../components/sidebar/sidebar.js'
import { pixelIcon } from '../../../assets/icons/pixel-icons.js'
import { escapeHtml } from '../../../utils/escape-html.js'
import { pageUrl } from '../../../services/api.js'

const CUSTOM_PAGE = pageUrl("pages/setting/custom.html")
const customContaint = document.querySelector("#custom-containt")

// ------------------------------------------------------------
// Linha "Sua girafa" na página de configurações (só criança)
// ------------------------------------------------------------
export function sectionCustomPage(section, profileType) {
  if (profileType !== "child") return

  section.hidden = false
  section.innerHTML = `
    <h2 class="settings-group-title">Sua girafa</h2>
    <article class="settings-row giraffe-row">
      <div class="giraffe-view-section"></div>
      <div class="settings-row-text">
        <p class="settings-row-label">${pixelIcon("paint", { size: 16 })} Visual da girafa</p>
        <p class="settings-row-hint">Troque a cor, o cenário e o acessório. Subir de nível libera itens novos.</p>
      </div>
      <a class="btn" href="${CUSTOM_PAGE}">Personalizar</a>
    </article>
  `
  viewGiraffe(section.querySelector(".giraffe-view-section"))
}

// ------------------------------------------------------------
// Página de personalizar a girafa (custom.html)
// ------------------------------------------------------------
const TABS = [
  { name: "Acessório", type: "accessory" },
  { name: "Cor", type: "color" },
  { name: "Cenário", type: "background" },
]

const DEFAULT_ITEM_TYPE = "accessory"

async function pageCustom() {
  const profile = await loadMyProfile()
  if (!profile) return

  if (profile.profile_type !== "child") {
    customContaint.innerHTML = `
      <a class="back-link" href="${pageUrl("pages/setting/setting.html")}">‹ Voltar para as configurações</a>
      <div class="empty">
        ${pixelIcon("paint", { size: 32 })}
        <p>A girafa é das crianças. Entre no perfil de uma criança para personalizar a dela.</p>
        <a class="btn" href="${pageUrl("pages/chose-profile/profiles.html")}">Trocar de perfil</a>
      </div>`
    return
  }

  customContaint.innerHTML = `
    <a class="back-link" href="${pageUrl("pages/setting/setting.html")}" id="back-to-setting">‹ Voltar para as configurações</a>
    <header class="page-head">
      <div>
        <h1 class="page-title">Sua girafa</h1>
        <p class="page-sub">Escolha a cor, o cenário e o acessório. Subir de nível libera itens novos.</p>
      </div>
      <p class="level-badge custom-level">Nível ${escapeHtml(profile.level_id ?? 1)}</p>
    </header>

    <div class="custom-layout">
      <section class="custom-preview">
        <div class="giraffe-view-section"></div>
      </section>

      <section class="custom-panel">
        <div id="customization-panel">
          <div class="segmented category-list" id="category-list" role="tablist" aria-label="Tipo de item">
            ${TABS.map((tab) => `
              <button type="button" class="btn-acao" role="tab" data-type="${tab.type}" aria-selected="false">${tab.name}</button>
            `).join("")}
          </div>
          <button type="button" class="btn btn-sm btn-ghost" id="btn-remove-accessory" hidden>Tirar acessório</button>
        </div>
        <section id="giraffe-section">
          <div id="giraffe-catalog" role="tabpanel" aria-live="polite"></div>
        </section>
      </section>
    </div>
  `

  const giraffeSection = customContaint.querySelector(".giraffe-view-section")
  const catalog = customContaint.querySelector("#giraffe-catalog")
  const buttons = customContaint.querySelectorAll(".btn-acao")
  const removeAccessoryBtn = customContaint.querySelector("#btn-remove-accessory")

  // girafa atual (cor, fundo e acessório equipados): daí sai o item marcado
  let giraffe = null
  let currentType = DEFAULT_ITEM_TYPE

  async function refreshGiraffe() {
    giraffe = await giraffeApi()
    await viewGiraffe(giraffeSection, giraffe)
    removeAccessoryBtn.hidden = currentType !== "accessory" || !giraffe?.accessory
  }

  async function showCatalog(type) {
    currentType = type
    buttons.forEach(btn => {
      const isActive = btn.dataset.type === type
      btn.classList.toggle("active", isActive)
      btn.setAttribute("aria-selected", String(isActive))
    })

    if (!giraffe) await refreshGiraffe()
    removeAccessoryBtn.hidden = type !== "accessory" || !giraffe?.accessory

    await renderGiraffeCatalog(type, profile.level_id ?? 1, catalog, {
      equippedId: giraffe?.[type]?.id ?? null,
      onChange: refreshGiraffe,
    })
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", () => showCatalog(btn.dataset.type))
  })

  removeAccessoryBtn.addEventListener("click", async () => {
    removeAccessoryBtn.disabled = true
    const removed = await removeAccessory()
    removeAccessoryBtn.disabled = false
    if (!removed) return
    await refreshGiraffe()
    catalog.querySelectorAll(".giraffe-item--equipped").forEach((el) => {
      el.classList.remove("giraffe-item--equipped")
      el.setAttribute("aria-pressed", "false")
    })
  })

  showCatalog(DEFAULT_ITEM_TYPE)
}

document.addEventListener("DOMContentLoaded", () => {
  // Este arquivo também é importado pela página de configurações, onde
  // #custom-containt não existe. Sem essa guarda, dá TypeError lá.
  if (!customContaint) return
  sideBar()
  pageCustom()
})
