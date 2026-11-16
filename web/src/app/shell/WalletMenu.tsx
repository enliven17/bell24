import { useEffect, useId, useRef, useState } from 'react'
import { BaseMark } from '../../components/Logo'
import { STOCKS, usd } from '../../market'
import { shortAddr, useApp } from '../state'
import { IconChevron, CopyButton, IconExit, IconWallet, useToast } from '../ui'

/** 5×5 mirrored square identicon from the address: the halftone language at avatar size. */
export function Identicon({ address, size = 28 }: { address: string; size?: number }) {
  const hex = address.slice(2)
  const cells: Array<{ x: number; y: number; c: string }> = []
  for (let y = 0; y < 5; y++)
    for (let x = 0; x < 3; x++) {
      const v = parseInt(hex[(y * 3 + x) % hex.length], 16)
      if (v < 6) continue
      const c = v > 12 ? 'var(--orange)' : 'var(--paper)'
      cells.push({ x, y, c })
      if (x < 2) cells.push({ x: 4 - x, y, c })
    }
  return (
    <svg width={size} height={size} viewBox="0 0 7 7" className="ap-identicon" aria-hidden="true">
      <rect width="7" height="7" rx="1.4" fill="var(--blue)" />
      {cells.map((c, i) => (
        <rect key={i} x={c.x + 1} y={c.y + 1} width="1" height="1" fill={c.c} />
      ))}
    </svg>
  )
}

export function WalletMenu() {
  const { state, dispatch, connect } = useApp()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const down = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false)
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      btn.current?.focus()
    }
    document.addEventListener('pointerdown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('keydown', key)
    }
  }, [open])

  if (!state.wallet)
    return (
      <button type="button" className="ap-ui-btn ap-ui-btn-ink ap-wallet-btn" onClick={connect} disabled={state.connecting} aria-busy={state.connecting}>
        {state.connecting ? <span className="ap-spinner" aria-hidden="true" /> : <IconWallet size={18} />}
        <span className="ap-wallet-label">{state.connecting ? 'Connecting' : 'Connect wallet'}</span>
      </button>
    )

  const held = STOCKS.reduce((n, s) => n + s.held, 0)
  const addr = state.wallet

  return (
    <div className="ap-wallet" ref={wrap}>
      <button
        ref={btn}
        type="button"
        className="ap-ui-btn ap-ui-btn-paper ap-wallet-btn"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <Identicon address={addr} size={24} />
        <span className="ap-wallet-label mono">{shortAddr(addr)}</span>
        <IconChevron size={16} className={open ? 'ap-flip' : undefined} />
      </button>
      {open && (
        <div className="ap-wallet-menu" id={id}>
          <div className="ap-wallet-head">
            <Identicon address={addr} size={44} />
            <div>
              <b className="mono">{shortAddr(addr)}</b>
              <span className="ap-wallet-net">
                <BaseMark size={14} /> Base mainnet
              </span>
            </div>
          </div>
          <dl className="ap-wallet-rows">
            <div>
              <dt>USDC</dt>
              <dd className="mono">{usd(state.usdc)}</dd>
            </div>
            <div>
              <dt>Stock tokens</dt>
              <dd className="mono">{usd(held)}</dd>
            </div>
            <div>
              <dt>Active cover</dt>
              <dd className="mono">{Object.keys(state.policies).length} positions</dd>
            </div>
            <div>
              <dt>In the vault</dt>
              <dd className="mono">{usd(state.deposit)}</dd>
            </div>
          </dl>
          <div className="ap-wallet-actions">
            <CopyButton
              text={addr}
              className="ap-ui-btn ap-ui-btn-line ap-ui-btn-sm"
              onCopied={(ok) => !ok && toast({ title: 'Could not copy', body: 'Your browser blocked clipboard access.', tone: 'orange' })}
            >
              Copy address
            </CopyButton>
            <button
              type="button"
              className="ap-ui-btn ap-ui-btn-line ap-ui-btn-sm"
              onClick={() => {
                setOpen(false)
                dispatch({ type: 'disconnect' })
                toast({ title: 'Wallet disconnected', body: 'Showing the demo wallet.' })
              }}
            >
              <IconExit size={16} /> Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
