// ------------------------------------------------------------
// Datas que vêm da API
// O banco guarda horário "de parede" (sem fuso). O Flask, ao mandar
// um datetime, escreve no formato "Fri, 23 Oct 2026 18:00:00 GMT",
// e o navegador converteria de GMT para o fuso local (3h a menos no
// Brasil). Aqui a gente lê os números como estão, sem converter.
// Também aceita "2026-10-23 18:00:00" e "2026-10-23".
// ------------------------------------------------------------
export function parseApiDate(value) {
  if (!value) return null
  if (value instanceof Date) return value

  const text = String(value).trim()

  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/)
  if (iso) {
    const [, y, mo, d, h = 0, mi = 0, s = 0] = iso
    return new Date(+y, +mo - 1, +d, +h, +mi, +s)
  }

  const parsed = new Date(text)
  if (isNaN(parsed)) return null

  if (/GMT$/.test(text)) {
    return new Date(
      parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(),
      parsed.getUTCHours(), parsed.getUTCMinutes(), parsed.getUTCSeconds()
    )
  }
  return parsed
}

export function formatarDataEHorario(isoString) {
  const data = parseApiDate(isoString)
  if (!data) return "—"
  return data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
}

export function formatarData(dataString) {
  const data = parseApiDate(dataString)
  if (!data) return "—"
  return data.toLocaleDateString("pt-BR")
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
export function separarData(dataString) {
  const data = parseApiDate(dataString)
  if (!data) return { dia: "—", mes: "", ano: "" }
  return {
    dia: String(data.getDate()).padStart(2, "0"),
    mes: MESES[data.getMonth()],
    ano: String(data.getFullYear()),
  }
}

export function separarDataEHorario(isoString) {
  const d = parseApiDate(isoString)
  if (!d) return { data: "—", hora: "—" }

  return {
    data: d.toLocaleDateString("pt-BR"),
    hora: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  }
}

// "Hoje, 18:00" / "Amanhã, 09:30" / "Ontem, 14:00" / "sex., 30/10, 10:00"
export function prazoCurto(value) {
  const d = parseApiDate(value)
  if (!d) return "—"

  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  const inicioDoDia = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const dias = Math.round((inicioDoDia(d) - inicioDoDia(new Date())) / 86400000)

  if (dias === 0) return `Hoje, ${hora}`
  if (dias === 1) return `Amanhã, ${hora}`
  if (dias === -1) return `Ontem, ${hora}`

  const dia = d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })
  return `${dia}, ${hora}`
}

// "faltam 3 dias" / "é hoje" / "amanhã"
export function diasAte(value) {
  const d = parseApiDate(value)
  if (!d) return ""
  const hoje = new Date()
  const a = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime()
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const dias = Math.round((b - a) / 86400000)
  if (dias === 0) return "é hoje"
  if (dias === 1) return "amanhã"
  if (dias > 1) return `em ${dias} dias`
  if (dias === -1) return "foi ontem"
  return `há ${-dias} dias`
}

export function diaPorExtenso(value) {
  const d = parseApiDate(value)
  if (!d) return ""
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
}
