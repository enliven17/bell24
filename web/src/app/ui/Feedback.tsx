import type { CSSProperties, ReactNode } from 'react'
import { cn } from './util'

export function Empty({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: ReactNode
  title: ReactNode
  body?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('ap-empty', className)}>
      {icon && <span className="ap-empty-icon">{icon}</span>}
      <h3 className="ap-empty-title">{title}</h3>
      {body && <p className="ap-empty-body">{body}</p>}
      {action}
    </div>
  )
}

/** Shimmer block while something loads. Hidden from assistive tech: pair it with a status message. */
export function Skeleton({ w = '100%', h = 14, className, style }: { w?: number | string; h?: number | string; className?: string; style?: CSSProperties }) {
  return <span className={cn('ap-skel', className)} style={{ width: w, height: h, ...style }} aria-hidden="true" />
}
