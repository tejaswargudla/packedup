import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/suggestions/[id]/finalize — Mark suggestion as winner
export async function PATCH(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    // Get the suggestion to know trip_id and board_type
    const { data: suggestion, error: fetchError } = await supabase
      .from('suggestions')
      .select('*')
      .eq('id', params.id)
      .single()
    if (fetchError || !suggestion) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })
    }

    // Unfinalize any existing winner on same board
    await supabase
      .from('suggestions')
      .update({ is_finalized: false })
      .eq('trip_id', suggestion.trip_id)
      .eq('board_type', suggestion.board_type)

    // Finalize this suggestion
    const { data: updated, error } = await supabase
      .from('suggestions')
      .update({ is_finalized: true })
      .eq('id', params.id)
      .select().single()
    if (error) throw error

    // Auto-create itinerary item
    const { data: trip } = await supabase
      .from('trips')
      .select('start_date')
      .eq('id', suggestion.trip_id)
      .single()

    if (trip) {
      await supabase.from('itinerary_items').upsert({
        trip_id: suggestion.trip_id,
        suggestion_id: params.id,
        day_number: 1,
        item_date: trip.start_date,
        type: suggestion.board_type,
        title: suggestion.name,
        sort_order: suggestion.board_type === 'stay' ? 0 : suggestion.board_type === 'eat' ? 1 : 2,
      })
    }

    return NextResponse.json({ suggestion: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
