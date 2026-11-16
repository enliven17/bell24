import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { useMarketClock } from '../components/Countdown'
import { premium } from '../market'
import { SEED_ACTIVITY, STOCK_RISK, stock, type Activity } from './data'
import { useToast } from './ui'

export type Plan = 'autopilot' | 'once'
export type Policy = { amount: number; deductible: number; limit: number; plan: Plan; budget: number }

type State = {
  wallet: string | null
  connecting: boolean
  policies: Record<string, Policy>
  activity: Activity[]
  usdc: number
  deposit: number
  queued: number
  /** Demo switch: let people try the cover flow while the market is closed. */
  salesOverride: boolean
}

type Action =
  | { type: 'connecting' }
  | { type: 'connected'; wallet: string }
  | { type: 'disconnect' }
  | { type: 'policy'; sym: string; policy: Policy | null }
  | { type: 'log'; item: Activity }
  | { type: 'deposit'; amount: number }
  | { type: 'withdraw'; amount: number }
  | { type: 'override'; on: boolean }

const START: State = {
  wallet: null,
  connecting: false,
  policies: {
    NVDAc: { amount: 1000, deductible: 0.05, limit: 0.15, plan: 'once', budget: 10 },
    AAPLc: { amount: 560, deductible: 0.05, limit: 0.15, plan: 'autopilot', budget: 10 },
  },
  activity: SEED_ACTIVITY,
  usdc: 4820,
  deposit: 2500,
  queued: 0,
  salesOverride: false,
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'connecting':
      return { ...s, connecting: true }
    case 'connected':
      return { ...s, connecting: false, wallet: a.wallet }
    case 'disconnect':
      return { ...s, wallet: null }
    case 'policy': {
      const { [a.sym]: _, ...rest } = s.policies
      return { ...s, policies: a.policy ? { ...rest, [a.sym]: a.policy } : rest }
    }
    case 'log':
      return { ...s, activity: [a.item, ...s.activity].slice(0, 30) }
    case 'deposit':
      return { ...s, usdc: s.usdc - a.amount, deposit: s.deposit + a.amount }
    case 'withdraw':
      return { ...s, deposit: s.deposit - a.amount, queued: s.queued + a.amount }
    case 'override':
      return { ...s, salesOverride: a.on }
  }
}

type Ctx = {
  state: State
  dispatch: (a: Action) => void
  connect: () => void
  log: (item: Omit<Activity, 'id' | 'when'>) => void
  /** Whether cover can be bought right now: market open, or the demo override is on. */
  salesOpen: boolean
  marketOpen: boolean
}

const AppCtx = createContext<Ctx | null>(null)

export function useApp() {
  const c = useContext(AppCtx)
  if (!c) throw new Error('useApp must be used inside <AppProvider>')
  return c
}

/** Premium for a policy on a stock, using the agent's multiplier for that stock this closure. */
export const quoteFor = (sym: string, p: Pick<Policy, 'amount' | 'deductible' | 'limit'>) =>
  premium(p.amount, p.deductible, p.limit, stock(sym).gap, STOCK_RISK[sym]?.mult ?? 1)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, START)
  const toast = useToast()
  // Only the open/closed flag lives in context; countdowns read the clock themselves so the tree
  // does not re-render every second.
  const marketOpen = useMarketClock().open
  const timer = useRef(0)
  const seq = useRef(100)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // ponytail: a fake connector. A real one (Coinbase Wallet / Base Account) replaces this timeout.
  const connect = useCallback(() => {
    dispatch({ type: 'connecting' })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      dispatch({ type: 'connected', wallet: '0x7a3f9e21b4c0d58a6f12e9b3c7d4a0f15e2bc41e' })
      toast({ title: 'Wallet connected', body: 'Holdings detected: NVDAc, AAPLc, GOOGLc.', tone: 'blue' })
    }, 900)
  }, [toast])

  const log = useCallback((item: Omit<Activity, 'id' | 'when'>) => {
    dispatch({ type: 'log', item: { ...item, id: `n${seq.current++}`, when: 'Just now' } })
  }, [])

  const value = useMemo(
    () => ({ state, dispatch, connect, log, marketOpen, salesOpen: marketOpen || state.salesOverride }),
    [state, connect, log, marketOpen],
  )
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`
