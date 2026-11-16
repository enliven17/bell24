import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { gsap, reducedMotion } from '../../motion'
import { IconCheck, IconClose, IconCopy } from './icons'
import { cn } from './util'

type CopyState = 'idle' | 'done' | 'error'

/**
 * Copy to clipboard with an icon that swaps copy, check or cross. Ported from the portfolio's
 * copy-button (motion icon-swap) to GSAP. Resets to idle after a moment.
 */
export function CopyButton({
  text,
  children,
  className = 'ap-ui-btn ap-ui-btn-line',
  onCopied,
  label = 'Copy',
}: {
  text: string | (() => string)
  children?: ReactNode
  className?: string
  onCopied?: (ok: boolean) => void
  label?: string
}) {
  const [state, setState] = useState<CopyState>('idle')
  const icon = useRef<HTMLSpanElement>(null)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useLayoutEffect(() => {
    if (!icon.current || reducedMotion()) return
    gsap.fromTo(icon.current, { scale: 0.4, rotate: -30, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.35, ease: 'back.out(2)' })
  }, [state])

  const copy = () => {
    const value = typeof text === 'function' ? text() : text
    const done = (ok: boolean) => {
      setState(ok ? 'done' : 'error')
      onCopied?.(ok)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setState('idle'), 1600)
    }
    if (!navigator.clipboard) return done(false)
    navigator.clipboard.writeText(value).then(
      () => done(true),
      () => done(false),
    )
  }

  return (
    <button type="button" className={cn(className, 'ap-copy-btn')} onClick={copy} aria-label={children ? undefined : label}>
      <span ref={icon} className="ap-copy-icon" aria-hidden="true">
        {state === 'done' ? <IconCheck size={18} /> : state === 'error' ? <IconClose size={18} /> : <IconCopy size={18} />}
      </span>
      {children && <span aria-live="polite">{state === 'done' ? 'Copied' : state === 'error' ? 'Blocked' : children}</span>}
    </button>
  )
}
