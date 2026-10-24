import { updateTaskApi } from './task-responsible-api.js'
import { escapeHtml, isResponsible } from './task-utils.js'
import { prepararModal, REWARDS, toInputDate, getFamilyChildren } from './task-modal.js'
import { avatar } from '../../../../components/avatar/avatar.js'
import { familyChildren } from '../../../../utils/family-children.js'
import { showMessage } from '../../../../services/api.js'

export async function editTask(dialog, task, profile_type, onBack, onChanged) {

    if (!isResponsible(profile_type)) return

    const main = prepararModal(dialog, onBack, "Editar tarefa")

    const taskId = task.task_id ?? task.id
    const childIdOf = (c) => String(c.child_profile_id ?? c.child_id)

    // todas as crianças da família; se a lista não vier, usa as da própria tarefa
    const family = getFamilyChildren().length ? getFamilyChildren() : ((await familyChildren()) ?? [])
    const allChildren = family.length
        ? family
        : (task.children ?? []).map(c => ({ id: childIdOf(c), name: c.name }))

    const initial = {
        name: task.name ?? '',
        description: task.description ?? '',
        deadline: toInputDate(task.deadline),
        requiredProof: Boolean(task.required_proof),
        childrenIds: (task.children ?? []).map(childIdOf).sort(),
        coinsReward: task.coins_reward,
        xpReward: task.xp_reward,
    }

    const checkboxesChildren = allChildren.map(child => `
        <label class="pick">
            <input type="checkbox" name="task_for" value="${escapeHtml(child.id)}"
                ${initial.childrenIds.includes(String(child.id)) ? 'checked' : ''}>
            ${avatar(child, { size: 24 })}
            <span>${escapeHtml(child.name)}</span>
        </label>
    `).join('')

    const sameReward = (r) => r.coins === initial.coinsReward && r.xp === initial.xpReward
    const hasMatch = REWARDS.some(sameReward)

    const optionsReward = REWARDS.map((r, i) => `
        <label class="pick pick-reward">
            <input type="radio" name="task_reward" value="${r.id}" data-coins="${r.coins}" data-xp="${r.xp}"
                ${sameReward(r) || (!hasMatch && i === 0) ? 'checked' : ''}>
            <span class="pick-reward-text">
                <strong>${escapeHtml(r.label ?? r.nivel)}</strong>
                <small>${r.coins} moedas, ${r.xp} XP</small>
            </span>
        </label>
    `).join('')

    main.innerHTML = `
        <form id="form-edit-task" class="task-form">
            <div class="field">
                <label for="task-name">O que precisa ser feito</label>
                <input type="text" id="task-name" maxlength="100" required>
            </div>
            <div class="field">
                <label for="task-desc">Detalhes (opcional)</label>
                <textarea id="task-desc" rows="2"></textarea>
            </div>
            <div class="field">
                <label for="task-date">Até quando</label>
                <input type="datetime-local" id="task-date" value="${escapeHtml(initial.deadline)}" required>
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
                <input type="checkbox" id="task-proof" ${initial.requiredProof ? 'checked' : ''}>
                Pedir uma foto como comprovação
            </label>
            <p class="mensagem" id="edit-task-message"></p>
            <div class="dialog-actions">
                <button type="button" class="btn btn-ghost" data-close>Cancelar</button>
                <button type="submit" id="btn-save" class="btn-primary" disabled>Salvar alterações</button>
            </div>
        </form>
    `

    // textos entram pelo .value: aspas e < > no nome não quebram o HTML
    main.querySelector("#task-name").value = initial.name
    main.querySelector("#task-desc").value = initial.description

    const form = main.querySelector("#form-edit-task")
    const btnSave = main.querySelector("#btn-save")
    const message = main.querySelector("#edit-task-message")
    main.querySelector("[data-close]").addEventListener("click", onBack)

    function getCurrentValues() {
        const option = main.querySelector('input[name="task_reward"]:checked')
        return {
            name: main.querySelector("#task-name").value.trim(),
            description: main.querySelector("#task-desc").value.trim(),
            deadline: main.querySelector("#task-date").value,
            requiredProof: main.querySelector("#task-proof").checked,
            childrenIds: Array.from(main.querySelectorAll('input[name="task_for"]:checked'))
                .map(c => c.value).sort(),
            coinsReward: Number(option?.dataset.coins),
            xpReward: Number(option?.dataset.xp),
        }
    }

    function getChanges() {
        const current = getCurrentValues()
        const changes = {}
        for (const key in current) {
            if (JSON.stringify(current[key]) !== JSON.stringify(initial[key])) {
                changes[key] = current[key]
            }
        }
        return changes
    }

    function refreshButton() {
        btnSave.disabled = Object.keys(getChanges()).length === 0
    }

    form.addEventListener("input", refreshButton)
    form.addEventListener("change", refreshButton)

    form.addEventListener("submit", async (e) => {
        e.preventDefault()

        const changes = getChanges()
        if (Object.keys(changes).length === 0) return

        if (changes.childrenIds?.length === 0) {
            showMessage(message, "Escolha pelo menos uma criança.", "erro")
            return
        }

        btnSave.disabled = true
        const updated = await updateTaskApi(taskId, changes, message)
        if (!updated) {
            btnSave.disabled = false
            return
        }

        dialog.close()
        onChanged?.()
    })
}
