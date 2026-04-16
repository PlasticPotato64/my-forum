import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    await initDb()
    const { action, username, newUsername } = await req.json()
    const sql = getDb()

    if (action === 'changeUsername') {
      if (!newUsername || newUsername.length < 3 || newUsername.length > 16) return NextResponse.json({ error: 'Username must be 3-16 characters' }, { status: 400 })
      if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) return NextResponse.json({ error: 'Invalid characters' }, { status: 400 })
      const acc = await sql`SELECT points FROM accounts WHERE username = ${username}`
      if (acc.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      if ((acc[0].points || 0) < 50) return NextResponse.json({ error: 'Not enough Points (need 50)' }, { status: 400 })
      const existing = await sql`SELECT username FROM accounts WHERE username = ${newUsername}`
      if (existing.length > 0) return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      // Update username everywhere
      await sql`UPDATE accounts SET username = ${newUsername}, points = points - 50 WHERE username = ${username}`
      await sql`UPDATE posts SET author = ${newUsername} WHERE author = ${username}`
      await sql`UPDATE replies SET author = ${newUsername} WHERE author = ${username}`
      await sql`UPDATE user_titles SET username = ${newUsername} WHERE username = ${username}`
      await sql`UPDATE potions SET username = ${newUsername} WHERE username = ${username}`
      await sql`UPDATE friend_requests SET from_user = ${newUsername} WHERE from_user = ${username}`
      await sql`UPDATE friend_requests SET to_user = ${newUsername} WHERE to_user = ${username}`
      await sql`UPDATE dms SET from_user = ${newUsername} WHERE from_user = ${username}`
      await sql`UPDATE dms SET to_user = ${newUsername} WHERE to_user = ${username}`
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
