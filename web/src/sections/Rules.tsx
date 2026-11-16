import { useRef } from 'react'
import { gsap, reducedMotion, useGSAP } from '../motion'
import SplitReveal from '../components/SplitReveal'

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
            <span className="rule-n mono">{String(n + 1).padStart(2, '0')}</span>
            <h3>{t}</h3>
            <p>{b}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
