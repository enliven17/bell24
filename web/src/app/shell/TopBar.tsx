import Link from '../../components/Link'
import { useMarketClock } from '../../components/Countdown'
import { Mark } from '../../components/Logo'
import { hms, weekendWindow } from '../../market'
import { IconClock, Tag } from '../ui'
import { WalletMenu } from './WalletMenu'

const two = (n: number) => String(n).padStart(2, '0')

/** Market open or closed, and how long until that flips. Sales follow the market. */
export function MarketStatus() {
  const { open, secs } = useMarketClock()
  const { h, m, s } = hms(secs)
  return (
    <div className="ap-mkt" aria-live="off">
      <Tag tone={open ? 'blue' : 'ink'}>{open ? 'Market open' : 'Market closed'}</Tag>
      <span className="ap-mkt-text">
        <span className="ap-mkt-label">{open ? 'Sales close in' : 'Opens in'}</span>
        <b className="mono ap-mkt-time" role="timer" aria-label={`${h} hours ${m} minutes`}>
          {h}:{two(m)}:{two(s)}
        </b>
      </span>
    </div>
  )
}

export function TopBar() {
  const win = weekendWindow()
  return (
    <header className="ap-top">
      <Link href="/app" className="ap-top-mark" aria-label="bell24 home">
        <Mark size={28} />
      </Link>
      <MarketStatus />
      <div className="ap-top-window">
        <IconClock size={18} />
        <span>
          <span className="ap-mkt-label">{win.active ? 'This closure' : 'Next closure'}</span>
          <b>
            {win.from} 4:00pm to {win.to} 9:30am ET
          </b>
        </span>
      </div>
      <div className="ap-top-end">
        <WalletMenu />
      </div>
    </header>
  )
}
