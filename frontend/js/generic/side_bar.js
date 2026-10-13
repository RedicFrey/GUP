import { ICONS } from './icons.js'

export async function sideBar() {
    const menuNav = document.createElement("nav");
    document.body.append(menuNav)
    menuNav.id = "menu-nav"

    const nameProfile = localStorage.getItem("nameProfile")
    if (!nameProfile) {
        const {dados, status} = await apiFetch("/perfil/me")
        if (status===403) {
            window.location.href="auth.html"
        }
        localStorage.setItem("nameProfile", dados.name)
    }
    const divProfile = document.createElement("div")
    divProfile.className = "div-profile"
    divProfile.innerHTML = `
        <div id="profile-photo-sidebar"></div>
        <span>${nameProfile}</span>
    `
    menuNav.appendChild(divProfile)
    
    const links = [
        { href: "dashboard.html", texto: "Início", icon: ICONS.sideBar.home},
        { href: "report.html", texto: "Relatório", icon: ICONS.sideBar.report },
        { href: "coin_history.html", texto: "Histórico", icon: ICONS.sideBar.history },
        { href: "redemption.html", texto: "Resgates", icon: ICONS.sideBar.redemption },
        { href: "reward.html", texto: "Recompensas", icon: ICONS.sideBar.reward },
        { href: "setting.html", texto: "Configuração", icon: ICONS.sideBar.settings },
    ];

    const ul = document.createElement("ul")
    ul.className = "sidebar-pages"
    menuNav.appendChild(ul)

    ul.innerHTML = links
    .map((l) => `
        <li class="sidebar-item">
            <a href="${l.href}" class="sidebar-link">
                <span class="sidebar-icon">${l.icon}</span>
                <span class="sidebar-text">${l.texto}</span>
            </a>
        </li>
    `)
    .join("")

    const logout = document.createElement("div");
    logout.className = "btn-logout";
    logout.innerHTML = `
        <p>Sair da conta</p>
        <span>${ICONS.sideBar.logout}</span>
    `
    logout.addEventListener("click", async (event) => {
        event.preventDefault();

        await apiFetch("/logout", { method: "POST" });
        window.location.href = "auth.html";
    });
    const divExit = document.createElement("div")
    divExit.append(logout)
    
    menuNav.appendChild(divExit);

    const btnMenu = document.createElement("button")
    btnMenu.className = "btn-menu"
    btnMenu.type = "button"
    btnMenu.textContent = "☰"
    btnMenu.setAttribute("aria-expanded", "false")

    const overlay = document.createElement("div")
    overlay.className = "overlay"

    document.body.append(btnMenu, overlay)

    function toggleMenu(open) {
        menuNav.classList.toggle("open", open)
        overlay.classList.toggle("open", open)
        btnMenu.setAttribute("aria-expanded", String(open))
    }

    btnMenu.addEventListener("click", () => toggleMenu(!menuNav.classList.contains("open")))
    overlay.addEventListener("click", () => toggleMenu(false))
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") toggleMenu(false)
    })
}