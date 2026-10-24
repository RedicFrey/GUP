import { PROOF_ACCEPT, statusLabel, canSend, proofUrl } from './task_utils.js'
import { escapeHtml } from '../../../../utils/escape-html.js'
import { prazoCurto, formatarDataEHorario, parseApiDate } from '../../../../utils/formatar.js'
import { pixelIcon } from '../../../../assets/icons/pixel-icons.js'
import { avatar } from '../../../../components/avatar/avatar.js'

const STATUS_TAG = { pending: "pending", awaiting_approval: "awaiting", done: "done", not_done: "late" }

function isLate(item) {
    const deadline = parseApiDate(item.deadline)
    return item.status === "pending" && deadline && deadline < new Date()
}

function photoHtml(item) {
    if (!item.proof_photo) return ""
    return `<img class="proof-photo-preview" id="btn-view-proof" src="${escapeHtml(proofUrl(item.proof_photo))}"
        alt="Foto de comprovação enviada" tabindex="0">`
}

// -- Parte da criança: enviar a tarefa --
function sendHtml(item) {
    if (item.status === "done") {
        return `
            <div class="proof-panel proof-state proof-state-done">
                ${pixelIcon("check", { size: 28 })}
                <div>
                    <p class="proof-panel-title">Tarefa concluída!</p>
                    <p class="proof-panel-text">Você ganhou ${escapeHtml(item.coins_reward)} moedas e ${escapeHtml(item.xp_reward)} XP.</p>
                </div>
            </div>`
    }

    if (!canSend(item.status)) {
        return `
            <div class="proof-panel proof-state-wait">
                <div class="proof-state">
                    ${pixelIcon("clock", { size: 28 })}
                    <div>
                        <p class="proof-panel-title">Enviada!</p>
                        <p class="proof-panel-text">Agora é só esperar um responsável aprovar.</p>
                    </div>
                </div>
                ${photoHtml(item)}
            </div>`
    }

    const requiredProof = Boolean(Number(item.required_proof))

    return `
        <div class="proof-panel" id="proof-area">
            <p class="proof-panel-title">${requiredProof ? "Mande uma foto da tarefa feita" : "Terminou? Avise aqui"}</p>
            <p class="proof-panel-text">${requiredProof
                ? "Essa tarefa precisa de uma foto para ser aprovada."
                : "A foto é opcional, mas ajuda o responsável a aprovar mais rápido."}</p>

            <div class="proof-panel-actions">
                <button type="button" id="btn-send-proof" class="${requiredProof ? "btn-primary" : "btn"}">
                    ${pixelIcon("camera", { size: 16 })} Escolher foto
                </button>
                ${requiredProof ? "" : `<button type="button" id="btn-mark-done" class="btn-primary">Marcar como feita</button>`}
            </div>
            <input type="file" id="input-proof" accept="${PROOF_ACCEPT}" hidden>

            <div id="proof-selected" hidden>
                <img class="proof-thumb" id="proof-thumb" alt="Prévia da foto escolhida">
                <span id="proof-file-name"></span>
                <div class="proof-selected-actions">
                    <button type="button" id="btn-confirm-proof" class="btn-primary">Enviar para aprovação</button>
                    <button type="button" id="btn-preview-proof" class="btn btn-sm btn-ghost">Ver maior</button>
                    <button type="button" id="btn-change-proof" class="btn btn-sm btn-ghost">Trocar foto</button>
                    <button type="button" id="btn-remove-proof" class="btn btn-sm btn-ghost">Remover</button>
                </div>
            </div>
        </div>
    `
}

// -- Responsável: aprovar / recusar --
function reviewHtml(item) {
    if (item.status === "awaiting_approval") {
        return `
            <div class="proof-panel proof-state-wait">
                <p class="proof-panel-title">${escapeHtml(item.child_name ?? "A criança")} enviou a tarefa</p>
                <p class="proof-panel-text">${item.proof_photo ? "Confira a foto e decida." : "Não mandou foto. Confira com ela e decida."}</p>
                ${photoHtml(item)}
                <div class="proof-panel-actions" id="children-task-actions">
                    <button type="button" id="btn-reject-task" class="btn btn-danger">Recusar</button>
                    <button type="button" id="btn-approve-task" class="btn btn-success">Aprovar</button>
                </div>
            </div>`
    }

    if (item.status === "done") {
        return `
            <div class="proof-panel proof-state-done">
                <div class="proof-state">
                    ${pixelIcon("check", { size: 28 })}
                    <p class="proof-panel-title">Aprovada. As moedas e o XP já foram para ${escapeHtml(item.child_name ?? "a criança")}.</p>
                </div>
                ${photoHtml(item)}
            </div>`
    }

    return `
        <div class="proof-panel">
            <p class="proof-panel-title">Ainda não foi enviada</p>
            <p class="proof-panel-text">Quando ${escapeHtml(item.child_name ?? "a criança")} enviar, você poderá aprovar ou recusar aqui.</p>
        </div>`
}

export function childTaskHtml(item, responsible) {
    const late = isLate(item)
    const tagKey = late ? "late" : (STATUS_TAG[item.status] ?? "pending")
    const tagText = late ? "Atrasada" : statusLabel(item.status)

    const who = responsible && item.child_name
        ? `<p class="task-detail-who">${avatar({ id: item.child_profile_id, name: item.child_name }, { size: 24 })}${escapeHtml(item.child_name)}</p>`
        : ""

    return `
        <article class="card task-detail">
            <div class="task-detail-head">
                <div>
                    ${who}
                    <h1 class="task-detail-title">${escapeHtml(item.name)}</h1>
                    <p class="task-detail-desc ${item.description ? "" : "is-empty"}">${escapeHtml(item.description || "Sem detalhes.")}</p>
                </div>
                <span class="tag tag-${tagKey}">${escapeHtml(tagText)}</span>
            </div>
            <dl class="task-facts">
                <div>
                    <dt>Prazo</dt>
                    <dd title="${escapeHtml(formatarDataEHorario(item.deadline))}">${pixelIcon("clock", { size: 14 })} ${escapeHtml(prazoCurto(item.deadline))}</dd>
                </div>
                <div>
                    <dt>Recompensa</dt>
                    <dd>
                        <span class="coin-amount">${pixelIcon("coinColor", { size: 14 })}+${escapeHtml(item.coins_reward ?? 0)}</span>
                        <span class="xp-amount">${pixelIcon("star", { size: 14 })}+${escapeHtml(item.xp_reward ?? 0)} XP</span>
                    </dd>
                </div>
                <div>
                    <dt>Foto de comprovação</dt>
                    <dd>${pixelIcon("camera", { size: 14 })} ${Number(item.required_proof) ? "Obrigatória" : "Opcional"}</dd>
                </div>
            </dl>
            ${responsible ? reviewHtml(item) : sendHtml(item)}
        </article>
    `
}
