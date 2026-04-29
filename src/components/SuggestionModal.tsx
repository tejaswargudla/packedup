'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { suggestionsApi } from '@/lib/api'
import type { BoardType } from '@/types'

const BOARD_META: Record<BoardType, { label: string; emoji: string }> = {
  stay:  { label: 'Where to Stay',   emoji: '🏨' },
  eat:   { label: 'Where to Eat',    emoji: '🍽️' },
  visit: { label: 'Places to Visit', emoji: '📍' },
}

interface Props {
  tripId: string
  memberId: string
  defaultBoard: BoardType
  onClose: () => void
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  padding: '11px 14px',
  fontFamily: 'var(--font-serif)',
  fontSize: '15px',
  fontWeight: 400,
  color: 'var(--white)',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s',
}

export function SuggestionModal({ tripId, memberId, defaultBoard, onClose }: Props) {
  const queryClient = useQueryClient()
  const board = defaultBoard          // locked — no switching inside the modal
  const meta  = BOARD_META[board]
  const [form, setForm] = useState({ name: '', description: '', url: '', price: '' })
  const [error, setError] = useState('')

  function set(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () =>
      suggestionsApi.create({
        trip_id:     tripId,
        member_id:   memberId,
        board_type:  board,
        name:        form.name.trim(),
        description: form.description.trim() || undefined,
        url:         form.url.trim() || undefined,
        price:       form.price.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions', tripId] })
      onClose()
    },
    onError: (e: any) => setError(e.message || 'Failed to add suggestion'),
  })

  function handleSubmit() {
    if (!form.name.trim()) { setError('Place name is required'); return }
    if (!memberId) { setError('You must join the trip before adding suggestions'); return }
    setError('')
    submit()
  }

  return (
    <AnimatePresence>
      {/* BACKDROP */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.7)', zIndex: 100, backdropFilter: 'blur(4px)' }}
      />

      {/* CENTERED PANEL — flexbox wrapper handles position; Framer Motion handles y-slide */}
      <div key="center" style={{ position: 'fixed', inset: 0, zIndex: 101, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', pointerEvents: 'none' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          style={{ width: '100%', maxWidth: '520px', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflowY: 'auto', pointerEvents: 'auto' }}
        >
        {/* HEADER */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>
              {meta.emoji} {meta.label}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 300, letterSpacing: '-0.3px' }}>Add a place</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            ×
          </button>
        </div>

        {/* FORM */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Place Name <span style={{ color: 'var(--muted)' }}>*</span>
            </label>
            <input
              style={inputStyle}
              placeholder="e.g. Zostel Goa"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              autoFocus
            />
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Why this place? <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--muted)' }}>optional</span>
            </label>
            <textarea
              style={{ ...inputStyle, resize: 'none', height: '72px', lineHeight: 1.6 }}
              placeholder="Great vibes, near beach, budget friendly..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Price + Link row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)' }}>
                Price <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--muted)' }}>optional</span>
              </label>
              <input
                style={inputStyle}
                placeholder="₹800/night"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)' }}>
                Link <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--muted)' }}>optional</span>
              </label>
              <input
                style={inputStyle}
                placeholder="booking.com, maps…"
                value={form.url}
                onChange={e => set('url', e.target.value)}
                onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          </div>

          {error && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#c47a7a', letterSpacing: '1px' }}>{error}</p>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', flexShrink: 0 }}>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', padding: '14px', background: isPending ? 'rgba(255,140,66,0.5)' : 'var(--gold)', color: '#fff', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s' }}
          >
            {isPending ? 'Adding…' : 'Add Suggestion →'}
          </button>
          <button
            onClick={onClose}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', padding: '14px 20px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
