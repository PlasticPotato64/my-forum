import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sql = getDb()
    await sql`DELETE FROM posts WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { body, author } = await req.json()
    if (!body || !author) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const sql = getDb()
    const replyId = String(Date.now())
    await sql`INSERT INTO replies (id, post_id, body, author) VALUES (${replyId}, ${id}, ${body}, ${author})`
    return NextResponse.json({ id: replyId })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
