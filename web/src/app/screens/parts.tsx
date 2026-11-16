import type { ReactNode } from 'react'
import { usd } from '../../market'
import { STOCK_RISK, stock, type Activity, type ActivityKind } from '../data'
import { useApp } from '../state'
import { IconCheck, IconClose, IconExit, IconLock, IconRefresh, IconShield, IconVault, StockBadge, Switch, Tag, cn } from '../ui'

const ACT_ICON: Record<ActivityKind, ReactNode> = {
  cover: <IconShield size={18} />,
  payout: <IconCheck size={18} />,
  renewal: <IconRefresh size={18} />,
  deposit: <IconVault size={18} />,
  withdraw: <IconExit size={18} />,
  cancel: <IconClose size={18} />,
}

export function ActivityList({ items }: { items: Activity[] }) {
  return (
    <ol className="ap-activity">
      {items.map((a) => (
        <li key={a.id} className={cn('ap-activity-item', `ap-act-${a.kind}`)}>
          <span className="ap-activity-icon">{ACT_ICON[a.kind]}</span>
          <div className="ap-activity-text">
            <b>{a.title}</b>
            <span>{a.detail}</span>
          </div>
          <div className="ap-activity-end">
            {a.amount !== undefined && (
              <b className={cn('mono', a.amount > 0 && a.kind === 'payout' && 'ap-is-up')}>
                {a.amount > 0 ? '+' : '−'}
                {a.unit === 'usdc' ? `${Math.abs(a.amount).toLocaleString('en-US')} USDC` : usd(Math.abs(a.amount))}
              </b>
            )}
            <time>{a.when}</time>
          </div>
        </li>
      ))}
    </ol>
  )
}

/** One row per stock: agent score as a bar, level as a squared tag. */
export function RiskBars({ syms, tone = 'paper' }: { syms: string[]; tone?: 'paper' | 'orange' }) {
  return (
    <ul className={cn('ap-riskbars', `ap-riskbars-${tone}`)}>
      {syms.map((sym) => {
        const r = STOCK_RISK[sym]
        return (
          <li key={sym}>
            <span className="ap-riskbars-sym">{sym}</span>
            <span className="ap-riskbars-track" role="meter" aria-label={`${sym} risk score`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={r.score}>
              <span style={{ width: `${r.score}%` }} />
            </span>
            <b className="mono">{r.score}</b>
            <span className="ap-riskbars-mult mono">{r.mult.toFixed(1)}×</span>
          </li>
        )
      })}
    </ul>
  )
}

export function StockCell({ sym, sub }: { sym: string; sub?: ReactNode }) {
  const s = stock(sym)
  return (
    <span className="ap-stock-cell">
      <StockBadge sym={sym} size={38} />
      <span>
        <b>{sym}</b>
        <small>{sub ?? s.name}</small>
      </span>
    </span>
  )
}

/** Shown on cover actions while the market is closed: the rule, plus the demo override. */
export function SalesClosed({ compact = false }: { compact?: boolean }) {
  const { state, dispatch } = useApp()
  return (
    <div className={cn('ap-notice', compact && 'ap-notice-compact')}>
      <span className="ap-notice-icon">
        <IconLock size={18} />
      </span>
      <div>
        <b>Sales are closed until the market opens.</b>
        {!compact && <p>No one can buy cover after weekend news has already hit. Quotes still update so you can plan.</p>}
        <div className="ap-notice-switch">
          <Switch checked={state.salesOverride} onChange={(on) => dispatch({ type: 'override', on })}>
            Demo: allow sales while closed
          </Switch>
        </div>
      </div>
    </div>
  )
}

export function CoverTag({ plan }: { plan?: 'autopilot' | 'once' }) {
  if (!plan) return <Tag tone="soft-orange">Unprotected</Tag>
  return <Tag tone={plan === 'autopilot' ? 'blue' : 'soft-blue'}>{plan === 'autopilot' ? 'Autopilot' : 'Covered once'}</Tag>
}
