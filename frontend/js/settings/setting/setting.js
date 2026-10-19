
import { sideBar } from '../../generic/side_bar.js'
import { profile } from './profile.js'
import { notificationSetting } from './notification.js';
import { loadMyProfile } from '../../generic/utils.js'
import { sectionCustomPage } from '../custom/setting_custom.js'

const mainSetting = document.querySelector("#setting-container")

sideBar()

async function doConfig(){
    const currentUser = await loadMyProfile()
    mainSetting.innerHTML = `
        <h2 class="title-page">Configurações</h2>
        <section id="setting-containt">
            <section>
                <section id="edit-giraffe-section"></section>
            </section>
            <section id="profile-info-section"></section>
            <article id="go-to-family-account">
                <p>Conta família</p>
                <a href="family_account.html">Ver</a>
            </article>
            <section id="notification-containt"></section>
        </section>
        
    `
    const profileSection = mainSetting.querySelector("#profile-info-section")
    const notificationContaint =  mainSetting.querySelector("#notification-containt")
    const editGiraffeSection = mainSetting.querySelector("#edit-giraffe-section")
    sectionCustomPage(editGiraffeSection, currentUser.profile_type)
    profile(currentUser, profileSection)
    notificationSetting(currentUser.profile_type, notificationContaint)
}


document.addEventListener("DOMContentLoaded", () => {
    doConfig();
});