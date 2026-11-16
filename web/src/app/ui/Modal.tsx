import { useEffect, useId, useRef, type ReactNode } from 'react'
import { lenis } from '../../motion'
import { IconClose } from './icons'

/**
 * Native <dialog>: focus trap, Escape and the top layer come from the browser.
 * Renders as a centred card on desktop and a bottom sheet on phones (see .modal in ui.css).
 */
export function Modal({
  open,
  onClose,
  title,
  sub,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  sub?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      lenis?.stop()
    } else if (!open && d.open) d.close()
    return () => {
      lenis?.start()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      className="ap-modal"
      aria-labelledby={`${id}-t`}
      data-lenis-prevent
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
        <div className="ap-modal-body">
          <header className="ap-modal-head">
            <div>
              <h2 id={`${id}-t`} className="ap-modal-title">
                {title}
              </h2>
              {sub && <p className="ap-modal-sub">{sub}</p>}
            </div>
            <button type="button" className="ap-icon-btn" aria-label="Close" onClick={onClose}>
              <IconClose size={18} />
            </button>
          </header>
          <div className="ap-modal-content">{children}</div>
          {footer && <footer className="ap-modal-foot">{footer}</footer>}
        </div>
      )}
    </dialog>
  )
}
