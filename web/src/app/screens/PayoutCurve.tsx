import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { payout, usd } from '../../market'
import { clamp, Skeleton, useWidth } from '../ui'
import { useReveal } from '../ui/useReveal'
import { useSvgId } from '../ui/util'

const MAX_DROP = 30 // percent on the x axis
const PAD = { t: 34, r: 16, b: 34, l: 56 }
const SCENARIOS = [3, 9, 15, 25]

/**
 * Payout against Monday's opening drop. Flat through the deductible, rising across the covered band,
 * flat again past the limit. Hover, drag, tap a scenario or use the arrow keys to read a value.
 */
export function PayoutCurve({ amount, deductible, limit }: { amount: number; deductible: number; limit: number }) {
  const [box, w] = useWidth<HTMLDivElement>()
  const [drop, setDrop] = useState(9)
  const clip = useRef<SVGRectElement>(null)
  const clipId = useSvgId('pc')
  useReveal(clip, w > 0)

  const height = 260
  const iw = Math.max(w - PAD.l - PAD.r, 1)
  const ih = height - PAD.t - PAD.b
  const maxPay = amount * Math.max(limit - deductible, 0)
  const top = Math.max(maxPay * 1.18, 1)
  const x = (d: number) => PAD.l + (d / MAX_DROP) * iw
  const y = (v: number) => PAD.t + (1 - v / top) * ih
  const d0 = deductible * 100
  const d1 = limit * 100
  const pay = payout(amount, drop / 100, deductible, limit)

  const line = `M${x(0)},${y(0)} L${x(d0)},${y(0)} L${x(d1)},${y(maxPay)} L${x(MAX_DROP)},${y(maxPay)}`
  const area = `${line} L${x(MAX_DROP)},${y(0)} Z`

  const fromPointer = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setDrop(clamp(Math.round(((e.clientX - r.left - PAD.l) / iw) * MAX_DROP * 2) / 2, 0, MAX_DROP))
  }
  const key = (e: KeyboardEvent) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 0.5 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -0.5 : 0
    if (!step) return
    e.preventDefault()
    setDrop((d) => clamp(d + step, 0, MAX_DROP))
  }
  const zone = drop <= d0 ? 'Inside your deductible' : drop >= d1 ? 'Past the limit, maximum payout' : 'In the covered band'

  return (
    <div className="ap-pcurve">
      <div className="ap-pcurve-read" aria-live="polite">
        <div>
          <span>If Monday opens</span>
          <b className="mono">−{drop.toFixed(1)}%</b>
        </div>
        <div>
          <span>You are paid</span>
          <b className="mono ap-is-pay">{usd(pay)}</b>
        </div>
        <small>{zone}</small>
      </div>
      <div ref={box} className="ap-chart" style={{ height }}>
        {w === 0 ? (
          <Skeleton h={height} />
        ) : (
          <svg
            width={w}
            height={height}
            role="slider"
            tabIndex={0}
            aria-label="Monday opening drop"
            aria-valuemin={0}
            aria-valuemax={MAX_DROP}
            aria-valuenow={drop}
            aria-valuetext={`Down ${drop.toFixed(1)}%, payout ${usd(pay)}`}
            onPointerMove={fromPointer}
            onPointerDown={fromPointer}
            onKeyDown={key}
            className="ap-pcurve-svg"
          >
            <defs>
              <clipPath id={clipId}>
                <rect ref={clip} x={0} y={0} width={w} height={height} />
              </clipPath>
            </defs>
            <rect x={x(0)} y={PAD.t} width={x(d0) - x(0)} height={ih} className="ap-pc-zone ap-pc-zone-absorb" />
            <rect x={x(d0)} y={PAD.t} width={x(d1) - x(d0)} height={ih} className="ap-pc-zone ap-pc-zone-band" />
            <text x={x(d0 / 2)} y={PAD.t - 12} textAnchor="middle" className="ap-pc-zone-label">
              You absorb
            </text>
            <text x={x((d0 + d1) / 2)} y={PAD.t - 12} textAnchor="middle" className="ap-pc-zone-label">
              Covered
            </text>
            <text x={x((d1 + MAX_DROP) / 2)} y={PAD.t - 12} textAnchor="middle" className="ap-pc-zone-label">
              Capped
            </text>
            {[0, maxPay / 2, maxPay].map((v) => (
              <g key={v}>
                <line x1={PAD.l} x2={w - PAD.r} y1={y(v)} y2={y(v)} className="ap-chart-grid" />
                <text x={PAD.l - 10} y={y(v)} textAnchor="end" dominantBaseline="middle" className="ap-chart-axis">
                  {usd(v, 0)}
                </text>
              </g>
            ))}
            {[0, 5, 10, 15, 20, 25, 30].map((t) => (
              <text key={t} x={x(t)} y={height - 10} textAnchor="middle" className="ap-chart-axis">
                {t ? `−${t}%` : '0%'}
              </text>
            ))}
            <line x1={x(d0)} x2={x(d0)} y1={PAD.t} y2={PAD.t + ih} className="ap-pc-mark" />
            <line x1={x(d1)} x2={x(d1)} y1={PAD.t} y2={PAD.t + ih} className="ap-pc-mark" />
            <g clipPath={`url(#${clipId})`}>
              <path d={area} className="ap-pc-area" />
              <path d={line} className="ap-pc-line" />
            </g>
            <g className="ap-chart-hover">
              <line x1={x(drop)} x2={x(drop)} y1={PAD.t} y2={PAD.t + ih} />
              <rect x={x(drop) - 5} y={y(pay) - 5} width={10} height={10} rx={2} className="ap-pc-knob" />
            </g>
          </svg>
        )}
      </div>
      <div className="ap-pcurve-legend">
        <span>
          <i className="ap-key ap-key-absorb" /> Deductible {d0}%
        </span>
        <span>
          <i className="ap-key ap-key-blue" /> Limit {d1}%
        </span>
        <span className="mono">Max payout {usd(maxPay)}</span>
      </div>
      <div className="ap-scenarios" role="group" aria-label="Try a scenario">
        {SCENARIOS.map((s) => (
          <button key={s} type="button" className={drop === s ? 'ap-scenario ap-is-on' : 'ap-scenario'} onClick={() => setDrop(s)}>
            <span>Opens −{s}%</span>
            <b className="mono">{usd(payout(amount, s / 100, deductible, limit))}</b>
          </button>
        ))}
      </div>
    </div>
  )
}
