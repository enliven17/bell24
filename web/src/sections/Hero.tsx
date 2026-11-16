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
    () => {
      if (reducedMotion()) return
      const intro = gsap.timeline({ defaults: { ease: 'expo.out' } })
      document.fonts.ready.then(() => {
        const split = SplitText.create('.hero-title', { type: 'lines,words', mask: 'lines' })
        intro
          .from('.hero-panel', { clipPath: 'inset(0 0 100% 0 round 28px)', duration: 1.4 }, 0)
          .from(split.words, { yPercent: 115, duration: 1.1, stagger: 0.06 }, 0.15)
          .from('.hero-card > *', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.55)
          .from('.hero-meta > *', { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.7)
      })

      // Scroll: the panel shrinks into the page, the title lifts away, the halftone field drifts.
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
        .to('.hero-panel', { scale: 0.92, borderRadius: 48, ease: 'none' }, 0)
        .to('.hero-title', { yPercent: -40, ease: 'none' }, 0)
        .to(drift, { current: 1, ease: 'none' }, 0)
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
