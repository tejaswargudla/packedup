import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: trip, error } = await supabase
      .from('trips')
      .select('*, members:trip_members(*)')
      .eq('id', params.id)
      .single()
    if (error) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    return NextResponse.json({ trip })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const updates = await req.json()
    const { data: trip, error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', params.id)
      .eq('creator_id', user.id) // only creator can update
      .select().single()
    if (error) throw error
    return NextResponse.json({ trip })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
