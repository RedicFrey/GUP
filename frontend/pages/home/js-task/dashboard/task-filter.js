import { escapeHtml } from '../../../../utils/escape-html.js'
import { pixelIcon } from '../../../../assets/icons/pixel-icons.js'
import { avatar } from '../../../../components/avatar/avatar.js'

const STATUS_OPTIONS = [
    { label: "Tudo", value: null, id: "btn-show-task" },
    { label: "Em espera", value: "awaiting_approval" },
    { label: "Atrasadas", value: "late" },
]

const same = (a, b) => String(a ?? "") === String(b ?? "")

function createStatusFilter({ initial, onSelect, onViewTasks }) {
    const group = document.createElement("div")
    group.className = "segmented task-status-filter"
    group.setAttribute("role", "group")
    group.setAttribute("aria-label", "Filtrar tarefas")

    const buttons = STATUS_OPTIONS.map(({ label, value, id }) => {
        const button = document.createElement("button")
        button.type = "button"
        button.textContent = label
        if (id) button.id = id
        button.addEventListener("click", () => onSelect(value))
        group.append(button)
        return { button, value }
    })

    function setActive(current) {
        buttons.forEach(({ button, value }) => {
            const active = same(value, current)
            button.classList.toggle("active", active)
            button.setAttribute("aria-pressed", String(active))
        })
    }

    const viewTaskButton = document.createElement("button")
    viewTaskButton.type = "button"
    viewTaskButton.id = "view-more-tasks"
    viewTaskButton.className = "btn btn-ghost btn-sm"
    viewTaskButton.innerHTML = `${pixelIcon("calendar", { size: 14 })} Ver todas por data`
    viewTaskButton.addEventListener("click", () => onViewTasks?.())

    const element = document.createElement("div")
    element.classList.add("filter-and-see-more-task")
    element.append(group, viewTaskButton)

    setActive(initial)
    return { element, setActive }
}

// "Família": um cartão por criança, que também funciona como filtro das tarefas
function createFamilyStrip({ familyChildren, initial, onSelect }) {
    const list = document.createElement("ul")
    list.className = "family-strip"

    const allCard = `
        <li>
            <button type="button" class="family-card family-card-all" data-child-id="">
                <span class="family-card-all-icon">${pixelIcon("users", { size: 22 })}</span>
                <span class="family-card-text">
                    <strong>Todas</strong>
                    <small>${familyChildren.length} ${familyChildren.length === 1 ? "criança" : "crianças"}</small>
                </span>
            </button>
        </li>`

    list.innerHTML = allCard + familyChildren.map((c) => `
        <li>
            <button type="button" class="family-card" data-child-id="${escapeHtml(c.id)}">
                ${avatar(c, { size: 40 })}
                <span class="family-card-text">
                    <strong>${escapeHtml(c.name)}</strong>
                    <small>
                        <span>Nível ${escapeHtml(c.level_id ?? 1)}</span>
                        <span class="coin-amount">${pixelIcon("coinColor", { size: 12 })}${escapeHtml(c.coins ?? 0)}</span>
                    </small>
                </span>
            </button>
        </li>`).join("")

    list.addEventListener("click", (event) => {
        const card = event.target.closest(".family-card")
        if (!card) return
        onSelect(card.dataset.childId ? Number(card.dataset.childId) : null)
    })

    function setActive(current) {
        list.querySelectorAll(".family-card").forEach((card) => {
            const active = same(card.dataset.childId, current)
            card.classList.toggle("active", active)
            card.setAttribute("aria-pressed", String(active))
        })
    }

    setActive(initial)
    return { element: list, setActive }
}

export function createTaskFilter({ isResponsible, childId, familyChildren = [], onChange, onViewTasks, container, familyContainer }) {
    const urlParams = new URLSearchParams(location.search)
    const urlStatus = urlParams.get("status")
    const urlChild = urlParams.get("child")

    const state = {
        status: STATUS_OPTIONS.some(o => o.value === urlStatus) ? urlStatus : null,
        // responsável começa vendo todas as crianças
        childId: isResponsible
            ? (familyChildren.some(c => same(c.id, urlChild)) ? Number(urlChild) : null)
            : childId,
    }

    function updateURL() {
        const params = new URLSearchParams(location.search)
        if (state.status) params.set("status", state.status)
        else params.delete("status")
        if (isResponsible && state.childId) params.set("child", state.childId)
        else params.delete("child")
        const query = params.toString()
        history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}`)
    }

    function apply(changes) {
        Object.assign(state, changes)
        statusFilter.setActive(state.status)
        family?.setActive(state.childId)
        updateURL()
        onChange?.({ ...state })
    }

    const statusFilter = createStatusFilter({
        initial: state.status,
        onSelect: (status) => apply({ status }),
        onViewTasks,
    })

    const family = isResponsible && familyContainer
        ? createFamilyStrip({
            familyChildren,
            initial: state.childId,
            onSelect: (id) => apply({ childId: id }),
        })
        : null

    container.append(statusFilter.element)
    if (family) familyContainer.append(family.element)

    return {
        getState: () => ({ ...state }),
        setStatus: (status) => apply({ status }),
    }
}
