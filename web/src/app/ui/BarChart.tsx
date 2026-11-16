import { useRef, useState, type ReactNode } from 'react'
import { gsap, reducedMotion, useGSAP } from '../../motion'
import { Skeleton } from './Feedback'
import { clamp, cn, ticks, useSize } from './util'

export type BarSeries = { name: string; tone: 'blue' | 'orange' | 'ink' | 'muted' }
export type BarDatum = { label: string; values: number[]; tones?: Array<BarSeries['tone'] | undefined> }

const PAD = { t: 12, r: 8, b: 28, l: 50 }

/**
 * Grouped bar chart with a zero line, so negative values (a payout week for the pool) hang below.
 * Bars grow from zero on first paint.
 */
export function BarChart({
  data,
  series,
  height: minHeight = 200,
  format,
  axisFormat = format,
  tooltip,
  label,
  xLabels = 8,
  fill = false,
}: {
  data: BarDatum[]
  series: BarSeries[]
  height?: number
  format: (n: number) => string
  axisFormat?: (n: number) => string
  tooltip?: (d: BarDatum, i: number) => ReactNode
  label: string
  xLabels?: number
  /** Grow to the parent's spare height (parent must be a flex column); `height` becomes the minimum. */
  fill?: boolean
}) {
  const [box, size] = useSize<HTMLDivElement>()
  const w = size.w
  const height = fill ? Math.max(size.h, minHeight) : minHeight
  const svg = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)

  const all = data.flatMap((d) => d.values)
  const lo = Math.min(0, ...all)
  const hi = Math.max(0, ...all)
  const span = hi - lo || 1
  const ih = height - PAD.t - PAD.b
  const iw = Math.max(w - PAD.l - PAD.r, 1)
  const y = (v: number) => PAD.t + (1 - (v - lo) / span) * ih
  const slot = iw / data.length
  const gap = Math.min(slot * 0.28, 10)
  const bw = Math.max((slot - gap) / series.length, 2)
  const every = Math.max(1, Math.ceil(data.length / Math.max(2, Math.min(xLabels, Math.floor(iw / 64)))))

  useGSAP(
    () => {
      if (!w || reducedMotion() || !svg.current) return
      gsap.from(svg.current.querySelectorAll('.ap-bar'), {
        scaleY: 0,
        svgOrigin: `0 ${y(0)}`,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.025,
        delay: 0.15,
      })
    },
    { dependencies: [w > 0] },
  )

  const h = hover !== null ? data[hover] : null

  return (
    <div ref={box} className={cn('ap-chart', fill && 'ap-chart-fill')} style={fill ? { minHeight } : { height }}>
      {w === 0 ? (
        <Skeleton h={minHeight} />
      ) : (
        <>
          <svg
            ref={svg}
            width={w}
            height={height}
            role="img"
            aria-label={label}
            tabIndex={0}
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              setHover(clamp(Math.floor((e.clientX - r.left - PAD.l) / slot), 0, data.length - 1))
            }}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(data.length - 1)}
            onBlur={() => setHover(null)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
              e.preventDefault()
              setHover((v) => clamp((v ?? data.length - 1) + (e.key === 'ArrowRight' ? 1 : -1), 0, data.length - 1))
            }}
          >
            {ticks(lo, hi, 4).map((t) => (
              <g key={t}>
                <line x1={PAD.l} x2={w - PAD.r} y1={y(t)} y2={y(t)} className={t === 0 ? 'ap-chart-zero' : 'ap-chart-grid'} />
                <text x={PAD.l - 10} y={y(t)} className="ap-chart-axis" textAnchor="end" dominantBaseline="middle">
                  {axisFormat(t)}
                </text>
              </g>
            ))}
            {data.map((d, i) => (
              <g key={d.label + i} className={cn('ap-bar-group', hover === i && 'ap-is-hover')}>
                <rect x={PAD.l + i * slot} y={PAD.t} width={slot} height={ih} className="ap-bar-hit" />
                {d.values.map((v, s) => {
                  const top = y(Math.max(v, 0))
                  const bh = Math.max(Math.abs(y(v) - y(0)), v === 0 ? 0 : 1.5)
                  return (
                    <rect
                      key={s}
                      x={PAD.l + i * slot + gap / 2 + s * bw}
                      y={top}
                      width={Math.max(bw - (series.length > 1 ? 2 : 0), 1)}
                      height={bh}
                      rx={Math.min(3, bw / 3)}
                      className={`ap-bar ap-tone-${d.tones?.[s] ?? series[s].tone}`}
                    />
                  )
                })}
                {(i % every === 0 || i === data.length - 1) && (data.length - 1 - i >= every * 0.6 || i === data.length - 1) && (
                  <text x={PAD.l + i * slot + slot / 2} y={height - 8} textAnchor="middle" className="ap-chart-axis">
                    {d.label}
                  </text>
                )}
              </g>
            ))}
          </svg>
          {h && hover !== null && (
            <div
              className="ap-chart-tip"
              style={{ left: clamp(PAD.l + hover * slot + slot / 2, 80, w - 80), top: Math.max(y(Math.max(...h.values, 0)) - 14, 0) }}
              aria-hidden="true"
            >
              {tooltip ? (
                tooltip(h, hover)
              ) : (
                <>
                  <span>{h.label}</span>
                  {h.values.map((v, s) => (
                    <b key={s} className="mono">
                      {series[s].name} {format(v)}
                    </b>
                  ))}
                </>
              )}
            </div>
          )}
          <span className="sr-only" aria-live="polite">
            {h ? `${h.label}: ${h.values.map((v, s) => `${series[s].name} ${format(v)}`).join(', ')}` : ''}
          </span>
        </>
      )}
    </div>
  )
}
