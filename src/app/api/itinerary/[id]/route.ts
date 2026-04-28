import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// DELETE /api/itinerary/[id] — remove an item from the itinerary
// Uses service role key to bypass RLS (no delete policy exists on itinerary_items)
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { error } = await admin
      .from('itinerary_items')
      .delete()
      .eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
