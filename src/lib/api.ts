import type {
  Trip, TripMember, Suggestion, Vote, ItineraryItem,
  CreateTripInput, JoinTripInput, CreateSuggestionInput,
  CastVoteInput, AddItineraryInput, BoardType
} from '@/types'

const BASE = '/api'

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

// ─── Trips ───────────────────────────────────────────────────

export const tripsApi = {
  create: (data: CreateTripInput) =>
    req<{ trip: Trip; member: TripMember; session_token: string | null }>('/trips', {
      method: 'POST', body: JSON.stringify(data),
    }),

  getById: (id: string) =>
    req<{ trip: Trip }>(`/trips/${id}`),

  getByCode: (code: string) =>
    req<{ trip: Trip }>(`/trips/code/${code}`),

  update: (id: string, data: Partial<Trip>) =>
    req<{ trip: Trip }>(`/trips/${id}`, {
      method: 'PATCH', body: JSON.stringify(data),
    }),
}

// ─── Members ─────────────────────────────────────────────────

export const membersApi = {
  join: (data: JoinTripInput) =>
    req<{ member: TripMember; trip: Trip; session_token: string | null }>('/members/join', {
      method: 'POST', body: JSON.stringify(data),
    }),

  list: (tripId: string) =>
    req<{ members: TripMember[] }>(`/members?trip_id=${tripId}`),

  remove: (memberId: string, requesterMemberId: string) =>
    req<{ success: boolean }>(`/members/${memberId}`, {
      method: 'DELETE',
      body: JSON.stringify({ requester_member_id: requesterMemberId }),
    }),
}

// ─── Suggestions ─────────────────────────────────────────────

export const suggestionsApi = {
  create: (data: CreateSuggestionInput) =>
    req<{ suggestion: Suggestion }>('/suggestions', {
      method: 'POST', body: JSON.stringify(data),
    }),

  list: (tripId: string, board?: BoardType) =>
    req<{ suggestions: Suggestion[] }>(
      `/suggestions?trip_id=${tripId}${board ? `&board=${board}` : ''}`
    ),

  finalize: (id: string) =>
    req<{ suggestion: Suggestion }>(`/suggestions/${id}/finalize`, {
      method: 'PATCH',
    }),

  delete: (id: string) =>
    req<void>(`/suggestions/${id}`, { method: 'DELETE' }),
}

// ─── Votes ───────────────────────────────────────────────────

export const votesApi = {
  cast: (data: CastVoteInput) =>
    req<{ vote: Vote }>('/votes', {
      method: 'POST', body: JSON.stringify(data),
    }),

  remove: (suggestionId: string, memberId: string) =>
    req<void>(`/votes?suggestion_id=${suggestionId}&member_id=${memberId}`, { method: 'DELETE' }),
}

// ─── Itinerary ───────────────────────────────────────────────

export const itineraryApi = {
  get: (tripId: string) =>
    req<{ items: ItineraryItem[] }>(`/itinerary?trip_id=${tripId}`),

  add: (data: AddItineraryInput) =>
    req<{ item: ItineraryItem }>('/itinerary', {
      method: 'POST', body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    req<{ success: boolean }>(`/itinerary/${id}`, { method: 'DELETE' }),
}
