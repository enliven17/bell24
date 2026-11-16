import { useRef } from 'react'
import Marquee from '../components/Marquee'
import SplitReveal from '../components/SplitReveal'
import { BaseMark } from '../components/Logo'
import { STOCK_LOGOS } from '../components/stockLogos'
import { gsap, reducedMotion, useGSAP } from '../motion'

// Each partner with its mark: Simple Icons where they exist, a plain stroke glyph for standards (x402, ERC-4626).
const PARTNERS: [string, string | null][] = [
  ['NVDAc', STOCK_LOGOS.NVDAc],
  ['Chainlink', STOCK_LOGOS.Chainlink],
  ['AAPLc', STOCK_LOGOS.AAPLc],
  ['USDC', STOCK_LOGOS.USDC],
  ['METAc', STOCK_LOGOS.METAc],
  ['Base', null],
  ['GOOGLc', STOCK_LOGOS.GOOGLc],
  ['x402', 'stroke:M3 6h18v12H3zM3 10h18M7 15h4'],
  ['ERC-4626', 'stroke:M4 4h16v16H4zM9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0M12 4v3M12 17v3'],
  ['Coinbase Stocks API', STOCK_LOGOS.Coinbase],
]

const TICKERS = [
  ['NVDAc', '−6.8%', 'down'],
  ['AAPLc', '−2.4%', 'down'],
  ['METAc', '+1.2%', 'up'],
  ['GOOGLc', '−3.1%', 'down'],
]

// 65 cells, one per closed hour. Scroll lights them up from Friday's bell to Monday's.
function HourGrid() {
  return (
    <div className="viz-hours" aria-hidden="true">
      {Array.from({ length: 65 }, (_, i) => (
        <span key={i} className={i === 8 || i === 32 || i === 56 ? 'is-midnight' : ''} />
      ))}
    </div>
  )
}

function Tickers() {
  return (
    <div className="viz-tickers" aria-hidden="true">
      {TICKERS.map(([s, m, dir]) => (
        <span key={s} className={`tk tk-${dir}`}>
          <span className="tk-logo">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d={STOCK_LOGOS[s]} fill="currentColor" />
            </svg>
          </span>
          <span className="tk-txt">
            <b>{s}</b>
            <i className="mono">{m}</i>
          </span>
        </span>
      ))}
    </div>
  )
}

// A 60 minute dial; the arc sweeps to 30 as the card enters.
function Dial() {
  const r = 46
  const c = 2 * Math.PI * r
  return (
    <svg className="viz-dial" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r={r} className="dial-track" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        return <line key={i} x1={60 + Math.sin(a) * 54} y1={60 - Math.cos(a) * 54} x2={60 + Math.sin(a) * 58} y2={60 - Math.cos(a) * 58} className="dial-tick" />
      })}
      <circle cx="60" cy="60" r={r} className="dial-arc" strokeDasharray={c} strokeDashoffset={c / 2} transform="rotate(-90 60 60)" style={{ ['--c' as string]: c }} />
      <text x="60" y="57" className="dial-t1">
        9:30
      </text>
      <text x="60" y="74" className="dial-t2">
        to 10:00
      </text>
    </svg>
  )
}

function Split() {
  return (
    <div className="viz-split" aria-hidden="true">
      <div className="split-bar">
        <span className="split-uw" />
        <span className="split-pr" />
      </div>
      <div className="split-legend">
        <span>Underwriters 90%</span>
        <span>Protocol 10%</span>
      </div>
    </div>
  )
}

const STATS = [
  { k: 'Weekend freeze', v: 65, unit: 'h', note: 'Chainlink holds Friday 4pm until Monday 9:30am ET.', viz: <HourGrid /> },
  { k: 'Stocks at launch', v: 4, unit: '', note: 'One shared pool, priced as if they gap together.', viz: <Tickers /> },
  { k: 'Settles after open', v: 30, unit: 'min', note: 'Payouts read the Chainlink price 30 minutes into Monday.', viz: <Dial /> },
  { k: 'Protocol fee', v: 10, unit: '%', note: 'A cut of every premium. Underwriters keep the rest.', viz: <Split /> },
]

export default function Proof() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.from('.stat', {
        y: 80,
        rotate: (i) => (i % 2 ? 3 : -3),
        autoAlpha: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '.stats', start: 'top 85%' },
      })
      gsap.utils.toArray<HTMLElement>('.stat-num').forEach((el) => {
        const end = Number(el.dataset.v)
        const o = { v: 0 }
        gsap.to(o, {
          v: end,
          duration: 1.6,
          ease: 'expo.out',
          onUpdate: () => (el.textContent = Math.round(o.v).toString()),
          scrollTrigger: { trigger: el, start: 'top 90%' },
        })
      })
      // The hour grid fills with scroll, the other visuals play once.
      gsap.fromTo(
        '.viz-hours span',
        { opacity: 0.22 },
        { opacity: 1, stagger: 0.02, ease: 'none', scrollTrigger: { trigger: '.stats', start: 'top 80%', end: 'bottom 35%', scrub: 0.4 } },
      )
      const enter = { trigger: '.stats', start: 'top 75%' }
      gsap.from('.tk', { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'expo.out', scrollTrigger: enter })
      gsap.from('.dial-arc', { strokeDashoffset: (_: number, el: SVGCircleElement) => el.style.getPropertyValue('--c'), duration: 1.6, ease: 'expo.out', scrollTrigger: enter })
      gsap.from('.split-uw, .split-pr', { scaleX: 0, transformOrigin: '0 50%', stagger: 0.25, duration: 1.2, ease: 'expo.out', scrollTrigger: enter })
    },
    { scope: root },
  )

  return (
    <section className="proof wrap" ref={root} id="how">
      <div className="proof-head">
        <SplitReveal>
          <h2>
            The Weekend Gap,
            <br />
            Covered Onchain.
          </h2>
        </SplitReveal>
        <p>
          Stock tokens never stop trading, but their price feed does. Everything that happens between Friday's bell and
          Monday's lands as one jump. These are the numbers bell24 is built around.
        </p>
      </div>

      <div className="stats">
        {STATS.map((s, i) => (
          <article className="stat" key={s.k}>
            <div className="stat-top">
              <span className="stat-k">{s.k}</span>
              <span className="stat-i mono">0{i + 1}</span>
            </div>
            <div className="stat-viz">{s.viz}</div>
            <span className="stat-v">
              <span className="stat-num" data-v={s.v}>
                {s.v}
              </span>
              <small>{s.unit}</small>
            </span>
            <p>{s.note}</p>
          </article>
        ))}
      </div>

      <div className="partners">
        <span className="partners-k">Built with</span>
        <Marquee speed={40}>
          {PARTNERS.map(([name, d]) => (
            <span className="partner" key={name}>
              {d === null ? (
                <BaseMark size={22} />
              ) : (
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  {d.startsWith('stroke:') ? (
                    <path d={d.slice(7)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  ) : (
                    <path d={d} fill="currentColor" />
                  )}
                </svg>
              )}
              {name}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
