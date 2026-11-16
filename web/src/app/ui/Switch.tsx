import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { gsap, reducedMotion } from '../../motion'
import { cn } from './util'

const TRACK = 40
const PAD = 3
const THUMB = 20
const TRAVEL = TRACK - PAD * 2 - THUMB
const PRESS_SCALE_X = 1.14

/**
 * Squared toggle, ported from the portfolio's animated-switch (motion springs) to GSAP.
 * The thumb stretches while pressed and glides on change. Native button with role="switch".
 */
export function Switch({
  checked,
  onChange,
  label,
  children,
  disabled,
}: {
  checked: boolean
  onChange: (on: boolean) => void
  label?: string
  children?: ReactNode
  disabled?: boolean
}) {
  const thumb = useRef<HTMLSpanElement>(null)
  const first = useRef(true)
  const [pressing, setPressing] = useState(false)

  useLayoutEffect(() => {
    const el = thumb.current
    if (!el) return
    const x = checked ? TRAVEL : 0
    if (first.current || reducedMotion()) gsap.set(el, { x })
    else gsap.to(el, { x, duration: 0.42, ease: 'back.out(1.6)', overwrite: 'auto' })
    first.current = false
  }, [checked])

  useLayoutEffect(() => {
    const el = thumb.current
    if (!el || reducedMotion()) return
    gsap.to(el, {
      scaleX: pressing ? PRESS_SCALE_X : 1,
      transformOrigin: checked ? '100% 50%' : '0% 50%',
      duration: 0.2,
      ease: 'power2.out',
    })
  }, [pressing, checked])

  return (
    <label className={cn('ap-switch', disabled && 'ap-is-disabled')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={children ? undefined : label}
        disabled={disabled}
        className={cn('ap-switch-track', checked && 'ap-is-on')}
        onClick={() => onChange(!checked)}
        onPointerDown={() => setPressing(true)}
        onPointerUp={() => setPressing(false)}
        onPointerLeave={() => setPressing(false)}
      >
        <span ref={thumb} className="ap-switch-thumb" />
      </button>
      {children && <span className="ap-switch-text">{children}</span>}
    </label>
  )
}
