import type { SVGProps } from 'react'

// Hand-drawn 24px icon set, stroke based so it inherits currentColor. Squared joins match the brand.
type P = SVGProps<SVGSVGElement> & { size?: number }

const base = ({ size = 20, ...rest }: P) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const,
  'aria-hidden': true,
  ...rest,
})

export const IconHome = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z" />
  </svg>
)
export const IconShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5 19 6v6c0 4.2-3 7.3-7 8.5-4-1.2-7-4.3-7-8.5V6z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </svg>
)
export const IconPulse = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 12h4l2.5-6 4 12 2.5-6H21" />
  </svg>
)
export const IconVault = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <rect x="8.5" y="9" width="7" height="6" rx="1" />
    <path d="M6.5 19.5v1.5M17.5 19.5v1.5" />
  </svg>
)
export const IconReceipt = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2z" />
    <path d="M9 8.5h6M9 12h6" />
  </svg>
)
export const IconAgent = (p: P) => (
  <svg {...base(p)}>
    <rect x="4.5" y="7" width="15" height="12" rx="2" />
    <path d="M12 3.5V7M9 12v1.5M15 12v1.5M2.5 12v3M21.5 12v3" />
  </svg>
)
export const IconWallet = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6.5h14.5v13H4z" />
    <path d="M4 6.5 15 3.5v3M14 12.5h6.5v3H14z" />
  </svg>
)
export const IconChevron = (p: P) => (
  <svg {...base(p)}>
    <path d="m7 10 5 5 5-5" />
  </svg>
)
export const IconArrow = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h13M13 7l5 5-5 5" />
  </svg>
)
export const IconCopy = (p: P) => (
  <svg {...base(p)}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="1.5" />
    <path d="M15.5 5.5v-1h-11v11h1" />
  </svg>
)
export const IconExit = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 4.5H5v15h9M10 12h10M17 8.5l3.5 3.5-3.5 3.5" />
  </svg>
)
export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M12 7.5V12l3 2" />
  </svg>
)
export const IconClose = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
)
export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)
export const IconBell = (p: P) => (
  <svg {...base(p)}>
    <path d="M5.5 16v-4a6.5 6.5 0 0 1 13 0v4zM3.5 19h17M12 3v2.5" />
  </svg>
)
export const IconLock = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
    <path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" />
  </svg>
)
export const IconShare = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 15V3.5M7.5 8 12 3.5 16.5 8M5 12.5v8h14v-8" />
  </svg>
)
export const IconLink = (p: P) => (
  <svg {...base(p)}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3.3-3.3a4 4 0 0 0-5.7-5.7L12 6.3M14 10a4 4 0 0 0-5.7 0L5 13.3a4 4 0 0 0 5.7 5.7l1.3-1.3" />
  </svg>
)
export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
export const IconInfo = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M12 11v5.5M12 7.5v.5" />
  </svg>
)
export const IconRefresh = (p: P) => (
  <svg {...base(p)}>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4.5H15" />
  </svg>
)
export const IconSpark = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M7 7l2 2M15 15l2 2M17 7l-2 2M9 15l-2 2" />
  </svg>
)
