'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavbarProps {
  tripName?: string
  tripMeta?: string
  members?: { initial: string; color: string }[]
  onAdd?: () => void
  inviteCode?: string
}

export function Navbar({ tripName, tripMeta, members, onAdd, inviteCode }: NavbarProps) {
  const pathname = usePathname()
  const isApp = !!tripName

  return (
    <header style={{
      height: '56px',
      background: 'rgba(8,14,26,0.97)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'stretch',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(12px)',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <Link href="/" style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '16px',
        fontWeight: 300,
        letterSpacing: '6px',
        textTransform: 'uppercase',
        color: 'var(--gold)',
        padding: '0 28px',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}>
        PackedUp
      </Link>

      {/* Trip info or nav links */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px' }}>
        {isApp ? (
          <>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>
              {tripName}
            </span>
            {tripMeta && (
              <>
                <span style={{ color: 'var(--border2)', fontSize: '10px' }}>·</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase' }}>
                  {tripMeta}
                </span>
              </>
            )}
          </>
        ) : (
          <nav style={{ display: 'flex', gap: '32px', listStyle: 'none' }}>
            {[
              { href: '#problem', label: 'Problem' },
              { href: '#how', label: 'Process' },
              { href: '#boards', label: 'Boards' },
            ].map(item => (
              <a key={item.href} href={item.href} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'stretch', borderLeft: '1px solid var(--border)' }}>
        {members && members.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', gap: '-6px', borderRight: '1px solid var(--border)' }}>
            {members.map((m, i) => (
              <div key={i} style={{
                width: '28px', height: '28px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
                border: '1.5px solid var(--bg)',
                marginLeft: i === 0 ? '0' : '-6px',
                background: m.color,
                color: 'white',
              }}>
                {m.initial}
              </div>
            ))}
          </div>
        )}
        {onAdd ? (
          <button onClick={onAdd} style={{
            height: '100%', padding: '0 24px',
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            letterSpacing: '3px', textTransform: 'uppercase',
            color: 'var(--bg)', background: 'var(--gold)',
            border: 'none', cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--gold)')}
          >
            + Add
          </button>
        ) : (
          <Link href="/create" style={{
            height: '100%', padding: '0 24px',
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            letterSpacing: '3px', textTransform: 'uppercase',
            color: 'var(--bg)', background: 'var(--gold)',
            display: 'flex', alignItems: 'center',
            textDecoration: 'none', whiteSpace: 'nowrap',
            transition: 'background 0.2s',
          }}>
            Begin →
          </Link>
        )}
      </div>
    </header>
  )
}
