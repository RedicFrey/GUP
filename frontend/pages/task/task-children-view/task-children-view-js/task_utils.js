import { API_URL as API_BASE } from '../../../../services/api.js'
export const PROOF_ACCEPT = "image/png,image/jpeg,image/gif,image/webp"

export const STATUS_LABEL = {
    done: "Concluída",
    awaiting_approval: "Em espera",
    pending: "Pendente",
    not_done: "Não feita",
}
export const statusLabel = (status) => STATUS_LABEL[status] ?? status ?? ''

// Concluído e em espera só mostram o status; qualquer outro permite enviar
export const canSend = (status) => !["awaiting_approval", "done"].includes(status)

export const proofFileName = (path = '') => String(path).split(/[\\/]/).pop();

export const proofUrl = (path = '') => {
    const clean = String(path).replace(/\\/g, '/').replace(/^\/+/, '');
    if (!clean) return '';

    if (clean.startsWith('http://') || clean.startsWith('https://')) {
        return clean;
    }

    if (clean.startsWith('static/')) {
        return `${API_BASE}/${clean}`;
    }
    
    if (clean.startsWith('uploads/')) {
        return `${API_BASE}/static/${clean}`;
    }

    return `${API_BASE}/static/uploads/proofs/${clean}`;
};

const pad = (n) => String(n).padStart(2, "0")

// formato que o <input type="datetime-local"> usa: "2026-10-19T19:20" (fuso do navegador)
const toDateTimeInputValue = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`

// agora + 30 min, arredondado para o minuto seguinte
// (o input não tem segundos: sem arredondar, o mínimo ficaria alguns segundos abaixo de 30 min)
export const minDeadlineValue = (minutes = 30) => {
    const ms = Date.now() + minutes * 60 * 1000
    return toDateTimeInputValue(new Date(Math.ceil(ms / 60000) * 60000))
}