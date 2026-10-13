
const STATUS_OPTIONS = [
    { label: "Tudo", status: null, id: "btn-show-task" },
    { label: "Em espera", status: "awaiting_approval" },
    { label: "Atrasadas", status: "late" },
]


// ---------- Grupo: status ----------

export function createTaskFilterStatus({ initial = null, onSelect }) {
    const element = document.createElement("div")
    element.classList.add("filter-and-see-more-task")

    const divElementStatus = document.createElement("div")
    divElementStatus.classList.add("task-card-filter")

    const viewTaskButton = document.createElement("button")
    viewTaskButton.textContent = 'Ver tarefas'
    viewTaskButton.id="view-more-tasks"
    viewTaskButton.addEventListener("click", (e) => {
        window.location.href="task.html"
    })

    const divSeeMore = document.createElement("div")
    divSeeMore.append(viewTaskButton)

    element.append(divElementStatus, divSeeMore)

    const buttons = STATUS_OPTIONS.map(({ label, status, id }) => {
        const button = document.createElement("button")
        button.type = "button"
        button.textContent = label
        if (id) button.id = id
        button.addEventListener("click", () => onSelect(status))
        divElementStatus.append(button)
        return { button, status }
    })

    function setActive(current) {
        buttons.forEach(({ button, status }) =>
            button.classList.toggle("active", status === current))
    }

    setActive(initial)

    return { element, setActive }
}


// ---------- Grupo: crianças ----------

export function createTaskFilterChildren({ familyChildren = [], initial = null, onSelect }) {
    // com 0 ou 1 filho o filtro não ajuda em nada: nem cria
    if (familyChildren.length <= 1) return null

    const element = document.createElement("div")
    element.classList.add("task-card-filter")

    const buttons = familyChildren.map(child => {
        const button = document.createElement("button")
        button.type = "button"
        button.textContent = child.name
        button.id = `btn-child-${child.id}`
        button.dataset.childId = child.id
        button.addEventListener("click", () => onSelect(child.id))
        element.append(button)
        return { button, id: child.id }
    })

    function setActive(current) {
        buttons.forEach(({ button, id }) =>
            button.classList.toggle("active", String(id) === String(current)))
    }

    setActive(initial)

    return { element, setActive }
}


// ---------- Filtro completo ----------

export function createTaskFilter({ isResponsible, childId, familyChildren = [], onChange }) {
    const urlStatus = new URLSearchParams(location.search).get("status")

    const state = {
        // padrão: Tudo (qualquer valor desconhecido na URL também vira Tudo)
        status: STATUS_OPTIONS.some(o => o.status === urlStatus) ? urlStatus : null,
        // padrão: responsável começa na primeira criança; criança vê só as dela
        childId: isResponsible ? (familyChildren[0]?.id ?? null) : childId,
    }

    const element = document.createElement("div")
    element.classList.add("filtros-tarefas")

    function updateURL() {
        const newParams = new URLSearchParams(location.search)
        if (state.status) newParams.set("status", state.status)
        else newParams.delete("status")
        history.replaceState(null, "", `${location.pathname}?${newParams}`)
    }

    // os dois grupos são independentes: mudar um não mexe no outro
    function apply(changes) {
        Object.assign(state, changes)
        statusFilter.setActive(state.status)
        childrenFilter?.setActive(state.childId)
        updateURL()
        onChange?.({ ...state })
    }

    const statusFilter = createTaskFilterStatus({
        initial: state.status,
        onSelect: (status) => apply({ status }),
    })
    element.append(statusFilter.element)

    // lista de crianças: só para o responsável
    const childrenFilter = isResponsible
        ? createTaskFilterChildren({
            familyChildren,
            initial: state.childId,
            onSelect: (id) => apply({ childId: id }),
        })
        : null
    if (childrenFilter) element.append(childrenFilter.element)

    return {
        element,
        getState: () => ({ ...state }),
    }
}
