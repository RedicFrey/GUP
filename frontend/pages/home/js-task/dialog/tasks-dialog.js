import { getTaskApi } from '../api/task-api.js'
import { renderTasksList } from './tasks-list-render.js'
import { prepareModal } from '../shared/task-modal.js'
import { pixelIcon } from '../../../../assets/icons/pixel-icons.js'

// aba -> período que o back espera
const PERIODS = { today: "today", next: "after" }

export function openTasksDialog({ dialog, profile_type, childId }) {
    const main = prepareModal(dialog, undefined, "Todas as tarefas")
    dialog.classList.add("task-dialog-wide")

    main.innerHTML = `
        <div id="tasks-tabs" class="segmented" role="group" aria-label="Período">
            <button type="button" data-view="today">De hoje</button>
            <button type="button" data-view="next">Próximas</button>
            <button type="button" data-view="repeated">Repetidas</button>
        </div>
        <div id="tasks-dialog-list" class="task-list"></div>
    `

    const container = main.querySelector("#tasks-dialog-list")
    const tabs = main.querySelectorAll("button[data-view]")
    let current = 0   // evita que uma aba antiga sobrescreva a nova se o usuário clicar rápido

    async function showView(view) {
        const mine = ++current
        tabs.forEach(b => {
            b.classList.toggle("active", b.dataset.view === view)
            b.setAttribute("aria-pressed", String(b.dataset.view === view))
        })

        // tarefas que se repetem ainda estão em desenvolvimento no back
        if (view === "repeated") {
            container.nextElementSibling?.classList.contains("paginacao") && container.nextElementSibling.remove()
            container.classList.remove("container-empty")
            container.innerHTML = `<div class="empty">${pixelIcon("swap", { size: 28 })}<p>Tarefas que se repetem ainda estão chegando ao GUP.</p></div>`
            return
        }

        const loadPage = async (page, size) => {
            if (mine !== current) return null
            const result = await getTaskApi({ type: PERIODS[view], page, size })
            if (!result) return null
            return { items: result.tasks ?? [], total: result.total ?? 0 }
        }

        try {
            await renderTasksList(loadPage, container, { profile_type, childId })
        } catch (err) {
            console.error(err)
            container.innerHTML = `<p class="mensagem erro">Não foi possível carregar as tarefas.</p>`
        }
    }

    tabs.forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.view)))

    if (!dialog.open) dialog.showModal()
    showView("today")
}
