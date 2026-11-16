import type { ComponentType, SVGProps } from 'react'
import { IconAgent, IconHome, IconPulse, IconReceipt, IconShield, IconVault } from '../ui'

export type NavItem = {
  label: string
  short: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>
  group: 'Protect' | 'Earn' | 'Insight'
}

export const NAV: NavItem[] = [
  { label: 'Home', short: 'Home', href: '/app', icon: IconHome, group: 'Protect' },
  { label: 'Set up cover', short: 'Cover', href: '/app/cover', icon: IconShield, group: 'Protect' },
  { label: 'Live weekend', short: 'Live', href: '/app/live', icon: IconPulse, group: 'Protect' },
  { label: 'Vault', short: 'Vault', href: '/app/vault', icon: IconVault, group: 'Earn' },
  { label: 'Agent', short: 'Agent', href: '/app/agent', icon: IconAgent, group: 'Insight' },
  { label: 'Receipts', short: 'Receipts', href: '/app/receipt', icon: IconReceipt, group: 'Insight' },
]

export const normalize = (path: string) => path.replace(/\/$/, '') || '/app'

