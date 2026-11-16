import { useRef } from 'react'
import { gsap, reducedMotion, useGSAP } from '../motion'
import SplitReveal from '../components/SplitReveal'

// 24px stroke icons, one per rule.
const ICONS = [
  'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4M3 3l18 18',
  'M3 7h18v12H3zM3 7l3-4h12l3 4M15 13h3',
  'M3 17l5-6 4 3 6-8 3 3',
  'M4 12a8 8 0 1 0 3-6.2M4 4v4h4',
  'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
  'M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3M12 15v2',
]

const RULES = [
  ['Sales stop at the bell', 'No buying cover on Saturday after bad news has already landed.'],
  ['Capped at what you hold', 'Cover never exceeds the token balance in your wallet at purchase.'],
  ['Chainlink settles it', 'The price 30 minutes after the open decides. Total return, so splits and dividends are handled.'],
  ['Refunds when data breaks', 'If the issuer pauses the token or the price goes stale, premiums come back.'],
  ['Correlated by design', 'Exposure caps assume NVDA, AAPL, META and GOOGL gap together.'],
  ['Timelocked admin', 'Small pool caps, simple contracts and a multisig behind every parameter.'],
]

export default function Rules() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.from('.rule', {
        y: 60,
        autoAlpha: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: { each: 0.07, grid: [2, 3], from: 'start' },
        scrollTrigger: { trigger: '.rules', start: 'top 80%' },
      })
    },
    { scope: root },
  )

  return (
    <section className="rules-wrap wrap" ref={root}>
      <SplitReveal className="section-head">
        <h2>
          Rules The Contract
          <br />
          Won't Bend.
        </h2>
      </SplitReveal>
      <div className="rules">
        {RULES.map(([t, b], n) => (
          <article className="rule" key={t}>
            <div className="rule-top">
              <span className="rule-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={ICONS[n]} />
                </svg>
              </span>
              <span className="rule-n mono">{String(n + 1).padStart(2, '0')}</span>
            </div>
            <h3>{t}</h3>
            <p>{b}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
