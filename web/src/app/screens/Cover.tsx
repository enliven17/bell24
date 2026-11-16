import { useState } from 'react'
import RollingNumber from '../../components/RollingNumber'
import { coverWindow, payout, pct, STOCKS, usd } from '../../market'
import { navigate } from '../../router'
import { STOCK_RISK, stock } from '../data'
import { quoteFor, useApp, type Plan, type Policy } from '../state'
import {
  Card,
  cn,
  Field,
  IconArrow,
  IconCheck,
  IconRefresh,
  IconShield,
  Modal,
  NumberInput,
  PageHeader,
  Segmented,
  Slider,
  StockBadge,
  Tag,
  spotlight,
  StatusButton,
  useStatusFlow,
  useToast,
} from '../ui'
import { PayoutCurve } from './PayoutCurve'
import { CoverTag, SalesClosed } from './parts'

const DEDUCTIBLES = [0.03, 0.05, 0.08]
const LIMITS = [0.1, 0.15, 0.2]
const CLOSURES_PER_MONTH = 4

export function Cover({ sym, setSym }: { sym: string; setSym: (s: string) => void }) {
  const { state } = useApp()
  return (
    <>
      <PageHeader title="Set up cover" sub="Keep the position. Cover the jump at Monday's open." />
      <Card title="Choose a position" kicker="Step 1" className="ap-picker-card">
        <div className="ap-picker" role="radiogroup" aria-label="Stock to cover">
          {STOCKS.map((s) => {
            const on = s.sym === sym
            const disabled = s.held <= 0
            return (
              <button
                key={s.sym}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={disabled}
                className={cn('ap-pick ap-spot', on && 'ap-is-on')}
                onPointerMove={spotlight}
                onClick={() => setSym(s.sym)}
              >
                <span className="ap-pick-top">
                  <StockBadge sym={s.sym} size={36} />
                  {on && (
                    <span className="ap-pick-check">
                      <IconCheck size={16} />
                    </span>
                  )}
                </span>
                <b>{s.sym}</b>
                <span className="ap-pick-name">{s.name}</span>
                <span className="ap-pick-row">
                  <span className="mono">{disabled ? 'Not held' : usd(s.held, 0)}</span>
                  {disabled ? <Tag>No balance</Tag> : <CoverTag plan={state.policies[s.sym]?.plan} />}
                </span>
                <span className="ap-pick-risk">
                  Risk <b className="mono">{STOCK_RISK[s.sym].score}</b> · {STOCK_RISK[s.sym].mult.toFixed(1)}× premium
                </span>
              </button>
            )
          })}
        </div>
      </Card>
      <CoverForm key={sym} sym={sym} />
    </>
  )
}

