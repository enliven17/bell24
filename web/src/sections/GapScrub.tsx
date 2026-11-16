import { useRef, useState } from 'react'
import { gsap, reducedMotion, useGSAP } from '../motion'
import { payout, usd } from '../market'

const W = 760
const H = 420
const LEFT = 58 // y-axis gutter
const CLOSE_Y = 92
const PX_PER_PCT = 10
const FRI = 120 // x where Friday closes
const MON = 640 // x where Monday opens
const BASE_Y = 372 // x-axis
const PRICE = 200

const yOf = (pct: number) => CLOSE_Y + pct * PX_PER_PCT
// Midnights inside the 65.5h closure, as fractions of it: Sat 0:00, Sun 0:00, Mon 0:00.
const DAYS = [
  ['Sat', 8 / 65.5],
  ['Sun', 32 / 65.5],
  ['Mon', 56 / 65.5],
] as const

// Weekend token trading wanders, then drifts to the final open. Deterministic so it scrubs smoothly.
function weekendPoints(drop: number) {
  const pts: [number, number][] = []
  for (let i = 0; i <= 80; i++) {
    const t = i / 80
    const wobble = Math.sin(t * 19) * 5 + Math.sin(t * 7.3 + 1) * 8
    pts.push([FRI + (MON - FRI) * t, yOf(drop * t ** 1.6) + wobble * Math.sin(Math.PI * t)])
  }
  return pts
}
const line = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
const weekendPath = (drop: number) => line(weekendPoints(drop))
const areaPath = (drop: number) => `${weekendPath(drop)} L${MON} ${BASE_Y} L${FRI} ${BASE_Y} Z`

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
      const path = q<SVGPathElement>('.scrub-weekend')
      const area = q<SVGPathElement>('.scrub-area')
      const open = q<SVGGElement>('.scrub-open')
      const band = q<SVGRectElement>('.scrub-band')
      const zone = q<SVGRectElement>('.scrub-zone')
      const dedLine = q<SVGLineElement>('.scrub-ded-line')
      const dedTxt = q<SVGTextElement>('.scrub-ded-txt')
      const bracket = q<SVGPathElement>('.scrub-bracket')
      const gapTxt = q<SVGTextElement>('.scrub-gap-txt')
      const priceTxt = q<SVGTextElement>('.scrub-price')
      const dropTxt = q('.scrub-drop')
      const payTxt = q('.scrub-pay')
      const meter = q<HTMLElement>('.scrub-meter-fill')
      const state = { drop: reducedMotion() ? 9 : 0 }

      const render = () => {
        const d = state.drop
        const ded = dedRef.current
        const y = yOf(d)
        const dy = yOf(ded * 100)
        path.setAttribute('d', weekendPath(d))
        area.setAttribute('d', areaPath(d))
        open.setAttribute('transform', `translate(${MON} ${y})`)
        zone.setAttribute('y', String(dy))
        zone.setAttribute('height', String(yOf(15) - dy))
        dedLine.setAttribute('y1', String(dy))
        dedLine.setAttribute('y2', String(dy))
        dedTxt.setAttribute('y', String(dy - 8))
        dedTxt.textContent = `Deductible ${Math.round(ded * 100)}%`
        band.setAttribute('y', String(dy))
        band.setAttribute('height', String(Math.max(0, Math.min(y, yOf(15)) - dy)))
        bracket.setAttribute('d', `M${MON + 18} ${CLOSE_Y} h6 V${y} h-6`)
        gapTxt.setAttribute('y', String((CLOSE_Y + y) / 2 + 5))
        gapTxt.textContent = `−${d.toFixed(1)}%`
        gapTxt.style.opacity = d > 1.5 ? '1' : '0'
        bracket.style.opacity = d > 1.5 ? '1' : '0'
        priceTxt.setAttribute('y', String(y + 4))
        priceTxt.textContent = usd(PRICE * (1 - d / 100))
        const p = payout(1000, d / 100, ded, 0.15)
        dropTxt.textContent = d < 0.05 ? '0.0%' : `−${d.toFixed(1)}%`
        payTxt.textContent = usd(p)
        meter.style.transform = `scaleX(${p / (1000 * (0.15 - ded))})`
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
            <defs>
              <linearGradient id="scrub-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#2B4BFF" stopOpacity="0.5" />
                <stop offset="1" stopColor="#2B4BFF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect className="scrub-closed" x={FRI} y="0" width={MON - FRI} height={BASE_Y} />
            {[0, 5, 10, 15, 20, 25].map((p) => (
              <g key={p}>
                <line x1={LEFT} x2={W - 8} y1={yOf(p)} y2={yOf(p)} className="grid" />
                <text x={LEFT - 10} y={yOf(p) + 4} className="axis end">
                  ${PRICE * (1 - p / 100)}
                </text>
              </g>
            ))}
            {DAYS.map(([d, f]) => {
              const x = FRI + (MON - FRI) * f
              return (
                <g key={d}>
                  <line x1={x} x2={x} y1="36" y2={BASE_Y} className="scrub-day" />
                  <text x={x} y="26" className="axis mid">
                    {d}
                  </text>
                </g>
              )
            })}
            <text x={FRI + 10} y={BASE_Y - 12} className="axis strong">
              Market closed
            </text>
            <rect className="scrub-zone" x={FRI} width={MON - FRI} y="0" height="0" />
            <line className="scrub-ded-line" x1={FRI} x2={MON} y1="0" y2="0" />
            <line className="scrub-limit-line" x1={FRI} x2={MON} y1={yOf(15)} y2={yOf(15)} />
            <text className="axis zone-txt scrub-ded-txt" x={FRI + 10} y="0">
              Deductible
            </text>
            <text className="axis zone-txt" x={FRI + 10} y={yOf(15) + 18}>
              Limit 15%
            </text>
            <path className="scrub-area" d={areaPath(0)} fill="url(#scrub-fill)" />
            <path
              d={`M${LEFT} ${CLOSE_Y + 22} L${LEFT + 22} ${CLOSE_Y + 6} L${LEFT + 40} ${CLOSE_Y + 16} L${FRI} ${CLOSE_Y}`}
              className="scrub-friday"
            />
            <line x1={FRI} x2={MON} y1={CLOSE_Y} y2={CLOSE_Y} className="scrub-oracle" />
            <text x={MON - 8} y={CLOSE_Y - 10} className="axis end">
              Oracle frozen at $200.00
            </text>
            <rect className="scrub-band" x={MON - 5} width="10" y="0" height="0" />
            <path className="scrub-weekend" d={weekendPath(0)} />
            <path className="scrub-bracket" d="" />
            <text className="scrub-gap-txt" x={MON + 32} y="0">
              0%
            </text>
            <text className="scrub-price" x={MON - 16} y="0">
              $200.00
            </text>
            <g className="scrub-open">
              <rect x="-8" y="-8" width="16" height="16" rx="3" />
            </g>
            <line x1={LEFT} x2={W - 8} y1={BASE_Y} y2={BASE_Y} className="scrub-base" />
            <text x={FRI} y={H - 20} className="axis mid">
              Fri 4:00pm
            </text>
            <text x={MON} y={H - 20} className="axis mid">
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
