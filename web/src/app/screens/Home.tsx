import { useMemo, useState } from 'react'
import Link from '../../components/Link'
import RollingNumber from '../../components/RollingNumber'
import { payout, pct, STOCKS, usd, type Stock } from '../../market'
import { navigate } from '../../router'
import { portfolioSeries, RISK_NOTE, STOCK_RISK } from '../data'
import { quoteFor, useApp } from '../state'
import {
  AreaChart,
  Card,
  compactUsd,
  GapBars,
  IconArrow,
  IconPlus,
  IconWallet,
  PageHeader,
  Segmented,
  Skeleton,
  Table,
  type Column,
} from '../ui'
import { ActivityList, CoverTag, RiskBars, StockCell } from './parts'

const RANGES = { '1W': 7, '1M': 30, '3M': 90 } as const
type Range = keyof typeof RANGES
const fmt0 = (n: number) => usd(n, 0)
const fmt2 = (n: number) => usd(n)

export function Home({ onProtect }: { onProtect: (sym: string) => void }) {
  const { state, connect } = useApp()
  const held = STOCKS.filter((s) => s.held > 0)
  const total = held.reduce((n, s) => n + s.held, 0)
  const covered = held.reduce((n, s) => n + (state.policies[s.sym]?.amount ?? 0), 0)
  const exposed = total - covered
  const open = held.filter((s) => !state.policies[s.sym])
  const premiums = Object.entries(state.policies).reduce((n, [sym, p]) => n + quoteFor(sym, p), 0)
  const maxPay = Object.values(state.policies).reduce((n, p) => n + payout(p.amount, 1, p.deductible, p.limit), 0)

  const protect = (sym: string) => {
    onProtect(sym)
    navigate('/app/cover')
  }

  return (
    <>
      <PageHeader
        title="Portfolio"
        sub={
          open.length
            ? `${open.length} ${open.length === 1 ? 'position is' : 'positions are'} open to the Monday gap.`
            : 'Every position is covered for the next closure.'
        }
        actions={
          <Link className="ap-ui-btn ap-ui-btn-orange" href="/app/cover">
            <IconPlus size={18} /> New cover
          </Link>
        }
      />

      {!state.wallet && (
        <div className="ap-banner">
          <IconWallet size={20} />
          <p>
            <b>You are looking at a demo wallet.</b> Connect to detect your own stock tokens on Base.
          </p>
          <button type="button" className="ap-ui-btn ap-ui-btn-ink ap-ui-btn-sm" onClick={connect} disabled={state.connecting}>
            {state.connecting ? 'Connecting' : 'Connect wallet'}
          </button>
        </div>
      )}

      <div className="ap-grid">
        <PortfolioCard total={total} />
        <Card className="ap-span-4 ap-coverage" kicker="Next closure" title="Covered vs exposed">
          <div className="ap-coverage-big">
            <b className="mono">
              <RollingNumber value={total ? (covered / total) * 100 : 0} format={(n) => `${Math.round(n)}%`} />
            </b>
            <span>of your holdings covered</span>
          </div>
          <div className="ap-stack" role="img" aria-label={`${usd(covered, 0)} covered, ${usd(exposed, 0)} exposed`}>
            <span className="ap-stack-covered" style={{ flexGrow: covered }} />
            <span className="ap-stack-exposed" style={{ flexGrow: exposed }} />
          </div>
          <dl className="ap-kv">
            <div>
              <dt>
                <i className="ap-key ap-key-blue" /> Covered
              </dt>
              <dd className="mono">{fmt0(covered)}</dd>
            </div>
            <div>
              <dt>
                <i className="ap-key ap-key-orange" /> Exposed
              </dt>
              <dd className="mono">{fmt0(exposed)}</dd>
            </div>
            <div>
              <dt>Premiums this closure</dt>
              <dd className="mono">{fmt2(premiums)}</dd>
            </div>
            <div>
              <dt>Most you can be paid</dt>
              <dd className="mono">{fmt0(maxPay)}</dd>
            </div>
          </dl>
          {open[0] && (
            <button type="button" className="ap-ui-btn ap-ui-btn-ink ap-ui-btn-block" onClick={() => protect(open[0].sym)}>
              Protect {open[0].sym} <IconArrow size={18} />
            </button>
          )}
        </Card>

        <Card
          className="ap-span-12"
          title="Positions"
          kicker={`${held.length} stock tokens detected`}
          action={
            <Link className="ap-ui-btn ap-ui-btn-line ap-ui-btn-sm" href="/app/live">
              Live view <IconArrow size={16} />
            </Link>
          }
        >
          {state.connecting ? <TableSkeleton /> : <Positions rows={held} onProtect={protect} />}
        </Card>

        <Card className="ap-span-7 ap-risk-card" tone="orange" kicker="This weekend's risk" as="article">
          <div className="ap-risk-top">
            <b className="ap-risk-level">{RISK_NOTE.level}</b>
            <div>
              <p className="ap-risk-headline">{RISK_NOTE.headline}</p>
              <p className="ap-risk-body">{RISK_NOTE.body}</p>
            </div>
          </div>
          <RiskBars syms={Object.keys(STOCK_RISK)} tone="orange" />
          <div className="ap-risk-foot">
            <span>Score out of 100 and premium multiplier, set by the pricing agent.</span>
            <Link className="ap-ui-btn ap-ui-btn-paper ap-ui-btn-sm" href="/app/agent">
              Read the note <IconArrow size={16} />
            </Link>
          </div>
        </Card>

        <Card className="ap-span-5" title="Recent activity" kicker="Policies, payouts, renewals">
          <ActivityList items={state.activity.slice(0, 6)} />
        </Card>
      </div>
    </>
  )
}

