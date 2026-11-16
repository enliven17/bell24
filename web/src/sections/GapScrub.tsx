import { useRef, useState } from 'react'
import { gsap, reducedMotion, useGSAP } from '../motion'
import { payout, usd } from '../market'

const W = 720
const H = 340
const CLOSE_Y = 70
const PX_PER_PCT = 10
const FRI = 24 // Friday's close
const MON = 640 // Monday's open
const PRICE = 200

const yOf = (pct: number) => CLOSE_Y + pct * PX_PER_PCT

// Weekend token trading wanders, then drifts to the final open. Deterministic so it scrubs smoothly.
function weekendPath(drop: number) {
  let d = ''
  for (let i = 0; i <= 80; i++) {
    const t = i / 80
    const wobble = (Math.sin(t * 19) * 4 + Math.sin(t * 7.3 + 1) * 7) * Math.sin(Math.PI * t)
    d += `${i ? 'L' : 'M'}${(FRI + (MON - FRI) * t).toFixed(1)} ${(yOf(drop * t ** 1.6) + wobble).toFixed(1)}`
  }
  return d
}

const DEDUCTIBLES = [0.03, 0.05, 0.08]

export default function GapScrub() {
  const root = useRef<HTMLElement>(null)
  const [deductible, setDeductible] = useState(0.05)
  const dedRef = useRef(deductible)
  dedRef.current = deductible
  const refresh = useRef<() => void>(() => {})

  useGSAP(
    () => {
      const el = root.current!
      const q = <T extends Element>(c: string) => el.querySelector<T>(c)!
      const path = q<SVGPathElement>('.gs-line')
      const open = q<SVGGElement>('.gs-open')
      const price = q<SVGTextElement>('.gs-price')
      const zone = q<SVGRectElement>('.gs-zone')
      const zoneTop = q<SVGTextElement>('.gs-zone-top')
      const fill = q<SVGRectElement>('.gs-fill')
      const dropTxt = q('.gs-drop')
      const payTxt = q('.gs-pay')
      const state = { drop: reducedMotion() ? 9 : 0 }

      const render = () => {
        const d = state.drop
        const ded = dedRef.current
        const y = yOf(d)
        const top = yOf(ded * 100)
        const bottom = yOf(15)
        path.setAttribute('d', weekendPath(d))
        open.setAttribute('transform', `translate(${MON} ${y})`)
        price.setAttribute('y', String(y + 5))
        price.textContent = usd(PRICE * (1 - d / 100))
        zone.setAttribute('y', String(top))
        zone.setAttribute('height', String(bottom - top))
        zoneTop.setAttribute('y', String(top + 18))
        zoneTop.textContent = `Pays from −${Math.round(ded * 100)}%`
        fill.setAttribute('y', String(top))
        fill.setAttribute('height', String(Math.max(0, Math.min(y, bottom) - top)))
        const p = payout(1000, d / 100, ded, 0.15)
        dropTxt.textContent = d < 0.05 ? '0.0%' : `−${d.toFixed(1)}%`
        payTxt.textContent = usd(p)
        el.classList.toggle('is-paying', p > 0)
      }
      refresh.current = render
      render()
      if (reducedMotion()) return

      gsap.to(state, {
        drop: 22,
        ease: 'none',
        onUpdate: render,
        scrollTrigger: { trigger: el, start: 'top top', end: '+=160%', pin: true, scrub: 0.5 },
      })
    },
    { scope: root },
  )

  const pick = (d: number) => {
    setDeductible(d)
    dedRef.current = d
    refresh.current()
  }

  return (
    <section className="scrub" ref={root} id="payout">
      <div className="scrub-inner wrap">
        <div className="scrub-copy">
          <h2>
            Scroll The Weekend.
            <br />
            Watch It Pay.
          </h2>
          <p>$1,000 of NVDAc covered. Keep scrolling to push Monday's open lower.</p>
          <div className="scrub-ded" role="group" aria-label="Deductible">
            <span>Deductible</span>
            {DEDUCTIBLES.map((d) => (
              <button key={d} className={d === deductible ? 'is-on' : ''} onClick={() => pick(d)}>
                {d * 100}%
              </button>
            ))}
          </div>
        </div>

        <div className="gs-board">
          <div className="gs-read">
            <div>
              <span>Monday open</span>
              <b className="gs-drop mono">0.0%</b>
            </div>
            <div>
              <span>Payout</span>
              <b className="gs-pay mono">$0.00</b>
            </div>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="gs-chart" role="img" aria-label="Weekend price path and Monday open">
            <rect className="gs-zone" x={FRI} width={MON - FRI} y="0" height="0" />
            <rect className="gs-fill" x={MON - 4} width="8" y="0" height="0" rx="2" />
            <text className="gs-zone-top gs-label" x={FRI + 12} y="0">
              Pays from
            </text>
            <text className="gs-label" x={FRI + 12} y={yOf(15) - 10}>
              Cap at −15%
            </text>
            <line className="gs-oracle" x1={FRI} x2={MON} y1={CLOSE_Y} y2={CLOSE_Y} />
            <text className="gs-label gs-label-strong" x={FRI} y={CLOSE_Y - 14}>
              Oracle frozen at Friday's close, $200.00
            </text>
            <path className="gs-line" d={weekendPath(0)} />
            <text className="gs-price mono" x={MON - 16} y="0">
              $200.00
            </text>
            <g className="gs-open">
              <rect x="-7" y="-7" width="14" height="14" rx="3" />
            </g>
            <text className="gs-label" x={FRI} y={H - 8}>
              Fri 4:00pm
            </text>
            <text className="gs-label gs-end" x={MON} y={H - 8}>
              Mon 9:30am
            </text>
          </svg>
        </div>
      </div>
    </section>
  )
}
