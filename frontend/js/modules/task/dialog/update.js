
import { updateTaskApi } from '../core/task_api.js'
import { escapeHtml, isResponsible } from '../core/task_utils.js'
import { prepararModal, REWARDS, toInputDate, getFamilyChildren } from './task_modal.js'


// ---------- Editar (só responsável) ----------
// onBack: o que o botão "Voltar" faz (ex.: reabrir os detalhes da tarefa).
// Vem de fora para o update.js não precisar importar a tela de detalhes (evita import circular).

export async function editTask(dialog, task, profile_type, onBack, onChanged) {

    if (!isResponsible(profile_type)) return

    const main = prepararModal(dialog, onBack)

    const taskId = task.task_id ?? task.id
    const childIdOf = (c) => String(c.child_profile_id ?? c.child_id)

    // na página de tarefas ninguém chamou setFamilyChildren: sem a lista da família,
    // usa as crianças da própria tarefa para o formulário não ficar vazio
    const allChildren = getFamilyChildren().length
        ? getFamilyChildren()
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
        <label>
            <input type="checkbox" name="task_for" value="${escapeHtml(child.id)}"
                ${initial.childrenIds.includes(String(child.id)) ? 'checked' : ''}>
            ${escapeHtml(child.name)}
        </label>
    `).join('')

    const optionsReward = REWARDS.map(r => `
        <option value="${r.id}" data-coins="${r.coins}" data-xp="${r.xp}"
            ${r.coins === initial.coinsReward && r.xp === initial.xpReward ? 'selected' : ''}>
            ${r.coins} moedas / ${r.xp} XP
        </option>
    `).join('')

    main.innerHTML = `
        <form id="form-edit-task">
            <div>
                <label for="task-name">Nome</label>
                <input type="text" id="task-name" value="${escapeHtml(initial.name)}" required>
            </div>
            <div>
                <label for="task-desc">Descrição</label>
                <input type="text" id="task-desc" value="${escapeHtml(initial.description)}">
            </div>
            <div>
                <label for="task-date">Horário limite</label>
                <input type="datetime-local" id="task-date" value="${initial.deadline}" required>
            </div>
            <div>
                <label for="task-proof">Necessita de foto</label>
                <input type="checkbox" id="task-proof" ${initial.requiredProof ? 'checked' : ''}>
            </div>
            <div>
                <label>Para:</label>
                ${checkboxesChildren}
            </div>
            <div>
                <label for="task-reward">Recompensa:</label>
                <select id="task-reward">${optionsReward}</select>
            </div>
            <button type="submit" id="btn-save" disabled>Alterar</button>
        </form>
    `

    const form = main.querySelector("#form-edit-task")
    const btnSave = main.querySelector("#btn-save")

    function getCurrentValues() {
        const select = main.querySelector("#task-reward")
        const option = select.options[select.selectedIndex]
        return {
            name: main.querySelector("#task-name").value.trim(),
            description: main.querySelector("#task-desc").value.trim(),
            deadline: main.querySelector("#task-date").value,
            requiredProof: main.querySelector("#task-proof").checked,
            childrenIds: Array.from(main.querySelectorAll('input[name="task_for"]:checked'))
                .map(c => c.value).sort(),
            coinsReward: Number(option.dataset.coins),
            xpReward: Number(option.dataset.xp),
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
            alert("Selecione ao menos uma criança.")
            return
        }

        const updated = await updateTaskApi(taskId, changes)
        if (!updated) return

        dialog.close()
        onChanged?.()
    })
}
