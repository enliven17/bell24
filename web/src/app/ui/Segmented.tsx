import { useLayoutEffect, useRef, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { gsap, reducedMotion } from '../../motion'
import { cn } from './util'

export type Option<T extends string | number> = { value: T; label: ReactNode; hint?: ReactNode; disabled?: boolean }

/** Arrow keys move between enabled items, wrapping at the ends (WAI-ARIA radio group / tablist pattern). */
function useRoving<T extends string | number>(options: Option<T>[], value: T, onChange: (v: T) => void) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])
  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0)
    const at = enabled.indexOf(options.findIndex((o) => o.value === value))
    const next = enabled[(at + step + enabled.length) % enabled.length]
    onChange(options[next].value)
    refs.current[next]?.focus()
  }
  return { refs, onKeyDown }
}

/**
 * Shared active indicator that glides between items. Ported from the portfolio's animated-tabs
 * (motion layoutId) to a measured GSAP tween: the first placement snaps, later changes slide.
 */
function useIndicator(ind: RefObject<HTMLSpanElement | null>, items: RefObject<Array<HTMLButtonElement | null>>, active: number) {
  const placed = useRef(false)
  useLayoutEffect(() => {
    const el = ind.current
    const target = items.current?.[active]
    if (!el) return
    const place = (animate: boolean) => {
      const t = items.current?.[active]
      if (!t) return gsap.set(el, { autoAlpha: 0 })
      const to = { x: t.offsetLeft, y: t.offsetTop, width: t.offsetWidth, height: t.offsetHeight, autoAlpha: 1 }
      if (animate && !reducedMotion()) gsap.to(el, { ...to, duration: 0.45, ease: 'expo.out', overwrite: true })
      else gsap.set(el, to)
    }
    place(placed.current)
    placed.current = true
    const ro = new ResizeObserver(() => place(false))
    if (target?.parentElement) ro.observe(target.parentElement)
    return () => ro.disconnect()
  }, [ind, items, active])
}

/** Single choice from a short list, e.g. deductible 3 / 5 / 8%. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  stretch = false,
}: {
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
  label: string
  size?: 'sm' | 'md'
  stretch?: boolean
}) {
  const { refs, onKeyDown } = useRoving(options, value, onChange)
  const ind = useRef<HTMLSpanElement>(null)
  useIndicator(ind, refs, options.findIndex((o) => o.value === value))
  return (
    <div className={cn('ap-seg', `ap-seg-${size}`, stretch && 'ap-seg-stretch')} role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
      <span ref={ind} className="ap-seg-ind" aria-hidden="true" />
      {options.map((o, i) => {
        const on = o.value === value
        return (
          <button
            key={String(o.value)}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            disabled={o.disabled}
            className={cn('ap-seg-item', on && 'ap-is-on')}
            onClick={() => onChange(o.value)}
          >
            <span>{o.label}</span>
            {o.hint && <small>{o.hint}</small>}
          </button>
        )
      })}
    </div>
  )
}

/** Tab strip. Pair with <TabPanel id={…}> using the same base id. */
export function Tabs<T extends string>({
  id,
  options,
  value,
  onChange,
  label,
}: {
  id: string
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  const { refs, onKeyDown } = useRoving(options, value, onChange)
  const ind = useRef<HTMLSpanElement>(null)
  useIndicator(ind, refs, options.findIndex((o) => o.value === value))
  return (
    <div className="ap-tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      <span ref={ind} className="ap-seg-ind" aria-hidden="true" />
      {options.map((o, i) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${o.value}`}
            aria-selected={on}
            aria-controls={`${id}-panel`}
            tabIndex={on ? 0 : -1}
            disabled={o.disabled}
            className={cn('ap-tab', on && 'ap-is-on')}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function TabPanel({ id, active, children, className }: { id: string; active: string; children: ReactNode; className?: string }) {
  return (
    <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`} className={className}>
      {children}
    </div>
  )
}
