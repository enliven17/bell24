import { useEffect, useMemo, useState } from 'react'
import Link from '../components/Link'
import Halftone from '../components/Halftone'
import RollingNumber from '../components/RollingNumber'
import { Mark } from '../components/Logo'
import { navigate } from '../router'
import { payout, pct, premium, STOCKS, usd } from '../market'

export type Policy = { amount: number; deductible: number; limit: number; plan: 'autopilot' | 'once'; budget: number }

const RISK = { level: 'High', mult: 2.4, note: 'Fed speech Saturday, NVDA earnings Tuesday. Weekend perps lean short.' }
const stock = (sym: string) => STOCKS.find((s) => s.sym === sym) ?? STOCKS[0]
const fmtUsd = (n: number, d = 2) => usd(n, d)

/* Home: holdings detected in the wallet, with cover status. */
export function Home({ policies, onProtect }: { policies: Record<string, Policy>; onProtect: (s: string) => void }) {
  const held = STOCKS.filter((s) => s.held > 0)
  const total = held.reduce((n, s) => n + s.held, 0)
  const covered = Object.values(policies).reduce((n, p) => n + p.amount, 0)
  return (
    <>
      <section className="app-hero">
        <div>
          <span className="label-ink">Your stock tokens</span>
          <h1 className="app-h1">{fmtUsd(total)}</h1>
          <p className="muted">
            {fmtUsd(covered)} covered for the next closure. {held.length - Object.keys(policies).length} positions open
            to the gap.
          </p>
        </div>
        <article className="risk">
          <span className="label-paper">This weekend's risk</span>
          <b className="risk-level">{RISK.level}</b>
          <p>{RISK.note}</p>
          <span className="risk-mult mono">Premiums {RISK.mult}× normal</span>
        </article>
      </section>

      <section className="holdings">
        {held.map((s) => {
          const p = policies[s.sym]
          return (
            <article className="holding" key={s.sym}>
              <span className="tick">{s.sym.slice(0, 1)}</span>
              <div className="holding-name">
                <b>{s.sym}</b>
                <span className="muted">{s.name}</span>
              </div>
              <span className="holding-val mono">{fmtUsd(s.held)}</span>
              <span className={`tag ${p ? 'tag-on' : 'tag-off'}`}>
                {p ? (p.plan === 'autopilot' ? 'Autopilot' : 'Covered once') : 'Unprotected'}
              </span>
              <span className="holding-prem mono">
                {p ? fmtUsd(premium(p.amount, p.deductible, p.limit, s.gap, RISK.mult)) : ''}
              </span>
              <button
                className={`btn ${p ? 'btn-line' : 'btn-orange'}`}
                onClick={() => {
                  onProtect(s.sym)
                  navigate('/app/cover')
                }}
              >
                {p ? 'Edit' : 'Protect'}
              </button>
            </article>
          )
        })}
      </section>
    </>
  )
}

