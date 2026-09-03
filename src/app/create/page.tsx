'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useWebMCP } from 'use-webmcp-tool'
import { tripsApi } from '@/lib/api'
import { useAppStore } from '@/lib/store'

const inputStyle = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  padding: '13px 16px', fontFamily: 'var(--font-serif)',
  fontSize: '16px', fontWeight: 400, color: 'var(--white)',
  outline: 'none', width: '100%', transition: 'border-color 0.2s',
}

export default function CreateTripPage() {
  const router = useRouter()
  const setGuestSession = useAppStore(s => s.setGuestSession)
  const [form, setForm] = useState({ name: '', destination: '', start_date: '', end_date: '', creator_name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  // Shared by the submit button and the create_trip WebMCP tool below.
  async function createTrip(data: typeof form) {
    if (!data.name || !data.destination || !data.start_date || !data.end_date || !data.creator_name.trim()) {
      throw new Error('Please fill in all fields: name, destination, start_date, end_date, creator_name')
    }
    setLoading(true); setError('')
    try {
      const { trip, member, session_token } = await tripsApi.create({ ...data })
      if (session_token) {
        setGuestSession({ member_id: member.id, trip_id: trip.id, display_name: member.display_name, session_token })
      }
      router.push(`/trip/${trip.id}/created`)
      return trip
    } catch (e: any) {
      setError(e.message || 'Failed to create trip')
      throw e
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    try { await createTrip(form) } catch { /* error already shown in UI */ }
  }

  // Lets an AI agent (e.g. Chrome's built-in assistant) fill in and submit
  // this form on the user's behalf — see https://developer.chrome.com/docs/ai/webmcp
  useWebMCP({
    name: 'create_trip',
    description:
      "Create a new PackedUp trip. Fills in and submits the trip creation form with the given name, destination, date range, and creator's display name, then navigates to the trip's invite page.",
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Trip name, e.g. "Goa 2025"' },
        destination: { type: 'string', description: 'Destination city/country, e.g. "Goa, India"' },
        start_date: { type: 'string', description: 'Trip start date, formatted YYYY-MM-DD' },
        end_date: { type: 'string', description: 'Trip end date, formatted YYYY-MM-DD' },
        creator_name: { type: 'string', description: "Display name of the person creating the trip" },
      },
      required: ['name', 'destination', 'start_date', 'end_date', 'creator_name'],
    },
    annotations: { readOnlyHint: false },
    async execute(args: typeof form) {
      const merged = { ...form, ...args }
      setForm(merged)
      const trip = await createTrip(merged)
      const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/join/${trip.invite_code}` : trip.invite_code
      return `Created trip "${trip.name}" to ${trip.destination} (${trip.start_date} → ${trip.end_date}). Invite code: ${trip.invite_code}. Invite link: ${inviteLink}`
    },
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* TOPBAR */}
      <header style={{ height: '56px', background: 'rgba(255,251,244,0.97)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'stretch', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => router.back()} style={{ padding: '0 24px', background: 'transparent', border: 'none', borderRight: '1px solid var(--border)', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '2px', cursor: 'pointer' }}>
          ← Back
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 28px', fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 400, letterSpacing: '6px', textTransform: 'uppercase', color: 'var(--gold)' }}>
          PackedUp
        </div>
      </header>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ flex: 1, padding: '80px 64px', maxWidth: '640px' }}>

        {/* LABEL */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '5px', textTransform: 'uppercase', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ width: '28px', height: '1px', background: 'var(--gold)', display: 'inline-block' }} />
          New Trip
        </div>

        <h1 style={{ fontSize: 'clamp(42px,6vw,72px)', fontWeight: 400, lineHeight: 0.9, letterSpacing: '-2px', marginBottom: '48px' }}>
          Create your<br /><em style={{ color: 'var(--gold)' }}>adventure.</em>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)' }}>Your Name</label>
            <input style={inputStyle} placeholder="e.g. Alex" value={form.creator_name} onChange={e => set('creator_name', e.target.value)}
              onFocus={e => (e.target.style.borderColor = 'var(--gold)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)' }}>Trip Name</label>
            <input style={inputStyle} placeholder="e.g. Goa 2025 🏖️" value={form.name} onChange={e => set('name', e.target.value)}
              onFocus={e => (e.target.style.borderColor = 'var(--gold)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)' }}>Destination</label>
            <input style={inputStyle} placeholder="City, Country" value={form.destination} onChange={e => set('destination', e.target.value)}
              onFocus={e => (e.target.style.borderColor = 'var(--gold)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[['From', 'start_date'], ['To', 'end_date']].map(([label, key]) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)' }}>{label}</label>
                <input type="date" style={inputStyle} value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)}
                  onFocus={e => (e.target.style.borderColor = 'var(--gold)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
              </div>
            ))}
          </div>

          {/* NOTE */}
          <div style={{ border: '1px solid var(--border)', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--gold)' }}>—</span>
            <p style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(26,26,46,0.45)', lineHeight: 1.7, fontStyle: 'italic' }}>
              You&apos;ll receive a shareable link and invite code. Friends join with just their name — no sign-up required.
            </p>
          </div>

          {error && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#c47a7a', letterSpacing: '1px' }}>{error}</p>}

          <button onClick={handleCreate} disabled={loading} style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
            padding: '16px 40px', background: 'var(--gold)', color: '#fff', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, alignSelf: 'flex-start',
          }}>
            {loading ? 'Creating...' : 'Create Trip →'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
