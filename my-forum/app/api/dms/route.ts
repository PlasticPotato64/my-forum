import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    await initDb()
    const user = req.nextUrl.searchParams.get('user')
    const other = req.nextUrl.searchParams.get('other')
    if (!user || !other) return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    const sql = getDb()
    // Auto-delete messages over 3 days old
    await sql`DELETE FROM dms WHERE created_at < NOW() - INTERVAL '3 days'`
    const messages = await sql`SELECT * FROM dms WHERE (from_user = ${user} AND to_user = ${other}) OR (from_user = ${other} AND to_user = ${user}) ORDER BY created_at ASC`
    return NextResponse.json(messages)
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    await initDb()
    const { from, to, body } = await req.json()
    if (!from || !to || !body) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    if (body.length > 5000) return NextResponse.json({ error: 'Message too long (max 5000 chars)' }, { status: 400 })
    // Check they are friends
    const sql = getDb()
    const friends = await sql`SELECT id FROM friend_requests WHERE ((from_user = ${from} AND to_user = ${to}) OR (from_user = ${to} AND to_user = ${from})) AND status = 'accepted'`
    if (friends.length === 0) return NextResponse.json({ error: 'You must be friends to DM' }, { status: 403 })
    const id = String(Date.now())
    await sql`INSERT INTO dms (id, from_user, to_user, body) VALUES (${id}, ${from}, ${to}, ${body})`
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
