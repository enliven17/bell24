import './app.css'
import { useRef, useState } from 'react'
import Link from '../components/Link'
import { BuiltOnBase, Logo } from '../components/Logo'
import Countdown from '../components/Countdown'
import { gsap, reducedMotion, useGSAP } from '../motion'
import { STOCKS } from '../market'
import { Cover, Home, Live, Receipt, Vault, type Policy } from './screens'

const TABS = [
  ['Home', '/app'],
  ['Cover', '/app/cover'],
  ['Live', '/app/live'],
  ['Vault', '/app/vault'],
  ['Receipt', '/app/receipt'],
] as const

// ponytail: demo wallet and policies live in memory. The contracts and a wallet connector replace this state.
const START: Record<string, Policy> = {
  NVDAc: { amount: 1000, deductible: 0.05, limit: 0.15, plan: 'once', budget: 10 },
  AAPLc: { amount: 560, deductible: 0.05, limit: 0.15, plan: 'autopilot', budget: 10 },
}

export default function AppShell({ path }: { path: string }) {
  const root = useRef<HTMLDivElement>(null)
  const [wallet, setWallet] = useState<string | null>(null)
  const [policies, setPolicies] = useState(START)
  const [pick, setPick] = useState(STOCKS[0].sym)

  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.from('.screen > *', { y: 28, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06 })
    },
    { scope: root, dependencies: [path] },
  )

  const setPolicy = (sym: string, p: Policy | null) =>
    setPolicies((all) => {
      const { [sym]: _, ...rest } = all
      return p ? { ...rest, [sym]: p } : rest
    })

  const screen = (() => {
    switch (path.replace(/\/$/, '')) {
      case '/app/cover':
        return <Cover sym={pick} setSym={setPick} policy={policies[pick]} onSave={(p) => setPolicy(pick, p)} />
      case '/app/live':
        return <Live policies={policies} />
      case '/app/vault':
        return <Vault />
      case '/app/receipt':
        return <Receipt />
      default:
        return <Home policies={policies} onProtect={setPick} />
    }
  })()

  return (
    <div className="app" ref={root}>
      <header className="app-top">
        <Link href="/" aria-label="bell24 home">
          <Logo size={24} />
        </Link>
        <nav className="app-tabs" aria-label="App">
          {TABS.map(([label, href]) => (
            <Link key={href} href={href} className={path.replace(/\/$/, '') === href ? 'is-on' : ''}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="app-end">
          <Countdown compact />
          <button className="btn btn-line app-wallet" onClick={() => setWallet(wallet ? null : '0x7a3f…c41e')}>
            {wallet ?? 'Connect wallet'}
          </button>
        </div>
      </header>
      <main className="screen wrap" key={path}>
        {screen}
      </main>
      <footer className="app-foot wrap">
        <BuiltOnBase />
        <span>Demo data. Cover is protection, not insurance. Not available to US persons.</span>
      </footer>
    </div>
  )
}
