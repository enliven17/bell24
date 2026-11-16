import type { RefObject } from 'react'
import { gsap, reducedMotion, useGSAP } from '../../motion'

/**
 * Draws a chart in from the left by scaling its clip rect. Runs once, when the chart first has a width.
 * Clipping (rather than stroke-dashoffset) works with areas, multiple paths and any stroke width.
 */
export function useReveal(clip: RefObject<SVGRectElement | null>, ready: boolean, duration = 1.3) {
  useGSAP(
    () => {
      const el = clip.current
      if (!ready || !el || reducedMotion()) return
      gsap.from(el, { scaleX: 0, transformOrigin: '0% 50%', duration, ease: 'expo.out', delay: 0.15 })
    },
    { dependencies: [ready] },
  )
}
