import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Trip, TripMember, GuestSession } from '@/types'

interface AppState {
  // Current trip context
  currentTrip: Trip | null
  currentMember: TripMember | null
  guestSession: GuestSession | null

  // Actions
  setCurrentTrip: (trip: Trip | null) => void
  setCurrentMember: (member: TripMember | null) => void
  setGuestSession: (session: GuestSession | null) => void
  clearSession: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentTrip: null,
      currentMember: null,
      guestSession: null,

      setCurrentTrip: (trip) => set({ currentTrip: trip }),
      setCurrentMember: (member) => set({ currentMember: member }),
      setGuestSession: (session) => set({ guestSession: session }),
      clearSession: () => set({
        currentTrip: null,
        currentMember: null,
        guestSession: null,
      }),
    }),
    {
      name: 'packedup-store',
      // Only persist guest session to localStorage
      partialize: (state) => ({ guestSession: state.guestSession }),
    }
  )
)
