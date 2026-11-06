// ============================================================
// Avatar em pixel art gerado a partir do perfil.
// O mesmo perfil sempre gera o mesmo desenho e a mesma cor,
// então ele funciona como a "foto" de quem ainda não tem uma
// (responsáveis e a tela de escolher perfil).
// ============================================================

const PALETTES = [
  { fg: "#ffc23d", bg: "#3a2e14" },   // amarelo-girafa
  { fg: "#8794ff", bg: "#232a5c" },   // lavanda
  { fg: "#4cd38a", bg: "#153a2a" },   // verde
  { fg: "#ff8a96", bg: "#3e1c2a" },   // framboesa
  { fg: "#ff9f5a", bg: "#3d2416" },   // pêssego
  { fg: "#c9a0ff", bg: "#2e2350" },   // lilás
  { fg: "#5fd8e6", bg: "#163640" },   // água
]

// FNV-1a: hash simples e estável para strings
function hash(text) {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return mix(h >>> 0)
}

// embaralha os bits (sem isso, nomes parecidos caem na mesma cor)
function mix(h) {
  h ^= h >>> 16
  h = Math.imul(h, 0x7feb352d)
  h ^= h >>> 15
  h = Math.imul(h, 0x846ca68b)
  h ^= h >>> 16
  return h >>> 0
}

function cells(seed) {
  // 5x5 espelhado: decide as 3 primeiras colunas e copia para as 2 últimas
  const grid = []
  let bits = seed
  for (let y = 0; y < 5; y++) {
    const row = []
    for (let x = 0; x < 3; x++) {
      row[x] = (bits & 1) === 1
      bits = bits >>> 1 || hash(String(seed) + y + x)
    }
    row[3] = row[1]
    row[4] = row[0]
    grid.push(row)
  }
  const filled = grid.flat().filter(Boolean).length
  // muito vazio ou muito cheio fica sem graça: inverte
  if (filled < 7 || filled > 19) return grid.map((r) => r.map((c) => !c))
  return grid
}

export function avatarPalette(profile = {}) {
  const key = `${profile.id ?? ""}:${profile.name ?? ""}`
  return PALETTES[hash(key) % PALETTES.length]
}

// avatarSvg(perfil) -> string <svg> (sem moldura)
export function avatarSvg(profile = {}) {
  const key = `${profile.id ?? ""}:${profile.name ?? ""}`
  const seed = hash(key)
  const { fg, bg } = avatarPalette(profile)

  let rects = ""
  cells(seed).forEach((row, y) => row.forEach((on, x) => {
    if (on) rects += `<rect x="${x + 1}" y="${y + 1}" width="1" height="1"/>`
  }))

  return `<svg viewBox="0 0 7 7" shape-rendering="crispEdges" aria-hidden="true">
    <rect width="7" height="7" fill="${bg}"/>
    <g fill="${fg}">${rects}</g>
  </svg>`
}

// avatar(perfil, { size }) -> string com a moldura em degrau de pixel
export function avatar(profile = {}, { size = 40, className = "" } = {}) {
  return `<span class="avatar ${className}" style="--av-size:${size}px">${avatarSvg(profile)}</span>`
}
