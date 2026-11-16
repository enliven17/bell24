import { pct, usd } from '../../market'
import { RISK_NOTE, SCORECARDS, STOCK_RISK, ticker } from '../data'
import { quoteFor } from '../state'
import { BarChart, Card, compactUsd, IconSpark, PageHeader, Stat, Table, Tag, type Column } from '../ui'
import { RiskBars, StockCell } from './parts'

type Row = { sym: string }

export function Agent() {
  const premiums = SCORECARDS.reduce((n, c) => n + c.premiums, 0)
  const paid = SCORECARDS.reduce((n, c) => n + c.paid, 0)
  const expected = SCORECARDS.reduce((n, c) => n + c.expected, 0)
  const big = SCORECARDS.filter((c) => c.paid > 0)
  const caught = big.filter((c) => c.flagged).length
  const chrono = [...SCORECARDS].reverse()

  const columns: Column<Row>[] = [
    { key: 'stock', header: 'Stock', cell: (r) => <StockCell sym={r.sym} /> },
    {
      key: 'score',
      header: 'Score',
      cell: (r) => (
        <span className="ap-score-cell">
          <span className="ap-score-track">
            <span style={{ width: `${STOCK_RISK[r.sym].score}%` }} className={STOCK_RISK[r.sym].score > 70 ? 'ap-is-hot' : undefined} />
          </span>
          <b className="mono">{STOCK_RISK[r.sym].score}</b>
        </span>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      hide: 'sm',
      cell: (r) => {
        const l = STOCK_RISK[r.sym].level
        return <Tag tone={l === 'High' ? 'orange' : l === 'Elevated' ? 'soft-orange' : 'neutral'}>{l}</Tag>
      },
    },
    {
      key: 'drivers',
      header: 'Why',
      hide: 'md',
      cell: (r) => (
        <span className="ap-drivers">
          {STOCK_RISK[r.sym].drivers.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </span>
      ),
    },
    { key: 'mult', header: 'Premium', align: 'right', cell: (r) => <b className="mono">{STOCK_RISK[r.sym].mult.toFixed(1)}×</b> },
    {
      key: 'per',
      header: 'Per $1,000',
      align: 'right',
      hide: 'sm',
      cell: (r) => <span className="mono">{usd(quoteFor(r.sym, { amount: 1000, deductible: 0.05, limit: 0.15 }))}</span>,
    },
  ]

  return (
    <>
      <PageHeader
        title="Pricing agent"
        sub="Scores every closure, sets the premium, renews autopilot and publishes its record."
        actions={<Tag tone="ink">Quotes only. Contracts enforce pool limits.</Tag>}
      />

      <div className="ap-grid">
        <Card className="ap-span-7 ap-note" tone="blue" as="article" kicker="Friday risk note, preview">
          <div className="ap-note-top">
            <span className="ap-note-icon">
              <IconSpark size={22} />
            </span>
            <Tag tone="paper">Risk {RISK_NOTE.level}</Tag>
          </div>
          <h2 className="ap-note-headline">{RISK_NOTE.headline}</h2>
          <p className="ap-note-body">{RISK_NOTE.body}</p>
          <div className="ap-note-inputs">
            <span>Inputs</span>
            {RISK_NOTE.inputs.map((i) => (
              <span key={i} className="ap-note-input">
                {i}
              </span>
            ))}
          </div>
          <small>The final note publishes Friday at noon ET, four hours before sales close.</small>
        </Card>

        <Card className="ap-span-5 ap-acc" kicker="Last 10 closures" title="Pricing record">
          <div className="ap-acc-grid">
            <Stat label="Loss ratio" value={pct((paid / premiums) * 100, 0).replace('+', '')} sub="Payouts over premiums" />
            <Stat label="Big gaps flagged" value={`${caught} of ${big.length}`} sub="Scored High before the close" tone="up" />
            <Stat label="Expected vs paid" value={`${usd(expected, 0)}`} sub={`against ${usd(paid, 0)} actually paid`} />
            <Stat label="Floor" value="0.10" sub="Minimum premium in USDC" tone="muted" />
          </div>
          <div className="ap-acc-mults">
            <span className="ap-card-kicker">Premium multiplier this closure</span>
            <RiskBars syms={Object.keys(STOCK_RISK)} />
          </div>
        </Card>

        <Card className="ap-span-12" title="This closure, stock by stock" kicker="Scores out of 100">
          <Table columns={columns} rows={Object.keys(STOCK_RISK).map((sym) => ({ sym }))} rowKey={(r) => r.sym} caption="Agent risk score per stock" />
        </Card>

        <Card className="ap-span-7" title="Expected vs paid" kicker="Pricing accuracy per closure">
          <BarChart
            fill
            height={240}
            series={[
              { name: 'Expected', tone: 'muted' },
              { name: 'Paid', tone: 'orange' },
            ]}
            data={chrono.map((c) => ({ label: c.label, values: [c.expected, c.paid] }))}
            format={(n) => usd(n, 0)}
            axisFormat={compactUsd}
            label="Expected payouts against actual payouts per closure"
          />
          <div className="ap-closure-legend">
            <span>
              <i className="ap-key ap-key-muted" /> Expected by the agent
            </span>
            <span>
              <i className="ap-key ap-key-orange" /> Paid by the pool
            </span>
          </div>
        </Card>

        <Card className="ap-span-5" title="Monday scorecards" kicker="What happened, what was paid">
          <ol className="ap-scorecards">
            {SCORECARDS.slice(0, 4).map((c) => (
              <li key={c.id}>
                <div className="ap-sc-top">
                  <b>{c.opened}</b>
                  <Tag tone={c.paid ? 'orange' : 'soft-blue'}>{c.paid ? 'Paid out' : 'Calm'}</Tag>
                </div>
                <p>
                  {c.paid
                    ? `${ticker(c.worst.sym)} opened ${pct(c.worst.gap)}. The pool paid ${usd(c.paid, 0)}. Priced at ${c.mult}× and ${c.flagged ? 'flagged High' : 'not flagged'}.`
                    : `Largest move ${ticker(c.worst.sym)} ${pct(c.worst.gap)}. No payouts. Priced at ${c.mult}×.`}
                </p>
                <span className="ap-sc-nums mono">
                  {usd(c.premiums, 0)} in, {usd(c.paid, 0)} out
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  )
}
