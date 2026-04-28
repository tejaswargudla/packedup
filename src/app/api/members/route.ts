import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

// POST /api/members/join — Guest joins a trip by invite code
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { invite_code, display_name } = await req.json()

    if (!invite_code || !display_name) {
      return NextResponse.json({ error: 'Missing invite_code or display_name' }, { status: 400 })
    }

    // Find the trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, name')
      .eq('invite_code', invite_code.toUpperCase())
      .single()
    if (tripError || !trip) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
    }

    // Check if logged-in user
    const { data: { user } } = await supabase.auth.getUser()
    const session_token = nanoid(32)

    // Create member record
    const { data: member, error: memberError } = await supabase
      .from('trip_members')
      .insert({
        trip_id: trip.id,
        user_id: user?.id ?? null,
        display_name: display_name.trim(),
        role: 'member',
        session_token: user ? null : session_token,
      })
      .select().single()
    if (memberError) throw memberError

    return NextResponse.json({ member, trip, session_token: user ? null : session_token }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET /api/members?trip_id=xxx — List members of a trip
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const trip_id = req.nextUrl.searchParams.get('trip_id')
    if (!trip_id) return NextResponse.json({ error: 'trip_id required' }, { status: 400 })

    const { data: members, error } = await supabase
      .from('trip_members')
      .select('*')
      .eq('trip_id', trip_id)
      .order('joined_at', { ascending: true })
    if (error) throw error

    return NextResponse.json({ members })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
