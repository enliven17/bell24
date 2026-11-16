import { useRef, useState } from 'react'
import { gsap, lenis, reducedMotion, ScrollTrigger, useGSAP } from '../motion'
import SplitReveal from '../components/SplitReveal'
import Link from '../components/Link'
import { STOCK_LOGOS } from '../components/stockLogos'

function HolderViz() {
  return (
    <div className="aviz aviz-holder">
      <div className="avh-row">
        <span className="avh-logo">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d={STOCK_LOGOS.NVDAc} fill="currentColor" />
          </svg>
        </span>
        <b>NVDAc</b>
        <span className="avh-tag">Covered</span>
      </div>
      <dl>
        <div>
          <dt>Position</dt>
          <dd className="mono">$1,240</dd>
        </div>
        <div>
          <dt>Premium</dt>
          <dd className="mono">$1.80</dd>
        </div>
        <div>
          <dt>If Monday opens −9%</dt>
          <dd className="mono avh-pay">+$40.00</dd>
        </div>
      </dl>
    </div>
  )
}

const WEEKS = [14, 18, 12, 22, 16, -38, 19, 24, 15, 21, 17, 26]
function UnderwriterViz() {
  return (
    <div className="aviz aviz-uw">
      <div className="avu-head">
        <span>Premiums per closure</span>
        <b className="mono">+$214.60</b>
      </div>
      <svg className="avu-bars" viewBox="0 0 240 130" aria-hidden="true">
        <line x1="0" x2="240" y1="80" y2="80" className="avu-base" />
        {WEEKS.map((v, i) => {
          const h = Math.abs(v) * 2.6
          return <rect key={i} x={4 + i * 19.6} y={v < 0 ? 80 : 80 - h} width="13" height={h} rx="2" className={v < 0 ? 'is-paid' : ''} />
        })}
      </svg>
      <div className="avu-foot">
        <span>11 calm</span>
        <span>1 paid out</span>
      </div>
    </div>
  )
}

function AgentViz() {
  return (
    <pre className="aviz aviz-agent mono">
      <span className="c">{'// x402, paid per call in USDC'}</span>
      {'\n'}POST /v1/quote{'\n'}
      {'{ '}
      <span className="k">"stock"</span>: <span className="s">"NVDAc"</span>, <span className="k">"amount"</span>: 1000,{'\n  '}
      <span className="k">"deductible"</span>: 0.05 {'}'}
      {'\n\n'}
      <span className="c">{'// 200 OK'}</span>
      {'\n{ '}
      <span className="k">"premium"</span>: <span className="s">"1.80"</span>, <span className="k">"window"</span>: <span className="s">"weekend"</span> {'}'}
    </pre>
  )
}

const TABS = [
  {
    key: 'Holders',
    quote: "I don't want to sell my NVDAc, but I'm nervous about the weekend.",
    body: 'Keep the position and protect it. Cover is capped at what you hold, so it is protection and never a side bet.',
    cta: ['Protect a position', '/app/cover'],
    viz: <HolderViz />,
  },
  {
    key: 'Underwriters',
    quote: "I'll deposit USDC and earn premiums when weekends are calm.",
    body: 'Back the pool in an ERC-4626 vault. Most closures are calm and the premiums stay with you. Withdrawals queue between closures.',
    cta: ['Open the vault', '/app/vault'],
    viz: <UnderwriterViz />,
  },
  {
    key: 'Agents',
    quote: 'Trading, liquidity and lending bots buy cover by themselves.',
    body: 'Quote and buy over x402 or through the MCP tool. Every policy carries a Base Builder Code, so volume is verifiable onchain.',
    cta: ['Read the agent API', '#agent'],
    viz: <AgentViz />,
  },
]

export default function Audience() {
  const root = useRef<HTMLElement>(null)
  const st = useRef<ScrollTrigger | null>(null)
  const [i, setI] = useState(0)
  const shown = useRef(0)

  // Pinned on wide screens: scrolling walks through the three sides, each tab fills as you go.
  useGSAP(
    () => {
      if (reducedMotion()) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px)', () => {
        st.current = ScrollTrigger.create({
          trigger: '.aud-stage',
          start: 'center center',
          end: '+=210%',
          pin: true,
          onUpdate: (self) => {
            const p = self.progress * 3
            const n = Math.min(2, Math.floor(p))
            root.current!.style.setProperty('--fill', String(Math.min(1, p - n)))
            if (n !== shown.current) {
              shown.current = n
              setI(n)
            }
          },
        })
        return () => {
          st.current = null
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.fromTo('.aud-panel .aud-anim', { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', stagger: 0.06 })
      gsap.fromTo('.aviz', { y: 30, scale: 0.96, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.9, ease: 'expo.out', delay: 0.1 })
    },
    { scope: root, dependencies: [i] },
  )

  const pick = (n: number) => {
    const t = st.current
    if (t && lenis) lenis.scrollTo(t.start + ((n + 0.15) / 3) * (t.end - t.start))
    else {
      shown.current = n
      setI(n)
    }
  }

  const tab = TABS[i]
  return (
    <section className="audience wrap" ref={root} id="who">
      <SplitReveal className="section-head center">
        <h2>
          One Pool.
          <br />
          Three Sides Of The Trade.
        </h2>
      </SplitReveal>

      <div className="aud-stage">
        <div className="aud">
          <div className="aud-tabs" role="tablist">
            {TABS.map((t, n) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={n === i}
                className={`aud-tab ${n === i ? 'is-on' : ''} ${n < i ? 'is-done' : ''}`}
                onClick={() => pick(n)}
              >
                <span className="aud-fill" aria-hidden="true" />
                <span className="aud-num mono">0{n + 1}</span>
                <span className="aud-name">{t.key}</span>
              </button>
            ))}
          </div>
          <div className="aud-panel" role="tabpanel" key={tab.key}>
            <div className="aud-copy">
              <blockquote className="aud-anim">{tab.quote}</blockquote>
              <p className="aud-anim">{tab.body}</p>
              <Link className="btn btn-paper aud-anim" href={tab.cta[1]}>
                {tab.cta[0]}
              </Link>
            </div>
            {tab.viz}
          </div>
        </div>
      </div>
    </section>
  )
}
