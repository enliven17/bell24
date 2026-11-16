import { Skeleton } from '../ui'

// Loading layouts that mirror each screen's real grid, shown while a screen's data "loads".
// ponytail: one small layout spec per screen instead of a skeleton per component.

type Block = 'stat' | 'chart' | 'list' | 'form' | 'card' | 'tile'
type Row = { cols: string; blocks: Block[] }

const LAYOUTS: Record<string, Row[]> = {
  '/app': [
    { cols: '1.6fr 1fr', blocks: ['chart', 'list'] },
    { cols: '1fr', blocks: ['list'] },
  ],
  '/app/cover': [
    { cols: 'repeat(4, 1fr)', blocks: ['tile', 'tile', 'tile', 'tile'] },
    { cols: '1.3fr 1fr', blocks: ['form', 'list'] },
  ],
  '/app/live': [
    { cols: '1fr 1fr 1fr', blocks: ['stat', 'stat', 'stat'] },
    { cols: '1fr 1fr', blocks: ['chart', 'chart'] },
  ],
  '/app/vault': [
    { cols: 'repeat(5, 1fr)', blocks: ['stat', 'stat', 'stat', 'stat', 'stat'] },
    { cols: '1.6fr 1fr', blocks: ['chart', 'form'] },
  ],
  '/app/agent': [
    { cols: '1.6fr 1fr', blocks: ['card', 'list'] },
    { cols: '1fr', blocks: ['list'] },
  ],
  '/app/receipt': [{ cols: '1.3fr 1fr', blocks: ['card', 'list'] }],
}

function SkelBlock({ kind }: { kind: Block }) {
  switch (kind) {
    case 'stat':
      return (
        <div className="ap-card ap-skel-card">
          <Skeleton w="45%" h={12} />
          <Skeleton w="70%" h={26} />
          <Skeleton w="55%" h={10} />
        </div>
      )
    case 'tile':
      return (
        <div className="ap-card ap-skel-card">
          <Skeleton w={40} h={40} />
          <Skeleton w="50%" h={16} />
          <Skeleton w="35%" h={12} />
          <Skeleton w="80%" h={10} />
        </div>
      )
    case 'chart':
      return (
        <div className="ap-card ap-skel-card">
          <Skeleton w="30%" h={12} />
          <Skeleton w="45%" h={34} />
          <Skeleton h={220} style={{ flex: 1 }} />
        </div>
      )
    case 'form':
      return (
        <div className="ap-card ap-skel-card">
          <Skeleton w="40%" h={22} />
          <Skeleton h={44} />
          <Skeleton h={8} />
          <Skeleton w="60%" h={36} />
          <Skeleton h={48} />
        </div>
      )
    case 'card':
      return (
        <div className="ap-card ap-skel-card">
          <Skeleton w="25%" h={12} />
          <Skeleton w="80%" h={38} />
          <Skeleton w="65%" h={38} />
          <Skeleton w="90%" h={12} />
          <Skeleton w="75%" h={12} />
          <Skeleton h={120} style={{ marginTop: 'auto' }} />
        </div>
      )
    default:
      return (
        <div className="ap-card ap-skel-card">
          <Skeleton w="35%" h={18} />
          {[0, 1, 2, 3].map((i) => (
            <div className="ap-skel-row" key={i}>
              <Skeleton w={36} h={36} />
              <Skeleton w="30%" h={12} />
              <Skeleton w="18%" h={12} style={{ marginLeft: 'auto' }} />
            </div>
          ))}
        </div>
      )
  }
}

export function ScreenSkeleton({ path }: { path: string }) {
  const rows = LAYOUTS[path] ?? LAYOUTS['/app']
  return (
    <div className="ap-skel-screen" aria-busy="true" aria-label="Loading">
      <div className="ap-skel-head">
        <Skeleton w={260} h={40} />
        <Skeleton w={380} h={14} />
      </div>
      {rows.map((r, i) => (
        <div className="ap-skel-grid" key={i} style={{ ['--cols' as string]: r.cols }}>
          {r.blocks.map((b, j) => (
            <SkelBlock kind={b} key={j} />
          ))}
        </div>
      ))}
    </div>
  )
}
