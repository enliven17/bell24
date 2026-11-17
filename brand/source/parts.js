// Shared brand pieces for the HTML sources: the mark (same geometry as web/src/components/Logo.tsx) and the halftone.
export const C = { bg: '#E6F3F8', paper: '#F8FCFD', ink: '#002941', blue: '#002941', orange: '#FD6E6E', sky: '#B6DFED', base: '#0000FF' }

// [tile, b, coral block, 24]
export const TONES = {
  color: [C.ink, C.paper, C.orange, C.ink],
  ink: [C.ink, C.paper, C.ink, C.paper],
  white: [C.paper, C.ink, C.paper, C.ink],
  paper: [C.paper, C.ink, C.orange, C.ink],
}

const TILE = 'M14 2H62V25a7 7 0 0 1-7 7H29a7 7 0 0 0-7 7V55a7 7 0 0 1-7 7H2V14A12 12 0 0 1 14 2z'
const B = 'M18.23 28.36Q16.7 28.36 15.4 27.73Q14.1 27.1 13.32 25.75H13.11L12.69 28H7.83V6.25H13.8V13.63H14.01Q14.49 13.03 15.15 12.62Q15.81 12.22 16.6 12.01Q17.4 11.8 18.23 11.8Q20.34 11.8 21.84 12.71Q23.34 13.63 24.13 15.46Q24.93 17.29 24.93 20.05Q24.93 22.84 24.13 24.69Q23.34 26.53 21.84 27.45Q20.34 28.36 18.23 28.36ZM16.38 23.95Q17.3 23.95 17.88 23.57Q18.45 23.2 18.7 22.51Q18.95 21.82 18.95 20.89V19.3Q18.95 18.37 18.7 17.68Q18.45 16.99 17.88 16.6Q17.3 16.21 16.38 16.21Q15.69 16.21 15.18 16.48Q14.67 16.75 14.35 17.21Q14.04 17.68 13.88 18.3Q13.73 18.91 13.73 19.6V20.59Q13.73 21.52 14 22.29Q14.28 23.05 14.86 23.5Q15.45 23.95 16.38 23.95Z'
const H24 = 'M31.94 56V55.04Q31.94 54.2 32.3 53.45Q32.66 52.7 33.27 52.03Q33.88 51.36 34.62 50.75Q35.36 50.14 36.14 49.56Q36.94 48.96 37.64 48.46Q38.34 47.96 38.78 47.44Q39.22 46.92 39.22 46.28Q39.22 45.9 39.04 45.57Q38.86 45.24 38.49 45.03Q38.12 44.82 37.5 44.82Q36.88 44.82 36.45 45.06Q36.02 45.3 35.79 45.73Q35.56 46.16 35.56 46.7V47.1H32Q31.98 46.98 31.98 46.86V46.66Q31.98 45.24 32.63 44.2Q33.28 43.16 34.59 42.58Q35.9 42 37.88 42Q39.1 42 40.08 42.29Q41.06 42.58 41.75 43.13Q42.44 43.68 42.81 44.44Q43.18 45.2 43.18 46.14Q43.18 47.06 42.84 47.8Q42.5 48.54 41.88 49.18Q41.26 49.82 40.46 50.42Q39.66 51.02 38.72 51.64Q38.24 51.96 37.94 52.17Q37.64 52.38 37.5 52.48Q37.36 52.58 37.32 52.62H43.34V56ZM50.86 56V53.18H44.16V50.2Q44.82 49.24 45.53 47.93Q46.24 46.62 46.9 45.09Q47.56 43.56 48 42H51.92Q51.84 42.66 51.48 43.5Q51.12 44.34 50.58 45.28Q50.04 46.22 49.4 47.13Q48.76 48.04 48.12 48.85Q47.48 49.66 46.9 50.24H50.86V47.38Q51.12 47.02 51.43 46.5Q51.74 45.98 52.06 45.41Q52.38 44.84 52.62 44.29Q52.86 43.74 52.96 43.32H54.66V50.24H56.58V53.18H54.66V56Z'

export function markSvg(tone = 'color', size = 64) {
  const [tile, b, block, h] = TONES[tone]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64"><path d="${TILE}" fill="${tile}"/><path d="${B}" fill="${b}"/><rect x="26" y="36" width="36" height="26" rx="6" fill="${block}"/><path d="${H24}" fill="${h}"/></svg>`
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
