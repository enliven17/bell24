import type { PointerEvent } from 'react'

/**
 * Pointer-follow glow for selectable cards, ported from the portfolio's spotlight-card.
 * Instead of motion values it writes two CSS variables that .ap-spot::before reads, so React
 * never re-renders on pointer move. Pair the handler with the `ap-spot` class.
 */
export function spotlight(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}
