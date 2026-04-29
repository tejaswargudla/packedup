import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// DELETE /api/members/[id] — creator removes a member from their trip
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { requester_member_id } = await req.json()

    if (!requester_member_id) {
      return NextResponse.json({ error: 'Missing requester_member_id' }, { status: 400 })
    }

    // Fetch the member to remove
    const { data: target, error: targetErr } = await supabase
      .from('trip_members')
      .select('id, trip_id, role')
      .eq('id', params.id)
      .single()
    if (targetErr || !target) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Fetch the requester — must be creator of the same trip
    const { data: requester, error: reqErr } = await supabase
      .from('trip_members')
      .select('id, trip_id, role')
      .eq('id', requester_member_id)
      .single()
    if (reqErr || !requester) {
      return NextResponse.json({ error: 'Requester not found' }, { status: 403 })
    }

    if (requester.role !== 'creator' || requester.trip_id !== target.trip_id) {
      return NextResponse.json({ error: 'Only the trip creator can remove members' }, { status: 403 })
    }

    if (target.role === 'creator') {
      return NextResponse.json({ error: 'Cannot remove the trip creator' }, { status: 400 })
    }

    const { error: deleteErr } = await supabase
      .from('trip_members')
      .delete()
      .eq('id', params.id)
    if (deleteErr) throw deleteErr

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
