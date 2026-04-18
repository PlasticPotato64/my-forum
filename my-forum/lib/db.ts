import { neon } from '@neondatabase/serverless'
import { TITLES } from './titles'

export function getDb() { return neon(process.env.DATABASE_URL!) }

export async function initDb() {
  const sql = getDb()
  await sql`CREATE TABLE IF NOT EXISTS accounts (username TEXT PRIMARY KEY, password TEXT NOT NULL, avatar TEXT DEFAULT '', bio TEXT DEFAULT '', points INT DEFAULT 0, last_points_claim TIMESTAMPTZ, streak INT DEFAULT 0, theme TEXT DEFAULT 'dark', created_at TIMESTAMPTZ DEFAULT NOW())`
  await sql`CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL, author TEXT NOT NULL, category TEXT NOT NULL, media TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT NOW())`
  await sql`CREATE TABLE IF NOT EXISTS replies (id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE, body TEXT NOT NULL, author TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())`
  await sql`CREATE TABLE IF NOT EXISTS friend_requests (id TEXT PRIMARY KEY, from_user TEXT NOT NULL, to_user TEXT NOT NULL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW())`
  await sql`CREATE TABLE IF NOT EXISTS titles (id TEXT PRIMARY KEY, name TEXT NOT NULL, odds BIGINT NOT NULL, color TEXT NOT NULL)`
  await sql`CREATE TABLE IF NOT EXISTS user_titles (id TEXT PRIMARY KEY, username TEXT NOT NULL, title_id TEXT NOT NULL REFERENCES titles(id) ON DELETE CASCADE, equipped BOOLEAN DEFAULT false, acquired_at TIMESTAMPTZ DEFAULT NOW())`
  await sql`CREATE TABLE IF NOT EXISTS potions (id TEXT PRIMARY KEY, username TEXT NOT NULL, type TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL)`
  await sql`CREATE TABLE IF NOT EXISTS dms (id TEXT PRIMARY KEY, from_user TEXT NOT NULL, to_user TEXT NOT NULL, body TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())`
  // Columns
  await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT ''`
  await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT ''`
  await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS points INT DEFAULT 0`
  await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS last_points_claim TIMESTAMPTZ`
  await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS streak INT DEFAULT 0`
  await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark'`
  await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS media TEXT DEFAULT ''`
  // Seed all 50 titles
  for (const t of TITLES) {
    await sql`INSERT INTO titles (id, name, odds, color) VALUES (${t.id}, ${t.name}, ${t.odds}, ${t.color}) ON CONFLICT (id) DO UPDATE SET name = ${t.name}, odds = ${t.odds}, color = ${t.color}`
  }
}
