'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { tripsApi } from '@/lib/api'
import s from './page.module.css'

export default function HomePage() {
  const router = useRouter()
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [iwCode, setIwCode]   = useState('')
  const [iwLoading, setIwLoading] = useState(false)
  const [iwError, setIwError] = useState('')

  async function handleJoin(inviteCode: string) {
    const c = inviteCode.trim().toUpperCase()
    if (!c) return
    setLoading(true); setError('')
    try {
      await tripsApi.getByCode(c)
      router.push(`/join/${c}`)
    } catch { setError('Trip not found. Check the code.') }
    finally { setLoading(false) }
  }

  async function handleIwJoin() {
    const c = iwCode.trim().toUpperCase()
    if (!c) return
    setIwLoading(true); setIwError('')
    try {
      await tripsApi.getByCode(c)
      router.push(`/join/${c}`)
    } catch { setIwError('Code not found') }
    finally { setIwLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fffbf4' }}>

      {/* ── DOODLE BACKGROUND ── */}
      <div className={s.doodleBg} aria-hidden="true">

        {/* LARGE FERN TOP-LEFT */}
        <div className={s.doodle} style={{ top: -40, left: -30, animation: 'fernSway 7s ease-in-out infinite' }}>
          <svg width="320" height="380" viewBox="0 0 320 380" fill="none" opacity="0.13">
            <path d="M60 380 C65 340 72 295 82 255 C92 215 108 178 128 142 C148 106 172 74 200 46" stroke="#2d6a4f" strokeWidth="3" strokeLinecap="round"/>
            <path d="M78 275 C58 258 36 254 14 262" stroke="#3aaf6e" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M86 240 C66 220 44 215 22 222" stroke="#3aaf6e" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M95 205 C74 183 52 178 28 184" stroke="#3aaf6e" strokeWidth="2" strokeLinecap="round"/>
            <path d="M104 170 C84 148 62 143 38 149" stroke="#52b788" strokeWidth="2" strokeLinecap="round"/>
            <path d="M114 138 C96 115 76 110 54 116" stroke="#52b788" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M124 108 C108 86 90 82 70 88" stroke="#52b788" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M136 80 C122 60 106 56 88 62" stroke="#3aaf6e" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M82 260 C102 242 120 238 140 245" stroke="#c2185b" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M90 225 C110 206 130 202 150 208" stroke="#c2185b" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M100 190 C120 170 140 166 162 172" stroke="#c2185b" strokeWidth="2" strokeLinecap="round"/>
            <path d="M110 156 C132 136 154 132 174 138" stroke="#c2185b" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M120 124 C144 106 166 102 186 108" stroke="#c2185b" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M132 96 C154 78 174 74 192 80" stroke="#c2185b" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>

        {/* LARGE FERN BOTTOM-RIGHT */}
        <div className={s.doodle} style={{ bottom: -50, right: -40, animation: 'fernSway2 9s ease-in-out infinite 1s' }}>
          <svg width="300" height="360" viewBox="0 0 300 360" fill="none" opacity="0.11" style={{ transform: 'scaleX(-1) rotate(-15deg)' }}>
            <path d="M60 360 C65 322 74 278 86 238 C98 198 116 162 138 128 C160 94 186 64 216 38" stroke="#2d6a4f" strokeWidth="3" strokeLinecap="round"/>
            <path d="M82 258 C62 240 40 236 18 244" stroke="#3aaf6e" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M90 222 C70 202 48 197 24 204" stroke="#3aaf6e" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M100 186 C78 166 56 160 32 166" stroke="#52b788" strokeWidth="2" strokeLinecap="round"/>
            <path d="M112 152 C90 132 68 126 44 132" stroke="#52b788" strokeWidth="2" strokeLinecap="round"/>
            <path d="M124 120 C104 100 84 94 62 100" stroke="#3aaf6e" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M86 244 C106 226 128 222 150 228" stroke="#ff8c42" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M94 208 C116 190 138 186 160 192" stroke="#ff8c42" strokeWidth="2" strokeLinecap="round"/>
            <path d="M106 174 C128 154 150 150 172 156" stroke="#ff8c42" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M118 142 C142 122 164 118 184 124" stroke="#ff8c42" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>

        {/* MEDIUM FERN MID-RIGHT */}
        <div className={s.doodle} style={{ top: '38%', right: 20, animation: 'fernSway 11s ease-in-out infinite 2s' }}>
          <svg width="180" height="220" viewBox="0 0 180 220" fill="none" opacity="0.10">
            <path d="M40 220 C44 192 50 160 60 132 C70 104 84 80 102 58 C120 36 140 18 165 6" stroke="#2d6a4f" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M56 148 C40 136 22 133 6 138" stroke="#3aaf6e" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M64 120 C48 106 30 103 14 108" stroke="#3aaf6e" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M74 94 C58 80 42 77 28 82" stroke="#52b788" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M58 140 C72 128 88 125 104 130" stroke="#c2185b" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M66 112 C82 100 98 97 114 102" stroke="#c2185b" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M76 86 C92 74 108 71 124 76" stroke="#c2185b" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>

        {/* SMALL FERN TOP-RIGHT */}
        <div className={s.doodle} style={{ top: 80, right: 120, animation: 'fernSway 8s ease-in-out infinite 0.5s' }}>
          <svg width="130" height="160" viewBox="0 0 130 160" fill="none" opacity="0.09">
            <path d="M30 158 C32 136 37 110 46 86 C55 62 68 42 84 26 C100 10 118 2 132 0" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round"/>
            <path d="M42 100 C30 90 16 88 4 92" stroke="#3aaf6e" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M50 76 C38 66 24 64 10 68" stroke="#52b788" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M44 96 C56 86 70 84 84 88" stroke="#ff8c42" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M52 72 C64 62 78 60 92 64" stroke="#ff8c42" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>

        {/* AIRPLANE 1 */}
        <div className={s.doodle} style={{ top: '14%', left: '36%', animation: 'planeFloat 12s ease-in-out infinite' }}>
          <svg width="90" height="90" viewBox="0 0 90 90" fill="none" opacity="0.14">
            <ellipse cx="45" cy="45" rx="7" ry="30" stroke="#1565c0" strokeWidth="2.2"/>
            <path d="M45 38 L8 54 L8 59 L45 46 L82 59 L82 54 Z" stroke="#1565c0" strokeWidth="2" strokeLinejoin="round" fill="none"/>
            <path d="M45 70 L28 82 L28 77 L45 72 L62 77 L62 82 Z" stroke="#1565c0" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
            <path d="M40 15 C40 10 50 10 50 15" stroke="#1565c0" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="45" cy="35" r="2" stroke="#1565c0" strokeWidth="1.2"/>
            <circle cx="45" cy="44" r="2" stroke="#1565c0" strokeWidth="1.2"/>
          </svg>
        </div>

        {/* AIRPLANE 2 */}
        <div className={s.doodle} style={{ top: '54%', left: '5%', animation: 'planeFloat2 15s ease-in-out infinite 3s' }}>
          <svg width="70" height="70" viewBox="0 0 70 70" fill="none" opacity="0.12" style={{ transform: 'rotate(15deg)' }}>
            <ellipse cx="35" cy="35" rx="5.5" ry="24" stroke="#ff3d57" strokeWidth="2"/>
            <path d="M35 29 L6 42 L6 46 L35 36 L64 46 L64 42 Z" stroke="#ff3d57" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
            <path d="M35 55 L22 64 L22 60 L35 57 L48 60 L48 64 Z" stroke="#ff3d57" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
            <path d="M31 12 C31 8 39 8 39 12" stroke="#ff3d57" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>

        {/* AIRPLANE 3 */}
        <div className={s.doodle} style={{ bottom: '28%', right: '38%', animation: 'planeFloat 18s ease-in-out infinite 6s' }}>
          <svg width="55" height="55" viewBox="0 0 55 55" fill="none" opacity="0.10" style={{ transform: 'rotate(-8deg)' }}>
            <ellipse cx="27" cy="27" rx="4" ry="19" stroke="#ff8c42" strokeWidth="1.8"/>
            <path d="M27 22 L4 32 L4 36 L27 28 L50 36 L50 32 Z" stroke="#ff8c42" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
            <path d="M27 43 L17 50 L17 47 L27 45 L37 47 L37 50 Z" stroke="#ff8c42" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>

        {/* SUITCASE LEFT */}
        <div className={s.doodle} style={{ top: '42%', left: '2%', animation: 'bob 6s ease-in-out infinite 1s' }}>
          <svg width="100" height="120" viewBox="0 0 100 120" fill="none" opacity="0.13">
            <path d="M34 22 C34 12 66 12 66 22" stroke="#ff8c42" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <rect x="10" y="22" width="80" height="74" rx="10" stroke="#ff8c42" strokeWidth="2.5"/>
            <line x1="10" y1="59" x2="90" y2="59" stroke="#ff8c42" strokeWidth="1.5"/>
            <circle cx="26" cy="103" r="6" stroke="#ff8c42" strokeWidth="2"/>
            <circle cx="74" cy="103" r="6" stroke="#ff8c42" strokeWidth="2"/>
            <rect x="42" y="50" width="16" height="12" rx="3" stroke="#ff8c42" strokeWidth="1.8"/>
          </svg>
        </div>

        {/* SMALL SUITCASE BOTTOM-RIGHT */}
        <div className={s.doodle} style={{ bottom: '18%', right: '6%', animation: 'bob 8s ease-in-out infinite 2.5s' }}>
          <svg width="72" height="86" viewBox="0 0 72 86" fill="none" opacity="0.11">
            <path d="M24 16 C24 8 48 8 48 16" stroke="#c2185b" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <rect x="8" y="16" width="56" height="52" rx="8" stroke="#c2185b" strokeWidth="2"/>
            <line x1="8" y1="42" x2="64" y2="42" stroke="#c2185b" strokeWidth="1.2"/>
            <circle cx="20" cy="74" r="4.5" stroke="#c2185b" strokeWidth="1.8"/>
            <circle cx="52" cy="74" r="4.5" stroke="#c2185b" strokeWidth="1.8"/>
          </svg>
        </div>

        {/* BEACH UMBRELLA LEFT */}
        <div className={s.doodle} style={{ bottom: '5%', left: '8%', animation: 'umbrellaSway 8s ease-in-out infinite' }}>
          <svg width="160" height="200" viewBox="0 0 160 200" fill="none" opacity="0.13">
            <line x1="80" y1="55" x2="86" y2="196" stroke="#ff8c42" strokeWidth="3" strokeLinecap="round"/>
            <path d="M12 70 Q80 18 148 70" stroke="#ff3d57" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
            <line x1="80" y1="28" x2="12" y2="70" stroke="#ff3d57" strokeWidth="1.5" opacity="0.7" strokeLinecap="round"/>
            <line x1="80" y1="28" x2="80" y2="70" stroke="#ff3d57" strokeWidth="1.5" opacity="0.7" strokeLinecap="round"/>
            <line x1="80" y1="28" x2="148" y2="70" stroke="#ff3d57" strokeWidth="1.5" opacity="0.7" strokeLinecap="round"/>
            <path d="M12 70 Q26 84 40 70 Q54 56 68 70 Q80 84 92 70 Q106 56 120 70 Q134 84 148 70" stroke="#ff3d57" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            <circle cx="80" cy="24" r="4" stroke="#ff8c42" strokeWidth="2"/>
          </svg>
        </div>

        {/* BEACH UMBRELLA RIGHT */}
        <div className={s.doodle} style={{ bottom: '8%', right: '22%', animation: 'umbrellaSway 10s ease-in-out infinite 2s' }}>
          <svg width="110" height="140" viewBox="0 0 110 140" fill="none" opacity="0.10">
            <line x1="55" y1="38" x2="60" y2="138" stroke="#c2185b" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M8 50 Q55 12 102 50" stroke="#ff8c42" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
            <line x1="55" y1="19" x2="8" y2="50" stroke="#ff8c42" strokeWidth="1.3" opacity="0.7" strokeLinecap="round"/>
            <line x1="55" y1="19" x2="55" y2="50" stroke="#ff8c42" strokeWidth="1.3" opacity="0.7" strokeLinecap="round"/>
            <line x1="55" y1="19" x2="102" y2="50" stroke="#ff8c42" strokeWidth="1.3" opacity="0.7" strokeLinecap="round"/>
            <path d="M8 50 Q18 60 28 50 Q38 40 48 50 Q56 60 64 50 Q74 40 84 50 Q92 60 102 50" stroke="#ff8c42" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
            <circle cx="55" cy="16" r="3" stroke="#c2185b" strokeWidth="1.8"/>
          </svg>
        </div>

        {/* SMALL FERN MID-LEFT */}
        <div className={s.doodle} style={{ top: '68%', left: '3%', animation: 'fernSway 13s ease-in-out infinite 4s' }}>
          <svg width="120" height="150" viewBox="0 0 120 150" fill="none" opacity="0.09">
            <path d="M30 148 C32 124 38 98 48 74 C58 50 72 30 90 14 C108 -2 122 -6 130 -4" stroke="#2d6a4f" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M44 90 C30 78 14 76 2 80" stroke="#3aaf6e" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M52 68 C38 56 22 54 10 58" stroke="#52b788" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M46 86 C58 74 74 72 88 76" stroke="#ff8c42" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M54 64 C66 52 82 50 96 54" stroke="#ff8c42" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>

        {/* DOTTED FLIGHT PATH 1 */}
        <div className={s.doodle} style={{ top: '22%', left: '18%' }}>
          <svg width="280" height="60" viewBox="0 0 280 60" fill="none" opacity="0.08">
            <path d="M10 50 C60 50 80 10 140 10 C200 10 220 50 270 50" stroke="#1565c0" strokeWidth="1.8" strokeDasharray="6 8" strokeLinecap="round"/>
          </svg>
        </div>

        {/* DOTTED FLIGHT PATH 2 */}
        <div className={s.doodle} style={{ top: '60%', right: '10%' }}>
          <svg width="200" height="50" viewBox="0 0 200 50" fill="none" opacity="0.07">
            <path d="M8 40 C40 40 60 8 100 8 C140 8 160 40 195 40" stroke="#ff8c42" strokeWidth="1.5" strokeDasharray="5 7" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav className={s.nav}>
        <Link href="/" className={s.logo}>PackedUp</Link>
        <ul className={s.navLinks}>
          <li><a href="#how">How it works</a></li>
          <li><a href="#boards">Boards</a></li>
          <li><a href="#features">Features</a></li>
        </ul>
        <button onClick={() => router.push('/create')} className={s.navCta}>
          Plan a trip →
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className={s.hero}>
        <div className={s.heroLeft}>
          <div className={s.stamp}>✈ Group trip planning</div>
          <h1 className={s.title}>
            Plan<br />
            <span className={s.titleItalic}>together,</span><br />
            travel <span className={s.titleSky}>better.</span>
          </h1>
          <p className={s.heroDesc}>
            Drop a code, let everyone vote on stays, restaurants, and sights.
            Build an itinerary your whole crew actually wants. No sign-up, no drama.
          </p>
          <div className={s.heroBtns}>
            <button onClick={() => router.push('/create')} className={s.btnBig}>
              Create a Trip →
            </button>
            <button onClick={() => setCode(c => c === '' ? ' ' : '')} className={s.btnOutline}>
              Join with code
            </button>
          </div>
          <div className={s.joinExpand}>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin(code)}
              placeholder="Enter invite code"
              maxLength={8}
              className={s.joinInput}
            />
            <button
              onClick={() => handleJoin(code)}
              disabled={loading || !code.trim()}
              className={s.joinBtn}
            >
              {loading ? '…' : 'Join →'}
            </button>
            {error && <p className={s.joinError}>{error}</p>}
          </div>
        </div>

        <div className={s.heroRight}>
          <div className={s.postcardStack}>
            <div className={s.pc2}>
              <div className={s.pcDest}>Kyoto,<br />Japan 🍂</div>
              <div className={s.pcSub}>📍 Kyoto · Apr 10–16</div>
              <div className={s.pcCode}>MR4XW9B</div>
              <div className={s.pcMembersRow}>
                <div className={s.pcAvs}>
                  {['J','K','L'].map(l => <div key={l} className={s.pcAv}>{l}</div>)}
                </div>
                <span className={s.pcAvTxt}>5 joined</span>
              </div>
            </div>
            <div className={s.pc1}>
              <div className={s.pcDest}>Goa<br />2025 🏖️</div>
              <div className={s.pcSub}>📍 Goa · Dec 23–28</div>
              <div className={s.pcCode}>XK7P2QA</div>
              <div className={s.pcMembersRow}>
                <div className={s.pcAvs}>
                  {['T','A','R'].map(l => <div key={l} className={s.pcAv}>{l}</div>)}
                  <div className={s.pcAv} style={{ fontSize: 9 }}>+4</div>
                </div>
                <span className={s.pcAvTxt}>7 planning</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={s.howSection} id="how">
        <div className={s.howInner}>
          <div className={s.sectionTag}>How it works</div>
          <h2 className={s.sectionHeading}>Simple.<br /><em>Powerful. Fun.</em></h2>
          <div className={s.howGrid}>
            {[
              { num: '01', icon: '✈️', title: 'Create your trip', desc: 'Add destination, dates, and your name. Get a 7-character invite code and shareable link instantly. No account needed.' },
              { num: '02', icon: '📲', title: 'Invite the crew',  desc: 'Share the code or link. Friends join with just their name — no sign-up, no app download. They\'re in within seconds.' },
              { num: '03', icon: '🌍', title: 'Plan together',    desc: 'Suggest hotels, restaurants, activities. Vote in real-time. Finalize winners and your itinerary builds itself.' },
            ].map(card => (
              <div key={card.num} className={s.howCard}>
                <div className={s.howCardNum}>{card.num}</div>
                <span className={s.howCardIcon}>{card.icon}</span>
                <div className={s.howCardTitle}>{card.title}</div>
                <p className={s.howCardDesc}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOARDS ── */}
      <section className={s.boardsSection} id="boards">
        <div className={s.boardsInner}>
          <div className={s.sectionTag}>The planning boards</div>
          <h2 className={s.sectionHeading}>Stay. Eat.<br /><em>Visit.</em></h2>
          <div className={s.boardsGrid}>

            {/* Stay */}
            <div className={s.bCol}>
              <div className={s.bColHead}>
                <div className={s.bColLeft}>
                  <span className={s.bColIcon}>🏨</span>
                  <div>
                    <div className={s.bColName}>Stay</div>
                    <div className={s.bColSub}>Accommodation</div>
                  </div>
                </div>
                <span className={s.bColCnt}>4 ideas</span>
              </div>
              <div className={s.bColItems}>
                <div className={s.bItem}>
                  <div className={s.bItemTop}>
                    <span className={s.bItemName}>The Leela Palace</span>
                    <div className={s.bItemVotes}><span className={s.bUp}>▲ 5</span><span className={s.bDn}>▼ 1</span></div>
                  </div>
                  <span className={s.bItemPrice}>₹8,500 / night</span>
                </div>
                <div className={`${s.bItem} ${s.bItemWinner}`}>
                  <div className={s.bItemTop}>
                    <span className={s.bItemName}>Taj Exotica Resort ⭐</span>
                    <span className={s.bBadge}>Picked!</span>
                  </div>
                  <span className={s.bItemPrice}>₹12,000 / night</span>
                </div>
                <div className={s.bItem}>
                  <div className={s.bItemTop}>
                    <span className={s.bItemName}>ITC Grand Goa</span>
                    <div className={s.bItemVotes}><span className={s.bUp}>▲ 3</span><span className={s.bDn}>▼ 0</span></div>
                  </div>
                  <span className={s.bItemPrice}>₹6,200 / night</span>
                </div>
              </div>
            </div>

            {/* Eat */}
            <div className={s.bCol}>
              <div className={s.bColHead}>
                <div className={s.bColLeft}>
                  <span className={s.bColIcon}>🍽️</span>
                  <div>
                    <div className={s.bColName}>Eat</div>
                    <div className={s.bColSub}>Restaurants</div>
                  </div>
                </div>
                <span className={s.bColCnt}>6 ideas</span>
              </div>
              <div className={s.bColItems}>
                <div className={`${s.bItem} ${s.bItemWinner}`}>
                  <div className={s.bItemTop}>
                    <span className={s.bItemName}>Thalassa Beach ⭐</span>
                    <span className={s.bBadge}>Picked!</span>
                  </div>
                  <span className={s.bItemPrice}>₹2,400 / person</span>
                </div>
                <div className={s.bItem}>
                  <div className={s.bItemTop}>
                    <span className={s.bItemName}>Gunpowder</span>
                    <div className={s.bItemVotes}><span className={s.bUp}>▲ 4</span><span className={s.bDn}>▼ 2</span></div>
                  </div>
                  <span className={s.bItemPrice}>₹900 / person</span>
                </div>
                <div className={s.bItem}>
                  <div className={s.bItemTop}>
                    <span className={s.bItemName}>Fisherman&apos;s Wharf</span>
                    <div className={s.bItemVotes}><span className={s.bUp}>▲ 3</span><span className={s.bDn}>▼ 1</span></div>
                  </div>
                  <span className={s.bItemPrice}>₹1,200 / person</span>
                </div>
              </div>
            </div>

            {/* Visit */}
            <div className={s.bCol}>
              <div className={s.bColHead}>
                <div className={s.bColLeft}>
                  <span className={s.bColIcon}>🗺️</span>
                  <div>
                    <div className={s.bColName}>Visit</div>
                    <div className={s.bColSub}>Attractions</div>
                  </div>
                </div>
                <span className={s.bColCnt}>5 ideas</span>
              </div>
              <div className={s.bColItems}>
                <div className={s.bItem}>
                  <div className={s.bItemTop}>
                    <span className={s.bItemName}>Dudhsagar Falls</span>
                    <div className={s.bItemVotes}><span className={s.bUp}>▲ 8</span><span className={s.bDn}>▼ 0</span></div>
                  </div>
                  <span className={s.bItemPrice}>Free</span>
                </div>
                <div className={`${s.bItem} ${s.bItemWinner}`}>
                  <div className={s.bItemTop}>
                    <span className={s.bItemName}>Butterfly Beach ⭐</span>
                    <span className={s.bBadge}>Picked!</span>
                  </div>
                  <span className={s.bItemPrice}>₹500 ferry</span>
                </div>
                <div className={s.bItem}>
                  <div className={s.bItemTop}>
                    <span className={s.bItemName}>Old Goa Churches</span>
                    <div className={s.bItemVotes}><span className={s.bUp}>▲ 5</span><span className={s.bDn}>▼ 1</span></div>
                  </div>
                  <span className={s.bItemPrice}>Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={s.featsSection} id="features">
        <div className={s.featsInner}>
          <div className={s.sectionTag}>Features</div>
          <h2 className={s.sectionHeading}>Everything<br /><em>your group needs.</em></h2>
          <div className={s.featsGrid}>
            {[
              { bg: 'rgba(255,140,66,0.12)',  icon: '⚡', title: 'Real-time voting',   desc: 'See votes update live as your group weighs in. No page refresh, no waiting.' },
              { bg: 'rgba(21,101,192,0.12)',  icon: '🔗', title: 'Just a 7-char code', desc: 'Anyone joins with a short code and their name. Zero sign-up friction for the whole group.' },
              { bg: 'rgba(45,106,79,0.12)',   icon: '🗓', title: 'Auto itinerary',      desc: 'Winners from each board snap into a day-by-day itinerary automatically.' },
              { bg: 'rgba(194,24,91,0.12)',   icon: '💰', title: 'Budget tracker',      desc: 'Per-day and total trip cost estimates so your group always knows what it\'ll cost.' },
            ].map(f => (
              <div key={f.title} className={s.featRow}>
                <div className={s.featIconBox} style={{ background: f.bg }}>{f.icon}</div>
                <div>
                  <div className={s.featRowTitle}>{f.title}</div>
                  <p className={s.featRowDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={s.ctaSection}>
        <div className={s.ctaInner}>
          <div className={s.ctaText}>
            <div className={s.ctaTag}>Ready to go</div>
            <h2 className={s.ctaTitle}>Your next<br /><em>adventure</em><br />awaits.</h2>
            <p className={s.ctaSub}>
              Create your trip in under a minute. Share the code. Let everyone vote. Pack your bags.
            </p>
            <button onClick={() => router.push('/create')} className={s.btnBig}>
              Create a Trip — it&apos;s free →
            </button>
            <p className={s.ctaNote}>No account · No credit card · Just a code</p>
          </div>

          <div className={s.ctaCard}>
            <div className={s.inviteWidget}>
              <span className={s.iwEmoji}>🌴</span>
              <div className={s.iwTitle}>Join a trip</div>
              <div className={s.iwSub}>Enter the invite code</div>
              <div className={s.iwInputWrap}>
                <input
                  value={iwCode}
                  onChange={e => setIwCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleIwJoin()}
                  placeholder="e.g. XK7P2QA"
                  maxLength={8}
                  className={s.iwInput}
                />
              </div>
              <button
                onClick={handleIwJoin}
                disabled={iwLoading || !iwCode.trim()}
                className={s.iwBtn}
              >
                {iwLoading ? 'Looking up…' : 'Join this trip →'}
              </button>
              {iwError && <p className={s.iwError}>{iwError}</p>}
              <p className={s.iwNote}>No sign-up needed</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={s.footer}>
        <div className={s.footerLogo}>PackedUp</div>
        <div className={s.footerCopy}>© 2025 PackedUp · Made for group travelers</div>
      </footer>
    </div>
  )
}
