import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    await initDb()
    const username = req.nextUrl.searchParams.get('username')
    if (!username) return NextResponse.json({ error: 'No username' }, { status: 400 })
    const sql = getDb()
    const accounts = await sql`SELECT points, last_points_claim FROM accounts WHERE username = ${username}`
    if (accounts.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { points, last_points_claim } = accounts[0]
    const canClaim = !last_points_claim || Date.now() - new Date(last_points_claim).getTime() > 24 * 60 * 60 * 1000
    const nextClaim = last_points_claim ? new Date(new Date(last_points_claim).getTime() + 24 * 60 * 60 * 1000).toISOString() : null
    return NextResponse.json({ points: points || 0, canClaim, nextClaim })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb()
    const { action, username, toUser, amount } = await req.json()
    const sql = getDb()

    if (action === 'claim') {
      const accounts = await sql`SELECT points, last_points_claim FROM accounts WHERE username = ${username}`
      if (accounts.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const { last_points_claim } = accounts[0]
      if (last_points_claim && Date.now() - new Date(last_points_claim).getTime() < 24 * 60 * 60 * 1000) {
        return NextResponse.json({ error: 'Already claimed today' }, { status: 400 })
      }
      await sql`UPDATE accounts SET points = COALESCE(points, 0) + 10, last_points_claim = NOW() WHERE username = ${username}`
      return NextResponse.json({ ok: true, earned: 10 })
    }

    if (action === 'trade') {
      if (!toUser || !amount || amount < 1) return NextResponse.json({ error: 'Invalid trade' }, { status: 400 })
      const from = await sql`SELECT points FROM accounts WHERE username = ${username}`
      if (from.length === 0 || (from[0].points || 0) < amount) return NextResponse.json({ error: 'Not enough points' }, { status: 400 })
      const to = await sql`SELECT username FROM accounts WHERE username = ${toUser}`
      if (to.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      await sql`UPDATE accounts SET points = COALESCE(points, 0) - ${amount} WHERE username = ${username}`
      await sql`UPDATE accounts SET points = COALESCE(points, 0) + ${amount} WHERE username = ${toUser}`
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
