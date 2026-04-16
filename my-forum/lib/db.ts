import { neon } from '@neondatabase/serverless'
export function getDb() { return neon(process.env.DATABASE_URL!) }
export async function initDb() {
  const sql = getDb()
  await sql`CREATE TABLE IF NOT EXISTS accounts (username TEXT PRIMARY KEY, password TEXT NOT NULL, avatar TEXT DEFAULT '', bio TEXT DEFAULT '', points INT DEFAULT 0, last_points_claim TIMESTAMPTZ, streak INT DEFAULT 0, theme TEXT DEFAULT 'dark', created_at TIMESTAMPTZ DEFAULT NOW())`
  await sql`CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL, author TEXT NOT NULL, category TEXT NOT NULL, media TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT NOW())`
  await sql`CREATE TABLE IF NOT EXISTS replies (id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE, body TEXT NOT NULL, author TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())`
  await sql`CREATE TABLE IF NOT EXISTS friend_requests (id TEXT PRIMARY KEY, from_user TEXT NOT NULL, to_user TEXT NOT NULL, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW())`
  await sql`CREATE TABLE IF NOT EXISTS titles (id TEXT PRIMARY KEY, name TEXT NOT NULL, rarity TEXT NOT NULL, odds BIGINT NOT NULL, color TEXT NOT NULL)`
  await sql`CREATE TABLE IF NOT EXISTS user_titles (id TEXT PRIMARY KEY, username TEXT NOT NULL, title_id TEXT NOT NULL, equipped BOOLEAN DEFAULT false, acquired_at TIMESTAMPTZ DEFAULT NOW())`
  await sql`CREATE TABLE IF NOT EXISTS potions (id TEXT PRIMARY KEY, username TEXT NOT NULL, type TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL)`
  await sql`CREATE TABLE IF NOT EXISTS dms (id TEXT PRIMARY KEY, from_user TEXT NOT NULL, to_user TEXT NOT NULL, body TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())`
  await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT ''`
  await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT ''`
  await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS points INT DEFAULT 0`
  await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS last_points_claim TIMESTAMPTZ`
  await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS streak INT DEFAULT 0`
  await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark'`
  await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS media TEXT DEFAULT ''`
  await sql`INSERT INTO titles (id, name, rarity, odds, color) VALUES
    ('t1','Noob','Common',2,'#9ca3af'),
    ('t2','Adventurer','Uncommon',10,'#4ade80'),
    ('t3','Veteran','Rare',50,'#60a5fa'),
    ('t4','Elite','Epic',500,'#a78bfa'),
    ('t5','Legend','Legendary',5000,'#fbbf24'),
    ('t6','Mythic','Mythic',50000,'#f472b6'),
    ('t7','Celestial','Celestial',500000,'#38bdf8'),
    ('t8','Divine','Divine',5000000,'#fb923c'),
    ('t9','Transcendent','Transcendent',50000000,'#f87171'),
    ('t10','Eternal','Eternal',500000000,'#7c6af7'),
    ('t11','Omnipotent','Omnipotent',1000000000,'#ffffff')
  ON CONFLICT (id) DO NOTHING`
}
