import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function DELETE(req: NextRequest, context: any) {
  try {
    const sql = getDb()
    await sql`DELETE FROM posts WHERE id = ${context.params.id}`
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: any) {
  try {
    const { body, author } = await req.json()
    if (!body || !author) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const sql = getDb()
    const id = String(Date.now())
    await sql`INSERT INTO replies (id, post_id, body, author) VALUES (${id}, ${context.params.id}, ${body}, ${author})`
    return NextResponse.json({ id })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}