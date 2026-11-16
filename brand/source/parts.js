// Shared brand pieces for the HTML sources: the mark (same geometry as web/src/components/Logo.tsx) and the halftone.
export const C = { bg: '#E7E6E1', paper: '#F7F6F2', ink: '#0E0E10', blue: '#2B4BFF', orange: '#FF5A1F', base: '#0000FF' }

export const TONES = {
  color: [C.ink, C.blue, C.orange],
  ink: [C.ink, C.ink, C.ink],
  white: [C.paper, C.paper, C.paper],
  paper: [C.paper, C.blue, C.orange],
}

export function markSvg(tone = 'color', size = 64) {
  const [body, lip, clap] = TONES[tone]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64"><rect x="29" y="6" width="6" height="6" rx="1" fill="${body}"/><path d="M13 37V30a19 19 0 0 1 38 0v7z" fill="${body}"/><rect x="7" y="42" width="50" height="7" rx="2" fill="${lip}"/><rect x="26" y="53" width="12" height="6" rx="1.5" fill="${clap}"/></svg>`
}

export function lockup(tone = 'color', px = 120) {
  const color = tone === 'white' || tone === 'paper' ? C.paper : C.ink
  return `<span class="lockup word" style="font-size:${px}px;color:${color}">${markSvg(tone)}<span>bell24</span></span>`
}

/** Square-cell halftone, same field as the site's hero, frozen at time t. */
export function halftone(canvas, { cell = 14, t = 2, drift = 0, bg = C.blue, fg = C.orange } = {}) {
  const r = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  canvas.width = r.width * dpr
  canvas.height = r.height * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  const w = r.width
  const h = r.height
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = fg
  for (let y = cell / 2; y < h; y += cell)
    for (let x = cell / 2; x < w; x += cell) {
      const u = x / w
      const v = y / h
      const a = Math.sin(u * 5.3 + t * 0.35 + drift * 4) * Math.cos(v * 4.1 - t * 0.3)
      const b = Math.sin(u * 3.7 - v * 4.9 + t * 0.25 + drift * 2) * 0.8
      const c = Math.cos(u * 9.1 + v * 6.3 - t * 0.45) * 0.4
      const f = Math.min(Math.max(((a + b + c + 2.2) / 4.4 - 0.38) * 2.4, 0), 1)
      const s = f * cell * 1.02
      if (s > 0.6) ctx.fillRect(x - s / 2, y - s / 2, s, s)
    }
}
