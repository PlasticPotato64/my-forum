import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    await initDb()
    const { action, username, password } = await req.json()
    const sql = getDb()

    if (!username || !password) return NextResponse.json({ error: 'Fill in all fields' }, { status: 400 })
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return NextResponse.json({ error: 'Username can only contain letters, numbers and _' }, { status: 400 })

    if (action === 'register') {
      if (username.length < 3) return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
      if (password.length < 4) return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 })
      const existing = await sql`SELECT username FROM accounts WHERE username = ${username.toLowerCase()}`
      if (existing.length > 0) return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      await sql`INSERT INTO accounts (username, password) VALUES (${username.toLowerCase()}, ${password})`
      return NextResponse.json({ username: username.toLowerCase() })
    }

    if (action === 'login') {
      const accounts = await sql`SELECT * FROM accounts WHERE username = ${username.toLowerCase()}`
      if (accounts.length === 0) return NextResponse.json({ error: 'Account not found' }, { status: 400 })
      if (accounts[0].password !== password) return NextResponse.json({ error: 'Wrong password' }, { status: 400 })
      return NextResponse.json({ username: accounts[0].username })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
