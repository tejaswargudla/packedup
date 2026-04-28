import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/votes — Cast or update a vote
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { suggestion_id, member_id, value } = await req.json()

    if (!suggestion_id || !member_id || !value) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Upsert — one vote per member per suggestion
    const { data: vote, error } = await supabase
      .from('votes')
      .upsert(
        { suggestion_id, member_id, value },
        { onConflict: 'suggestion_id,member_id' }
      )
      .select().single()
    if (error) throw error

    return NextResponse.json({ vote })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/votes?suggestion_id=xxx&member_id=xxx — Remove a vote
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient()
    const suggestion_id = req.nextUrl.searchParams.get('suggestion_id')
    const member_id = req.nextUrl.searchParams.get('member_id')
    if (!suggestion_id || !member_id) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('suggestion_id', suggestion_id)
      .eq('member_id', member_id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
