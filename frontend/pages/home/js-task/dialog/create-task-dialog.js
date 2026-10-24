import { prepareModal } from '../shared/task-modal.js'
import { createTaskApi } from '../api/task-api.js'
import { isResponsible, minDeadlineValue } from '../shared/task-utils.js'
import { REWARDS } from '../shared/task-constants.js'
import { escapeHtml } from '../../../../utils/escape-html.js'
import { avatar } from '../../../../components/avatar/avatar.js'
import { showMessage } from '../../../../services/api.js'

// Só o responsável cria tarefas
// preselected -> id da criança que já vem marcada (a que está selecionada no perfil)
export function createTask({ dialog, familyChildren, profile_type, onSaved, preselected = null }) {
    if (!isResponsible(profile_type)) return

    const main = prepareModal(dialog, undefined, "Nova tarefa")

    const checkboxesChildren = familyChildren.map(child => `
        <label class="pick">
            <input type="checkbox" name="task_for" value="${escapeHtml(child.id)}"
                ${familyChildren.length === 1 || String(child.id) === String(preselected) ? "checked" : ""}>
            ${avatar(child, { size: 24 })}
            <span>${escapeHtml(child.name)}</span>
        </label>
    `).join('')

    const optionsReward = REWARDS.map((r, i) => `
        <label class="pick pick-reward">
            <input type="radio" name="task_reward" value="${r.id}" data-coins="${r.coins}" data-xp="${r.xp}" ${i === 0 ? "checked" : ""}>
            <span class="pick-reward-text">
                <strong>${escapeHtml(r.label)}</strong>
                <small>${r.coins} moedas, ${r.xp} XP</small>
            </span>
        </label>
    `).join('')

    main.innerHTML = `
        <form id="form-create-task" class="task-form">
            <div class="field">
                <label for="task-name">O que precisa ser feito</label>
                <input type="text" id="task-name" maxlength="100" placeholder="Arrumar a cama" required>
            </div>
            <div class="field">
                <label for="task-desc">Detalhes (opcional)</label>
                <textarea id="task-desc" rows="2" placeholder="Lençol esticado e travesseiro no lugar"></textarea>
            </div>
            <div class="field">
                <label for="task-date">Até quando</label>
                <input type="datetime-local" id="task-date" required min="${minDeadlineValue()}">
            </div>
            <fieldset class="field">
                <legend>Para quem</legend>
                <div class="pick-group">${checkboxesChildren}</div>
            </fieldset>
            <fieldset class="field">
                <legend>Recompensa</legend>
                <div class="pick-group">${optionsReward}</div>
            </fieldset>
            <label class="check-row" for="task-proof">
                <input type="checkbox" id="task-proof">
                Pedir uma foto como comprovação
            </label>
            <p class="mensagem" id="create-task-message"></p>
            <div class="dialog-actions">
                <button type="button" class="btn btn-ghost" data-close>Cancelar</button>
                <button type="submit" class="btn-primary">Criar tarefa</button>
            </div>
        </form>
    `

    const message = main.querySelector("#create-task-message")
    main.querySelector("[data-close]").addEventListener("click", () => dialog.close())

    main.querySelector("#form-create-task").addEventListener("submit", async (e) => {
        e.preventDefault()

        const childrenIds = Array.from(
            main.querySelectorAll('input[name="task_for"]:checked')
        ).map(c => c.value)

        if (childrenIds.length === 0) {
            showMessage(message, "Escolha pelo menos uma criança.", "erro")
            return
        }

        const option = main.querySelector('input[name="task_reward"]:checked')
        const submit = main.querySelector('button[type="submit"]')
        submit.disabled = true

        const created = await createTaskApi({
            name: main.querySelector("#task-name").value.trim(),
            description: main.querySelector("#task-desc").value.trim(),
            deadline: main.querySelector("#task-date").value,
            requiredProof: main.querySelector("#task-proof").checked,
            childrenIds,
            coinsReward: Number(option.dataset.coins),
            xpReward: Number(option.dataset.xp),
        }, message)

        submit.disabled = false
        if (!created) return   // deu erro: mantém o modal aberto

        dialog.close()
        onSaved?.()
    })

    if (!dialog.open) dialog.showModal()
}
