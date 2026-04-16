import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

export async function GET() {
  try {
    await initDb()
    const sql = getDb()
    const posts = await sql`SELECT * FROM posts ORDER BY created_at DESC`
    const replies = await sql`SELECT * FROM replies ORDER BY created_at ASC`
    const accounts = await sql`SELECT username, avatar FROM accounts`
    const titles = await sql`SELECT ut.username, t.name, t.color FROM user_titles ut JOIN titles t ON ut.title_id = t.id WHERE ut.equipped = true`

    const avatarMap: Record<string, string> = {}
    accounts.forEach((a: any) => { avatarMap[a.username] = a.avatar || '' })
    const titleMap: Record<string, { name: string; color: string }> = {}
    titles.forEach((t: any) => { titleMap[t.username] = { name: t.name, color: t.color } })

    const result = posts.map((p: any) => ({
      id: p.id, title: p.title, body: p.body, author: p.author,
      authorAvatar: avatarMap[p.author] || '',
      authorTitle: titleMap[p.author] || null,
      category: p.category, createdAt: p.created_at, media: p.media || '',
      replies: replies.filter((r: any) => r.post_id === p.id).map((r: any) => ({
        id: r.id, body: r.body, author: r.author,
        authorAvatar: avatarMap[r.author] || '',
        createdAt: r.created_at,
      }))
    }))
    return NextResponse.json(result)
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    await initDb()
    const { title, body, author, category, media } = await req.json()
    if (!title || !body || !author || !category) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const sql = getDb()
    const id = String(Date.now())
    await sql`INSERT INTO posts (id, title, body, author, category, media) VALUES (${id}, ${title}, ${body}, ${author}, ${category}, ${media || ''})`
    return NextResponse.json({ id })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
