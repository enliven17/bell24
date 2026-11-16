import { useRef, useState } from 'react'
import { gsap, lenis, reducedMotion, useGSAP } from '../motion'
import { Mark } from './Logo'

// Resolves when the splash has opened, so the hero can start its own intro right behind it.
let resolveDone: () => void
export const splashDone = new Promise<void>((r) => (resolveDone = r))

const seen = () => {
  try {
    return sessionStorage.getItem('bell24-splash') === '1'
  } catch {
    return false
  }
}

// Opening screen: the bell rings, the name rises, then the screen splits open along the gap.
export default function Splash() {
  const root = useRef<HTMLDivElement>(null)
  const [skip] = useState(() => seen() || reducedMotion())
  const [gone, setGone] = useState(skip)

  useGSAP(
    (_, contextSafe) => {
      if (skip) {
        resolveDone()
        return
      }
      document.documentElement.classList.add('is-splash')
      // Lenis starts in App's effect, which runs after this one; stop it on the next frame.
      requestAnimationFrame(() => lenis?.stop())
      const finish = contextSafe!(() => {
        try {
          sessionStorage.setItem('bell24-splash', '1')
        } catch {
          /* private mode: show it again next time */
        }
        document.documentElement.classList.remove('is-splash')
        lenis?.start()
        setGone(true)
      })
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: finish })
      tl.from('.splash-mark', { scale: 0.6, autoAlpha: 0, duration: 0.8 })
        .to('.splash-bell', { rotate: 16, duration: 0.14, ease: 'sine.inOut', yoyo: true, repeat: 5, transformOrigin: '50% 8%' }, 0.3)
        .to('.splash-bell', { rotate: 0, duration: 0.3, ease: 'elastic.out(1, 0.4)' })
        .from('.splash-word span', { yPercent: 110, duration: 0.9, stagger: 0.04 }, 0.45)
        .from('.splash-line', { autoAlpha: 0, y: 10, duration: 0.6 }, 0.8)
        .to('.splash-content', { autoAlpha: 0, scale: 0.96, duration: 0.4, ease: 'power2.in' }, '+=0.15')
        .add(() => resolveDone(), '-=0.1')
        .to('.splash-top', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '<')
        .to('.splash-bottom', { yPercent: 100, duration: 1, ease: 'expo.inOut' }, '<')
      return () => {
        document.documentElement.classList.remove('is-splash')
        lenis?.start()
      }
    },
    { scope: root },
  )

  if (gone) return null
  return (
    <div className="splash" ref={root} aria-hidden="true">
      <div className="splash-top" />
      <div className="splash-bottom" />
      <div className="splash-content">
        <div className="splash-mark">
          <span className="splash-bell">
            <Mark size={112} tone="paper" />
          </span>
        </div>
        <div className="splash-word">
          {'bell24'.split('').map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
        <div className="splash-line">Cover past the closing bell</div>
      </div>
    </div>
  )
}
