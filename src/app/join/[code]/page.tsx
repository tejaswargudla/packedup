'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { tripsApi, membersApi } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { formatDateRange } from '@/lib/utils'

export default function JoinPage({ params }: { params: { code: string } }) {
  const router = useRouter()
  const setGuestSession = useAppStore(s => s.setGuestSession)
  const code = params.code.toUpperCase()

  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const { data, isLoading: tripLoading, isError } = useQuery({
    queryKey: ['trip-by-code', code],
    queryFn:  () => tripsApi.getByCode(code),
    retry: false,
  })

  const trip = data?.trip

  async function handleJoin() {
    if (!name.trim()) { setError('Please enter your name'); return }
    setLoading(true); setError('')
    try {
      const { member, trip: joined, session_token } = await membersApi.join({
        invite_code:  code,
        display_name: name.trim(),
      })
      if (session_token) {
        setGuestSession({
          member_id:    member.id,
          trip_id:      joined.id,
          display_name: member.display_name,
          session_token,
        })
      }
      router.push(`/trip/${joined.id}`)
    } catch (e: any) {
      setError(e.message || 'Failed to join trip')
      setLoading(false)
    }
  }

  // ── Loading state ───────────────────────────────────────────
  if (tripLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Looking up trip…
          </div>
        </div>
      </div>
    )
  }

  // ── Invalid code ────────────────────────────────────────────
  if (isError || !trip) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>✗</div>
          <h1 style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '-0.5px', marginBottom: '10px' }}>Invalid invite code</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '32px' }}>
            Code <span style={{ color: 'var(--gold)' }}>{code}</span> was not found
          </p>
          <button onClick={() => router.push('/')} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', padding: '12px 28px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer' }}>
            ← Back to home
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Join form ───────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* TOPBAR */}
      <header style={{ height: '56px', background: 'rgba(8,14,26,0.97)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 28px', position: 'sticky', top: 0, zIndex: 50 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 300, letterSpacing: '6px', textTransform: 'uppercase', color: 'var(--gold)' }}>
          PackedUp
        </span>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '0' }}
        >
          {/* TRIP CARD */}
          <div style={{ border: '1px solid var(--border)', background: 'var(--surface)', marginBottom: '2px' }}>

            {/* invite pill */}
            <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)' }}>Invite code</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '4px', color: 'var(--gold)', fontWeight: 500 }}>{code}</span>
            </div>

            {/* trip info */}
            <div style={{ padding: '28px 24px 24px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '20px', height: '1px', background: 'var(--gold)', display: 'inline-block' }} />
                You&apos;re invited
              </div>
              <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 300, lineHeight: 0.95, letterSpacing: '-1px', marginBottom: '12px' }}>
                {trip.name}
              </h1>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase' }}>
                  📍 {trip.destination}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase' }}>
                  🗓 {formatDateRange(trip.start_date, trip.end_date)}
                </span>
              </div>
            </div>
          </div>

          {/* NAME FORM */}
          <div style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '16px' }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)' }}>
                Your name
              </label>
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="So the group knows who you are"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '12px 14px', fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', fontWeight: 300, color: 'var(--white)', outline: 'none', width: '100%', transition: 'border-color 0.2s' }}
                onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {error && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#c47a7a', letterSpacing: '1px', marginBottom: '14px' }}>
                {error}
              </p>
            )}

            <button
              onClick={handleJoin}
              disabled={loading || !name.trim()}
              style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', padding: '15px', background: loading || !name.trim() ? 'rgba(201,168,76,0.4)' : 'var(--gold)', color: 'var(--bg)', border: 'none', cursor: loading || !name.trim() ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
            >
              {loading ? 'Joining…' : 'Join Trip →'}
            </button>
          </div>

          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'center', marginTop: '16px' }}>
            No account needed · Just your name
          </p>
        </motion.div>
      </div>
    </div>
  )
}
