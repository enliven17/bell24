import { useEffect, useRef } from 'react'
import { reducedMotion } from '../motion'

type Props = { className?: string; cell?: number; drift?: { current: number } }

// Square-cell halftone: a slow field of orange over signal blue. Cells grow under the pointer,
// and `drift` (0..1, fed by scroll) pushes the field sideways so the panel reacts as the page moves.
export default function Halftone({ className, cell = 14, drift }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const css = getComputedStyle(document.documentElement)
    const blue = css.getPropertyValue('--blue').trim() || '#002941'
    const orange = css.getPropertyValue('--orange').trim() || '#FD6E6E'
    let w = 0
    let h = 0
    let dpr = 1
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 }
    let raf = 0
    let visible = true
    const still = reducedMotion()

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = r.width
      h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // Three interfering waves give soft blobs instead of one gradient.
    const field = (x: number, y: number, t: number, d: number) => {
      const u = x / w
      const v = y / h
      const a = Math.sin(u * 5.3 + t * 0.35 + d * 4) * Math.cos(v * 4.1 - t * 0.3)
      const b = Math.sin(u * 3.7 - v * 4.9 + t * 0.25 + d * 2) * 0.8
      const c = Math.cos(u * 9.1 + v * 6.3 - t * 0.45) * 0.4
      return (a + b + c + 2.2) / 4.4
    }

    const draw = (time: number) => {
      const t = still ? 2 : time / 1000
      const d = drift?.current ?? 0
      pointer.x += (pointer.tx - pointer.x) * 0.12
      pointer.y += (pointer.ty - pointer.y) * 0.12
      ctx.fillStyle = blue
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = orange
      const reach = Math.max(w, h) * 0.22
      for (let y = cell / 2; y < h; y += cell) {
        for (let x = cell / 2; x < w; x += cell) {
          let f = field(x, y, t, d)
          const dist = Math.hypot(x - pointer.x, y - pointer.y)
          if (dist < reach) f += (1 - dist / reach) ** 2 * 0.6
          f = Math.min(Math.max((f - 0.38) * 2.4, 0), 1)
          const s = f * cell * 1.02
          if (s > 0.6) ctx.fillRect(x - s / 2, y - s / 2, s, s)
        }
      }
    }

    const loop = (time: number) => {
      if (visible) draw(time)
      raf = requestAnimationFrame(loop)
    }

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer.tx = e.clientX - r.left
      pointer.ty = e.clientY - r.top
    }
    const leave = () => {
      pointer.tx = -9999
      pointer.ty = -9999
    }

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      if (still) draw(0)
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(canvas)
    if (still) draw(0)
    else {
      raf = requestAnimationFrame(loop)
      window.addEventListener('pointermove', move)
      document.addEventListener('pointerleave', leave)
    }
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
    }
  }, [cell, drift])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
