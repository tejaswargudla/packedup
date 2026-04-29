'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { tripsApi, suggestionsApi, votesApi } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { SuggestionModal } from '@/components/SuggestionModal'
import type { BoardType, Suggestion } from '@/types'

const BOARDS: { type: BoardType; label: string; emoji: string; short: string }[] = [
  { type: 'stay',  label: 'Where to Stay',    emoji: '🏨', short: 'Stay'  },
  { type: 'eat',   label: 'Where to Eat',     emoji: '🍽️', short: 'Eat'   },
  { type: 'visit', label: 'Places to Visit',  emoji: '📍', short: 'Visit' },
]

const AVATAR_COLORS = ['#1a2e10','#0d2030','#20101a','#201808','#140d28']
const AVATAR_TEXT   = ['#5aaa7a','#4a8fc0','#c07080','#c09040','#8a70c0']

export default function BoardPage({ params }: { params: { id: string } }) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const queryClient  = useQueryClient()
  const guestSession = useAppStore(s => s.guestSession)
  const memberId     = guestSession?.member_id ?? null

  const tab = (searchParams.get('tab') as BoardType) || 'stay'
  const board = BOARDS.find(b => b.type === tab) ?? BOARDS[0]
  const [modalOpen, setModalOpen] = useState(false)

  // ── Data ──────────────────────────────────────────────────────
  const { data: tripData } = useQuery({
    queryKey: ['trip', params.id],
    queryFn:  () => tripsApi.getById(params.id),
  })

  const { data: sugData, isLoading } = useQuery({
    queryKey:        ['suggestions', params.id, tab],
    queryFn:         () => suggestionsApi.list(params.id, tab),
    refetchInterval: 5000,
  })

  const trip        = tripData?.trip
  const suggestions = sugData?.suggestions ?? []
  const members     = trip?.members ?? []

  const currentMember = members.find(m => m.id === memberId)
  const isCreator     = currentMember?.role === 'creator'

  // Leading = most upvotes (at least 1)
  const leading = suggestions.reduce<Suggestion | null>((best, s) => {
    if (s.is_finalized) return best
    const ups = s.vote_count?.up ?? 0
    return ups > 0 && ups > (best?.vote_count?.up ?? 0) ? s : best
  }, null)

  const finalized = suggestions.find(s => s.is_finalized)

  // ── Mutations ─────────────────────────────────────────────────
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['suggestions', params.id, tab] })

  const { mutate: castVote, isPending: votePending } = useMutation({
    mutationFn: ({ suggestion_id, value }: { suggestion_id: string; value: 'up' | 'down' }) =>
      votesApi.cast({ suggestion_id, member_id: memberId!, value }),
    onSuccess: invalidate,
  })

  const { mutate: removeVote } = useMutation({
    mutationFn: (suggestion_id: string) => votesApi.remove(suggestion_id, memberId!),
    onSuccess: invalidate,
  })

  const { mutate: finalizeSug, isPending: finalizePending } = useMutation({
    mutationFn: (id: string) => suggestionsApi.finalize(id),
    onSuccess:  invalidate,
  })

  // ── Helpers ───────────────────────────────────────────────────
  function myVoteFor(sug: Suggestion) {
    return sug.votes?.find(v => v.member_id === memberId)?.value ?? null
  }

  function handleVote(sug: Suggestion, value: 'up' | 'down') {
    if (!memberId) return
    const current = myVoteFor(sug)
    if (current === value) removeVote(sug.id)
    else castVote({ suggestion_id: sug.id, value })
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* TOPBAR */}
      <header style={{ height: '56px', background: 'rgba(255,251,244,0.97)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'stretch', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 400, letterSpacing: '6px', textTransform: 'uppercase', color: 'var(--gold)', padding: '0 28px', borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>PackedUp</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>{trip?.name ?? '...'}</span>
          <span style={{ color: 'var(--border2)' }}>·</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2px', color: 'var(--gold)', textTransform: 'uppercase' }}>{board.emoji} {board.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <button onClick={() => setModalOpen(true)} style={{ height: '100%', padding: '0 24px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', background: 'transparent', border: 'none', borderLeft: '1px solid var(--border)', cursor: 'pointer' }}>
            + Add
          </button>
          <button onClick={() => router.push(`/trip/${params.id}/created`)} style={{ height: '100%', padding: '0 24px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#fff', background: 'var(--gold)', border: 'none', cursor: 'pointer' }}>
            Invite
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* SIDEBAR */}
        <aside style={{ width: '220px', flexShrink: 0, background: 'rgba(255,251,244,0.95)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', backdropFilter: 'blur(12px)' }}>
          <div style={{ padding: '24px 20px 12px', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)' }}>Navigation</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 12px' }}>
            {[
              { label: 'Dashboard',      icon: '◈', active: false, href: `/trip/${params.id}` },
              { label: 'Boards',         icon: '◫', active: true,  href: `/trip/${params.id}/board` },
              { label: 'Add Suggestion', icon: '+', active: false, href: `/trip/${params.id}/add` },
              { label: 'Itinerary',      icon: '≡', active: false, href: `/trip/${params.id}/itinerary` },
            ].map(item => (
              <div key={item.label} onClick={() => router.push(item.href)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', color: item.active ? 'var(--gold)' : 'var(--muted)', border: `1px solid ${item.active ? 'rgba(255,140,66,0.12)' : 'transparent'}`, background: item.active ? 'rgba(255,140,66,0.06)' : 'transparent', transition: 'all 0.2s' }}>
                <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>
          <div style={{ height: '1px', background: 'var(--border)', margin: '16px 20px' }} />
          {/* Members */}
          <div style={{ padding: '0 20px', marginBottom: '12px', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--muted)' }}>Members</div>
          <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
            {members.slice(0, 6).map((m, i) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: AVATAR_COLORS[i % 5], color: AVATAR_TEXT[i % 5], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500, flexShrink: 0 }}>
                  {m.display_name[0].toUpperCase()}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: m.id === memberId ? 'var(--gold)' : 'var(--muted)', letterSpacing: '0.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.display_name}{m.id === memberId ? ' (you)' : ''}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          {/* BOARD TAB NAV */}
          <div style={{ borderBottom: '1px solid var(--border)', display: 'flex', background: 'rgba(255,251,244,0.6)', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
            {BOARDS.map(b => {
              const active = b.type === tab
              return (
                <button key={b.type} onClick={() => router.push(`/trip/${params.id}/board?tab=${b.type}`)} style={{ padding: '18px 32px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', background: 'transparent', border: 'none', borderBottom: `2px solid ${active ? 'var(--gold)' : 'transparent'}`, color: active ? 'var(--gold)' : 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: '14px' }}>{b.emoji}</span>
                  {b.short}
                </button>
              )
            })}
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '2px' }}>
                {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* FINALIZED BANNER */}
          <AnimatePresence>
            {finalized && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                style={{ background: 'rgba(255,140,66,0.08)', borderBottom: '1px solid rgba(255,140,66,0.2)', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                <span style={{ fontSize: '16px' }}>✓</span>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)' }}>Finalized · </span>
                  <span style={{ fontSize: '14px', fontWeight: 300 }}>{finalized.name}</span>
                  {finalized.price && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', marginLeft: '12px' }}>{finalized.price}</span>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUGGESTION LIST */}
          <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>

            {isLoading && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)' }}>Loading suggestions...</p>
              </div>
            )}

            {!isLoading && suggestions.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{board.emoji}</div>
                <h2 style={{ fontSize: '28px', fontWeight: 400, letterSpacing: '-0.5px', marginBottom: '8px' }}>No suggestions yet</h2>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '32px' }}>Be the first to suggest a place</p>
                <button onClick={() => setModalOpen(true)} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', padding: '14px 36px', background: 'var(--gold)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  + Add Suggestion
                </button>
              </motion.div>
            )}

            <AnimatePresence>
              {suggestions.map((sug, i) => {
                const myVote   = myVoteFor(sug)
                const isLeading  = leading?.id === sug.id
                const upVotes  = sug.vote_count?.up ?? 0
                const downVotes = sug.vote_count?.down ?? 0
                const addedBy  = (sug as any).member?.display_name ?? 'Unknown'

                return (
                  <motion.div key={sug.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ border: `1px solid ${sug.is_finalized ? 'rgba(255,140,66,0.35)' : isLeading ? 'rgba(255,140,66,0.2)' : 'var(--border)'}`, background: sug.is_finalized ? 'rgba(255,140,66,0.04)' : 'var(--surface)', padding: '20px 24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

                    {/* EMOJI */}
                    <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: '1px solid var(--border)', flexShrink: 0, background: 'rgba(255,255,255,0.02)' }}>
                      {board.emoji}
                    </div>

                    {/* BODY */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '17px', fontWeight: 400, letterSpacing: '-0.3px' }}>{sug.name}</span>
                        {sug.is_finalized && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', padding: '3px 10px', background: 'rgba(255,140,66,0.15)', color: 'var(--gold)', border: '1px solid rgba(255,140,66,0.3)', flexShrink: 0 }}>
                            ✓ Finalized
                          </span>
                        )}
                        {isLeading && !sug.is_finalized && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', padding: '3px 10px', background: 'rgba(90,170,122,0.12)', color: '#5aaa7a', border: '1px solid rgba(90,170,122,0.25)', flexShrink: 0 }}>
                            Leading
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
                        {sug.price && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1px' }}>{sug.price}</span>
                        )}
                        {sug.description && (
                          <span style={{ fontSize: '13px', color: 'var(--muted)', fontStyle: 'italic', fontWeight: 300 }}>{sug.description}</span>
                        )}
                        {sug.url && (
                          <a href={sug.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--gold)', letterSpacing: '1px', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                            ↗ Link
                          </a>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {/* VOTE BUTTONS */}
                        {[{ val: 'up' as const, icon: '👍', count: upVotes }, { val: 'down' as const, icon: '👎', count: downVotes }].map(({ val, icon, count }) => {
                          const active = myVote === val
                          return (
                            <button key={val} disabled={!memberId || votePending} onClick={() => handleVote(sug, val)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', background: active ? (val === 'up' ? 'rgba(90,170,122,0.15)' : 'rgba(196,122,122,0.15)') : 'transparent', border: `1px solid ${active ? (val === 'up' ? 'rgba(90,170,122,0.4)' : 'rgba(196,122,122,0.4)') : 'var(--border)'}`, color: active ? (val === 'up' ? '#5aaa7a' : '#c47a7a') : 'var(--muted)', cursor: memberId ? 'pointer' : 'default', transition: 'all 0.15s', borderRadius: '2px' }}>
                              <span style={{ fontSize: '13px' }}>{icon}</span>
                              <span>{count}</span>
                            </button>
                          )
                        })}

                        {/* ADDED BY */}
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginLeft: 'auto' }}>
                          by {addedBy}
                        </span>

                        {/* FINALIZE (creator only) */}
                        {isCreator && !sug.is_finalized && (
                          <button onClick={() => finalizeSug(sug.id)} disabled={finalizePending} style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', padding: '6px 14px', background: 'transparent', border: '1px solid rgba(255,140,66,0.3)', color: 'var(--gold)', cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,140,66,0.1)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
                            ✓ Finalize
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* ADD SUGGESTION ROW */}
            {suggestions.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setModalOpen(true)}
                style={{ border: '1px dashed var(--border)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', transition: 'all 0.2s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(255,140,66,0.4)'; el.style.color = 'var(--gold)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--muted)' }}>
                + Add a suggestion
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>

      {/* ADD SUGGESTION MODAL */}
      {modalOpen && memberId && (
        <SuggestionModal
          tripId={params.id}
          memberId={memberId}
          defaultBoard={tab}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}
