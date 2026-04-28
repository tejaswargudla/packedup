import { cn } from '@/lib/utils'
import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react'

// ── MONO LABEL ──────────────────────────────────────────────
export function MonoLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(
      'font-mono text-[10px] tracking-[4px] uppercase text-gold flex items-center gap-3',
      'before:content-[\'\'] before:w-7 before:h-px before:bg-gold',
      className
    )}>
      {children}
    </div>
  )
}

// ── PAGE HEADER ─────────────────────────────────────────────
export function PageHeader({
  label, title, sub, children,
}: {
  label: string
  title: ReactNode
  sub?: string
  children?: ReactNode
}) {
  return (
    <div className="px-10 pt-12 pb-8 border-b border-border bg-bg/60 backdrop-blur-sm">
      <MonoLabel className="mb-3">{label}</MonoLabel>
      <h1 className="text-heading font-light tracking-tight leading-none mb-3">{title}</h1>
      {sub && <p className="text-base font-light italic text-muted2 max-w-lg leading-relaxed">{sub}</p>}
      {children}
    </div>
  )
}

// ── GOLD DIVIDER ────────────────────────────────────────────
export function GoldDivider() {
  return <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
}

// ── CARD ────────────────────────────────────────────────────
export function Card({
  children, winner, className,
}: {
  children: ReactNode; winner?: boolean; className?: string
}) {
  return (
    <div className={cn(
      'bg-surface border border-border p-5 transition-colors',
      winner && 'border-gold/30 bg-gradient-to-br from-gold/5 to-surface',
      className,
    )}>
      {children}
    </div>
  )
}

// ── BADGE ───────────────────────────────────────────────────
type BadgeVariant = 'gold' | 'green' | 'muted' | 'tied'
const badgeStyles: Record<BadgeVariant, string> = {
  gold:  'text-gold border-gold/40 bg-gold/8',
  green: 'text-[#5aaa7a] border-[#5aaa7a]/40 bg-[#5aaa7a]/8',
  muted: 'text-muted2 border-border2',
  tied:  'text-muted2 border-border2',
}
export function Badge({ children, variant = 'muted' }: { children: ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={cn(
      'font-mono text-[9px] tracking-[2px] uppercase px-2.5 py-1 border',
      badgeStyles[variant],
    )}>
      {children}
    </span>
  )
}

// ── BUTTON GOLD ─────────────────────────────────────────────
export function BtnGold({
  children, className, ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button {...props} className={cn(
      'font-mono text-[11px] tracking-[3px] uppercase px-8 py-3.5',
      'bg-gold text-bg border-none cursor-pointer transition-all',
      'hover:bg-gold2 hover:-translate-y-px',
      className,
    )}>
      {children}
    </button>
  )
}

// ── BUTTON GHOST ────────────────────────────────────────────
export function BtnGhost({
  children, className, ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button {...props} className={cn(
      'font-mono text-[11px] tracking-[3px] uppercase px-8 py-3.5',
      'bg-transparent text-muted2 border border-border cursor-pointer transition-all',
      'hover:border-offwhite hover:text-offwhite',
      className,
    )}>
      {children}
    </button>
  )
}

// ── INPUT ────────────────────────────────────────────────────
export function Input({
  label, className, ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-[9px] tracking-[4px] uppercase text-gold">{label}</label>
      <input {...props} className={cn(
        'bg-surface border border-border px-4 py-3',
        'font-serif text-base font-light text-offwhite',
        'outline-none transition-colors placeholder:text-muted',
        'focus:border-gold',
        className,
      )} />
    </div>
  )
}

// ── AVATAR STACK ─────────────────────────────────────────────
export function AvatarStack({ members }: {
  members: { initial: string; color: string }[]
}) {
  return (
    <div className="flex items-center">
      {members.map((m, i) => (
        <div key={i} style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: m.color, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500,
          border: '2px solid var(--bg)',
          marginLeft: i === 0 ? '0' : '-8px',
        }}>
          {m.initial}
        </div>
      ))}
    </div>
  )
}

// ── PROGRESS LINE ────────────────────────────────────────────
export function ProgressLine({ value }: { value: number }) {
  return (
    <div className="w-20 h-px bg-border overflow-hidden">
      <div className="h-full bg-gold transition-all" style={{ width: `${value}%` }} />
    </div>
  )
}
