import type { ReactNode } from 'react'
import { cn } from './util'

export type TagTone = 'neutral' | 'blue' | 'orange' | 'ink' | 'soft-blue' | 'soft-orange' | 'paper'

/** Squared label. Never a pill, never a dot: the text carries the status. */
export function Tag({ tone = 'neutral', icon, children }: { tone?: TagTone; icon?: ReactNode; children: ReactNode }) {
  return (
    <span className={cn('ap-tag', `ap-tag-${tone}`)}>
      {icon}
      {children}
    </span>
  )
}

const TINT: Record<string, string> = { N: 'ink', A: 'blue', M: 'orange', G: 'paper' }

/** Ticker tile: first letter on a brand colour, squared corners. */
export function StockBadge({ sym, size = 40 }: { sym: string; size?: number }) {
  const letter = sym.slice(0, 1)
  return (
    <span
      className={cn('ap-stock-badge', `ap-stock-${TINT[letter] ?? 'ink'}`)}
      style={{ width: size, height: size, fontSize: size * 0.46 }}
      aria-hidden="true"
    >
      {letter}
    </span>
  )
}