function CoverForm({ sym }: { sym: string }) {
  const { state, dispatch, log, connect, salesOpen } = useApp()
  const toast = useToast()
  const s = stock(sym)
  const existing = state.policies[sym]
  const [amount, setAmount] = useState(existing?.amount ?? Math.min(1000, s.held))
  const [deductible, setDeductible] = useState(existing?.deductible ?? 0.05)
  const [limit, setLimit] = useState(existing?.limit ?? 0.15)
  const [plan, setPlan] = useState<Plan>(existing?.plan ?? 'autopilot')
  const [budget, setBudget] = useState(existing?.budget ?? 10)
  const [review, setReview] = useState(false)

  const covered = Math.min(Math.max(amount, 0), s.held)
  const quote = quoteFor(sym, { amount: covered, deductible, limit })
  const runs = Math.floor(budget / Math.max(quote, 0.01))
  const overCap = amount > s.held
  const win = coverWindow()
  const risk = STOCK_RISK[sym]
  const policy: Policy = { amount: covered, deductible, limit, plan, budget }
  const canBuy = covered > 0 && salesOpen

  const { status, run } = useStatusFlow(1000, 900)
  const wasNew = !existing

  const confirm = () =>
    run(
      () => {
        dispatch({ type: 'policy', sym, policy })
        log({
          kind: 'cover',
          title: `${wasNew ? 'Cover bought' : 'Cover updated'} for ${sym}`,
          detail: `${plan === 'autopilot' ? 'Autopilot' : 'Once'}, ${usd(covered, 0)} covered, ${deductible * 100}% deductible`,
          amount: -quote,
        })
      },
      () => {
        setReview(false)
        toast({
          title: `Cover is on for ${sym}`,
          body: plan === 'autopilot' ? `Autopilot renews every closure up to ${usd(budget, 0)} a month.` : `Covers ${win.from} to ${win.to}.`,
          tone: 'blue',
        })
        navigate('/app')
      },
    )

  const cancel = () => {
    dispatch({ type: 'policy', sym, policy: null })
    log({ kind: 'cancel', title: `Cover cancelled for ${sym}`, detail: 'Takes effect before the next closure' })
    toast({ title: `Cover cancelled for ${sym}` })
    navigate('/app')
  }

  return (
    <div className="ap-grid ap-cover-grid">
      <div className="ap-span-7 ap-stack-col">
        <Card title="How much to cover" kicker="Step 2">
          <Field
            label="Covered amount"
            htmlFor="amount"
            aside={<span className="mono">You hold {usd(s.held)}</span>}
            error={overCap ? `Cover is capped at what you hold. This policy will cover ${usd(s.held)}.` : undefined}
            hint="Cover can never exceed the tokens in your wallet when you buy."
          >
            <NumberInput
              id="amount"
              size="lg"
              value={amount}
              max={s.held}
              step={10}
              onChange={setAmount}
              onMax={() => setAmount(s.held)}
              invalid={overCap}
              describedBy="amount-msg"
            />
          </Field>
          <Slider
            label="Covered amount"
            min={0}
            max={s.held}
            step={10}
            value={covered}
            onChange={setAmount}
            format={(n) => usd(n, 0)}
          />
          <div className="ap-quick">
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <button key={f} type="button" className={cn('ap-quick-btn', covered === Math.round(s.held * f) && 'ap-is-on')} onClick={() => setAmount(Math.round(s.held * f))}>
                {f === 1 ? 'All' : `${f * 100}%`}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Deductible and limit" kicker="Step 3">
          <div className="ap-two">
            <Field label="Deductible" hint="The part of the drop you absorb.">
              <Segmented
                label="Deductible"
                stretch
                value={deductible}
                onChange={setDeductible}
                options={DEDUCTIBLES.map((d) => ({ value: d, label: `${d * 100}%`, disabled: d >= limit }))}
              />
            </Field>
            <Field label="Limit" hint="The largest drop you are covered for.">
              <Segmented
                label="Limit"
                stretch
                value={limit}
                onChange={setLimit}
                options={LIMITS.map((l) => ({ value: l, label: `${l * 100}%`, disabled: l <= deductible }))}
              />
            </Field>
          </div>
          <PayoutCurve amount={covered} deductible={deductible} limit={limit} />
        </Card>

        <Card title="Plan" kicker="Step 4">
          <div className="ap-plans" role="radiogroup" aria-label="Plan">
            {(
              [
                ['autopilot', 'Autopilot', 'Renews before every closure, within a monthly budget.', <IconRefresh key="r" size={20} />],
                ['once', 'Once', `Covers the next closure only, ${win.from} to ${win.to}.`, <IconShield key="s" size={20} />],
              ] as const
            ).map(([value, title, body, icon]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={plan === value}
                className={cn('ap-plan ap-spot', plan === value && 'ap-is-on')}
                onPointerMove={spotlight}
                onClick={() => setPlan(value)}
              >
                <span className="ap-plan-icon">{icon}</span>
                <b>{title}</b>
                <span>{body}</span>
                {value === 'autopilot' && <Tag tone={plan === value ? 'paper' : 'soft-blue'}>Recommended</Tag>}
              </button>
            ))}
          </div>
          {plan === 'autopilot' && (
            <div className="ap-budget">
              <Field
                label="Monthly budget cap"
                htmlFor="budget"
                aside={<span className="mono">about {Math.min(runs, 99)} closures at this price</span>}
                error={runs < CLOSURES_PER_MONTH ? `At this weekend's price the cap covers ${runs} of about ${CLOSURES_PER_MONTH} closures. Autopilot skips the rest.` : undefined}
              >
                <NumberInput id="budget" value={budget} min={1} max={100} onChange={setBudget} describedBy="budget-msg" />
              </Field>
              <Slider label="Monthly budget" min={1} max={50} value={budget} onChange={setBudget} format={(n) => `${usd(n, 0)} a month`} />
            </div>
          )}
        </Card>
      </div>

      <aside className="ap-span-5 ap-quote-col">
        <Card tone="ink" className="ap-quote" kicker="Premium for this closure">
          <b className="ap-quote-price mono">
            <RollingNumber value={quote} format={(n) => usd(n)} />
          </b>
          <span className="ap-quote-rate">
            {covered > 0 ? `${pct((quote / covered) * 100, 2).replace('+', '')} of covered amount` : 'Enter an amount'}
          </span>
          <dl className="ap-kv ap-kv-ink">
            <div>
              <dt>Covered</dt>
              <dd className="mono">{usd(covered, 0)} of {sym}</dd>
            </div>
            <div>
              <dt>Pays from</dt>
              <dd className="mono">−{deductible * 100}% to −{limit * 100}%</dd>
            </div>
            <div>
              <dt>Maximum payout</dt>
              <dd className="mono">{usd(payout(covered, 1, deductible, limit))}</dd>
            </div>
            <div>
              <dt>Agent risk</dt>
              <dd className="mono">
                {risk.score} / 100, {risk.mult.toFixed(1)}×
              </dd>
            </div>
            <div>
              <dt>Window</dt>
              <dd>
                {win.from} 4:00pm to {win.to} 9:30am ET
              </dd>
            </div>
            <div>
              <dt>Settles</dt>
              <dd>Chainlink price, Mon 10:00am ET</dd>
            </div>
          </dl>
          {!salesOpen && <SalesClosed compact />}
          {salesOpen && !state.wallet && <p className="ap-quote-note">You will connect a wallet in the next step.</p>}
          <button type="button" className="ap-ui-btn ap-ui-btn-orange ap-ui-btn-block ap-ui-btn-lg" disabled={!canBuy} onClick={() => setReview(true)}>
            Review cover <IconArrow size={18} />
          </button>
          {existing && (
            <button type="button" className="ap-ui-btn ap-ui-btn-ghost-paper ap-ui-btn-block" onClick={cancel}>
              Cancel cover
            </button>
          )}
        </Card>
      </aside>

      <div className="ap-quote-dock" aria-hidden={review}>
        <div>
          <span>This closure</span>
          <b className="mono">{usd(quote)}</b>
        </div>
        <button type="button" className="ap-ui-btn ap-ui-btn-orange" disabled={!canBuy} onClick={() => setReview(true)}>
          {salesOpen ? 'Review cover' : 'Sales closed'}
        </button>
      </div>

      <Modal
        open={review}
        onClose={() => setReview(false)}
        title={existing && status === 'idle' ? `Update cover for ${sym}` : `Turn on cover for ${sym}`}
        sub="Check the terms. Payouts settle automatically in USDC."
        footer={
          <>
            <button type="button" className="ap-ui-btn ap-ui-btn-line" onClick={() => setReview(false)}>
              Back
            </button>
            {state.wallet ? (
              <StatusButton
                className="ap-ui-btn-orange"
                status={status}
                onClick={confirm}
                idle={`Confirm and pay ${usd(quote)}`}
                loading="Confirming on Base"
                success="Cover is on"
              />
            ) : (
              <button type="button" className="ap-ui-btn ap-ui-btn-ink" onClick={connect} disabled={state.connecting}>
                {state.connecting ? 'Connecting' : 'Connect wallet to confirm'}
              </button>
            )}
          </>
        }
      >
        <div className="ap-review-head">
          <StockBadge sym={sym} size={44} />
          <div>
            <b>{s.name}</b>
            <span className="mono">{usd(covered)} covered</span>
          </div>
          <Tag tone={plan === 'autopilot' ? 'blue' : 'soft-blue'}>{plan === 'autopilot' ? 'Autopilot' : 'Once'}</Tag>
        </div>
        <dl className="ap-kv">
          <div>
            <dt>Deductible</dt>
            <dd className="mono">{deductible * 100}%</dd>
          </div>
          <div>
            <dt>Limit</dt>
            <dd className="mono">{limit * 100}%</dd>
          </div>
          <div>
            <dt>Example: opens −9%</dt>
            <dd className="mono">{usd(payout(covered, 0.09, deductible, limit))}</dd>
          </div>
          <div>
            <dt>Maximum payout</dt>
            <dd className="mono">{usd(payout(covered, 1, deductible, limit))}</dd>
          </div>
          {plan === 'autopilot' && (
            <div>
              <dt>Monthly budget cap</dt>
              <dd className="mono">{usd(budget, 0)}</dd>
            </div>
          )}
          <div className="ap-kv-total">
            <dt>Premium now</dt>
            <dd className="mono">{usd(quote)}</dd>
          </div>
        </dl>
        <p className="ap-fine">
          Payout = covered × (drop − deductible), capped at the limit. Settlement uses the Chainlink price 30 minutes after the open. If the
          token is paused or the price goes stale, the premium is refunded.
        </p>
      </Modal>
    </div>
  )
}
