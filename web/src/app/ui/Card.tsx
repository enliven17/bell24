import type { ReactNode } from 'react'
import { cn } from './util'

type Tone = 'paper' | 'ink' | 'blue' | 'orange' | 'inset'

/** The base surface. A header row renders when a title, kicker or action is given. */
export function Card({
  title,
  kicker,
  action,
  tone = 'paper',
  className,
  children,
  as: Tag = 'section',
  labelledBy,
}: {
  title?: ReactNode
  kicker?: ReactNode
  action?: ReactNode
  tone?: Tone
  className?: string
  children?: ReactNode
  as?: 'section' | 'article' | 'div' | 'aside'
  labelledBy?: string
}) {
  const head = title || kicker || action
  return (
    <Tag className={cn('ap-card', `ap-card-${tone}`, className)} aria-labelledby={labelledBy}>
      {head && (
        <header className="ap-card-head">
          <div className="ap-card-titles">
            {kicker && <span className="ap-card-kicker">{kicker}</span>}
            {title && (
              <h2 className="ap-card-title" id={labelledBy}>
                {title}
              </h2>
            )}
          </div>
          {action && <div className="ap-card-action">{action}</div>}
        </header>
      )}
      {children}
    </Tag>
  )
}

/** Screen title row: display heading, one line of context, optional actions. */
export function PageHeader({ title, sub, actions }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="ap-page-head">
      <div>
        <h1 className="ap-page-title">{title}</h1>
        {sub && <p className="ap-page-sub">{sub}</p>}
      </div>
      {actions && <div className="ap-page-actions">{actions}</div>}
    </header>
  )
}
