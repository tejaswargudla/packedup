'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { tripsApi, suggestionsApi, itineraryApi } from '@/lib/api'
import { formatDateRange } from '@/lib/utils'
import type { BoardType, Suggestion, ItineraryItem } from '@/types'

// ── constants ─────────────────────────────────────────────────
const SECTIONS: { type: BoardType; emoji: string; label: string; full: string }[] = [
  { type: 'stay',  emoji: '🏨', label: 'Stay',  full: 'Where to Stay'   },
  { type: 'eat',   emoji: '🍽️', label: 'Eat',   full: 'Where to Eat'    },
  { type: 'visit', emoji: '📍', label: 'Visit', full: 'Places to Visit' },
]

// shorthand so every inline style that needs JetBrains Mono matches other pages
const MONO = 'var(--font-mono)'

// ── helpers ───────────────────────────────────────────────────
function generateDays(start: string, end: string) {
  const days: { dayNumber: number; date: string; label: string; short: string }[] = []
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end   + 'T00:00:00')
  let cur = new Date(s), n = 1
  while (cur <= e) {
    days.push({
      dayNumber: n,
      date:  cur.toISOString().split('T')[0],
      label: cur.toLocaleDateString('en-US', { weekday: 'long',  month: 'long',  day: 'numeric' }),
      short: cur.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    })
    cur.setDate(cur.getDate() + 1)
    n++
  }
  return days
}

function voteScore(s: Suggestion) {
  return (s.vote_count?.up ?? 0) - (s.vote_count?.down ?? 0)
}

function parseBudget(price?: string): number {
  if (!price) return 0
  const n = parseFloat(price.replace(/,/g, '').match(/[\d.]+/)?.[0] ?? '')
  return isNaN(n) ? 0 : n
}

function detectCurrency(items: ItineraryItem[]): string {
  for (const item of items) {
    const p = (item as any).suggestion?.price as string | undefined
    if (p) { const m = p.match(/[¥$€£₹]/); if (m) return m[0] }
  }
  return ''
}

function fmtBudget(amount: number, currency: string): string {
  if (amount === 0) return '—'
  return `${currency}${amount.toLocaleString()}`
}

function dayTotal(items: ItineraryItem[], dayNumber: number): number {
  return items.filter(i => i.day_number === dayNumber)
    .reduce((s, i) => s + parseBudget((i as any).suggestion?.price), 0)
}

function tripTotal(items: ItineraryItem[]): number {
  return items.reduce((s, i) => s + parseBudget((i as any).suggestion?.price), 0)
}

// ── Picker ────────────────────────────────────────────────────
interface PickerProps {
  dayNumber: number; dayLabel: string; type: BoardType
  suggestions: Suggestion[]; placedIds: Set<string>
  onAdd: (s: Suggestion) => void; onClose: () => void
}

