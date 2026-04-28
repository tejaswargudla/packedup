import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { generateInviteCode } from '@/lib/utils'
import { nanoid } from 'nanoid'

// POST /api/trips — Create a new trip (supports guest and authenticated creators)
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { name, destination, start_date, end_date, creator_name } = await req.json()
    if (!name || !destination || !start_date || !end_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!user && !creator_name?.trim()) {
      return NextResponse.json({ error: 'creator_name is required' }, { status: 400 })
    }

    // Service role client bypasses RLS — needed because guest creators have no auth.uid()
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Generate unique invite code
    let invite_code = generateInviteCode()
    let attempts = 0
    while (attempts < 5) {
      const { data: existing } = await admin
        .from('trips').select('id').eq('invite_code', invite_code).single()
      if (!existing) break
      invite_code = generateInviteCode()
      attempts++
    }

    // Create trip — creator_id is null for guest creators
    const { data: trip, error: tripError } = await admin
      .from('trips')
      .insert({ name, destination, start_date, end_date, invite_code, creator_id: user?.id ?? null, status: 'planning' })
      .select().single()
    if (tripError) throw tripError

    // Add creator as member with a session_token if guest
    const session_token = user ? null : nanoid(32)
    const display_name = user ? (user.user_metadata?.name || 'Trip Creator') : creator_name.trim()
    const { data: member, error: memberError } = await admin
      .from('trip_members')
      .insert({ trip_id: trip.id, user_id: user?.id ?? null, display_name, role: 'creator', session_token })
      .select().single()
    if (memberError) throw memberError

    return NextResponse.json({ trip, member, session_token }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET /api/trips — List user's trips
export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: trips, error } = await supabase
      .from('trips')
      .select('*, members:trip_members(count)')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })
    if (error) throw error

    return NextResponse.json({ trips })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
