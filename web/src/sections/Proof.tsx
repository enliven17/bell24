import { useRef } from 'react'
import Marquee from '../components/Marquee'
import SplitReveal from '../components/SplitReveal'
import { BaseMark } from '../components/Logo'
import { gsap, reducedMotion, useGSAP } from '../motion'

const STATS = [
  { k: 'Weekend freeze', v: 65, unit: 'h', note: 'Chainlink holds the last close from Friday 4pm to Monday 9:30am ET.' },
  { k: 'Stocks at launch', v: 4, unit: '', note: 'NVDAc, AAPLc, METAc and GOOGLc, one shared pool.' },
  { k: 'Settles after open', v: 30, unit: 'min', note: 'Payouts read the Chainlink price 30 minutes into Monday.' },
  { k: 'Protocol fee', v: 10, unit: '%', note: 'A cut of every premium. Underwriters keep the rest.' },
]

const PARTNERS = ['NVDAc', 'Chainlink', 'AAPLc', 'USDC', 'METAc', 'Base', 'GOOGLc', 'x402', 'ERC-4626', 'Coinbase Stocks API']

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
    },
    { scope: root },
  )

  return (
    <section className="proof wrap" ref={root} id="how">
      <SplitReveal className="section-head center">
        <h2>
          The Weekend Gap,
          <br />
          Covered Onchain.
        </h2>
      </SplitReveal>

      <div className="stats">
        {STATS.map((s) => (
          <article className="stat" key={s.k}>
            <span className="stat-k">{s.k}</span>
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
        <Marquee speed={40}>
          {PARTNERS.map((p) => (
            <span className="partner" key={p}>
              {p === 'Base' ? <BaseMark size={18} /> : null}
              {p}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
