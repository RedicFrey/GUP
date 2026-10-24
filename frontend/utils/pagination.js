
const DEFAULT_LABELS = {
    previous: "Anterior",
    next: "Próxima",
    more: "Mostrar mais",
    less: "Mostrar menos",
    error: "Erro ao carregar os itens.",
}

const controlsByContainer = new WeakMap()

export async function paginate({
    total = 0,
    container,
    fetchPage,
    renderItems,
    pageSize = 10,
    mode = "pages",
    empty = "",
    labels = {},
    lessAfter,
}) {
    if (mode !== "pages" && mode !== "more") {
        throw new Error(`Modo de paginação inválido: ${mode}`)
    }

    const text = { ...DEFAULT_LABELS, ...labels }
    const size = Math.max(1, Number(pageSize) || 10)
    const count = Math.max(0, Number(total) || 0)

    controlsByContainer.get(container)?.remove()
    controlsByContainer.delete(container)

    container.classList.remove("container-empty")  
    

    if (count === 0) {
        container.innerHTML = empty
        container.classList.add("container-empty")   
        container.querySelector("p")?.classList.add("p-empty")
        return null
    }

    if (count <= size) {
        try {
            container.innerHTML = renderItems(await fetchPage(1, size))
        } catch {
            container.innerHTML = `<p>${text.error}</p>`
        }
        return null
    }

    const controls = document.createElement("div")
    controls.classList.add("paginacao")
    container.after(controls)
    controlsByContainer.set(container, controls)

    // mensagem de erro fica dentro dos controles, assim não apaga o conteúdo que já está na tela
    const errorMessage = document.createElement("p")
    errorMessage.classList.add("paginacao-erro")
    errorMessage.textContent = text.error
    errorMessage.hidden = true

    const config = { total: count, container, controls, errorMessage, fetchPage, renderItems, size, text }

    if (mode === "pages") {
        await pagesMode(config)
    } else {
        await showMoreMode({ ...config, lessAfter: lessAfter ?? size })
    }

    return controls
}


// ---------- modo "pages" ----------

async function pagesMode({ total, container, controls, errorMessage, fetchPage, renderItems, size, text }) {
    const totalPages = Math.ceil(total / size)
    let page = 1
    let loading = false

    function makeButton(label, target, { disabled = false, active = false } = {}) {
        const button = document.createElement("button")
        button.type = "button"
        button.textContent = label
        button.disabled = disabled || loading
        button.classList.toggle("active", active)
        if (active) button.setAttribute("aria-current", "page")
        button.addEventListener("click", () => goTo(target))
        return button
    }

    function renderControls() {
        const nodes = [errorMessage]

        nodes.push(makeButton(text.previous, page - 1, { disabled: page === 1 }))

        pageNumbers(page, totalPages).forEach((n) => {
            if (n === "…") {
                const gap = document.createElement("span")
                gap.textContent = "…"
                nodes.push(gap)
            } else {
                nodes.push(makeButton(String(n), n, { active: n === page }))
            }
        })

        nodes.push(makeButton(text.next, page + 1, { disabled: page === totalPages }))

        controls.replaceChildren(...nodes)
    }

    async function goTo(target) {
        if (loading) return
        loading = true
        renderControls()                       // desabilita os botões enquanto busca

        try {
            const items = await fetchPage(target, size)
            container.innerHTML = renderItems(items)
            page = target                      // só muda a página se a busca deu certo
            errorMessage.hidden = true
        } catch {
            errorMessage.hidden = false        // mantém a página antiga na tela
        } finally {
            loading = false
            renderControls()
        }
    }

    await goTo(1)
}

// Quais números mostrar: até 7 páginas aparecem todas; acima disso, primeira, última e vizinhas da atual
function pageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

    const wanted = [1, total, current - 1, current, current + 1]
        .filter((n) => n >= 1 && n <= total)
    const sorted = [...new Set(wanted)].sort((a, b) => a - b)

    const result = []
    sorted.forEach((n, i) => {
        if (i > 0 && n - sorted[i - 1] > 1) result.push("…")
        result.push(n)
    })
    return result
}


// ---------- modo "more" ----------

async function showMoreMode({ total, container, controls, errorMessage, fetchPage, renderItems, size, text, lessAfter }) {
    const moreButton = document.createElement("button")
    moreButton.type = "button"
    moreButton.classList.add("mostrar-mais")

    const lessButton = document.createElement("button")
    lessButton.type = "button"
    lessButton.classList.add("mostrar-menos")
    lessButton.textContent = text.less

    controls.append(errorMessage, moreButton, lessButton)

    let shown = 0        // quantos itens já estão na tela
    let nextPage = 1     // próxima página a buscar
    let loading = false

    function updateButtons() {
        const remaining = total - shown

        // "Mostrar mais": só enquanto ainda há itens escondidos
        moreButton.hidden = remaining <= 0
        moreButton.textContent = `${text.more} (${Math.max(remaining, 0)})`

        // "Mostrar menos": só depois de ter clicado em "Mostrar mais"
        lessButton.hidden = shown <= lessAfter

        moreButton.disabled = loading
        lessButton.disabled = loading
    }

    async function showNext() {
        if (loading) return
        loading = true
        updateButtons()

        try {
            const chunk = await fetchPage(nextPage, size)
            nextPage++
            shown += chunk.length
            container.insertAdjacentHTML("beforeend", renderItems(chunk))
            errorMessage.hidden = true
        } catch {
            errorMessage.hidden = false
        } finally {
            loading = false
            updateButtons()
        }
    }

    async function collapse() {
        if (loading) return
        container.innerHTML = ""
        shown = 0
        nextPage = 1
        await showNext()                             // volta para a primeira página
        container.scrollIntoView({ block: "start" })
    }

    moreButton.addEventListener("click", showNext)
    lessButton.addEventListener("click", collapse)

    container.innerHTML = ""
    await showNext()
}

// Paginação de verdade: o backend manda só a página pedida.
// loadPage(page, size) -> { items, total } (ou null se deu erro)
export async function paginateRemote({ loadPage, pageSize = 10, ...options }) {
    const first = await loadPage(1, pageSize)
    if (!first) return null

    let firstPage = first.items

    return paginate({
        ...options,
        pageSize,
        total: first.total,
        fetchPage: async (page, size) => {
            if (page === 1 && firstPage) {      // usa a resposta que já veio, uma vez só
                const items = firstPage
                firstPage = null
                return items
            }
            const result = await loadPage(page, size)
            if (!result) throw new Error("Falha ao carregar a página")   // o paginate mostra o erro
            return result.items
        },
    })
}
