import { sideBar } from '../generic/side_bar.js';
import { warning } from '../generic/warning.js';

const containerReward = document.querySelector("#reward")
const mensagem = document.querySelector("#mensagem");

sideBar();

async function loadReward(){

    const { ok, status, dados } = await apiFetch("/recompensas/");

    if (status === 401) {
        window.location.href = "auth.html";
        return;
    }

    if (!ok) {
        mostrarMensagem(mensagem, dados?.erro || "Erro ao carregar recompensas.", "erro");
        return;
    }

    containerReward.innerHTML = "";
    containerReward.innerHTML = `<h2 class="title-page">Recompensas</h2>`
    const divReward = document.createElement("div")
    divReward.id = "divRewards";

    if (dados.profile_type === "responsible") {

        const createReward = document.createElement("button");
        createReward.id = "btn-create-reward";
        createReward.className = 'nao-visivel';
        createReward.textContent = "Criar Recompensa";

        const dialogCreateReward = document.createElement("dialog");
        dialogCreateReward.id = "form-creat-reward";

        containerReward.append(createReward, dialogCreateReward, divReward);

        mainReward(
            dados.rewards, 
            dados.profile_type, 
            dados.auth_child, 
            divReward, 
            createReward, 
            dialogCreateReward
        ); 
    } else {
        containerReward.append(divReward);

        mainReward(
            dados.rewards, 
            dados.profile_type, 
            dados.auth_child, 
            divReward
        );
    };
};

function mainReward(reward, profile_type, auth_child, containerDiv, btnCreate, dialog) {

    const isResponsible = profile_type === "responsible"

    if (isResponsible) {
        btnCreate.classList.remove('nao-visivel')
        btnCreate.addEventListener("click", () => {
            loadDialog(dialog)
            dialog.showModal()
        })
    }

    if (!reward.length) {
        containerDiv.innerHTML = "<p>A lojinha está vazia! Nenhuma recompensa cadastrada ainda.</p>"
        return;
    }

    containerDiv.innerHTML = reward
    .map((r) => {
        let actions = "";   // responsável não compra nem define meta

        if (!isResponsible) {
            const podeComprar = auth_child && auth_child.coins >= r.amount;
            actions = podeComprar
                ? `<div class="acoes"><button data-acao="comprar" data-id="${r.id}">Comprar</button></div>`
                : `<div class="acoes"><button data-acao="meta" data-id="${r.id}" class="secundario">Definir Meta</button></div>`;

        } else {
            actions = `<div class="acoes"><button data-acao="deletar" data-id="${r.id}">Deletar</button></div>`
        }

        return `
            <div class="tarefa-card">
            <strong>${r.name}</strong> — Custa: ${r.amount} moedas
            ${actions}
            </div>
        `;
    }).join("");

    // um único clique delegado para Comprar / Definir Meta / Deletar
    containerDiv.onclick = (event) => {
        const btn = event.target.closest("button[data-acao]")
        if (!btn) return

        const { acao, id } = btn.dataset

        if (isResponsible) {
            if (acao === "deletar") deleteReward(id)
        } else {
            if (acao === "comprar") buyReward(id)
            if (acao === "meta") goalChoise(id)
        }
    }
}

function loadDialog(dialog) {
    dialog.innerHTML = `
        <form id="form-recompensa">
            <label for="name-reward">Nome da Recompensa</label>
            <input type="text" id="name-reward" required>

            <label for="amount">Custo</label>
            <input type="number" id="amount" required>

            <button type="submit">Criar</button>
            <button type="button" id="btn-fechar">Cancelar</button>
        </form>
    `;

    const formReward = dialog.querySelector("#form-recompensa");
    const btnClose = dialog.querySelector("#btn-fechar");

    btnClose.addEventListener("click", () => {
        dialog.close(); 
    });

    formReward.addEventListener("submit", (e) => {
        e.preventDefault();
        createReward(dialog, formReward);
    });
}

async function createReward(dialog, formReward) {
    const dados = {
        name: document.querySelector("#name-reward").value,
        amount: document.querySelector("#amount").value,
    };

    const { ok, dados: resposta } = await apiFetch("/recompensas/criar", {
        method: "POST",
        body: dados,
    });

    if (!ok) {
        mostrarMensagem(mensagem, resposta?.erro || "Erro ao criar recompensa.", "erro");
        return;
    }

    formReward.reset();
    dialog.close();
    loadReward();
}

async function rewardAction(path, method, errorMessage) {
    const { ok, status, dados } = await apiFetch(path, { method });

    if (status === 401) {
        window.location.href = "auth.html";
        return false;
    }

    if (!ok) {
        mostrarMensagem(mensagem, dados?.erro || errorMessage, "erro");
        return false;
    }

    return true;
}

async function deleteReward(rewardId){
    const confirmed = await warning("Deseja realmente deletar esta recompensa?");
    if (!confirmed) return;

    const deleted = await rewardAction(`/recompensas/deletar/${rewardId}`, "DELETE", "Erro ao deletar recompensa.");
    if (deleted) loadReward();
}

async function goalChoise(rewardId){
    const done = await rewardAction(`/recompensas/definir-meta/${rewardId}`, "POST", "Erro ao definir meta.");
    if (done) loadReward();
}

async function buyReward(rewardId){
    const { ok, status, dados } = await apiFetch("/recompensas/");

    if (status === 401) {
        window.location.href = "auth.html";
        return;
    }

    if (!ok) {
        mostrarMensagem(mensagem, dados?.erro || "Erro ao verificar suas moedas.", "erro");
        return;
    }

    const reward = dados.rewards.find((r) => String(r.id) === String(rewardId));
    if (!reward) {
        mostrarMensagem(mensagem, "Essa recompensa não existe mais.", "erro");
        loadReward();
        return;
    }

    const coins = dados.auth_child?.coins ?? 0;
    if (coins < reward.amount) {
        mostrarMensagem(mensagem, `Moedas insuficientes: custa ${reward.amount} e você tem ${coins}.`, "erro");
        loadReward();   
        return;
    }

    const bought = await rewardAction(`/recompensas/comprar/${rewardId}`, "POST", "Erro ao comprar recompensa.");
    if (bought) loadReward();
}


document.addEventListener("DOMContentLoaded", ()=>{
  loadReward();
})