
import { selectAllTaskToday, selectAllTaskNext, selectAllTaskRepeated } from './selects_task.js'
import { setFamilyChildren } from '../dialog/task_modal.js'

async function viewTasks(profile_type){

    const main = document.createElement("main")
    const dialog = document.createElement("dialog")
    document.body.append(main, dialog)

    main.innerHTML = `
        <div id="back-dashboard">
            <button type="button" id="btn-back">Voltar</button>
        </div>
        <div>
            <div>
                <p>Ver tarefas:</p>
            </div>
            <div>
                <button type="button" data-view="today">De hoje</button>
                <button type="button" data-view="next">Próximas</button>
                <button type="button" data-view="repeated">Repetidas</button>
            </div>
        </div>
        <div id="selects-container"></div>
    `

    const container = main.querySelector("#selects-container")

    const backDash = main.querySelector("#back-dashboard")
    backDash.addEventListener("click", ()=>{
        window.location.href = "dashboard.html"
    })

    const loaders = {
        today: selectAllTaskToday,
        next: selectAllTaskNext,
        repeated: selectAllTaskRepeated,
    }

    main.querySelectorAll("button[data-view]").forEach((btn) => {
        btn.addEventListener("click", async () => {
            try {
                await loaders[btn.dataset.view](container, dialog, profile_type)
            } catch (err) {
                console.error(err)
                container.innerHTML = "<p>Erro ao carregar as tarefas.</p>"
            }
        })
    })

    main.querySelector('[data-view="today"]').click()
}

async function carregarPagina() {
    const { ok, status, dados } = await apiFetch("/dashboard")

    if (status === 401) {
        window.location.href = "auth.html"
        return
    }
    if (!ok) {
        alert(dados?.erro || "Erro ao carregar.")
        return
    }

    // o responsável precisa da lista da família para o formulário de editar
    if (dados.profile_type === "responsible") {
        setFamilyChildren(dados.family_children ?? [])
    }

    viewTasks(dados.profile_type)
}

document.addEventListener("DOMContentLoaded", carregarPagina)