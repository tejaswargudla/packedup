'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { tripsApi } from '@/lib/api'

export default function TripCreatedPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [codeCopied, setCodeCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['trip', params.id],
    queryFn: () => tripsApi.getById(params.id),
  })

  const trip = data?.trip

  function copyCode() {
    if (!trip) return
    navigator.clipboard.writeText(trip.invite_code)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  function copyLink() {
    if (!trip) return
    const url = `${window.location.origin}/join/${trip.invite_code}`
    navigator.clipboard.writeText(url)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  if (isLoading || !trip) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Loading...
        </p>
      </div>
    )
  }

  const joinUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${trip.invite_code}`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* TOPBAR */}
      <header style={{ height: '56px', background: 'rgba(8,14,26,0.97)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'stretch', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 300, letterSpacing: '6px', textTransform: 'uppercase', color: 'var(--gold)', padding: '0 28px', borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
          PackedUp
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 24px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Trip Created
        </div>
        <button
          onClick={() => router.push(`/trip/${params.id}`)}
          style={{ height: '100%', padding: '0 28px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--bg)', background: 'var(--gold)', border: 'none', cursor: 'pointer' }}
        >
          Enter Trip →
        </button>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px' }}
      >
        {/* LABEL */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '5px', textTransform: 'uppercase', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <span style={{ width: '28px', height: '1px', background: 'var(--gold)', display: 'inline-block' }} />
          Trip Ready
          <span style={{ width: '28px', height: '1px', background: 'var(--gold)', display: 'inline-block' }} />
        </div>

        <h1 style={{ fontSize: 'clamp(36px,5vw,72px)', fontWeight: 300, lineHeight: 0.9, letterSpacing: '-2px', textAlign: 'center', marginBottom: '12px' }}>
          <em style={{ color: 'var(--gold)' }}>{trip.name}</em>
        </h1>
        <p style={{ fontSize: '16px', fontWeight: 300, fontStyle: 'italic', color: 'var(--muted)', marginBottom: '64px' }}>
          {trip.destination}
        </p>

        {/* INVITE CODE BLOCK */}
        <div style={{ width: '100%', maxWidth: '520px', border: '1px solid var(--border)', marginBottom: '20px' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)' }}>
              Invite Code
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px', color: 'var(--muted)' }}>
              Share this with your group
            </span>
          </div>
          <div style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 500, letterSpacing: '10px', color: 'var(--gold)' }}>
              {trip.invite_code}
            </span>
            <button
              onClick={copyCode}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', padding: '10px 18px', background: codeCopied ? 'rgba(201,168,76,0.12)' : 'transparent', border: '1px solid var(--border)', color: codeCopied ? 'var(--gold)' : 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
            >
              {codeCopied ? 'Copied ✓' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* SHARE LINK BLOCK */}
        <div style={{ width: '100%', maxWidth: '520px', border: '1px solid var(--border)', marginBottom: '40px' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)' }}>
              Share Link
            </span>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(232,238,248,0.4)', letterSpacing: '0.5px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {joinUrl}
            </span>
            <button
              onClick={copyLink}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', padding: '10px 18px', background: linkCopied ? 'rgba(201,168,76,0.12)' : 'transparent', border: '1px solid var(--border)', color: linkCopied ? 'var(--gold)' : 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
            >
              {linkCopied ? 'Copied ✓' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* NOTE */}
        <div style={{ width: '100%', maxWidth: '520px', display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '48px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--gold)', marginTop: '2px' }}>—</span>
          <p style={{ fontSize: '13px', fontWeight: 300, color: 'rgba(232,238,248,0.35)', lineHeight: 1.8, fontStyle: 'italic' }}>
            Friends join with just their name — no account required. Share the code or link above and start planning together.
          </p>
        </div>

        <button
          onClick={() => router.push(`/trip/${params.id}`)}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', padding: '16px 48px', background: 'var(--gold)', color: 'var(--bg)', border: 'none', cursor: 'pointer' }}
        >
          Enter Trip Dashboard →
        </button>
      </motion.div>
    </div>
  )
}
