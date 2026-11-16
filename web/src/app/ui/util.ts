import { useId, useLayoutEffect, useRef, useState } from 'react'

/** Joins truthy class names. The app has no Tailwind, so there is nothing to merge. */
export const cn = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ')

export const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi)

/** Tracks an element's content box so charts can draw in real pixels instead of a stretched viewBox. */
export function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setSize({ w: r.width, h: r.height })
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}

export function useWidth<T extends HTMLElement>() {
  const [ref, size] = useSize<T>()
  return [ref, size.w] as const
}

/** useId output is not always safe inside url(#…) references. */
export function useSvgId(prefix: string) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
}

/** Deterministic pseudo random numbers so demo charts look the same on every load. */
export function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Widens [lo, hi] out to round tick values so the line never leaves the labelled range. */
export function niceDomain(lo: number, hi: number, count = 4): [number, number] {
  if (hi === lo) return [lo - 1, hi + 1]
  const raw = (hi - lo) / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw
  return [Math.floor(lo / step) * step, Math.ceil(hi / step) * step]
}

/** Nice round axis ticks between lo and hi. */
export function ticks(lo: number, hi: number, count = 4) {
  if (hi === lo) return [lo]
  const raw = (hi - lo) / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw
  const out: number[] = []
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-6; v += step) out.push(Number(v.toFixed(10)))
  return out
}

export const compactUsd = (n: number) => {
  const a = Math.abs(n)
  const sign = n < 0 ? '−' : ''
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(1)}M`
  if (a >= 1e4) return `${sign}$${(a / 1e3).toFixed(1)}K`
  return `${sign}$${a.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}
