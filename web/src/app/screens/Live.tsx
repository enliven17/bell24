import { useEffect, useMemo, useState } from 'react'
import Link from '../../components/Link'
import RollingNumber from '../../components/RollingNumber'
import { payout, pct, STOCKS, usd } from '../../market'
import { stock, weekendPath } from '../data'
import { useApp, type Policy } from '../state'
import { AreaChart, Card, StatRow, cn, Empty, IconPulse, IconShield, Meter, PageHeader, Stat, Tag } from '../ui'
import { StockCell } from './parts'

// ponytail: a random walk stands in for weekend token trades until the Chainlink 24/7 feed is wired.
const STEP_MIN = 20 // demo minutes per point
const START_POINTS = 60 // Fri 4:00pm + 20h = Sat 12:00pm
const END_POINTS = Math.round((65.5 * 60) / STEP_MIN) // Mon 9:30am
const START_MOVES: Record<string, number> = { NVDAc: -6.8, AAPLc: -2.4, GOOGLc: 1.2, METAc: -3.1 }
const DAYS = ['Fri', 'Sat', 'Sun', 'Mon']
const two = (n: number) => String(n).padStart(2, '0')

/** Point index to a New York wall-clock label, counting from Friday's 4:00pm close. */
function stamp(i: number) {
  const mins = 16 * 60 + i * STEP_MIN
  const day = DAYS[Math.min(Math.floor(mins / 1440), 3)]
  const m = mins % 1440
  return `${day} ${Math.floor(m / 60)}:${two(m % 60)}`
}

function useWeekendFeed() {
  const [paths, setPaths] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(STOCKS.map((s, i) => [s.sym, weekendPath(11 + i * 7, START_MOVES[s.sym] ?? 0, START_POINTS)])),
  )
  const count = paths[STOCKS[0].sym].length
  const done = count >= END_POINTS
  useEffect(() => {
    if (done) return
    const id = window.setInterval(
      () =>
        setPaths((all) =>
          Object.fromEntries(
            Object.entries(all).map(([k, v]) => {
              const last = v[v.length - 1]
              return [k, [...v, Math.max(-24, Math.min(8, last + (Math.random() - 0.52) * 0.7))]]
            }),
          ),
        ),
      1800,
    )
    return () => window.clearInterval(id)
  }, [done])
  return { paths, count, done }
}

