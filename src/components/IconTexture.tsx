'use client'
import { useEffect, useRef } from 'react'

const ICONS = [
  '🧳','✈️','🗺️','🏖️','🌍','🧭','📸','🏕️','🛫','🎒',
  '🗼','🏔️','🌅','🚢','🎫','🏝️','🌐','🚂','🌄','📍',
  '🏨','🛵','🌴','🎭','🍜','🌏','🗽','🏯','🌋','⛵','🪂',
]

export function IconTexture() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = ref.current
    if (!wrap) return

    const W = window.innerWidth
    const H = Math.max(document.documentElement.scrollHeight, 3000)
    const cellW = 110, cellH = 110
    const cols = Math.ceil(W / cellW) + 1
    const rows = Math.ceil(H / cellH) + 1
    const frag = document.createDocumentFragment()

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < 0.58) continue
        const el = document.createElement('span')
        el.textContent = ICONS[Math.floor(Math.random() * ICONS.length)]
        const x = c * cellW + Math.random() * cellW * 0.75
        const y = r * cellH + Math.random() * cellH * 0.75
        const size = 12 + Math.random() * 16
        const rot = (Math.random() - 0.5) * 40
        const isGold = Math.random() < 0.12
        const op = isGold ? 0.13 + Math.random() * 0.07 : 0.04 + Math.random() * 0.05
        el.style.cssText = [
          `position:absolute`,
          `left:${x.toFixed(1)}px`,
          `top:${y.toFixed(1)}px`,
          `font-size:${size.toFixed(1)}px`,
          `opacity:${op.toFixed(3)}`,
          `transform:rotate(${rot.toFixed(1)}deg)`,
          `user-select:none`,
          `line-height:1`,
          isGold ? 'filter:sepia(1) saturate(5) hue-rotate(6deg) brightness(1.4)' : '',
        ].join(';')
        frag.appendChild(el)
      }
    }
    wrap.appendChild(frag)
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  )
}
