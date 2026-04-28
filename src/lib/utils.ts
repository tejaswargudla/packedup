import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInDays } from 'date-fns'

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a random 7-char invite code like "GOACREW"
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 7 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

// Format date range: "Dec 20 – 26, 2025"
export function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${format(s, 'MMM d')} – ${format(e, 'd, yyyy')}`
  }
  return `${format(s, 'MMM d')} – ${format(e, 'MMM d, yyyy')}`
}

// Trip duration in days
export function tripDuration(start: string, end: string): number {
  return differenceInDays(new Date(end), new Date(start)) + 1
}

// Board display config
export const BOARD_CONFIG = {
  stay:  { label: 'Where to Stay', emoji: '🏨', color: 'accent'  },
  eat:   { label: 'Where to Eat',  emoji: '🍽️', color: 'forest'  },
  visit: { label: 'Places to Visit', emoji: '📍', color: 'ocean' },
} as const

// Session token key in localStorage
export const SESSION_KEY = 'packedup_guest_session'
