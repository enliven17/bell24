import Link from '../../components/Link'
import { BuiltOnBase, Logo } from '../../components/Logo'
import { weekendWindow } from '../../market'
import { RISK_NOTE } from '../data'
import { useApp } from '../state'
import { cn, Tag } from '../ui'
import { NAV, normalize } from './nav'

const GROUPS = ['Protect', 'Earn', 'Insight'] as const

/** Desktop navigation: full labels from 1100px, an icon rail between 768 and 1100px. */
export function Sidebar({ path }: { path: string }) {
  const { state } = useApp()
  const here = normalize(path)
  const win = weekendWindow()
  const active = Object.keys(state.policies).length

  return (
    <aside className="ap-side" aria-label="App navigation">
      <Link href="/" className="ap-side-logo" aria-label="bell24, back to the landing page">
        <Logo size={26} />
      </Link>
      <nav className="ap-side-nav">
        {GROUPS.map((g) => (
          <div key={g} className="ap-side-group">
            <span className="ap-side-group-label">{g}</span>
            {NAV.filter((n) => n.group === g).map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn('ap-side-link', here === n.href && 'ap-is-on')}
                aria-current={here === n.href ? 'page' : undefined}
                title={n.label}
              >
                <n.icon size={20} />
                <span className="ap-side-text">{n.label}</span>
                {n.href === '/app/live' && active > 0 && <span className="ap-side-count mono">{active}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="ap-side-foot">
        <div className="ap-side-closure">
          <span className="ap-side-group-label">{win.active ? 'Closure under way' : 'Next closure'}</span>
          <b>
            {win.from}, 4:00pm
            <br />
            to {win.to}, 9:30am ET
          </b>
          <div className="ap-side-closure-row">
            <span>Agent risk</span>
            <Tag tone="orange">{RISK_NOTE.level}</Tag>
          </div>
        </div>
        <BuiltOnBase />
      </div>
    </aside>
  )
}

/** Phone navigation: fixed bottom bar with icon and short label. */
export function TabBar({ path }: { path: string }) {
  const here = normalize(path)
  return (
    <nav className="ap-tabbar" aria-label="App navigation">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className={cn('ap-tabbar-link', here === n.href && 'ap-is-on')}
          aria-current={here === n.href ? 'page' : undefined}
        >
          <n.icon size={21} />
          <span>{n.short}</span>
        </Link>
      ))}
    </nav>
  )
}
