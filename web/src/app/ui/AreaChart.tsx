import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { Skeleton } from './Feedback'
import { useReveal } from './useReveal'
import { clamp, cn, niceDomain, ticks, useSize, useSvgId } from './util'

export type Point = { label: string; value: number }
export type RefLine = { value: number; label: string; tone?: 'ink' | 'orange' | 'blue' }

const PAD = { t: 14, r: 14, b: 28, l: 54 }

/**
 * Line + area chart in hand-written SVG. Measures its width, so text and strokes stay crisp.
 * Hover or focus it and use the arrow keys to read individual points.
 */
export function AreaChart({
  data,
  height: minHeight = 220,
  tone = 'blue',
  format,
  axisFormat = format,
  refs = [],
  baseline,
  domain,
  xLabels = 5,
  tooltip,
  label,
  className,
  fill = false,
}: {
  data: Point[]
  height?: number
  tone?: 'blue' | 'orange' | 'ink'
  format: (n: number) => string
  axisFormat?: (n: number) => string
  refs?: RefLine[]
  /** Fill the area between the line and this value instead of the chart floor. */
  baseline?: number
  domain?: [number, number]
  xLabels?: number
  tooltip?: (p: Point, i: number) => ReactNode
  label: string
  className?: string
  /** Grow to the parent's spare height (parent must be a flex column); `height` becomes the minimum. */
  fill?: boolean
}) {
  const [box, size] = useSize<HTMLDivElement>()
  const w = size.w
  const height = fill ? Math.max(size.h, minHeight) : minHeight
  const [hover, setHover] = useState<number | null>(null)
  const clip = useRef<SVGRectElement>(null)
  const clipId = useSvgId('clip')
  const gradId = useSvgId('grad')
  useReveal(clip, w > 0)

  const n = data.length
  const values = data.map((d) => d.value)
  const refVals = refs.map((r) => r.value)
  const extra = baseline !== undefined ? [baseline] : []
  const rawLo = domain?.[0] ?? Math.min(...values, ...refVals, ...extra)
  const rawHi = domain?.[1] ?? Math.max(...values, ...refVals, ...extra)
  // Without an explicit domain, widen to round ticks so the line stays inside the labelled range.
  const [lo, hi] = domain ? [rawLo, rawHi] : niceDomain(rawLo, rawHi, 4)
  const iw = Math.max(w - PAD.l - PAD.r, 1)
  const ih = height - PAD.t - PAD.b
  const x = (i: number) => PAD.l + (n > 1 ? (i / (n - 1)) * iw : iw / 2)
  const y = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo || 1)) * ih

  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join('')
  const floor = baseline !== undefined ? y(baseline) : PAD.t + ih
  const area = `${line}L${x(n - 1).toFixed(1)},${floor}L${x(0).toFixed(1)},${floor}Z`
  const yTicks = ticks(lo, hi, 4).filter((t) => t >= lo && t <= hi)
  // Roughly one label per 110px so mono labels never collide on phones.
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.min(xLabels, Math.floor(iw / 110)))))

  const pick = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setHover(clamp(Math.round(((e.clientX - r.left - PAD.l) / iw) * (n - 1)), 0, n - 1))
  }
  const key = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    setHover((h) => clamp((h ?? n - 1) + (e.key === 'ArrowRight' ? 1 : -1), 0, n - 1))
  }
  const h = hover !== null ? data[hover] : null

  return (
    <div ref={box} className={cn('ap-chart', fill && 'ap-chart-fill', className)} style={fill ? { minHeight } : { height }}>
      {w === 0 ? (
        <Skeleton h={minHeight} />
      ) : (
        <>
          <svg
            width={w}
            height={height}
            role="img"
            aria-label={label}
            tabIndex={0}
            onPointerMove={pick}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(n - 1)}
            onBlur={() => setHover(null)}
            onKeyDown={key}
            className={`ap-tone-${tone}`}
          >
            <defs>
              <clipPath id={clipId}>
                <rect ref={clip} x={0} y={0} width={w} height={height} />
              </clipPath>
              <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" className="ap-chart-grad-a" />
                <stop offset="100%" className="ap-chart-grad-b" />
              </linearGradient>
            </defs>
            {yTicks.map((t) => (
              <g key={t}>
                <line x1={PAD.l} x2={w - PAD.r} y1={y(t)} y2={y(t)} className="ap-chart-grid" />
                <text x={PAD.l - 10} y={y(t)} className="ap-chart-axis" textAnchor="end" dominantBaseline="middle">
                  {axisFormat(t)}
                </text>
              </g>
            ))}
            {data.map((d, i) =>
              i % every === 0 || i === n - 1 ? (
                <text
                  key={i}
                  x={x(i)}
                  y={height - 8}
                  className="ap-chart-axis"
                  textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
                >
                  {i === n - 1 || (n - 1 - i) / every >= 1 ? d.label : ''}
                </text>
              ) : null,
            )}
            <g clipPath={`url(#${clipId})`}>
              <path d={area} fill={`url(#${gradId})`} />
              <path d={line} className="ap-chart-line" />
            </g>
            {refs.map((r) => (
              <g key={r.label} className={`ap-chart-ref ap-ref-${r.tone ?? 'ink'}`}>
                <line x1={PAD.l} x2={w - PAD.r} y1={y(r.value)} y2={y(r.value)} />
                <text x={w - PAD.r} y={y(r.value) - 6} textAnchor="end">
                  {r.label}
                </text>
              </g>
            ))}
            {h && hover !== null && (
              <g className="ap-chart-hover">
                <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={PAD.t + ih} />
                <rect x={x(hover) - 4.5} y={y(h.value) - 4.5} width={9} height={9} rx={2} />
              </g>
            )}
          </svg>
          {h && hover !== null && (
            <div
              className="ap-chart-tip"
              style={{ left: clamp(x(hover), 70, w - 70), top: Math.max(y(h.value) - 14, 0) }}
              aria-hidden="true"
            >
              {tooltip ? (
                tooltip(h, hover)
              ) : (
                <>
                  <span>{h.label}</span>
                  <b className="mono">{format(h.value)}</b>
                </>
              )}
            </div>
          )}
          <span className="sr-only" aria-live="polite">
            {h ? `${h.label}: ${format(h.value)}` : ''}
          </span>
        </>
      )}
    </div>
  )
}