function Picker({ dayNumber, dayLabel, type, suggestions, placedIds, onAdd, onClose }: PickerProps) {
  const sec  = SECTIONS.find(s => s.type === type)!
  const pool = suggestions.filter(s => s.board_type === type).sort((a, b) => voteScore(b) - voteScore(a))

  return (
    <>
    {/* backdrop — click to close */}
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.72)', zIndex: 200, backdropFilter: 'blur(4px)' }} />

    {/* wrapper — bottom sheet on mobile, centered dialog on desktop */}
    <div
      className="flex items-end md:items-center justify-center"
      style={{ position: 'fixed', inset: 0, zIndex: 201, padding: '0 0 0 0', pointerEvents: 'none' }}>
      <motion.div onClick={e => e.stopPropagation()}
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        className="border border-border2 border-b-0 md:border-b md:mx-4"
        style={{ width: '100%', maxWidth: '520px', background: 'var(--surface)',
                 display: 'flex', flexDirection: 'column', maxHeight: '80vh', pointerEvents: 'auto' }}>

        {/* header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '4px',
                          textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '3px' }}>
              {sec.emoji} {sec.label} · Day {dayNumber}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 300 }}>{dayLabel}</div>
          </div>
          <button onClick={onClose}
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)',
                     width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px',
                     display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {pool.length === 0 && (
            <div style={{ padding: '48px 24px', textAlign: 'center', fontFamily: MONO,
                          fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--muted)' }}>
              No suggestions on this board yet
            </div>
          )}
          {pool.map(sug => {
            const added = placedIds.has(sug.id)
            return (
              <div key={sug.id}
                onClick={() => { if (!added) { onAdd(sug); onClose() } }}
                style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)',
                         display: 'flex', alignItems: 'center', gap: '14px', minHeight: '52px',
                         cursor: added ? 'default' : 'pointer', opacity: added ? 0.4 : 1, transition: 'background 0.15s' }}
                onMouseEnter={e => { if (!added) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,140,66,0.05)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
                <div style={{ fontFamily: MONO, fontSize: '11px',
                              color: voteScore(sug) > 0 ? '#5aaa7a' : 'var(--muted)', minWidth: '32px', textAlign: 'center' }}>
                  👍{sug.vote_count?.up ?? 0}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sug.name}
                  </div>
                  {(sug.price || sug.description) && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                      {sug.price      && <span style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--muted)' }}>{sug.price}</span>}
                      {sug.description && <span style={{ fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic' }}>{sug.description}</span>}
                    </div>
                  )}
                </div>
                {added
                  ? <span style={{ fontFamily: MONO, fontSize: '9px', color: 'var(--gold)', letterSpacing: '2px' }}>ADDED ✓</span>
                  : <span style={{ fontFamily: MONO, fontSize: '18px', color: 'var(--muted)' }}>+</span>}
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function ItineraryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const qc     = useQueryClient()

  const [selectedDay, setSelectedDay] = useState(1)
  const [picker, setPicker] = useState<{ dayNumber: number; dayLabel: string; date: string; type: BoardType } | null>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  const { data: tripData } = useQuery({ queryKey: ['trip', params.id],        queryFn: () => tripsApi.getById(params.id) })
  const { data: sugData  } = useQuery({ queryKey: ['suggestions', params.id], queryFn: () => suggestionsApi.list(params.id) })
  const { data: itnData, isLoading } = useQuery({ queryKey: ['itinerary', params.id], queryFn: () => itineraryApi.get(params.id) })

  const trip        = tripData?.trip
  const suggestions = sugData?.suggestions ?? []
  const items       = itnData?.items ?? []
  const days        = trip ? generateDays(trip.start_date, trip.end_date) : []
  const currency    = detectCurrency(items)
  const currentDay  = days.find(d => d.dayNumber === selectedDay) ?? days[0]

  useEffect(() => {
    if (!stripRef.current) return
    const active = stripRef.current.querySelector('[data-active="true"]') as HTMLElement | null
    active?.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' })
  }, [selectedDay])

  const invalidate = () => qc.invalidateQueries({ queryKey: ['itinerary', params.id] })

  const { mutate: addItem } = useMutation({
    mutationFn: (payload: { sug: Suggestion; day: typeof days[0] }) =>
      itineraryApi.add({
        trip_id: params.id, suggestion_id: payload.sug.id,
        day_number: payload.day.dayNumber, item_date: payload.day.date,
        type: payload.sug.board_type as BoardType, title: payload.sug.name,
      }),
    onSuccess: invalidate,
  })

  const { mutate: removeItem } = useMutation({
    mutationFn: (id: string) => itineraryApi.remove(id),
    onSuccess: invalidate,
  })

  const itemsForDay     = (dn: number) => items.filter(i => i.day_number === dn)
  const itemsForDayType = (dn: number, t: BoardType) => items.filter(i => i.day_number === dn && i.type === t)
  const placedIdsForDay = (dn: number) => new Set(items.filter(i => i.day_number === dn && i.suggestion_id).map(i => i.suggestion_id!))

  function handleAdd(sug: Suggestion) {
    if (!picker) return
    const day = days.find(d => d.dayNumber === picker.dayNumber)
    if (day) addItem({ sug, day })
  }

  function goDay(delta: number) {
    const next = selectedDay + delta
    if (next >= 1 && next <= days.length) setSelectedDay(next)
  }

  const totalAmt = tripTotal(items)

  // ── Sidebar nav items (same list as board page) ───────────────
  const NAV = [
    { label: 'Dashboard', icon: '◈', href: `/trip/${params.id}` },
    { label: 'Boards',    icon: '◫', href: `/trip/${params.id}/board` },
    { label: 'Itinerary', icon: '≡', href: `/trip/${params.id}/itinerary`, active: true },
  ]

  return (
    <>
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* ── TOPBAR — matches board/created pages exactly ── */}
      <header style={{ height: '56px', flexShrink: 0, background: 'rgba(255,251,244,0.97)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'stretch', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <div style={{ fontFamily: MONO, fontSize: '16px', fontWeight: 400, letterSpacing: '6px', textTransform: 'uppercase', color: 'var(--gold)', padding: '0 28px', borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
          PackedUp
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px', overflow: 'hidden' }}>
          <span style={{ fontFamily: MONO, fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {trip?.name ?? '…'}
          </span>
          {trip && <>
            <span className="hidden sm:inline" style={{ color: 'var(--border2)' }}>·</span>
            <span className="hidden sm:inline" style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {formatDateRange(trip.start_date, trip.end_date)}
            </span>
          </>}
        </div>
        {/* budget chip — top-right, visible on all sizes */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', borderLeft: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--muted)' }}>Budget</div>
            <div style={{ fontFamily: MONO, fontSize: '12px', color: totalAmt > 0 ? 'var(--gold)' : 'var(--muted)' }}>
              {fmtBudget(totalAmt, currency)}
            </div>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* NAV SIDEBAR — desktop, same structure as board page */}
        <aside className="hidden md:flex" style={{ width: '220px', flexShrink: 0, background: 'rgba(255,251,244,0.95)', borderRight: '1px solid var(--border)', flexDirection: 'column', backdropFilter: 'blur(12px)' }}>
          <div style={{ padding: '24px 20px 12px', fontFamily: MONO, fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)' }}>Navigation</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 12px' }}>
            {NAV.map(item => (
              <div key={item.label} onClick={() => router.push(item.href)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px',
                         fontFamily: MONO, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
                         cursor: 'pointer',
                         color: item.active ? 'var(--gold)' : 'var(--muted)',
                         border: `1px solid ${item.active ? 'rgba(255,140,66,0.12)' : 'transparent'}`,
                         background: item.active ? 'rgba(255,140,66,0.06)' : 'transparent',
                         transition: 'all 0.2s' }}>
                <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>

          <div style={{ height: '1px', background: 'var(--border)', margin: '16px 20px' }} />

          {/* budget summary */}
          <div style={{ padding: '0 20px 12px', fontFamily: MONO, fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)' }}>Trip Budget</div>
          <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ border: '1px solid var(--border)', padding: '10px 12px' }}>
              <div style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>Items Placed</div>
              <div style={{ fontFamily: MONO, fontSize: '16px', color: 'var(--white)' }}>{items.length}</div>
            </div>
            <div style={{ border: `1px solid ${totalAmt > 0 ? 'rgba(255,140,66,0.2)' : 'var(--border)'}`, padding: '10px 12px', background: totalAmt > 0 ? 'rgba(255,140,66,0.05)' : 'transparent' }}>
              <div style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>Est. Total</div>
              <div style={{ fontFamily: MONO, fontSize: '16px', color: totalAmt > 0 ? 'var(--gold)' : 'var(--muted)' }}>
                {fmtBudget(totalAmt, currency)}
              </div>
              {totalAmt > 0 && (
                <div style={{ fontFamily: MONO, fontSize: '9px', color: 'var(--muted)', marginTop: '4px' }}>
                  {items.filter(i => parseBudget((i as any).suggestion?.price) > 0).length} priced items
                </div>
              )}
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--border)', margin: '16px 20px' }} />

          {/* suggestion pool */}
          <div style={{ padding: '0 20px 12px', fontFamily: MONO, fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)' }}>Suggestion Pool</div>
          <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {SECTIONS.map(sec => (
              <div key={sec.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', border: '1px solid var(--border)' }}>
                <span style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--muted)', letterSpacing: '1px' }}>{sec.emoji} {sec.label}</span>
                <span style={{ fontFamily: MONO, fontSize: '11px', color: 'var(--gold)' }}>
                  {suggestions.filter(s => s.board_type === sec.type).length}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* DAY SELECTOR SIDEBAR — desktop */}
        <div className="hidden md:flex" style={{ width: '190px', flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '18px 16px 12px', fontFamily: MONO, fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {days.length} Day{days.length !== 1 ? 's' : ''}
          </div>
          {isLoading
            ? <div style={{ padding: '20px 16px', fontFamily: MONO, fontSize: '10px', color: 'var(--muted)', letterSpacing: '2px' }}>Loading…</div>
            : days.map(day => {
                const budget = dayTotal(items, day.dayNumber)
                const dItems = itemsForDay(day.dayNumber)
                const active = day.dayNumber === selectedDay
                return (
                  <div key={day.dayNumber} onClick={() => setSelectedDay(day.dayNumber)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                             padding: '13px 13px 13px 11px',
                             borderBottom: '1px solid var(--border)', cursor: 'pointer', gap: '8px',
                             borderLeft: `2px solid ${active ? 'var(--gold)' : 'transparent'}`,
                             background: active ? 'rgba(255,140,66,0.06)' : 'transparent',
                             transition: 'background 0.15s' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                      <span style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)' }}>Day {day.dayNumber}</span>
                      <span style={{ fontFamily: MONO, fontSize: '10px', color: active ? 'var(--white)' : 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{day.short}</span>
                      <span style={{ fontFamily: MONO, fontSize: '9px', color: budget > 0 ? 'var(--gold)' : 'var(--muted)' }}>
                        {budget > 0 ? fmtBudget(budget, currency) : dItems.length > 0 ? `${dItems.length} item${dItems.length !== 1 ? 's' : ''}` : 'empty'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}>
                      {SECTIONS.map(sec => {
                        const has = itemsForDayType(day.dayNumber, sec.type).length > 0
                        return (
                          <span key={sec.type} style={{ fontFamily: MONO, fontSize: '9px', color: has ? '#5aaa7a' : 'var(--muted)' }}>
                            {sec.emoji} {has ? '✓' : '–'}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )
              })
          }
        </div>

        {/* ── RIGHT: strip + panel ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* DAY STRIP — mobile only */}
          <div className="flex md:hidden" ref={stripRef}
            style={{ overflowX: 'auto', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0, scrollbarWidth: 'none' }}>
            <div style={{ display: 'flex' }}>
              {days.map(day => {
                const active   = day.dayNumber === selectedDay
                const budget   = dayTotal(items, day.dayNumber)
                const hasItems = itemsForDay(day.dayNumber).length > 0
                return (
                  <div key={day.dayNumber} data-active={active}
                    onClick={() => setSelectedDay(day.dayNumber)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                             padding: '10px 14px', borderRight: '1px solid var(--border)', cursor: 'pointer', flexShrink: 0,
                             background: active ? 'rgba(255,140,66,0.06)' : 'transparent',
                             borderBottom: `2px solid ${active ? 'var(--gold)' : 'transparent'}`,
                             transition: 'all 0.15s', WebkitTapHighlightColor: 'transparent' as any }}>
                    <span style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)' }}>Day {day.dayNumber}</span>
                    <span style={{ fontFamily: MONO, fontSize: '10px', color: active ? 'var(--white)' : 'var(--muted)', whiteSpace: 'nowrap' }}>{day.short}</span>
                    {budget > 0
                      ? <span style={{ fontFamily: MONO, fontSize: '9px', color: 'var(--gold)' }}>{fmtBudget(budget, currency)}</span>
                      : <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: hasItems ? '#5aaa7a' : 'transparent', border: hasItems ? 'none' : '1px solid var(--muted)' }} />
                    }
                  </div>
                )
              })}
            </div>
          </div>

          {/* MAIN PANEL */}
          <main style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

            {isLoading && !currentDay && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)' }}>Loading…</p>
              </div>
            )}

            {!isLoading && days.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)' }}>Trip dates not set</p>
              </div>
            )}

            {currentDay && (
              <>
              {/* Panel header */}
              <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', flexShrink: 0 }}>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6px' }}>
                    Day {currentDay.dayNumber} · {days.length} days total
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 400, letterSpacing: '-0.5px', marginBottom: '8px' }}>
                    {currentDay.label}
                  </h2>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--muted)', letterSpacing: '1px' }}>
                      {itemsForDay(currentDay.dayNumber).length} item{itemsForDay(currentDay.dayNumber).length !== 1 ? 's' : ''}
                    </span>
                    {dayTotal(items, currentDay.dayNumber) > 0 && (
                      <>
                        <span style={{ color: 'var(--border2)' }}>·</span>
                        <span style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--gold)', letterSpacing: '1px' }}>
                          {fmtBudget(dayTotal(items, currentDay.dayNumber), currency)} est. day budget
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {/* prev / next — same button style as other pages */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => goDay(-1)} disabled={selectedDay === 1}
                    style={{ background: 'transparent', border: '1px solid var(--border)', color: selectedDay === 1 ? 'var(--muted)' : 'var(--muted)', width: '36px', height: '36px', cursor: selectedDay === 1 ? 'default' : 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, transition: 'all 0.15s' }}>‹</button>
                  <button onClick={() => goDay(1)} disabled={selectedDay === days.length}
                    style={{ background: 'transparent', border: '1px solid var(--border)', color: selectedDay === days.length ? 'var(--muted)' : 'var(--muted)', width: '36px', height: '36px', cursor: selectedDay === days.length ? 'default' : 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, transition: 'all 0.15s' }}>›</button>
                </div>
              </div>

              {/* Sections */}
              <div style={{ padding: '24px 28px 80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {SECTIONS.map(sec => {
                  const secItems  = itemsForDayType(currentDay.dayNumber, sec.type)
                  const secBudget = secItems.reduce((s, i) => s + parseBudget((i as any).suggestion?.price), 0)
                  return (
                    <div key={sec.type} style={{ border: '1px solid var(--border)' }}>
                      {/* section header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', borderBottom: secItems.length > 0 ? '1px solid var(--border)' : 'none', background: 'rgba(255,251,244,0.4)' }}>
                        <span style={{ fontSize: '14px' }}>{sec.emoji}</span>
                        <span style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--muted)' }}>{sec.full}</span>
                        {secItems.length > 0 && (
                          <span style={{ fontFamily: MONO, fontSize: '9px', color: 'var(--muted)', letterSpacing: '1px' }}>· {secItems.length}</span>
                        )}
                        {secBudget > 0 && (
                          <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: '10px', color: 'var(--gold)', letterSpacing: '1px' }}>
                            {fmtBudget(secBudget, currency)}
                          </span>
                        )}
                      </div>

                      {/* items */}
                      <AnimatePresence>
                        {secItems.map(item => (
                          <motion.div key={item.id}
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '14px', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                              {(item as any).suggestion?.price && (
                                <div style={{ fontFamily: MONO, fontSize: '10px', color: 'var(--muted)', marginTop: '2px', letterSpacing: '1px' }}>
                                  {(item as any).suggestion.price}
                                </div>
                              )}
                            </div>
                            <button onClick={() => removeItem(item.id)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '16px', padding: '4px 8px', opacity: 0.6, flexShrink: 0, minWidth: '36px', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.15s' }}
                              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.6')}>×</button>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* add button — matches board page "+ Add a suggestion" style */}
                      <button
                        onClick={() => setPicker({ dayNumber: currentDay.dayNumber, dayLabel: currentDay.short, date: currentDay.date, type: sec.type })}
                        style={{ width: '100%', padding: '12px 20px', background: 'transparent', border: 'none',
                                 borderTop: secItems.length > 0 ? '1px dashed var(--border2)' : 'none',
                                 color: 'var(--muted)', fontFamily: MONO, fontSize: '10px',
                                 letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer',
                                 textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
                                 minHeight: '44px', transition: 'all 0.2s', WebkitTapHighlightColor: 'transparent' as any }}
                        onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'var(--gold)'; b.style.borderColor = 'rgba(255,140,66,0.4)' }}
                        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'var(--muted)'; b.style.borderColor = 'var(--border2)' }}>
                        + Add {sec.label}
                      </button>
                    </div>
                  )
                })}

                {/* day budget summary */}
                {itemsForDay(currentDay.dayNumber).length > 0 && (
                  <div style={{ border: '1px solid var(--border)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,251,244,0.4)', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>
                        Day {currentDay.dayNumber} Total
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: '18px', color: dayTotal(items, currentDay.dayNumber) > 0 ? 'var(--gold)' : 'var(--muted)' }}>
                        {fmtBudget(dayTotal(items, currentDay.dayNumber), currency)}
                      </div>
                      {dayTotal(items, currentDay.dayNumber) === 0 && (
                        <div style={{ fontFamily: MONO, fontSize: '9px', color: 'var(--muted)', marginTop: '2px' }}>No prices added yet</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '24px' }}>
                      {SECTIONS.map(sec => {
                        const b = itemsForDayType(currentDay.dayNumber, sec.type)
                          .reduce((s, i) => s + parseBudget((i as any).suggestion?.price), 0)
                        if (b === 0) return null
                        return (
                          <div key={sec.type} style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '3px' }}>{sec.emoji} {sec.label}</div>
                            <div style={{ fontFamily: MONO, fontSize: '12px', color: 'var(--muted)' }}>{fmtBudget(b, currency)}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>

    {/* BOTTOM NAV — mobile only, same style as other pages */}
    <div className="flex md:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px', background: 'rgba(255,251,244,0.98)', borderTop: '1px solid var(--border)', zIndex: 50, alignItems: 'stretch' }}>
      {NAV.map(item => (
        <div key={item.label} onClick={() => router.push(item.href)}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer',
                   color: item.active ? 'var(--gold)' : 'var(--muted)', fontFamily: MONO, fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase',
                   WebkitTapHighlightColor: 'transparent' }}>
          <span style={{ fontSize: '16px' }}>{item.icon}</span>
          {item.label}
        </div>
      ))}
    </div>

    {/* PICKER */}
    <AnimatePresence>
      {picker && (
        <Picker
          dayNumber={picker.dayNumber} dayLabel={picker.dayLabel}
          type={picker.type} suggestions={suggestions}
          placedIds={placedIdsForDay(picker.dayNumber)}
          onAdd={handleAdd} onClose={() => setPicker(null)}
        />
      )}
    </AnimatePresence>
    </>
  )
}
