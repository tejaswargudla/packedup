'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { tripsApi } from '@/lib/api'

export default function HomePage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleJoin() {
    if (!code.trim()) return
    setLoading(true); setError('')
    try {
      await tripsApi.getByCode(code.trim())
      router.push(`/join/${code.trim().toUpperCase()}`)
    } catch { setError('Trip not found. Check the code and try again.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '24px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(180deg, rgba(8,14,26,0.97) 0%, transparent 100%)',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 300, letterSpacing: '6px', textTransform: 'uppercase', color: 'var(--gold)' }}>
          PackedUp
        </span>
        <div style={{ display: 'flex', gap: '40px' }}>
          {['Problem','Process','Boards'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>
              {l}
            </a>
          ))}
        </div>
        <button onClick={() => router.push('/create')} style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
          color: 'var(--bg)', background: 'var(--gold)', padding: '11px 24px', border: 'none', cursor: 'pointer',
        }}>
          Begin
        </button>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 64px 80px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 60%,rgba(30,80,160,0.18) 0%,transparent 55%),radial-gradient(ellipse at 80% 15%,rgba(201,168,76,0.07) 0%,transparent 50%)' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04 }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', width: '1px', height: '100%', background: 'var(--gold)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '1px', background: 'var(--gold)' }} />
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 2 }}>
          <span style={{ width: '48px', height: '1px', background: 'var(--gold)', display: 'inline-block' }} />
          Group trip planning · Reimagined
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ fontSize: 'clamp(72px,10vw,144px)', fontWeight: 300, lineHeight: 0.88, letterSpacing: '-3px', marginBottom: '40px', position: 'relative', zIndex: 2 }}>
          Plan trips.<br /><em style={{ color: 'var(--gold)' }}>Together.</em><br />Without the chaos.
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '40px', position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
          <p style={{ fontSize: '18px', fontWeight: 300, lineHeight: 1.8, color: 'rgba(232,238,248,0.5)', maxWidth: '400px', fontStyle: 'italic' }}>
            One shared space where your group suggests, votes, and decides — without endless group chats or emergency calls.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
            <button onClick={() => router.push('/create')} style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
              padding: '16px 40px', background: 'var(--gold)', color: 'var(--bg)', border: 'none', cursor: 'pointer',
            }}>
              Create a Trip Free
            </button>

            {/* JOIN ROW */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="Enter invite code"
                maxLength={8}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '4px',
                  padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--white)', outline: 'none', width: '200px', textTransform: 'uppercase',
                }}
              />
              <button onClick={handleJoin} disabled={loading || !code.trim()} style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
                padding: '12px 20px', background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--muted)', cursor: 'pointer',
              }}>
                {loading ? '...' : 'Join →'}
              </button>
            </div>
            {error && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#c47a7a', letterSpacing: '1px' }}>{error}</p>}
          </div>
        </motion.div>
      </section>

      {/* GOLD DIVIDER */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,var(--gold),transparent)' }} />

      {/* STRIP */}
      <div id="how" style={{ display: 'flex', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        {[
          { num: '01 / 03', title: 'Suggest Together', desc: 'Everyone adds places to Stay, Eat, and Visit boards asynchronously.' },
          { num: '02 / 03', title: 'Vote in Real-Time', desc: 'Thumbs up or down. Live results. No group call needed to decide.' },
          { num: '03 / 03', title: 'Itinerary Built', desc: 'Finalize winners. Your day-by-day itinerary generates automatically.' },
        ].map((item, i) => (
          <div key={i} style={{ flex: 1, padding: '48px 40px', borderRight: i < 2 ? '1px solid var(--border)' : 'none', transition: 'background 0.3s', cursor: 'default' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', color: 'var(--gold)', marginBottom: '20px' }}>{item.num}</div>
            <div style={{ fontSize: '22px', fontWeight: 300, marginBottom: '12px' }}>{item.title}</div>
            <div style={{ fontSize: '14px', fontWeight: 300, lineHeight: 1.8, color: 'rgba(232,238,248,0.4)' }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* CTA FOOTER */}
      <section id="cta" style={{ padding: '120px 64px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <span style={{ flex: 1, maxWidth: '80px', height: '1px', background: 'var(--gold)', display: 'inline-block' }} />
          Begin
          <span style={{ flex: 1, maxWidth: '80px', height: '1px', background: 'var(--gold)', display: 'inline-block' }} />
        </div>
        <h2 style={{ fontSize: 'clamp(56px,9vw,120px)', fontWeight: 300, lineHeight: 0.88, letterSpacing: '-3px', marginBottom: '24px' }}>
          Your next<br /><em style={{ color: 'var(--gold)' }}>trip</em><br />starts here.
        </h2>
        <p style={{ fontSize: '17px', fontWeight: 300, fontStyle: 'italic', color: 'rgba(232,238,248,0.4)', marginBottom: '48px', lineHeight: 1.8 }}>
          Create a trip in 30 seconds. Share the code. Let everyone vote.
        </p>
        <button onClick={() => router.push('/create')} style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
          padding: '16px 48px', background: 'var(--gold)', color: 'var(--bg)', border: 'none', cursor: 'pointer',
        }}>
          Create a Trip Free
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 64px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 1 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)' }}>PackedUp</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1px' }}>© 2025 PackedUp · Plan trips together</span>
      </footer>
    </div>
  )
}
