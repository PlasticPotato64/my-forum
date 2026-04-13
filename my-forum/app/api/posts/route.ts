import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

export async function GET() {
  try {
    await initDb()
    const sql = getDb()
    const posts = await sql`SELECT * FROM posts ORDER BY created_at DESC`
    const replies = await sql`SELECT * FROM replies ORDER BY created_at ASC`

    const result = posts.map((p: any) => ({
      id: p.id,
      title: p.title,
      body: p.body,
      author: p.author,
      category: p.category,
      createdAt: p.created_at,
      replies: replies
        .filter((r: any) => r.post_id === p.id)
        .map((r: any) => ({
          id: r.id,
          body: r.body,
          author: r.author,
          createdAt: r.created_at,
        }))
    }))

    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb()
    const { title, body, author, category } = await req.json()
    if (!title || !body || !author || !category) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const sql = getDb()
    const id = String(Date.now())
    await sql`INSERT INTO posts (id, title, body, author, category) VALUES (${id}, ${title}, ${body}, ${author}, ${category})`
    return NextResponse.json({ id })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
