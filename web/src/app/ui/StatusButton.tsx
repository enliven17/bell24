import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { gsap, reducedMotion } from '../../motion'
import { IconCheck } from './icons'
import { cn } from './util'

export type ButtonStatus = 'idle' | 'loading' | 'success'

/**
 * Button whose label swaps between idle, loading and success. Ported from the portfolio's
 * status-button: the outgoing label is replaced and the new one rises in, with a small overshoot
 * only on success. The width stays fixed so the layout does not jump.
 */
export function StatusButton({
  status,
  onClick,
  idle,
  loading = 'Confirming',
  success = 'Done',
  className,
  disabled,
}: {
  status: ButtonStatus
  onClick: () => void
  idle: ReactNode
  loading?: ReactNode
  success?: ReactNode
  className?: string
  disabled?: boolean
}) {
  const label = useRef<HTMLSpanElement>(null)
  const seen = useRef(status)

  useLayoutEffect(() => {
    const el = label.current
    if (!el || seen.current === status) return
    seen.current = status
    if (reducedMotion()) return
    gsap.fromTo(
      el,
      { y: 8, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: status === 'success' ? 0.45 : 0.3, ease: status === 'success' ? 'back.out(2.2)' : 'power3.out' },
    )
  }, [status])

  return (
    <button
      type="button"
      className={cn('ap-ui-btn ap-status-btn', status === 'success' && 'ap-is-success', className)}
      onClick={onClick}
      disabled={disabled || status !== 'idle'}
      aria-busy={status === 'loading'}
    >
      <span ref={label} className="ap-status-label" aria-live="polite">
        {status === 'loading' && <span className="ap-spinner" aria-hidden="true" />}
        {status === 'success' && <IconCheck size={18} />}
        {status === 'idle' ? idle : status === 'loading' ? loading : success}
      </span>
    </button>
  )
}

/**
 * Drives a StatusButton through a simulated transaction: loading, then `action` runs and the
 * button shows success, then it returns to idle (or `after` runs). Timers clear on unmount.
 */
export function useStatusFlow(wait = 900, hold = 1100) {
  const [status, setStatus] = useState<ButtonStatus>('idle')
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])
  const run = useCallback(
    (action: () => void, after?: () => void) => {
      setStatus('loading')
      timers.current.push(
        window.setTimeout(() => {
          action()
          setStatus('success')
          timers.current.push(
            window.setTimeout(() => {
              setStatus('idle')
              after?.()
            }, hold),
          )
        }, wait),
      )
    },
    [wait, hold],
  )
  return { status, run }
}
