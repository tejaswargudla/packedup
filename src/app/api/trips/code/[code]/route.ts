import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: { code: string } }) {
  try {
    const supabase = createClient()
    const { data: trip, error } = await supabase
      .from('trips')
      .select('id, name, destination, start_date, end_date, status, invite_code')
      .eq('invite_code', params.code.toUpperCase())
      .single()
    if (error) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    return NextResponse.json({ trip })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
