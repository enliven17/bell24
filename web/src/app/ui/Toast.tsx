import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { IconCheck, IconClose, IconInfo } from './icons'
import { cn } from './util'

export type ToastInput = { title: string; body?: string; tone?: 'ink' | 'blue' | 'orange' }
type ToastItem = ToastInput & { id: number }

const Ctx = createContext<(t: ToastInput) => void>(() => {})

/** Fire-and-forget notifications. Announced politely, dismissed after a few seconds or on click. */
export function useToast() {
  return useContext(Ctx)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const next = useRef(1)
  const timers = useRef(new Map<number, number>())

  const dismiss = useCallback((id: number) => {
    setItems((all) => all.filter((t) => t.id !== id))
    window.clearTimeout(timers.current.get(id))
    timers.current.delete(id)
  }, [])

  const push = useCallback(
    (t: ToastInput) => {
      const id = next.current++
      setItems((all) => [...all.slice(-2), { ...t, id }])
      timers.current.set(id, window.setTimeout(() => dismiss(id), 4200))
    },
    [dismiss],
  )

  useEffect(() => {
    const map = timers.current
    return () => map.forEach((t) => window.clearTimeout(t))
  }, [])

  const value = useMemo(() => push, [push])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="ap-toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={cn('ap-toast', `ap-toast-${t.tone ?? 'ink'}`)}>
            <span className="ap-toast-icon">{t.tone === 'orange' ? <IconInfo size={18} /> : <IconCheck size={18} />}</span>
            <div className="ap-toast-text">
              <b>{t.title}</b>
              {t.body && <span>{t.body}</span>}
            </div>
            <button type="button" className="ap-icon-btn" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
              <IconClose size={16} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
