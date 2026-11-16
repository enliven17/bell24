import './app.css'
import { useEffect, useRef, useState } from 'react'
import { gsap, reducedMotion, useGSAP } from '../motion'
import { STOCKS } from '../market'
import { AppProvider } from './state'
import { ToastProvider } from './ui'
import { normalize } from './shell/nav'
import { Sidebar, TabBar } from './shell/Sidebar'
import { TopBar } from './shell/TopBar'
import { Agent, Cover, Home, Live, Receipt, Vault } from './screens'
import { ScreenSkeleton } from './screens/Skeletons'

export default function AppShell({ path }: { path: string }) {
  return (
    <ToastProvider>
      <AppProvider>
        <Shell path={path} />
      </AppProvider>
    </ToastProvider>
  )
}

function Shell({ path }: { path: string }) {
  const main = useRef<HTMLElement>(null)
  const [pick, setPick] = useState(STOCKS[0].sym)
  const here = normalize(path)
  // ponytail: a fixed 650ms stands in for the first data fetch of each screen; swap for real loading state.
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    const id = setTimeout(() => setLoading(false), 650)
    return () => clearTimeout(id)
  }, [here])

  // Screen enter: each top-level block rises in, staggered. Synchronous, so StrictMode's
  // double-invoke is handled by useGSAP's own revert.
  useGSAP(
    () => {
      if (reducedMotion() || loading) return
      gsap.from('.ap-screen > *', { y: 22, autoAlpha: 0, duration: 0.7, ease: 'expo.out', stagger: 0.05, clearProps: 'transform,opacity,visibility' })
    },
    { scope: main, dependencies: [here, loading] },
  )

  const screen = (() => {
    switch (here) {
      case '/app/cover':
        return <Cover sym={pick} setSym={setPick} />
      case '/app/live':
        return <Live />
      case '/app/vault':
        return <Vault />
      case '/app/agent':
        return <Agent />
      case '/app/receipt':
        return <Receipt />
      default:
        return <Home onProtect={setPick} />
    }
  })()

  return (
    <div className="ap-app">
      <Sidebar path={here} />
      <div className="ap-app-main">
        <TopBar />
        <main className="ap-screen" key={here} ref={main} id="main">
          {loading ? <ScreenSkeleton path={here} /> : screen}
        </main>
        <footer className="ap-app-foot">
          <span>Demo data. Wallet, quotes and weekend prices are stand-ins until the contracts and feeds are live.</span>
          <span>Cover pays in USDC. Not available to US persons.</span>
        </footer>
      </div>
      <TabBar path={here} />
    </div>
  )
}
