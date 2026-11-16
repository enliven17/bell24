import type { ReactNode } from 'react'
import { clamp, cn } from './util'

export function Stat({
  label,
  value,
  sub,
  tone,
  size = 'md',
  variant = 'plain',
  className,
}: {
  label: ReactNode
  value: ReactNode
  sub?: ReactNode
  tone?: 'up' | 'down' | 'muted'
  size?: 'sm' | 'md' | 'lg'
  /** plain sits inside a card; tile is its own paper card; accent is the one blue tile in a row. */
  variant?: 'plain' | 'tile' | 'accent'
  className?: string
}) {
  return (
    <div className={cn('ap-stat', `ap-stat-${size}`, variant !== 'plain' && 'ap-stat-tile', variant === 'accent' && 'ap-stat-accent', className)}>
      <span className="ap-stat-label">{label}</span>
      <b className="ap-stat-value mono">{value}</b>
      {sub && <span className={cn('ap-stat-sub', tone && `ap-is-${tone}`)}>{sub}</span>}
    </div>
  )
}

export type MeterMark = { at: number; label: string }

/** A squared progress bar with labelled marks (cap, deductible, limit). Values are in the same unit as max. */
export function Meter({
  value,
  max,
  tone = 'blue',
  marks = [],
  label,
  size = 'md',
}: {
  value: number
  max: number
  tone?: 'blue' | 'orange' | 'ink'
  marks?: MeterMark[]
  label: string
  size?: 'sm' | 'md'
}) {
  const pct = clamp(max ? value / max : 0, 0, 1) * 100
  return (
    <div
      className={cn('ap-meter', `ap-meter-${size}`)}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value * 100) / 100}
    >
      <div className="ap-meter-track">
        <span className={`ap-meter-fill ap-tone-${tone}`} style={{ width: `${pct}%` }} />
        {marks.map((m) => (
          <i key={m.label} className="ap-meter-mark" style={{ left: `${clamp(m.at / max, 0, 1) * 100}%` }} />
        ))}
      </div>
      {marks.length > 0 && (
        <div className="ap-meter-labels" aria-hidden="true">
          {marks.map((m) => (
            <span key={m.label} style={{ left: `${clamp(m.at / max, 0, 1) * 100}%` }}>
              {m.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/** A row of stat tiles that hug their content. Columns collapse on narrow screens. */
export function StatRow({ children, cols }: { children: ReactNode; cols?: number }) {
  return (
    <div className="ap-stats" style={cols ? { ['--cols' as string]: cols } : undefined}>
      {children}
    </div>
  )
}
