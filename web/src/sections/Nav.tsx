import { useEffect, useState } from 'react'
import Link from '../components/Link'
import { BuiltOnBase, Logo } from '../components/Logo'

const LINKS = [
  ['How it works', '#how'],
  ['Payout', '#payout'],
  ['Underwrite', '#who'],
  ['Agent', '#agent'],
]

export default function Nav() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header className={`nav ${solid ? 'is-solid' : ''}`}>
      <div className="nav-inner">
        <Link href="/" aria-label="bell24 home">
          <Logo size={26} />
        </Link>
        <nav className="nav-links" aria-label="Sections">
          {LINKS.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-end">
          <BuiltOnBase />
          <Link className="btn btn-orange" href="/app">
            Launch app
          </Link>
        </div>
      </div>
    </header>
  )
}
