import { useEffect, useId, useState, type ReactNode } from 'react'
import { clamp, cn } from './util'

/** Label, control, then either an error or a hint. The control gets described by whichever is shown. */
export function Field({
  label,
  hint,
  error,
  aside,
  children,
  htmlFor,
}: {
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  aside?: ReactNode
  children: ReactNode
  htmlFor?: string
}) {
  return (
    <div className={cn('ap-field', error ? 'ap-has-error' : undefined)}>
      <div className="ap-field-top">
        {htmlFor ? (
          <label className="ap-field-label" htmlFor={htmlFor}>
            {label}
          </label>
        ) : (
          <span className="ap-field-label">{label}</span>
        )}
        {aside && <span className="ap-field-aside">{aside}</span>}
      </div>
      {children}
      {error ? (
        <small className="ap-field-error" id={htmlFor ? `${htmlFor}-msg` : undefined} role="alert">
          {error}
        </small>
      ) : (
        hint && (
          <small className="ap-field-hint" id={htmlFor ? `${htmlFor}-msg` : undefined}>
            {hint}
          </small>
        )
      )}
    </div>
  )
}

/**
 * Money input. Keeps its own text so people can type freely ("12." or an empty box),
 * and reports a number on every valid keystroke. Values above `max` are reported as typed so the
 * caller can show why they will be capped.
 */
export function NumberInput({
  id,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  prefix = '$',
  suffix,
  onMax,
  invalid,
  describedBy,
  size = 'md',
}: {
  id: string
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
  onMax?: () => void
  invalid?: boolean
  describedBy?: string
  size?: 'md' | 'lg'
}) {
  const [text, setText] = useState(String(value))
  useEffect(() => {
    setText((t) => (Number(t) === value ? t : String(value)))
  }, [value])
  return (
    <div className={cn('ap-num', `ap-num-${size}`, invalid && 'ap-is-invalid')}>
      {prefix && <span className="ap-num-affix">{prefix}</span>}
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={text}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9.]/g, '')
          setText(raw)
          const n = Number(raw)
          if (raw !== '' && Number.isFinite(n)) onChange(Math.max(n, min))
          else if (raw === '') onChange(0)
        }}
        onBlur={() => setText(String(value))}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
          e.preventDefault()
          const next = value + (e.key === 'ArrowUp' ? step : -step)
          onChange(clamp(next, min, max ?? Infinity))
        }}
      />
      {suffix && <span className="ap-num-affix">{suffix}</span>}
      {onMax && (
        <button type="button" className="ap-num-max" onClick={onMax}>
          Max
        </button>
      )}
    </div>
  )
}

/** Range input with a filled track. Keyboard and screen readers get the native slider semantics. */
export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  format,
  ticks,
}: {
  value: number
  onChange: (n: number) => void
  min: number
  max: number
  step?: number
  label: string
  format?: (n: number) => string
  ticks?: Array<{ at: number; label: string }>
}) {
  const id = useId()
  const pct = max > min ? ((clamp(value, min, max) - min) / (max - min)) * 100 : 0
  return (
    <div className="ap-slider">
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamp(value, min, max)}
        aria-label={label}
        aria-valuetext={format?.(value)}
        style={{ ['--fill' as string]: `${pct}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {ticks && (
        <div className="ap-slider-ticks" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t.label} style={{ left: `${((t.at - min) / (max - min)) * 100}%` }}>
              {t.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
