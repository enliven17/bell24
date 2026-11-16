import { useState } from 'react'
import RollingNumber from '../../components/RollingNumber'
import { pct, usd, weekendWindow } from '../../market'
import { CLOSURES, POOL, type Closure } from '../data'
import { useApp } from '../state'
import {
  BarChart,
  Card,
  cn,
  compactUsd,
  Field,
  IconClock,
  IconLock,
  Meter,
  NumberInput,
  PageHeader,
  Segmented,
  Stat,
  StatRow,
  StatusButton,
  useStatusFlow,
  TabPanel,
  Tabs,
  Tag,
  useToast,
} from '../ui'

const EXPOSURE = [
  { sym: 'NVDAc', value: 1480 },
  { sym: 'AAPLc', value: 620 },
  { sym: 'GOOGLc', value: 540 },
  { sym: 'METAc', value: 500 },
]
const SEED_DEPOSIT = 2500

export function Vault() {
  const { state } = useApp()
  const pool = POOL.size - SEED_DEPOSIT + state.deposit + state.queued
  const share = state.deposit / pool
  const calm = CLOSURES.filter((c) => !c.paid).length
  const net = CLOSURES.reduce((n, c) => n + c.premiums - c.paid, 0)
  const cap = pool * POOL.cap

  return (
    <>
      <PageHeader
        title="Underwriter vault"
        sub="Back the pool with USDC. Keep the premiums when the weekend is calm."
        actions={<Tag tone="ink">ERC-4626, USDC</Tag>}
      />

      <StatRow cols={5}>
        <Stat variant="accent" label="Pool size" value={<RollingNumber value={pool} format={(n) => usd(n, 0)} />} sub="One pool backs every stock" />
        <Stat variant="tile" label="Your deposit" value={<RollingNumber value={state.deposit} format={(n) => usd(n, 0)} />} sub={`${pct(share * 100, 1).replace('+', '')} of the pool`} />
        <Stat variant="tile" label="Premiums earned" value={usd(net * (SEED_DEPOSIT / POOL.size) * 0.4, 2)} sub="Yours, since first deposit" tone="up" />
        <Stat variant="tile" label="Trailing APR" value={pct(POOL.apr * 100, 1).replace('+', '')} sub="Last 12 closures, net" />
        <Stat variant="tile" label="Closures" value={`${calm} calm`} sub={`${CLOSURES.length - calm} paid out of ${CLOSURES.length}`} />
      </StatRow>

      <div className="ap-grid">
        <div className="ap-span-8 ap-stack-col">
          <PremiumsCard share={share} />
          <Card title="Exposure this closure" kicker="Assumes every stock gaps together">
            <div className="ap-exposure-head">
              <b className="mono">{usd(POOL.exposure, 0)}</b>
              <span>of a {usd(cap, 0)} cap ({POOL.cap * 100}% of the pool)</span>
            </div>
            <Meter
              label="Exposure against the cap"
              value={POOL.exposure}
              max={cap}
              tone={POOL.exposure / cap > 0.85 ? 'orange' : 'blue'}
              marks={[{ at: cap * 0.85, label: 'Sales pause at 85%' }]}
            />
            <ul className="ap-expo-list">
              {EXPOSURE.map((e) => (
                <li key={e.sym}>
                  <span>{e.sym}</span>
                  <span className="ap-expo-bar">
                    <span style={{ width: `${(e.value / POOL.exposure) * 100}%` }} />
                  </span>
                  <b className="mono">{usd(e.value, 0)}</b>
                </li>
              ))}
            </ul>
          </Card>
          <HistoryCard />
        </div>
        <div className="ap-span-4 ap-sticky-col">
          <DepositCard pool={pool} />
        </div>
      </div>
    </>
  )
}

