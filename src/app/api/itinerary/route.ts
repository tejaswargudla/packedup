import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/itinerary?trip_id=xxx
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const trip_id = req.nextUrl.searchParams.get('trip_id')
    if (!trip_id) return NextResponse.json({ error: 'trip_id required' }, { status: 400 })

    const { data: items, error } = await supabase
      .from('itinerary_items')
      .select('*, suggestion:suggestions(name, description, url, price, board_type)')
      .eq('trip_id', trip_id)
      .order('day_number', { ascending: true })
      .order('sort_order', { ascending: true })
    if (error) throw error

    return NextResponse.json({ items })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/itinerary — add a suggestion to a day
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { trip_id, suggestion_id, day_number, item_date, type, title } = await req.json()

    if (!trip_id || !suggestion_id || !day_number || !item_date || !type || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // sort_order: type band (stay=0, eat=100, visit=200) + count within that type/day
    const TYPE_BASE: Record<string, number> = { stay: 0, eat: 100, visit: 200 }
    const { count } = await supabase
      .from('itinerary_items')
      .select('*', { count: 'exact', head: true })
      .eq('trip_id', trip_id)
      .eq('day_number', day_number)
      .eq('type', type)

    const sort_order = (TYPE_BASE[type] ?? 0) + (count ?? 0)

    const { data: item, error } = await supabase
      .from('itinerary_items')
      .insert({ trip_id, suggestion_id, day_number, item_date, type, title, sort_order })
      .select('*, suggestion:suggestions(name, description, url, price, board_type)')
      .single()
    if (error) throw error

    return NextResponse.json({ item }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
