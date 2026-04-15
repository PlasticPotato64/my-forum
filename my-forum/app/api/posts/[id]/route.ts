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
    if (body.length > 500) return NextResponse.json({ error: 'Reply too long (max 500 chars)' }, { status: 400 })
    const sql = getDb()
    const existing = await sql`SELECT COUNT(*) as count FROM replies WHERE post_id = ${id}`
    if (parseInt(existing[0].count) >= 50) return NextResponse.json({ error: 'Reply limit reached (50 max)' }, { status: 400 })
    const replyId = String(Date.now())
    await sql`INSERT INTO replies (id, post_id, body, author) VALUES (${replyId}, ${id}, ${body}, ${author})`
    return NextResponse.json({ id: replyId })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
