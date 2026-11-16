import { lazy, Suspense, useEffect } from 'react'
import { startSmoothScroll, ScrollTrigger } from './motion'
import { usePath } from './router'
import Landing from './Landing'

const AppShell = lazy(() => import('./app/AppShell'))

export default function App() {
  const path = usePath()
  useEffect(() => startSmoothScroll(), [])
  useEffect(() => {
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [path])

  if (path.startsWith('/app'))
    return (
      <Suspense fallback={<div className="app-loading" />}>
        <AppShell path={path} />
      </Suspense>
    )
  return <Landing />
}
