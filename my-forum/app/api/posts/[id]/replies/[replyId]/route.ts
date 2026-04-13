import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; replyId: string }> }
) {
  try {
    const { replyId } = await params
    const sql = getDb()
    await sql`DELETE FROM replies WHERE id = ${replyId}`
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}