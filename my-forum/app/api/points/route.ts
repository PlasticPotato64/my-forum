import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    await initDb()
    const username = req.nextUrl.searchParams.get('username')
    if (!username) return NextResponse.json({ error: 'No username' }, { status: 400 })
    const sql = getDb()
    const acc = await sql`SELECT points, last_points_claim, streak FROM accounts WHERE username = ${username}`
    if (acc.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { points, last_points_claim, streak } = acc[0]
    const canClaim = !last_points_claim || Date.now() - new Date(last_points_claim).getTime() > 24*60*60*1000
    const nextClaim = last_points_claim ? new Date(new Date(last_points_claim).getTime() + 24*60*60*1000).toISOString() : null
    return NextResponse.json({ points: points || 0, canClaim, nextClaim, streak: streak || 0 })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    await initDb()
    const { action, username, toUser, amount } = await req.json()
    const sql = getDb()
    if (action === 'claim') {
      const acc = await sql`SELECT points, last_points_claim, streak FROM accounts WHERE username = ${username}`
      if (acc.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const { last_points_claim, streak } = acc[0]
      if (last_points_claim && Date.now() - new Date(last_points_claim).getTime() < 24*60*60*1000)
        return NextResponse.json({ error: 'Already claimed today' }, { status: 400 })
      const newStreak = (streak || 0) + 1
      const day = ((newStreak - 1) % 7) + 1
      const earned = day === 7 ? 50 : day === 4 ? 20 : 10
      await sql`UPDATE accounts SET points = COALESCE(points,0) + ${earned}, last_points_claim = NOW(), streak = ${newStreak} WHERE username = ${username}`
      return NextResponse.json({ ok: true, earned, day: newStreak })
    }
    if (action === 'trade') {
      if (!toUser || !amount || amount < 10) return NextResponse.json({ error: 'Minimum 10 Points to send' }, { status: 400 })
      const from = await sql`SELECT points FROM accounts WHERE username = ${username}`
      if (from.length === 0 || (from[0].points || 0) < amount) return NextResponse.json({ error: 'Not enough Points' }, { status: 400 })
      const to = await sql`SELECT username FROM accounts WHERE username = ${toUser}`
      if (to.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      await sql`UPDATE accounts SET points = COALESCE(points,0) - ${amount} WHERE username = ${username}`
      await sql`UPDATE accounts SET points = COALESCE(points,0) + ${amount} WHERE username = ${toUser}`
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
