import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/suggestions — Add a suggestion
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const body = await req.json()
    const { trip_id, member_id, board_type, name, description, url, price } = body

    if (!trip_id || !member_id || !board_type || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: suggestion, error } = await supabase
      .from('suggestions')
      .insert({ trip_id, member_id, board_type, name, description, url, price, is_finalized: false })
      .select('*, member:trip_members(display_name)')
      .single()
    if (error) throw error

    return NextResponse.json({ suggestion }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET /api/suggestions?trip_id=xxx&board=stay — List suggestions
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const trip_id = req.nextUrl.searchParams.get('trip_id')
    const board = req.nextUrl.searchParams.get('board')
    if (!trip_id) return NextResponse.json({ error: 'trip_id required' }, { status: 400 })

    let query = supabase
      .from('suggestions')
      .select('*, member:trip_members(display_name), votes(*)')
      .eq('trip_id', trip_id)
      .order('created_at', { ascending: false })

    if (board) query = query.eq('board_type', board)

    const { data: suggestions, error } = await query
    if (error) throw error

    // Compute vote counts
    const withCounts = suggestions.map((s: any) => ({
      ...s,
      vote_count: {
        up: s.votes?.filter((v: any) => v.value === 'up').length ?? 0,
        down: s.votes?.filter((v: any) => v.value === 'down').length ?? 0,
      },
    }))

    return NextResponse.json({ suggestions: withCounts })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
