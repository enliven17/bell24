import { useRef, useState } from 'react'
import { gsap, reducedMotion, useGSAP } from '../motion'
import { payout, usd } from '../market'

const W = 720
const H = 380
const CLOSE_Y = 110
const PX_PER_PCT = 9
const FRI = 70 // x where Friday closes
const MON = 610 // x where Monday opens

// Weekend token trading wanders, then drifts to the final open. Deterministic so it scrubs smoothly.
function weekendPath(drop: number) {
  const pts: string[] = []
  for (let i = 0; i <= 60; i++) {
    const t = i / 60
    const x = FRI + (MON - FRI) * t
    const wobble = Math.sin(t * 19) * 6 + Math.sin(t * 7.3 + 1) * 9
    const y = CLOSE_Y + drop * PX_PER_PCT * t ** 1.6 + wobble * Math.sin(Math.PI * t)
    pts.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return pts.join(' ')
}

const DEDUCTIBLES = [0.03, 0.05, 0.08]

export default function GapScrub() {
  const root = useRef<HTMLElement>(null)
  const [deductible, setDeductible] = useState(0.05)
  const ded = useRef(deductible)
  ded.current = deductible
  const refresh = useRef<() => void>(() => {})

  useGSAP(
    () => {
      const el = root.current!
      const path = el.querySelector<SVGPathElement>('.scrub-weekend')!
      const open = el.querySelector<SVGGElement>('.scrub-open')!
      const band = el.querySelector<SVGRectElement>('.scrub-band')!
      const dropTxt = el.querySelector('.scrub-drop')!
      const payTxt = el.querySelector('.scrub-pay')!
      const meter = el.querySelector<HTMLElement>('.scrub-meter-fill')!
      const state = { drop: reducedMotion() ? 9 : 0 }

      const render = () => {
        const d = state.drop
        const y = CLOSE_Y + d * PX_PER_PCT
        path.setAttribute('d', weekendPath(d))
        open.setAttribute('transform', `translate(${MON} ${y})`)
        const dy = CLOSE_Y + ded.current * 100 * PX_PER_PCT
        band.setAttribute('y', String(dy))
        band.setAttribute('height', String(Math.max(0, Math.min(y, CLOSE_Y + 15 * PX_PER_PCT) - dy)))
        const p = payout(1000, d / 100, ded.current, 0.15)
        dropTxt.textContent = d < 0.05 ? '0.0%' : `−${d.toFixed(1)}%`
        payTxt.textContent = usd(p)
        meter.style.transform = `scaleX(${p / (1000 * (0.15 - ded.current))})`
        el.classList.toggle('is-paying', p > 0)
      }
      refresh.current = render
      render()
      if (reducedMotion()) return

      gsap.to(state, {
        drop: 25,
        ease: 'none',
        onUpdate: render,
        scrollTrigger: { trigger: el, start: 'top top', end: '+=180%', pin: true, scrub: 0.5 },
      })
    },
    { scope: root },
  )

  const pick = (d: number) => {
    setDeductible(d)
    ded.current = d
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
          <p>
            $1,000 of NVDAc covered, 15% limit. The oracle freezes at Friday's close while the token keeps trading. Keep
            scrolling to push Monday's open lower.
          </p>
          <div className="scrub-ded" role="group" aria-label="Deductible">
            <span>Deductible</span>
            {DEDUCTIBLES.map((d) => (
              <button key={d} className={d === deductible ? 'is-on' : ''} onClick={() => pick(d)}>
                {d * 100}%
              </button>
            ))}
          </div>
        </div>

        <div className="scrub-board">
          <svg viewBox={`0 0 ${W} ${H}`} className="scrub-chart" role="img" aria-label="Weekend price path and Monday open">
            {Array.from({ length: 7 }, (_, i) => (
              <line key={i} x1="0" x2={W} y1={40 + i * 50} y2={40 + i * 50} className="grid" />
            ))}
            <rect className="scrub-closed" x={FRI} y="0" width={MON - FRI} height={H} />
            <text x={FRI + 12} y="26" className="axis">
              Market closed
            </text>
            <rect className="scrub-band" x={MON - 6} width="12" y="0" height="0" />
            <path d={`M0 ${CLOSE_Y + 14} L${FRI / 2} ${CLOSE_Y - 8} L${FRI} ${CLOSE_Y}`} className="scrub-friday" />
            <line x1={FRI} x2={MON} y1={CLOSE_Y} y2={CLOSE_Y} className="scrub-oracle" />
            <text x={MON - 8} y={CLOSE_Y - 10} className="axis end">
              Oracle frozen at $200.00
            </text>
            <path className="scrub-weekend" d={weekendPath(0)} />
            <g className="scrub-open">
              <rect x="-9" y="-9" width="18" height="18" rx="3" />
            </g>
            <text x={FRI} y={H - 14} className="axis mid">
              Fri 4:00pm
            </text>
            <text x={MON} y={H - 14} className="axis mid">
              Mon 9:30am
            </text>
          </svg>

          <div className="scrub-read">
            <div>
              <span className="label">Monday open</span>
              <b className="scrub-drop mono">0.0%</b>
            </div>
            <div>
              <span className="label">Payout</span>
              <b className="scrub-pay mono">$0.00</b>
            </div>
            <div className="scrub-meter" aria-hidden="true">
              <span className="scrub-meter-fill" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
