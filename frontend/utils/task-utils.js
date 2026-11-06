import { API_URL } from '../config/config.js'
import { parseApiDate } from './formatar.js'

// Constantes e funções de tarefa usadas pelo painel, pela tela do responsável e pela da criança.

export const isResponsible = (profile_type) => profile_type === "responsible"

// Opções de recompensa ao criar/editar tarefa
export const REWARDS = [
    { id: 1, coins: 10, xp: 15, nivel: "easy", label: "Fácil" },
    { id: 2, coins: 15, xp: 15, nivel: "normal", label: "Normal" },
    { id: 3, coins: 20, xp: 15, nivel: "hard", label: "Difícil" },
]

// ---------- status ----------

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

// Concluída e em espera só mostram o status; qualquer outro permite enviar
export const canSend = (status) => !["awaiting_approval", "done"].includes(status)

// ---------- foto de comprovação ----------

export const PROOF_ACCEPT = "image/png,image/jpeg,image/gif,image/webp"

export const proofFileName = (path = '') => String(path).split(/[\\/]/).pop()

export const proofUrl = (path = '') => {
    const clean = String(path).replace(/\\/g, '/').replace(/^\/+/, '')
    if (!clean) return ''

    if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('blob:')) return clean
    if (clean.startsWith('static/')) return `${API_URL}/${clean}`
    if (clean.startsWith('uploads/')) return `${API_URL}/static/${clean}`

    return `${API_URL}/static/uploads/proofs/${clean}`
}

// ---------- datas para <input type="datetime-local"> ----------

const pad = (n) => String(n).padStart(2, "0")

// formato do input: "2026-10-19T19:20" no horário "de parede" (sem converter fuso)
const toDateTimeInputValue = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`

export function toInputDate(value) {
    const date = parseApiDate(value)
    return date ? toDateTimeInputValue(date) : ''
}

// agora + 30 min, arredondado para o minuto seguinte
// (o input não tem segundos: sem arredondar, o mínimo ficaria alguns segundos abaixo de 30 min)
export const minDeadlineValue = (minutes = 30) => {
    const ms = Date.now() + minutes * 60 * 1000
    return toDateTimeInputValue(new Date(Math.ceil(ms / 60000) * 60000))
}
