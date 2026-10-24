export const isResponsible = (profile_type) => profile_type === "responsible"

const pad = (n) => String(n).padStart(2, "0")

export const toDateTimeInputValue = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`

export const minDeadlineValue = (minutes = 30) => {
    const ms = Date.now() + minutes * 60 * 1000
    return toDateTimeInputValue(new Date(Math.ceil(ms / 60000) * 60000))
}
