// ponytail: every number on /app comes from here until the contracts, agent and Chainlink feeds are wired.
// Generated from fixed seeds so the demo reads the same on every load.
import { payout, STOCKS, type Stock } from '../market'
import { seeded } from './ui/util'

export type RiskLevel = 'Low' | 'Moderate' | 'Elevated' | 'High'
export type StockRisk = { score: number; level: RiskLevel; mult: number; drivers: string[] }

export const stock = (sym: string): Stock => STOCKS.find((s) => s.sym === sym) ?? STOCKS[0]
export const ticker = (sym: string) => sym.replace(/c$/, '')

/** The agent's per-stock score (0 to 100) and the premium multiplier it implies for the next closure. */
export const STOCK_RISK: Record<string, StockRisk> = {
  NVDAc: { score: 86, level: 'High', mult: 2.4, drivers: ['Earnings Tue after close', 'Fed speech Sat', 'Perps lean short 1.8%'] },
  METAc: { score: 61, level: 'Elevated', mult: 1.6, drivers: ['EU ruling due Sat', 'Polymarket 38% on a fine'] },
  GOOGLc: { score: 42, level: 'Moderate', mult: 1.2, drivers: ['Antitrust filing Mon', 'Perps −0.6%'] },
  AAPLc: { score: 31, level: 'Moderate', mult: 1.1, drivers: ['No scheduled events', 'Calm gap history'] },
}

export const RISK_NOTE = {
  level: 'High' as RiskLevel,
  mult: 2.4,
  headline: 'NVDA premiums 2.4× normal this week.',
  body: 'A Fed speech lands Saturday and NVIDIA reports Tuesday after the close. Weekend perps already lean short, and its last four closures moved 5.4% on average. Apple and Alphabet stay near normal.',
  inputs: ['Event calendar', 'Past gaps', 'Hyperliquid perps', 'Chainlink 24/7', 'Polymarket and Kalshi odds'],
}

const DAY = 864e5

/** Portfolio value for the last 90 days, ending at today's holdings. Weekend gaps show up as Monday jumps. */
export function portfolioSeries(total: number) {
  const rnd = seeded(24)
  const today = new Date()
  const out: number[] = [total]
  for (let i = 1; i < 90; i++) {
    const d = new Date(today.getTime() - i * DAY)
    const monday = d.getDay() === 1
    const shock = (rnd() - 0.48) * (monday ? 0.07 : 0.026)
    out.unshift(out[0] / (1 + shock))
  }
  return out.map((value, i) => ({
    label: new Date(today.getTime() - (89 - i) * DAY).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value,
  }))
}

export type Closure = {
  id: string
  label: string
  opened: string
  kind: 'Weekend' | 'Earnings night' | 'Holiday'
  premiums: number
  paid: number
  worst: { sym: string; gap: number }
}

const HISTORY_END = new Date(Date.UTC(2026, 10, 13, 21)) // Fri Nov 13 2026, 4:00pm ET
const PAID: Record<number, { sym: string; gap: number; paid: number }> = {
  1: { sym: 'NVDAc', gap: -9.1, paid: 1180 },
  14: { sym: 'METAc', gap: -6.4, paid: 640 },
  29: { sym: 'NVDAc', gap: -12.6, paid: 1520 },
}

/** 44 past closures, newest first: "41 calm, 3 paid out". */
export const CLOSURES: Closure[] = (() => {
  const rnd = seeded(7)
  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('en-US', { timeZone: 'America/New_York', ...o })
  return Array.from({ length: 44 }, (_, i) => {
    const fri = new Date(HISTORY_END.getTime() - i * 7 * DAY)
    const mon = new Date(fri.getTime() + 3 * DAY)
    const hit = PAID[i]
    const s = STOCKS[Math.floor(rnd() * STOCKS.length)]
    const calmGap = -(rnd() * 3.6 + 0.4)
    return {
      id: `c${i}`,
      label: fmt(fri, { month: 'short', day: 'numeric' }),
      opened: fmt(mon, { weekday: 'short', month: 'short', day: 'numeric' }),
      kind: i === 2 ? 'Earnings night' : i === 25 ? 'Holiday' : 'Weekend',
      premiums: Math.round(120 + rnd() * 140 + (hit ? 90 : 0)),
      paid: hit?.paid ?? 0,
      worst: hit ? { sym: hit.sym, gap: hit.gap } : { sym: s.sym, gap: Number(calmGap.toFixed(1)) },
    }
  })
})()

export const POOL = { size: 18420, cap: 0.2, exposure: 3140, apr: 0.118, lockedUntil: 'Mon 10:00am ET' }

export type ReceiptCard = { id: string; sym: string; gap: number; covered: number; deductible: number; limit: number; paid: number; date: string }

/** Your Monday receipts, one per closure that paid you. */
export const RECEIPTS: ReceiptCard[] = [
  { closure: 1, covered: 1000, deductible: 0.05 },
  { closure: 14, covered: 800, deductible: 0.03 },
  { closure: 29, covered: 1000, deductible: 0.05 },
].map(({ closure, covered, deductible }) => {
  const c = CLOSURES[closure]
  const limit = 0.15
  return {
    id: c.id,
    sym: c.worst.sym,
    gap: c.worst.gap,
    covered,
    deductible,
    limit,
    paid: payout(covered, -c.worst.gap / 100, deductible, limit),
    date: c.opened,
  }
})

/** Agent's Monday scorecards: what it expected the pool to pay versus what it did pay. */
export const SCORECARDS = CLOSURES.slice(0, 10).map((c, i) => {
  const rnd = seeded(100 + i)
  const expected = Math.round(c.premiums * (0.35 + rnd() * 0.3) + (c.paid ? c.paid * 0.55 : 0))
  const flagged = c.paid > 0 || rnd() > 0.7
  return { ...c, expected, flagged, mult: Number((1 + rnd() * 1.4 + (c.paid ? 0.6 : 0)).toFixed(1)) }
})

export type ActivityKind = 'cover' | 'payout' | 'renewal' | 'deposit' | 'withdraw' | 'cancel'
export type Activity = { id: string; kind: ActivityKind; title: string; detail: string; amount?: number; unit?: 'usd' | 'usdc'; when: string }

export const SEED_ACTIVITY: Activity[] = [
  { id: 'a1', kind: 'renewal', title: 'Autopilot renewed AAPLc', detail: '$560 covered, 5% deductible', amount: -0.87, when: 'Fri Nov 13' },
  { id: 'a2', kind: 'cover', title: 'Cover bought for NVDAc', detail: 'Once, $1,000 covered, 5% deductible', amount: -4.42, when: 'Fri Nov 13' },
  { id: 'a3', kind: 'payout', title: 'Payout on NVDAc', detail: 'Opened −9.1%, paid at Mon 10:00 ET', amount: 41, when: 'Mon Nov 9' },
  { id: 'a4', kind: 'renewal', title: 'Autopilot renewed AAPLc', detail: '$560 covered, 5% deductible', amount: -0.79, when: 'Fri Nov 6' },
  { id: 'a5', kind: 'deposit', title: 'Deposited to the vault', detail: 'Pool share 13.6%', amount: 2500, unit: 'usdc', when: 'Oct 30' },
]

/** Weekend price path that ends at `move` percent from the frozen Friday close. */
export function weekendPath(seed: number, move: number, points = 48) {
  const rnd = seeded(seed)
  const raw = [0]
  for (let i = 1; i < points; i++) raw.push(raw[i - 1] + (rnd() - 0.5) * 1.1)
  const drift = move - raw[points - 1]
  return raw.map((v, i) => v + (drift * i) / (points - 1))
}
