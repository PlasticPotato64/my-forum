import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    await initDb()
    const username = req.nextUrl.searchParams.get('username')
    if (!username) return NextResponse.json({ error: 'No username' }, { status: 400 })
    const sql = getDb()
    const incoming = await sql`SELECT * FROM friend_requests WHERE to_user = ${username} AND status = 'pending' ORDER BY created_at DESC`
    const friends = await sql`SELECT * FROM friend_requests WHERE (from_user = ${username} OR to_user = ${username}) AND status = 'accepted'`
    const friendNames = friends.map((f: any) => f.from_user === username ? f.to_user : f.from_user)
    const sent = await sql`SELECT * FROM friend_requests WHERE from_user = ${username} AND status = 'pending'`
    return NextResponse.json({ incoming, friends: friendNames, sent })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb()
    const { action, from, to, requestId } = await req.json()
    const sql = getDb()

    if (action === 'send') {
      if (from === to) return NextResponse.json({ error: "Can't add yourself" }, { status: 400 })
      const existing = await sql`SELECT id FROM friend_requests WHERE ((from_user = ${from} AND to_user = ${to}) OR (from_user = ${to} AND to_user = ${from}))`
      if (existing.length > 0) return NextResponse.json({ error: 'Request already exists' }, { status: 400 })
      const toUser = await sql`SELECT username FROM accounts WHERE username = ${to}`
      if (toUser.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      await sql`INSERT INTO friend_requests (id, from_user, to_user) VALUES (${String(Date.now())}, ${from}, ${to})`
      return NextResponse.json({ ok: true })
    }

    if (action === 'accept') {
      await sql`UPDATE friend_requests SET status = 'accepted' WHERE id = ${requestId}`
      return NextResponse.json({ ok: true })
    }

    if (action === 'decline') {
      await sql`DELETE FROM friend_requests WHERE id = ${requestId}`
      return NextResponse.json({ ok: true })
    }

    if (action === 'remove') {
      await sql`DELETE FROM friend_requests WHERE (from_user = ${from} AND to_user = ${to}) OR (from_user = ${to} AND to_user = ${from})`
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
