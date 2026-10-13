
export function triggerPageFallback(section, message = null){
    section.textContent = `
        Deu algo errado ai, guri!
        ${message}
    `
}