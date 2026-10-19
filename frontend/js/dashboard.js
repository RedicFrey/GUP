
import { sideBar } from './generic/side_bar.js';
import { dashboardTask } from './modules/task/dashboard/dashboard_task.js';
import { renderEvents } from './modules/events.js';
import { checkLevelUp } from './components/level.js'
import { viewGiraffe } from './components/giraffe.js'

const mensagem = document.querySelector("#mensagem");
const sectionEvents = document.querySelector("#section-events");
const sectionTask = document.querySelector("#tasks-section");

sideBar();

async function carregarDashboard() {

    const { ok, status, dados } = await apiFetch("/dashboard");

    if (status === 401) {
        window.location.href = "auth.html";
        return;
    }

    if (!ok) {
        mostrarMensagem(mensagem, dados?.erro || "Erro ao carregar.", "erro");
        return;
    }

    dashboardTask(sectionTask, dados.profile_id, dados.profile_type, dados.family_children);

    sectionEvents.style.display = "block"; // estava "none" fixo no HTML
    // renderizarEventos(sectionEvents, mensagem, modalEvento);
    renderEvents(sectionEvents, dados.profile_type)
}

document.addEventListener("DOMContentLoaded", () => {
    carregarDashboard();
    viewGiraffe()
    checkLevelUp()
});
