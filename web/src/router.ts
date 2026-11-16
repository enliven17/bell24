import { useSyncExternalStore } from 'react'

// ponytail: history router for two areas (landing, /app/*). Swap for a real router when routes need params.
const listeners = new Set<() => void>()
window.addEventListener('popstate', () => listeners.forEach((l) => l()))

export function navigate(to: string) {
  if (to === location.pathname) return
  history.pushState(null, '', to)
  window.scrollTo(0, 0)
  listeners.forEach((l) => l())
}

export function usePath() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => location.pathname,
  )
}
