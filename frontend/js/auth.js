// Arquivo: js/auth.js

// esse arquivo vai ser usado no sidebar
async function loadingMyProfile() {
    const dataSave = localStorage.getItem('meuPerfil');

    if (dataSave) {
        atualizarHeader(JSON.parse(dataSave));
        return; 
    }

    try {
        const response = await fetch('/perfil/me', { method: 'GET' });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('meuPerfil', JSON.stringify(data));
            // atualizarHeader(data);
        } else {
            window.location.href = 'auth.html';
        }
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
    }
}

// atualizar dps
function atualizarHeader(dados) {
    const spanNome = document.getElementById('nome-usuario');
    if (spanNome) {
        spanNome.textContent = dados.name; 
    }
}

document.addEventListener("DOMContentLoaded", ()=>{
    loadingMyProfile();
})

async function loadMyProfile(){
    
}