/* Cover: set up or edit a policy for one stock. */
export function Cover({
  sym,
  setSym,
  policy,
  onSave,
}: {
  sym: string
  setSym: (s: string) => void
  policy?: Policy
  onSave: (p: Policy | null) => void
}) {
  const s = stock(sym)
  const [amount, setAmount] = useState(policy?.amount ?? Math.min(1000, s.held))
  const [deductible, setDeductible] = useState(policy?.deductible ?? 0.05)
  const [plan, setPlan] = useState<Policy['plan']>(policy?.plan ?? 'autopilot')
  const [budget, setBudget] = useState(policy?.budget ?? 10)
  const limit = 0.15

  useEffect(() => {
    setAmount(policy?.amount ?? Math.min(1000, s.held))
    setDeductible(policy?.deductible ?? 0.05)
    setPlan(policy?.plan ?? 'autopilot')
  }, [sym]) // eslint-disable-line react-hooks/exhaustive-deps

  const capped = Math.min(Math.max(amount || 0, 0), s.held)
  const quote = premium(capped, deductible, limit, s.gap, RISK.mult)
  const overBudget = plan === 'autopilot' && quote * 4 > budget

  return (
    <div className="cover">
      <section className="panel">
        <h1 className="app-h2">Protect {s.sym}</h1>
        <div className="field">
          <span className="label-ink">Stock</span>
          <div className="seg">
            {STOCKS.filter((x) => x.held > 0).map((x) => (
              <button key={x.sym} className={x.sym === sym ? 'is-on' : ''} onClick={() => setSym(x.sym)}>
                {x.sym}
              </button>
            ))}
          </div>
        </div>
        <label className="field">
          <span className="label-ink">Amount (you hold {fmtUsd(s.held)})</span>
          <span className="input">
            <span>$</span>
            <input type="number" min={0} max={s.held} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </span>
          {amount > s.held && <small className="warn">Cover is capped at what you hold: {fmtUsd(s.held)}.</small>}
        </label>
        <div className="field">
          <span className="label-ink">Deductible</span>
          <div className="seg">
            {[0.03, 0.05, 0.08].map((d) => (
              <button key={d} className={d === deductible ? 'is-on' : ''} onClick={() => setDeductible(d)}>
                {d * 100}%
              </button>
            ))}
          </div>
        </div>
        <div className="field row">
          <span className="label-ink">Limit</span>
          <b className="mono">15%</b>
        </div>
        <div className="field">
          <span className="label-ink">Plan</span>
          <div className="seg">
            <button className={plan === 'autopilot' ? 'is-on' : ''} onClick={() => setPlan('autopilot')}>
              Autopilot
            </button>
            <button className={plan === 'once' ? 'is-on' : ''} onClick={() => setPlan('once')}>
              Once
            </button>
          </div>
        </div>
        {plan === 'autopilot' && (
          <label className="field">
            <span className="label-ink">Monthly budget cap</span>
            <span className="input">
              <span>$</span>
              <input type="number" min={1} value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
            </span>
            {overBudget && <small className="warn">At this weekend's price, four closures exceed the cap. Autopilot skips the rest.</small>}
          </label>
        )}
      </section>

      <section className="quote">
        <span className="label-paper">This closure</span>
        <b className="quote-price mono">
          <RollingNumber value={quote} format={fmtUsd} />
        </b>
        <p>Fri 4:00pm ET to Mon 10:00am ET. Priced by the agent at {RISK.mult}× normal risk.</p>
        <table className="quote-table">
          <thead>
            <tr>
              <th>Monday open</th>
              <th>Payout</th>
            </tr>
          </thead>
          <tbody>
            {[-0.03, -0.09, -0.15, -0.25].map((d) => (
              <tr key={d}>
                <td className="mono">{pct(d * 100, 0)}</td>
                <td className="mono">{fmtUsd(payout(capped, -d, deductible, limit))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="quote-actions">
          <button
            className="btn btn-orange"
            disabled={capped <= 0}
            onClick={() => {
              onSave({ amount: capped, deductible, limit, plan, budget })
              navigate('/app')
            }}
          >
            {policy ? 'Update cover' : 'Turn on cover'}
          </button>
          {policy && (
            <button
              className="btn btn-ghost-paper"
              onClick={() => {
                onSave(null)
                navigate('/app')
              }}
            >
              Cancel cover
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

/* Live: weekend view, the payout if the market opened right now. */
export function Live({ policies }: { policies: Record<string, Policy> }) {
  const entries = Object.entries(policies)
  const [moves, setMoves] = useState<Record<string, number>>(() => ({ NVDAc: -6.8, AAPLc: -2.4, GOOGLc: 1.2, METAc: -3.1 }))

  // ponytail: a random walk stands in for weekend token trades until the price feed is wired.
  useEffect(() => {
    const id = setInterval(
      () =>
        setMoves((m) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, Math.max(-24, Math.min(8, v + (Math.random() - 0.52) * 0.6))]))),
      1800,
    )
    return () => clearInterval(id)
  }, [])

  if (!entries.length)
    return (
      <section className="panel empty">
        <h1 className="app-h2">No cover this closure.</h1>
        <p className="muted">Turn on cover before the bell to watch it here.</p>
        <Link className="btn btn-orange" href="/app/cover">
          Set up cover
        </Link>
      </section>
    )

  return (
    <div className="live">
      {entries.map(([sym, p]) => {
        const s = stock(sym)
        const move = moves[sym] ?? 0
        const close = s.price
        const now = close * (1 + move / 100)
        const est = payout(p.amount, -move / 100, p.deductible, p.limit)
        return (
          <article className={`live-card ${est > 0 ? 'is-paying' : ''}`} key={sym}>
            <header>
              <b>{sym}</b>
              <span className="tag tag-on">Cover active</span>
            </header>
            <dl>
              <div>
                <dt>Friday close</dt>
                <dd className="mono">{fmtUsd(close)}</dd>
              </div>
              <div>
                <dt>Weekend trading</dt>
                <dd className="mono">
                  <RollingNumber value={now} format={fmtUsd} /> <span className="move">{pct(move)}</span>
                </dd>
              </div>
              <div>
                <dt>If it opened now</dt>
                <dd className="mono live-pay">
                  <RollingNumber value={est} format={fmtUsd} />
                </dd>
              </div>
            </dl>
            <div className="live-bar">
              <span style={{ transform: `scaleX(${Math.min(Math.max(-move / 100, 0) / p.limit, 1)})` }} />
              <i style={{ left: `${(p.deductible / p.limit) * 100}%` }} />
            </div>
            <footer className="muted">
              {fmtUsd(p.amount)} covered, {p.deductible * 100}% deductible. Settles Mon 10:00 ET against Chainlink.
            </footer>
          </article>
        )
      })}
    </div>
  )
}

/* Vault: underwriters deposit USDC and earn premiums on calm closures. */
export function Vault() {
  const [balance, setBalance] = useState(2500)
  const [input, setInput] = useState('500')
  const history = useMemo(() => Array.from({ length: 44 }, (_, i) => ([7, 19, 38].includes(i) ? 'paid' : 'calm')), [])
  const amt = Number(input) || 0
  return (
    <div className="vault">
      <section className="vault-stats">
        {[
          ['Pool size', '$18,420'],
          ['Your deposit', fmtUsd(balance, 0)],
          ['Premiums earned', '$214.60'],
          ['Exposure this closure', '$3,140 of $3,684 cap'],
        ].map(([k, v]) => (
          <article key={k} className="vstat">
            <span className="label-ink">{k}</span>
            <b className="mono">{v}</b>
          </article>
        ))}
      </section>
      <section className="panel">
        <h2 className="app-h2">Deposit USDC</h2>
        <span className="input">
          <span>$</span>
          <input type="number" min={0} value={input} onChange={(e) => setInput(e.target.value)} />
        </span>
        <div className="quote-actions">
          <button className="btn btn-orange" disabled={amt <= 0} onClick={() => setBalance((b) => b + amt)}>
            Deposit
          </button>
          <button className="btn btn-line" disabled={amt <= 0 || amt > balance} onClick={() => setBalance((b) => b - amt)}>
            Queue withdrawal
          </button>
        </div>
        <p className="muted small">Withdrawals are locked during an active closure and processed between closures.</p>
      </section>
      <section className="panel">
        <h2 className="app-h2">44 closures. 41 calm, 3 paid out.</h2>
        <div className="closures">
          {history.map((h, i) => (
            <span key={i} className={`closure closure-${h}`} title={h === 'paid' ? 'Paid out' : 'Calm'} />
          ))}
        </div>
      </section>
    </div>
  )
}

/* Receipt: the Monday card people share. */
export function Receipt() {
  const text = 'NVDA gapped −9% at the open. bell24 paid me $40 before my coffee.'
  const [copied, setCopied] = useState(false)
  return (
    <div className="receipt-wrap">
      <article className="receipt">
        <Halftone className="receipt-bg" cell={12} />
        <div className="receipt-card">
          <span className="receipt-top">
            <Mark size={28} /> Monday receipt
          </span>
          <b className="receipt-big">
            NVDA <span>−9.1%</span>
          </b>
          <b className="receipt-paid mono">+$40.00</b>
          <p>Paid automatically, Mon Nov 23, 10:00 ET.</p>
          <small>bell24.xyz · Built on Base</small>
        </div>
      </article>
      <div className="receipt-actions">
        <a
          className="btn btn-orange"
          target="_blank"
          rel="noreferrer"
          href={`https://x.com/intent/post?text=${encodeURIComponent(text + ' @buildonbase')}`}
        >
          Share on X
        </a>
        <button
          className="btn btn-line"
          onClick={() => navigator.clipboard?.writeText(text).then(() => setCopied(true), () => setCopied(false))}
        >
          {copied ? 'Copied' : 'Copy text'}
        </button>
      </div>
    </div>
  )
}