export function Live() {
  const { state } = useApp()
  const { paths, count, done } = useWeekendFeed()
  const entries = Object.entries(state.policies)
  const minsLeft = Math.max(0, (END_POINTS - count) * STEP_MIN + 30)
  const total = entries.reduce((n, [sym, p]) => n + estimate(p, last(paths[sym])), 0)
  const covered = entries.reduce((n, [, p]) => n + p.amount, 0)
  const uncovered = STOCKS.filter((s) => s.held > 0 && !state.policies[s.sym])

  return (
    <>
      <PageHeader
        title="Live weekend"
        sub="Tokens trade all weekend. The oracle stays frozen at Friday's close until the bell."
        actions={<Tag tone="ink">Demo replay, {stamp(count - 1)} ET</Tag>}
      />

      <StatRow cols={3}>
        <Stat variant="accent" size="lg" label="If it opened now" value={<RollingNumber value={total} format={(n) => usd(n)} />} sub={`across ${entries.length} covered positions`} />
        <Stat variant="tile" size="lg" label="Covered" value={usd(covered, 0)} sub="Against the frozen Friday close" />
        <Stat
          variant="tile"
          size="lg"
          label={done ? 'Settling' : 'Settles in'}
          value={done ? 'Mon 10:00' : `${Math.floor(minsLeft / 60)}h ${two(minsLeft % 60)}m`}
          sub="Chainlink price 30 minutes after the open"
        />
      </StatRow>

      {entries.length === 0 ? (
        <Card>
          <Empty
            icon={<IconPulse size={28} />}
            title="No cover this closure"
            body="Turn on cover before the bell and you can watch the payout move here all weekend."
            action={
              <Link className="ap-ui-btn ap-ui-btn-orange" href="/app/cover">
                Set up cover
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="ap-live-grid">
          {entries.map(([sym, p]) => (
            <PolicyCard key={sym} sym={sym} policy={p} path={paths[sym]} />
          ))}
        </div>
      )}

      {uncovered.length > 0 && (
        <Card title="Open to the gap" kicker="Not covered this closure">
          <ul className="ap-open-list">
            {uncovered.map((s) => {
              const move = last(paths[s.sym])
              const would = payout(Math.min(1000, s.held), -move / 100, 0.05, 0.15)
              return (
                <li key={s.sym}>
                  <StockCell sym={s.sym} sub={`${usd(s.held, 0)} held, trading ${pct(move)}`} />
                  <p>
                    {would > 0
                      ? `Default cover would pay ${usd(would)} if it opened now.`
                      : 'Inside a 5% deductible for now. The next closure is a new quote.'}
                  </p>
                  <Link className="ap-ui-btn ap-ui-btn-line ap-ui-btn-sm" href="/app/cover">
                    <IconShield size={16} /> Cover next time
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </>
  )
}

const last = (v: number[]) => v[v.length - 1]
const estimate = (p: Policy, move: number) => payout(p.amount, -move / 100, p.deductible, p.limit)

function PolicyCard({ sym, policy: p, path }: { sym: string; policy: Policy; path: number[] }) {
  const s = stock(sym)
  const close = s.price
  const move = last(path)
  const now = close * (1 + move / 100)
  const est = estimate(p, move)
  const drop = Math.max(-move, 0)
  const data = useMemo(() => path.map((m, i) => ({ label: stamp(i), value: close * (1 + m / 100) })), [path, close])
  const lo = Math.min(...data.map((d) => d.value), close * (1 - p.limit) * 0.99)
  const hi = Math.max(...data.map((d) => d.value), close * 1.02)

  return (
    <Card as="article" className={cn('ap-policy', est > 0 && 'ap-is-paying')}>
      <header className="ap-policy-head">
        <StockCell sym={sym} sub={`${usd(p.amount, 0)} covered, ${p.deductible * 100}% to ${p.limit * 100}%`} />
        <Tag tone={est > 0 ? 'orange' : 'blue'}>{est > 0 ? 'Paying now' : 'Cover active'}</Tag>
      </header>
      <div className="ap-policy-stats">
        <Stat size="sm" label="Friday close" value={usd(close)} sub="Oracle, frozen" tone="muted" />
        <Stat
          size="sm"
          label="Weekend trading"
          value={<RollingNumber value={now} format={(n) => usd(n)} />}
          sub={pct(move)}
          tone={move < 0 ? 'down' : 'up'}
        />
        <Stat size="sm" label="If it opened now" value={<RollingNumber value={est} format={(n) => usd(n)} />} className="ap-policy-pay" />
      </div>
      <AreaChart
        data={data}
        height={190}
        tone={move < 0 ? 'orange' : 'blue'}
        baseline={close}
        domain={[lo, hi]}
        format={(n) => usd(n)}
        axisFormat={(n) => `$${n.toFixed(0)}`}
        refs={[
          { value: close, label: 'Friday close', tone: 'ink' },
          { value: close * (1 - p.deductible), label: `Pays below −${p.deductible * 100}%`, tone: 'orange' },
        ]}
        label={`${sym} weekend trading against the frozen Friday close`}
        tooltip={(d) => (
          <>
            <span>{d.label} ET</span>
            <b className="mono">{usd(d.value)}</b>
            <span>{pct((d.value / close - 1) * 100)}</span>
          </>
        )}
      />
      <Meter
        label={`${sym} drop against the covered band`}
        value={drop}
        max={p.limit * 100 * 1.2}
        tone={est > 0 ? 'orange' : 'ink'}
        marks={[
          { at: p.deductible * 100, label: `Deductible ${p.deductible * 100}%` },
          { at: p.limit * 100, label: `Limit ${p.limit * 100}%` },
        ]}
      />
    </Card>
  )
}
