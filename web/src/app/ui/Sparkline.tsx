/**
 * Tiny weekend-gap strip: one squared bar per past closure, up in ink, down in orange.
 * Fixed size so it sits inside table cells without measuring.
 */
export function GapBars({ values, width = 96, height = 28, label }: { values: number[]; width?: number; height?: number; label: string }) {
  const max = Math.max(...values.map(Math.abs), 1)
  const bw = width / values.length
  const mid = height / 2
  return (
    <svg className="ap-gapbars" width={width} height={height} role="img" aria-label={label}>
      <line x1={0} x2={width} y1={mid} y2={mid} className="ap-gapbars-zero" />
      {values.map((v, i) => {
        const h = Math.max((Math.abs(v) / max) * (mid - 1), 1.5)
        return (
          <rect
            key={i}
            x={i * bw + 1.5}
            y={v >= 0 ? mid - h : mid}
            width={Math.max(bw - 3, 2)}
            height={h}
            rx={1}
            className={v >= 0 ? 'ap-gapbars-up' : 'ap-gapbars-down'}
          />
        )
      })}
    </svg>
  )
}

/** Line sparkline with a soft area underneath. */
export function Sparkline({
  values,
  width = 120,
  height = 36,
  tone = 'blue',
  label,
}: {
  values: number[]
  width?: number
  height?: number
  tone?: 'blue' | 'orange' | 'ink' | 'paper'
  label: string
}) {
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const span = hi - lo || 1
  const pts = values.map((v, i) => [(i / (values.length - 1)) * width, height - 2 - ((v - lo) / span) * (height - 4)] as const)
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')
  return (
    <svg className={`ap-spark ap-tone-${tone}`} width={width} height={height} role="img" aria-label={label}>
      <path d={`${line}L${width},${height}L0,${height}Z`} className="ap-spark-area" />
      <path d={line} className="ap-spark-line" />
    </svg>
  )
}
