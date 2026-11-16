// Market clock and the cover maths. Everything here is display only: the contracts enforce the real rules.

export type Stock = { sym: string; name: string; price: number; held: number; gap: number[] }

export const STOCKS: Stock[] = [
  { sym: 'NVDAc', name: 'NVIDIA', price: 186.4, held: 1240, gap: [-2.1, 4.8, -6.2, 1.1, -9.4, 3.3, -1.8, 7.2] },
  { sym: 'AAPLc', name: 'Apple', price: 231.9, held: 560, gap: [0.6, -1.4, 2.2, -3.1, 0.9, -0.4, 1.7, -2.6] },
  { sym: 'METAc', name: 'Meta', price: 702.3, held: 0, gap: [-4.4, 2.9, -0.7, 6.1, -3.8, 1.2, -5.5, 2.4] },
  { sym: 'GOOGLc', name: 'Alphabet', price: 214.6, held: 380, gap: [1.4, -2.2, 0.3, -4.1, 2.8, -0.9, 3.6, -1.1] },
]

/** Payout = covered × (drop − deductible), capped at (limit − deductible). Drop and rates are fractions. */
export function payout(covered: number, drop: number, deductible: number, limit: number) {
  const over = Math.min(Math.max(drop - deductible, 0), limit - deductible)
  return covered * over
}

/** Agent quote stand-in: base rate scaled by the stock's gap history and this closure's risk multiplier. */
export function premium(covered: number, deductible: number, limit: number, gaps: number[], risk = 1) {
  const vol = Math.sqrt(gaps.reduce((s, g) => s + g * g, 0) / gaps.length) / 100
  const band = Math.max(limit - deductible, 0)
  const rate = 0.0014 * (vol / 0.04) * (band / 0.1) * (0.05 / Math.max(deductible, 0.01)) ** 0.6 * risk
  return Math.max(covered * rate, 0.1)
}

// Wall Street hours in New York time. ponytail: no holiday calendar, weekends and the 9:30-16:00 session only.
function nyParts(d: Date) {
  const p = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(d)
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? '0'
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'))
  return { day, mins: (Number(get('hour')) % 24) * 60 + Number(get('minute')), secs: Number(get('second')) }
}

/** Whether the market is open now, and seconds until it next closes (if open) or opens (if closed). */
export function marketClock(now = new Date()) {
  const { day, mins, secs } = nyParts(now)
  const open = 9 * 60 + 30
  const close = 16 * 60
  const weekday = day >= 1 && day <= 5
  if (weekday && mins >= open && mins < close) return { open: true, secs: (close - mins) * 60 - secs }
  // Minutes until the next 9:30 on a weekday.
  let ahead = 0
  let d = day
  let m = mins
  if (!(weekday && m < open)) {
    ahead += 24 * 60 - m
    m = 0
    d = (d + 1) % 7
    while (d === 0 || d === 6) {
      ahead += 24 * 60
      d = (d + 1) % 7
    }
  }
  ahead += open - m
  return { open: false, secs: ahead * 60 - secs }
}

export function hms(total: number) {
  const s = Math.max(0, Math.floor(total))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return { h, m, s: s % 60 }
}

export const usd = (n: number, digits = 2) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits })

export const pct = (n: number, digits = 1) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(digits)}%`

// ponytail: tiny self-check of the payout table from product.md, runs in dev only.
if (import.meta.env.DEV) {
  const ok = [
    [0.03, 0],
    [0.09, 40],
    [0.25, 100],
  ].every(([drop, want]) => Math.abs(payout(1000, drop, 0.05, 0.15) - want) < 1e-9)
  if (!ok) throw new Error('payout formula drifted from the spec table')
}
