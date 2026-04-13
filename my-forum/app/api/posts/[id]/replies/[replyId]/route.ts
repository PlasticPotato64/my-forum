import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function DELETE(req: NextRequest, context: any) {
  try {
    const sql = getDb()
    await sql`DELETE FROM replies WHERE id = ${context.params.replyId}`
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}