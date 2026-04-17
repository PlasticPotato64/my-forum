import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

// Odds = 1 in X. Lower = more common. Noob removed as base.
const TITLES = [
  { id: 't2', name: 'Adventurer', odds: 3, color: '#4ade80', price: 15 },
  { id: 't3', name: 'Veteran', odds: 10, color: '#60a5fa', price: 50 },
  { id: 't4', name: 'Elite', odds: 50, color: '#a78bfa', price: 200 },
  { id: 't5', name: 'Legend', odds: 500, color: '#fbbf24', price: 1000 },
  { id: 't6', name: 'Mythic', odds: 5000, color: '#f472b6', price: 5000 },
  { id: 't7', name: 'Celestial', odds: 50000, color: '#38bdf8', price: 25000 },
  { id: 't8', name: 'Divine', odds: 500000, color: '#fb923c', price: 100000 },
  { id: 't9', name: 'Transcendent', odds: 5000000, color: '#f87171', price: 500000 },
  { id: 't10', name: 'Eternal', odds: 50000000, color: '#7c6af7', price: 2000000 },
  { id: 't11', name: 'Omnipotent', odds: 1000000000, color: '#ffffff', price: 10000000 },
]

function roll(luckAdd: number, luckMult: number): typeof TITLES[0] {
  // Each title weight = (1/odds) * mult + add bonus split across all
  const weights = TITLES.map(t => (1 / t.odds) * luckMult + luckAdd / t.odds)
  const total = weights.reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (let i = 0; i < TITLES.length; i++) {
    rand -= weights[i]
    if (rand <= 0) return TITLES[i]
  }
  return TITLES[0]
}

export async function POST(req: NextRequest) {
  try {
    await initDb()
    const { action, username, titleId, potionType } = await req.json()
    const sql = getDb()

    if (action === 'roll') {
      const now = new Date()
      const potions = await sql`SELECT * FROM potions WHERE username = ${username} AND expires_at > ${now.toISOString()}`
      let luckMult = 1
      let luckAdd = 0
      for (const p of potions) {
        if (p.type === 'luck') luckMult *= 2
        if (p.type === 'divine') luckAdd += 50000
        if (p.type === 'divine2') luckAdd += 120000
      }
      const result = roll(luckAdd, luckMult)
      await sql`INSERT INTO user_titles (id, username, title_id) VALUES (${String(Date.now())}, ${username}, ${result.id})`
      return NextResponse.json({ title: result })
    }

    if (action === 'inventory') {
      const inv = await sql`SELECT ut.*, t.name, t.color, t.odds FROM user_titles ut JOIN titles t ON ut.title_id = t.id WHERE ut.username = ${username} ORDER BY ut.acquired_at DESC`
      const potions = await sql`SELECT * FROM potions WHERE username = ${username} AND expires_at > NOW()`
      return NextResponse.json({ inventory: inv, potions })
    }

    if (action === 'equip') {
      await sql`UPDATE user_titles SET equipped = false WHERE username = ${username}`
      await sql`UPDATE user_titles SET equipped = true WHERE id = ${titleId} AND username = ${username}`
      return NextResponse.json({ ok: true })
    }

    if (action === 'unequip') {
      await sql`UPDATE user_titles SET equipped = false WHERE username = ${username}`
      return NextResponse.json({ ok: true })
    }

    if (action === 'sell') {
      const title = await sql`SELECT ut.*, t.id as tid FROM user_titles ut JOIN titles t ON ut.title_id = t.id WHERE ut.id = ${titleId} AND ut.username = ${username}`
      if (title.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const t = TITLES.find(x => x.id === title[0].tid)
      if (!t) return NextResponse.json({ error: 'Title not found' }, { status: 404 })
      const sellPrice = Math.floor(t.price * 0.3)
      await sql`DELETE FROM user_titles WHERE id = ${titleId}`
      await sql`UPDATE accounts SET points = COALESCE(points,0) + ${sellPrice} WHERE username = ${username}`
      return NextResponse.json({ ok: true, earned: sellPrice })
    }

    if (action === 'buyPotion') {
      const costs: Record<string, number> = { luck: 5, speed: 5, divine: 500, divine2: 2000 }
      const durations: Record<string, number> = { luck: 5, speed: 5, divine: 5, divine2: 5 }
      const cost = costs[potionType]
      if (!cost) return NextResponse.json({ error: 'Invalid potion' }, { status: 400 })
      const acc = await sql`SELECT points FROM accounts WHERE username = ${username}`
      if (acc.length === 0 || (acc[0].points || 0) < cost) return NextResponse.json({ error: 'Not enough Points' }, { status: 400 })
      const existing = await sql`SELECT * FROM potions WHERE username = ${username} AND type = ${potionType} AND expires_at > NOW() LIMIT 1`
      const mins = durations[potionType]
      if (existing.length > 0) {
        const newExpiry = new Date(new Date(existing[0].expires_at).getTime() + mins * 60000).toISOString()
        await sql`UPDATE potions SET expires_at = ${newExpiry} WHERE id = ${existing[0].id}`
      } else {
        const expiry = new Date(Date.now() + mins * 60000).toISOString()
        await sql`INSERT INTO potions (id, username, type, expires_at) VALUES (${String(Date.now())}, ${username}, ${potionType}, ${expiry})`
      }
      await sql`UPDATE accounts SET points = COALESCE(points,0) - ${cost} WHERE username = ${username}`
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
