import { useRef, useState, type FormEvent } from 'react'
import { gsap, reducedMotion, useGSAP } from '../motion'
import Link from '../components/Link'
import { BuiltOnBase, Logo } from '../components/Logo'

const SOCIAL = [
  ['X', 'https://x.com/', 'M4 4l16 16M20 4L4 20'],
  ['Telegram', 'https://t.me/', 'M3 11l18-7-4 17-6-5-3 3v-5l9-8'],
  ['Farcaster', 'https://farcaster.xyz/', 'M5 4h14v16h-3v-7a4 4 0 0 0-8 0v7H5z'],
  ['GitHub', 'https://github.com/', 'M8 20v-4a3 3 0 0 1 1-2c-3 0-5-1-5-5a4 4 0 0 1 1-3V3l3 2a9 9 0 0 1 8 0l3-2v3a4 4 0 0 1 1 3c0 4-2 5-5 5a3 3 0 0 1 1 2v4'],
]

export default function Footer() {
  const root = useRef<HTMLElement>(null)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.from('.join', { scale: 0.9, borderRadius: 80, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.join', start: 'top 85%' } })
      gsap.from('.foot-word', { yPercent: 60, ease: 'none', scrollTrigger: { trigger: '.foot-word', start: 'top bottom', end: 'bottom bottom', scrub: true } })
    },
    { scope: root },
  )

  // ponytail: no backend yet, the signup only confirms locally. Wire it to the list provider when there is one.
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setSent(true)
  }

  return (
    <footer className="footer wrap" ref={root}>
      <section className="join">
        <h2>
          Get The Friday Risk Note
          <br />
          Before The Bell.
        </h2>
        {sent ? (
          <p className="join-done">You're on the list. First note lands Friday, 3pm ET.</p>
        ) : (
          <form className="join-form" onSubmit={submit}>
            <label className="sr-only" htmlFor="email">
              Email
            </label>
            <input id="email" type="email" placeholder="you@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button className="btn btn-orange" type="submit">
              Subscribe
            </button>
          </form>
        )}
      </section>

      <div className="foot">
        <div className="foot-card">
          <Logo tone="paper" size={30} />
          <p>Cover for stock tokens on Base, past every closing bell.</p>
          <Link className="btn btn-orange" href="/app">
            Launch app
          </Link>
        </div>
        <div className="foot-side">
          <div className="socials">
            {SOCIAL.map(([name, href, d]) => (
              <a key={name} href={href} className="social" aria-label={name} target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={d} />
                </svg>
              </a>
            ))}
          </div>
          <div className="foot-links">
            <Link href="#how">How it works</Link>
            <Link href="#payout">Payout</Link>
            <Link href="/app/vault">Vault</Link>
            <Link href="#agent">Agent</Link>
            <BuiltOnBase />
          </div>
          <small>
            Cover is protection, not insurance. Not available to US persons. © 2026 bell24
          </small>
        </div>
      </div>
      <div className="foot-word" aria-hidden="true">
        bell24
      </div>
    </footer>
  )
}
