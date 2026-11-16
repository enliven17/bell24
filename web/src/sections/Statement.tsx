import { useRef } from 'react'
import { gsap, reducedMotion, useGSAP } from '../motion'
import Link from '../components/Link'
import { Mark } from '../components/Logo'

// 65 closed hours from Friday's bell to Monday's, one cell each. Scroll lights them up hour by hour.
function WeekendDial() {
  const cells = Array.from({ length: 65 }, (_, i) => {
    const a = (i / 65) * Math.PI * 2 - Math.PI / 2
    return { x: 200 + Math.cos(a) * 150, y: 200 + Math.sin(a) * 150, r: (a * 180) / Math.PI + 90 }
  })
  return (
    <svg viewBox="0 0 400 400" className="dial">
      {cells.map((c, i) => (
        <rect
          key={i}
          className="dial-cell"
          x={c.x - 6}
          y={c.y - 14}
          width="12"
          height="28"
          rx="2"
          transform={`rotate(${c.r} ${c.x} ${c.y})`}
        />
      ))}
      <rect x="110" y="110" width="180" height="180" rx="36" className="dial-face" />
      <g transform="translate(150 132) scale(1.56)">
        <Mark size={64} tone="paper" />
      </g>
      <text x="200" y="270" className="dial-label">
        <tspan className="dial-hours">0</tspan>h closed
      </text>
    </svg>
  )
}

// Eight past Monday opens. The bars past the deductible line turn orange: those are the ones that paid.
function GapBars() {
  const gaps = [-2.1, 4.8, -6.2, 1.1, -9.4, 3.3, -1.8, -12.6]
  return (
    <svg viewBox="0 0 400 400" className="bars">
      <line x1="40" x2="360" y1="150" y2="150" className="bars-zero" />
      <line x1="40" x2="360" y1="230" y2="230" className="bars-deduct" />
      <text x="40" y="222" className="bars-note">
        5% deductible
      </text>
      {gaps.map((g, i) => {
        const h = Math.abs(g) * 16
        const paid = g < -5
        return (
          <rect
            key={i}
            className={`bar ${paid ? 'bar-paid' : ''}`}
            x={52 + i * 39}
            y={g < 0 ? 150 : 150 - h}
            width="26"
            height={h}
            rx="4"
            style={{ transformOrigin: `${65 + i * 39}px 150px` }}
          />
        )
      })}
      <text x="40" y="380" className="bars-foot">
        Last 8 Monday opens, NVDAc
      </text>
    </svg>
  )
}

export default function Statement() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      // The two lines slide in from opposite sides as the statement crosses the screen.
      gsap.fromTo('.statement-line:nth-child(1)', { xPercent: -18 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'center center', scrub: true } })
      gsap.fromTo('.statement-line:nth-child(2)', { xPercent: 18 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'center center', scrub: true } })

      const hours = root.current!.querySelector('.dial-hours')!
      const o = { h: 0 }
      gsap
        .timeline({ scrollTrigger: { trigger: '.dial', start: 'top 80%', end: 'bottom 40%', scrub: 0.6 } })
        .to('.dial-cell', { fill: 'var(--orange)', stagger: 0.02, duration: 0.05 }, 0)
        .to(o, { h: 65, ease: 'none', duration: 65 * 0.02, onUpdate: () => (hours.textContent = String(Math.round(o.h))) }, 0)

      gsap.from('.bar', {
        scaleY: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.07,
        scrollTrigger: { trigger: '.bars', start: 'top 75%' },
      })

      gsap.utils.toArray<HTMLElement>('.feature').forEach((el) =>
        gsap.from(el, { y: 90, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }),
      )
    },
    { scope: root },
  )

  return (
    <section className="statement-wrap" ref={root}>
      <div className="halftone-bg" aria-hidden="true" />
      <h2 className="statement wrap">
        <span className="statement-line">Keep The Position.</span>
        <span className="statement-line">Drop The Gap.</span>
      </h2>

      <div className="features wrap">
        <article className="feature feature-text">
          <span className="icon-tile">
            <Mark size={28} tone="paper" />
          </span>
          <div>
            <h3>Switch On Before The Bell</h3>
            <p>
              Pick a stock you hold, an amount and a deductible. Cover runs from Friday's close to Monday's open, or
              renews itself every closure on Autopilot within a monthly budget you set.
            </p>
            <Link className="btn btn-line" href="/app/cover">
              Set up cover
            </Link>
          </div>
        </article>
        <article className="feature feature-art art-blue">
          <WeekendDial />
        </article>
        <article className="feature feature-art art-orange">
          <GapBars />
        </article>
        <article className="feature feature-text">
          <span className="icon-tile">
            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
              <rect x="3" y="15" width="5" height="10" rx="1" fill="var(--paper)" />
              <rect x="11.5" y="9" width="5" height="16" rx="1" fill="var(--paper)" />
              <rect x="20" y="3" width="5" height="22" rx="1" fill="var(--orange)" />
            </svg>
          </span>
          <div>
            <h3>Paid At The Open, Automatically</h3>
            <p>
              Thirty minutes after Wall Street reopens, the contract reads Chainlink. If the drop beats your deductible,
              USDC lands in your wallet. No claim form, no waiting, no one to ask.
            </p>
            <Link className="btn btn-line" href="#payout">
              See the payout maths
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}
