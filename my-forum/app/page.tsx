'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import Avatar from '@/components/Avatar'
import { categoryColor, timeAgo } from '@/lib/utils'

type Post = { id: string; title: string; body: string; author: string; authorAvatar: string; authorTitle: { name: string; color: string } | null; category: string; createdAt: string; replies: any[] }

export default function Home() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [userResults, setUserResults] = useState<any[]>([])

  async function loadPosts() {
    const res = await fetch('/api/posts')
    const data = await res.json()
    setPosts(data); setLoading(false)
  }

  useEffect(() => { loadPosts() }, [])

  useEffect(() => {
    if (!search.trim()) { setUserResults([]); return }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/auth?search=${encodeURIComponent(search)}`)
      if (res.ok) setUserResults(await res.json())
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  async function deletePost(id: string) {
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    loadPosts()
  }

  return (
    <div style={{ display: 'flex', gap: '24px', paddingTop: '32px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ paddingBottom: '24px', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,5vw,46px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '8px' }}>
            Community<br /><span style={{ color: 'var(--accent2)' }}>Threads</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '13px' }}>{posts.length} threads</p>
        </div>
        {loading ? (
          <p style={{ color: 'var(--text3)', textAlign: 'center', paddingTop: '40px' }}>loading...</p>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
            <p style={{ marginBottom: '16px' }}>No threads yet.</p>
            <Link href="/forum/new" style={{ color: 'var(--accent2)' }}>Be the first to post →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {posts.map((post, i) => (
              <div key={post.id} style={{ position: 'relative' }}>
                <Link href={`/forum/${post.id}`}>
                  <div style={{ padding: '16px 18px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', transition: 'all 0.15s', cursor: 'pointer', animation: 'fadeUp 0.3s ease both', animationDelay: `${i * 0.04}s` }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor='var(--border2)'; el.style.background='var(--bg3)'; el.style.transform='translateY(-1px)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor='var(--border)'; el.style.background='var(--bg2)'; el.style.transform='translateY(0)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ marginBottom: '5px' }}>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: `${categoryColor(post.category)}20`, color: categoryColor(post.category), border: `1px solid ${categoryColor(post.category)}40`, fontWeight: 500 }}>{post.category}</span>
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px', lineHeight: 1.3 }}>{post.title}</h2>
                        <p style={{ color: 'var(--text2)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.body}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '12px', color: post.replies.length > 0 ? 'var(--accent2)' : 'var(--text3)', fontWeight: 500, marginBottom: '2px' }}>{post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{timeAgo(post.createdAt)}</div>
                      </div>
                    </div>
                    {/* Author line - title tag inline, no box */}
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Avatar username={post.author} avatar={post.authorAvatar} size={18} />
                      {post.authorTitle && (
                        <span style={{ fontSize: '11px', color: post.authorTitle.color, fontWeight: 600 }}>
                          [{post.authorTitle.name}]
                        </span>
                      )}
                      <span style={{ fontSize: '11px', color: 'var(--text2)' }}>{post.author}</span>
                    </div>
                  </div>
                </Link>
                {user?.username === 'admin' && (
                  <button onClick={() => deletePost(post.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '10px', cursor: 'pointer', fontFamily: 'var(--font-mono)', zIndex: 10 }}>delete</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div style={{ width: '210px', flexShrink: 0, paddingTop: '4px' }}>
        <div style={{ position: 'sticky', top: '72px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: 'var(--text2)' }}>Find Users</h3>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search username..." style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '7px 10px', color: 'var(--text)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
              onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
            {search && (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {userResults.length === 0 && <p style={{ fontSize: '11px', color: 'var(--text3)', padding: '4px' }}>No users found</p>}
                {userResults.map((u: any) => (
                  <Link key={u.username} href={`/profile/${u.username}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '8px' }}
                      onMouseEnter={e => (e.currentTarget.style.background='var(--bg3)')} onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                      <Avatar username={u.username} avatar={u.avatar} size={22} linkToProfile={false} />
                      <span style={{ fontSize: '12px', color: 'var(--text)' }}>{u.username}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: 'var(--text2)' }}>Quick Links</h3>
            {[
              { href: '/forum/new', label: '+ New Post' },
              { href: '/games/rng', label: '🎲 Title RNG' },
              { href: '/rewards', label: 'Daily Rewards' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'block', padding: '5px 4px', fontSize: '12px', color: 'var(--text2)' }}
                onMouseEnter={e => (e.currentTarget.style.color='var(--accent2)')} onMouseLeave={e => (e.currentTarget.style.color='var(--text2)')}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}