function PremiumsCard({ share }: { share: number }) {
  const [view, setView] = useState<'pool' | 'yours'>('pool')
  const rows = CLOSURES.slice(0, 16).reverse()
  const k = view === 'pool' ? 1 : share
  return (
    <Card
      title="Premiums earned"
      kicker="Per closure, net of payouts"
      action={
        <Segmented
          size="sm"
          label="Show"
          value={view}
          onChange={setView}
          options={[
            { value: 'pool', label: 'Pool' },
            { value: 'yours', label: 'Yours' },
          ]}
        />
      }
    >
      <BarChart
        key={view}
        height={220}
        series={[{ name: 'Net', tone: 'blue' }]}
        data={rows.map((c) => ({ label: c.label, values: [(c.premiums - c.paid) * k], tones: [c.paid ? 'orange' : 'blue'] }))}
        format={(n) => (n < 0 ? `−${usd(-n)}` : usd(n))}
        axisFormat={compactUsd}
        label={`Net premiums per closure for ${view === 'pool' ? 'the pool' : 'your share'}`}
        tooltip={(d, i) => {
          const c = rows[i]
          return (
            <>
              <span>Week of {c.label}</span>
              <b className="mono">{usd(c.premiums * k)} in</b>
              {c.paid > 0 && <b className="mono ap-is-down">{usd(c.paid * k)} paid out</b>}
              <span>Net {d.values[0] < 0 ? `−${usd(-d.values[0])}` : usd(d.values[0])}</span>
            </>
          )
        }}
      />
    </Card>
  )
}

function HistoryCard() {
  const ordered = [...CLOSURES].reverse()
  const [sel, setSel] = useState<Closure>(CLOSURES[0])
  const calm = CLOSURES.filter((c) => !c.paid).length
  return (
    <Card title={`${CLOSURES.length} closures. ${calm} calm, ${CLOSURES.length - calm} paid out.`} kicker="History">
      <div className="ap-closures" role="group" aria-label="Past closures, oldest first">
        {ordered.map((c) => (
          <button
            key={c.id}
            type="button"
            className={cn('ap-closure', c.paid ? 'ap-is-paid' : 'ap-is-calm', sel.id === c.id && 'ap-is-sel')}
            aria-label={`${c.kind}, week of ${c.label}: ${c.paid ? `paid ${usd(c.paid, 0)}` : 'calm'}`}
            onMouseEnter={() => setSel(c)}
            onFocus={() => setSel(c)}
            onClick={() => setSel(c)}
          />
        ))}
      </div>
      <div className="ap-closure-legend">
        <span>
          <i className="ap-key ap-key-calm" /> Calm
        </span>
        <span>
          <i className="ap-key ap-key-orange" /> Paid out
        </span>
        <span className="ap-muted">Oldest left, newest right</span>
      </div>
      <dl className="ap-closure-detail" aria-live="polite">
        <div>
          <dt>Closure</dt>
          <dd>
            {sel.kind}, {sel.label}
          </dd>
        </div>
        <div>
          <dt>Reopened</dt>
          <dd>{sel.opened}</dd>
        </div>
        <div>
          <dt>Premiums in</dt>
          <dd className="mono">{usd(sel.premiums, 0)}</dd>
        </div>
        <div>
          <dt>Paid out</dt>
          <dd className={cn('mono', sel.paid > 0 && 'ap-is-down')}>{sel.paid ? usd(sel.paid, 0) : 'Nothing'}</dd>
        </div>
        <div>
          <dt>Largest gap</dt>
          <dd className="mono">
            {sel.worst.sym} {pct(sel.worst.gap)}
          </dd>
        </div>
      </dl>
    </Card>
  )
}

