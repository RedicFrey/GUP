const sectionProfiles = document.querySelector("#choose-profile");
const messageErroProfile = document.querySelector("#message-erro-profile")
const modalPin = document.querySelector("#modal-pin")
const btnCancelar = document.getElementById("btn-cancelar");

let selectedProfile = null

async function chooseProfile(profile) {
    selectedProfile = profile.id
    if (profile.has_pin) {
        modalPin.showModal();
        modalPin.innerHTML = `
            <form id="form-pin-profile">
                <div>
                    <label for="profile-pin">Digite seu PIN:</label>
                    <input type="password" id="profile-pin" required>
                </div>
                    <button type="submit">Entrar</button>
                    <button type="button" id="btn-cancelar-pin">Cancelar</button>
            </form>
        `;

        const formPin = document.querySelector("#form-pin-profile");
        formPin.addEventListener("submit", async (e) => {
            e.preventDefault();
            const pin = document.querySelector("#profile-pin").value; 
            await fazerLogin(selectedProfile, pin);
        });

        const btnCancelarPin = document.querySelector("#btn-cancelar-pin");
        btnCancelarPin.addEventListener("click", () => {
            modalPin.close();
        });
    } else {
        fazerLogin(selectedProfile, null);
    }
};

async function fazerLogin(id, pin) {
    const data = {};
    if (pin) data.pin = pin;

    const response = await apiFetch(`/escolher-perfil/${id}`, {
        method: "POST",
        body: data,
    });

    if (erroMensagem(response, messageErroProfile, "Erro ao entrar na conta.")) return;

    modalPin.close();
    window.location.href = "dashboard.html";
}

export async function showProfiles() {
    const response = await apiFetch("/conta-familia/perfis")

    console.log(response)
    if (response.status === 401) {
        window.location.href = "login.html";
        return;
    };

    if (erroMensagem(response, messageErroProfile, "Erro ao apresentar as informações da conta família")) return;

    const { dados } = response;

    sectionProfiles.innerHTML = "";

    const ul = document.createElement("ul");
    ul.id = "profiles-options"
    dados.profiles.forEach((profile) => {
        const li = document.createElement("li");
        li.textContent = `${profile.name}`;
        li.className = "profiles"
        li.innerHTML = `
            <div class="profile-photo"></div>
            <div class="profile-name">
                <p>${profile.name}</p>
            </div>
        `
        li.addEventListener("click", () => chooseProfile(profile));
        ul.appendChild(li);
    });

    sectionProfiles.appendChild(ul);
}

document.addEventListener("DOMContentLoaded", ()=>{
    showProfiles()
})
