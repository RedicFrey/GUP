import { sideBar, refreshSidebarCoins } from '../../components/sidebar/sidebar.js'
import { dashboardTask } from './js-task/dashboard/dashboard-task.js'
import { countTasksApi } from './js-task/api/task-api.js'
import { renderEvents } from './js-event/event-render.js'
import { renderHero, setHeroStat } from './js-profile/profile-hero.js'
import { checkLevelUp } from '../../components/level-up-modal/level-up-modal.js'
import { giraffeApi } from '../../components/giraffe-view/giraffe-view.js'
import { childGoal } from '../../components/goal-card/goal-card.js'
import { loadMyProfile, isChild } from '../../services/perfil-service.js'
import { familyChildren } from '../../utils/family-children.js'
import { pixelIcon } from '../../assets/icons/pixel-icons.js'
import { pageUrl } from '../../services/api.js'

const CUSTOM_PAGE = pageUrl("pages/setting/custom.html")
const SETTINGS_PAGE = pageUrl("pages/setting/setting.html")

const hero = document.querySelector("#profile-hero")
const sectionEvents = document.querySelector("#section-events")
const sectionTask = document.querySelector("#tasks-section")
const goalSection = document.querySelector("#child-goal")
const familySection = document.querySelector("#family-section")

sideBar()

// ---------- Criança: a girafa é a estrela do perfil ----------
async function childProfile(me) {
    const giraffe = await giraffeApi().catch(() => null)

    renderHero(hero, {
        profile: me,
        giraffe,
        stats: [
            { key: "coins", label: "moedas", value: me.coins ?? 0, kind: "coin" },
            { key: "xp", label: "XP", value: me.xp ?? 0, kind: "xp" },
            { key: "done", label: "feitas hoje", value: "–" },
        ],
        actions: `
            <a class="btn" href="${CUSTOM_PAGE}">${pixelIcon("paint", { size: 14 })} Personalizar girafa</a>
        `,
    })

    goalSection.hidden = false
    childGoal(goalSection, {
        onCoinsChange: (coins) => {
            if (coins === undefined) return
            setHeroStat(hero, "coins", coins)
            refreshSidebarCoins(coins)
        },
    })

    const refreshDone = async () => {
        const done = await countTasksApi({ status: "done" })
        if (done !== null) setHeroStat(hero, "done", done)
    }

    dashboardTask(sectionTask, me.id, me.profile_type, { onChanged: refreshDone })
    renderEvents(sectionEvents, me.profile_type)
    refreshDone()
    checkLevelUp(me)
}

// ---------- Responsável: a família em primeiro plano ----------
async function responsibleProfile(me) {
    const children = (await familyChildren()) ?? []

    renderHero(hero, {
        profile: me,
        stats: [
            { key: "children", label: children.length === 1 ? "criança" : "crianças", value: children.length },
            { key: "awaiting", label: "esperando você", value: "–", action: "awaiting" },
            { key: "events", label: "eventos", value: "–" },
        ],
        actions: `
            <a class="btn" href="${SETTINGS_PAGE}">${pixelIcon("edit", { size: 14 })} Editar perfil</a>
        `,
    })

    familySection.hidden = children.length === 0

    const refreshAwaiting = async () => {
        const awaiting = await countTasksApi({ status: "awaiting_approval" })
        if (awaiting !== null) setHeroStat(hero, "awaiting", awaiting)
    }

    const filter = await dashboardTask(sectionTask, null, me.profile_type, {
        familyContainer: familySection.querySelector(".family-container"),
        onChanged: refreshAwaiting,
    })

    // "esperando você" na capa leva direto às tarefas para aprovar
    hero.querySelector('[data-action="awaiting"]')?.addEventListener("click", () => {
        filter?.setStatus("awaiting_approval")
        sectionTask.scrollIntoView({ behavior: "smooth", block: "start" })
    })

    renderEvents(sectionEvents, me.profile_type, {
        onTotal: (total) => setHeroStat(hero, "events", total),
    })
    refreshAwaiting()
}

async function loadProfilePage() {
    const me = await loadMyProfile()
    if (!me) return

    document.title = `${me.name} - GUP`
    hero.classList.remove("is-loading")
    hero.removeAttribute("aria-busy")

    if (isChild(me)) await childProfile(me)
    else await responsibleProfile(me)
}

loadProfilePage()
