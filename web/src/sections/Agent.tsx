import { useRef } from 'react'
import { gsap, reducedMotion, useGSAP } from '../motion'

const NOTES = [
  { kind: 'Friday risk note', date: 'Nov 20', title: 'Premiums 2.4× normal this weekend', body: 'Fed speech on Saturday, NVDA earnings Tuesday. Weekend perps already lean short.', tone: 'blue', stat: '2.4×', img: 'risk-note' },
  { kind: 'Monday scorecard', date: 'Nov 23', title: 'NVDA opened −9.1%. 212 policies paid.', body: '$8,480 paid out from the pool. Priced risk ranked NVDA first of four.', tone: 'orange', stat: '$8.5K', img: 'scorecard' },
  { kind: 'Holiday note', date: 'Nov 25', title: 'Thanksgiving: one closure, 89 hours', body: 'Closed Thursday, half day Friday. Cover priced as one long window.', tone: 'ink', stat: '89h', img: 'holiday' },
  { kind: 'Earnings night', date: 'Nov 17', title: 'NVDA after close, cover sold out at cap', body: 'The pool hit its per-closure exposure cap 40 minutes before the bell.', tone: 'blue', stat: 'Cap', img: 'earnings' },
  { kind: 'Monday scorecard', date: 'Nov 30', title: 'Calm open. Underwriters kept 100%.', body: 'Largest gap −1.8% on METAc, inside every deductible.', tone: 'orange', stat: '0 paid', img: 'calm' },
]

export default function Agent() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      const track = root.current!.querySelector<HTMLElement>('.notes-track')!
      // Vertical scroll drives the notes sideways while the section is pinned.
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px)', () => {
        gsap.to(track, {
          x: () => -(track.scrollWidth - track.clientWidth),
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${track.scrollWidth - track.clientWidth}`, pin: true, scrub: 0.6, invalidateOnRefresh: true },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section className="agent" ref={root} id="agent">
      <div className="agent-head wrap">
        <h2>The Agent Prices Every Closure.</h2>
        <p>
          Before each bell it scores earnings, Fed dates, past gaps, weekend perps and prediction markets, then sets the
          premium. Its quotes are only quotes: the contracts enforce pool limits whatever it says.
        </p>
      </div>
      <div className="notes">
        <div className="notes-track">
          {NOTES.map((n) => (
            <article className={`note note-${n.tone}`} key={n.title}>
              <div className="note-art">
                <img src={`/agent/${n.img}.webp`} alt="" loading="lazy" width="768" height="512" onLoad={(e) => e.currentTarget.classList.add('is-loaded')} />
                <span className="note-stat">{n.stat}</span>
              </div>
              <div className="note-body">
                <span className="note-kind">{n.kind}</span>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
                <time>{n.date}, 2026</time>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
