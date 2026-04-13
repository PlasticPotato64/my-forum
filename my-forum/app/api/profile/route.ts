import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    await initDb()
    const username = req.nextUrl.searchParams.get('username')
    if (!username) return NextResponse.json({ error: 'No username' }, { status: 400 })
    const sql = getDb()
    const accounts = await sql`SELECT username, avatar, bio, created_at FROM accounts WHERE username = ${username.toLowerCase()}`
    if (accounts.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const posts = await sql`SELECT * FROM posts WHERE author = ${username.toLowerCase()} ORDER BY created_at DESC`
    const replies = await sql`SELECT * FROM replies ORDER BY created_at ASC`
    const postsWithReplies = posts.map((p: any) => ({
      id: p.id,
      title: p.title,
      body: p.body,
      author: p.author,
      category: p.category,
      createdAt: p.created_at,
      replies: replies.filter((r: any) => r.post_id === p.id).map((r: any) => ({
        id: r.id, body: r.body, author: r.author, createdAt: r.created_at,
      }))
    }))
    return NextResponse.json({
      username: accounts[0].username,
      avatar: accounts[0].avatar || '',
      bio: accounts[0].bio || '',
      createdAt: accounts[0].created_at,
      posts: postsWithReplies,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username, avatar, bio } = await req.json()
    if (!username) return NextResponse.json({ error: 'No username' }, { status: 400 })
    const sql = getDb()
    await sql`UPDATE accounts SET avatar = ${avatar || ''}, bio = ${bio || ''} WHERE username = ${username.toLowerCase()}`
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
