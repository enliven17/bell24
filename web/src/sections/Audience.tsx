import { useRef, useState } from 'react'
import { gsap, reducedMotion, useGSAP } from '../motion'
import SplitReveal from '../components/SplitReveal'
import Link from '../components/Link'

const TABS = [
  {
    key: 'Holders',
    quote: "I don't want to sell my NVDAc, but I'm nervous about the weekend.",
    body: 'Keep the position and protect it, the way you would insure a house instead of selling it. Cover is capped at what you hold, so it is protection and never a side bet.',
    cta: ['Protect a position', '/app/cover'],
    figs: [
      ['Typical weekend premium', '$1.80'],
      ['Covered per $1,000', 'up to $100'],
    ],
  },
  {
    key: 'Underwriters',
    quote: "I'll deposit USDC and earn premiums when weekends are calm.",
    body: 'Back the pool with USDC in an ERC-4626 vault. Most closures are calm and the premiums stay with you. Withdrawals queue between closures, never during one.',
    cta: ['Open the vault', '/app/vault'],
    figs: [
      ['Closures so far', '41 calm, 3 paid'],
      ['Pool exposure cap', '20% per closure'],
    ],
  },
  {
    key: 'Agents',
    quote: 'Trading, liquidity and lending bots buy cover by themselves.',
    body: 'Quote and buy over x402, pay per call in USDC, or plug in through the MCP tool. Every policy carries a Base Builder Code, so the volume is verifiable onchain.',
    cta: ['Read the agent API', '#agent'],
    figs: [
      ['Quote call', '$0.002 over x402'],
      ['Interfaces', 'REST, MCP'],
    ],
  },
]

export default function Audience() {
  const root = useRef<HTMLElement>(null)
  const [i, setI] = useState(0)
  const tab = TABS[i]

  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.fromTo('.aud-panel > *', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', stagger: 0.06 })
    },
    { scope: root, dependencies: [i] },
  )

  return (
    <section className="audience wrap" ref={root} id="who">
      <SplitReveal className="section-head center">
        <h2>
          One Pool.
          <br />
          Three Sides Of The Trade.
        </h2>
      </SplitReveal>

      <div className="aud">
        <div className="aud-tabs" role="tablist">
          {TABS.map((t, n) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={n === i}
              className={`aud-tab ${n === i ? 'is-on' : ''}`}
              onClick={() => setI(n)}
            >
              <span className="aud-num mono">0{n + 1}</span>
              {t.key}
            </button>
          ))}
        </div>
        <div className="aud-panel" role="tabpanel">
          <blockquote>{tab.quote}</blockquote>
          <p>{tab.body}</p>
          <dl className="aud-figs">
            {tab.figs.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <Link className="btn btn-paper" href={tab.cta[1]}>
            {tab.cta[0]}
          </Link>
        </div>
      </div>
    </section>
  )
}