function DepositCard({ pool }: { pool: number }) {
  const { state, dispatch, connect, log } = useApp()
  const toast = useToast()
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [amount, setAmount] = useState(500)
  const win = weekendWindow()
  const max = tab === 'deposit' ? state.usdc : state.deposit
  const over = amount > max
  const valid = amount > 0 && !over
  const nextShare = tab === 'deposit' ? (state.deposit + amount) / (pool + amount) : Math.max(state.deposit - amount, 0) / pool
  const { status, run } = useStatusFlow()

  const commit = () => {
    if (tab === 'deposit') {
      dispatch({ type: 'deposit', amount })
      log({ kind: 'deposit', title: 'Deposited to the vault', detail: `Pool share ${pct(nextShare * 100).replace('+', '')}`, amount, unit: 'usdc' })
      toast({ title: `Deposited ${usd(amount, 0)} USDC`, body: 'Your share earns from the next closure.', tone: 'blue' })
    } else {
      dispatch({ type: 'withdraw', amount })
      log({ kind: 'withdraw', title: 'Withdrawal queued', detail: 'Processed between closures', amount: -amount, unit: 'usdc' })
      toast({ title: `Withdrawal of ${usd(amount, 0)} queued`, body: `Processed ${win.active ? 'after settlement, Mon 10:00am ET' : 'before the next closure'}.` })
    }
  }

  return (
    <Card title="Manage position" className="ap-deposit">
      <Tabs
        id="vault"
        label="Deposit or withdraw"
        value={tab}
        onChange={(t) => {
          setTab(t)
          setAmount(Math.min(500, t === 'deposit' ? state.usdc : state.deposit))
        }}
        options={[
          { value: 'deposit', label: 'Deposit' },
          { value: 'withdraw', label: 'Withdraw' },
        ]}
      />
      <TabPanel id="vault" active={tab} className="ap-deposit-panel">
        <Field
          label="Amount"
          htmlFor="vault-amount"
          aside={<span className="mono">{tab === 'deposit' ? 'Wallet' : 'Deposited'} {usd(max, 0)}</span>}
          error={over ? `You have ${usd(max)} available.` : undefined}
        >
          <NumberInput id="vault-amount" size="lg" value={amount} onChange={setAmount} onMax={() => setAmount(Math.floor(max))} suffix="USDC" prefix="" invalid={over} describedBy="vault-amount-msg" />
        </Field>
        <dl className="ap-kv">
          <div>
            <dt>Pool share after</dt>
            <dd className="mono">{pct(nextShare * 100, 2).replace('+', '')}</dd>
          </div>
          <div>
            <dt>Per calm closure</dt>
            <dd className="mono">about {usd(nextShare * 190)}</dd>
          </div>
          {state.queued > 0 && (
            <div>
              <dt>Queued to withdraw</dt>
              <dd className="mono">{usd(state.queued, 0)}</dd>
            </div>
          )}
        </dl>
        {tab === 'withdraw' && (
          <div className="ap-notice ap-notice-compact">
            <span className="ap-notice-icon">{win.active ? <IconLock size={18} /> : <IconClock size={18} />}</span>
            <div>
              <b>{win.active ? 'Locked during this closure.' : 'Processed between closures.'}</b>
              <p>
                {win.active
                  ? 'Requests queue now and pay out after settlement, Mon 10:00am ET.'
                  : 'Requests made now pay out before Friday 4:00pm ET.'}{' '}
                Exposure already sold stays backed.
              </p>
            </div>
          </div>
        )}
        {state.wallet ? (
          <StatusButton
            className="ap-ui-btn-orange ap-ui-btn-block ap-ui-btn-lg"
            status={status}
            disabled={!valid}
            onClick={() => run(commit)}
            idle={tab === 'deposit' ? `Deposit ${amount > 0 ? usd(amount, 0) : ''}` : 'Queue withdrawal'}
            loading={tab === 'deposit' ? 'Depositing' : 'Queueing'}
            success={tab === 'deposit' ? 'Deposited' : 'Queued'}
          />
        ) : (
          <button type="button" className="ap-ui-btn ap-ui-btn-ink ap-ui-btn-block ap-ui-btn-lg" onClick={connect} disabled={state.connecting}>
            {state.connecting ? 'Connecting' : 'Connect wallet'}
          </button>
        )}
        <p className="ap-fine">Underwriters lose when a closure gaps hard. Payouts per closure are capped at {POOL.cap * 100}% of the pool.</p>
      </TabPanel>
    </Card>
  )
}
