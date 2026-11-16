import { useRef } from 'react'
import Countdown from '../components/Countdown'
import Halftone from '../components/Halftone'
import Link from '../components/Link'
import Magnetic from '../components/Magnetic'
import { BaseMark } from '../components/Logo'
import { gsap, reducedMotion, SplitText, useGSAP } from '../motion'

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const drift = useRef(0)

  useGSAP(
    (_, contextSafe) => {
      if (reducedMotion()) return
      // Built after fonts load, but inside the GSAP context (contextSafe) so a StrictMode remount
      // reverts it instead of leaving the panel frozen at its clipped start.
      let cancelled = false
      let split: SplitText | undefined
      const intro = contextSafe!(() => {
        if (cancelled) return
        split = SplitText.create('.hero-title', { type: 'lines,words', mask: 'lines' })
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .fromTo(
            '.hero-panel',
            { clipPath: 'inset(0% 0% 100% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, clearProps: 'clipPath' },
            0,
          )
          .from(split.words, { yPercent: 115, duration: 1.1, stagger: 0.06 }, 0.15)
          .from('.hero-card > *', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.55)
          .from('.hero-meta > *', { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.7)
      })
      if (document.fonts.status === 'loaded') intro()
      else document.fonts.ready.then(intro)

      // Scroll: the panel shrinks into the page, the title lifts away, the halftone field drifts.
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
        .to('.hero-panel', { scale: 0.92, borderTopRightRadius: 48, borderBottomLeftRadius: 48, ease: 'none' }, 0)
        .to('.hero-title', { yPercent: -40, ease: 'none' }, 0)
        .to(drift, { current: 1, ease: 'none' }, 0)
      return () => {
        cancelled = true
        split?.revert()
      }
    },
    { scope: root },
  )

  return (
    <section className="hero" ref={root}>
      <div className="hero-panel">
        <Halftone className="hero-canvas" drift={drift} />

        <div className="hero-head notch notch-tl">
          <h1 className="hero-title">
            Covered Past
            <br />
            The Closing Bell.
          </h1>
        </div>

        <div className="hero-card notch notch-br">
          <p>
            Stock tokens on Base trade all weekend. Their oracle doesn't. bell24 covers the jump that lands when Wall
            Street reopens, and pays you automatically.
          </p>
          <div className="hero-actions">
            <Magnetic>
              <Link className="btn btn-orange" href="/app">
                Protect a position
              </Link>
            </Magnetic>
            <Link className="btn btn-ghost" href="#who">
              Underwrite the pool
            </Link>
          </div>
        </div>
      </div>

      <div className="hero-meta">
        <Countdown />
        <span className="hero-chain">
          <BaseMark size={16} /> Live on Base mainnet
        </span>
      </div>
    </section>
  )
}
