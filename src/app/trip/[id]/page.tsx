'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { tripsApi, suggestionsApi, membersApi } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { formatDateRange, BOARD_CONFIG } from '@/lib/utils'
import type { BoardType } from '@/types'

const AVATAR_COLORS = ['#1a2e10','#0d2030','#20101a','#201808','#140d28']
const AVATAR_TEXT   = ['#5aaa7a','#4a8fc0','#c07080','#c09040','#8a70c0']

export default function TripDashboard({ params }: { params: { id: string } }) {
  const router       = useRouter()
  const queryClient  = useQueryClient()
  const guestSession = useAppStore(s => s.guestSession)
  const [removing, setRemoving] = useState<string | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['trip', params.id], queryFn: () => tripsApi.getById(params.id) })
  const { data: sugData }   = useQuery({ queryKey: ['suggestions', params.id], queryFn: () => suggestionsApi.list(params.id) })

  async function handleRemoveMember(memberId: string) {
    if (!guestSession?.member_id) return
    setRemoving(memberId)
    try {
      await membersApi.remove(memberId, guestSession.member_id)
      queryClient.invalidateQueries({ queryKey: ['trip', params.id] })
    } catch (e: any) {
      alert(e.message || 'Failed to remove member')
    } finally {
      setRemoving(null)
    }
  }

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🗺️</div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)' }}>Loading your trip...</p>
      </div>
    </div>
  )

  const trip = data?.trip
  if (!trip) return null

  const sugs = sugData?.suggestions ?? []
  const members = trip.members ?? []

  const boards: { type: BoardType; label: string; emoji: string }[] = [
    { type: 'stay',  label: 'Where to Stay',   emoji: '🏨' },
    { type: 'eat',   label: 'Where to Eat',     emoji: '🍽️' },
    { type: 'visit', label: 'Places to Visit',  emoji: '📍' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* TOPBAR */}
      <header style={{ height: '56px', background: 'rgba(255,251,244,0.97)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'stretch', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 400, letterSpacing: '6px', textTransform: 'uppercase', color: 'var(--gold)', padding: '0 28px', borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>PackedUp</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>{trip.name}</span>
          <span style={{ color: 'var(--border2)' }}>·</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase' }}>{formatDateRange(trip.start_date, trip.end_date)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', borderRight: '1px solid var(--border)' }}>
            {members.slice(0, 5).map((m, i) => (
              <div key={m.id} style={{ width: '28px', height: '28px', borderRadius: '50%', background: AVATAR_COLORS[i % 5], color: AVATAR_TEXT[i % 5], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500, border: '1.5px solid var(--bg)', marginLeft: i === 0 ? '0' : '-6px' }}>
                {m.display_name[0].toUpperCase()}
              </div>
            ))}
          </div>
          <button onClick={() => router.push(`/trip/${trip.id}/created`)} style={{ height: '100%', padding: '0 24px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#fff', background: 'var(--gold)', border: 'none', cursor: 'pointer' }}>
            + Invite
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* SIDEBAR */}
        <aside style={{ width: '220px', flexShrink: 0, background: 'rgba(255,251,244,0.95)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', backdropFilter: 'blur(12px)' }}>
          <div style={{ padding: '24px 20px 12px', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)' }}>Navigation</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 12px' }}>
            {[
              { label: 'Dashboard',      icon: '◈', active: true,  href: `/trip/${params.id}` },
              { label: 'Boards',         icon: '◫', active: false, href: `/trip/${params.id}/board` },
              { label: 'Add Suggestion', icon: '+', active: false, href: `/trip/${params.id}/add` },
              { label: 'Itinerary',      icon: '≡', active: false, href: `/trip/${params.id}/itinerary` },
            ].map(item => (
              <div key={item.label} onClick={() => router.push(item.href)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 14px', fontFamily: 'var(--font-mono)', fontSize: '10px',
                letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer',
                color: item.active ? 'var(--gold)' : 'var(--muted)',
                border: `1px solid ${item.active ? 'rgba(255,140,66,0.12)' : 'transparent'}`,
                background: item.active ? 'rgba(255,140,66,0.06)' : 'transparent',
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>
          <div style={{ height: '1px', background: 'var(--border)', margin: '16px 20px' }} />
          <div style={{ margin: '0 12px 20px', border: '1px solid var(--border)', padding: '14px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Invite Code</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 500, letterSpacing: '5px', color: 'var(--gold)', cursor: 'pointer' }} onClick={() => router.push(`/trip/${params.id}/created`)}>
              {trip.invite_code}
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, overflowY: 'auto' }}>

          {/* PAGE HEADER */}
          <div style={{ padding: '48px 56px 36px', borderBottom: '1px solid var(--border)', background: 'rgba(255,251,244,0.6)', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '5px', textTransform: 'uppercase', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ width: '28px', height: '1px', background: 'var(--gold)', display: 'inline-block' }} />
              Overview
            </div>
            <h1 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 400, letterSpacing: '-1px', lineHeight: 0.95, marginBottom: '10px' }}>
              {trip.name} <em style={{ color: 'var(--gold)' }}>is coming together.</em>
            </h1>
            <p style={{ fontSize: '14px', fontWeight: 400, fontStyle: 'italic', color: 'var(--muted2)' }}>
              {formatDateRange(trip.start_date, trip.end_date)} · {trip.destination} · {members.length} members planning
            </p>
          </div>

          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid var(--border)' }}>
            {[
              { n: sugs.length,                                num: 'Total',    lbl: 'Suggestions' },
              { n: members.length,                             num: 'Members',  lbl: 'Planning together' },
              { n: sugs.filter(s => s.is_finalized).length,   num: 'Decided',  lbl: 'Finalized picks' },
              { n: 6,                                          num: 'Days',     lbl: 'Until departure' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '28px 32px', borderRight: i < 3 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>{s.num}</div>
                <div style={{ fontSize: 'clamp(36px,4vw,52px)', fontWeight: 400, lineHeight: 1, letterSpacing: '-1px', color: 'var(--gold)' }}>{s.n}</div>
                <div style={{ fontSize: '12px', fontWeight: 400, color: 'rgba(26,26,46,0.4)', marginTop: '4px' }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* BOARDS + MEMBERS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', flex: 1 }}>
            <div style={{ borderRight: '1px solid var(--border)' }}>
              <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)' }}>Boards</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>Progress</div>
              </div>
              {boards.map(b => {
                const count = sugs.filter(s => s.board_type === b.type).length
                const fin   = sugs.filter(s => s.board_type === b.type && s.is_finalized).length
                const pct   = count ? Math.round((fin / count) * 100) : 0
                return (
                  <motion.div key={b.type} whileHover={{ paddingLeft: '48px' }} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 32px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' }}
                    onClick={() => router.push(`/trip/${params.id}/board?tab=${b.type}`)}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: '1px solid var(--border)' }}>
                      {b.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: 400, marginBottom: '3px' }}>{b.label}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1px' }}>{count} suggestion{count !== 1 ? 's' : ''}</div>
                    </div>
                    <div style={{ width: '80px', height: '1px', background: 'var(--border)', overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ height: '100%', background: 'var(--gold)', width: `${pct}%` }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--muted)' }}>→</span>
                  </motion.div>
                )
              })}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 32px', cursor: 'pointer', borderTop: '1px solid var(--border)' }}
                onClick={() => router.push(`/trip/${params.id}/itinerary`)}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: '1px solid rgba(255,140,66,0.3)' }}>🗓️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 400, marginBottom: '3px' }}>View Itinerary</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1px' }}>Day-by-day plan</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--gold)' }}>→</span>
              </div>
            </div>

            <div>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)' }}>Members</div>
              </div>
              {(() => {
                const isCreator = guestSession
                  ? members.some(m => m.id === guestSession.member_id && m.role === 'creator')
                  : false
                return members.map((m, i) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 24px', borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: AVATAR_COLORS[i % 5], color: AVATAR_TEXT[i % 5], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500 }}>
                      {m.display_name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 300 }}>{m.display_name}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', padding: '3px 10px', border: `1px solid ${m.role === 'creator' ? 'rgba(255,140,66,0.4)' : 'var(--border2)'}`, color: m.role === 'creator' ? 'var(--gold)' : 'var(--muted2)', background: m.role === 'creator' ? 'rgba(255,140,66,0.06)' : 'transparent' }}>
                      {m.role}
                    </div>
                    {isCreator && m.role !== 'creator' && (
                      <button
                        onClick={() => handleRemoveMember(m.id)}
                        disabled={removing === m.id}
                        title="Remove member"
                        style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--muted2)', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: removing === m.id ? 'not-allowed' : 'pointer', fontSize: '14px', flexShrink: 0, transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#c47a7a'; e.currentTarget.style.color = '#c47a7a' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--muted2)' }}
                      >
                        {removing === m.id ? '…' : '×'}
                      </button>
                    )}
                  </div>
                ))
              })()}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