function PortfolioCard({ total }: { total: number }) {
  const [range, setRange] = useState<Range>('1M')
  const all = useMemo(() => portfolioSeries(total), [total])
  const data = all.slice(-RANGES[range])
  const first = data[0].value
  const change = total - first
  return (
    <Card className="ap-span-8 ap-portfolio" kicker="Stock tokens on Base">
      <div className="ap-portfolio-head">
        <div>
          <b className="ap-portfolio-value mono">
            <RollingNumber value={total} format={fmt2} />
          </b>
          <span className={change >= 0 ? 'ap-delta ap-is-up' : 'ap-delta ap-is-down'}>
            {change >= 0 ? '+' : '−'}
            {usd(Math.abs(change))} ({pct((change / first) * 100)}) over {range === '1W' ? 'the week' : range === '1M' ? 'the month' : '3 months'}
          </span>
        </div>
        <Segmented
          size="sm"
          label="Chart range"
          value={range}
          onChange={setRange}
          options={(Object.keys(RANGES) as Range[]).map((r) => ({ value: r, label: r }))}
        />
      </div>
      <AreaChart
        fill
        key={range}
        data={data}
        height={230}
        tone="blue"
        format={fmt2}
        axisFormat={compactUsd}
        label={`Portfolio value over ${range}`}
      />
    </Card>
  )
}

function Positions({ rows, onProtect }: { rows: Stock[]; onProtect: (sym: string) => void }) {
  const { state } = useApp()
  const columns: Column<Stock>[] = [
    { key: 'stock', header: 'Stock', cell: (s) => (
        <StockCell
          sym={s.sym}
          sub={
            <>
              <span className="ap-hide-sm-inline">
                {s.name} · {usd(s.price)}
              </span>
              <span className="ap-only-sm mono">{usd(s.held, 0)} held</span>
            </>
          }
        />
      ),
    },
    { key: 'value', header: 'Value', align: 'right', hide: 'sm', cell: (s) => <b className="mono">{usd(s.held)}</b> },
    {
      key: 'gaps',
      header: 'Last 8 weekend gaps',
      hide: 'md',
      cell: (s) => <GapBars values={s.gap} label={`${s.sym} weekend gaps: ${s.gap.map((g) => pct(g)).join(', ')}`} />,
    },
    {
      key: 'risk',
      header: 'Agent risk',
      hide: 'md',
      cell: (s) => (
        <span className="ap-risk-cell">
          <b className="mono">{STOCK_RISK[s.sym].score}</b>
          <small>{STOCK_RISK[s.sym].level}</small>
        </span>
      ),
    },
    { key: 'cover', header: 'Cover', cell: (s) => <CoverTag plan={state.policies[s.sym]?.plan} /> },
    {
      key: 'prem',
      header: 'Premium',
      align: 'right',
      hide: 'sm',
      cell: (s) => {
        const p = state.policies[s.sym]
        return p ? <span className="mono">{usd(quoteFor(s.sym, p))}</span> : <span className="ap-muted">None</span>
      },
    },
    {
      key: 'act',
      header: <span className="sr-only">Action</span>,
      align: 'right',
      cell: (s) => {
        const p = state.policies[s.sym]
        return (
          <button
            type="button"
            className={p ? 'ap-ui-btn ap-ui-btn-line ap-ui-btn-sm' : 'ap-ui-btn ap-ui-btn-orange ap-ui-btn-sm'}
            onClick={() => onProtect(s.sym)}
            aria-label={`${p ? 'Edit cover for' : 'Protect'} ${s.sym}`}
          >
            {p ? 'Edit' : 'Protect'}
          </button>
        )
      },
    },
  ]
  return <Table columns={columns} rows={rows} rowKey={(s) => s.sym} caption="Your stock token positions and their cover" />
}

function TableSkeleton() {
  return (
    <div className="ap-skel-rows" role="status" aria-label="Loading holdings">
      {[0, 1, 2].map((i) => (
        <div key={i} className="ap-skel-row">
          <Skeleton w={38} h={38} />
          <Skeleton w="22%" h={14} />
          <Skeleton w="14%" h={14} />
          <Skeleton w="18%" h={14} />
          <Skeleton w={70} h={32} style={{ marginLeft: 'auto' }} />
        </div>
      ))}
    </div>
  )
}
