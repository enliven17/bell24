import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { navigate } from '../router'
import { scrollToHash } from '../motion'

// In-app links: /paths go through the history router, #hashes glide with Lenis.
export default function Link({ href = '/', onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    if (href.startsWith('#')) {
      e.preventDefault()
      scrollToHash(href)
    } else if (href.startsWith('/')) {
      e.preventDefault()
      navigate(href)
    }
  }
  return <a href={href} onClick={go} {...rest} />
}
