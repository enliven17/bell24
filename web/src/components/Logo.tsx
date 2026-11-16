// The bell24 mark: a market bell split in two. The opening between dome and lip is the gap the product covers.
export function Mark({ size = 32, tone = 'ink' }: { size?: number; tone?: 'ink' | 'paper' }) {
  const body = tone === 'ink' ? 'var(--ink)' : 'var(--paper)'
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="29" y="6" width="6" height="6" rx="1" fill={body} />
      <path d="M13 37V30a19 19 0 0 1 38 0v7z" fill={body} />
      <rect x="7" y="42" width="50" height="7" rx="2" fill="var(--blue)" />
      <rect x="26" y="53" width="12" height="6" rx="1.5" fill="var(--orange)" />
    </svg>
  )
}

export function Logo({ tone = 'ink', size = 28 }: { tone?: 'ink' | 'paper'; size?: number }) {
  return (
    <span className={`logo logo-${tone}`} style={{ fontSize: size * 0.82 }}>
      <Mark size={size} tone={tone} />
      <span className="logo-word">bell24</span>
    </span>
  )
}

// Base's mark: the blue square.
export function BaseMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="#0000FF" />
    </svg>
  )
}

export function BuiltOnBase({ tone = 'ink' }: { tone?: 'ink' | 'paper' }) {
  return (
    <span className={`onbase onbase-${tone}`}>
      <BaseMark />
      <span>
        Built on <b>Base</b>
      </span>
    </span>
  )
}
