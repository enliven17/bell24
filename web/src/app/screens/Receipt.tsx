import { useState } from 'react'
import Halftone from '../../components/Halftone'
import { BaseMark, Mark } from '../../components/Logo'
import { pct, usd } from '../../market'
import { RECEIPTS, ticker, type ReceiptCard } from '../data'
import { Card, cn, CopyButton, IconShare, PageHeader, spotlight, Stat, StatRow, StockBadge, useToast } from '../ui'

const shareText = (r: ReceiptCard) =>
  `${ticker(r.sym)} gapped ${pct(r.gap)} at the open. bell24 paid me ${usd(r.paid)} before my coffee.`

export function Receipt() {
  const [sel, setSel] = useState(RECEIPTS[0])
  const toast = useToast()
  const blocked = () => toast({ title: 'Could not copy', body: 'Your browser blocked clipboard access.', tone: 'orange' })
  const total = RECEIPTS.reduce((n, r) => n + r.paid, 0)

  return (
    <>
      <PageHeader title="Monday receipts" sub="One card for every closure that paid you. Made to be shared." />
      <div className="ap-grid">
        <div className="ap-span-7 ap-stack-col">
          <article className="ap-receipt" aria-label={`Receipt: ${shareText(sel)}`}>
            <Halftone className="ap-receipt-bg" cell={12} />
            <div className="ap-receipt-card" key={sel.id}>
              <span className="ap-receipt-top">
                <Mark size={28} /> Monday receipt
                <span className="ap-receipt-date">{sel.date}</span>
              </span>
              <b className="ap-receipt-big">
                {ticker(sel.sym)} <span>{pct(sel.gap)}</span>
              </b>
              <b className="ap-receipt-paid mono">+{usd(sel.paid)}</b>
              <dl className="ap-receipt-rows">
                <div>
                  <dt>Covered</dt>
                  <dd className="mono">{usd(sel.covered, 0)}</dd>
                </div>
                <div>
                  <dt>Deductible</dt>
                  <dd className="mono">{sel.deductible * 100}%</dd>
                </div>
                <div>
                  <dt>Paid</dt>
                  <dd>Automatically, 10:00 ET</dd>
                </div>
              </dl>
              <small className="ap-receipt-foot">
                <span>bell24.xyz</span>
                <span className="ap-receipt-base">
                  <BaseMark size={14} /> Built on Base
                </span>
              </small>
            </div>
          </article>
          <div className="ap-receipt-actions">
            <a
              className="ap-ui-btn ap-ui-btn-orange"
              target="_blank"
              rel="noreferrer"
              href={`https://x.com/intent/post?text=${encodeURIComponent(`${shareText(sel)} @buildonbase`)}`}
            >
              <IconShare size={18} /> Share on X
            </a>
            <CopyButton text={shareText(sel)} onCopied={(ok) => !ok && blocked()}>
              Copy text
            </CopyButton>
            <CopyButton text={() => `${location.origin}/app/receipt#${sel.id}`} onCopied={(ok) => !ok && blocked()}>
              Copy link
            </CopyButton>
          </div>
        </div>

        <div className="ap-span-5 ap-stack-col">
          <StatRow cols={2}>
            <Stat variant="accent" label="Paid to you" value={usd(total)} sub={`${RECEIPTS.length} closures`} tone="up" />
            <Stat variant="tile" label="Largest" value={usd(Math.max(...RECEIPTS.map((r) => r.paid)))} sub="Single closure" />
          </StatRow>
          <Card title="Past receipts" kicker="Newest first">
            <div className="ap-receipts" role="radiogroup" aria-label="Choose a receipt">
              {RECEIPTS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={sel.id === r.id}
                  className={cn('ap-rcpt ap-spot', sel.id === r.id && 'ap-is-on')}
                  onPointerMove={spotlight}
                  onClick={() => setSel(r)}
                >
                  <StockBadge sym={r.sym} size={38} />
                  <span className="ap-rcpt-text">
                    <b>
                      {ticker(r.sym)} {pct(r.gap)}
                    </b>
                    <small>{r.date}</small>
                  </span>
                  <b className="mono ap-rcpt-paid">+{usd(r.paid)}</b>
                </button>
              ))}
            </div>
            <p className="ap-fine ap-push">Each receipt matches a settlement on Base, paid 30 minutes after the open from the Chainlink price.</p>
          </Card>
        </div>
      </div>
    </>
  )
}
