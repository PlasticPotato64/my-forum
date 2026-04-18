import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'
import { TITLES } from '@/lib/titles'

// PROPER ROLL MATH:
// Base weight for each title = 1/odds (so rarer = smaller weight)
// Luck multiplier applies UNIFORMLY across all titles (2x luck = everything 2x more likely, same ratios)
// Luck add = added flat to each title's BASE chance (boosts rare titles proportionally MORE)
// e.g. Wanderer base = 1/3 = 0.333, Omnipotent base = 1/1M = 0.000001
// With +120K luck add: Wanderer = 0.333 + 0.000001*120000 = 0.333 + 0.12 = 0.453 (36% boost)
//                      Omnipotent = 0.000001 + 0.000001*120000 = 0.000001*120001 = 0.12 (120001x boost!)
// So divine potions massively boost rare titles relative to common ones

function roll(luckAdd: number, luckMult: number): typeof TITLES[0] {
  const weights = TITLES.map(t => {
    const base = 1 / t.odds
    return (base + base * luckAdd) * luckMult
  })
  const total = weights.reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (let i = 0; i < TITLES.length; i++) {
    rand -= weights[i]
    if (rand <= 0) return TITLES[i]
  }
  return TITLES[TITLES.length - 1]
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
      const inv = await sql`SELECT ut.*, t.name, t.color, t.odds FROM user_titles ut JOIN titles t ON ut.title_id = t.id WHERE ut.username = ${username} ORDER BY t.odds DESC`
      const potions = await sql`SELECT * FROM potions WHERE username = ${username} AND expires_at > NOW()`
      // Attach sell prices from TITLES
      const invWithPrice = inv.map((item: any) => {
        const t = TITLES.find(x => x.id === item.title_id)
        return { ...item, sellPrice: t?.sellPrice || 0 }
      })
      return NextResponse.json({ inventory: invWithPrice, potions })
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
      const rows = await sql`SELECT ut.*, t.id as tid FROM user_titles ut JOIN titles t ON ut.title_id = t.id WHERE ut.id = ${titleId} AND ut.username = ${username}`
      if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const t = TITLES.find(x => x.id === rows[0].tid)
      if (!t) return NextResponse.json({ error: 'Title not found' }, { status: 404 })
      await sql`DELETE FROM user_titles WHERE id = ${titleId}`
      await sql`UPDATE accounts SET points = COALESCE(points,0) + ${t.sellPrice} WHERE username = ${username}`
      return NextResponse.json({ ok: true, earned: t.sellPrice })
    }

    if (action === 'buyPotion') {
      const costs: Record<string, number> = { luck: 5, speed: 5, divine: 500, divine2: 2000 }
      const cost = costs[potionType]
      if (!cost) return NextResponse.json({ error: 'Invalid potion' }, { status: 400 })
      const acc = await sql`SELECT points FROM accounts WHERE username = ${username}`
      if (acc.length === 0 || (acc[0].points || 0) < cost) return NextResponse.json({ error: 'Not enough Points' }, { status: 400 })
      const existing = await sql`SELECT * FROM potions WHERE username = ${username} AND type = ${potionType} AND expires_at > NOW() LIMIT 1`
      const expiry = existing.length > 0
        ? new Date(new Date(existing[0].expires_at).getTime() + 5 * 60000).toISOString()
        : new Date(Date.now() + 5 * 60000).toISOString()
      if (existing.length > 0) {
        await sql`UPDATE potions SET expires_at = ${expiry} WHERE id = ${existing[0].id}`
      } else {
        await sql`INSERT INTO potions (id, username, type, expires_at) VALUES (${String(Date.now())}, ${username}, ${potionType}, ${expiry})`
      }
      await sql`UPDATE accounts SET points = COALESCE(points,0) - ${cost} WHERE username = ${username}`
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
