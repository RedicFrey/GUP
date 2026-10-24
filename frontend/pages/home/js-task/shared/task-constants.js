import { pageUrl } from '../../../../services/api.js'
export const REWARDS = [
    { id: 1, coins: 10, xp: 15, nivel: "easy", label: "Fácil" },
    { id: 2, coins: 15, xp: 15, nivel: "normal", label: "Normal" },
    { id: 3, coins: 20, xp: 15, nivel: "hard", label: "Difícil" },
]

export const RESPONSIBLE_PAGE = pageUrl("pages/task/task-responsible-view/task-responsible-view.html")
export const CHILD_PAGE = pageUrl("pages/task/task-children-view/task-children-view.html")

export const PAGE_SIZE = 6

export const STATUS_LABEL = {
    done: "Concluída",
    awaiting_approval: "Em espera",
    pending: "Pendente",
    not_done: "Não feita",
}
export const statusLabel = (status) => STATUS_LABEL[status] ?? status ?? ''

// Status "visual" da tarefa: atrasada tem prioridade sobre pendente
export function taskState(task) {
    if (task.is_late || task.is_late === 1) return { key: "late", label: "Atrasada" }
    switch (task.status) {
        case "done": return { key: "done", label: STATUS_LABEL.done }
        case "awaiting_approval": return { key: "awaiting", label: STATUS_LABEL.awaiting_approval }
        case "not_done": return { key: "late", label: STATUS_LABEL.not_done }
        default: return { key: "pending", label: STATUS_LABEL.pending }
    }
}
