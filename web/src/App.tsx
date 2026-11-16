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
      <Suspense
        fallback={
          <div className="app-loading" aria-busy="true">
            <span className="skel" />
            <div className="app-loading-main">
              <span className="skel" style={{ width: 260, height: 40 }} />
              <div className="app-loading-row">
                <span className="skel" style={{ height: 340 }} />
                <span className="skel" style={{ height: 340 }} />
              </div>
              <span className="skel" style={{ height: 220 }} />
            </div>
          </div>
        }
      >
        <AppShell path={path} />
      </Suspense>
    )
  return <Landing />
}
