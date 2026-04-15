import { neon } from '@neondatabase/serverless'

export function getDb() {
  return neon(process.env.DATABASE_URL!)
}

export async function initDb() {
  const sql = getDb()
  await sql`CREATE TABLE IF NOT EXISTS accounts (username TEXT PRIMARY KEY, password TEXT NOT NULL, avatar TEXT DEFAULT '', bio TEXT DEFAULT '', points INT DEFAULT 0, last_points_claim TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW())`
  await sql`CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL, author TEXT NOT NULL, category TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())`
  await sql`CREATE TABLE IF NOT EXISTS replies (id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE, body TEXT NOT NULL, author TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())`
  await sql`CREATE TABLE IF NOT EXISTS friend_requests (id TEXT PRIMARY KEY, from_user TEXT NOT NULL, to_user TEXT NOT NULL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW())`
  await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT ''`
  await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT ''`
  await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS points INT DEFAULT 0`
  await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS last_points_claim TIMESTAMPTZ`
}
