import { useEffect, useState } from 'react'
import { hms, marketClock } from '../market'

/** Live "market closes in" / "market opens in" clock, New York hours. */
export function useMarketClock() {
  const [clock, setClock] = useState(() => marketClock())
  useEffect(() => {
    const id = setInterval(() => setClock(marketClock()), 1000)
    return () => clearInterval(id)
  }, [])
  return clock
}

export default function Countdown({ compact = false }: { compact?: boolean }) {
  const { open, secs } = useMarketClock()
  const { h, m, s } = hms(secs)
  const two = (n: number) => String(n).padStart(2, '0')
  return (
    <span className={`countdown ${open ? 'is-open' : 'is-closed'}`}>
      <span className="countdown-label">{open ? 'Wall Street closes in' : 'Wall Street opens in'}</span>
      <span className="countdown-time mono">
        {compact ? `${h}h ${two(m)}m` : `${two(h)}:${two(m)}:${two(s)}`}
      </span>
    </span>
  )
}
