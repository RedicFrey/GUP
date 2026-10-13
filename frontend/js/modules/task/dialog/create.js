
import { prepararModal, REWARDS } from './task_modal.js'
import { createTaskApi } from '../core/task_api.js'
import { escapeHtml, isResponsible } from '../core/task_utils.js'

// ---------- Criar (só responsável) ----------

export function createTask({ dialog, familyChildrens, profile_type, onSaved }) {

    if (!isResponsible(profile_type)) return

    const main = prepararModal(dialog)

    const checkboxesChildren = familyChildrens.map(child => `
        <label>
            <input type="checkbox" name="task_for" value="${escapeHtml(child.id)}">
            ${escapeHtml(child.name)}
        </label>
    `).join('')

    const optionsReward = REWARDS.map(r => `
        <option value="${r.id}" data-coins="${r.coins}" data-xp="${r.xp}">
            ${r.coins} moedas / ${r.xp} XP
        </option>
    `).join('')

    main.innerHTML = `
        <form id="form-create-task">
            <div>
                <label for="task-name">Nome</label>
                <input type="text" id="task-name" required>
            </div>
            <div>
                <label for="task-desc">Descrição</label>
                <input type="text" id="task-desc">
            </div>
            <div>
                <label for="task-date">Horário limite</label>
                <input type="datetime-local" id="task-date" required>
            </div>
            <div>
                <label for="task-proof">Necessita de foto</label>
                <input type="checkbox" id="task-proof">
            </div>
            <div>
                <label>Para:</label>
                ${checkboxesChildren}
            </div>
            <div>
                <label for="task-reward">Recompensa:</label>
                <select id="task-reward">
                    ${optionsReward}
                </select>
            </div>
            <button type="submit">Salvar</button>
        </form>
    `

    main.querySelector("#form-create-task").addEventListener("submit", async (e) => {
        e.preventDefault()

        const childrenIds = Array.from(
            main.querySelectorAll('input[name="task_for"]:checked')
        ).map(c => c.value)

        if (childrenIds.length === 0) {
            alert("Selecione ao menos uma criança.")
            return
        }

        const selectReward = main.querySelector("#task-reward")
        const option = selectReward.options[selectReward.selectedIndex]

        const data = {
            name: main.querySelector("#task-name").value,
            description: main.querySelector("#task-desc").value,
            deadline: main.querySelector("#task-date").value,
            requiredProof: main.querySelector("#task-proof").checked,
            childrenIds,
            coinsReward: Number(option.dataset.coins),
            xpReward: Number(option.dataset.xp),
        }

        const criou = await createTaskApi(data)
        if (!criou) return        // deu erro: mantém o modal aberto

        dialog.close()
        onSaved?.()
    })

    if (!dialog.open) dialog.showModal()
}