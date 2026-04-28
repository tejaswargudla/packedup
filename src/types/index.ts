// ─── Database Types ───────────────────────────────────────────

export type BoardType = 'stay' | 'eat' | 'visit'
export type TripStatus = 'planning' | 'finalized' | 'completed'
export type MemberRole = 'creator' | 'member'
export type VoteValue = 'up' | 'down'

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  provider: string
  created_at: string
}

export interface Trip {
  id: string
  creator_id: string | null
  name: string
  destination: string
  start_date: string
  end_date: string
  invite_code: string
  status: TripStatus
  created_at: string
  // joined
  members?: TripMember[]
  creator?: User
}

export interface TripMember {
  id: string
  trip_id: string
  user_id?: string          // null for guest members
  display_name: string
  role: MemberRole
  session_token?: string    // identifies guest across sessions
  joined_at: string
}

export interface Suggestion {
  id: string
  trip_id: string
  member_id: string
  board_type: BoardType
  name: string
  description?: string
  url?: string
  price?: string
  is_finalized: boolean
  created_at: string
  // joined
  member?: TripMember
  votes?: Vote[]
  vote_count?: { up: number; down: number }
}

export interface Vote {
  id: string
  suggestion_id: string
  member_id: string
  value: VoteValue
  created_at: string
}

export interface ItineraryItem {
  id: string
  trip_id: string
  suggestion_id?: string
  day_number: number
  item_date: string
  type: BoardType | 'travel'
  title: string
  sort_order: number
  // joined
  suggestion?: Suggestion
}

// ─── API Request / Response Types ────────────────────────────

export interface CreateTripInput {
  name: string
  destination: string
  start_date: string
  end_date: string
  creator_name: string
}

export interface JoinTripInput {
  invite_code: string
  display_name: string
}

export interface CreateSuggestionInput {
  trip_id: string
  member_id: string
  board_type: BoardType
  name: string
  description?: string
  url?: string
  price?: string
}

export interface AddItineraryInput {
  trip_id: string
  suggestion_id: string
  day_number: number
  item_date: string
  type: BoardType
  title: string
}

export interface CastVoteInput {
  suggestion_id: string
  member_id: string
  value: VoteValue
}

// ─── UI / State Types ─────────────────────────────────────────

export interface GuestSession {
  member_id: string
  trip_id: string
  display_name: string
  session_token: string
}
